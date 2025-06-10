# !/usr/bun/dir
# !/usr/bun/dir/matek
#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # No Color

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

# ---------------------------------------------------------

echo -e "${GREEN}🚀 Memulai deployment dari root proyek: $PROJECT_ROOT${NC}\n"

# 1. Deploy Mahasiswa App
echo "▶️ Menerapkan aplikasi utama 'mahasiswa-app'..."
kubectl apply -f "${PROJECT_ROOT}/kubernetes/mahasiswa-app/"
echo -e "${GREEN}✅ Selesai: 'mahasiswa-app' telah diterapkan.${NC}\n"

# 2. Deploy Dashboard
echo "▶️ Menerapkan 'dashboard'..."
kubectl apply -f "${PROJECT_ROOT}/kubernetes/dashboard/"
echo -e "${GREEN}✅ Selesai: 'dashboard' telah diterapkan.${NC}\n"

# 3. Deploy Monitoring Stack
echo "▶️ Menerapkan 'monitoring' (Prometheus & Grafana)..."
kubectl apply -f "${PROJECT_ROOT}/kubernetes/monitoring/"
echo -e "${GREEN}✅ Selesai: 'monitoring' telah diterapkan.${NC}\n"

echo -e "${GREEN}🎉 Semua layanan telah berhasil diterapkan!${NC}"
