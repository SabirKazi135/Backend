import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid authenticated user",
      });
    }

    const expenses = await Expense.find({ owner: userId }).sort({ date: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "Invalid authenticated user",
      });
    }

    const { title, amount, type, date, notes } = req.body;

    if (!title || amount === undefined || !Number.isFinite(Number(amount))) {
      return res.status(400).json({
        message: "Title and valid amount are required",
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount: Number(amount),
      ...(type !== undefined ? { type } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(notes !== undefined ? { notes } : {}),
      owner: userId,
    });

    return res.status(201).json(expense);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create expense",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      owner: userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json(expense);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch expense",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const body = req.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    for (const field of ["title", "amount", "type", "date", "notes"] as const) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, owner: userId },
      updates,
      { new: true, runValidators: true },
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json(expense);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update expense",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }
    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: id,
      owner: userId,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete expense",
    });
  }
});

export default router;
