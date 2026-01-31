import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.route.js";

const app = express();

// security headers
app.use(helmet());

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
}));

// rate limit global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});
app.use(globalLimiter);

app.use("/api/v1/auth", authRoutes);

export default app;