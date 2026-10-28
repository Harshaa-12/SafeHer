import React, { useState } from "react";
import {
  ShieldCheck,
  Globe,
  User,
  Users,
  MapPin,
  Bell,
  Heart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Phone,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { profileApi, contactsApi, locationApi } from "../api";
import { Geolocation } from "@capacitor/geolocation";

export default function OnboardingModal({ user, onComplete }) {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Welcome/Lang, 2: Profile/Phone, 3: First Contact, 4: Permissions, 5: Done
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Step 2 Form
  const [phone, setPhone] = useState(user?.phone || "");
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "");

  // Step 3 Form
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRel, setContactRel] = useState("");

  // Step 4 permissions
  const [locationGranted, setLocationGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  async function handleNextStep() {
    setFeedback("");
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      if (phone.trim()) {
        setLoading(true);
        try {
          await profileApi.updateProfile({ phone: phone.trim(), blood_group: bloodGroup.trim() });
        } catch (e) {
          console.warn("Could not save phone in onboarding:", e);
        } finally {
          setLoading(false);
        }
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (contactName.trim() && contactPhone.trim()) {
        setLoading(true);
        try {
          await contactsApi.addContact({
            name: contactName.trim(),
            phone: contactPhone.trim(),
            relationship: contactRel.trim() || "Family",
            is_primary: true,
            sms_consent: true,
            whatsapp_consent: true,
          });
        } catch (e) {
          console.warn("Could not save initial contact in onboarding:", e);
        } finally {
          setLoading(false);
        }
      }
      setStep(4);
      return;
    }

    if (step === 4) {
      setStep(5);
      return;
    }

    if (step === 5) {
      try {
        localStorage.setItem(`safeher_onboarded_${user?.email || "user"}`, "true");
      } catch {}
      onComplete();
    }
  }

  async function handleRequestLocation() {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "granted") {
        setLocationGranted(true);
        const pos = await Geolocation.getCurrentPosition({ timeout: 5000 });
        if (pos) {
          await locationApi.updateLocation(pos.coords.latitude, pos.coords.longitude);
        }
        setFeedback("Location permission granted & initial coordinates secured.");
      }
    } catch {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setLocationGranted(true);
            await locationApi.updateLocation(pos.coords.latitude, pos.coords.longitude);
            setFeedback("Location coordinates acquired successfully.");
          },
          () => setFeedback("Location permission was skipped.")
        );
      }
    }
  }

  async function handleRequestNotifications() {
    if ("Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          setNotifGranted(true);
          setFeedback("Emergency notification banners enabled.");
        }
      } catch {
        setNotifGranted(true);
      }
    } else {
      setNotifGranted(true);
    }
  }

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true">
      <div className="onboarding-card">
        {/* Step Indicator */}
        <div className="onboarding-steps-track">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`onboarding-step-dot ${s === step ? "active" : s < step ? "done" : ""}`}
            />
          ))}
        </div>

        {feedback && (
          <div className="status-banner success" style={{ margin: "10px 0" }}>
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* STEP 1: WELCOME & LANGUAGE */}
        {step === 1 && (
          <div className="onboarding-step-body">
            <div className="onboarding-icon-wrap rose">
              <ShieldCheck size={36} />
            </div>
            <h2>Welcome to SafeHer</h2>
            <p className="onboarding-sub">
              Your personal safety network and emergency assistance platform. First, choose your preferred regional language:
            </p>

            <div className="language-grid" style={{ maxHeight: "240px", overflowY: "auto", margin: "16px 0" }}>
              {supportedLanguages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`language-select-box ${language === l.code ? "selected" : ""}`}
                  onClick={() => setLanguage(l.code)}
                >
                  <div>
                    <span className="lang-native">{l.nativeName}</span>
                    <span className="lang-english">{l.name}</span>
                  </div>
                  {language === l.code && <CheckCircle2 size={16} className="text-emerald" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PROFILE & PHONE */}
        {step === 2 && (
          <div className="onboarding-step-body">
            <div className="onboarding-icon-wrap blue">
              <User size={36} />
            </div>
            <h2>Emergency Profile</h2>
            <p className="onboarding-sub">
              Add your mobile number so emergency responders and contacts can reach you.
            </p>

            <div className="form-group" style={{ textAlign: "left", marginTop: "16px" }}>
              <label className="form-label">Your Mobile Phone (10 digits)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Blood Group (Optional)</label>
              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: TRUSTED CONTACTS */}
        {step === 3 && (
          <div className="onboarding-step-body">
            <div className="onboarding-icon-wrap emerald">
              <Users size={36} />
            </div>
            <h2>Primary Safety Contact</h2>
            <p className="onboarding-sub">
              Designate a family member or friend to alert during an active emergency SOS.
            </p>

            <div className="form-group" style={{ textAlign: "left", marginTop: "14px" }}>
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sister, Mom, Best Friend"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Contact Mobile Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit phone number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Relationship</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sister, Mother, Spouse"
                value={contactRel}
                onChange={(e) => setContactRel(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 4: PERMISSIONS */}
        {step === 4 && (
          <div className="onboarding-step-body">
            <div className="onboarding-icon-wrap purple">
              <MapPin size={36} />
            </div>
            <h2>Device Safety Permissions</h2>
            <p className="onboarding-sub">
              SafeHer requests permissions only when required to keep you connected in high-stress situations.
            </p>

            <div className="onboarding-permission-list">
              <div className="permission-item">
                <div className="perm-info">
                  <MapPin size={20} className="text-blue" />
                  <div>
                    <strong>Live GPS Coordinates</strong>
                    <p>Required to share your Google Maps link with contacts during an active SOS.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-perm ${locationGranted ? "granted" : ""}`}
                  onClick={handleRequestLocation}
                >
                  {locationGranted ? "Granted ✓" : "Allow"}
                </button>
              </div>

              <div className="permission-item">
                <div className="perm-info">
                  <Bell size={20} className="text-rose" />
                  <div>
                    <strong>Emergency Notifications</strong>
                    <p>Receive overdue journey warnings and safety check-in countdown alerts.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-perm ${notifGranted ? "granted" : ""}`}
                  onClick={handleRequestNotifications}
                >
                  {notifGranted ? "Granted ✓" : "Allow"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: SAFETY READINESS READY */}
        {step === 5 && (
          <div className="onboarding-step-body">
            <div className="onboarding-icon-wrap emerald">
              <CheckCircle2 size={44} />
            </div>
            <h2>You're All Set!</h2>
            <p className="onboarding-sub">
              Your SafeHer emergency profile has been initialized. You can now use the 🚨 SOS button, start a Safe Journey, or rehearse safely in Demonstration Test Mode.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="onboarding-actions">
          {step > 1 && step < 5 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 5 && (
            <button
              type="button"
              className="btn btn-skip"
              onClick={() => setStep((s) => s + 1)}
            >
              Skip for now
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary btn-onboarding-next"
            onClick={handleNextStep}
            disabled={loading}
          >
            <span>{step === 5 ? "Go to Dashboard" : "Continue"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
