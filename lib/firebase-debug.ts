// Hàm tiện ích để kiểm tra quyền truy cập Firebase
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"

export async function testFirebaseConnection() {
  console.log("Bắt đầu kiểm tra kết nối Firebase...")

  try {
    // Kiểm tra quyền đọc
    console.log("Kiểm tra quyền đọc...")
    const testCollection = collection(db, "test_connection")
    const snapshot = await getDocs(testCollection)
    console.log("Đọc thành công, số lượng documents:", snapshot.size)

    // Kiểm tra quyền ghi
    console.log("Kiểm tra quyền ghi...")
    const docData = {
      test: true,
      timestamp: serverTimestamp(),
      message: "Test connection",
    }

    const docRef = await addDoc(testCollection, docData)
    console.log("Ghi thành công, document ID:", docRef.id)

    return {
      success: true,
      message: "Kết nối Firebase thành công, có quyền đọc và ghi",
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối Firebase:", error)
    return {
      success: false,
      message: `Lỗi kết nối Firebase: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
      error,
    }
  }
}
