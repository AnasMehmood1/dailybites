import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-4 px-4 text-center text-sm text-gray-600">
      <p className="flex items-center justify-center">DailyBites – Plan your bites for the day, effortlessly.</p>
      <p className="text-xs mt-1">
        Designed with <Heart className="h-3 w-3 mx-1 inline text-red-500" /> by AnasMehmood
      </p>
    </footer>
  )
}

