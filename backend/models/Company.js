import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyLogo: { type: Buffer }, // store photo binary
    // new: human readable address and denormalized employee count
    address: { type: String },
    employeeCount: { type: Number, default: 0 },
    // company progress/status enum
    status: {
      type: String,
      enum: ["Not Started", "In-Progress", "Complete"],
      default: "Not Started",
    },
    // store multiple department references for denormalized convenience
    depts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dept" }],
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);