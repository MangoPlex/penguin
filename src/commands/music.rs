#[poise::command(
    slash_command,
    description_localized("en-US", "Ping to specified address")
)]
pub async fn play(
    ctx: Context<'_>,
    #[description = "Address to ping"] address: Option<String>,
) -> Result<(), Error> {
    ctx.defer().await?;

    Ok(())
}
