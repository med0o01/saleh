"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PricingItem } from "@/types/pricing"
import { Trash2, Edit2, Check, X } from "lucide-react"

interface PricingSummaryProps {
  items: PricingItem[]
  onRemoveItem: (index: number) => void
  onUpdateItem: (index: number, item: PricingItem) => void
}

export default function PricingSummary({ items, onRemoveItem, onUpdateItem }: PricingSummaryProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState<number>(0)

  const handleEditPrice = (index: number, price: number) => {
    setEditingIndex(index)
    setEditingPrice(price)
  }

  const handleSavePrice = (index: number) => {
    const item = { ...items[index], finalPrice: editingPrice }
    onUpdateItem(index, item)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.finalPrice, 0)
  }

  const getTotalQuantity = (unit: string) => {
    return items.filter((item) => item.unit === unit).reduce((total, item) => total + item.quantity, 0)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد عناصر في قائمة التسعير</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>الصنف</TableHead>
            <TableHead>الصورة</TableHead>
            <TableHead>القسم</TableHead>
            <TableHead>الكمية</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الخصم</TableHead>
            <TableHead>السعر النهائي</TableHead>
            <TableHead className="w-24">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                <div className="relative w-12 h-12 border rounded-md overflow-hidden">
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=50&width=50"}
                    alt={item.productName}
                    fill
                    className="object-contain"
                  />
                </div>
              </TableCell>
              <TableCell>{item.categoryName}</TableCell>
              <TableCell>
                {item.quantity} {item.unit === "meter" ? "متر" : "قطعة"}
              </TableCell>
              <TableCell>{item.isPainted ? "مدهون" : "غير مدهون"}</TableCell>
              <TableCell>{item.discount}%</TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <Input
                    type="number"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(Number.parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                ) : (
                  `${item.finalPrice.toFixed(2)} ريال`
                )}
              </TableCell>
              <TableCell>
                {editingIndex === index ? (
                  <div className="flex space-x-1 space-x-reverse">
                    <Button variant="ghost" size="icon" onClick={() => handleSavePrice(index)}>
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-1 space-x-reverse">
                    <Button variant="ghost" size="icon" onClick={() => handleEditPrice(index, item.finalPrice)}>
                      <Edit2 className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="font-bold text-lg mb-2">ملخص الطلب</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>إجمالي عدد القطع:</span>
            <span className="font-bold">{getTotalQuantity("piece")} قطعة</span>
          </div>
          <div className="flex justify-between">
            <span>إجمالي عدد الأمتار:</span>
            <span className="font-bold">{getTotalQuantity("meter").toFixed(2)} متر</span>
          </div>
          <div className="flex justify-between">
            <span>إجمالي السعر:</span>
            <span className="font-bold">{getTotalPrice().toFixed(2)} ريال</span>
          </div>
        </div>
      </div>
    </div>
  )
}
