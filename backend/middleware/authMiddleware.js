import jwt from "jsonwebtoken";

/**
 * verifyToken - extracts Bearer token from Authorization header and verifies.
 * Attaches decoded token as req.user.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { userId, role, ... }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * verifyRole - accepts a single role string or an array of roles.
 * Comparison is case-insensitive; roles are normalized to lowercase.
 *
 * Usage:
 *   verifyRole("admin")
 *   verifyRole(["admin","trainer"])
 */
export const verifyRole = (roles) => {
  const allowed = Array.isArray(roles)
    ? roles.map((r) => String(r).toLowerCase())
    : [String(roles).toLowerCase()];

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();
    if (!userRole || !allowed.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    return next();
  };
};