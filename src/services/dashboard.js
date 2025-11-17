const User = require("../models/user");
const Booking = require("../models");
const Service = require("../models/service");
const { Op, Sequelize } = require("sequelize");
const Address = require("../models/address");
const SubService = require("../models/sub-service");
const getUserTechnicianCounts = async () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfPreviousMonth = new Date(
    currentYear,
    currentMonth,
    0,
    23,
    59,
    59,
    999
  );
  // const startOfYear = new Date(currentYear, 0, 1);

  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      currentMonthUsers,
      previousMonthUsers,
      totalTechnicians,
      activeTechnicians,
      inactiveTechnicians,
      currentMonthTechnicians,
      previousMonthTechnicians,
    ] = await Promise.all([
      User.count({ where: { role: "customer" } }), // total
      User.count({ where: { role: "customer", status: true } }), //active
      User.count({ where: { role: "customer", status: false } }), // inactive
      User.count({
        where: {
          role: "customer",
          createdAt: { [Op.gte]: startOfCurrentMonth },
        },
      }), // current month
      User.count({
        where: {
          role: "customer",
          createdAt: {
            [Op.between]: [startOfPreviousMonth, endOfPreviousMonth],
          },
        },
      }), // previous month

      User.count({ where: { role: "technician" } }),
      User.count({ where: { role: "technician", status: true } }),
      User.count({ where: { role: "technician", status: false } }),
      User.count({
        where: {
          role: "technician",
          createdAt: { [Op.gte]: startOfCurrentMonth },
        },
      }),
      User.count({
        where: {
          role: "technician",
          createdAt: {
            [Op.between]: [startOfPreviousMonth, endOfPreviousMonth],
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      currentMonthUsers,
      previousMonthUsers,
      totalTechnicians,
      activeTechnicians,
      inactiveTechnicians,
      currentMonthTechnicians,
      previousMonthTechnicians,
    };
  } catch (error) {
    console.error("Error in service layer:", error);
    throw new Error("Failed to fetch user/technician counts");
  }
};

const topUsersByBookingCount = async () => {
  try {
    const result = await User.findAll({
      attributes: [
        "id",
        "profileimage",
        "fullname",
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("Bookings.id")), "bookingCount"], // Count bookings
      ],
      include: [
        {
          model: Booking, // Join the Booking model
          attributes: [], // We don't need any columns from the Booking table, just counting the rows
          required: true, // Ensures the user has at least one booking
          where: {
            status: "completed", // Only count completed bookings
          },
        },
      ],
      group: ["User.id"], // Group by user ID to count bookings for each user
      order: [[Sequelize.literal("bookingCount"), "DESC"]], // Order by booking count descending
      limit: 10, // Limit to top 10 users (optional)
    });

    // Return the result with the booking count
    return result.map((user) => ({
      userId: user.id,
      profileImage: user.profileimage,
      fullname: user.fullname,
      status: user.status,
      bookingCount: parseInt(user.dataValues.bookingCount, 10), // Ensure booking count is an integer
    }));
  } catch (error) {
    console.error("Error fetching top users by booking count:", error);
    throw new Error("Failed to fetch top users by booking count");
  }
};

// for mobile

const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "title",
  "position",
  "id",
]);

const getAllServices = async (options = {}) => {
  const {
    search,
    filters = {},
    pagination = { page: 1, limit: 10 },
    sort = { sortBy: "createdAt", order: "DESC" },
  } = options;

  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(pagination.limit, 10) || 10, 1),
    200
  );
  const offset = (page - 1) * limit;

  const sortBy = ALLOWED_SORT_FIELDS.has(sort.sortBy)
    ? sort.sortBy
    : "createdAt";
  const order =
    String(sort.order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Service-level where clause
  const serviceWhere = {};
  // SubService-level where clause (for the included model)
  const subServiceWhere = {};

  if (filters.category) {
    serviceWhere.category = filters.category;
  }
  if (typeof filters.is_active === "boolean") {
    serviceWhere.status = filters.is_active ? "active" : "inactive";
  }

  if (search && String(search).trim().length > 0) {
    const likePattern = `%${search.trim()}%`;

    // Conditions for the main Service model
    serviceWhere[Op.or] = [
      { title: { [Op.like]: likePattern } },
      { description: { [Op.like]: likePattern } },
      // Add more Service fields if needed for search
    ];

    // Conditions for the included SubService model
    subServiceWhere[Op.or] = [
      { title: { [Op.like]: likePattern } },
      // If SubService model has a description field, add it here:
      // { description: { [Op.like]: likePattern } },
    ];

    // IMPORTANT: If you want services to appear IF ANY of their sub_services match,
    // you MUST make the `required: true` for the include, so it acts like an INNER JOIN.
    // If you keep `required: false` (LEFT JOIN), then you need to handle the search differently
    // if you want services *without* matching sub_services to still appear if the service itself matches.
    // The current approach with `required: true` is simpler for combined searching.
    // If a service has no matching sub_services AND the service itself doesn't match the search, it won't be returned.
  }

  try {
    const { count, rows } = await Service.findAndCountAll({
      where: serviceWhere, // Conditions for the Service model
      include: [
        {
          model: SubService,
          as: "sub_services",
          attributes: [
            "id",
            "title",
            "sub_service_slug",
            "price",
            "discount",
            "status",
            "createdAt",
          ],
          where: subServiceWhere, // *** CRITICAL CHANGE HERE: Conditions for the SubService model ***
          required: Object.keys(subServiceWhere).length > 0, // Make it a required (INNER) join if subService search conditions exist
          // Otherwise, it remains a LEFT JOIN (required: false)
        },
      ],
      limit,
      offset,
      order: [[sortBy, order]],
      distinct: true, // Ensures the count is for distinct services even with joins
    });

    const pages = Math.max(Math.ceil(count / limit), 1);

    const data = rows.map((r) => {
      const plain = r.get ? r.get({ plain: true }) : r;
      plain.subServiceCount = Array.isArray(plain.sub_services)
        ? plain.sub_services.length
        : 0;
      return plain;
    });

    return {
      rows: data,
      meta: {
        totalServices: count,
        page,
        limit,
        pages,
        sortBy,
        order,
      },
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    throw new Error("Failed to fetch services");
  }
};

// for getting default address
const getDefaultAddress = async (user_id) => {
  const address = await Address.findOne({
    where: { user_id, is_default: true },
  });
  return address;
};

module.exports = {
  getUserTechnicianCounts,
  topUsersByBookingCount,
  getAllServices,
  getDefaultAddress,
};
