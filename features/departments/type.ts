import { z } from "zod";
import { createDepartmentInputSchema } from "./schema";

// Type of Department
export interface Department {
  id: string;
  name: string;
  description: string;
  headId: number | null;
}

// Filter params for list query (extend as needed)
export interface DepartmentFilterInput {
  search?: string;
  page?: number;
  limit?: number;
}

// Response type for paginated list
export interface DepartmentsType {
  data: Department[];
  total: number;
}

export type CreateDepartmentInputType = z.input<typeof createDepartmentInputSchema>;
export type UpdateDepartmentInputType = CreateDepartmentInputType;
