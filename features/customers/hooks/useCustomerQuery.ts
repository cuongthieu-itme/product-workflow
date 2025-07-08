import { useQuery } from "@tanstack/react-query";
import { getCustomer } from "../services";

export const CUSTOMER_QUERY_KEY = "customer";

export const useCustomerQuery = (id: string) => {
  return useQuery({
    queryKey: [CUSTOMER_QUERY_KEY, id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};
