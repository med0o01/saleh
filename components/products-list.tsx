"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { useData } from "@/lib/data-context"

interface ProductsListProps {
  selectedCategory: string | null
  onSelectCategory: (categoryId: string) => void
  onDeleteProduct: (productId: string) => void
  onDeleteCategory: (categoryId: string) => void
}

export default function ProductsList({
  selectedCategory,
  onSelectCategory,
  onDeleteProduct,
  onDeleteCategory,
}: ProductsListProps) {
  const { categories, products } = useData()
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false)
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState("")

  const filteredProducts = selectedCategory ? products.filter((product) => product.categoryId === selectedCategory) : []

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setIsDeleteProductDialogOpen(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setIsDeleteCategoryDialogOpen(true)
  }

  const confirmDeleteProduct = () => {
    if (deletePassword === "111999" && productToDelete) {
      onDeleteProduct(productToDelete)
      setIsDeleteProductDialogOpen(false)
      setDeletePassword("")
      setProductToDelete(null)
    }
  }

  const confirmDeleteCategory = () => {
    if (deletePassword === "111999" && categoryToDelete) {
      onDeleteCategory(categoryToDelete)
      setIsDeleteCategoryDialogOpen(false)
      setDeletePassword("")
      setCategoryToDelete(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد أقسام. يرجى إضافة قسم جديد أولاً.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={selectedCategory || categories[0].id}>
        <TabsList className="flex flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="mb-1"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{category.name}</h3>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف القسم
              </Button>
            </div>

            {filteredProducts.length === 0 ? (
              <p className="text-center py-4 text-gray-500">لا توجد منتجات في هذا القسم. يرجى إضافة منتج جديد.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center mb-3">
                        <div className="relative w-32 h-32 border rounded-md overflow-hidden">
                          <Image
                            src={product.imageUrl || "/placeholder.svg?height=150&width=150"}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>سعر المدهون:</span>
                          <span className="font-bold">{product.paintedPrice} ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span>سعر الغير مدهون:</span>
                          <span className="font-bold">{product.unpaintedPrice} ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الوحدة:</span>
                          <span>{product.unit === "meter" ? "متر" : "قطعة"}</span>
                        </div>
                        {product.unit === "meter" && (
                          <div className="flex justify-between">
                            <span>الحد الأدنى:</span>
                            <span>{product.minQuantity} متر</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Product Dialog */}
      <Dialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المنتج</DialogTitle>
            <DialogDescription>هذا الإجراء لا يمكن التراجع عنه. يرجى إدخال كلمة المرور للتأكيد.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="delete-password">كلمة المرور</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteProductDialogOpen(false)
                setDeletePassword("")
              }}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف القسم</DialogTitle>
            <DialogDescription>
              سيتم حذف القسم وجميع المنتجات التابعة له. هذا الإجراء لا يمكن التراجع عنه. يرجى إدخال كلمة المرور للتأكيد.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="delete-category-password">كلمة المرور</Label>
              <Input
                id="delete-category-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteCategoryDialogOpen(false)
                setDeletePassword("")
              }}
            >
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
