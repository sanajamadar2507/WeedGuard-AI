import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  Flame,
  Leaf,
  Layers,
  FileSpreadsheet,
  FileJson,
  AlertTriangle,
} from "lucide-react";
import {
  exportHistoryAsCSV,
  exportHistoryAsJSON,
  clearHistory,
} from "../services/storage";

export default function History({ history = [], onHistoryCleared }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filteredHistory = history.filter((item) => {
    // Search match
    const filenameMatch = item.filename
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const dateMatch = new Date(item.date)
      .toLocaleString()
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSearch = filenameMatch || dateMatch;

    if (!matchesSearch) return false;

    // Filter type match
    if (filterType === "weeds") return (item.weeds || 0) > 0;
    if (filterType === "crops") return (item.crops || 0) > 0;
    if (filterType === "clean") return (item.total || 0) === 0;
    return true;
  });

  const handleClear = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all saved detection history? This action cannot be undone."
      )
    ) {
      clearHistory();
      if (onHistoryCleared) {
        onHistoryCleared();
      }
    }
  };

  return (
    <div className="page-content">
      {/* Top Filter & Actions Header */}
      <div className="panel history-toolbar-panel">
        <div className="history-search-row">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search history by image name or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="history-filters">
            <div className="select-wrapper">
              <Filter size={14} className="select-icon" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Scans ({history.length})</option>
                <option value="weeds">With Weeds Found</option>
                <option value="crops">With Crops Found</option>
                <option value="clean">Zero Detections</option>
              </select>
            </div>

            <div className="button-group">
              <button
                className="button button-secondary button-sm"
                onClick={exportHistoryAsCSV}
                disabled={history.length === 0}
                title="Export history to CSV spreadsheet"
              >
                <FileSpreadsheet size={15} />
                <span>Export CSV</span>
              </button>

              <button
                className="button button-secondary button-sm"
                onClick={exportHistoryAsJSON}
                disabled={history.length === 0}
                title="Export history to JSON"
              >
                <FileJson size={15} />
                <span>Export JSON</span>
              </button>

              <button
                className="button button-danger button-sm"
                onClick={handleClear}
                disabled={history.length === 0}
                title="Delete all history"
              >
                <Trash2 size={15} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History List Container */}
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="panel empty-state">
            <div className="empty-state-icon">◷</div>
            <h4>No Detection Logs Found</h4>
            <p>
              {history.length === 0
                ? "Your analyzed images will automatically be archived here with bounding boxes and confidence statistics."
                : "No log records match your current search and filter criteria."}
            </p>
          </div>
        ) : (
          filteredHistory.map((record) => {
            const isExpanded = expandedId === record.id;
            const dateStr = new Date(record.date).toLocaleString();

            return (
              <div key={record.id} className="panel history-card">
                <div className="history-card-header">
                  <div className="history-card-title">
                    <span className="file-badge">IMG</span>
                    <div>
                      <strong className="filename-text">{record.filename}</strong>
                      <div className="history-meta">
                        <Calendar size={12} />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="history-card-badges">
                    <span className="badge badge-weed">
                      <Flame size={12} />
                      <span>{record.weeds || 0} Weeds</span>
                    </span>
                    <span className="badge badge-crop">
                      <Leaf size={12} />
                      <span>{record.crops || 0} Crops</span>
                    </span>
                    <span className="badge badge-neutral">
                      <Layers size={12} />
                      <span>{record.total || 0} Total</span>
                    </span>

                    <button
                      className="button button-ghost button-sm"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : record.id)
                      }
                    >
                      {isExpanded ? "Hide Details ▲" : "View Details ▼"}
                    </button>
                  </div>
                </div>

                {/* Summary Confidences */}
                <div className="history-summary-line">
                  <span>Confidence scores:</span>{" "}
                  {record.confidences && record.confidences.length > 0 ? (
                    record.confidences.map((score, i) => (
                      <span key={i} className="conf-pill">
                        {score.toFixed(1)}%
                      </span>
                    ))
                  ) : (
                    <em>No objects identified in scan</em>
                  )}
                </div>

                {/* Expandable Details Section */}
                {isExpanded && record.detections && record.detections.length > 0 && (
                  <div className="history-expanded-details">
                    <h5>Detected Bounding Boxes & Coordinates</h5>
                    <div className="history-boxes-grid">
                      {record.detections.map((d, idx) => {
                        const isWeed = d.class && d.class.toLowerCase() === "weed";
                        return (
                          <div
                            key={idx}
                            className={`history-box-chip ${
                              isWeed ? "is-weed" : "is-crop"
                            }`}
                          >
                            <span className="chip-label">
                              {isWeed ? "🌾 " : "🌿 "}
                              {d.class} #{(idx + 1)}
                            </span>
                            <span className="chip-conf">
                              {((d.confidence || 0) * 100).toFixed(1)}%
                            </span>
                            <code className="chip-coords">
                              [{(d.box || []).join(", ")}]
                            </code>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
