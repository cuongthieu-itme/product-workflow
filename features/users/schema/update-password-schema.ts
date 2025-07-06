import { z } from "zod";

/**
 * Schema cập nhật mật khẩu cho user hiện tại / đặt lại mật khẩu.
 * Yêu cầu mật khẩu tối thiểu 6 ký tự.
 */
export const updatePasswordInputSchema = z.object({
  password: z.string().min(6, { message: "Mật khẩu phải dài hơn 6 ký tự" }),
});

export type UpdatePasswordInputType = z.infer<typeof updatePasswordInputSchema>;
