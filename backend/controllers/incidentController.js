import Incident from "../models/Incident.js";

/**
 * Create Incident (admin)
 */
export const createIncident = async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    return res.status(201).json({ incident });
  } catch (error) {
    console.error("Error Creating Incident:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Update Incident (admin)
 */
export const updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    return res.status(200).json({ incident });
  } catch (error) {
    console.error("Error Updating Incident:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Delete Incident (admin)
 */
export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    return res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Incident:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET incidents (admin + trainer)
 * populate attendance -> participant and session -> trainer
 */
export const getIncidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Incident.countDocuments();
    const incidents = await Incident.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "attendence_Id",
        populate: [
          { path: "participant_ID", select: "_id fullName phoneNumber role company dept" },
          { path: "session_ID", select: "_id name sessionCode trainer", populate: { path: "trainer", select: "_id fullName phoneNumber role" } }
        ]
      })
      .lean();

    return res.status(200).json({
      incidents,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error Fetching Incidents:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};