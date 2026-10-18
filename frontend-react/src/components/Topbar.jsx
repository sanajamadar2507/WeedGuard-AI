import React from "react";
import { Menu, Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function Topbar({
  title,
  subtitle,
  backendConnected,
  checkingHealth,
  onRefreshHealth,
  setMobileOpen,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
        <div>
          <div className="eyebrow">INTELLIGENT FARMING PLATFORM</div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <div
          className={`status-pill ${backendConnected ? "connected" : "disconnected"}`}
          title={backendConnected ? "Backend API is online" : "Backend API unreachable"}
        >
          {backendConnected ? (
            <>
              <span className="pulse-dot online" />
              <Wifi size={14} />
              <span>API Online</span>
            </>
          ) : (
            <>
              <span className="pulse-dot offline" />
              <WifiOff size={14} />
              <span>API Offline</span>
            </>
          )}
        </div>

        <button
          className="icon-button"
          onClick={onRefreshHealth}
          title="Refresh backend status"
          disabled={checkingHealth}
        >
          <RefreshCw
            size={16}
            className={checkingHealth ? "animate-spin" : ""}
          />
        </button>
      </div>
    </header>
  );
}
