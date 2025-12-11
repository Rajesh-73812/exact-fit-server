const router = require("express").Router();
const reportsController = require("../../controller/admin/report");
const middleware = require("../../middlewares/authMiddleware");
const { endPoints } = require("../api");

router.get(
  endPoints.reports.getAllCustomerReports,
  middleware.authMiddleware,
  reportsController.getAllCustomerReports
);
router.get(
  endPoints.reports.getAllTechnicianReports,
  middleware.authMiddleware,
  reportsController.getAllTechnicianReports
);

router.get(
  endPoints.reports.getAllCustmersReportDownload,
  middleware.authMiddleware,
  reportsController.downloadAllCustomersReport
);
router.get(
  endPoints.reports.getSingleCustomersReportDownload,
  middleware.authMiddleware,
  reportsController.getSingleCustomersReportDownload
);

router.get(
  endPoints.reports.getAllTechniciansReportDownload,
  middleware.authMiddleware,
  reportsController.getAllTechniciansReportDownload
);
router.get(
  endPoints.reports.getSingleTechnicianReportDownload,
  middleware.authMiddleware,
  reportsController.getSingleTechnicianReportDownload
);

module.exports = router;
