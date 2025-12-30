const { Op } = require("sequelize");
const Address = require("../models/address");
const User = require("../models/user");
const Booking = require("../models/booking");
const Service = require("../models/service");
const SubService = require("../models/sub-service");
const UserSubscription = require("../models/userSubscription");
const SubscriptionVisit = require("../models/SubscriptionVisit");
const SubscriptionPlan = require("../models/subscriptionPlan");
const planSubService = require("../models/planSubService");
const UserSubscriptionCustom = require("../models/userSubscriptionCustom");
const {
  sendInAppNotification,
  createNotification,
} = require("../helper/notification");
const notification = require("../config/notifications.json");

const upsertEnquiry = async (user_id, bookingData) => {
  try {
    const user = await User.findByPk(user_id);
    const address = bookingData.address_id
      ? await Address.findOne({
          where: { id: bookingData.address_id, user_id },
        })
      : null;

    const snapshot = {
      fullname: bookingData.fullname,
      email: bookingData.email,
      mobile: bookingData.mobile,
      booking_type: "enquiry",
      scope_of_work: bookingData.scope_of_work,
      existing_drawing: bookingData.existing_drawing,
      estimated_budget_range: bookingData.estimated_budget_range,
      address: address
        ? {
            emirate: address.emirate,
            building: address.building,
            area: address.area,
            appartment: address.appartment,
            additional_address: address.addtional_address,
            category: address.category,
            save_as_address_type: address.save_as_address_type,
            location: address.location,
            latitude: address.latitude,
            longitude: address.longitude,
          }
        : null,
    };
    const newBooking = await Booking.create({
      user_id,
      fullname: bookingData.fullname,
      email: bookingData.email,
      mobile: bookingData.mobile,
      booking_type: "enquiry",
      address_id: bookingData.address_id,
      scope_of_work: bookingData.scope_of_work,
      existing_drawing: bookingData.existing_drawing,
      plan_images: bookingData.plan_images,
      estimated_budget_range: bookingData.estimated_budget_range,
      description: bookingData.description,
      snapshot: snapshot,
    });

    if (user.onesignal_id) {
      await sendInAppNotification(
        user.onesignal_id,
        notification.enquiry_sent.title,
        notification.enquiry_sent.message,
        user.role
      );
      await createNotification(
        user.id,
        notification.enquiry_sent.title,
        notification.enquiry_sent.message
      );
    }
    return newBooking;
  } catch (error) {
    console.error("Error in upsertEnquiry service:", error);
    throw new Error("Failed to upsert booking.");
  }
};

const upsertEmergency = async (user_id, bookingData) => {
  try {
    const user = await User.findByPk(user_id);

    const address = bookingData.address_id
      ? await Address.findOne({
          where: { id: bookingData.address_id, user_id },
        })
      : null;

    const service = bookingData.service_id
      ? await Service.findOne({
          where: { id: bookingData.service_id },
        })
      : null;

    const subService = bookingData.sub_service_id
      ? await SubService.findOne({
          where: { id: bookingData.sub_service_id },
        })
      : null;

    const snapshot = {
      fullname: bookingData.fullname,
      email: bookingData.email,
      mobile: bookingData.mobile,
      booking_type: "emergency",
      service_id: bookingData.service_id,
      service_name: service.title,
      sub_service_id: bookingData.sub_service_id,
      sub_service_name: subService.title,
      sub_service_price: subService.price,
      address: address
        ? {
            emirate: address.emirate,
            building: address.building,
            area: address.area,
            appartment: address.appartment,
            additional_address: address.addtional_address,
            category: address.category,
            save_as_address_type: address.save_as_address_type,
            location: address.location,
            latitude: address.latitude,
            longitude: address.longitude,
          }
        : null,
    };

    const newBooking = await Booking.create({
      user_id,
      fullname: bookingData.fullname,
      email: bookingData.email,
      mobile: bookingData.mobile,
      booking_type: "emergency",
      service_id: bookingData.service_id,
      sub_service_id: bookingData.sub_service_id,
      address_id: bookingData.address_id,
      description: bookingData.description,
      snapshot: snapshot,
    });

    if (user.onesignal_id) {
      await sendInAppNotification(
        user.onesignal_id,
        notification.emergency_request_sent.title,
        notification.emergency_request_sent.message,
        user.role
      );
      await createNotification(
        user.id,
        notification.emergency_request_sent.title,
        notification.emergency_request_sent.message
      );
    }
    return newBooking;
  } catch (error) {
    console.error("Error in upsertEmergency service:", error);
    throw new Error("Failed to upsert booking.");
  }
};

const getAllEmergency = async (
  user_id,
  page = 1,
  pageSize = 10,
  search = "",
  filter = "all"
) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      user_id: user_id,
      booking_type: "emergency",
    };

    if (filter === "active") {
      whereClause.status = { [Op.ne]: "completed" };
    } else if (filter === "completed") {
      whereClause.status = "completed";
    } else if (filter === "pending") {
      whereClause.status = "pending";
    }
    if (search) {
      whereClause[Op.or] = [
        { fullname: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const emergencies = await Booking.findAndCountAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows: emergencies.rows,
      totalCount: emergencies.count,
      totalPages: Math.ceil(emergencies.count / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching emergencies: ", error);
    throw new Error("Error fetching emergencies");
  }
};

const getAllEnquiry = async (
  user_id,
  page = 1,
  pageSize = 10,
  search = "",
  filter = ""
) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      user_id: user_id,
      booking_type: "enquiry",
    };

    if (filter) {
      whereClause.status = filter;
    }

    if (search) {
      whereClause[Op.or] = [
        { fullname: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const enquiries = await Booking.findAndCountAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows: enquiries.rows,
      totalCount: enquiries.count,
      totalPages: Math.ceil(enquiries.count / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    throw new Error("Error fetching enquiries");
  }
};

const getServiceById = async ({ user_id, id, type }) => {
  try {
    let condition = {
      where: {
        id: id,
        user_id: user_id,
      },
      include: [
        {
          model: Address,
          as: "address",
          required: false,
        },
      ],
    };

    if (type) {
      condition.where.booking_type = type;
    }

    const booking = await Booking.findOne(condition);
    console.log(booking, "book");
    if (!booking) {
      return null;
    }

    return {
      id: booking.id,
      fullname: booking.fullname,
      email: booking.email,
      mobile: booking.mobile,
      booking_type: booking.booking_type,
      service_id: booking.service_id,
      sub_service_id: booking.sub_service_id,
      status: booking.status,
      scope_of_work: booking.scope_of_work,
      existing_drawing: booking.existing_drawing,
      plan_images: booking.plan_images,
      estimated_budget_range: booking.estimated_budget_range,
      description: booking.description,
      emirate: booking.address.emirate,
      building: booking.address.building,
      area: booking.address.area,
      appartment: booking.address.appartment,
      addtional_address: booking.address.addtional_address,
      save_as_address_type: booking.address.save_as_address_type,
      location: booking.address.location,
      latitude: booking.address.latitude,
      longitude: booking.address.longitude,
    };
  } catch (error) {
    console.error("Error in getServiceById:", error);
    throw new Error("Failed to retrieve service. Please try again later.");
  }
};

const cancelEnquiry = async (user_id, id) => {
  const booking = await Booking.findOne({
    where: { id, user_id },
  });

  if (!booking) {
    throw new Error("enquiry booking not found");
  }

  await booking.update({
    status: "cancelled",
  });

  return booking;
};
// for admin
const getAllSubscriptionBooking = async (opts = {}) => {
  const limit = Math.min(parseInt(opts.limit || 10), 200);
  const offset = parseInt(opts.offset || 0, 10);
  const status = opts.status;
  const where = { status: "active" };

  if (status) where.status = status;

  const { count, rows } = await UserSubscription.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include: [
      {
        model: SubscriptionVisit,
        as: "visits",
        attributes: [
          "subservice_id",
          "address_id",
          "scheduled_date",
          "actual_date",
          "status",
          "visit_number",
        ],
        required: false,
      },
      {
        model: SubscriptionPlan,
        as: "subscription_plan",
        attributes: ["name", "description"],
        required: false,
        include: [
          {
            model: planSubService,
            as: "planSubServices",
            attributes: ["subscription_plan_id", "service_id", "visit_count"],
            include: [
              {
                model: Service,
                as: "service",
                attributes: ["id", "title", "description"],
              },
            ],
          },
        ],
      },
      {
        model: UserSubscriptionCustom,
        as: "custom_items",
        required: false,
        attributes: [
          "user_subscription_id",
          "quantity",
          "unit_price",
          "total_amount",
        ],
        include: [
          {
            model: SubService,
            as: "subservice",
            attributes: [
              "id",
              "title",
              "description",
              "sub_service_visit_count",
            ],
          },
        ],
      },
    ],
  });

  // Process the subscription data into the desired format
  const subscriptions = rows.map((s) => {
    const isCustom = Array.isArray(s.custom_items) && s.custom_items.length > 0;

    const base = {
      id: s.id,
      user_id: s.user_id,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      price_total: s.price_total,
      payment_option: s.payment_option,
      amount_per_cycle: s.amount_per_cycle,
      payment_status: s.payment_status,
      payment_method: s.payment_method,
      subscriptionType: isCustom ? "custom" : "plan",
      subscriptionPlanName: s.subscription_plan
        ? s.subscription_plan.name
        : null,
      subscriptionPlanDescription: s.subscription_plan
        ? s.subscription_plan.description
        : null,
    };

    // Add custom subscription details if it exists
    if (isCustom) {
      base.details = {
        items: s.custom_items.map((ci) => ({
          id: ci.id,
          subservice_id: ci.subservice_id,
          quantity: ci.quantity,
          unit_price: ci.unit_price,
          total_amount: ci.total_amount,
        })),
      };
      base.visits = s.visits && s.visits.length > 0 ? s.visits : [];
    } else {
      // Add the SubscriptionPlan details and visits if available
      if (s.subscription_plan && s.subscription_plan.planSubServices) {
        base.visits = s.subscription_plan.planSubServices.map((ps) => {
          const service = ps.service || {};

          // Filter visits that match the service/subservice_id
          const scheduledVisits = s.visits.filter(
            (visit) => visit.subservice_id === service.id
          );

          return {
            service_name: service.title,
            service_description: service.description,
            visit_count: ps.visit_count,
            scheduled_visits: scheduledVisits,
          };
        });
      }
    }

    return base;
  });

  return {
    total: count,
    limit,
    offset,
    subscriptions,
  };
};

const getSubscriptionById = async (subscriptionId) => {
  const s = await UserSubscription.findOne({
    where: { id: subscriptionId },
    include: [
      {
        model: SubscriptionVisit,
        as: "visits",
        attributes: [
          "id",
          "subservice_id",
          "address_id",
          "scheduled_date",
          "actual_date",
          "status",
          "visit_number",
          "technician_id",
        ],
        required: false,
      },
      {
        model: SubscriptionPlan,
        as: "subscription_plan",
        attributes: ["name", "description"],
        required: false,
        include: [
          {
            model: planSubService,
            as: "planSubServices",
            attributes: ["subscription_plan_id", "service_id", "visit_count"],
            include: [
              {
                model: Service,
                as: "service",
                attributes: ["id", "title", "description"],
              },
            ],
          },
        ],
      },
      {
        model: UserSubscriptionCustom,
        as: "custom_items",
        required: false,
        attributes: [
          "id",
          "subservice_id",
          "quantity",
          "unit_price",
          "total_amount",
        ],
        include: [
          {
            model: SubService,
            as: "subservice",
            attributes: [
              "id",
              "title",
              "description",
              "sub_service_visit_count",
            ],
          },
        ],
      },
    ],
  });

  if (!s) return null;

  const isCustom = Array.isArray(s.custom_items) && s.custom_items.length > 0;

  const response = {
    id: s.id,
    user_id: s.user_id,
    start_date: s.start_date,
    end_date: s.end_date,
    status: s.status,
    price_total: s.price_total,
    payment_option: s.payment_option,
    amount_per_cycle: s.amount_per_cycle,
    payment_status: s.payment_status,
    payment_method: s.payment_method,
    subscriptionType: isCustom ? "custom" : "plan",
    subscriptionPlanName: s.subscription_plan?.name || null,
    subscriptionPlanDescription: s.subscription_plan?.description || null,
    visits: [],
  };

  /* ---------------- CUSTOM SUBSCRIPTION ---------------- */
  if (isCustom) {
    response.details = {
      items: s.custom_items.map((ci) => ({
        id: ci.id,
        subservice_id: ci.subservice_id,
        title: ci.subservice?.title,
        description: ci.subservice?.description,
        quantity: ci.quantity,
        unit_price: ci.unit_price,
        total_amount: ci.total_amount,
      })),
    };

    // response.visits = s.visits && s.visits.length > 0 ? s.visits : [];
    response.visits = (s.visits || []).map((v) => ({
      id: v.id, // ✅
      subservice_id: v.subservice_id,
      scheduled_date: v.scheduled_date,
      actual_date: v.actual_date,
      status: v.status,
      visit_number: v.visit_number,
      technician_id: v.technician_id,
    }));
    return response;
  }

  /* ---------------- PLAN SUBSCRIPTION ---------------- */
  if (s.subscription_plan && s.subscription_plan.planSubServices) {
    response.visits = s.subscription_plan.planSubServices.map((ps) => {
      const service = ps.service || {};

      const scheduledVisits = s.visits
        .filter((visit) => visit.subservice_id === service.id)
        .sort((a, b) => a.visit_number - b.visit_number);

      return {
        service_id: service.id,
        service_name: service.title,
        service_description: service.description,
        visit_count: ps.visit_count,
        scheduled_visits: scheduledVisits.map((v) => ({
          id: v.id,
          scheduled_date: v.scheduled_date,
          actual_date: v.actual_date,
          status: v.status,
          visit_number: v.visit_number,
          technician_id: v.technician_id,
          technician_assigned: !!v.technician_id,
        })),
      };
    });
  } else {
    response.visits = [];
  }

  return response;
};

const getAllEnquiryBooking = async ({
  page = 1,
  pageSize = 10,
  search = "",
}) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      booking_type: "enquiry",
    };

    if (search) {
      whereClause[Op.or] = [
        { fullname: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const enquiries = await Booking.findAndCountAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows: enquiries.rows,
      totalCount: enquiries.count,
      totalPages: Math.ceil(enquiries.count / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching enquiries: ", error);
    throw new Error("Error fetching enquiries");
  }
};

const getAllEmergencyBooking = async ({
  page = 1,
  pageSize = 10,
  search = "",
}) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      booking_type: "emergency",
    };

    if (search) {
      whereClause[Op.or] = [
        { fullname: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const emergencies = await Booking.findAndCountAll({
      where: whereClause,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows: emergencies.rows,
      totalCount: emergencies.count,
      totalPages: Math.ceil(emergencies.count / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching emergencies: ", error);
    throw new Error("Error fetching emergencies");
  }
};

const getEmergencyBookingById = async (id) => {
  return await Booking.findOne({
    where: {
      id,
      booking_type: "emergency",
    },
  });
};

const getAllEnquiryBookingById = async (id) => {
  return await Booking.findOne({
    where: {
      id,
      booking_type: "enquiry",
    },
  });
};

const assignTechnicianToVisit = async ({
  visitId,
  technicianId,
  scheduledDate,
  status,
}) => {
  const visit = await SubscriptionVisit.findByPk(visitId, {
    include: [{ model: Service, as: "service", attributes: ["title"] }],
  });

  if (!visit) {
    const error = new Error("Visit not found");
    error.status = 404;
    throw error;
  }

  if (visit.status === "completed") {
    const error = new Error("Cannot assign technician to a completed visit");
    error.status = 400;
    throw error;
  }

  const technician = await User.findByPk(technicianId);
  if (!technician) {
    const error = new Error("Technician not found");
    error.status = 404;
    throw error;
  }

  const updateData = { technician_id: technicianId };

  if (scheduledDate) updateData.scheduled_date = scheduledDate;
  if (status) {
    if (status === "completed") {
      const error = new Error("Cannot manually set status to completed");
      error.status = 400;
      throw error;
    }
    updateData.status = status;
  }

  await visit.update(updateData);

  await visit.reload();

  return visit;
};

module.exports = {
  upsertEnquiry,
  upsertEmergency,
  getAllEmergency,
  getAllEnquiry,
  getServiceById,
  getAllSubscriptionBooking,
  getAllEnquiryBooking,
  getAllEmergencyBooking,
  getEmergencyBookingById,
  getAllEnquiryBookingById,
  getSubscriptionById,
  assignTechnicianToVisit,
  cancelEnquiry,
};
