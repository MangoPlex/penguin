use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use poise::serenity_prelude::{
    self as serenity, ActivityData, Client, ClientBuilder, GatewayIntents, GuildId,
};
use songbird::SerenityInit;
use tokio::task;

use crate::{cache::Cache, config::SharedConfig};

mod cache;
mod commands;
pub mod config;
mod features;

pub mod utils;

pub struct Data {
    pub start_time: Instant,
    pub config: Arc<SharedConfig>,
    pub cache: Option<Arc<Cache>>,
}
type Error = Box<dyn std::error::Error + Send + Sync>;
pub type Context<'a> = poise::Context<'a, Data, Error>;
pub type Result<T> = std::result::Result<T, Error>;

/// Reads an environment variable, treating an empty value (as left behind by
/// copying `.env.sample`) the same as an unset one.
fn optional_var(name: &str) -> Option<String> {
    dotenvy::var(name).ok().filter(|value| !value.is_empty())
}

pub async fn setup() -> Client {
    let token = dotenvy::var("DISCORD_TOKEN").expect("missing DISCORD_TOKEN");
    let guild_id = dotenvy::var("GUILD_ID").expect("missing GUILD_ID");
    let config_path = optional_var("CONFIG_PATH").unwrap_or_else(|| "config.toml".to_owned());
    let config = SharedConfig::load(config_path);

    task::spawn(config::watch(config.clone()));

    let cache = match optional_var("VALKEY_URL") {
        Some(url) => Some(Arc::new(
            Cache::connect(&url)
                .await
                .expect("failed to connect to Valkey"),
        )),
        None => None,
    };

    let intents = GatewayIntents::GUILDS
        | GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::GUILD_VOICE_STATES
        | GatewayIntents::MESSAGE_CONTENT;

    let framework = poise::Framework::builder()
        .options(poise::FrameworkOptions {
            commands: vec![
                commands::utils::random(),
                commands::user::avatar(),
                commands::voice::join(),
                commands::debugger::debugger(),
                commands::electricity::electricity(),
            ],
            event_handler: |framework, event| Box::pin(event_handler(framework, event)),
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
                Ok(Data {
                    start_time: Instant::now(),
                    config,
                    cache,
                })
            })
        })
        .build();

    ClientBuilder::new(token, intents)
        .framework(framework)
        .register_songbird()
        .await
        .expect("Error creating client")
}

async fn update_presence(ctx: Arc<serenity::Context>, start_time: Instant) {
    let mut interval = tokio::time::interval(Duration::from_secs(60));

    loop {
        interval.tick().await;

        fn format_time(duration: Duration) -> String {
            let days = duration.as_secs() / 86400;
            let hours = (duration.as_secs() % 86400) / 3600;
            let minutes = (duration.as_secs() % 3600) / 60;
            format!("{}d {}h {}m", days, hours % 24, minutes % 60)
        }

        let uptime = start_time.elapsed();
        let status = format!("Uptime: {}", format_time(uptime));

        ctx.set_activity(Some(ActivityData::watching(&status)))
    }
}

async fn event_handler(
    framework: poise::FrameworkContext<'_, Data, Error>,
    event: &serenity::FullEvent,
) -> Result<()> {
    let ctx = framework.serenity_context;
    let data = framework.user_data;

    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            tracing::info!("Ready! Logged in as {}", data_about_bot.user.name);

            let rctx = Arc::new(ctx.clone());
            let start_time = data.start_time;

            task::spawn(async move {
                update_presence(rctx, start_time).await;
            });

            let rctx = Arc::new(ctx.clone());
            features::price_tracker::spawn(&rctx, &data.config, &data.cache);
        }
        serenity::FullEvent::Message { new_message } => {
            let mut message = new_message.clone();

            features::embed_fix::apply_fix(&mut message, &ctx.http).await;
        }
        _ => {}
    }

    Ok(())
}
