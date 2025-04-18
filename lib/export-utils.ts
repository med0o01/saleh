import type { PricingItem } from "@/types/pricing"

// Generate PDF
export const generatePDF = (items: PricingItem[]): void => {
  // In a real app, this would use a library like jsPDF
  // For now, we'll just open a new window with the data
  const newWindow = window.open("", "_blank")
  if (!newWindow) return

  const totalPrice = items.reduce((total, item) => total + item.finalPrice, 0)

  newWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تسعير المنتجات - المنيوم الصالح</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          font-weight: bold;
          text-align: left;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logo.png" alt="المنيوم الصالح" class="logo">
        <h1>تسعير المنتجات</h1>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الصنف</th>
            <th>القسم</th>
            <th>الكمية</th>
            <th>الحالة</th>
            <th>الخصم</th>
            <th>السعر النهائي</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td>${item.categoryName}</td>
              <td>${item.quantity} ${item.unit === "meter" ? "متر" : "قطعة"}</td>
              <td>${item.isPainted ? "مدهون" : "غير مدهون"}</td>
              <td>${item.discount}%</td>
              <td>${item.finalPrice.toFixed(2)} ريال</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="total">
        <p>إجمالي السعر: ${totalPrice.toFixed(2)} ريال</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} المنيوم الصالح - جميع الحقوق محفوظة</p>
      </div>
    </body>
    </html>
  `)

  newWindow.document.close()
  setTimeout(() => {
    newWindow.print()
  }, 500)
}

// Print pricing table
export const printPricingTable = (items: PricingItem[]): void => {
  const newWindow = window.open("", "_blank")
  if (!newWindow) return

  const totalPrice = items.reduce((total, item) => total + item.finalPrice, 0)

  newWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>جدول التسعير - المنيوم الصالح</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          font-weight: bold;
          text-align: left;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logo.png" alt="المنيوم الصالح" class="logo">
        <h1>جدول التسعير</h1>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الصنف</th>
            <th>القسم</th>
            <th>الكمية</th>
            <th>الحالة</th>
            <th>السعر قبل الخصم</th>
            <th>الخصم</th>
            <th>السعر بعد الخصم</th>
            <th>السعر النهائي (شامل الضريبة)</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.productName}</td>
              <td>${item.categoryName}</td>
              <td>${item.quantity} ${item.unit === "meter" ? "متر" : "قطعة"}</td>
              <td>${item.isPainted ? "مدهون" : "غير مدهون"}</td>
              <td>${(item.basePrice * item.quantity).toFixed(2)} ريال</td>
              <td>${item.discount}%</td>
              <td>${item.priceAfterDiscount.toFixed(2)} ريال</td>
              <td>${item.finalPrice.toFixed(2)} ريال</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="total">
        <p>إجمالي السعر: ${totalPrice.toFixed(2)} ريال</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} المنيوم الصالح - جميع الحقوق محفوظة</p>
      </div>
    </body>
    </html>
  `)

  newWindow.document.close()
  setTimeout(() => {
    newWindow.print()
  }, 500)
}

// Print quantity table
export const printQuantityTable = (items: PricingItem[]): void => {
  const newWindow = window.open("", "_blank")
  if (!newWindow) return

  // Group items by category
  const groupedItems: Record<string, PricingItem[]> = {}
  items.forEach((item) => {
    if (!groupedItems[item.categoryId]) {
      groupedItems[item.categoryId] = []
    }
    groupedItems[item.categoryId].push(item)
  })

  newWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>جدول الكميات - المنيوم الصالح</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          direction: rtl;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 10px;
        }
        h2 {
          margin-top: 30px;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: right;
        }
        th {
          background-color: #f2f2f2;
        }
        .summary {
          margin-top: 30px;
          border-top: 2px solid #ddd;
          padding-top: 10px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logo.png" alt="المنيوم الصالح" class="logo">
        <h1>جدول الكميات</h1>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
      </div>
      
      ${Object.entries(groupedItems)
        .map(
          ([categoryId, categoryItems]) => `
        <h2>${categoryItems[0].categoryName}</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${categoryItems
              .map(
                (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.quantity} ${item.unit === "meter" ? "متر" : "قطعة"}</td>
                <td>${item.isPainted ? "مدهون" : "غير مدهون"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `,
        )
        .join("")}
      
      <div class="summary">
        <h2>ملخص الكميات</h2>
        <p>إجمالي عدد القطع: ${items.filter((item) => item.unit === "piece").reduce((total, item) => total + item.quantity, 0)} قطعة</p>
        <p>إجمالي عدد الأمتار: ${items
          .filter((item) => item.unit === "meter")
          .reduce((total, item) => total + item.quantity, 0)
          .toFixed(2)} متر</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} المنيوم الصالح - جميع الحقوق محفوظة</p>
      </div>
    </body>
    </html>
  `)

  newWindow.document.close()
  setTimeout(() => {
    newWindow.print()
  }, 500)
}

// Share on WhatsApp
export const shareOnWhatsApp = (items: PricingItem[]): void => {
  const totalPrice = items.reduce((total, item) => total + item.finalPrice, 0)

  let message = "طلب تسعير من المنيوم الصالح\n\n"

  items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName} (${item.categoryName})\n`
    message += `   الكمية: ${item.quantity} ${item.unit === "meter" ? "متر" : "قطعة"}\n`
    message += `   الحالة: ${item.isPainted ? "مدهون" : "غير مدهون"}\n`
    message += `   السعر: ${item.finalPrice.toFixed(2)} ريال\n\n`
  })

  message += `إجمالي السعر: ${totalPrice.toFixed(2)} ريال`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)

  // Open WhatsApp with the message
  window.open(`https://wa.me/?text=${encodedMessage}`, "_blank")
}
