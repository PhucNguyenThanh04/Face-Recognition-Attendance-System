<div align="center">

# 🎯 Face Recognition Attendance System

**Automated attendance tracking powered by real-time face recognition, anti-spoofing, and vector search.**

[![Python](https://img.shields.io/badge/Python-≥3.10-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo Video](https://youtu.be/BtBY9D3Kr-I) · [Architecture](#-system-architecture) · [Getting Started](#-getting-started) · [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Demo](#-demo)
- [System Architecture](#-system-architecture)
- [Face Recognition Pipeline](#-face-recognition-pipeline)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Acknowledgements](#-acknowledgements)

---

## 🔍 Overview

Face Recognition Attendance System is an end-to-end, real-time attendance management platform that uses face recognition to identify employees automatically. The **Attendance Service** is the AI core — it captures frames from camera or MJPEG streams, detects faces, performs quality checks, runs anti-spoofing (liveness detection), aligns faces, extracts embeddings, and matches them against a vector database to identify employees.

### Key Highlights

- ⚡ **Real-time processing** — continuous face recognition from live camera streams
- 🛡️ **Anti-spoofing** — liveness detection to prevent photo/video/mask attacks
- 🏗️ **Distributed architecture** — independent AI, API, and frontend services for flexible scaling
- 🐳 **One-command deployment** — fully orchestrated with Docker Compose (GPU-ready)

---

## 🎬 Demo

<div align="center">

📺 **[Watch the full demo on YouTube →](https://youtu.be/BtBY9D3Kr-I)**

</div>

---

## 🏛️ System Architecture

<div align="center">

![System Architecture](./docs/arcitecture.png)

</div>

The system follows a **distributed microservices architecture** with clear separation between business logic and AI processing:

| Service | Responsibility |
|---------|---------------|
| **API Service** | Central orchestrator — handles attendance business logic, employee/shift management, serves the Web Dashboard, and sends enrollment images to the Inference Service |
| **Inference Service** | Dedicated AI engine — face detection, anti-spoofing, embedding extraction, and vector search in Qdrant. Isolated to keep GPU-heavy workloads separate from business logic |
| **Web Dashboard** | Admin interface for managing employees, viewing attendance history, and system monitoring |
| **Attendance Display** | Real-time screen showing recognition results as they happen |

### Data Flow

```
1. Enrollment     → API Service sends employee face images → Inference Service extracts 
                    embeddings → stored in Qdrant

2. Recognition    → Camera streams frames → Inference Service detects & matches faces 
                    → queries Qdrant for nearest match

3. Attendance     → Matched employee ID → API Service records attendance 
                    → Redis cooldown prevents duplicates → PostgreSQL stores the record

4. Display        → Inference Service sends frame + result → Attendance Display (real-time)

5. Dashboard      → API Service serves data → Web Dashboard for admin management
```

---

## 🧠 Face Recognition Pipeline

<div align="center">

![Face Recognition Pipeline](./docs/pipeline.png)

</div>

The Attendance Service processes each camera frame through a multi-stage pipeline:

| Stage | Model / Method | Description |
|-------|---------------|-------------|
| **1. Face Detection** | RetinaFace | Detects faces in the frame; proceeds only when exactly one valid face is found |
| **2. Quality Check** | Heuristic filters | Validates face size, blur level, and head pose angle to discard unreliable frames |
| **3. Liveness Detection** | Silent-Face-Anti-Spoofing | Checks if the face is real (not a printed photo, phone screen, or mask) |
| **4. Face Alignment** | InsightFace `norm_crop` | Normalizes face geometry for consistent embedding extraction |
| **5. Embedding Extraction** | ArcFace | Generates a 512-dimensional feature vector from the aligned face |
| **6. L2 Normalization** | — | Normalizes the embedding vector before comparison |
| **7. Vector Search** | Qdrant | Matches the embedding against stored employee vectors to determine identity |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Backend** | Python · FastAPI · Uvicorn · Pydantic · SQLAlchemy · Alembic · HTTPX |
| **AI / Computer Vision** | PyTorch (CUDA) · ONNX Runtime (GPU) · InsightFace · RetinaFace · ArcFace · Silent-Face-Anti-Spoofing · OpenCV · NumPy · Pillow |
| **Frontend** | React 19 · TypeScript · Vite · TanStack Query · Zustand · React Hook Form · Zod |
| **Database** | PostgreSQL 16 · Qdrant (Vector DB) · Redis 7 |
| **Infrastructure** | Docker · Docker Compose · NVIDIA Container Runtime · Health-check orchestration |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Note |
|-------------|------|
| Docker Engine + Docker Compose | Required |
| Python `≥3.10, <3.13` | Only if running services locally (outside Docker) |
| NVIDIA GPU + Driver + Container Runtime | Required for GPU-accelerated `attendance-service` |
| Camera / MJPEG stream | Or use the included fake camera server for testing |

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/PhucNguyenThanh04/Face-Recognition-Attendance-System.git
cd Face-Recognition-Attendance-System
```

**2. Configure environment variables**

Create `.env` files for each service based on the examples:

```bash
cp api-service/.env.example api-service/.env
cp attendance-service/.env.example attendance-service/.env
```

> [!TIP]
> Review `docker-compose.yml` for the full list of configurable environment variables.

**3. Build and start all services**

```bash
docker compose up --build -d
```

Once running, the services will be available at:

| Service | URL |
|---------|-----|
| API Service | [`http://localhost:8000`](http://localhost:8000) |
| Attendance Service | [`http://localhost:8001`](http://localhost:8001) |
| Qdrant Dashboard | [`http://localhost:6333`](http://localhost:6333) |
| PostgreSQL | `localhost:5433` |
| Redis | `localhost:6379` |

**4. Run database migrations**

```bash
docker compose exec api-service alembic upgrade head
```

**5. Bootstrap the admin account**

The API Service can automatically create an admin user on startup. Set these variables in `api-service/.env` before starting:

```env
BOOTSTRAP_ADMIN_ENABLED=True
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=Admin12345
BOOTSTRAP_ADMIN_FULL_NAME=System Administrator
```

**6. Test with a fake camera stream** *(optional)*

```bash
python tool/fake_camera_server.py
```

Then configure the stream URL for the Attendance Service (when running in Docker):

```env
STREAM_URL=http://host.docker.internal:8080/stream
```

**7. Verify service health**

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
```

---

## 📁 Project Structure

```
Face-Recognition-Attendance-System/
├── api-service/                    # Business logic & REST API
│   ├── src/
│   │   ├── api/                    # Modules: auth, staff, shifts, attendance, face profiles
│   │   ├── core/                   # Config, database, cache, middleware, admin bootstrap
│   │   └── utils/                  # Shared utilities
│   ├── alembic/                    # Database migration scripts
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── attendance-service/             # AI inference & real-time recognition
│   ├── app/
│   │   ├── api/                    # AI service endpoints
│   │   ├── core/
│   │   │   ├── ml/                 # Detector, aligner, embedder, anti-spoofing
│   │   │   ├── pipeline/           # Real-time attendance recognition pipeline
│   │   │   ├── vector_db/          # Qdrant vector search layer
│   │   │   ├── clients/            # API Service integration clients
│   │   │   └── configs/            # Service settings
│   │   └── utils/
│   ├── Silent-Face-Anti-Spoofing/  # Liveness detection model
│   ├── weights/                    # Pre-trained model weights
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pyproject.toml
│
├── web-dashboard/                  # Admin dashboard (React + TypeScript + Vite)
├── visualize-attendance/           # Real-time attendance display screen
├── tool/
│   └── fake_camera_server.py       # Fake MJPEG stream for testing
│
├── docs/
│   ├── arcitecture.png             # System architecture diagram
│   └── pipeline.png                # Face recognition pipeline diagram
│
├── docker-compose.yml              # Main orchestration
├── docker-compose.gpu.yml          # GPU-specific compose override
├── .gitignore
└── README.md
```

---

## 🙏 Acknowledgements

- **Liveness Detection** — Uses the [Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) model by Minivision AI, released under the Apache License 2.0. The model is used as-is for detecting face spoofing attacks (printed photos, phone screens, masks) prior to the recognition step.
