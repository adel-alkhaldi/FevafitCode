import Dept from "../models/Dept.js";
import Company from "../models/Company.js";

/**
 * Create Dept (admin)
 */
export const createDept = async (req, res) => {
  try {
    const dept = new Dept(req.body);
    await dept.save();

    // if dept belongs to a company, ensure company.depts contains this dept
    if (dept.company) {
      try {
        await Company.findByIdAndUpdate(dept.company, { $addToSet: { depts: dept._id } });
      } catch (err) {
        console.warn("Failed to link dept to company.depts:", err);
      }
    }

    return res.status(201).json({ dept });
  } catch (error) {
    console.error("Error Creating Dept:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Update Dept (admin)
 */
export const updateDept = async (req, res) => {
  try {
    // find existing to detect company changes
    const existing = await Dept.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Dept not found" });

    const oldCompany = existing.company ? String(existing.company) : null;
    const newCompany = req.body.company ? String(req.body.company) : oldCompany;

    const dept = await Dept.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // maintain company.depts arrays if company changed
    if (oldCompany !== newCompany) {
      if (oldCompany) {
        await Company.findByIdAndUpdate(oldCompany, { $pull: { depts: dept._id } }).catch(() => {});
      }
      if (newCompany) {
        await Company.findByIdAndUpdate(newCompany, { $addToSet: { depts: dept._id } }).catch(() => {});
      }
    }

    return res.status(200).json({ dept });
  } catch (error) {
    console.error("Error Updating Dept:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Delete Dept (admin)
 */
export const deleteDept = async (req, res) => {
  try {
    const dept = await Dept.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: "Dept not found" });

    // remove reference from company.depts if present
    if (dept.company) {
      await Company.findByIdAndUpdate(dept.company, { $pull: { depts: dept._id } }).catch(() => {});
    }

    return res.status(200).json({ message: "Dept deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Dept:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET depts (admin + trainer)
 */
export const getDepts = async (req, res) => {
  try {
    const depts = await Dept.find().populate("company", "_id name").lean();
    return res.status(200).json({ depts });
  } catch (error) {
    console.error("Error Fetching Depts:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};