import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductStatus } from "../services";
import { CreateProductStatusInputType } from "../schema";
import { PRODUCTS_STATUS_QUERY_KEY } from "./useProductsStatusQuery";

export const useCreateProductStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductStatusInputType) =>
      createProductStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCTS_STATUS_QUERY_KEY],
      });
    },
  });
};
