import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import { createSession, updateSession, deleteSession, getSessions } from "../controllers/sessionController.js";
// new: import attendance handler so we can expose attendances under sessions
import { getAttendancesBySession } from "../controllers/attendanceController.js";

const router = express.Router();

// GET sessions (admin + trainer)
router.get("/", verifyToken, verifyRole(["admin", "trainer"]), getSessions);

// new: GET attendances for a session (accessible to admin + trainer)
// GET /api/sessions/:id/attendances
router.get("/:id/attendances", verifyToken, verifyRole(["admin", "trainer"]), (req, res, next) => {
  // reuse attendance controller which expects sessionId param named sessionId
  req.params.sessionId = req.params.id;
  return getAttendancesBySession(req, res, next);
});

// allow admin and trainer for modifications
router.post("/", verifyToken, verifyRole(["admin", "trainer"]), createSession);
router.put("/:id", verifyToken, verifyRole(["admin", "trainer"]), updateSession);
router.delete("/:id", verifyToken, verifyRole(["admin", "trainer"]), deleteSession);

export default router;