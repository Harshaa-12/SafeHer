import React, { useState } from "react";
import {
  Bell,
  UserRound,
  LogOut,
  Menu,
  X,
  Compass,
  Users,
  MapPin,
  History,
  LifeBuoy,
  Settings,
  Sparkles,
  Navigation,
  Globe,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import safeherLogo from "../assets/branding/safeher-logo-full.png";

export default function Header({
  activeTab,
  onNavigate,
  user,
  onLogout,
  unreadCount = 0,
}) {
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems = [
    { id: "Dashboard", label: t("nav.home") || "Home", icon: Compass },
    { id: "Emergency Assistance", label: t("nav.emergency") || "Emergency Help", icon: LifeBuoy },
    { id: "Trusted Contacts", label: t("nav.contacts") || "Safety Circle", icon: Users },
    { id: "Journey", label: t("nav.journey") || "Safe Journey", icon: Navigation },
    { id: "Location", label: t("nav.location") || "Live Location", icon: MapPin },
    { id: "SOS History", label: t("nav.history") || "SOS History", icon: History },
    { id: "Notifications", label: t("nav.notifications") || "Notifications", icon: Bell },
    { id: "Safety Tips", label: t("nav.tips") || "Safety Tips", icon: Sparkles },
    { id: "Profile", label: t("nav.profile") || "Profile", icon: UserRound },
    { id: "Settings", label: t("nav.settings") || "Settings", icon: Settings },
  ];

  function handleNav(id) {
    onNavigate(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setLangDropdownOpen(false);
  }

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <header className="safeher-header">
      <div className="header-container">
        {/* Brand identity: SafeHer logo mark + name */}
        <div className="header-brand" onClick={() => handleNav("Dashboard")} role="button" tabIndex={0}>
          <img
            src={safeherLogo}
            alt="SafeHer logo"
            className="header-logo-img"
          />
          <div className="brand-text">
            <span className="brand-name-safe">Safe</span><span className="brand-name-her">Her</span>
          </div>
        </div>

        {/* Right side app bar controls */}
        <div className="header-user-controls">
          {/* Language Switcher */}
          <div className="lang-menu-wrapper">
            <button
              type="button"
              className="btn-icon-header"
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setUserDropdownOpen(false);
              }}
              title="Change Language"
              aria-label="Language selector"
            >
              <Globe size={18} />
              <span className="lang-code-badge">{currentLangObj.code.toUpperCase()}</span>
            </button>

            {langDropdownOpen && (
              <div className="lang-dropdown-menu" role="menu">
                <span className="dropdown-label">{t("settings.select_language") || "Select Language"}</span>
                <div className="dropdown-divider" />
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`lang-option-btn ${lang.code === language ? "active" : ""}`}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                  >
                    <span className="lang-native-text">{lang.nativeName}</span>
                    <span className="lang-en-text">({lang.name})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center Bell */}
          <button
            type="button"
            className={`btn-icon-header ${activeTab === "Notifications" ? "active" : ""}`}
            onClick={() => handleNav("Notifications")}
            title="Notification Center"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {/* User Profile Avatar */}
          <div className="user-menu-wrapper">
            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setLangDropdownOpen(false);
              }}
              aria-label="User menu"
              aria-expanded={userDropdownOpen}
            >
              <div className="user-avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-menu" role="menu">
                <div className="dropdown-user-info">
                  <strong>{user?.name || "SafeHer User"}</strong>
                  <span>{user?.email || "user@safeher.org"}</span>
                </div>
                <div className="dropdown-divider" />
                <button type="button" className="dropdown-item" onClick={() => handleNav("Profile")} role="menuitem">
                  <UserRound size={16} />
                  <span>{t("nav.profile") || "Profile"}</span>
                </button>
                <button type="button" className="dropdown-item" onClick={() => handleNav("Trusted Contacts")} role="menuitem">
                  <Users size={16} />
                  <span>{t("nav.contacts") || "Safety Circle"}</span>
                </button>
                <button type="button" className="dropdown-item" onClick={() => handleNav("Settings")} role="menuitem">
                  <Settings size={16} />
                  <span>{t("nav.settings") || "Settings"}</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onLogout();
                  }}
                  role="menuitem"
                >
                  <LogOut size={16} />
                  <span>{t("settings.logout") || "Log Out"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
