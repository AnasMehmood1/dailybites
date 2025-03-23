// Define the MenuData interface
interface MenuData {
  date: string;
  breakfast?: { items: { name: string; price: number }[] };
  lunch?: { items: { name: string; price: number }[] };
  dinner?: { items: { name: string; price: number }[] };
}

// Define a union type for meal types
type MealType = 'breakfast' | 'lunch' | 'dinner';

export async function getUserMenus() {
  try {
    const response = await fetch("/api/menus")
    if (!response.ok) throw new Error("Failed to fetch menus")
    return await response.json()
  } catch (error) {
    console.error("Error fetching menus:", error)
    throw error
  }
}

export async function getMenuForDate(date: string) {
  try {
    const response = await fetch(`/api/menus/${date}`)
    if (response.status === 404) return null
    if (!response.ok) throw new Error("Failed to fetch menu")
    return await response.json()
  } catch (error) {
    console.error(`Error fetching menu for ${date}:`, error)
    throw error
  }
}

// Update the createMenu function to properly save expenses
export async function createMenu(menuData: MenuData) {
  try {
    const response = await fetch("/api/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menuData),
    })

    if (!response.ok) throw new Error("Failed to create menu")

    // Calculate total price for the day
    const totalPrice = (['breakfast', 'lunch', 'dinner'] as MealType[]).reduce((total, mealType) => {
      return (
        total +
        (menuData[mealType]?.items?.reduce((mealTotal, item) => mealTotal + item.price, 0) || 0)
      )
    }, 0)

    // Update user's expense record
    await fetch("/api/user/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: menuData.date,
        amount: totalPrice,
        breakfast: menuData.breakfast,
        lunch: menuData.lunch,
        dinner: menuData.dinner,
      }),
    })

    await updateUserExpense(menuData.date, totalPrice)

    return await response.json()
  } catch (error) {
    console.error("Error creating menu:", error)
    throw error
  }
}

async function updateUserExpense(date: string, amount: number) {
  try {
    const response = await fetch("/api/user/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, amount }),
    })

    if (!response.ok) throw new Error("Failed to update user expense")
    return await response.json()
  } catch (error) {
    console.error("Error updating user expense:", error)
    throw error
  }
}

export async function updateMenu(date: string, menuData: MenuData) {
  try {
    const response = await fetch(`/api/menus/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menuData),
    })

    if (!response.ok) throw new Error("Failed to update menu")
    return await response.json()
  } catch (error) {
    console.error("Error updating menu:", error)
    throw error
  }
}

export async function deleteMenu(date: string) {
  try {
    const response = await fetch(`/api/menus/${date}`, {
      method: "DELETE",
    })

    if (!response.ok) throw new Error("Failed to delete menu")
    return true
  } catch (error) {
    console.error("Error deleting menu:", error)
    throw error
  }
}

export async function getUserActivity(userId: string) {
  try {
    const response = await fetch(`/api/user/${userId}/activity`)
    if (!response.ok) throw new Error("Failed to fetch user activity")
    return await response.json()
  } catch (error) {
    console.error("Error fetching user activity:", error)
    throw error
  }
}

export async function setRecurringMeals(meals: MenuData[], duration: string) {
  try {
    const response = await fetch("/api/recurring-meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meals, duration }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in setRecurringMeals:", error)
    throw error
  }
}

export async function getRecurringMeals() {
  try {
    const response = await fetch("/api/recurring-meals")
    if (!response.ok) throw new Error("Failed to fetch recurring meals")
    return await response.json()
  } catch (error) {
    console.error("Error fetching recurring meals:", error)
    throw error
  }
}

export async function getUserExpenses(startDate: string, endDate: string) {
  try {
    const response = await fetch(`/api/user/expenses?startDate=${startDate}&endDate=${endDate}`)
    if (!response.ok) throw new Error("Failed to fetch user expenses")
    return await response.json()
  } catch (error) {
    console.error("Error fetching user expenses:", error)
    throw error
  }
}
