import React, { useState, useEffect } from "react";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SOSModal from "./components/SOSModal";
import SmartDetectionModal from "./components/SmartDetectionModal";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ContactPage from "./pages/Contact";
import LocationPage from "./pages/Location";
import EmergencyAssistance from "./pages/EmergencyAssistance";
import Journey from "./pages/Journey";
import NotificationCenter from "./pages/NotificationCenter";
import SOSHistory from "./pages/SOSHistory";
import SafetyTips from "./pages/SafetyTips";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";

import { API_BASE_URL, getAuthHeaders, getAuthToken } from "./config";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { smartDetection } from "./utils/smartDetection";
import "./App.css";

function AppContent() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("safeher_user") || sessionStorage.getItem("safeher_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showSOS, setShowSOS] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Smart Detection Modal event
  const [detectionEvent, setDetectionEvent] = useState(null);

  // Listen to Smart Detection Manager
  useEffect(() => {
    const unsubscribe = smartDetection.subscribe((event) => {
      setDetectionEvent(event);
    });

    // Auto-resume detection if user previously enabled it
    try {
      if (localStorage.getItem("safeher_sound_detect") === "true") {
        smartDetection.startAudioDetection();
      }
      if (localStorage.getItem("safeher_impact_detect") === "true") {
        smartDetection.startMotionDetection();
      }
    } catch {
      // Browser fallback
    }

    return () => {
      unsubscribe();
      smartDetection.stopAudioDetection();
      smartDetection.stopMotionDetection();
    };
  }, []);

  // Verify auth validity on initial mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, { headers: getAuthHeaders() })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else if (res.status === 401) {
            handleLogout();
          }
        })
        .then((data) => {
          if (data && data.user) {
            setUser((prev) => ({ ...prev, ...data.user }));
            localStorage.setItem("safeher_user", JSON.stringify(data.user));
          }
        })
        .catch((err) => {
          console.warn("Auth check notice:", err);
        });
    }
  }, []);

  // Android hardware back button & Capacitor status bar
  useEffect(() => {
    let backListener = null;
    try {
      backListener = CapApp.addListener("backButton", () => {
        if (detectionEvent) {
          setDetectionEvent(null);
        } else if (showSOS) {
          setShowSOS(false);
        } else if (activeTab !== "Dashboard") {
          setActiveTab("Dashboard");
        } else {
          CapApp.exitApp();
        }
      });
    } catch {
      // Browser fallback
    }

    try {
      StatusBar.setBackgroundColor({ color: "#fff8fa" });
      StatusBar.setStyle({ style: Style.Light });
    } catch {
      // Browser fallback
    }

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, [showSOS, activeTab, detectionEvent]);

  function handleLogout() {
    localStorage.removeItem("safeher_token");
    localStorage.removeItem("safeher_auth_token");
    localStorage.removeItem("safeher_user");
    sessionStorage.removeItem("safeher_token");
    sessionStorage.removeItem("safeher_user");
    setUser(null);
    setActiveTab("Dashboard");
  }

  // If user is not authenticated, render production Auth screen (Login / Sign Up / Password Reset)
  if (!user || !getAuthToken()) {
    return (
      <div className="safeher-app-root">
        <Auth
          onAuthSuccess={(userData) => {
            setUser(userData);
            setActiveTab("Dashboard");
          }}
        />
      </div>
    );
  }

  const isAutoDispatch = typeof window !== "undefined" && localStorage.getItem("safeher_auto_dispatch") === "true";

  return (
    <div className="safeher-app-root">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenSOS={() => setShowSOS(true)}
        user={user}
        onLogout={handleLogout}
        unreadCount={unreadCount}
      />

      {/* Main Screen Routed by activeTab */}
      <main className="safeher-main-content">
        {activeTab === "Dashboard" && (
          <Dashboard
            user={user}
            onNavigate={setActiveTab}
            onOpenSOS={() => setShowSOS(true)}
          />
        )}

        {activeTab === "Emergency Assistance" && (
          <EmergencyAssistance onNavigate={setActiveTab} />
        )}

        {activeTab === "Trusted Contacts" && (
          <ContactPage onNavigate={setActiveTab} />
        )}

        {activeTab === "Journey" && (
          <Journey
            onNavigate={setActiveTab}
            onOpenSOS={() => setShowSOS(true)}
          />
        )}

        {activeTab === "Location" && (
          <LocationPage onNavigate={setActiveTab} />
        )}

        {activeTab === "Notifications" && (
          <NotificationCenter onNavigate={setActiveTab} />
        )}

        {activeTab === "SOS History" && (
          <SOSHistory onNavigate={setActiveTab} />
        )}

        {activeTab === "Safety Tips" && (
          <SafetyTips onNavigate={setActiveTab} />
        )}

        {activeTab === "Profile" && (
          <Profile
            user={user}
            onProfileUpdated={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
            onNavigate={setActiveTab}
            onLogout={handleLogout}
          />
        )}

        {activeTab === "Settings" && (
          <Settings
            user={user}
            onLogout={handleLogout}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === "About" && (
          <About onNavigate={setActiveTab} />
        )}
      </main>

      {/* Android Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onOpenSOS={() => setShowSOS(true)}
      />

      {/* Production Emergency SOS Modal with Accidental Confirmation & 5s Cancellation */}
      <SOSModal
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        user={user}
        onSOSTriggered={() => {
          setUnreadCount((prev) => prev + 1);
        }}
      />

      {/* On-Device Smart SOS Detection Alert Modal */}
      {detectionEvent && (
        <SmartDetectionModal
          event={detectionEvent}
          onClose={() => setDetectionEvent(null)}
          onTriggerSOS={() => {
            setDetectionEvent(null);
            setShowSOS(true);
          }}
          autoDispatchEnabled={isAutoDispatch}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
