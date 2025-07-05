import { z } from "zod";

export const forgotPasswordInputSchema = z.object({
  email: z.string().trim().email({ message: "Địa chỉ email không hợp lệ" }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
