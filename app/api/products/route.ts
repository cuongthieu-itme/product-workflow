import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/products - Lấy danh sách sản phẩm
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Lọc sản phẩm theo query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limitParam = Number.parseInt(searchParams.get('limit') || '10')

    // Tạo query cơ bản
    const productsQuery = collection(db, 'products')
    const queryConstraints = []

    // Thêm các điều kiện lọc
    if (status) {
      queryConstraints.push(where('status', '==', status))
    }

    if (department) {
      queryConstraints.push(where('departments', 'array-contains', department))
    }

    // Thêm sắp xếp
    queryConstraints.push(orderBy('createdAt', 'desc'))

    // Tạo query với các điều kiện
    const q = query(productsQuery, ...queryConstraints)

    // Thực hiện query
    const snapshot = await getDocs(q)
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Phân trang
    const startIndex = (page - 1) * limitParam
    const endIndex = page * limitParam
    const paginatedProducts = products.slice(startIndex, endIndex)

    return NextResponse.json(paginatedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/products - Tạo sản phẩm mới
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate dữ liệu đầu vào
    if (!body.name || !body.description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      )
    }

    // Tạo sản phẩm mới
    const newProduct = {
      name: body.name,
      description: body.description,
      status: body.status || 'draft',
      currentStep: body.currentStep || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      departments: body.departments || ['product'],
      sku: body.sku || ''
    }

    // Thêm vào Firestore
    const docRef = await addDoc(collection(db, 'products'), newProduct)

    // Lấy dữ liệu vừa thêm
    const productWithId = {
      id: docRef.id,
      ...newProduct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(
      {
        success: true,
        data: productWithId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    )
  }
}
