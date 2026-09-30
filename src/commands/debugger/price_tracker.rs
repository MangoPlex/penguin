use poise::CreateReply;

use crate::{Context, Result, features};

#[poise::command(slash_command, subcommands("fuel", "electricity"), subcommand_required)]
pub async fn debugger(_ctx: Context<'_>) -> Result<()> {
    Ok(())
}

/// Preview the fuel price tracker embed with the current prices.
#[poise::command(slash_command)]
pub async fn fuel(ctx: Context<'_>) -> Result<()> {
    ctx.defer_ephemeral().await?;

    let embed = features::price_tracker::fuel::preview_embed().await?;
    ctx.send(CreateReply::default().embed(embed).ephemeral(true))
        .await?;

    Ok(())
}

/// Preview the electricity price tracker embed with the current tariffs.
#[poise::command(slash_command)]
pub async fn electricity(ctx: Context<'_>) -> Result<()> {
    ctx.defer_ephemeral().await?;

    let embed = features::price_tracker::electricity::preview_embed().await?;
    ctx.send(CreateReply::default().embed(embed).ephemeral(true))
        .await?;

    Ok(())
}
