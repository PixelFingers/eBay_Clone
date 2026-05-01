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

    <div style="font-size:12px; font-family:sans-serif;">
      <p>Order ID: ${order._id}</p>
      <p>Name: ${order.customerName}</p>
      <p>Email: ${order.email}</p>
      <p>Address: ${order.address}</p>
      <p>Supplier: eBay Products</p>
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

      <div style="line-height:1.2; font-size:12px; font-family:arial; text-align:right;">
        <p>Shipping: US $${order.shippingAmount?.toFixed(2)}</p>
        <h4>Total: US $${order.totalAmount.toFixed(2)}</h4>
        <p>Subtotal: $${(order.totalAmount - order.gstAmount - order.shippingAmount).toFixed(2)}</p>
        <p>GST: $${order.gstAmount.toFixed(2)}</p>
      </div>

    </div>

  </div>
  `
}

module.exports = invoiceHTML