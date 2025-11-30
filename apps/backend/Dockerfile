# Build Stage
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client BEFORE building
RUN npx prisma generate

COPY . .

# Build TypeScript
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

RUN npm prune --production