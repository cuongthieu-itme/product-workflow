import { z } from "zod";

export const accessoryInputSchema = z.object({
    name: z.string().trim().min(1, {
        message: "Tên phụ kiện không được để trống",
    }),
    code: z.string().trim().min(1, {
        message: "Mã phụ kiện không được để trống",
    }),
    image: z.array(z.string()).min(1, {
        message: "Phải chọn ít nhất 1 ảnh",
    }),
    description: z.string().trim().optional().nullable(),
    quantity: z.number().int({ message: "Số lượng phải là số nguyên" }).positive({ message: "Số lượng phải > 0" }),
    isActive: z.boolean().default(true).optional(),
});

export type AccessoryInputType = z.infer<typeof accessoryInputSchema>;
export type UpdateAccessoryInputType = AccessoryInputType & {
    id: string;
};