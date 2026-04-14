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

const authRoutes = require("./routes/auth")
app.use('/api/auth',authRoutes)
 
const authMiddleware = require('./middleware/authMiddleware')

app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'You are inside a protected route',
    user: req.user
  })
})

app.get('/',(req,res)=>{
    res.send("Chat flow server is running ");
})

app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`);
});