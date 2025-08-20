import { GenderEnum } from "@/constants/gender";
import { SourceEnum } from "./types";

export const getGender = (gender: GenderEnum) => {
  switch (gender) {
    case GenderEnum.MALE:
      return "Nam";
    case GenderEnum.FEMALE:
      return "Nữ";
    default:
      return "Khác";
  }
};

export const getSourceCustomer = (source: SourceEnum) => {
  switch (source) {
    case SourceEnum.FACEBOOK:
      return "Facebook";
    case SourceEnum.WEBSITE:
      return "Website";
    case SourceEnum.REFERRAL:
      return "Referral";
    case SourceEnum.OTHER:
      return "Other";
    default:
      return "Khác";
  }
};
