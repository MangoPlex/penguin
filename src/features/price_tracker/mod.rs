pub mod electricity;
pub mod fuel;

use std::{collections::HashMap, hash::Hash, sync::Arc, time::Duration};

use poise::serenity_prelude as serenity;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use time::{OffsetDateTime, Time, Weekday};
use tokio::task;

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

fn seconds_until_next_check() -> u64 {
    let now_vn = OffsetDateTime::now_utc() + time::Duration::hours(VN_UTC_OFFSET_HOURS);
    let check_time = Time::from_hms(CHECK_HOUR, CHECK_MINUTE, 0).expect("valid check time");

    let days_until_check = (CHECK_WEEKDAY.number_from_monday() as i64
        - now_vn.weekday().number_from_monday() as i64)
        .rem_euclid(7);

    let mut next_check = now_vn.replace_time(check_time) + time::Duration::days(days_until_check);
    if next_check <= now_vn {
        next_check += time::Duration::days(7);
    }

    (next_check - now_vn).whole_seconds().max(0) as u64
}

/// Sleeps until the next weekly check slot.
async fn wait_for_next_check(name: &str) {
    let secs = seconds_until_next_check();
    tracing::info!(
        "Next {name} check in {}h {}m",
        secs / 3600,
        secs % 3600 / 60
    );

    tokio::time::sleep(Duration::from_secs(secs)).await;
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
