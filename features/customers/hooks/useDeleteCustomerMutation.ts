import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomer } from "../services";
import { CUSTOMERS_QUERY_KEY } from "./useCustomersQuery";

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_QUERY_KEY],
      });
    },
  });
};
