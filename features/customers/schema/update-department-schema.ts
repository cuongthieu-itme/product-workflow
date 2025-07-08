import { z } from "zod";
import { createCustomerInputSchema } from "./create-department-schema";

export const updateCustomerInputSchema = z
  .object({
    id: z.number(),
  })
  .merge(createCustomerInputSchema);

export type UpdateCustomerInputType = z.input<typeof updateCustomerInputSchema>;
