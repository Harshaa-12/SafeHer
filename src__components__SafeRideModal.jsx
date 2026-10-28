import React, { useState } from "react";
import {
  Navigation,
  MapPin,
  Car,
  AlertTriangle,
  Info,
  ShieldCheck,
  X,
  ExternalLink,
  Users,
} from "lucide-react";
import { safeRideApi } from "../api/rides";

export default function SafeRideModal({ isOpen, onClose, onShareWithContacts }) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [shareTrip, setShareTrip] = useState(true);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const providers = safeRideApi.getProviders();

  function handleCheckRides(e) {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) return;
    setSearched(true);
  }

  return (
    <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal-card saferide-modal-card">
        <div className="saferide-header">
          <div className="flex-row items-center gap-2">
            <Car size={24} className="text-blue" />
            <h3 style={{ margin: 0, fontSize: "20px" }}>Safe Ride • Verification & Trip Share</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-close-banner">
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 16px" }}>
          Coordinate verified transit and share live route tracking with your Safety Circle.
        </p>

        {/* Form */}
        <form onSubmit={handleCheckRides} className="saferide-form">
          <div className="form-group" style={{ textAlign: "left", marginBottom: "12px" }}>
            <label className="form-label">Pickup Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Current GPS or Office address"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: "left", marginBottom: "12px" }}>
            <label className="form-label">Dropoff Destination</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Home, Metro Station"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              required
            />
          </div>

          <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", margin: "10px 0 16px" }}>
            <input
              type="checkbox"
              checked={shareTrip}
              onChange={(e) => setShareTrip(e.target.checked)}
            />
            <span>Automatically share live trip tracking with my Primary Safety Contact</span>
          </label>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", borderRadius: "12px", fontWeight: 700 }}
          >
            Check Ride Providers & Safety Integration
          </button>
        </form>

        {/* Results / Status */}
        {searched && (
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            {/* Honest Disclosure (Section 27 Requirement) */}
            <div className="notif-notice-card" style={{ marginBottom: "16px" }}>
              <Info size={20} className="text-blue" />
              <div>
                <strong>Ride integrations are not configured yet.</strong>
                <p>
                  SafeHer does not pretend a taxi is booked without an authorized carrier integration. Below is the integration-ready provider architecture:
                </p>
              </div>
            </div>

            <div className="saferide-providers-grid">
              {providers.map((p) => (
                <div key={p.id} className="integration-status-item">
                  <div className="integration-item-top">
                    <div>
                      <span className="integration-type-pill">{p.category}</span>
                      <h4 className="integration-name">{p.name}</h4>
                    </div>
                    <span className="provider-state-pill not_configured">
                      {p.status}
                    </span>
                  </div>
                  <p className="integration-detail-text">{p.details}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginTop: "14px", fontSize: "12px", color: "#64748b" }}>
              <strong>Safety Recommendation:</strong> While external ride APIs remain in developer status, use <strong>Safe Journey</strong> to set a monitored timer for your trip with your trusted contacts.
            </div>
          </div>
        )}

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
