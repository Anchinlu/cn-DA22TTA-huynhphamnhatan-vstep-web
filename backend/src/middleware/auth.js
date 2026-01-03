import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/constants.js";

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const requireRole = (roleId) => {
  return (req, res, next) => {
    if (!req.user || req.user.vaiTroId !== roleId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};
