import type { Timestamp } from 'firebase/firestore'

// Định nghĩa kiểu dữ liệu cho một thay đổi
export interface Change {
  field: string
  oldValue?: any
  newValue?: any
}

// Định nghĩa kiểu dữ liệu cho một bước bị ảnh hưởng khi quay lại
export interface AffectedStep {
  id: string
  name: string
  previousStatus: string
  newStatus: string
}

// Định nghĩa kiểu dữ liệu cơ bản cho một bản ghi lịch sử
export interface HistoryEntry {
  id: string
  requestId: string
  userId: string
  userName: string
  userEmail?: string
  userAvatar?: string
  timestamp: Date | Timestamp
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'revert'
    | 'complete'
    | 'reject'
    | 'hold'
  entityType: 'request' | 'workflow' | 'step' | 'material' | 'comment'
  entityId: string
  changes?: Change[]
  details?: string
  reason?: string
  metadata?: Record<string, any>
}

// Định nghĩa kiểu dữ liệu cho lịch sử quay lại bước
export interface WorkflowRevertHistory extends HistoryEntry {
  fromStepId: string
  fromStepName: string
  toStepId: string
  toStepName: string
  affectedSteps?: AffectedStep[]
}

// Định nghĩa kiểu dữ liệu cho lịch sử hoàn thành bước
export interface StepCompletionHistory extends HistoryEntry {
  stepId: string
  stepName: string
  nextStepId?: string
  nextStepName?: string
  fieldValues?: Record<string, any>
}
