const jwt = require("jsonwebtoken");

// const authMiddleware = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   console.log(token, "token from authorization header");
//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(decoded, "decoded token in auth middleware");

//     req.user = { id: decoded.id || decoded.userId, role: decoded.role };
//     next();
//   } catch (error) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Invalid token", error: error });
//   }
// };

const authMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authorizationHeader.substring(7);
  console.log(token, "token from authorization header");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions:
        decoded.role === "superadmin"
          ? ["*"] // 🔥 FULL ACCESS
          : decoded.permissions || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

module.exports = { authMiddleware };
