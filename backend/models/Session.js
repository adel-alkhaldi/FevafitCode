import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionCode: { type: String },
    location: { type: String },
    date: { type: Date },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    depts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dept" }],
    notes: { type: String },
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    attendeeCount: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);