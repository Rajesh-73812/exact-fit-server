const contactUsService = require("../../services/contactus");

const getAllContacts = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const contactUs = await contactUsService.getAllContactUs({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: contactUs.data,
      pagination: contactUs.pagination,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const viewContacts = async (req, res) => {
  const { id } = req.params;
  try {
    const contactus = await contactUsService.getContactUsById(id);
    return res.status(200).json({
      success: true,
      message: "data fetched sucessfully",
      data: contactus,
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
  getAllContacts,
  viewContacts,
};
