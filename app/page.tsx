import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">DailyBites</h1>
          <p className="text-lg text-gray-600 mb-8">Plan your bites for the day, effortlessly.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Register
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Plan Your Week</h3>
              <p className="text-gray-600">Create breakfast, lunch, and dinner menus for each day of the week.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Easy Access</h3>
              <p className="text-gray-600">View your daily meals at a glance with our interactive calendar.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Detailed Recipes</h3>
              <p className="text-gray-600">Click on any meal to see detailed recipes and instructions.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

