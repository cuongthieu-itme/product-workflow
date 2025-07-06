import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDepartment } from "../services";
import { DEPARTMENTS_QUERY_KEY } from "./useDepartmentsQuery";
import type { CreateDepartmentInputType } from "../type";

export const useUpdateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDepartmentInputType }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
};
