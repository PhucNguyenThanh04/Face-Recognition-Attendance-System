# 🎯 Face Recognition Attendance System

[![Python](https://img.shields.io/badge/Python-≥3.10-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-DC244C?style=flat&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

Hệ thống điểm danh/chấm công tự động bằng nhận diện khuôn mặt real-time: phát hiện khuôn mặt, chống giả mạo bằng liveness detection, trích xuất embedding và đối sánh với vector database. Hệ thống dùng FastAPI, PyTorch/ONNX, Qdrant, PostgreSQL, Redis và React/Vite.

## TL;DR

Một hệ thống điểm danh theo kiến trúc multi-service: API Service xử lý nghiệp vụ HR và phục vụ Web Dashboard, Attendance Service (Inference) chuyên trách toàn bộ AI pipeline — face detection, anti-spoofing, embedding extraction, vector search. Camera gửi frame liên tục, hệ thống nhận diện và ghi điểm danh tự động với Redis cooldown chống trùng. Phù hợp cho bài toán chấm công cần xử lý real-time, chống giả mạo, và triển khai bằng Docker Compose với GPU.

## Features

- Pipeline nhận diện đa bước: RetinaFace → Quality Check → Silent-Face-Anti-Spoofing → ArcFace → Qdrant vector search.
- Anti-spoofing tích hợp: liveness detection chống ảnh in, video, mặt nạ trước bước nhận diện.
- Kiến trúc distributed: tách biệt AI inference (GPU-heavy) khỏi nghiệp vụ API, mỗi service scale độc lập.
- Enrollment qua API: gửi ảnh khuôn mặt nhân viên, tự động trích xuất embedding và lưu vào Qdrant.
- Redis cooldown: chống ghi trùng điểm danh khi cùng một nhân viên xuất hiện liên tục trước camera.
- Attendance Display: màn hình hiển thị kết quả nhận diện real-time, nhận frame + result trực tiếp từ Inference Service.
- Web Dashboard: giao diện React quản lý nhân viên, ca làm, lịch sử điểm danh.

## Table of Contents

- [Demo](#demo)
- [Architecture](#architecture)
- [Face Recognition Pipeline](#face-recognition-pipeline)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Acknowledgements](#acknowledgements)

## Demo

**Video demo:** https://youtu.be/BtBY9D3Kr-I

## Architecture

### System Architecture

![System Architecture](./docs/arcitecture.png)

Hệ thống được thiết kế theo kiến trúc **distributed microservices**, tách biệt rõ ràng giữa xử lý nghiệp vụ và xử lý AI:

- **Frontend → API Service (`api-service`)**: client gọi API, API Service xử lý nghiệp vụ điểm danh, quản lý nhân viên/ca làm, phục vụ Web Dashboard.
- **API Service → Inference Service (`attendance-service`)**: gửi ảnh enrollment khi nhân viên mới đăng ký khuôn mặt; Inference Service trích xuất embedding và lưu vào Qdrant.
- **Camera → Inference Service**: camera gửi frame liên tục; Inference Service chạy pipeline nhận diện (detect → quality check → anti-spoofing → align → embed → vector search).
- **Inference Service → Qdrant**: truy vấn vector database để tìm khuôn mặt khớp nhất.
- **Inference Service → API Service**: gửi `user_id` đã nhận diện được về API Service để ghi nhận điểm danh.
- **API Service → PostgreSQL/Redis**: lưu bản ghi điểm danh, kiểm tra cooldown chống ghi trùng.
- **Inference Service → Attendance Display**: gửi frame + kết quả nhận diện trực tiếp để hiển thị real-time.

### Data Flow

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

## Face Recognition Pipeline

![Face Recognition Pipeline](./docs/pipeline.png)

Attendance Service xử lý từng frame từ camera stream qua pipeline nhiều bước:

| Bước | Model / Phương pháp | Mô tả |
|---|---|---|
| **1. Face Detection** | RetinaFace | Phát hiện khuôn mặt trong frame; chỉ tiếp tục khi có đúng một khuôn mặt hợp lệ. |
| **2. Quality Check** | Heuristic filters | Kiểm tra kích thước, độ mờ và góc quay khuôn mặt để loại bỏ frame không đủ tin cậy. |
| **3. Liveness Detection** | Silent-Face-Anti-Spoofing | Kiểm tra khuôn mặt thật hay giả (ảnh in, màn hình điện thoại, mặt nạ). |
| **4. Face Alignment** | InsightFace `norm_crop` | Căn chỉnh hình học khuôn mặt để trích xuất embedding nhất quán. |
| **5. Embedding Extraction** | ArcFace | Tạo vector đặc trưng 512 chiều từ khuôn mặt đã căn chỉnh. |
| **6. L2 Normalization** | — | Chuẩn hóa vector embedding trước khi so khớp. |
| **7. Vector Search** | Qdrant | Đối sánh embedding với dữ liệu nhân viên đã lưu để xác định danh tính. |

## Tech Stack

| Layer | Công nghệ | Vai trò |
|---|---|---|
| API Service | FastAPI, SQLAlchemy, Alembic, Pydantic, Uvicorn, HTTPX | REST API, nghiệp vụ điểm danh, quản lý nhân viên/ca làm, enrollment. |
| Inference Service | FastAPI, PyTorch (CUDA), ONNX Runtime (GPU), OpenCV | Chạy pipeline nhận diện, trích xuất embedding, anti-spoofing. |
| AI Models | RetinaFace, ArcFace, InsightFace, Silent-Face-Anti-Spoofing | Face detection, alignment, embedding extraction, liveness detection. |
| Database | PostgreSQL 16, Qdrant (Vector DB), Redis 7 | Lưu nghiệp vụ HR, vector embedding, cooldown/cache. |
| Frontend | React 19, TypeScript, Vite, TanStack Query, Zustand | Web Dashboard quản trị và Attendance Display. |
| Infra | Docker Compose, NVIDIA Container Runtime | Chạy local multi-service, GPU cho inference. |

## Project Structure

```text
Face-Recognition-Attendance-System/
├── api-service/                    # API Service nghiệp vụ (port 8000)
│   ├── src/
│   │   ├── api/                    # Các module: auth, staff, shifts, attendance, face profiles
│   │   ├── core/                   # Cấu hình, database, cache, middleware, bootstrap admin
│   │   └── utils/                  # Tiện ích dùng chung
│   ├── alembic/                    # Script migration cơ sở dữ liệu
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── attendance-service/             # Inference Service: AI pipeline (port 8001)
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

## Getting Started

### Prerequisites

- Docker & Docker Compose.
- NVIDIA GPU + Driver + NVIDIA Container Runtime nếu muốn chạy `attendance-service` với GPU.
- Python `≥3.10, <3.13` nếu chạy service ở local (không dùng Docker).
- Camera / IP camera / MJPEG stream hoặc dùng fake camera server đi kèm để test.

### Installation

**Bước 1: Clone repository**

```bash
git clone https://github.com/PhucNguyenThanh04/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System
```

**Bước 2: Cấu hình biến môi trường**

Tạo file `.env` cho từng service dựa trên file mẫu:

```bash
cp api-service/.env.example api-service/.env
cp attendance-service/.env.example attendance-service/.env
```

> [!TIP]
> Xem `docker-compose.yml` để biết đầy đủ danh sách biến môi trường có thể cấu hình.

**Bước 3: Build và khởi chạy toàn bộ service**

```bash
docker compose up --build -d
```

Lệnh này chạy PostgreSQL, Redis, Qdrant, `api-service` và `attendance-service`.

**Bước 4: Chạy database migration**

```bash
docker compose exec api-service alembic upgrade head
```

**Bước 5: Tạo tài khoản admin**

API Service có thể tự động tạo tài khoản admin khi khởi động. Cấu hình các biến sau trong `api-service/.env` trước khi chạy:

```env
BOOTSTRAP_ADMIN_ENABLED=True
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=Admin12345
BOOTSTRAP_ADMIN_FULL_NAME=System Administrator
```

**Bước 6: Test với fake camera stream** *(tùy chọn)*

```bash
python tool/fake_camera_server.py
```

Sau đó cấu hình `STREAM_URL` cho `attendance-service` trỏ tới stream:

```env
STREAM_URL=http://host.docker.internal:8080/stream
```

**Bước 7: Kiểm tra trạng thái service**

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Ports

| Service | Host port | Container port | Mô tả |
|---|---:|---:|---|
| PostgreSQL | `5433` | `5432` | Database nghiệp vụ. |
| Redis | `6379` | `6379` | Cooldown, cache. |
| Qdrant HTTP | `6333` | `6333` | Vector database HTTP API. |
| API Service | `8000` | `8000` | API nghiệp vụ & Web Dashboard. |
| Attendance Service | `8001` | `8001` | AI inference & nhận diện real-time. |

## Acknowledgements

- **Liveness Detection** — Sử dụng model [Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) của Minivision AI, phát hành theo Apache License 2.0. Model được dùng nguyên bản để phát hiện giả mạo khuôn mặt (ảnh in, màn hình điện thoại, mặt nạ) trước bước nhận diện.
