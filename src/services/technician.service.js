const { Op } = require("sequelize");
const sequelize = require("../config/db");
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

const checkIfFieldExists = async ({
  email,
  mobile,
  emirates_id,
  id = null,
}) => {
  // Build a dynamic query object to exclude the current user's ID from checks
  const conditions = [];
  if (email) conditions.push({ email });
  if (mobile) conditions.push({ mobile });
  if (emirates_id) conditions.push({ emirates_id });

  // Prepare the 'where' object for the query
  let where = { [Op.or]: conditions };

  if (id) {
    where = {
      ...where,
      id: { [Op.ne]: id }, // Exclude the current user's ID
    };
  }

  // Check if any of the fields already exist
  const user = await User.findOne({
    where,
  });

  if (user) {
    if (email) return "Email already exists";
    if (mobile) return "Mobile number already exists";
    if (emirates_id) return "Emirates ID already exists";
  }

  return null; // No existing fields
};

const upsertTechnician = async (data) => {
  const t = await sequelize.transaction();
  try {
    const {
      id,
      fullname,
      email,
      mobile,
      service_id,
      skill,
      description,
      profile_pic,
      id_proofs,
      certificates,
      address,
      emirates_id,
    } = data;

    // Upsert technician (create or update)
    const [technician] = await User.upsert(
      {
        id,
        fullname,
        email,
        mobile,
        role: "technician",
        service_id,
        skill,
        description,
        profile_pic,
        id_proofs,
        certificates,
        emirates_id, // Store Emirates ID in database
        status: id ? undefined : "pending", // Set status to pending if it's a new user
      },
      { transaction: t, returning: true }
    );

    // Handle address upsert
    if (address && (address.emirate || address.location)) {
      await Address.upsert(
        {
          user_id: technician.id,
          ...address,
          is_default: true,
        },
        { transaction: t }
      );
    }

    await t.commit();

    // Return technician with address details
    return await User.findByPk(technician.id, {
      include: [{ model: Address, as: "addresses" }],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllTechnicians = async (
  page = 1,
  limit = 10,
  search = "",
  exclude
) => {
  if (exclude === "true") {
    where.service_type = { [Op.ne]: "enquiry" };
  }
  const offset = (page - 1) * limit;
  const where = { role: "technician", deletedAt: null };
  if (search) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
      { emirates_id: { [Op.like]: `%${search}%` } },
    ];
  }
  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: [
      "id",
      "fullname",
      "mobile",
      "email",
      "service_type",
      "profile_pic",
      "is_Active",
      "emirates_id",
    ],
    include: [
      { model: Address, as: "addresses", attributes: ["emirate", "location"] },
    ],
  });

  const [activeCount, inactiveCount] = await Promise.all([
    User.count({ where: { ...where, is_active: true } }),
    User.count({ where: { ...where, is_active: false } }),
  ]);

  return {
    rows,
    count,
    limit,
    offset,
    activeCount,
    inactiveCount,
  };
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

const updateTechnician = async (id) => {
  const technician = await User.findByPk(id);
  if (!technician) return null;

  technician.is_active = !technician.is_active;
  await technician.save();

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
    attributes: [
      "id",
      "fullname",
      "email",
      "mobile",
      "profile_pic",
      "service_category",
      "services_known",
      "service_type",
      "emirates_id",
      "id_proofs",
      "skill",
      "description",
      "is_active",
    ],
    include: [
      {
        model: Address,
        as: "addresses",
        where: { user_id: id },
        attributes: ["id", "user_id", "emirate", "location"],
      },
    ],
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
      "emirates_id",
    ],
    include: [
      {
        model: Address,
        as: "addresses",
        attributes: ["location", "latitude", "longitude"],
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

const updateOneSignalIdService = async (user_id, onesignal_id) => {
  const user = await User.findByPk(user_id);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  user.onesignal_id = onesignal_id;
  await user.save();

  return user.toJSON();
};

const removeOneSignalIdService = async (user_id) => {
  const user = await User.findByPk(user_id);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  user.onesignal_id = null;
  await user.save();

  return user.toJSON();
};

module.exports = {
  upsertTechnician,
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
  checkIfFieldExists,
  updateOneSignalIdService,
  removeOneSignalIdService,
};
