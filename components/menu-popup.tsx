import { Card } from "@/components/ui/card"

interface MenuItem {
  name: string
}

interface MenuCategory {
  items: MenuItem[]
}

interface Menu {
  breakfast?: MenuCategory
  lunch?: MenuCategory
  dinner?: MenuCategory
}

interface MenuPopupProps {
  menu: Menu | null
}

export default function MenuPopup({ menu }: MenuPopupProps) {
  if (!menu) return null

  return (
    <Card className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black text-white rounded-md p-3 w-56 border border-gray-800">
      <div className="space-y-2">
        {menu.breakfast && menu.breakfast.items && menu.breakfast.items.length > 0 && (
          <div>
            <h5 className="text-xs font-medium mb-1 text-gray-300">Breakfast</h5>
            <ul className="space-y-0.5">
              {menu.breakfast.items.map((item, index) => (
                <li key={index} className="text-xs text-white">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {menu.lunch && menu.lunch.items && menu.lunch.items.length > 0 && (
          <div>
            <h5 className="text-xs font-medium mb-1 text-gray-300">Lunch</h5>
            <ul className="space-y-0.5">
              {menu.lunch.items.map((item, index) => (
                <li key={index} className="text-xs text-white">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {menu.dinner && menu.dinner.items && menu.dinner.items.length > 0 && (
          <div>
            <h5 className="text-xs font-medium mb-1 text-gray-300">Dinner</h5>
            <ul className="space-y-0.5">
              {menu.dinner.items.map((item, index) => (
                <li key={index} className="text-xs text-white">
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}
