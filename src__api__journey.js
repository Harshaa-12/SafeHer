import api from "./client";

export const journeyApi = {
  async getActiveJourney() {
    return api.get("/api/journey/active");
  },

  async startJourney({ destination, duration_minutes, contact_id, latitude, longitude }) {
    return api.post("/api/journey", {
      destination,
      duration_minutes,
      contact_id,
      latitude,
      longitude,
    });
  },

  async arriveJourney(id) {
    return api.post(`/api/journey/${id}/arrive`);
  },

  async extendJourney(id, extra_minutes = 15) {
    return api.post(`/api/journey/${id}/extend`, { extra_minutes });
  },

  async cancelJourney(id) {
    return api.post(`/api/journey/${id}/cancel`);
  },

  async getJourneyHistory() {
    return api.get("/api/journey/history");
  },
};

export default journeyApi;
