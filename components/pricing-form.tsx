"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import type { PricingItem } from "@/types/pricing"
import type { Product } from "@/types/product"
import { calculatePrice } from "@/lib/pricing-utils"
import { useData } from "@/lib/data-context"

interface PricingFormProps {
  onAddItem: (item: PricingItem) => void
}

export default function PricingForm({ onAddItem }: PricingFormProps) {
  const { categories, products } = useData()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [isPainted, setIsPainted] = useState<boolean>(false)
  const [discount, setDiscount] = useState<string>("0")
  const [customDiscount, setCustomDiscount] = useState<number>(0)
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const [basePrice, setBasePrice] = useState<number>(0)
  const [priceAfterDiscount, setPriceAfterDiscount] = useState<number>(0)
  const [selectedProductData, setSelectedProductData] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (categories.length > 0 && selectedCategory === "") {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter((product) => product.categoryId === selectedCategory)
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
    setSelectedProduct("")
  }, [selectedCategory, products])

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct) || null
      setSelectedProductData(product)

      if (product) {
        // Set base price based on whether the product is painted or not
        const price = isPainted ? product.paintedPrice : product.unpaintedPrice
        setBasePrice(price)

        // Calculate prices
        calculatePrices(price, quantity, getDiscountValue())
      }
    } else {
      setSelectedProductData(null)
      setBasePrice(0)
      setFinalPrice(0)
      setPriceAfterDiscount(0)
    }
  }, [selectedProduct, isPainted, products])

  useEffect(() => {
    if (selectedProductData) {
      const price = isPainted ? selectedProductData.paintedPrice : selectedProductData.unpaintedPrice
      setBasePrice(price * quantity)
      calculatePrices(price, quantity, getDiscountValue())
    }
  }, [quantity, discount, customDiscount, isPainted, selectedProductData])

  const getDiscountValue = (): number => {
    if (discount === "custom") {
      return customDiscount
    }
    return Number.parseFloat(discount)
  }

  const calculatePrices = (basePrice: number, qty: number, discountPercent: number) => {
    const { priceBeforeDiscount, priceAfterDiscount, finalPriceWithTax } = calculatePrice(
      basePrice,
      qty,
      discountPercent,
      selectedProductData?.minQuantity || 0.5,
      selectedProductData?.unit || "piece",
    )

    setBasePrice(priceBeforeDiscount)
    setPriceAfterDiscount(priceAfterDiscount)
    setFinalPrice(finalPriceWithTax)
  }

  const handleAddItem = () => {
    if (!selectedProductData) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار منتج أولاً",
      })
      return
    }

    if (quantity <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال كمية صحيحة",
      })
      return
    }

    const discountValue = getDiscountValue()

    const newItem: PricingItem = {
      id: Date.now().toString(),
      productId: selectedProduct,
      productName: selectedProductData.name,
      categoryId: selectedCategory,
      categoryName: categories.find((c) => c.id === selectedCategory)?.name || "",
      quantity,
      unit: selectedProductData.unit,
      isPainted,
      discount: discountValue,
      basePrice: basePrice / quantity, // Store the unit price
      priceAfterDiscount,
      finalPrice,
      imageUrl: selectedProductData.imageUrl,
    }

    onAddItem(newItem)

    // Reset form
    setQuantity(1)
    setDiscount("0")
    setCustomDiscount(0)

    toast({
      title: "تمت الإضافة",
      description: "تم إضافة المنتج إلى قائمة التسعير",
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">القسم</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

          <div>
            <Label htmlFor="product">الصنف</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={!selectedCategory}>
              <SelectTrigger id="product">
                <SelectValue placeholder="اختر الصنف" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">الكمية ({selectedProductData?.unit === "meter" ? "متر" : "قطعة"})</Label>
              <Input
                id="quantity"
                type="number"
                min={selectedProductData?.unit === "meter" ? selectedProductData?.minQuantity || 0.5 : 1}
                step={selectedProductData?.unit === "meter" ? 0.1 : 1}
                value={quantity}
                onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse mt-8">
              <Switch id="painted" checked={isPainted} onCheckedChange={setIsPainted} />
              <Label htmlFor="painted">مدهون</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">الخصم</Label>
              <Select value={discount} onValueChange={setDiscount}>
                <SelectTrigger id="discount">
                  <SelectValue placeholder="اختر نسبة الخصم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">بدون خصم</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="30">30%</SelectItem>
                  <SelectItem value="40">40%</SelectItem>
                  <SelectItem value="custom">خصم مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {discount === "custom" && (
              <div>
                <Label htmlFor="customDiscount">نسبة الخصم المخصصة (%)</Label>
                <Input
                  id="customDiscount"
                  type="number"
                  min={0}
                  max={100}
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </div>

        {selectedProductData && (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-48 h-48 border rounded-md overflow-hidden">
              <Image
                src={selectedProductData.imageUrl || "/placeholder.svg?height=200&width=200"}
                alt={selectedProductData.name}
                fill
                className="object-contain"
              />
            </div>

            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>السعر قبل الخصم:</span>
                    <span className="font-bold">{basePrice.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>السعر بعد الخصم:</span>
                    <span className="font-bold">{priceAfterDiscount.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>السعر النهائي (شامل 15% ضريبة):</span>
                    <span className="font-bold">{finalPrice.toFixed(2)} ريال</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={handleAddItem} disabled={!selectedProduct || quantity <= 0}>
          إضافة إلى قائمة التسعير
        </Button>
      </div>
    </div>
  )
}
