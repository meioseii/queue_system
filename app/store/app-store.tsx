import { create } from "zustand";
import { useAuthStore } from "./auth-store";

type Reservation = {
  table_number: number;
  reservation_date: string;
  num_people: number;
  status: string;
};

type AppStore = {
  loading: boolean;
  reservations: Record<string, Reservation[]>;
  error: string | null;
  fetchReservations: () => Promise<void>;
  createReservation: (payload: {
    num_people: number;
    table_number: number;
    reservation_date: string;
  }) => Promise<void>;
  cancelReservation: (payload: { reservation_id: string }) => Promise<void>;
};

export const useAppStore = create<AppStore>((set) => ({
  reservations: {},
  error: null,
  loading: false,

  fetchReservations: async () => {
    set({ error: null }); // Clear previous errors
    try {
      const { token } = useAuthStore.getState(); // Get the token from auth-store
      const response = await fetch(
        "http://54.79.103.51:8080/reservation/check",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.msg || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.text(); // Use text() instead of json() to handle empty responses

      if (!data) {
        console.warn("API returned an empty response.");
        set({ reservations: {} }); // Set reservations to an empty object
        return;
      }

      const parsedData = JSON.parse(data); // Parse the JSON response

      let reservationsArray: Reservation[] = [];

      // Handle single reservation object
      if (parsedData && !Array.isArray(parsedData)) {
        reservationsArray = [parsedData]; // Wrap the single object in an array
      } else if (Array.isArray(parsedData)) {
        reservationsArray = parsedData; // Use the array directly
      } else {
        throw new Error("API response is not valid");
      }

      // Transform the data into a format suitable for the calendar
      const transformedReservations = reservationsArray.reduce(
        (acc: Record<string, Reservation[]>, reservation: Reservation) => {
          const date = reservation.reservation_date.split("T")[0]; // Extract the date part
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
      set({ error: error.message }); // Set the error message
    } finally {
      set({ loading: false, error: null });
    }
  },

  createReservation: async (payload) => {
    set({ loading: true, error: null }); // Clear previous errors
    try {
      const { token } = useAuthStore.getState(); // Get the token from auth-store
      const response = await fetch(
        "http://54.79.103.51:8080/reservation/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(payload), // Send the payload as JSON
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || `HTTP error! status: ${response.status}`);
      }

      await useAppStore.getState().fetchReservations();
    } catch (error: any) {
      set({ error: error.message }); // Set the error message
      throw error; // Re-throw the error if needed
    } finally {
      set({ loading: false, error: null });
    }
  },

  cancelReservation: async (payload) => {
    set({ loading: true, error: null }); // Clear previous errors
    try {
      const { token } = useAuthStore.getState(); // Get the token from auth-store

      const response = await fetch(
        `http://54.79.103.51:8080/reservation/cancel`,
        {
          method: "PATCH", // Use PATCH as specified
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(payload), // Send the payload as JSON
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || `HTTP error! status: ${response.status}`);
      }

      await useAppStore.getState().fetchReservations();
    } catch (error: any) {
      set({ error: error.message }); // Set the error message
      throw error; // Re-throw the error if needed
    } finally {
      set({ loading: false });
    }
  },
}));
