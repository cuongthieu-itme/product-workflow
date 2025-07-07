import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "../services";

export const DEPARTMENTS_QUERY_KEY = "department";

export const useDepartmentQuery = (id: string) => {
  return useQuery({
    queryKey: [DEPARTMENTS_QUERY_KEY, id],
    queryFn: () => getDepartment(id),
    enabled: !!id, // Ensure the query only runs if id is defined
  });
};
