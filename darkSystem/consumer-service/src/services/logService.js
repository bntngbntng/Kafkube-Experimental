const { Pool } = require('pg');

const LOG_DB_CONNECTION_STRING = process.env.LOG_DATABASE_URL || 'postgresql://log_user:log_password@localhost:5433/log_db';

const pool = new Pool({
  connectionString: LOG_DB_CONNECTION_STRING,
});

pool.on('connect', () => {
  console.log('Terkoneksi ke log PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Error saat idle client di log DB', err);
  process.exit(-1);
});

// Create table if not tiada
const initLogDb = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS event_logs (
            id SERIAL PRIMARY KEY,
            event_type VARCHAR(50),
            payload JSONB,
            timestamp_api_sent TIMESTAMP WITH TIME ZONE,
            timestamp_kafka_received TIMESTAMP WITH TIME ZONE,
            timestamp_processed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            kafka_partition INTEGER,
            kafka_offset BIGINT
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Tabel 'event_logs' ada di dalam log database.");
    } catch (err) {
        console.error("Error saat membuat tabel 'event_logs' :", err);
    }
};

const saveLog = async (event, partition, offset) => {
  const timestampKafkaReceived = new Date(); // T2

  const query = `
    INSERT INTO event_logs (event_type, payload, timestamp_api_sent, timestamp_kafka_received, kafka_partition, kafka_offset)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [
    event.eventType,
    event.data, 
    event.timestamp_api_sent ? new Date(event.timestamp_api_sent) : null, // T1
    timestampKafkaReceived, // T2
    partition,
    offset
  ];

  try {
    const client = await pool.connect();
    try {
      await client.query(query, values);
      console.log(`Log saved for event: ${event.eventType}, NIM: ${event.data?.nim}, Offset: ${offset}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving log to database:', error);
  }
};

module.exports = {
  saveLog,
  initLogDb
};