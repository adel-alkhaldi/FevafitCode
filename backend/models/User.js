import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    EID: { type: String },
    phoneNumber: { type: String, required: true, unique: true }, // used for login
    fullName: { type: String, required: true },
    // changed: accept lowercase gender values and coerce to lowercase
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
      lowercase: true,
    },
    // replaced numeric age with date of birth
    dob: { type: Date, required: true },
    role: {
      type: String,
      enum: ["attendee", "trainer", "admin", "viewer"],
      required: true,
      lowercase: true,
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: "Dept" },
    baselineVitals: {
      height: { type: Number },
      weight: { type: Number },
      hba1c: { type: Number },
      bmi: { type: Number },
      bpSystolic: { type: Number },
      bpDiastolic: { type: Number },
      glucoseMgdl: { type: Number },
      rhr: { type: Number },
      gripStrengthSec: { type: Number },
    },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);