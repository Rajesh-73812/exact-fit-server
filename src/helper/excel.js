const ExcelJS = require("exceljs");

const generateReport = async (data, columns, fileName) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");
    worksheet.columns = columns;

    const formattedData = data.map((item) => {
      return columns.reduce((acc, col) => {
        const key = col.key;
        acc[key] = item[key] ? item[key] : "-";
        return acc;
      }, {});
    });

    worksheet.addRows(formattedData);
    const buffer = await workbook.xlsx.writeBuffer();

    return { buffer, fileName };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};

module.exports = {
  generateReport,
};
