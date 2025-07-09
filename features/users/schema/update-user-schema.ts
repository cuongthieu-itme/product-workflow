import { z } from "zod";
import { UserRoleEnum } from "@/features/auth/constants";
import { KEY_EMPTY_SELECT } from "@/components/form/select";

export const updateUserInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(6, { message: "Họ tên phải dài hơn 6 ký tự" }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, { message: "Số điện thoại gồm 10–11 chữ số" })
    .optional()
    .nullable(),
  role: z.nativeEnum(UserRoleEnum),
  departmentId: z
    .number()
    .nullable()
    .optional()
    .or(z.literal(KEY_EMPTY_SELECT)),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  isVerifiedAccount: z.enum(["true", "false"]),
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
