import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Expense Manager API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
