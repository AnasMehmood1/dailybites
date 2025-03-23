"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMenuForDate } from "@/lib/api"
import { checkAuth } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"

export default function MenuDetailPage({ params }: { params: { date: string } }) {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const date = params.date

  useEffect(() => {
    const fetchData = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      try {
        const menuData = await getMenuForDate(date)
        setMenu(menuData)
      } catch (error) {
        console.error("Failed to fetch menu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [date, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Menu Found</h1>
          <p className="text-gray-600 mb-6">There is no menu planned for this date.</p>
          <Button onClick={() => router.push("/menu/create?date=" + date)}>Create Menu for This Day</Button>
        </div>
      </div>
    )
  }

  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Menu Details</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Calendar
            </Button>
            <Button onClick={() => router.push(`/menu/edit/${date}`)}>Edit Menu</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-2">{formattedDate}</h2>
        <p className="text-gray-600 mb-6">Your planned meals for the day</p>

        <Tabs defaultValue="breakfast">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
          </TabsList>

          <TabsContent value="breakfast">
            <MealCard title="Breakfast" meal={menu.breakfast} />
          </TabsContent>

          <TabsContent value="lunch">
            <MealCard title="Lunch" meal={menu.lunch} />
          </TabsContent>

          <TabsContent value="dinner">
            <MealCard title="Dinner" meal={menu.dinner} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MealCard({ title, meal }) {
  if (!meal || !meal.items || meal.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No items planned for this meal.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meal.items.map((item, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <h3 className="font-medium text-lg">{item.name}</h3>
              {item.description && <p className="text-gray-600 mt-1">{item.description}</p>}
              {item.recipe && (
                <div className="mt-3 bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Recipe</h4>
                  <p className="text-sm whitespace-pre-line">{item.recipe}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

