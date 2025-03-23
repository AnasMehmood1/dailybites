import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"


const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>DailyBites – Plan your bites for the day, effortlessly.</title>
        <meta name="description" content="Plan your bites for the day, effortlessly." />
      </head>
      <body className={inter.className}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
           
            <h1 className="text-2xl font-bold ml-2">DailyBites</h1>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}

