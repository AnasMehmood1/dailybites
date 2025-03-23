import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import mongoose from "mongoose"

// Define User schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdAt: Date,
})

// Create User model (only if it doesn't exist)
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId } = decoded as { userId: string }

    // Connect to the database
    await connectToDatabase()

    // Get user from database
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data (excluding password)
    const { ...userData } = user.toObject()

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
}

