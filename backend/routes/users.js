import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import { getUsers, getProfile, deleteUser, updateUser, getTrainers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", verifyToken, verifyRole("admin"), getUsers);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteUser);
router.get("/me", verifyToken, getProfile);
router.put("/:id", verifyToken, verifyRole("admin"), updateUser);
router.get("/trainers", verifyToken, verifyRole(["admin","trainer"]), getTrainers);

export default router;