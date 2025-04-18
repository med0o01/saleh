export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  paintedPrice: number
  unpaintedPrice: number
  unit: "piece" | "meter"
  minQuantity?: number
  imageUrl?: string
}
