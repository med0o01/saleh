"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/app-layout"
import type { PricingItem } from "@/types/pricing"
import { generatePDF, printPricingTable, shareOnWhatsApp } from "@/lib/export-utils"
import { useData } from "@/lib/data-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, FileText, Printer, Share2, Plus, List, FileIcon as FilePdf } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculatePrice } from "@/lib/pricing-utils"
import type { Product } from "@/types/product"
import Image from "next/image"

// Categories that sell by piece only
const PIECE_ONLY_CATEGORIES = ["1", "5", "6", "9"] // صفيات, مزراب, هويات, اكسسورات

// Categories that need additional fields (like مجري)
const SPECIAL_CATEGORIES = ["2"] // مجري

export default function PricingPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { categories, products } = useData()

  // State for pricing items
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([])

  // State for form inputs
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [length, setLength] = useState<number>(0) // Length in cm for products sold by meter
  const [discount, setDiscount] = useState<string>("0")
  const [customDiscount, setCustomDiscount] = useState<number>(0)
  const [selectedProductData, setSelectedProductData] = useState<Product | null>(null)
  const [isPainted, setIsPainted] = useState<boolean>(false)
  const [unitType, setUnitType] = useState<"piece" | "meter">("piece")

  // Additional fields for special categories like مجري
  const [blockages, setBlockages] = useState<number>(0) // سده
  const [outlets, setOutlets] = useState<number>(0) // مخرج
  const [isSpecialCategory, setIsSpecialCategory] = useState<boolean>(false)

  // State for totals
  const [totalBeforeDiscount, setTotalBeforeDiscount] = useState<number>(0)
  const [totalDiscount, setTotalDiscount] = useState<number>(0)
  const [totalAfterDiscount, setTotalAfterDiscount] = useState<number>(0)
  const [totalTax, setTotalTax] = useState<number>(0)
  const [finalTotal, setFinalTotal] = useState<number>(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter((product) => product.categoryId === selectedCategory)
      setFilteredProducts(filtered)

      // Set default unit type based on category
      if (PIECE_ONLY_CATEGORIES.includes(selectedCategory)) {
        setUnitType("piece")
      }

      // Check if this is a special category that needs additional fields
      setIsSpecialCategory(SPECIAL_CATEGORIES.includes(selectedCategory))

      // Reset additional fields when changing categories
      if (!SPECIAL_CATEGORIES.includes(selectedCategory)) {
        setBlockages(0)
        setOutlets(0)
      }

      // Clear selected product when category changes
      setSelectedProduct("")
      setSelectedProductData(null)
    } else {
      setFilteredProducts([])
      setSelectedProduct("")
      setSelectedProductData(null)
    }
  }, [selectedCategory, products])

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.id === selectedProduct) || null
      setSelectedProductData(product)

      if (product) {
        // Set unit type based on product
        setUnitType(product.unit)

        // Reset quantity to appropriate default
        if (product.unit === "meter") {
          setQuantity(1) // Default to 1 piece
          setLength(product.minQuantity ? product.minQuantity * 100 : 50) // Convert min quantity to cm
        } else {
          setQuantity(1)
          setLength(0)
        }
      }
    } else {
      setSelectedProductData(null)
    }
  }, [selectedProduct, products])

  useEffect(() => {
    // Calculate totals
    let beforeDiscount = 0
    let discountAmount = 0
    let afterDiscount = 0
    let taxAmount = 0
    let final = 0

    pricingItems.forEach((item) => {
      const itemTotal = item.basePrice * item.quantity
      beforeDiscount += itemTotal
      discountAmount += itemTotal * (item.discount / 100)
    })

    afterDiscount = beforeDiscount - discountAmount
    taxAmount = afterDiscount * 0.15
    final = afterDiscount + taxAmount

    setTotalBeforeDiscount(beforeDiscount)
    setTotalDiscount(discountAmount)
    setTotalAfterDiscount(afterDiscount)
    setTotalTax(taxAmount)
    setFinalTotal(final)
  }, [pricingItems])

  const getDiscountValue = (): number => {
    if (discount === "custom") {
      return customDiscount
    }
    return Number.parseFloat(discount)
  }

  const calculateTotalLength = (): number => {
    // Convert length from cm to meters
    return length / 100
  }

  const calculateExtrasPrice = (): number => {
    // This is a placeholder - you would need to define the actual pricing for extras
    // For example, each blockage might cost 10 SAR and each outlet 15 SAR
    const blockagePrice = 10
    const outletPrice = 15

    return blockages * blockagePrice + outlets * outletPrice
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

    if (quantity <= 0 || (unitType === "meter" && length <= 0)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال كمية صحيحة",
      })
      return
    }

    const discountValue = getDiscountValue()
    const basePrice = isPainted ? selectedProductData.paintedPrice : selectedProductData.unpaintedPrice

    // Calculate total length in meters
    const totalLength = unitType === "meter" ? calculateTotalLength() : 0

    // Apply minimum quantity rule if needed
    let adjustedLength = totalLength
    if (unitType === "meter" && selectedProductData.minQuantity && totalLength < selectedProductData.minQuantity) {
      adjustedLength = selectedProductData.minQuantity
    }

    // Calculate extras price for special categories
    const extrasPrice = isSpecialCategory ? calculateExtrasPrice() : 0

    // For special categories like مجري, we need to calculate price differently
    let finalQuantity = quantity
    if (unitType === "meter") {
      finalQuantity = adjustedLength
    }

    const { priceBeforeDiscount, priceAfterDiscount, finalPriceWithTax } = calculatePrice(
      basePrice,
      finalQuantity,
      discountValue,
      selectedProductData.minQuantity || 0.5,
      unitType,
      extrasPrice,
    )

    // Create description for extras if applicable
    let extrasDescription = ""
    if (isSpecialCategory) {
      const parts = []
      if (blockages > 0) {
        parts.push(`سده: ${blockages}`)
      }
      if (outlets > 0) {
        parts.push(`مخرج: ${outlets}`)
      }
      if (parts.length > 0) {
        extrasDescription = `(${parts.join(", ")})`
      }
    }

    const newItem: PricingItem = {
      id: Date.now().toString(),
      productId: selectedProduct,
      productName: `${selectedProductData.name} ${extrasDescription}`,
      categoryId: selectedCategory,
      categoryName: categories.find((c) => c.id === selectedCategory)?.name || "",
      quantity: unitType === "meter" ? finalQuantity : quantity, // Use adjusted length for meter products
      pieces: unitType === "meter" ? quantity : 0, // Store number of pieces for meter products
      length: unitType === "meter" ? length : 0, // Store length in cm
      unit: unitType,
      isPainted,
      discount: discountValue,
      basePrice: basePrice, // Store the unit price
      extrasPrice: extrasPrice, // Store the price of extras
      blockages: blockages,
      outlets: outlets,
      priceAfterDiscount,
      finalPrice: finalPriceWithTax,
      imageUrl: selectedProductData.imageUrl,
    }

    setPricingItems([...pricingItems, newItem])

    // Reset form fields
    if (unitType === "meter") {
      setLength(selectedProductData.minQuantity ? selectedProductData.minQuantity * 100 : 50)
    } else {
      setQuantity(1)
    }

    // Reset extras
    setBlockages(0)
    setOutlets(0)

    toast({
      title: "تمت الإضافة",
      description: "تم إضافة المنتج إلى جدول التسعير",
    })
  }

  const handleRemoveItem = (id: string) => {
    setPricingItems(pricingItems.filter((item) => item.id !== id))
  }

  const handleClearAll = () => {
    setPricingItems([])
  }

  const handleSaveAsPDF = () => {
    if (pricingItems.length === 0) {
      toast({
        variant: "destructive",
        title: "لا توجد عناصر",
        description: "يرجى إضافة عناصر قبل محاولة الحفظ كملف PDF",
      })
      return
    }

    generatePDF(pricingItems)
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ جدول التسعير كملف PDF",
    })
  }

  const handlePrint = () => {
    if (pricingItems.length === 0) {
      toast({
        variant: "destructive",
        title: "لا توجد عناصر",
        description: "يرجى إضافة عناصر قبل محاولة الطباعة",
      })
      return
    }

    printPricingTable(pricingItems)
  }

  const handleShareOnWhatsApp = () => {
    if (pricingItems.length === 0) {
      toast({
        variant: "destructive",
        title: "لا توجد عناصر",
        description: "يرجى إضافة عناصر قبل محاولة المشاركة",
      })
      return
    }

    shareOnWhatsApp(pricingItems)
    toast({
      title: "جاهز للمشاركة",
      description: "تم إنشاء رابط المشاركة على واتساب",
    })
  }

  // Format quantity display based on unit type and additional information
  const formatQuantityDisplay = (item: PricingItem) => {
    if (item.unit === "piece") {
      return `${item.quantity} قطعة`
    } else {
      // For meters with pieces and length
      const parts = []

      if (item.pieces && item.pieces > 0) {
        parts.push(`${item.pieces} قطعة`)
      }

      if (item.length && item.length > 0) {
        // Convert length from cm to appropriate format
        if (item.length < 100) {
          parts.push(`${item.length} سم`)
        } else {
          const meters = item.length / 100
          parts.push(`${meters.toFixed(2)} متر`)
        }
      }

      return parts.join(" × ")
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6 space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* Selection Area - Compact and Elegant */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="flex items-center mb-1 text-gray-700 text-sm">
                <span className="ml-1">اختر القسم</span>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border border-gray-200 rounded-md h-8 text-sm shadow-sm">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">اختر القسم</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center mb-1 text-gray-700 text-sm">
                <span className="ml-1">اختر المنتج</span>
              </div>
              <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={!selectedCategory}>
                <SelectTrigger className="bg-white border border-gray-200 rounded-md h-8 text-sm shadow-sm">
                  <SelectValue placeholder="اختر المنتج" />
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
          </div>

          {/* Product Details and Pricing - Streamlined and Compact */}
          {selectedCategory && selectedProduct && selectedProductData && (
            <div className="mb-4 border border-gray-100 p-3 rounded-lg bg-gray-50 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image - Smaller and More Compact */}
                <div className="md:w-1/4 flex justify-center">
                  <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-white shadow-sm">
                    <Image
                      src={selectedProductData.imageUrl || "/placeholder.svg?height=200&width=200"}
                      alt={selectedProductData.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Product Details Form - Compact and Organized */}
                <div className="md:w-3/4">
                  <div className="mb-2">
                    <h2 className="text-base font-bold">{selectedProductData.name}</h2>
                    <p className="text-sm text-gray-600">
                      السعر {unitType === "meter" ? "بالمتر" : "بالقطعة"}:{" "}
                      <span className="font-semibold">
                        {isPainted ? selectedProductData.paintedPrice : selectedProductData.unpaintedPrice} ريال
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {/* الكمية والطول في صف واحد */}
                    <div>
                      <Label htmlFor="quantity" className="text-gray-700 mb-1 block text-xs">
                        # الكمية
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min={1}
                        step={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                        className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                      />
                    </div>

                    {unitType === "meter" ? (
                      <div>
                        <Label htmlFor="length" className="text-gray-700 mb-1 block text-xs">
                          الطول (سم)
                        </Label>
                        <Input
                          id="length"
                          type="number"
                          min={1}
                          step={1}
                          value={length}
                          onChange={(e) => setLength(Number.parseInt(e.target.value) || 0)}
                          className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                        />
                      </div>
                    ) : (
                      <div></div> // صندوق فارغ للمحافظة على التنسيق
                    )}

                    {/* الحالة */}
                    <div>
                      <Label htmlFor="painted" className="text-gray-700 mb-1 block text-xs">
                        الحالة
                      </Label>
                      <Select
                        value={isPainted ? "painted" : "unpainted"}
                        onValueChange={(value) => setIsPainted(value === "painted")}
                      >
                        <SelectTrigger
                          id="painted"
                          className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                        >
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="painted">مدهون</SelectItem>
                          <SelectItem value="unpainted">غير مدهون</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* السعر والخصم في صف واحد */}
                    <div>
                      <Label htmlFor="price" className="text-gray-700 mb-1 block text-xs">
                        السعر (ريال)
                      </Label>
                      <Input
                        id="price"
                        type="text"
                        value={isPainted ? selectedProductData.paintedPrice : selectedProductData.unpaintedPrice}
                        readOnly
                        className="bg-gray-50 border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discount" className="text-gray-700 mb-1 block text-xs">
                        % الخصم
                      </Label>
                      <Select value={discount} onValueChange={setDiscount}>
                        <SelectTrigger
                          id="discount"
                          className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                        >
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
                        <Label htmlFor="customDiscount" className="text-gray-700 mb-1 block text-xs">
                          نسبة الخصم المخصصة (%)
                        </Label>
                        <Input
                          id="customDiscount"
                          type="number"
                          min={0}
                          max={100}
                          value={customDiscount}
                          onChange={(e) => setCustomDiscount(Number.parseFloat(e.target.value) || 0)}
                          className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                        />
                      </div>
                    )}

                    {/* Special category fields */}
                    {isSpecialCategory && (
                      <>
                        <div>
                          <Label htmlFor="blockages" className="text-gray-700 mb-1 block text-xs">
                            عدد السده
                          </Label>
                          <Input
                            id="blockages"
                            type="number"
                            min={0}
                            step={1}
                            value={blockages}
                            onChange={(e) => setBlockages(Number.parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="outlets" className="text-gray-700 mb-1 block text-xs">
                            عدد المخرج
                          </Label>
                          <Input
                            id="outlets"
                            type="number"
                            min={0}
                            step={1}
                            value={outlets}
                            onChange={(e) => setOutlets(Number.parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-200 rounded-md h-7 text-sm shadow-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={handleAddItem}
                      disabled={!selectedProduct || quantity <= 0 || (unitType === "meter" && length <= 0)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 h-8 rounded-md flex items-center text-sm"
                    >
                      <Plus className="h-3 w-3 ml-1" />
                      إضافة إلى الجدول
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Table - Clean and Compact */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
              <h2 className="text-base font-bold flex items-center">
                <FileText className="h-4 w-4 ml-1" />
                جدول التسعير
              </h2>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                disabled={pricingItems.length === 0}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-0 h-6 rounded-md flex items-center text-xs"
              >
                <Trash2 className="h-3 w-3 ml-1" />
                مسح الكل
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-center text-xs py-2">المنتج</TableHead>
                    <TableHead className="text-center text-xs py-2"># الكمية</TableHead>
                    <TableHead className="text-center text-xs py-2">السعر</TableHead>
                    <TableHead className="text-center text-xs py-2">% الخصم</TableHead>
                    <TableHead className="text-center text-xs py-2">المجموع</TableHead>
                    <TableHead className="text-center text-xs py-2 w-10">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-3 text-gray-500 text-sm">
                        لا توجد عناصر في جدول التسعير
                      </TableCell>
                    </TableRow>
                  ) : (
                    pricingItems.map((item) => {
                      const itemTotal = item.basePrice * item.quantity
                      const discountAmount = itemTotal * (item.discount / 100)
                      const afterDiscount = itemTotal - discountAmount
                      const tax = afterDiscount * 0.15
                      const finalPrice = afterDiscount + tax + (item.extrasPrice || 0)

                      return (
                        <TableRow key={item.id} className="text-sm">
                          <TableCell className="text-center py-2">{item.productName}</TableCell>
                          <TableCell className="text-center py-2">{formatQuantityDisplay(item)}</TableCell>
                          <TableCell className="text-center py-2">{item.basePrice.toFixed(2)} ريال</TableCell>
                          <TableCell className="text-center py-2">{item.discount}%</TableCell>
                          <TableCell className="text-center py-2">{finalPrice.toFixed(2)} ريال</TableCell>
                          <TableCell className="text-center py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Invoice Summary - Compact and Clear */}
          {pricingItems.length > 0 && (
            <div className="mb-4 border-r-3 border-blue-500 bg-white p-3 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold flex items-center">
                  <FileText className="h-4 w-4 ml-1" />
                  ملخص الفاتورة
                </h2>
              </div>

              <div className="grid grid-cols-2 text-sm gap-1">
                <div className="flex justify-between py-1">
                  <span>المجموع قبل الخصم:</span>
                  <span className="font-semibold">{totalBeforeDiscount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>قيمة الخصم:</span>
                  <span className="font-semibold">{totalDiscount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>المجموع بعد الخصم:</span>
                  <span className="font-semibold">{totalAfterDiscount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>الضريبة (15%):</span>
                  <span className="font-semibold">{totalTax.toFixed(2)} ر.س</span>
                </div>
                <div className="col-span-2 flex justify-between py-1 border-t border-blue-500 font-bold">
                  <span>المجموع النهائي:</span>
                  <span>{finalTotal.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - Compact and Accessible */}
          {pricingItems.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center h-8 text-xs"
                onClick={handleShareOnWhatsApp}
              >
                <Share2 className="h-3 w-3 ml-1" />
                واتساب
              </Button>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center h-8 text-xs">
                <List className="h-3 w-3 ml-1" />
                الكميات
              </Button>
              <Button
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-md flex items-center justify-center h-8 text-xs"
                onClick={handlePrint}
              >
                <Printer className="h-3 w-3 ml-1" />
                طباعة
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center justify-center h-8 text-xs"
                onClick={handleSaveAsPDF}
              >
                <FilePdf className="h-3 w-3 ml-1" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
