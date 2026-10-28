import api from "./client";

export const locationApi = {
  async updateLocation(latitude, longitude) {
    return api.post("/api/location", { latitude, longitude });
  },

  async getLatestLocation() {
    return api.get("/api/location/latest");
  },
};

export default locationApi;
