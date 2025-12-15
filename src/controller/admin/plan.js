const planService = require("../../services/plan");
const {
  handleErrorResponse,
  handleSuccessResponse,
  handleWarningResponse,
} = require("../../helper/response");

const upsertPlan = async (req, res) => {
  const { id: created_by } = req.user || {};
  const {
    name,
    slug, // ← New slug
    old_slug, // ← Only sent when editing
    category,
    description,
    base_price,
    duration_in_days,
    stars,
    scheduled_visits_count,
    is_active = true, // ← Default value
  } = req.body;

  console.log("UPSERT PAYLOAD:", { name, slug, old_slug, category, is_active });

  try {
    // EDIT MODE: old_slug exists
    if (old_slug) {
      const existingPlan = await planService.planService.findBySlug(old_slug);

      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found for update",
        });
      }

      // Check if new slug is taken by another plan
      const slugTaken = await planService.planService.isSlugTaken(
        slug,
        old_slug
      );
      if (slugTaken) {
        return res.status(400).json({
          success: false,
          message: `Slug "${slug}" is already used by another plan!`,
        });
      }

      // UPDATE
      await planService.planService.update(existingPlan, {
        name: name.trim(),
        slug,
        category,
        description: description || null,
        base_price,
        duration_in_days,
        stars,
        scheduled_visits_count,
        is_active,
      });

      const updatedPlan = await existingPlan.reload();

      return res.json({
        success: true,
        message: "Plan updated successfully",
        data: updatedPlan,
      });
    }

    // CREATE MODE
    const slugTaken = await planService.planService.isSlugTaken(slug);
    if (slugTaken) {
      return res.status(400).json({
        success: false,
        message: `Plan with slug "${slug}" already exists!`,
      });
    }

    const newPlan = await planService.planService.create({
      name: name.trim(),
      slug,
      category,
      description: description || null,
      base_price,
      duration_in_days,
      stars,
      scheduled_visits_count,
      is_active,
      created_by,
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    });
  } catch (error) {
    console.error("Upsert plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllPlan = async (req, res) => {
  const { filter, search, page = 1, limit = 10 } = req.query;

  try {
    const result = await planService.getAllPlan({
      filter,
      search: search || undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const { rows } = result;

    return res.status(200).json({
      success: true,
      message: "Subscription plans fetched successfully",
      data: rows,
    });

    // return handleSuccessResponse(
    //   res,
    //   "Subscription plans fetched successfully",
    //   200,
    //   rows
    // );
  } catch (error) {
    return handleErrorResponse(res, error, 500);
  }
};

const updatePlanStaus = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return handleWarningResponse(res, slug, 400, "Plan slug is required");
  }

  try {
    // Call the service method to toggle the plan status
    const plan = await planService.toggleStatus(slug);

    if (!plan) {
      return handleWarningResponse(res, plan, 404, "Plan not found");
    }

    // Return a success response with the updated plan
    return handleSuccessResponse(
      res,
      "Plan status updated successfully",
      200,
      plan
    );
  } catch (error) {
    return handleErrorResponse(res, error, 500);
  }
};

const deletePlan = async (req, res) => {
  const { slug } = req.params;
  console.log(slug, "parms");
  if (!slug) {
    return handleWarningResponse(res, slug, 400, "Plan slug is required");
  }

  try {
    const deleted = await planService.deleteBySlug(slug);
    console.log(deleted);
    return handleSuccessResponse(res, "Plan deleted successfully", 200);
  } catch (error) {
    return handleErrorResponse(res, error, 500);
  }
};

const getPlanBySlug = async (req, res) => {
  const { slug } = req.params;
  console.log(slug, "slugg");
  if (!slug) {
    return handleWarningResponse(res, slug, 400, "plan slug is required.");
  }

  try {
    const plan = await planService.getPlanBySlug(slug);
    if (!plan) {
      return handleWarningResponse(res, plan, 404, "plan not found");
    }

    return res.status(200).json({
      success: true,
      message: "plan fetched sucessfully",
      data: plan,
    });
    // return handleSuccessResponse(res, "plan fetched sucessfully", 200, plan);
  } catch (error) {
    return handleErrorResponse(res, error, 500);
  }
};

module.exports = {
  upsertPlan,
  getAllPlan,
  updatePlanStaus,
  getPlanBySlug,
  deletePlan,
};
