"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Calendar from "@/components/calendar"
import Footer from "@/components/footer"
import WelcomePopup from "@/components/welcome-popup"
import { Button } from "@/components/ui/button"
import { getUserMenus } from "@/lib/api"
import { checkAuth, logout, getCurrentUser } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, MenuIcon, PlusCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Define a User type
interface User {
  name: string;
  email: string;
  // Add other properties as needed
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth ] = useState(new Date())
  const [menus, setMenus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      // Get current user
      const currentUser = getCurrentUser() as User
      setUser(currentUser)

      // Check if this is a fresh login
      const isNewLogin = sessionStorage.getItem("justLoggedIn") === "true"
      if (isNewLogin) {
        setShowWelcome(true)
        sessionStorage.removeItem("justLoggedIn")
      }

      try {
        const userMenus = await getUserMenus()
        setMenus(userMenus)
      } catch (error) {
        console.error("Failed to fetch menus:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  // Function to navigate to the previous month
  // const handlePrevMonth = () => {
  //   setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  // }

  // // Function to navigate to the next month
  // const handleNextMonth = () => {
  //   setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  // }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showWelcome && user && <WelcomePopup userName={user.name} onClose={() => setShowWelcome(false)} />}

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">DailyBites</h1>
            <p className="text-xs text-gray-500 ml-2 hidden sm:block">Plan your bites for the day, effortlessly.</p>
          </div>

          {/* Mobile Menu */}
          <div className="block sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => router.push("/menu/create")}>
                    Create Menu
                  </Button>
                  {/* <Button variant="outline" className="w-full" onClick={() => router.push("/recurring-meals")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Set Recurring Meals
                  </Button> */}
                  <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                    Profile
                  </Button>
                  {/* <Button variant="outline" className="w-full" onClick={() => router.push("/grocery-lists")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Grocery Lists
                  </Button> */}
                  <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex gap-4">
            <Button variant="outline" onClick={() => router.push("/menu/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
            {/* <Button variant="outline" onClick={() => router.push("/recurring-meals")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Set Recurring Meals
            </Button> */}
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            {/* <Button variant="outline" onClick={() => router.push("/grocery-lists")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Grocery Lists
            </Button> */}
            <Button className="bg-black text-white hover:bg-gray-800" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="w-full">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-[600px] w-full" />
            </div>
          ) : (
            <Calendar
              currentMonth={currentMonth}
              menus={menus || {}}
              onDayClick={handleDayClick}
              selectedDate={selectedDate}
            />
          )}
        </div>
      </main>

      <Footer />

      
    </div>
  )
}

