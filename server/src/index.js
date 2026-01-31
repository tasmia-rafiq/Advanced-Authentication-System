import "./config/env.js";

import app from "./app.js";
import connectDB from "./config/database.js";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.log("Missing redis url");
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
});

const startServer = async () => {
  try {
    await connectDB();

    redisClient
      .connect()
      .then(() => console.log("Connected to redis."))
      .catch(console.error);

    app.on("error", (error) => {
      console.log("Error!", error);
      throw error;
    });

    app.get("/api/v1/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port: ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.log("Server failed to start!", error);
  }
};

startServer();
