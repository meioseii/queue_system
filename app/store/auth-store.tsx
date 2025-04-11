import { create } from "zustand";

const BASE_URL = "https://iqueue-eor5.onrender.com";

type AuthPayload = {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
};

type AuthStore = {
  loading: boolean;
  token: string | null;
  error: string | null;
  login: (payload: AuthPayload) => Promise<string | null>;
  register: (payload: AuthPayload) => Promise<string | null>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  loading: false,
  token: null,
  error: null,

  login: async ({ username, password }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("INVALID CREDENTIALS");
      }

      const data = await response.json();
      set({ token: data.token });
      return data.token;
    } catch (err: any) {
      set({ error: err.msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async ({ first_name, last_name, username, email, password }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/new-customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("PLEASE TRY AGAIN LATER");
      }

      const data = await response.json();
      set({ token: data.token });
      return data.token;
    } catch (err: any) {
      set({ error: err.msg });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
