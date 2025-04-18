export interface PricingItem {
  id: string
  productId: string
  productName: string
  categoryId: string
  categoryName: string
  quantity: number
  pieces?: number // Number of pieces for meter-based products
  length?: number // Length in cm for meter-based products
  unit: "piece" | "meter"
  isPainted: boolean
  discount: number
  basePrice: number
  priceAfterDiscount: number
  finalPrice: number
  imageUrl?: string
  extrasPrice?: number // Price for additional features like blockages and outlets
  blockages?: number // Number of blockages (سده)
  outlets?: number // Number of outlets (مخرج)
}
