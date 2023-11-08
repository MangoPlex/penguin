use mongodm::{CollectionConfig, Model};
use serde::{Deserialize, Serialize};

pub struct UserCollConf;

impl CollectionConfig for UserCollConf {
    fn collection_name() -> &'static str {
        "users"
    }
}

#[derive(Serialize, Deserialize)]
pub struct UserWallet {
    main: i64,
    bank: i64,
}

#[derive(Serialize, Deserialize)]
pub struct User {
    id: u64,

    balance: UserWallet,
}

impl Model for User {
    type CollConf = UserCollConf;
}


