import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User, UserStreak } from "@/lib/models";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // ── Validation ──────────────────────────────────────────
    if (!name?.trim())   return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!email?.trim())  return NextResponse.json({ error: "Email is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    if (!password || password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    // ── Duplicate check ─────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    // ── Hash & create ───────────────────────────────────────
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hash,
      subscriptionTier: "free",
      onboardingComplete: false,
    });

    // Initialise streak document
    await UserStreak.create({
      userId: user._id,
      currentStreak: 0,
      longestStreak: 0,
      dailyGoalMinutes: 30,
    });

    // ── Sign JWT ────────────────────────────────────────────
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json(
      { message: "Account created successfully.", userId: user._id, name: user.name },
      { status: 201 }
    );

    // HttpOnly cookie — safe from XSS
    response.cookies.set("ks_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
