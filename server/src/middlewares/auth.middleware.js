// import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import sanitize from "mongo-sanitize";
import { redisClient } from "../index.js";
import { User } from "../models/user.model.js";
import { isSessionActive } from "../utils/token.util.js";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(403).json({ message: "Please login - no token" });
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedData) {
      return res.status(400).json({ message: "Token expired." });
    }

    // checking session
    const sessionActive = await isSessionActive(
      decodedData.userId,
      decodedData.sessionId,
    );

    if (!sessionActive) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrfToken");

      return res.status(401).json({
        message:
          "Session Expired. You have been logged in from another device.",
      });
    }

    // caching user in redis (not fetching users from the database continously because then it will put load in sv)

    const cacheUser = await redisClient.get(`user:${decodedData.userId}`);

    if (cacheUser) {
      req.user = JSON.parse(cacheUser);
      req.sessionId = decodedData.sessionId;
      return next();
    }

    // if we didnt find in cache, then we will cache it
    const user = await User.findById(decodedData.userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "No user with this id." });
    }

    await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

    req.user = user;
    req.sessionId = decodedData.sessionId;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const authorizedAdmin = async (req, res, next) => {
  const user = req.user;

  if (user.role !== "admin") {
    return res.status(401).json({
      message: "You are not allowed.",
    });
  }

  next();
};

// export const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: "Too many login attempts. Try again later.",
// });

// export const registerLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max: 10,
//   message: "Too many registrations attempts. Try again later.",
// });

export const validateRequest = (schema) => (req, res, next) => {
  const sanitizedBody = sanitize(req.body); // mongo sanitize for nosql inject prevention
  const validation = schema.safeParse(sanitizedBody); // we sanitized and validated the email, username and password coming from req.body

  if (!validation.success) {
    const zodError = validation.error;

    let firstErrorMessage = "Validation failed";
    let allErrors = [];

    if (zodError?.issues && Array.isArray(zodError.issues)) {
      allErrors = zodError.issues.map((issue) => ({
        field: issue.path ? issue.path.join(".") : "Unknown",
        message: issue.message || "Validation Error",
        code: issue.code,
      }));

      firstErrorMessage = allErrors[0]?.message || "Validation Error";
    }

    return res
      .status(400)
      .json({ message: firstErrorMessage, error: allErrors });
  }

  req.body = validation.data;
  next();
};

// export const redisRateLimit =
//   ({ prefix, windowSeconds }) =>
//   async (req, res, next) => {
//     try {
//       const identifier = `${req.ip}:${req.body?.email || "unknown"}`;
//       const key = `${prefix}:${identifier}`;

//       const exists = await redisClient.get(key);

//       if (exists) {
//         return res.status(429).json({
//           message: "Too many requests, try again later.",
//         });
//       }

//       await redisClient.set(key, "true", { EX: windowSeconds });
//       next();
//     } catch (error) {
//       return res.status(500).json({ message: "Internal server error!", error });
//     }
//   };

export const rateLimitMiddleware =
  ({ prefix }) =>
  async (req, res, next) => {
    const userIdentifier = `${req.ip}:${req.body?.email || "unknown"}`;
    const limit = 10; // Maximum requests allowed
    const windowInSeconds = 60;

    try {
      // Increment the counter for the user's key
      const key = `${prefix}:${userIdentifier}`;
      const currentRequests = await redisClient.incr(key);

      // If it's the first request, set the expiration time for the key
      if (currentRequests === 1) {
        await redisClient.expire(key, windowInSeconds);
      }

      // Check if the request limit has been exceeded
      if (currentRequests > limit) {
        // Get the remaining time until reset
        const ttl = await redisClient.ttl(key);
        return res.status(429).json({
          message: "Too many requests. Please try again after some time.",
          retryAfter: ttl, // Time until the limit resets
        });
      }

      // If within limits, proceed to the route handler
      next();
    } catch (error) {
      console.error("Redis error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
