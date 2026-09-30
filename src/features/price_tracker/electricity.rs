use std::{collections::HashMap, sync::Arc};

use poise::serenity_prelude::{self as serenity, ChannelId, CreateEmbed, CreateMessage};
use serde::{Deserialize, Serialize};

use crate::{
    Result,
    cache::Cache,
    config::SharedConfig,
    features::price_tracker::{load_snapshot, save_snapshot, wait_for_next_check},
    utils::text::{COLOR_NEUTRAL, format_change, format_vnd},
};

const API_URL: &str = "https://quanlydien.com/api/v1/gia-dien.json";
const CACHE_KEY: &str = "penguin:price_tracker:electricity";

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ElectricityTier {
    #[serde(rename = "bac")]
    pub tier: u8,
    #[serde(rename = "tu_kwh")]
    pub from_kwh: i64,
    #[serde(rename = "den_kwh")]
    pub to_kwh: Option<i64>,
    #[serde(rename = "gia")]
    pub price: i64,
}

#[derive(Debug, Deserialize)]
struct ElectricityPriceResponse {
    #[serde(rename = "bac")]
    tiers: Vec<ElectricityTier>,
}

pub fn tier_name(tier: &ElectricityTier) -> String {
    match tier.to_kwh {
        Some(to) => format!("Bậc {} ({}-{} kWh)", tier.tier, tier.from_kwh, to),
        None => format!("Bậc {} (từ {} kWh)", tier.tier, tier.from_kwh),
    }
}

async fn fetch_tiers(client: &reqwest::Client) -> Result<Vec<ElectricityTier>> {
    let response: ElectricityPriceResponse = client.get(API_URL).send().await?.json().await?;

    if response.tiers.is_empty() {
        return Err("empty electricity price response".into());
    }

    Ok(response.tiers)
}

fn build_embed(
    previous: &HashMap<u8, ElectricityTier>,
    current: &[ElectricityTier],
) -> CreateEmbed {
    let mut embed = CreateEmbed::new()
        .title("⚡ Giá điện sinh hoạt")
        .colour(COLOR_NEUTRAL)
        .footer(serenity::CreateEmbedFooter::new(
            "Giá chưa VAT, đơn vị VND/kWh. Nguồn: quanlydien.com",
        ));

    for tier in current {
        let prev_price = previous
            .get(&tier.tier)
            .map(|t| t.price)
            .unwrap_or(tier.price);
        let (change_text, _) = format_change(prev_price, tier.price, "VND/kWh");

        embed = embed.field(
            tier_name(tier),
            format!("{} VND/kWh  •  {}", format_vnd(tier.price), change_text),
            false,
        );
    }

    embed
}

async fn announce_snapshot(
    http: &serenity::Http,
    channel_id: ChannelId,
    previous: &HashMap<u8, ElectricityTier>,
    current: &[ElectricityTier],
) -> Result<()> {
    let embed = build_embed(previous, current);

    channel_id
        .send_message(http, CreateMessage::new().embed(embed))
        .await?;

    Ok(())
}

/// Fetches the currently applicable tariff tiers, sorted by tier number.
pub async fn current_tiers() -> Result<Vec<ElectricityTier>> {
    let client = reqwest::Client::new();
    let mut tiers = fetch_tiers(&client).await?;
    tiers.sort_by_key(|tier| tier.tier);

    Ok(tiers)
}

/// Fetches the current tariff tiers and renders the change embed against a
/// synthetic previous snapshot, so the embed layout can be inspected without
/// waiting for a real tariff change.
pub async fn preview_embed() -> Result<CreateEmbed> {
    let client = reqwest::Client::new();
    let current = fetch_tiers(&client).await?;

    let previous: HashMap<u8, ElectricityTier> = current
        .iter()
        .map(|tier| {
            let delta = if tier.tier % 2 == 0 { -100 } else { 100 };

            (
                tier.tier,
                ElectricityTier {
                    tier: tier.tier,
                    from_kwh: tier.from_kwh,
                    to_kwh: tier.to_kwh,
                    price: tier.price + delta,
                },
            )
        })
        .collect();

    Ok(build_embed(&previous, &current))
}

/// Announces the current tiers when they differ from the last announced
/// snapshot (or when there is none yet), then stores them as the new snapshot.
async fn check_tiers(
    ctx: &serenity::Context,
    config: &SharedConfig,
    client: &reqwest::Client,
    cache: &Option<Arc<Cache>>,
    last: &mut Option<HashMap<u8, ElectricityTier>>,
) {
    let Some(channel_id) = config
        .get()
        .price_tracker
        .electricity_channel_id
        .map(ChannelId::new)
    else {
        tracing::debug!(
            "electricity tracker disabled: price_tracker.electricity_channel_id not set"
        );
        return;
    };

    let tiers = match fetch_tiers(client).await {
        Ok(tiers) => tiers,
        Err(e) => {
            tracing::warn!("Failed to fetch electricity prices: {}", e);
            return;
        }
    };

    let current: HashMap<u8, ElectricityTier> =
        tiers.iter().map(|tier| (tier.tier, tier.clone())).collect();
    if last.as_ref() == Some(&current) {
        return;
    }

    let empty = HashMap::new();
    let previous = last.as_ref().unwrap_or(&empty);

    if let Err(e) = announce_snapshot(&ctx.http, channel_id, previous, &tiers).await {
        tracing::warn!("Failed to announce electricity price changes: {}", e);
        return;
    }

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
        check_tiers(&ctx, &config, &client, &cache, &mut last).await;
        wait_for_next_check("electricity").await;
    }
}
