import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDepartment } from "../services";
import { UpdateDepartmentInputType } from "../schema";
import { DEPARTMENTS_QUERY_KEY } from "./useDepartmentsQuery";

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDepartmentInputType) => updateDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_QUERY_KEY],
      });
    },
  });
};
