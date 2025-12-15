use poise::{
    CreateReply,
    serenity_prelude::{CreateEmbed, Timestamp},
};
use rand::Rng;

use crate::{Context, Result};

#[poise::command(slash_command, subcommands("number", "color"), subcommand_required)]
pub async fn random(_ctx: Context<'_>) -> Result<()> {
    Ok(())
}

#[poise::command(slash_command)]
pub async fn number(
    ctx: Context<'_>,
    #[description = "Lower bound number (default: 1)"] lower: Option<u32>,
    #[description = "Upper bound number (default: 100)"] upper: Option<u32>,
) -> Result<()> {
    ctx.defer().await?;

    let lower = lower.unwrap_or(1);
    let upper = upper.unwrap_or(100);

    if lower >= upper {
        ctx.send(
            CreateReply::default()
                .content("⚠️ The lower bound must be less than the upper bound.")
                .ephemeral(true),
        )
        .await?;
        return Ok(());
    }

    ctx.send(CreateReply::default().content(format!(
        "🎲 Random Number: {}",
        rand::rng().random_range(lower..=upper)
    )))
    .await?;

    Ok(())
}
#[poise::command(slash_command)]
pub async fn color(ctx: Context<'_>) -> Result<()> {
    let r = rand::rng().random_range(0..=255);
    let g = rand::rng().random_range(0..=255);
    let b = rand::rng().random_range(0..=255);

    let hex = format!("#{:02X}{:02X}{:02X}", r, g, b);
    let rgb = format!("rgb({}, {}, {})", r, g, b);

    // Convert RGB to CMYK
    let r_f = r as f32 / 255.0;
    let g_f = g as f32 / 255.0;
    let b_f = b as f32 / 255.0;

    let k = 1.0 - r_f.max(g_f).max(b_f);
    let c = if k == 1.0 {
        0.0
    } else {
        (1.0 - r_f - k) / (1.0 - k)
    };
    let m = if k == 1.0 {
        0.0
    } else {
        (1.0 - g_f - k) / (1.0 - k)
    };
    let y = if k == 1.0 {
        0.0
    } else {
        (1.0 - b_f - k) / (1.0 - k)
    };
    let cmyk = format!(
        "cmyk({}%, {}%, {}%, {}%)",
        (c * 100.0) as u8,
        (m * 100.0) as u8,
        (y * 100.0) as u8,
        (k * 100.0) as u8
    );

    // Convert RGB to HSV
    let max = r_f.max(g_f).max(b_f);
    let min = r_f.min(g_f).min(b_f);
    let delta = max - min;

    let h = if delta == 0.0 {
        0.0
    } else if max == r_f {
        60.0 * (((g_f - b_f) / delta) % 6.0)
    } else if max == g_f {
        60.0 * ((b_f - r_f) / delta + 2.0)
    } else {
        60.0 * ((r_f - g_f) / delta + 4.0)
    };
    let s = if max == 0.0 { 0.0 } else { delta / max };
    let v = max;
    let hsv = format!(
        "hsv({}°, {}%, {}%)",
        h as u16,
        (s * 100.0) as u8,
        (v * 100.0) as u8
    );

    // Convert RGB to HSL
    let l = (max + min) / 2.0;
    let s_hsl = if delta == 0.0 {
        0.0
    } else {
        delta / (1.0 - (2.0 * l - 1.0).abs())
    };
    let hsl = format!(
        "hsl({}°, {}%, {}%)",
        h as u16,
        (s_hsl * 100.0) as u8,
        (l * 100.0) as u8
    );

    let description = format!(
        "**Hex:** {}\n**RGB:** {}\n**CMYK:** {}\n**HSV:** {}\n**HSL:** {}",
        hex, rgb, cmyk, hsv, hsl
    );

    let embed = CreateEmbed::new()
        .title("🎨 Random Color Generator")
        .description(description)
        .color(u32::from_str_radix(&hex[1..], 16).unwrap())
        .timestamp(Timestamp::now());

    ctx.send(CreateReply::default().embed(embed)).await?;
    Ok(())
}
