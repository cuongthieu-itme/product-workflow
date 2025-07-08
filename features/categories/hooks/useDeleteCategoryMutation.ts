import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "../services";
import { CATEGORIES_QUERY_KEY } from "./useCategoriesQuery";

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
  });
};
