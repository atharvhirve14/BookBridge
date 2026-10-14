import axios from "axios";
const TOKEN_KEY = "bookbridge_token";
export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable – user simply stays signed out after a reload */
  }
}
// In dev the Vite proxy forwards /api to the Express server (see vite.config.js).
// For a separate deployment set VITE_API_URL, e.g. https://api.example.com/api
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
/** Turn an axios error into a message that is safe to show to the user. */
export function errorMessage(err, fallback) {
  if (axios.isAxiosError(err)) {
    if (err.response) return err.response.data?.error ?? fallback;
    return "Network error. Please try again.";
  }
  return fallback;
}
export default api;
