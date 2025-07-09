import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductStatus } from "../services";
import { PRODUCTS_STATUS_QUERY_KEY } from "./useProductsStatusQuery";
import { PRODUCT_STATUS_QUERY_KEY } from "./useProductStatusQuery";

export const useDeleteProductStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductStatus,
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
