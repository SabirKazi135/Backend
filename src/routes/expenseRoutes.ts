import { Router } from "express";
import mongoose from "mongoose";
import type { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Expense } from "../models/Expense.js";

const router = Router();

router.use(authMiddleware);

function getUserId(req: Request, res: Response): string | undefined {
  if (!req.userId || !mongoose.isValidObjectId(req.userId)) {
    res.status(401).json({ message: "Invalid authenticated user" });
    return undefined;
  }

  return req.userId;
}

router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { title, amount, type, date, notes } = req.body as {
      title?: string;
      amount?: number;
      type?: "expense" | "income";
      date?: string;
      notes?: string;
    };

    if (!title?.trim() || typeof amount !== "number") {
      res.status(400).json({ message: "Title and numeric amount are required" });
      return;
    }

    const expense = await Expense.create({
      title: title.trim(),
      amount,
      ...(type !== undefined ? { type } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(notes !== undefined ? { notes } : {}),
      owner: userId
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(400).json({ message: "Could not create expense; check your input" });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const expenses = await Expense.find({ owner: userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error("List expenses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      owner: userId
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid expense ID" });
      return;
    }

    const updates: Record<string, unknown> = {};
    const body = req.body as Record<string, unknown>;

    for (const field of ["title", "amount", "type", "date", "notes"] as const) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "No valid fields provided for update" });
      return;
    }

    if (typeof updates.title === "string") {
      updates.title = updates.title.trim();
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.json(expense);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(400).json({ message: "Could not update expense; check your input" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid expense ID" });
      return;
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      owner: userId
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
