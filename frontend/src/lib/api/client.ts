import axios from "axios";

const API_BASE_URL = "http://localhost:5170/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    referralCode?: string;
  }) => api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: { name: string; phone: string }) =>
    api.put("/auth/profile", data),
};

export const notificationsAPI = {
  registerFcmToken: (token: string) =>
    api.post("/auth/fcm-token", { token }),
  removeFcmToken: (token: string) =>
    api.delete("/auth/fcm-token", { data: { token } }),
  getPreferences: () => api.get("/auth/notification-preferences"),
  updatePreferences: (prefs: {
    appointmentUpdates?: boolean;
    bidUpdates?: boolean;
    priceDrops?: boolean;
    chatMessages?: boolean;
  }) => api.put("/auth/notification-preferences", prefs),
};

export const carsAPI = {
  search: (params: Record<string, string | number>) =>
    api.get("/cars", { params }),
  getFeatured: () => api.get("/cars/featured"),
  getById: (id: string) => api.get(`/cars/${id}`),
  create: (data: any) => api.post("/cars", data),
  getMyListings: () => api.get("/cars/my-listings"),
  update: (id: string, data: any) => api.put(`/cars/${id}`, data),
  delete: (id: string) => api.delete(`/cars/${id}`),
};

export const appointmentsAPI = {
  create: (data: any) => api.post("/appointments", data),
  getMy: () => api.get("/appointments"),
  getById: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const referralsAPI = {
  generateCode: () => api.post("/referrals/generate-code"),
  getStats: () => api.get("/referrals/stats"),
  applyCode: (code: string) => api.post("/referrals/apply", { code }),
};

export const walletAPI = {
  getWallet: () => api.get("/wallet"),
  redeem: (amount: number, description: string) =>
    api.post("/wallet/redeem", { amount, description }),
};

export const wishlistAPI = {
  toggle: (carId: string) => api.post("/wishlist/toggle", { carId }),
  getAll: () => api.get("/wishlist"),
  check: (carId: string) => api.get(`/wishlist/check/${carId}`),
  getCount: () => api.get("/wishlist/count"),
};

export default api;
