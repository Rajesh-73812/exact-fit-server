const reportService = require("../../services/report");

const getAllCustomerReports = async (req, res) => {
  const { search = "", page = 1, limit = 10, from, to } = req.query;
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  try {
    const result = await reportService.getAllCustomerReports({
      search,
      page: pageNumber,
      limit: limitNumber,
      from,
      to,
    });
    return res.status(200).json({
      success: true,
      message: "Data fetched sucessfully",
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

const getAllTechnicianReports = async (req, res) => {
  const { search = "", filter, page = 1, limit = 10, from, to } = req.query;
  console.log("111111111111111");
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  console.log(req.query, "from queryyyyyyyy");
  try {
    const result = await reportService.getAllTechnicianReports({
      search,
      filter,
      page: pageNumber,
      limit: limitNumber,
      from,
      to,
    });
    return res.status(200).json({
      success: true,
      message: "Data fetched sucessfully",
      data: {
        rows: result.rows,
        totalItems: result.count,
        totalPages: result.totalPages,
        currentPage: result.page,
        limit: result.limit,
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

const downloadAllCustomersReport = async (req, res) => {
  try {
    const { rows: customersData } = await reportService.getAllCustomerReports({
      search: "",
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
    });

    const columns = [
      { header: "Full Name", key: "fullname", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Created On", key: "createdAt", width: 15 },
    ];

    const fileName = "customers_report.xlsx";

    const { buffer } = await require("../../helper/excel").generateReport(
      customersData,
      columns,
      fileName
    );

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
    res.end();
  } catch (error) {
    console.error("Error downloading customers report:", error);
    res.status(500).json({ message: "Error downloading report" });
  }
};

const getSingleCustomersReportDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "User ID is required for single customer report" });
    }

    const customer = await reportService.getCustomerById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const columns = [
      { header: "Full Name", key: "fullname", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Created On", key: "createdAt", width: 15 },
    ];

    const fileName = `customer_${id}_report.xlsx`;
    const { buffer } = await require("../../helper/excel").generateReport(
      [customer],
      columns,
      fileName
    );

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
    res.end();
  } catch (error) {
    console.error("Error downloading single customer report:", error);
    res.status(500).json({ message: "Error downloading report" });
  }
};

const getAllTechniciansReportDownload = async (req, res) => {
  try {
    const { rows: customersData } = await reportService.getAllTechnicianReports(
      {
        search: "",
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
      }
    );

    const columns = [
      { header: "Full Name", key: "fullname", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Created On", key: "createdAt", width: 15 },
    ];

    const fileName = "technicians_report.xlsx";

    const { buffer } = await require("../../helper/excel").generateReport(
      customersData,
      columns,
      fileName
    );

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
    res.end();
  } catch (error) {
    console.error("Error downloading customers report:", error);
    res.status(500).json({ message: "Error downloading report" });
  }
};

const getSingleTechnicianReportDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "User ID is required for single customer report" });
    }

    const technician = await reportService.getTechnicianById(id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found" });
    }

    const address = technician.addresses && technician.addresses[0];
    const technicianData = {
      fullname: technician.fullname || "N/A",
      email: technician.email || "N/A",
      mobile: technician.mobile || "N/A",
      createdAt: technician.createdAt
        ? new Date(technician.createdAt).toLocaleString()
        : "N/A",
      address: address ? `${address.location}` : "No address available",
    };
    const columns = [
      { header: "Full Name", key: "fullname", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 20 },
      { header: "Address", key: "address", width: 30 },
      { header: "Created On", key: "createdAt", width: 15 },
    ];

    const fileName = `technician_${id}_report.xlsx`;
    const { buffer } = await require("../../helper/excel").generateReport(
      [technicianData],
      columns,
      fileName
    );

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
    res.end();
  } catch (error) {
    console.error("Error downloading single customer report:", error);
    res.status(500).json({ message: "Error downloading report" });
  }
};

module.exports = {
  getAllCustomerReports,
  getAllTechnicianReports,
  downloadAllCustomersReport,
  getSingleCustomersReportDownload,
  getAllTechniciansReportDownload,
  getSingleTechnicianReportDownload,
};
