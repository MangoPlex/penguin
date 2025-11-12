FROM oven/bun:1.2.2-alpine

WORKDIR /app

COPY . .

RUN bun install && bun run build

CMD [ "bun", "run", "start" ]