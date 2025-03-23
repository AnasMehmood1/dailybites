"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WelcomePopupProps {
  userName: string
  onClose: () => void
}

export default function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Small delay to allow for animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual closing to allow for animation
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <Card className={`w-full max-w-md transform transition-all duration-300 ${isVisible ? "scale-100" : "scale-95"}`}>
        <CardHeader className="relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <CardTitle className="text-2xl text-center">Welcome to DailyBites, {userName}!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
  <div className="py-4">
    <div className="text-5xl mb-4">👋</div>
    <p className="text-gray-600">Plan your bites for the day, effortlessly.</p>
  </div>
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="font-medium mb-2">Today&apos;s Tip</h3>
    <p className="text-sm text-gray-600">
      Did you know you can set recurring meals to save time? Use the &quot;Daily&quot; or &quot;Weekly&quot; options 
      when creating a menu to easily plan your meals.
    </p>
  </div>
</CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleClose} className="w-full">
            Let&apos;s Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

