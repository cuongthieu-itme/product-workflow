import { z } from "zod";

export const stepSchema = z.object({
  name: z
    .string()
    .min(3, "Tên bước phải có ít nhất 3 ký tự")
    .max(100, "Tên bước phải có nhiều nhất 100 ký tự")
    .or(z.string()),
  description: z
    .string()
    .min(3, "Mô tả bước phải có ít nhất 3 ký tự")
    .max(100, "Mô tả bước phải có nhiều nhất 100 ký tự")
    .or(z.string()),
  estimatedDays: z
    .number()
    .min(1, "Số ngày phải lớn hơn 0")
    .max(365, "Số ngày phải nhỏ hơn 365")
    .or(z.string()),
  roleUserEnsure: z
    .string()
    .min(3, "Vai trò người đảm bảo phải có ít nhất 3 ký tự")
    .max(100, "Vai trò người đảm bảo phải có nhiều nhất 100 ký tự")
    .or(z.string()),
  notifyBeforeDeadline: z
    .number()
    .min(1, "Số ngày thông báo trước hạn phải lớn hơn 0")
    .max(365, "Số ngày thông báo trước hạn phải nhỏ hơn 365")
    .or(z.string()),
  stepRequired: z.any(),
  stepWithCost: z.any(),
});

export const createWorkflowInputSchema = z.object({
  name: z
    .string()
    .min(3, "Tên phải có ít nhất 3 ký tự")
    .max(100, "Tên phải có nhiều nhất 100 ký tự"),
  description: z
    .string()
    .min(3, "Mô tả phải có ít nhất 3 ký tự")
    .max(100, "Mô tả phải có nhiều nhất 100 ký tự"),
  steps: z.array(stepSchema),
});

export type CreateWorkflowInputType = z.infer<typeof createWorkflowInputSchema>;

export type StepInputType = z.infer<typeof stepSchema>;
