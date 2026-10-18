import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Scan,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  Flame,
  Leaf,
  Layers,
} from "lucide-react";
import BoundingBoxCanvas from "../components/BoundingBoxCanvas";
import { predictImage } from "../services/api";
import { saveDetectionRecord } from "../services/storage";

export default function WeedDetection({
  onRecordSaved,
  backendConnected,
  defaultConfidence = 0.25,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detections, setDetections] = useState([]);
  const [lastFilename, setLastFilename] = useState("");
  const [statusMessage, setStatusMessage] = useState({
    type: "info",
    text: "Select or drop a field plant image to begin.",
  });
  const [minConfidence, setMinConfidence] = useState(defaultConfidence);
  const [showBoxes, setShowBoxes] = useState(true);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        type: "error",
        text: "Please select a valid image file (JPEG, PNG, WEBP).",
      });
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setDetections([]);
    setLastFilename(file.name);
    setStatusMessage({
      type: "info",
      text: `Selected "${file.name}" (${(file.size / 1024).toFixed(0)} KB). Ready for analysis.`,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const runDetection = async () => {
    if (!selectedFile) {
      setStatusMessage({
        type: "error",
        text: "Please select an image first.",
      });
      return;
    }

    setAnalyzing(true);
    setStatusMessage({
      type: "info",
      text: "Running YOLO neural network inference on image...",
    });

    try {
      const result = await predictImage(selectedFile);
      const rawDetections = result.detections || [];
      setDetections(rawDetections);

      // Save to detection history
      const savedRecord = saveDetectionRecord({
        filename: result.filename || selectedFile.name,
        detections: rawDetections,
      });

      if (onRecordSaved) {
        onRecordSaved(savedRecord);
      }

      const weeds = rawDetections.filter(
        (d) => d.class && d.class.toLowerCase() === "weed"
      ).length;
      const crops = rawDetections.filter(
        (d) => d.class && d.class.toLowerCase() === "crop"
      ).length;

      setStatusMessage({
        type: "success",
        text: `Analysis complete: ${rawDetections.length} objects found (${weeds} weeds, ${crops} crops).`,
      });
    } catch (err) {
      console.error("Detection error:", err);
      setStatusMessage({
        type: "error",
        text: `Analysis failed: ${err.message}. Make sure the FastAPI server is running on port 8000.`,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredDetections = detections.filter(
    (d) => (Number(d.confidence) || 0) >= minConfidence
  );

  const weedCount = filteredDetections.filter(
    (d) => d.class && d.class.toLowerCase() === "weed"
  ).length;

  const cropCount = filteredDetections.filter(
    (d) => d.class && d.class.toLowerCase() === "crop"
  ).length;

  return (
    <div className="page-content">
      {/* Workspace Grid */}
      <div className="workspace-layout">
        {/* Left Column: Image Input & Preview */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Image Input & Visualizer</h3>
              <small>LOCAL PLANT UPLOAD</small>
            </div>
            {previewUrl && (
              <button
                className="button button-ghost button-sm"
                onClick={() => setShowBoxes(!showBoxes)}
                title="Toggle bounding boxes"
              >
                {showBoxes ? <Eye size={15} /> : <EyeOff size={15} />}
                <span>{showBoxes ? "Boxes On" : "Boxes Off"}</span>
              </button>
            )}
          </div>

          {/* Upload Dropzone */}
          <div
            className={`dropzone ${previewUrl ? "has-preview" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {previewUrl ? (
              <BoundingBoxCanvas
                imageUrl={previewUrl}
                detections={detections}
                minConfidence={minConfidence}
                showBoxes={showBoxes}
              />
            ) : (
              <div
                className="dropzone-content"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon-circle">
                  <UploadCloud size={28} />
                </div>
                <h4>Upload or Drag a Plant Image</h4>
                <p>Supports JPG, PNG, WEBP from phone, camera, or field drone</p>
                <button
                  type="button"
                  className="button button-secondary button-sm"
                >
                  Choose Image
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </div>

          {/* Interactive Controls Bar */}
          <div className="detection-controls">
            <div className="controls-left">
              <label
                className="button button-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={15} />
                <span>{previewUrl ? "Change Image" : "Select Image"}</span>
              </label>

              <button
                className="button button-primary"
                onClick={runDetection}
                disabled={!selectedFile || analyzing}
              >
                <Scan size={15} className={analyzing ? "animate-spin" : ""} />
                <span>{analyzing ? "Analyzing with YOLO..." : "Analyze Image ↗"}</span>
              </button>
            </div>

            {detections.length > 0 && (
              <div className="confidence-slider-group">
                <div className="slider-label">
                  <Sliders size={14} />
                  <span>Threshold: {(minConfidence * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            )}
          </div>

          {/* Status Message Banner */}
          <div className={`status-callout ${statusMessage.type}`}>
            {statusMessage.type === "error" && <AlertCircle size={16} />}
            {statusMessage.type === "success" && <CheckCircle2 size={16} />}
            {statusMessage.type === "info" && <Layers size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        </div>

        {/* Right Column: Prediction Breakdown */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>AI Detection Results</h3>
              <small>
                {detections.length > 0
                  ? `${filteredDetections.length} OF ${detections.length} DETECTIONS VISIBLE`
                  : "NO SCAN RUN YET"}
              </small>
            </div>
            {detections.length > 0 && (
              <div className="tag-summary">
                <span className="badge badge-weed">{weedCount} Weeds</span>
                <span className="badge badge-crop">{cropCount} Crops</span>
              </div>
            )}
          </div>

          <div className="results-container">
            {filteredDetections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌾</div>
                <h4>{detections.length > 0 ? "No objects match confidence filter" : "No Detection Results Yet"}</h4>
                <p>
                  {detections.length > 0
                    ? `Try lowering the confidence threshold below ${(minConfidence * 100).toFixed(0)}%.`
                    : "Upload an agricultural photo and click 'Analyze Image' to see classified weeds, crops, and bounding boxes."}
                </p>
              </div>
            ) : (
              <div className="detection-list">
                {filteredDetections.map((item, index) => {
                  const isWeed = item.class && item.class.toLowerCase() === "weed";
                  const confPct = ((Number(item.confidence) || 0) * 100).toFixed(1);

                  return (
                    <div
                      key={index}
                      className={`detection-card ${isWeed ? "is-weed" : "is-crop"}`}
                    >
                      <div className="detection-card-top">
                        <div className="detection-name">
                          {isWeed ? (
                            <Flame size={16} className="text-weed" />
                          ) : (
                            <Leaf size={16} className="text-crop" />
                          )}
                          <strong>
                            {item.class ? item.class.toUpperCase() : "OBJECT"} #{index + 1}
                          </strong>
                        </div>
                        <span className="detection-score">{confPct}%</span>
                      </div>

                      <div className="progress-bar-track">
                        <div
                          className={`progress-bar-fill ${isWeed ? "fill-weed" : "fill-crop"}`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>

                      <div className="detection-box-coords">
                        <span>Box (xyxy):</span>{" "}
                        <code>
                          [{(item.box || []).map((n) => Number(n).toFixed(0)).join(", ")}]
                        </code>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel-footer-note">
            Model inferences reflect statistical confidence. Always visually confirm detections before deploying spraying equipment.
          </div>
        </div>
      </div>
    </div>
  );
}
