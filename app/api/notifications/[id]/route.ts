import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

// Mô phỏng cơ sở dữ liệu
const notifications = [
  {
    id: '1',
    title: 'Yêu cầu phê duyệt thiết kế',
    message: "Sản phẩm 'Ghế Ergonomic Pro' cần được phê duyệt thiết kế",
    date: '2023-04-20T00:00:00.000Z',
    read: false,
    productId: '1',
    departments: ['design']
  },
  {
    id: '2',
    title: 'Cập nhật thông số kỹ thuật',
    message:
      "Cần cập nhật thông số kỹ thuật cho sản phẩm 'Đèn Bàn LED Thông Minh'",
    date: '2023-04-14T00:00:00.000Z',
    read: true,
    productId: '3',
    departments: ['product', 'operations']
  },
  {
    id: '3',
    title: 'Chiến dịch marketing đã bắt đầu',
    message:
      "Chiến dịch marketing cho sản phẩm 'Bàn Làm Việc Thông Minh' đã bắt đầu",
    date: '2023-05-05T00:00:00.000Z',
    read: false,
    productId: '2',
    departments: ['marketing', 'sales']
  }
]

// GET /api/notifications/[id] - Lấy thông tin thông báo theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notification = notifications.find((n) => n.id === params.id)

  if (!notification) {
    return NextResponse.json(
      { success: false, message: 'Notification not found' },
      { status: 404 }
    )
  }

  // Kiểm tra xem người dùng có quyền xem thông báo này không
  const userDepartment = session.user.department
  if (!notification.departments.includes(userDepartment)) {
    return NextResponse.json(
      { success: false, message: 'Access denied' },
      { status: 403 }
    )
  }

  return NextResponse.json({ success: true, data: notification })
}

// PATCH /api/notifications/[id] - Đánh dấu thông báo đã đọc
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notificationIndex = notifications.findIndex((n) => n.id === params.id)

  if (notificationIndex === -1) {
    return NextResponse.json(
      { success: false, message: 'Notification not found' },
      { status: 404 }
    )
  }

  // Kiểm tra xem người dùng có quyền cập nhật thông báo này không
  const userDepartment = session.user.department
  if (!notifications[notificationIndex].departments.includes(userDepartment)) {
    return NextResponse.json(
      { success: false, message: 'Access denied' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()

    // Cập nhật trạng thái đã đọc
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: body.read !== undefined ? body.read : true
    }

    return NextResponse.json({
      success: true,
      data: notifications[notificationIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// DELETE /api/notifications/[id] - Xóa thông báo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notificationIndex = notifications.findIndex((n) => n.id === params.id)

  if (notificationIndex === -1) {
    return NextResponse.json(
      { success: false, message: 'Notification not found' },
      { status: 404 }
    )
  }

  // Kiểm tra xem người dùng có quyền xóa thông báo này không
  const userDepartment = session.user.department
  if (
    !notifications[notificationIndex].departments.includes(userDepartment) &&
    session.user.role !== 'admin'
  ) {
    return NextResponse.json(
      { success: false, message: 'Access denied' },
      { status: 403 }
    )
  }

  // Xóa thông báo
  notifications.splice(notificationIndex, 1)

  return NextResponse.json({
    success: true,
    message: 'Notification deleted successfully'
  })
}
