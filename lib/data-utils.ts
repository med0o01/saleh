import type { Product, Category } from "@/types/product"

// Default categories
const defaultCategories: Category[] = [
  { id: "1", name: "صفيات" },
  { id: "2", name: "مجري" },
  { id: "3", name: "أغطية تفتيش" },
  { id: "4", name: "أغطية خزان" },
  { id: "5", name: "مزراب" },
  { id: "6", name: "هويات" },
  { id: "7", name: "شبك" },
  { id: "8", name: "شبك مع فريم" },
  { id: "9", name: "إكسسورات" },
  { id: "10", name: "خدمة دهان" },
  { id: "11", name: "دعامات" },
]

// Sample products
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "صفية 20×20",
    categoryId: "1",
    paintedPrice: 25,
    unpaintedPrice: 20,
    unit: "piece",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "مجري 10×10",
    categoryId: "2",
    paintedPrice: 15,
    unpaintedPrice: 12,
    unit: "meter",
    minQuantity: 0.5,
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "غطاء تفتيش 30×30",
    categoryId: "3",
    paintedPrice: 35,
    unpaintedPrice: 30,
    unit: "piece",
    imageUrl: "/placeholder.svg?height=200&width=200",
  },
]

// Helper function to get data from localStorage or use defaults
function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === "undefined") return defaultData

  const storedData = localStorage.getItem(key)
  return storedData ? JSON.parse(storedData) : defaultData
}

// Helper function to save data to localStorage
function saveLocalData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Fetch categories
async function fetchCategories(): Promise<Category[]> {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getLocalData<Category[]>("categories", defaultCategories)
      resolve(categories)
    }, 300)
  })
}

// Fetch products
async function fetchProducts(): Promise<Product[]> {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getLocalData<Product[]>("products", sampleProducts)
      resolve(products)
    }, 300)
  })
}

// Export data
async function exportData(): Promise<void> {
  const categories = getLocalData<Category[]>("categories", defaultCategories)
  const products = getLocalData<Product[]>("products", sampleProducts)

  const data = {
    categories,
    products,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `alsaleh_data_${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import data
async function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        if (data.categories && Array.isArray(data.categories)) {
          saveLocalData("categories", data.categories)
        }

        if (data.products && Array.isArray(data.products)) {
          saveLocalData("products", data.products)
        }

        resolve()
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

// Export all functions
export { fetchCategories, fetchProducts, exportData, importData }
