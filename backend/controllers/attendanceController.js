import Attendance from "../models/Attendance.js";
import Incident from "../models/Incident.js";
import Counter from "../models/Counter.js";

/**
 * GET attendances for a specific session (admin + trainer)
 * GET /api/attendance/session/:sessionId
 * supports optional pagination ?page=&limit=
 */
export const getAttendancesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Missing sessionId" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = { session_ID: sessionId };

    const total = await Attendance.countDocuments(filter);
    const attendances = await Attendance.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("participant_ID", "_id fullName phoneNumber role company dept")
      .populate("session_ID", "_id name sessionCode trainer")
      .lean();

    // attach incidents to each attendance
    for (const a of attendances) {
      const incidents = await Incident.find({ attendence_Id: a._id }).lean();
      a.incidents = incidents;
    }

    return res.status(200).json({
      attendances,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching attendances by session:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Create Attendance (admin)
 */
export const createAttendance = async (req, res) => {
  try {
    // generate atomic incremental code using counters collection
    const counter = await Counter.findOneAndUpdate(
      { _id: "attendance" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextCode = counter?.seq || 1;

    const body = { ...req.body, attendenceCode: nextCode };
    // do not allow client to override attendenceCode
    const attendance = new Attendance(body);
    await attendance.save();
    return res.status(201).json({ attendance });
  } catch (error) {
    console.error("Error Creating Attendance:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Update Attendance (admin)
 */
export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    return res.status(200).json({ attendance });
  } catch (error) {
    console.error("Error Updating Attendance:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Delete Attendance (admin)
 */
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    return res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Attendance:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};