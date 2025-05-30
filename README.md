# Kafkube Experimental

Proyek ini mengimplementasikan sistem REST API untuk data mahasiswa yang terintegrasi dengan Apache Kafka untuk pemrosesan event secara *asynchronous*. Semua layanan dijalankan dalam kontainer Docker dan di-orkestrasi menggunakan Kubernetes.

## Arsitektur Umum

Sistem ini terdiri dari beberapa komponen utama:
1.  **User**: Mengakses API.
2.  **REST API Mahasiswa** (Node.js/Express): Menerima request, menyimpan data ke DB utama, dan memublikasikan event ke Kafka.
3.  **Database Utama** (PostgreSQL): Menyimpan data master mahasiswa.
4.  **Apache Kafka**: Sebagai *message broker* untuk event.
5.  **Consumer Service** (Node.js): Membaca event dari Kafka dan menyimpannya ke DB Log.
6.  **Database Log** (PostgreSQL): Menyimpan log event untuk audit/analitik.
7.  **Docker**: Untuk mengemas setiap layanan ke dalam kontainer.
8.  **Kubernetes**: Untuk orkestrasi, *scaling*, dan *deployment* kontainer.

---
## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal perangkat lunak berikut:
* **Docker & Docker Compose**: Untuk menjalankan aplikasi secara lokal dan membangun *image*.
* **Minikube** (atau cluster Kubernetes lainnya seperti Kind, Docker Desktop Kubernetes, GKE, EKS, AKS).
* **`kubectl`**: Kubernetes Command Line Interface, sudah terkonfigurasi untuk terhubung ke cluster Anda.
* **Helm (v3+)**: Jika Anda memilih metode *deployment* dengan Helm Chart.
* **Node.js & npm**: Untuk pengembangan lokal layanan API dan Consumer (jika ingin memodifikasi).
* **Git**: Untuk meng-clone repositori (jika proyek ini ada di Git).

---
## Struktur Proyek (Contoh)
kafka-mahasiswa-k8s/
├── rest-api-mahasiswa/         # Kode sumber REST API (Node.js/Express)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── consumer-service/           # Kode sumber Consumer Service (Node.js)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── kubernetes/                 # Manifest Kubernetes
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-postgres-db-main-deployment.yaml # (Manual)
│   ├── 03-postgres-db-main-service.yaml    # (Manual)
│   ├── pvc-main.yaml                       # (Manual)
│   ├── 04-postgres-db-log-deployment.yaml  # (Manual)
│   ├── 05-postgres-db-log-service.yaml     # (Manual)
│   ├── pvc-log.yaml                        # (Manual)
│   ├── 06-kafka-deployment.yaml            # (Manual, sangat sederhana)
│   ├── 07-kafka-service.yaml               # (Manual)
│   ├── 08-rest-api-deployment.yaml
│   ├── 09-rest-api-service.yaml
│   ├── 10-consumer-service-deployment.yaml
│   ├── values-postgres-main.yaml           # Kustomisasi Helm untuk DB Utama
│   ├── values-postgres-log.yaml            # Kustomisasi Helm untuk DB Log
│   └── values-kafka.yaml                   # Kustomisasi Helm untuk Kafka
├── docker-compose.yml          # Untuk pengembangan lokal
└── README.md                   # File ini
---
## Pengembangan Lokal dengan Docker Compose

Untuk menjalankan seluruh tumpukan aplikasi secara lokal untuk pengembangan dan pengujian awal:
1.  Pastikan Docker Engine dan Docker Compose berjalan.
2.  Dari direktori root proyek (`kafka-mahasiswa-k8s/`), jalankan:
    ```bash
    docker-compose up --build
    ```
3.  Setelah semua layanan berjalan (cek log), REST API akan tersedia di `http://localhost:3000`.
    * Database utama (PostgreSQL): `localhost:5432`
    * Database log (PostgreSQL): `localhost:5433`
    * Kafka (advertised listener untuk host): `localhost:29092`

---
## Deployment ke Kubernetes

Ada dua metode yang dijelaskan di sini:
1.  **Manual**: Menggunakan file YAML Kubernetes untuk semua komponen.
2.  **Dengan Helm**: Menggunakan Helm Chart untuk PostgreSQL dan Kafka, dan file YAML manual untuk layanan aplikasi (REST API & Consumer).

**Sebelum Deployment (Kedua Metode):**
1.  **Bangun dan Push Docker Image Aplikasi:**
    Navigasi ke direktori masing-masing layanan dan bangun *image Docker*. Ganti `<YOUR_DOCKER_REGISTRY_USERNAME>` dengan username Docker Hub Anda atau *path* ke *registry* privat Anda.
    ```bash
    # Untuk REST API
    cd rest-api-mahasiswa/
    docker build -t <YOUR_DOCKER_REGISTRY_USERNAME>/rest-api-mahasiswa:latest .
    docker push <YOUR_DOCKER_REGISTRY_USERNAME>/rest-api-mahasiswa:latest
    cd ..

    # Untuk Consumer Service
    cd consumer-service/
    docker build -t <YOUR_DOCKER_REGISTRY_USERNAME>/consumer-service:latest .
    docker push <YOUR_DOCKER_REGISTRY_USERNAME>/consumer-service:latest
    cd ..
    ```
    *(Jika menggunakan Minikube dan ingin memakai image lokal tanpa push, gunakan `eval $(minikube -p minikube docker-env)` sebelum build, dan set `imagePullPolicy: IfNotPresent` atau `Never` di file Deployment YAML).*

2.  **Pastikan `kubectl` Terhubung ke Cluster Minikube Anda:**
    ```bash
    minikube start # Jika belum berjalan
    kubectl config use-context minikube # Mengatur kubectl untuk Minikube
    kubectl get nodes # Harus menampilkan node Minikube Anda
    ```

### Metode 1: Deployment Manual dengan File YAML

Metode ini menggunakan file-file YAML yang ada di direktori `kubernetes/` untuk setiap komponen.

1.  **Buat Namespace:**
    ```bash
    kubectl apply -f kubernetes/00-namespace.yaml
    ```
    Semua resource selanjutnya akan di-deploy ke namespace `mahasiswa-app`.

2.  **Buat PersistentVolumeClaims (PVCs):**
    ```bash
    kubectl apply -f kubernetes/pvc-main.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/pvc-log.yaml -n mahasiswa-app
    ```
    Tunggu hingga status PVC menjadi `Bound`: `kubectl get pvc -n mahasiswa-app`

3.  **Buat ConfigMap:**
    ```bash
    kubectl apply -f kubernetes/01-configmap.yaml -n mahasiswa-app
    ```

4.  **Deploy Database Utama (PostgreSQL):**
    ```bash
    kubectl apply -f kubernetes/02-postgres-db-main-deployment.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/03-postgres-db-main-service.yaml -n mahasiswa-app
    ```

5.  **Deploy Database Log (PostgreSQL):**
    ```bash
    kubectl apply -f kubernetes/04-postgres-db-log-deployment.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/05-postgres-db-log-service.yaml -n mahasiswa-app
    ```

6.  **Deploy Kafka (Contoh Sederhana):**
    **Peringatan:** Konfigurasi Kafka ini sangat dasar dan tidak untuk produksi.
    ```bash
    kubectl apply -f kubernetes/06-kafka-deployment.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/07-kafka-service.yaml -n mahasiswa-app
    ```
    Tunggu Pods database dan Kafka `Running` dan `READY` sebelum melanjutkan: `kubectl get pods -n mahasiswa-app -w`

7.  **Deploy REST API Mahasiswa:**
    Pastikan Anda sudah mengganti placeholder *image* di `08-rest-api-deployment.yaml`.
    ```bash
    kubectl apply -f kubernetes/08-rest-api-deployment.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/09-rest-api-service.yaml -n mahasiswa-app
    ```

8.  **Deploy Consumer Service:**
    Pastikan Anda sudah mengganti placeholder *image* di `10-consumer-service-deployment.yaml`.
    ```bash
    kubectl apply -f kubernetes/10-consumer-service-deployment.yaml -n mahasiswa-app
    ```

### Metode 2: Deployment dengan Helm (PostgreSQL & Kafka) + YAML (Aplikasi)

Metode ini menggunakan Helm Chart untuk PostgreSQL dan Kafka, yang lebih direkomendasikan untuk komponen *stateful*.

1.  **Instal Helm CLI** (jika belum).

2.  **Buat Namespace** (jika belum dibuat):
    ```bash
    kubectl apply -f kubernetes/00-namespace.yaml
    # atau biarkan Helm yang membuatkannya dengan flag --create-namespace
    ```

3.  **Tambahkan Repositori Helm Bitnami:**
    ```bash
    helm repo add bitnami [https://charts.bitnami.com/bitnami](https://charts.bitnami.com/bitnami)
    helm repo update
    ```

4.  **Deploy Database Utama dengan Helm:**
    Gunakan file `kubernetes/values-postgres-main.yaml` untuk kustomisasi (sesuaikan *password*, *username*, *database name*, *storage size*).
    ```bash
    helm install postgres-main bitnami/postgresql \
      -f kubernetes/values-postgres-main.yaml \
      --namespace mahasiswa-app --create-namespace
    ```

5.  **Deploy Database Log dengan Helm:**
    Gunakan file `kubernetes/values-postgres-log.yaml`.
    ```bash
    helm install postgres-log bitnami/postgresql \
      -f kubernetes/values-postgres-log.yaml \
      --namespace mahasiswa-app
    ```

6.  **Deploy Kafka dengan Helm:**
    Gunakan file `kubernetes/values-kafka.yaml`.
    ```bash
    helm install kafka bitnami/kafka \
      -f kubernetes/values-kafka.yaml \
      --namespace mahasiswa-app
    ```
    Tunggu hingga semua Pods dari Helm (PostgreSQL, Zookeeper, Kafka) `Running` dan `READY`.

7.  **Perbarui dan Terapkan ConfigMap:**
    Setelah instalasi Helm, nama *service* untuk PostgreSQL dan Kafka mungkin berbeda.
    * Cek nama *service* PostgreSQL: `kubectl get svc -n mahasiswa-app -l app.kubernetes.io/instance=postgres-main` (biasanya `<release-name>-postgresql`, misal `postgres-main-postgresql`).
    * Cek nama *service* Kafka: `kubectl get svc -n mahasiswa-app -l app.kubernetes.io/instance=kafka` (biasanya `<release-name>-headless` atau `<release-name>`, misal `kafka-headless`).
    Edit file `kubernetes/01-configmap.yaml` untuk menyesuaikan `DATABASE_URL`, `LOG_DATABASE_URL`, dan `KAFKA_BROKERS` dengan nama *service* yang benar dari Helm.
    Lalu, terapkan ConfigMap:
    ```bash
    kubectl apply -f kubernetes/01-configmap.yaml -n mahasiswa-app
    ```

8.  **Deploy REST API dan Consumer Service (menggunakan YAML manual):**
    Sama seperti Langkah 7 & 8 di Metode 1. Pastikan *image* sudah benar.
    ```bash
    kubectl apply -f kubernetes/08-rest-api-deployment.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/09-rest-api-service.yaml -n mahasiswa-app
    kubectl apply -f kubernetes/10-consumer-service-deployment.yaml -n mahasiswa-app
    ```

---
## Mengakses Aplikasi di Kubernetes

Setelah *deployment* berhasil, Anda bisa mengakses REST API.
* Jika Service REST API menggunakan `type: LoadBalancer` (dan cluster Anda mendukungnya):
    ```bash
    kubectl get svc rest-api-mahasiswa-service -n mahasiswa-app
    ```
    Gunakan `EXTERNAL-IP` yang ditampilkan.
* Jika menggunakan Minikube dengan `type: LoadBalancer` atau `NodePort`:
    ```bash
    minikube service rest-api-mahasiswa-service -n mahasiswa-app --url
    ```
    Ini akan membuka URL di browser atau menampilkan URL-nya.
* Menggunakan `kubectl port-forward`:
    ```bash
    kubectl port-forward svc/rest-api-mahasiswa-service -n mahasiswa-app 8080:80
    ```
    Akses API di `http://localhost:8080`.

---
## Skenario Pengujian

Berikut adalah ringkasan skenario pengujian. Pastikan semua layanan berjalan di Kubernetes.

### 1. Event Publish Test
* **Tujuan**: API memublikasikan event ke Kafka.
* **Cara**:
    1.  Listen ke topic Kafka `mahasiswa_events` menggunakan `kcat` (sebelumnya `kafkacat`):
        ```bash
        # Ganti kafka-headless.mahasiswa-app.svc.cluster.local:9092 jika nama service Kafka Anda berbeda
        kubectl run kafkacat-listener -n mahasiswa-app --image=edenhill/kcat:1.7.1 --restart=Never --rm -it -- \
        kcat -b kafka-headless.mahasiswa-app.svc.cluster.local:9092 -t mahasiswa_events -C -J -q
        ```
    2.  Kirim request `POST` ke endpoint `/api/mahasiswa` pada REST API Anda dengan data mahasiswa baru.
* **Hasil**: Catat request & response API. Verifikasi pesan JSON muncul di `kafkacat-listener` (cek `eventType`, `data`, `timestamp_api_sent`).

### 2. Consumer Test
* **Tujuan**: Consumer memproses event dan menyimpan log.
* **Cara**:
    1.  Kirim request `POST` ke API seperti di atas.
    2.  Tunggu beberapa saat.
    3.  Port-forward ke service database log (misal `postgres-log-postgresql` jika pakai Helm, atau `postgres-db-log-service` jika manual):
        ```bash
        # Sesuaikan nama service dan port lokal jika perlu
        kubectl port-forward svc/<nama-service-db-log> -n mahasiswa-app 5433:5432
        ```
    4.  Gunakan tool DB (DBeaver, pgAdmin) untuk terhubung ke `localhost:5433` dan periksa tabel `event_logs`.
    5.  Cek log pod consumer: `kubectl logs -l <label-selector-consumer> -n mahasiswa-app -f`.
* **Hasil**: Screenshot data baru di `event_logs`. Verifikasi `event_type`, `payload`, dan semua *timestamp*.

### 3. Integration Test
* **Tujuan**: Semua komponen terhubung dan berfungsi.
* **Cara**:
    1.  Pastikan semua pods (`rest-api`, `consumer-service`, Kafka, DBs) `Running`: `kubectl get pods -n mahasiswa-app`.
    2.  Cek `ConfigMap` (`kubectl get cm app-config -n mahasiswa-app -o yaml`) dan env var di pod API/Consumer (`kubectl exec <pod> -n mahasiswa-app -- printenv`).
    3.  Lakukan alur end-to-end: `POST` data -> Cek DB Utama (port-forward ke service DB utama) -> (Opsional) Cek Kafka -> Cek DB Log.
* **Hasil**: Screenshot status pods & services. Catat alur data sukses.

### 4. Horizontal Scaling Test (Consumer Service)
* **Tujuan**: Tidak ada duplikasi pemrosesan saat consumer di-scale.
* **Cara**:
    1.  Awalnya `consumer-service` deployment memiliki `replicas: 1`.
    2.  Kirim beberapa pesan. Verifikasi tidak ada duplikasi di `event_logs`.
    3.  Scale: `kubectl scale deployment consumer-service -n mahasiswa-app --replicas=2` (atau 3).
    4.  Tunggu pod baru `Running`.
    5.  Kirim beberapa pesan lagi.
* **Hasil**: Screenshot `kubectl get pods -n mahasiswa-app -l <label-selector-consumer>`. Cek log semua pod consumer. **PENTING**: Verifikasi di `event_logs` bahwa tidak ada duplikasi pemrosesan untuk pesan yang dikirim setelah scaling.

### 5. Latency Test
* **Tujuan**: Mengukur delay end-to-end.
* **Cara**:
    1.  Kirim 10-20 request `POST` ke API.
    2.  Ambil data dari `event_logs` (terutama `timestamp_api_sent`, `timestamp_kafka_received`, `timestamp_processed`).
    3.  Hitung:
        * $L_{end-to-end} = \text{timestamp_processed} - \text{timestamp_api_sent}$
        * $L_{consumer\_processing} = \text{timestamp_processed} - \text{timestamp_kafka_received}$
        * $L_{kafka\_queue} = \text{timestamp_kafka_received} - \text{timestamp_api_sent}$
* **Hasil**: Tabel data timestamp & latensi. Hitung statistik (rata-rata, min, max, P95, P99).

---
## Pembersihan (Cleanup)

Untuk menghapus semua resource yang telah di-deploy:

**Jika menggunakan Metode 1 (Manual YAML):**
```bash
# Hapus semua resource dari file YAML di direktori kubernetes (dalam namespace)
kubectl delete -f kubernetes/10-consumer-service-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/09-rest-api-service.yaml -n mahasiswa-app
kubectl delete -f kubernetes/08-rest-api-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/07-kafka-service.yaml -n mahasiswa-app
kubectl delete -f kubernetes/06-kafka-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/05-postgres-db-log-service.yaml -n mahasiswa-app
kubectl delete -f kubernetes/04-postgres-db-log-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/03-postgres-db-main-service.yaml -n mahasiswa-app
kubectl delete -f kubernetes/02-postgres-db-main-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/01-configmap.yaml -n mahasiswa-app
kubectl delete -f kubernetes/pvc-log.yaml -n mahasiswa-app
kubectl delete -f kubernetes/pvc-main.yaml -n mahasiswa-app
# Terakhir, hapus namespace
kubectl delete -f kubernetes/00-namespace.yaml

# Hapus rilis Helm
helm uninstall postgres-main -n mahasiswa-app
helm uninstall postgres-log -n mahasiswa-app
helm uninstall kafka -n mahasiswa-app

# Hapus resource aplikasi yang di-deploy manual
kubectl delete -f kubernetes/10-consumer-service-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/09-rest-api-service.yaml -n mahasiswa-app
kubectl delete -f kubernetes/08-rest-api-deployment.yaml -n mahasiswa-app
kubectl delete -f kubernetes/01-configmap.yaml -n mahasiswa-app # Jika tidak terhapus otomatis atau ingin bersih

# Hapus PVCs (Helm mungkin tidak otomatis menghapus PVC tergantung konfigurasi chart)
kubectl delete pvc postgres-main-postgresql-0 -n mahasiswa-app # Nama PVC mungkin berbeda, cek dengan `kubectl get pvc -n mahasiswa-app`
kubectl delete pvc postgres-log-postgresql-0 -n mahasiswa-app
kubectl delete pvc data-kafka-0 -n mahasiswa-app # Nama PVC Kafka juga cek

# Terakhir, hapus namespace
kubectl delete -f kubernetes/00-namespace.yaml
