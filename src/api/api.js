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
  "property-type": {
    upsertProperty: `/${VERSION}/upsert-property`,
    getAllProperty: `/${VERSION}/get-all-property`,
    getPropertyBySlug: `/${VERSION}/get-property-by-slug/:slug`,
    deleteProperty: `/${VERSION}/delete-property/:idOrSlug`,
    updateStatusProperty: `/${VERSION}/update-property/:slug`,
  },

  // for user
  user: {
    requestOTP: `/${VERSION}/request-otp`,
    verifyOTP: `/${VERSION}/verify-otp`,
    resendOTP: `/${VERSION}/resend-otp`,
    profileUpdate: `/${VERSION}/update-profile`,
    userDetails: `/${VERSION}/user-details`,
    upsertAddress: `/${VERSION}/upsert-address`,
    setDefaultAddress: `/${VERSION}/set-default-address/:addressId`,
    deleteAddress: `/${VERSION}/delete-address/:addressId`,
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
  property: {
    getAllProperty: `/${VERSION}/get-all-property/:planId`,
  },
  "user-subscription": {
    createSubscription: `/${VERSION}/create-subscription-plan`,
    createCustomSubscription: `/${VERSION}/create-custom-subscription-plan`,
    allSubscription: `/${VERSION}/get-subscription`,
  },
  booking: {
    upsertEnquiry: `/${VERSION}/upsert-enquiry`,
    getAllEnquiry: `/${VERSION}/get-all-enquiry`,
    getAllEmergency: `/${VERSION}/get-all-emergency`,
  },
};

module.exports = {
  VERSION,
  endPoints,
};
