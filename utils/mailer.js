const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (to, data, pdfBuffer) => {
  try {
    const attachments = []

    if (pdfBuffer && pdfBuffer.length > 0) {
      attachments.push({
        content: Buffer.from(pdfBuffer).toString("base64"),
        filename: "invoice.pdf",
        type: "application/pdf",
        disposition: "attachment"
      })
    }

    await sgMail.send({
      to,
      from: process.env.EMAIL_USER,
      templateId: "d-e9acec6f9dd349feb60a299c5a6c33e2",
      dynamic_template_data: data,
      attachments
    })

    console.log("ORDER MAIL SENT")
    return true

  } catch (err) {
    console.log("ORDER MAIL ERROR:", err.response?.body || err.message)
    return false
  }
}


const sendStatusMail = async (to, data) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_USER,
      templateId: "d-c996ab8a0d444e009520216c6acac6ea", 
      dynamic_template_data: data
    })

    console.log("STATUS MAIL SENT")
    return true

  } catch (err) {
    console.log("STATUS MAIL ERROR:", err.response?.body || err.message)
    return false
  }
}

module.exports = { sendMail, sendStatusMail }