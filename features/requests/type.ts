import { PaginatedResult } from "@/types/common";
import { MaterialType } from "../materials/type";
import { PriorityEnum, SourceEnum } from "./constants";
import { User } from "../users/type";
import { ProductStatusType } from "../products-status/types";
import { WorkFlowProcessType } from "../workflows/types";

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
  procedureHistoryId: number;
  departmentId: number | null;
  price: number | null;
  startDate: string | null;
  endDate: string | null;
  status: StatusSubprocessHistory;
  userId: number | null;
  user: User | null;
  fieldSubprocess: FieldSubprocess | null;
  holdDateOne: string | null;
  continueDateOne: string | null;
  holdDateTwo: string | null;
  continueDateTwo: string | null;
  holdDateThree: string | null;
  continueDateThree: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface ProcedureHistory {
  id: number;
  name: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  subprocessesHistory: SubprocessHistoryType[];
}

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
  createdBy: User;
  priority: PriorityEnum;
  procedureHistory?: ProcedureHistory;
  createdAt: string;
  updatedAt: string;
};

export interface RequestFilterInput {
  name?: string;
  page?: number;
  limit?: number;
  title?: string;
  procedureId?: number;
  statusProductId?: number;
  status?: RequestStatus;
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
  HOLD = "HOLD",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  DENIED = "DENIED",
}

export enum StatusSubprocessHistory {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  SKIPPED = "SKIPPED",
  HOLD = "HOLD",
}

type ApprovalInfo = {
  id: number;
  requestId: number;
  holdReason: string | null;
  denyReason: string;
  productionPlan: string | null;
  files: string[];
  createdAt: string;
  updatedAt: string;
};

type Media = string[]; // Ví dụ nếu media là một mảng các URL
type PurchaseLink = string[]; // Ví dụ nếu purchaseLink là một mảng các URL
type PriceList = string[]; // Ví dụ nếu priceList là một mảng các giá trị giá sản phẩm
type CheckFields = string[]; // Mảng các tên trường cần kiểm tra

type FieldSubprocess = {
  id: number;
  subprocessId: number;
  subprocessesHistoryId: number;
  materialCode: string | null;
  materialName: string | null;
  requestId: string | null;
  requestDate: string | null; // Có thể là Date nếu cần, tùy vào định dạng dữ liệu
  priority: string | null;
  createdBy: string | null;
  requestSource: string | null;
  checker: string | null;
  descriptionMaterial: string | null;
  status: string | null;
  quantity: number | null;
  unit: string | null;
  color: string | null;
  materialType: string | null;
  media: Media;
  purchaseLink: PurchaseLink;
  additionalNote: string | null;
  approvedBy: string | null;
  approvedTime: string | null;
  purchaser: string | null;
  purchasingTime: string | null;
  trackingLink: string | null;
  receivedQuantity: number | null;
  checkedBy: string | null;
  checkedTime: string | null;
  sampleProductionPlan: string | null;
  designer: string | null;
  startTime: string | null;
  completedTime: string | null;
  productionFileLink: string | null;
  sampleMaker: string | null;
  sampleStatus: string | null;
  sampleMediaLink: string[];
  note: string | null;
  finalApprovedSampleImage: string | null;
  finalProductVideo: string | null;
  productManufacturingPlan: string | null;
  productFeedbackResponder: string | null;
  deadlineChecking: string | null;
  productFeedbackStatus: string | null;
  reasonForNonProduction: string | null;
  sampleFeedbackResponder: string | null;
  demoPrice: string | null;
  sampleFeedback: string | null;
  MOQInput: string | null;
  sizeDimension: string | null;
  materialConfirmer: string | null;
  purchaseStatus: string | null;
  confirmedQuantity: number | null;
  orderPlaced: string | null;
  orderDate: string | null;
  estimatedArrivalDate: string | null;
  actualArrivalDate: string | null;
  warehouseChecker: string | null;
  quantityReceived: number | null;
  checkedDate: string | null;
  materialSentToRD: string | null;
  sentDateToRD: string | null;
  receivedDateByRD: string | null;
  RDMaterialChecker: string | null;
  sampleQualityFeedback: string | null;
  feedbackDate: string | null;
  startedTime: string | null;
  assignedTo: string | null;
  linkTemplateMockup: string | null;
  templateChecker: string | null;
  templateCheckingStatus: string | null;
  mockupChecker: string | null;
  mockupCheckingStatus: string | null;
  priceCalculator: string | null;
  priceList: PriceList;
  productDescription: string | null;
  variant: string | null;
  estimatedUploadDate: string | null;
  actualUploadTime: string | null;
  productCode: string | null;
  productPageLink: string | null;
  SKU: string | null;
  SKUDescription: string | null;
  productName: string | null;
  category: string | null;
  howToProduce: string | null;
  materialNeedToUse: string | null;
  groupAnnouncementAllDepartments: string | null;
  announcementOfRndWorkshopGroup: string | null;
  checkFields: CheckFields;
  createdAt: string;
  updatedAt: string;
};

export interface RequestDetail {
  id: number;
  code: string;
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
  procedureHistory: ProcedureHistory;
  priority: PriorityEnum;
  approvalInfo: ApprovalInfo;
  fieldSubprocess: FieldSubprocess;
  statusProduct: ProductStatusType & {
    procedure: WorkFlowProcessType;
  };
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

export type SubprocessHistoryFilterInput = {
  procedureId?: number;
  page?: number;
  limit?: number;
};

export type SubprocessHistorySkipInput = {
  id: number;
  status: StatusSubprocessHistory;
};

export type AssignUserInputType = {
  id: number;
  userId: number;
  isRequired?: boolean;
  isStepWithCost?: boolean;
};

export type AddMaterialInputType = {
  id: number;
  materialId: number;
  quantity: number;
};

export type RemoveMaterialInputType = {
  id: number;
  materialId: number;
};

export type StatusStatisticsType = {
  data: {
    ALL: number;
    PENDING: number;
    IN_PROGRESS: number;
    APPROVED: number;
    REJECTED: number;
    COMPLETED: number;
  };
};
