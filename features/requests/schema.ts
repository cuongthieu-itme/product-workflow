import { z } from "zod";
import { SourceEnum } from "./constants";

export const requestInputSchema = z
  .object({
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
    sourceOtherId: z.number().int().nonnegative().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.source === SourceEnum.CUSTOMER && v.customerId == null) {
      ctx.addIssue({
        path: ["customerId"],
        code: z.ZodIssueCode.custom,
        message: "Vui lòng chọn khách hàng",
      });
    }
    if (v.source === SourceEnum.OTHER && v.sourceOtherId == null) {
      ctx.addIssue({
        path: ["sourceOtherId"],
        code: z.ZodIssueCode.custom,
        message: "Vui lòng nhập nguồn khác",
      });
    }
  });

export const sourceOtherInputSchema = z.object({
  name: z.string().min(1, { message: "Tên nguồn không được để trống" }),
  specifically: z.string().min(1, {
    message: "Thông tin cụ thể không được để trống",
  }),
});

export type RequestInputType = z.infer<typeof requestInputSchema>;
export type SourceOtherInputType = z.infer<typeof sourceOtherInputSchema>;
