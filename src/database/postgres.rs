use eyre::Context;
use sqlx::{Connection, PgConnection, Postgres, migrate::MigrateDatabase};
use tracing::info;

pub async fn check_for_migrations() -> eyre::Result<()> {
    let uri = dotenvy::var("DATABASE_URL").wrap_err("`DATABASE_URL` not in .env")?;
    let uri = uri.as_str();

    if !Postgres::database_exists(uri)
        .await
        .wrap_err("failed to check if database exists")?
    {
        info!("Creating database...");
        Postgres::create_database(uri)
            .await
            .wrap_err("failed to create database")?;
    }

    info!("Applying migrations...");

    let mut connection = PgConnection::connect(uri)
        .await
        .wrap_err("failed to connect to database")?;

    sqlx::migrate!()
        .run(&mut connection)
        .await
        .wrap_err("failed to run database migrations")?;

    Ok(())
}
