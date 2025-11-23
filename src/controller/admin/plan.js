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
    description,
    slug,
    old_plan_slug,
    base_price,
    duration_in_days,
    stars,
    scheduled_visits_count,
  } = req.body;
  console.log(req.body, "from service");
  try {
    const slugToSearch = old_plan_slug || slug;
    const existSlug = await planService.planExists(slug, slugToSearch);

    if (existSlug) {
      return res
        .status(400)
        .json({ success: false, message: `${name} already exists!` });
    }

    const planData = {
      name,
      description,
      base_price,
      duration_in_days,
      stars,
      scheduled_visits_count,
      created_by: created_by,
      slug: slug,
    };

    const { plan, created } = await planService.upsertPlan(
      slugToSearch,
      planData
    );
    const message = created
      ? `Subscription plan "${plan.name}" created successfully`
      : `Subscription plan "${plan.name}" updated successfully`;
    return handleSuccessResponse(res, message, created ? 201 : 200, plan);
  } catch (error) {
    return handleErrorResponse(res, error, 500);
  }
};

const getAllPlan = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  try {
    const result = await planService.getAllPlan({
      search: search || undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    const { rows } = result;

    return handleSuccessResponse(
      res,
      "Subscription plans fetched successfully",
      200,
      rows
    );
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
    const plan = await planService.planExists(slug, "update-status");
    if (!plan) {
      return handleWarningResponse(res, plan, 404, "plan not found");
    }

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
    const plan = await planService.planExists(slug, "by-slug");
    if (!plan) {
      return handleWarningResponse(res, plan, 404, "plan not found");
    }

    return handleSuccessResponse(res, "plan fetched sucessfully", 200, plan);
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
