import { OutputTypeEnum } from "./schema/create-workflow-schema";

export const outputTypeOptions = [
  { value: OutputTypeEnum.PRODUCT, label: "Sản phẩm" },
  { value: OutputTypeEnum.ACCESSORY, label: "Phụ kiện" },
  { value: OutputTypeEnum.MATERIAL, label: "Nguyên liệu" },
];
