require('dotenv').config();

const express = require("express");
const helmet = require("helmet");
const cors = require('cors');
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const authRouter = require("./routers/authRouter");
const postsRouter = require("./routers/postsRouters")

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(helmet())
app.use(express.urlencoded({extended: true}));


mongoose
.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Database Connected")
})
.catch((err) => {
    console.log(err)
})

app.use('/api/auth', authRouter)
app.use('/api/posts', postsRouter)
app.get('/', (req, res) =>{
    res.json({message: "Hello from server"})
})

app.listen(process.env.PORT || 3000, () =>{
    console.log("Listening in port 3000")
})