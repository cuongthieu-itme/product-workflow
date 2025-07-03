'use client'

import type React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  useRequest,
  type DataSource,
  type MaterialWithImport
} from './request-context'
import {
  useWorkflowProcess,
  type WorkflowProcess,
  type StepField
} from '../workflow/workflow-process-context'
import { useSubWorkflow } from '../workflow/sub-workflow-context-firebase'
import { useStandardWorkflow } from '../workflow/standard-workflow-context-firebase'
import { useProductStatus } from '../product-status/product-status-context-firebase'
import { useMaterialContext } from '../materials/material-context'
import { useCustomers } from '../customers/customer-context' // Import useCustomers
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MultiMediaUpload } from '../materials/multi-media-upload'
import { AlertCircle, Info, Loader2, Plus, X } from 'lucide-react'
import { EnhancedDataSourceSelector } from './enhanced-data-source-selector'
import type { UserType } from './user-selector'
import { MaterialSelector } from './material-selector'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { WorkflowStepExecutionUI } from '../workflow/workflow-step-execution-ui'

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { UserSelector } from './user-selector'

// Declare the normalizeDate function
const normalizeDate = (date: string) => {
  return new Date(date).toISOString()
}

// Thêm các hàm helper sau hàm normalizeDate
const getBusinessHourReceiveDate = () => {
  // Tạo thời gian hiện tại theo múi giờ Việt Nam (UTC+7)
  const now = new Date()
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000) // UTC+7

  const currentHour = vietnamTime.getHours()
  const currentMinute = vietnamTime.getMinutes()

  // Kiểm tra xem có trong giờ làm việc không (8:00 - 18:30)
  const isBusinessHours =
    (currentHour > 8 || (currentHour === 8 && currentMinute >= 0)) &&
    (currentHour < 18 || (currentHour === 18 && currentMinute <= 30))

  if (isBusinessHours) {
    // Trong giờ làm việc - giữ nguyên thời gian hiện tại
    return vietnamTime.toISOString()
  } else {
    // Ngoài giờ làm việc - lấy 8h sáng gần nhất
    const next8AM = new Date(vietnamTime)

    if (currentHour >= 19 || currentHour < 8) {
      // Sau 19h hoặc trước 8h - lấy 8h sáng hôm sau
      if (currentHour < 8) {
        // Trước 8h sáng - lấy 8h sáng cùng ngày
        next8AM.setHours(8, 0, 0, 0)
      } else {
        // Sau 18:30 - lấy 8h sáng hôm sau
        next8AM.setDate(next8AM.getDate() + 1)
        next8AM.setHours(8, 0, 0, 0)
      }
    }

    return next8AM.toISOString()
  }
}

// Thay thế hàm calculateDeadline để sử dụng múi giờ Việt Nam
const calculateDeadline = (receiveDate: string, estimatedDays: number) => {
  const receive = new Date(receiveDate)
  // Chuyển sang múi giờ Việt Nam
  const vietnamReceive = new Date(receive.getTime() + 7 * 60 * 60 * 1000)
  const deadline = new Date(vietnamReceive)
  deadline.setDate(deadline.getDate() + estimatedDays)
  return deadline.toISOString()
}

// Thêm hàm helper để format ngày giờ theo múi giờ Việt Nam
const formatDateTimeForInput = (dateString: string) => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)

    // Nếu date đã là thời gian địa phương, sử dụng trực tiếp
    // Nếu không, chuyển sang múi giờ Việt Nam
    const vietnamDate = new Date(
      date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
    )

    // Format thành YYYY-MM-DDTHH:mm cho input datetime-local
    const year = vietnamDate.getFullYear()
    const month = String(vietnamDate.getMonth() + 1).padStart(2, '0')
    const day = String(vietnamDate.getDate()).padStart(2, '0')
    const hours = String(vietnamDate.getHours()).padStart(2, '0')
    const minutes = String(vietnamDate.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

const parseEstimatedTime = (timeString: string): number => {
  // Phân tích chuỗi thời gian ước tính (ví dụ: "1 ngày", "2 tuần", "3 tháng")
  const match = timeString.match(/(\d+)\s*(ngày|tuần|tháng)/i)
  if (!match) return 1 // Mặc định 1 ngày

  const value = Number.parseInt(match[1])
  const unit = match[2].toLowerCase()

  switch (unit) {
    case 'ngày':
      return value
    case 'tuần':
      return value * 7
    case 'tháng':
      return value * 30
    default:
      return 1
  }
}

// Thêm hàm helper để kiểm tra URL hợp lệ
const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

interface RequestFormProps {
  requestId?: string
  onSuccess?: () => void
  inDialog?: boolean
}

export function RequestForm({
  requestId,
  onSuccess,
  inDialog = false
}: RequestFormProps) {
  const router = useRouter()
  const {
    addRequest,
    updateRequest,
    getRequestById,
    generateRequestCode,
    addMaterialImportRequest,
    refreshData
  } = useRequest()

  // Lấy thông tin người dùng từ Firebase users collection
  const [currentUser, setCurrentUser] = useState<{
    id: string
    name: string
    department: string
    position: string
    email: string
  } | null>(null)

  const { workflowProcesses } = useWorkflowProcess()
  const { productStatuses } = useProductStatus()
  const { subWorkflows, getStepsByIds } = useSubWorkflow()
  const {
    standardWorkflow,
    loading: standardWorkflowLoading,
    initialized: standardWorkflowInitialized
  } = useStandardWorkflow()

  const {
    addMaterialRequest,
    getMaterialById,
    refreshData: refreshMaterialData,
    materialRequests,
    updateMaterialRequest
  } = useMaterialContext()

  // Thêm useCustomers hook
  const { addRequestToCustomer } = useCustomers()

  // Refs để theo dõi trạng thái và tránh vòng lặp vô hạn
  const isInitialLoadRef = useRef(true)
  const prevProductStatusIdRef = useRef('')
  const prevWorkflowProcessIdRef = useRef('')
  const isFormInitializedRef = useRef(false)
  const initialFieldValuesSetRef = useRef(false)
  const datesInitializedRef = useRef(false)

  // State cho form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDataSource, setSelectedDataSource] =
    useState<DataSource | null>(null)
  const [requestCode, setRequestCode] = useState<string>('')

  // Thay đổi referenceLink thành mảng referenceLinks
  const [referenceLinks, setReferenceLinks] = useState<string[]>([''])

  const [media, setMedia] = useState<any[]>([]) // Thay đổi từ images thành media
  const [selectedMaterials, setSelectedMaterials] = useState<
    MaterialWithImport[]
  >([])
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [productStatusId, setProductStatusId] = useState('')
  const [workflowProcessId, setWorkflowProcessId] = useState('')
  const [availableWorkflowProcesses, setAvailableWorkflowProcesses] = useState<
    WorkflowProcess[]
  >([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [specificSource, setSpecificSource] = useState('')
  const [workflowInfoOpen, setWorkflowInfoOpen] = useState(true)
  const [dbProductStatuses, setDbProductStatuses] = useState<any[]>([])
  const [isUsingStandardWorkflow, setIsUsingStandardWorkflow] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showWorkflowSelect, setShowWorkflowSelect] = useState(false)
  const [linkedSubWorkflows, setLinkedSubWorkflows] = useState<any[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)
  const [selectedSubWorkflow, setSelectedSubWorkflow] = useState<any>(null)
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)

  // State cho các trường dữ liệu của bước đầu tiên
  const [firstStepFields, setFirstStepFields] = useState<StepField[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const [firstStepId, setFirstStepId] = useState<string | null>(null)

  // Thêm sau các state khác
  const [titleExists, setTitleExists] = useState(false)
  const [isTitleCheckLoading, setIsTitleCheckLoading] = useState(false)

  // Hàm thêm link mới
  const addReferenceLink = () => {
    setReferenceLinks((prev) => [...prev, ''])
  }

  // Hàm xóa link
  const removeReferenceLink = (index: number) => {
    if (referenceLinks.length > 1) {
      setReferenceLinks((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // Hàm cập nhật link
  const updateReferenceLink = (index: number, value: string) => {
    setReferenceLinks((prev) =>
      prev.map((link, i) => (i === index ? value : link))
    )
  }

  // Thêm useEffect để lấy thông tin người dùng từ Firebase
  useEffect(() => {
    const getUserInfo = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Lấy username từ localStorage (không phải userId)
          const username =
            localStorage.getItem('username') || localStorage.getItem('userId')

          if (!username) {
            console.warn('Không tìm thấy username trong localStorage')
            // Fallback về thông tin từ localStorage
            setCurrentUser({
              id: 'user_' + Date.now(),
              name:
                localStorage.getItem('userName') ||
                localStorage.getItem('displayName') ||
                'Người dùng',
              department:
                localStorage.getItem('userDepartment') || 'Chưa xác định',
              position: localStorage.getItem('userPosition') || 'Nhân viên',
              email: localStorage.getItem('userEmail') || ''
            })
            return
          }

          console.log('🔍 Fetching user info for username:', username)

          // Tìm user trong Firebase collection "users" bằng username
          const usersRef = collection(db, 'users')
          const userQuery = query(usersRef, where('username', '==', username))
          const userSnapshot = await getDocs(userQuery)

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data()
            console.log('✅ Found user data from Firebase:', userData)

            setCurrentUser({
              id: userData.username || username,
              name: userData.fullName || userData.name || 'Người dùng',
              department: userData.department || 'Chưa xác định',
              position: userData.role || userData.position || 'Nhân viên',
              email: userData.email || ''
            })
          } else {
            // Nếu không tìm thấy trong collection users, thử tìm bằng document ID
            try {
              const userDocRef = doc(db, 'users', username)
              const userDocSnap = await getDoc(userDocRef)

              if (userDocSnap.exists()) {
                const userData = userDocSnap.data()
                console.log('✅ Found user data by document ID:', userData)

                setCurrentUser({
                  id: userData.username || username,
                  name: userData.fullName || userData.name || 'Người dùng',
                  department: userData.department || 'Chưa xác định',
                  position: userData.role || userData.position || 'Nhân viên',
                  email: userData.email || ''
                })
              } else {
                console.warn(
                  '❌ User not found in Firebase, using localStorage fallback'
                )
                // Fallback về thông tin từ localStorage
                setCurrentUser({
                  id: username,
                  name:
                    localStorage.getItem('userName') ||
                    localStorage.getItem('displayName') ||
                    'Người dùng',
                  department:
                    localStorage.getItem('userDepartment') || 'Chưa xác định',
                  position: localStorage.getItem('userPosition') || 'Nhân viên',
                  email: localStorage.getItem('userEmail') || ''
                })
              }
            } catch (error) {
              console.error('❌ Error fetching user by document ID:', error)
              // Fallback về thông tin từ localStorage
              setCurrentUser({
                id: username,
                name:
                  localStorage.getItem('userName') ||
                  localStorage.getItem('displayName') ||
                  'Người dùng',
                department:
                  localStorage.getItem('userDepartment') || 'Chưa xác định',
                position: localStorage.getItem('userPosition') || 'Nhân viên',
                email: localStorage.getItem('userEmail') || ''
              })
            }
          }
        } catch (error) {
          console.error('❌ Error fetching user info:', error)
          // Fallback về thông tin từ localStorage
          const username =
            localStorage.getItem('username') ||
            localStorage.getItem('userId') ||
            'user_' + Date.now()
          setCurrentUser({
            id: username,
            name:
              localStorage.getItem('userName') ||
              localStorage.getItem('displayName') ||
              'Người dùng',
            department:
              localStorage.getItem('userDepartment') || 'Chưa xác định',
            position: localStorage.getItem('userPosition') || 'Nhân viên',
            email: localStorage.getItem('userEmail') || ''
          })
        }
      }
    }

    getUserInfo()
  }, [])

  // Cập nhật mã yêu cầu khi nguồn dữ liệu thay đổi
  const updateRequestCode = useCallback(() => {
    if (selectedDataSource && !requestId && !isFormInitializedRef.current) {
      const code = generateRequestCode(selectedDataSource)
      setRequestCode(code)
    }
  }, [selectedDataSource, generateRequestCode, requestId])

  useEffect(() => {
    updateRequestCode()
  }, [selectedDataSource, updateRequestCode])

  // Kiểm tra tiêu đề đã tồn tại trong cơ sở dữ liệu
  const checkTitleExists = useCallback(async () => {
    if (!title.trim()) {
      setTitleExists(false)
      return
    }

    setIsTitleCheckLoading(true)
    try {
      const requestsRef = collection(db, 'requests')
      const q = query(requestsRef, where('title', '==', title.trim()))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setTitleExists(false)
      } else {
        if (requestId) {
          // Nếu đang chỉnh sửa, kiểm tra xem có request nào khác dùng tiêu đề này không
          const exists = querySnapshot.docs.some((doc) => doc.id !== requestId)
          setTitleExists(exists)
        } else {
          // Nếu tạo mới, bất kỳ kết quả nào cũng có nghĩa là tiêu đề đã tồn tại
          setTitleExists(true)
        }
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra tiêu đề:', error)
      setTitleExists(false)
    } finally {
      setIsTitleCheckLoading(false)
    }
  }, [title, requestId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title.trim()) {
        checkTitleExists()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [title, checkTitleExists])

  // Nếu đang chỉnh sửa, lấy thông tin yêu cầu
  useEffect(() => {
    if (requestId && isInitialLoadRef.current) {
      const loadRequest = async () => {
        try {
          const request = await getRequestById(requestId)
          if (request) {
            setTitle(request.title || '')
            setDescription(request.description || '')
            setSelectedDataSource(request.dataSource || null)
            setRequestCode(request.code || '')

            // Xử lý referenceLinks - backward compatibility
            if (
              request.referenceLinks &&
              Array.isArray(request.referenceLinks)
            ) {
              setReferenceLinks(
                request.referenceLinks.filter((link) => link.trim() !== '')
              )
            } else if (request.referenceLink) {
              setReferenceLinks([request.referenceLink])
            } else {
              setReferenceLinks([''])
            }

            // Xử lý media (backward compatibility với images)
            if (request.media) {
              setMedia(request.media)
            } else if (request.images) {
              // Convert old images format to new media format
              const convertedMedia = request.images.map((url: string) => ({
                url,
                type: 'image' as const
              }))
              setMedia(convertedMedia)
            }

            setSelectedMaterials(request.materials || [])

            if (request.assignee) {
              setSelectedUser({
                id: request.assignee.id,
                name: request.assignee.name,
                department: request.assignee.department || '',
                position: request.assignee.position || '',
                email: request.assignee.email || ''
              })
            }

            if (request.dataSource && request.dataSource.type === 'other') {
              setSpecificSource(request.dataSource.specificSource || '')
            }

            if (request.productStatus && request.productStatus.id) {
              setProductStatusId(request.productStatus.id)
              prevProductStatusIdRef.current = request.productStatus.id
            }

            if (request.workflowProcessId) {
              setWorkflowProcessId(request.workflowProcessId)
              prevWorkflowProcessIdRef.current = request.workflowProcessId
            }

            if (
              request.workflowStepData &&
              request.workflowStepData.fieldValues
            ) {
              const normalizedFieldValues = {
                ...request.workflowStepData.fieldValues
              }

              if (normalizedFieldValues.receiveDate) {
                normalizedFieldValues.receiveDate = normalizeDate(
                  normalizedFieldValues.receiveDate
                )
              }

              if (normalizedFieldValues.deadline) {
                normalizedFieldValues.deadline = normalizeDate(
                  normalizedFieldValues.deadline
                )
              }

              Object.keys(normalizedFieldValues).forEach((key) => {
                const field = request.workflowStepData?.fieldValues?.[key]
                if (
                  field &&
                  typeof field === 'object' &&
                  field instanceof Date
                ) {
                  normalizedFieldValues[key] = normalizeDate(field)
                }
              })

              setFieldValues(normalizedFieldValues)
              initialFieldValuesSetRef.current = true
              datesInitializedRef.current = true
            }

            isFormInitializedRef.current = true

            setTimeout(() => {
              isInitialLoadRef.current = false
            }, 100)
          }
        } catch (error) {
          console.error('Error loading request:', error)
        }
      }

      loadRequest()
    } else if (!requestId) {
      isInitialLoadRef.current = false
    }
  }, [requestId, getRequestById])

  // Reset form
  const resetForm = useCallback(() => {
    setTitle('')
    setDescription('')
    setSelectedDataSource(null)
    setRequestCode('')
    setReferenceLinks(['']) // Reset về mảng với 1 phần tử rỗng
    setMedia([]) // Reset media thay vì images
    setSelectedMaterials([])
    setSelectedUser(null)
    setProductStatusId('')
    setWorkflowProcessId('')
    setSpecificSource('')
    setFirstStepFields([])
    setFieldValues({})
    setFirstStepId(null)
    setIsUsingStandardWorkflow(false)
    setShowWorkflowSelect(false)
    setLinkedSubWorkflows([])
    setSelectedSubWorkflow(null)
    setWorkflowSteps([])
    setCustomerId(null) // Reset customerId

    isInitialLoadRef.current = true
    prevProductStatusIdRef.current = ''
    prevWorkflowProcessIdRef.current = ''
    isFormInitializedRef.current = false
    initialFieldValuesSetRef.current = false
    datesInitializedRef.current = false
  }, [])

  // Xử lý thay đổi giá trị trường dữ liệu
  const handleFieldChange = useCallback(
    (fieldId: string, value: any) => {
      console.log('🔄 Field changed:', fieldId, value)

      setFieldValues((prev) => {
        const newValues = {
          ...prev,
          [fieldId]: value
        }

        // Nếu thay đổi ngày tiếp nhận, tự động cập nhật deadline
        if (fieldId === 'receiveDate' || fieldId.includes('receiveDate')) {
          // Lấy thời gian ước tính từ bước hiện tại
          const currentStep = workflowSteps.find(
            (step) => step.id === firstStepId
          )
          if (currentStep) {
            const estimatedTime = currentStep.estimatedTime || 1
            const estimatedTimeUnit = currentStep.estimatedTimeUnit || 'days'

            console.log('📊 Using step data for calculation:', {
              stepName: currentStep.name,
              estimatedTime,
              estimatedTimeUnit
            })

            // Tính toán deadline mới
            let daysToAdd = estimatedTime
            if (estimatedTimeUnit === 'hours') {
              daysToAdd = Math.ceil(estimatedTime / 8) // 8 giờ làm việc = 1 ngày
            } else if (estimatedTimeUnit === 'weeks') {
              daysToAdd = estimatedTime * 7
            } else if (estimatedTimeUnit === 'months') {
              daysToAdd = estimatedTime * 30
            }

            const receiveDateTime = new Date(value)
            const deadlineDateTime = new Date(receiveDateTime)
            deadlineDateTime.setDate(deadlineDateTime.getDate() + daysToAdd)

            const newDeadline = formatDateTimeForInput(
              deadlineDateTime.toISOString()
            )

            console.log('✅ New deadline calculated:', {
              receiveDate: value,
              daysToAdd,
              newDeadline
            })

            // Tìm trường deadline và cập nhật
            const deadlineField = firstStepFields.find(
              (field) =>
                field.id === 'deadline' ||
                field.name.toLowerCase().includes('deadline')
            )

            if (deadlineField) {
              newValues[deadlineField.id] = newDeadline
            }
          }
        }

        return newValues
      })
    },
    [firstStepFields, workflowSteps, firstStepId]
  )

  // Lấy quy trình con liên kết với trạng thái sản phẩm - CHỈ KHI STANDARD WORKFLOW ĐÃ SẴN SÀNG
  const fetchLinkedSubWorkflows = useCallback(
    async (statusId: string) => {
      if (!statusId || !standardWorkflowInitialized || !standardWorkflow) {
        console.log(
          '❌ Cannot fetch sub workflows - standard workflow not ready'
        )
        return
      }

      console.log('🔍 Fetching sub workflows for status:', statusId)
      setIsLoadingWorkflows(true)
      try {
        // Lấy danh sách quy trình con từ Firestore
        const subWorkflowsRef = collection(db, 'subWorkflows')
        const q = query(subWorkflowsRef, where('statusId', '==', statusId))
        const querySnapshot = await getDocs(q)

        console.log('📊 Query result:', querySnapshot.size, 'workflows found')

        if (querySnapshot.empty) {
          console.log('❌ No workflows found')
          setLinkedSubWorkflows([])
          setWorkflowProcessId('')
          setShowWorkflowSelect(false)
          setSelectedSubWorkflow(null)
          setWorkflowSteps([])
        } else {
          const workflows = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))

          console.log('✅ Found workflows:', workflows)
          setLinkedSubWorkflows(workflows)

          // Nếu chỉ có 1 quy trình, tự động chọn
          if (workflows.length === 1) {
            console.log('🎯 Auto-selecting single workflow:', workflows[0].name)
            setWorkflowProcessId(workflows[0].id)
            setSelectedSubWorkflow(workflows[0])
            setShowWorkflowSelect(false)
            await loadWorkflowSteps(workflows[0])
          } else if (workflows.length > 1) {
            console.log('🔄 Multiple workflows found, showing selector')
            setShowWorkflowSelect(true)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching sub workflows:', error)
        setLinkedSubWorkflows([])
      } finally {
        setIsLoadingWorkflows(false)
      }
    },
    [standardWorkflowInitialized, standardWorkflow]
  )

  // Tải các bước của quy trình con - CHỈ KHI STANDARD WORKFLOW ĐÃ SẴN SÀNG
  const loadWorkflowSteps = useCallback(
    async (subWorkflow: any) => {
      if (!subWorkflow || !standardWorkflowInitialized || !standardWorkflow) {
        console.log(
          '❌ Cannot load workflow steps - standard workflow not ready'
        )
        return
      }

      try {
        console.log('🔄 Loading workflow steps for:', subWorkflow.name)

        // Sử dụng trực tiếp workflowSteps từ subWorkflow thay vì tìm trong standardWorkflow
        if (
          subWorkflow.visibleSteps &&
          Array.isArray(subWorkflow.visibleSteps)
        ) {
          console.log('📝 Using workflowSteps directly from subWorkflow')

          const stepsData = getStepsByIds(subWorkflow.visibleSteps)

          if (stepsData && stepsData.length > 0) {
            // Chuyển đổi dữ liệu bước và thêm trạng thái
            const visibleSteps = stepsData.map((step: any, index: number) => ({
              ...step,
              status: index === 0 ? 'in_progress' : 'not_started',
              order: index // Đảm bảo thứ tự đúng
            }))

            console.log('✅ Visible steps:', visibleSteps)
            setWorkflowSteps(visibleSteps)

            if (visibleSteps.length > 0) {
              const firstStep = visibleSteps[0]
              setFirstStepId(firstStep.id)
              setFirstStepFields(firstStep.fields || [])
              console.log('🎯 First step set:', firstStep.name)
            }
          } else {
            console.log(
              '⚠️ No workflowSteps found for IDs:',
              subWorkflow.visibleSteps
            )
            setWorkflowSteps([])
            setFirstStepId(null)
            setFirstStepFields([])
          }
        } else {
          console.log('⚠️ No visibleSteps found in subWorkflow')
          setWorkflowSteps([])
          setFirstStepId(null)
          setFirstStepFields([])
        }
      } catch (error) {
        console.error('❌ Error loading workflow steps:', error)
      }
    },
    [getStepsByIds, standardWorkflowInitialized, standardWorkflow]
  )

  // Thêm useEffect mới sau useEffect loadWorkflowSteps
  useEffect(() => {
    if (
      workflowSteps.length > 0 &&
      firstStepId &&
      !initialFieldValuesSetRef.current &&
      !requestId
    ) {
      // Chỉ tự động thiết lập cho yêu cầu mới, không phải chỉnh sửa
      const firstStep = workflowSteps[0]

      // Lấy thời gian hiện tại theo múi giờ Việt Nam
      const now = new Date()

      // Tạo đối tượng Date với múi giờ Việt Nam
      const vietnamTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })
      )

      console.log('🕐 Current times:', {
        utcTime: now.toISOString(),
        vietnamTime: vietnamTime.toISOString(),
        vietnamTimeString: vietnamTime.toLocaleString('vi-VN')
      })

      // Thiết lập ngày tiếp nhận là thời gian hiện tại (Việt Nam)
      const receiveDate = formatDateTimeForInput(vietnamTime.toISOString())

      // Tính deadline dựa trên thời gian ước tính từ bước đầu tiên
      const estimatedTime = firstStep.estimatedTime || 1
      const estimatedTimeUnit = firstStep.estimatedTimeUnit || 'days'

      console.log('🕐 Setting up dates:', {
        vietnamTime: vietnamTime.toISOString(),
        receiveDate,
        estimatedTime,
        estimatedTimeUnit
      })

      // Tính toán deadline
      let daysToAdd = estimatedTime
      if (estimatedTimeUnit === 'hours') {
        daysToAdd = Math.ceil(estimatedTime / 8) // 8 giờ làm việc = 1 ngày, làm tròn lên
      } else if (estimatedTimeUnit === 'weeks') {
        daysToAdd = estimatedTime * 7
      } else if (estimatedTimeUnit === 'months') {
        daysToAdd = estimatedTime * 30
      }

      // Tạo deadline từ thời gian Việt Nam + thời gian ước tính
      const deadlineDate = new Date(vietnamTime)
      deadlineDate.setDate(deadlineDate.getDate() + daysToAdd)
      const deadline = formatDateTimeForInput(deadlineDate.toISOString())

      console.log('📅 Calculated deadline:', {
        daysToAdd,
        deadlineDate: deadlineDate.toISOString(),
        formattedDeadline: deadline
      })

      // Thiết lập giá trị mặc định cho các trường
      const defaultValues: Record<string, any> = {}

      firstStep.fields?.forEach((field) => {
        if (
          field.id === 'receiveDate' ||
          field.name.toLowerCase().includes('ngày tiếp nhận')
        ) {
          defaultValues[field.id] = receiveDate
        } else if (
          field.id === 'deadline' ||
          field.name.toLowerCase().includes('ngày deadline')
        ) {
          defaultValues[field.id] = deadline
        } else if (field.defaultValue !== undefined) {
          defaultValues[field.id] = field.defaultValue
        }
      })

      console.log('✅ Setting default values:', defaultValues)

      if (Object.keys(defaultValues).length > 0) {
        setFieldValues((prev) => ({
          ...prev,
          ...defaultValues
        }))
        initialFieldValuesSetRef.current = true
      }
    }
  }, [workflowSteps, firstStepId, requestId])

  // Xử lý thay đổi trạng thái sản phẩm - CHỈ KHI STANDARD WORKFLOW ĐÃ SẴN SÀNG
  const handleProductStatusChange = useCallback(
    (value: string) => {
      if (value === productStatusId) return

      console.log('🔄 Product status changed to:', value)
      setProductStatusId(value)

      if (!isInitialLoadRef.current && standardWorkflowInitialized) {
        setWorkflowProcessId('')
        prevWorkflowProcessIdRef.current = ''
        setFirstStepFields([])
        setFirstStepId(null)
        initialFieldValuesSetRef.current = false
        setIsUsingStandardWorkflow(false)
        setSelectedSubWorkflow(null)
        setWorkflowSteps([])

        // Lấy quy trình con liên kết với trạng thái sản phẩm
        fetchLinkedSubWorkflows(value)
      }
    },
    [productStatusId, fetchLinkedSubWorkflows, standardWorkflowInitialized]
  )

  // Xử lý thay đổi quy trình
  const handleWorkflowProcessChange = useCallback(
    async (value: string) => {
      if (value === workflowProcessId) return

      console.log('🔄 Workflow process changed to:', value)
      initialFieldValuesSetRef.current = false
      setWorkflowProcessId(value)
      setIsUsingStandardWorkflow(value === 'standard-workflow')

      // Tìm quy trình con được chọn
      const selectedWorkflow = linkedSubWorkflows.find((w) => w.id === value)
      if (selectedWorkflow) {
        console.log('✅ Selected workflow:', selectedWorkflow.name)
        setSelectedSubWorkflow(selectedWorkflow)
        await loadWorkflowSteps(selectedWorkflow)
      }
    },
    [workflowProcessId, linkedSubWorkflows, loadWorkflowSteps]
  )

  // Lấy trạng thái sản phẩm từ cơ sở dữ liệu
  useEffect(() => {
    const fetchProductStatuses = async () => {
      try {
        const productStatusesRef = collection(db, 'productStatuses')
        const snapshot = await getDocs(productStatusesRef)
        const productStatusesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        if (productStatusesData.length > 0) {
          setDbProductStatuses(productStatusesData)
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách trạng thái sản phẩm:', error)
      }
    }

    fetchProductStatuses()
  }, [])

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Tạo danh sách lỗi validation
    const validationErrors: string[] = []

    // Kiểm tra tiêu đề trùng lặp
    if (titleExists) {
      validationErrors.push('Tiêu đề đã tồn tại trong hệ thống')
    }

    // Kiểm tra tiêu đề đang được kiểm tra
    if (isTitleCheckLoading) {
      toast({
        title: '⏳ Đang kiểm tra',
        description:
          'Đang kiểm tra tiêu đề trùng lặp. Vui lòng đợi một chút...',
        variant: 'default'
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Kiểm tra thông tin người dùng
      if (!currentUser) {
        validationErrors.push('Không thể xác định thông tin người dùng')
      }

      // Kiểm tra kết nối mạng
      if (!navigator.onLine) {
        validationErrors.push('Không có kết nối internet')
      }

      // Kiểm tra các trường cơ bản bắt buộc
      if (!title.trim()) {
        validationErrors.push('Tiêu đề yêu cầu')
      }

      if (!description.trim()) {
        validationErrors.push('Mô tả yêu cầu')
      }

      // Kiểm tra nguồn yêu cầu
      if (!selectedDataSource) {
        validationErrors.push('Nguồn yêu cầu')
      } else if (
        selectedDataSource.type === 'other' &&
        !specificSource.trim()
      ) {
        validationErrors.push("Nguồn cụ thể (cho loại 'Khác')")
      }

      // Kiểm tra trạng thái sản phẩm (nếu bắt buộc)
      if (!productStatusId) {
        validationErrors.push('Trạng thái sản phẩm')
      }

      // Kiểm tra quy trình xử lý (nếu có trạng thái sản phẩm)
      if (
        productStatusId &&
        linkedSubWorkflows.length > 0 &&
        !workflowProcessId
      ) {
        validationErrors.push('Quy trình xử lý')
      }

      // Kiểm tra người đảm nhiệm (nếu bắt buộc trong workflow)
      if (
        workflowSteps.length > 0 &&
        workflowSteps[0]?.assigneeRole &&
        !selectedUser &&
        !fieldValues.assignee
      ) {
        validationErrors.push('Người đảm nhiệm')
      }

      // Kiểm tra các trường bắt buộc của workflow
      const missingWorkflowFields: string[] = []
      firstStepFields.forEach((field) => {
        if (field.required) {
          const value = fieldValues[field.id]
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'string' && value.trim() === '')
          ) {
            missingWorkflowFields.push(field.name)
          }
        }
      })

      if (missingWorkflowFields.length > 0) {
        validationErrors.push(
          ...missingWorkflowFields.map((field) => `${field} (trong quy trình)`)
        )
      }

      // Kiểm tra tính hợp lệ của reference links (nếu có)
      const invalidLinks: string[] = []
      referenceLinks.forEach((link, index) => {
        if (link.trim() && !isValidUrl(link.trim())) {
          invalidLinks.push(`Link số ${index + 1}`)
        }
      })

      if (invalidLinks.length > 0) {
        validationErrors.push(
          ...invalidLinks.map((link) => `${link} không hợp lệ`)
        )
      }

      // Kiểm tra nguyên vật liệu có yêu cầu nhập
      const invalidMaterials: string[] = []
      selectedMaterials.forEach((material) => {
        if (material.createImportRequest) {
          if (!material.importQuantity || material.importQuantity <= 0) {
            invalidMaterials.push(`${material.name}: Số lượng nhập`)
          }
          if (!material.importSupplier?.trim()) {
            invalidMaterials.push(`${material.name}: Nhà cung cấp`)
          }
        }
      })

      if (invalidMaterials.length > 0) {
        validationErrors.push(...invalidMaterials)
      }

      // Nếu có lỗi validation, hiển thị tất cả
      if (validationErrors.length > 0) {
        const errorMessage =
          validationErrors.length === 1
            ? `Thiếu thông tin: ${validationErrors[0]}`
            : `Thiếu các thông tin sau:\n${validationErrors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`

        toast({
          title: '❌ Thông tin chưa đầy đủ',
          description: errorMessage,
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      // Tiếp tục với phần còn lại của hàm handleSubmit...
      // (giữ nguyên phần còn lại)

      console.log('📝 Starting request creation process...')

      // Chuẩn bị dữ liệu
      const materialsWithoutImport = selectedMaterials.map(
        ({
          createImportRequest,
          importQuantity,
          importSupplier,
          importReason,
          importDate,
          importPrice,
          sourceCountry,
          ...rest
        }) => rest
      )

      const updatedDataSource = { ...selectedDataSource }
      if (updatedDataSource && updatedDataSource.type === 'other') {
        updatedDataSource.specificSource = specificSource.trim()
      }

      const assigneeFromField = fieldValues.assignee || selectedUser
      const images = media.filter((m) => m.type === 'image').map((m) => m.url)
      const cleanedReferenceLinks = referenceLinks.filter(
        (link) => link.trim() !== ''
      )

      const requestData = {
        title: title.trim(),
        code: requestCode || '',
        creator: {
          id: currentUser.id,
          name: currentUser.name,
          department: currentUser.department || '',
          position: currentUser.position || '',
          email: currentUser.email || ''
        },
        department: currentUser.department || 'Chưa xác định',
        customerId: customerId || null,
        dataSource: updatedDataSource
          ? {
              id: updatedDataSource.id || '',
              type: updatedDataSource.type || 'other',
              name: updatedDataSource.name || '',
              specificSource: updatedDataSource.specificSource || ''
            }
          : null,
        description: description.trim(),
        referenceLink:
          cleanedReferenceLinks.length > 0 ? cleanedReferenceLinks[0] : '',
        referenceLinks: cleanedReferenceLinks,
        images: images || [],
        media: media || [],
        materials: materialsWithoutImport || [],
        assignee: assigneeFromField
          ? {
              id: assigneeFromField.id || '',
              name: assigneeFromField.name || '',
              department: assigneeFromField.department || '',
              position: assigneeFromField.position || '',
              email: assigneeFromField.email || ''
            }
          : null,
        status: 'pending',
        productStatus: productStatusId
          ? {
              id: productStatusId || '',
              name:
                dbProductStatuses.length > 0
                  ? dbProductStatuses.find((s) => s.id === productStatusId)
                      ?.name || ''
                  : productStatuses.find((s) => s.id === productStatusId)
                      ?.name || '',
              color:
                dbProductStatuses.length > 0
                  ? dbProductStatuses.find((s) => s.id === productStatusId)
                      ?.color || ''
                  : productStatuses.find((s) => s.id === productStatusId)
                      ?.color || ''
            }
          : null,
        workflowId: productStatusId ? `wf${productStatusId}` : null,
        workflowProcessId: workflowProcessId || null,
        workflowStepData:
          firstStepFields.length > 0
            ? {
                stepId: firstStepId || '',
                fieldValues: Object.fromEntries(
                  Object.entries(fieldValues || {}).map(([key, value]) => {
                    if (value === undefined) return [key, null]
                    if (value === null) return [key, null]

                    if (typeof value === 'object' && value !== null) {
                      if (Array.isArray(value)) {
                        return [
                          key,
                          value.map((item) =>
                            item === undefined ? null : item
                          )
                        ]
                      } else {
                        const sanitizedObj: any = {}
                        Object.entries(value).forEach(([objKey, objVal]) => {
                          sanitizedObj[objKey] =
                            objVal === undefined ? null : objVal
                        })
                        return [key, sanitizedObj]
                      }
                    }

                    return [key, value]
                  })
                )
              }
            : null,
        currentStepId: firstStepId || null,
        currentStepStatus: 'Đang thực hiện',
        isUsingStandardWorkflow: isUsingStandardWorkflow || false,
        priority: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('📝 Request data prepared:', requestData)

      let newRequestId: string

      try {
        if (requestId) {
          console.log('🔄 Updating existing request...')
          await updateRequest(requestId, requestData)
          newRequestId = requestId
          console.log('✅ Request updated successfully')
        } else {
          console.log('➕ Creating new request...')
          newRequestId = await addRequest(requestData)
          console.log('✅ Request created successfully with ID:', newRequestId)

          // Thêm request vào customer nếu có
          if (customerId && selectedDataSource?.type === 'customer') {
            try {
              console.log('🔗 Adding request to customer...')
              await addRequestToCustomer(customerId, newRequestId)
              console.log(
                '✅ Successfully added request to customer:',
                customerId
              )
            } catch (error) {
              console.error('❌ Error adding request to customer:', error)
              toast({
                title: '⚠️ Cảnh báo',
                description:
                  'Yêu cầu đã được tạo nhưng không thể liên kết với khách hàng. Vui lòng liên hệ admin.',
                variant: 'destructive'
              })
            }
          }
        }
      } catch (error) {
        console.error('❌ Error saving request:', error)

        // Phân loại lỗi cụ thể
        if (error.code === 'permission-denied') {
          toast({
            title: '❌ Lỗi quyền truy cập',
            description:
              'Bạn không có quyền tạo yêu cầu. Vui lòng liên hệ admin để được cấp quyền.',
            variant: 'destructive'
          })
        } else if (error.code === 'unavailable') {
          toast({
            title: '❌ Lỗi kết nối',
            description:
              'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.',
            variant: 'destructive'
          })
        } else if (error.code === 'quota-exceeded') {
          toast({
            title: '❌ Lỗi hệ thống',
            description:
              'Hệ thống đã đạt giới hạn. Vui lòng thử lại sau hoặc liên hệ admin.',
            variant: 'destructive'
          })
        } else {
          toast({
            title: '❌ Lỗi không xác định',
            description: `Có lỗi xảy ra khi ${requestId ? 'cập nhật' : 'tạo'} yêu cầu: ${error.message || 'Lỗi không xác định'}. Vui lòng thử lại.`,
            variant: 'destructive'
          })
        }
        setIsSubmitting(false)
        return
      }

      // Xử lý nguyên vật liệu cần nhập
      const materialsNeedImport = selectedMaterials.filter(
        (m) => m.createImportRequest && m.importQuantity && m.importQuantity > 0
      )

      let importRequestsCreated = 0
      const importErrors: string[] = []

      if (materialsNeedImport.length > 0) {
        console.log('📦 Processing material import requests...')

        for (const material of materialsNeedImport) {
          if (material.importQuantity) {
            try {
              const materialDetail = await getMaterialById(material.id)

              await addMaterialImportRequest({
                materialId: material.id,
                materialName: material.name,
                quantity: material.importQuantity,
                requestCode: requestCode,
                status: 'pending',
                expectedDate:
                  material.importDate ||
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                supplier: material.importSupplier || '',
                reason: material.importReason || `Yêu cầu từ: ${title}`,
                sourceCountry: material.sourceCountry || materialDetail?.origin,
                importPrice: material.importPrice || materialDetail?.importPrice
              })

              const existingRequests = materialRequests.filter(
                (req) =>
                  req.materialId === material.id &&
                  req.requestCode === requestCode
              )

              if (existingRequests.length > 0) {
                await updateMaterialRequest(existingRequests[0].id, {
                  materialId: material.id,
                  quantity: material.importQuantity,
                  expectedDate:
                    material.importDate ||
                    new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                  supplier: material.importSupplier || '',
                  reason: material.importReason || `Yêu cầu từ: ${title}`,
                  sourceCountry:
                    material.sourceCountry || materialDetail?.origin,
                  importPrice:
                    material.importPrice || materialDetail?.importPrice,
                  requestCode: requestCode
                })
              } else {
                await addMaterialRequest({
                  materialId: material.id,
                  quantity: material.importQuantity,
                  expectedDate:
                    material.importDate ||
                    new Date(
                      Date.now() + 7 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                  supplier: material.importSupplier || '',
                  status: 'pending',
                  reason: material.importReason || `Yêu cầu từ: ${title}`,
                  sourceCountry:
                    material.sourceCountry || materialDetail?.origin,
                  importPrice:
                    material.importPrice || materialDetail?.importPrice,
                  requestCode: requestCode
                })
              }

              importRequestsCreated++
              console.log(
                `✅ Material import request created for: ${material.name}`
              )
            } catch (error) {
              console.error(
                `❌ Error creating import request for ${material.name}:`,
                error
              )
              importErrors.push(material.name)
            }
          }
        }

        if (importRequestsCreated > 0) {
          toast({
            title: '✅ Thành công',
            description: `Đã tạo ${importRequestsCreated} yêu cầu nhập nguyên vật liệu`
          })
        }

        if (importErrors.length > 0) {
          toast({
            title: '⚠️ Cảnh báo',
            description: `Không thể tạo yêu cầu nhập cho: ${importErrors.join(', ')}. Vui lòng tạo thủ công.`,
            variant: 'destructive'
          })
        }
      }

      // Refresh dữ liệu
      try {
        console.log('🔄 Refreshing data...')
        await Promise.all([refreshData(), refreshMaterialData()])
        console.log('✅ Data refreshed successfully')
      } catch (error) {
        console.error('❌ Error refreshing data:', error)
        toast({
          title: '⚠️ Cảnh báo',
          description:
            'Yêu cầu đã được tạo nhưng không thể cập nhật danh sách. Vui lòng tải lại trang.',
          variant: 'destructive'
        })
      }

      // Thông báo thành công
      toast({
        title: '🎉 Thành công!',
        description: requestId
          ? `Đã cập nhật yêu cầu "${title.trim()}" thành công!`
          : `Đã tạo yêu cầu "${title.trim()}" thành công! Mã yêu cầu: ${requestCode}`
      })

      // Lưu thông tin vào localStorage
      localStorage.setItem('requestJustAdded', 'true')
      localStorage.setItem('lastCreatedRequestId', newRequestId)
      localStorage.setItem('lastCreatedRequestTitle', title.trim())

      // Điều hướng hoặc đóng dialog
      if (inDialog) {
        resetForm()
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 100)
        }
      } else {
        setTimeout(() => {
          router.push('/dashboard/requests')
        }, 500)
      }
    } catch (error) {
      console.error('❌ Unexpected error in handleSubmit:', error)

      // Lỗi không mong đợi
      toast({
        title: '❌ Lỗi hệ thống',
        description: `Đã xảy ra lỗi không mong đợi: ${error.message || 'Lỗi không xác định'}. Vui lòng thử lại hoặc liên hệ admin.`,
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = useCallback(() => {
    if (inDialog && onSuccess) {
      onSuccess()
    } else {
      router.push('/dashboard/requests')
    }
  }, [inDialog, onSuccess, router])

  // Kiểm tra xem một giá trị có phải là ngày hợp lệ không
  const isValidDate = (value: any): boolean => {
    if (!value) return false

    try {
      const date = new Date(value)
      return !isNaN(date.getTime())
    } catch (error) {
      return false
    }
  }

  // Hiển thị loading khi đang tải standard workflow - MOVED AFTER ALL HOOKS
  if (standardWorkflowLoading || !standardWorkflowInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang tải quy trình chuẩn...</span>
        </div>
      </div>
    )
  }

  const FormContent = (
    <>
      <div className="space-y-4">
        {/* Hiển thị thông tin người tạo yêu cầu */}
        {currentUser && (
          <div className="p-3 bg-blue-50 rounded-md border">
            <div className="text-sm font-medium text-blue-900">
              Người tạo yêu cầu:
            </div>
            <div className="text-sm text-blue-700">{currentUser.name}</div>
            <div className="text-xs text-blue-600 mt-1">
              Phòng ban: {currentUser.department || 'Chưa xác định'} | Chức vụ:{' '}
              {currentUser.position || 'Chưa xác định'}
            </div>
            {currentUser.email && (
              <div className="text-xs text-blue-600">
                Email: {currentUser.email}
              </div>
            )}
          </div>
        )}

        {/* Cảnh báo nếu không có thông tin người dùng */}
        {!currentUser && (
          <div className="p-3 bg-red-50 rounded-md border border-red-200">
            <div className="text-sm font-medium text-red-900">
              ⚠️ Không thể xác định thông tin người dùng
            </div>
            <div className="text-xs text-red-600 mt-1">
              Vui lòng đăng nhập lại để đảm bảo thông tin người tạo được lưu
              chính xác.
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="dataSource">Nguồn yêu cầu (Tùy chọn)</Label>
          <EnhancedDataSourceSelector
            selectedDataSource={selectedDataSource}
            onSelectDataSource={(dataSource) => {
              setSelectedDataSource(dataSource)
              // If customer is selected, extract and save customer ID
              if (dataSource && dataSource.customerId) {
                setCustomerId(dataSource.customerId)
                console.log('🔗 Selected customer ID:', dataSource.customerId)
              } else {
                setCustomerId(null)
              }
            }}
          />
          {customerId && (
            <div className="text-xs text-blue-600 mt-1">
              ID khách hàng được chọn: {customerId}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <div className="relative">
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề yêu cầu"
              required
              className={
                titleExists ? 'border-red-500 focus:border-red-500' : ''
              }
            />
            {isTitleCheckLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {titleExists && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Tiêu đề này đã tồn tại. Vui lòng chọn tiêu đề khác.
            </div>
          )}
          {title.trim() && !titleExists && !isTitleCheckLoading && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Tiêu đề có thể sử dụng
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả chi tiết về yêu cầu"
            rows={4}
            required
          />
        </div>

        {/* Phần Link sản phẩm tham khảo với khả năng thêm nhiều link */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Link sản phẩm tham khảo</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReferenceLink}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Thêm link
            </Button>
          </div>
          <div className="space-y-2">
            {referenceLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateReferenceLink(index, e.target.value)}
                  placeholder={`Nhập link sản phẩm tham khảo ${index > 0 ? `số ${index + 1}` : '(nếu có)'}`}
                  className="flex-1"
                />
                {referenceLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeReferenceLink(index)}
                    className="px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {referenceLinks.filter((link) => link.trim() !== '').length > 0 && (
            <div className="text-xs text-muted-foreground">
              Đã có {referenceLinks.filter((link) => link.trim() !== '').length}{' '}
              link sản phẩm tham khảo
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Hình ảnh và Video (tối đa 10 file)</Label>
          <MultiMediaUpload
            media={media}
            onMediaChange={setMedia}
            maxFiles={10}
            maxFileSize={50}
          />
        </div>

        <div className="space-y-2">
          <Label>Nguyên vật liệu</Label>
          <MaterialSelector
            selectedMaterials={selectedMaterials}
            onSelectMaterials={setSelectedMaterials}
            requestCode={requestCode}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="productStatus">Trạng thái sản phẩm</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-xs">
                    Chọn trạng thái sản phẩm sẽ tự động hiển thị quy trình liên
                    quan
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={productStatusId || ''}
            onValueChange={handleProductStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {dbProductStatuses.length > 0
                ? dbProductStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))
                : (productStatuses || []).map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          {productStatusId && (
            <div className="text-xs text-blue-600 mt-1">
              Đã chọn:{' '}
              {dbProductStatuses.length > 0
                ? dbProductStatuses.find((s) => s.id === productStatusId)?.name
                : productStatuses.find((s) => s.id === productStatusId)?.name}
            </div>
          )}
        </div>

        {/* Hiển thị quy trình con liên kết với trạng thái sản phẩm */}
        {productStatusId && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="workflowProcess">Quy trình xử lý</Label>
              {isLoadingWorkflows && (
                <div className="text-xs text-muted-foreground">
                  Đang tải quy trình...
                </div>
              )}
            </div>

            {linkedSubWorkflows.length > 0 ? (
              showWorkflowSelect ? (
                <Select
                  value={workflowProcessId || ''}
                  onValueChange={handleWorkflowProcessChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quy trình xử lý" />
                  </SelectTrigger>
                  <SelectContent>
                    {linkedSubWorkflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 border rounded-md bg-blue-50 text-blue-700 flex items-center justify-between">
                  <div>
                    <span className="font-medium">Quy trình: </span>
                    {linkedSubWorkflows[0]?.name || 'Quy trình mặc định'}
                  </div>
                  {linkedSubWorkflows.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWorkflowSelect(true)}
                      className="text-xs"
                    >
                      Đổi quy trình
                    </Button>
                  )}
                </div>
              )
            ) : (
              <Alert
                variant="warning"
                className="bg-amber-50 border-amber-200 text-amber-800"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Không có quy trình nào được gắn với trạng thái sản phẩm này.
                  {isAdmin && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() =>
                        router.push('/dashboard/workflow-management')
                      }
                    >
                      Thiết lập quy trình
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Nếu có sử dụng UserSelector trong request form, thêm: */}
        <UserSelector
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          allowedUsers={workflowSteps[0]?.allowedUsers || []}
          assigneeRole={workflowSteps[0]?.assigneeRole}
          placeholder="Chọn người đảm nhiệm"
        />

        {/* Hiển thị quy trình đầy đủ với WorkflowStepExecutionUI */}
        {workflowSteps.length > 0 && selectedSubWorkflow && (
          <div className="mt-6">
            <WorkflowStepExecutionUI
              title={selectedSubWorkflow.name}
              steps={workflowSteps}
              currentStepId={firstStepId || ''}
              fieldValues={fieldValues}
              onFieldChange={handleFieldChange}
              hideCompleteButton={true}
              hideTimeInfo={true}
              onCompleteStep={async (stepId) => {
                const currentIndex = workflowSteps.findIndex(
                  (step) => step.id === stepId
                )
                if (
                  currentIndex >= 0 &&
                  currentIndex < workflowSteps.length - 1
                ) {
                  const updatedSteps = [...workflowSteps]
                  updatedSteps[currentIndex] = {
                    ...updatedSteps[currentIndex],
                    status: 'completed'
                  }
                  updatedSteps[currentIndex + 1] = {
                    ...updatedSteps[currentIndex + 1],
                    status: 'in_progress'
                  }
                  setWorkflowSteps(updatedSteps)
                  setFirstStepId(updatedSteps[currentIndex + 1].id)
                }
                return true
              }}
              onRevertToPreviousStep={async (stepId) => {
                const selectedIndex = workflowSteps.findIndex(
                  (step) => step.id === stepId
                )
                if (selectedIndex >= 0) {
                  const updatedSteps = [...workflowSteps]
                  for (
                    let i = selectedIndex + 1;
                    i < updatedSteps.length;
                    i++
                  ) {
                    updatedSteps[i] = {
                      ...updatedSteps[i],
                      status: 'not_started'
                    }
                  }
                  updatedSteps[selectedIndex] = {
                    ...updatedSteps[selectedIndex],
                    status: 'in_progress'
                  }
                  setWorkflowSteps(updatedSteps)
                  setFirstStepId(stepId)
                }
                return true
              }}
              requestData={{
                title,
                description,
                creator: currentUser,
                createdAt: new Date().toISOString(),
                code: requestCode
              }}
            />
          </div>
        )}

        {/* Fallback nếu không có workflow steps */}
        {productStatusId &&
          linkedSubWorkflows.length > 0 &&
          workflowSteps.length === 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
              <div className="text-sm text-yellow-800">
                ⚠️ Quy trình đã được chọn nhưng chưa có bước nào được tải. Vui
                lòng kiểm tra cấu hình quy trình.
              </div>
            </div>
          )}
      </div>

      <div className="flex justify-between mt-6">
        <Button type="button" variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting || !currentUser || titleExists || isTitleCheckLoading
          }
        >
          {isSubmitting
            ? 'Đang xử lý...'
            : requestId
              ? 'Cập nhật'
              : 'Tạo yêu cầu'}
        </Button>
      </div>
    </>
  )

  if (inDialog) {
    return <form onSubmit={handleSubmit}>{FormContent}</form>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {requestId ? 'Chỉnh sửa yêu cầu' : 'Tạo yêu cầu mới'}
          </CardTitle>
          {requestCode && (
            <div className="text-sm text-gray-500">
              Mã yêu cầu: <span className="font-medium">{requestCode}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">{FormContent}</CardContent>
      </Card>
    </form>
  )
}
