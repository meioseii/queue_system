import { create } from "zustand";
import { useAuthStore } from "./auth-store";

const BASE_URL = "http://54.252.152.233";

type Reservation = {
  table_number: number;
  reservation_date: string;
  num_people: number;
  status: string;
};

export type Category = {
  category_id: string;
  category: string;
  imageURL: string;
};

export type MenuItem = {
  menu_id: string;
  name: string;
  description: string;
  price: number;
  img_url: string;
};

type UserInfo = {
  customer_id: string;
  first_Name: string;
  last_Name: string;
  email: string;
  username: string;
};

export type CartItem = {
  product_id: string;
  name: string;
  quantity: number;
  price?: number;
  img_url?: string;
};

type LoadingState = {
  fetchReservations: boolean;
  fetchCategories: boolean;
  fetchMenuItems: boolean;
  fetchAllMenuItems: boolean;
  fetchUserProfile: boolean;
  editUserProfile: boolean;
  createReservation: boolean;
  cancelReservation: boolean;
  addToCart: boolean;
  updateCart: boolean;
  deleteCart: boolean;
  fetchCart: boolean;
};

type AppStore = {
  loadingStates: LoadingState;
  reservations: Record<string, Reservation[]>;
  categories: Category[];
  menuItems: MenuItem[];
  allMenuItems: MenuItem[];
  cartItems: CartItem[];
  userInfo: UserInfo | null;
  error: string | null;
  fetchReservations: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: (category: string) => Promise<void>;
  fetchAllMenuItems: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  editUserProfile: (payload: {
    email: string;
    first_Name: string;
    last_Name: string;
    username: string;
  }) => Promise<void>;
  createReservation: (payload: {
    num_people: number;
    table_number: number;
    reservation_date: string;
  }) => Promise<void>;
  cancelReservation: (payload: { reservation_id: string }) => Promise<void>;
  addToCart: (payload: CartItem) => Promise<void>;
  updateCartItem: (menuId: string, action: "add" | "deduct") => Promise<void>;
  deleteCartItem: (menuId: string) => Promise<void>;
  fetchCart: () => Promise<void>;
};

const initialLoadingState: LoadingState = {
  fetchReservations: false,
  fetchCategories: false,
  fetchMenuItems: false,
  fetchAllMenuItems: false,
  fetchUserProfile: false,
  editUserProfile: false,
  createReservation: false,
  cancelReservation: false,
  addToCart: false,
  updateCart: false,
  deleteCart: false,
  fetchCart: false,
};

// API request wrapper with error handling
const apiRequest = async (
  url: string,
  options: RequestInit,
  loadingKey: keyof LoadingState,
  set: any
) => {
  set((state: AppStore) => ({
    loadingStates: { ...state.loadingStates, [loadingKey]: true },
    error: null,
  }));

  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.msg || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error: any) {
    set({ error: error.message });
    throw error;
  } finally {
    set((state: AppStore) => ({
      loadingStates: { ...state.loadingStates, [loadingKey]: false },
    }));
  }
};

export const useAppStore = create<AppStore>((set) => ({
  loadingStates: initialLoadingState,
  reservations: {},
  categories: [],
  menuItems: [],
  allMenuItems: [],
  cartItems: [],
  userInfo: null,
  error: null,

  fetchReservations: async () => {
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/reservation/check",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchReservations",
        set
      );

      const transformedReservations = transformReservationsData(data);
      set({ reservations: transformedReservations });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  fetchCategories: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchCategories: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/category/all",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchCategories",
        set
      );
      set({ categories: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  fetchMenuItems: async (category) => {
    set({ loadingStates: { ...initialLoadingState, fetchMenuItems: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        `/menu/view/${category}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchMenuItems",
        set
      );
      set({ menuItems: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  fetchAllMenuItems: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchAllMenuItems: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        `/menu/all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchAllMenuItems",
        set
      );
      set({ allMenuItems: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  fetchUserProfile: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchUserProfile: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/customer/view-profile",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchUserProfile",
        set
      );
      set({ userInfo: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  editUserProfile: async (payload) => {
    set({ loadingStates: { ...initialLoadingState, editUserProfile: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/customer/update-profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        "editUserProfile",
        set
      );
      set({ userInfo: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  createReservation: async (payload) => {
    set({ loadingStates: { ...initialLoadingState, createReservation: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/reservation/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        "createReservation",
        set
      );
      await useAppStore.getState().fetchReservations();
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  cancelReservation: async (payload) => {
    set({ loadingStates: { ...initialLoadingState, cancelReservation: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/reservation/cancel",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        "cancelReservation",
        set
      );
      await useAppStore.getState().fetchReservations();
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  addToCart: async (payload: CartItem) => {
    set({ loadingStates: { ...initialLoadingState, addToCart: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify([payload]),
        },
        "addToCart",
        set
      );
      await useAppStore.getState().fetchCart();
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  updateCartItem: async (menuId: string, action: "add" | "deduct") => {
    set({ loadingStates: { ...initialLoadingState, updateCart: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/cart/update",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menuId,
            action,
          }),
        },
        "updateCart",
        set
      );
      await useAppStore.getState().fetchCart();
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  deleteCartItem: async (menuId: string) => {
    set({ loadingStates: { ...initialLoadingState, deleteCart: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/cart/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            menuId,
          }),
        },
        "deleteCart",
        set
      );
      await useAppStore.getState().fetchCart();
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  fetchCart: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchCart: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/cart/view",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchCart",
        set
      );
      set({ cartItems: data });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },
}));

// Utility function to transform reservations data
const transformReservationsData = (
  data: any
): Record<string, Reservation[]> => {
  let reservationsArray: Reservation[] = [];

  if (!data) return {};

  if (typeof data === "object" && !Array.isArray(data)) {
    reservationsArray = [data];
  } else if (Array.isArray(data)) {
    reservationsArray = data;
  } else {
    throw new Error("API response is not valid");
  }

  return reservationsArray.reduce(
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
};
