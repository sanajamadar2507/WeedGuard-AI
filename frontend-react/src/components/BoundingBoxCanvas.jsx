import React, { useRef, useEffect, useState } from "react";

export default function BoundingBoxCanvas({
  imageUrl,
  detections = [],
  minConfidence = 0.0,
  showBoxes = true,
  onImageLoaded,
}) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.complete || !img.naturalWidth) return;

    const width = img.clientWidth;
    const height = img.clientHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    if (!showBoxes || !detections || detections.length === 0) return;

    const scaleX = width / img.naturalWidth;
    const scaleY = height / img.naturalHeight;

    const filtered = detections.filter(
      (item) => (Number(item.confidence) || 0) >= minConfidence
    );

    filtered.forEach((item) => {
      if (!Array.isArray(item.box) || item.box.length !== 4) return;
      const [x1, y1, x2, y2] = item.box.map(Number);
      if (![x1, y1, x2, y2].every(Number.isFinite)) return;

      const isWeed = item.class && item.class.toLowerCase() === "weed";
      const color = isWeed ? "#ef4444" : "#10b981";
      const fillColor = isWeed ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)";

      const x = x1 * scaleX;
      const y = y1 * scaleY;
      const boxWidth = (x2 - x1) * scaleX;
      const boxHeight = (y2 - y1) * scaleY;

      if (boxWidth <= 0 || boxHeight <= 0) return;

      // Draw box fill
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, boxWidth, boxHeight);

      // Draw box outline
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      // Label background & text
      const confPct = ((Number(item.confidence) || 0) * 100).toFixed(1);
      const label = `${item.class || "object"} ${confPct}%`;

      ctx.font = "bold 12px Inter, system-ui, sans-serif";
      const labelWidth = ctx.measureText(label).width + 12;
      const labelHeight = 22;
      const labelY = Math.max(0, y - labelHeight);

      ctx.fillStyle = color;
      ctx.fillRect(x, labelY, labelWidth, labelHeight);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x + 6, labelY + 15);
    });
  };

  useEffect(() => {
    drawBoxes();
  }, [imageUrl, detections, minConfidence, showBoxes, imageLoaded]);

  useEffect(() => {
    const handleResize = () => {
      drawBoxes();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [detections, minConfidence, showBoxes]);

  return (
    <div className="canvas-stage-wrapper" ref={containerRef}>
      <div className="canvas-stage">
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Detection preview"
          className="canvas-image"
          onLoad={() => {
            setImageLoaded(true);
            if (onImageLoaded) onImageLoaded();
            drawBoxes();
          }}
        />
        <canvas ref={canvasRef} className="canvas-overlay" />
      </div>
    </div>
  );
}
