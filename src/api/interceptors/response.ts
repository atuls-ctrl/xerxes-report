import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { isAxiosError } from "axios";

import { requestLoadingState } from "./request";

function finishGlobalLoading(config?: InternalAxiosRequestConfig): void {
  if (!config) return;

  const state = requestLoadingState.get(config);
  if (!state) return;

  clearTimeout(state.timerId);
  requestLoadingState.delete(config);

}

export function attachResponseInterceptors(api: AxiosInstance): void {
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      finishGlobalLoading(response.config);
      return response;
    },
    (error: unknown) => {
      if (isAxiosError(error)) {
        finishGlobalLoading(error.config);
      }

      if (isAxiosError(error) && error.response?.status === 401) {
        const requestUrl = error.config?.url ?? "";
        // `/auth/me` is handled by UserSessionProvider.refresh so an in-flight
        // boot check cannot wipe a session just established by OTP login.
        const isMeRequest = requestUrl.includes("/auth/me");
        if (!isMeRequest) {
          // TODO: clear the user session and redirect to login.
        }
      }
      throw error;
    },
  );
}
