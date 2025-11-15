const userModel = require('../model/user.model');
const bcrypt = require('bcryptjs');
const { json } = require('express');
const jwt = require("jsonwebtoken");



async function registerController(req, res) {
    const { email, firstname, lastname, password } = req.body;
    const isuserexist = await userModel.findOne({
        email: email
    })
    if (isuserexist) {
        return res.status(404).json({
            message: "email already exist ,please user anotehr email id"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        email, fullname: { firstname:firstname,lastname:lastname }, password: hashedPassword
    })
    const token = jwt.sign({
        id:user._id
    }, process.env.JWT_SECRET)
    res.cookie('token', token);
    res.status(200).json({
        message: "user registered successfully",
        user: user

    })

}

async function loginController(req,res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({
        email: email
    })
    if (!user) {
        return res.status(400).json({
            message: "user does not exist please register, invalid email"
        })
    }
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(404).json({
            message: "invalid password , try again"
        })
    }
    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET);
    res.cookie('token',token);
    res.status(200).json({
        message:"user login successfulky",
        user:user

    })
}


module.exports = {
    registerController,
    loginController,
}





