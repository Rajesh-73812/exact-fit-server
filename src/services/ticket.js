const { generateTicketNumber } = require("../helper/formattedMobile");
const {
  sendInAppNotification,
  createNotification,
} = require("../helper/notification");
const Ticket = require("../models/ticket");
const User = require("../models/user");
const notification = require("../config/notifications.json");

const createTicket = async ({ user_id, title, description, image_url }) => {
  const ticketNumber = await generateTicketNumber();
  try {
    const ticket = await Ticket.create({
      user_id,
      title,
      description,
      image_url,
      ticketNumber,
      status: "pending",
    });

    const user = await User.findByPk(user_id);
    if (user.onesignal_id) {
      await sendInAppNotification(
        user.onesignal_id,
        notification.ticket_raised.title,
        notification.ticket_raised.message,
        user.role
      );
      await createNotification(
        user.id,
        notification.ticket_raised.title,
        notification.ticket_raised.message
      );
    }
    return ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error("Error creating ticket");
  }
};

const getAllTicket = async (user_id) => {
  try {
    const tickets = await Ticket.findAll({
      where: { user_id },
      order: [["createdAt", "DESC"]],
    });

    console.log(tickets, "frommmmmmmmmmmmmmmtickettttttttttt");
    const cleanedTickets = tickets.map((ticket) => {
      if (ticket.image_url && typeof ticket.image_url === "string") {
        try {
          ticket.image_url = JSON.parse(ticket.image_url);
        } catch (error) {
          console.error("Error parsing image_url:", error);
        }
      }
      return ticket;
    });
    return cleanedTickets;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error("Error fetching tickets");
  }
};

const getTicketByNumber = async ({ user_id, ticketNumber }) => {
  try {
    const ticket = await Ticket.findOne({
      where: { user_id, ticketNumber },
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    if (ticket.image_url && typeof ticket.image_url === "string") {
      try {
        ticket.image_url = JSON.parse(ticket.image_url);
      } catch (error) {
        console.error("Error parsing image_url:", error);
      }
    }
    return ticket;
  } catch (error) {
    console.error("Error fetching ticket by number:", error);
    throw new Error("Error fetching ticket");
  }
};

const statusBasedTicket = async ({ user_id, status }) => {
  try {
    const tickets = await Ticket.findAll({
      where: { user_id, status },
      order: [["createdAt", "DESC"]],
    });

    return tickets;
  } catch (error) {
    console.error("Error fetching tickets by status:", error);
    throw new Error("Error fetching tickets by status");
  }
};

module.exports = {
  createTicket,
  getAllTicket,
  getTicketByNumber,
  statusBasedTicket,
};
