use redis::AsyncCommands;
use serde::{Serialize, de::DeserializeOwned};

use crate::Result;

pub struct Cache {
    manager: redis::aio::ConnectionManager,
}

impl Cache {
    pub async fn connect(url: &str) -> Result<Self> {
        let client = redis::Client::open(url)?;
        let mut manager = client.get_connection_manager().await?;

        let pong: String = redis::cmd("PING").query_async(&mut manager).await?;
        tracing::info!("Connected to Valkey (PING -> {pong})");

        Ok(Self { manager })
    }

    pub async fn get_json<T: DeserializeOwned>(&self, key: &str) -> Result<Option<T>> {
        let raw: Option<String> = self.manager.clone().get(key).await?;

        Ok(match raw {
            Some(raw) => Some(serde_json::from_str(&raw)?),
            None => None,
        })
    }

    pub async fn set_json<T: Serialize + Sync>(&self, key: &str, value: &T) -> Result<()> {
        let raw = serde_json::to_string(value)?;
        self.manager.clone().set::<_, _, ()>(key, raw).await?;

        Ok(())
    }
}
