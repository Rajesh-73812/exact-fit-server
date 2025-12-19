const planService = require("../../services/plan");
const {
  handleErrorResponse,
  handleSuccessResponse,
  handleWarningResponse,
} = require("../../helper/response");

const upsertPlan = async (req, res) => {
  try {
    // Safe access to req.user
    const created_by = req.user?.id || null;

    const payload = req.body; // { name, slug, old_slug?, category, base_price, plan_services: [...] }

    const result = await planService.upsertPlan(payload, { created_by });

    const message = payload.old_slug
      ? "Plan updated successfully"
      : "Plan created successfully";

    return res.status(201).json({
      success: true,
      message,
      data: result,
    });
  } catch (err) {
    console.error("Plan upsert error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save plan",
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
