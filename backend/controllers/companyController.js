import Company from "../models/Company.js";
import Dept from "../models/Dept.js";

/**
 * Create Company (admin)
 */
export const createCompany = async (req, res) => {
  try {
    const { name, address, employeeCount, companyLogo, status } = req.body;

    const company = new Company({
      name,
      address,
      employeeCount: employeeCount ? Number(employeeCount) : 0,
      status: status ? String(status) : undefined,
    });

    // accept companyLogo as data URL (e.g. data:image/png;base64,...)
    if (companyLogo && typeof companyLogo === "string" && companyLogo.includes("base64,")) {
      try {
        const base64 = companyLogo.split("base64,")[1];
        company.companyLogo = Buffer.from(base64, "base64");
      } catch (err) {
        console.warn("Invalid companyLogo provided, ignoring");
      }
    }

    await company.save();
    return res.status(201).json({ company });
  } catch (error) {
    console.error("Error Creating Company:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Update Company (admin)
 */
export const updateCompany = async (req, res) => {
  try {
    const update = { ...req.body };
    // coerce employeeCount if provided
    if (update.employeeCount !== undefined) update.employeeCount = Number(update.employeeCount);
    // coerce status if present (let mongoose validate enum)
    if (update.status !== undefined) update.status = String(update.status);

    // handle logo in body as data URL
    if (update.companyLogo && typeof update.companyLogo === "string" && update.companyLogo.includes("base64,")) {
      try {
        const base64 = update.companyLogo.split("base64,")[1];
        update.companyLogo = Buffer.from(base64, "base64");
      } catch (err) {
        console.warn("Invalid companyLogo provided, ignoring");
        delete update.companyLogo;
      }
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ company });
  } catch (error) {
    console.error("Error Updating Company:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Delete Company (admin)
 */
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error Deleting Company:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET company logo (admin + trainer + public if you want)
 * GET /api/companies/:id/logo
 */
export const getCompanyLogo = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).select("companyLogo").lean();
    if (!company || !company.companyLogo) {
      return res.status(404).json({ message: "Logo not found" });
    }

    const buffer = Buffer.isBuffer(company.companyLogo)
      ? company.companyLogo
      : Buffer.from(company.companyLogo.data || company.companyLogo);

    // set cache headers (1 year cache for production)
    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    });

    return res.send(buffer);
  } catch (error) {
    console.error("Error fetching logo:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET companies (admin + trainer)
 * NO LONGER includes logo inline; return logoUrl instead
 */
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate({ path: "depts", select: "_id name" })
      .select("-companyLogo") // exclude binary field
      .lean();

    // add logoUrl for each company
    const mapped = companies.map((c) => {
      c.logoUrl = c._id ? `/api/companies/${c._id}/logo` : null;
      return c;
    });

    return res.status(200).json({ companies: mapped });
  } catch (error) {
    console.error("Error Fetching Companies:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

/**
 * GET company by id
 */
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate({ path: "depts", select: "_id name" })
      .select("-companyLogo")
      .lean();

    if (!company) return res.status(404).json({ message: "Company not found" });

    company.logoUrl = company._id ? `/api/companies/${company._id}/logo` : null;
    return res.status(200).json({ company });
  } catch (error) {
    console.error("Error Fetching Company:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};