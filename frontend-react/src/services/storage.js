/**
 * Storage & Export Service for WeedGuard AI
 */

const HISTORY_KEY = "weedGuardDetectionHistory";
const SETTINGS_KEY = "weedguard_settings";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse history from localStorage", err);
    return [];
  }
}

export function saveDetectionRecord({ filename, detections, imagePreviewUrl }) {
  const history = loadHistory();
  const weeds = detections.filter(
    (d) => d.class && d.class.toLowerCase() === "weed"
  ).length;
  const crops = detections.filter(
    (d) => d.class && d.class.toLowerCase() === "crop"
  ).length;

  const record = {
    id: "scan_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    filename: filename || "image.jpg",
    date: new Date().toISOString(),
    weeds,
    crops,
    total: detections.length,
    confidences: detections.map((d) => Number(d.confidence) * 100),
    detections: detections.map((d) => ({
      class: d.class,
      confidence: Number(d.confidence),
      box: d.box,
    })),
  };

  history.unshift(record);
  // Keep up to 100 records
  const trimmed = history.slice(0, 100);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Storage quota exceeded or unavailable", err);
  }
  return record;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function exportHistoryAsJSON() {
  const history = loadHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weedguard_history_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportHistoryAsCSV() {
  const history = loadHistory();
  if (history.length === 0) return;

  const headers = [
    "ID",
    "Filename",
    "Timestamp",
    "Total Detections",
    "Weeds Count",
    "Crops Count",
    "Mean Confidence (%)",
    "Detected Classes",
  ];

  const rows = history.map((rec) => {
    const meanConf = rec.confidences && rec.confidences.length
      ? (rec.confidences.reduce((a, b) => a + b, 0) / rec.confidences.length).toFixed(1)
      : "0.0";
    const classes = rec.detections
      ? rec.detections.map((d) => `${d.class} (${(d.confidence * 100).toFixed(0)}%)`).join("; ")
      : "";

    return [
      rec.id,
      `"${rec.filename.replace(/"/g, '""')}"`,
      `"${rec.date}"`,
      rec.total,
      rec.weeds,
      rec.crops,
      meanConf,
      `"${classes.replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weedguard_history_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadSettings() {
  const defaultSettings = {
    minConfidence: 0.25,
    cameraStreamUrl: "http://192.168.4.1:81/stream",
    autoSaveHistory: true,
    safetySprayingArmed: false,
    showBoxes: true,
  };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
