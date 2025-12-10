const Contactus = require("../models/contact_us");
const { Op } = require("sequelize");

const createContactus = async (contactUsData) => {
  return Contactus.create(contactUsData);
};

// for admin
const getAllContactUs = async ({ search = "", page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;

  const where = search
    ? {
        [Op.or]: [
          { message: { [Op.like]: `%${search}%` } },
          { fullname: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }
    : {};

  const { rows, count } = await Contactus.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
  };
};

const getContactUsById = async (id) => {
  return Contactus.findByPk(id);
};

module.exports = {
  createContactus,
  getAllContactUs,
  getContactUsById,
};
