use std::{collections::HashMap, sync::Arc};

use poise::serenity_prelude::{self as serenity, ChannelId, CreateEmbed, CreateMessage};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{
    Result,
    cache::Cache,
    config::SharedConfig,
    features::price_tracker::{
        VN_UTC_OFFSET_HOURS, load_snapshot, save_snapshot, wait_for_next_check,
    },
    utils::text::{COLOR_NEUTRAL, format_change, format_vnd},
};

const API_BASE: &str = "https://giaxanghomnay.com/api/pvdate";
const CACHE_KEY: &str = "penguin:price_tracker:fuel";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct FuelPrice {
    title: String,
    zone1_price: i64,
}

fn today_vn_date() -> String {
    let now = OffsetDateTime::now_utc() + time::Duration::hours(VN_UTC_OFFSET_HOURS);
    let date = now.date();
    format!(
        "{:04}-{:02}-{:02}",
        date.year(),
        u8::from(date.month()),
        date.day()
    )
}

async fn fetch_prices(client: &reqwest::Client) -> Result<Vec<FuelPrice>> {
    let url = format!("{}/{}", API_BASE, today_vn_date());
    let body: Vec<serde_json::Value> = client.get(&url).send().await?.json().await?;

    let first = body.into_iter().next().ok_or("empty fuel price response")?;
    let prices: Vec<FuelPrice> = serde_json::from_value(first)?;

    if prices.is_empty() {
        return Err("empty fuel price response".into());
    }

    Ok(prices)
}

fn build_embed(previous: &HashMap<String, FuelPrice>, current: &[FuelPrice]) -> CreateEmbed {
    let mut embed = CreateEmbed::new()
        .title("⛽ Giá xăng dầu trong nước")
        .colour(COLOR_NEUTRAL)
        .footer(serenity::CreateEmbedFooter::new(
            "Giá niêm yết vùng 1, đơn vị VND/l.",
        ));

    for price in current {
        let prev_price = previous
            .get(&price.title)
            .map(|p| p.zone1_price)
            .unwrap_or(price.zone1_price);
        let (change_text, _) = format_change(prev_price, price.zone1_price, "VND/l");

        embed = embed.field(
            &price.title,
            format!(
                "{} VND/l  •  {}",
                format_vnd(price.zone1_price),
                change_text
            ),
            false,
        );
    }

    embed
}

async fn announce_snapshot(
    http: &serenity::Http,
    channel_id: ChannelId,
    previous: &HashMap<String, FuelPrice>,
    current: &[FuelPrice],
) -> Result<()> {
    let embed = build_embed(previous, current);

    channel_id
        .send_message(http, CreateMessage::new().embed(embed))
        .await?;

    Ok(())
}

/// Fetches the current prices and renders the change embed against a
/// synthetic previous snapshot, so the layout can be inspected without
/// waiting for a real price change.
pub async fn preview_embed() -> Result<CreateEmbed> {
    let client = reqwest::Client::new();
    let current = fetch_prices(&client).await?;

    let previous: HashMap<String, FuelPrice> = current
        .iter()
        .enumerate()
        .map(|(i, price)| {
            let delta = if i % 2 == 0 { -500 } else { 500 };

            (
                price.title.clone(),
                FuelPrice {
                    title: price.title.clone(),
                    zone1_price: price.zone1_price + delta,
                },
            )
        })
        .collect();

    Ok(build_embed(&previous, &current))
}

fn to_snapshot(prices: &[FuelPrice]) -> HashMap<String, FuelPrice> {
    prices
        .iter()
        .map(|price| (price.title.clone(), price.clone()))
        .collect()
}

/// Announces the current prices when they differ from the last announced
/// snapshot (or when there is none yet), then stores them as the new snapshot.
async fn check_prices(
    ctx: &serenity::Context,
    config: &SharedConfig,
    client: &reqwest::Client,
    cache: &Option<Arc<Cache>>,
    last: &mut Option<HashMap<String, FuelPrice>>,
) {
    let Some(channel_id) = config
        .get()
        .price_tracker
        .fuel_channel_id
        .map(ChannelId::new)
    else {
        return;
    };

    let prices = match fetch_prices(client).await {
        Ok(prices) => prices,
        Err(e) => {
            tracing::warn!("Failed to fetch fuel prices: {}", e);
            return;
        }
    };

    let current = to_snapshot(&prices);
    if last.as_ref() == Some(&current) {
        return;
    }

    let empty = HashMap::new();
    let previous = last.as_ref().unwrap_or(&empty);

    if let Err(e) = announce_snapshot(&ctx.http, channel_id, previous, &prices).await {
        tracing::warn!("Failed to announce fuel price changes: {}", e);
        return;
    }

    tracing::info!("Announced fuel prices to channel {channel_id}");
    save_snapshot(cache, CACHE_KEY, &current).await;
    *last = Some(current);
}

pub async fn track_prices(
    ctx: Arc<serenity::Context>,
    config: Arc<SharedConfig>,
    cache: Option<Arc<Cache>>,
) {
    let client = reqwest::Client::new();
    let mut last = load_snapshot(&cache, CACHE_KEY).await;

    loop {
        check_prices(&ctx, &config, &client, &cache, &mut last).await;
        wait_for_next_check("fuel").await;
    }
}
