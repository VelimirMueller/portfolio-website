import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { ADMIN_USER_ID } from './config/admin';
import { updateSession } from './utils/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

// /admin is English-only and lives outside [locale], like the demos. These
// paths must stay reachable without a session.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/auth/callback'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const { response, user } = await updateSession(request);
    const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));
    if (!isPublic && user?.id !== ADMIN_USER_ID) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*|projects/dashboard-demo|projects/mcp-demo).*)',
  ],
};
