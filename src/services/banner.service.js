const { Op } = require("sequelize");
const Banner = require("../models/banner");

const bannerExists = async (slug, excludeId = null) => {
  if (!slug) return false;

  const where = { slug };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const count = await Banner.count({ where });
  return count > 0;
};

// Upsert: Update if ID exists, Create if not
const upsertBanner = async (bannerData) => {
  const { id, slug, old_slug, ...data } = bannerData;

  // Case 1: Edit by ID (preferred & safe)
  if (id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error("Banner not found");
    }
    await banner.update(data);
    return { banner, created: false };
  }

  // Case 2: Create new (no ID)
  const banner = await Banner.create({ ...data, slug });
  return { banner, created: true };
};

const getAllBanners = async ({ search = "", page = 1, limit = 10 }) => {
  const where = {};

  if (search) {
    where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Banner.findAndCountAll({
    where,
    attributes: ["id", "name", "slug", "is_active", "image_url", "priority"],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const activeCount = await Banner.count({
    where: { ...where, is_active: true },
  });

  const inactiveCount = await Banner.count({
    where: { ...where, is_active: false },
  });

  return {
    rows,
    count,
    activeCount,
    inactiveCount,
  };
};

const getBannerById = async (id) => {
  const banner = await Banner.findByPk(id);
  return banner;
};

const getBannerBySlug = async (id) => {
  return await Banner.findByPk(id);
};

const deleteBanner = async (id) => {
  const deleted = await Banner.destroy({
    where: { id },
  });
  return deleted;
};

const toggleStatus = async (id) => {
  const banner = await Banner.findByPk(id);
  if (!banner) return null;

  banner.is_active = !banner.is_active;
  await banner.save();
  return banner;
};

// for user
const getAllUserBanners = async ({ page, limit, banner_type }) => {
  const where = { is_active: true };

  if (banner_type) {
    where.banner_type = banner_type;
  }
  const banner = await Banner.findAll({
    where,
  });
  return banner;
};

module.exports = {
  bannerExists,
  upsertBanner,
  getAllBanners,
  getBannerById,
  getBannerBySlug,
  deleteBanner,
  toggleStatus,
  getAllUserBanners,
};
