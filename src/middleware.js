import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    console.log("No token, redirecting...");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET_KEY));
    return NextResponse.next();
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
