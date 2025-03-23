"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMenuForDate, updateMenu } from "@/lib/api"
import { checkAuth } from "@/lib/auth"
import { PlusCircle, Trash2 } from "lucide-react"

export default function EditMenuPage({ params }: { params: { date: string } }) {
  const router = useRouter()
  const [date, setDate] = useState(params.date)
  const [breakfast, setBreakfast] = useState([{ name: "", description: "", recipe: "" }])
  const [lunch, setLunch] = useState([{ name: "", description: "", recipe: "" }])
  const [dinner, setDinner] = useState([{ name: "", description: "", recipe: "" }])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      try {
        const menuData = await getMenuForDate(date)
        if (menuData) {
          setBreakfast(menuData.breakfast.items || [{ name: "", description: "", recipe: "" }])
          setLunch(menuData.lunch.items || [{ name: "", description: "", recipe: "" }])
          setDinner(menuData.dinner.items || [{ name: "", description: "", recipe: "" }])
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const menuData = {
        date,
        breakfast: { items: breakfast.filter((item) => item.name.trim() !== "") },
        lunch: { items: lunch.filter((item) => item.name.trim() !== "") },
        dinner: { items: dinner.filter((item) => item.name.trim() !== "") },
      }

      await updateMenu(date, menuData)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to update menu:", error)
      alert("Failed to update menu. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addItem = (mealType: "breakfast" | "lunch" | "dinner") => {
    const setMeal = mealType === "breakfast" ? setBreakfast : mealType === "lunch" ? setLunch : setDinner
    setMeal((prev) => [...prev, { name: "", description: "", recipe: "" }])
  }

  const removeItem = (mealType: "breakfast" | "lunch" | "dinner", index: number) => {
    const setMeal = mealType === "breakfast" ? setBreakfast : mealType === "lunch" ? setLunch : setDinner
    setMeal((prev) => {
      const newItems = [...prev]
      newItems.splice(index, 1)
      return newItems.length ? newItems : [{ name: "", description: "", recipe: "" }]
    })
  }

  const updateItem = (mealType: "breakfast" | "lunch" | "dinner", index: number, field: string, value: string) => {
    const setMeal = mealType === "breakfast" ? setBreakfast : mealType === "lunch" ? setLunch : setDinner
    setMeal((prev) => {
      const newItems = [...prev]
      newItems[index][field] = value
      return newItems
    })
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <header className="bg-gray-100 dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Menu</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs"
              required
            />
          </div>

          <Tabs defaultValue="breakfast">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
              <TabsTrigger value="lunch">Lunch</TabsTrigger>
              <TabsTrigger value="dinner">Dinner</TabsTrigger>
            </TabsList>

            <TabsContent value="breakfast">
              <MealForm
                title="Breakfast"
                items={breakfast}
                onAdd={() => addItem("breakfast")}
                onRemove={(index) => removeItem("breakfast", index)}
                onUpdate={(index, field, value) => updateItem("breakfast", index, field, value)}
              />
            </TabsContent>

            <TabsContent value="lunch">
              <MealForm
                title="Lunch"
                items={lunch}
                onAdd={() => addItem("lunch")}
                onRemove={(index) => removeItem("lunch", index)}
                onUpdate={(index, field, value) => updateItem("lunch", index, field, value)}
              />
            </TabsContent>

            <TabsContent value="dinner">
              <MealForm
                title="Dinner"
                items={dinner}
                onAdd={() => addItem("dinner")}
                onRemove={(index) => removeItem("dinner", index)}
                onUpdate={(index, field, value) => updateItem("dinner", index, field, value)}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Saving..." : "Save Menu"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}

function MealForm({ title, items, onAdd, onRemove, onUpdate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="border p-4 rounded-md relative dark:border-gray-700">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                onClick={() => onRemove(index)}
              >
                <Trash2 size={18} />
                <span className="sr-only">Remove item</span>
              </button>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`${title.toLowerCase()}-name-${index}`}>Dish Name</Label>
                  <Input
                    id={`${title.toLowerCase()}-name-${index}`}
                    value={item.name}
                    onChange={(e) => onUpdate(index, "name", e.target.value)}
                    placeholder="e.g. Scrambled Eggs"
                  />
                </div>

                <div>
                  <Label htmlFor={`${title.toLowerCase()}-desc-${index}`}>Description (optional)</Label>
                  <Input
                    id={`${title.toLowerCase()}-desc-${index}`}
                    value={item.description}
                    onChange={(e) => onUpdate(index, "description", e.target.value)}
                    placeholder="e.g. With toast and avocado"
                  />
                </div>

                <div>
                  <Label htmlFor={`${title.toLowerCase()}-recipe-${index}`}>Recipe (optional)</Label>
                  <Textarea
                    id={`${title.toLowerCase()}-recipe-${index}`}
                    value={item.recipe}
                    onChange={(e) => onUpdate(index, "recipe", e.target.value)}
                    placeholder="Enter recipe instructions here"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={onAdd} className="w-full">
            <PlusCircle size={16} className="mr-2" />
            Add {title} Item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

