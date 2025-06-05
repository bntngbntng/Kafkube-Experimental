const express = require('express');
const mahasiswaRoutes = require('./routes/mahasiswaRoutes');
const { connectProducer, disconnectProducer } = require('./services/kafkaProducer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('REST API Mahasiswa sedang berjalan!');
});

app.use('/api', mahasiswaRoutes);

const startServer = async () => {
  await connectProducer(); // Connect Kafka producer on app start

  app.listen(PORT, () => {
    console.log(`REST API Mahasiswa listening on port ${PORT}`);
  });
};

startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});

// Shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal diterima: menutup HTTP server dan Kafka producer');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal diterima: menutup HTTP server dan Kafka producer');
  await disconnectProducer();
  process.exit(0);
});