const db = require('../modals');
const cron = require("node-cron");
const moment = require('moment')
const User = db.user;
const Product = db.product;
const Category = db.category;
const Cart = db.cart;
const Address = db.address;
const Order = db.order;
const Rating = db.rating;
const UserStrip = db.userStrip;
const bcrypt = require('bcrypt');
const { response } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var nodemailer = require('nodemailer');
const saltRounds = 10;
const jwtSecretKey = process.env.JWT_SECRET;

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).send("Fields can't empty!")
        }
        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            return res.status(401).send("Please enter a valid!")
        }
        const user = await User.findOne({
            where: { email: email }
        })
        if (user) {
            return res.send("User already exist!")
        }
        const encryptedPassword = await bcrypt.hash(password, saltRounds)
        await User.create({
            name: name,
            email: email,
            type: "user",
            password: encryptedPassword,
        })
        const newuser = await User.findOne({
            where: { email: email }
        })
        delete newuser.dataValues.password;
        return res.status(201).send({
            status: true,
            respons: newuser,
            message: `Registered successfully.`,
        });

    }
    catch (error) {
        console.log(error);
        return res.status(400).send(`Error when trying register: ${error}`);
    }
}
const login = async (req, res) => {
    try {
        const { email, type, password } = req.body;
        console.log(req.body);
        if (!email || !password || !type) {
            return res.status(400).send({
                status: false,
                message: "Fields can't empty!",
            })
        }
        if (!email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            return res.status(401).send({
                status: false,
                message: "Please enter a valid!",
            })
        }
        const user = await User.findOne({
            where: { email: email, type: type }
        })
        if (!user) {
            return res.status(401).send({
                status: false,
                message: "Invalid user!",
            })
        }
        const comparison = await bcrypt.compare(password, user.password);
        const token = jwt.sign({ id: user.id, email: user.email }, jwtSecretKey, { expiresIn: "2d", });
        user.dataValues['token'] = token;
        delete user.dataValues.password;

        if (comparison) {
            return res.status(200).send({
                status: true,
                respons: user,
                message: `Login successfully.`,
            });
        } else {
            return res.status(401).send({
                status: false,
                message: "Wrong password!",
            })
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).send(`Error when trying login: ${error}`);
    }
}

const changePassword = async (req, res) => {
    try {
        const { email, password, new_password, confirm_password } = req.body;
        if (!email || !password || !new_password || !confirm_password) {
            return res.status(400).send({
                status: false,
                message: `Field can't be empty.`,
            });
        } else if (new_password !== confirm_password) {
            return res.status(400).send({
                status: false,
                message: `Password not Mached.`,
            });
        }
        const user = await User.findOne({
            where: { email: email }
        })
        if (!user) {
            return res.status(401).send({
                status: false,
                message: `Invalid User.`,
            })
        }
        const comparison = await bcrypt.compare(password, user.password);
        if (comparison) {
            const newcomparison = await bcrypt.compare(new_password, user.password);
            if (newcomparison) {
                return res.status(400).send({
                    status: false,
                    message: `You can't set Current Password As New Password.`,
                });
            }
            const encryptedPassword = await bcrypt.hash(new_password, saltRounds)
            const result = await User.update({
                password: encryptedPassword,
            }, {
                where: { email: email }
            })
            return res.status(200).send({
                status: true,
                message: `Password Changed successfully.`,
            });
        } else {
            return res.status(401).send({
                status: false,
                message: "Invalid Current Password!",
            })
        }

    }
    catch (error) {
        console.log(error);
        return res.status(400).send(`Error when trying change password: ${error}`);
    }
}
const ForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({
                status: false,
                message: 'Please Enter Your Email Address.'
            })
        }
        const user = await User.findOne({
            where: { email: email }
        })
        if (!user) {
            return res.status(401).send({
                status: false,
                message: 'User not exist.',
            })
        }
        const token = jwt.sign({ email: email }, jwtSecretKey, { expiresIn: "10m", });
        var transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "sa0nj1ay@gmail.com",
                pass: "jttoetuvvkmuemzi"
            }
        });
        var mailOptions = {
            from: 'admin@gmail.com',
            to: email,
            subject: 'Forget Password',
            html: `
            <!doctype html>
            <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            </head>
            <body style="font-family: sans-serif;">
                <div style="display: block; margin: auto; max-width: 600px;" class="main">
                <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">Forget Password!</h1>
                <p>Click below link for Reset your password.</p>
                <p>This link will expire within 10 minutes!</p>
                <a href='http://192.168.3.107:3000/resetPassword/${token}' >Click here for reset password.</a>
                </div>
                <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
                <style>
                .main { background-color: white; }
                a:hover { border-left-width: 1em; min-height: 2em; }
                </style>
            </body>
            </html>
            `
        };

        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                return res.send({
                    status: true,
                    message: 'A Forget Password link is sent on Your Email.'
                })
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({
            status: false,
            message: 'Somthing went wrong!'
        })
    }
}
const ResetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;
        if (!token || !password || !confirmPassword) {
            return res.status(400).send({
                status: false,
                message: `Field can't be empty.`
            });
        }
        const verified = await jwt.verify(token, jwtSecretKey);
        if (!verified) {
            return res.status(400).send({
                status: false,
                message: `Link Expired.`
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).send({
                status: false,
                message: `Password not Mached.`
            });
        }
        const email = verified.email;
        const user = await User.findOne({
            where: { email: email }
        })
        if (!user) {
            return res.status(401).send({
                status: false,
                message: "Invalid user!"
            })
        }
        const newcomparison = await bcrypt.compare(password, user.password);
        if (newcomparison) {
            return res.status(400).send({
                status: false,
                message: `You can't set Current Password As New Password.`
            });
        }
        const encryptedPassword = await bcrypt.hash(password, saltRounds)
        const result = await User.update({
            password: encryptedPassword,
        }, {
            where: { email: email }
        })
        return res.status(200).send({
            status: true,
            message: `Password Changed successfully.`,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).send({
            status: false,
            message: `The link has been Expired.`,
        });
    }
}
const ListCategorys = async (req, res) => {
    try {
        const categories = await Category.findAll();
        if (categories) {
            res.status(201).send({
                status: true,
                data: categories,
                message: `Category fetched Successfully.`
            })
        } else {
            res.status(401).send({
                status: false,
                message: `Error while listing category.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while listing category: ${error}`
        })
    }
}
const ListProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        if (products) {
            for (let index = 0; index < products.length; index++) {
                const category = await Category.findOne({
                    where: { "id": products[index].category_id }
                })
                products[index].category_id = category
                products[index].images_url = products[index].images_url.split(",")


            }
            res.status(201).send({
                status: true,
                data: products,
                message: `Products fetched Successfully.`
            })
        } else {
            res.status(401).send({
                status: false,
                message: `Error while listing Products.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while listing Products: ${error}`
        })
    }
}
const ProductsByCategory = async (req, res) => {
    try {
        const id = req.params['id']
        console.log("=>", id);
        const products = await Product.findAll({ where: { category_id: id } });
        if (products) {
            for (let index = 0; index < products.length; index++) {
                const category = await Category.findOne({
                    where: { "id": products[index].category_id }
                })
                products[index].category_id = category
                products[index].images_url = products[index].images_url.split(",")


            }
            setTimeout(() => {
                res.status(201).send({
                    status: true,
                    data: products,
                    message: `Products fetched Successfully.`
                })
            }, 2000)
        } else {
            res.status(401).send({
                status: false,
                message: `Error while listing Products.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while listing Products: ${error}`
        })
    }
}
const ProductByID = async (req, res) => {
    try {
        const id = req.params['id']
        console.log("=>", id);
        const products = await Product.findOne({ where: { id: id } });
        if (products) {
            const category = await Category.findOne({
                where: { "id": products.category_id }
            })
            products.category_id = category
            products.images_url = products.images_url.split(",")
            res.status(201).send({
                status: true,
                data: products,
                message: `Product fetched Successfully.`
            })
        } else {
            res.status(401).send({
                status: false,
                message: `Error while listing Product.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while listing Product: ${error}`
        })
    }
}
const AddtoCart = async (req, res) => {
    const { pro_id, product_price, total_price, quantity } = req.body
    const user_id = req.user.id;
    try {
        if (!pro_id || !product_price || !total_price || !quantity) {
            return res.status(401).send({
                status: false,
                message: `Invalid details.`
            })
        }
        const cart = await Cart.create({
            product_id: pro_id,
            user_id: user_id,
            product_price: product_price,
            total_price: total_price,
            quantity: quantity,
        })
        if (cart) {
            return res.status(201).send({
                status: true,
                data: cart,
                message: `Product Added to cart Successfully.`
            })
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Error while adding to cart.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while adding to cart: ${error}`
        })
    }
}
const ListCart = async (req, res) => {
    const user_id = req.user.id;
    try {
        const cart = await Cart.findAll({
            where: { user_id: user_id }
        })
        if (cart) {
            for (let index = 0; index < cart.length; index++) {
                let product = await Product.findOne({
                    where: { "id": cart[index].product_id }
                })
                product.images_url = product.images_url.split(",")
                cart[index].product_id = product

            }
            return res.status(201).send({
                status: true,
                data: cart,
                message: `Cart Fetched Successfully.`
            })
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Error while geting cart.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while geting cart: ${error}`
        })
    }
}
const DeleteFromCart = async (req, res) => {
    const user_id = req.user.id;
    const id = req.params['id']
    try {
        const cart = await Cart.findOne({
            where: { user_id: user_id, id: id }
        })
        if (cart) {
            const del = await Cart.destroy({
                where: { user_id: user_id, id: id }
            })
            if (del) {
                return res.status(201).send({
                    status: true,
                    message: `Product Deleted Successfully.`
                })
            }
            else {
                return res.status(401).send({
                    status: false,
                    message: `Invalid Product Id.`
                })
            }
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Invalid Product Id.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while deleting product from cart: ${error}`
        })
    }
}
const UpadateCart = async (req, res) => {
    const user_id = req.user.id;
    const { id, quantity, disscount } = req.body
    try {
        const cart = await Cart.findOne({
            where: { user_id: user_id, id: id }
        })
        if (cart) {
            const totalPrice = parseInt(cart.product_price) * parseInt(quantity) - (disscount ? disscount : 0);
            console.log(totalPrice);
            const update = await Cart.update(
                {
                    quantity: parseInt(quantity),
                    total_price: totalPrice
                }
                , {
                    where: { user_id: user_id, id: id }
                })
            if (!update) {
                return res.status(401).send({
                    status: false,
                    message: `Invalid Product Id.`
                })
            }
            return res.status(201).send({
                status: true,
                data: update,
                message: `Product Quantity Increased by 1.`
            })
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Invalid Product Id.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while adding product to cart: ${error}`
        })
    }
}
const AddAddress = async (req, res) => {
    const { name, email, defaulte, street, state, country, zip, phone_no } = req.body
    const user_id = req.user.id;
    try {
        if (!name || !email || !street || !state || !country || !zip || !phone_no) {
            return res.status(401).send({
                status: false,
                message: `Invalid details.`
            })
        }
        if (defaulte) {
            const update = await Address.update({ default: false }, { where: { user_id: user_id } });
            const add = await Address.create({
                user_id: user_id,
                name: name,
                email: email,
                default: defaulte,
                street: street,
                state: state,
                country: country,
                zip: zip,
                phone_no: phone_no,
            })
            if (add) {
                return res.status(201).send({
                    status: true,
                    data: add,
                    message: `Address added Successfully.`
                })
            }
            else {
                return res.status(401).send({
                    status: false,
                    message: `Error while adding address.`
                })
            }
        } else {
            const add = await Address.create({
                user_id: user_id,
                name: name,
                email: email,
                default: false,
                street: street,
                state: state,
                country: country,
                zip: zip,
                phone_no: phone_no,
            })
            if (add) {
                return res.status(201).send({
                    status: true,
                    data: add,
                    message: `Address added Successfully.`
                })
            }
            else {
                return res.status(401).send({
                    status: false,
                    message: `Error while adding address.`
                })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: `Error while adding address: ${error}`
        })
    }
}
const ListAddress = async (req, res) => {
    const user_id = req.user.id;
    try {
        const Addres = await Address.findAll({
            where: { user_id: user_id }
        })
        if (Addres) {
            return res.status(201).send({
                status: true,
                data: Addres,
                message: `Address Fetched Successfully.`
            })
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Error while geting Address.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while geting Address: ${error}`
        })
    }
}
const DeleteAddress = async (req, res) => {
    const user_id = req.user.id;
    const id = req.params['id']
    try {
        const Addres = await Address.findOne({
            where: { user_id: user_id, id: id }
        })
        if (Addres) {
            const del = await Address.destroy({
                where: { user_id: user_id, id: id }
            })
            if (del) {
                return res.status(201).send({
                    status: true,
                    message: `Address deleted Successfully.`
                })
            } else {
                return res.status(401).send({
                    status: false,
                    message: `Error while deleting Address.`
                })
            }
        }
        else {
            return res.status(404).send({
                status: false,
                message: `Invalid Id.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while deleting Address: ${error}`
        })
    }
}
const UpdateAddress = async (req, res) => {
    const { id, name, email, defaulte, street, state, country, zip, phone_no } = req.body
    const user_id = req.user.id;
    try {
        if (!name || !email || !street || !state || !country || !zip || !phone_no) {
            return res.status(401).send({
                status: false,
                message: `Invalid details.`
            })
        }
        const address = await Address.findOne({ where: { id: id } })
        if (address) {
            if (defaulte) {
                const update = await Address.update({ default: false }, { where: { user_id: user_id } });
                const add = await Address.update({
                    user_id: user_id,
                    name: name,
                    email: email,
                    default: defaulte,
                    street: street,
                    state: state,
                    country: country,
                    zip: zip,
                    phone_no: phone_no,
                }
                    , { where: { user_id: user_id, id: id } }
                )
                if (add) {
                    return res.status(201).send({
                        status: true,
                        data: add,
                        message: `Address updated Successfully.`
                    })
                }
                else {
                    return res.status(401).send({
                        status: false,
                        message: `Error while updating address.`
                    })
                }
            } else {
                const add = await Address.update({
                    user_id: user_id,
                    name: name,
                    email: email,
                    default: defaulte,
                    street: street,
                    state: state,
                    country: country,
                    zip: zip,
                    phone_no: phone_no,
                }
                    , { where: { user_id: user_id, id: id } }
                )
                if (add) {
                    return res.status(201).send({
                        status: true,
                        data: add,
                        message: `Address updated Successfully.`
                    })
                }
                else {
                    return res.status(401).send({
                        status: false,
                        message: `Error while updating address.`
                    })
                }
            }
        } else {
            return res.status(404).send({
                status: false,
                message: `Invalid ID.`
            })
        }

    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: `Error while updating address: ${error}`
        })
    }
}
const fetchCards = async (req, res) => {
    const userId = req.user.id;
    try {
        const cards = await UserStrip.findAll({
            where: { userId: userId }
        })
        if (cards) {
            return res.status(201).send({
                status: true,
                data: cards,
                message: `Card's Fetched Successfully.`
            })
        }
        else {
            return res.status(401).send({
                status: false,
                message: `Error while geting Card's.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while geting Card's: ${error}`
        })
    }
}
const fetchOrders = async (req, res) => {
    const userId = req.user.id
    try {
        const orders = await Order.findAll({ where: { user_id: userId } });
        if (orders) {
            for (let index = 0; index < orders.length; index++) {
                const product = await Product.findOne({ where: { id: orders[index].product_id } })
                product.images_url = product.images_url.split(",")
                orders[index].product_id = product;
            }
            return res.status(201).send({
                status: true,
                data: orders,
                message: 'Orders Fetched Successfully!'
            })
        } else {
            return res.status(401).send({
                status: false,
                message: 'Invalid user Id!'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: 'Error While Geting Orders'
        })
    }
}

const AddRating = async (req, res) => {
    const { ordersID, productID, rating, description } = req.body;
    const userId = req.user.id;
    try {
        if (!ordersID || !productID || !rating) {
            return res.status(401).send({
                status: false,
                message: "Invalid Details!"
            })
        }
        const updateOrder = await Order.update({ rate: true }, { where: { id: ordersID } })
        const rate = await Rating.create({
            description: description ? description : "",
            rate: parseFloat(rating),
            product_id: parseInt(productID),
            user_id: parseInt(userId),
        })
        const product = await Product.findOne({ where: { id: productID } })
        let p_rating = product.rating * product.ratingList;
        let ratingList = product.ratingList + 1;
        p_rating = p_rating + rating / ratingList;
        console.log(p_rating);
        const updateProdut = await Product.update({
            ratingList: ratingList,
            rating: p_rating,
        }, { where: { id: productID } })
        return res.status(200).send({
            status: true,
            message: "Rating Added Successfully!"
        })
    } catch (error) {
        console.log(error);
        return res.status(401).send({
            status: false,
            message: "Error while adding rating."
        })
    }
}
module.exports = {
    register,
    login,
    changePassword,
    ForgetPassword,
    ResetPassword,
    ListCategorys,
    ListProducts,
    ProductsByCategory,
    ProductByID,
    AddtoCart,
    ListCart,
    DeleteFromCart,
    UpadateCart,
    ListAddress,
    AddAddress,
    DeleteAddress,
    UpdateAddress,
    fetchCards,
    fetchOrders,
    AddRating,
};