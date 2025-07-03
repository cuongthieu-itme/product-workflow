import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore'

// Tạo quy trình con mới
export const createSubWorkflow = async (subWorkflowData: any) => {
  try {
    // Kiểm tra xem trạng thái đã có quy trình con chưa
    if (subWorkflowData.statusId) {
      // Kiểm tra trực tiếp từ trạng thái sản phẩm
      const statusRef = doc(db, 'productStatuses', subWorkflowData.statusId)
      const statusDoc = await getDoc(statusRef)

      if (statusDoc.exists()) {
        const statusData = statusDoc.data()
        console.log(`Status ${subWorkflowData.statusId} data:`, statusData)

        // Kiểm tra xem trạng thái có workflowId không và khác với quy trình chuẩn
        if (
          statusData.workflowId &&
          statusData.workflowId !== 'standard-workflow'
        ) {
          console.log(
            `Status ${subWorkflowData.statusId} already has workflowId: ${statusData.workflowId}`
          )
          return {
            success: false,
            message: `Trạng thái đã có quy trình con được gán (ID: ${statusData.workflowId}).`
          }
        }
      }

      // Kiểm tra trong collection subWorkflows
      const q = query(
        collection(db, 'subWorkflows'),
        where('statusId', '==', subWorkflowData.statusId)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const existingWorkflow = querySnapshot.docs[0].data()
        console.log(
          `Found existing sub-workflow for status ${subWorkflowData.statusId}:`,
          existingWorkflow
        )
        return {
          success: false,
          message: `Trạng thái đã có quy trình con "${existingWorkflow.name || 'không xác định'}" được gán.`
        }
      }
    }

    // Tạo ID mới
    const id = doc(collection(db, 'subWorkflows')).id

    // Chuẩn bị dữ liệu
    const newSubWorkflow = {
      ...subWorkflowData,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // Lưu vào Firestore collection subWorkflows
    await setDoc(doc(db, 'subWorkflows', id), newSubWorkflow)

    // Cập nhật trạng thái với ID quy trình con
    if (subWorkflowData.statusId) {
      await updateStatusWithWorkflow(subWorkflowData.statusId, id)
    }

    return {
      success: true,
      id,
      message: 'Đã tạo quy trình con thành công.'
    }
  } catch (error) {
    console.error('Error creating sub-workflow:', error)
    return {
      success: false,
      message:
        'Lỗi khi tạo quy trình con: ' +
        (error instanceof Error ? error.message : String(error))
    }
  }
}

// Cập nhật quy trình con
export const updateSubWorkflow = async (id: string, updates: any) => {
  try {
    // Nếu đang cập nhật statusId, kiểm tra xem trạng thái mới đã có quy trình con chưa
    if (updates.statusId) {
      // Lấy quy trình con hiện tại để biết statusId cũ
      const docRef = doc(db, 'subWorkflows', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const currentData = docSnap.data()

        // Nếu đang thay đổi sang trạng thái khác (không phải trạng thái hiện tại)
        if (currentData.statusId !== updates.statusId) {
          // Kiểm tra trực tiếp từ trạng thái sản phẩm
          const statusRef = doc(db, 'productStatuses', updates.statusId)
          const statusDoc = await getDoc(statusRef)

          if (statusDoc.exists()) {
            const statusData = statusDoc.data()

            // Kiểm tra xem trạng thái có workflowId không
            if (statusData.workflowId) {
              console.log(
                `Status ${updates.statusId} already has workflowId: ${statusData.workflowId}`
              )
              throw new Error('Trạng thái đã có quy trình con')
            }
          }
        }
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    // Cập nhật trong Firestore collection subWorkflows
    await updateDoc(doc(db, 'subWorkflows', id), updateData)

    // Cập nhật trạng thái với ID quy trình con nếu statusId thay đổi
    if (updates.statusId) {
      await updateStatusWithWorkflow(updates.statusId, id)
    }
  } catch (error) {
    console.error('Error updating sub-workflow:', error)
    throw error
  }
}

// Xóa quy trình con
export const deleteSubWorkflow = async (id: string) => {
  try {
    // Lấy thông tin quy trình con để biết statusId
    const docRef = doc(db, 'subWorkflows', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const subWorkflowData = docSnap.data()

      // Xóa workflowId khỏi trạng thái
      if (subWorkflowData.statusId) {
        const statusRef = doc(db, 'productStatuses', subWorkflowData.statusId)
        await updateDoc(statusRef, {
          workflowId: null,
          updatedAt: serverTimestamp()
        })
      }
    }

    // Xóa khỏi Firestore collection subWorkflows
    await deleteDoc(doc(db, 'subWorkflows', id))
  } catch (error) {
    console.error('Error deleting sub-workflow:', error)
    throw error
  }
}

// Lấy quy trình con theo ID quy trình cha
export const getSubWorkflowsByWorkflowProcessId = async (
  workflowProcessId: string
) => {
  try {
    const q = query(
      collection(db, 'subWorkflows'),
      where('parentWorkflowId', '==', workflowProcessId)
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data()
      }
    })
  } catch (error) {
    console.error('Error getting sub-workflows by workflow process ID:', error)
    throw error
  }
}

// Cập nhật trạng thái với ID quy trình con
export const updateStatusWithWorkflow = async (
  statusId: string,
  workflowId: string
) => {
  try {
    const statusRef = doc(db, 'productStatuses', statusId)
    await updateDoc(statusRef, {
      workflowId: workflowId,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating status with workflow ID:', error)
    throw error
  }
}

// Kiểm tra xem trạng thái đã có quy trình con chưa
export const checkStatusHasWorkflow = async (statusId: string) => {
  try {
    console.log('Checking if status has workflow:', statusId)

    // Kiểm tra trực tiếp từ trạng thái sản phẩm
    const statusRef = doc(db, 'productStatuses', statusId)
    const statusDoc = await getDoc(statusRef)

    if (statusDoc.exists()) {
      const statusData = statusDoc.data()
      console.log(`Status ${statusId} data:`, statusData)

      // Kiểm tra xem trạng thái có workflowId không
      if (statusData.workflowId) {
        console.log(
          `Status ${statusId} has workflowId: ${statusData.workflowId}`
        )
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking if status has workflow:', error)
    return false
  }
}

// Kiểm tra xem trạng thái đã có quy trình con chưa (kiểm tra trong collection subWorkflows)
export const checkStatusHasSubWorkflow = async (statusId: string) => {
  try {
    console.log('Checking if status has sub-workflow:', statusId)
    const q = query(
      collection(db, 'subWorkflows'),
      where('statusId', '==', statusId)
    )
    const querySnapshot = await getDocs(q)
    const hasWorkflow = !querySnapshot.empty
    console.log(
      'Status has workflow:',
      hasWorkflow,
      'Number of docs:',
      querySnapshot.size
    )
    return hasWorkflow
  } catch (error) {
    console.error('Error checking if status has sub-workflow:', error)
    return false
  }
}
