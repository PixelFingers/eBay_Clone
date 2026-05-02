const express = require ("express")
const mongoose = require ('mongoose')
const cors = require ("cors")
const userModel = require ("./models/users")
const productModel =require("./models/products")
const cartsModel =require("./models/cart")
const orderModel = require("./models/orders")
const multer =require("multer")
const cloudinary = require("cloudinary").v2
const path = require("path")
const Razorpay = require("razorpay")
const app = express()
const { sendMail, sendStatusMail } = require("./utils/mailer")
const generatePDF = require("./utils/pdf")
const invoiceHTML = require("./utils/invoiceHTML")
app.use(express.json())
const fs = require("fs")
app.use(cors({
    origin: ["https://ebay-cloned-app.netlify.app","http://localhost:5173"],
    credentials: true
}))
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch(err => console.log(err))
const session = require("express-session")
app.set("trust proxy", 1)
app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: "none"
    }
}))
const categoryGST = {
  "Mens Clothes": 12,
  "Womens Clothes": 12,
  "Kids Clothes": 5,
  "Accessories": 12,
  "Footwear": 12,
  "Laptops": 18,
  "Computers": 18,
  "Mobile": 18,
  "TV and Home": 18,
  "Digital Accessories": 18,
  "Pet Necessities": 5,
  "Plant Life": 0,
  "Skincare and Haircare": 18,
  "Garden and Housing": 12,
  "Toys and Games": 12,
  "Others": 18
}
app.post('/Login',(req,res)=>{
    const{Email,Password} = req.body; 
    userModel.findOne({Email:Email})
    .then(user => {
        if(user){
        if(user.Password === Password ){
            req.session.user = {
                id: user._id,
                role: user.role
            }
            res.json({
                status: "Success",
                role: user.role
            })}else{
                res.json("The password is incorrect")
             }}
            else{
                res.json("User does not exist")}
        })
    })
app.get("/check-session", (req,res)=>{
    if(req.session.user){
        res.json({ loggedIn: true, user: req.session.user })
    } else {
        res.json({ loggedIn: false })
    }
})
app.get("/logout", (req,res)=>{
    req.session.destroy()
    res.json("Logged out")
})
app.post('/Signup',(req,res)=>
{ 
 userModel.create(req.body)
 .then (users => res.json(users))
 .catch(err=>res.json(err))
})

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const storage = multer.diskStorage({})
const upload = multer({ storage })

app.get("/admin/manageproduct", (req,res)=>{
    if(!req.session.user || req.session.user.role !== "admin"){
        return res.json("Not authorized")
    }
    productModel.find()
    .then(products => res.json(products))
})

app.post("/admin/addproduct", upload.array("images",10), async (req,res)=>{
    try{
        let imageUrls = []
        for (let file of req.files) {
            const result = await cloudinary.uploader.upload(file.path)
            imageUrls.push(result.secure_url)
        }
        const gstValue = categoryGST[req.body.Category] ?? 0
        const newProduct = new productModel({
            ProductName: req.body.ProductName,
            Quantity: req.body.Quantity,
            Price: req.body.Price,
            ProductDescription: req.body.ProductDescription,
            Category: req.body.Category,
            GST: gstValue,
            images: imageUrls
        })
        await newProduct.save()
        res.json("Product Added")

    }catch(err){
        console.log(err)
        res.json("Error uploading product")
    }})
app.use("/uploads", express.static("uploads"))
app.delete("/admin/deleteProduct/:id", async(req,res) => {
    try {
        const product = await productModel.findById(req.params.id)
        for (let img of product.images) {
            const publicId = img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy({publicId})
        }
        await productModel.findByIdAndDelete(req.params.id)
        res.json("Product deleted")
    } catch (err) {
        console.log(err)
        res.json("Error deleting product")
    }
})
app.get("/admin/getproduct/:id",(req,res)=>{
    productModel.findById(req.params.id)
    .then(product=>res.json(product))
    .catch(err=>res.json(err))
})
app.put("/admin/editproduct/:id",(req,res)=>{
    productModel.findByIdAndUpdate(req.params.id,{
        ProductName:req.body.ProductName,
        Quantity:req.body.Quantity,
        Price:req.body.Price,
        ProductDescription:req.body.ProductDescription,
        Category:req.body.Category
    })
    .then(product=>res.json(product))
    .catch(err=>res.json(err))
})
app.get("/products", (req,res)=>{
    productModel.find()
    .then(products => res.json(products))
    .catch(err => res.json(err))
})
app.get("/product/:id",async(req,res)=>{
    await productModel.findById(req.params.id)
    .then(product=>res.json(product))
    .catch(err=>res.json(err))
})
app.post("/cart/add", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json("Please login first")
        }
        const userId= req.session.user.id
        const productId=req.body.productId
        let cart=await cartsModel.findOne({userId})
        if (!cart){
            const newCart=new cartsModel({
                userId,
                products:[{productId, quantity:1}]
            })
            await newCart.save()
            return res.json("Cart created and product added")
        }
        const existingProduct=cart.products.find(
            item =>item.productId=== productId
        )
        if(existingProduct){
            existingProduct.quantity+=1
        }else{
            cart.products.push({ productId,quantity:1})
        }
        await cart.save()
        res.json("Product added to cart")
    }catch(err){
        console.log(err)
        res.json("Error adding to cart")    
    }
})
app.get("/cart", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json([])
        }
        const userId = req.session.user.id
        const cart = await cartsModel.findOne({ userId })
        if (!cart) {
            return res.json([])
        }
        const detailedCart = await Promise.all(
            cart.products.map(async (item) => {
                const product = await productModel.findById(item.productId)
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    ProductName: product.ProductName,
                    Price: product.Price,
                    GST: product.GST,
                    images: product.images
                }
            })
        )
        res.json(detailedCart)
    } catch (err) {
        console.log(err)
        res.json([])
    }
})
app.post("/cart/update", async (req, res) => {
    try {
        const userId = req.session.user.id
        const { productId, action } = req.body
        const cart = await cartsModel.findOne({ userId })
        if (!cart) return res.json("Cart not found")
        const product = cart.products.find(
            item => item.productId === productId
        )
        if (!product) return res.json("Product not found")
        if (action === "increase") {
            product.quantity += 1
        } else if (action === "decrease") {
            product.quantity -= 1
            if (product.quantity <= 0) {
                cart.products = cart.products.filter(
                    item => item.productId !== productId
                )}
        }
        await cart.save()
        res.json("Updated")
    } catch (err) {
        console.log(err)
        res.json("Error updating cart")
    }
})
app.post("/cart/remove",async(req,res)=>{
    try{
        const userId=req.session.user.id
        const productId=req.body.productId
        const cart=await cartsModel.findOne({ userId })
        cart.products=cart.products.filter(
            item=>item.productId!==productId
        )
        await cart.save()
        res.json("Item removed")
    } catch (err) {
        console.log(err)
        res.json("Error removing item")
    }
})

app.post("/payment/orders", async (req, res) => {
    try {
        const { amount } = req.body
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        }
        const order = await razorpay.orders.create(options)
        res.json(order)
    } catch (err) {
        console.log(err)
        res.status(500).send("Error creating Razorpay order")
    }
})
app.post("/order/place", async (req, res) => {
    try {
        if (!req.session.user){ 
            return res.json("Please login first")
        }
        if (!req.session.user) {
            return res.json("Please login first")
         }
        const userId = req.session.user.id
        let detailedProducts = []

        if (req.body.buyNowItem) {
            const p = req.body.buyNowItem
            detailedProducts = [{
                productId: p._id,
                ProductName: p.ProductName,
                Price: p.Price,
                quantity: p.quantity,
                Category: p.Category,
                GST: p.GST,
                image:  p.image
            }]
        } else {
            const cart = await cartsModel.findOne({ userId })
            if (!cart || cart.products.length === 0) 
                return res.json("Cart is empty")

            detailedProducts = await Promise.all(
                cart.products.map(async (item) => {
                    const product = await productModel.findById(item.productId)
                    return {
                        productId: item.productId,
                        ProductName: product.ProductName,
                        Price: product.Price,
                        quantity: item.quantity,
                        Category: product.Category,
                        GST: product.GST ,
                        image: product.images[0]
                    }
                })
            )
        }

        let total = 0
        let gstTotal = 0

        detailedProducts.forEach(p => {
            const itemTotal = p.Price * p.quantity
            const gstAmount = (itemTotal * (p.GST || 0)) / 100
            total += itemTotal
            gstTotal += gstAmount
        })

        const shipping = total * 0.05
        const finalTotal = total + shipping + gstTotal

        let paymentId = req.body.paymentId || "COD-" + Date.now()
        let paymentStatus = req.body.paymentMethod === "COD" ? "Pending" : "Completed"

        const newOrder = new orderModel({
            userId,
            email: req.body.email,
            customerName: req.body.firstName + " " + req.body.lastName,
            products: detailedProducts,
            shippingAmount: Number(shipping.toFixed(2)),
            totalAmount: Number(finalTotal.toFixed(2)),
            gstAmount: Number(gstTotal.toFixed(2)),
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            paymentMode: req.body.paymentMethod,
            paymentId,
            paymentStatus
        })
        const savedOrder = await newOrder.save()
        const invoiceTemplate = invoiceHTML(savedOrder)
        const pdfBuffer = await generatePDF(invoiceTemplate)
        console.log("PDF BUFFER:", pdfBuffer ? "OK" : "FAILED")
        if (!pdfBuffer) {
            console.log("PDF failed, sending mail without attachment")
        }
        await sendMail(
            savedOrder.email,
            {
                orderId: savedOrder._id,
                date: new Date(savedOrder.createdAt).toLocaleDateString(),
                name: savedOrder.customerName,
                email: savedOrder.email,
                address: savedOrder.address,
                products: savedOrder.products.map(p => ({
                ProductName: p.ProductName,
                quantity: p.quantity,
                itemTotal: (p.Price * p.quantity).toFixed(2),
                image: p.image || ""
                })),
                totalprices: ( savedOrder.totalAmount - savedOrder.gstAmount - savedOrder.shippingAmount).toFixed(2),
                gst: savedOrder.gstAmount.toFixed(2),
                shipping: savedOrder.shippingAmount.toFixed(2),
                total: savedOrder.totalAmount.toFixed(2)
            },
            pdfBuffer
            )
            console.log("Email sent with invoice")
        if (!req.body.buyNowItem) {
            await cartsModel.findOneAndDelete({ userId })
        }

        return res.json("Order placed successfully")

    } catch (err) {
        console.log(err)
        return res.json("Error placing order")
    }
})
app.get("/orders", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json([])
        }
        const userId = req.session.user.id
        const orders = await orderModel.find({ userId }).sort({ createdAt: -1 })
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.json([])}
})
app.get("/admin/orders", async (req, res) => {
    try {
        if(!req.session.user || req.session.user.role !== "admin"){
            return res.json("Not authorized")
        }
        const orders = await orderModel.find().sort({ createdAt: -1 })
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.json([])
    }
})

app.put("/admin/orders/:id", async (req, res) => {
    try {
        const updated = await orderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus: req.body.status },
            { returnDocument: 'after'  }
        )
        if (updated?.email) {
        await sendStatusMail(updated.email, {
            name: updated.customerName,
            orderId: updated._id,
            status: updated.orderStatus,
            total: updated.totalAmount.toFixed(2)
            })
        }
        res.json(updated)
    }catch(err){
        console.log(err)
        res.json("Error updating order")
    }
})
app.put("/orders/cancel/:id", async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id)
        if (!order || order.userId !== req.session.user.id) {
            return res.json("Not authorized")
        }
        const updated1 = await orderModel.findByIdAndUpdate(
            req.params.id,
            { orderStatus: "Cancelled" },
            { new: true }
        )
        if (updated1.email) {
            await sendStatusMail(updated1.email, {
                name: updated1.customerName,
                orderId: updated1._id,
                status: "Cancelled",
                total: updated1.totalAmount.toFixed(2)
            })
        }
        res.json(updated1)
    } catch (err) {
        console.log(err)
        res.json("Error updating order")
    }
})
app.delete("/admin/orders/:id", async (req, res) => {
    try {
        await orderModel.findByIdAndDelete(req.params.id)
        res.json("Order deleted")
    }catch (err){
        console.log(err)
        res.json("Error deleting order")
    }
})
app.get("/search", async(req,res) => {
    try{
        const query = req.query.query
        const products = await productModel.find({
            $or :[ 
            {
            ProductName: {
                $regex: query,
                $options: "i"
            }},
            {
            ProductDescription: {
                    $regex: query,
                    $options: "i"
                }
            },
            {
            Category: {
                    $regex: query,
                    $options: "i"
            }
        }   
        ]
        })
        res.json(products)
    } catch(err) {
        console.log(err)
        res.status(400).json({message:err.message});
    }
})
app.get("/admin/orders/search", async (req, res) => {
    try {
        const query = req.query.query
        const orders = await orderModel.find({
            $or: [
                {customerName: {
                        $regex: query,
                        $options: "i"
                    }
                },
                {email: {
                        $regex: query,
                        $options: "i"
                    }
                }
            ]
        })
        res.json(orders)
    } catch (err) {
        console.log(err)
        res.json([])
    }
})
app.get("/admin/overview", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.json("Not authorized")
  }
  try {
    const recent = await orderModel.find().sort({ createdAt: -1 }).limit(5)
    const allOrders = await orderModel.find()
    const products = await productModel.find()
    let totalRevenue = 0
    let totalPayments = 0
    let categorySales = {}
    let shippingamt = 0
    allOrders.forEach(order => {
        if (order.orderStatus === "Cancelled" || order.orderStatus === "Returned") {
            return
        }
        totalRevenue += Number(order.totalAmount)
        shippingamt += Number(order.shippingAmount)
        if (order.paymentStatus === "Completed") {
            totalPayments++
        }
        order.products.forEach(p => {
            const category = p.Category || p.category || "Others"
            if (!categorySales[category]) {
                categorySales[category] = 0
            }
        categorySales[category] += p.quantity
        })
    })
    res.json({
      totalOrders: allOrders.length,
      totalRevenue,
      totalPayments,
      shippingamt,
      totalProducts: products.length,
      recentOrders: recent || [],
      categorySales
    })
  } catch (err) {
    console.log(err)
    res.json("Error")
  }
})
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log("Server Running...")
})