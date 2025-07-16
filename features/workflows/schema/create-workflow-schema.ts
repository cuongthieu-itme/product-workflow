import { z } from "zod";

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
  subprocesses: z.array(subprocessesSchema).min(1, "Phải có ít nhất 1 bước"),
});

export type CreateWorkflowInputType = z.infer<typeof createWorkflowInputSchema>;

export type SubProcessInputType = z.infer<typeof subprocessesSchema>;
