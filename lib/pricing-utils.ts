export const calculatePrice = (
  basePrice: number,
  quantity: number,
  discountPercent: number,
  minQuantity = 0.5,
  unit = "piece",
  extrasPrice = 0,
): {
  priceBeforeDiscount: number
  priceAfterDiscount: number
  finalPriceWithTax: number
} => {
  // Adjust quantity based on minimum requirements
  let adjustedQuantity = quantity

  if (unit === "meter" && quantity < minQuantity) {
    adjustedQuantity = minQuantity
  }

  // Calculate price before discount
  const priceBeforeDiscount = basePrice * adjustedQuantity

  // Calculate discount amount
  const discountAmount = priceBeforeDiscount * (discountPercent / 100)

  // Calculate price after discount
  const priceAfterDiscount = priceBeforeDiscount - discountAmount

  // Add 15% tax
  const tax = priceAfterDiscount * 0.15

  // Add extras price and tax
  const finalPriceWithTax = priceAfterDiscount + tax + extrasPrice

  return {
    priceBeforeDiscount,
    priceAfterDiscount,
    finalPriceWithTax,
  }
}

// Format quantity display based on unit type
export const formatQuantity = (qty: number, unit: "piece" | "meter") => {
  if (unit === "piece") {
    return `${qty} قطعة`
  } else {
    // For meters, format nicely
    if (qty < 1) {
      // Convert to cm if less than 1 meter
      return `${Math.round(qty * 100)} سم`
    } else {
      // Show as meters with 2 decimal places
      return `${qty.toFixed(2)} متر`
    }
  }
}
