# One Dockerfile, two images: `--target api` and `--target migrate`.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/api/package.json packages/api/
RUN npm ci
COPY tsconfig.base.json tsconfig.json ./
COPY packages packages
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/shared/package.json packages/shared/
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/db/package.json packages/db/
COPY --from=build /app/packages/db/dist packages/db/dist
COPY --from=build /app/packages/db/migrations packages/db/migrations
USER node

FROM base AS migrate
CMD ["node", "packages/db/dist/cli.js"]

FROM base AS api
COPY --from=build /app/packages/api/package.json packages/api/
COPY --from=build /app/packages/api/dist packages/api/dist
ARG VERSION=dev
ENV APP_VERSION=$VERSION PORT=3000
EXPOSE 3000
CMD ["node", "packages/api/dist/server.js"]
