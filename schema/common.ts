import { z } from "zod"

export const phoneNumberSchema = z.string().regex(/^0\d{9}$/, {
    message: "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0",
}).optional().nullable();