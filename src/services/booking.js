const { Op } = require("sequelize");
const Address = require("../models/address");
const User = require("../models/user");
const Booking = require("../models/booking");
const Service = require("../models/service");
const SubService = require("../models/sub-service");
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
  search = ""
) => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      user_id: user_id,
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

const getAllEnquiry = async (user_id, page = 1, pageSize = 10, search = "") => {
  try {
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    const whereClause = {
      user_id: user_id,
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

const getServiceById = async ({ user_id, id, type }) => {
  try {
    let condition = {
      where: {
        id: id,
        user_id: user_id,
      },
    };

    if (type) {
      condition.where.booking_type = type;
    }

    const booking = await Booking.findOne(condition);

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
    };
  } catch (error) {
    console.error("Error in getServiceById:", error);
    throw new Error("Failed to retrieve service. Please try again later.");
  }
};

// for admin
const getAllSubscriptionBooking = async () => {
  return 1;
  // try {
  //   return 1;
  // } catch (error) {
  //   console.error(error);
  // }
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

module.exports = {
  upsertEnquiry,
  upsertEmergency,
  getAllEmergency,
  getAllEnquiry,
  getServiceById,
  getAllSubscriptionBooking,
  getAllEnquiryBooking,
  getAllEmergencyBooking,
};
