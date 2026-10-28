import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  PhoneCall,
  X,
  Sparkles,
} from "lucide-react";

export default function SmartDetectionModal({
  event,
  onClose,
  onTriggerSOS,
  autoDispatchEnabled = false,
}) {
  const [countdown, setCountdown] = useState(15);
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);

  // Play warning audio beeps
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        const playBeep = () => {
          if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime);
          gain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(audioContextRef.current.destination);
          osc.start();
          osc.stop(audioContextRef.current.currentTime + 0.4);
        };

        // Play initial beep and recurring beeps
        playBeep();
        const beepInterval = setInterval(playBeep, 2000);
        return () => clearInterval(beepInterval);
      }
    } catch {
      // Audio autoplay might be restricted
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (autoDispatchEnabled && onTriggerSOS) {
            onTriggerSOS();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [autoDispatchEnabled, onTriggerSOS]);

  if (!event) return null;

  return (
    <div className="smart-detection-overlay" role="dialog" aria-modal="true">
      <div className="smart-detection-modal">
        <div className="detection-pulse-ring">
          <AlertTriangle size={48} className="detection-icon-alarm" />
        </div>

        <span className="detection-badge">
          {event.isSimulation ? "DEMONSTRATION CALIBRATION" : "EMERGENCY SIGNAL DETECTED"}
        </span>

        <h2 className="detection-title">{event.title || "Possible Emergency Detected!"}</h2>

        <p className="detection-desc">
          {event.details || "A sudden high-G impact or distress acoustic pattern was detected on your device."}
        </p>

        {/* Countdown Box */}
        <div className="detection-countdown-box">
          <div className="countdown-number">{countdown}</div>
          <span className="countdown-label">
            {autoDispatchEnabled
              ? "seconds until emergency SOS is automatically triggered"
              : "seconds to confirm your safety status"}
          </span>
        </div>

        {/* Big Touch Action Buttons */}
        <div className="detection-actions-column">
          <button
            type="button"
            className="btn btn-detection-safe"
            onClick={onClose}
            aria-label="I am safe, cancel emergency alert"
          >
            <ShieldCheck size={22} />
            <span>I'M SAFE (False Alarm)</span>
          </button>

          <button
            type="button"
            className="btn btn-detection-sos"
            onClick={() => {
              if (onTriggerSOS) onTriggerSOS();
              onClose();
            }}
            aria-label="Trigger emergency SOS now"
          >
            <PhoneCall size={22} />
            <span>TRIGGER SOS NOW</span>
          </button>
        </div>

        <p className="detection-privacy-note">
          SafeHer acoustic and motion detection processes 100% on-device. No audio recordings are saved or uploaded.
        </p>
      </div>
    </div>
  );
}
