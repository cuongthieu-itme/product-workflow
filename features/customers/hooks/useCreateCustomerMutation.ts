import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "../services";
import { CreateCustomerInputType } from "../schema";
import { CUSTOMERS_QUERY_KEY } from "./useCustomersQuery";

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerInputType) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_QUERY_KEY],
      });
    },
  });
};
