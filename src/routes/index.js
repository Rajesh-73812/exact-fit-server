// const fs = require("fs").promises;
// const path = require("path");
// const express = require("express");

// module.exports = async (app) => {
//   try {
//     const versionPath = path.join(__dirname, "../api");
//     if (process.env.NODE_ENV !== "test")
//       console.log(`Loading routes from: ${versionPath}`);

//     // Read all version directories (e.g., v1, v2)
//     const versions = await fs.readdir(versionPath, { withFileTypes: true });

//     for (const versionDir of versions) {
//       // Only process directories
//       if (!versionDir.isDirectory()) continue;

//       const version = versionDir.name;
//       const versionDirPath = path.join(versionPath, version);

//       // Read all files in the version directory
//       const files = await fs.readdir(versionDirPath, { withFileTypes: true });

//       for (const file of files) {
//         // Only process .routes.js files
//         if (file.isFile() && file.name.endsWith(".routes.js")) {
//           try {
//             const routePath = path.join(versionDirPath, file.name);
//             const route = require(routePath);

//             // Validate that the imported module is an Express router
//             if (!(route instanceof express.Router)) {
//               console.warn(
//                 `⚠️ Skipping ${file.name}: Not a valid Express router`
//               );
//               continue;
//             }

//             const routeName = file.name.replace(".routes.js", "");
//             const routeUrl = `/api/${version}/${routeName}`;

//             // Register the route
//             app.use(routeUrl, route);
//             if (process.env.NODE_ENV !== "test")
//               console.log(`✅ Registered route: ${routeUrl}`);
//           } catch (err) {
//             console.error(
//               `❌ Failed to load route ${file.name}: ${err.message}`
//             );
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.error(`❌ Failed to load routes: ${err.message}`);
//     throw err; // Rethrow to handle in server.js
//   }
// };


const fs = require("fs").promises;
const path = require("path");

module.exports = async (app) => {
  const versionPath = path.join(__dirname, "../api");

  console.log("🔥 loadRoutes() called");
  console.log("📂 Loading routes from:", versionPath);

  const versions = await fs.readdir(versionPath, { withFileTypes: true });

  for (const versionDir of versions) {
    if (!versionDir.isDirectory()) continue;

    const version = versionDir.name;
    const versionDirPath = path.join(versionPath, version);

    const files = await fs.readdir(versionDirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".routes.js")) continue;

      const routePath = path.join(versionDirPath, file.name);
      const route = require(routePath);

      const routeName = file.name.replace(".routes.js", "");
      const routeUrl = `/api/${version}/${routeName}`;

      app.use(routeUrl, route);
      console.log(`✅ Registered route: ${routeUrl}`);
    }
  }
};
