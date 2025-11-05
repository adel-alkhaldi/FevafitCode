import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import { createIncident, updateIncident, deleteIncident, getIncidents } from "../controllers/incidentController.js";

const router = express.Router();

// GET incidents (admin + trainer)
router.get("/", verifyToken, verifyRole(["admin", "trainer"]), getIncidents);

// allow admin and trainer for modifications
router.post("/", verifyToken, verifyRole(["admin", "trainer"]), createIncident);
router.put("/:id", verifyToken, verifyRole(["admin", "trainer"]), updateIncident);
router.delete("/:id", verifyToken, verifyRole(["admin", "trainer"]), deleteIncident);

export default router;