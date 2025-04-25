import { create } from "zustand";
import { useAuthStore } from "./auth-store";

const BASE_URL = "http://54.79.103.51:8080";

type Reservation = {
  table_number: number;
  reservation_date: string;
  num_people: number;
  status: string;
};

type Category = {
  category_id: string;
  category: string;
  imageURL: string;
};
type MenuItem = {
  menu_id: string;
  name: string;
  description: string;
  price: number;
  img_url: string;
};

type AppStore = {
  loading: boolean;
  reservations: Record<string, Reservation[]>;
  categories: Category[];
  menuItems: MenuItem[];
  error: string | null;
  fetchReservations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: (category: string) => Promise<void>;
  createReservation: (payload: {
    num_people: number;
    table_number: number;
    reservation_date: string;
  }) => Promise<void>;
  cancelReservation: (payload: { reservation_id: string }) => Promise<void>;
};

export const useAppStore = create<AppStore>((set) => ({
  reservations: {},
  categories: [],
  menuItems: [],
  error: null,
  loading: false,

  fetchReservations: async () => {
    set({ error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`${BASE_URL}/reservation/check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.text();

      if (!data) {
        set({ reservations: {} });
        return;
      }

      const parsedData = JSON.parse(data);

      let reservationsArray: Reservation[] = [];

      if (parsedData && !Array.isArray(parsedData)) {
        reservationsArray = [parsedData];
      } else if (Array.isArray(parsedData)) {
        reservationsArray = parsedData;
      } else {
        throw new Error("API response is not valid");
      }

      const transformedReservations = reservationsArray.reduce(
        (acc: Record<string, Reservation[]>, reservation: Reservation) => {
          const date = reservation.reservation_date.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(reservation);
          return acc;
        },
        {}
      );

      set({ reservations: transformedReservations });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`${BASE_URL}/category/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || `HTTP error! status: ${response.status}`
        );
      }

      const data: Category[] = await response.json();
      set({ categories: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchMenuItems: async (category: any) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`${BASE_URL}/menu/view/${category}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || `HTTP error! status: ${response.status}`
        );
      }

      const data: MenuItem[] = await response.json();
      set({ menuItems: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createReservation: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`${BASE_URL}/reservation/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || `HTTP error! status: ${response.status}`);
      }

      await useAppStore.getState().fetchReservations();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false, error: null });
    }
  },

  cancelReservation: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { token } = useAuthStore.getState();

      const response = await fetch(`${BASE_URL}/reservation/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || `HTTP error! status: ${response.status}`);
      }

      await useAppStore.getState().fetchReservations();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
