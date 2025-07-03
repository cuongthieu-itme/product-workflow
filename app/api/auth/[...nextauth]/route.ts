import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Kiểm tra tài khoản từ Firestore - phân biệt chữ hoa/chữ thường
          const usersRef = collection(db, 'users')
          const userQuery = query(
            usersRef,
            where('username', '==', credentials.username),
            where('password', '==', credentials.password),
            where('status', '==', 'active')
          )

          const userSnapshot = await getDocs(userQuery)

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data()
            return {
              id: userSnapshot.docs[0].id,
              name: userData.fullName,
              email: userData.email,
              role: userData.role,
              department: userData.department
            }
          }

          // Nếu không tìm thấy trong database, kiểm tra tài khoản mặc định
          if (
            credentials.username === 'admin' &&
            credentials.password === 'admin'
          ) {
            return {
              id: 'admin',
              name: 'Admin',
              email: 'admin@example.com',
              role: 'admin',
              department: 'admin'
            }
          }
        } catch (error) {
          console.error('Error checking user credentials:', error)
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
