const User = require("../models/user");
const Address = require("../models/address");
const UserSubscription = require("../models/userSubscription");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const SubscriptionPlan = require("../models/subscriptionPlan");
const sequelize = require("../config/db");
const Notification = require("../models/notification");
const NotificationRecipeient = require("../models/notification_recipeient");

const Role = require("../models/role");
const AdminRole = require("../models/adminrole");
const Permission = require("../models/permission");
const {
  sendInAppNotification,
  createNotification,
} = require("../helper/notification");
const notification = require("../config/notifications.json");
const { Op } = require("sequelize");

const twilio = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// const isValidUAENumber = (mobile) => {
//   const uaeRegex = /^\+9715[024568]\d{7}$/; // 50,52,54,55,56,58
//   return uaeRegex.test(mobile.trim());
// };

const registerAdmin = async ({
  id,
  email,
  password,
  fullname,
  mobile,
  profile_pic,
  role_ids = [], // array of role IDs
}) => {
  let admin;

  if (id) {
    admin = await User.findByPk(id);
    if (!admin) throw new Error("Admin not found");

    await admin.update({
      email,
      password,
      fullname,
      mobile,
      profile_pic,
    });

    await AdminRole.destroy({ where: { admin_id: id } });
  } else {
    admin = await User.create({
      email,
      password,
      fullname,
      mobile,
      profile_pic,
      role: "admin",
    });
  }

  if (role_ids.length) {
    const mappings = role_ids.map((role_id) => ({
      admin_id: admin.id,
      role_id,
    }));
    await AdminRole.bulkCreate(mappings);
  }

  return admin;
};

const checkUserExists = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;

  // 🔥 SUPERADMIN → FULL ACCESS
  if (user.role === "superadmin") {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: "superadmin",
      is_active: user.is_active,
      permissions: ["*"],
    };
  }

  // ADMIN → role based
  const adminRoles = await AdminRole.findAll({
    where: { admin_id: user.id },
    include: [
      {
        model: Role,
        include: [
          {
            model: Permission,
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  const permissions = [];

  adminRoles.forEach((ar) => {
    ar.Role?.Permissions?.forEach((p) => permissions.push(p.key));
  });

  return {
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role, // always from users table
    is_active: user.is_active,
    permissions: [...new Set(permissions)],
  };
};

const getAdminById = async (id) => {
  const admin = await User.findByPk(id, {
    attributes: [
      "id",
      "fullname",
      "email",
      "mobile",
      "role",
      "profile_pic",
      "status",
      "createdAt",
    ],
  });

  if (!admin) throw new Error("Admin not found");
  return admin;
};

const changeAdminStatus = async (id) => {
  const admin = await User.findByPk(id);
  if (!admin) throw new Error("Admin not found");

  admin.is_active = admin.is_active === 1 ? 0 : 1;
  await admin.save();
  return admin;
};

const deleteAdmin = async (id) => {
  const admin = await User.findByPk(id);
  if (!admin) throw new Error("Admin not found");

  await admin.destroy();
  return { message: "Admin deleted successfully" };
};

const getAdminAll = async ({ search = "", page = 1, limit = 10 }) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  const where = {
    role: "admin",
  };

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    where[Op.or] = [
      { fullname: { [Op.like]: q } },
      { email: { [Op.like]: q } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: [
      "id",
      "fullname",
      "email",
      "mobile",
      "role",
      "profile_pic",
      "is_active",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
    limit: limitNum,
    offset,
  });

  const totalItems = count;
  const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

  return {
    data: rows,
    pagination: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  };
};

// for mobile
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

const updateLastLogin = async (user_id) => {
  try {
    const user = await User.update(
      { last_login: new Date() },
      { where: { id: user_id } }
    );

    if (user[0] === 1) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating last_login:", error.message);
    throw new Error("Failed to update last login.");
  }
};

const updateProfile = async (userId, userData, addressData) => {
  const t = await User.sequelize.transaction();
  try {
    let currentUser = await User.findByPk(userId);
    if (!currentUser) throw new Error("USER_NOT_FOUND");

    const isFirstTimeUpdate = !currentUser.is_profile_update;

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
    currentUser = await User.findByPk(userId, { transaction: t });

    // 2. Update or Create Address
    let updatedAddress = null;
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

    if (isFirstTimeUpdate) {
      await sendInAppNotification(
        currentUser.onesignal_id,
        notification.profile_updated.title,
        notification.profile_updated.message,
        currentUser.role
      );

      await createNotification(
        currentUser.id,
        notification.profile_updated.title,
        notification.profile_updated.message
      );
    }

    return {
      success: true,
      user: currentUser,
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
        where: { status: "active" },
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

const getAllCustomers = async ({ search = "", page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  const baseWhere = {
    role: "customer",
    deletedAt: null,
  };

  const searchCondition = search
    ? {
        [Op.or]: [
          { fullname: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { mobile: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : {};
  const where = { ...baseWhere, ...searchCondition };
  try {
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: [
        "id",
        "fullname",
        "email",
        "mobile",
        "is_active",
        "plan_start_date",
        "plan_end_date",
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    });

    const activeCount = await User.count({
      where: { ...where, is_active: true },
    });
    const deactiveCount = await User.count({
      where: { ...where, is_active: false },
    });

    return {
      rows,
      count,
      limit,
      offset,
      activeCount,
      deactiveCount,
      totalPages: Math.ceil(count / limit), // Add totalPages
      currentPage: page, // Add currentPage
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers. Please try again later.");
  }
};

const getCustomerDetailsByIdService = async (id) => {
  try {
    const customer = await User.findOne({
      where: { id: id, role: "customer" },
      attributes: [
        "id",
        "fullname",
        "email",
        "mobile",
        "is_active",
        "createdAt",
      ],
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  } catch (error) {
    console.error("Error fetching customer details:", error);
    throw new Error(
      "Failed to fetch customer details. Please try again later."
    );
  }
};

const updateStatus = async (user_id) => {
  const user = await User.findByPk(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  user.is_active = !user.is_active;
  await user.save();
  return user;
};

const sendNotification = async ({
  title,
  message,
  userIds = [],
  TechnicianIds = [],
  schedule_start,
  admin_id,
}) => {
  const t = await sequelize.transaction();
  let pushSentCount = 0;

  try {
    const allUserIds = [...new Set([...userIds, ...TechnicianIds])];
    if (allUserIds.length === 0) throw new Error("No recipients selected");

    const hasSchedule = !!schedule_start && schedule_start.trim() !== "";
    const now = new Date();
    const scheduledAt = hasSchedule ? new Date(schedule_start) : null;
    const sendNow = !hasSchedule || scheduledAt <= now;

    const notification = await Notification.create(
      {
        user_id: admin_id,
        type: "admin send",
        title,
        description: message,
        status: sendNow ? "sent" : "pending",
      },
      { transaction: t }
    );

    // bulk create recipients
    const recipients = allUserIds.map((userId) => ({
      notification_id: notification.id,
      user_id: userId,
      sent_At: null,
    }));

    await NotificationRecipeient.bulkCreate(recipients, { transaction: t });

    if (sendNow) {
      const users = await User.findAll({
        where: { id: allUserIds },
        attributes: ["id", "onesignal_id", "role"],
        transaction: t,
      });

      for (const user of users) {
        if (user.onesignal_id) {
          const type = TechnicianIds.includes(user.id)
            ? "technician"
            : "customer";
          await sendInAppNotification(user.onesignal_id, title, message, type);
          pushSentCount++;
        }
        await NotificationRecipeient.update(
          { sent_at: new Date().toISOString() },
          {
            where: {
              notification_id: notification.id,
              user_id: user.id,
            },
            transaction: t,
          }
        );
      }

      await notification.update({
        status: "sent",
        sent_count: pushSentCount,
      });
    }

    await t.commit();
    return {
      success: true,
      notification_id: notification.id,
      total_recipients: allUserIds.length,
      push_sent: pushSentCount,
      scheduled: hasSchedule && scheduledAt > now,
    };
  } catch (error) {
    await t.rollback();
    console.error("Send notification error:", error);
    throw error;
  }
};

const getAllNotifications = async (admin_id, page, limit) => {
  const offset = (page - 1) * limit;

  const notifications = await Notification.findAndCountAll({
    where: { user_id: admin_id },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    data: notifications.rows,
    totalItems: notifications.count,
    totalPages: Math.ceil(notifications.count / limit),
    currentPage: page,
    limit,
  };
};

const deleteNotification = async (id, admin_id) => {
  return Notification.destroy({
    where: { id, user_id: admin_id },
  });
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
  updateLastLogin,
  getCustomerDetailsByIdService,
  getAllCustomers,
  updateStatus,
  sendNotification,
  getAllNotifications,
  deleteNotification,
  getAdminById,
  changeAdminStatus,
  deleteAdmin,
  getAdminAll,
};
