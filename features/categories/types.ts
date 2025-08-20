import { ProductType } from "../products/types";

export type CategoryType = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  products: ProductType[];
  _count: {
    products: number;
  };
};

export type CategoryFilterInput = {
  name?: string;
  page?: number;
  limit?: number;
};

export enum SourceEnum {
  FACEBOOK = "FACEBOOK",
  WEBSITE = "WEBSITE",
  REFERRAL = "REFERRAL",
  OTHER = "OTHER",
}
