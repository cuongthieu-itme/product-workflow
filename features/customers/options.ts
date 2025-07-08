import { GenderEnum } from "@/constants/gender";
import { SourceEnum } from "./type";

export const genderOptions = [
  { value: GenderEnum.MALE, label: "Nam" },
  { value: GenderEnum.FEMALE, label: "Nữ" },
];

export const sourceOptions = [
  { value: SourceEnum.FACEBOOK, label: "Facebook" },
  { value: SourceEnum.WEBSITE, label: "Website" },
  { value: SourceEnum.REFERRAL, label: "Referral" },
  { value: SourceEnum.OTHER, label: "Other" },
];
