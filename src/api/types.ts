/** Normalized API error parsed from Axios responses when available. */
export interface ApiHttpErrorPayload {
  status: number;
  message: string;
  detail?: unknown;
}

export interface Pagination {
  limit: number;
  page: number;
  pages: number;
  total: number;
}