use poise::{
    CreateReply,
    serenity_prelude::{self as serenity, CreateEmbed},
};

use crate::{Context, Result};

#[poise::command(slash_command)]
pub async fn avatar(
    ctx: Context<'_>,
    #[description = "User to show avatar (default sender)"] user: Option<serenity::User>,
) -> Result<()> {
    ctx.defer().await?;

    let user = user.unwrap_or_else(|| ctx.author().clone());

    let embed = CreateEmbed::default()
        .title(format!("{} 's Avatar", user.display_name()))
        .image(
            user.avatar_url()
                .unwrap_or_else(|| user.default_avatar_url()),
        )
        .color(serenity::Colour::from_rgb(100, 149, 237))
        .timestamp(serenity::Timestamp::now());

    ctx.send(CreateReply::default().embed(embed)).await?;

    Ok(())
}
