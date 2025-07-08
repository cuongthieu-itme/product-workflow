export type CategoryType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};
