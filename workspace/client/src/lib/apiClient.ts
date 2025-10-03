import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Your backend API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // get token from localStorage
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`; // attach token in header
  }
  return config;
});

export default apiClient;
