"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/types/product"
import { useData } from "@/lib/data-context"

interface AddProductFormProps {
  onAddProduct: (product: Product) => void
  onCancel: () => void
}

export default function AddProductForm({ onAddProduct, onCancel }: AddProductFormProps) {
  const { categories } = useData()
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [paintedPrice, setPaintedPrice] = useState<number>(0)
  const [unpaintedPrice, setUnpaintedPrice] = useState<number>(0)
  const [unit, setUnit] = useState<"piece" | "meter">("piece")
  const [minQuantity, setMinQuantity] = useState<number>(0.5)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !categoryId || paintedPrice <= 0 || unpaintedPrice <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
      })
      return
    }

    setIsLoading(true)

    try {
      const newProduct: Product = {
        id: Date.now().toString(),
        name,
        categoryId,
        paintedPrice,
        unpaintedPrice,
        unit,
        minQuantity: unit === "meter" ? minQuantity : 1,
        imageUrl: imageUrl || "/placeholder.svg?height=200&width=200",
      }

      onAddProduct(newProduct)

      // Reset form
      setName("")
      setCategoryId("")
      setPaintedPrice(0)
      setUnpaintedPrice(0)
      setUnit("piece")
      setMinQuantity(0.5)
      setImageUrl("")

      onCancel()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة إضافة المنتج",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم المنتج</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">القسم</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="category">
            <SelectValue placeholder="اختر القسم" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paintedPrice">سعر المدهون</Label>
        <Input
          id="paintedPrice"
          type="number"
          min={0}
          step={0.01}
          value={paintedPrice}
          onChange={(e) => setPaintedPrice(Number.parseFloat(e.target.value) || 0)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unpaintedPrice">سعر الغير مدهون</Label>
        <Input
          id="unpaintedPrice"
          type="number"
          min={0}
          step={0.01}
          value={unpaintedPrice}
          onChange={(e) => setUnpaintedPrice(Number.parseFloat(e.target.value) || 0)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">وحدة القياس</Label>
        <Select value={unit} onValueChange={(value: "piece" | "meter") => setUnit(value)}>
          <SelectTrigger id="unit">
            <SelectValue placeholder="اختر وحدة القياس" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="piece">قطعة</SelectItem>
            <SelectItem value="meter">متر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {unit === "meter" && (
        <div className="space-y-2">
          <Label htmlFor="minQuantity">الحد الأدنى للقياس (متر)</Label>
          <Input
            id="minQuantity"
            type="number"
            min={0.1}
            step={0.1}
            value={minQuantity}
            onChange={(e) => setMinQuantity(Number.parseFloat(e.target.value) || 0.5)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="imageUrl">رابط الصورة (اختياري)</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الإضافة..." : "إضافة المنتج"}
        </Button>
      </div>
    </form>
  )
}
