import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services";
import { CategoryFilterInput } from "../types";

export const CATEGORIES_QUERY_KEY = "categories";

export const useCategoriesQuery = (params?: CategoryFilterInput) => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, params],
    queryFn: () => getCategories(params),
  });
};
