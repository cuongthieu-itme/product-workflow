import { phoneNumberSchema } from "@/schema";
import { z } from "zod";

export const changeInfoInputSchema = z.object({

  fullName: z.string().trim().min(1, { message: "Tên không được để trống" }),
  email: z.string().trim().email({ message: "Địa chỉ email không hợp lệ" }),
  phoneNumber: phoneNumberSchema,
  avatar: z.string().optional().nullable(),
});

export type ChangeInfoInputType = z.infer<typeof changeInfoInputSchema>;