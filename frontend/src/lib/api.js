import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwd_token");
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/order-card")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const errText = (e) => {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || "حدث خطأ";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(" - ");
  return JSON.stringify(d);
};

export default api;
