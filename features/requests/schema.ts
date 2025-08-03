import { z } from "zod";
import { PriorityEnum, SourceEnum } from "./constants";
import { RequestStatus, StatusSubprocessHistory } from "./type";

export const prioritySchema = z.enum(
  [
    PriorityEnum.NORMAL,
    PriorityEnum.MEDIUM,
    PriorityEnum.HIGH,
    PriorityEnum.VERY_HIGH,
  ],
  {
    message: "Ưu tiên phải là 'THẤP', 'TRUNG BÌNH', 'CAO', 'RẤT CAO'",
    required_error: "Ưu tiên là bắt buộc",
  }
);

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
    productLink: z
      .array(
        z.object({
          url: z
            .string()
            .url({
              message: "Liên kết sản phẩm không hợp lệ",
            })
            .min(1, {
              message: "Liên kết sản phẩm không được để trống",
            }),
        })
      )
      .min(1, {
        message: "Vui lòng nhập ít nhất một liên kết sản phẩm",
      }),
    media: z
      .array(z.string())
      .min(1, {
        message: "Vui lòng tải lên ít nhất 1 file media",
      })
      .refine(
        (media) => {
          // Kiểm tra phải có ít nhất 1 hình ảnh
          const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".bmp",
            ".webp",
            ".svg",
          ];
          const hasImage = media.some((url) =>
            imageExtensions.some(
              (ext) =>
                url.toLowerCase().includes(ext) ||
                url.toLowerCase().endsWith(ext)
            )
          );
          return hasImage;
        },
        {
          message: "Bắt buộc phải có ít nhất 1 hình ảnh",
        }
      ),
    source: z.enum([SourceEnum.CUSTOMER, SourceEnum.OTHER], {
      message: "Nguồn yêu cầu phải là 'Khách hàng' hoặc 'Khác'",
    }),
    createdById: z.number().int().nonnegative().optional().nullable(),
    priority: prioritySchema,
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
  id: z.number().int().nonnegative().optional(),
  media: z
    .array(z.string())
    .min(1, {
      message: "Vui lòng tải lên ít nhất 1 file media",
    })
    .refine(
      (media) => {
        // Kiểm tra phải có ít nhất 1 hình ảnh
        const imageExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".bmp",
          ".webp",
          ".svg",
        ];
        const hasImage = media.some((url) =>
          imageExtensions.some(
            (ext) =>
              url.toLowerCase().includes(ext) || url.toLowerCase().endsWith(ext)
          )
        );
        return hasImage;
      },
      {
        message: "Bắt buộc phải có ít nhất 1 hình ảnh",
      }
    ),
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
    [
      RequestStatus.APPROVED,
      RequestStatus.REJECTED,
      RequestStatus.PENDING,
      RequestStatus.HOLD,
    ],
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
  productionPlan: z.string().min(1, {
    message: "Vui lòng nhập phương án sản xuất",
  }),
});

export const subprocessHistoryFormSchema = z
  .object({
    id: z.number().int().nonnegative().optional().nullable(),
    isStepWithCost: z.boolean(),
    startDate: z.string().datetime({ offset: true }).or(z.date()),
    endDate: z.string().datetime({ offset: true }).or(z.date()),
    userId: z.coerce
      .number({
        required_error: "Vui lòng chọn người thực hiện",
      })
      .int("ID không hợp lệ")
      .positive("Vui lòng chọn người thực hiện"),
    price: z.coerce
      .number({
        invalid_type_error: "Giá phải là số",
      })
      .positive("Giá phải lớn hơn 0")
      .nullable()
      .optional(),
    status: z.enum([
      StatusSubprocessHistory.CANCELLED,
      StatusSubprocessHistory.COMPLETED,
      StatusSubprocessHistory.IN_PROGRESS,
      StatusSubprocessHistory.PENDING,
      StatusSubprocessHistory.SKIPPED,
    ]),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
  })
  .refine(
    (data) => !data.isStepWithCost || (data.price != null && data.price > 0),
    {
      message: "Giá là bắt buộc và phải lớn hơn 0",
      path: ["price"],
    }
  );

export type RequestInputType = z.infer<typeof requestInputSchema>;
export type SourceOtherInputType = z.infer<typeof sourceOtherInputSchema>;
export type MaterialRequestInputType = z.infer<
  typeof materialRequestInputSchema
>;
export type EvaluateInputType = z.infer<typeof evaluateInputSchema>;
export type MediaInputType = z.infer<typeof mediaSchema>;
export type ConfirmRequestInputType = z.infer<typeof confirmRequestInputSchema>;
export type SubprocessHistoryFormType = z.infer<
  typeof subprocessHistoryFormSchema
>;

// Hold Request Schema
export const holdRequestInputSchema = z.object({
  reason: z.string().min(1, { message: "Lý do hold không được để trống" }),
  media: z.array(z.string()).optional(),
});

export type HoldRequestInputType = z.infer<typeof holdRequestInputSchema>;

// Reject Request Schema
export const rejectRequestInputSchema = z.object({
  reason: z.string().min(1, { message: "Lý do từ chối không được để trống" }),
  media: z.array(z.string()).optional(),
});

export type RejectRequestInputType = z.infer<typeof rejectRequestInputSchema>;
