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
    use rand::Rng;

    let rand_hex_color = || {
        let mut rng = rand::rng();
        format!("#{:06X}", rng.random_range(0..=0xFFFFFF))
    };
    let color = rand_hex_color();

    let embed = CreateEmbed::new()
        .title("🎨 Random Color Generator")
        .description(format!("**Color:** {}", color))
        .color(u32::from_str_radix(&color[1..], 16).unwrap())
        .timestamp(Timestamp::now());

    ctx.send(poise::CreateReply::default().embed(embed)).await?;
    Ok(())
}
