const cron = require("node-cron");
const Banner = require("../models/banner");
const User = require("../models/user");
const Notification = require("../models/notification");
const NotificationRecipient = require("../models/notification_recipeient");
const { sendInAppNotification } = require("../models/notification_recipeient");
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
  console.log("Checking for scheduled notifications...");

  const pending = await Notification.findAll({
    where: {
      status: "pending",
      schedule_start: { [Op.lte]: new Date() },
    },
    include: [
      {
        model: NotificationRecipient,
        as: "recipients",
        where: { sent_at: null },
        required: true,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "onesignal_id", "role"],
          },
        ],
      },
    ],
  });

  for (const notif of pending) {
    let sentCount = 0;
    for (const recipient of notif.recipients) {
      const user = recipient.user;
      if (user?.onesignal_id) {
        const type = user.role === "technician" ? "technician" : "customer";
        try {
          await sendInAppNotification(
            user.onesignal_id,
            notif.title,
            notif.description,
            type
          );
          await recipient.update({ sent_at: new Date() });
          sentCount++;
        } catch (err) {
          console.error("Push failed:", err.message);
        }
      } else {
        await recipient.update({ sent_at: new Date() }); // skip
      }
    }

    await notif.update({ status: "sent", sent_count: sentCount });
    console.log(
      `Sent scheduled notification: ${notif.id} → ${sentCount} users`
    );
  }
});
// subscription reminder
