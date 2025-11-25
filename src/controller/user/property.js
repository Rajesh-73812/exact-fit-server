const propertyService = require("../../services/property");

const getAllProperty = async (req, res) => {
  const { planId } = req.params;
  try {
    const property = await propertyService.getAllPropertyByPlan(planId);
    if (!property || property.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No properties found for this plan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      data: property,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "failed to get get all properties",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProperty,
};
