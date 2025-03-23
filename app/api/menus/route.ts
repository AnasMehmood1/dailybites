import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import mongoose from "mongoose"

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

// Create Menu model (only if it doesn't exist)
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema)

// Get all menus for the authenticated user
export async function GET() {
  try {
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

    // Get menus from database
    const menus = await Menu.find({ userId: new mongoose.Types.ObjectId(userId) })

    // Transform array to object with date as key
    const menusObject = menus.reduce((acc, menu) => {
      acc[menu.date] = menu
      return acc
    }, {})

    return NextResponse.json(menusObject)
  } catch (error) {
    console.error("Get menus error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new menu
export async function POST(request: Request) {
  try {
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

    // Check if menu already exists for this date
    const existingMenu = await Menu.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: menuData.date,
    })

    if (existingMenu) {
      // Update existing menu
      Object.assign(existingMenu, {
        breakfast: menuData.breakfast,
        lunch: menuData.lunch,
        dinner: menuData.dinner,
        updatedAt: new Date(),
      })
      await existingMenu.save()

      return NextResponse.json(existingMenu)
    }

    // Create new menu
    const newMenu = new Menu({
      userId: new mongoose.Types.ObjectId(userId),
      date: menuData.date,
      breakfast: menuData.breakfast,
      lunch: menuData.lunch,
      dinner: menuData.dinner,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newMenu.save()

    return NextResponse.json(newMenu, { status: 201 })
  } catch (error) {
    console.error("Create menu error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

