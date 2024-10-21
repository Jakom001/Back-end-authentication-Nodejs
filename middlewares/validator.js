const Joi = require('joi');
const { PassThrough } = require('nodemailer/lib/xoauth2');

exports.signupSchema = Joi.object({
    email: Joi.string().min(6).max(60).required()
    .email({
        tlds:{allow: ['com', 'net']},
    }),
    
   password: Joi.string()
   .required()
   .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
   .messages({
    'string.pattern.base': 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.'
  })

});

exports.signinSchema = Joi.object({
  email: Joi.string().min(6).max(60).required()
  .email({
      tlds:{allow: ['com', 'net']},
  }),
  
 password: Joi.string()
 .required()
 .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
 .messages({
  'string.pattern.base': 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.'
})

});

exports.acceptCodeSchema = Joi.object({
  email: Joi.string().min(6).max(60).required()
    .email({
        tlds:{allow: ['com', 'net']},
    }),
    providedCode: Joi.number().required()
})

exports.changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.'
    }),

  oldPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.'
    }),
});

exports.acceptFPCodeSchema =Joi.object({
  email: Joi.string().min(6).max(60).required()
  .email({
      tlds:{allow: ['com', 'net']},
  }),
  providedCode: Joi.number().required(),

  newPassword: Joi.string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$"))
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.'
    }),

})