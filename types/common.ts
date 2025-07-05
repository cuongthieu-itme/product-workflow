export type PaginatedResult<Key extends string = "users", T = unknown> = {
  [K in Key]: T[];
} & {
  total: number;
  page: number;
  limit: number;
};
