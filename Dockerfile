FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN pnpm build


FROM node:20-slim AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY characters ./characters

RUN mkdir -p data

ENV NODE_ENV=production
ENV SERVER_PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
