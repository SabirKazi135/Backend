import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
});

const UrlModel = mongoose.model("Url", todoSchema);

export default UrlModel;
