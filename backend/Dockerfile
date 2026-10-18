# WeedGuard AI - FastAPI & YOLO Backend Dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies required by OpenCV and Ultralytics
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only PyTorch to minimize container size and RAM usage
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install project Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY . .

# Copy trained YOLO model to the expected location
RUN mkdir -p /app/models && cp /app/model/best.pt /app/models/best.pt

# Default environment variables
ENV MODEL_PATH=/app/models/best.pt \
    HOST=0.0.0.0 \
    PORT=8000 \
    CORS_ORIGINS=*

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
