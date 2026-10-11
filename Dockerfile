# syntax=docker/dockerfile:1

ARG RUST_VERSION=1.95.0

FROM rust:${RUST_VERSION}-slim-bookworm AS chef

RUN cargo install cargo-chef --locked

WORKDIR /app

FROM chef AS planner

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        libopus-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY --from=planner /app/recipe.json recipe.json

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo chef cook --release --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo build --locked --release \
    && cp target/release/penguin /usr/local/bin/penguin

FROM debian:bookworm-slim AS final

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libopus0 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 appuser \
    && useradd \
        --uid 10001 \
        --gid appuser \
        --home-dir /nonexistent \
        --no-create-home \
        --shell /usr/sbin/nologin \
        appuser

COPY --from=build /usr/local/bin/penguin /usr/local/bin/penguin

USER appuser

ENTRYPOINT ["/usr/local/bin/penguin"]
