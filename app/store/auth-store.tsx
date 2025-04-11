import { create } from "zustand";

const BASE_URL = "https://iqueue-eor5.onrender.com";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginStore = {
  loading: boolean;
  token: string | null;
  error: string | null;
  login: (payload: LoginPayload) => Promise<string | null>;
};

export const useAuthStore = create<LoginStore>((set) => ({
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
}));
