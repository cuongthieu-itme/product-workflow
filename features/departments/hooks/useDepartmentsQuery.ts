import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../services";
import { DepartmentFilterInput } from "../type";

export const DEPARTMENTS_QUERY_KEY = "departments";

export const useDepartmentsQuery = (params?: DepartmentFilterInput) => {
  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, params],
    queryFn: () => getDepartments(params),
  });
};
