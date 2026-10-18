/**
 * API Service for WeedGuard AI
 * Connects to the FastAPI backend with configurable URL
 */

const STORAGE_KEY_API_URL = "weedguard_api_url";

export function getApiBaseUrl() {
  const saved = localStorage.getItem(STORAGE_KEY_API_URL);
  if (saved && saved.trim()) {
    return saved.trim().replace(/\/+$/, "");
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "http://127.0.0.1:8000";
}

export function setApiBaseUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_API_URL, url.trim().replace(/\/+$/, ""));
  }
}

export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: "GET",
      headers: { "Accept": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      connected: true,
      data,
    };
  } catch (err) {
    // Fallback to checking root endpoint /
    try {
      const fallbackResp = await fetch(`${baseUrl}/`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      if (fallbackResp.ok) {
        const fallbackData = await fallbackResp.json();
        return {
          connected: true,
          data: {
            status: "online",
            model_loaded: fallbackData.model_loaded ?? true,
            model_path: "Configured on server",
            classes: { 0: "crop", 1: "weed" },
          },
        };
      }
    } catch {
      // Both failed
    }
    return {
      connected: false,
      error: err.message || "Failed to connect to backend",
    };
  }
}

export async function predictImage(file) {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/predict`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Prediction request failed");
  }

  return data;
}
