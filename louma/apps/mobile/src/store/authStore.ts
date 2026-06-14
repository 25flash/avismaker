import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Account } from "@louma/shared";

const STORAGE_KEY = "louma.auth";

interface User {
  id: string;
  phone: string;
  fullName: string;
  kycLevel: number;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  account: Account | null;
  isReady: boolean;
  setSession: (session: { accessToken: string; refreshToken: string; user: User; account: Account }) => Promise<void>;
  setAccount: (account: Account) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  account: null,
  isReady: false,

  async setSession(session) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    set({ ...session });
  },

  setAccount(account) {
    const current = get();
    set({ account });
    if (current.accessToken && current.refreshToken && current.user) {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accessToken: current.accessToken,
          refreshToken: current.refreshToken,
          user: current.user,
          account,
        }),
      ).catch(() => undefined);
    }
  },

  async logout() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ accessToken: null, refreshToken: null, user: null, account: null });
  },

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        set({ ...session, isReady: true });
        return;
      }
    } catch {
      // ignore corrupt storage
    }
    set({ isReady: true });
  },
}));
