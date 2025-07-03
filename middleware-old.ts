// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname

//   // Define public paths that don't require authentication
//   const isPublicPath =
//     path === '/login' || path === '/register' || path === '/forgot-password'

//   // Get authentication status from cookies
//   const isAuthenticated = request.cookies.get('authToken')?.value === 'true'

//   // Redirect logic
//   if (isPublicPath && isAuthenticated) {
//     // If user is authenticated and tries to access public path, redirect to dashboard
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }

//   if (!isPublicPath && !isAuthenticated) {
//     // If user is not authenticated and tries to access protected path, redirect to login
//     return NextResponse.redirect(new URL('/login', request.url))
//   }

//   return NextResponse.next()
// }

// // Configure which paths the middleware should run on
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
// }
