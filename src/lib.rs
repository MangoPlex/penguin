use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use poise::serenity_prelude::{
    self as serenity, ActivityData, Client, ClientBuilder, GatewayIntents, GuildId,
};
use tokio::task;

use crate::utils::os;

mod commands;
mod fixes;

pub mod database;
pub mod utils;

pub struct Data {
    pub start_time: Instant,
}
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
                Ok(Data {
                    start_time: Instant::now(),
                })
            })
        })
        .build();

    ClientBuilder::new(token, intents)
        .framework(framework)
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
        let memory_usage = os::get_memory_usage(std::process::id());

        let status = format!(
            "Uptime: {} | Mem: {:.1} MB",
            format_time(uptime),
            memory_usage
        );

        ctx.set_activity(Some(ActivityData::watching(&status)))
    }
}

async fn event_handler(
    ctx: &serenity::Context,
    event: &serenity::FullEvent,
    _framework: poise::FrameworkContext<'_, Data, Error>,
    data: &Data,
) -> Result<()> {
    match event {
        serenity::FullEvent::Ready { data_about_bot, .. } => {
            println!("Ready! Logged in as {}", data_about_bot.user.name);

            let rctx = Arc::new(ctx.clone());
            let start_time = data.start_time;

            task::spawn(async move {
                update_presence(rctx, start_time).await;
            });
        }
        serenity::FullEvent::Message { new_message } => {
            let mut message = new_message.clone();

            fixes::embed::apply_fix(&mut message, &ctx.http).await;
        }
        _ => {}
    }

    Ok(())
}
