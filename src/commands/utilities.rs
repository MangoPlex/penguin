use std::process::Command;

use crate::{Context, Error};

#[poise::command(
    slash_command,
    description_localized("en-US", "Ping to specified address")
)]
pub async fn ping(
    ctx: Context<'_>,
    #[description = "Address to ping"] address: Option<String>,
) -> Result<(), Error> {
    ctx.defer().await?;

    let response = match address {
        Some(address) => {
            let output = if cfg!(target_os = "windows") {
                Command::new("cmd").args(["/C", "ping", &address]).output()
            } else {
                Command::new("sh").args(["-c", "ping", &address]).output()
            }
            .expect("Failed to create process");

            format! {"```{}```", String::from_utf8_lossy(&output.stdout)}
        }
        None => ctx.ping().await.as_millis().to_string() + "ms",
    };

    ctx.reply(response).await?;

    Ok(())
}
