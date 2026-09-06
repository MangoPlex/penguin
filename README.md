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

## Build locally

```sh
docker build -t penguin .
```

## Tagged releases

Pushing a tag named `v<version>` starts the GitHub Actions workflow. The tag
must match the package version in `Cargo.toml`. A successful build publishes
`ghcr.io/mangoplex/penguin:<tag>` and updates
`ghcr.io/mangoplex/penguin:latest`.
