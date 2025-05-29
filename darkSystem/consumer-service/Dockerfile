FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Environment variables to be set by Docker or Kubernetes
# ENV LOG_DATABASE_URL=
# ENV KAFKA_BROKERS=
# ENV KAFKA_TOPIC=mahasiswa_events
# ENV KAFKA_CONSUMER_GROUP=log_processors_group
# ENV KAFKA_CLIENT_ID= # Optional, will be auto-generated if not set
# ENV KAFKA_CONSUME_FROM_BEGINNING=true

CMD [ "node", "src/consumer.js" ]