import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import mongoose from "mongoose"

// Update the RecurringMeal schema
const MealItemSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
  },
  { _id: false },
)

const MealSchema = new mongoose.Schema(
  {
    type: String,
    items: [MealItemSchema],
  },
  { _id: false },
)

const RecurringMealSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  meals: {
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
  },
  duration: String,
  createdAt: Date,
  updatedAt: Date,
})

// Create RecurringMeal model
const RecurringMeal = mongoose.models.RecurringMeal || mongoose.model("RecurringMeal", RecurringMealSchema)

// Define an interface for MenuItem
interface MenuItem {
  name: string;
  price: number;
}

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

    // Get recurring meal data from request
    const { meals, duration } = await request.json()

    await connectToDatabase()

    // Ensure prices are numbers
    Object.keys(meals).forEach((mealType) => {
      meals[mealType].items = meals[mealType].items.map((item: MenuItem) => ({
        ...item,
        price: typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0,
      }))
    })

    // Check if recurring meal already exists for this user
    let recurringMeal = await RecurringMeal.findOne({ userId: new mongoose.Types.ObjectId(userId) })

    if (recurringMeal) {
      // Update existing recurring meal
      recurringMeal.meals = meals
      recurringMeal.duration = duration
      recurringMeal.updatedAt = new Date()
      await recurringMeal.save()
    } else {
      // Create new recurring meal
      recurringMeal = new RecurringMeal({
        userId: new mongoose.Types.ObjectId(userId),
        meals,
        duration,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await recurringMeal.save()
    }

    return NextResponse.json(recurringMeal)
  } catch (error) {
    console.error("Set recurring meals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get recurring meal for this user
    const recurringMeal = await RecurringMeal.findOne({ userId: new mongoose.Types.ObjectId(userId) })

    if (!recurringMeal) {
      return NextResponse.json({ error: "No recurring meal found" }, { status: 404 })
    }

    return NextResponse.json(recurringMeal)
  } catch (error) {
    console.error("Get recurring meals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

