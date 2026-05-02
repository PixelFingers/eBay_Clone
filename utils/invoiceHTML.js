const invoiceHTML = (order) => {

  return `
  <div style="margin:10px;">
    
    <div style="display:flex; justify-content:space-between;">
      <img src="https://res.cloudinary.com/dbkylvk3h/image/upload/v1777088477/pngimg.com_-_ebay_PNG14_rm0fxc.png" width="150"/>
      
      <div style="line-height:1;">
        <p>Original for Recipient</p>
        <h3 style="color:#2f8deb;font-family:sans-serif">INVOICE</h3>
        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    <hr style="border-color:#2f8deb">

    <div style="font-size:12px; background:#f4f8fd; border-radius:6px; padding:10px 14px; margin-bottom:14px;">
      <p style="margin:4px 0;"><span style="color:#888;">Order ID:</span> <strong>${order._id}</strong></p>
      <p style="margin:4px 0;"><span style="color:#888;">Name:</span> ${order.customerName}</p>
      <p style="margin:4px 0;"><span style="color:#888;">Email:</span> ${order.email}</p>
      <p style="margin:4px 0;"><span style="color:#888;">Address:</span> ${order.address}</p>
      <p style="margin:4px 0;"><span style="color:#888;">Supplier:</span> eBay Products</p>
    </div>

    <table width="100%" style="text-align:left; font-size:10px; border-collapse:collapse; border-top:2px solid #2f8deb; border-bottom:2px solid #2f8deb;">
      
      <tr style="color:#2f8deb; border-bottom:1px solid #2f8deb;">
        <th style="padding:5px;">PRODUCT</th>
        <th style="padding:5px;">QUANTITY</th>
        <th style="padding:5px;">ITEM PRICE</th>
        <th style="padding:5px;">TOTAL GST</th>
        <th style="padding:5px;">AMOUNT</th>
      </tr>
      ${order.products.map(p => {
        const itemTotal = p.Price * p.quantity
        const gstAmount = (itemTotal * (p.GST || 0)) / 100
        const finalAmount = itemTotal + gstAmount
        return `
          <tr style="border-bottom:1px solid #2f8deb;">
            <td style="padding:5px;">${p.ProductName}</td>
            <td style="padding:5px;">${p.quantity}</td>
            <td style="padding:5px;">$${p.Price.toFixed(2)}</td>
            <td style="padding:5px;">$${gstAmount.toFixed(2)} (${p.GST || 0}%)</td>
            <td style="padding:5px;">$${finalAmount.toFixed(2)}</td>
          </tr>
        `
      }).join("")}
    </table>
    <div style="display:flex; justify-content:space-between; margin-top:20px;">
      <div>
        <p style="font-family:sans-serif; font-weight:bold; font-size:12px; color:#2f8deb;">
          Authorized Signatory
        </p>
        <img src="https://res.cloudinary.com/dbkylvk3h/image/upload/v1777093258/pngegg_6_fglpai.png" width="100"/>
      </div>

      <div style="line-height:1.8; font-size:12px; font-family:arial; text-align:right; background:#f4f8fd; border-radius:6px; padding:10px 16px;">
        <p style="margin:0; color:#555;">Shipping: US $${order.shippingAmount?.toFixed(2)}</p>
        <p style="margin:0; color:#555;">Subtotal: $${(order.totalAmount - order.gstAmount - order.shippingAmount).toFixed(2)}</p>
        <p style="margin:0; color:#555;">GST: $${order.gstAmount.toFixed(2)}</p>
        <p style="margin:4px 0 0; font-size:15px; font-weight:bold; color:#2f8deb;">Total: US $${order.totalAmount.toFixed(2)}</p>
      </div>

    </div>

  </div>
  `
}

module.exports = invoiceHTML