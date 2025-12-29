const {
  loginValidator,
  profileValidator,
} = require("../../validators/admin/authValidator");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/getToken");
const AdminService = require("../../services/auth");
const { sendEmail } = require("../../utils/sendEmail");

const register = async (req, res) => {
  const { id, email, password, fullname, mobile, role, profile_pic } = req.body;

  if (!id) {
    const { error } = loginValidator.validate({ email, password });
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.details?.[0]?.message || "Email and password are required",
      });
    }
  }

  try {
    if (!id) {
      const existingAdmin = await AdminService.checkUserExists(email);
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "Admin already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = await AdminService.registerAdmin({
        email,
        password: hashedPassword,
        fullname,
        mobile,
        role: role || "admin",
        profile_pic,
      });

      return res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: { id: newAdmin.id, email: newAdmin.email },
      });
    }

    const updatePayload = {};
    if (email) updatePayload.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }
    if (fullname) updatePayload.fullname = fullname;
    if (mobile) updatePayload.mobile = mobile;
    if (role) updatePayload.role = role;
    if (profile_pic) updatePayload.profile_pic = profile_pic;

    const updatedAdmin = await AdminService.registerAdmin({
      id,
      ...updatePayload,
    });

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: { id: updatedAdmin.id, email: updatedAdmin.email },
    });
  } catch (err) {
    console.error("Register controller error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
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

    const token = await generateToken({
      id: user.id,
      role: user.role,
      permissions: user.permissions,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        email: user.email,
        role: user.role,
        token,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const fetchAdminById = async (req, res) => {
  const id = req.user?.id;
  try {
    const admin = await AdminService.getAdminById(id);
    res.status(200).json({
      success: true,
      message: "Admin details fetched successfully",
      data: admin,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateAdminStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await AdminService.changeAdminStatus(id);
    res.status(200).json({
      success: true,
      message: "Admin status updated successfully",
      data: admin,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await AdminService.deleteAdmin(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
        "Forgot Password Error: user object missing email property",
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

    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/createnewpassword/${token}`;
    const subject = "Reset Your Admin Password";
    const message = `Click the link to reset your password:\n\n${resetLink}\n\nThis link will expire in ${process.env.JWT_EXPIRATION_TIME} minutes.`;

    await sendEmail({ to: user.email, subject, html: message });

    return res.status(200).json({
      success: true,
      message: "Notification sent to registered email address",
    });
  } catch (error) {
    console.error("Forgot Password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getAllAdmin = async (req, res) => {
  const { search = "", page = "1", limit = "10" } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  try {
    const result = await AdminService.getAdminAll({
      search,
      page: pageNum,
      limit: limitNum,
    });

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("getAllAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// for user
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
  console.log("111111111111");
  try {
    const updatedStatus = await AdminService.updateStatus(id);
    console.log(updateStatus, "222222222222222");
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
  const admin_id = req.user?.id;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await AdminService.getAllNotifications(
      admin_id,
      page,
      limit
    );

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

const deleteNotification = async (req, res) => {
  const admin_id = req.user?.id;
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Notification ID is required",
    });
  }

  try {
    // Call the service to delete the notification
    const result = await AdminService.deleteNotification(id, admin_id);

    // Check if the deletion was successful (affected rows > 0)
    if (result > 0) {
      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({
      success: false,
      message: "Internal server error",
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
  deleteNotification,
  fetchAdminById,
  updateAdminStatus,
  removeAdmin,
  getAllAdmin,
};
