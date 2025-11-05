import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import Incident from "../models/Incident.js";
import mongoose from "mongoose";

/**
 * GET sessions (admin + trainer)
 * returns sessions populated with trainer & company and includes attendances and incidents
 */
export const getSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { company, dept, q } = req.query;

    let sessions = [];
    let total = 0;

    // Build a fast-path filter using the new arrays on Session (companies, depts)
    const directFilter = {};
    if (company && mongoose.isValidObjectId(company)) {
      // match sessions that include this company id in their companies array
      directFilter.companies = { $in: [new mongoose.Types.ObjectId(company)] };
    }
    if (dept && mongoose.isValidObjectId(dept)) {
      directFilter.depts = { $in: [new mongoose.Types.ObjectId(dept)] };
    }
    // optional text search
    if (q && typeof q === "string" && q.trim()) {
      const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      // search only by sessionCode (name removed)
      directFilter.$or = [{ sessionCode: re }];
    }

    // If any direct filter was provided, try fast path (matching sessions that reference companies/depts)
    const hasDirectFilter = Object.keys(directFilter).length > 0;
    if (hasDirectFilter) {
      // find matching session ids first so we can merge with attendance fallback if needed
      let matched = [];
      try {
        matched = await Session.find(directFilter).select("_id").lean();
      } catch (err) {
        console.error("getSessions: Session.find(directFilter) failed", err);
        return res.status(500).json({ message: "Server Error (Session.find failed)", detail: err?.message });
      }

      const sessionIdSet = new Set(matched.map((m) => String(m._id)));

      // Attendance-based fallback for legacy sessions (only if company/dept provided)
      if ((company && mongoose.isValidObjectId(company)) || (dept && mongoose.isValidObjectId(dept))) {
        const lookupPipeline = [
          {
            $lookup: {
              from: "users",
              localField: "participant_ID",
              foreignField: "_id",
              as: "participant",
            },
          },
          { $unwind: "$participant" },
          {
            $match: {
              ...(company && mongoose.isValidObjectId(company) ? { "participant.company": new mongoose.Types.ObjectId(company) } : {}),
              ...(dept && mongoose.isValidObjectId(dept) ? { "participant.dept": new mongoose.Types.ObjectId(dept) } : {}),
            },
          },
          { $group: { _id: "$session_ID" } },
        ];

        try {
          const sessionIdDocs = await Attendance.aggregate(lookupPipeline);
          sessionIdDocs
            .map((d) => d._1d)
            .filter(Boolean)
            .forEach((id) => sessionIdSet.add(String(id)));
        } catch (aggErr) {
          console.error("Attendance aggregation failed in getSessions:", aggErr);
          // do not fail whole request if aggregate fails; continue with direct matches
        }
      }

      const sessionIds = Array.from(sessionIdSet).filter(Boolean).map((id) => {
        // ensure valid ObjectId
        return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
      }).filter(Boolean);

      total = sessionIds.length;

      if (total === 0) {
        return res.status(200).json({
          sessions: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        });
      }

      // paginate the list of IDs, then fetch full session docs
      const pagedIds = sessionIds.slice(skip, skip + limit);

      try {
        sessions = await Session.find({ _id: { $in: pagedIds } })
          .populate("trainer", "_id fullName phoneNumber role")
          .populate("companies", "_id name")
          .populate("depts", "_id name")
          .lean();
      } catch (err) {
        console.error("getSessions: Session.find by pagedIds failed", err);
        return res.status(500).json({ message: "Server Error (fetch sessions failed)", detail: err?.message });
      }
    } else {
      // No direct filters: return paginated sessions (optionally support q search)
      const filter = {};
      if (q && typeof q === "string" && q.trim()) {
        const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        filter.$or = [{ sessionCode: re }];
      }

      try {
        total = await Session.countDocuments(filter);
        sessions = await Session.find(filter)
          .skip(skip)
          .limit(limit)
          .populate("trainer", "_id fullName phoneNumber role")
          .populate("companies", "_id name")
          .populate("depts", "_id name")
          .lean();
      } catch (err) {
        console.error("getSessions: Session.count/find failed", err);
        return res.status(500).json({ message: "Server Error (list sessions failed)", detail: err?.message });
      }
    }

    // attach attendance + incidents for each session (same behaviour as before)
    for (const s of sessions) {
      let attendances = [];
      try {
        attendances = await Attendance.find({ session_ID: s._id })
          .populate("participant_ID", "_id fullName phoneNumber role company dept")
          // session name removed -> populate only sessionCode
          .populate("session_ID", "_id sessionCode")
          .lean();
      } catch (attErr) {
        console.error("getSessions: Attendance.find failed for session", s._id, attErr);
        attendances = [];
      }

      // if filtering by company+dept (via query), ensure attendances reflect that
      if (company || dept) {
        const co = String(company || "");
        const de = String(dept || "");
        attendances = attendances.filter((a) => {
          const p = a.participant_ID || {};
          if (company && dept) {
            return String(p.company || "") === co && String(p.dept || "") === de;
          } else if (company) {
            return String(p.company || "") === co;
          } else if (dept) {
            return String(p.dept || "") === de;
          }
          return true;
        });
      }

      for (const a of attendances) {
        try {
          const incidents = await Incident.find({ attendence_Id: a._id }).lean();
          a.incidents = incidents;
        } catch (incErr) {
          console.error("getSessions: Incident.find failed for attendance", a._id, incErr);
          a.incidents = [];
        }
      }

      s.attendances = attendances;
      s.attendeeCount = attendances.length;
    }

    return res.status(200).json({
      sessions,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error Fetching Sessions:", error);
    return res.status(500).json({ message: "Server Error: " + (error?.message || "unknown") });
  }
};

/**
 * Create / Update / Delete handlers unchanged (but ensure they use 'trainer' field)
 */
export const createSession = async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    return res.status(201).json({ session });
  } catch (error) {
    console.error("Error Creating Session:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ session });
  } catch (error) {
    console.error("Error Updating Session:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Session:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};