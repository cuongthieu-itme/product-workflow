import { PaginatedResult } from "@/types/common";
import { MaterialType } from "./type";
import { format } from "date-fns";

export const materialsMock: PaginatedResult<"data", MaterialType> = {
  data: Array.from({ length: 10 }).map((_, index) => ({
    id: (index + 1).toString(),
    image: [
      "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg",
    ],
    code: `ID-${index + 1}`,
    name: `Name ${index + 1}`,
    count: index + 1,
    unit: "cái",
    origin: "Việt Nam",
    isActive: true,
    description: `Description ${index + 1}`,
    createdAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
    updatedAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
  })),
  total: 0,
  page: 1,
  limit: 10,
};
