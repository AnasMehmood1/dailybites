export interface MenuItem {
  name: string
  description?: string
}

export interface MenuData {
  [key: string]: MenuItem[]
}

export const menuData: MenuData = {
  monday: [
    { name: "Pasta Primavera", description: "Fresh vegetables with pasta" },
    { name: "Garlic Bread" },
    { name: "Green Salad" },
  ],
  tuesday: [
    { name: "Taco Tuesday", description: "Beef and chicken tacos with toppings" },
    { name: "Mexican Rice" },
    { name: "Refried Beans" },
  ],
  wednesday: [
    { name: "Roast Chicken", description: "Herb-roasted with vegetables" },
    { name: "Mashed Potatoes" },
    { name: "Steamed Broccoli" },
  ],
  thursday: [
    { name: "Vegetable Stir Fry", description: "With tofu and rice noodles" },
    { name: "Spring Rolls" },
    { name: "Miso Soup" },
  ],
  friday: [
    { name: "Fish & Chips", description: "Battered cod with fries" },
    { name: "Coleslaw" },
    { name: "Tartar Sauce" },
  ],
  saturday: [
    { name: "Homemade Pizza", description: "Various toppings available" },
    { name: "Caesar Salad" },
    { name: "Garlic Knots" },
  ],
  sunday: [
    { name: "Pot Roast", description: "Slow-cooked with vegetables" },
    { name: "Dinner Rolls" },
    { name: "Apple Pie for Dessert" },
  ],
}

