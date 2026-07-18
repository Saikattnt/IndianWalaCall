import express from "express";
import { createServer } from "node:http"; // to connect socket server and express instance

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import dns from "node:dns";

// Use Google DNS so MongoDB SRV lookups don't fail on local ISP DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(helmet());

app.use(compression());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes); //version

app.get("/", (req, res) => {
  return res.json({
    message: "Server is running",
  });
});

const start = async () => {
  // Start the server first so Socket.IO (video calls) always works
  server.listen(app.get("port"), () => {
    console.log("Listening on port " + app.get("port"));
  });
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGO Connected DB Host`);
  } catch (err) {
    console.warn(err);
  }
};

start();
