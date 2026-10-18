import React from "react";

export default function StatCard({ label, value, note, icon: Icon, color = "default" }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
