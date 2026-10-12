import type { AxiosInstance } from "axios";

import { attachRequestInterceptors } from "./request";
import { attachResponseInterceptors } from "./response";

export function attachAxiosInterceptors(api: AxiosInstance): void {
  attachRequestInterceptors(api);
  attachResponseInterceptors(api);
}
