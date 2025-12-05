const sequelize = require("../../config/db");
const technicianService = require("../../services/technician.service");

const upsertTechnician = async (req, res) => {
  const {
    id,
    type,
    service_id,
    fullname,
    email,
    mobile,
    emirate,
    area, // Receiving 'area' here
    emirates_id,
    skills,
    description,
    id_proofs,
    profile_pic,
    certificate,
  } = req.body;

  // Assign 'area' to 'location' here
  const location = area; // Assign area to location

  if (!fullname?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Full name is required" });
  }
  if (!email?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  if (!mobile?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile is required" });
  }
  if (!service_id) {
    return res
      .status(400)
      .json({ success: false, message: "Service selection is required" });
  }
  if (!Array.isArray(skills) || skills.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "At least one skill is required" });
  }

  try {
    const existingFields = await technicianService.checkIfFieldExists({
      email,
      mobile,
      emirates_id,
      id, // pass id to exclude current user from checks
    });

    if (existingFields) {
      return res.status(400).json({
        success: false,
        message: existingFields, // Send back the error message for the existing field
      });
    }

    // Now, use 'location' in the technicianData
    const technicianData = {
      id,
      type,
      fullname,
      email,
      mobile,
      emirate,
      service_category: service_id,
      skill: skills,
      location, // Use location here (which is actually 'area')
      id_proofs,
      description,
      profile_pic,
      emirates_id,
      certificate,
      address:
        emirate || location // Make sure address includes emirate and location
          ? {
              emirate,
              location, // Pass location as part of the address
            }
          : undefined,
    };

    const result = await technicianService.upsertTechnician(technicianData);
    return res.status(200).json({
      success: true,
      message: id
        ? "Technician updated successfully"
        : "Technician created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Upsert technician error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getAllTechnicians = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // ✅ Fetch all technicians with addresses
    const { rows, count, activeCount, inactiveCount } =
      await technicianService.getAllTechnicians({
        pageNum,
        limitNum,
        search,
      });

    return res.status(200).json({
      success: true,
      message: "Technicians retrieved successfully.",
      data: {
        rows,
        count,
        page: pageNum,
        limit: limitNum,
        activeCount,
        inactiveCount,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching technicians:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
      code: "TECHNICIANS_FETCH_ERROR",
    });
  }
};

const getTechnicianByIdController = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Technician ID is required.",
      });
    }

    const technician = await technicianService.getTechnicianByIdWithAddress(id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
      });
    }

    const tech = technician.toJSON();

    // Parse the skill field if it is a string
    if (tech.skill && typeof tech.skill === "string") {
      try {
        tech.skill = JSON.parse(tech.skill);
      } catch (error) {
        console.error("Error parsing skill:", error);
      }
    }

    // Clean the response
    const response = {
      id: tech.id,
      fullname: tech.fullname,
      email: tech.email,
      mobile: tech.mobile,
      profile_pic: tech.profile_pic || null,
      service_category: tech.service_category || null,
      service_type: tech.service_type || null,
      services_known: tech.services_known
        ? JSON.parse(tech.services_known)
        : [], // Parse services_known if it is a string
      description: tech.description || null,
      emirates_id: tech.emirates_id || null,
      skill: tech.skill || [], // Ensure it's an array
      id_proofs: tech.id_proofs || null,
      is_active: tech.is_active || false,
      addresses: tech.addresses || [], // Ensure addresses are returned
      createdAt: tech.createdAt,
      updatedAt: tech.updatedAt,
    };

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Technician retrieved successfully.",
      data: response,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error in getTechnicianByIdController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const updateTechnicianToggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const technician = await technicianService.getTechnicianById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
      });
    }
    const updated = await technicianService.updateTechnician(id);

    return res.status(200).json({
      success: true,
      message: "Technician Status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating technician status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update technician status.",
      error: error.message,
    });
  }
};

const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await technicianService.getTechnicianById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
        code: "TECHNICIAN_NOT_FOUND",
      });
    }

    // Delete technician record
    await technicianService.deleteTechnician(id);

    return res.status(200).json({
      success: true,
      message: "Technician deleted successfully.",
      code: "TECHNICIAN_DELETED",
    });
  } catch (error) {
    console.error("Error deleting technician:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete technician.",
      code: "TECHNICIAN_DELETE_ERROR",
      error: error.message,
    });
  }
};

module.exports = {
  upsertTechnician,
  getAllTechnicians,
  getTechnicianByIdController,
  updateTechnicianToggleStatus,
  deleteTechnician,
};
