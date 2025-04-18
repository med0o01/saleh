"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Category } from "@/types/product"

interface AddCategoryFormProps {
  onAddCategory: (category: Category) => void
  onCancel: () => void
}

export default function AddCategoryForm({ onAddCategory, onCancel }: AddCategoryFormProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        variant: "destructive",
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم القسم",
      })
      return
    }

    setIsLoading(true)

    try {
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
      }

      onAddCategory(newCategory)

      // Reset form
      setName("")

      onCancel()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء محاولة إضافة القسم",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم القسم</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="flex justify-end space-x-2 space-x-reverse">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الإضافة..." : "إضافة القسم"}
        </Button>
      </div>
    </form>
  )
}
