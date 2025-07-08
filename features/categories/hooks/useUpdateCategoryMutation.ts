import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORIES_QUERY_KEY } from "./useCategoriesQuery";
import { updateCategory } from "../services";

export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
  });
};
