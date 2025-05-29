const { Kafka } = require('kafkajs');
const { saveLog, initLogDb } = require('./services/logService');

const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'mahasiswa_events';
const KAFKA_CONSUMER_GROUP = process.env.KAFKA_CONSUMER_GROUP || 'log_processors_group';
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || `consumer-service-${Math.random().toString(36).substring(7)}`;


const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: KAFKA_CONSUMER_GROUP });

const run = async () => {
  await initLogDb(); // Init log database schema

  try {
    await consumer.connect();
    console.log('Kafka Consumer connected.');

    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: process.env.KAFKA_CONSUME_FROM_BEGINNING === 'true' });
    console.log(`Subscribed to topic: ${KAFKA_TOPIC} with group ID: ${KAFKA_CONSUMER_GROUP}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message from ${topic} [${partition}] offset ${message.offset}:`);
        try {
          const event = JSON.parse(message.value.toString());
          // console.log({
          //   partition,
          //   offset: message.offset,
          //   value: event,
          // });
          await saveLog(event, partition, message.offset);
        } catch (parseError) {
          console.error('Error mem-parsing pesan atau menyimpan log:', parseError);
        }
      },
    });
  } catch (error) {
    console.error('Error in Kafka consumer:', error);
    process.exit(1);
  }
};

run().catch(e => console.error('[consumer-service] Gagal menjalankan consumer', e));

// Shutdown
const shutdown = async () => {
  console.log('Mematikan consumer...');
  try {
    await consumer.disconnect();
    console.log('Kafka consumer terputus.');
  } catch (err) {
    console.error('Error memutuskan service Kafka consumer:', err);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);