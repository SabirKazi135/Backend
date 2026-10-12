import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import UrlModel from "./models/Url.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/shorten", async (req, res) => {
  const url = req.body.originalUrl;
  const code = Math.random().toString(36).slice(2, 8);

  const shorten = await UrlModel.create({
    originalUrl: url,
    shortCode: code,
  });

  res.status(201).json(shorten);
});

app.get("/api/shorten", async (req, res) => {
  const shortens = await UrlModel.find();

  res.json(shortens);
});

async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
