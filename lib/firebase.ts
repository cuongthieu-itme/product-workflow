import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, collection, query, where, getDocs, addDoc, enableIndexedDbPersistence } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyClFV4lwrs7I-TTUV-SW2Pj0wlOdcQEqGA",
  authDomain: "rnd-printway-test.firebaseapp.com",
  projectId: "rnd-printway-test",
  storageBucket: "rnd-printway-test.firebasestorage.app",
  messagingSenderId: "316448855255",
  appId: "1:316448855255:web:7e222da23ea3ebdaee8c92",
  measurementId: "G-5PGMRN400J",
}

// Kiểm tra cấu hình Firebase
console.log("Firebase config check:", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Đã cấu hình" : "Chưa cấu hình",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "Đã cấu hình" : "Chưa cấu hình",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Đã cấu hình" : "Chưa cấu hình",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "Đã cấu hình" : "Chưa cấu hình",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "Đã cấu hình" : "Chưa cấu hình",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "Đã cấu hình" : "Chưa cấu hình",
})

// Khởi tạo Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Enable offline persistence
if (typeof window !== "undefined") {
  // Only run in browser environment
  enableIndexedDbPersistence(db, {
    synchronizeTabs: true,
  })
    .then(() => {
      console.log("Offline persistence enabled successfully")
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
      } else if (err.code === "unimplemented") {
        console.warn("The current browser does not support all of the features required to enable persistence")
      } else {
        console.error("Error enabling offline persistence:", err)
      }
    })
}

console.log("Firebase initialized with project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

// Tạo tài khoản admin nếu chưa tồn tại
const createAdminAccount = async () => {
  try {
    // Kiểm tra xem tài khoản admin đã tồn tại chưa
    const usersRef = collection(db, "users")
    const adminQuery = query(usersRef, where("username", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)

    if (adminSnapshot.empty) {
      console.log("Tài khoản admin chưa tồn tại, đang tạo...")

      // Tạo tài khoản admin
      const adminUser = {
        username: "admin",
        password: "admin", // Trong môi trường thực tế, nên sử dụng mật khẩu mạnh hơn
        fullName: "Administrator",
        email: "admin@example.com",
        role: "admin",
        department: "admin",
        status: "active",
        createdAt: new Date().toISOString(),
      }

      // Thêm vào collection users
      const docRef = await addDoc(usersRef, adminUser)
      console.log("Đã tạo tài khoản admin với ID:", docRef.id)
    } else {
      console.log("Tài khoản admin đã tồn tại")
    }
  } catch (error) {
    console.error("Lỗi khi tạo tài khoản admin:", error)
  }
}

// Gọi hàm tạo tài khoản admin
if (typeof window !== "undefined") {
  // Chỉ chạy ở phía client
  createAdminAccount().catch((err) => {
    console.error("Error creating admin account:", err)
  })
}

export { app, db, auth, storage }
