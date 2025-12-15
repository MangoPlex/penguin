use poise::serenity_prelude::{self as serenity, Client, ClientBuilder, GatewayIntents, GuildId};

mod commands;
mod fixes;

pub mod database;
pub mod utils;

pub struct Data {}
type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;
pub type Result<T> = std::result::Result<T, Error>;

pub async fn setup() -> Client {
    let token = dotenvy::var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN");
    let guild_id = dotenvy::var("GUILD_ID").expect("missing GUILD_ID");
    let intents = GatewayIntents::all();

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![commands::utils::random(), commands::user::avatar()],
            event_handler: |ctx, event, framework, data| {
                Box::pin(event_handler(ctx, event, framework, data))
            },
            ..Default::default()
        })
        .setup(|ctx, _ready, framework| {
            Box::pin(async move {
                poise::builtins::register_in_guild(
                    ctx,
                    &framework.options().commands,
                    GuildId::new(guild_id.parse().unwrap()), // TODO: fix this
                )
                .await?;
                Ok(Data {})
            })
        })
        .build();

    ClientBuilder::new(token, intents)
        .framework(framework)
        .await
        .expect("Error creating client")
}

async fn event_handler(
    ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, Data, Error>,
    _data: &Data,
) -> Result<()> {
    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            println!("Ready! Logged in as {}", data_about_bot.user.name);
        }
        serenity::FullEvent::Message { new_message } => {
            let mut message = new_message.clone();

            fixes::embed::apply_fix(&mut message, &ctx.http).await;
        }
        _ => {}
    }

    Ok(())
}
