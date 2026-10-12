# FULL-STACK CRUD — SYNTAX REFERENCE

## 1. MONGOOSE SCHEMA — `models/Diary.ts`

import mongoose from "mongoose";

const diarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

const Diary = mongoose.model("Diary", diarySchema);

export default Diary;

## 2. SERVER SETUP — `server.ts`

import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import Diary from "./models/Diary.js";

const app = express();

app.use(cors());
app.use(express.json());

// CRUD routes here

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

## 3. BACKEND CRUD — EXPRESS + MONGOOSE

### CREATE — POST

app.post("/diary", async (req, res) => {
  const { title, description } = req.body;

  const diary = await Diary.create({
    title,
    description,
  });

  res.status(201).json(diary);
});

### READ ALL — GET

app.get("/diary", async (req, res) => {
  const diaries = await Diary.find();

  res.json(diaries);
});

### READ ONE — GET BY ID

app.get("/diary/:id", async (req, res) => {
  const diary = await Diary.findById(req.params.id);

  if (!diary) {
    return res.status(404).json({
      message: "Diary not found",
    });
  }

  res.json(diary);
});

### UPDATE — PATCH

app.patch("/diary/:id", async (req, res) => {
  const updates: {
    title?: string;
    description?: string;
  } = {};

  if (typeof req.body.title === "string") {
    updates.title = req.body.title;
  }

  if (typeof req.body.description === "string") {
    updates.description = req.body.description;
  }

  const updatedDiary = await Diary.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedDiary) {
    return res.status(404).json({
      message: "Diary not found",
    });
  }

  res.json(updatedDiary);
});

### DELETE — DELETE

app.delete("/diary/:id", async (req, res) => {
  const deletedDiary = await Diary.findByIdAndDelete(req.params.id);

  if (!deletedDiary) {
    return res.status(404).json({
      message: "Diary not found",
    });
  }

  res.json(deletedDiary);
});

## 4. FRONTEND TYPES + STATE — `App.tsx`

import { useState, useEffect } from "react";

type DiaryEntry = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const API_URL = "http://localhost:5000/diary";

// Inside component:
const [entries, setEntries] = useState<DiaryEntry[]>([]);
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [editingId, setEditingId] = useState<string | null>(null);

## 5. FRONTEND CRUD — REACT + FETCH

### READ ALL — GET

useEffect(() => {
  async function fetchEntries() {
    try {
      const res = await fetch(API_URL);

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data: DiaryEntry[] = await res.json();
      setEntries(data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchEntries();
}, []);

### CREATE — POST

async function handleCreate() {
  if (!title.trim() || !description.trim()) return;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error("Failed to create");

    const newEntry: DiaryEntry = await res.json();

    setEntries((current) => [...current, newEntry]);
    setTitle("");
    setDescription("");
  } catch (error) {
    console.error(error);
  }
}

### OPEN ENTRY — READ ONE FROM EXISTING STATE

const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

function handleOpenEntry(entry: DiaryEntry) {
  setSelectedEntry(entry);
}

### START EDITING

function handleEdit(entry: DiaryEntry) {
  setEditingId(entry._id);
  setTitle(entry.title);
  setDescription(entry.description);
}

### UPDATE — PATCH

async function handleUpdate() {
  if (!editingId || !title.trim() || !description.trim()) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) throw new Error("Failed to update");

    const updatedEntry: DiaryEntry = await res.json();

    setEntries((current) =>
      current.map((entry) =>
        entry._id === updatedEntry._id ? updatedEntry : entry,
      ),
    );

    setEditingId(null);
    setTitle("");
    setDescription("");
  } catch (error) {
    console.error(error);
  }
}

### CANCEL EDITING

function handleCancel() {
  setEditingId(null);
  setTitle("");
  setDescription("");
}

### DELETE — DELETE

async function handleDelete(id: string) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    setEntries((current) => current.filter((entry) => entry._id !== id));

    setSelectedEntry(null);
  } catch (error) {
    console.error(error);
  }
}

## 6. REACT FORM + EVENT SYNTAX

### Controlled input

<input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
/>

<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

### Conditional Add / Update button

<button
  onClick={() => {
    if (editingId) {
      handleUpdate();
    } else {
      handleCreate();
    }
  }}
>
  {editingId ? "Update" : "Add"}
</button>

### Map entries

{
  entries.map((entry) => (
    <article key={entry._id}>
      <h2>{entry.title}</h2>
      <p>{entry.description}</p>

      <button onClick={() => handleEdit(entry)}>Edit</button>

      <button onClick={() => handleDelete(entry._id)}>Delete</button>
    </article>
  ));
}

## 7. REUSABLE SYNTAX PATTERNS

// Create
await Model.create(data);

// Read all
await Model.find();

// Read one
await Model.findById(id);

// Update
await Model.findByIdAndUpdate(id, updates, {
  new: true,
  runValidators: true,
});

// Delete
await Model.findByIdAndDelete(id);

// Check missing document
if (!document) {
  return res.status(404).json({ message: "Not found" });
}

// Validate string
if (typeof req.body.title === "string") {
  updates.title = req.body.title;
}

// Async error handling
try {
  // await operation
} catch (error) {
  console.error(error);
}

// Append to array
setItems((current) => [...current, newItem]);

// Replace matching item
setItems((current) =>
  current.map((item) => (item._id === updated._id ? updated : item)),
);

// Remove matching item
setItems((current) => current.filter((item) => item._id !== id));

// JSON request body
body: JSON.stringify(data);

// Parse response
const data = await res.json();

// Check HTTP response
if (!res.ok) throw new Error("Request failed");

## 8. CHANGE THESE FOR EACH PROJECT

| Project       | Model fields               | API path     |
| ------------- | -------------------------- | ------------ |
| Diary         | `title`, `description`     | `/diary`     |
| Todo          | `title`, `completed`       | `/todo`      |
| Notes         | `title`, `content`         | `/notes`     |
| Bookmarks     | `title`, `url`             | `/bookmarks` |
| URL shortener | `originalUrl`, `shortCode` | `/urls`      |
