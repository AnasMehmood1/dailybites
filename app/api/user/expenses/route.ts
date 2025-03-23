import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verify } from "jsonwebtoken"
import { connectToDatabase } from "@/utils/db"
import mongoose from "mongoose"

// Define the Menu schema
const MenuSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
  breakfast: { type: Object, required: false },
  lunch: { type: Object, required: false },
  dinner: { type: Object, required: false },
})

// Create Menu model
const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema)

// Update the GET handler in the expenses route
export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "fallback_secret")
    const { userId } = decoded as { userId: string }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    await connectToDatabase()

    // Get menus for the date range
    const menus = await Menu.find({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 })

    // Transform menus into expenses
    const expenses = menus.map((menu) => {
      const dailyTotal = ["breakfast", "lunch", "dinner"].reduce((total: number, mealType: string) => {
        return (
          total +
          (menu[mealType]?.items?.reduce((mealTotal: number, item: { price: number }) => {
            const itemPrice = typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0
            return mealTotal + itemPrice
          }, 0) || 0)
        )
      }, 0)

      return {
        date: menu.date,
        amount: dailyTotal,
        breakfast: menu.breakfast,
        lunch: menu.lunch,
        dinner: menu.dinner,
      }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

