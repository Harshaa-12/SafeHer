import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  X,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Siren,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Geolocation } from "@capacitor/geolocation";
import { API_BASE_URL, getAuthHeaders } from "../config";
import { useLanguage } from "../i18n/LanguageContext";

export default function SOSModal({ isOpen, onClose, user, onSOSTriggered }) {
  const { t } = useLanguage();

  // Phases: "COUNTDOWN" -> "DISPATCHING" -> "ACTIVE"
  const [phase, setPhase] = useState("COUNTDOWN");
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sosResult, setSosResult] = useState(null);
  const [resolving, setResolving] = useState(false);

  const countdownTimerRef = useRef(null);

  // Initialize 5-second countdown as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase("COUNTDOWN");
      setCountdown(5);
      setErrorMsg("");
      setSosResult(null);
      setLoading(false);
      setResolving(false);

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
            triggerAutomaticRealSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // CANCEL SOS during 5-second countdown
  function handleCancelCountdown() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    onClose();
  }

  // Cross-platform high accuracy GPS coordinate acquisition
  async function getCoordinates() {
    try {
      const capPos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      });
      return {
        latitude: capPos.coords.latitude,
        longitude: capPos.coords.longitude,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve({ latitude: null, longitude: null, timestamp: new Date().toISOString() });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              timestamp: new Date().toISOString(),
            });
          },
          (err) => {
            console.warn("Geolocation fallback notice in SOS:", err.message);
            resolve({ latitude: null, longitude: null, timestamp: new Date().toISOString() });
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
        );
      });
    }
  }

  // Automatic Real SOS Trigger when countdown reaches zero
  async function triggerAutomaticRealSOS() {
    setPhase("DISPATCHING");
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Acquire latest coordinates
      const coords = await getCoordinates();

      // 2. Transmit to backend
      const response = await fetch(`${API_BASE_URL}/api/sos`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          user_name: user?.name || "SafeHer User",
          confirm_real_sos: true, // REAL emergency broadcast
          mode: "REAL",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Emergency SOS dispatch failed.");
      }

      const alertData = data.alert || {};
      const notifications = Array.isArray(data.notifications) ? data.notifications : [];

      setSosResult({
        id: alertData.id,
        createdAt: alertData.created_at || new Date().toISOString(),
        latitude: coords.latitude ?? alertData.latitude,
        longitude: coords.longitude ?? alertData.longitude,
        status: alertData.status || "ALERT_SUBMITTED",
        notifications,
      });

      setPhase("ACTIVE");
      if (onSOSTriggered) onSOSTriggered(data);
    } catch (err) {
      console.error("SOS Emergency error:", err);
      setErrorMsg(err.message || "Failed to dispatch SOS alert. Please call 112 directly.");
      setPhase("ACTIVE"); // Show emergency assistance even if API failed
    } finally {
      setLoading(false);
    }
  }

  // Resolve / End Emergency Alert
  async function handleResolveSOS() {
    if (!sosResult?.id) {
      onClose();
      return;
    }

    setResolving(true);
    try {
      await fetch(`${API_BASE_URL}/api/sos/${sosResult.id}/resolve`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn("Resolve alert error:", err);
    } finally {
      setResolving(false);
      onClose();
    }
  }

  const hasCoords = sosResult?.latitude != null && sosResult?.longitude != null;
  const mapUrl = hasCoords
    ? `https://www.google.com/maps?q=${sosResult.latitude},${sosResult.longitude}`
    : null;

  return (
    <div className="sos-screen-overlay" role="dialog" aria-modal="true">
      {/* ========================================================
          PHASE 1: 5-SECOND AUTOMATIC DISPATCH COUNTDOWN
          ======================================================== */}
      {phase === "COUNTDOWN" && (
        <div className="sos-countdown-card">
          <div className="sos-countdown-pulsing-wrap">
            <span className="sos-countdown-pulse-ring" />
            <div className="sos-countdown-icon">
              <Siren size={54} className="sos-siren-anim" />
            </div>
          </div>

          <h1 className="sos-countdown-title">
            SOS STARTING IN {countdown}
          </h1>

          <p className="sos-countdown-subtitle">
            Broadcasting emergency alert & live GPS coordinates to your Safety Circle in {countdown}s.
          </p>

          <div className="sos-countdown-actions">
            <button
              type="button"
              className="sos-cancel-large-btn"
              onClick={handleCancelCountdown}
              aria-label="Cancel Emergency SOS Alert"
            >
              <X size={24} />
              <span>CANCEL SOS</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          PHASE 2: DISPATCHING
          ======================================================== */}
      {phase === "DISPATCHING" && (
        <div className="sos-countdown-card">
          <div className="sos-countdown-pulsing-wrap">
            <Loader2 size={54} className="spin text-rose" />
          </div>

          <h2 className="sos-countdown-title" style={{ fontSize: "22px" }}>
            CREATING REAL SOS ALERT...
          </h2>

          <p className="sos-countdown-subtitle">
            Acquiring high-accuracy GPS coordinates and transmitting emergency broadcast...
          </p>
        </div>
      )}

      {/* ========================================================
          PHASE 3: SOS ACTIVE MOBILE SCREEN (Clarity > Decoration)
          ======================================================== */}
      {phase === "ACTIVE" && (
        <div className="sos-active-screen">
          {/* Header Banner */}
          <div className="sos-active-header">
            <div className="sos-active-badge">
              <span className="sos-active-dot" />
              <span>SOS ACTIVE</span>
            </div>
            <span className="sos-active-time">
              {sosResult?.createdAt
                ? new Date(sosResult.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "Active Now"}
            </span>
          </div>

          {errorMsg && (
            <div className="sos-active-error" role="alert">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Immediate Helpline Call Buttons */}
          <div className="sos-helpline-row">
            <a href="tel:112" className="sos-helpline-btn police-btn" aria-label="Call Police 112">
              <PhoneCall size={18} />
              <span>Call Police 112</span>
            </a>
            <a href="tel:181" className="sos-helpline-btn helpline-btn" aria-label="Call Women Helpline 181">
              <PhoneCall size={18} />
              <span>Call Women 181</span>
            </a>
          </div>

          {/* Location Status Card */}
          <div className="sos-active-card">
            <div className="sos-card-title-row">
              <MapPin size={18} className="text-rose" />
              <strong>Emergency GPS Location</strong>
            </div>

            {hasCoords ? (
              <div className="sos-location-details">
                <span className="coords-text">
                  Lat: {Number(sosResult.latitude).toFixed(5)}, Lon: {Number(sosResult.longitude).toFixed(5)}
                </span>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link-btn"
                  >
                    <ExternalLink size={14} /> Open in Google Maps
                  </a>
                )}
              </div>
            ) : (
              <p className="sos-location-unavailable">
                GPS Location is temporarily unavailable or permission was not granted. Emergency contacts notified.
              </p>
            )}
          </div>

          {/* Trusted Contacts & Notification Status */}
          <div className="sos-active-card">
            <div className="sos-card-title-row">
              <ShieldCheck size={18} className="text-emerald" />
              <strong>Safety Circle Dispatches</strong>
            </div>

            {sosResult?.notifications && sosResult.notifications.length > 0 ? (
              <div className="sos-notifications-list">
                {sosResult.notifications.map((notif, index) => {
                  const isSubmitted = notif.status === "submitted" || notif.status === "delivered";
                  return (
                    <div key={notif.notification_id || index} className="sos-notif-item">
                      <div className="sos-notif-left">
                        <span className="notif-contact-name">{notif.contact_name || notif.recipient}</span>
                        <span className="notif-channel-tag">{notif.channel?.toUpperCase()}</span>
                      </div>
                      <span className={`notif-status-badge ${isSubmitted ? "status-sent" : "status-unconfigured"}`}>
                        {isSubmitted ? "Submitted" : notif.error ? notif.error.slice(0, 32) : notif.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="sos-empty-contacts-note">
                {sosResult?.status === "NO_CONSENTED_CONTACTS"
                  ? "No consented trusted contacts configured. Add contacts in Safety Circle."
                  : "Dispatch recorded. Notification delivery status processing."}
              </p>
            )}
          </div>

          {/* End Emergency Button */}
          <div className="sos-active-bottom">
            <button
              type="button"
              className="sos-end-emergency-btn"
              onClick={handleResolveSOS}
              disabled={resolving}
            >
              <Check size={20} />
              <span>{resolving ? "Resolving Alert..." : "I AM SAFE — END EMERGENCY"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
