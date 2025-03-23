import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hash } from "bcrypt"
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

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    await newUser.save()

    return NextResponse.json({ success: true, userId: newUser._id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

