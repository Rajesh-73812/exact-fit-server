const VERSION = "V1";

const endPoints = {
  admin: {
    register: `/${VERSION}/register`,
    login: `/${VERSION}/login`,
    forgotPassword: `/${VERSION}/forgot-password`,
  },
  service: {
    upsert: `/${VERSION}/upsert-service`,
    getAll: `/${VERSION}/get-all-service`,
    getServiceBySlug: `/${VERSION}/get-service-by-slug/:service_slug`,
    deleteServiceBySlug: `/${VERSION}/delete-service-by-slug/:service_slug`,
    statusUpdate: `/${VERSION}/update-status/:service_slug`,
  },
  "sub-service": {
    upsert: `/${VERSION}/upsert-sub-service`,
    getAll: `/${VERSION}/get-all-sub-service`,
    getSubServiceBySlug: `/${VERSION}/get-sub-service-by-slug/:sub_service_slug`,
    deleteSubServiceBySlug: `/${VERSION}/delete-sub-service-by-slug/:sub_service_slug`,
    statusUpdate: `/${VERSION}/update-sub-service-status/:sub_service_slug`,
  },
};

module.exports = {
  VERSION,
  endPoints,
};
