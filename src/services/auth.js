const User = require("../models/user");
const Address = require("../models/address");
const UserSubscription = require("../models/userSubscription");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const SubscriptionPlan = require("../models/subscriptionPlan");
const sequelize = require("../config/db");

const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// const isValidUAENumber = (mobile) => {
//   const uaeRegex = /^\+9715[024568]\d{7}$/; // 50,52,54,55,56,58
//   return uaeRegex.test(mobile.trim());
// };

const registerAdmin = async ({ email, password }) => {
  const admin = await User.create(
    {
      email,
      password,
      role: "admin",
    },
    {
      attributes: ["email"],
    }
  );

  return admin;
};

const checkUserExists = async (email, from = null) => {
  let user;
  if (from === "login") {
    user = await User.findOne({
      where: { email },
      attributes: ["id", "password", "is_active"],
      raw: true,
    });
  } else if (from === "forgot-password") {
    user = await User.findOne({
      where: { email },
      attributes: ["email"],
      raw: true,
    });
  } else {
    user = await User.findOne({
      where: { email },
      attributes: ["id"],
      raw: true,
    });
  }
  return user;
};

const updateProfileService = async (userId, profileData) => {
  const [updatedRows, updatedUsers] = await User.update(profileData, {
    where: { id: userId },
    returning: true, // Important: This ensures that Sequelize returns the updated row
  });

  if (updatedRows === 0) {
    const error = new Error("User not found or no changes were made.");
    error.status = 404;
    throw error;
  }

  const updatedUser = updatedUsers[0]; // First element of the updated users array

  return {
    fullname: updatedUser.fullname,
    email: updatedUser.email,
    mobile: updatedUser.mobile,
    emirates: updatedUser.emirates,
    area: updatedUser.area,
    building: updatedUser.building,
    appartment_no: updatedUser.appartment_no,
    addtional_address: updatedUser.addtional_address,
    category: updatedUser.category,
    latitude: updatedUser.latitude,
    longitude: updatedUser.longitude,
  };
};

// for mobile

const createUserWithMobile = async (mobile) => {
  try {
    // findOrCreate returns [instance, created(boolean)]
    const [userRecord, created] = await User.findOrCreate({
      where: { mobile },
      defaults: {
        mobile,
        fullname: null,
        email: null,
        password: null,
        role: "customer", // choose sensible default
      },
    });

    // return plain JS object similar to userExists
    return {
      id: userRecord.id,
      mobile: userRecord.mobile,
      fullname: userRecord.fullname,
      email: userRecord.email,
      role: userRecord.role,
      created: !!created,
    };
  } catch (error) {
    // handle unique constraint race: if another request created the user simultaneously,
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
    const user = await User.findOne({
      where: { mobile: mobile },
      attributes: [
        "id",
        "fullname",
        "email",
        "mobile",
        "role",
        "is_profile_update",
      ],
      raw: true,
    });

    if (!user) {
      return null; // User not found
    }
    console.log(user, "userrrrrrrrrrrrr");
    return {
      id: user.id,
      mobile: user.mobile,
      fullname: user.fullname,
      role: user.role,
      is_profile_update: user.is_profile_update,
    };
  } catch (error) {
    console.error("Sequelize Error in userExists:", error.message);
    throw new Error("Failed to verify user. Please try again later.");
  }
};

const updateProfile = async (userId, userData, addressData) => {
  const t = await User.sequelize.transaction();
  try {
    let updatedUser = null;
    let updatedAddress = null;

    // 1. Update User
    if (Object.keys(userData).length > 0) {
      userData.is_profile_update = true;
      const [updated] = await User.update(userData, {
        where: { id: userId },
        transaction: t,
      });

      if (updated === 0) throw new Error("USER_NOT_FOUND");
    }

    // Fetch updated user
    updatedUser = await User.findByPk(userId, { transaction: t });

    // 2. Update or Create Address
    if (Object.keys(addressData).length > 0) {
      // Check if the user already has an address
      let existingAddress = await Address.findOne({
        where: { user_id: userId },
        transaction: t,
      });

      if (existingAddress) {
        // If address exists, update it
        await existingAddress.update(addressData, { transaction: t });
        updatedAddress = existingAddress;
      } else {
        // If address does not exist, create a new one
        updatedAddress = await Address.create(
          { user_id: userId, ...addressData, is_default: true },
          { transaction: t }
        );
      }
    }

    await t.commit();

    return {
      success: true,
      user: updatedUser,
      address: updatedAddress,
    };
  } catch (error) {
    await t.rollback();
    if (error instanceof sequelize.Sequelize.ValidationError) {
      const messages = error.errors.map((err) => err.message);
      throw new Error(messages.join(", "));
    }
    throw error;
  }
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: Address,
        as: "addresses",
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt"],
        },
      },
      {
        model: UserSubscription,
        as: "subscriptions",
        attributes: {
          exclude: ["createdAt", "updatedAt", "deletedAt", "plan_snapshot"],
        },
        required: false,
        order: [["createdAt", "DESC"]],
        limit: 1,
        include: [
          {
            model: UserSubscriptionCustom,
            as: "custom_items",
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "plan_snapshot"],
            },
            required: false,
            order: [["createdAt", "DESC"]],
            limit: 1,
          },
          {
            model: SubscriptionPlan,
            as: "subscription_plan",
            attributes: ["name"],
          },
        ],
      },
    ],
  });

  if (!user) {
    return null;
  }

  let userJson = user.get({ plain: true });
  if (userJson.subscriptions && userJson.subscriptions.length > 0) {
    userJson.subscriptions = userJson.subscriptions.map((subscription) => {
      const { subscription_plan, ...rest } = subscription;

      return {
        ...rest,
        subscription_plan_name: subscription_plan
          ? subscription_plan.name
          : "Custom",
      };
    });
  }

  return userJson;
};

const deActivateAccount = async (user_id) => {
  try {
    const user = await User.findOne({ where: { id: user_id } }); // Sequelize query to find the user by ID

    if (!user) {
      throw new Error("User not found");
    }
    user.is_active = false;
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error deactivating account: " + error.message);
  }
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
  registerAdmin,
  checkUserExists,
  updateProfileService,
  createUserWithMobile,
  sendOTP,
  verifyOTP,
  userExists,
  updateProfile,
  getUserById,
  deActivateAccount,
  updateOneSignalIdService,
  removeOneSignalIdService,
};
