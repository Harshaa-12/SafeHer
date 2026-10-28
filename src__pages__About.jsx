import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Code2,
  Database,
  Server,
  Layers,
  Sparkles,
  Lock,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import safeherLogo from "../assets/branding/safeher-logo-full.png";

export default function About({ onNavigate }) {
  const { t } = useLanguage();
  return (
    <div className="about-page">
      {/* Title */}
      <div className="about-heading">
        <div>
          <p className="about-eyebrow">ABOUT SAFEHER</p>
          <h2>About SafeHer</h2>
          <p className="about-brand-tagline">Safety. Always Within Reach.</p>
        </div>
        <img src={safeherLogo} alt="SafeHer logo" className="about-logo-img" />
      </div>

      {/* Official Product Description */}
      <div className="about-card about-description-card">
        <p className="about-description-text">
          SafeHer is a personal safety and emergency preparedness platform that helps users prepare for emergencies, stay connected with trusted contacts, manage location-based assistance, initiate SOS support when required, access official emergency resources, and review safety activity.
        </p>
      </div>

      {/* Problem & Solution Block */}
      <div className="about-grid-2">
        <div className="about-card">
          <div className="about-card-badge problem">The Challenge</div>
          <h3 className="about-card-title">Women's Safety in Transit & Urban Spaces</h3>
          <p className="about-card-text">
            Women frequently navigate transit, late-night travel, and unfamiliar locations with heightened vulnerability.
            During critical emergencies, delays in locating accurate GPS coordinates, dialing multiple emergency numbers,
            or alerting panic-stricken family members can lead to devastating response lags.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-badge solution">The SafeHer Solution</div>
          <h3 className="about-card-title">An Integrated, Dual-Mode Safety Network</h3>
          <p className="about-card-text">
            SafeHer unites instantaneous geolocation retrieval, a dual-mode emergency engine (safe rehearsal test mode vs. real verified emergency dispatch), verified national hotline quick-dialers, and granular trusted contact circles with SMS & WhatsApp consent.
          </p>
        </div>
      </div>

      {/* Core Technology Stack */}
      <div className="about-tech-section">
        <h3 className="section-title-sm">Technology Architecture</h3>
        <p className="section-sub-sm">Modern, lightweight, scalable stack with zero bloated dependencies</p>

        <div className="tech-cards-grid">
          <div className="tech-spec-card">
            <div className="tech-spec-icon react">
              <Code2 size={24} />
            </div>
            <h4>Frontend</h4>
            <span className="tech-name">React 19 & Vite</span>
            <p>High-performance component architecture, Lucide icons, responsive CSS design system, and Leaflet OpenStreetMap integration.</p>
          </div>

          <div className="tech-spec-card">
            <div className="tech-spec-icon flask">
              <Server size={24} />
            </div>
            <h4>Backend</h4>
            <span className="tech-name">Python Flask</span>
            <p>RESTful API endpoints, CORS handling, password hashing via Werkzeug, input validation, and asynchronous dispatch coordination.</p>
          </div>

          <div className="tech-spec-card">
            <div className="tech-spec-icon sqlite">
              <Database size={24} />
            </div>
            <h4>Database</h4>
            <span className="tech-name">SQLite3</span>
            <p>Embedded, zero-config relational store with idempotent migrations for contacts, location updates, SOS incidents, and activity logs.</p>
          </div>

          <div className="tech-spec-card">
            <div className="tech-spec-icon integrations">
              <Layers size={24} />
            </div>
            <h4>External Services</h4>
            <span className="tech-name">MSG91 & Meta Cloud API</span>
            <p>Integration-ready service abstractions for SMS flow dispatch and Meta WhatsApp Cloud API template messaging with delivery webhooks.</p>
          </div>
        </div>
      </div>

      {/* Feature Implementation Matrix (Requirement 29) */}
      <div className="about-matrix-card">
        <h3 className="section-title-sm">Feature Implementation & Readiness Matrix</h3>
        <p className="section-sub-sm">Clear transparency on implemented vs. integration-ready features</p>

        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Feature / Subsystem</th>
                <th>Category</th>
                <th>Status</th>
                <th>Technical Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Smart Dual-Mode SOS Engine</strong></td>
                <td>Emergency Dispatch</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>Test mode (zero external alerts) & Real mode with confirmation safeguards.</td>
              </tr>
              <tr>
                <td><strong>Trusted Contacts CRUD & Priorities</strong></td>
                <td>User Circle</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>Add, edit, delete, search, primary priority, and channel consent checkboxes.</td>
              </tr>
              <tr>
                <td><strong>Live GPS & Interactive Map</strong></td>
                <td>Geolocation</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>Browser Geolocation API + Leaflet OpenStreetMap preview with Google Maps links.</td>
              </tr>
              <tr>
                <td><strong>Verified Emergency Helplines</strong></td>
                <td>Official Response</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>One-click direct dialing to 112, 181, 1091, 1098, 108, and 1930.</td>
              </tr>
              <tr>
                <td><strong>Profile & Completion Gauge</strong></td>
                <td>Account</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>Real-time completion percentage calculated strictly from filled fields.</td>
              </tr>
              <tr>
                <td><strong>SOS Incident Audit Log</strong></td>
                <td>Auditing</td>
                <td><span className="matrix-pill implemented">Implemented</span></td>
                <td>Per-event inspection, recipient notification statuses, and error reporting.</td>
              </tr>
              <tr>
                <td><strong>MSG91 SMS Integration</strong></td>
                <td>Messaging Channel</td>
                <td><span className="matrix-pill integration-ready">Integration Ready</span></td>
                <td>Flow API payload and error handling implemented; requires active auth key in <code>.env</code>.</td>
              </tr>
              <tr>
                <td><strong>Meta WhatsApp Cloud API</strong></td>
                <td>Messaging Channel</td>
                <td><span className="matrix-pill integration-ready">Integration Ready</span></td>
                <td>Template messaging & delivery webhook verification built; requires Meta tokens in <code>.env</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demonstration Guide */}
      <div className="about-demo-guide-card">
        <h3 className="section-title-sm">Evaluator / Project Guide Demonstration Flow</h3>
        <p className="section-sub-sm">Follow this recommended flow for a polished presentation:</p>

        <div className="demo-flow-steps">
          <div className="demo-step-badge">1. Landing Experience</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">2. Secure Sign In</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">3. Dashboard & Preparedness</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">4. Contacts & Consents</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">5. Live GPS Map</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">6. Safe Test SOS</div>
          <span className="demo-flow-arrow">&rarr;</span>
          <div className="demo-step-badge">7. SOS History Review</div>
        </div>
      </div>
    </div>
  );
}
