const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { body, validationResult } = require('express-validator');
const User = require("../models/User");

router.post('/register',[
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter valid email'),
    body('password').isLength({min:6}).withMessage('PAssword must be atleast 6 characters')
],
    async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            message : "Validation failed",
            errors : errors.array()
        })
    }
    try{
        const {name,email,password} = req.body
        const existingUSer = await User.findOne({email})
        if(existingUSer){
            return res.status(400).json({
            message : 'User with this email already exists'
        })
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUSer = new User({
            name,
            email,
            password : hashedPassword
        })

        const savedUSer = await newUSer.save()

        res.status(201).json({
            message : 'USer registered successfully',
            user:{
                id : savedUSer._id,
                name : savedUSer.name,
                email : savedUSer.email
            }
        })
    }catch(error){
        res.status(500).json({
            message:'Server error',
            error: error.message
        })
    }
} )

module.exports = router