import axios from "axios";
import { ColoredToast } from "../components/Toast";
import {
  loginRoute,
  registerRoute,
  updatePasswordRoute,
  profileRoute,
} from "./routes";

const isProduction = process.env.NODE_ENV === "production";
const baseURL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Prioritize adminToken for admin routes, otherwise use user token
  const token = config.url?.startsWith("/api/5839201")
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("token");
  if (
    token &&
    config.url !== "/api/5839201/login" &&
    config.url !== "/api/user/login"
  ) {
    config.headers.Authorization = token.includes("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  if (!isProduction) {
    console.log("Request config:", {
      url: config.url,
      fullUrl: `${baseURL}${config.url}`,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!isProduction) console.log("Response received:", response.data);
    return response;
  },
  (error) => {
    if (!isProduction) {
      console.error("Response error:", {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
export { loginRoute, registerRoute, updatePasswordRoute, profileRoute };
