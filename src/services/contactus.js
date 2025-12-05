const Contactus = require("../models/contact_us");

const createContactus = async (contactUsData) => {
  return Contactus.create(contactUsData);
};

module.exports = {
  createContactus,
};
