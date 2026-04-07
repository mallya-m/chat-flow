require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");


const app = express();

const port = process.env.PORT || 5000 ;

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log('Connected to MongoDB')
    })
    .catch((error) =>{
        console.log('MongoDB connection failed:', error)
    })

app.use(express.json())

app.get('/',(req,res)=>{
    res.send("Chat flow server is running ");
})
app.post("/api/test-user",async(req,res)=>{
    try{
        const User = require('./models/User');

        const newUser = new User({
            name : req.body.name,
            email : req.body.email,
            password : req.body.password
        })

        const savedUser = await newUser.save()

        res.status(201).json({
            message: "User saved successfully",
            user : savedUser
        })
    }catch(error){
        res.status(400).json({
            message: "Error saving user",
            error : error.message
        })

    }
});

app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`);
});