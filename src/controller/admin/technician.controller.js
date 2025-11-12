const sequelize = require("../../config/db");
const technicianService = require("../../services/technician.service");
const addressService = require("../../services/address.service");
const { uploadToS3, deleteFromS3 } = require("../../utils/fileUpload.aws");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

/**
 * @desc Create or Update (Upsert) Technician by Admin
 * @route POST /api/admin/technicians/upsert-technician
 */
const upsertTechnician = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      id,
      fullname,
      email,
      mobile,
      emirate,
      area,
      appartment,
      addtional_address,
      category,
      save_as_address_type,
      location,
      latitude,
      longitude,
      id_proof_type,
      service_category,
      services_known,
      service_type,
      description,
    } = req.body;

    if (!fullname || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Fullname, email, and mobile are required.",
        code: "TECHNICIAN_REQUIRED_FIELDS_MISSING",
      });
    }

    let profile_pic = null;
    let id_proofs = null;

    if (req.files?.profile_pic) {
      profile_pic = await uploadToS3(req.files.profile_pic[0], "technicians/profile_pics");
    }
    if (req.files?.id_proof) {
      id_proofs = await uploadToS3(req.files.id_proof[0], "technicians/id_proofs");
    }

    // UPDATE
    if (id) {
      const existing = await technicianService.getTechnicianById(id, { transaction });
      if (!existing) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Technician not found." });
      }

      if (profile_pic && existing.profile_pic) await deleteFromS3(existing.profile_pic);
      if (id_proofs && existing.id_proofs) await deleteFromS3(existing.id_proofs);

      await technicianService.updateTechnician(
        id,
        {
          fullname,
          email,
          mobile,
          id_proofs,
          id_proof_type,
          service_category,
          services_known,
          service_type,
          description,
          ...(profile_pic && { profile_pic }),
        },
        { transaction }
      );

      const addrPayload = { emirate, area, appartment, addtional_address, category, save_as_address_type, location, latitude, longitude };
      const existingAddr = await addressService.getAddressByUserId(id, { transaction });

      if (existingAddr) {
        await addressService.updateAddress(existingAddr.id, addrPayload, { transaction });
      } else {
        await addressService.createAddress({ id: uuidv4(), user_id: id, ...addrPayload }, { transaction });
      }

      await transaction.commit();
      return res.status(200).json({ success: true, message: "Technician updated successfully." });
    }

    // CREATE
    const emailExists = await technicianService.getTechnicianByEmail(email, { transaction });
    if (emailExists) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    const mobileExists = await technicianService.getTechnicianByMobile(mobile, { transaction });
    if (mobileExists) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: "Mobile already exists." });
    }

    const tech = await technicianService.createTechnician(
      {
        fullname,
        email,
        mobile,
        id_proofs,
        id_proof_type,
        service_category,
        services_known,
        service_type,
        description,
        role: "technician",
        status: "pending",
        is_active: false,
        profile_pic,
      },
      { transaction }
    );

    await addressService.createAddress(
      {
        id: uuidv4(),
        user_id: tech.id,
        emirate,
        area,
        appartment,
        addtional_address,
        category,
        save_as_address_type,
        location,
        latitude,
        longitude,
      },
      { transaction }
    );

    await transaction.commit();
    return res.status(201).json({ success: true, message: "Technician created.", data: tech });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};


const getAllTechnicians = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "created_desc", emirate, area } = req.query;
    const offset = (page - 1) * limit;
    const filters = { role: "technician" };

    // ✅ Filter by emirate / area if provided
    if (emirate) filters["$addresses.emirate$"] = { [Op.like]: `%${emirate}%` };
    if (area) filters["$addresses.area$"] = { [Op.like]: `%${area}%` };

    // ✅ Normalize search term
    const normalizeSearch = (str) =>
      str
        .toLowerCase()
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .trim();

    const normalizedSearch = normalizeSearch(search);

    // ✅ Construct case-insensitive search query
    if (normalizedSearch) {
      filters[Op.or] = [
        sequelize.where(sequelize.fn("LOWER", sequelize.col("fullname")), { [Op.like]: `%${normalizedSearch}%` }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("email")), { [Op.like]: `%${normalizedSearch}%` }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("mobile")), { [Op.like]: `%${normalizedSearch}%` }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("service_category")), { [Op.like]: `%${normalizedSearch}%` }),
        sequelize.where(sequelize.fn("LOWER", sequelize.col("services_known")), { [Op.like]: `%${normalizedSearch}%` }),
      ];
    }

    // ✅ Handle sorting
    let order = [["createdAt", "DESC"]];
    switch (sort) {
      case "name_asc":
      case "a-z":
        order = [["fullname", "ASC"]];
        break;
      case "name_desc":
      case "z-a":
        order = [["fullname", "DESC"]];
        break;
      case "created_asc":
        order = [["createdAt", "ASC"]];
        break;
      case "created_desc":
        order = [["createdAt", "DESC"]];
        break;
      default:
        order = [["createdAt", "DESC"]];
    }

    // ✅ Fetch all technicians with addresses
    const { rows, count } = await technicianService.getAllTechnicians({
      options: {
        where: filters,
        limit: parseInt(limit),
        offset,
        order,
      },
    });

    // ✅ Map technician data
    const technicians = rows.map((tech) => {
      const t = tech.toJSON();
      return {
        id: t.id,
        fullname: t.fullname,
        email: t.email,
        mobile: t.mobile,
        profile_pic: t.profile_pic,
        service_category: t.service_category,
        services_known: t.services_known,
        service_type: t.service_type,
        description: t.description,
        id_proof_type: t.id_proof_type,
        id_proofs: t.id_proofs,
        status: t.status,
        is_active: t.is_active,
        addresses: t.addresses || [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Technicians retrieved successfully.",
      code: "TECHNICIANS_FETCH_SUCCESS",
      data: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        data: technicians,
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

/**
 * @desc Get a single technician by ID (Admin)
 * @route GET /api/admin/technicians/:id
 * @access Admin
 */
  const getTechnicianByIdController = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Technician ID is required.",
          code: "TECHNICIAN_ID_MISSING",
        });
      }

      // Fetch technician with address
      const technician = await technicianService.getTechnicianByIdWithAddress(id);

      if (!technician) {
        return res.status(404).json({
          success: false,
          message: "Technician not found.",
          code: "TECHNICIAN_NOT_FOUND",
        });
      }

      // Convert to plain object
      const tech = technician.toJSON();

      // Map response (same format as getAllTechnicians)
      const response = {
        id: tech.id,
        fullname: tech.fullname,
        email: tech.email,
        mobile: tech.mobile,
        profile_pic: tech.profile_pic || null,
        service_category: tech.service_category || null,
        services_known: tech.services_known || null,
        service_type: tech.service_type || 'general',
        description: tech.description || null,
        id_proof_type: tech.id_proof_type || null,
        id_proofs: tech.id_proofs || null,
        status: tech.status || 'pending',
        is_active: tech.is_active || false,
        addresses: tech.addresses || [],
        createdAt: tech.createdAt,
        updatedAt: tech.updatedAt,
      };

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: "Technician retrieved successfully.",
        code: "TECHNICIAN_FETCH_SUCCESS",
        data: response,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error in getTechnicianByIdController:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
        code: "TECHNICIAN_INTERNAL_SERVER_ERROR",
        error: error.message,
      });
    }
  };


/**
 * @desc Toggle technician active/inactive status
 * @route PUT /api/admin/technicians/:id/toggle-status
 */
const updateTechnicianToggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // find technician by ID
    const technician = await technicianService.getTechnicianById(id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
        code: "TECHNICIAN_NOT_FOUND",
      });
    }

    // toggle active state
    const newStatus = !technician.is_active;

    const updated = await technicianService.updateTechnician(id, {
      is_active: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: `Technician has been ${newStatus ? "activated" : "deactivated"} successfully.`,
      code: "TECHNICIAN_STATUS_UPDATED",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating technician status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update technician status.",
      code: "TECHNICIAN_STATUS_ERROR",
      error: error.message,
    });
  }
};

/**
 * @desc Delete technician (and S3 image if exists)
 * @route DELETE /api/admin/technicians/:id
 */
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

    // Delete profile pic from S3 if exists
    if (technician.profile_pic) {
      try {
        await deleteFromS3(technician.profile_pic);
      } catch (err) {
        console.warn("S3 deletion failed:", err.message);
      }
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
  deleteTechnician
};
