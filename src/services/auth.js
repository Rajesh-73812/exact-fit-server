const User = require("../models/user");

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

module.exports = {
  registerAdmin,
  checkUserExists,
  updateProfileService,
};
