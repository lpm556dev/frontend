import { NextResponse } from 'next/server';

export default function middleware(request) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Get auth token from cookies
    const token = request.cookies.get('authToken') ? request.cookies.get('authToken').value : null;

    // Define which paths are protected (require authentication)
    const isProtectedRoute = path.startsWith('/dashboard');

    // Define public paths that don't require authentication
    const isPublicPath =
        path === '/login' ||
        path === '/login/signup' ||
        path === '/login/forgot-password';

    // Redirect logic
    if (isProtectedRoute && !token) {
        // If trying to access a protected route without a token, redirect to login
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
    }

    if (isPublicPath && token) {
        // If trying to access login page with a token, redirect to dashboard
        const url = new URL('/dashboard', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*',
        '/login',
        '/login/:path*'
    ],
};