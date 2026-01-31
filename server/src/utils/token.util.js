import crypto from "crypto";
import jwt from "jsonwebtoken";
import { redisClient } from "../index.js";

export const generateSessionId = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const generateEmailToken = () => {
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyHashedToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  return { verifyToken, verifyHashedToken };
};

export const generateAccessToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId, sessionId) => {
  return jwt.sign({ userId, sessionId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyRefreshToken = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const storedToken = await redisClient.get(
      `refresh_token:${payload.userId}`,
    );

    if (storedToken !== refreshToken) return null;

    const activeSessionId = await redisClient.get(
      `active_session:${payload.userId}`,
    );

    if (activeSessionId !== payload.sessionId) return null;

    const sessionData = await redisClient.get(`session:${payload.sessionId}`);

    if (!sessionData) return null;

    const parsedSessionData = JSON.parse(sessionData);
    parsedSessionData.lasttActivity = new Date().toISOString();

    await redisClient.setEx(
      `session:${payload.sessionId}`,
      7 * 24 * 60 * 60 * 60,
      JSON.stringify(parsedSessionData),
    );

    return payload;
  } catch {
    return null;
  }
};

export const revokeRefreshToken = async (userId) => {
  try {
    await redisClient.del(`refresh_token:${userId}`);

    // revoking session as well
    const activeSessionId = await redisClient.get(`active_session:${userId}`);
    await redisClient.del(`active_session:${userId}`);

    if (activeSessionId) {
      await redisClient.del(`session:${activeSessionId}`);
    }
  } catch (error) {
    console.log("Error revoking!", error);
  }
};

export const isSessionActive = async (userId, sessionId) => {
  const activeSessionId = await redisClient.get(`active_session:${userId}`);
  return activeSessionId === sessionId;
}