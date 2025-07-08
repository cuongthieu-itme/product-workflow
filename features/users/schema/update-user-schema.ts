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
    .regex(/^[0-9]{10,11}$/, {
      message: "Số điện thoại gồm 10-11 chữ số",
    }),
  role: z.nativeEnum(UserRoleEnum),
  departmentId: z.number().nullable().optional(),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  isVerifiedAccount: z.enum(["true", "false"]),
  userName: z.string(),
});

export const currentUserUpdateInputSchema = updateUserInputSchema.omit({
  role: true,
  isVerifiedAccount: true,
  departmentId: true,
});

export type UpdateUserInputType = z.input<typeof updateUserInputSchema>;

export type UpdateUserOutputType = z.output<typeof updateUserInputSchema>;

export type CurrentUserUpdateInputType = z.input<
  typeof currentUserUpdateInputSchema
>;
