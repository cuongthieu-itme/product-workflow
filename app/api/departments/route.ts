import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// Mô phỏng cơ sở dữ liệu
const departments = [
  {
    id: 'product',
    name: 'Phòng Sản Phẩm',
    description: 'Quản lý và phát triển sản phẩm',
    manager: '1',
    members: ['1', '4', '7'],
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'design',
    name: 'Phòng Thiết Kế',
    description: 'Thiết kế và phát triển mẫu sản phẩm',
    manager: '2',
    members: ['2', '5', '8'],
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'marketing',
    name: 'Phòng Marketing',
    description: 'Quản lý chiến dịch marketing và truyền thông',
    manager: '3',
    members: ['3', '6', '9'],
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'sales',
    name: 'Phòng Kinh Doanh',
    description: 'Quản lý bán hàng và khách hàng',
    manager: '10',
    members: ['10', '11', '12'],
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'operations',
    name: 'Phòng Vận Hành',
    description: 'Quản lý vận hành và sản xuất',
    manager: '13',
    members: ['13', '14', '15'],
    createdAt: '2023-01-01T00:00:00.000Z'
  }
]

// GET /api/departments - Lấy danh sách phòng ban
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    data: departments
  })
}

// POST /api/departments - Tạo phòng ban mới (chỉ admin)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Kiểm tra quyền admin
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Admin permission required' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()

    // Validate dữ liệu đầu vào
    if (!body.id || !body.name || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Kiểm tra ID đã tồn tại chưa
    if (departments.some((dept) => dept.id === body.id)) {
      return NextResponse.json(
        { success: false, message: 'Department ID already exists' },
        { status: 400 }
      )
    }

    // Tạo phòng ban mới
    const newDepartment = {
      id: body.id,
      name: body.name,
      description: body.description,
      manager: body.manager || null,
      members: body.members || [],
      createdAt: new Date().toISOString()
    }

    departments.push(newDepartment)

    return NextResponse.json(
      {
        success: true,
        data: newDepartment
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }
}
