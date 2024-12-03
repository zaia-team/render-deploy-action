
FROM oven/bun:1.1.29-alpine

COPY . /app

WORKDIR /app

RUN bun install

CMD ["bun", "run", "./src/main.ts"]
