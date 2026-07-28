import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out." });
  response.cookies.set("ks_token", "", { maxAge: 0, path: "/" });
  return response;
}

export async function GET() {
  // GET /api/auth/logout — for link-based logout
  const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  response.cookies.set("ks_token", "", { maxAge: 0, path: "/" });
  return response;
}
