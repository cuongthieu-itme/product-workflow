import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { historyService } from '@/lib/history-service' // Import the history service

// GET /api/products/[id]/steps - Lấy các bước trong quy trình của sản phẩm
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Kiểm tra sản phẩm tồn tại
    const productRef = doc(db, 'products', params.id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Lấy các bước của sản phẩm
    const stepsRef = collection(db, 'products', params.id, 'steps')
    const stepsSnap = await getDocs(stepsRef)

    const steps = stepsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json({ success: true, data: steps })
  } catch (error) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch steps' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/steps - Cập nhật trạng thái của bước trong quy trình
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { stepId, status } = body

    if (!stepId || !status) {
      return NextResponse.json(
        { success: false, message: 'Step ID and status are required' },
        { status: 400 }
      )
    }

    // Kiểm tra sản phẩm tồn tại
    const productRef = doc(db, 'products', params.id)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    // Kiểm tra bước tồn tại
    const stepRef = doc(db, 'products', params.id, 'steps', stepId)
    const stepSnap = await getDoc(stepRef)

    if (!stepSnap.exists()) {
      return NextResponse.json(
        { success: false, message: 'Step not found' },
        { status: 404 }
      )
    }

    // Cập nhật trạng thái của bước
    const updateData: any = { status }

    // Thêm thời gian hoàn thành nếu trạng thái là completed
    if (status === 'completed') {
      updateData.completedAt = serverTimestamp()

      // Lấy thông tin người dùng từ session
      const user = session.user

      // Tạo bản ghi lịch sử mới
      const historyEntry = {
        requestId: params.id,
        stepId: stepId,
        status: status,
        completedAt: serverTimestamp(),
        userId: user?.id || 'system', // Use a default user ID if session doesn't have it
        userName: user?.name || 'System',
        userEmail: user?.email || '',
        details: `Step ${stepSnap.data().name} completed`
      }

      // Thêm bản ghi vào collection requestHistory using the history service
      await historyService.addHistory(historyEntry)
    }

    // Thêm thời gian bắt đầu nếu trạng thái là in_progress
    if (status === 'in_progress') {
      updateData.startedAt = serverTimestamp()
    }

    await updateDoc(stepRef, updateData)

    // Cập nhật currentStep của sản phẩm nếu bước hiện tại đã hoàn thành
    const productData = productSnap.data()
    if (
      status === 'completed' &&
      productData.currentStep === stepSnap.data().order
    ) {
      const stepStatuses = [
        'draft',
        'review',
        'design',
        'production',
        'marketing',
        'launch',
        'completed'
      ]
      await updateDoc(productRef, {
        currentStep: productData.currentStep + 1,
        status: stepStatuses[productData.currentStep + 1] || productData.status,
        updatedAt: serverTimestamp()
      })
    }

    // Lấy dữ liệu sau khi cập nhật
    const updatedStepSnap = await getDoc(stepRef)
    const updatedProductSnap = await getDoc(productRef)

    return NextResponse.json({
      success: true,
      data: {
        step: {
          id: updatedStepSnap.id,
          ...updatedStepSnap.data()
        },
        product: {
          id: updatedProductSnap.id,
          ...updatedProductSnap.data()
        }
      }
    })
  } catch (error) {
    console.error('Error updating step:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update step' },
      { status: 500 }
    )
  }
}
