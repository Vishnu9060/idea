import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production";

// GET /api/auth/me — returns current user from JWT cookie
export async function GET(req: NextRequest) {
  const token = req.cookies.get("ks_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
    return NextResponse.json({ user: { userId: payload.userId, email: payload.email, name: payload.name } });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
