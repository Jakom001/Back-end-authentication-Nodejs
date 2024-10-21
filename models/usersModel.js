const { required } = require("joi")
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required : [true, 'Email is required'],
        trim: true,
        unique: [true, 'Email already exist'],
        minLength:[5, "email must have 5 characters"],
        lowercase: true
    },
    password:{
        type: String,
        required: [true, "Password must be provided"],
        select:false,
    },
    verified:{
        type: Boolean,
        default: false,
    },
    verificationCode:{
        type: String,
        select: false,
    },
    verificationCodeValidation:{
        type: String,
        select: false,
    },
    forgotPasswordCode:{
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation:{
        type: String,
        select: false,
    }
}, {
    timestamps:true
})

module.exports = mongoose.model("User", userSchema)