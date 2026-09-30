#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

use time::{UtcOffset, macros::format_description};
use tracing_error::ErrorLayer;
use tracing_subscriber::{
    EnvFilter, fmt::time::OffsetTime, layer::SubscriberExt, util::SubscriberInitExt,
};

#[tokio::main]
async fn main() {
    let timer = OffsetTime::new(
        UtcOffset::from_hms(7, 0, 0).unwrap(),
        format_description!("[year]-[month]-[day] [hour]:[minute]:[second]"),
    );

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(
            tracing_subscriber::fmt::layer()
                .with_timer(timer)
                .with_target(false),
        )
        .with(ErrorLayer::default())
        .init();

    penguin::setup()
        .await
        .start()
        .await
        .expect("Failed to start client");
}
