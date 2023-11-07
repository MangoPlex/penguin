use dotenvy::dotenv;
use poise::serenity_prelude as serenity;

pub mod commands;

pub struct Data {} // User data, which is stored and accessible in all command invocations
pub type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;

/// Displays your or another user's account creation date
// #[poise::command(slash_command, prefix_command)]
// async fn age(
//     ctx: Context<'_>,
//     #[description = "Selected user"] user: Option<serenity::User>,
// ) -> Result<(), Error> {
//     let u = user.as_ref().unwrap_or_else(|| ctx.author());
//     let response = format!("{}'s account was created at {}", u.name, u.created_at());
//     ctx.say(response).await?;
//     Ok(())
// }

#[tokio::main]
async fn main() {
    dotenv().expect(".env file not found");

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                // Fun category
                commands::roll(),
                // Utilities category
                commands::ping(),
            ],
            ..Default::default()
        })
        .token(std::env::var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN"))
        .intents(serenity::GatewayIntents::non_privileged())
        .setup(|ctx, ready, framework| {
            Box::pin(async move {
                poise::builtins::register_globally(ctx, &framework.options().commands).await?;

                let id = &ready.user.id;
                let name = &ready.user.name;
                let discriminator = &ready.user.discriminator;
                println!("Logged in as {name}#{discriminator} ({id})");

                Ok(Data {})
            })
        });

    framework.run().await.unwrap();
}
