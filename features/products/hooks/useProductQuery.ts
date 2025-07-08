import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../services";

export const PRODUCT_QUERY_KEY = "product";

export const useProductQuery = (id: string) => {
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEY, id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
};
