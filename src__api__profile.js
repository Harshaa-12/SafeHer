import api from "./client";

export const profileApi = {
  async getProfile() {
    return api.get("/api/profile");
  },

  async updateProfile(profileData) {
    return api.put("/api/profile", profileData);
  },

  async getEmergencyInfo() {
    return api.get("/api/emergency-information");
  },

  async updateEmergencyInfo(emergencyData) {
    return api.put("/api/emergency-information", emergencyData);
  },

  async getSafetyReadiness() {
    return api.get("/api/safety-readiness");
  },

  async getActivity() {
    return api.get("/api/activity");
  },

  async getStats() {
    return api.get("/api/stats");
  },
};

export default profileApi;
