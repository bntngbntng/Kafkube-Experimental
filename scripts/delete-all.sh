#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo -e "${RED}🔥 Memulai PENGHAPUSAN semua layanan dari root: $PROJECT_ROOT${NC}\n"

# Hapus Monitoring
echo "▶️ Menghapus 'monitoring'..."
kubectl delete -f "${PROJECT_ROOT}/kubernetes/monitoring/"
echo -e "${RED}✅ Selesai: 'monitoring' telah dihapus.${NC}\n"

# Hapus Dashboard
echo "▶️ Menghapus 'dashboard'..."
kubectl delete -f "${PROJECT_ROOT}/kubernetes/dashboard/"
echo -e "${RED}✅ Selesai: 'dashboard' telah dihapus.${NC}\n"

# Hapus Mahasiswa App
echo "▶️ Menghapus 'mahasiswa-app'..."
kubectl delete -f "${PROJECT_ROOT}/kubernetes/mahasiswa-app/"
echo -e "${RED}✅ Selesai: 'mahasiswa-app' telah dihapus.${NC}\n"

echo -e "${RED}🎉 Semua layanan telah berhasil dihapus!${NC}"
