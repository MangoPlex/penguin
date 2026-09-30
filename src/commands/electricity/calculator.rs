use poise::{CreateReply, serenity_prelude::CreateEmbed};

use crate::{
    Context, Result,
    features::price_tracker::electricity::{ElectricityTier, current_tiers, tier_name},
    utils::text::{COLOR_NEUTRAL, format_vnd},
};

fn single_tier_embed(kwh: f64, tier: &ElectricityTier) -> CreateEmbed {
    let cost = kwh * tier.price as f64;

    CreateEmbed::new()
        .title(format!("⚡ {kwh:.1} kWh ở mức {}", tier_name(tier)))
        .description(format!(
            "{kwh:.1} kWh × {} VND/kWh = **{} VND**",
            format_vnd(tier.price),
            format_vnd(cost.round() as i64)
        ))
        .colour(COLOR_NEUTRAL)
}

fn pad_left(s: &str, width: usize) -> String {
    let len = s.chars().count();
    if len >= width {
        s.to_owned()
    } else {
        format!("{}{s}", " ".repeat(width - len))
    }
}

fn pad_right(s: &str, width: usize) -> String {
    let len = s.chars().count();
    if len >= width {
        s.to_owned()
    } else {
        format!("{s}{}", " ".repeat(width - len))
    }
}

fn progressive_embed(kwh: f64, tiers: &[ElectricityTier]) -> CreateEmbed {
    let mut remaining = kwh;
    let mut threshold: i64 = 0;
    let mut total = 0.0;
    let mut rows: Vec<[String; 4]> = Vec::new();

    for tier in tiers {
        if remaining <= 0.0 {
            break;
        }

        let bracket_size = match tier.to_kwh {
            Some(upper) => (upper - threshold) as f64,
            None => remaining,
        };
        let used = remaining.min(bracket_size);
        let cost = used * tier.price as f64;

        rows.push([
            tier_name(tier),
            format!("{used:.1} kWh"),
            format!("{} VND/kWh", format_vnd(tier.price)),
            format!("{} VND", format_vnd(cost.round() as i64)),
        ]);

        total += cost;
        remaining -= used;
        threshold = tier.to_kwh.unwrap_or(threshold);
    }

    let widths = [0, 1, 2, 3].map(|i| {
        rows.iter()
            .map(|row| row[i].chars().count())
            .max()
            .unwrap_or(0)
    });

    let table = rows
        .iter()
        .map(|row| {
            format!(
                "{}  {} × {} = {}",
                pad_right(&row[0], widths[0]),
                pad_left(&row[1], widths[1]),
                pad_left(&row[2], widths[2]),
                pad_left(&row[3], widths[3]),
            )
        })
        .collect::<Vec<_>>()
        .join("\n");

    CreateEmbed::new()
        .title(format!("⚡ {kwh:.1} kWh (tính lũy tiến theo bậc thang)"))
        .description(format!("```\n{table}\n```"))
        .field(
            "Tổng",
            format!("{} VND", format_vnd(total.round() as i64)),
            false,
        )
        .colour(COLOR_NEUTRAL)
}

/// Convert kWh usage into electricity cost using the current tariff.
#[poise::command(slash_command, subcommands("price"))]
pub async fn electricity(_ctx: Context<'_>) -> Result<()> {
    Ok(())
}

/// Convert kWh usage into electricity cost using the current tariff.
#[poise::command(slash_command)]
pub async fn price(
    ctx: Context<'_>,
    #[description = "Electricity usage in kWh"] kwh: f64,
    #[description = "Only calculate at a single tier's price, skipping the progressive breakdown"]
    tier: Option<u8>,
) -> Result<()> {
    ctx.defer().await?;

    if kwh <= 0.0 {
        ctx.send(
            CreateReply::default()
                .content("⚠️ Số kWh phải lớn hơn 0.")
                .ephemeral(true),
        )
        .await?;
        return Ok(());
    }

    let tiers = current_tiers().await?;

    let embed = match tier {
        Some(tier) => match tiers.iter().find(|t| t.tier == tier) {
            Some(t) => single_tier_embed(kwh, t),
            None => {
                ctx.send(
                    CreateReply::default()
                        .content(format!(
                            "⚠️ Không tìm thấy bậc giá {tier}. Hiện có {} bậc.",
                            tiers.len()
                        ))
                        .ephemeral(true),
                )
                .await?;
                return Ok(());
            }
        },
        None => progressive_embed(kwh, &tiers),
    };

    ctx.send(CreateReply::default().embed(embed)).await?;

    Ok(())
}
