import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Feature Flag: Toggle via env or code when matches start and schedule/scoreboard should be publicly accessible
export const ENABLE_TOURNAMENT_STAGE =
  process.env.ENABLE_TOURNAMENT_STAGE === 'true' ||
  process.env.NEXT_PUBLIC_ENABLE_TOURNAMENT_STAGE === 'true';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block schedule and scoreboard routes during registration phase for non-admin visitors
  if (!ENABLE_TOURNAMENT_STAGE) {
    const isAdmin =
      request.cookies.has('cst_admin_token') ||
      request.cookies.has('cst_lan_admin_auth');

    if (
      !isAdmin &&
      (pathname.startsWith('/schedule') || pathname.startsWith('/scoreboard'))
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/schedule/:path*', '/scoreboard/:path*'],
};

