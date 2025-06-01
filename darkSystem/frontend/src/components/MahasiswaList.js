import React from "react";

export default function MahasiswaList({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Tidak ada data mahasiswa.</p>;
  }

  return (
    <div>
      <h3>Daftar Mahasiswa</h3>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "0.5rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>NIM</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nama</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Jurusan
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Created At
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {m.id}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {m.nim}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {m.nama}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {m.jurusan || "-"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {new Date(m.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
