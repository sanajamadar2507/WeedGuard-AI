import React, { useState, useEffect } from "react";
import {
  Camera,
  Droplet,
  Battery,
  Wifi,
  ShieldAlert,
  ShieldCheck,
  Play,
  Square,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function RobotMonitoring() {
  const [streamUrl, setStreamUrl] = useState("http://192.168.4.1:81/stream");
  const [simulatingCamera, setSimulatingCamera] = useState(false);
  const [safetyUnlocked, setSafetyUnlocked] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [tankLevel, setTankLevel] = useState(78);
  const [batteryVoltage, setBatteryVoltage] = useState(12.4);

  // Auto-lock pulse after 1.5 seconds for safety simulation
  useEffect(() => {
    let timer;
    if (pulseActive) {
      timer = setTimeout(() => {
        setPulseActive(false);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [pulseActive]);

  const triggerSimulatedSpray = () => {
    if (!safetyUnlocked) return;
    setPulseActive(true);
    setTankLevel((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="page-content">
      {/* Prominent Hardware Disclaimer Banner */}
      <div className="hardware-warning-banner">
        <ShieldAlert size={22} className="warning-banner-icon" />
        <div className="warning-banner-text">
          <strong>Hardware Integration Notice (Simulation Mode):</strong>
          <span>
            {" "}Physical robotic hardware (ESP32-CAM video stream, 12V solenoid valves, and motor drivers) is currently not attached. Below controls are safe telemetric simulations designed for testing user-interface workflows.
          </span>
        </div>
      </div>

      {/* Grid: Camera Stream & Spraying System */}
      <div className="grid-2-col">
        {/* ESP32-CAM Section */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>ESP32-CAM Video Stream</h3>
              <small>HARDWARE VIDEO FEED</small>
            </div>
            <span
              className={`badge ${
                simulatingCamera ? "badge-warning" : "badge-neutral"
              }`}
            >
              {simulatingCamera ? "Simulated Stream" : "Disconnected"}
            </span>
          </div>

          <div className="camera-viewport">
            {simulatingCamera ? (
              <div className="simulated-feed">
                <div className="sim-scanline" />
                <div className="sim-crosshair" />
                <div className="sim-hud">
                  <span>REC [SIM] · 30 FPS</span>
                  <span>TARGET: CROP ROW #3</span>
                </div>
                <div className="sim-weed-box">
                  <span className="sim-box-label">WEED TARGET 89%</span>
                </div>
              </div>
            ) : (
              <div className="camera-offline-placeholder">
                <Camera size={44} className="camera-icon-muted" />
                <h4>Camera Hardware Disconnected</h4>
                <p>
                  Attach an ESP32-CAM or USB web camera to stream live field footage directly to the YOLO detection pipeline.
                </p>
                <button
                  className="button button-secondary button-sm"
                  onClick={() => setSimulatingCamera(true)}
                >
                  <Play size={14} />
                  <span>Preview Simulated Camera Feed</span>
                </button>
              </div>
            )}
          </div>

          {simulatingCamera && (
            <div className="stream-action-bar">
              <button
                className="button button-ghost button-sm"
                onClick={() => setSimulatingCamera(false)}
              >
                <Square size={14} />
                <span>Stop Simulated Feed</span>
              </button>
            </div>
          )}

          <div className="stream-config-row">
            <label className="stream-config-label">Camera Stream IP/URL:</label>
            <input
              type="text"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="text-input"
              placeholder="http://192.168.x.x:81/stream"
            />
          </div>
        </div>

        {/* Precision Spraying Actuators */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Spraying Subsystem (Relays)</h3>
              <small>TARGETED HERBICIDE NOZZLES</small>
            </div>
            <span
              className={`badge ${
                safetyUnlocked ? "badge-danger" : "badge-success"
              }`}
            >
              {safetyUnlocked ? "ARMED (TEST MODE)" : "DISARMED (SAFE)"}
            </span>
          </div>

          {/* Safety Interlock Control */}
          <div className="interlock-card">
            <div className="interlock-info">
              {safetyUnlocked ? (
                <AlertTriangle size={24} className="text-danger" />
              ) : (
                <ShieldCheck size={24} className="text-success" />
              )}
              <div>
                <strong>Master Safety Interlock</strong>
                <p>
                  {safetyUnlocked
                    ? "CAUTION: Actuators armed for simulated test pulse."
                    : "LOCKED: Solenoid triggers prevented. Autonomous spraying disabled."}
                </p>
              </div>
            </div>
            <button
              className={`button button-sm ${
                safetyUnlocked ? "button-danger" : "button-secondary"
              }`}
              onClick={() => {
                setSafetyUnlocked(!safetyUnlocked);
                setPulseActive(false);
              }}
            >
              {safetyUnlocked ? "Disarm & Lock" : "Unlock Safety"}
            </button>
          </div>

          {/* Spray Nozzles Grid */}
          <div className="nozzle-grid">
            <div
              className={`nozzle-card ${
                pulseActive ? "is-pulsing" : ""
              }`}
            >
              <div className="nozzle-title">
                <Droplet size={18} />
                <span>Nozzle #1 (Left Row)</span>
              </div>
              <div className="nozzle-status">
                {pulseActive ? (
                  <span className="text-success font-bold">PULSING (1.5s)</span>
                ) : (
                  <span className="text-muted">Standby (0 PSI)</span>
                )}
              </div>
            </div>

            <div
              className={`nozzle-card ${
                pulseActive ? "is-pulsing" : ""
              }`}
            >
              <div className="nozzle-title">
                <Droplet size={18} />
                <span>Nozzle #2 (Right Row)</span>
              </div>
              <div className="nozzle-status">
                {pulseActive ? (
                  <span className="text-success font-bold">PULSING (1.5s)</span>
                ) : (
                  <span className="text-muted">Standby (0 PSI)</span>
                )}
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="spray-actions">
            <button
              className="button button-danger"
              disabled={!safetyUnlocked || pulseActive}
              onClick={triggerSimulatedSpray}
            >
              <Droplet size={16} />
              <span>
                {pulseActive
                  ? "Pulsing Spray Actuator..."
                  : safetyUnlocked
                  ? "Trigger 1-Sec Test Spray Pulse"
                  : "Unlock Safety Interlock to Test"}
              </span>
            </button>
          </div>

          {/* Tank Capacity Gauge */}
          <div className="tank-gauge-section">
            <div className="tank-gauge-header">
              <span>Herbicide Tank Reservoir:</span>
              <strong>{tankLevel}% Capacity</strong>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill fill-crop"
                style={{ width: `${tankLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rover Navigation & Telemetry Stubs */}
      <div className="panel telemetry-panel">
        <div className="panel-header">
          <div>
            <h3>Robot Rover Telemetry (Stubs)</h3>
            <small>CHASSIS & POWER MONITORING</small>
          </div>
          <span className="badge badge-neutral">Standby</span>
        </div>

        <div className="telemetry-grid">
          <div className="telemetry-item">
            <div className="telemetry-label">
              <Battery size={16} />
              <span>Battery Pack</span>
            </div>
            <div className="telemetry-value">{batteryVoltage} V</div>
            <small className="telemetry-sub">3S LiPo Nominal</small>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">
              <Wifi size={16} />
              <span>Telemetry Link</span>
            </div>
            <div className="telemetry-value">98% RSSI</div>
            <small className="telemetry-sub">2.4 GHz WiFi (Sim)</small>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">
              <Radio size={16} />
              <span>Motor Drivers</span>
            </div>
            <div className="telemetry-value">L298N / Dual H-Bridge</div>
            <small className="telemetry-sub">Speed: 0 cm/s (Stationary)</small>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-label">
              <Sliders size={16} />
              <span>Field Coverage</span>
            </div>
            <div className="telemetry-value">0.00 ha</div>
            <small className="telemetry-sub">Awaiting mission dispatch</small>
          </div>
        </div>
      </div>
    </div>
  );
}
