import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // ── Validation ──────────────────────────────────────────
    if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!password)      return NextResponse.json({ error: "Password is required." }, { status: 400 });

    // ── Find user ────────────────────────────────────────────
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user) {
      // Generic message — don't reveal whether email exists
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // ── Verify password ──────────────────────────────────────
    const valid = await bcrypt.compare(password, user.passwordHash ?? "");
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // ── Sign JWT ─────────────────────────────────────────────
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({
      message: "Signed in successfully.",
      userId: user._id,
      name: user.name,
      onboardingComplete: user.onboardingComplete,
    });

    response.cookies.set("ks_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
