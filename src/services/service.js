const { Op } = require("sequelize");
const Service = require("../models/service");

const ServiceExists = async (service_slug, from = null) => {
  console.log(from, "frommmmmmmmm9999");
  if (service_slug && from === null) {
    const count = await Service.count({
      where: { service_slug: service_slug },
    });
    return count > 0;
  }

  if (from === "update-status") {
    const service = await Service.findOne({ where: { service_slug } });

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

const upsertService = async (service_slug, serviceData) => {
  const existingService = await Service.findOne({
    where: { service_slug: service_slug },
    attributes: ["id", "title", "service_slug", "status"],
  });

  if (existingService) {
    await existingService.update(serviceData);

    return {
      service: {
        title: existingService.title,
        service_slug: existingService.service_slug,
        status: existingService.status,
      },
      created: false,
    };
  } else {
    const service = await Service.create(serviceData);

    return {
      service: {
        title: service.title,
        service_slug: service.service_slug,
        status: service.status,
      },
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
    attributes: ["title", "service_slug", "status", "position"],
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
