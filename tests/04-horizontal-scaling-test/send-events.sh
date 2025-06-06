#!/usr/bin/env bash

API="http://sister.osslab.my.id/api/mahasiswa"

for i in $(seq 1 10); do
  NIM="SCAL$(date +%s%3N)${i}"  
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -d "{\"nim\":\"${NIM}\",\"nama\":\"User ${i}\",\"jurusan\":\"Teknik Informatika\"}"
  echo "  → Sent: ${NIM}"
  sleep 0.05 
done
