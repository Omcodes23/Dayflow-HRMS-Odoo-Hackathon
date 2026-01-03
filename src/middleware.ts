import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup', '/forgot-password', '/reset-password'];

// Define admin-only routes (Website Admin and Company Admin)
const adminRoutes = ['/admin'];

// Define HR routes (accessible by HR, Company Admin, and Website Admin)
const hrRoutes = ['/admin/leaves', '/admin/employees', '/admin/attendance', '/admin/payroll', '/admin/reports'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes and API routes
  if (publicRoutes.some((route) => pathname === route) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // If no token and trying to access protected route, redirect to signin
  if (!accessToken) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // For client-side role checking, we'll handle it in components
  // The middleware handles basic auth, detailed role checks are in DashboardLayout
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
