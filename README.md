# PENGUIN

`penguin` is distributed as a Docker image through GitHub Container Registry.

## Run

Pull the latest release and supply the Discord credentials through environment
variables:

```sh
docker pull ghcr.io/mangoplex/penguin:latest
docker run --rm \
  -e DISCORD_TOKEN='your-discord-token' \
  -e GUILD_ID='your-discord-guild-id' \
  ghcr.io/mangoplex/penguin:latest
```

Use a version tag such as `v1.2.7` instead of `latest` to pin a release.

The container runs as an unprivileged user and does not store credentials.

## Dynamic config

Features that aren't security-sensitive (e.g. which channel the Vietnam price
tracker posts to) are controlled by a `config.toml` file rather than
environment variables. Copy `config.sample.toml` to `config.toml`, edit it,
and mount it into the container:

```sh
docker run --rm \
  -e DISCORD_TOKEN='your-discord-token' \
  -e GUILD_ID='your-discord-guild-id' \
  -v "$(pwd)/config.toml:/config.toml:ro" \
  -e CONFIG_PATH=/config.toml \
  ghcr.io/mangoplex/penguin:latest
```

The bot polls `config.toml` for changes every 10 seconds and reloads it
automatically — no restart needed. `CONFIG_PATH` defaults to `config.toml` in
the working directory if unset.

### Price tracker

Set `fuel_channel_id` and/or `electricity_channel_id` under `[price_tracker]`
in `config.toml` to Discord channel IDs. Leave a key unset to disable that
tracker.

- **Fuel** (via giaxanghomnay.com) and **electricity** (via quanlydien.com,
  which tracks official Ministry of Industry and Trade decisions) are both
  checked once a week, Thursday 15:05 local time (UTC+7), right after the
  fixed weekly adjustment slot.

Each posts a single embed with every item's new price and the change, only
when a price actually changes.

### Price cache

Set `VALKEY_URL` (e.g. `redis://localhost:6379`) to have the price/tariff
trackers persist their last-seen snapshot in Valkey (or any Redis-compatible
store) instead of only in memory. This survives bot restarts, so a restart
around the weekly fuel check doesn't lose the baseline needed to detect a
change. Each snapshot is stored with a `last_updated` timestamp.

On startup each tracker compares the current prices with the cached snapshot:
if there is none, or it differs, an embed is posted and the cache is updated;
if it matches, nothing is posted. Leave `VALKEY_URL` unset to keep the
in-memory-only behavior (every restart then posts once).

## Build locally

```sh
docker build -t penguin .
```

## Tagged releases

Pushing a tag named `v<version>` starts the GitHub Actions workflow. The tag
must match the package version in `Cargo.toml`. A successful build publishes
`ghcr.io/mangoplex/penguin:<tag>` and updates
`ghcr.io/mangoplex/penguin:latest`.
