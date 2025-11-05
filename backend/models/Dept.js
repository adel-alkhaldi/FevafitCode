import mongoose from "mongoose";

const deptSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // added company reference
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true }
);

export default mongoose.model("Dept", deptSchema);