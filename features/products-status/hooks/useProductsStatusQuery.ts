import { useQuery } from "@tanstack/react-query";
import { getProductsStatus } from "../services";
import { ProductStatusFilterInput } from "../types";

export const PRODUCTS_STATUS_QUERY_KEY = "products";

export const useProductsStatusQuery = (params?: ProductStatusFilterInput) => {
  return useQuery({
    queryKey: [PRODUCTS_STATUS_QUERY_KEY, params],
    queryFn: () => getProductsStatus(params),
  });
};
