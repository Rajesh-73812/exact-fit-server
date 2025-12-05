const Contactus = require("../models/address");

const createContactus = async (contactUsData) => {
  return Contactus.create(contactUsData);
};

module.exports = {
  createContactus,
};
