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
  lastLogin: Date,
  totalLogins: Number,
})

// Create User model
const User = mongoose.models.User || mongoose.model("User", UserSchema)

// Define Menu schema
const MenuSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  breakfast: Object,
  lunch: Object,
  dinner: Object,
  createdAt: Date,
  updatedAt: Date,
})

// Create Menu model
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema)

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    // Authenticate user
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId: tokenUserId } = decoded as { userId: string }

    // Check if the authenticated user is requesting their own data
    if (userId !== tokenUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await connectToDatabase()

    // Get user from database
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's menus
    const menus = await Menu.find({ userId: user._id }).sort({ createdAt: -1 })

    const activity = {
      lastLogin: user.lastLogin || null,
      totalLogins: user.totalLogins || 0,
      menusCreated: menus.length,
      lastMenuCreated: menus.length > 0 ? menus[0].createdAt : null,
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

