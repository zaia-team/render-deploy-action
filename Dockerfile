
FROM oven/bun:1.1.29-alpine

COPY . /src

WORKDIR /src

RUN bun install

CMD ["bun", "run", "main.ts"]
