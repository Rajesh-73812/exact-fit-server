const User = require("../models/user");
const Booking = require("../models");
const Service = require("../models/service");
const { Op, Sequelize } = require("sequelize");
const Address = require("../models/address");
const SubService = require("../models/sub-service");
const moment = require("moment");
const SubscriptionVisit = require("../models/SubscriptionVisit");

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
          attributes: [], // We don"t need any columns from the Booking table, just counting the rows
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

// const ALLOWED_SORT_FIELDS = new Set([
//   "createdAt",
//   "updatedAt",
//   "title",
//   "position",
//   "id",
// ]);

// const getAllServices = async (options = {}) => {
//   const {
//     search,
//     filters = {},
//     pagination = { page: 1, limit: 10 },
//     sort = { sortBy: "createdAt", order: "DESC" },
//   } = options;

//   const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
//   const limit = Math.min(
//     Math.max(parseInt(pagination.limit, 10) || 10, 1),
//     200
//   );
//   const offset = (page - 1) * limit;

//   const sortBy = ALLOWED_SORT_FIELDS.has(sort.sortBy)
//     ? sort.sortBy
//     : "createdAt";
//   const order =
//     String(sort.order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

//   // Base where clauses
//   const serviceWhere = {};
//   const subServiceWhere = {};

//   // Apply filters
//   if (filters.category) {
//     serviceWhere.category = filters.category;
//   }

//   if (typeof filters.is_active === "boolean") {
//     serviceWhere.status = filters.is_active ? "active" : "inactive";
//   }

//   // SEARCH CONDITIONS
//   if (search && String(search).trim()) {
//     const likePattern = `%${search.trim()}%`;

//     serviceWhere[Op.or] = [
//       { title: { [Op.like]: likePattern } },
//       { description: { [Op.like]: likePattern } },

//       // OR SEARCH in SubService fields
//       { "$sub_services.title$": { [Op.like]: likePattern } },
//       { "$sub_services.description$": { [Op.like]: likePattern } },
//     ];

//     // subService where is optional — only used to filter rows inside include
//     subServiceWhere[Op.or] = [
//       { title: { [Op.like]: likePattern } },
//       { description: { [Op.like]: likePattern } },
//     ];
//   }

//   try {
//     const { count, rows } = await Service.findAndCountAll({
//       where: serviceWhere,
//       include: [
//         {
//           model: SubService,
//           as: "sub_services",
//           attributes: [
//             "id",
//             "title",
//             "sub_service_slug",
//             "price",
//             "discount",
//             "status",
//             "createdAt",
//           ],
//           where: subServiceWhere,
//           required: false,
//         },
//       ],
//       limit,
//       offset,
//       order: [[sortBy, order]],
//       distinct: true,
//       subQuery: false,
//     });

//     const pages = Math.max(Math.ceil(count / limit), 1);

//     const data = rows.map((service) => {
//       const plain = service.get({ plain: true });

//       // Filter sub-services on backend (extra layer)
//       if (search) {
//         const reg = new RegExp(search.trim(), "i");
//         plain.sub_services = plain.sub_services.filter(
//           (ss) =>
//             reg.test(ss.title) || (ss.description && reg.test(ss.description))
//         );
//       }

//       plain.subServiceCount = plain.sub_services.length;

//       return plain;
//     });

//     return {
//       rows: data,
//       meta: {
//         totalServices: count,
//         page,
//         limit,
//         pages,
//         sortBy,
//         order,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     throw new Error("Failed to fetch services");
//   }
// };

// for getting default address

const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "title",
  "position",
]);

const getAllServices = async (options = {}) => {
  const {
    search,
    filters = {},
    pagination = { page: 1, limit: 10 },
    sort = { sortBy: "createdAt", order: "DESC" },
  } = options;

  // Pagination
  const page = Math.max(Number(pagination.page) || 1, 1);
  const limit = Math.min(Math.max(Number(pagination.limit) || 10, 1), 200);
  const offset = (page - 1) * limit;

  // Sorting
  const sortBy = ALLOWED_SORT_FIELDS.has(sort.sortBy)
    ? sort.sortBy
    : "createdAt";
  const order = String(sort.order).toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Base where conditions
  const serviceWhere = {};

  if (filters.category) serviceWhere.category = filters.category;
  if (typeof filters.is_active === "boolean") {
    serviceWhere.status = filters.is_active ? "active" : "inactive";
  }

  // Search
  const normalizedSearch =
    typeof search === "string" && search.trim() ? search.trim() : null;
  if (normalizedSearch) {
    const likePattern = `%${normalizedSearch}%`;
    serviceWhere[Op.or] = [
      { title: { [Op.like]: likePattern } },
      { description: { [Op.like]: likePattern } },
    ];
  }

  // Step 1: Get total count of matching services (ignoring subservices)
  const totalCount = await Service.count({
    where: serviceWhere,
    distinct: true,
    col: "id",
  });

  // Step 2: Get paginated list of service IDs only
  const serviceIds = await Service.findAll({
    attributes: ["id"],
    where: serviceWhere,
    offset,
    limit,
    order: [[sortBy, order]],
    raw: true,
  }).then((rows) => rows.map((row) => row.id));

  // If no services match pagination, return empty
  if (serviceIds.length === 0) {
    return {
      rows: [],
      meta: {
        totalServices: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
        sortBy,
        order,
      },
    };
  }

  // Step 3: Fetch full services + subservices using the paginated IDs
  const services = await Service.findAll({
    where: {
      ...serviceWhere,
      id: serviceIds,
    },
    include: [
      {
        model: SubService,
        as: "sub_services",
        required: false,
        attributes: [
          "id",
          "title",
          "sub_service_slug",
          "price",
          "discount",
          "image_url",
          "status",
          "createdAt",
        ],
      },
    ],
    order: [[sortBy, order]],
  });

  // Format response
  const data = services.map((service) => {
    const plain = service.get({ plain: true });
    plain.subServiceCount = Array.isArray(plain.sub_services)
      ? plain.sub_services.length
      : 0;
    return plain;
  });

  return {
    rows: data,
    meta: {
      totalServices: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      sortBy,
      order,
    },
  };
};

const getDefaultAddress = async (user_id) => {
  const address = await Address.findOne({
    where: { user_id },
    order: [["createdAt", "DESC"]],
  });
  return address;
};

const getServicesBySlug = async (service_slug) => {
  console.log(service_slug, "slugggggggggggggg");
  try {
    const service = await Service.findOne({
      where: { service_slug },
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
            "image_url",
            "createdAt",
          ],
        },
      ],
    });
    console.log(service, "serviceeeeeeeeeeeeee");
    return service;
  } catch (error) {
    console.error("Error fetching services by slug:", error);
    throw new Error("Failed to fetch services by slug");
  }
};

const getSubServicesBySlug = async (sub_service_slug) => {
  try {
    const subService = await SubService.findOne({
      where: { sub_service_slug },
    });
    return subService;
  } catch (error) {
    console.error("Error fetching sub-services by slug:", error);
    throw new Error("Failed to fetch sub-services by slug");
  }
};

const getTechnicianAddress = async (user_id) => {
  const address = await Address.findOne({
    where: { user_id },
    attributes: ["area", "location"],
  });
  return address;
};

const getTechnicianDashBoard = async (user_id) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    // Get assigned work for the technician
    const assignedWork = await SubscriptionVisit.findAll({
      where: {
        technician_id: user_id,
        // scheduled_date: today,
        status: {
          [Op.ne]: "cancelled",
        },
      },
      attributes: [
        "scheduled_date",
        "subservice_id",
        "status",
        "notes",
        "visit_number",
        "address_id",
        "createdAt",
      ],
      include: [
        {
          model: SubService,
          as: "subservice",
          attributes: ["id", "title", "service_id"],
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["id", "title", "description"],
            },
          ],
        },
      ],
      logging: console.log,
    });

    console.log(assignedWork, "lllllllllllll");
    // Get the count of completed services for the technician
    const completedServicesCount = await SubscriptionVisit.count({
      where: {
        technician_id: user_id,
        actual_date: today,
        status: "completed",
      },
    });

    // Get the count of active services for the technician
    const activeServicesCount = await SubscriptionVisit.count({
      where: {
        technician_id: user_id,
        status: {
          [Op.or]: ["scheduled", "in_progress"], // Services that are scheduled or in progress
        },
      },
    });

    // Return the data in the requested format
    return {
      success: true,
      message: "Dashboard data fetched successfully",
      data: [
        {
          assignedWork: assignedWork, // Array of assigned work objects
        },
        {
          completedServices: completedServicesCount, // Count of completed services
        },
        {
          activeServices: activeServicesCount, // Count of active services
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching technician dashboard data:", error);
    return {
      success: false,
      message: "Error fetching data",
      data: [],
    };
  }
};

module.exports = {
  getUserTechnicianCounts,
  topUsersByBookingCount,
  getAllServices,
  getDefaultAddress,
  getServicesBySlug,
  getSubServicesBySlug,
  getTechnicianAddress,
  getTechnicianDashBoard,
};
