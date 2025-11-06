// src/validators/admin/authValidator.js

const Joi = require("joi");

const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": "email should be a type of text",
    "string.empty": "email cannot be an empty field",
    "string.email": "email must be a valid email",
    "any.required": "email is a required field",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "password should be a type of text",
    "string.empty": "password cannot be an empty field",
    "string.min": "password should have a minimum length of 6 characters",
    "any.required": "password is a required field",
  }),
});

const profileValidator = Joi.object({
  fullname: Joi.string().min(2).max(100).required().messages({
    "string.base": "fullname should be a type of text",
    "string.empty": "fullname cannot be an empty field",
    "string.min": "fullname should have a minimum length of 2 characters",
    "string.max": "fullname should have a maximum length of 100 characters",
    "any.required": "fullname is a required field",
  }),

  email: Joi.string().email().required().messages({
    "string.base": "email should be a type of text",
    "string.empty": "email cannot be an empty field",
    "string.email": "email must be a valid email",
    "any.required": "email is a required field",
  }),

  mobile: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.base": "mobile should be a type of 'text'",
      "string.empty": "mobile cannot be an empty field",
      "string.pattern.base":
        'mobile must be a valid phone number (with or without "+" sign)',
      "any.required": "mobile is a required field",
    }),

  emirates: Joi.string().min(3).max(50).required().messages({
    "string.base": "emirates should be a type of text",
    "string.empty": "emirates cannot be an empty field",
    "string.min": "emirates should have a minimum length of 3 characters",
    "string.max": "emirates should have a maximum length of 50 characters",
    "any.required": "emirates is a required field",
  }),

  area: Joi.string().min(3).max(100).required().messages({
    "string.base": "area should be a type of text",
    "string.empty": "area cannot be an empty field",
    "string.min": "area should have a minimum length of 3 characters",
    "string.max": "area should have a maximum length of 100 characters",
    "any.required": "area is a required field",
  }),

  building: Joi.string().min(3).max(100).required().messages({
    "string.base": "building should be a type of text",
    "string.empty": "building cannot be an empty field",
    "string.min": "building should have a minimum length of 3 characters",
    "string.max": "building should have a maximum length of 100 characters",
    "any.required": "building is a required field",
  }),

  appartment_no: Joi.string().min(1).max(50).optional().messages({
    "string.base": "appartment_no should be a type of text",
    "string.empty": "appartment_no cannot be an empty field",
    "string.min": "appartment_no should have a minimum length of 1 character",
    "string.max": "appartment_no should have a maximum length of 50 characters",
  }),

  addtional_address: Joi.string().min(3).max(255).optional().messages({
    "string.base": "addtional_address should be a type of text",
    "string.empty": "addtional_address cannot be an empty field",
    "string.min":
      "addtional_address should have a minimum length of 3 characters",
    "string.max":
      "addtional_address should have a maximum length of 255 characters",
  }),

  category: Joi.string()
    .valid("residential", "commercial")
    .required()
    .messages({
      "string.base": "category should be a type of text",
      "string.empty": "category cannot be an empty field",
      "any.required": "category is a required field",
      "string.valid": 'category must be one of "residential" or "commercial"',
    }),

  save_as_address_type: Joi.string()
    .valid("home", "work", "store", "mall", "others")
    .optional()
    .messages({
      "string.base": "\"save_as_address_type\" should be a type of 'text'",
      "string.empty": '"save_as_address_type" cannot be an empty field',
      "string.valid":
        "\"save_as_address_type\" must be one of 'home' or 'office'",
    }),

  latitude: Joi.number().min(-90).max(90).optional().messages({
    "number.base": "\"latitude\" should be a type of 'number'",
    "number.min": '"latitude" must be between -90 and 90',
    "number.max": '"latitude" must be between -90 and 90',
  }),

  longitude: Joi.number().min(-180).max(180).optional().messages({
    "number.base": "\"longitude\" should be a type of 'number'",
    "number.min": '"longitude" must be between -180 and 180',
    "number.max": '"longitude" must be between -180 and 180',
  }),
});

module.exports = {
  loginValidator,
  profileValidator,
};
