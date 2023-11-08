use dotenvy::dotenv;
use poise::serenity_prelude as serenity;

pub mod commands;
pub mod models;

pub struct Data {
    pub db: mongodm::mongo::Client,
} // User data, which is stored and accessible in all command invocations
pub type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;

#[tokio::main]
async fn main() {
    dotenv().expect(".env file not found");

    let db = mongodm::mongo::Client::with_uri_str(std::env::var("MONGO_URI").expect("missing MONGO_URI")).await.expect("failed to connect to MongoDB");

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

                Ok(Data {
                    db,
                })
            })
        });

    framework.run().await.unwrap();
}
