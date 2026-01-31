import crypto from "crypto";
import { redisClient } from "../index.js";

export const generateCSRFToken = async (userId) => {
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const csrfKey = `csrf:${userId}`;

  await redisClient.setEx(csrfKey, 3600, csrfToken);

  return csrfToken;
};

export const verifyCSRFToken = async (req, res, next) => {
  try {
    if (req.method === "GET") {
      return next();
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const clientToken = req.headers["x-csrf-token"] || req.cookies.csrfToken;
    const csrfKey = `csrf:${userId}`;
    const storedToken = await redisClient.get(csrfKey);

    if (req.path === "/logout") {
      // If token exists, it must match
      if (storedToken && clientToken !== storedToken) {
        return res.status(403).json({
          message: "Invalid CSRF Token.",
          code: "CSRF_TOKEN_INVALID",
        });
      }
      // Missing or expired token → allow logout
      return next();
    }

    if (!clientToken) {
      return res.status(403).json({
        message: "CSRF Token missing.",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    if (storedToken !== clientToken) {
      return res.status(403).json({
        message: "Invalid CSRF Token.",
        code: "CSRF_TOKEN_INVALID",
      });
    }

    next();
  } catch (error) {
    console.log("CSRF Verification error:", error);
    return res.status(500).json({
      message: "CSRF verification failed.",
      code: "CSRF_VERIFICATION_ERROR",
    });
  }
};

export const revokeCSRFToken = async (userId) => {
  const csrfKey = `csrf:${userId}`;

  await redisClient.del(csrfKey);
};

export const refreshCSRFToken = async (userId, res) => {
  await revokeCSRFToken(userId);

  return await generateCSRFToken(userId, res);
};
