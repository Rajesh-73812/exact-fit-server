const Ticket = require("../models/ticket");

const isValidUAENumber = (mobile) => {
  const uaeRegex = /^\+9715[024568]\d{7}$/; // Supports 50,52,54,55,56,58
  // Alternative loose check: /^\+971\d{9}$/
  return uaeRegex.test(mobile);
};

const generateTicketNumber = async () => {
  let ticketNumber = await generateRandomTicketNumber();
  let existingTicket = await Ticket.findOne({
    where: { ticketNumber },
  });

  if (existingTicket) {
    ticketNumber = await generateTicketNumber();
  }
  return ticketNumber;
};

const generateRandomTicketNumber = async () => {
  return Math.floor(100000 + Math.random() * 900000);
};

module.exports = {
  isValidUAENumber,
  generateTicketNumber,
};
