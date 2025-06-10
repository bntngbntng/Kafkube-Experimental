// server.js
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 3000;

// Ganti BASE_PROM dengan URL Prometheus Anda (NodePort/LoadBalancer)
const BASE_PROM = "http://k8s-master:30909/api/v1/query?query=";

// Fungsi untuk memanggil query Prometheus
async function queryPromql(q) {
  const url = BASE_PROM + encodeURIComponent(q);
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== "success" || !json.data.result.length) {
    return 0;
  }
  // Ambil elemen pertama dari array result, lalu ambil nilai numeric-nya
  return parseFloat(json.data.result[0].value[1]);
}

app.use(express.static("public"));

app.get("/api/cluster-status", async (req, res) => {
  try {
    // 1) Jumlah Pod yang sedang Running
    const containers = await queryPromql(
      `count(kube_pod_status_phase{phase="Running"})`
    );
    // 2) Jumlah Node total
    const nodes = await queryPromql(`count(kube_node_info)`);
    // 3) Rata‐rata CPU Usage seluruh klaster (dalam persen)
    const cpuUsagePercent = await queryPromql(
      `avg(100 - (rate(node_cpu_seconds_total{mode="idle"}[5m]) * 100))`
    );
    // 4a) Total memori terpakai (bytes)
    const memUsedBytes = await queryPromql(
      `sum(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)`
    );
    // 4b) Total kapasitas memori (bytes)
    const memTotalBytes = await queryPromql(`sum(node_memory_MemTotal_bytes)`);
    // Konversi ke GiB (1 GiB = 1024^3 bytes)
    const usedGi = (memUsedBytes / 1024 ** 3).toFixed(1);
    const totalGi = (memTotalBytes / 1024 ** 3).toFixed(1);

    res.json({
      containers: Math.round(containers), // misal 12
      nodes: Math.round(nodes), // misal 3
      cpu: cpuUsagePercent.toFixed(1), // misal "42.3"
      memoryUsedGi: usedGi, // misal "1.2"
      memoryTotalGi: totalGi, // misal "4.0"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data klaster" });
  }
});

app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});
