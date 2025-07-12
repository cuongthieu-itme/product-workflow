import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/components/ui/use-toast"
import { createAccessory, updateAccessory, changeStatusAccessory, getAccessories, getAccessoryDetail, deleteAccessory } from "../services"
import { AccessoryFilterInput } from "../type"

export enum ACCESSORIES_KEY {
    GET_ACCESSORIES = "accessories",
    CREATE_ACCESSORIES = "create_accessories",
    UPDATE_ACCESSORIES = "update_accessories",
    CHANGE_STATUS_ACCESSORIES = "change_status_accessories",
    GET_ACCESSORY_DETAIL = "get_accessory_detail",
}

export const useAccessoriesQuery = (params?: AccessoryFilterInput) => {
    return useQuery({
        queryKey: [ACCESSORIES_KEY.GET_ACCESSORIES, params],
        queryFn: () => getAccessories(params),
    })
}

export const useAccessoryDetailQuery = (id: string) => {
    return useQuery({
        queryKey: [ACCESSORIES_KEY.GET_ACCESSORY_DETAIL, id],
        queryFn: () => getAccessoryDetail(id),
    })
}

export const useCreateAccessoryMutation = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createAccessory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ACCESSORIES_KEY.GET_ACCESSORIES],
            })
            toast({
                title: "Thành công",
                description: "Thêm phụ kiện thành công",
            })
        },

    })
}

export const useUpdateAccessoryMutation = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateAccessory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ACCESSORIES_KEY.GET_ACCESSORIES],
            })
            toast({
                title: "Thành công",
                description: "Cập nhật phụ kiện thành công",
            })
        },

    })
}

export const useChangeStatusAccessoryMutation = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: changeStatusAccessory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ACCESSORIES_KEY.GET_ACCESSORIES],
            })
            toast({
                title: "Thành công",
                description: "Thay đổi trạng thái phụ kiện thành công",
            })
        },

    })
}


export const useDeleteAccessoryMutation = () => {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteAccessory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ACCESSORIES_KEY.GET_ACCESSORIES],
            })
            toast({
                title: "Thành công",
                description: "Xóa phụ kiện thành công",
            })
        },

    })
}