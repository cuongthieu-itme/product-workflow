import { useQuery } from "@tanstack/react-query";
import { getProductStatus } from "../services";

export const PRODUCT_STATUS_QUERY_KEY = "product";

export const useProductStatusQuery = (id: string) => {
  return useQuery({
    queryKey: [PRODUCT_STATUS_QUERY_KEY, id],
    queryFn: () => getProductStatus(id),
    enabled: !!id,
  });
};
