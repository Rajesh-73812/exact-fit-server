const Settings = require("../models/address");

const upsertSettings = async (settingsData) => {
  try {
    let result;
    if (settingsData.id) {
      result = await Settings.update(settingsData, {
        where: { id: settingsData.id },
        returning: true,
      });
      result = result[1][0];
    } else {
      result = await Settings.create(settingsData);
    }
    return result;
  } catch (error) {
    console.error("Error in upsertSettings:", error);
    throw new Error("Failed to upsert settings");
  }
};

const getSettings = async () => {
  try {
    const settings = await Settings.findOne();
    return settings;
  } catch (error) {
    console.error("Error in getSettings:", error);
    throw new Error("Failed to fetch settings");
  }
};

module.exports = {
  upsertSettings,
  getSettings,
};
