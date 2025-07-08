import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../services";
import { CreateCategoryInputType } from "../schema";
import { CATEGORIES_QUERY_KEY } from "./useCategoriesQuery";

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInputType) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CATEGORIES_QUERY_KEY],
      });
    },
  });
};
