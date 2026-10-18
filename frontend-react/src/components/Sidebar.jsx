import React from "react";
import {
  LayoutDashboard,
  Scan,
  History,
  Bot,
  Settings,
  Leaf,
  Activity,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  backendConnected,
  mobileOpen,
  setMobileOpen,
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, section: "WORKSPACE" },
    { id: "detection", label: "Weed Detection", icon: Scan, section: "WORKSPACE" },
    { id: "history", label: "Detection History", icon: History, section: "WORKSPACE" },
    { id: "monitoring", label: "Robot Monitoring", icon: Bot, section: "HARDWARE" },
    { id: "settings", label: "Settings", icon: Settings, section: "SYSTEM" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="logo-badge">
            <Leaf className="logo-icon" size={24} />
          </div>
          <div className="brand-text">
            <h2>WeedGuard AI</h2>
            <small>SMART AGRICULTURE</small>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="nav-container">
          <div className="nav-label">WORKSPACE</div>
          {navItems
            .filter((item) => item.section === "WORKSPACE")
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}

          <div className="nav-label">MONITORING & TELEMETRY</div>
          {navItems
            .filter((item) => item.section === "HARDWARE")
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}

          <div className="nav-label">CONFIGURATION</div>
          {navItems
            .filter((item) => item.section === "SYSTEM")
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-button ${isActive ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}
        </nav>

        <div className="side-bottom">
          <div className="system-card">
            <div className="system-card-header">
              <span
                className={`pulse-dot ${
                  backendConnected ? "online" : "offline"
                }`}
              />
              <strong>AI YOLO Engine</strong>
            </div>
            <p className="system-card-body">
              {backendConnected
                ? "FastAPI backend connected & ready."
                : "Backend offline. Check FastAPI server."}
            </p>
          </div>
          <div className="side-foot">
            WEEDGUARD AI · SMART SPRAYING ROBOT
          </div>
        </div>
      </aside>
    </>
  );
}
