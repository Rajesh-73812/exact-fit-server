const VERSION = "V1";

const endPoints = {
  admin: {
    register: `/${VERSION}/register`,
    login: `/${VERSION}/login`,
    forgotPassword: `/${VERSION}/forgot-password`,
    fetchAdminById: `/${VERSION}/get-admin`,
    updateAdminStatus: `/${VERSION}/update-status/:id`,
    remove: `/${VERSION}/delete-by-id/:id`,
    getAllAdmin: `/${VERSION}/get-all`,
    getAllCustomers: `/${VERSION}/get-all-customers`,
    getCustomerById: `/${VERSION}/get-customers-by-id/:id`,
    updateStatus: `/${VERSION}/change-status/:id`,
    sentNotification: `/${VERSION}/sent-notification`,
    getAllNotifications: `/${VERSION}/get-all-notification`,
    deleteNotification: `/${VERSION}/delete-notification/:id`,
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
    getBannerBySlug: `/${VERSION}/get-banner-by-slug/:id`,
    getBannerById: `/${VERSION}/get-banner-by-id/:id`,
    getAllBanners: `/${VERSION}/get-all-banners`,
    deleteBanner: `/${VERSION}/delete-banner/:id`,
    statusUpdateBnner: `/${VERSION}/toggle-banner-status/:id`,
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
  "a-technician": {
    getAllTechnician: `/${VERSION}/get-all`,
    upsertTechnician: `/${VERSION}/upsert-technician`,
    statusUpdate: `/${VERSION}/toggle-status/:id`,
    getTechnicianById: `/${VERSION}/get-by-id/:id`,
    deleteTechnician: `/${VERSION}/delete-technician/:id`,
  },
  settings: {
    upsertSettings: `/${VERSION}/upsert-settings`,
    getSettings: `/${VERSION}/get-settings`,
  },
  reports: {
    getAllCustomerReports: `/${VERSION}/get-all-customers-report`,
    getAllTechnicianReports: `/${VERSION}/get-all-technicians-report`,
    getAllCustmersReportDownload: `/${VERSION}/get-all-customer-report-download`,
    getSingleCustomersReportDownload: `/${VERSION}/get-single-customer-report-download/:id`,
    getAllTechniciansReportDownload: `/${VERSION}/get-all-technicians-report-download`,
    getSingleTechnicianReportDownload: `/${VERSION}/get-single-technician-report-download/:id`,
  },
  notification: {
    getAllNotifications: `/${VERSION}/get-all-notifications`,
    sendNotification: `/${VERSION}/send-notification`,
    deleteNotification: `/${VERSION}/delete-notification/:id`,
  },
  "contact-us": {
    getAllContacts: `/${VERSION}/get-all`,
    viewContacts: `/${VERSION}/get-by-id/:id`,
  },
  "support-ticket": {
    getAllTickets: `/${VERSION}/get-all`,
    changeTicketStatus: `/${VERSION}/change-status/:status/:ticketId`,
    viewTicket: `/${VERSION}/view-ticket/:id`,
    assignTech: `/${VERSION}/assign-and-update-status/:ticketId`,
  },
  "a-booking": {
    getAllSubscriptionBooking: `/${VERSION}/get-all-subscription-booking`,
    getSubscriptionBookingById: `/${VERSION}/get-subscription-booking-by-id/:id`,
    getAllEmergencyBooking: `/${VERSION}/get-all-emergency-booking`,
    getAllEmergencyBookingById: `/${VERSION}/get-emergency-booking-by-id/:id`,
    getAllEnquiryBooking: `/${VERSION}/get-all-enquiry-booking`,
    getAllEnquiryBookingById: `/${VERSION}/get-enquiry-booking-by-id/:id`,
    assignTechnician: `/${VERSION}/subscription/visit/:visit_id/assign`,
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
    deActivateAccount: `/${VERSION}/account-deactivate`,
    updateOneSignal: `/${VERSION}/update-onesignal-id`,
    removeOneSignal: `/${VERSION}/remove-onesignal-id`,
  },
  dashboard: {
    getStats: `/${VERSION}/dashboard-stats`,
    getAllServiceAndSubServices: `/${VERSION}/get-all-services-sub-services`,
    getDefaultAddress: `/${VERSION}/get-default-address`,
    getServicesBySlug: `/${VERSION}/get-services-by-slug/:slug`,
    getSubServicesBySlug: `/${VERSION}/get-sub-services-by-slug/:slug`,
    getTechnicianAddress: `/${VERSION}/get-technician-address`,
  },
  "user-plan": {
    getAllPlanFetchByUser: `/${VERSION}/get-all-plan`,
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
    upsertEmergency: `/${VERSION}/upsert-emergency`,
    getAllEnquiry: `/${VERSION}/get-all-enquiry`,
    getAllEmergency: `/${VERSION}/get-all-emergency`,
    getEnquiryById: `/${VERSION}/get-service-by-id`,
  },
  ticket: {
    createTicket: `/${VERSION}/rise-ticket`,
    getAllTicket: `/${VERSION}/get-all-ticket`,
    getTicketByNumber: `/${VERSION}/get-ticket/:ticketNumber`,
    statusBasedTicket: `/${VERSION}/ticket/:status`,
  },
  "user-banner": {
    getAll: `/${VERSION}/get-all`,
  },
  contactus: {
    createContactus: `/${VERSION}/create-contactus`,
  },
  "u-notification": {
    getAllNotifications: `/${VERSION}/get-all-notifications`,
    clearAllNotifications: `/${VERSION}/clear-all-notifications`,
  },

  //for technician
  technician: {
    requestOTP: `/${VERSION}/request-otp`,
    verifyOTP: `/${VERSION}/verify-otp`,
    resendOTP: `/${VERSION}/resend-otp`,
    details: `/${VERSION}/get-details`,
    deactivateAccount: `/${VERSION}/deactivate`,
    updateOneSignal: `/${VERSION}/update-onesignal-id`,
    removeOneSignal: `/${VERSION}/remove-onesignal-id`,
  },
  "technician-dashboard": {
    dashboard: `/${VERSION}/dashboard`,
  },
};
// console.log('API Version:', VERSION);
// console.log('Details of Technician route:', endPoints.technician.details);
// console.log('Deactivate Account route:', endPoints.technician.deactivateAccount);

module.exports = {
  VERSION,
  endPoints,
};
