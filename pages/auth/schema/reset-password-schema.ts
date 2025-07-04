import { z } from "zod";

const passwordSchema = z
  .string()
  .trim()
  .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" });

export const resetPasswordInputSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .trim()
      .min(8, { message: "Xác nhận mật khẩu phải có ít nhất 8 ký tự" }),
    token: z.string().nullable().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu và xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordInputType = z.infer<typeof resetPasswordInputSchema>;
