const axios = require("axios");
const Notification = require("../models/notification");

// const sendInAppNotification = async (playerId, title, message, type) => {
//   console.log("notification startttttttttttttttttttttt");
//   console.log("🔔 Title:", title);
//   console.log("📝 Message:", message);
//   console.log(" playerId:", playerId);
//   console.log(" Notification recived by:", type);

//   try {
//     let apiKey, appId;
//     if (type === "technician") {
//       // apiKey = process.env.TECHNICIAN_ONESIGNAL_API_KEY;
//       // appId = process.env.TECHNICIAN_ONESIGNAL_APP_ID;
//       apiKey = process.env.ONESIGNAL_REST_API_KEY;
//       appId = process.env.ONESIGNAL_APP_ID;
//     } else if (type === "customer") {
//       apiKey = process.env.CUSTOMER_ONESIGNAL_API_KEY;
//       appId = process.env.CUSTOMER_ONESIGNAL_APP_ID;
//     } else if (type === "admin") {
//       apiKey = process.env.ADMIN_ONESIGNAL_API_KEY;
//       appId = process.env.ADMIN_ONESIGNAL_APP_ID;
//     } else {
//       console.log("invalid type");
//     }

//     const res = await axios.post(
//       process.env.NOTIFICATION_SERVICE_URL,
//       {
//         app_id: appId,
//         include_player_ids: [playerId],
//         headings: { en: title },
//         contents: { en: message },
//       },
//       {
//         headers: {
//           Authorization: `Basic ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log("✅ OneSignal response:", res.data);
//   } catch (error) {
//     console.error("❌ Error in OneSignal:", error.message);
//   }
// };

const createNotification = async (user_id, title, message) => {
  const create = await Notification.create({
    user_id,
    title,
    description: message,
  });

  if (create) {
    return { success: true, message: "Notification created successfully" };
  } else {
    return { success: false, message: "Failed to create notification" };
  }
};

const sendInAppNotification = async (playerId, title, message, type) => {
  console.log("notification startttttttttttttttttttttt");
  console.log("🔔 Title:", title);
  console.log("📝 Message:", message);
  console.log(" playerId:", playerId);
  console.log(" Notification received by:", type);

  if (!playerId || typeof playerId !== "string" || playerId.trim() === "") {
    console.error("❌ Invalid playerId");
    return;
  }

  let apiKey, appId;
  if (type === "technician") {
    apiKey =
      process.env.TECHNICIAN_ONESIGNAL_API_KEY ||
      process.env.ONESIGNAL_REST_API_KEY;
    appId =
      process.env.TECHNICIAN_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  } else if (type === "customer") {
    apiKey =
      process.env.CUSTOMER_ONESIGNAL_API_KEY ||
      process.env.ONESIGNAL_REST_API_KEY;
    appId =
      process.env.CUSTOMER_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  } else if (type === "admin") {
    apiKey =
      process.env.ADMIN_ONESIGNAL_API_KEY || process.env.ONESIGNAL_REST_API_KEY;
    appId = process.env.ADMIN_ONESIGNAL_APP_ID || process.env.ONESIGNAL_APP_ID;
  } else {
    console.error("❌ Invalid type");
    return;
  }

  if (!apiKey || !appId) {
    console.error("❌ Missing API Key or App ID for type:", type);
    return;
  }

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: appId,
        include_player_ids: [playerId.trim()],
        headings: { en: title },
        contents: { en: message },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    console.log("✅ OneSignal Success:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("❌ OneSignal API Error (Status):", error.response.status);
      console.error("❌ OneSignal Response Data:", error.response.data);
    } else if (error.request) {
      console.error("❌ No response from OneSignal:", error.request);
    } else {
      console.error("❌ Request error:", error.message);
    }
  }
};
module.exports = {
  sendInAppNotification,
  createNotification,
};
