import axios from "axios";

import { getHttpConfig } from "./config";
import { attachAxiosInterceptors } from "./interceptors";

/** Shared Axios instance for Nexus API calls (`baseURL` from {@link VITE_API_BASE_URL}). */
export const api = axios.create(getHttpConfig());
attachAxiosInterceptors(api);
