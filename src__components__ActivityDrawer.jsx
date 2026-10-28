import React, { useEffect, useState } from "react";
import {
  Bell,
  X,
  Clock,
  AlertTriangle,
  MapPin,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { API_BASE_URL } from "../config";

export default function ActivityDrawer({ isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    async function loadActivities() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/activity`);
        const data = await response.json();
        if (active) {
          setActivities(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Could not fetch activities:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivities();
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function getActivityIcon(type) {
    switch (type) {
      case "sos_real":
        return <AlertTriangle size={18} className="text-rose" />;
      case "sos_test":
        return <ShieldCheck size={18} className="text-blue" />;
      case "location_updated":
        return <MapPin size={18} className="text-emerald" />;
      case "contact_added":
      case "contact_updated":
      case "contact_deleted":
        return <UserPlus size={18} className="text-purple" />;
      default:
        return <Clock size={18} className="text-muted" />;
    }
  }

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="flex-row items-center gap-2">
            <Bell size={20} className="text-rose" />
            <h3 className="drawer-title">Activity & Notification Center</h3>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close activity center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <p className="drawer-sub">
            Real-time chronological activity logged by the SafeHer backend engine:
          </p>

          {loading ? (
            <div className="drawer-loading">
              <Clock size={24} className="spin-animate text-rose" />
              <span>Fetching activity records...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="drawer-empty">
              <Bell size={36} className="text-muted" />
              <p>No activity records logged yet. Interacting with contacts, location, or SOS will record events here.</p>
            </div>
          ) : (
            <div className="drawer-activity-list">
              {activities.map((item) => (
                <div key={item.id} className="drawer-activity-item">
                  <div className="drawer-activity-icon-box">
                    {getActivityIcon(item.action_type)}
                  </div>
                  <div className="drawer-activity-text">
                    <strong className="drawer-item-title">{item.title}</strong>
                    {item.details && (
                      <p className="drawer-item-details">{item.details}</p>
                    )}
                    <span className="drawer-item-time">
                      {new Date(item.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
