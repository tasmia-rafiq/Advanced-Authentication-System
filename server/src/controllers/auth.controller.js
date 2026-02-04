import crypto from "crypto";
import { User } from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateEmailToken,
  verifyRefreshToken,
  revokeRefreshToken,
  generateSessionId,
} from "../utils/token.util.js";
import { tokenCookieOptions } from "../utils/cookie.util.js";
import { redisClient } from "../index.js";
import {
  getPasswordResetHtml,
  getVerifyEmailHtml,
} from "../config/mailHtml.js";
import sendMail from "../config/sendMail.js";
import {
  generateCSRFToken,
  revokeCSRFToken,
} from "../middlewares/csrf.middleware.js";
import { id } from "zod/v4/locales";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    const { verifyToken, verifyHashedToken } = generateEmailToken();

    const verifyKey = `verify:${verifyHashedToken}`;

    const dataToStore = JSON.stringify({
      username,
      email,
      password,
    });

    await redisClient.set(verifyKey, dataToStore, { EX: 300 }); // this will be stored in redis for 5m

    await sendMail({
      to: email,
      subject: "Verify your email for account creation.",
      html: getVerifyEmailHtml({ email, token: verifyToken }),
    });

    return res.status(201).json({
      message:
        "If your email is valid, a verification link has been sent. It will expire in 5 minute.",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required." });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const verifyKey = `verify:${hashedToken}`;

    const userDataJson = await redisClient.get(verifyKey);

    if (!userDataJson) {
      return res.status(400).json({
        message: "Verification link is expired.",
      });
    }

    const userData = JSON.parse(userDataJson);

    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      await redisClient.del(verifyKey);
      return res.status(200).json({ message: "Email already verified." });
    }

    const newUser = await User.create({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });

    await redisClient.del(verifyKey);

    res.status(201).json({
      message:
        "Email verified successfully! Your account has been created. Login to your account now.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);

    // Handle duplicate key
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Email already verified.",
      });
    }
    return res.status(500).json({ message: "Server error." });
  }
};

const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({ available: false });
    }

    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
    }).select("_id");

    return res.status(200).json({
      available: !existingUsername,
    });
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({ available: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid Credentials." });

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return res.status(401).json({ message: "Invalid Credentials." });
    }

    const sessionId = generateSessionId();

    const accessToken = generateAccessToken(user._id, sessionId);
    const refreshToken = generateRefreshToken(user._id, sessionId);
    const csrfToken = await generateCSRFToken(user._id);

    // save refresh token in redis
    const refreshTokenKey = `refresh_token:${user._id}`;

    // Creating session
    const activeSessionKey = `active_session:${user._id}`;
    const sessionDataKey = `session:${sessionId}`;

    const existingSession = await redisClient.get(activeSessionKey);

    if (existingSession) {
      await redisClient.del(`session:${existingSession}`);
      await redisClient.del(refreshToken);
    }

    const sessionData = {
      userId: id,
      sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);
    await redisClient.setEx(
      sessionDataKey,
      7 * 24 * 60 * 60,
      JSON.stringify(sessionData),
    );
    await redisClient.setEx(activeSessionKey, 7 * 24 * 60 * 60, sessionId);

    // user.refreshToken = refreshToken;
    // await user.save(); // this was saving in mongoDB

    res.cookie("accessToken", accessToken, tokenCookieOptions(15 * 60 * 1000));

    res.cookie(
      "refreshToken",
      refreshToken,
      tokenCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

    res.cookie("csrfToken", csrfToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User signed in successfully.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      sessionInfo: {
        sessionId: sessionData.sessionId,
        loginTime: new Date().toISOString(),
        csrfToken: csrfToken,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Server error.", error });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Invalid Refresh Token." });

    const decode = await verifyRefreshToken(refreshToken);

    if (!decode) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrfToken");
      return res
        .status(401)
        .json({ message: "Session expired! Please login." });
    }

    // ROTATE REFRESH TOKEN
    const newAccessToken = generateAccessToken(decode.userId, decode.sessionId);

    res.cookie(
      "accessToken",
      newAccessToken,
      tokenCookieOptions(15 * 60 * 1000),
    );

    res
      .status(200)
      .json({ message: "Token refreshed", accessToken: newAccessToken });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account with this email exists, a reset link has been sent.",
      });
    }

    const { verifyToken } = generateEmailToken();

    const resetTokenKey = `reset:${verifyToken}`;

    await redisClient.set(
      resetTokenKey,
      user._id.toString(),
      { EX: 900 }, // 15 mins
    );

    await sendMail({
      to: email,
      subject: "Reset your password.",
      html: getPasswordResetHtml({ email, token: verifyToken }),
    });

    return res.status(200).json({
      message:
        "If an account with this email exists, a reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error:", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const resetTokenKey = `reset:${token}`;

    const userId = await redisClient.get(resetTokenKey);

    if (!userId) {
      return res.status(400).json({
        message: "Reset link is invalid or expired.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      await redisClient.del(resetTokenKey);
      return res.status(400).json({ message: "Invalid reset link." });
    }

    // save password
    user.password = password;
    await user.save();

    // invalidate token
    await redisClient.del(resetTokenKey);

    return res.status(200).json({
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error:", error });
  }
};

const myProfile = async (req, res) => {
  try {
    const user = req.user;

    const sessionId = req.sessionId;

    const sessionData = await redisClient.get(`session:${sessionId}`);

    let sessionInfo = null;

    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      sessionInfo = {
        sessionId,
        loginTime: parsedSession.createdAt,
        lastActivity: parsedSession.lastActivity,
      };
    }

    res.json({ user, sessionInfo });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (userId) {
      await revokeRefreshToken(userId);
      await revokeCSRFToken(userId);
      await redisClient.del(`user:${userId}`);
    }

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("csrfToken");

    res.status(200).json({
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};

const refreshCSRF = async (req, res) => {
  try {
    const userId = req.user._id;
    const newCSRFToken = await generateCSRFToken(userId);

    res.cookie("csrfToken", newCSRFToken, tokenCookieOptions(60 * 60 * 1000));

    res.status(200).json({
      message: "CSRF token refreshed successfully!",
      csrfToken: newCSRFToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

const adminController = async (req, res) => {
  try {
    res.json({
      message: "Hello admin",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error });
  }
};

export {
  registerUser,
  checkUsernameAvailability,
  verifyUser,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  myProfile,
  logout,
  refreshCSRF,
  adminController,
};

// store refresh token in redis so that when a user logins in another place then the user's refresh token will be updated and it's previous refresh token will be expired
