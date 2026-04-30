const puppeteer = require("puppeteer")

const generatePDF = async (html) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({ format: "A4" })

    await browser.close()
    return pdf

  } catch (err) {
    console.log("PDF ERROR:", err.message)
    return null
  }
}
module.exports = generatePDF