export type PaginatedResult<Key extends string = "users", T = unknown> = {
  [K in Key]: T[];
} & {
  total: number;
  page: number;
  limit: number;
};

export type BaseResultQuery<T = unknown> = {
  data: T;
};

export type FileType = {
  filename: string;
  originalname: string;
  size: number;
};
