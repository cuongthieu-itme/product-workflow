import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'

/**
 * Script di chuyển dữ liệu từ collection workflows sang subWorkflows
 * Chạy script này một lần để di chuyển dữ liệu
 */
export async function migrateWorkflowsToSubWorkflows() {
  try {
    console.log('Bắt đầu di chuyển dữ liệu từ workflows sang subWorkflows...')

    // Lấy dữ liệu từ collection workflows
    const workflowsRef = collection(db, 'workflows')
    const workflowsSnapshot = await getDocs(workflowsRef)

    if (workflowsSnapshot.empty) {
      console.log('Không có dữ liệu trong collection workflows.')
      return { success: true, message: 'Không có dữ liệu cần di chuyển.' }
    }

    // Lấy quy trình chuẩn để tham chiếu các bước
    const standardWorkflowRef = collection(db, 'standardWorkflows')
    const standardWorkflowSnapshot = await getDocs(standardWorkflowRef)

    if (standardWorkflowSnapshot.empty) {
      console.log(
        'Không tìm thấy quy trình chuẩn. Cần có quy trình chuẩn để di chuyển dữ liệu.'
      )
      return { success: false, message: 'Không tìm thấy quy trình chuẩn.' }
    }

    const standardWorkflow = standardWorkflowSnapshot.docs[0].data()
    const standardSteps = standardWorkflow.steps || []

    // Tạo batch để thực hiện nhiều thao tác cùng lúc
    const batch = writeBatch(db)

    // Đếm số lượng quy trình đã di chuyển
    let migratedCount = 0

    // Di chuyển từng quy trình
    for (const workflowDoc of workflowsSnapshot.docs) {
      const workflowData = workflowDoc.data()

      // Kiểm tra xem quy trình đã tồn tại trong subWorkflows chưa
      const subWorkflowsRef = collection(db, 'subWorkflows')
      const subWorkflowsQuery = await getDocs(subWorkflowsRef)
      const existingSubWorkflow = subWorkflowsQuery.docs.find(
        (doc) => doc.data().statusId === workflowData.statusId
      )

      if (existingSubWorkflow) {
        console.log(
          `Quy trình cho trạng thái ${workflowData.statusId} đã tồn tại trong subWorkflows.`
        )
        continue
      }

      // Tạo visibleSteps từ các bước trong workflow
      const visibleSteps =
        workflowData.steps
          ?.map((step) => {
            // Tìm bước tương ứng trong quy trình chuẩn
            const standardStep = standardSteps.find(
              (s) => s.name === step.name || s.description === step.description
            )

            return standardStep ? standardStep.id : null
          })
          .filter(Boolean) || []

      // Tạo dữ liệu cho subWorkflow mới
      const newSubWorkflowRef = doc(collection(db, 'subWorkflows'))

      batch.set(newSubWorkflowRef, {
        name: workflowData.name,
        description: workflowData.description,
        statusId: workflowData.statusId,
        statusName: workflowData.statusName || '',
        parentWorkflowId: 'standard-workflow', // Mặc định sử dụng quy trình chuẩn làm cha
        visibleSteps: visibleSteps,
        createdAt: workflowData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: workflowData.createdBy || 'system'
      })

      // Cập nhật trạng thái sản phẩm để liên kết với subWorkflow mới
      if (workflowData.statusId) {
        const productStatusRef = doc(
          db,
          'productStatuses',
          workflowData.statusId
        )
        const productStatusSnap = await getDoc(productStatusRef)

        if (productStatusSnap.exists()) {
          batch.update(productStatusRef, {
            workflowId: newSubWorkflowRef.id,
            updatedAt: serverTimestamp()
          })
        }
      }

      migratedCount++
    }

    // Thực hiện batch
    if (migratedCount > 0) {
      await batch.commit()
      console.log(
        `Đã di chuyển ${migratedCount} quy trình từ workflows sang subWorkflows.`
      )
    } else {
      console.log('Không có quy trình nào cần di chuyển.')
    }

    return {
      success: true,
      message: `Đã di chuyển ${migratedCount} quy trình từ workflows sang subWorkflows.`
    }
  } catch (error) {
    console.error('Lỗi khi di chuyển dữ liệu:', error)
    return {
      success: false,
      message: `Lỗi khi di chuyển dữ liệu: ${error.message}`
    }
  }
}

/**
 * Xóa collection workflows sau khi đã di chuyển dữ liệu thành công
 * Chỉ nên gọi hàm này sau khi đã kiểm tra dữ liệu đã được di chuyển thành công
 */
export async function deleteWorkflowsCollection() {
  try {
    console.log('Bắt đầu xóa collection workflows...')

    // Lấy tất cả documents trong collection workflows
    const workflowsRef = collection(db, 'workflows')
    const workflowsSnapshot = await getDocs(workflowsRef)

    if (workflowsSnapshot.empty) {
      console.log('Collection workflows đã trống.')
      return { success: true, message: 'Collection workflows đã trống.' }
    }

    // Tạo batch để xóa nhiều documents cùng lúc
    const batch = writeBatch(db)

    // Thêm các thao tác xóa vào batch
    workflowsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // Thực hiện batch
    await batch.commit()

    console.log(
      `Đã xóa ${workflowsSnapshot.size} documents từ collection workflows.`
    )

    return {
      success: true,
      message: `Đã xóa ${workflowsSnapshot.size} documents từ collection workflows.`
    }
  } catch (error) {
    console.error('Lỗi khi xóa collection workflows:', error)
    return {
      success: false,
      message: `Lỗi khi xóa collection workflows: ${error.message}`
    }
  }
}
