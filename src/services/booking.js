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
      scope_of_work: bookingData.scope_of_work,
      full_fit_out: bookingData.full_fit_out,
      work_type: bookingData.work_type,
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
      existingBooking.full_fit_out =
        bookingData.full_fit_out || existingBooking.full_fit_out;
      existingBooking.work_type =
        bookingData.work_type || existingBooking.work_type;
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
        address_id: bookingData.address_id,
        scope_of_work: bookingData.scope_of_work,
        full_fit_out: bookingData.full_fit_out,
        work_type: bookingData.work_type,
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

module.exports = {
  upsertEnquiry,
};
