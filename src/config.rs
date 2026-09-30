use std::{
    fs,
    path::PathBuf,
    sync::{Arc, RwLock},
    time::{Duration, SystemTime},
};

use serde::Deserialize;

use crate::Result;

const POLL_INTERVAL: Duration = Duration::from_secs(10);

#[derive(Debug, Default, Deserialize, Clone)]
pub struct PriceTrackerConfig {
    pub fuel_channel_id: Option<u64>,
    pub electricity_channel_id: Option<u64>,
}

#[derive(Debug, Default, Deserialize, Clone)]
pub struct AppConfig {
    #[serde(default)]
    pub price_tracker: PriceTrackerConfig,
}

impl AppConfig {
    fn load(path: &PathBuf) -> Result<Self> {
        if !path.exists() {
            tracing::warn!("Config file {:?} not found, using defaults", path);
            return Ok(Self::default());
        }

        let content = fs::read_to_string(path)?;
        let config = toml::from_str(&content)?;

        Ok(config)
    }
}

pub struct SharedConfig {
    path: PathBuf,
    inner: RwLock<AppConfig>,
}

impl SharedConfig {
    pub fn load(path: impl Into<PathBuf>) -> Arc<Self> {
        let path = path.into();
        tracing::info!("Loading config from {:?}", path);
        let config = AppConfig::load(&path).unwrap_or_else(|e| {
            tracing::warn!("Failed to load config from {:?}: {}", path, e);
            AppConfig::default()
        });

        Arc::new(Self {
            path,
            inner: RwLock::new(config),
        })
    }

    pub fn get(&self) -> AppConfig {
        self.inner.read().unwrap().clone()
    }

    fn reload(&self) {
        match AppConfig::load(&self.path) {
            Ok(config) => {
                *self.inner.write().unwrap() = config;
                tracing::info!("Reloaded config from {:?}", self.path);
            }
            Err(e) => {
                tracing::warn!("Failed to reload config from {:?}: {}", self.path, e);
            }
        }
    }
}

fn modified_at(path: &PathBuf) -> Option<SystemTime> {
    fs::metadata(path).and_then(|m| m.modified()).ok()
}

pub async fn watch(shared: Arc<SharedConfig>) {
    let mut last_modified = modified_at(&shared.path);
    let mut interval = tokio::time::interval(POLL_INTERVAL);

    loop {
        interval.tick().await;

        let modified = modified_at(&shared.path);

        if modified.is_some() && modified != last_modified {
            last_modified = modified;
            shared.reload();
        }
    }
}
