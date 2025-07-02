import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  limit,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { HistoryEntry, WorkflowRevertHistory } from "@/models/history"

// Helper function to remove undefined values from objects
const sanitizeFirestoreData = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeFirestoreData(item))
  }

  if (typeof obj === "object") {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeFirestoreData(value)
      }
    }
    return sanitized
  }

  return obj
}

// Tạo ID ngẫu nhiên
const generateId = () => {
  return Math.random().toString(36).substring(2, 9)
}

// Chuyển đổi timestamp từ Firestore thành Date
const convertTimestampToDate = (data: any) => {
  if (!data) return data

  if (data instanceof Timestamp) {
    return data.toDate()
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return data.map((item) => convertTimestampToDate(item))
    }

    const result: any = {}
    for (const key in data) {
      result[key] = convertTimestampToDate(data[key])
    }
    return result
  }

  return data
}

export const historyService = {
  // Kiểm tra và khởi tạo collection lịch sử
  async initializeHistoryCollection(): Promise<boolean> {
    try {
      console.log("Kiểm tra collection requestHistory...")

      // Kiểm tra xem collection đã tồn tại chưa bằng cách thử lấy một document
      const testDocRef = doc(db, "requestHistory", "test-document")
      const testDocSnapshot = await getDoc(testDocRef)

      // Nếu document tồn tại, collection đã tồn tại
      if (testDocSnapshot.exists()) {
        console.log("Collection requestHistory đã tồn tại")
        return true
      }

      // Thử truy vấn collection để xem có document nào không
      const querySnapshot = await getDocs(collection(db, "requestHistory"))

      if (!querySnapshot.empty) {
        console.log("Collection requestHistory đã tồn tại và có dữ liệu")
        return true
      }

      console.log("Collection requestHistory chưa tồn tại hoặc không có dữ liệu, đang tạo...")

      // Tạo một document mẫu để khởi tạo collection
      const now = new Date()
      const nowTimestamp = Timestamp.fromDate(now)

      const sampleHistory: HistoryEntry = {
        id: "sample-history",
        requestId: "sample-request",
        userId: "system",
        userName: "Hệ thống",
        timestamp: nowTimestamp,
        action: "create",
        entityType: "request",
        entityId: "sample-request",
        details: "Khởi tạo collection requestHistory",
        metadata: {
          isSystemGenerated: true,
          createdAt: nowTimestamp,
        },
      }

      // Thêm document mẫu vào collection
      await setDoc(testDocRef, sampleHistory)

      console.log("Đã tạo collection requestHistory thành công")
      return true
    } catch (error) {
      console.error("Lỗi khi khởi tạo collection requestHistory:", error)
      return false
    }
  },

  // Thêm một bản ghi lịch sử mới
  async addHistory(entry: Omit<HistoryEntry, "id" | "timestamp">): Promise<string> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      const historyData = {
        ...entry,
        id: generateId(),
        timestamp: serverTimestamp(),
      }

      // Sanitize data before sending to Firestore
      const sanitizedData = sanitizeFirestoreData(historyData)
      console.log("Adding sanitized history data:", sanitizedData)

      const docRef = await addDoc(collection(db, "requestHistory"), sanitizedData)
      console.log("History entry added with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error adding history entry:", error)
      throw error
    }
  },

  // Cập nhật một bản ghi lịch sử đã tồn tại
  async updateHistory(historyId: string, updates: Partial<HistoryEntry>): Promise<void> {
    try {
      const historyRef = doc(db, "requestHistory", historyId)

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      }

      // Sanitize data before sending to Firestore
      const sanitizedData = sanitizeFirestoreData(updateData)
      console.log("Updating history with sanitized data:", sanitizedData)

      await updateDoc(historyRef, sanitizedData)
      console.log("History entry updated with ID:", historyId)
    } catch (error) {
      console.error("Error updating history entry:", error)
      throw error
    }
  },

  // Thêm bản ghi bắt đầu bước mới
  async addStepStartHistory(
    requestId: string,
    userId: string,
    userName: string,
    stepData: {
      stepId: string
      stepName: string
      assignee?: any
      estimatedTime?: number
      estimatedTimeUnit?: string
      fieldValues?: any
    },
  ): Promise<string> {
    try {
      const historyId = await this.addHistory({
        requestId,
        userId,
        userName,
        action: "start_step",
        entityType: "step",
        entityId: stepData.stepId,
        details: `Bắt đầu bước: ${stepData.stepName}`,
        metadata: {
          stepName: stepData.stepName,
          assignee: stepData.assignee,
          estimatedTime: stepData.estimatedTime,
          estimatedTimeUnit: stepData.estimatedTimeUnit,
          fieldValues: stepData.fieldValues || {},
          status: "in_progress",
          startedAt: new Date(),
        },
      })

      return historyId
    } catch (error) {
      console.error("Error adding step start history:", error)
      throw error
    }
  },

  // Cập nhật bản ghi thành hoàn thành bước
  async completeStepHistory(
    historyId: string,
    completionData: {
      fieldValues?: any
      completedAt?: Date
      nextStepId?: string
      nextStepName?: string
      nextAssignee?: any
    },
  ): Promise<void> {
    try {
      // Xác định xem có phải bước cuối không
      const isLastStep = !completionData.nextStepId

      // Tạo metadata, chỉ thêm next step info nếu không phải bước cuối
      const metadata: any = {
        status: "completed",
        completedAt: completionData.completedAt || new Date(),
        fieldValues: completionData.fieldValues || {},
      }

      // Chỉ thêm thông tin bước tiếp theo nếu có
      if (!isLastStep) {
        metadata.nextStepId = completionData.nextStepId
        metadata.nextStepName = completionData.nextStepName
        metadata.nextAssignee = completionData.nextAssignee
      }

      const details = isLastStep
        ? "Hoàn thành bước cuối cùng - Quy trình hoàn tất"
        : `Hoàn thành bước và chuyển sang: ${completionData.nextStepName}`

      await this.updateHistory(historyId, {
        action: "complete_step",
        details: details,
        metadata: metadata,
      })
    } catch (error) {
      console.error("Error completing step history:", error)
      throw error
    }
  },

  // Thêm lịch sử quay lại bước
  async addWorkflowRevertHistory(
    entry: Omit<WorkflowRevertHistory, "id" | "timestamp" | "action" | "entityType">,
  ): Promise<string> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      const historyData = {
        ...entry,
        id: generateId(),
        timestamp: serverTimestamp(),
        action: "revert" as const,
        entityType: "workflow" as const,
      }

      const docRef = await addDoc(collection(db, "requestHistory"), historyData)
      console.log("Workflow revert history added with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error adding workflow revert history:", error)
      throw error
    }
  },

  // Lấy lịch sử của một yêu cầu
  async getHistoryByRequestId(requestId: string): Promise<HistoryEntry[]> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      try {
        // Try with the composite index query first
        const historyQuery = query(
          collection(db, "requestHistory"),
          where("requestId", "==", requestId),
          orderBy("timestamp", "desc"),
        )

        const snapshot = await getDocs(historyQuery)
        const history = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...convertTimestampToDate(data),
            firebaseId: doc.id, // Thêm Firebase document ID
          } as HistoryEntry
        })

        return history
      } catch (indexError) {
        console.warn("Index error when querying with ordering, falling back to basic query:", indexError)

        // Fallback query without ordering if the index doesn't exist
        const fallbackQuery = query(collection(db, "requestHistory"), where("requestId", "==", requestId))

        const snapshot = await getDocs(fallbackQuery)
        const history = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...convertTimestampToDate(data),
            firebaseId: doc.id, // Thêm Firebase document ID
          } as HistoryEntry
        })

        // Sort in memory instead
        history.sort((a, b) => {
          const timestampA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
          const timestampB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
          return timestampB - timestampA // Descending order
        })

        return history
      }
    } catch (error) {
      console.error("Error getting request history:", error)
      return []
    }
  },

  // Lấy lịch sử của một bước trong quy trình
  async getHistoryByStepId(requestId: string, stepId: string): Promise<HistoryEntry[]> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      const historyQuery = query(
        collection(db, "requestHistory"),
        where("requestId", "==", requestId),
        where("entityId", "==", stepId),
        where("entityType", "==", "step"),
        orderBy("timestamp", "desc"),
      )

      const snapshot = await getDocs(historyQuery)
      const history = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...convertTimestampToDate(data),
          firebaseId: doc.id,
        } as HistoryEntry
      })

      return history
    } catch (error) {
      console.error("Error getting step history:", error)
      return []
    }
  },

  // Lấy lịch sử của một người dùng
  async getHistoryByUserId(userId: string, limitValue = 50): Promise<HistoryEntry[]> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      const historyQuery = query(
        collection(db, "requestHistory"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(limitValue),
      )

      const snapshot = await getDocs(historyQuery)
      const history = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          ...convertTimestampToDate(data),
          firebaseId: doc.id,
        } as HistoryEntry
      })

      return history
    } catch (error) {
      console.error("Error getting user history:", error)
      return []
    }
  },

  // Kiểm tra xem collection lịch sử có tồn tại không
  async checkHistoryCollectionExists(): Promise<boolean> {
    try {
      const querySnapshot = await getDocs(query(collection(db, "requestHistory"), limit(1)))
      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking history collection:", error)
      return false
    }
  },

  // Lấy bản ghi lịch sử hiện tại của bước đang thực hiện
  async getCurrentStepHistory(requestId: string, stepId: string): Promise<HistoryEntry | null> {
    try {
      // Equality filters KHÔNG cần index, chỉ cần bỏ orderBy
      const historyQuery = query(
        collection(db, "requestHistory"),
        where("requestId", "==", requestId),
        where("entityId", "==", stepId),
        where("entityType", "==", "step"),
        where("action", "==", "start_step"),
      )

      const snapshot = await getDocs(historyQuery)

      if (snapshot.empty) return null

      // Sort client-side theo timestamp desc
      const sorted = snapshot.docs
        .map((docSnap) => ({
          ...(convertTimestampToDate(docSnap.data()) as HistoryEntry),
          firebaseId: docSnap.id,
        }))
        .sort((a, b) => {
          const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
          const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
          return tB - tA
        })

      return sorted[0] ?? null
    } catch (error) {
      console.error("Error getting current step history:", error)
      return null
    }
  },

  // Lấy tất cả lịch sử (dành cho admin)
  async getAllHistory(limitValue = 100): Promise<HistoryEntry[]> {
    try {
      // Đảm bảo collection đã được khởi tạo
      await this.initializeHistoryCollection()

      try {
        // Thử query với orderBy trước
        const historyQuery = query(collection(db, "requestHistory"), orderBy("timestamp", "desc"), limit(limitValue))

        const snapshot = await getDocs(historyQuery)
        const history = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...convertTimestampToDate(data),
            firebaseId: doc.id,
          } as HistoryEntry
        })

        return history
      } catch (indexError) {
        console.warn("Index error when querying with ordering, falling back to basic query:", indexError)

        // Fallback query without ordering
        const fallbackQuery = query(collection(db, "requestHistory"), limit(limitValue))

        const snapshot = await getDocs(fallbackQuery)
        const history = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...convertTimestampToDate(data),
            firebaseId: doc.id,
          } as HistoryEntry
        })

        // Sort in memory instead
        history.sort((a, b) => {
          const timestampA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0
          const timestampB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0
          return timestampB - timestampA // Descending order
        })

        return history
      }
    } catch (error) {
      console.error("Error getting all history:", error)
      return []
    }
  },
}
