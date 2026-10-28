// Safe Ride Integration-Ready Architecture (Uber / Ola / Rapido / Namma Yatri)
// Honest provider reporting: Does not fabricate taxi dispatch when external API is unconfigured.

export const safeRideApi = {
  getProviders() {
    return [
      {
        id: "uber",
        name: "Uber SafeRide",
        category: "Rideshare",
        status: "NOT_CONFIGURED",
        details: "Requires Uber Developer API Client ID & Server Token.",
      },
      {
        id: "ola",
        name: "Ola Emergency Cabs",
        category: "Rideshare",
        status: "NOT_CONFIGURED",
        details: "Requires Ola Corporate Partner API credentials.",
      },
      {
        id: "namma_yatri",
        name: "ONDC / Namma Yatri Open Network",
        category: "Open Mobility (India)",
        status: "NOT_CONFIGURED",
        details: "Requires Beckn protocol gateway endpoint.",
      },
    ];
  },

  async estimateRide({ pickup, dropoff }) {
    // Integration-ready hook
    return {
      configured: false,
      message: "Ride integrations are not configured yet.",
      pickup,
      dropoff,
      providers: this.getProviders(),
    };
  },
};

export default safeRideApi;
