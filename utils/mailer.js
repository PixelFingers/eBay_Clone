const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (to, data, pdfBuffer) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_USER,

      templateId: "d-e9acec6f9dd349feb60a299c5a6c33e2",

      dynamic_template_data: data,
      attachments: pdfBuffer ? [
            {
              content: pdfBuffer.toString("base64"),
              filename: "invoice.pdf",
              type: "application/pdf",
              disposition: "attachment"
            }
          ]
        : []})
    console.log("MAIL SENT")
    return true
  } catch (err) {
    console.log("MAIL ERROR:", err.response?.body || err.message)
    return false
  }
}

module.exports = sendMail