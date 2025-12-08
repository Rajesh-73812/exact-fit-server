const cron = require("node-cron");
const Banner = require("../models/banner");
const NotificationCampaign = require("../models/banner");
const NotificationRecipient = require("../models/banner");
const { sendInAppNotification } = require("./notification");
const { Op } = require("sequelize");

const getCurrentDateWithoutTime = () => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  return currentDate.toISOString().slice(0, 10);
};

// Banner Activation
// cron.schedule("* * * * *", async () => {
cron.schedule("0 0 * * *", async () => {
  // run every day night 12am
  const currentDate = getCurrentDateWithoutTime();
  console.log(currentDate, "from cron");
  console.log(`Checking for banners to activate on ${currentDate}`);

  try {
    const bannersToActivate = await Banner.findAll({
      where: {
        start_date: currentDate,
        is_active: false,
      },
    });

    console.log(bannersToActivate, "from cronnnnn banner active");
    if (bannersToActivate.length > 0) {
      console.log(`Activating ${bannersToActivate.length} banners.`);
      for (let banner of bannersToActivate) {
        banner.is_active = true;
        await banner.save();
        console.log(`Banner with ID: ${banner.id} activated.`);
      }
    } else {
      console.log("No banners to activate.");
    }
  } catch (error) {
    console.error("Error activating banners:", error);
  }
});

// Banner Deactivation
// cron.schedule("* * * * *", async () => { // run every minute
cron.schedule("0 0 * * *", async () => {
  // run every day night 12am
  const currentDate = getCurrentDateWithoutTime();
  console.log(`Checking for banners to deactivate on ${currentDate}`);

  try {
    const bannersToDeactivate = await Banner.findAll({
      where: {
        end_date: currentDate,
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
    } else {
      console.log("No banners to deactivate.");
    }
  } catch (error) {
    console.error("Error deactivating banners:", error);
  }
});

// cron run every minute to send scedule based notification
cron.schedule("* * * * *", async () => {
  const campaigns = await NotificationCampaign.findAll({
    where: {
      scheduled_at: { [Op.lte]: new Date() },
      status: "scheduled",
    },
    include: [
      {
        model: NotificationRecipient,
        as: "NotificationRecipients",
        where: { sent_at: null },
        required: true,
      },
    ],
  });

  for (const campaign of campaigns) {
    for (const recipient of campaign.NotificationRecipients) {
      if (recipient.onesignal_id) {
        await sendInAppNotification(
          recipient.onesignal_id,
          campaign.title,
          campaign.message,
          recipient.user_type
        );
      }
      await recipient.update({ sent_at: new Date() });
    }

    await campaign.update({
      status: "sent",
      sent_count: campaign.total_recipients,
    });
  }
});
// subscription reminder
