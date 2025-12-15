use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone, Eq, PartialEq)]
pub struct User {
    pub id: i32,
    pub created_at: DateTime<Utc>,
}

impl User {
    pub fn insert(&self) -> eyre::Result<()> {
        unimplemented!()
    }
}
