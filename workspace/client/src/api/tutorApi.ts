import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Helper to inject auth token in headers
function getAuthHeaders() {
  const token = localStorage.getItem("tm_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Fetch tutor profile
export async function fetchTutorProfile() {
  try {
    const response = await axios.get(`${API_BASE_URL}/tutor/profile`, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

// Update tutor profile
export async function updateTutorProfile(profileData: { bio?: string; subjects?: string[]; availability?: any[] }) {
  try {
    const response = await axios.put(`${API_BASE_URL}/tutor/profile`, profileData, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

// Get tutor bookings
export async function fetchTutorBookings() {
  try {
    const response = await axios.get(`${API_BASE_URL}/tutor/bookings`, getAuthHeaders());
    return response.data.data;
  } catch (error) {
    throw error;
  }
}

// Update booking status (confirm, cancel, complete, etc.)
export async function updateTutorBookingStatus(bookingId: string, status: string) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/tutor/bookings/${bookingId}/status`,
      { status },
      getAuthHeaders()
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
