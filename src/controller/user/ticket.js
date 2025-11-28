const ticketService = require("../../services/ticket");

const createTicket = async (req, res) => {
  const user_id = req.user.id;
  const { title, description, image_url } = req.body;

  try {
    const ticketData = { user_id, title, description, image_url };
    const result = await ticketService.createTicket(ticketData);

    return res.status(201).json({
      success: true,
      message: "Ticket Raised Successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllTicket = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await ticketService.getAllTicket(user_id);

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTicketByNumber = async (req, res) => {
  const user_id = req.user.id;
  const { ticketNumber } = req.params;
  console.log(ticketNumber, "from param");
  try {
    const result = await ticketService.getTicketByNumber({
      user_id,
      ticketNumber,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket details fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const statusBasedTicket = async (req, res) => {
  const user_id = req.user.id;
  const { status } = req.params;

  try {
    const result = await ticketService.statusBasedTicket({ user_id, status });

    return res.status(200).json({
      success: true,
      message: `Tickets with status '${status}' fetched successfully`,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createTicket,
  getAllTicket,
  getTicketByNumber,
  statusBasedTicket,
};
