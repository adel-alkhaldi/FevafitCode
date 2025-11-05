import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendancesBySession, // added
} from "../controllers/attendanceController.js";

const router = express.Router();

// GET attendances for a session (admin + trainer)
router.get("/session/:sessionId", verifyToken, verifyRole(["admin", "trainer"]), getAttendancesBySession);

// allow admin and trainer for create/update/delete
router.post("/", verifyToken, verifyRole(["admin", "trainer"]), createAttendance);
router.put("/:id", verifyToken, verifyRole(["admin", "trainer"]), updateAttendance);
router.delete("/:id", verifyToken, verifyRole(["admin", "trainer"]), deleteAttendance);

export default router;