const isValidUAENumber = (mobile) => {
  const uaeRegex = /^\+9715[024568]\d{7}$/; // Supports 50,52,54,55,56,58
  // Alternative loose check: /^\+971\d{9}$/
  return uaeRegex.test(mobile);
};

module.exports = {
  isValidUAENumber,
};
