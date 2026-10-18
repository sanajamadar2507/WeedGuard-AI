import React from "react";
import {
  Sparkles,
  Leaf,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot,
  Camera,
  Cpu,
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function Overview({
  onNavigateToDetection,
  history = [],
  backendHealth,
  backendConnected,
}) {
  // Aggregate stats from history
  const totalScans = history.length;
  const totalWeeds = history.reduce((sum, item) => sum + (item.weeds || 0), 0);
  const totalCrops = history.reduce((sum, item) => sum + (item.crops || 0), 0);

  return (
    <div className="page-content">
      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={14} className="hero-tag-icon" />
            <span>AI-POWERED PRECISION AGRICULTURE</span>
          </div>
          <h2>
            Smarter fields.<br />
            Healthier crops.
          </h2>
          <p>
            Automated weed identification and precision targeting using your custom-trained YOLO neural network. Reduce chemical usage and protect crop yields.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={onNavigateToDetection}
            >
              <span>Start Detection Workspace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-symbol-wrapper">
          <div className="hero-symbol">🌱</div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Scans Logged"
          value={totalScans > 0 ? totalScans : "0"}
          note={totalScans > 0 ? `${totalScans} analysis sessions recorded` : "Upload an image to start"}
          icon={Leaf}
          color="default"
        />
        <StatCard
          label="Weeds Detected"
          value={totalWeeds > 0 ? totalWeeds : "0"}
          note="Identified unwanted vegetation"
          icon={Flame}
          color="weed"
        />
        <StatCard
          label="Crops Protected"
          value={totalCrops > 0 ? totalCrops : "0"}
          note="Preserved healthy crops"
          icon={CheckCircle2}
          color="crop"
        />
        <StatCard
          label="AI Model Engine"
          value={backendConnected ? "Active" : "Offline"}
          note={
            backendConnected
              ? backendHealth?.device
                ? `YOLO · Device: ${backendHealth.device.toUpperCase()}`
                : "YOLO best.pt ready"
              : "Check FastAPI server connection"
          }
          icon={Cpu}
          color={backendConnected ? "success" : "danger"}
        />
      </div>

      {/* Two-Column Status Breakdown */}
      <div className="grid-2-col">
        {/* Software Subsystems */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Software & AI Services</h3>
              <small>CORE DETECTION PIPELINE</small>
            </div>
            <span className="badge badge-success">Operational</span>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-title">YOLO Detection Model</span>
              <span className="badge badge-success">
                {backendConnected ? "Weights Loaded (best.pt)" : "Backend Disconnected"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-title">Target Classes</span>
              <span className="info-detail">crop (0), weed (1)</span>
            </div>
            <div className="info-item">
              <span className="info-title">Inference Engine</span>
              <span className="info-detail">Ultralytics PyTorch Pipeline</span>
            </div>
            <div className="info-item">
              <span className="info-title">Local Storage History</span>
              <span className="info-detail">{history.length} records cached</span>
            </div>
          </div>
        </div>

        {/* Hardware Status */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Hardware Subsystems</h3>
              <small>PHYSICAL ROBOT ACTUATION</small>
            </div>
            <span className="badge badge-warning">Simulated / Stubs</span>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-title">ESP32-CAM Stream</span>
              <span className="badge badge-neutral">Integration Pending</span>
            </div>
            <div className="info-item">
              <span className="info-title">Precision Spray Valves</span>
              <span className="badge badge-neutral">Hardware Disconnected</span>
            </div>
            <div className="info-item">
              <span className="info-title">Herbicide Tank Telemetry</span>
              <span className="badge badge-neutral">Sensor Stubs Active</span>
            </div>
            <div className="info-item">
              <span className="info-title">Autonomous Spray Interlock</span>
              <span className="badge badge-danger">LOCKED (Safety Disabled)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="notice-banner">
        <ShieldCheck size={20} className="notice-icon" />
        <div className="notice-text">
          <strong>Safety & Operational Note:</strong> WeedGuard AI currently executes computer vision detection on uploaded field images. Physical spraying actuators and autonomous rover mobility require strict hardware safety interlocks and manual field operator verification before triggering any herbicide dispersal.
        </div>
      </div>
    </div>
  );
}
