// utils/generateToken.js

const jwt = require("jsonwebtoken");

/**
 * Generates JWT Token
 * @param {Object} payload
 */
const generateToken = ({ id, role, permissions = [] }) => {
  return jwt.sign(
    {
      id,
      role, // ✅ GUARANTEED
      permissions, // ✅ GUARANTEED
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION_TIME || "1d",
    }
  );
};

module.exports = generateToken;
