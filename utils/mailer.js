const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (to, subject, html, pdfBuffer) => {
    try {
        await sgMail.send({
            to,
            from: process.env.EMAIL_USER,
            subject,
            html,
            attachments: pdfBuffer ? [
                {
                    content: pdfBuffer.toString("base64"),
                    filename: "invoice.pdf",
                    type: "application/pdf",
                    disposition: "attachment"
                }
            ] : []
        })

        console.log("MAIL SENT")
        return true

    } catch (err) {
        console.log("MAIL ERROR:", err.response?.body || err.message)
        return false
    }
}

module.exports = sendMail