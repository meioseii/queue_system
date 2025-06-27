import { create } from "zustand";
import { useAuthStore } from "./auth-store";

const BASE_URL = "http://54.252.152.233";

type Reservation = {
  table_number: number;
  reservation_date: string;
  num_people: number;
  status: string;
};

type QueueInfo = {
  queue_id: string;
  queueing_number: string;
  num_people: number;
  status: string;
  tier: number;
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

// Add RunningBill type
type RunningBillData = {
  orderDate: string;
  tableNumber: number;
  orders: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
};

// Add these types to your existing types
type OrderHistoryItem = {
  id: string;
  orderDate: string;
  tableNumber: number;
  orders: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
};

type OrderHistoryDetail = {
  id: string;
  orderDate: string;
  tableNumber: number;
  orders: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
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
  checkout: boolean;
  createQueue: boolean;
  checkQueue: boolean;
  cancelQueue: boolean;
  checkLastSeated: boolean;
  doneQueue: boolean;
  fetchRunningBill: boolean; // Add this
  fetchOrderHistory: boolean;
  fetchOrderHistoryById: boolean;
};

type LastSeatedQueue = {
  id: string;
  tableNumber: number;
  queueingNumber: string;
  tier: number;
};

export type AppStore = {
  loadingStates: LoadingState;
  reservations: Record<string, Reservation[]>;
  categories: Category[];
  menuItems: MenuItem[];
  allMenuItems: MenuItem[];
  cartItems: CartItem[];
  userInfo: UserInfo | null;
  error: string | null;
  currentQueue: QueueInfo | null;
  lastSeatedQueue: LastSeatedQueue | null;
  runningBillData: RunningBillData | null; // Add this
  orderHistory: OrderHistoryItem[];
  orderHistoryDetail: OrderHistoryDetail | null;
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
  checkout: () => Promise<void>;
  createQueue: (payload: {
    num_people: number;
    accessCode: string;
  }) => Promise<void>;
  checkQueueStatus: () => Promise<QueueInfo>;
  checkLastSeated: (tier: number) => Promise<void>;
  cancelQueue: () => Promise<void>;
  clearQueue: () => void;
  doneQueue: () => Promise<void>;
  fetchRunningBill: () => Promise<void>; // Add this
  completeOrder: () => Promise<void>; // Add this
  fetchOrderHistory: () => Promise<void>;
  fetchOrderHistoryById: (id: string) => Promise<void>;
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
  checkout: false,
  createQueue: false,
  checkQueue: false,
  cancelQueue: false,
  checkLastSeated: false,
  doneQueue: false,
  fetchRunningBill: false, // Add this
  fetchOrderHistory: false,
  fetchOrderHistoryById: false,
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

export const useAppStore = create<AppStore>((set, get) => ({
  loadingStates: initialLoadingState,
  reservations: {},
  categories: [],
  menuItems: [],
  allMenuItems: [],
  cartItems: [],
  userInfo: null,
  error: null,
  currentQueue: null,
  lastSeatedQueue: null,
  runningBillData: null, // Add this
  orderHistory: [],
  orderHistoryDetail: null,

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

      // Refresh reservations after successful creation
      await useAppStore.getState().fetchReservations();

      return data; // Return the data for success handling
    } catch (error) {
      // Re-throw the error so it can be caught in the component
      throw error;
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

      // Add this line to refresh reservations after successful cancellation
      await useAppStore.getState().fetchReservations();

      return data; // Return the data for success handling
    } catch (error) {
      // Re-throw the error so it can be caught in the component
      throw error;
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

  checkout: async () => {
    set({ loadingStates: { ...initialLoadingState, checkout: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/orders/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "checkout",
        set
      );
      // Clear cart after successful checkout
      set({ cartItems: [] });
    } catch (error) {
      // Error already handled by apiRequest
    }
  },

  createQueue: async (payload) => {
    set({ loadingStates: { ...initialLoadingState, createQueue: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/queue/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
        "createQueue",
        set
      );
      set({ currentQueue: data });
    } catch (error) {
      throw error;
    }
  },

  clearQueue: () => {
    set({ currentQueue: null });
  },

  checkQueueStatus: async () => {
    set({ loadingStates: { ...initialLoadingState, checkQueue: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/queue/check",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "checkQueue",
        set
      );

      // Update current queue with latest status
      set({ currentQueue: data });

      return data;
    } catch (error) {
      // If the request fails (e.g., no active queue), clear the queue state
      set({ currentQueue: null });
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, checkQueue: false },
      }));
    }
  },

  cancelQueue: async () => {
    set({ loadingStates: { ...initialLoadingState, cancelQueue: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/queue/cancel",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "cancelQueue",
        set
      );

      // Clear queue state after successful cancellation
      get().clearQueue();
    } catch (error) {
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, cancelQueue: false },
      }));
    }
  },

  checkLastSeated: async (tier: number) => {
    set({ loadingStates: { ...initialLoadingState, checkLastSeated: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        `/queue/last-seated/${tier}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "checkLastSeated",
        set
      );
      set({ lastSeatedQueue: data });
    } catch (error) {
      console.error("Error checking last seated queue:", error);
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, checkLastSeated: false },
      }));
    }
  },

  doneQueue: async () => {
    set({ loadingStates: { ...initialLoadingState, doneQueue: true } });
    try {
      const { token } = useAuthStore.getState();
      await apiRequest(
        "/queue/done",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "doneQueue",
        set
      );

      // Clear queue state after successful completion
      get().clearQueue();
    } catch (error) {
      throw error;
    } finally {
      set((state) => ({
        loadingStates: { ...state.loadingStates, doneQueue: false },
      }));
    }
  },

  // Add the new fetchRunningBill function
  fetchRunningBill: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchRunningBill: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/customer/order-history/orders",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchRunningBill",
        set
      );
      set({ runningBillData: data });
    } catch (error) {
      // Error already handled by apiRequest
      throw error;
    }
  },

  // Add the new completeOrder function
  completeOrder: async () => {
    try {
      await get().doneQueue();
      // Clear running bill data after successful completion
      set({ runningBillData: null });
    } catch (error) {
      throw error;
    }
  },

  // Add the new methods
  fetchOrderHistory: async () => {
    set({ loadingStates: { ...initialLoadingState, fetchOrderHistory: true } });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        "/customer/order-history/paid",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchOrderHistory",
        set
      );
      set({ orderHistory: data });
    } catch (error) {
      // Error already handled by apiRequest
      throw error;
    }
  },

  fetchOrderHistoryById: async (id: string) => {
    set({
      loadingStates: { ...initialLoadingState, fetchOrderHistoryById: true },
    });
    try {
      const { token } = useAuthStore.getState();
      const data = await apiRequest(
        `/customer/order-history/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        "fetchOrderHistoryById",
        set
      );
      set({ orderHistoryDetail: data });
    } catch (error) {
      // Error already handled by apiRequest
      throw error;
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
