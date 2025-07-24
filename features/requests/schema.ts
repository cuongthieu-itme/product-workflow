import { z } from "zod";
import { SourceEnum } from "./constants";
import { RequestStatus } from "./type";

export const materialRequestInputSchema = z
  .object({
    id: z.number().int().optional().nullable(),
    quantity: z.number().int().nonnegative(),
    expectedDate: z.string().min(1, {
      message: "",
    }),
    supplier: z.string().optional(),
    sourceCountry: z.string().optional(),
    price: z.number().optional(),
    reason: z.string().optional(),
  })
  .optional()
  .nullable();

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
    createdById: z.number().int().nonnegative().optional().nullable(),
    customerId: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .or(z.string().optional()),
    materials: z
      .array(
        z.object({
          materialId: z.number().int().nonnegative(),
          quantity: z.number().int().nonnegative(),
          requestInput: materialRequestInputSchema.optional().nullable(),
        })
      )
      .min(1, {
        message: "Vui lòng chọn ít nhất một vật liệu",
      }),
    sourceOtherId: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .or(z.string().optional()),
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

export const evaluateInputSchema = z.object({
  title: z.string().min(1, { message: "Tên đánh giá không được để trống" }),
  reviewType: z.string().min(1, {
    message: "Loại đánh giá không được để trống",
  }),
  score: z.number().int().nonnegative(),
  description: z.string().min(1, {
    message: "Mô tả không được để trống",
  }),
  isAnonymous: z.boolean(),
  requestId: z.number().int().nonnegative(),
  createdById: z.number().int().nonnegative(),
});

export const mediaSchema = z.object({
  media: z.array(z.string()).min(1, {
    message: "Vui lòng tải lên ít nhất 1 hình ảnh hoặc video",
  }),
});

export const confirmRequestInputSchema = z.object({
  id: z
    .number({
      message: "Yêu cầu không hợp lệ",
      required_error: "Yêu cầu là bắt buộc",
    })
    .int()
    .nonnegative()
    .optional()
    .nullable(),
  status: z.enum(
    [RequestStatus.APPROVED, RequestStatus.REJECTED, RequestStatus.PENDING],
    {
      message: "Trạng thái yêu cầu không hợp lệ",
      required_error: "Trạng thái là bắt buộc",
    }
  ),
  statusProductId: z.union([z.string(), z.number()]).pipe(
    z.coerce
      .number({
        required_error: "Quy trình là bắt buộc",
        invalid_type_error: "Quy trình không hợp lệ",
      })
      .int({ message: "Quy trình phải là số nguyên" })
      .positive({ message: "Quy trình phải là số dương" })
  ),
});

export type RequestInputType = z.infer<typeof requestInputSchema>;
export type SourceOtherInputType = z.infer<typeof sourceOtherInputSchema>;
export type MaterialRequestInputType = z.infer<
  typeof materialRequestInputSchema
>;
export type EvaluateInputType = z.infer<typeof evaluateInputSchema>;
export type MediaInputType = z.infer<typeof mediaSchema>;
export type ConfirmRequestInputType = z.infer<typeof confirmRequestInputSchema>;
