const propertyTypeService = require("../../services/property");
const {
  handleWarningResponse,
  handleSuccessResponse,
  handleErrorResponse,
} = require("../../helper/response");

const upsertProperty = async (req, res) => {
  const { name, slug, category, description, subscriptions } = req.body;
  const { id: created_by } = req.user || {};
  console.log(req.body, "from req bodyyyyyyy");
  console.log(created_by, "from created");
  try {
    // Data for the property
    const propertyData = {
      name,
      slug,
      category,
      description,
      created_by,
    };

    console.log(propertyData, "property data");

    // Call service to handle property and subscriptions (single or multiple)
    const { propertyType, created } =
      await propertyTypeService.upsertPropertyWithSubscription(
        slug,
        propertyData,
        subscriptions
      );
    console.log(propertyType, "typeeeeeeeeeeeeeeee");
    console.log(created, "booleann");
    // Send appropriate response based on whether the property was created or updated
    if (created) {
      return handleSuccessResponse(
        res,
        `Property Type "${propertyType.name}" created successfully.`,
        201,
        propertyType
      );
    } else {
      return handleSuccessResponse(
        res,
        `Property Type "${propertyType.name}" updated successfully.`,
        200,
        propertyType
      );
    }
  } catch (error) {
    console.error("Error in upsertProperty controller:", error);
    return handleErrorResponse(res, error, 500);
  }
};

const getPropertyBySlugOrId = async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure that only one of id or slug is provided
    if (!id) {
      return handleWarningResponse(res, null, 400, "You must provide 'id'");
    }

    // Call the service to get the property by either id or slug
    const propertyType = await propertyTypeService.getPropertyBySlugOrId(id);

    if (!propertyType) {
      return handleWarningResponse(res, null, 404, "Property Type not found.");
    }

    return handleSuccessResponse(
      res,
      "Property Type fetched successfully.",
      200,
      propertyType
    );
  } catch (error) {
    console.error("Error in getPropertyBySlugOrId controller:", error);
    return handleErrorResponse(res, error, 500);
  }
};

// Get All Property Types
const getAllProperty = async (req, res) => {
  try {
    const properties = await propertyTypeService.getAllProperties();
    return res.status(200).json({
      success: true,
      message: "Property Fetched sucessfully",
      data: properties,
    });
  } catch (error) {
    console.error("Error in getAllProperty controller:", error);
    return handleErrorResponse(res, error, 500);
  }
};

// Update the status of a Property Type (active/inactive)
const updateStatusProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProperty = await propertyTypeService.updateStatus(id);
    if (!updatedProperty) {
      return handleWarningResponse(res, null, 404, "Property Type not found.");
    }
    return handleSuccessResponse(
      res,
      "Property Type status updated successfully.",
      200,
      updatedProperty
    );
  } catch (error) {
    console.error("Error in updateStatusProperty controller:", error);
    return handleErrorResponse(res, error, 500);
  }
};

// Delete Property Type
const deleteProperty = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await propertyTypeService.deleteProperty(slug);
    if (!result) {
      return handleWarningResponse(res, null, 404, "Property Type not found.");
    }
    return handleSuccessResponse(
      res,
      "Property Type deleted successfully.",
      200,
      result
    );
  } catch (error) {
    console.error("Error in deleteProperty controller:", error);
    return handleErrorResponse(res, error, 500);
  }
};

module.exports = {
  upsertProperty,
  getPropertyBySlugOrId,
  getAllProperty,
  updateStatusProperty,
  deleteProperty,
};
