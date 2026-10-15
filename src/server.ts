import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import Todo from "./models/Todo.js";
import User from "./models/User.js";

const app = express();

app.use(cors());
app.use(express.json());

// REGISTER — bcrypt
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// LOGIN — bcrypt
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// CREATE TODO
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;

    const todo = await Todo.create({ title });

    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create Todo",
    });
  }
});

// READ ALL TODOS
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find();

    return res.json(todos);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch Todos",
    });
  }
});

// UPDATE TODO
app.patch("/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTodo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    return res.json(updatedTodo);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update Todo",
    });
  }
});

// DELETE TODO
app.delete("/todos/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    return res.json(deletedTodo);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete Todo",
    });
  }
});

// CONNECT TO MONGODB AND START SERVER
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing");
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
