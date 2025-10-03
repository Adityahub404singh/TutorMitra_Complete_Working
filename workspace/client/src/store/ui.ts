import { create } from "zustand";

interface UIState {
  bookingOpen: boolean;
  openBooking: () => void;
  closeBooking: () => void;
  // add more UI flags or controls as needed
}

export const useUI = create<UIState>((set) => ({
  bookingOpen: false,
  openBooking: () => set({ bookingOpen: true }),
  closeBooking: () => set({ bookingOpen: false }),
}));
