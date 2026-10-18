# WeedGuard AI — Deployment & Setup Guide

**WeedGuard AI** is an AI-based weed detection and precision spraying robot dashboard in agriculture. It combines a **FastAPI + Ultralytics YOLO** computer vision backend with a modern **React + Vite** operator dashboard.

---

## 1. Architecture Overview

```text
┌─────────────────────────────────┐        HTTP / JSON         ┌─────────────────────────────────┐
│     React + Vite Frontend       │ ─────────────────────────> │        FastAPI Backend          │
│    (Port 5173 / Production)     │ <───────────────────────── │    (Port 8000 / Production)     │
└─────────────────────────────────┘   /predict, /health, /     └────────────────┬────────────────┘
                 │                                                              │ Loads weights
                 │                                                              ▼
    Local Storage Persistence                                    ┌───────────────────────────────┐
    (Detection History & Logs)                                   │    Trained YOLO Model         │
                                                                 │         (best.pt)             │
                                                                 └───────────────────────────────┘
```

---

## 2. Environment Variables Configuration

Neither `.env` file contains hardcoded secrets, but both should be configured appropriately for your environment.

### Backend (`backend/.env`)
Create `backend/.env` (a template is provided in `backend/.env.example`):

```ini
# Path to your trained YOLO model file
# Local Windows default:
MODEL_PATH=C:\Users\sanaj\WeedDetectionProject\runs\detect\train-2\weights\best.pt

# Production / Docker relative path:
# MODEL_PATH=./models/best.pt

HOST=0.0.0.0
PORT=8000

# Allowed CORS origins (* for development, or your production frontend domain)
CORS_ORIGINS=*
```

### Frontend (`frontend-react/.env`)
Create `frontend-react/.env` (a template is provided in `frontend-react/.env.example`):

```ini
# Address of the running FastAPI server
# Local development:
VITE_API_URL=http://127.0.0.1:8000

# Cloud production example:
# VITE_API_URL=https://weedguard-api.onrender.com
```

> **Note:** The React frontend also includes an in-app **Settings** page where the backend API URL can be dynamically updated and tested live in the browser without rebuilding.

---

## 3. Running Locally

### Step A: Start the FastAPI Backend
Using your established Python virtual environment:

```powershell
# Open terminal in project root
& "C:\Users\sanaj\WeedDetectionProject\.venv\Scripts\python.exe" -m uvicorn app:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Verify backend health in your browser:
- Health check: `http://127.0.0.1:8000/health`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### Step B: Start the React Frontend
In a second terminal:

```powershell
cd frontend-react
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 4. Production Cloud Deployment

### A. Deploying the Backend (e.g. Render, Railway, or Fly.io)

1. **Model Weights:** Copy your trained `best.pt` into `backend/models/best.pt` (the file is only ~5.5 MB, making it git-friendly or easy to bundle).
2. **Resource Requirements:**
   - **RAM:** Minimum 512 MB, recommended 1 GB for smooth PyTorch CPU inference.
   - **CPU:** Standard 1-core vCPU processes an image in ~80–200 ms.
3. **Environment Settings on Cloud Host:**
   - `MODEL_PATH`: `./models/best.pt`
   - `PORT`: `$PORT` (Render/Railway automatically assigns this)
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app` (your frontend domain)
4. **Using Docker:**
   Use the provided `backend/Dockerfile`, which automatically installs CPU-optimized PyTorch and all OpenCV system libraries.

### B. Deploying the Frontend (e.g. Vercel, Netlify)

1. Connect your repository to Vercel or Netlify.
2. Configure build settings:
   - **Root Directory:** `frontend-react`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com`
4. The included `frontend-react/vercel.json` automatically configures Single Page Application rewrites.

---

## 5. Edge / Field Robot Deployment (Raspberry Pi / Jetson)

For mounting on the actual physical rover:

1. **Edge Computer:** Raspberry Pi 4/5 (4GB RAM) or NVIDIA Jetson Orin Nano.
2. Install Python 3.10+ and PyTorch for ARM64:
   ```bash
   pip install ultralytics fastapi uvicorn
   ```
3. Run the backend as a background `systemd` service on the robot.
4. The dashboard can either:
   - Be hosted on the robot's local WiFi access point (`http://192.168.4.1:8000` / port 5173).
   - Or accessed from a remote farmer tablet connected to the robot's hotspot.

---

## 6. Project Preservation Notes

- Original backup dashboard: `frontend/index.html` (remains untouched).
- Trained YOLO model: `C:\Users\sanaj\WeedDetectionProject\runs\detect\train-2\weights\best.pt` (untouched, loaded safely).
