import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import { createDept, updateDept, deleteDept, getDepts } from "../controllers/deptController.js";

const router = express.Router();

// GET depts (admin + trainer)
router.get("/", verifyToken, verifyRole(["admin", "trainer"]), getDepts);

router.post("/", verifyToken, verifyRole("admin"), createDept);
router.put("/:id", verifyToken, verifyRole("admin"), updateDept);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteDept);

export default router;