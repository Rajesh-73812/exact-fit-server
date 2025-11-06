const {
  loginValidator,
  profileValidator,
} = require("../../validators/admin/authValidator");
// const User = require("../../models");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/getToken");
const AdminService = require("../../services/auth");
const { sendEmail } = require("../../utils/sendEmail");

/**
 * Register a new admin
 * @param {Object} adminData - Contains email and password
 * @returns {Object} - The newly created admin
 */

const register = async (req, res) => {
  console.log(req.body, "bodyyyyyyyyyyyy");
  const { email, password } = req.body;
  const { error } = loginValidator.validate({ email, password });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message || "email and password required",
    });
  }

  try {
    const existingAdmin = await AdminService.checkUserExists(email);
    console.log(existingAdmin, "check from service");
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newAdmin = await AdminService.registerAdmin({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: { email: newAdmin.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Handles the authentication logic
 * @param {String} email - User's email
 * @param {String} password - User's password
 * @returns {Object} - Auth result including token and user data
 */

const login = async (req, res) => {
  const { email, password } = req.body;
  const { error } = loginValidator.validate({ email, password });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message || "email and password required",
    });
  }

  try {
    const user = await AdminService.checkUserExists(email, "login");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is deactivated. Please contact admin or super admin.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = await generateToken({ id: user.id, role: user.role });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { email: user.email, token: token },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Updates the user's profile
 * @param {Object} req - The request object containing user details
 * @param {string} req.body.fullname - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.mobile - User's mobile number
 * @param {string} req.body.emirates - User's emirates
 * @param {string} req.body.area - User's area
 * @param {string} req.body.building - User's building name or number
 * @param {string} [req.body.appartment_no] - Optional user's apartment number
 * @param {string} [req.body.addtional_address] - Optional additional address details
 * @param {string} req.body.category - User's address category (e.g., residential, commercial)
 * @param {string} [req.body.save_as_address_type] - Optional field for saving the address type
 * @param {number} [req.body.latitude] - Optional latitude of the user's address
 * @param {number} [req.body.longitude] - Optional longitude of the user's address
 * @returns {Object} - Returns the updated user data with a success message
 */

const updateProfile = async (req, res) => {
  const {
    fullname,
    email,
    mobile,
    emirates,
    area,
    building,
    appartment_no,
    addtional_address,
    category,
    save_as_address_type,
    latitude,
    longitude,
  } = req.body;

  // Joi validation
  const { error } = profileValidator.validate({
    fullname,
    email,
    mobile,
    emirates,
    area,
    building,
    appartment_no,
    addtional_address,
    category,
    save_as_address_type,
    latitude,
    longitude,
  });

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const updatedUser = await AdminService.updateProfileService(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email, "from request body");
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email address required" });
  }

  try {
    const user = await AdminService.checkUserExists(email, "forgot-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (!user.email) {
      console.error(
        "Forgot Password Error: User not found, but 'email' property is missing or undefined.",
        user
      );
      return res.status(500).json({
        success: false,
        message: "Internal server error: User email data is incomplete.",
      });
    }

    const token = await generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });
    const resetLink = `http://localhost:3000/createnewpassword/${token}`;
    const subject = "Reset Your Admin Password";
    const message = `Click the link to reset your password:\n\n${resetLink}\n\nThis link will expire in ${process.env.JWT_EXPIRATION_TIME} minutes.`;
    await sendEmail({ to: user.email, subject: subject, html: message });
    return res.status(200).json({
      success: true,
      message: "Notification send to registered email address",
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  forgotPassword,
};
