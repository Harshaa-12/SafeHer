import React from "react";
import { Compass, LifeBuoy, Users, Navigation, UserRound } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function BottomNav({ activeTab, onNavigate }) {
  const { t } = useLanguage();

  const tabs = [
    { id: "Dashboard", label: t("nav.home") || "Home", icon: Compass },
    { id: "Emergency Assistance", label: t("nav.emergency") || "Emergency", icon: LifeBuoy },
    { id: "Trusted Contacts", label: t("nav.contacts") || "Circle", icon: Users },
    { id: "Journey", label: t("nav.journey") || "Journey", icon: Navigation },
    { id: "Profile", label: t("nav.profile") || "Profile", icon: UserRound },
  ];

  return (
    <nav className="safeher-bottom-nav" aria-label="Mobile Navigation">
      <div className="bottom-nav-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
            >
              <div className="bottom-nav-icon-wrap">
                <Icon size={22} />
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
