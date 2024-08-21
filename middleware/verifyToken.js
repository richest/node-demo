const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecretKey = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
    try {
        let token = req.header('authorization').split(' ')[1];
        const verified = await jwt.verify(token, jwtSecretKey);
        if (verified) {
            req.user = verified;
            next()
        } else {
            res.status(401).send({
                status: false,
                message: "Unauthorized user."
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: "Unauthorized user."
        })
    }
}

module.exports = verifyToken 