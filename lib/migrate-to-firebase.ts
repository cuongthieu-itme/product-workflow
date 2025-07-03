import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Di chuyển dữ liệu từ localStorage sang Firestore
 * @param localStorageKey Khóa localStorage chứa dữ liệu
 * @param collectionName Tên collection trong Firestore
 * @param transform Hàm biến đổi dữ liệu trước khi lưu vào Firestore (tùy chọn)
 * @param useCustomIds Có sử dụng ID tùy chỉnh không (mặc định: true)
 */
export async function migrateToFirestore(
  localStorageKey: string,
  collectionName: string,
  transform?: (item: any) => any,
  useCustomIds = true
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    // Kiểm tra xem dữ liệu đã tồn tại trong Firestore chưa
    const existingDocs = await getDocs(collection(db, collectionName))
    if (!existingDocs.empty) {
      return {
        success: false,
        message: `Dữ liệu đã tồn tại trong collection ${collectionName}. Vui lòng xóa dữ liệu hiện có trước khi di chuyển.`,
        count: 0
      }
    }

    // Lấy dữ liệu từ localStorage
    const localData = localStorage.getItem(localStorageKey)
    if (!localData) {
      return {
        success: false,
        message: `Không tìm thấy dữ liệu trong localStorage với khóa ${localStorageKey}`,
        count: 0
      }
    }

    // Parse dữ liệu
    const items = JSON.parse(localData)
    if (!Array.isArray(items) && typeof items === 'object') {
      // Nếu là object đơn, chuyển thành mảng có một phần tử
      const singleItem = items
      await setDoc(
        doc(db, collectionName, singleItem.id || 'singleton'),
        transform ? transform(singleItem) : singleItem
      )
      return {
        success: true,
        message: `Đã di chuyển 1 đối tượng từ localStorage sang Firestore collection ${collectionName}`,
        count: 1
      }
    }

    // Nếu là mảng, di chuyển từng phần tử
    if (!Array.isArray(items)) {
      return {
        success: false,
        message: `Dữ liệu trong localStorage với khóa ${localStorageKey} không phải là mảng hoặc object`,
        count: 0
      }
    }

    // Di chuyển từng phần tử
    let count = 0
    for (const item of items) {
      const data = transform ? transform(item) : item

      if (useCustomIds && item.id) {
        // Sử dụng ID từ dữ liệu gốc
        await setDoc(doc(db, collectionName, item.id), data)
      } else {
        // Để Firestore tự tạo ID
        const docRef = collection(db, collectionName)
        await setDoc(doc(docRef), data)
      }
      count++
    }

    return {
      success: true,
      message: `Đã di chuyển ${count} bản ghi từ localStorage sang Firestore collection ${collectionName}`,
      count
    }
  } catch (error: any) {
    console.error(`Lỗi khi di chuyển dữ liệu: ${error.message}`, error)
    return {
      success: false,
      message: `Lỗi khi di chuyển dữ liệu: ${error.message}`,
      count: 0
    }
  }
}

/**
 * Xóa tất cả dữ liệu trong một collection
 * @param collectionName Tên collection cần xóa
 */
export async function clearFirestoreCollection(
  collectionName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const snapshot = await getDocs(collection(db, collectionName))

    if (snapshot.empty) {
      return {
        success: true,
        message: `Collection ${collectionName} đã trống.`
      }
    }

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    return {
      success: true,
      message: `Đã xóa ${snapshot.size} bản ghi từ collection ${collectionName}`
    }
  } catch (error: any) {
    console.error(`Lỗi khi xóa dữ liệu: ${error.message}`, error)
    return {
      success: false,
      message: `Lỗi khi xóa dữ liệu: ${error.message}`
    }
  }
}

/**
 * Kiểm tra xem dữ liệu đã được di chuyển sang Firestore chưa
 * @param collectionName Tên collection cần kiểm tra
 */
export async function checkFirestoreCollection(
  collectionName: string
): Promise<{ exists: boolean; count: number }> {
  try {
    const snapshot = await getDocs(collection(db, collectionName))
    return {
      exists: !snapshot.empty,
      count: snapshot.size
    }
  } catch (error) {
    console.error(`Lỗi khi kiểm tra collection: ${error}`)
    return {
      exists: false,
      count: 0
    }
  }
}
