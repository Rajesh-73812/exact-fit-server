const Address = require("../models/address");
const sequelize = require("../config/db");

const createAddress = async (data, { transaction } = {}) => {
  return await Address.create(data, { transaction });
};

const getAddressByUserId = async (userId, { transaction } = {}) => {
  return await Address.findOne({ where: { user_id: userId }, transaction });
};

const updateAddress = async (id, data, { transaction } = {}) => {
  const address = await Address.findByPk(id, { transaction });
  if (!address) return null;
  await address.update(data, { transaction });
  return address;
};

const deleteAddress = async (id) => {
  const address = await Address.findByPk(id);
  if (!address) return null;
  await address.destroy();
  return address;
};

const getAllAddress = async (user_id) => {
  const addresses = await Address.findAll({
    where: { user_id },
    order: [
      ["is_default", "DESC"],
      ["createdAt", "DESC"],
    ],
  });
  return addresses;
};

const setDefaultAddress = async (addressId, user_id) => {
  const t = await sequelize.transaction();

  try {
    const address = await Address.findOne({
      where: { id: addressId, user_id },
      transaction: t,
    });

    if (!address) {
      await t.rollback();
      return { success: false, message: "Address not found" };
    }

    //Set all user addresses to false

    await Address.update(
      { is_default: false },
      { where: { user_id }, transaction: t }
    );

    await Address.update(
      { is_default: true },
      { where: { id: addressId, user_id }, transaction: t }
    );
    await t.commit();
    return {
      success: true,
      message: "Default address set successfully",
      data: address,
    };
  } catch (error) {
    await t.rollback();
    console.error("Set default address error:", error);
    throw new Error("Failed to update default address");
  }
};

const upsertAddress = async (data, userId, addressId = null) => {
  const {
    emirate,
    building,
    area,
    appartment,
    addtional_address,
    category,
    save_as_address_type,
    location,
    latitude,
    longitude,
  } = data;

  if (addressId) {
    const existingAddress = await Address.findOne({
      where: { id: addressId, user_id: userId },
    });

    if (!existingAddress) {
      throw new Error("Address not found for this user");
    }

    return await existingAddress.update({
      emirate,
      building,
      area,
      appartment,
      addtional_address,
      category,
      save_as_address_type,
      location,
      latitude,
      longitude,
    });
  }

  return await Address.create({
    user_id: userId,
    emirate,
    building,
    area,
    appartment,
    addtional_address,
    category,
    save_as_address_type,
    location,
    latitude,
    longitude,
    is_default: true,
  });
};

module.exports = {
  createAddress,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
  getAllAddress,
  setDefaultAddress,
  upsertAddress,
};
