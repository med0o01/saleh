"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

interface DataContextType {
  categories: Category[]
  products: Product[]
  addCategory: (category: Category) => void
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  deleteCategory: (categoryId: string) => void
  refreshData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load initial data
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const loadedCategories = getLocalData<Category[]>("categories", defaultCategories)
      const loadedProducts = getLocalData<Product[]>("products", sampleProducts)

      setCategories(loadedCategories)
      setProducts(loadedProducts)
      setIsInitialized(true)

      // Save default data if none exists
      if (!localStorage.getItem("categories")) {
        saveLocalData("categories", loadedCategories)
      }

      if (!localStorage.getItem("products")) {
        saveLocalData("products", loadedProducts)
      }
    }
  }, [isInitialized])

  const refreshData = () => {
    if (typeof window !== "undefined") {
      const loadedCategories = getLocalData<Category[]>("categories", defaultCategories)
      const loadedProducts = getLocalData<Product[]>("products", sampleProducts)

      setCategories(loadedCategories)
      setProducts(loadedProducts)
    }
  }

  const addCategory = (category: Category) => {
    const updatedCategories = [...categories, category]
    setCategories(updatedCategories)
    saveLocalData("categories", updatedCategories)
  }

  const addProduct = (product: Product) => {
    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    saveLocalData("products", updatedProducts)
  }

  const updateProduct = (product: Product) => {
    const updatedProducts = products.map((p) => (p.id === product.id ? product : p))
    setProducts(updatedProducts)
    saveLocalData("products", updatedProducts)
  }

  const deleteProduct = (productId: string) => {
    const updatedProducts = products.filter((p) => p.id !== productId)
    setProducts(updatedProducts)
    saveLocalData("products", updatedProducts)
  }

  const deleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((c) => c.id !== categoryId)
    setCategories(updatedCategories)
    saveLocalData("categories", updatedCategories)

    // Also delete all products in this category
    const updatedProducts = products.filter((p) => p.categoryId !== categoryId)
    setProducts(updatedProducts)
    saveLocalData("products", updatedProducts)
  }

  return (
    <DataContext.Provider
      value={{
        categories,
        products,
        addCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteCategory,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
