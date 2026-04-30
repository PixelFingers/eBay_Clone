const puppeteer = require("puppeteer-core")
const chromium = require("chrome-aws-lambda")

const generatePDF = async (html) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    })

    await browser.close()
    return pdf

  } catch (err) {
    console.log("PDF ERROR:", err.message)
    return null
  }
}

module.exports = generatePDF