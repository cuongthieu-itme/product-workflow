import { z } from "zod";
import { GenderEnum } from "@/constants/gender";
import { SourceEnum } from "../type";

export const createCustomerInputSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Họ tên không được để trống" }),
  phoneNumber: z.string().regex(/^0\d{9}$/, {
    message: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0",
  }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  gender: z.nativeEnum(GenderEnum),
  dateOfBirth: z.string().datetime({ offset: true }).or(z.date()),
  source: z.nativeEnum(SourceEnum),
});

export type CreateCustomerInputType = z.infer<typeof createCustomerInputSchema>;
