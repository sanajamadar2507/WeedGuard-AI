import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Server,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Sliders,
  RotateCcw,
  Info,
} from "lucide-react";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  checkBackendHealth,
} from "../services/api";
import { loadSettings, saveSettings } from "../services/storage";

export default function SettingsPage({
  backendHealth,
  backendConnected,
  onRefreshHealth,
  onSettingsUpdated,
}) {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [settings, setSettingsState] = useState(loadSettings());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await checkBackendHealth();
      setTestResult(res);
      if (onRefreshHealth) onRefreshHealth();
    } catch (err) {
      setTestResult({ connected: false, error: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveApiUrl = () => {
    setApiBaseUrl(apiUrl);
    setSaveMessage("API configuration saved. Connecting...");
    setTimeout(() => {
      setSaveMessage("");
      handleTestConnection();
    }, 800);
  };

  const handleResetApiUrl = () => {
    const defaultUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    setApiUrlState(defaultUrl);
    setApiBaseUrl(defaultUrl);
    setSaveMessage("Reset to environment default.");
    setTimeout(() => {
      setSaveMessage("");
      handleTestConnection();
    }, 800);
  };

  const handleUpdateSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    setSettingsState(next);
    saveSettings(next);
    if (onSettingsUpdated) onSettingsUpdated(next);
  };

  return (
    <div className="page-content">
      {/* Backend API Configuration */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>FastAPI Backend Connection</h3>
            <small>COMMUNICATION ENDPOINT</small>
          </div>
          <span
            className={`badge ${
              backendConnected ? "badge-success" : "badge-danger"
            }`}
          >
            {backendConnected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <p className="setting-description">
          Configure the base URL of your WeedGuard AI FastAPI server. For local testing, this is usually <code>http://127.0.0.1:8000</code>. For production deployments (e.g. Render, Railway, or VPS), enter your public backend URL.
        </p>

        <div className="form-group">
          <label className="form-label">
            <Globe size={16} />
            <span>Backend API Base URL (VITE_API_URL):</span>
          </label>
          <div className="input-group">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              className="text-input"
              placeholder="http://127.0.0.1:8000"
            />
            <button
              className="button button-primary button-sm"
              onClick={handleSaveApiUrl}
            >
              Save URL
            </button>
            <button
              className="button button-secondary button-sm"
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              <RefreshCw
                size={14}
                className={testingConnection ? "animate-spin" : ""}
              />
              <span>Test Connection</span>
            </button>
            <button
              className="button button-ghost button-sm"
              onClick={handleResetApiUrl}
              title="Reset to default environment URL"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {saveMessage && (
            <div className="status-callout info" style={{ marginTop: "10px" }}>
              <span>{saveMessage}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`status-callout ${
                testResult.connected ? "success" : "error"
              }`}
              style={{ marginTop: "10px" }}
            >
              {testResult.connected ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>
                    Successfully reached API! Model is{" "}
                    <strong>
                      {testResult.data?.model_loaded ? "Loaded" : "Not Loaded"}
                    </strong>
                    . Device: {testResult.data?.device || "cpu"}.
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>
                    Connection failed: {testResult.error || "Unable to reach server."} Check that uvicorn is running.
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Live Backend Telemetry Details */}
        {backendConnected && backendHealth && (
          <div className="backend-info-box">
            <h4>Live Model Metadata from Server</h4>
            <div className="info-list">
              <div className="info-item">
                <span className="info-title">Model Path</span>
                <code className="info-detail">{backendHealth.model_path || "Configured"}</code>
              </div>
              <div className="info-item">
                <span className="info-title">Model File Exists</span>
                <span className="badge badge-success">
                  {backendHealth.model_exists ? "Verified" : "Missing"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-title">Compute Device</span>
                <span className="info-detail font-bold">
                  {(backendHealth.device || "cpu").toUpperCase()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-title">Classes Recognized</span>
                <span className="info-detail">
                  {JSON.stringify(backendHealth.classes || { 0: "crop", 1: "weed" })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detection Preferences */}
      <div className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-header">
          <div>
            <h3>Detection & Visual Preferences</h3>
            <small>USER EXPERIENCE TUNING</small>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Sliders size={16} />
            <span>Default Confidence Threshold: {(settings.minConfidence * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={settings.minConfidence}
            onChange={(e) =>
              handleUpdateSetting("minConfidence", parseFloat(e.target.value))
            }
            className="slider"
          />
          <small className="help-text">
            Predictions below this threshold will be hidden by default on the detection page.
          </small>
        </div>
      </div>

      {/* Quick Deployment Guide */}
      <div className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-header">
          <div>
            <h3>Deployment Quick Reference</h3>
            <small>STEP-BY-STEP SETUP</small>
          </div>
          <Info size={18} className="text-muted" />
        </div>

        <div className="deploy-guide-steps">
          <div className="guide-step">
            <strong>1. Start FastAPI Backend Locally:</strong>
            <code>
              & "C:\Users\sanaj\WeedDetectionProject\.venv\Scripts\python.exe" -m uvicorn app:app --app-dir backend --port 8000 --reload
            </code>
          </div>
          <div className="guide-step">
            <strong>2. Run React Frontend Locally:</strong>
            <code>
              npm run dev --prefix frontend-react
            </code>
          </div>
          <div className="guide-step">
            <strong>3. Build Frontend for Production:</strong>
            <code>
              npm run build --prefix frontend-react
            </code>
            <p>The output <code>frontend-react/dist</code> folder can be hosted on Vercel, Netlify, or served by FastAPI static files.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
