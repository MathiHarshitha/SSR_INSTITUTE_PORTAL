import dns from "dns";
import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

mongoose.set("strictQuery", true);

// Some routers/ISPs (common on Windows home networks) refuse Node's SRV
// lookups for mongodb+srv:// URIs even though the OS resolver succeeds.
// Forcing a public resolver here avoids ECONNREFUSED on the `_mongodb._tcp`
// SRV query without requiring the user to change their network's DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB(): Promise<void> {
  mongoose.connection.on("connected", () => logger.info("MongoDB connected"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB connection error", err));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

  await mongoose.connect(env.mongodbUri);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
