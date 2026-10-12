import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const GLOBAL_LOADING_DELAY_MS = 0;

export interface RequestLoadingState {
  timerId: ReturnType<typeof setTimeout>;
  visible: boolean;
}

export const requestLoadingState = new WeakMap<
  InternalAxiosRequestConfig,
  RequestLoadingState
>();

export function attachRequestInterceptors(api: AxiosInstance): void {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const state: RequestLoadingState = {
        timerId: setTimeout(() => {
          // state.visible = true;
          // store.dispatch(startGlobalLoading());
        }, GLOBAL_LOADING_DELAY_MS),
        visible: false,
      };

      requestLoadingState.set(config, state);
      return config;
    },
    (error: unknown) => {
      throw error;
    },
  );
}
