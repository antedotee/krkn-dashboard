import axios from "axios";

import { IS_PREVIEW } from "@/preview/flag";
import { previewAdapter } from "@/preview/mockAdapter";

export const getUrl = () => {
  const { hostname, protocol } = window.location;
  return hostname === "localhost"
    ? "http://localhost:8000"
    : `${protocol}//${hostname}:8000`;
};

const baseURL = getUrl();

const axiosInstance = axios.create({
  responseType: "json",
  baseURL,
  withCredentials: true,
});

// Static PR preview: serve every request from seed fixtures (no backend).
if (IS_PREVIEW) {
  axiosInstance.defaults.adapter = previewAdapter;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      !IS_PREVIEW &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const path = window.location.pathname || "";
      if (!path.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
