const { Pool } = require('pg');
const { publishEvent } = require('../services/kafkaProducer');

const DB_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mahasiswa_db';

const pool = new Pool({
  connectionString: DB_CONNECTION_STRING,
});

pool.on('connect', () => {
  console.log('Terkoneksi ke Main PostgreSQL database!');
});

pool.on('error', (err) => {
  console.error('Error saat idle client di Main DB', err);
  process.exit(-1);
});

// Create table
const initDb = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS mahasiswa (
            id SERIAL PRIMARY KEY,
            nim VARCHAR(20) UNIQUE NOT NULL,
            nama VARCHAR(100) NOT NULL,
            jurusan VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Tabel 'mahasiswa' sudah ada.");
    } catch (err) {
        console.error("Error saat membuat tabel 'mahasiswa':", err);
    }
};


exports.tambahMahasiswa = async (req, res) => {
  const { nim, nama, jurusan } = req.body;

  if (!nim || !nama) {
    return res.status(400).json({ error: 'NRP dan Nama harus diisi' });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO mahasiswa (nim, nama, jurusan) VALUES ($1, $2, $3) RETURNING *',
        [nim, nama, jurusan]
      );
      const mahasiswaBaru = result.rows[0];

      // Publish event ke Kafka
      await publishEvent('MAHASISWA_CREATED', mahasiswaBaru);

      res.status(201).json(mahasiswaBaru);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error menambah mahasiswa:', error);
    if (error.code === '23505') { // Kode berhadiah unik
      return res.status(409).json({ error: `Mahasiswa dengan NRP ${nim} sudah ada.` });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.getMahasiswa = async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM mahasiswa ORDER BY created_at DESC');
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saat mengambil data mahasiswa:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Init DB and Kafka Producer
initDb();