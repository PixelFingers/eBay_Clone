const mongoose= require('mongoose')
const ordersSchema = new mongoose.Schema({
    userId:String,
    email:String,
    customerName:String,
    products:[
        {
            productId: String,
            ProductName: String,
            Price: Number,
            quantity: Number,
            GST: Number,
            Category:String,
            image: String
        }
    ],
    shippingAmount: Number,
    totalAmount: Number,
    gstAmount: Number,
    address:String,
    phoneNumber:String,
    paymentMode: {
        type: String,
        enum: ["COD", "UPI", "Card","ONLINE"],
        default: "COD"
    },
    paymentId:String,
    orderStatus: {
        type: String,
        enum:["Pending","Shipped","Out for Delivery","Delivered","Cancelled","Returned"],
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },
    orderDate: {
        type:Date,
        default:Date.now
    },
},{ timestamps: true })
const orderModel = mongoose.model("orders",ordersSchema)
module.exports = orderModel