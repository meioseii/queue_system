import { create } from "zustand";

const BASE_URL = "http://54.252.152.233";

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
};

type SendOtpPayload = {
  email: string;
};

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

type ChangePasswordPayload = {
  email: string;
  newPassword: string;
};

type AuthStore = {
  loading: boolean;
  token: string | null;
  changePasswordToken: string | null;
  error: string | null;
  message: string | null;
  email: string | null;
  login: (payload: LoginPayload) => Promise<string>;
  register: (payload: RegisterPayload) => Promise<void>;
  sendOtp: (payload: SendOtpPayload) => Promise<void>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<string>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  loading: false,
  token: null,
  changePasswordToken: null,
  error: null,
  message: null,
  email: null,

  login: async ({ username, password }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Login failed. Please try again.");
      }

      set({ token: data.token });
      return data.token;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  register: async ({ first_name, last_name, username, email, password }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  sendOtp: async ({ email }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "OTP request failed. Please try again.");
      }

      set({ email: data.email });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verifyOtp: async ({ email, otp }) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`${BASE_URL}/customer/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "OTP invalid. Please try again.");
      }

      set({ changePasswordToken: data.token });
      return data.token;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  changePassword: async ({ email, newPassword }) => {
    set({ loading: true, error: null });
    const { changePasswordToken } = useAuthStore.getState(); // Use changePasswordToken instead

    try {
      const response = await fetch(`${BASE_URL}/customer/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${changePasswordToken}`, // Use changePasswordToken
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Change password failed. Please try again."
        );
      }

      set({ changePasswordToken: null, email: null }); // Clear both tokens and email
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ token: null });
    // Optionally, clear any other related state or perform additional cleanup here
    // For example, you might want to clear user data from local storage or reset other stores
    // localStorage.removeItem("userData"); // Example for clearing local storage
  },
}));
