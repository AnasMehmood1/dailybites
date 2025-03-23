"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import MenuPopup from "./menu-popup"
import { getRecurringMeals } from "@/lib/api"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface MenuItem {
  name: string
  price: number
}

interface MenuData {
  breakfast?: { items: MenuItem[] }
  lunch?: { items: MenuItem[] }
  dinner?: { items: MenuItem[] }
}

interface CalendarProps {
  currentMonth: Date
  menus: { [key: string]: MenuData }
  onDayClick: (date: Date) => void
  selectedDate: Date
}

// Helper functions to replace date-fns
const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const subMonths = (date: Date, months: number) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() - months)
  return result
}

// Update the formatDate function in calendar.tsx
const formatDate = (date: Date, formatStr: string) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const weekday = days[date.getDay()]

  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  return formatStr
    .replace("MMMM", month)
    .replace("MM", String(date.getMonth() + 1).padStart(2, "0"))
    .replace("EEEE", weekday)
    .replace("d", String(day))
    .replace("yyyy", String(year))
}

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export default function Calendar({
  currentMonth: initialMonth,
  menus,
  onDayClick,
  selectedDate: initialSelectedDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [recurringMeals, setRecurringMeals] = useState(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchRecurringMeals = async () => {
      try {
        const meals = await getRecurringMeals()
        setRecurringMeals(meals)
      } catch (error) {
        console.error("Failed to fetch recurring meals:", error)
      }
    }

    fetchRecurringMeals()
  }, [])

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onDayClick(date)
    router.push(`/menu/${formatDate(date, "yyyy-MM-dd")}`)
  }

  const handleQuickNav = (label: string) => {
    const today = new Date()
    let newDate: Date

    switch (label) {
      case "Today":
        newDate = today
        break
      case "Tomorrow":
        newDate = addDays(today, 1)
        break
      case "In 3 days":
        newDate = addDays(today, 3)
        break
      case "In a week":
        newDate = addDays(today, 7)
        break
      case "In 2 weeks":
        newDate = addDays(today, 14)
        break
      default:
        newDate = today
    }

    handleDateSelect(newDate)
    if (newDate.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(newDate)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const today = new Date()

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const hasMenu = (day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return menus[dateString] !== undefined
  }

  const getMenuForDay = (date: Date) => {
    const dateString = formatDate(date, "yyyy-MM-dd")
    const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()]
    const menu = menus[dateString] || { breakfast: {}, lunch: {}, dinner: {} }

    if (recurringMeals) {
      ;["breakfast", "lunch", "dinner"].forEach((mealType) => {
        if (!menu[mealType].items || menu[mealType].items.length === 0) {
          if (recurringMeals.meals[mealType].type === "daily") {
            menu[mealType] = { items: [{ name: recurringMeals.meals[mealType].items[0] }] }
          } else if (recurringMeals.meals[mealType].type === "weekly") {
            const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(
              dayOfWeek,
            )
            menu[mealType] = { items: [{ name: recurringMeals.meals[mealType].items[dayIndex] }] }
          }
        }
      })
    }

    return menu
  }

  const isToday = (day: number) => {
    return isSameDay(new Date(year, month, day), today)
  }

  const isSelected = (day: number) => {
    return isSameDay(new Date(year, month, day), selectedDate)
  }

  const selectedMenu = getMenuForDay(selectedDate)

  return (
    <div className="space-y-6">
      <div className="calendar bg-white rounded-lg shadow-sm p-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-base font-medium">{formatDate(currentMonth, "MMMM yyyy")}</div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
            <div key={dayName} className="text-center text-sm py-1">
              {dayName}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <div key={index} className="relative h-10 flex items-center justify-center">
              {day && (
                <div
                  onClick={() => handleDateSelect(new Date(year, month, day))}
                  onMouseEnter={() => setHoveredDate(new Date(year, month, day))}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    w-9 h-6 flex items-center justify-center rounded-full cursor-pointer group
                    ${isSelected(day) ? "bg-black text-white" : isToday(day) ? "bg-gray-100" : "hover:bg-gray-50"}
                  `}
                >
                  <span className="text-sm">{day}</span>
                  {hasMenu(day) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-0.5">
                        {getMenuForDay(new Date(year, month, day)).breakfast?.items?.length > 0 && (
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        )}
                        {getMenuForDay(new Date(year, month, day)).lunch?.items?.length > 0 && (
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        )}
                        {getMenuForDay(new Date(year, month, day)).dinner?.items?.length > 0 && (
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  )}
                  {hoveredDate && isSameDay(hoveredDate, new Date(year, month, day)) && hasMenu(day) && (
                    <div className="absolute z-10 top-full left-1/2 transform -translate-x-1/2 mt-2">
                      <MenuPopup menu={getMenuForDay(hoveredDate)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {["Today", "Tomorrow", "In 3 days", "In a week", "In 2 weeks"].map((label) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1 h-6 rounded-full hover:bg-gray-50"
              onClick={() => handleQuickNav(label)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {selectedMenu && (
        <Card className="p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-6">Menu for {formatDate(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
          <div className="space-y-8">
            {["breakfast", "lunch", "dinner"].map((mealType) => {
              const meal = selectedMenu[mealType]
              if (!meal?.items?.length) return null

              return (
                <div key={mealType} className="space-y-3">
                  <h4 className="text-lg font-semibold capitalize">{mealType}</h4>
                  {meal.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-gray-700">
                      <span>{item.name}</span>
                      <span>Rs {typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            <div className="pt-4 mt-6 border-t text-sm text-gray-500 flex items-center justify-between">
              <span>View your complete bill and expense tracking in the Profile section</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/profile")} className="ml-4">
                Go to Profile
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

