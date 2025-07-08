import { passwordSchema } from "@/features/auth/schema/reset-password-schema";
import { z } from "zod";

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Vui lòng nhập mật khẩu",
    }),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(8, { message: "Xác nhận mật khẩu phải có ít nhất 8 ký tự" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordInputType = z.infer<typeof changePasswordInputSchema>;
