import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../services";
import { DEPARTMENTS_QUERY_KEY } from "./useDepartmentsQuery";
import type { CreateDepartmentInputType } from "../type";

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentInputType) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
  });
};
