FROM rust:alpine3.18 as build

USER root

ARG DISCORD_TOKEN
ENV DISCORD_TOKEN=${DISCORD_TOKEN}

COPY . .

RUN cargo build -r --bins

RUN chmod +x ./target/release/penguin

CMD ./target/release/penguin

FROM rust:alpine3.18 as run

WORKDIR /usr/penguin

COPY --from=build ./target/release/penguin .

CMD ./penguin