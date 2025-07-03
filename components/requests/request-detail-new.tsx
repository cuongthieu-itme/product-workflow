'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Clock,
  FileText,
  Users,
  Star,
  Check,
  Edit,
  User,
  ArrowRight,
  CheckCircle,
  Package,
  AlertCircle,
  Circle,
  ChevronRight,
  UserPlus,
  ImageIcon,
  Plus,
  SearchIcon,
  Minus,
  PlusIcon,
  History
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  doc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'
import { useMaterialContext } from '../materials/material-context-firebase'
import { useSubWorkflow } from '../workflow/sub-workflow-context-firebase'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { CardFooter } from '@/components/ui/card'
import { InlineEdit } from '@/components/ui/inline-edit'
import { MultiImageUpload } from '@/components/materials/multi-image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { historyService } from '@/lib/history-service'

interface RequestDetailNewProps {
  request: any
  workflowData?: any
  standardWorkflow?: any
  visibleSteps?: any[]
  onRequestUpdate?: (updatedRequest: any) => void
}

export function RequestDetailNew({
  request,
  workflowData,
  standardWorkflow,
  visibleSteps = [],
  onRequestUpdate
}: RequestDetailNewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedStep, setSelectedStep] = useState<any>(null)
  const [completedSteps, setCompletedSteps] = useState<any[]>([])
  const [isCompletingStep, setIsCompletingStep] = useState(false)
  const [currentRequest, setCurrentRequest] = useState(request)
  const { toast } = useToast()

  // Review states
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [newReview, setNewReview] = useState({
    title: '',
    type: 'general',
    rating: 0,
    content: '',
    isAnonymous: false
  })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Other states
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false)
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([])
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<any>(null)
  const [isAddingImages, setIsAddingImages] = useState(false)
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>(
    currentRequest.materials || []
  )
  const [materialSearchOpen, setMaterialSearchOpen] = useState(false)
  const [materialSearchValue, setMaterialSearchValue] = useState('')
  const [selectedMaterialType, setSelectedMaterialType] = useState<
    'material' | 'accessory' | 'all'
  >('all')
  const [materialSearchQuery, setMaterialSearchQuery] = useState('')
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] =
    useState(false)
  const [selectedNewStatus, setSelectedNewStatus] = useState<any>(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [availableStatuses, setAvailableStatuses] = useState<any[]>([])

  // Edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingPriority, setIsEditingPriority] = useState(false)
  const [isEditingDepartment, setIsEditingDepartment] = useState(false)
  const [tempTitle, setTempTitle] = useState(currentRequest.title || '')
  const [tempDescription, setTempDescription] = useState(
    currentRequest.description || ''
  )
  const [tempPriority, setTempPriority] = useState(
    currentRequest.priority || 'Bình thường'
  )
  const [tempDepartment, setTempDepartment] = useState(
    currentRequest.department || currentRequest.creator?.department || ''
  )
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [tempStatus, setTempStatus] = useState(currentRequest.status || '')

  // Product conversion states
  const [isConvertingToProduct, setIsConvertingToProduct] = useState(false)
  const [isConvertToProductDialogOpen, setIsConvertToProductDialogOpen] =
    useState(false)
  const [productData, setProductData] = useState({
    name: currentRequest.title || '',
    description: currentRequest.description || '',
    category: '',
    price: 0,
    cost: 0,
    weight: 0,
    dimensions: '',
    sku: ''
  })

  const { materials, loading: loadingMaterials } = useMaterialContext()
  const { subWorkflows, loading: loadingSubWorkflows } = useSubWorkflow()

  // Reject/Hold dialog states
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [holdReason, setHoldReason] = useState('')
  const [rejectImages, setRejectImages] = useState<string[]>([])
  const [holdImages, setHoldImages] = useState<string[]>([])
  const [isSubmittingReject, setIsSubmittingReject] = useState(false)
  const [isSubmittingHold, setIsSubmittingHold] = useState(false)

  // Thêm sau các state hiện có
  const [isContinueDialogOpen, setIsContinueDialogOpen] = useState(false)
  const [continueReason, setContinueReason] = useState('')
  const [continueImages, setContinueImages] = useState<string[]>([])
  const [isSubmittingContinue, setIsSubmittingContinue] = useState(false)

  // History states
  const [requestHistory, setRequestHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Load reviews when tab changes to reviews
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews()
    }
  }, [activeTab, currentRequest.id])

  // Load history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchRequestHistory()
    }
  }, [activeTab, currentRequest.id])

  // Fetch request history from requestHistory collection
  const fetchRequestHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const history = await historyService.getHistoryByRequestId(
        currentRequest.id
      )
      setRequestHistory(history)
    } catch (error) {
      console.error('Error fetching request history:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lịch sử yêu cầu',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Fetch reviews from Firebase (no composite index required)
  const fetchReviews = async () => {
    setIsLoadingReviews(true)
    try {
      const reviewsRef = collection(db, 'reviews')
      // Only filter by requestId – we'll sort client-side to avoid needing a composite index
      const reviewsQuery = query(
        reviewsRef,
        where('requestId', '==', currentRequest.id)
      )
      const reviewsSnapshot = await getDocs(reviewsQuery)

      const reviewsData = reviewsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      // Sort reviews by createdAt desc (client side)
      reviewsData.sort((a, b) => {
        const aTime = (a.createdAt?.seconds ?? 0) * 1000
        const bTime = (b.createdAt?.seconds ?? 0) * 1000
        return bTime - aTime
      })

      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải đánh giá',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Add new review
  const handleAddReview = async () => {
    if (!newReview.content.trim() || newReview.rating === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập nội dung và chọn số sao',
        variant: 'destructive'
      })
      return
    }

    setIsAddingReview(true)
    try {
      const reviewData = {
        requestId: currentRequest.id,
        requestCode: currentRequest.code,
        title: newReview.title.trim() || 'Đánh giá chung',
        type: newReview.type,
        rating: newReview.rating,
        content: newReview.content.trim(),
        isAnonymous: newReview.isAnonymous,
        author: newReview.isAnonymous
          ? null
          : {
              id: currentRequest.creator?.id || 'unknown',
              name: currentRequest.creator?.name || 'Khách hàng',
              email: currentRequest.creator?.email || ''
            },
        likes: 0,
        dislikes: 0,
        replies: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'reviews'), reviewData)

      // Reset form
      setNewReview({
        title: '',
        type: 'general',
        rating: 0,
        content: '',
        isAnonymous: false
      })

      // Refresh reviews
      fetchReviews()

      toast({
        title: 'Thành công',
        description: 'Đã thêm đánh giá mới'
      })
    } catch (error) {
      console.error('Error adding review:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm đánh giá',
        variant: 'destructive'
      })
    } finally {
      setIsAddingReview(false)
    }
  }

  // Add reply to review
  const handleAddReply = async (reviewId: string) => {
    if (!replyContent.trim()) return

    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      const reviewDoc = await getDoc(reviewRef)

      if (reviewDoc.exists()) {
        const reviewData = reviewDoc.data()
        const newReply = {
          id: `reply-${Date.now()}`,
          content: replyContent.trim(),
          author: {
            id: 'team',
            name: 'Đội ngũ hỗ trợ',
            role: 'Team'
          },
          createdAt: new Date()
        }

        const updatedReplies = [...(reviewData.replies || []), newReply]

        await updateDoc(reviewRef, {
          replies: updatedReplies,
          updatedAt: serverTimestamp()
        })

        setReplyContent('')
        setReplyingTo(null)
        fetchReviews()

        toast({
          title: 'Thành công',
          description: 'Đã thêm phản hồi'
        })
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể thêm phản hồi',
        variant: 'destructive'
      })
    }
  }

  // Like/Dislike review
  const handleReviewReaction = async (
    reviewId: string,
    type: 'like' | 'dislike'
  ) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId)
      const reviewDoc = await getDoc(reviewRef)

      if (reviewDoc.exists()) {
        const reviewData = reviewDoc.data()
        const updateData = {
          [type === 'like' ? 'likes' : 'dislikes']:
            (reviewData[type === 'like' ? 'likes' : 'dislikes'] || 0) + 1,
          updatedAt: serverTimestamp()
        }

        await updateDoc(reviewRef, updateData)
        fetchReviews()
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    }
  }

  // Render star rating
  const renderStarRating = (
    rating: number,
    interactive = false,
    onRatingChange?: (rating: number) => void
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-5 w-5',
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300',
              interactive && 'cursor-pointer hover:text-yellow-400'
            )}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
        {!interactive && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({rating}/5)
          </span>
        )}
      </div>
    )
  }

  // Get review type label
  const getReviewTypeLabel = (type: string) => {
    const types = {
      general: 'Tổng quan',
      design: 'Thiết kế',
      quality: 'Chất lượng',
      price: 'Giá cả',
      timing: 'Thời gian',
      service: 'Dịch vụ'
    }
    return types[type as keyof typeof types] || 'Khác'
  }

  // Thêm useEffect sau khi khai báo state
  useEffect(() => {
    if (
      currentRequest.currentStepId &&
      visibleSteps.length > 0 &&
      !selectedStep
    ) {
      const currentStep = visibleSteps.find(
        (step: any) => step.id === currentRequest.currentStepId
      )
      if (currentStep) {
        setSelectedStep(currentStep)
      }
    }
  }, [currentRequest.currentStepId, visibleSteps, selectedStep])

  // Cập nhật currentRequest khi request prop thay đổi
  useEffect(() => {
    setCurrentRequest(request)
  }, [request])

  // Debug logs
  console.log('Request data:', currentRequest)
  console.log('Workflow data:', workflowData)
  console.log('Standard workflow:', standardWorkflow)
  console.log('Visible steps:', visibleSteps)
  console.log('Current step ID:', currentRequest.currentStepId)
  console.log('Workflow step data:', currentRequest.workflowStepData)

  if (!currentRequest) return null

  // Format dates
  const createdAtDate = currentRequest.createdAt?.toDate
    ? format(currentRequest.createdAt.toDate(), 'dd/MM/yyyy HH:mm', {
        locale: vi
      })
    : 'Không có dữ liệu'

  const updatedAtDate = currentRequest.updatedAt?.toDate
    ? format(currentRequest.updatedAt.toDate(), 'dd/MM/yyyy HH:mm', {
        locale: vi
      })
    : 'Không có dữ liệu'

  // Format dates - cập nhật để sử dụng dữ liệu từ workflowStepData
  const receiveDate = currentRequest.workflowStepData?.fieldValues?.receiveDate
    ? format(
        new Date(currentRequest.workflowStepData.fieldValues.receiveDate),
        'dd/MM/yyyy HH:mm',
        { locale: vi }
      )
    : 'Không có dữ liệu'

  const deadline = currentRequest.workflowStepData?.fieldValues?.deadline
    ? format(
        new Date(currentRequest.workflowStepData.fieldValues.deadline),
        'dd/MM/yyyy HH:mm',
        { locale: vi }
      )
    : 'Không có dữ liệu'

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in progress':
      case 'đang thực hiện':
      case 'in_progress':
      case 'đang xử lý':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
      case 'hoàn thành':
        return 'bg-green-100 text-green-800'
      case 'rejected':
      case 'từ chối':
        return 'bg-red-100 text-red-800'
      case 'on_hold':
      case 'tạm dừng':
        return 'bg-orange-100 text-orange-800'
      case 'converted_to_product':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get step status - cập nhật để kiểm tra từ requestHistory
  const getStepStatus = (stepId: string) => {
    // Kiểm tra xem bước đã hoàn thành chưa từ completedStepsHistory (nhanh hơn)
    const isCompleted = (currentRequest.completedStepsHistory || []).some(
      (step: any) => step.stepId === stepId
    )

    if (isCompleted) return 'completed'

    if (stepId === currentRequest.currentStepId) return 'in_progress'

    return 'not_started'
  }

  // Calculate workflow progress
  const calculateProgress = () => {
    if (!visibleSteps.length) return 0

    // Đếm số bước đã hoàn thành từ completedStepsHistory
    const completedStepsCount = (currentRequest.completedStepsHistory || [])
      .length

    // Nếu tất cả bước đã hoàn thành
    if (completedStepsCount >= visibleSteps.length) {
      return 100
    }

    // Tính phần trăm dựa trên số bước đã hoàn thành
    return Math.round((completedStepsCount / visibleSteps.length) * 100)
  }

  const workflowProgress = calculateProgress()

  // Get step button style - sửa lại để không thay đổi màu khi selected
  const getStepButtonStyle = (stepStatus: string, isSelected: boolean) => {
    let baseStyle =
      'px-4 py-3 rounded-lg border-2 transition-all duration-200 cursor-pointer min-w-[160px] text-center relative'

    if (isSelected) {
      baseStyle += ' ring-2 ring-blue-500 ring-offset-2'
    }

    switch (stepStatus) {
      case 'completed':
        return cn(
          baseStyle,
          'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
        )
      case 'in_progress':
        return cn(
          baseStyle,
          'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
        )
      default:
        return cn(
          baseStyle,
          'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200'
        )
    }
  }

  // Get step status text
  const getStepStatusText = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'Hoàn thành'
      case 'in_progress':
        return 'Đang xử lý'
      default:
        return 'Chưa bắt đầu'
    }
  }

  // Get current step name from standardWorkflows
  const getCurrentStepName = () => {
    if (!currentRequest.currentStepId || !visibleSteps.length)
      return currentRequest.currentStepId || 'Không có dữ liệu'

    const currentStep = visibleSteps.find(
      (step: any) => step.id === currentRequest.currentStepId
    )
    return currentStep?.name || currentRequest.currentStepId
  }

  // Get field value from workflowStepData - chỉ cho bước hiện tại
  const getFieldValue = (fieldId: string, stepId: string) => {
    // Chỉ lấy dữ liệu nếu đây là bước hiện tại
    if (stepId === currentRequest.currentStepId) {
      return currentRequest.workflowStepData?.fieldValues?.[fieldId] || ''
    }
    return '' // Các bước khác không có dữ liệu
  }

  // Format field value for display
  const formatFieldValue = (field: any, value: any) => {
    if (!value) return 'Chưa có dữ liệu'

    switch (field.type) {
      case 'date':
        try {
          const date = new Date(value)
          return format(date, 'dd/MM/yyyy HH:mm', { locale: vi })
        } catch {
          return value
        }
      case 'datetime':
        try {
          const date = new Date(value)
          return format(date, 'dd/MM/yyyy HH:mm', { locale: vi })
        } catch {
          return value
        }
      default:
        return value
    }
  }

  // Function để cập nhật field value
  const updateFieldValue = async (fieldId: string, value: any) => {
    try {
      const updatedFieldValues = {
        ...currentRequest.workflowStepData?.fieldValues,
        [fieldId]: value
      }

      const updatedWorkflowStepData = {
        ...currentRequest.workflowStepData,
        fieldValues: updatedFieldValues
      }

      // Cập nhật vào Firebase
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        workflowStepData: updatedWorkflowStepData,
        updatedAt: serverTimestamp()
      })

      // Cập nhật state local
      const updatedRequest = {
        ...currentRequest,
        workflowStepData: updatedWorkflowStepData
      }
      setCurrentRequest(updatedRequest)

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_field',
        entityType: 'field',
        entityId: fieldId,
        details: `Cập nhật trường ${fieldId} = ${value}`,
        metadata: {
          fieldId,
          oldValue: currentRequest.workflowStepData?.fieldValues?.[fieldId],
          newValue: value,
          stepId: currentRequest.currentStepId
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: `Đã cập nhật trường ${fieldId}`
      })
    } catch (error) {
      console.error('Error updating field value:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật trường dữ liệu',
        variant: 'destructive'
      })
    }
  }

  // Function để lấy thông tin user ngẫu nhiên từ allowedUsers
  const getRandomAssigneeFromAllowedUsers = async (allowedUsers: string[]) => {
    if (!allowedUsers || allowedUsers.length === 0) {
      return null
    }

    try {
      // Random chọn 1 user ID từ allowedUsers
      const randomUserId =
        allowedUsers[Math.floor(Math.random() * allowedUsers.length)]

      // Lấy thông tin user từ collection users
      const usersRef = collection(db, 'users')
      const userDoc = doc(usersRef, randomUserId)
      const userSnapshot = await getDoc(userDoc)

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data()
        return {
          id: randomUserId,
          name:
            userData.fullName ||
            userData.displayName ||
            userData.name ||
            'Không có tên',
          email: userData.email || '',
          department: userData.department || '',
          role: userData.role || ''
        }
      }

      return null
    } catch (error) {
      console.error('Error getting random assignee:', error)
      return null
    }
  }

  // Function để lấy danh sách người dùng từ allowedUsers
  const fetchAvailableAssignees = async (step: any) => {
    if (!step || !step.allowedUsers || step.allowedUsers.length === 0) {
      setAvailableAssignees([])
      return
    }

    setIsLoadingAssignees(true)
    try {
      const usersRef = collection(db, 'users')
      const assignees: any[] = []

      // Lấy thông tin từng user
      for (const userId of step.allowedUsers) {
        const userQuery = query(usersRef, where('__name__', '==', userId))
        const userSnapshot = await getDocs(userQuery)

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data()
          assignees.push({
            id: userId,
            name:
              userData.fullName ||
              userData.displayName ||
              userData.name ||
              'Không có tên',
            email: userData.email || '',
            department: userData.department || '',
            role: userData.role || '',
            photoURL: userData.photoURL || ''
          })
        }
      }

      setAvailableAssignees(assignees)
    } catch (error) {
      console.error('Error fetching available assignees:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lấy danh sách người thực hiện',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingAssignees(false)
    }
  }

  // Function để mở dialog chọn người thực hiện
  const openAssigneeDialog = (step: any) => {
    setSelectedAssignee(currentRequest.assignee)
    fetchAvailableAssignees(step)
    setIsAssigneeDialogOpen(true)
  }

  // Function để cập nhật người thực hiện
  const updateAssignee = async (assignee: any) => {
    try {
      // Cập nhật vào Firebase
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        assignee: assignee,
        updatedAt: serverTimestamp()
      })

      // Cập nhật state local
      const updatedRequest = {
        ...currentRequest,
        assignee: assignee
      }
      setCurrentRequest(updatedRequest)

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'assign',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Thay đổi người thực hiện thành ${assignee?.name || 'Không có'}`,
        metadata: {
          oldAssignee: currentRequest.assignee,
          newAssignee: assignee
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: `Đã thay đổi người thực hiện thành ${assignee?.name || 'Không có'}`
      })

      setIsAssigneeDialogOpen(false)
    } catch (error) {
      console.error('Error updating assignee:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật người thực hiện',
        variant: 'destructive'
      })
    }
  }

  // Function để cập nhật hình ảnh
  const updateRequestImages = async (newImages: string[]) => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        images: newImages,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        images: newImages
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_images',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật hình ảnh (${newImages.length} ảnh)`,
        metadata: {
          oldImages: currentRequest.images || [],
          newImages: newImages
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật hình ảnh cho yêu cầu'
      })
    } catch (error) {
      console.error('Error updating images:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật hình ảnh',
        variant: 'destructive'
      })
    }
  }

  // Lọc danh sách nguyên vật liệu theo loại và từ khóa tìm kiếm
  const filteredMaterials = materials.filter((material: any) => {
    // Lọc theo loại
    if (
      selectedMaterialType !== 'all' &&
      material.type !== selectedMaterialType
    ) {
      return false
    }

    // Lọc theo từ khóa tìm kiếm
    if (materialSearchQuery) {
      const searchLower = materialSearchQuery.toLowerCase()
      const nameLower = material.name.toLowerCase()
      const codeLower = material.code.toLowerCase()
      const descLower = (material.description || '').toLowerCase()

      return (
        nameLower.includes(searchLower) ||
        codeLower.includes(searchLower) ||
        descLower.includes(searchLower)
      )
    }

    return true
  })

  // Function để thêm vật liệu
  const addMaterialToRequest = (material: any) => {
    const existingMaterial = selectedMaterials.find((m) => m.id === material.id)
    if (existingMaterial) {
      // Tăng số lượng nếu đã có
      setSelectedMaterials((prev) =>
        prev.map((m) =>
          m.id === material.id
            ? { ...m, requestedQuantity: (m.requestedQuantity || 1) + 1 }
            : m
        )
      )
    } else {
      // Thêm mới với số lượng = 1
      setSelectedMaterials((prev) => [
        ...prev,
        {
          ...material,
          requestedQuantity: 1,
          status: 'pending'
        }
      ])
    }
  }

  // Function để xóa vật liệu
  const removeMaterialFromRequest = (materialId: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId))
  }

  // Function để cập nhật số lượng vật liệu
  const updateMaterialQuantity = (materialId: string, quantity: number) => {
    if (quantity <= 0) {
      removeMaterialFromRequest(materialId)
      return
    }

    setSelectedMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId ? { ...m, requestedQuantity: quantity } : m
      )
    )
  }

  // Function để lưu danh sách vật liệu
  const saveMaterialsToRequest = async () => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        materials: selectedMaterials,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        materials: selectedMaterials
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_materials',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật danh sách vật liệu (${selectedMaterials.length} vật liệu)`,
        metadata: {
          oldMaterials: currentRequest.materials || [],
          newMaterials: selectedMaterials
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật danh sách vật liệu'
      })

      setIsAddMaterialDialogOpen(false)
    } catch (error) {
      console.error('Error updating materials:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật danh sách vật liệu',
        variant: 'destructive'
      })
    }
  }

  // Hàm tính toán ngày tiếp nhận dựa trên giờ làm việc (8:30 - 18:00)
  const calculateBusinessReceiveDate = (now: Date) => {
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Kiểm tra xem có trong giờ làm việc không (8:30 - 18:00)
    const isBusinessHours =
      (currentHour > 8 || (currentHour === 8 && currentMinute >= 30)) &&
      (currentHour < 18 || (currentHour === 18 && currentMinute === 0))

    if (isBusinessHours) {
      // Trong giờ làm việc - giữ nguyên thời gian hiện tại
      return now
    } else {
      // Ngoài giờ làm việc - lấy 8:30 sáng gần nhất
      const nextBusinessDay = new Date(now)

      if (currentHour >= 18) {
        // Sau 18h - lấy 8:30 sáng hôm sau
        nextBusinessDay.setDate(nextBusinessDay.getDate() + 1)
      } else if (currentHour < 8 || (currentHour === 8 && currentMinute < 30)) {
        // Trước 8:30 sáng - lấy 8:30 sáng cùng ngày
      }

      // Đặt giờ thành 8:30 sáng
      nextBusinessDay.setHours(8, 30, 0, 0)
      return nextBusinessDay
    }
  }

  // Hàm chuyển đổi estimatedTime và estimatedTimeUnit thành giờ
  const convertToHours = (estimatedTime: number, estimatedTimeUnit: string) => {
    switch (estimatedTimeUnit?.toLowerCase()) {
      case 'hours':
      case 'giờ':
        return estimatedTime
      case 'days':
      case 'ngày':
        return estimatedTime * 8 // 8 giờ làm việc/ngày
      case 'weeks':
      case 'tuần':
        return estimatedTime * 8 * 5 // 5 ngày làm việc/tuần
      default:
        return estimatedTime * 8 // Mặc định là ngày
    }
  }

  // Hàm tính toán deadline dựa trên ngày tiếp nhận và thời gian ước tính
  const calculateBusinessDeadline = (receiveDate: Date, estimatedHours) => {
    const deadline = new Date(receiveDate)
    let remainingHours = estimatedHours

    // Định nghĩa giờ làm việc
    const WORK_START = 8.5 // 8:30
    const LUNCH_START = 12
    const LUNCH_END = 13.5 // 13:30
    const WORK_END = 18
    const DAILY_WORK_HOURS = 8 // 8:30-12:00 (3.5h) + 13:30-18:00 (4.5h) = 8h

    while (remainingHours > 0) {
      const currentHour = deadline.getHours() + deadline.getMinutes() / 60

      // Nếu ngoài giờ làm việc, chuyển đến đầu ngày làm việc tiếp theo
      if (currentHour < WORK_START || currentHour >= WORK_END) {
        if (currentHour >= WORK_END) {
          deadline.setDate(deadline.getDate() + 1)
        }
        deadline.setHours(8, 30, 0, 0)
        continue
      }

      // Nếu trong giờ nghỉ trưa, chuyển đến 13:30
      if (currentHour >= LUNCH_START && currentHour < LUNCH_END) {
        deadline.setHours(13, 30, 0, 0)
        continue
      }

      // Tính số giờ có thể làm việc trong ngày hiện tại
      let availableHoursToday = 0

      if (currentHour < LUNCH_START) {
        // Trước giờ nghỉ trưa: có thể làm đến 12:00, sau đó từ 13:30-18:00
        availableHoursToday = LUNCH_START - currentHour + (WORK_END - LUNCH_END)
      } else {
        // Sau giờ nghỉ trưa: chỉ có thể làm đến 18:00
        availableHoursToday = WORK_END - currentHour
      }

      if (remainingHours <= availableHoursToday) {
        // Có thể hoàn thành trong ngày
        if (
          currentHour < LUNCH_START &&
          currentHour + remainingHours > LUNCH_START
        ) {
          // Cần vượt qua giờ nghỉ trưa
          const hoursBeforeLunch = LUNCH_START - currentHour
          const hoursAfterLunch = remainingHours - hoursBeforeLunch
          deadline.setHours(13, 30, 0, 0)
          deadline.setHours(deadline.getHours() + Math.floor(hoursAfterLunch))
          deadline.setMinutes(
            deadline.getMinutes() + (hoursAfterLunch % 1) * 60
          )
        } else {
          // Không vượt qua giờ nghỉ trưa
          deadline.setHours(deadline.getHours() + Math.floor(remainingHours))
          deadline.setMinutes(deadline.getMinutes() + (remainingHours % 1) * 60)
        }
        remainingHours = 0
      } else {
        // Cần chuyển sang ngày tiếp theo
        remainingHours -= availableHoursToday
        deadline.setDate(deadline.getDate() + 1)
        deadline.setHours(8, 30, 0, 0)
      }
    }

    return deadline
  }

  // Function để hoàn thành bước - CẬP NHẬT ĐỂ SỬ DỤNG logic mới
  const handleCompleteStep = async (stepId: string) => {
    setIsCompletingStep(true)
    try {
      const stepToComplete = visibleSteps.find((step) => step.id === stepId)
      if (!stepToComplete) {
        throw new Error('Không tìm thấy bước cần hoàn thành')
      }

      const now = new Date()
      console.log('Starting step completion for:', stepToComplete.name)

      // Lưu dữ liệu bước đã hoàn thành vào completedStepsHistory
      const completedStepData = {
        stepId: stepToComplete.id,
        stepName: stepToComplete.name,
        completedAt: now,
        fieldValues: currentRequest.workflowStepData?.fieldValues || {},
        assignee: currentRequest.assignee,
        estimatedTime: stepToComplete.estimatedTime || 2,
        estimatedTimeUnit: stepToComplete.estimatedTimeUnit || 'days'
      }

      // Thêm vào mảng lịch sử các bước đã hoàn thành
      const updatedCompletedSteps = [
        ...(currentRequest.completedStepsHistory || []),
        completedStepData
      ]

      // Tìm bản ghi lịch sử hiện tại của bước này
      const currentStepHistory = await historyService.getCurrentStepHistory(
        currentRequest.id,
        stepToComplete.id
      )

      // Tìm bước tiếp theo
      const currentIndex = visibleSteps.findIndex((step) => step.id === stepId)

      let updatedRequest: any
      let updateData: any = {
        completedStepsHistory: updatedCompletedSteps,
        lastStepCompletedAt: now,
        updatedAt: serverTimestamp()
      }

      let nextStepData = null
      const historyIds = [...(currentRequest.historyIds || [])]

      if (currentIndex < visibleSteps.length - 1) {
        // Còn bước tiếp theo
        const nextStep = visibleSteps[currentIndex + 1]
        console.log('Moving to next step:', nextStep.name)

        // Lấy assignee ngẫu nhiên từ allowedUsers của bước tiếp theo
        const assigneePromise =
          nextStep.allowedUsers && nextStep.allowedUsers.length > 0
            ? getRandomAssigneeFromAllowedUsers(nextStep.allowedUsers).catch(
                () => null
              )
            : Promise.resolve(null)

        // Tính toán ngày tiếp nhận và deadline
        const businessReceiveDate = calculateBusinessReceiveDate(now)
        const estimatedHours = convertToHours(
          nextStep.estimatedTime || 2,
          nextStep.estimatedTimeUnit || 'days'
        )
        const businessDeadline = calculateBusinessDeadline(
          businessReceiveDate,
          estimatedHours
        )

        // Cập nhật workflowStepData cho bước mới
        const newWorkflowStepData = {
          stepId: nextStep.id,
          stepName: nextStep.name,
          fieldValues: {
            receiveDate: businessReceiveDate.toISOString(),
            deadline: businessDeadline.toISOString(),
            estimatedTime: `${nextStep.estimatedTime || 2} ${nextStep.estimatedTimeUnit || 'ngày'}`
          }
        }

        // Đợi assignee (nếu có)
        const randomAssignee = await assigneePromise

        nextStepData = {
          stepId: nextStep.id,
          stepName: nextStep.name,
          assignee: randomAssignee
        }

        updatedRequest = {
          ...currentRequest,
          currentStepId: nextStep.id,
          currentStepStatus: 'in_progress',
          workflowStepData: newWorkflowStepData,
          completedStepsHistory: updatedCompletedSteps,
          assignee: randomAssignee,
          updatedAt: now,
          lastStepCompletedAt: now
        }

        // Cập nhật dữ liệu Firebase
        updateData = {
          ...updateData,
          currentStepId: nextStep.id,
          currentStepStatus: 'in_progress',
          status: 'in_progress',
          workflowStepData: newWorkflowStepData,
          assignee: randomAssignee
        }

        // Chuyển sang bước tiếp theo trong UI
        setSelectedStep(nextStep)

        // Tạo bản ghi lịch sử cho bước tiếp theo
        const nextStepHistoryId = await historyService.addStepStartHistory(
          currentRequest.id,
          currentRequest.assignee?.id || currentRequest.creator?.id || 'system',
          currentRequest.assignee?.name ||
            currentRequest.creator?.name ||
            'Hệ thống',
          {
            stepId: nextStep.id,
            stepName: nextStep.name,
            assignee: randomAssignee,
            estimatedTime: nextStep.estimatedTime || 2,
            estimatedTimeUnit: nextStep.estimatedTimeUnit || 'days',
            fieldValues: newWorkflowStepData.fieldValues
          }
        )

        historyIds.push(nextStepHistoryId)
        updateData.historyIds = historyIds
        updatedRequest.historyIds = historyIds
      } else {
        // Đã hoàn thành tất cả các bước
        console.log('All steps completed')

        updatedRequest = {
          ...currentRequest,
          status: 'completed',
          currentStepId: null,
          currentStepStatus: 'completed',
          completedStepsHistory: updatedCompletedSteps,
          completedAt: now,
          updatedAt: now,
          lastStepCompletedAt: now
        }

        updateData = {
          ...updateData,
          status: 'completed',
          currentStepId: null,
          currentStepStatus: 'completed',
          completedAt: now
        }
      }

      // Cập nhật bản ghi lịch sử hiện tại thành hoàn thành
      if (currentStepHistory?.firebaseId) {
        await historyService.completeStepHistory(
          currentStepHistory.firebaseId,
          {
            fieldValues: currentRequest.workflowStepData?.fieldValues || {},
            completedAt: now,
            nextStepId: nextStepData?.stepId,
            nextStepName: nextStepData?.stepName,
            nextAssignee: nextStepData?.assignee
          }
        )
      }

      // Nếu đã hoàn thành tất cả bước, thêm bản ghi hoàn thành workflow
      if (currentIndex >= visibleSteps.length - 1) {
        const workflowCompleteHistoryId = await historyService.addHistory({
          requestId: currentRequest.id,
          userId:
            currentRequest.assignee?.id ||
            currentRequest.creator?.id ||
            'system',
          userName:
            currentRequest.assignee?.name ||
            currentRequest.creator?.name ||
            'Hệ thống',
          action: 'complete_workflow',
          entityType: 'workflow',
          entityId: currentRequest.workflowProcessId || 'unknown',
          details: 'Hoàn thành toàn bộ quy trình',
          metadata: {
            totalSteps: visibleSteps.length,
            completedAt: now
          }
        })

        historyIds.push(workflowCompleteHistoryId)
        updateData.historyIds = historyIds
        updatedRequest.historyIds = historyIds
      }

      // Cập nhật vào Firebase
      console.log('Updating Firebase...')
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, updateData)

      // Cập nhật state local
      setCurrentRequest(updatedRequest)
      setCompletedSteps(updatedCompletedSteps)

      // Refresh history để hiển thị ngay
      if (activeTab === 'history') {
        fetchRequestHistory()
      }

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      toast({
        title: 'Hoàn thành bước thành công',
        description:
          currentIndex < visibleSteps.length - 1
            ? `Đã chuyển sang bước: ${visibleSteps[currentIndex + 1].name}${updatedRequest.assignee ? ` - Người thực hiện: ${updatedRequest.assignee.name}` : ''}`
            : 'Đã hoàn thành toàn bộ quy trình'
      })

      console.log('Step completion successful')
    } catch (error) {
      console.error('Error completing step:', error)
      toast({
        title: 'Lỗi hoàn thành bước',
        description: 'Không thể hoàn thành bước. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsCompletingStep(false)
    }
  }

  // Function để tiếp tục quy trình sau khi bị từ chối/tạm dừng
  const handleContinueWorkflow = async () => {
    if (!continueReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do tiếp tục',
        variant: 'destructive'
      })
      return
    }

    setIsSubmittingContinue(true)
    try {
      const now = new Date()

      // Cập nhật trạng thái về in_progress
      const updatedRequest = {
        ...currentRequest,
        status: 'in_progress',
        currentStepStatus: 'in_progress',
        continuedAt: now,
        updatedAt: now,
        lastContinuedAt: now
      }

      // Cập nhật vào Firebase
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        status: 'in_progress',
        currentStepStatus: 'in_progress',
        continuedAt: now,
        lastContinuedAt: now,
        updatedAt: serverTimestamp()
      })

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'continue_workflow',
        entityType: 'workflow',
        entityId: currentRequest.workflowProcessId || 'unknown',
        details: `Tiếp tục quy trình sau khi bị ${currentRequest.status === 'rejected' ? 'từ chối' : 'tạm dừng'}`,
        metadata: {
          reason: continueReason.trim(),
          images: continueImages,
          previousStatus: currentRequest.status,
          continuedAt: now
        }
      })

      // Cập nhật state local
      setCurrentRequest(updatedRequest)

      // Refresh history để hiển thị ngay
      if (activeTab === 'history') {
        fetchRequestHistory()
      }

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      toast({
        title: 'Tiếp tục thành công',
        description: `Đã tiếp tục quy trình. Lý do: ${continueReason.trim()}`
      })

      setIsContinueDialogOpen(false)
      setContinueReason('')
      setContinueImages([])
    } catch (error) {
      console.error('Error continuing workflow:', error)
      toast({
        title: 'Lỗi tiếp tục quy trình',
        description: 'Không thể tiếp tục quy trình. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingContinue(false)
    }
  }

  // Function để mở dialog từ chối
  const openRejectDialog = (stepId: string) => {
    setRejectReason('')
    setRejectImages([])
    setIsRejectDialogOpen(true)
  }

  // Function để thực hiện từ chối với lý do
  const handleRejectStepWithReason = async (stepId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive'
      })
      return
    }

    setIsSubmittingReject(true)
    try {
      const stepToReject = visibleSteps.find((step) => step.id === stepId)
      if (stepToReject) {
        const now = new Date()

        const updatedRequest = {
          ...currentRequest,
          status: 'rejected',
          currentStepStatus: 'rejected',
          rejectedAt: now,
          updatedAt: now,
          lastStepRejectedAt: now
        }

        // Cập nhật vào Firebase
        const requestRef = doc(db, 'requests', currentRequest.id)
        await updateDoc(requestRef, {
          status: 'rejected',
          currentStepStatus: 'rejected',
          rejectedAt: now,
          lastStepRejectedAt: now,
          updatedAt: serverTimestamp()
        })

        // Thêm vào lịch sử
        await historyService.addHistory({
          requestId: currentRequest.id,
          userId:
            currentRequest.assignee?.id ||
            currentRequest.creator?.id ||
            'system',
          userName:
            currentRequest.assignee?.name ||
            currentRequest.creator?.name ||
            'Hệ thống',
          action: 'reject_step',
          entityType: 'step',
          entityId: stepToReject.id,
          details: `Từ chối bước: ${stepToReject.name}`,
          metadata: {
            stepName: stepToReject.name,
            reason: rejectReason.trim(),
            images: rejectImages,
            rejectedAt: now,
            fieldValues: currentRequest.workflowStepData?.fieldValues || {},
            assignee: currentRequest.assignee
          }
        })

        // Cập nhật state local
        setCurrentRequest(updatedRequest)

        // Refresh history để hiển thị ngay
        if (activeTab === 'history') {
          fetchRequestHistory()
        }

        // Gọi callback nếu có
        if (onRequestUpdate) {
          onRequestUpdate(updatedRequest)
        }

        toast({
          title: 'Đã từ chối bước',
          description: `Bước "${stepToReject.name}" đã bị từ chối với lý do: ${rejectReason.trim()}`,
          variant: 'destructive'
        })

        setIsRejectDialogOpen(false)
        console.log('Rejected step:', stepToReject.name)
      }
    } catch (error) {
      console.error('Error rejecting step:', error)
      toast({
        title: 'Lỗi từ chối bước',
        description: 'Không thể từ chối bước. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingReject(false)
    }
  }

  // Function để mở dialog tạm dừng
  const openHoldDialog = (stepId: string) => {
    setHoldReason('')
    setRejectImages([])
    setIsHoldDialogOpen(true)
  }

  // Function để thực hiện tạm dừng với lý do
  const handleHoldStepWithReason = async (stepId: string) => {
    if (!holdReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do tạm dừng',
        variant: 'destructive'
      })
      return
    }

    setIsSubmittingHold(true)
    try {
      const stepToHold = visibleSteps.find((step) => step.id === stepId)
      if (stepToHold) {
        const now = new Date()

        const updatedRequest = {
          ...currentRequest,
          status: 'on_hold',
          currentStepStatus: 'on_hold',
          heldAt: now,
          updatedAt: now,
          lastStepHeldAt: now
        }

        // Cập nhật vào Firebase
        const requestRef = doc(db, 'requests', currentRequest.id)
        await updateDoc(requestRef, {
          status: 'on_hold',
          currentStepStatus: 'on_hold',
          heldAt: now,
          lastStepHeldAt: now,
          updatedAt: serverTimestamp()
        })

        // Thêm vào lịch sử
        await historyService.addHistory({
          requestId: currentRequest.id,
          userId:
            currentRequest.assignee?.id ||
            currentRequest.creator?.id ||
            'system',
          userName:
            currentRequest.assignee?.name ||
            currentRequest.creator?.name ||
            'Hệ thống',
          action: 'hold_step',
          entityType: 'step',
          entityId: stepToHold.id,
          details: `Tạm dừng bước: ${stepToHold.name}`,
          metadata: {
            stepName: stepToHold.name,
            reason: holdReason.trim(),
            images: rejectImages,
            heldAt: now,
            fieldValues: currentRequest.workflowStepData?.fieldValues || {},
            assignee: currentRequest.assignee
          }
        })

        // Cập nhật state local
        setCurrentRequest(updatedRequest)

        // Refresh history để hiển thị ngay
        if (activeTab === 'history') {
          fetchRequestHistory()
        }

        // Gọi callback nếu có
        if (onRequestUpdate) {
          onRequestUpdate(updatedRequest)
        }

        toast({
          title: 'Đã tạm dừng bước',
          description: `Bước "${stepToHold.name}" đã bị tạm dừng với lý do: ${holdReason.trim()}`
        })

        setIsHoldDialogOpen(false)
        console.log('Held step:', stepToHold.name)
      }
    } catch (error) {
      console.error('Error holding step:', error)
      toast({
        title: 'Lỗi tạm dừng bước',
        description: 'Không thể tạm dừng bước. Vui lòng thử lại.'
      })
    } finally {
      setIsSubmittingHold(false)
    }
  }

  // Function để từ chối bước
  const handleRejectStep = async (stepId: string) => {
    setIsCompletingStep(true)
    try {
      const stepToReject = visibleSteps.find((step) => step.id === stepId)
      if (stepToReject) {
        const now = new Date()

        const updatedRequest = {
          ...currentRequest,
          status: 'rejected',
          currentStepStatus: 'rejected',
          rejectedAt: now,
          updatedAt: now,
          lastStepRejectedAt: now
        }

        // Cập nhật vào Firebase
        const requestRef = doc(db, 'requests', currentRequest.id)
        await updateDoc(requestRef, {
          status: 'rejected',
          currentStepStatus: 'rejected',
          rejectedAt: now,
          lastStepRejectedAt: now,
          updatedAt: serverTimestamp()
        })

        // Thêm vào lịch sử
        await historyService.addHistory({
          requestId: currentRequest.id,
          userId:
            currentRequest.assignee?.id ||
            currentRequest.creator?.id ||
            'system',
          userName:
            currentRequest.assignee?.name ||
            currentRequest.creator?.name ||
            'Hệ thống',
          action: 'reject_step',
          entityType: 'step',
          entityId: stepToReject.id,
          details: `Từ chối bước: ${stepToReject.name}`,
          metadata: {
            stepName: stepToReject.name,
            reason: 'Bước bị từ chối bởi người thực hiện',
            rejectedAt: now,
            fieldValues: currentRequest.workflowStepData?.fieldValues || {},
            assignee: currentRequest.assignee
          }
        })

        // Cập nhật state local
        setCurrentRequest(updatedRequest)

        // Refresh history để hiển thị ngay
        if (activeTab === 'history') {
          fetchRequestHistory()
        }

        // Gọi callback nếu có
        if (onRequestUpdate) {
          onRequestUpdate(updatedRequest)
        }

        toast({
          title: 'Đã từ chối bước',
          description: `Bước "${stepToReject.name}" đã bị từ chối. Quy trình đã dừng lại.`,
          variant: 'destructive'
        })

        console.log('Rejected step:', stepToReject.name)
      }
    } catch (error) {
      console.error('Error rejecting step:', error)
      toast({
        title: 'Lỗi từ chối bước',
        description: 'Không thể từ chối bước. Vui lòng thử lại.'
      })
    } finally {
      setIsCompletingStep(false)
    }
  }

  // Function để lấy danh sách trạng thái có sẵn
  const fetchAvailableStatuses = async () => {
    try {
      // Lấy danh sách trạng thái từ subWorkflows
      const statuses = subWorkflows
        .filter(
          (workflow: any) =>
            workflow.statusId &&
            workflow.statusId !== currentRequest.productStatus?.id
        )
        .map((workflow: any) => ({
          id: workflow.statusId,
          name: workflow.statusName || workflow.name,
          workflowId: workflow.id,
          workflowName: workflow.name
        }))

      // Loại bỏ trùng lặp
      const uniqueStatuses = statuses.filter(
        (status, index, self) =>
          index === self.findIndex((s) => s.id === status.id)
      )

      setAvailableStatuses(uniqueStatuses)
    } catch (error) {
      console.error('Error fetching available statuses:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể lấy danh sách trạng thái',
        variant: 'destructive'
      })
    }
  }

  // Function để mở dialog thay đổi trạng thái
  const openChangeStatusDialog = () => {
    fetchAvailableStatuses()
    setIsChangeStatusDialogOpen(true)
  }

  // Function để thay đổi trạng thái và reset quy trình
  const handleChangeStatus = async (newStatus: any) => {
    if (!newStatus) return

    setIsChangingStatus(true)
    try {
      // Tìm quy trình tương ứng với trạng thái mới
      const newWorkflow = subWorkflows.find(
        (workflow: any) => workflow.statusId === newStatus.id
      )

      if (!newWorkflow) {
        throw new Error('Không tìm thấy quy trình cho trạng thái này')
      }

      // Lấy bước đầu tiên của quy trình mới
      const firstStepId = newWorkflow.visibleSteps?.[0]
      if (!firstStepId) {
        throw new Error('Quy trình không có bước nào')
      }

      // Tìm thông tin chi tiết của bước đầu tiên từ standardWorkflow
      const firstStepDetails = standardWorkflow?.steps?.find(
        (step: any) => step.id === firstStepId
      )
      if (!firstStepDetails) {
        throw new Error('Không tìm thấy thông tin bước đầu tiên')
      }

      const now = new Date()

      // Tính toán ngày tiếp nhận và deadline cho bước đầu tiên
      const businessReceiveDate = calculateBusinessReceiveDate(now)
      const estimatedHours = convertToHours(
        firstStepDetails.estimatedTime || 2,
        firstStepDetails.estimatedTimeUnit || 'days'
      )
      const businessDeadline = calculateBusinessDeadline(
        businessReceiveDate,
        estimatedHours
      )

      // Lấy assignee ngẫu nhiên cho bước đầu tiên (nếu có)
      const randomAssignee =
        firstStepDetails.allowedUsers &&
        firstStepDetails.allowedUsers.length > 0
          ? await getRandomAssigneeFromAllowedUsers(
              firstStepDetails.allowedUsers
            ).catch(() => null)
          : null

      // Tạo workflowStepData mới cho bước đầu tiên
      const newWorkflowStepData = {
        stepId: firstStepId,
        stepName: firstStepDetails.name,
        fieldValues: {
          receiveDate: businessReceiveDate.toISOString(),
          deadline: businessDeadline.toISOString(),
          estimatedTime: `${firstStepDetails.estimatedTime || 2} ${firstStepDetails.estimatedTimeUnit || 'ngày'}`
        }
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData = {
        productStatus: {
          id: newStatus.id,
          name: newStatus.name
        },
        workflowProcessId: newWorkflow.id,
        currentStepId: firstStepId,
        currentStepStatus: 'in_progress',
        status: 'in_progress',
        workflowStepData: newWorkflowStepData,
        assignee: randomAssignee,
        updatedAt: serverTimestamp(),
        statusChangedAt: now
      }

      // Cập nhật vào Firebase
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, updateData)

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'change_status',
        entityType: 'workflow',
        entityId: newWorkflow.id,
        details: `Thay đổi trạng thái từ "${currentRequest.productStatus?.name || 'Không xác định'}" sang "${newStatus.name}"`,
        metadata: {
          oldStatus: currentRequest.productStatus,
          newStatus: newStatus,
          oldWorkflow: currentRequest.workflowProcessId,
          newWorkflow: newWorkflow.id,
          newAssignee: randomAssignee,
          statusChangedAt: now
        }
      })

      // Cập nhật state local
      const updatedRequest = {
        ...currentRequest,
        ...updateData,
        updatedAt: now,
        statusChangedAt: now
      }
      setCurrentRequest(updatedRequest)

      // Reset selected step về bước đầu tiên
      setSelectedStep(firstStepDetails)

      // Refresh history để hiển thị ngay
      if (activeTab === 'history') {
        fetchRequestHistory()
      }

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      toast({
        title: 'Thay đổi trạng thái thành công',
        description: `Đã chuyển sang trạng thái "${newStatus.name}" và bắt đầu quy trình mới từ bước "${firstStepDetails.name}"${randomAssignee ? ` - Người thực hiện: ${randomAssignee.name}` : ''}`
      })

      setIsChangeStatusDialogOpen(false)
    } catch (error) {
      console.error('Error changing status:', error)
      toast({
        title: 'Lỗi thay đổi trạng thái',
        description:
          error instanceof Error
            ? error.message
            : 'Không thể thay đổi trạng thái. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsChangingStatus(false)
    }
  }

  // Function để cập nhật tiêu đề
  const updateRequestTitle = async (newTitle: string) => {
    if (!newTitle.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tiêu đề không được để trống',
        variant: 'destructive'
      })
      return
    }

    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        title: newTitle.trim(),
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        title: newTitle.trim()
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_title',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật tiêu đề: "${newTitle.trim()}"`,
        metadata: {
          oldTitle: currentRequest.title,
          newTitle: newTitle.trim()
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật tiêu đề yêu cầu'
      })
    } catch (error) {
      console.error('Error updating title:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật tiêu đề'
      })
    }
  }

  // Function để cập nhật mô tả
  const updateRequestDescription = async (newDescription: string) => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        description: newDescription,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        description: newDescription
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_description',
        entityType: 'request',
        entityId: currentRequest.id,
        details: 'Cập nhật mô tả yêu cầu',
        metadata: {
          oldDescription: currentRequest.description,
          newDescription: newDescription
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật mô tả yêu cầu'
      })
    } catch (error) {
      console.error('Error updating description:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật mô tả'
      })
    }
  }

  // Function để cập nhật độ ưu tiên
  const updateRequestPriority = async (newPriority: string) => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        priority: newPriority,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        priority: newPriority
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_priority',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật độ ưu tiên: ${newPriority}`,
        metadata: {
          oldPriority: currentRequest.priority,
          newPriority: newPriority
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật độ ưu tiên'
      })
    } catch (error) {
      console.error('Error updating priority:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật độ ưu tiên'
      })
    }
  }

  // Function để cập nhật phòng ban
  const updateRequestDepartment = async (newDepartment: string) => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        department: newDepartment,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        department: newDepartment
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_department',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật phòng ban: ${newDepartment}`,
        metadata: {
          oldDepartment: currentRequest.department,
          newDepartment: newDepartment
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật phòng ban'
      })
    } catch (error) {
      console.error('Error updating department:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật phòng ban'
      })
    }
  }

  // Function để cập nhật trạng thái đơn giản (không reset workflow)
  const updateRequestStatus = async (newStatus: string) => {
    try {
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      })

      const updatedRequest = {
        ...currentRequest,
        status: newStatus
      }
      setCurrentRequest(updatedRequest)

      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'update_status',
        entityType: 'request',
        entityId: currentRequest.id,
        details: `Cập nhật trạng thái: ${newStatus}`,
        metadata: {
          oldStatus: currentRequest.status,
          newStatus: newStatus
        }
      })

      toast({
        title: 'Cập nhật thành công',
        description: 'Đã cập nhật trạng thái yêu cầu'
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Lỗi cập nhật',
        description: 'Không thể cập nhật trạng thái'
      })
    }
  }

  // Function để chuyển đổi yêu cầu thành sản phẩm
  const convertRequestToProduct = async () => {
    setIsConvertingToProduct(true)
    try {
      const now = new Date()

      // Tạo SKU tự động nếu chưa có
      const autoSku = productData.sku || `PRD-${Date.now()}`

      // Chuẩn bị dữ liệu sản phẩm
      const newProduct = {
        // Thông tin cơ bản từ yêu cầu
        name: productData.name,
        description: productData.description,
        sku: autoSku,
        category: productData.category,
        price: productData.price,
        cost: productData.cost,

        // Thông tin từ yêu cầu gốc
        originalRequestId: currentRequest.id,
        originalRequestCode: currentRequest.code,
        creator: currentRequest.creator,
        department: currentRequest.department,
        priority: currentRequest.priority,

        // Thông tin quy trình
        workflowData: {
          completedSteps: requestHistory.filter(
            (entry: any) => entry.action === 'complete_step'
          ),
          totalSteps: visibleSteps.length,
          workflowId: currentRequest.workflowProcessId,
          standardWorkflowId: standardWorkflow?.id
        },

        // Vật liệu và hình ảnh
        materials: currentRequest.materials || [],
        images: currentRequest.images || [],

        // Metadata
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdFromRequest: true,
        completedWorkflowAt: now
      }

      // Lưu sản phẩm vào collection products
      const productRef = await addDoc(collection(db, 'products'), newProduct)

      // Cập nhật yêu cầu để đánh dấu đã chuyển thành sản phẩm
      const requestRef = doc(db, 'requests', currentRequest.id)
      await updateDoc(requestRef, {
        status: 'converted_to_product',
        productId: productRef.id,
        convertedToProductAt: now,
        updatedAt: serverTimestamp()
      })

      // Thêm vào lịch sử
      await historyService.addHistory({
        requestId: currentRequest.id,
        userId: currentRequest.creator?.id || 'system',
        userName: currentRequest.creator?.name || 'Hệ thống',
        action: 'convert_to_product',
        entityType: 'product',
        entityId: productRef.id,
        details: `Chuyển đổi yêu cầu thành sản phẩm: ${productData.name}`,
        metadata: {
          productId: productRef.id,
          productName: productData.name,
          productSku: autoSku,
          convertedAt: now
        }
      })

      // Cập nhật state local
      const updatedRequest = {
        ...currentRequest,
        status: 'converted_to_product',
        productId: productRef.id,
        convertedToProductAt: now
      }
      setCurrentRequest(updatedRequest)

      // Refresh history để hiển thị ngay
      if (activeTab === 'history') {
        fetchRequestHistory()
      }

      // Gọi callback nếu có
      if (onRequestUpdate) {
        onRequestUpdate(updatedRequest)
      }

      toast({
        title: 'Chuyển đổi thành công',
        description: `Đã tạo sản phẩm "${productData.name}" từ yêu cầu này. SKU: ${autoSku}`
      })

      setIsConvertToProductDialogOpen(false)

      // Có thể redirect đến trang sản phẩm
      // router.push(`/dashboard/products/${productRef.id}`)
    } catch (error) {
      console.error('Error converting request to product:', error)
      toast({
        title: 'Lỗi chuyển đổi',
        description:
          'Không thể chuyển đổi yêu cầu thành sản phẩm. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsConvertingToProduct(false)
    }
  }

  // Function để mở dialog chuyển đổi sản phẩm
  const openConvertToProductDialog = () => {
    setProductData({
      name: currentRequest.title || '',
      description: currentRequest.description || '',
      category: '',
      price: 0,
      cost: 0,
      sku: `PRD-${currentRequest.code}-${Date.now()}`
    })
    setIsConvertToProductDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-2xl font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateRequestTitle(tempTitle)
                    setIsEditingTitle(false)
                  }
                  if (e.key === 'Escape') {
                    setTempTitle(currentRequest.title || '')
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => {
                  updateRequestTitle(tempTitle)
                  setIsEditingTitle(false)
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTempTitle(currentRequest.title || '')
                  setIsEditingTitle(false)
                }}
              >
                ✕
              </Button>
            </div>
          ) : (
            <h1
              className="text-2xl font-bold flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              onClick={() => {
                setTempTitle(currentRequest.title || '')
                setIsEditingTitle(true)
              }}
            >
              {currentRequest.title}
              <Edit className="h-4 w-4 opacity-50" />
              <Badge variant="outline" className="ml-2">
                {currentRequest.code}
              </Badge>
            </h1>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Tạo lúc: {createdAtDate}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Cập nhật: {updatedAtDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn('px-3 py-1', getStatusColor(currentRequest.status))}
          >
            {currentRequest.productStatus?.name || currentRequest.status}
          </Badge>
          <Button variant="outline">Chỉnh sửa</Button>
          <Button variant="outline" onClick={openConvertToProductDialog}>
            Chuyển thành sản phẩm
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-6 md:w-[800px]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="workflow">Quy trình</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
          <TabsTrigger value="materials">Vật liệu</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mã yêu cầu
                    </p>
                    <p>{currentRequest.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </p>
                    {isEditingStatus ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={tempStatus}
                          onValueChange={(value) => {
                            setTempStatus(value)
                            updateRequestStatus(value)
                            setIsEditingStatus(false)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="in_progress">
                              Đang xử lý
                            </SelectItem>
                            <SelectItem value="completed">
                              Hoàn thành
                            </SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                            <SelectItem value="on_hold">Tạm dừng</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTempStatus(currentRequest.status || '')
                            setIsEditingStatus(false)
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'mt-1 cursor-pointer hover:opacity-80',
                            getStatusColor(currentRequest.status)
                          )}
                          onClick={() => {
                            setTempStatus(currentRequest.status || '')
                            setIsEditingStatus(true)
                          }}
                        >
                          {currentRequest.productStatus?.name ||
                            currentRequest.status}
                        </Badge>
                        <Edit
                          className="h-3 w-3 opacity-50 cursor-pointer"
                          onClick={() => {
                            setTempStatus(currentRequest.status || '')
                            setIsEditingStatus(true)
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ngày tiếp nhận
                    </p>
                    <p>{receiveDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hạn hoàn thành
                    </p>
                    <p>{deadline}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phòng ban
                    </p>
                    {isEditingDepartment ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempDepartment}
                          onChange={(e) => setTempDepartment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateRequestDepartment(tempDepartment)
                              setIsEditingDepartment(false)
                            }
                            if (e.key === 'Escape') {
                              setTempDepartment(
                                currentRequest.department ||
                                  currentRequest.creator?.department ||
                                  ''
                              )
                              setIsEditingDepartment(false)
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            updateRequestDepartment(tempDepartment)
                            setIsEditingDepartment(false)
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-2"
                        onClick={() => {
                          setTempDepartment(
                            currentRequest.department ||
                              currentRequest.creator?.department ||
                              ''
                          )
                          setIsEditingDepartment(true)
                        }}
                      >
                        {currentRequest.department ||
                          currentRequest.creator?.department ||
                          'Không có dữ liệu'}
                        <Edit className="h-3 w-3 opacity-50" />
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Độ ưu tiên
                    </p>
                    {isEditingPriority ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={tempPriority}
                          onValueChange={(value) => {
                            setTempPriority(value)
                            updateRequestPriority(value)
                            setIsEditingPriority(false)
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Thấp">Thấp</SelectItem>
                            <SelectItem value="Bình thường">
                              Bình thường
                            </SelectItem>
                            <SelectItem value="Cao">Cao</SelectItem>
                            <SelectItem value="Khẩn cấp">Khẩn cấp</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTempPriority(
                              currentRequest.priority || 'Bình thường'
                            )
                            setIsEditingPriority(false)
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <p
                        className="cursor-pointer hover:bg-gray-50 p-1 rounded flex items-center gap-2"
                        onClick={() => {
                          setTempPriority(
                            currentRequest.priority || 'Bình thường'
                          )
                          setIsEditingPriority(true)
                        }}
                      >
                        {currentRequest.priority || 'Bình thường'}
                        <Edit className="h-3 w-3 opacity-50" />
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Người liên quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {currentRequest.creator?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentRequest.creator?.fullName ||
                        currentRequest.creator?.name ||
                        'Không có dữ liệu'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Người tạo • {currentRequest.creator?.department || ''}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {currentRequest.assignee?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentRequest.assignee?.fullName ||
                        currentRequest.assignee?.name ||
                        'Chưa phân công'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Người được giao •{' '}
                      {currentRequest.assignee?.department || ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRequest.dataSource?.type === 'customer' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {currentRequest.dataSource?.name?.charAt(0) || 'K'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {currentRequest.dataSource?.name ||
                            'Không có dữ liệu'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ID:{' '}
                          {currentRequest.customerId ||
                            currentRequest.dataSource?.id}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      Xem chi tiết khách hàng
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Không có thông tin khách hàng
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Workflow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Tóm tắt quy trình
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ</span>
                    <span>{workflowProgress}%</span>
                  </div>
                  <Progress value={workflowProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Bước hiện tại
                    </p>
                    <p>{getCurrentStepName()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </p>
                    <p>
                      {currentRequest.currentStepStatus === 'in_progress'
                        ? 'Đang xử lý'
                        : currentRequest.currentStepStatus ||
                          'Không có dữ liệu'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('workflow')}
                >
                  Xem chi tiết quy trình
                </Button>
              </CardContent>
            </Card>

            {/* Thêm sau Workflow Summary Card và trước card hoàn thành */}
            {(currentRequest.status === 'rejected' ||
              currentRequest.status === 'on_hold') && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    {currentRequest.status === 'rejected'
                      ? 'Yêu cầu bị từ chối'
                      : 'Yêu cầu tạm dừng'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-yellow-700">
                    {currentRequest.status === 'rejected'
                      ? 'Yêu cầu này đã bị từ chối. Bạn có thể tiếp tục quy trình sau khi giải quyết các vấn đề được nêu.'
                      : 'Yêu cầu này đang tạm dừng. Bạn có thể tiếp tục quy trình khi sẵn sàng.'}
                  </p>

                  {/* Hiển thị lý do từ chối/tạm dừng gần nhất từ requestHistory */}
                  {(() => {
                    const latestRejectOrHold = requestHistory
                      .filter(
                        (entry: any) =>
                          (currentRequest.status === 'rejected' &&
                            entry.action === 'reject_step') ||
                          (currentRequest.status === 'on_hold' &&
                            entry.action === 'hold_step')
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )[0]

                    return (
                      latestRejectOrHold &&
                      latestRejectOrHold.metadata?.reason && (
                        <div className="p-3 bg-white border border-yellow-200 rounded-md">
                          <p className="text-sm font-medium text-yellow-800">
                            Lý do{' '}
                            {currentRequest.status === 'rejected'
                              ? 'từ chối'
                              : 'tạm dừng'}
                            :
                          </p>
                          <p className="text-sm text-gray-700">
                            {latestRejectOrHold.metadata.reason}
                          </p>
                        </div>
                      )
                    )
                  })()}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsContinueDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Tiếp tục quy trình
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('history')}
                    >
                      Xem lịch sử chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Thêm sau Workflow Summary Card */}
            {workflowProgress === 100 &&
              currentRequest.status !== 'converted_to_product' && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Quy trình hoàn thành
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-green-700">
                      Tất cả các bước trong quy trình đã được hoàn thành thành
                      công. Bạn có thể chuyển đổi yêu cầu này thành sản phẩm.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={openConvertToProductDialog}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Chuyển thành sản phẩm
                      </Button>
                      <Button variant="outline">Xuất báo cáo</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Hiển thị nếu đã chuyển thành sản phẩm */}
            {currentRequest.status === 'converted_to_product' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Package className="h-5 w-5" />
                    Đã chuyển thành sản phẩm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-700">
                    Yêu cầu này đã được chuyển đổi thành sản phẩm thành công.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Xem sản phẩm
                    </Button>
                    <Button variant="outline">Tạo yêu cầu mới</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    rows={4}
                    placeholder="Nhập mô tả..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        updateRequestDescription(tempDescription)
                        setIsEditingDescription(false)
                      }}
                    >
                      Lưu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTempDescription(currentRequest.description || '')
                        setIsEditingDescription(false)
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="prose max-w-none cursor-pointer hover:bg-gray-50 p-2 rounded flex items-start gap-2"
                  onClick={() => {
                    setTempDescription(currentRequest.description || '')
                    setIsEditingDescription(true)
                  }}
                >
                  <div className="flex-1">
                    {currentRequest.description || 'Không có mô tả'}
                  </div>
                  <Edit className="h-4 w-4 opacity-50 mt-1" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow">
          <div className="space-y-6">
            {/* Workflow Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Thông tin quy trình
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tên quy trình
                    </p>
                    <p>
                      {workflowData?.name ||
                        standardWorkflow?.name ||
                        'Không có dữ liệu'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Loại quy trình
                    </p>
                    <p>
                      {currentRequest.isUsingStandardWorkflow
                        ? 'Quy trình chuẩn'
                        : 'Quy trình tùy chỉnh'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Số bước hiển thị
                    </p>
                    <p>
                      {visibleSteps.length} bước (Tổng:{' '}
                      {standardWorkflow?.steps?.length || 0})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tiến độ
                    </p>
                    <p>{workflowProgress}%</p>
                  </div>
                </div>

                {workflowData?.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Mô tả quy trình
                    </p>
                    <p className="text-sm">{workflowData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Steps - Horizontal Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Các bước quy trình</CardTitle>
                <CardDescription>
                  {visibleSteps.length} bước • Tiến độ: {workflowProgress}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visibleSteps.length > 0 ? (
                  <div className="space-y-6">
                    {/* Horizontal Step Buttons */}
                    <div className="overflow-x-auto pb-4">
                      <div className="flex gap-4 min-w-max">
                        {visibleSteps.map((step: any, index: number) => {
                          const stepStatus = getStepStatus(step.id)
                          const isSelected = selectedStep?.id === step.id

                          return (
                            <div key={step.id} className="flex items-center">
                              <div
                                className={getStepButtonStyle(
                                  stepStatus,
                                  isSelected
                                )}
                                onClick={() => setSelectedStep(step)}
                              >
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  {stepStatus === 'completed' ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : stepStatus === 'in_progress' ? (
                                    <AlertCircle className="h-5 w-5" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                  <span className="font-medium">
                                    {step.name}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  {getStepStatusText(stepStatus)}
                                </div>
                              </div>
                              {index < visibleSteps.length - 1 && (
                                <ChevronRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selected Step Details */}
                    {(selectedStep ||
                      (visibleSteps.length > 0 &&
                        currentRequest.currentStepId)) &&
                      (() => {
                        const stepToShow =
                          selectedStep ||
                          visibleSteps.find(
                            (step: any) =>
                              step.id === currentRequest.currentStepId
                          )
                        return stepToShow ? (
                          <Card className="border-2 border-blue-200">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                {getStepStatus(stepToShow.id) ===
                                'completed' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : getStepStatus(stepToShow.id) ===
                                  'in_progress' ? (
                                  <AlertCircle className="h-5 w-5 text-orange-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-blue-600" />
                                )}
                                {stepToShow.name}
                                <Badge
                                  variant={
                                    getStepStatus(stepToShow.id) === 'completed'
                                      ? 'default'
                                      : getStepStatus(stepToShow.id) ===
                                          'in_progress'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {getStepStatusText(
                                    getStepStatus(stepToShow.id)
                                  )}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                Bước {stepToShow.order + 1} • ID:{' '}
                                {stepToShow.id}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {stepToShow.description && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Mô tả
                                  </p>
                                  <p className="text-sm">
                                    {stepToShow.description}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Vai trò thực hiện
                                  </p>
                                  {stepToShow.id ===
                                  currentRequest.currentStepId ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2 text-sm"
                                        onClick={() =>
                                          openAssigneeDialog(stepToShow)
                                        }
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="h-5 w-5">
                                            <AvatarFallback className="text-xs">
                                              {currentRequest.assignee?.name?.charAt(
                                                0
                                              ) || '?'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>
                                            {currentRequest.assignee?.name ||
                                              'Chưa có'}
                                          </span>
                                          <UserPlus className="h-3 w-3" />
                                        </div>
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-sm">
                                      {stepToShow.assigneeRole ||
                                        'Chưa phân công'}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Thời gian ước tính
                                  </p>
                                  <p className="text-sm">
                                    {stepToShow.estimatedTime || 2}{' '}
                                    {stepToShow.estimatedTimeUnit || 'ngày'} (
                                    {convertToHours(
                                      stepToShow.estimatedTime || 0,
                                      stepToShow.estimatedTimeUnit || 'days'
                                    )}{' '}
                                    giờ)
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Có thể bỏ qua
                                  </p>
                                  <p className="text-sm">
                                    {stepToShow.isOptional ? 'Có' : 'Không'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Bắt buộc
                                  </p>
                                  <p className="text-sm">
                                    {stepToShow.isRequired ? 'Có' : 'Không'}
                                  </p>
                                </div>
                              </div>

                              {/* Hiển thị các trường dữ liệu của bước */}
                              {stepToShow.fields &&
                                stepToShow.fields.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-3">
                                      Các trường dữ liệu
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {stepToShow.fields.map(
                                        (field: any, index: number) => {
                                          const fieldValue = getFieldValue(
                                            field.id,
                                            stepToShow.id
                                          )
                                          const isCurrentStep =
                                            stepToShow.id ===
                                            currentRequest.currentStepId

                                          return (
                                            <div
                                              key={field.id || index}
                                              className="p-3 bg-gray-50 rounded-lg"
                                            >
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">
                                                  {field.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  ({field.type})
                                                </span>
                                                {field.required && (
                                                  <span className="text-red-500 text-xs">
                                                    *
                                                  </span>
                                                )}
                                              </div>
                                              {field.description && (
                                                <p className="text-xs text-muted-foreground mb-2">
                                                  {field.description}
                                                </p>
                                              )}

                                              {isCurrentStep ? (
                                                field.type === 'date' ? (
                                                  <InlineEdit
                                                    value={
                                                      fieldValue
                                                        ? formatFieldValue(
                                                            field,
                                                            fieldValue
                                                          )
                                                        : ''
                                                    }
                                                    onSave={(value) =>
                                                      updateFieldValue(
                                                        field.id,
                                                        value
                                                      )
                                                    }
                                                    type="date"
                                                    placeholder={`Chọn ${field.name.toLowerCase()}`}
                                                  />
                                                ) : (
                                                  <InlineEdit
                                                    value={fieldValue}
                                                    onSave={(value) =>
                                                      updateFieldValue(
                                                        field.id,
                                                        value
                                                      )
                                                    }
                                                    type={
                                                      field.type === 'textarea'
                                                        ? 'textarea'
                                                        : 'text'
                                                    }
                                                    placeholder={`Nhập ${field.name.toLowerCase()}`}
                                                    multiline={
                                                      field.type === 'textarea'
                                                    }
                                                  />
                                                )
                                              ) : (
                                                <div className="mt-2 p-2 bg-white rounded border">
                                                  <span className="text-sm font-medium">
                                                    {stepToShow.id ===
                                                    currentRequest.currentStepId
                                                      ? fieldValue
                                                        ? formatFieldValue(
                                                            field,
                                                            fieldValue
                                                          )
                                                        : 'Chưa có dữ liệu'
                                                      : 'Dữ liệu sẽ có khi đến bước này'}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                            </CardContent>
                            {getStepStatus(stepToShow.id) === 'in_progress' && (
                              <CardFooter className="flex justify-between pt-4">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      openRejectDialog(stepToShow.id)
                                    }
                                    disabled={isCompletingStep}
                                    variant="destructive"
                                  >
                                    Từ chối
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      openHoldDialog(stepToShow.id)
                                    }
                                    disabled={isCompletingStep}
                                    variant="outline"
                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                  >
                                    Tạm dừng
                                  </Button>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleCompleteStep(stepToShow.id)
                                  }
                                  disabled={isCompletingStep}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {isCompletingStep
                                    ? 'Đang xử lý...'
                                    : 'Hoàn thành bước'}
                                </Button>
                              </CardFooter>
                            )}
                          </Card>
                        ) : null
                      })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Không có bước nào để hiển thị
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab - CẬP NHẬT ĐỂ SỬ DỤNG requestHistory */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Lịch sử thay đổi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Đang tải lịch sử...
                  </p>
                </div>
              ) : requestHistory.length > 0 ? (
                <div className="space-y-4">
                  {requestHistory.map((entry: any, index: number) => (
                    <div
                      key={entry.id || index}
                      className="flex items-start gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {entry.action === 'complete_step' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : entry.action === 'reject_step' ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : entry.action === 'hold_step' ? (
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        ) : entry.action === 'continue_workflow' ? (
                          <ArrowRight className="h-5 w-5 text-green-600" />
                        ) : entry.action === 'change_status' ? (
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        ) : entry.action === 'convert_to_product' ? (
                          <Package className="h-5 w-5 text-purple-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{entry.details}</p>
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.userName} •{' '}
                          {format(
                            new Date(entry.timestamp),
                            'dd/MM/yyyy HH:mm',
                            { locale: vi }
                          )}
                        </p>

                        {/* Hiển thị metadata nếu có */}
                        {entry.metadata && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            {entry.metadata.reason && (
                              <p>
                                <strong>Lý do:</strong> {entry.metadata.reason}
                              </p>
                            )}
                            {entry.metadata.stepName && (
                              <p>
                                <strong>Bước:</strong> {entry.metadata.stepName}
                              </p>
                            )}
                            {entry.metadata.assignee && (
                              <p>
                                <strong>Người thực hiện:</strong>{' '}
                                {entry.metadata.assignee.name}
                              </p>
                            )}
                            {entry.metadata.oldStatus &&
                              entry.metadata.newStatus && (
                                <p>
                                  <strong>Thay đổi trạng thái:</strong>{' '}
                                  {entry.metadata.oldStatus.name ||
                                    entry.metadata.oldStatus}{' '}
                                  →{' '}
                                  {entry.metadata.newStatus.name ||
                                    entry.metadata.newStatus}
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Chưa có lịch sử thay đổi nào
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-6">
            {/* Add Review Form */}
            <Card>
              <CardHeader>
                <CardTitle>Thêm đánh giá mới</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="review-title">Tiêu đề đánh giá</Label>
                    <Input
                      id="review-title"
                      value={newReview.title}
                      onChange={(e) =>
                        setNewReview({ ...newReview, title: e.target.value })
                      }
                      placeholder="Nhập tiêu đề đánh giá..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="review-type">Loại đánh giá</Label>
                    <Select
                      value={newReview.type}
                      onChange={(value) =>
                        setNewReview({ ...newReview, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Tổng quan</SelectItem>
                        <SelectItem value="design">Thiết kế</SelectItem>
                        <SelectItem value="quality">Chất lượng</SelectItem>
                        <SelectItem value="price">Giá cả</SelectItem>
                        <SelectItem value="timing">Thời gian</SelectItem>
                        <SelectItem value="service">Dịch vụ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Đánh giá sao</Label>
                  {renderStarRating(newReview.rating, true, (rating) =>
                    setNewReview({ ...newReview, rating })
                  )}
                </div>

                <div>
                  <Label htmlFor="review-content">Nội dung đánh giá</Label>
                  <Textarea
                    id="review-content"
                    value={newReview.content}
                    onChange={(e) =>
                      setNewReview({ ...newReview, content: e.target.value })
                    }
                    placeholder="Nhập nội dung đánh giá..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={newReview.isAnonymous}
                    onCheckedChange={(checked) =>
                      setNewReview({ ...newReview, isAnonymous: !!checked })
                    }
                  />
                  <Label htmlFor="anonymous">Đánh giá ẩn danh</Label>
                </div>

                <Button onClick={handleAddReview} disabled={isAddingReview}>
                  {isAddingReview ? 'Đang thêm...' : 'Thêm đánh giá'}
                </Button>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-muted-foreground mt-2">
                      Đang tải đánh giá...
                    </p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{review.title}</h4>
                              <Badge variant="outline">
                                {getReviewTypeLabel(review.type)}
                              </Badge>
                            </div>
                            {renderStarRating(review.rating)}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>
                              {review.isAnonymous
                                ? 'Ẩn danh'
                                : review.author?.name ||
                                  currentRequest.creator?.name ||
                                  'Khách hàng'}
                            </p>
                            <p>
                              {review.createdAt?.toDate
                                ? format(
                                    review.createdAt.toDate(),
                                    'dd/MM/yyyy HH:mm',
                                    { locale: vi }
                                  )
                                : 'Không có dữ liệu'}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{review.content}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <button
                            onClick={() =>
                              handleReviewReaction(review.id, 'like')
                            }
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            👍 {review.likes || 0}
                          </button>
                          <button
                            onClick={() =>
                              handleReviewReaction(review.id, 'dislike')
                            }
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            👎 {review.dislikes || 0}
                          </button>
                          <button
                            onClick={() =>
                              setReplyingTo(
                                replyingTo === review.id ? null : review.id
                              )
                            }
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Phản hồi
                          </button>
                        </div>

                        {/* Replies */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            {review.replies.map((reply: any) => (
                              <div key={reply.id} className="mb-3 last:mb-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {reply.author.name}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {reply.author.role}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(reply.createdAt),
                                      'dd/MM/yyyy HH:mm',
                                      { locale: vi }
                                    )}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === review.id && (
                          <div className="mt-4 pl-4 border-l-2 border-blue-200">
                            <Textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Nhập phản hồi..."
                              rows={3}
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddReply(review.id)}
                              >
                                Gửi phản hồi
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyingTo(null)}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Chưa có đánh giá nào
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hình ảnh yêu cầu
              </CardTitle>
              <CardDescription>
                Quản lý hình ảnh liên quan đến yêu cầu này
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Thêm hình ảnh
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Kéo thả hoặc click để chọn hình ảnh
                    </p>
                    <MultiImageUpload
                      currentImages={currentRequest.images || []}
                      onImagesChange={updateRequestImages}
                      maxImages={10}
                    />
                  </div>
                </div>

                {/* Current Images */}
                {currentRequest.images && currentRequest.images.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">
                      Hình ảnh hiện tại ({currentRequest.images.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentRequest.images.map(
                        (imageUrl: string, index: number) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={imageUrl || '/placeholder.svg'}
                                alt={`Hình ảnh ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newImages =
                                    currentRequest.images.filter(
                                      (_: any, i: number) => i !== index
                                    )
                                  updateRequestImages(newImages)
                                }}
                              >
                                Xóa
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {(!currentRequest.images ||
                  currentRequest.images.length === 0) && (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có hình ảnh nào
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Vật liệu yêu cầu
              </CardTitle>
              <CardDescription>
                Quản lý danh sách vật liệu cần thiết cho yêu cầu này
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Material Button */}
                <Button onClick={() => setIsAddMaterialDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vật liệu
                </Button>

                {/* Current Materials */}
                {selectedMaterials.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Danh sách vật liệu ({selectedMaterials.length})
                    </h4>
                    {selectedMaterials.map((material: any, index: number) => (
                      <div
                        key={material.id || index}
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{material.name}</h5>
                            <Badge variant="outline">{material.code}</Badge>
                            <Badge
                              variant={
                                material.type === 'material'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {material.type === 'material'
                                ? 'Vật liệu'
                                : 'Phụ kiện'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {material.description}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm">
                            <span>Đơn vị: {material.unit}</span>
                            <span>Tồn kho: {material.quantity || 0}</span>
                            <span>
                              Giá: {material.price?.toLocaleString() || 0} VND
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateMaterialQuantity(
                                material.id,
                                (material.requestedQuantity || 1) - 1
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">
                            {material.requestedQuantity || 1}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateMaterialQuantity(
                                material.id,
                                (material.requestedQuantity || 1) + 1
                              )
                            }
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              removeMaterialFromRequest(material.id)
                            }
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có vật liệu nào được chọn
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}

      {/* Assignee Dialog */}
      <Dialog
        open={isAssigneeDialogOpen}
        onOpenChange={setIsAssigneeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn người thực hiện</DialogTitle>
            <DialogDescription>
              Chọn người sẽ thực hiện bước này từ danh sách được phép
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingAssignees ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Đang tải danh sách...
                </p>
              </div>
            ) : availableAssignees.length > 0 ? (
              <RadioGroup
                value={selectedAssignee?.id || ''}
                onValueChange={(value) => {
                  const assignee = availableAssignees.find(
                    (a) => a.id === value
                  )
                  setSelectedAssignee(assignee || null)
                }}
              >
                {availableAssignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={assignee.id} id={assignee.id} />
                    <Label
                      htmlFor={assignee.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{assignee.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignee.department} • {assignee.role}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Không có người dùng nào được phép thực hiện bước này
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssigneeDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => updateAssignee(selectedAssignee)}
              disabled={!selectedAssignee}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog
        open={isAddMaterialDialogOpen}
        onOpenChange={setIsAddMaterialDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm vật liệu</DialogTitle>
            <DialogDescription>
              Chọn vật liệu cần thiết cho yêu cầu này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm vật liệu..."
                    value={materialSearchQuery}
                    onChange={(e) => setMaterialSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedMaterialType}
                onValueChange={setSelectedMaterialType}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="material">Vật liệu</SelectItem>
                  <SelectItem value="accessory">Phụ kiện</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Materials List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingMaterials ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-muted-foreground mt-2">
                    Đang tải vật liệu...
                  </p>
                </div>
              ) : filteredMaterials.length > 0 ? (
                <div className="space-y-2">
                  {filteredMaterials.map((material: any) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{material.name}</h5>
                          <Badge variant="outline">{material.code}</Badge>
                          <Badge
                            variant={
                              material.type === 'material'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {material.type === 'material'
                              ? 'Vật liệu'
                              : 'Phụ kiện'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {material.description}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span>Đơn vị: {material.unit}</span>
                          <span>Tồn kho: {material.quantity || 0}</span>
                          <span>
                            Giá: {material.price?.toLocaleString() || 0} VND
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addMaterialToRequest(material)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không tìm thấy vật liệu nào
                  </p>
                </div>
              )}
            </div>

            {/* Selected Materials Summary */}
            {selectedMaterials.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">
                  Đã chọn ({selectedMaterials.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedMaterials.map((material: any) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {material.name} x{material.requestedQuantity || 1}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMaterialFromRequest(material.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddMaterialDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={saveMaterialsToRequest}>
              Lưu danh sách vật liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Product Dialog */}
      <Dialog
        open={isConvertToProductDialogOpen}
        onOpenChange={setIsConvertToProductDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chuyển đổi thành sản phẩm</DialogTitle>
            <DialogDescription>
              Chuyển đổi yêu cầu này thành sản phẩm hoàn chỉnh trong hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-name">Tên sản phẩm *</Label>
                <Input
                  id="product-name"
                  value={productData.name}
                  onChange={(e) =>
                    setProductData({ ...productData, name: e.target.value })
                  }
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>
              <div>
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={productData.sku}
                  onChange={(e) =>
                    setProductData({ ...productData, sku: e.target.value })
                  }
                  placeholder="Mã sản phẩm (tự động tạo nếu để trống)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-description">Mô tả sản phẩm</Label>
              <Textarea
                id="product-description"
                value={productData.description}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    description: e.target.value
                  })
                }
                placeholder="Nhập mô tả sản phẩm..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-category">Danh mục</Label>
                <Input
                  id="product-category"
                  value={productData.category}
                  onChange={(e) =>
                    setProductData({ ...productData, category: e.target.value })
                  }
                  placeholder="Nhập danh mục sản phẩm..."
                />
              </div>
              <div>
                <Label htmlFor="product-price">Giá bán (VND)</Label>
                <Input
                  id="product-price"
                  type="number"
                  value={productData.price}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      price: Number(e.target.value)
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-cost">Giá vốn (VND)</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={productData.cost}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      cost: Number(e.target.value)
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Thông tin từ yêu cầu gốc</h4>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Mã yêu cầu:</strong> {currentRequest.code}
                </p>
                <p>
                  <strong>Người tạo:</strong> {currentRequest.creator?.name}
                </p>
                <p>
                  <strong>Phòng ban:</strong> {currentRequest.department}
                </p>
                <p>
                  <strong>Vật liệu:</strong>{' '}
                  {currentRequest.materials?.length || 0} loại
                </p>
                <p>
                  <strong>Hình ảnh:</strong>{' '}
                  {currentRequest.images?.length || 0} ảnh
                </p>
                <p>
                  <strong>Quy trình hoàn thành:</strong> {visibleSteps.length}{' '}
                  bước
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConvertToProductDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={convertRequestToProduct}
              disabled={isConvertingToProduct || !productData.name.trim()}
            >
              {isConvertingToProduct
                ? 'Đang chuyển đổi...'
                : 'Chuyển thành sản phẩm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối bước</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối bước này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Lý do từ chối *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={3}
              />
            </div>
            <div>
              <Label>Hình ảnh minh họa (tùy chọn)</Label>
              <MultiImageUpload
                currentImages={rejectImages}
                onImagesChange={setRejectImages}
                maxImages={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectStepWithReason(selectedStep?.id)}
              disabled={isSubmittingReject || !rejectReason.trim()}
            >
              {isSubmittingReject ? 'Đang xử lý...' : 'Từ chối bước'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hold Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạm dừng bước</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do tạm dừng bước này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hold-reason">Lý do tạm dừng *</Label>
              <Textarea
                id="hold-reason"
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Nhập lý do tạm dừng..."
                rows={3}
              />
            </div>
            <div>
              <Label>Hình ảnh minh họa (tùy chọn)</Label>
              <MultiImageUpload
                currentImages={holdImages}
                onImagesChange={setHoldImages}
                maxImages={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHoldDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleHoldStepWithReason(selectedStep?.id)}
              disabled={isSubmittingHold || !holdReason.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmittingHold ? 'Đang xử lý...' : 'Tạm dừng bước'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Continue Dialog */}
      <Dialog
        open={isContinueDialogOpen}
        onOpenChange={setIsContinueDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tiếp tục quy trình</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do tiếp tục quy trình sau khi bị{' '}
              {currentRequest.status === 'rejected' ? 'từ chối' : 'tạm dừng'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="continue-reason">Lý do tiếp tục *</Label>
              <Textarea
                id="continue-reason"
                value={continueReason}
                onChange={(e) => setContinueReason(e.target.value)}
                placeholder="Nhập lý do tiếp tục quy trình..."
                rows={3}
              />
            </div>
            <div>
              <Label>Hình ảnh minh họa (tùy chọn)</Label>
              <MultiImageUpload
                currentImages={continueImages}
                onImagesChange={setContinueImages}
                maxImages={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContinueDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleContinueWorkflow}
              disabled={isSubmittingContinue || !continueReason.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmittingContinue ? 'Đang xử lý...' : 'Tiếp tục quy trình'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
