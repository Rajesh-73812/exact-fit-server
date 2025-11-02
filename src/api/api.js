const VERSION = "V1";

const endPoints = {
  admin: {
    register: `/${VERSION}/register`,
    login: `/${VERSION}/login`,
    forgotPassword: `/${VERSION}/forgot-password`,
  },
  category: {
    upsert: `/${VERSION}/upsert-category`,
    getAll: `/${VERSION}/get-all-category`,
    getCategoryBySlug: `/${VERSION}/get-category-by-slug/:category_slug`,
    deleteCategoryBySlug: `/${VERSION}/delete-category-by-slug/:category_slug`,
    statusUpdate: `/${VERSION}/update-status/:category_slug`,
  },
};

module.exports = {
  VERSION,
  endPoints,
};
