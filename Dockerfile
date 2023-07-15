FROM node:18-alpine

RUN npm i -g pnpm

RUN mkdir -p /

WORKDIR /bot

COPY package.json /bot
COPY pnpm-lock.yaml /bot

# RUN pnpm install

COPY . /bot

# CMD ["pnpm", "install", "&&", "pnpm", "dev"]
CMD ["sh", "-c", "pnpm install && pnpm dev"]
