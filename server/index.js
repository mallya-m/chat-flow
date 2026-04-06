const express = require("express");

const app = express();

const port = 5000 ;

app.get('/',(req,res)=>{
    res.send("Chat flow server is running ");
})
app.get("/api/hello",(req,res)=>{
    res.json({
        message:"welcome to Chatflow API",
        version:"1.0",
        status:"active"
    })
});

app.listen(port,()=>{
    console.log(`Server is listening at port ${port}`);
});