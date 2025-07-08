import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../services";
import { PRODUCTS_QUERY_KEY } from "./useProductsQuery";

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY],
      });
    },
  });
};
