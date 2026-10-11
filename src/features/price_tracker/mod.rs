pub mod electricity;
pub mod fuel;

use std::{collections::HashMap, hash::Hash, sync::Arc, time::Duration};

use poise::serenity_prelude as serenity;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use time::{OffsetDateTime, Time, Weekday};
use tokio::{sync::watch, task};

use crate::{cache::Cache, config::SharedConfig};

pub fn spawn(ctx: &Arc<serenity::Context>, config: &Arc<SharedConfig>, cache: &Option<Arc<Cache>>) {
    task::spawn(fuel::track_prices(
        ctx.clone(),
        config.clone(),
        cache.clone(),
    ));
    task::spawn(electricity::track_prices(
        ctx.clone(),
        config.clone(),
        cache.clone(),
    ));
}

const VN_UTC_OFFSET_HOURS: i64 = 7;

/// Vietnam's fuel retail price is adjusted on a fixed weekly schedule
/// (Thursday 15:00 local time, per the current Ministry of Industry and
/// Trade regulation), and the electricity tariff is checked on the same
/// slot. The 5 minute offset is a buffer for publish lag.
const CHECK_WEEKDAY: Weekday = Weekday::Thursday;
const CHECK_HOUR: u8 = 15;
const CHECK_MINUTE: u8 = 5;

fn duration_until_next_check(now_vn: OffsetDateTime) -> Duration {
    let check_time = Time::from_hms(CHECK_HOUR, CHECK_MINUTE, 0).expect("valid check time");

    let days_until_check = (CHECK_WEEKDAY.number_from_monday() as i64
        - now_vn.weekday().number_from_monday() as i64)
        .rem_euclid(7);

    let mut next_check = now_vn.replace_time(check_time) + time::Duration::days(days_until_check);
    if next_check <= now_vn {
        next_check += time::Duration::days(7);
    }

    Duration::from_secs((next_check - now_vn).whole_seconds().max(0) as u64)
}

fn next_check_delay() -> Duration {
    let now_vn = OffsetDateTime::now_utc() + time::Duration::hours(VN_UTC_OFFSET_HOURS);
    duration_until_next_check(now_vn)
}

#[derive(Debug, PartialEq, Eq)]
enum CheckTrigger {
    Scheduled,
    ConfigChanged,
}

/// Waits for the weekly check slot, unless a config reload needs an earlier check.
async fn wait_for_next_check(name: &str, config_updates: &mut watch::Receiver<()>) -> CheckTrigger {
    let delay = next_check_delay();
    let secs = delay.as_secs();
    tracing::info!(
        "Next {name} check in {}h {}m",
        secs / 3600,
        secs % 3600 / 60
    );

    tokio::select! {
        _ = tokio::time::sleep(delay) => {
            tracing::info!("Running scheduled {name} price check");
            CheckTrigger::Scheduled
        }
        Ok(()) = config_updates.changed() => {
            tracing::info!("Running {name} price check after config reload");
            CheckTrigger::ConfigChanged
        }
    }
}

fn snapshot_changed<K, V>(last: Option<&HashMap<K, V>>, current: &HashMap<K, V>) -> bool
where
    K: Eq + Hash,
    V: PartialEq,
{
    last != Some(current)
}

fn should_announce<K, V>(
    last: Option<&HashMap<K, V>>,
    current: &HashMap<K, V>,
    announce_unchanged: bool,
) -> bool
where
    K: Eq + Hash,
    V: PartialEq,
{
    announce_unchanged || snapshot_changed(last, current)
}

#[derive(Deserialize)]
#[serde(bound(deserialize = "K: Deserialize<'de> + Eq + Hash, V: Deserialize<'de>"))]
struct Snapshot<K, V> {
    last_updated: i64,
    items: HashMap<K, V>,
}

#[derive(Serialize)]
struct SnapshotRef<'a, K, V> {
    last_updated: i64,
    items: &'a HashMap<K, V>,
}

/// Loads the last announced snapshot from the cache, if any.
async fn load_snapshot<K, V>(cache: &Option<Arc<Cache>>, key: &str) -> Option<HashMap<K, V>>
where
    K: DeserializeOwned + Eq + Hash,
    V: DeserializeOwned,
{
    let cache = cache.as_ref()?;

    match cache.get_json::<Snapshot<K, V>>(key).await {
        Ok(snapshot) => snapshot.map(|snapshot| {
            tracing::debug!(
                "Loaded snapshot {key} last updated at {}",
                snapshot.last_updated
            );
            snapshot.items
        }),
        Err(e) => {
            tracing::warn!("Failed to load cached snapshot {key}: {e}");
            None
        }
    }
}

/// Stores the snapshot in the cache together with the time it was updated.
async fn save_snapshot<K, V>(cache: &Option<Arc<Cache>>, key: &str, items: &HashMap<K, V>)
where
    K: Serialize + Sync,
    V: Serialize + Sync,
{
    let Some(cache) = cache else {
        return;
    };

    let snapshot = SnapshotRef {
        last_updated: OffsetDateTime::now_utc().unix_timestamp(),
        items,
    };

    if let Err(e) = cache.set_json(key, &snapshot).await {
        tracing::warn!("Failed to cache snapshot {key}: {e}");
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use time::macros::datetime;
    use tokio::sync::watch;

    use super::{
        CheckTrigger, duration_until_next_check, should_announce, snapshot_changed,
        wait_for_next_check,
    };

    #[test]
    fn weekly_schedule_uses_the_next_thursday_slot() {
        assert_eq!(
            duration_until_next_check(datetime!(2026-10-14 15:05:00 +07:00)).as_secs(),
            24 * 60 * 60
        );
        assert_eq!(
            duration_until_next_check(datetime!(2026-10-15 15:04:59 +07:00)).as_secs(),
            1
        );
        assert_eq!(
            duration_until_next_check(datetime!(2026-10-15 15:05:00 +07:00)).as_secs(),
            7 * 24 * 60 * 60
        );
        assert_eq!(
            duration_until_next_check(datetime!(2026-10-15 15:05:01 +07:00)).as_secs(),
            7 * 24 * 60 * 60 - 1
        );
    }

    #[test]
    fn snapshot_changes_include_the_initial_baseline() {
        let current = HashMap::from([("ron95", 20_000)]);
        let same = HashMap::from([("ron95", 20_000)]);
        let changed = HashMap::from([("ron95", 21_000)]);

        assert!(snapshot_changed(None, &current));
        assert!(!snapshot_changed(Some(&same), &current));
        assert!(snapshot_changed(Some(&changed), &current));
        assert!(should_announce(Some(&same), &current, true));
        assert!(!should_announce(Some(&same), &current, false));
    }

    #[tokio::test]
    async fn config_reload_preempts_the_weekly_wait() {
        let (sender, mut receiver) = watch::channel(());
        let wait = tokio::spawn(async move { wait_for_next_check("test", &mut receiver).await });

        sender.send(()).unwrap();

        assert_eq!(wait.await.unwrap(), CheckTrigger::ConfigChanged);
    }
}
