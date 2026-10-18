import os
import shutil
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

# Attempt to load .env file if available
def load_env_file():
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        if key not in os.environ:
                            os.environ[key] = val
        except Exception:
            pass

load_env_file()

app = FastAPI(
    title="WeedGuard AI - Weed Detection API",
    description="FastAPI service for Crop and Weed Detection using YOLO",
    version="1.0.0"
)

# Configure CORS dynamically
cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
if cors_origins_raw == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in cors_origins_raw.split(",") if orig.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurable MODEL_PATH with fallback to user's local trained weights
DEFAULT_MODEL_PATH = r"C:\Users\sanaj\WeedDetectionProject\runs\detect\train-2\weights\best.pt"
MODEL_PATH = Path(os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH))

model = None


@app.on_event("startup")
def load_model():
    global model
    if not MODEL_PATH.exists():
        print(f"Warning: Model file not found at {MODEL_PATH}")
        return

    try:
        model = YOLO(str(MODEL_PATH))
        print(f"Successfully loaded YOLO model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")


@app.get("/")
def home():
    return {
        "name": "WeedGuard AI API",
        "message": "Weed Detection API is running",
        "status": "online",
        "model_loaded": model is not None,
    }


@app.get("/health")
def health_check():
    is_loaded = model is not None
    classes = model.names if is_loaded and hasattr(model, "names") else {0: "crop", 1: "weed"}
    device = getattr(model, "device", "unknown") if is_loaded else "not_loaded"

    return {
        "status": "healthy" if is_loaded else "degraded",
        "model_loaded": is_loaded,
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
        "device": str(device),
        "classes": classes,
        "version": "1.0.0",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model
    if model is None:
        if MODEL_PATH.exists():
            try:
                model = YOLO(str(MODEL_PATH))
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")
        else:
            raise HTTPException(status_code=500, detail=f"Model not found at {MODEL_PATH}")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    temp_path = None

    try:
        suffix = Path(file.filename or "image.jpg").suffix or ".jpg"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp:
            temp_path = temp.name
            shutil.copyfileobj(file.file, temp)

        results = model.predict(source=temp_path, verbose=False)
        detections = []

        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                detections.append({
                    "class": result.names[class_id],
                    "confidence": round(float(box.conf[0].item()), 3),
                    "box": [
                        round(float(value), 1)
                        for value in box.xyxy[0].tolist()
                    ],
                })

        return {
            "filename": file.filename,
            "total_detections": len(detections),
            "detections": detections,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    finally:
        if temp_path and Path(temp_path).exists():
            try:
                Path(temp_path).unlink()
            except Exception:
                pass
        await file.close()


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host=host, port=port, reload=True)
