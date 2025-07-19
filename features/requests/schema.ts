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
  media: z.array(z.string()).min(10, {
    message: "Vui lòng tải lên ít nhất 10 hình ảnh hoặc video",
  }),
  source: z.enum([SourceEnum.CUSTOMER, SourceEnum.OTHER], {
    message: "Nguồn yêu cầu phải là 'Khách hàng' hoặc 'Khác'",
  }),
  nameSource: z.string(),
  specificSource: z.string().optional(),
  userId: z.number().int().nonnegative(),
  statusProductId: z.number().int().nonnegative(),
  customerId: z.number().int().nonnegative().optional(),
  accessoryIds: z.array(z.string()).min(1, {
    message: "Vui lòng chọn ít nhất một vật liệu",
  }),
});

export type RequestInputType = z.infer<typeof requestInputSchema>;
