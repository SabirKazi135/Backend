import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import TodoModel from "./models/Todo.js";
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};
const app = express();
const todos: Todo[] = [];
app.use(cors());
app.use(express.json());

app.post("/todo", async (req, res) => {
  const todo = await TodoModel.create({
    title: req.body.title,
  });

  res.status(201).json(todo);
});

app.get("/todo", async (req, res) => {
  res.json(await TodoModel.find());
});

app.patch("/todo/:id", async (req, res) => {
  const updatedTodo = await TodoModel.findByIdAndUpdate(
    req.params.id,
    { completed: true },
    { new: true },
  );
  if (!updatedTodo) {
    return res.status(404).json({
      message: "Todo not Found",
    });
  }
  res.json(updatedTodo);
});

app.delete("/todo/:id", async (req, res) => {
  const deletedTodo = await TodoModel.findByIdAndDelete(req.params.id);
  if (!deletedTodo) {
    res.status(404).json({
      message: "Todo not found",
    });
    return;
  }

  res.json(todos);
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
