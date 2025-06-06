import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 100,
  iterations: 5000,
};

export default function () {
  // ‣ __VU: 1..100
  // ‣ __ITER: 0..99
  // Global index (1..10000) = (VU-1)*100 + ITER + 1
  const globalIndex = (__VU - 1) * 100 + __ITER + 1;

  // LAT0001..LAT10000
  const nim = `LAT${String(globalIndex).padStart(4, "0")}`;

  const payload = JSON.stringify({
    nim: nim,
    nama: `Test User ${globalIndex}`,
    jurusan: "Teknologi Rekayasa Internet",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = http.post(
    "http://sister.osslab.my.id/api/mahasiswa",
    payload,
    params
  );
  check(res, {
    "status 201 or 409": (r) => r.status === 201 || r.status === 409,
  });
}
