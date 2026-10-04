const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
    });
  }

  const tokenParts = authorizationHeader.split(" ");

  if (
    tokenParts.length !== 2 ||
    tokenParts[0] !== "Bearer" ||
    !tokenParts[1]
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format",
    });
  }

  try {
    const decodedToken = jwt.verify(
      tokenParts[1],
      process.env.JWT_SECRET
    );

    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports = authenticateToken;
