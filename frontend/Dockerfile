FROM node:20-alpine AS base
WORKDIR /frontend

FROM base AS deps-dev
COPY package*.json ./
RUN npm ci && npm cache clean --force

FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

FROM base AS development
ENV NODE_ENV=development
COPY --from=deps-dev /frontend/node_modules ./node_modules
COPY . .
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
