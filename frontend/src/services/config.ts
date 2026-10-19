export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ??
  (import.meta.env.DEV ? `http://${window.location.hostname}:3000` : "");