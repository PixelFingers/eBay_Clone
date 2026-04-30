const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (to, subject, html) => {
    try {
        await sgMail.send({
            to,
            from: process.env.EMAIL_USER,
            subject,
            html
        })
        console.log("MAIL SENT")
        return true
    } catch (err) {
        console.log("MAIL ERROR:", err.message)
        return false
    }
}

module.exports = sendMail