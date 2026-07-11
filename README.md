<div align="center">

# 🎯 Face Recognition Attendance System

**Hệ thống điểm danh tự động bằng nhận diện khuôn mặt real-time, tích hợp anti-spoofing và vector search.**

[![Python](https://img.shields.io/badge/Python-≥3.10-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo Video](https://youtu.be/BtBY9D3Kr-I) · [Kiến trúc](#-kiến-trúc-hệ-thống) · [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt) · [Công nghệ](#-công-nghệ-sử-dụng)

</div>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Demo](#-demo)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Pipeline nhận diện khuôn mặt](#-pipeline-nhận-diện-khuôn-mặt)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Ghi nhận đóng góp](#-ghi-nhận-đóng-góp)

---

## 🔍 Tổng quan

Face Recognition Attendance System là hệ thống điểm danh/chấm công tự động bằng nhận diện khuôn mặt, hoạt động theo thời gian thực. **Attendance Service** là thành phần AI cốt lõi — nhận frame từ camera hoặc MJPEG stream, phát hiện khuôn mặt, kiểm tra chất lượng ảnh, chạy anti-spoofing (liveness detection), căn chỉnh khuôn mặt, trích xuất embedding và đối sánh với vector database để xác định danh tính nhân viên.

### Điểm nổi bật

- ⚡ **Xử lý real-time** — nhận diện khuôn mặt liên tục từ camera stream
- 🛡️ **Anti-spoofing** — liveness detection chống giả mạo bằng ảnh in, video, mặt nạ
- 🏗️ **Kiến trúc distributed** — tách biệt AI, API và frontend, dễ scale độc lập
- 🐳 **Triển khai một lệnh** — khởi chạy toàn bộ bằng Docker Compose (hỗ trợ GPU)

---

## 🎬 Demo

<div align="center">

📺 **[Xem demo đầy đủ trên YouTube →](https://youtu.be/BtBY9D3Kr-I)**

</div>

---

## 🏛️ Kiến trúc hệ thống

<div align="center">

![System Architecture](./docs/arcitecture.png)

</div>

Hệ thống được thiết kế theo kiến trúc **distributed microservices**, tách biệt rõ ràng giữa xử lý nghiệp vụ và xử lý AI:

| Service | Chức năng |
|---------|-----------|
| **API Service** | Trung tâm điều phối — xử lý nghiệp vụ điểm danh, quản lý nhân viên/ca làm, phục vụ Web Dashboard, và gửi ảnh enrollment sang Inference Service |
| **Inference Service** | Chuyên trách AI — face detection, anti-spoofing, trích xuất embedding và vector search trong Qdrant. Tách riêng để cô lập tải GPU-heavy khỏi luồng nghiệp vụ |
| **Web Dashboard** | Giao diện quản trị cho admin — quản lý nhân viên, xem lịch sử điểm danh, giám sát hệ thống |
| **Attendance Display** | Màn hình hiển thị kết quả nhận diện theo thời gian thực |

### Luồng dữ liệu

```
1. Enrollment     → API Service gửi ảnh khuôn mặt nhân viên → Inference Service trích xuất
                    embedding → lưu vào Qdrant

2. Nhận diện      → Camera gửi frame liên tục → Inference Service phát hiện & đối sánh
                    khuôn mặt → truy vấn Qdrant tìm kết quả khớp nhất

3. Điểm danh      → Xác định được nhân viên → API Service ghi nhận điểm danh
                    → Redis cooldown chống ghi trùng → PostgreSQL lưu bản ghi chính thức

4. Hiển thị       → Inference Service gửi frame + kết quả → Attendance Display (real-time)

5. Quản trị       → API Service cung cấp dữ liệu → Web Dashboard cho quản trị viên
```

---

## 🧠 Pipeline nhận diện khuôn mặt

<div align="center">

![Face Recognition Pipeline](./docs/pipeline.png)

</div>

Attendance Service xử lý từng frame từ camera stream qua pipeline nhiều bước:

| Bước | Model / Phương pháp | Mô tả |
|------|---------------------|--------|
| **1. Face Detection** | RetinaFace | Phát hiện khuôn mặt trong frame; chỉ tiếp tục khi có đúng một khuôn mặt hợp lệ |
| **2. Quality Check** | Heuristic filters | Kiểm tra kích thước, độ mờ và góc quay khuôn mặt để loại bỏ frame không đủ tin cậy |
| **3. Liveness Detection** | Silent-Face-Anti-Spoofing | Kiểm tra khuôn mặt thật hay giả (ảnh in, màn hình điện thoại, mặt nạ) |
| **4. Face Alignment** | InsightFace `norm_crop` | Căn chỉnh hình học khuôn mặt để trích xuất embedding nhất quán |
| **5. Embedding Extraction** | ArcFace | Tạo vector đặc trưng 512 chiều từ khuôn mặt đã căn chỉnh |
| **6. L2 Normalization** | — | Chuẩn hóa vector embedding trước khi so khớp |
| **7. Vector Search** | Qdrant | Đối sánh embedding với dữ liệu nhân viên đã lưu để xác định danh tính |

---

## 🛠️ Công nghệ sử dụng

| Danh mục | Công nghệ |
|----------|-----------|
| **Backend** | Python · FastAPI · Uvicorn · Pydantic · SQLAlchemy · Alembic · HTTPX |
| **AI / Computer Vision** | PyTorch (CUDA) · ONNX Runtime (GPU) · InsightFace · RetinaFace · ArcFace · Silent-Face-Anti-Spoofing · OpenCV · NumPy · Pillow |
| **Frontend** | React 19 · TypeScript · Vite · TanStack Query · Zustand · React Hook Form · Zod |
| **Cơ sở dữ liệu** | PostgreSQL 16 · Qdrant (Vector DB) · Redis 7 |
| **Hạ tầng** | Docker · Docker Compose · NVIDIA Container Runtime · Healthcheck orchestration |

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

| Yêu cầu | Ghi chú |
|----------|---------|
| Docker Engine + Docker Compose | Bắt buộc |
| Python `≥3.10, <3.13` | Chỉ cần nếu chạy service ở local (không dùng Docker) |
| NVIDIA GPU + Driver + Container Runtime | Bắt buộc để chạy `attendance-service` với GPU |
| Camera / MJPEG stream | Hoặc dùng fake camera server đi kèm để test |

### Các bước cài đặt

**1. Clone repository**

```bash
git clone https://github.com/PhucNguyenThanh04/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System
```

**2. Cấu hình biến môi trường**

Tạo file `.env` cho từng service dựa trên file mẫu:

```bash
cp api-service/.env.example api-service/.env
cp attendance-service/.env.example attendance-service/.env
```

> [!TIP]
> Xem `docker-compose.yml` để biết đầy đủ danh sách biến môi trường có thể cấu hình.

**3. Build và khởi chạy toàn bộ service**

```bash
docker compose up --build -d
```

Sau khi chạy thành công, các service sẽ có địa chỉ:

| Service | URL |
|---------|-----|
| API Service | [`http://localhost:8000`](http://localhost:8000) |
| Attendance Service | [`http://localhost:8001`](http://localhost:8001) |
| Qdrant Dashboard | [`http://localhost:6333`](http://localhost:6333) |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |

**4. Chạy database migration**

```bash
docker compose exec api-service alembic upgrade head
```

**5. Tạo tài khoản admin**

API Service có thể tự động tạo tài khoản admin khi khởi động. Cấu hình các biến sau trong `api-service/.env` trước khi chạy:

```env
BOOTSTRAP_ADMIN_ENABLED=True
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=Admin12345
BOOTSTRAP_ADMIN_FULL_NAME=System Administrator
```

**6. Test với fake camera stream** *(tùy chọn)*

```bash
python tool/fake_camera_server.py
```

Sau đó cấu hình stream URL cho Attendance Service (khi chạy trong Docker):

```env
STREAM_URL=http://host.docker.internal:8080/stream
```

**7. Kiểm tra trạng thái service**

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
```

---

## 📁 Cấu trúc dự án

```
Face-Recognition-Attendance-System/
├── api-service/                    # Xử lý nghiệp vụ & REST API
│   ├── src/
│   │   ├── api/                    # Các module: auth, staff, shifts, attendance, face profiles
│   │   ├── core/                   # Cấu hình, database, cache, middleware, bootstrap admin
│   │   └── utils/                  # Tiện ích dùng chung
│   ├── alembic/                    # Script migration cơ sở dữ liệu
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── attendance-service/             # AI inference & nhận diện real-time
│   ├── app/
│   │   ├── api/                    # Endpoint của AI service
│   │   ├── core/
│   │   │   ├── ml/                 # Detector, aligner, embedder, anti-spoofing
│   │   │   ├── pipeline/           # Pipeline nhận diện điểm danh real-time
│   │   │   ├── vector_db/          # Tầng vector search Qdrant
│   │   │   ├── clients/            # Client tích hợp API Service
│   │   │   └── configs/            # Cấu hình service
│   │   └── utils/
│   ├── Silent-Face-Anti-Spoofing/  # Model liveness detection
│   ├── weights/                    # Model weights đã pre-trained
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── web-dashboard/                  # Giao diện quản trị (React + TypeScript + Vite)
├── visualize-attendance/           # Màn hình hiển thị điểm danh real-time
├── tool/
│   └── fake_camera_server.py       # Fake MJPEG stream để test
│
├── docs/
│   ├── arcitecture.png             # Sơ đồ kiến trúc hệ thống
│   └── pipeline.png                # Sơ đồ pipeline nhận diện khuôn mặt
│
├── docker-compose.yml              # File orchestration chính
├── docker-compose.gpu.yml          # Compose override cho GPU
├── .gitignore
└── README.md
```

---

## 🙏 Ghi nhận đóng góp

- **Liveness Detection** — Sử dụng model [Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) của Minivision AI, phát hành theo Apache License 2.0. Model được dùng nguyên bản để phát hiện giả mạo khuôn mặt (ảnh in, màn hình điện thoại, mặt nạ) trước bước nhận diện.
