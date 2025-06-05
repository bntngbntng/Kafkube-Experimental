# ------------ Stage 1: Build/Install dependencies ------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

COPY . .

# ------------ Stage 2: Run ------------
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app .

EXPOSE 3000

ENV PROM_URL="http://prometheus-service:9090/api/v1/query?query="

CMD ["node", "server.js"]
