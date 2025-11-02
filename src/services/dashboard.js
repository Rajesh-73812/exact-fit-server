const User = require("../models");
const Booking = require("../models");
const { Op, Sequelize } = require("sequelize");

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

module.exports = {
  getUserTechnicianCounts,
  topUsersByBookingCount,
};
