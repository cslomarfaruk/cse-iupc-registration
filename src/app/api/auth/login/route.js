import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();
  console.log("Login attempt:", { username, password });
  const admin = await prisma.admin.findUnique({
    where: { username },
  });
  console.log("Admin found:", admin);
  if (!admin) {
    return NextResponse.json({ success: false, error: "Invalid credentials" });
  }

  const passwordValid = password == admin.password;

  if (!passwordValid) {
    return NextResponse.json({ success: false, error: "Invalid credentials" });
  }

  const token = await new SignJWT({ id: admin.id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET_KEY));

  const response = NextResponse.json({ success: true });
  response.cookies.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 2 * 1000,
    path: "/",
  });

  return response;
}
