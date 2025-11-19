const { Op } = require("sequelize");
const Service = require("../models/service");

const ServiceExists = async (service_slug, from = null, currentSlug = null) => {
  console.log(from, "frommmmmmmmm9999");
  if (from === null) {
    // ← FIX: Exclude current record when editing
    const where = { service_slug };
    if (currentSlug && currentSlug !== service_slug) {
      where.service_slug = { [Op.ne]: currentSlug };
    }
    const count = await Service.count({ where });
    return count > 0;
  }

  if (from === "update-status") {
    console.log(service_slug, "frommmmmmmmm2222");
    const service = await Service.findOne({ where: { service_slug } });
    console.log(service, "serviceeeeeeeeeeeeee");
    if (!service) {
      return null;
    }

    const updatedStatus = service.status === "active" ? "inactive" : "active";
    service.status = updatedStatus;
    await service.save();

    return {
      service_slug: service.service_slug,
      status: service.status,
    };
  }

  if (from === "delete-service") {
    const service = await Service.findOne({ where: { service_slug } });
    if (!service) {
      return null;
    }
    service.destroy();
    return true;
  }

  if (from === "by-slug") {
    console.log(
      service_slug,
      "service_slugservice_slugservice_slugservice_slug"
    );
    const service = await Service.findOne({
      where: { service_slug },
      attributes: [
        "title",
        "service_slug",
        "position",
        "description",
        "image_url",
        "image_alt",
        "status",
        "external_link",
        "createdAt",
      ],
    });
    if (!service) {
      return null;
    }
    return service;
  }
};

const upsertService = async (lookupSlug, serviceData) => {
  // ← FIX: Search using old slug (when editing) or new slug (when creating)
  const existingService = await Service.findOne({
    where: { service_slug: lookupSlug },
  });

  if (existingService) {
    // Update — slug can change now
    await existingService.update(serviceData);
    return {
      service: existingService,
      created: false,
    };
  } else {
    // Create new
    const service = await Service.create(serviceData);
    return {
      service,
      created: true,
    };
  }
};

const getAllService = async ({ search, position, page = 1, limit = 10 }) => {
  const where = {};
  if (search) {
    where.title = { [Op.like]: `%${search}%` };
    // where.service_slug = { [Op.like]: `%${search}%` };
  }

  if (position) {
    where.position = position;
  }

  const offset = (page - 1) * limit;
  const services = await Service.findAll({
    where,
    attributes: ["id", "title", "service_slug", "status", "position"],
    order: [
      ["position", "ASC"],
      ["updatedAt", "DESC"],
    ],
    limit,
    offset,
  });

  const activeCount = await Service.count({ where: { status: "active" } });
  const inactiveCount = await Service.count({ where: { status: "inactive" } });
  services.activeCount = activeCount;
  services.inactiveCount = inactiveCount;

  return services;
};

module.exports = {
  ServiceExists,
  upsertService,
  getAllService,
};
