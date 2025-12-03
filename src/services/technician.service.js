const Address = require("../models/address");
const User = require("../models/user");
const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// const normalizeServicesKnown = (data) => {
//   if (Array.isArray(data)) return data.join(", ");
//   if (typeof data === "string") return data;
//   return "";
// };

const parseServicesKnown = (str) => {
  if (!str) return [];
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const createTechnician = async (data) => {
  data.services_known = parseServicesKnown(data.services_known);
  return await User.create(data);
};

const getAllTechnicians = async ({ options }) => {
  return await User.findAndCountAll({
    ...options,
    where: { role: "technician" },
    include: [{ model: Address, as: "addresses" }],
  });
};

const getTechnicianById = async (id, { transaction } = {}) => {
  return await User.findByPk(id, { transaction });
};

const getTechnicianByEmail = async (email, { transaction } = {}) => {
  return await User.findOne({ where: { email }, transaction });
};

const getTechnicianByMobile = async (mobile, { transaction } = {}) => {
  return await User.findOne({ where: { mobile }, transaction });
};

const updateTechnician = async (id, data, { transaction } = {}) => {
  const technician = await User.findByPk(id, { transaction });
  if (!technician) return null;
  if (data.services_known !== undefined) {
    data.services_known = parseServicesKnown(data.services_known);
  }
  await technician.update(data, { transaction });
  return technician;
};

const deleteTechnician = async (id) => {
  const tech = await User.findByPk(id);
  if (!tech) return null;
  await tech.destroy();
  return tech;
};

const getTechnicianByIdWithAddress = async (id) => {
  return await User.findByPk(id, {
    include: [{ model: Address, as: "addresses" }],
  });
};

//for mobile

const createUserWithMobile = async (mobile) => {
  try {
    // findOrCreate returns [instance, created(boolean)]
    const [technicianRecord, created] = await User.findOrCreate({
      where: { mobile },
      defaults: {
        mobile,
        fullname: null,
        email: null,
        password: null,
        role: "technician", // choose sensible default
      },
    });

    return {
      id: technicianRecord.id,
      mobile: technicianRecord.mobile,
      fullname: technicianRecord.fullname,
      email: technicianRecord.email,
      role: technicianRecord.role,
      created: !!created,
    };
  } catch (error) {
    // you can fallback to fetching it again
    if (error.name === "SequelizeUniqueConstraintError") {
      const existing = await userExists(mobile);
      if (existing) return { ...existing, created: false };
    }
    console.error("Create user error:", error);
    throw new Error("Failed to create user. Please try again later.");
  }
};

const sendOTP = async (mobile) => {
  // if (!isValidUAENumber(mobile)) {
  //   throw new Error("Invalid UAE mobile number format.");
  // }

  try {
    const verification = await twilio.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: mobile, channel: "sms" });

    if (verification.status === "pending") {
      return { success: true, sid: verification.sid };
    } else {
      throw new Error("Failed to send OTP. Please try again.");
    }
  } catch (error) {
    if (error.code === 60202) {
      throw new Error("OTP already sent recently. Please wait 30 seconds.");
    }
    if (error.code === 20429) {
      throw new Error("Too many requests. Try again later.");
    }
    if (error.code === 20001) {
      throw new Error("Invalid mobile number.");
    }
    throw new Error(
      "Unable to send OTP at the moment. Please try again later."
    );
  }
};

const verifyOTP = async (mobile, code) => {
  // if (!isValidUAENumber(mobile)) {
  //   throw new Error("Invalid UAE mobile number.");
  // }
  if (!code || code.toString().length !== 6) {
    throw new Error("OTP must be 6 digits.");
  }

  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      console.error("Missing TWILIO_VERIFY_SERVICE_SID");
      return { valid: false, message: "OTP service not configured." };
    }

    // Verify the code
    const check = await twilio.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: mobile,
        code: code.toString(),
      });

    // Twilio returns status === "approved" when code is valid
    if (check && check.status === "approved") {
      return { valid: true, payload: check };
    }

    // Any other status is considered invalid/expired
    return { valid: false, message: "Invalid or expired OTP." };
  } catch (error) {
    if (error.code === 20404) {
      return { valid: false, message: "OTP expired or not found." };
    }
    if (error.code === 60200) {
      return { valid: false, message: "Invalid OTP." };
    }
    throw new Error("OTP verification failed. Please try again.");
  }
};

const userExists = async (mobile) => {
  // const formattedMobile = mobile.trim();
  // if (!isValidUAENumber(formattedMobile)) {
  //   throw new Error("Invalid UAE mobile number format.");
  // }

  try {
    const technician = await User.findOne({
      where: { mobile: mobile },
      attributes: [
        "id",
        "fullname",
        "mobile",
        "email",
        "id_proofs",
        "service_category",
        "services_known",
        "service_type",
        "profile_pic",
        "role",
      ],
    });

    if (!technician) {
      return null;
    }
    return technician;
  } catch (error) {
    console.error("Sequelize Error in technicianExists:", error.message);
    throw new Error("Failed to verify technician. Please try again later.");
  }
};

const detailOfTechnician = async (user_id) => {
  return User.findByPk(user_id, {
    attributes: [
      "fullname",
      "mobile",
      "email",
      "id_proofs",
      "service_category",
      "services_known",
      "service_type",
      "skill",
      "profile_pic",
    ],
    include: [
      {
        model: Address,
        as: "addresses",
        attributes: ["location", "latitude", "longitude", "emirates_id"],
      },
    ],
  });
};

const accountDeactivate = async (user_id) => {
  const technician = await User.findByPk(user_id);
  technician.is_active = !technician.is_active;
  await technician.save();

  return technician;
};

module.exports = {
  createTechnician,
  getAllTechnicians,
  getTechnicianByEmail,
  getTechnicianById,
  getTechnicianByMobile,
  updateTechnician,
  deleteTechnician,
  getTechnicianByIdWithAddress,
  createUserWithMobile,
  verifyOTP,
  userExists,
  sendOTP,
  detailOfTechnician,
  accountDeactivate,
};
