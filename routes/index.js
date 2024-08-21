const express = require("express");
const router = express.Router();
const userController = require('../controller/userController');
const adminController = require('../controller/adminController');
const verifyToken = require('../middleware/verifyToken')
const { paymentFunction, verifyPayment } = require('../controller/stripePayment')

const upload = require('../middleware/multer')

let routes = (app) => {
    router.get("/", (req, res) => {
        return res.send("Hello world!")
    });
    router.post("/register", userController.register);
    router.post("/login", userController.login);
    router.post("/changePassword", userController.changePassword);
    router.post('/forgetPassword', userController.ForgetPassword);
    router.post('/resetPassword', userController.ResetPassword);
    router.get('/listCategory', userController.ListCategorys);
    router.get('/listProducts', userController.ListProducts);
    router.get('/listProducts/category/:id', userController.ProductsByCategory);
    router.get('/getSingleProduct/:id', userController.ProductByID)

    //auth api

    router.post('/addtocart', verifyToken, userController.AddtoCart)
    router.post('/deleteFromCart/:id', verifyToken, userController.DeleteFromCart)
    router.post('/updatecart', verifyToken, userController.UpadateCart)
    router.post('/addAddress', verifyToken, userController.AddAddress)
    router.post('/updateAddress', verifyToken, userController.UpdateAddress)
    router.post('/deleteAddress/:id', verifyToken, userController.DeleteAddress)
    router.post('/verifyPayment/', verifyToken, verifyPayment)
    router.post('/payment', verifyToken, paymentFunction)
    router.post('/addRating', verifyToken, userController.AddRating)
    router.get('/listAddress', verifyToken, userController.ListAddress)
    router.get('/listcart', verifyToken, userController.ListCart)
    router.get('/listcards', verifyToken, userController.fetchCards)
    router.get('/fetchOrders', verifyToken, userController.fetchOrders)

    // Admin routes
    router.post('/admin/addCategory', adminController.AddCategory)
    router.post('/admin/addProduct', upload.array("images"), adminController.AddProduct)
    router.post('/admin/deleteCategory', adminController.DeleteCategory)
    router.post('/admin/deleteProduct', adminController.DeleteProduct)
    router.post('/admin/updateProduct', upload.array("newImages"), adminController.UpdateProduct)
    router.post('/admin/updateCategory', adminController.UpdateCategory)
    router.get('/admin/ListProducts/:page', adminController.ListProducts)
    router.get('/admin/ListCategorys', adminController.ListCategory)
    router.get('/admin/DashboardCount', adminController.DashboardCount)
    router.get('/admin/ListUsers/:page', adminController.ListUsers)
    router.get('/admin/fetchOrders', adminController.fetchOrders)
    return app.use("/", router);
};

module.exports = routes;