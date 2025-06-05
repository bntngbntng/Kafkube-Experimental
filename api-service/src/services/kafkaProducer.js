const { Kafka } = require('kafkajs');

const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'mahasiswa-api-producer';
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'mahasiswa_events';

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();
let producerConnected = false;

const connectProducer = async () => {
  if (producerConnected) return;
  try {
    await producer.connect();
    producerConnected = true;
    console.log('Kafka Producer connected successfully.');
  } catch (error) {
    console.error('Failed to connect Kafka Producer:', error);
    // Implement retry logic or exit if critical
    process.exit(1);
  }
};

const disconnectProducer = async () => {
  if (!producerConnected) return;
  try {
    await producer.disconnect();
    producerConnected = false;
    console.log('Kafka Producer disconnected successfully.');
  } catch (error) {
    console.error('Failed to disconnect Kafka Producer:', error);
  }
};

const publishEvent = async (eventType, data) => {
  if (!producerConnected) {
    console.warn('Kafka Producer belum terkoneksi. Mencoba untuk connect...');
    await connectProducer();
    if(!producerConnected) {
        console.error('Gagal publish event, producer masih belum terkoneksi.');
        return;
    }
  }

  const timestampApiSent = Date.now(); // T1
  const message = {
    eventType: eventType,
    timestamp_api_sent: timestampApiSent,
    data: data,
  };

  try {
    await producer.send({
      topic: KAFKA_TOPIC,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Event ${eventType} published to Kafka topic ${KAFKA_TOPIC}:`, data.nim);
  } catch (error) {
    console.error(`Failed to publish event ${eventType} to Kafka:`, error);
  }
};

module.exports = {
  connectProducer,
  disconnectProducer,
  publishEvent,
  KAFKA_TOPIC // Export topic name
};