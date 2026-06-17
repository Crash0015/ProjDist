FROM node:20-alpine AS base
WORKDIR /app
RUN apk upgrade --no-cache
COPY package.json package-lock.json* ./
RUN npm install --production

FROM node:20-alpine
WORKDIR /app
RUN apk upgrade --no-cache
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY src ./src
EXPOSE 4000
USER node
CMD ["node", "src/index.js"]
