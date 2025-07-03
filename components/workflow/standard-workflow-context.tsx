'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode
} from 'react'
import { useProductStatus } from '../product-status/product-status-context'
import { toast } from '@/components/ui/use-toast'

// Định nghĩa kiểu dữ liệu cho trường tùy chỉnh trong bước quy trình
export interface StepField {
  id: string
  name: string
  type:
    | 'text'
    | 'date'
    | 'select'
    | 'user'
    | 'checkbox'
    | 'number'
    | 'currency'
    | 'variable'
  required: boolean
  description?: string
  options?: string[] // Cho trường select
  defaultValue?: string | boolean | number | Date
  isSystem?: boolean // Đánh dấu trường hệ thống không được xóa
  currencySymbol?: string // Biểu tượng tiền tệ (VND, USD, etc.)
  variableSource?: string // Nguồn biến (nếu type là variable)
}

// Định nghĩa kiểu dữ liệu cho một bước trong quy trình
export interface StandardWorkflowStep {
  id: string
  name: string
  description: string
  estimatedDays: number
  order: number
  isRequired?: boolean
  fields: StepField[]
  notifyBeforeDeadline?: number // Số ngày thông báo trước deadline
  assigneeRole?: string // Vai trò người đảm nhiệm
  hasCost?: boolean // Bước có chi phí hay không
}

// Định nghĩa kiểu dữ liệu cho quy trình chuẩn
export interface StandardWorkflow {
  id: string
  name: string
  description: string
  steps: StandardWorkflowStep[]
  createdAt: Date
  updatedAt: Date
  version: number // Phiên bản quy trình
  lastModifiedBy?: string // Người cập nhật cuối cùng
}

// Cập nhật interface SubWorkflow để thêm stepEstimatedTimes
export interface SubWorkflow {
  id: string
  name: string
  description: string
  parentId: string // ID của quy trình chuẩn
  statusId: string // ID của trạng thái sản phẩm
  visibleSteps: string[] // Danh sách ID của các bước hiển thị
  stepEstimatedTimes: Record<string, number> // Thời gian dự kiến cho từng bước (key: stepId, value: số ngày)
  createdAt: Date
  updatedAt: Date
}

// Định nghĩa kiểu dữ liệu cho lịch sử thay đổi quy trình
export interface WorkflowChangeHistory {
  id: string
  workflowId: string
  changeType: 'create' | 'update' | 'delete'
  entityType: 'workflow' | 'step' | 'field'
  entityId: string
  changes: {
    field: string
    oldValue?: any
    newValue: any
  }[]
  changedBy: string
  changedAt: Date
}

// Định nghĩa kiểu dữ liệu cho biến có sẵn
export interface AvailableVariable {
  id: string
  name: string
  description: string
  source: 'request' | 'system' | 'custom'
  type: 'text' | 'date' | 'user' | 'number' | 'select'
}

interface StandardWorkflowContextType {
  standardWorkflow: StandardWorkflow | null
  subWorkflows: SubWorkflow[]
  changeHistory: WorkflowChangeHistory[]
  availableVariables: AvailableVariable[]

  // Quản lý quy trình chuẩn
  initializeStandardWorkflow: () => void
  getStandardWorkflow: () => StandardWorkflow | null
  updateStandardWorkflow: (
    updates: Partial<
      Omit<StandardWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'version'>
    >,
    userId?: string
  ) => void

  // Quản lý bước trong quy trình chuẩn
  addStandardWorkflowStep: (
    step: Omit<StandardWorkflowStep, 'id' | 'order'>,
    userId?: string
  ) => string
  updateStandardWorkflowStep: (
    stepId: string,
    updates: Partial<Omit<StandardWorkflowStep, 'id'>>,
    userId?: string
  ) => void
  deleteStandardWorkflowStep: (stepId: string, userId?: string) => boolean
  reorderStandardWorkflowSteps: (
    steps: StandardWorkflowStep[],
    userId?: string
  ) => void

  // Quản lý trường trong bước
  addStepField: (
    stepId: string,
    field: Omit<StepField, 'id'>,
    userId?: string
  ) => string
  updateStepField: (
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, 'id'>>,
    userId?: string
  ) => void
  deleteStepField: (stepId: string, fieldId: string, userId?: string) => boolean

  // Quản lý quy trình con
  createSubWorkflow: (
    subWorkflow: Omit<
      SubWorkflow,
      'id' | 'createdAt' | 'updatedAt' | 'stepEstimatedTimes'
    >,
    userId?: string
  ) => string
  updateSubWorkflow: (
    id: string,
    updates: Partial<Omit<SubWorkflow, 'id' | 'createdAt' | 'updatedAt'>>,
    userId?: string
  ) => void
  deleteSubWorkflow: (id: string, userId?: string) => void
  getSubWorkflowByStatusId: (statusId: string) => SubWorkflow | undefined
  isSubWorkflowNameExists: (name: string, excludeId?: string) => boolean

  // Quản lý biến có sẵn
  addAvailableVariable: (
    variable: Omit<AvailableVariable, 'id'>,
    userId?: string
  ) => string
  updateAvailableVariable: (
    id: string,
    updates: Partial<Omit<AvailableVariable, 'id'>>,
    userId?: string
  ) => void
  deleteAvailableVariable: (id: string, userId?: string) => void

  // Quản lý lịch sử thay đổi
  getChangeHistoryForEntity: (
    entityType: 'workflow' | 'step' | 'field',
    entityId: string
  ) => WorkflowChangeHistory[]

  // Tính toán thời gian
  calculateDeadline: (startDate: Date, estimatedDays: number) => Date

  // Trạng thái
  loading: boolean
}

const StandardWorkflowContext = createContext<
  StandardWorkflowContextType | undefined
>(undefined)

// Danh sách các biến có sẵn mặc định
const DEFAULT_AVAILABLE_VARIABLES: AvailableVariable[] = [
  {
    id: 'requestor',
    name: 'Người yêu cầu',
    description: 'Người tạo yêu cầu',
    source: 'request',
    type: 'user'
  },
  {
    id: 'requestDate',
    name: 'Ngày yêu cầu',
    description: 'Ngày tạo yêu cầu',
    source: 'request',
    type: 'date'
  },
  {
    id: 'requestTitle',
    name: 'Tiêu đề yêu cầu',
    description: 'Tiêu đề của yêu cầu',
    source: 'request',
    type: 'text'
  },
  {
    id: 'requestDescription',
    name: 'Mô tả yêu cầu',
    description: 'Mô tả chi tiết của yêu cầu',
    source: 'request',
    type: 'text'
  },
  {
    id: 'requestCode',
    name: 'Mã yêu cầu',
    description: 'Mã tham chiếu của yêu cầu',
    source: 'request',
    type: 'text'
  },
  {
    id: 'currentUser',
    name: 'Người đăng nhập hiện tại',
    description: 'Người dùng đang đăng nhập vào hệ thống',
    source: 'system',
    type: 'user'
  },
  {
    id: 'currentDate',
    name: 'Ngày hiện tại',
    description: 'Ngày hiện tại của hệ thống',
    source: 'system',
    type: 'date'
  }
]

// Danh sách các bước quy trình chuẩn mặc định
const DEFAULT_STANDARD_WORKFLOW_STEPS: Omit<StandardWorkflowStep, 'id'>[] = [
  {
    name: 'Tiếp nhận yêu cầu',
    description: 'Tiếp nhận và phân tích yêu cầu từ khách hàng',
    estimatedDays: 1,
    order: 0,
    isRequired: true,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'requestInfo',
        name: 'Thông tin yêu cầu',
        type: 'variable',
        required: false,
        description: 'Thông tin từ yêu cầu',
        variableSource: 'requestTitle',
        isSystem: false
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên tiếp nhận',
    hasCost: false
  },
  {
    name: 'Checking (Kiểm tra yêu cầu)',
    description: 'Kiểm tra tính khả thi và đầy đủ của yêu cầu',
    estimatedDays: 1,
    order: 1,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm kiểm tra yêu cầu',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'checkResult',
        name: 'Kết quả kiểm tra',
        type: 'select',
        required: true,
        description: 'Kết quả kiểm tra yêu cầu',
        options: ['Đạt', 'Không đạt', 'Cần bổ sung thông tin']
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên kiểm tra',
    hasCost: false
  },
  {
    name: 'Chuẩn bị nguyên vật liệu',
    description: 'Chuẩn bị nguyên vật liệu cần thiết cho sản xuất',
    estimatedDays: 3,
    order: 2,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm chuẩn bị nguyên vật liệu',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'materialStatus',
        name: 'Tình trạng nguyên vật liệu',
        type: 'select',
        required: true,
        description: 'Tình trạng chuẩn bị nguyên vật liệu',
        options: ['Đầy đủ', 'Thiếu', 'Đang đặt hàng', 'Chờ nhập kho']
      },
      {
        id: 'materialCost',
        name: 'Chi phí nguyên vật liệu',
        type: 'currency',
        required: false,
        description: 'Chi phí mua nguyên vật liệu',
        currencySymbol: 'VND'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên kho',
    hasCost: true
  },
  {
    name: 'File sản xuất',
    description: 'Chuẩn bị file thiết kế và tài liệu kỹ thuật cho sản xuất',
    estimatedDays: 2,
    order: 3,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm chuẩn bị file sản xuất',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'fileUrl',
        name: 'Link file sản xuất',
        type: 'text',
        required: false,
        description: 'Link đến file thiết kế và tài liệu kỹ thuật'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên thiết kế',
    hasCost: false
  },
  {
    name: 'Sản xuất hàng mẫu',
    description: 'Sản xuất mẫu sản phẩm theo thiết kế',
    estimatedDays: 5,
    order: 4,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm sản xuất hàng mẫu',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'sampleQuantity',
        name: 'Số lượng mẫu',
        type: 'number',
        required: true,
        description: 'Số lượng mẫu cần sản xuất'
      },
      {
        id: 'sampleCost',
        name: 'Chi phí sản xuất mẫu',
        type: 'currency',
        required: false,
        description: 'Chi phí sản xuất mẫu',
        currencySymbol: 'VND'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên sản xuất',
    hasCost: true
  },
  {
    name: 'Phản hồi khách hàng',
    description: 'Nhận phản hồi từ khách hàng về mẫu sản phẩm',
    estimatedDays: 2,
    order: 5,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm tiếp nhận phản hồi',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'feedback',
        name: 'Phản hồi của khách hàng',
        type: 'text',
        required: false,
        description: 'Nội dung phản hồi từ khách hàng'
      },
      {
        id: 'feedbackResult',
        name: 'Kết quả phản hồi',
        type: 'select',
        required: true,
        description: 'Kết quả phản hồi từ khách hàng',
        options: ['Đồng ý', 'Yêu cầu chỉnh sửa', 'Từ chối']
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên kinh doanh',
    hasCost: false
  },
  {
    name: 'Template/Mockup',
    description: 'Tạo template hoặc mockup cho sản phẩm',
    estimatedDays: 3,
    order: 6,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm tạo template/mockup',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'templateUrl',
        name: 'Link template/mockup',
        type: 'text',
        required: false,
        description: 'Link đến template hoặc mockup'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên thiết kế',
    hasCost: false
  },
  {
    name: 'Cần check',
    description: 'Kiểm tra lại sản phẩm trước khi hoàn thiện',
    estimatedDays: 1,
    order: 7,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm kiểm tra',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'checkItems',
        name: 'Các mục cần kiểm tra',
        type: 'text',
        required: false,
        description: 'Danh sách các mục cần kiểm tra'
      },
      {
        id: 'checkResult',
        name: 'Kết quả kiểm tra',
        type: 'select',
        required: true,
        description: 'Kết quả kiểm tra sản phẩm',
        options: ['Đạt', 'Không đạt', 'Cần chỉnh sửa']
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên QC',
    hasCost: false
  },
  {
    name: 'Tính giá',
    description: 'Tính toán giá thành sản phẩm',
    estimatedDays: 1,
    order: 8,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm tính giá',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'materialCost',
        name: 'Chi phí nguyên vật liệu',
        type: 'currency',
        required: true,
        description: 'Chi phí nguyên vật liệu',
        currencySymbol: 'VND'
      },
      {
        id: 'laborCost',
        name: 'Chi phí nhân công',
        type: 'currency',
        required: true,
        description: 'Chi phí nhân công',
        currencySymbol: 'VND'
      },
      {
        id: 'overheadCost',
        name: 'Chi phí quản lý',
        type: 'currency',
        required: true,
        description: 'Chi phí quản lý',
        currencySymbol: 'VND'
      },
      {
        id: 'totalCost',
        name: 'Tổng chi phí',
        type: 'currency',
        required: true,
        description: 'Tổng chi phí sản xuất',
        currencySymbol: 'VND'
      },
      {
        id: 'sellingPrice',
        name: 'Giá bán',
        type: 'currency',
        required: true,
        description: 'Giá bán sản phẩm',
        currencySymbol: 'VND'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên kế toán',
    hasCost: true
  },
  {
    name: 'Cần up web',
    description: 'Đăng thông tin sản phẩm lên website',
    estimatedDays: 1,
    order: 9,
    fields: [
      {
        id: 'assignee',
        name: 'Người đảm nhận',
        type: 'user',
        required: true,
        description: 'Người chịu trách nhiệm đăng web',
        isSystem: true
      },
      {
        id: 'receiveDate',
        name: 'Thời gian tiếp nhận',
        type: 'date',
        required: true,
        description: 'Ngày tiếp nhận yêu cầu',
        isSystem: true
      },
      {
        id: 'deadline',
        name: 'Thời gian deadline',
        type: 'date',
        required: true,
        description: 'Ngày dự kiến hoàn thành công việc',
        isSystem: true
      },
      {
        id: 'status',
        name: 'Trạng thái',
        type: 'select',
        required: true,
        description: 'Trạng thái hiện tại của bước',
        options: ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành', 'Quá hạn'],
        isSystem: true
      },
      {
        id: 'productUrl',
        name: 'URL sản phẩm',
        type: 'text',
        required: false,
        description: 'URL của sản phẩm trên website'
      },
      {
        id: 'uploadDate',
        name: 'Ngày đăng web',
        type: 'date',
        required: false,
        description: 'Ngày đăng sản phẩm lên website'
      }
    ],
    notifyBeforeDeadline: 1,
    assigneeRole: 'Nhân viên marketing',
    hasCost: false
  }
]

export function StandardWorkflowProvider({
  children
}: {
  children: ReactNode
}) {
  const { productStatuses } = useProductStatus()
  const [standardWorkflow, setStandardWorkflow] =
    useState<StandardWorkflow | null>(null)
  const [subWorkflows, setSubWorkflows] = useState<SubWorkflow[]>([])
  const [changeHistory, setChangeHistory] = useState<WorkflowChangeHistory[]>(
    []
  )
  const [availableVariables, setAvailableVariables] = useState<
    AvailableVariable[]
  >(DEFAULT_AVAILABLE_VARIABLES)
  const [loading, setLoading] = useState(true)
  const isInitialized = useRef(false)

  // Khởi tạo dữ liệu từ localStorage khi component được mount
  useEffect(() => {
    if (!isInitialized.current) {
      setLoading(true)

      try {
        // Tải quy trình chuẩn
        const savedStandardWorkflow = localStorage.getItem('standardWorkflow')
        if (savedStandardWorkflow) {
          try {
            const parsedWorkflow = JSON.parse(savedStandardWorkflow)
            setStandardWorkflow({
              ...parsedWorkflow,
              createdAt: new Date(parsedWorkflow.createdAt),
              updatedAt: new Date(parsedWorkflow.updatedAt)
            })
          } catch (error) {
            console.error('Lỗi khi phân tích quy trình chuẩn:', error)
            initializeStandardWorkflow()
          }
        } else {
          initializeStandardWorkflow()
        }

        // Tải quy trình con
        const savedSubWorkflows = localStorage.getItem('subWorkflows')
        if (savedSubWorkflows) {
          try {
            const parsedSubWorkflows = JSON.parse(savedSubWorkflows)
            setSubWorkflows(
              parsedSubWorkflows.map((workflow: any) => ({
                ...workflow,
                createdAt: new Date(workflow.createdAt),
                updatedAt: new Date(workflow.updatedAt)
              }))
            )
          } catch (error) {
            console.error('Lỗi khi phân tích quy trình con:', error)
            setSubWorkflows([])
          }
        }

        // Tải lịch sử thay đổi
        const savedChangeHistory = localStorage.getItem('workflowChangeHistory')
        if (savedChangeHistory) {
          try {
            const parsedChangeHistory = JSON.parse(savedChangeHistory)
            setChangeHistory(
              parsedChangeHistory.map((history: any) => ({
                ...history,
                changedAt: new Date(history.changedAt)
              }))
            )
          } catch (error) {
            console.error('Lỗi khi phân tích lịch sử thay đổi:', error)
            setChangeHistory([])
          }
        }

        // Tải biến có sẵn
        const savedVariables = localStorage.getItem('availableVariables')
        if (savedVariables) {
          try {
            const parsedVariables = JSON.parse(savedVariables)
            setAvailableVariables(parsedVariables)
          } catch (error) {
            console.error('Lỗi khi phân tích biến có sẵn:', error)
            setAvailableVariables(DEFAULT_AVAILABLE_VARIABLES)
          }
        } else {
          setAvailableVariables(DEFAULT_AVAILABLE_VARIABLES)
          localStorage.setItem(
            'availableVariables',
            JSON.stringify(DEFAULT_AVAILABLE_VARIABLES)
          )
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu:', error)
      } finally {
        isInitialized.current = true
        setLoading(false)
      }
    }
  }, [])

  // Lưu dữ liệu vào localStorage khi thay đổi
  useEffect(() => {
    if (isInitialized.current && standardWorkflow) {
      localStorage.setItem('standardWorkflow', JSON.stringify(standardWorkflow))
    }
  }, [standardWorkflow])

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('subWorkflows', JSON.stringify(subWorkflows))
    }
  }, [subWorkflows])

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(
        'workflowChangeHistory',
        JSON.stringify(changeHistory)
      )
    }
  }, [changeHistory])

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem(
        'availableVariables',
        JSON.stringify(availableVariables)
      )
    }
  }, [availableVariables])

  // Tạo ID ngẫu nhiên
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9)
  }

  // Thêm lịch sử thay đổi
  const addChangeHistory = (
    changeType: 'create' | 'update' | 'delete',
    entityType: 'workflow' | 'step' | 'field',
    entityId: string,
    changes: { field: string; oldValue?: any; newValue: any }[],
    userId = 'system'
  ) => {
    const newHistory: WorkflowChangeHistory = {
      id: generateId(),
      workflowId: standardWorkflow?.id || 'standard-workflow',
      changeType,
      entityType,
      entityId,
      changes,
      changedBy: userId,
      changedAt: new Date()
    }

    setChangeHistory((prev) => [newHistory, ...prev])
    return newHistory.id
  }

  // Khởi tạo quy trình chuẩn
  const initializeStandardWorkflow = () => {
    const steps = DEFAULT_STANDARD_WORKFLOW_STEPS.map((step, index) => ({
      ...step,
      id: `step${index + 1}`
    }))

    const newStandardWorkflow: StandardWorkflow = {
      id: 'standard-workflow',
      name: 'Quy trình chuẩn',
      description: 'Quy trình chuẩn cho phát triển sản phẩm',
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }

    setStandardWorkflow(newStandardWorkflow)
    localStorage.setItem(
      'standardWorkflow',
      JSON.stringify(newStandardWorkflow)
    )

    // Thêm lịch sử tạo quy trình
    addChangeHistory(
      'create',
      'workflow',
      newStandardWorkflow.id,
      [{ field: 'workflow', newValue: newStandardWorkflow.name }],
      'system'
    )

    return newStandardWorkflow
  }

  // Lấy quy trình chuẩn
  const getStandardWorkflow = () => {
    return standardWorkflow
  }

  // Cập nhật quy trình chuẩn
  const updateStandardWorkflow = (
    updates: Partial<
      Omit<StandardWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'version'>
    >,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return

    const changes: { field: string; oldValue?: any; newValue: any }[] = []

    if (updates.name && updates.name !== standardWorkflow.name) {
      changes.push({
        field: 'name',
        oldValue: standardWorkflow.name,
        newValue: updates.name
      })
    }

    if (
      updates.description &&
      updates.description !== standardWorkflow.description
    ) {
      changes.push({
        field: 'description',
        oldValue: standardWorkflow.description,
        newValue: updates.description
      })
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      ...updates,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử cập nhật quy trình
    if (changes.length > 0) {
      addChangeHistory(
        'update',
        'workflow',
        updatedWorkflow.id,
        changes,
        userId
      )
    }

    return updatedWorkflow
  }

  // Thêm bước mới vào quy trình chuẩn
  const addStandardWorkflowStep = (
    step: Omit<StandardWorkflowStep, 'id' | 'order'>,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return ''

    const stepId = generateId()
    const newStep: StandardWorkflowStep = {
      ...step,
      id: stepId,
      order: standardWorkflow.steps.length
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: [...standardWorkflow.steps, newStep],
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử tạo bước
    addChangeHistory(
      'create',
      'step',
      stepId,
      [{ field: 'step', newValue: newStep.name }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã thêm bước "${newStep.name}" vào quy trình chuẩn.`
    })

    return stepId
  }

  // Cập nhật bước trong quy trình chuẩn
  const updateStandardWorkflowStep = (
    stepId: string,
    updates: Partial<Omit<StandardWorkflowStep, 'id'>>,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return

    const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const oldStep = standardWorkflow.steps[stepIndex]
    const changes: { field: string; oldValue?: any; newValue: any }[] = []

    if (updates.name && updates.name !== oldStep.name) {
      changes.push({
        field: 'name',
        oldValue: oldStep.name,
        newValue: updates.name
      })
    }

    if (updates.description && updates.description !== oldStep.description) {
      changes.push({
        field: 'description',
        oldValue: oldStep.description,
        newValue: updates.description
      })
    }

    if (
      updates.estimatedDays !== undefined &&
      updates.estimatedDays !== oldStep.estimatedDays
    ) {
      changes.push({
        field: 'estimatedDays',
        oldValue: oldStep.estimatedDays,
        newValue: updates.estimatedDays
      })
    }

    if (
      updates.isRequired !== undefined &&
      updates.isRequired !== oldStep.isRequired
    ) {
      changes.push({
        field: 'isRequired',
        oldValue: oldStep.isRequired,
        newValue: updates.isRequired
      })
    }

    if (
      updates.notifyBeforeDeadline !== undefined &&
      updates.notifyBeforeDeadline !== oldStep.notifyBeforeDeadline
    ) {
      changes.push({
        field: 'notifyBeforeDeadline',
        oldValue: oldStep.notifyBeforeDeadline,
        newValue: updates.notifyBeforeDeadline
      })
    }

    if (updates.assigneeRole && updates.assigneeRole !== oldStep.assigneeRole) {
      changes.push({
        field: 'assigneeRole',
        oldValue: oldStep.assigneeRole,
        newValue: updates.assigneeRole
      })
    }

    if (updates.hasCost !== undefined && updates.hasCost !== oldStep.hasCost) {
      changes.push({
        field: 'hasCost',
        oldValue: oldStep.hasCost,
        newValue: updates.hasCost
      })
    }

    const updatedSteps = [...standardWorkflow.steps]
    updatedSteps[stepIndex] = {
      ...oldStep,
      ...updates
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: updatedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử cập nhật bước
    if (changes.length > 0) {
      addChangeHistory('update', 'step', stepId, changes, userId)
    }

    toast({
      title: 'Thành công',
      description: `Đã cập nhật bước "${updatedSteps[stepIndex].name}".`
    })
  }

  // Xóa bước khỏi quy trình chuẩn
  const deleteStandardWorkflowStep = (stepId: string, userId = 'system') => {
    if (!standardWorkflow) return false

    const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return false

    const step = standardWorkflow.steps[stepIndex]

    // Không cho phép xóa bước bắt buộc
    if (step.isRequired) {
      toast({
        title: 'Không thể xóa',
        description: 'Không thể xóa bước bắt buộc trong quy trình chuẩn.',
        variant: 'destructive'
      })
      return false
    }

    // Kiểm tra xem bước có được sử dụng trong quy trình con không
    const isUsedInSubWorkflow = subWorkflows.some((sw) =>
      sw.visibleSteps.includes(stepId)
    )
    if (isUsedInSubWorkflow) {
      toast({
        title: 'Không thể xóa',
        description:
          'Bước này đang được sử dụng trong một hoặc nhiều quy trình con.',
        variant: 'destructive'
      })
      return false
    }

    const updatedSteps = standardWorkflow.steps.filter((s) => s.id !== stepId)

    // Cập nhật lại thứ tự các bước
    const reorderedSteps = updatedSteps.map((s, index) => ({
      ...s,
      order: index
    }))

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: reorderedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử xóa bước
    addChangeHistory(
      'delete',
      'step',
      stepId,
      [{ field: 'step', oldValue: step.name, newValue: null }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã xóa bước "${step.name}" khỏi quy trình chuẩn.`
    })

    return true
  }

  // Sắp xếp lại thứ tự các bước
  const reorderStandardWorkflowSteps = (
    steps: StandardWorkflowStep[],
    userId = 'system'
  ) => {
    if (!standardWorkflow) return

    const updatedSteps = steps.map((step, index) => ({
      ...step,
      order: index
    }))

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: updatedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử sắp xếp lại bước
    addChangeHistory(
      'update',
      'workflow',
      standardWorkflow.id,
      [
        {
          field: 'steps_order',
          oldValue: 'previous_order',
          newValue: 'new_order'
        }
      ],
      userId
    )

    toast({
      title: 'Thành công',
      description: 'Đã sắp xếp lại thứ tự các bước trong quy trình chuẩn.'
    })
  }

  // Thêm trường vào bước
  const addStepField = (
    stepId: string,
    field: Omit<StepField, 'id'>,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return ''

    const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return ''

    const fieldId = generateId()
    const newField: StepField = {
      ...field,
      id: fieldId
    }

    const updatedSteps = [...standardWorkflow.steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      fields: [...updatedSteps[stepIndex].fields, newField]
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: updatedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử tạo trường
    addChangeHistory(
      'create',
      'field',
      fieldId,
      [{ field: 'field', newValue: newField.name }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã thêm trường "${newField.name}" vào bước "${updatedSteps[stepIndex].name}".`
    })

    return fieldId
  }

  // Cập nhật trường trong bước
  const updateStepField = (
    stepId: string,
    fieldId: string,
    updates: Partial<Omit<StepField, 'id'>>,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return

    const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return

    const fieldIndex = standardWorkflow.steps[stepIndex].fields.findIndex(
      (f) => f.id === fieldId
    )
    if (fieldIndex === -1) return

    const oldField = standardWorkflow.steps[stepIndex].fields[fieldIndex]
    const changes: { field: string; oldValue?: any; newValue: any }[] = []

    if (updates.name && updates.name !== oldField.name) {
      changes.push({
        field: 'name',
        oldValue: oldField.name,
        newValue: updates.name
      })
    }

    if (updates.description && updates.description !== oldField.description) {
      changes.push({
        field: 'description',
        oldValue: oldField.description,
        newValue: updates.description
      })
    }

    if (updates.type && updates.type !== oldField.type) {
      changes.push({
        field: 'type',
        oldValue: oldField.type,
        newValue: updates.type
      })
    }

    if (
      updates.required !== undefined &&
      updates.required !== oldField.required
    ) {
      changes.push({
        field: 'required',
        oldValue: oldField.required,
        newValue: updates.required
      })
    }

    const updatedSteps = [...standardWorkflow.steps]
    const updatedFields = [...updatedSteps[stepIndex].fields]
    updatedFields[fieldIndex] = {
      ...oldField,
      ...updates
    }
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      fields: updatedFields
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: updatedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử cập nhật trường
    if (changes.length > 0) {
      addChangeHistory('update', 'field', fieldId, changes, userId)
    }

    toast({
      title: 'Thành công',
      description: `Đã cập nhật trường "${updatedFields[fieldIndex].name}".`
    })
  }

  // Xóa trường khỏi bước
  const deleteStepField = (
    stepId: string,
    fieldId: string,
    userId = 'system'
  ) => {
    if (!standardWorkflow) return false

    const stepIndex = standardWorkflow.steps.findIndex((s) => s.id === stepId)
    if (stepIndex === -1) return false

    const fieldIndex = standardWorkflow.steps[stepIndex].fields.findIndex(
      (f) => f.id === fieldId
    )
    if (fieldIndex === -1) return false

    const field = standardWorkflow.steps[stepIndex].fields[fieldIndex]

    // Không cho phép xóa trường hệ thống
    if (field.isSystem) {
      toast({
        title: 'Không thể xóa',
        description: 'Không thể xóa trường hệ thống.',
        variant: 'destructive'
      })
      return false
    }

    const updatedSteps = [...standardWorkflow.steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      fields: updatedSteps[stepIndex].fields.filter((f) => f.id !== fieldId)
    }

    const updatedWorkflow: StandardWorkflow = {
      ...standardWorkflow,
      steps: updatedSteps,
      updatedAt: new Date(),
      version: standardWorkflow.version + 1,
      lastModifiedBy: userId
    }

    setStandardWorkflow(updatedWorkflow)

    // Thêm lịch sử xóa trường
    addChangeHistory(
      'delete',
      'field',
      fieldId,
      [{ field: 'field', oldValue: field.name, newValue: null }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã xóa trường "${field.name}" khỏi bước "${updatedSteps[stepIndex].name}".`
    })

    return true
  }

  // Tạo quy trình con mới
  const createSubWorkflow = (
    subWorkflow: Omit<
      SubWorkflow,
      'id' | 'createdAt' | 'updatedAt' | 'stepEstimatedTimes'
    >,
    userId = 'system'
  ) => {
    const id = generateId()
    const now = new Date()

    // Khởi tạo thời gian dự kiến cho từng bước từ quy trình chuẩn
    const stepEstimatedTimes: Record<string, number> = {}
    if (standardWorkflow) {
      subWorkflow.visibleSteps.forEach((stepId) => {
        const step = standardWorkflow.steps.find((s) => s.id === stepId)
        if (step) {
          stepEstimatedTimes[stepId] = step.estimatedDays
        }
      })
    }

    const newSubWorkflow: SubWorkflow = {
      ...subWorkflow,
      id,
      stepEstimatedTimes,
      createdAt: now,
      updatedAt: now
    }

    setSubWorkflows((prev) => [...prev, newSubWorkflow])

    // Thêm lịch sử tạo quy trình con
    addChangeHistory(
      'create',
      'workflow',
      id,
      [{ field: 'sub_workflow', newValue: newSubWorkflow.name }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã tạo quy trình con "${newSubWorkflow.name}".`
    })

    return id
  }

  // Cập nhật quy trình con
  const updateSubWorkflow = (
    id: string,
    updates: Partial<Omit<SubWorkflow, 'id' | 'createdAt' | 'updatedAt'>>,
    userId = 'system'
  ) => {
    const subWorkflowIndex = subWorkflows.findIndex((sw) => sw.id === id)
    if (subWorkflowIndex === -1) return

    const oldSubWorkflow = subWorkflows[subWorkflowIndex]
    const changes: { field: string; oldValue?: any; newValue: any }[] = []

    if (updates.name && updates.name !== oldSubWorkflow.name) {
      changes.push({
        field: 'name',
        oldValue: oldSubWorkflow.name,
        newValue: updates.name
      })
    }

    if (
      updates.description &&
      updates.description !== oldSubWorkflow.description
    ) {
      changes.push({
        field: 'description',
        oldValue: oldSubWorkflow.description,
        newValue: updates.description
      })
    }

    if (updates.statusId && updates.statusId !== oldSubWorkflow.statusId) {
      changes.push({
        field: 'statusId',
        oldValue: oldSubWorkflow.statusId,
        newValue: updates.statusId
      })
    }

    if (
      updates.visibleSteps &&
      JSON.stringify(updates.visibleSteps) !==
        JSON.stringify(oldSubWorkflow.visibleSteps)
    ) {
      changes.push({
        field: 'visibleSteps',
        oldValue: oldSubWorkflow.visibleSteps,
        newValue: updates.visibleSteps
      })
    }

    const updatedSubWorkflows = [...subWorkflows]
    updatedSubWorkflows[subWorkflowIndex] = {
      ...oldSubWorkflow,
      ...updates,
      updatedAt: new Date()
    }

    setSubWorkflows(updatedSubWorkflows)

    // Thêm lịch sử cập nhật quy trình con
    if (changes.length > 0) {
      addChangeHistory('update', 'workflow', id, changes, userId)
    }

    toast({
      title: 'Thành công',
      description: `Đã cập nhật quy trình con "${updatedSubWorkflows[subWorkflowIndex].name}".`
    })
  }

  // Xóa quy trình con
  const deleteSubWorkflow = (id: string, userId = 'system') => {
    const subWorkflow = subWorkflows.find((sw) => sw.id === id)
    if (!subWorkflow) return

    setSubWorkflows((prev) => prev.filter((sw) => sw.id !== id))

    // Thêm lịch sử xóa quy trình con
    addChangeHistory(
      'delete',
      'workflow',
      id,
      [{ field: 'sub_workflow', oldValue: subWorkflow.name, newValue: null }],
      userId
    )

    toast({
      title: 'Thành công',
      description: `Đã xóa quy trình con "${subWorkflow.name}".`
    })
  }

  // Lấy quy trình con theo ID trạng thái
  const getSubWorkflowByStatusId = (statusId: string) => {
    return subWorkflows.find((workflow) => workflow.statusId === statusId)
  }

  // Kiểm tra tên quy trình con đã tồn tại
  const isSubWorkflowNameExists = (name: string, excludeId?: string) => {
    return subWorkflows.some(
      (workflow) => workflow.name === name && workflow.id !== excludeId
    )
  }

  // Thêm biến có sẵn
  const addAvailableVariable = (
    variable: Omit<AvailableVariable, 'id'>,
    userId = 'system'
  ) => {
    const id = generateId()
    const newVariable: AvailableVariable = {
      ...variable,
      id
    }

    setAvailableVariables((prev) => [...prev, newVariable])

    toast({
      title: 'Thành công',
      description: `Đã thêm biến "${newVariable.name}".`
    })

    return id
  }

  // Cập nhật biến có sẵn
  const updateAvailableVariable = (
    id: string,
    updates: Partial<Omit<AvailableVariable, 'id'>>,
    userId = 'system'
  ) => {
    setAvailableVariables((prev) =>
      prev.map((variable) =>
        variable.id === id
          ? {
              ...variable,
              ...updates
            }
          : variable
      )
    )

    toast({
      title: 'Thành công',
      description: 'Đã cập nhật biến.'
    })
  }

  // Xóa biến có sẵn
  const deleteAvailableVariable = (id: string, userId = 'system') => {
    const variable = availableVariables.find((v) => v.id === id)
    if (!variable) return

    // Không cho phép xóa biến hệ thống
    if (variable.source === 'system' || variable.source === 'request') {
      toast({
        title: 'Không thể xóa',
        description: 'Không thể xóa biến hệ thống.',
        variant: 'destructive'
      })
      return
    }

    setAvailableVariables((prev) => prev.filter((v) => v.id !== id))

    toast({
      title: 'Thành công',
      description: `Đã xóa biến "${variable.name}".`
    })
  }

  // Lấy lịch sử thay đổi cho một đối tượng
  const getChangeHistoryForEntity = (
    entityType: 'workflow' | 'step' | 'field',
    entityId: string
  ) => {
    return changeHistory.filter(
      (history) =>
        history.entityType === entityType && history.entityId === entityId
    )
  }

  // Tính toán ngày deadline dựa trên ngày bắt đầu và số ngày ước tính
  const calculateDeadline = (startDate: Date, estimatedDays: number) => {
    const deadline = new Date(startDate)
    deadline.setDate(deadline.getDate() + estimatedDays)
    return deadline
  }

  return (
    <StandardWorkflowContext.Provider
      value={{
        standardWorkflow,
        subWorkflows,
        changeHistory,
        availableVariables,
        initializeStandardWorkflow,
        getStandardWorkflow,
        updateStandardWorkflow,
        addStandardWorkflowStep,
        updateStandardWorkflowStep,
        deleteStandardWorkflowStep,
        reorderStandardWorkflowSteps,
        addStepField,
        updateStepField,
        deleteStepField,
        createSubWorkflow,
        updateSubWorkflow,
        deleteSubWorkflow,
        getSubWorkflowByStatusId,
        isSubWorkflowNameExists,
        addAvailableVariable,
        updateAvailableVariable,
        deleteAvailableVariable,
        getChangeHistoryForEntity,
        calculateDeadline,
        loading
      }}
    >
      {children}
    </StandardWorkflowContext.Provider>
  )
}

export function useStandardWorkflow() {
  const context = useContext(StandardWorkflowContext)
  if (context === undefined) {
    throw new Error(
      'useStandardWorkflow must be used within a StandardWorkflowProvider'
    )
  }
  return context
}
