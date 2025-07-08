import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "../services";
import { CustomerFilterInput } from "../type";

export const CUSTOMERS_QUERY_KEY = "customers";

export const useCustomersQuery = (params?: CustomerFilterInput) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, params],
    queryFn: () => getCustomers(params),
  });
};
