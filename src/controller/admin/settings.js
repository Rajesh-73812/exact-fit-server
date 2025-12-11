const settingsService = require("../../services/settings");

const upsertSettings = async (req, res) => {
  const {
    id,
    support_mobile_number,
    support_email,
    contact_us_email,
    contact_us_number,
    website_address,
    address,
  } = req.body;
  try {
    const settingsData = {
      id,
      support_mobile_number,
      support_email,
      contact_us_email,
      contact_us_number,
      website_address,
      address,
    };

    const result = await settingsService.upsertSettings(settingsData);
    return res.status(200).json({
      success: true,
      message: "Settings upserted successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSettings = async (req, res) => {
  try {
    const result = await settingsService.getSettings();
    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  upsertSettings,
  getSettings,
};
