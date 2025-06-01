import React, { useState, useEffect } from "react";
import MahasiswaForm from "./components/MahasiswaForm";
import MahasiswaList from "./components/MahasiswaList";

function App() {
  const [mahasiswa, setMahasiswa] = useState([]);
  const apiBaseUrl = "/api";

  useEffect(() => {
    fetch(`${apiBaseUrl}/mahasiswa`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data mahasiswa");
        return res.json();
      })
      .then((data) => setMahasiswa(data))
      .catch((err) => {
        console.error(err);
        setMahasiswa([]);
      });
  }, [apiBaseUrl]);

  const tambahMahasiswa = async (payload) => {
    try {
      const res = await fetch(`${apiBaseUrl}/mahasiswa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const baru = await res.json();
        setMahasiswa((prev) => [baru, ...prev]);
      } else {
        const errJson = await res.json();
        alert(errJson.error || "Gagal menambah mahasiswa");
      }
    } catch (e) {
      console.error(e);
      alert("Error jaringan saat menambah mahasiswa");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>Dashboard Mahasiswa</h2>
      <MahasiswaForm onSubmit={tambahMahasiswa} />
      <MahasiswaList data={mahasiswa} />
    </div>
  );
}

export default App;
