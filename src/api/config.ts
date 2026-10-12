import type { AxiosError } from "axios";
import type { ApiHttpErrorPayload } from "./types";

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/** Public API URL; configure via `VITE_API_BASE_URL`. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw + "/api/v1";
}

export function getHttpConfig() {
  return {
    withCredentials: true,
    timeout: DEFAULT_TIMEOUT_MS,
    baseURL: getApiBaseUrl(),
    headers: {
      Accept: "application/json",
      // "Content-Type": "application/json",
    },
  } as const;
}

/** Use in `catch` blocks on results from {@link ../client#api}; narrows Axios failures. */
export function toApiHttpErrorPayload(err: AxiosError): ApiHttpErrorPayload {
  const status = err.response?.status ?? 0;
  const data = err.response?.data;

  let message =
    err.message ||
    (typeof navigator !== "undefined" && !navigator.onLine
      ? "You appear to be offline."
      : "Request failed.");

  if (typeof data === "object" && data !== null) {
    const top = data as { message?: unknown; error?: unknown };
    if (typeof top.message === "string") {
      message = top.message;
    } else if (
      typeof top.error === "object" &&
      top.error !== null &&
      typeof (top.error as { message?: unknown }).message === "string"
    ) {
      message = (top.error as { message: string }).message;
    }
  } else if (typeof err.response?.statusText === "string" && err.response.statusText) {
    message = err.response.statusText;
  }

  const payload: ApiHttpErrorPayload = {
    status,
    message,
  };
  if (data !== undefined) {
    payload.detail = data;
  }
  return payload;
}
