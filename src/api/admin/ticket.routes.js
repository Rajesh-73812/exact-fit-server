const router = require("express").Router();
const ticketController = require("../../controller/admin/ticket");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.get(
  endPoints["support-ticket"].getAllTickets,
  middleware.authMiddleware,
  ticketController.getAllTickets
);
router.patch(
  endPoints["support-ticket"].changeTicketStatus,
  middleware.authMiddleware,
  ticketController.changeTicketStatus
);
router.get(
  endPoints["support-ticket"].viewTicket,
  middleware.authMiddleware,
  ticketController.viewTicket
);

module.exports = router;
