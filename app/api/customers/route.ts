import { NextResponse } from "next/server"
import { collection, getDocs, addDoc, orderBy, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    const customersRef = collection(db, "customers")
    const q = query(customersRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)

    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu khách hàng" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📝 Received customer data:", body)

    // Validation
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: "Tên và số điện thoại là bắt buộc" }, { status: 400 })
    }

    // Kiểm tra trùng số điện thoại
    const customersRef = collection(db, "customers")
    const phoneQuery = query(customersRef, where("phone", "==", body.phone))
    const phoneSnapshot = await getDocs(phoneQuery)

    if (!phoneSnapshot.empty) {
      return NextResponse.json({ error: `Số điện thoại ${body.phone} đã tồn tại trong hệ thống` }, { status: 400 })
    }

    const now = new Date().toISOString()

    const customerData = {
      ...body,
      createdAt: now,
      updatedAt: now,
    }

    console.log("💾 Saving to Firebase:", customerData)
    const docRef = await addDoc(collection(db, "customers"), customerData)
    console.log("✅ Customer saved with ID:", docRef.id)

    return NextResponse.json(
      {
        id: docRef.id,
        ...customerData,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error adding customer:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Lỗi khi thêm khách hàng",
      },
      { status: 500 },
    )
  }
}
