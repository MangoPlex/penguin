use poise::CreateReply;
use poise::serenity_prelude::Mentionable;
use crate::{Context, Result};

#[poise::command(slash_command)]
pub async fn join(ctx: Context<'_>) -> Result<()> {
    ctx.defer().await?;

    let channel_id = {
        let guild = ctx
            .guild()
            .ok_or("Could not fetch guild")?;

        let user_voice_state = guild
            .voice_states
            .get(&ctx.author().id)
            .ok_or("You are not in a voice channel")?;

        user_voice_state
            .channel_id
            .ok_or("You are not in a voice channel")?
    };

    let channel = ctx.serenity_context().http.get_channel(channel_id).await?;

    let response = format!("Joined voice channel: {}", channel.mention());
    ctx.send(CreateReply::default().content(response)).await?;

    Ok(())
}
