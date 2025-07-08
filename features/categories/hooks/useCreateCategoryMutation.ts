import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../services";
import { CreateProductInputType } from "../schema";
import { PRODUCTS_QUERY_KEY } from "./useProductsQuery";

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInputType) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_QUERY_KEY],
      });
    },
  });
};
