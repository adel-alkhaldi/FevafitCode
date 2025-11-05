import mongoose from "mongoose";
import { nanoid } from "nanoid";

const incidentSchema = new mongoose.Schema(
  {
    attendence_Id: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", required: true },
    severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
    metric: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);