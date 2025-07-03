import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

// Mô phỏng cơ sở dữ liệu
const reports = [
  {
    id: '1',
    title: 'Báo cáo tiến độ phát triển sản phẩm Q2/2023',
    type: 'product',
    createdAt: '2023-06-30T00:00:00.000Z',
    createdBy: '1',
    data: {
      totalProducts: 24,
      newProducts: 8,
      inDevelopment: 12,
      launched: 4,
      byDepartment: {
        product: 24,
        design: 18,
        marketing: 10,
        sales: 6,
        operations: 8
      },
      byStatus: {
        draft: 4,
        review: 2,
        design: 6,
        production: 4,
        marketing: 4,
        launch: 2,
        completed: 2
      }
    }
  },
  {
    id: '2',
    title: 'Báo cáo hiệu quả marketing Q2/2023',
    type: 'marketing',
    createdAt: '2023-06-30T00:00:00.000Z',
    createdBy: '3',
    data: {
      totalCampaigns: 12,
      activeCampaigns: 5,
      completedCampaigns: 7,
      totalBudget: 250000000,
      spentBudget: 180000000,
      roi: 2.4,
      byChannel: {
        social: 5,
        email: 3,
        website: 2,
        offline: 2
      }
    }
  },
  {
    id: '3',
    title: 'Báo cáo hiệu suất sản phẩm Q2/2023',
    type: 'product',
    createdAt: '2023-06-30T00:00:00.000Z',
    createdBy: '1',
    data: {
      totalProducts: 10,
      averageDevelopmentTime: 45, // days
      averageTimeToMarket: 60, // days
      delayedProducts: 2,
      onTimeProducts: 8,
      byCategory: {
        furniture: 4,
        electronics: 3,
        accessories: 3
      }
    }
  }
]

// GET /api/reports - Lấy danh sách báo cáo
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Lọc báo cáo theo query params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  let filteredReports = [...reports]

  if (type) {
    filteredReports = filteredReports.filter((report) => report.type === type)
  }

  // Sắp xếp theo thời gian, mới nhất lên đầu
  filteredReports.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Phân trang
  const page = Number.parseInt(searchParams.get('page') || '1')
  const limit = Number.parseInt(searchParams.get('limit') || '10')
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  return NextResponse.json({
    success: true,
    data: paginatedReports,
    pagination: {
      total: filteredReports.length,
      page,
      limit,
      pages: Math.ceil(filteredReports.length / limit)
    }
  })
}

// POST /api/reports - Tạo báo cáo mới
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate dữ liệu đầu vào
    if (!body.title || !body.type || !body.data) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Tạo báo cáo mới
    const newReport = {
      id: Date.now().toString(),
      title: body.title,
      type: body.type,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
      data: body.data
    }

    reports.push(newReport)

    return NextResponse.json(
      {
        success: true,
        data: newReport
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
