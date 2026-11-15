import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Feature Flag: Toggle to true when matches start and schedule/scoreboard should be publicly accessible
export const ENABLE_TOURNAMENT_STAGE = false;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block schedule and scoreboard routes during registration phase
  if (!ENABLE_TOURNAMENT_STAGE) {
    if (
      pathname.startsWith('/schedule') ||
      pathname.startsWith('/scoreboard')
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

