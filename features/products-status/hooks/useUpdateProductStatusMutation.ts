import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_STATUS_QUERY_KEY } from "./useProductsStatusQuery";
import { PRODUCT_STATUS_QUERY_KEY } from "./useProductStatusQuery";
import { updateProductStatus } from "../services";

export const useUpdateProductStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_STATUS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_STATUS_QUERY_KEY],
      });
    },
  });
};
