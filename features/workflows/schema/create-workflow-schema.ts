import { z } from "zod";

export enum OutputTypeEnum {
  PRODUCT = "PRODUCT",
  ACCESSORY = "ACCESSORY",
  MATERIAL = "INGREDIENT",
}

export const subprocessesSchema = z.object({
  id: z.string().or(z.number()).optional().nullable(),
  name: z
    .string()
    .min(3, "Tên bước phải có ít nhất 3 ký tự")
    .max(100, "Tên bước phải có nhiều nhất 100 ký tự"),
  description: z
    .string()
    .min(3, "Mô tả bước phải có ít nhất 3 ký tự")
    .max(100, "Mô tả bước phải có nhiều nhất 100 ký tự"),
  estimatedNumberOfDays: z
    .number()
    .min(1, "Số ngày phải lớn hơn 0")
    .max(365, "Số ngày phải nhỏ hơn 365"),
  numberOfDaysBeforeDeadline: z
    .number()
    .min(1, "Số ngày thông báo trước hạn phải lớn hơn 0")
    .max(365, "Số ngày thông báo trước hạn phải nhỏ hơn 365"),
  roleOfThePersonInCharge: z
    .string()
    .min(3, "Vai trò người đảm bảo phải có ít nhất 3 ký tự")
    .max(100, "Vai trò người đảm bảo phải có nhiều nhất 100 ký tự"),
  departmentId: z
    .number()
    .min(1, {
      message: "Phải chọn phòng ban",
    })
    .optional()
    .nullable(),
  isRequired: z.boolean().default(false).optional(),
  isStepWithCost: z.boolean().default(false).optional(),
  step: z.number().min(1).optional(),
  checkFields: z.array(z.string()).optional(),
});

export const sameAssignSchema = z.object({
  departmentId: z.number(),
  steps: z.array(z.number()).min(1, "Phải chọn ít nhất 1 bước"),
});

export const createWorkflowInputSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(3, "Tên phải có ít nhất 3 ký tự")
    .max(100, "Tên phải có nhiều nhất 100 ký tự"),
  description: z
    .string()
    .min(3, "Mô tả phải có ít nhất 3 ký tự")
    .max(100, "Mô tả phải có nhiều nhất 100 ký tự"),
  outputType: z.enum(
    [OutputTypeEnum.PRODUCT, OutputTypeEnum.ACCESSORY, OutputTypeEnum.MATERIAL],
    {
      errorMap: () => ({ message: "Phải chọn loại đầu ra" }),
    }
  ),
  subprocesses: z.array(subprocessesSchema).min(1, "Phải có ít nhất 1 bước"),
  sameAssigns: z.array(sameAssignSchema).optional(),
});

export type CreateWorkflowInputType = z.infer<typeof createWorkflowInputSchema>;

export type SubProcessInputType = z.infer<typeof subprocessesSchema>;

export type SameAssignInputType = z.infer<typeof sameAssignSchema>;
