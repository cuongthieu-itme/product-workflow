import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services";
import { ProductFilterInput } from "../types";

export const PRODUCTS_QUERY_KEY = "products";

export const useProductsQuery = (params?: ProductFilterInput) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: () => getProducts(params),
  });
};
