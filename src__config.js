// SafeHer Client Configuration & Constants
import { Capacitor } from "@capacitor/core";

export const IS_NATIVE_ANDROID = typeof window !== "undefined" && Capacitor.getPlatform() === "android";

export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    // 1. Explicit Vite env variable (Production or Dev .env)
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && !envUrl.includes("YOUR_PRODUCTION_API_DOMAIN")) {
      return envUrl.replace(/\/+$/, "");
    }

    // 2. User or tester override stored in localStorage
    const customUrl = localStorage.getItem("safeher_api_url");
    if (customUrl) {
      return customUrl.replace(/\/+$/, "");
    }

    // 3. Android Native Device Environment
    // On physical Android, "localhost" refers to the handset, not the server.
    if (IS_NATIVE_ANDROID) {
      // If no remote URL is configured, we warn that production domain is required.
      // Default to the computer's local Wi-Fi development fallback or placeholder:
      const savedLanIp = localStorage.getItem("safeher_dev_lan_ip");
      if (savedLanIp) {
        return `http://${savedLanIp}:5000`;
      }
      return "PRODUCTION_BACKEND_URL_REQUIRED";
    }

    // 4. Browser environment on computer
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://127.0.0.1:5000";
    }

    if (window.location.hostname) {
      return `http://${window.location.hostname}:5000`;
    }
  }

  return "http://127.0.0.1:5000";
}

export const API_BASE_URL = getApiBaseUrl();

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("safeher_token") || sessionStorage.getItem("safeher_token") || "";
}

export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const EMERGENCY_NUMBERS = [
  {
    number: "112",
    name: "National Emergency Helpline",
    category: "All Emergencies",
    desc: "Single unified 24/7 response center for Police, Fire, and Ambulance across India.",
    color: "#e11d48",
    badge: "24/7 Unified",
    tel: "tel:112",
  },
  {
    number: "181",
    name: "National Women Helpline",
    category: "Women Safety",
    desc: "Toll-free 24-hour helpline dedicated to women affected by violence, distress, or harassment.",
    color: "#db2777",
    badge: "Priority Hotline",
    tel: "tel:181",
  },
  {
    number: "1091",
    name: "Tamil Nadu & National Women Police",
    category: "Police Assistance",
    desc: "Direct rapid response from dedicated women police units, including Singapen Kaval Padai divisions.",
    color: "#7c3aed",
    badge: "Specialized Police",
    tel: "tel:1091",
    note: "Official women safety police helpline. Direct phone link (informational access).",
  },
  {
    number: "108",
    name: "Medical Emergency / Ambulance",
    category: "Medical",
    desc: "Fast medical emergency response and government hospital ambulance dispatch across India.",
    color: "#059669",
    badge: "Medical Response",
    tel: "tel:108",
  },
  {
    number: "1098",
    name: "Childline Emergency Support",
    category: "Child Protection",
    desc: "National 24-hour emergency phone outreach service for children in need of protection.",
    color: "#0284c7",
    badge: "Child Support",
    tel: "tel:1098",
  },
  {
    number: "1930",
    name: "National Cyber Crime Helpline",
    category: "Digital Protection",
    desc: "Assistance with cyber harassment, online stalking, morphing, and digital financial fraud.",
    color: "#475569",
    badge: "Cyber Crime",
    tel: "tel:1930",
  },
];

export const SAFETY_TIPS_DATA = [
  // 1. Travel Safety
  {
    id: 1,
    category: "Travel Safety",
    title: "Verify rideshare vehicle & driver before boarding",
    content: "Confirm that the driver's photo, car model, and license plate match your booking app before stepping inside. Share your live trip status with a trusted primary contact.",
    icon: "Navigation",
  },
  {
    id: 2,
    category: "Travel Safety",
    title: "Stay alert during late-night commutes",
    content: "Avoid using both noise-canceling headphones in public transit or deserted stops. Keep your phone in an easily accessible front pocket, never deep inside a zippered bag.",
    icon: "Compass",
  },
  {
    id: 3,
    category: "Travel Safety",
    title: "Track your route independently on maps",
    content: "Observe road signs and monitor your navigation independently to notice unannounced deviations. Choose well-lit main corridors rather than unmonitored dark shortcuts.",
    icon: "MapPin",
  },

  // 2. Public Place Safety
  {
    id: 4,
    category: "Public Place Safety",
    title: "Identify emergency exits and staffed counters",
    content: "Whenever entering unfamiliar transit hubs, malls, or parking garages, make a mental note of open cash counters, security booths, and illuminated exit pathways.",
    icon: "DoorOpen",
  },
  {
    id: 5,
    category: "Public Place Safety",
    title: "Trust intuition and move toward populated spaces",
    content: "If someone is following you or making you uncomfortable, do not hesitate or second-guess yourself. Step immediately into a well-lit store, pharmacy, or bank ATM booth.",
    icon: "Users",
  },

  // 3. Digital Safety
  {
    id: 6,
    category: "Digital Safety",
    title: "Never share OTPs, passcodes, or live links with callers",
    content: "Scammers frequently pose as delivery executives, police personnel, or ride customer service. Genuine safety authorities will never ask for your verification PINs or passwords.",
    icon: "Lock",
  },
  {
    id: 7,
    category: "Digital Safety",
    title: "Use device emergency SOS hardware triggers",
    content: "Enable your phone's native rapid power button trigger (3 to 5 rapid clicks) in your Android system settings as a quick backup alongside SafeHer.",
    icon: "Smartphone",
  },

  // 4. Online Privacy
  {
    id: 8,
    category: "Online Privacy",
    title: "Delay posting real-time location check-ins",
    content: "Wait until after you have safely departed a venue before sharing photos, stories, or check-ins on social media that expose your routine or present location.",
    icon: "ShieldAlert",
  },
  {
    id: 9,
    category: "Online Privacy",
    title: "Review application location sharing permissions",
    content: "Periodically inspect your phone's App Permissions. Restrict location access for social media and non-essential utilities to 'While Using App' only.",
    icon: "EyeOff",
  },

  // 5. Emergency Preparedness
  {
    id: 10,
    category: "Emergency Preparedness",
    title: "Rehearse periodically using SafeHer Test SOS",
    content: "Use the Safe Demonstration Test mode quarterly to verify that your emergency contacts have current phone numbers and your phone GPS coordinates acquire promptly.",
    icon: "ShieldCheck",
  },
  {
    id: 11,
    category: "Emergency Preparedness",
    title: "Pre-save national 112 and 181 in your phone contacts",
    content: "Ensure 112 is on your speed dial. Keep phone battery above 20% when traveling and consider carrying a compact emergency power bank.",
    icon: "PhoneCall",
  },

  // 6. Personal Safety
  {
    id: 12,
    category: "Personal Safety",
    title: "Walk with purposeful posture and clear awareness",
    content: "Keep your head elevated and look alert. Demonstrating strong situational awareness discourages opportunists who seek out distracted individuals.",
    icon: "HeartHandshake",
  },
];
