'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface UserContextType {
  currentUser: {
    uid: string
    displayName: string | null
    email: string | null
  } | null
  isLoading: boolean
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isLoading: true
})

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] =
    useState<UserContextType['currentUser']>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email
        })
      } else {
        setCurrentUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ currentUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
