/**
 * latencyTest.js
 * ------------------------------------------------------------
 * Skrip untuk:
 * 1. Melakukan HTTP POST request ke API /api/mahasiswa
 * 2. Polling DB log PostgreSQL untuk menunggu data log muncul
 * 3. Mengukur selisih T₂ – T₁
 *
 * Asumsi:
 * - Database log tersedia di LOG_DATABASE_URL
 * - Ada tabel event_logs dengan kolom: timestamp_api_sent (TIMESTAMPTZ), timestamp_log_saved (TIMESTAMPTZ), 
 *   payload JSONB (memuat data mahasiswa yang dikirim).
 */

const axios = require('axios');
const { Pool } = require('pg');

const API_URL = process.env.API_URL || 'http://localhost:3000/api/mahasiswa';
const LOG_DB_URL = process.env.LOG_DATABASE_URL || 'postgresql://log_user:log_password@localhost:5433/log_db';

const pool = new Pool({ connectionString: LOG_DB_URL });

// Fungsi tunggu sampai log ada
async function waitForLog(nim, maxWaitMs = 10000, pollIntervalMs = 200) {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const client = await pool.connect();
    try {
      // Cari row dengan payload.nim = nim yang baru muncul
      const res = await client.query(
        `SELECT timestamp_api_sent, timestamp_processed 
         FROM event_logs 
         WHERE payload->>'nim' = $1 
         ORDER BY timestamp_processed DESC 
         LIMIT 1`,
        [nim]
      );
      if (res.rowCount > 0) {
        return {
          tApi: new Date(res.rows[0].timestamp_api_sent),
          tSaved: new Date(res.rows[0].timestamp_processed)
        };
      }
    } finally {
      client.release();
    }
    // Jika belum muncul, tunggu sebentar dan coba lagi
    await new Promise(r => setTimeout(r, pollIntervalMs));
  }
  throw new Error(`Timeout: Log untuk NIM=${nim} tidak muncul dalam ${maxWaitMs} ms`);
}

async function singleTest(nomorKe) {
  // Generate NIM unik untuk membedakan
  const nim = 'LAT' + Date.now().toString().slice(-6) + nomorKe;
  const payload = {
    nim,
    nama: `Test User ${nomorKe}`,
    jurusan: 'Teknik Informatika'
  };
  // Kirim request POST
  const tClientSent = new Date();
  await axios.post(API_URL, payload);

  // Tunggu hingga log muncul dan hitung selisih
  const { tApi, tSaved } = await waitForLog(nim);
  const latencyMs = tSaved.getTime() - tApi.getTime();
  return { nim, tApi, tSaved, latencyMs };
}

(async () => {
  const percobaan = 50; // misalnya 50 request
  const hasil = [];
  for (let i = 1; i <= percobaan; i++) {
    try {
      const res = await singleTest(i);
      console.log(`[${i}] NIM=${res.nim}, Latency=${res.latencyMs} ms`);
      hasil.push(res.latencyMs);
    } catch (e) {
      console.error(`Gagal di percobaan ke‐${i}:`, e.message);
    }
    // Beri jeda kecil jika perlu
    await new Promise(r => setTimeout(r, 50));
  }

  if (hasil.length > 0) {
    // Hitung statistik sederhana
    const sum = hasil.reduce((a, b) => a + b, 0);
    const avg = sum / hasil.length;
    const min = Math.min(...hasil);
    const max = Math.max(...hasil);
    hasil.sort((a, b) => a - b);
    const p50 = hasil[Math.floor(hasil.length * 0.5)];
    const p90 = hasil[Math.floor(hasil.length * 0.9)];

    console.log('\n=> Ringkasan Hasil Latency:');
    console.log(`Jumlah sampel     : ${hasil.length}`);
    console.log(`Rata‐rata (AVG)   : ${Math.round(avg)} ms`);
    console.log(`Minimum (MIN)     : ${min} ms`);
    console.log(`Maksimum (MAX)    : ${max} ms`);
    console.log(`Percentile 50 (P50): ${p50} ms`);
    console.log(`Percentile 90 (P90): ${p90} ms`);
  } else {
    console.log('Tidak ada data latency yang berhasil diukur.');
  }
  process.exit(0);
})();
