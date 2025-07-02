import { collection, getDocs, query, where, addDoc, writeBatch, doc } from "firebase/firestore"
import { db } from "./firebase"
import { historyService } from "./history-service"

// Hàm khởi tạo dữ liệu mẫu
export async function initializeData(maxRetries = 3) {
  let retries = 0

  while (retries < maxRetries) {
    try {
      // Check if we're online
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        console.log("Browser is offline, skipping data initialization")
        return
      }

      await Promise.all([
        createAdminAccount(),
        initializeDepartments(),
        initializeProductStatuses(),
        historyService.initializeHistoryCollection(), // Thêm khởi tạo collection lịch sử
        // Add other initialization functions as needed
      ])

      console.log("All data initialized successfully")
      return
    } catch (error) {
      retries++
      console.error(`Error initializing data (attempt ${retries}/${maxRetries}):`, error)

      if (retries >= maxRetries) {
        console.error("Max retries reached, giving up on data initialization")
        throw error
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 10000)
      console.log(`Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

// Create admin account if it doesn't exist
async function createAdminAccount() {
  try {
    // Check if admin account already exists
    const usersRef = collection(db, "users")
    const adminQuery = query(usersRef, where("username", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)

    if (adminSnapshot.empty) {
      console.log("Admin account doesn't exist, creating...")

      // Create admin user
      const adminUser = {
        username: "admin",
        password: "admin", // In a real environment, use a stronger password
        fullName: "Administrator",
        email: "admin@example.com",
        role: "admin",
        department: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      }

      // Add to users collection
      const docRef = await addDoc(usersRef, adminUser)
      console.log("Admin account created with ID:", docRef.id)
    } else {
      console.log("Admin account already exists")
    }
  } catch (error) {
    console.error("Error creating admin account:", error)
    throw error
  }
}

// Initialize departments if they don't exist
async function initializeDepartments() {
  try {
    const departmentsRef = collection(db, "departments")
    const departmentsSnapshot = await getDocs(departmentsRef)

    if (departmentsSnapshot.empty) {
      console.log("No departments found, initializing...")

      const batch = writeBatch(db)

      const departments = [
        { name: "R&D", description: "Research and Development", createdAt: new Date().toISOString() },
        { name: "Marketing", description: "Marketing Department", createdAt: new Date().toISOString() },
        { name: "Production", description: "Production Department", createdAt: new Date().toISOString() },
        { name: "Quality Control", description: "Quality Control Department", createdAt: new Date().toISOString() },
      ]

      departments.forEach((department) => {
        const docRef = doc(departmentsRef)
        batch.set(docRef, department)
      })

      await batch.commit()
      console.log("Departments initialized successfully")
    } else {
      console.log("Departments already exist")
    }
  } catch (error) {
    console.error("Error initializing departments:", error)
    throw error
  }
}

// Initialize product statuses if they don't exist
async function initializeProductStatuses() {
  try {
    const statusesRef = collection(db, "productStatuses")
    const statusesSnapshot = await getDocs(statusesRef)

    if (statusesSnapshot.empty) {
      console.log("No product statuses found, initializing...")

      const batch = writeBatch(db)

      const statuses = [
        { name: "Draft", description: "Initial draft", color: "#E5E7EB", createdAt: new Date().toISOString() },
        { name: "In Review", description: "Under review", color: "#FEF3C7", createdAt: new Date().toISOString() },
        {
          name: "Approved",
          description: "Approved for production",
          color: "#D1FAE5",
          createdAt: new Date().toISOString(),
        },
        {
          name: "In Production",
          description: "Currently in production",
          color: "#DBEAFE",
          createdAt: new Date().toISOString(),
        },
        {
          name: "Completed",
          description: "Production completed",
          color: "#C7D2FE",
          createdAt: new Date().toISOString(),
        },
        { name: "On Hold", description: "Temporarily on hold", color: "#FEE2E2", createdAt: new Date().toISOString() },
      ]

      statuses.forEach((status) => {
        const docRef = doc(statusesRef)
        batch.set(docRef, status)
      })

      await batch.commit()
      console.log("Product statuses initialized successfully")
    } else {
      console.log("Product statuses already exist")
    }
  } catch (error) {
    console.error("Error initializing product statuses:", error)
    throw error
  }
}
