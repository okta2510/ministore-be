const ADMIN_KEY = process.env.ADMIN_KEY || "my-secret-admin-key";

function adminAuth(req, res, next) {
  const adminKey = req.headers["adminkey"];

  if (!adminKey) {
    return res.status(401).json({
      message: "Admin key required"
    });
  }

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({
      message: "Invalid admin key"
    });
  }

  next();
}

module.exports = adminAuth;
