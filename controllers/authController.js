const jwt = require("jsonwebtoken");
const { signupSchema, 
    signinSchema, 
    acceptCodeSchema, 
    changePasswordSchema,
    acceptFPCodeSchema 
} = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");

exports.signup = async (req, res) =>{
    const {email, password} = req.body;
    try{
        const {error, value} = signupSchema.validate({email, password});

        if(error){
            return res.status(401).json({success:false, message: error.details[0].message})
        }
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(401).json({success:false, message:"user already exists"})
        }
        const hashedPassword = await doHash(password, 12);

        const newUser = new User({
            email,
            password:hashedPassword,
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success:true, message:"Your account has been created successfully",result
        })
        
    }catch (error){
        console.log(error)
    }
}


exports.signin = async(req, res) =>{
    const {email, password} = req.body;
    try{
        const {error, value} = signinSchema.validate({email,password})      
    if (error){
        return res.status(401)
        .json({success:false, message: error.details[0].message})
        
    }
    const existingUser = await User.findOne({email}).select("+password")
        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        const result = await doHashValidation(password, existingUser.password)
        if(!result){
            return res.status(401)
            .json({success:false, message:"invalid credentials!"});
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified:existingUser.verified,
        }, process.env.TOKEN_SECRET,
        {
            expiresIn: '8h',
        }
    );

        res.cookie('Authorization', "Bearer " + token, {expires: new Date(Date.now() + 8 * 3600000), 
            httpOnly: process.env.MODE_ENV === 'production', 
            secure:process.env.MODE_ENV === 'production'
        })
        .json({
            success: true,
            token,
            message: "logged in successfully"
        })

    }catch (error){
        console.log(error)
    }

}

exports.signout = async (req,res) => {
    res.clearCookie('Authorization').status(200).json({success: true, message: "Logged out successfully"});
}

exports.sendVerificationCode = async (req,res) =>{
    const {email} = req.body;

    try{
        const existingUser = await User.findOne({email})
        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        if(existingUser.verified){
            return res.status(400)
            .json({success:false, message:"User are already verified"})
        }
        const codeValue = Math.floor(Math.random() * 100000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Verification code",
            html: '<h1>' + codeValue + '</h1>',
        });
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save()
            return res.status(200).json({
                success: true,
                message: "code sent!",
            });
        }
        res.status(400)
            .json({success:false, message:"Code sent Failed"})
    }catch (error){
        console.log(error);
    }
};
exports.verifyVerificationCode =async (req, res) =>{
    const {email, providedCode} = req.body;
    try{
        const {error, value} = acceptCodeSchema.validate({email, providedCode})      
        if (error){
            return res.status(401)
            .json({success:false, message: error.details[0].message})
            
        }
        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({email}).select('+verificationCode +verificationCodeValidation')

        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        if(existingUser.verified){
            return res.status(400)
            .json({success:false, message:"You are already verified"})
        }
        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
            return res.status(400)
            .json({success:false, message:"Something went wrong"})
        }
        if(Date.now() - existingUser.verificationCodeValidation > 5*60*1000){
            return res.status(400)
            .json({success:false, message:"Verification code has expired!"})

        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
        
        if (hashedCodeValue === existingUser.verificationCode){
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;

            await existingUser.save();
            return res.status(200).json({success:true, message: "Your Account has been verified"});
        }
        return res.status(400)
            .json({success:false, message:"Unexpected error ocurred!"})

    }catch (error){
        console.log(error)
    }
}

exports.changePasword = async (req, res) =>{
    const { userId, verified } = req.user;
    const {oldPassword, newPassword} = req.body;

    try{
        const {error, value} = changePasswordSchema.validate({oldPassword, newPassword})      
        if (error){
            return res.status(401)
            .json({success:false, message: error.details[0].message})
            
        }
        if(!verified){
            return res.status(401)
            .json({success:false, message:"You are not a verified user"})
        }
        const existingUser = await User.findOne({_id:userId}).select('+password');

        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        const result = await doHashValidation(oldPassword, existingUser.password)
        if(!result){
            return res.status(401)
            .json({success:false, message:"Old password dont match"})
        }
        const hashedPassword = await doHash(newPassword, 12)
        existingUser.password = hashedPassword;
        await existingUser.save()
        return res.status(200)
            .json({success:true, message:"Password updated"})

    }catch (error){
        console.log(error)
    }
}


exports.sendForgotPasswordCode = async (req,res) =>{
    const { email } = req.body;

    try{
        const existingUser = await User.findOne({email})
        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        
        const codeValue = Math.floor(Math.random() * 100000).toString();
        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "Forgot Password code",
            html: '<h1>' + codeValue + '</h1>',
        });
        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save()
            return res.status(200).json({
                success: true,
                message: "code sent!",
            });
        }
        res.status(400)
            .json({success:false, message:"Code sent Failed"})
    }catch (error){
        console.log(error);
    }
};
exports.verifyForgotPasswordCode =async (req, res) =>{
    const {email, providedCode, newPassword} = req.body;
    try{
        const {error, value} = acceptFPCodeSchema.validate({email, providedCode, newPassword})      
        if (error){
            return res.status(401)
            .json({success:false, message: error.details[0].message})
            
        }
        const codeValue = providedCode.toString();
        const existingUser = await User.findOne({email})
        .select('+forgotPasswordCode +forgotPasswordCodeValidation')

        if(!existingUser){
            return res.status(401)
            .json({success:false, message:"User does not exist!"})
        }
        
        if(!existingUser.forgotPasswordCode || 
            !existingUser.forgotPasswordCodeValidation){
            return res.status(400)
            .json({success:false, message:"Something went wrong"})
        }
        if(Date.now() - existingUser.forgotPasswordCodeValidation > 5*60*1000){
            return res.status(400)
            .json({success:false, message:"Forgot Password verification code has expired!"})

        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
        
        if (hashedCodeValue === existingUser.forgotPasswordCode){
            const hashedPassword = await doHash(newPassword, 12);
            existingUser.password = hashedPassword
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;

            await existingUser.save();
            return res.status(200).json({success:true, message: "Your Password has been updated"});
        }
        return res.status(400)
            .json({success:false, message:"Unexpected error ocurred!"})

    }catch (error){
        console.log(error)
    }
}