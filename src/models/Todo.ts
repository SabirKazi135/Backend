import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: { type: String, require: true },
  completed: { type: String, default: false },
});

const TodoModel = mongoose.model("Todo", todoSchema);

export default TodoModel;
