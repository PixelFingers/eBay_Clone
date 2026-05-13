const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const contactModel= mongoose.model("Contact", contactSchema)
module.exports = contactModel