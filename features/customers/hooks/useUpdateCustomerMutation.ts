import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCustomer } from "../services";
import { UpdateCustomerInputType } from "../schema";
import { CUSTOMERS_QUERY_KEY } from "./useCustomersQuery";
import { CUSTOMER_QUERY_KEY } from "./useCustomerQuery";

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCustomerInputType) => updateCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CUSTOMER_QUERY_KEY],
      });
    },
  });
};
