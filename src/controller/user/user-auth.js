const userService = require("../../services/auth");
const generateToken = require("../../utils/getToken");

const requestOtpLogin = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required.",
    });
  }

  const formatedMobile = mobile.trim();
  // if (!formatedMobile.startsWith("+971")) {
  //     return res.status(400).json({
  //         success: false,
  //         message: "Please provide mobile number with UAE country code +971.",
  //     });
  // }

  try {
    let user = await userService.userExists(formatedMobile);
    // if (!user) {
    //     return res.status(404).json({
    //         success: false,
    //         message: "User not found. Please register first.",
    //     });
    // }

    // 2) if not exists, create minimal user record
    if (!user) {
      const created = await userService.createUserWithMobile(formatedMobile);
      // created has { id, mobile, ... , created: true/false }
      user = {
        id: created.id,
        mobile: created.mobile,
        fullname: created.fullname,
        email: created.email,
        role: created.role,
      };
    }

    await userService.sendOTP(formatedMobile);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("OTP Send Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP. Please try again.",
    });
  }
};

const verifyOtpLogin = async (req, res) => {
  const { mobile, otp } = req.body || {};

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "Mobile number and OTP are required.",
    });
  }

  try {
    const result = await userService.verifyOTP(mobile.trim(), otp.toString());
    if (!result || !result.valid) {
      return res.status(401).json({
        success: false,
        message: (result && result.message) || "Invalid OTP.",
      });
    }
    const user = await userService.userExists(mobile);
    const token = await generateToken({
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    });
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          mobile: user.mobile,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error("OTP Verify Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Invalid or expired OTP.",
    });
  }
};

// === RESEND OTP ===
const resendOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required.",
    });
  }

  const formattedMobile = mobile.trim();

  // if (!formattedMobile.startsWith("+971")) {
  //     return res.status(400).json({
  //         success: false,
  //         message: "Please use UAE number starting with +971.",
  //     });
  // }

  try {
    const user = await userService.userExists(formattedMobile);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }
    await userService.sendOTP(formattedMobile);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP. Please try again.",
    });
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.user?.id || null;
  console.log(userId, "iddddddddddd");
  const {
    fullname,
    email,
    emirate,
    area,
    building,
    appartment,
    addtional_address,
    category,
    save_as_address_type,
    location,
    latitude,
    longitude,
  } = req.body;

  const userData = {};
  if (fullname !== undefined) userData.fullname = fullname;
  if (email !== undefined) userData.email = email;

  const addressData = {};
  if (emirate !== undefined) addressData.emirate = emirate;
  if (area !== undefined) addressData.area = area;
  if (appartment !== undefined) addressData.appartment = appartment;
  if (building !== undefined) addressData.building = building;
  if (addtional_address !== undefined)
    addressData.addtional_address = addtional_address;
  if (category !== undefined) addressData.category = category;
  if (save_as_address_type !== undefined)
    addressData.save_as_address_type = save_as_address_type;
  if (location !== undefined) addressData.location = location;
  if (latitude !== undefined) addressData.latitude = latitude;
  if (longitude !== undefined) addressData.longitude = longitude;

  try {
    const result = await userService.updateProfile(
      userId,
      userData,
      addressData
    );
    const token = await generateToken({
      id: result.id,
      role: result.role,
      mobile: result.mobile,
    });
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      token: token,
      user: result.user,
      address: result.address,
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  requestOtpLogin,
  verifyOtpLogin,
  resendOtp,
  updateUserProfile,
};
