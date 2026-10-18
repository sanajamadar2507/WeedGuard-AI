import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./pages/Overview";
import WeedDetection from "./pages/WeedDetection";
import HistoryPage from "./pages/History";
import RobotMonitoring from "./pages/RobotMonitoring";
import SettingsPage from "./pages/Settings";
import { checkBackendHealth } from "./services/api";
import { loadHistory, loadSettings } from "./services/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(loadSettings());
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await checkBackendHealth();
      setBackendConnected(res.connected);
      if (res.connected && res.data) {
        setBackendHealth(res.data);
      } else {
        setBackendHealth(null);
      }
    } catch {
      setBackendConnected(false);
      setBackendHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    setHistory(loadHistory());
    fetchHealth();
    // Poll health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRecordSaved = (newRecord) => {
    setHistory(loadHistory());
  };

  const handleHistoryCleared = () => {
    setHistory([]);
  };

  const pageTitles = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "Monitor agricultural plant detections and neural network status.",
    },
    detection: {
      title: "Weed Detection Workspace",
      subtitle: "Upload field imagery and run real-time YOLO object identification.",
    },
    history: {
      title: "Detection History Log",
      subtitle: "Review, filter, and export previous plant and weed analysis sessions.",
    },
    monitoring: {
      title: "Robot & Telemetry Monitoring",
      subtitle: "Inspect camera video streams, relay spraying valves, and rover telemetry.",
    },
    settings: {
      title: "System & API Configuration",
      subtitle: "Manage backend API endpoints, confidence thresholds, and hardware URLs.",
    },
  };

  const currentMeta = pageTitles[activeTab] || pageTitles.overview;

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendConnected={backendConnected}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="main-viewport">
        <Topbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          backendConnected={backendConnected}
          checkingHealth={checkingHealth}
          onRefreshHealth={fetchHealth}
          setMobileOpen={setMobileOpen}
        />

        <div className="tab-render-container">
          {activeTab === "overview" && (
            <Overview
              onNavigateToDetection={() => setActiveTab("detection")}
              history={history}
              backendHealth={backendHealth}
              backendConnected={backendConnected}
            />
          )}

          {activeTab === "detection" && (
            <WeedDetection
              onRecordSaved={handleRecordSaved}
              backendConnected={backendConnected}
              defaultConfidence={settings.minConfidence || 0.25}
            />
          )}

          {activeTab === "history" && (
            <HistoryPage
              history={history}
              onHistoryCleared={handleHistoryCleared}
            />
          )}

          {activeTab === "monitoring" && <RobotMonitoring />}

          {activeTab === "settings" && (
            <SettingsPage
              backendHealth={backendHealth}
              backendConnected={backendConnected}
              onRefreshHealth={fetchHealth}
              onSettingsUpdated={(next) => setSettings(next)}
            />
          )}
        </div>

        <footer className="app-footer">
          WEEDGUARD AI · AI-BASED WEED DETECTION AND SPRAYING ROBOT IN AGRICULTURE · STUDENT PROJECT
        </footer>
      </main>
    </div>
  );
}
