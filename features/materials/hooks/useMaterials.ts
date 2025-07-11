import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeStatusMaterial,
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from "../services";
import { MaterialFilterInput } from "../type";
import { useToast } from "@/components/ui/use-toast";

export enum MATERIALS_KEY {
  GET_MATERIALS = "materials",
  CREATE_MATERIAL = "create_material",
}

export const useMaterialsQuery = (params?: MaterialFilterInput) => {
  return useQuery({
    queryKey: [MATERIALS_KEY.GET_MATERIALS, params],
    queryFn: () => getMaterials(params),
  });
};

export const useCreateMaterialMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MATERIALS_KEY.GET_MATERIALS],
      });
      toast({
        title: "Thành công",
        description: "Nguyên liệu đã được tạo thành công.",
      });
    },
  });
};

export const useUpdateMaterialMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MATERIALS_KEY.GET_MATERIALS],
      });
      toast({
        title: "Thành công",
        description: "Nguyên liệu đã được cập nhật thành công.",
      });
    },
  });
};

export const useDeleteMaterialMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MATERIALS_KEY.GET_MATERIALS],
      });
      toast({
        title: "Thành công",
        description: "Nguyên liệu đã được xóa thành công.",
      });
    },
  });
};

export const useChangeStatusMaterialMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: changeStatusMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MATERIALS_KEY.GET_MATERIALS],
      });
      toast({
        title: "Thành công",
        description: "Nguyên liệu đã được thay đổi trạng thái thành công.",
      });
    },
  });
};
