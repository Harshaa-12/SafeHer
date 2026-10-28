import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  MapPin,
  LifeBuoy,
  PhoneCall,
  Clock,
  CheckCircle2,
  ChevronRight,
  Navigation,
  Timer,
  Siren,
  Radio,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { useLanguage } from "../i18n/LanguageContext";

export default function Dashboard({ user, onNavigate, onOpenSOS }) {
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosPulsing, setSosPulsing] = useState(false);

  async function fetchDashboardData() {
    try {
      const headers = getAuthHeaders();
      const [statsRes, actRes, readRes, checkinRes, journeyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/activity`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/safety-readiness`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/checkins/active`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/journey/active`, { headers }).catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (actRes && actRes.ok) {
        const actData = await actRes.json();
        setActivityLogs(Array.isArray(actData) ? actData : []);
      }
      if (readRes && readRes.ok) {
        setReadiness(await readRes.json());
      }
      if (checkinRes && checkinRes.ok) {
        const ciData = await checkinRes.json();
        setActiveCheckin(ciData?.checkin || null);
      }
      if (journeyRes && journeyRes.ok) {
        const jData = await journeyRes.json();
        setActiveJourney(jData?.journey || null);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleMarkSafeCheckin(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/checkins/${id}/safe`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setActiveCheckin(null);
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Check-in safe error:", e);
    }
  }

  async function handleCompleteJourney(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/journey/${id}/arrive`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setActiveJourney(null);
        fetchDashboardData();
      }
    } catch (e) {
      console.error("Journey complete error:", e);
    }
  }

  function handleSOSTrigger() {
    setSosPulsing(true);
    setTimeout(() => setSosPulsing(false), 700);
    onOpenSOS();
  }

  const firstName = user?.name ? user.name.split(" ")[0] : "Divya";
  const totalContacts = stats?.contacts?.total || 0;
  const hasLocation = Boolean(stats?.location?.available);
  const preparednessPct = readiness?.percentage ?? 80;
  const checklist = readiness?.checklist || [
    { id: "profile", title: "Complete Emergency Profile", status: true, detail: "Blood group & medical info" },
    { id: "contacts", title: "Add Trusted Contacts", status: totalContacts > 0, detail: `${totalContacts} in Safety Circle` },
    { id: "location", title: "Enable Live GPS", status: hasLocation, detail: "Accurate emergency coordinates" },
    { id: "preferences", title: "Review Emergency Preferences", status: true, detail: "SMS & WhatsApp alerts" },
  ];

  return (
    <div className="mobile-home-container">
      {/* ============================================================
          1. HERO CIRCULAR SOS SECTION (REFERENCE DESIGN RESTORED)
          ============================================================ */}
      <section className="sos-hero-section" aria-label="Emergency SOS Action">
        {/* Background decorative concentric rings */}
        <div className="sos-hero-bg-ring sos-ring-1" />
        <div className="sos-hero-bg-ring sos-ring-2" />
        <div className="sos-hero-bg-ring sos-ring-3" />

        {/* Hero Top Greeting */}
        <div className="sos-hero-top">
          <div className="status-live-indicator">
            <span className="live-pulse-dot" />
            <span>Ready • Safety Tools Active</span>
          </div>
          <h1 className="sos-hero-greeting">
            Welcome, {firstName}
          </h1>
          <p className="sos-hero-sub">
            Tap the emergency button below if you need immediate assistance.
          </p>
        </div>

        {/* THE LARGE CIRCULAR SOS BUTTON */}
        <div className="sos-hero-center">
          <div className="sos-pulse-ring sos-pulse-ring-outer" />
          <div className="sos-pulse-ring sos-pulse-ring-mid" />
          <button
            type="button"
            className={`sos-hero-btn${sosPulsing ? " sos-hero-btn--active" : ""}`}
            onClick={handleSOSTrigger}
            aria-label="Emergency SOS — Tap to send alert"
          >
            <Siren size={46} strokeWidth={2.2} className="sos-hero-siren-icon" />
            <span className="sos-hero-btn-label">SOS</span>
            <span className="sos-hero-btn-sub">TAP TO SEND</span>
            <span className="sos-hero-btn-sub2">EMERGENCY ALERT</span>
          </button>
        </div>

        {/* 112 / 181 / CHECK-IN SECONDARY BUTTONS DIRECTLY BELOW SOS */}
        <div className="sos-hero-quick-row">
          <a
            href="tel:112"
            className="sos-hero-quick-btn sos-quick-red"
            aria-label="Dial National Emergency 112"
          >
            <PhoneCall size={16} />
            <span>112</span>
          </a>
          <a
            href="tel:181"
            className="sos-hero-quick-btn sos-quick-pink"
            aria-label="Dial National Women Helpline 181"
          >
            <PhoneCall size={16} />
            <span>181</span>
          </a>
          <button
            type="button"
            className="sos-hero-quick-btn sos-quick-blue"
            onClick={() => onNavigate("Journey")}
            aria-label="Start Safety Check-In"
          >
            <Radio size={16} />
            <span>Check-In</span>
          </button>
        </div>
      </section>

      {/* ACTIVE CHECKIN / JOURNEY ALERT BANNERS IF RUNNING */}
      {activeCheckin && (
        <div className="active-alert-banner active-alert-green">
          <div className="active-alert-left">
            <div className="active-alert-icon-wrap" style={{ background: "#10b981" }}>
              <Timer size={18} />
            </div>
            <div>
              <strong>Safety Check-In Active</strong>
              <span>
                Expires at {new Date(activeCheckin.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="active-alert-btn active-alert-btn-green"
            onClick={() => handleMarkSafeCheckin(activeCheckin.id)}
          >
            I'm Safe
          </button>
        </div>
      )}

      {activeJourney && (
        <div className="active-alert-banner active-alert-blue">
          <div className="active-alert-left">
            <div className="active-alert-icon-wrap" style={{ background: "#2563eb" }}>
              <Navigation size={18} />
            </div>
            <div>
              <strong>Safe Journey: {activeJourney.destination}</strong>
              <span>
                Arrival by {new Date(activeJourney.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="active-alert-btn active-alert-btn-blue"
            onClick={() => handleCompleteJourney(activeJourney.id)}
          >
            Arrived Safely
          </button>
        </div>
      )}

      {/* ============================================================
          2. CURRENT SAFETY STATUS (COMPACT MOBILE CARD)
          ============================================================ */}
      <section className="mobile-status-card" aria-label="Current Safety Status">
        <div className="mobile-status-card-header">
          <span className="mobile-status-card-title">Safety Status</span>
          <span className="mobile-status-card-badge">Live</span>
        </div>
        <div className="mobile-status-list">
          <div
            className="mobile-status-row"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("Location")}
          >
            <div className="mobile-status-row-left">
              <span className={`status-dot ${hasLocation ? "dot-online" : "dot-standby"}`} />
              <div>
                <strong className="status-row-label">
                  {hasLocation ? "Location available" : "Location standby"}
                </strong>
                <span className="status-row-sub">
                  {hasLocation ? "Updated just now • High accuracy" : "Tap to acquire live GPS coordinates"}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="status-row-arrow" />
          </div>

          <div
            className="mobile-status-row"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("Trusted Contacts")}
          >
            <div className="mobile-status-row-left">
              <span className={`status-dot ${totalContacts > 0 ? "dot-online" : "dot-standby"}`} />
              <div>
                <strong className="status-row-label">
                  Safety Circle: {totalContacts} trusted {totalContacts === 1 ? "contact" : "contacts"}
                </strong>
                <span className="status-row-sub">
                  {stats?.contacts?.sms_ready || 0} SMS • {stats?.contacts?.whatsapp_ready || 0} WhatsApp ready
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="status-row-arrow" />
          </div>

          <div
            className="mobile-status-row"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate("Journey")}
          >
            <div className="mobile-status-row-left">
              <span className={`status-dot ${activeJourney ? "dot-online" : "dot-neutral"}`} />
              <div>
                <strong className="status-row-label">
                  Journey: {activeJourney ? activeJourney.destination : "No active journey"}
                </strong>
                <span className="status-row-sub">
                  {activeJourney ? "Sharing route with circle" : "Share a route when travelling"}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="status-row-arrow" />
          </div>
        </div>
      </section>

      {/* ============================================================
          3. QUICK ACTIONS (CLEAN 2x2 MOBILE GRID)
          ============================================================ */}
      <section className="mobile-actions-section" aria-label="Quick Actions">
        <h2 className="mobile-section-heading">Quick Actions</h2>
        <div className="mobile-actions-grid">
          <button
            type="button"
            className="mobile-action-card"
            onClick={() => onNavigate("Trusted Contacts")}
          >
            <div className="mobile-action-icon-wrap bg-rose">
              <Users size={22} className="text-rose" />
            </div>
            <strong className="mobile-action-title">Safety Circle</strong>
            <span className="mobile-action-desc">Manage trusted circle</span>
          </button>

          <button
            type="button"
            className="mobile-action-card"
            onClick={() => onNavigate("Journey")}
          >
            <div className="mobile-action-icon-wrap bg-amber">
              <Timer size={22} className="text-amber" />
            </div>
            <strong className="mobile-action-title">Check-In</strong>
            <span className="mobile-action-desc">Timed safety check</span>
          </button>

          <button
            type="button"
            className="mobile-action-card"
            onClick={() => onNavigate("Journey")}
          >
            <div className="mobile-action-icon-wrap bg-blue">
              <Navigation size={22} className="text-blue" />
            </div>
            <strong className="mobile-action-title">Safe Journey</strong>
            <span className="mobile-action-desc">Share your route</span>
          </button>

          <button
            type="button"
            className="mobile-action-card"
            onClick={() => onNavigate("Emergency Assistance")}
          >
            <div className="mobile-action-icon-wrap bg-emerald">
              <LifeBuoy size={22} className="text-emerald" />
            </div>
            <strong className="mobile-action-title">Emergency Help</strong>
            <span className="mobile-action-desc">112, 181 & helplines</span>
          </button>
        </div>
      </section>

      {/* ============================================================
          4. SAFETY READINESS (SIMPLIFIED MOBILE WIDGET)
          ============================================================ */}
      <section className="mobile-readiness-card" aria-label="Safety Readiness">
        <div className="mobile-readiness-top">
          <div className="mobile-readiness-title-group">
            <ShieldCheck size={22} className="text-rose" />
            <div>
              <h3 className="mobile-readiness-title">Safety Readiness</h3>
              <span className="mobile-readiness-pct">{preparednessPct}% prepared</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-readiness-action-btn"
            onClick={() => onNavigate(preparednessPct < 100 ? "Trusted Contacts" : "Profile")}
          >
            {preparednessPct === 100 ? "All set" : "Complete setup"}
          </button>
        </div>

        <div className="mobile-readiness-track">
          <div
            className="mobile-readiness-fill"
            style={{ width: `${Math.min(100, Math.max(10, preparednessPct))}%` }}
          />
        </div>
        <p className="mobile-readiness-hint">Complete these to improve your emergency setup.</p>

        <div className="mobile-readiness-checklist">
          {checklist.slice(0, 4).map((item, idx) => (
            <div key={idx} className="mobile-checklist-row">
              {item.status ? (
                <CheckCircle2 size={16} className="checklist-icon-done" />
              ) : (
                <Clock size={16} className="checklist-icon-pending" />
              )}
              <span className={`checklist-item-title ${item.status ? "done" : "pending"}`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          5. RECENT SAFETY ACTIVITY
          ============================================================ */}
      <section className="mobile-activity-section" aria-label="Recent Safety Activity">
        <div className="mobile-activity-header">
          <h2 className="mobile-section-heading">Recent Safety Activity</h2>
          <button
            type="button"
            className="mobile-view-all-btn"
            onClick={() => onNavigate("SOS History")}
          >
            History <ChevronRight size={14} />
          </button>
        </div>

        <div className="mobile-activity-list">
          {activityLogs.length > 0 ? (
            activityLogs.slice(0, 3).map((act, idx) => (
              <div key={idx} className="mobile-activity-item">
                <span className="activity-dot" />
                <div className="activity-info">
                  <strong className="activity-title">
                    {act.details || act.action || "Safety verification"}
                  </strong>
                  <span className="activity-time">
                    {act.created_at ? new Date(act.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Recent"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="mobile-activity-empty">
              <CheckCircle2 size={20} className="text-emerald" />
              <div>
                <strong>All clear</strong>
                <span>No recent emergency events recorded.</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
