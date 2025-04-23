import { create } from "zustand";
import { useAuthStore } from "./auth-store";

type Reservation = {
  table_number: number;
  reservation_date: string;
  num_people: number;
  status: string;
};

type AppStore = {
  reservations: Record<string, Reservation[]>;
  fetchReservations: () => Promise<void>;
};

export const useAppStore = create<AppStore>((set) => ({
  reservations: {},

  fetchReservations: async () => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("API Response:", data);

      let reservationsArray: Reservation[] = [];

      // Handle single reservation object
      if (data && !Array.isArray(data)) {
        reservationsArray = [data]; // Wrap the single object in an array
      } else if (Array.isArray(data)) {
        reservationsArray = data; // Use the array directly
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
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  },
}));
