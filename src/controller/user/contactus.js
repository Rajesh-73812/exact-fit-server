const contactUsService = require("../../services/contactus");

const createContactus = async (req, res) => {
  const { fullname, email, country_code, mobile, description } = req.body;
  try {
    const contactUsData = {
      fullname,
      email,
      country_code,
      mobile,
      description,
    };
    const result = await contactUsService.createContactus(contactUsData);
    return res.status(200).json({
      success: true,
      message: "Contact us request created successfully",
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
  createContactus,
};
