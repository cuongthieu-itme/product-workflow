import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDepartment } from "../services";
import { DEPARTMENTS_QUERY_KEY } from "./useDepartmentsQuery";

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_QUERY_KEY],
      });
    },
  });
};
