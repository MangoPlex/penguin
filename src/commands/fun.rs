use rand::Rng;

use crate::{Context, Error};

#[poise::command(prefix_command, slash_command)]
pub async fn roll(
    ctx: Context<'_>,
    #[description = "The minimum number to roll"] min: Option<i32>,
    #[description = "The maximum number to roll"] max: Option<i32>,
) -> Result<(), Error> {
    let min = min.unwrap_or(1);
    let max = max.unwrap_or(10);

    let roll_result = rand::thread_rng().gen_range(min..=max);
    let response = format!("You rolled a {}", roll_result);

    ctx.reply(response).await?;

    Ok(())
}
