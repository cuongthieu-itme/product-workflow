import { z } from "zod";

export const loginInputSchema = z.object({
  emailOrUserName: z.string().trim().min(1, {
    message: "Email hoặc tên đăng nhập không được để trống",
  }),
  password: z.string().trim().min(1, {
    message: "Mật khẩu không được để trống",
  }),
});

export type LoginInputType = z.infer<typeof loginInputSchema>;
