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
    console.log(user, "userrrrrrrrrrrr");
    // if (!user) {
    //     return res.status(404).json({
    //         success: false,
    //         message: "User not found. Please register first.",
    //     });
    // }

    // 2) if not exists, create minimal user record
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Number entered is not registered in Exact Fit",
      });
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
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
      });
    }
    const token = await generateToken({
      id: user.id,
      role: user.role,
      mobile: user.mobile,
    });

    console.log(user, "from techhhhhhhh");
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          mobile: user.mobile,
          email: user.email,
          id_proofs: user.id_proofs,
          service_category: user.service_category,
          services_known: user.services_known,
          service_type: user.service_type,
          profile_pic: user.profile_pic,
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
    const user = await technicianService.userExists(formattedMobile);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }
    await technicianService.sendOTP(formattedMobile);

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

const detailsOfTechnician = async (req, res) => {
  const user_id = req.user.id;
  try {
    const technician = await technicianService.detailOfTechnician(user_id);
    return res.status(200).json({
      success: true,
      message: "Technician Data fetched sucessfully",
      data: technician,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server eror",
    });
  }
};

const technicianDeactivateAccount = async (req, res) => {
  const user_id = req.user.id;
  try {
    const technician = await technicianService.accountDeactivate(user_id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deactivated sucessfully",
      // data: technician
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server eror",
    });
  }
};

const updateOneSignalId = async (req, res) => {
  const user_id = req.user?.id;
  console.log("User ID from request:", user_id);
  const { onesignal_id } = req.body;
  if (!onesignal_id) {
    return res
      .status(400)
      .json({ success: false, message: "OneSignal ID is required" });
  }
  try {
    const result = await technicianService.updateOneSignalIdService(
      user_id,
      onesignal_id
    );
    res.status(200).json({
      success: true,
      message: "OneSignal ID updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in updateOneSignalId:", error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const removeOneSignalId = async (req, res) => {
  const user_id = req.user?.id;
  if (!user_id) {
    return res.status(400).json({ success: false, message: " ID is required" });
  }
  console.log("User ID from request:", user_id);
  try {
    const result = await technicianService.removeOneSignalIdService(user_id);
    res.status(200).json({
      success: true,
      message: "OneSignal ID removed successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in removeOneSignalId:", error);
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

module.exports = {
  requestOtpLogin,
  verifyOtpLogin,
  resendOtp,
  detailsOfTechnician,
  technicianDeactivateAccount,
  updateOneSignalId,
  removeOneSignalId,
};
