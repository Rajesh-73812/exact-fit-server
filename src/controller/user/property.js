const propertyService = require("../../services/property");

const getAllProperty = async (req, res) => {
  // const { planId } = req.params;
  try {
    const property = await propertyService();

    return res.status(200).json({
      success: true,
      message: "property getting sucessfully",
      data: property,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "failed to get get all property",
    });
  }
};

module.exports = {
  getAllProperty,
};
