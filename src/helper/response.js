const handleErrorResponse = (
  res,
  error,
  statusCode,
  message = "Internal Server Error"
) => {
  console.error(error);
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// const handleSuccessResponse = (res, message, statusCode, data = null) => {
//     return res.status(statusCode).json({
//         success: true,
//         message,
//         data
//     });
// };

const handleWarningResponse = (res, data = null, statusCode, message) => {
  console.log(data);
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const handleSuccessResponse = (res, message, statusCode, data = {}) => {
  const responseData = { success: true, message };

  Object.keys(data).forEach((key) => {
    // Iterate over the data passed dynamically
    let currentData = data[key]; // Check if the current data key has pagination info (rows, count)
    if (currentData && currentData.rows && currentData.count) {
      const { rows, count, page = 1, limit = 10 } = currentData;
      const totalPages = Math.ceil(count / limit);
      responseData[key] = {
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page, 10),
          limit: parseInt(page, 10),
          totalPages,
        },
      };
    } else {
      responseData[key] = currentData;
    }
  });
  return res.status(statusCode).json(responseData);
};

module.exports = {
  handleErrorResponse,
  handleSuccessResponse,
  handleWarningResponse,
};
