import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

// Mô phỏng cơ sở dữ liệu
const notifications = [
  {
    id: "1",
    title: "Yêu cầu phê duyệt thiết kế",
    message: "Sản phẩm 'Ghế Ergonomic Pro' cần được phê duyệt thiết kế",
    date: "2023-04-20T00:00:00.000Z",
    read: false,
    productId: "1",
    departments: ["design"],
  },
  {
    id: "2",
    title: "Cập nhật thông số kỹ thuật",
    message: "Cần cập nhật thông số kỹ thuật cho sản phẩm 'Đèn Bàn LED Thông Minh'",
    date: "2023-04-14T00:00:00.000Z",
    read: true,
    productId: "3",
    departments: ["product", "operations"],
  },
  {
    id: "3",
    title: "Chiến dịch marketing đã bắt đầu",
    message: "Chiến dịch marketing cho sản phẩm 'Bàn Làm Việc Thông Minh' đã bắt đầu",
    date: "2023-05-05T00:00:00.000Z",
    read: false,
    productId: "2",
    departments: ["marketing", "sales"],
  },
]

// GET /api/notifications - Lấy danh sách thông báo
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Lọc thông báo theo department của người dùng
  const userDepartment = session.user.department

  let filteredNotifications = notifications.filter((notification) => notification.departments.includes(userDepartment))

  // Lọc theo query params
  const { searchParams } = new URL(request.url)
  const read = searchParams.get("read")
  const productId = searchParams.get("productId")

  if (read !== null) {
    const isRead = read === "true"
    filteredNotifications = filteredNotifications.filter((notification) => notification.read === isRead)
  }

  if (productId) {
    filteredNotifications = filteredNotifications.filter((notification) => notification.productId === productId)
  }

  // Sắp xếp theo thời gian, mới nhất lên đầu
  filteredNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Phân trang
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

  return NextResponse.json({
    success: true,
    data: paginatedNotifications,
    pagination: {
      total: filteredNotifications.length,
      page,
      limit,
      pages: Math.ceil(filteredNotifications.length / limit),
    },
  })
}

// POST /api/notifications - Tạo thông báo mới
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate dữ liệu đầu vào
    if (!body.title || !body.message || !body.productId || !body.departments) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Tạo thông báo mới
    const newNotification = {
      id: Date.now().toString(),
      title: body.title,
      message: body.message,
      date: new Date().toISOString(),
      read: false,
      productId: body.productId,
      departments: body.departments,
    }

    notifications.push(newNotification)

    return NextResponse.json(
      {
        success: true,
        data: newNotification,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })
  }
}
