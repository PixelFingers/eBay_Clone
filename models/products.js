const mongoose= require('mongoose')
const productSchema = new mongoose.Schema({
    ProductName:String,
    Quantity:Number,
    Price:Number,
    ProductDescription:String,
    Category:String,
    GST: {
        type: Number,
        default: 0
    },
    images:[String]
})
const productsModel = mongoose.model("products",productSchema)
module.exports = productsModel