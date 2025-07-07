import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../services";
import { CreateDepartmentInputType } from "../schema";
import { DEPARTMENTS_QUERY_KEY } from "./useDepartmentsQuery";

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentInputType) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DEPARTMENTS_QUERY_KEY],
      });
    },
  });
};
