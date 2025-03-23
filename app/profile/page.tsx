"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { checkAuth } from "@/lib/auth"
import { getUserExpenses } from "@/lib/api"
import { CalendarIcon, Printer } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type React from "react"

// Define a User type if not already defined
interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string; // Add other properties as needed
}

// Define the Expense type if not already defined
interface Expense {
  date: string;
  amount: number;
  breakfast?: { items: { name: string; price: number }[] };
  lunch?: { items: { name: string; price: number }[] };
  dinner?: { items: { name: string; price: number }[] };
}

// Update the profile card component
const ProfileCard = ({ user }: { user: User | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to DailyBites!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
          <p className="text-gray-600">Plan your bites for the day, effortlessly.</p>
          <div className="text-sm text-gray-500">Member since {user ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalExpense, setTotalExpense] = useState(0)
  const [monthlyBudget, setMonthlyBudget] = useState<number>(15000)
  const [activity, setActivity] = useState({
    lastLogin: null,
    totalLogins: 0,
    menusCreated: 0,
    lastMenuCreated: null,
  })
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  })
  const router = useRouter()

  // Move fetchExpenses function above useEffect
  const fetchExpenses = async (userId: string) => {
    if (!userId || !dateRange.from || !dateRange.to) return

    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd")
      const endDate = format(dateRange.to, "yyyy-MM-dd")
      const expenseData = await getUserExpenses(startDate, endDate)
      setExpenses(expenseData)
      const total = expenseData.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0)
      setTotalExpense(total)
    } catch (error) {
      console.error("Failed to fetch user expenses:", error)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }
  
        // Fetch user data from /api/auth/me
        const response = await fetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        setUser(userData.user);
  
        // Fetch user activity
        const activityResponse = await fetch(`/api/user/${userData.user._id}/activity`);
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivity(activityData);
        }
  
        await fetchExpenses(userData.user._id);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [router, fetchExpenses]);  // ✅ Include fetchExpenses in dependencies
  

  useEffect(() => {
    if (user?._id) {
      fetchExpenses(user._id)
    }
  }, [dateRange, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("User data is not available.")
      return
    }
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      alert("Failed to update profile")
    }
  }

  const calculateBudgetAnalysis = () => {
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const daysInMonth = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth() + 1, 0).getDate()

    const periodBudget = (monthlyBudget / daysInMonth) * days
    const remainingBudget = periodBudget - totalExpense
    const dailyAverage = totalExpense / days
    const projectedMonthlyExpense = dailyAverage * daysInMonth

    return {
      periodBudget: Math.round(periodBudget),
      remainingBudget: Math.round(remainingBudget),
      dailyAverage: Math.round(dailyAverage),
      projectedMonthlyExpense: Math.round(projectedMonthlyExpense),
      daysInPeriod: days,
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileCard user={user} />

            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                  <p>Last login: {activity?.lastLogin ? new Date(activity.lastLogin).toLocaleString() : "N/A"}</p>
                  <p>Total logins: {activity?.totalLogins || 0}</p>
                  <p>Menus created: {activity?.menusCreated || 0}</p>
                  <p>
                    Last menu created:{" "}
                    {activity?.lastMenuCreated ? new Date(activity.lastMenuCreated).toLocaleString() : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Budget Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="monthlyBudget">Monthly Budget</Label>
                    <Input
                      id="monthlyBudget"
                      type="number"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    />
                  </div>
                  <Button onClick={() => localStorage.setItem("monthlyBudget", monthlyBudget.toString())}>
                    Save Budget
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-3 print:shadow-none">
              <CardHeader className="flex flex-row items-center justify-between print:hidden">
                <CardTitle>Meal Expenses</CardTitle>
                <Button variant="outline" size="icon" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="print:hidden">
                    <Label>Select Date Range</Label>
                    <div className="flex gap-2 mt-2 sm:flex-wrap sm:flex">

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? format(dateRange.from, "PPP") : "From"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => date && setDateRange((prev) => ({ ...prev, from: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.to ? format(dateRange.to, "PPP") : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => date && setDateRange((prev) => ({ ...prev, to: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 print:border-t-0">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold">DailyBites</h2>
                      <p className="text-sm text-gray-500">Expense Report</p>
                      <p className="text-sm text-gray-500">
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, "MMMM d, yyyy")} - ${format(dateRange.to, "MMMM d, yyyy")}`
                          : "Select date range"}
                      </p>
                    </div>

                    {expenses.length > 0 ? (
                      <div className="space-y-6">
                        {(() => {
                          const analysis = calculateBudgetAnalysis()
                          return (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                              <h3 className="font-semibold mb-3">Budget Analysis</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Period Budget ({analysis.daysInPeriod} days)</p>
                                  <p className="text-lg font-semibold">Rs {analysis.periodBudget.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Actual Expenses</p>
                                  <p className="text-lg font-semibold">Rs {totalExpense.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Remaining Budget</p>
                                  <p
                                    className={`text-lg font-semibold ${analysis.remainingBudget < 0 ? "text-red-500" : "text-green-500"}`}
                                  >
                                    Rs {analysis.remainingBudget.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Daily Average</p>
                                  <p className="text-lg font-semibold">Rs {analysis.dailyAverage.toFixed(2)}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-sm text-gray-600">Projected Monthly Expense</p>
                                  <p
                                    className={`text-lg font-semibold ${analysis.projectedMonthlyExpense > monthlyBudget ? "text-red-500" : "text-green-500"}`}
                                  >
                                    Rs {analysis.projectedMonthlyExpense.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}

                        {expenses.map((expense) => (
                          <div key={expense.date} className="border-b last:border-b-0 pb-4">
                            <h3 className="font-semibold mb-2">
                              {new Date(expense.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </h3>
                            <div className="space-y-2">
                              {["breakfast", "lunch", "dinner"].map((mealType) => {
                                const meal = expense[mealType as keyof Expense] as { items: { name: string; price: number }[] };
                                if (!meal?.items?.length) return null;

                                const mealTotal = meal.items.reduce((sum: number, item: { name: string; price: number }) => sum + (item.price || 0), 0);

                                return (
                                  <div key={mealType} className="pl-4">
                                    <div className="flex justify-between text-sm font-medium">
                                      <span className="capitalize">{mealType}</span>
                                      <span>Rs {mealTotal.toFixed(2)}</span>
                                    </div>
                                    {meal.items.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm text-gray-600 pl-4">
                                        <span>{item.name}</span>
                                        <span>Rs {(item.price || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                              <span>Daily Total</span>
                              <span>Rs {expense.amount.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-between text-lg font-bold pt-4 border-t">
                          <span>Total Expense</span>
                          <span>Rs {totalExpense.toFixed(2)}</span>
                        </div>

                        <div className="text-sm text-gray-500 text-center pt-4">
                          <p>Thank you for using DailyBites!</p>
                          <p className="text-xs">Generated on {new Date().toLocaleString()}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No expenses found for this period.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="hidden">Update Profile</Button>
          </div>
        </form>
      </main>
    </div>
  )
}

