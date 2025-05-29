FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# Environment variables to be set by Docker or Kubernetes
ENV PORT=3000
# ENV DATABASE_URL=
# ENV KAFKA_BROKERS=
# ENV KAFKA_TOPIC=mahasiswa_events
# ENV KAFKA_CLIENT_ID=mahasiswa-api-producer

EXPOSE ${PORT}
CMD [ "node", "src/app.js" ]