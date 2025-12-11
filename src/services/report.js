const { Op } = require("sequelize");
const User = require("../models/user");
const Address = require("../models/address");

const getAllTechnicianReports = async ({
  search,
  filter,
  page,
  limit,
  from,
  to,
}) => {
  const where = { role: "technician", deletedAt: null };
  const offset = (page - 1) * limit;

  console.log(from, to, "from and to for technicians");

  const include = [
    {
      model: Address,
      as: "addresses",
      attributes: ["id", "area", "location"],
      required: false,
    },
  ];

  // Apply search filter
  if (search) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
      { "$addresses.area$": { [Op.like]: `%${search}%` } },
    ];
  }

  // Apply service_type filter if provided
  if (filter) {
    where.service_type = filter;
  }

  // Apply date filtering for "from"
  if (from) {
    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push({ createdAt: { [Op.gte]: startOfDay } });
  }

  // Apply date filtering for "to"
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999); // Set to the end of the day (23:59:59.999)
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push({ createdAt: { [Op.lte]: endOfDay } });
  } else if (from) {
    // If only "from" is provided, limit it to today"s end
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of the day
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push({ createdAt: { [Op.lte]: today } });
  }

  // Query to fetch the rows and count
  const [rows, count] = await Promise.all([
    User.findAll({
      where,
      attributes: [
        "id",
        "fullname",
        "email",
        "mobile",
        "service_type",
        "emirates_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      include,
      subQuery: false,
    }),
    User.count({
      where,
      include,
      distinct: true,
    }),
  ]);

  const totalPages = Math.ceil(count / limit);

  return {
    rows,
    count,
    totalPages,
    page,
    limit,
  };
};

const getAllCustomerReports = async ({ search, page, limit, from, to }) => {
  const where = { role: "customer", deletedAt: null };

  if (!where[Op.and]) where[Op.and] = [];

  const offset = (page - 1) * limit;

  if (search) {
    where[Op.or] = [
      { fullname: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobile: { [Op.like]: `%${search}%` } },
    ];
  }

  if (from) {
    const startOfDay = new Date(from);
    where[Op.and].push({ createdAt: { [Op.gte]: startOfDay } });
  }

  if (to) {
    const endOfDay = new Date(to);
    where[Op.and].push({ createdAt: { [Op.lte]: endOfDay } });
  } else if (from) {
    const today = new Date();
    where[Op.and].push({ createdAt: { [Op.lte]: today } });
  }

  console.log(from, to, "frommmmmmmm");
  console.log(search, "searchhhhhhhh");
  const [rows, count] = await Promise.all([
    User.findAll({
      where,
      attributes: [
        "id",
        "fullname",
        "email",
        "mobile",
        "service_type",
        "emirates_id",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      offset,
      limit,
    }),
    User.count({ where, distinct: true }),
  ]);

  const totalPages = Math.ceil(count / limit);

  return {
    rows,
    count,
    totalPages,
    page,
    limit,
  };
};

const getCustomerById = async (userId) => {
  try {
    const customer = await User.findOne({
      where: {
        id: userId,
        role: "customer",
        deletedAt: null,
      },
      attributes: ["id", "fullname", "email", "mobile", "createdAt"],
    });
    return customer;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw new Error("Failed to fetch customer");
  }
};

const getTechnicianById = async (userId) => {
  try {
    const technician = await User.findOne({
      where: {
        id: userId,
        role: "technician",
        deletedAt: null,
      },
      attributes: ["id", "fullname", "email", "mobile", "createdAt"],
      include: [
        {
          model: Address,
          as: "addresses",
          attributes: ["id", "area", "location"],
          required: false,
        },
      ],
    });
    return technician;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw new Error("Failed to fetch customer");
  }
};

module.exports = {
  getAllTechnicianReports,
  getAllCustomerReports,
  getCustomerById,
  getTechnicianById,
};
