import { NextResponse } from 'next/server'
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('📖 Fetching customer:', id)

    const docRef = doc(db, 'customers', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    const customer = {
      id: docSnap.id,
      ...docSnap.data()
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('❌ Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy thông tin khách hàng' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    console.log('📝 Updating customer:', id, body)

    // Kiểm tra khách hàng có tồn tại không
    const docRef = doc(db, 'customers', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    // Kiểm tra trùng số điện thoại nếu có thay đổi
    if (body.phone) {
      const customersRef = collection(db, 'customers')
      const phoneQuery = query(customersRef, where('phone', '==', body.phone))
      const phoneSnapshot = await getDocs(phoneQuery)

      const existingCustomers = phoneSnapshot.docs.filter(
        (doc) => doc.id !== id
      )
      if (existingCustomers.length > 0) {
        return NextResponse.json(
          { error: `Số điện thoại ${body.phone} đã tồn tại trong hệ thống` },
          { status: 400 }
        )
      }
    }

    const updatedData = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(docRef, updatedData)
    console.log('✅ Customer updated successfully')

    return NextResponse.json({
      id,
      ...updatedData
    })
  } catch (error) {
    console.error('❌ Error updating customer:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật khách hàng' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log('🗑️ Deleting customer:', id)

    // Kiểm tra khách hàng có tồn tại không
    const docRef = doc(db, 'customers', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      )
    }

    await deleteDoc(docRef)
    console.log('✅ Customer deleted successfully')

    return NextResponse.json({ message: 'Xóa khách hàng thành công' })
  } catch (error) {
    console.error('❌ Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa khách hàng' },
      { status: 500 }
    )
  }
}
