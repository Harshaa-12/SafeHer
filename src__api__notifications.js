import api from "./client";

export const notificationsApi = {
  async getNotifications({ channel = "all", status = "all", limit = 50 } = {}) {
    let url = `/api/notifications?limit=${limit}`;
    if (channel && channel !== "all") url += `&channel=${encodeURIComponent(channel)}`;
    if (status && status !== "all") url += `&status=${encodeURIComponent(status)}`;
    return api.get(url);
  },
};

export default notificationsApi;
