// utils/generateToken.js

const jwt = require("jsonwebtoken");

/**
 * Generates JWT Token
 * @param {Object} payload - Data to encode into the token (user details).
 * @returns {String} - JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

module.exports = generateToken;
