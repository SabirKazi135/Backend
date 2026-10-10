import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};
const app = express();
const todos: Todo[] = [];
app.use(cors());
app.use(express.json());

app.post("/todo", (req, res) => {
  const todo: Todo = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
  };

  todos.push(todo);

  res.json(todo);
});

app.get("/todo", (req, res) => {
  res.json(todos);
});

app.patch("/todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((todo) => todo.id === id);
  if (todo) {
    todo.completed = true;
  } else {
    res.json({
      message: "Not found id",
    });
    return;
  }
  res.json(todos);
});

app.delete("/todo/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    res.status(404).json({
      message: "Todo not found",
    });
    return;
  }

  todos.splice(index, 1);

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
