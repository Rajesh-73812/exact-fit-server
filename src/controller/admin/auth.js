const {
  loginValidator,
  profileValidator,
} = require("../../validators/admin/authValidator");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/getToken");
const AdminService = require("../../services/auth");
const { sendEmail } = require("../../utils/sendEmail");

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

const getAllCustomers = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  console.log(limit, "from query");
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  try {
    const customers = await AdminService.getAllCustomers({
      search,
      page: pageNum,
      limit: limitNum,
    });
    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Get all customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const customerDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await AdminService.getCustomerDetailsByIdService(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Customer details fetched successfully.",
      data: customer,
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedStatus = await AdminService.updateStatus(id);
    return res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      data: updatedStatus,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const sentNotification = async (req, res) => {
  const admin_id = req.user.id;
  const { title, message, userIds, TechnicianIds, schedule_start } = req.body;
  console.log(req.body, "from bodyy");
  if (!title || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Title and message are required." });
  }
  try {
    const notification = await AdminService.sendNotification({
      title,
      message,
      userIds,
      TechnicianIds,
      schedule_start,
      admin_id,
    });
    console.log(notification);
    return res.status(200).json({
      success: true,
      message: "Notification sent sucessfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await AdminService.getAllNotifications(page, limit);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully!",
      data: notifications.data,
      pagination: {
        totalItems: notifications.totalItems,
        totalPages: notifications.totalPages,
        currentPage: notifications.currentPage,
        limit: notifications.limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
  forgotPassword,
  getAllCustomers,
  customerDetailsById,
  updateStatus,
  sentNotification,
  getAllNotifications,
};
