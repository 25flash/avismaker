import { ApiClient } from "@louma/shared";
import { useAuthStore } from "../store/authStore";

// For physical devices, replace with your machine's LAN IP, e.g. http://192.168.1.10:3000
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = new ApiClient({
  baseUrl: API_URL,
  getAccessToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
  },
});
