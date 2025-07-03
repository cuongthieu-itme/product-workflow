import { z } from 'zod'

export const forgotPasswordInputSchema = z.object({
  username: z
    .string()
    .min(1, 'Vui lòng nhập tên đăng nhập')
    .max(50, 'Tên đăng nhập tối đa 50 ký tự'),
  email: z.string().email('Vui lòng nhập email hợp lệ')
})


export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>