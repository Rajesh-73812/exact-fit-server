const { Op } = require("sequelize");
const SubService = require("../models/sub-service");

/* ---------- 1. Check ONLY slug (not title) to prevent duplicate slug ---------- */
const serviceExists = async (sub_service_slug, currentSlug = null) => {
  // We only care about slug being unique — title can be same
  if (!sub_service_slug) return false;

  const where = { sub_service_slug };

  // If editing and slug changed → exclude the current record
  if (currentSlug) {
    const existingRecord = await SubService.findOne({
      where: { sub_service_slug: currentSlug },
      attributes: ["id"],
    });
    if (existingRecord) {
      where.id = { [Op.ne]: existingRecord.id };
    }
  }

  const count = await SubService.count({ where });
  return count > 0;
};

/* ---------- 2. Upsert (create or update by old slug) ---------- */
const upsertService = async (lookupSlug, serviceData) => {
  const existing = await SubService.findOne({
    where: { sub_service_slug: lookupSlug },
  });

  if (existing) {
    await existing.update(serviceData);
    return { subService: existing, created: false };
  }

  const subService = await SubService.create(serviceData);
  return { subService, created: true };
};

/* ---------- 3. Toggle status ---------- */
const toggleStatus = async (sub_service_slug) => {
  const service = await SubService.findOne({ where: { sub_service_slug } });
  if (!service) return null;

  service.status = service.status === "active" ? "inactive" : "active";
  await service.save();
  return service;
};

/* ---------- 4. Delete by slug ---------- */
const deleteBySlug = async (sub_service_slug) => {
  const service = await SubService.findOne({ where: { sub_service_slug } });
  if (!service) return null;
  await service.destroy();
  return true;
};

/* ---------- 5. Find by slug (public view) ---------- */
const findBySlug = async (sub_service_slug) => {
  return await SubService.findOne({
    where: { sub_service_slug },
    attributes: [
      "service_id",
      "title",
      "sub_service_slug",
      "position",
      "description",
      "image_url",
      "image_alt",
      "status",
      "external_link",
      "createdAt",
      "discount",
      "price",
      "hero_banner",
    ],
  });
};

/* ---------- 6. Get all with pagination & counts ---------- */
const getAllService = async ({ search, page = 1, limit = 10 }) => {
  const where = {};
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { sub_service_slug: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await SubService.findAndCountAll({
    where,
    attributes: ["title", "sub_service_slug", "status", "position"],
    order: [
      ["position", "ASC"],
      ["updatedAt", "DESC"],
    ],
    limit,
    offset,
  });

  const activeCount = await SubService.count({ where: { status: "active" } });
  const inactiveCount = await SubService.count({
    where: { status: "inactive" },
  });

  const totalPages = Math.ceil(count / limit);

  return {
    rows,
    count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    activeCount,
    inactiveCount,
  };
};

module.exports = {
  serviceExists,
  upsertService,
  toggleStatus,
  deleteBySlug,
  findBySlug,
  getAllService,
};
