const { Op } = require("sequelize");
const Address = require("../models/address");
const Booking = require("../models/booking");

const upsertEnquiry = async (user_id, bookingData) => {
  try {
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
      specific_work_type: bookingData.specific_work_type,
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

    const existingBooking = await Booking.findOne({
      where: { id: bookingData.id },
    });

    if (existingBooking) {
      existingBooking.fullname =
        bookingData.fullname || existingBooking.fullname;
      existingBooking.email = bookingData.email || existingBooking.email;
      existingBooking.scope_of_work =
        bookingData.scope_of_work || existingBooking.scope_of_work;
      existingBooking.specific_work_type =
        bookingData.specific_work_type || existingBooking.specific_work_type;
      existingBooking.existing_drawing =
        bookingData.existing_drawing || existingBooking.existing_drawing;
      existingBooking.plan_images =
        bookingData.plan_images || existingBooking.plan_images;
      existingBooking.estimated_budget_range =
        bookingData.estimated_budget_range ||
        existingBooking.estimated_budget_range;
      existingBooking.description =
        bookingData.description || existingBooking.description;

      await existingBooking.save();
      return existingBooking;
    } else {
      const newBooking = await Booking.create({
        user_id,
        fullname: bookingData.fullname,
        email: bookingData.email,
        mobile: bookingData.mobile,
        booking_type: "enquiry",
        address_id: bookingData.address_id,
        scope_of_work: bookingData.scope_of_work,
        specific_work_type: bookingData.specific_work_type,
        existing_drawing: bookingData.existing_drawing,
        plan_images: bookingData.plan_images,
        estimated_budget_range: bookingData.estimated_budget_range,
        description: bookingData.description,
        snapshot: snapshot,
      });

      return newBooking;
    }
  } catch (error) {
    console.error("Error in upsertEnquiry service:", error);
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

module.exports = {
  upsertEnquiry,
  getAllEmergency,
  getAllEnquiry,
};
