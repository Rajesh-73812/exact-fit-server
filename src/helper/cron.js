const cron = require("node-cron");
const Banner = require("../models/banner");

cron.schedule("* * * * *", async () => {
  const currentTime = new Date().toISOString();

  try {
    const bannersToActivate = await Banner.findAll({
      where: {
        start_date: currentTime,
        is_active: false,
      },
    });

    if (bannersToActivate.length > 0) {
      console.log(`Activating ${bannersToActivate.length} banners.`);
      for (let banner of bannersToActivate) {
        banner.is_active = true;
        await banner.save();
        console.log(`Banner with ID: ${banner.id} activated.`);
      }
    }
  } catch (error) {
    console.error("Error activating banners:", error);
  }
});

cron.schedule("* * * * *", async () => {
  const currentTime = new Date().toISOString();

  try {
    const bannersToDeactivate = await Banner.findAll({
      where: {
        end_date: currentTime,
        is_active: true,
      },
    });

    if (bannersToDeactivate.length > 0) {
      console.log(`Deactivating ${bannersToDeactivate.length} banners.`);
      for (let banner of bannersToDeactivate) {
        banner.is_active = false;
        await banner.save();
        console.log(`Banner with ID: ${banner.id} deactivated.`);
      }
    }
  } catch (error) {
    console.error("Error deactivating banners:", error);
  }
});
