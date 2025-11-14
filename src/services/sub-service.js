const { Op } = require("sequelize");
const SubService = require("../models/sub-service");

/* ---------- 1. Check if title OR slug already exists ---------- */
const serviceExists = async (title, sub_service_slug) => {
  const where = { [Op.or]: [] };
  if (title) where[Op.or].push({ title });
  if (sub_service_slug) where[Op.or].push({ sub_service_slug });

  if (where[Op.or].length === 0) return false;
  const count = await SubService.count({ where });
  return count > 0;
};

/* ---------- 2. Upsert (create or update) ---------- */
const upsertService = async (sub_service_slug, serviceData) => {
  const existing = await SubService.findOne({
    where: { sub_service_slug },
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
