const { generateTicketNumber } = require("../helper/formattedMobile");
const Ticket = require("../models/ticket");

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

    return tickets;
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
