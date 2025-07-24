import { PaginatedResult } from "@/types/common";
import { MaterialType } from "../materials/type";
import { SourceEnum } from "./constants";
import { MaterialRequestInputType, RequestInputType } from "./schema";
import { User } from "../users/type";

export type RequestType = {
  id: number;
  title: string;
  description: string;
  productLink: string[];
  image: string[];
  source: string;
  nameSource: string;
  specificSource: string;
  userId: number;
  statusProductId: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

export interface RequestFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  title?: string;
}

export type RequestsType = PaginatedResult<"data", RequestType>;

export type SourceOtherType = {
  id: number;
  name: string;
  specifically: string;
  createdAt: string;
  updatedAt: string;
};

export type SourceOthersType = PaginatedResult<"data", SourceOtherType>;

export interface SourceOtherFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  specifically?: string;
}

export interface Origin {
  id: number;
  name: string;
}

export interface RequestMaterial {
  id: number;
  quantity: number;
  material: MaterialType;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum StatusSubprocessHistory {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface RequestDetail {
  id: number;
  title: string;
  description: string;
  productLink: string[];
  media: string[];
  source: SourceEnum.CUSTOMER | SourceEnum.OTHER;
  customerId: number | null;
  sourceOtherId: number | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer | null;
  sourceOther: {
    id: number;
    name: string;
    specifically: string;
  } | null;
  requestMaterials: RequestMaterial[];
  createdById: number;
  createdBy: User;
  status: RequestStatus;
}

export type EvaluateFilterInput = {
  requestId?: number;
  page?: number;
  limit?: number;
};

export type EvaluateType = {
  id: number;
  title: string;
  reviewType: string;
  score: number;
  description: string;
  isAnonymous: boolean;
  requestId: number;
  createdById: number;
  createdBy: User;
  createdAt: string;
};

export type SubprocessHistoryType = {
  id: number;
  name: string;
  description: string;
  estimatedNumberOfDays: number;
  numberOfDaysBeforeDeadline: number;
  roleOfThePersonInCharge: string;
  isRequired: boolean;
  isStepWithCost: boolean;
  step: number;
  procedureId: number;
  departmentId: number;
  price: number;
  startDate: string;
  endDate: string;
  status: StatusSubprocessHistory;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
};

export type SubprocessHistoryFilterInput = {
  procedureId?: number;
  page?: number;
  limit?: number;
};
