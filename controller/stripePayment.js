const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require('../modals');
const UserStrip = db.userStrip;
const Cart = db.cart;
const Order = db.order;
const paymentFunction = async (req, res) => {
    try {
        const { name, email, cardNo, expMonth, expYear, cvv, amount, customerId, forlater } = req.body;
        const userId = req.user.id;
        if (customerId) {
            let paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: cardNo,
                    exp_month: expMonth,
                    exp_year: expYear,
                    cvc: cvv,
                },
            });
            paymentMethod = await stripe.paymentMethods.attach(
                paymentMethod.id,
                { customer: customerId }
            );
            const paymentIntent = await stripe.paymentIntents.create({
                payment_method: paymentMethod.id,
                amount: parseInt(amount) * 100, // USD*100
                currency: 'inr',
                confirm: true,
                payment_method_options: {
                    card: {
                        request_three_d_secure: "any",
                    }
                },
                customer: customerId,
                payment_method_types: ['card'],
            })
            const confirmPayment = await stripe.paymentIntents.confirm(paymentIntent.id);
            res.status(201).send({
                status: true,
                data: confirmPayment,
                message: "Payment action require!."
            })
        } else {
            const customer = await stripe.customers.create({
                name: name,
                email: email,
            });
            if (forlater) {
                const saveUser = await UserStrip.create({
                    name: name,
                    email: email,
                    userId: userId,
                    cardNo: cardNo,
                    expMonth: expMonth,
                    expYear: expYear,
                    customerId: customer.id,
                })
            }
            let paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: cardNo,
                    exp_month: expMonth,
                    exp_year: expYear,
                    cvc: cvv,
                },
            });
            paymentMethod = await stripe.paymentMethods.attach(
                paymentMethod.id,
                { customer: customer.id }
            );
            const paymentIntent = await stripe.paymentIntents.create({
                payment_method: paymentMethod.id,
                amount: parseInt(amount) * 100, // USD*100
                currency: 'inr',
                confirm: true,
                payment_method_options: {
                    card: {
                        request_three_d_secure: "any",
                    }
                },
                customer: customer.id,
                payment_method_types: ['card'],
            })
            const confirmPayment = await stripe.paymentIntents.confirm(paymentIntent.id);
            res.status(201).send({
                status: true,
                data: confirmPayment,
                message: "Invalid Card details Please check!"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            data: error,
            message: "Payment Failed!."
        })
    }
}

const verifyPayment = async (req, res) => {
    const { intentID, cartID } = req.body;
    console.log(cartID);
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(intentID);
        if (!intentID || !cartID) {
            return res.status(201).send({
                status: true,
                message: "Payment Successfull!"
            })
        }
        switch (paymentIntent.status) {
            case 'succeeded':
                const cart = await Cart.findAll({where:{id:[...cartID]}})
                for (let index = 0; index < cart.length; index++) {
                       const order = await Order.create({
                        product_id:cart[index].product_id,
                        user_id:cart[index].user_id,
                        product_price:cart[index].product_price,
                        total_price:cart[index].total_price,
                        quantity:cart[index].quantity,
                        payment:paymentIntent.status,
                        payment_method:'card',
                        rate:false,
                       })                 
                }
                const emptyCart = await Cart.destroy({
                    where:{id:[...cartID]}
                })
                return res.status(201).send({
                    status: true,
                    data:cart,
                    message: "Payment Successfull!"
                })
                break;
            default:
                res.status(401).send({
                    status: false,
                    message: "Invalid Intent Id!."
                })
                break;
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            data: error,
            message: "Payment Failed!."
        })
    }
}
module.exports = {
    paymentFunction,
    verifyPayment,
};