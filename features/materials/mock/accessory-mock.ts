import { format } from "date-fns";

export const accessoryMock = Array.from({ length: 12 }).map((_, index) => ({
  id: (index + 1).toString(),
  name: `Phụ kiện ${index + 1}`,
  code: `ACC-${index + 1}`,
  quantity: Math.floor(Math.random() * 100) + 1,
  isActive: Math.random() > 0.3,
  images: [
    `https://cdn.pixabay.com/photo/2025/01/07/17/05/buck-9317347_640.png`,
    `https://cdn.pixabay.com/photo/2025/06/20/10/47/dog-9670619_640.jpg`,
  ],
  createdAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
  updatedAt: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
}));
