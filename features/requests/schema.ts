import { z } from "zod";
import { SourceEnum } from "./constants";

export const requestInputSchema = z.object({
  title: z.string().min(1, { message: "Tên yêu cầu không được để trống" }),
  description: z.string().optional(),
  productLink: z.array(
    z.object({
      url: z.string(),
    })
  ),
  media: z.array(z.string()).min(1, {
    message: "Vui lòng tải lên ít nhất 1 hình ảnh hoặc video",
  }),
  source: z.enum([SourceEnum.CUSTOMER, SourceEnum.OTHER], {
    message: "Nguồn yêu cầu phải là 'Khách hàng' hoặc 'Khác'",
  }),
  customerId: z.number().int().nonnegative().optional(),
  materials: z
    .array(
      z.object({
        materialId: z.number().int().nonnegative(),
        quantity: z.number().int().nonnegative(),
      })
    )
    .min(1, {
      message: "Vui lòng chọn ít nhất một vật liệu",
    }),
  materialType: z.string(),
});

export type RequestInputType = z.infer<typeof requestInputSchema>;
