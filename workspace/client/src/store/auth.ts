import { create } from "zustand";
import api from "../api/api";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signup: (
    payload: { name: string; email: string; password: string; role: string }
  ) => Promise<"student" | "tutor">;
  login: (
    payload: { email: string; password: string; role: string }
  ) => Promise<"student" | "tutor">;
  logout: () => void;
  restoreSession: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,

  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem("tm_user", JSON.stringify(user));
    else localStorage.removeItem("tm_user");
  },

  signup: async (payload) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/signup", payload);
      localStorage.setItem("tm_token", res.data.token);
      localStorage.setItem("tm_user", JSON.stringify(res.data.user));
      set({ user: res.data.user, loading: false });
      return res.data.user.role;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  login: async (payload) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", payload);
      localStorage.setItem("tm_token", res.data.token);
      localStorage.setItem("tm_user", JSON.stringify(res.data.user));
      set({ user: res.data.user, loading: false });
      return res.data.user.role;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
    set({ user: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem("tm_token");
    const userStr = localStorage.getItem("tm_user");

    // 👇 Yeh check aur catch dhyan se lagao!
    if (!token || !userStr || userStr === "undefined" || userStr.trim() === "") {
      set({ user: null, loading: false });
      return;
    }

    set({ loading: true });
    try {
      // ⚡ Optionally verify token with backend:
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data.user, loading: false });
      localStorage.setItem("tm_user", JSON.stringify(res.data.user));
    } catch {
      localStorage.removeItem("tm_token");
      localStorage.removeItem("tm_user");
      set({ user: null, loading: false });
    }
  },
}));
