export type MaterialType = {
  id: string;
  image: string;
  code: string;
  name: string;
  count: number;
  unit: string;
  origin: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MaterialFilterInput = {
  page: number;
  limit: number;
  name?: string;
};
