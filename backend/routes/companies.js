import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import { createCompany, updateCompany, deleteCompany, getCompanies, getCompanyById, getCompanyLogo } from "../controllers/companyController.js";

const router = express.Router();

// GET companies (admin + trainer)
router.get("/", verifyToken, verifyRole(["admin", "trainer"]), getCompanies);

// GET company logo (public - must come before /:id route to avoid conflict)
router.get("/:id/logo", getCompanyLogo);

// GET company by ID (admin + trainer)
router.get("/:id", verifyToken, verifyRole(["admin","trainer"]), getCompanyById);

router.post("/", verifyToken, verifyRole("admin"), createCompany);
router.put("/:id", verifyToken, verifyRole("admin"), updateCompany);
router.delete("/:id", verifyToken, verifyRole("admin"), deleteCompany);

export default router;