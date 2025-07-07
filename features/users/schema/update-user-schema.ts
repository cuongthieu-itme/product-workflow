import { z } from "zod";
import { UserRoleEnum } from "@/features/auth/constants";

export const updateUserInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(6, { message: "Họ tên phải dài hơn 6 ký tự" }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{9,15}$/, {
      message: "Số điện thoại gồm 9–15 chữ số",
    }),
  role: z.nativeEnum(UserRoleEnum),
  departmentCode: z
    .string()
    .trim()
    .min(1, { message: "Mã phòng ban không được để trống" }),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  isVerifiedAccount: z.enum(["true", "false"]),
  userName: z.string(),
});

export type UpdateUserInputType = z.input<typeof updateUserInputSchema>;

export type UpdateUserOutputType = z.output<typeof updateUserInputSchema>;
