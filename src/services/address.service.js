const Address = require('../models/address');

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

module.exports = {
  createAddress,
  getAddressByUserId,
  updateAddress,
  deleteAddress,
};