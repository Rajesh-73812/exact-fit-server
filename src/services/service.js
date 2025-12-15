const { Op } = require("sequelize");
const Service = require("../models/service");
const sequelize = require("../config/db");
// const subService = require("../models/sub-service");

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

const getAllService = async ({
  filter,
  search,
  position,
  page = 1,
  limit = 10,
}) => {
  const where = {};

  if (filter && filter !== "all") {
    // here it checks if filter is subscription/ enquiry it entered if block otherwise no
    where.type = filter;
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { service_slug: { [Op.like]: `%${search}%` } },
    ];
  }

  if (position) {
    where.position = position;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Service.findAndCountAll({
    where,
    attributes: [
      "id",
      "title",
      "service_slug",
      "status",
      "position",
      "image_url",
      "image_alt",
      "type",

      [
        sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM sub_service AS sub
                        WHERE
                            sub.service_id = service.id
                            AND sub.deletedAt IS NULL
                    )`),
        "subserviceCount",
      ],
    ],
    order: [
      ["position", "ASC"],
      ["updatedAt", "DESC"],
    ],
    limit,
    offset,
  });

  const activeCount = await Service.count({
    where: { ...where, status: "active" },
  });

  const inactiveCount = await Service.count({
    where: { ...where, status: "inactive" },
  });

  const totalSubserviceCount = await sequelize.query(
    `
    SELECT COUNT(*) AS totalCount
    FROM sub_service
    WHERE deletedAt IS NULL
  `,
    {
      type: sequelize.QueryTypes.SELECT,
    }
  );

  return {
    rows,
    count,
    activeCount,
    inactiveCount,
    totalSubserviceCount: totalSubserviceCount[0].totalCount,
  };
};

module.exports = {
  ServiceExists,
  upsertService,
  getAllService,
};
