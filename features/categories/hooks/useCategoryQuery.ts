import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../services";

export const CATEGORY_QUERY_KEY = "category";

export const useCategoryQuery = (id: string) => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEY, id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });
};
