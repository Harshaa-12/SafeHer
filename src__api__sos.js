import api from "./client";

export const sosApi = {
  async triggerSOS({ latitude, longitude, user_name, is_real = false }) {
    return api.post("/api/sos", {
      latitude,
      longitude,
      user_name,
      confirm_real_sos: is_real,
    });
  },

  async getLatestSOS() {
    return api.get("/api/sos/latest");
  },

  async getSOSHistory() {
    return api.get("/api/sos/history");
  },

  async getSOSNotifications(sosId) {
    return api.get(`/api/sos/${sosId}/notifications`);
  },
};

export default sosApi;
