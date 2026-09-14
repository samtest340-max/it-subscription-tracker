import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = ["/login", "/reset-password", "/api/auth", "/api/uptime"]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (publicPaths.some((item) => path === item || path.startsWith(`${item}/`))) return NextResponse.next()
  const sessionCookie = request.cookies.get("better-auth.session_token") ?? request.cookies.get("__Secure-better-auth.session_token") ?? request.cookies.get("better-auth.session-token")
  if (!sessionCookie) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.url))
  return NextResponse.next()
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] }
