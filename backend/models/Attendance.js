import mongoose from "mongoose";
import { nanoid } from "nanoid";

const attendanceSchema = new mongoose.Schema(
  {
    participant_ID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    session_ID: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    // auto-generated, required unique incremental code
    attendenceCode: { type: Number, required: true, unique: true },
    hasAttended: { type: Boolean, default: false },
    sessionFeeling: { type: Number },
    attendenceVitals: {
      weight: { type: Number },
      hba1c: { type: Number },
      bmi: { type: Number },
      bpSystolic_Pre: { type: Number },
      bpDiastolic_Pre: { type: Number },
      bpSystolic_After: { type: Number },
      bpDiastolic_After: { type: Number },
      glucoseMgdl: { type: Number },
      rhr: { type: Number },
      gripStrengthSec: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);