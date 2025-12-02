const technicianService = require("../../services/technician.service");
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
    let user = await technicianService.userExists(formatedMobile);
    // if (!user) {
    //     return res.status(404).json({
    //         success: false,
    //         message: "User not found. Please register first.",
    //     });
    // }

    // 2) if not exists, create minimal user record
    if (!user) {
      const created =
        await technicianService.createUserWithMobile(formatedMobile);
      // created has { id, mobile, ... , created: true/false }
      user = {
        id: created.id,
        mobile: created.mobile,
        fullname: created.fullname,
        email: created.email,
        role: created.role,
      };
    }

    await technicianService.sendOTP(formatedMobile);
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
    const result = await technicianService.verifyOTP(
      mobile.trim(),
      otp.toString()
    );
    if (!result || !result.valid) {
      return res.status(401).json({
        success: false,
        message: (result && result.message) || "Invalid OTP.",
      });
    }
    const user = await technicianService.userExists(mobile);
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
          is_profile_update: user.is_profile_update,
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

module.exports = {
  requestOtpLogin,
  verifyOtpLogin,
};
