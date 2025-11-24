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
  banner: {
    upsert: `/${VERSION}/upsert-banner`,
    getBannerBySlug: `/${VERSION}/get-banner-by-slug/:slug`,
    getBannerById: `/${VERSION}/get-banner-by-id/:id`,
    getAllBanners: `/${VERSION}/get-all-banners`,
    deleteBanner: `/${VERSION}/delete-banner/:id`,
  },
  plan: {
    upsertPlan: `/${VERSION}/upsert-plan`,
    getAllPlan: `/${VERSION}/get-all-plan`,
    deletePlanBySlug: `/${VERSION}/delete-plan/:slug`,
    getPlanByBySlug: `/${VERSION}/get-plan-by-slug/:slug`,
    statusUpdate: `/${VERSION}/update-plan-status/:slug`,
  },

  // for user
  user: {
    requestOTP: `/${VERSION}/request-otp`,
    verifyOTP: `/${VERSION}/verify-otp`,
    resendOTP: `/${VERSION}/resend-otp`,
    profileUpdate: `/${VERSION}/update-profile`,
    userDetails: `/${VERSION}/user-details`,
  },
  dashboard: {
    getStats: `/${VERSION}/dashboard-stats`,
    getAllServiceAndSubServices: `/${VERSION}/get-all-services-sub-services`,
    getDefaultAddress: `/${VERSION}/get-default-address`,
    getServicesBySlug: `/${VERSION}/get-services-by-slug/:slug`,
    getSubServicesBySlug: `/${VERSION}/get-sub-services-by-slug/:slug`,
  },
  "user-plan": {
    getAllPlan: `/${VERSION}/get-all-plan`,
    getPlanByBySlug: `/${VERSION}/get-plan-by-slug/:slug`,
  },
};

module.exports = {
  VERSION,
  endPoints,
};
