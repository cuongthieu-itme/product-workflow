import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Danh sách các collection liên quan đến quy trình
const WORKFLOW_COLLECTIONS = [
  'workflows',
  'standardWorkflows',
  'subWorkflows',
  'workflowProcesses',
  'workflowChangeHistory',
  'availableVariables'
]

// Kiểm tra kết nối với tất cả các collection
export async function checkWorkflowCollections() {
  const results: Record<
    string,
    { exists: boolean; count: number; error?: string }
  > = {}

  for (const collectionName of WORKFLOW_COLLECTIONS) {
    try {
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)

      results[collectionName] = {
        exists: true,
        count: snapshot.size
      }

      console.log(`Collection ${collectionName}: ${snapshot.size} documents`)
    } catch (error: any) {
      console.error(`Error checking collection ${collectionName}:`, error)
      results[collectionName] = {
        exists: false,
        count: 0,
        error: error.message
      }
    }
  }

  return results
}

// Khởi tạo tất cả các collection nếu chưa tồn tại
export async function initializeWorkflowCollections() {
  const results = await checkWorkflowCollections()
  const initializedCollections: string[] = []

  for (const collectionName of WORKFLOW_COLLECTIONS) {
    if (
      !results[collectionName]?.exists ||
      results[collectionName]?.count === 0
    ) {
      try {
        // Tạo collection với một document mẫu
        const collectionRef = collection(db, collectionName)

        // Tạo dữ liệu mẫu tùy theo loại collection
        let sampleData: any = {
          name: `${collectionName} Sample`,
          description: `Sample document for ${collectionName}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        // Thêm các trường đặc biệt tùy theo loại collection
        switch (collectionName) {
          case 'workflows':
            sampleData = {
              ...sampleData,
              statusId: 'sample-status',
              steps: [],
              createdBy: 'system',
              status: 'active'
            }
            break

          case 'standardWorkflows':
            sampleData = {
              ...sampleData,
              steps: [],
              version: 1,
              lastModifiedBy: 'system'
            }
            // Sử dụng setDoc với ID cố định cho standardWorkflows
            await setDoc(
              doc(db, collectionName, 'standard-workflow'),
              sampleData
            )
            initializedCollections.push(collectionName)
            continue // Bỏ qua addDoc bên dưới

          case 'subWorkflows':
            sampleData = {
              ...sampleData,
              parentId: 'standard-workflow',
              statusId: 'sample-status',
              visibleSteps: [],
              stepEstimatedTimes: {}
            }
            break

          case 'workflowProcesses':
            sampleData = {
              ...sampleData,
              statusId: 'sample-status',
              steps: []
            }
            break

          case 'workflowChangeHistory':
            sampleData = {
              ...sampleData,
              workflowId: 'standard-workflow',
              changeType: 'create',
              entityType: 'workflow',
              entityId: 'sample-entity',
              changes: [{ field: 'name', newValue: 'Sample' }],
              changedBy: 'system',
              changedAt: serverTimestamp()
            }
            break

          case 'availableVariables':
            sampleData = {
              ...sampleData,
              source: 'system',
              type: 'text'
            }
            break
        }

        // Thêm document mẫu
        await addDoc(collectionRef, sampleData)
        initializedCollections.push(collectionName)

        console.log(`Initialized collection ${collectionName} with sample data`)
      } catch (error) {
        console.error(`Error initializing collection ${collectionName}:`, error)
      }
    }
  }

  return initializedCollections
}

// Kiểm tra quyền truy cập
export async function checkFirebaseAccess() {
  try {
    // Thử đọc một collection
    const testRef = collection(db, 'test_access')
    await getDocs(testRef)

    // Thử ghi một document
    const testDoc = await addDoc(testRef, {
      test: true,
      timestamp: serverTimestamp()
    })

    return { read: true, write: true }
  } catch (error: any) {
    console.error('Firebase access check failed:', error)

    // Phân tích lỗi để xác định quyền nào bị từ chối
    const errorMessage = error.message || ''
    const isPermissionDenied = errorMessage.includes('permission-denied')

    if (isPermissionDenied) {
      return {
        read: !errorMessage.includes('get'),
        write: !errorMessage.includes('add')
      }
    }

    return { read: false, write: false, error: errorMessage }
  }
}
