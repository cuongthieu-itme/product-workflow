import { z } from "zod";
import { UserRoleEnum } from "@/features/auth/constants";
import { KEY_EMPTY_SELECT } from "@/components/form/select";

export const createUserInputSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(6, { message: "Họ tên phải dài hơn 6 ký tự" }),
  userName: z
    .string()
    .trim()
    .min(6, { message: "Tên đăng nhập phải dài hơn 6 ký tự" }),
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  role: z.nativeEnum(UserRoleEnum).default(UserRoleEnum.USER).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, { message: "Số điện thoại gồm 10–11 chữ số" })
    .optional()
    .nullable(),
  departmentId: z
    .number()
    .nullable()
    .optional()
    .or(z.literal(KEY_EMPTY_SELECT)),
});

export type CreateUserInputType = z.infer<typeof createUserInputSchema>;
