import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  });
  const pathname = request.nextUrl.pathname;

  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }
  if (
    pathname === "/profile" ||
    pathname.startsWith("/dashboard") ||
    pathname === "/my-requests" ||
    pathname === "/help-requests/new" ||
    pathname.endsWith("/edit")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/profile/:path*",
    "/dashboard/:path*",
    "/my-requests",
    "/help-requests/new",
    "/help-requests/:id/edit"
  ]
};
