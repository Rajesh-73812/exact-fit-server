const { endPoints } = require("../api");
const router = require("express").Router();
const middleware = require("../../middlewares/authMiddleware");
const ticketController = require("../../controller/user/ticket");

router.post(
  endPoints.ticket.createTicket,
  middleware.authMiddleware,
  ticketController.createTicket
);
router.get(
  endPoints.ticket.getAllTicket,
  middleware.authMiddleware,
  ticketController.getAllTicket
);
router.get(
  endPoints.ticket.getTicketByNumber,
  middleware.authMiddleware,
  ticketController.getTicketByNumber
);
router.get(
  endPoints.ticket.statusBasedTicket,
  middleware.authMiddleware,
  ticketController.statusBasedTicket
);

module.exports = router;
