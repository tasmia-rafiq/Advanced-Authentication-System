import Router from "express";
const router = Router();

import { registerUser, checkUsernameAvailability, login, refreshAccessToken, verifyUser, myProfile, logout, refreshCSRF, adminController, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { authorizedAdmin, isAuth, rateLimitMiddleware, validateRequest } from "../middlewares/auth.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import { verifyCSRFToken } from "../middlewares/csrf.middleware.js";

router.post(
    "/register",
    validateRequest(registerSchema),
    rateLimitMiddleware({ prefix: "register-rate-limit" }),
    registerUser
);

router.get("/check-username", checkUsernameAvailability);

router.post("/verify/:token", verifyUser);

router.post(
    "/login",
    validateRequest(loginSchema),
    rateLimitMiddleware({ prefix: "login-rate-limit" }),
    login
);

router.post("/refresh-token", refreshAccessToken);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/me", isAuth, myProfile);
router.post("/logout", isAuth, verifyCSRFToken, logout);
router.post("/refresh-csrf", isAuth, refreshCSRF);

router.get("/admin", isAuth, authorizedAdmin, adminController);

export default router;