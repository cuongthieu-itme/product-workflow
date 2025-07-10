import { PaginatedResult } from "@/types/common";
import { MaterialType } from "./type";
import { format } from "date-fns";

export const materialsMock: PaginatedResult<"data", MaterialType> = {
  data: Array.from({ length: 10 }).map((_, index) => ({
    id: (index + 1).toString(),
    image: "https://via.placeholder.com/150",
    code: `ID-${index + 1}`,
    name: `Name ${index + 1}`,
    count: index + 1,
    unit: "cái",
    origin: "Việt Nam",
    status: "active",
    createdAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
    updatedAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
  })),
  total: 0,
  page: 1,
  limit: 10,
};
