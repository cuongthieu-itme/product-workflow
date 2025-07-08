import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PRODUCTS_QUERY_KEY } from "./useProductsQuery";
import { PRODUCT_QUERY_KEY } from "./useProductQuery";
import { updateProduct } from "../services";

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEY],
      });
    },
  });
};
