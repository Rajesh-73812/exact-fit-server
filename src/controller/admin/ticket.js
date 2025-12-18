const ticketService = require("../../services/ticket");

const getAllTickets = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  try {
    const { tickets, totalCount } = await ticketService.getAllTickets(
      search,
      offset,
      limitNum
    );
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: tickets,
      pagination: {
        page: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changeTicketStatus = async (req, res) => {
  const { status, ticketId } = req.params;
  try {
    await ticketService.updateTicketStatus(ticketId, status);
    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
    });
  }
};

const viewTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await ticketService.viewTicket(id);
    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
    });
  }
};

const assignTech = async (req, res) => {
  const { ticketId } = req.params;
  const { status, technician_id, notes } = req.body;
  console.log(req.body, "llllllllll");
  try {
    const result = await ticketService.assignTech(
      ticketId,
      status,
      technician_id,
      notes
    );

    return res.status(200).json({
      success: true,
      message: "Assigned to technician successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  getAllTickets,
  changeTicketStatus,
  viewTicket,
  assignTech,
};
