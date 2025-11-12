const Address = require("../models/address");
const User = require("../models/user");

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

module.exports = {
  createTechnician,
  getAllTechnicians,
  getTechnicianByEmail,
  getTechnicianById,
  getTechnicianByMobile,
  updateTechnician,
  deleteTechnician,
  getTechnicianByIdWithAddress,
};
