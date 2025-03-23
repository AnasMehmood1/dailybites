import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import mongoose from "mongoose"

// Define Menu schema (if not already defined in a separate file)
const MenuSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  breakfast: Object,
  lunch: Object,
  dinner: Object,
  createdAt: Date,
  updatedAt: Date,
})

// Create Menu model (only if it doesn't exist)
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema)

// Get menu for a specific date
export async function GET(request: Request, { params }: { params: { date: string } }) {
  try {
    const date = params.date

    // Authenticate user
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId } = decoded as { userId: string }

    await connectToDatabase()

    // Get menu from database
    const menu = await Menu.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    })

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Get menu error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update menu for a specific date
export async function PUT(request: Request, { params }: { params: { date: string } }) {
  try {
    const date = params.date

    // Authenticate user
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId } = decoded as { userId: string }

    // Get menu data from request
    const menuData = await request.json()

    await connectToDatabase()

    // Check if menu exists
    const existingMenu = await Menu.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    })

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Update menu
    Object.assign(existingMenu, {
      breakfast: menuData.breakfast,
      lunch: menuData.lunch,
      dinner: menuData.dinner,
      updatedAt: new Date(),
    })

    await existingMenu.save()

    return NextResponse.json(existingMenu)
  } catch (error) {
    console.error("Update menu error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete menu for a specific date
export async function DELETE(request: Request, { params }: { params: { date: string } }) {
  try {
    const date = params.date

    // Authenticate user
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId } = decoded as { userId: string }

    await connectToDatabase()

    // Delete menu
    const result = await Menu.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete menu error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

