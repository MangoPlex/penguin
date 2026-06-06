use crate::{Context, Result};
use poise::CreateReply;
use poise::serenity_prelude::Mentionable;

#[poise::command(slash_command)]
pub async fn join(ctx: Context<'_>) -> Result<()> {
    ctx.defer().await?;

    let guild_id = ctx.guild_id().ok_or("Not in a guild")?;
    let channel_id = {
        let guild = ctx.guild().ok_or("Guild not found")?;

        guild
            .voice_states
            .get(&ctx.author().id)
            .and_then(|vs| vs.channel_id)
            .ok_or("You are not in a voice channel")?
    };

    let manager = songbird::get(ctx.serenity_context())
        .await
        .ok_or("Songbird not initialized")?
        .clone();

    let channel = ctx.serenity_context().http.get_channel(channel_id).await?;
    let response = format!("Joined voice channel: {}", channel.mention());

    manager.join(guild_id, channel_id).await?;
    ctx.send(CreateReply::default().content(response)).await?;

    Ok(())
}
