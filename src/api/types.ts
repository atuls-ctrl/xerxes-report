/** Normalized API error parsed from Axios responses when available. */
export type ApiHttpErrorPayload = {
  status: number;
  message: string;
  detail?: unknown;
};

export type Pagination = {
  limit: number;
  page: number;
  pages: number;
  total: number;
};