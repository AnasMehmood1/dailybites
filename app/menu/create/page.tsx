"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createMenu } from "@/lib/api"
import { checkAuth } from "@/lib/auth"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function CreateMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  const [startDate, setStartDate] = useState(dateParam || format(new Date(), "yyyy-MM-dd"))
  const [duration, setDuration] = useState(1)
  const [meals, setMeals] = useState({
    breakfast: { type: "daily", items: [{ name: "", description: "", recipe: "", price: 0 }] },
    lunch: { type: "daily", items: [{ name: "", description: "", recipe: "", price: 0 }] },
    dinner: { type: "daily", items: [{ name: "", description: "", recipe: "", price: 0 }] },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
      }
    }

    checkAuthentication()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      for (let i = 0; i < duration; i++) {
        const currentDate = format(addDays(new Date(startDate), i), "yyyy-MM-dd")
        const dayOfWeek = format(new Date(currentDate), "EEEE")

        const menuData = {
          date: currentDate,
          breakfast: {
            items:
              meals.breakfast.type === "daily"
                ? meals.breakfast.items
                : [
                    meals.breakfast.items.find((item) => item.day === dayOfWeek) || {
                      name: "",
                      description: "",
                      recipe: "",
                      price: 0,
                    },
                  ],
          },
          lunch: {
            items:
              meals.lunch.type === "daily"
                ? meals.lunch.items
                : [
                    meals.lunch.items.find((item) => item.day === dayOfWeek) || {
                      name: "",
                      description: "",
                      recipe: "",
                      price: 0,
                    },
                  ],
          },
          dinner: {
            items:
              meals.dinner.type === "daily"
                ? meals.dinner.items
                : [
                    meals.dinner.items.find((item) => item.day === dayOfWeek) || {
                      name: "",
                      description: "",
                      recipe: "",
                      price: 0,
                    },
                  ],
          },
        }
        await createMenu(menuData)
      }
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create menu:", error)
      setError("Failed to create menu. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMealTypeChange = (mealType, value) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: {
        type: value,
        items:
          value === "daily"
            ? [{ name: "", description: "", recipe: "", price: 0 }]
            : DAYS_OF_WEEK.map((day) => ({ day, name: "", description: "", recipe: "", price: 0 })),
      },
    }))
  }

  const handleMealItemChange = (mealType, index, field, value) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: {
        ...prevMeals[mealType],
        items: prevMeals[mealType].items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      },
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <Tabs defaultValue="breakfast">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                <TabsTrigger value="lunch">Lunch</TabsTrigger>
                <TabsTrigger value="dinner">Dinner</TabsTrigger>
              </TabsList>

              {["breakfast", "lunch", "dinner"].map((mealType) => (
                <TabsContent key={mealType} value={mealType}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`${mealType}-type`}>Meal Type</Label>
                      <Select
                        value={meals[mealType].type}
                        onValueChange={(value) => handleMealTypeChange(mealType, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {meals[mealType].type === "daily" ? (
                      <MealForm
                        items={meals[mealType].items}
                        onUpdate={(index, field, value) => handleMealItemChange(mealType, index, field, value)}
                      />
                    ) : (
                      DAYS_OF_WEEK.map((day, index) => (
                        <div key={day} className="space-y-2">
                          <h3 className="font-semibold">{day}</h3>
                          <MealForm
                            items={[meals[mealType].items[index]]}
                            onUpdate={(_, field, value) => handleMealItemChange(mealType, index, field, value)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Menu"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function MealForm({ items, onUpdate }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-2">
          <Input placeholder="Meal name" value={item.name} onChange={(e) => onUpdate(index, "name", e.target.value)} />
          <Input
            placeholder="Description"
            value={item.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
          />
          <Textarea
            placeholder="Recipe"
            value={item.recipe}
            onChange={(e) => onUpdate(index, "recipe", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Price (Rs)"
            value={item.price}
            onChange={(e) => onUpdate(index, "price", Number.parseFloat(e.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  )
}

