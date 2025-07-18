import { z } from "zod";

export const requestInputSchema = z.object({
  title: z.string().min(1, { message: "Tên yêu cầu không được để trống" }),
  description: z.string().optional(),
  productLink: z.array(z.object({ url: z.string() })),
  image: z.array(z.string()).optional(),
  source: z.literal("CUSTOMER"),
  nameSource: z.string(),
  specificSource: z.string().optional(),
  userId: z.number().int().nonnegative(),
  statusProductId: z.number().int().nonnegative(),
  customerId: z.number().int().nonnegative().optional(),
  materialId: z.string().optional(),
  materialCount: z.number().int().nonnegative().optional(),
});

export type RequestInputType = z.infer<typeof requestInputSchema>;
