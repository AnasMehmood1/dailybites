import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcrypt"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import mongoose from "mongoose"

// Define User schema (if not already defined in a separate file)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdAt: Date,
})

// Create User model (only if it doesn't exist)
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    await connectToDatabase()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create JWT token
    const token = sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    })

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Return user data (excluding password)
    const { ...userData } = user.toObject()

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

