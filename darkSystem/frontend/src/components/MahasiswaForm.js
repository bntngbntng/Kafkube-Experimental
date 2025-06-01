import React, { useState } from "react";

export default function MahasiswaForm({ onSubmit }) {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [jurusan, setJurusan] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nim.trim() || !nama.trim()) {
      alert("NIM dan Nama harus diisi");
      return;
    }
    onSubmit({ nim: nim.trim(), nama: nama.trim(), jurusan: jurusan.trim() });
    setNim("");
    setNama("");
    setJurusan("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="nim">NIM:</label>
        <br />
        <input
          id="nim"
          type="text"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="nama">Nama:</label>
        <br />
        <input
          id="nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label htmlFor="jurusan">Jurusan:</label>
        <br />
        <input
          id="jurusan"
          type="text"
          value={jurusan}
          onChange={(e) => setJurusan(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <button
        type="submit"
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Tambah Mahasiswa
      </button>
    </form>
  );
}
