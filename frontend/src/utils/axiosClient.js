import axios from "axios"

// Dev talks to the API on port 3000. A production build with no
// VITE_API_BASE_URL uses the same origin under /api, which nginx proxies.
function resolveBaseURL() {
    const configured = import.meta.env.VITE_API_BASE_URL;
    if (configured) return configured;
    return import.meta.env.DEV ? "http://localhost:3000" : "/api";
}

const axiosClient = axios.create({
    baseURL: resolveBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;
