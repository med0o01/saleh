"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/app-layout"
import ProductsList from "@/components/products-list"
import AddProductForm from "@/components/add-product-form"
import AddCategoryForm from "@/components/add-category-form"
import type { Product, Category } from "@/types/product"
import { useData } from "@/lib/data-context"

export default function ProductsPage() {
  const { categories, addCategory, addProduct, deleteProduct, deleteCategory } = useData()
  const [activeTab, setActiveTab] = useState("products")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id)
    }
  }, [isAuthenticated, router, categories, selectedCategory])

  const handleAddProduct = async (product: Product) => {
    addProduct(product)
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة المنتج بنجاح",
    })
  }

  const handleAddCategory = async (category: Category) => {
    addCategory(category)
    setSelectedCategory(category.id)
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة القسم بنجاح",
    })
  }

  const handleDeleteProduct = async (productId: string) => {
    deleteProduct(productId)
    toast({
      title: "تم الحذف",
      description: "تم حذف المنتج بنجاح",
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    deleteCategory(categoryId)

    // Select another category if available
    if (categories.length > 1) {
      const newSelectedCategory = categories.find((c) => c.id !== categoryId)?.id || null
      setSelectedCategory(newSelectedCategory)
    } else {
      setSelectedCategory(null)
    }

    toast({
      title: "تم الحذف",
      description: "تم حذف القسم بنجاح",
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="add-product">إضافة منتج</TabsTrigger>
            <TabsTrigger value="add-category">إضافة قسم</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">إدارة المنتجات والأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsList
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onDeleteProduct={handleDeleteProduct}
                  onDeleteCategory={handleDeleteCategory}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">إضافة منتج جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <AddProductForm onAddProduct={handleAddProduct} onCancel={() => setActiveTab("products")} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-category">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">إضافة قسم جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <AddCategoryForm onAddCategory={handleAddCategory} onCancel={() => setActiveTab("products")} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
