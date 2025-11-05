import React, { useState, useEffect } from "react";
import { useNav } from "../context/NavContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClientCard from "../components/ClientCard";

/**
 * Clients page (JSX) — converted from provided TSX example.
 */
export default function ClientCompanies() {
  const { collapsed } = useNav();
  const navWidth = collapsed ? "4rem" : "14rem";
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create / Edit modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null); // NEW
  const [newCompanyName, setNewCompanyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Add local state for logo file preview if desired
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/companies", {
          headers: { Authorization: `Bearer ${auth?.accessToken}` },
          withCredentials: true,
        });
        setCompanies(res.data.companies || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load companies:", err?.response?.data || err);
        setError("Failed to load companies.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.accessToken) fetchCompanies();
    else setLoading(false);
  }, [auth]);

  // helper: resize image to 200x200 and return dataURL (PNG)
  const resizeTo200 = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext("2d");
            // fill with white to avoid transparent backgrounds
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // draw image centered and cover
            const ratio = Math.max(200 / img.width, 200 / img.height);
            const w = img.width * ratio;
            const h = img.height * ratio;
            const x = (200 - w) / 2;
            const y = (200 - h) / 2;
            ctx.drawImage(img, x, y, w, h);
            const dataUrl = canvas.toDataURL("image/png");
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const openCreate = () => {
    setEditingCompany(null);
    setNewCompanyName("");
    setNewCompanyAddress("");
    setNewCompanyStatus("Not Started");
    setNewCompanyEmployees("");
    setLogoFile(null);
    setCreateError(null);
    setShowCreateModal(true);
  };

  // prepare modal fields when editing
  const startEdit = (companyId) => {
    const comp = companies.find((c) => String(c._id) === String(companyId));
    if (!comp) return;
    setEditingCompany(comp);
    setNewCompanyName(comp.name || "");
    setNewCompanyAddress(comp.address || "");
    setNewCompanyStatus(comp.status || "Not Started");
    setNewCompanyEmployees(comp.employeeCount ? String(comp.employeeCount) : "");
    setLogoFile(null); // user can upload new file if desired
    setCreateError(null);
    setShowCreateModal(true);
  };

  // handle delete
  const handleDelete = async (companyId) => {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    try {
      await axios.delete(`/api/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
        withCredentials: true,
      });
      setCompanies((prev) => prev.filter((c) => String(c._id) !== String(companyId)));
    } catch (err) {
      console.error("Delete company failed:", err);
      alert("Failed to delete company.");
    }
  };

  const createOrUpdateCompany = async (e) => {
    e?.preventDefault?.();
    if (!newCompanyName.trim()) {
      setCreateError("Name is required");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      let logoDataUrl = null;
      if (logoFile) {
        logoDataUrl = await resizeTo200(logoFile);
      }

      if (editingCompany) {
        // update
        const payload = { name: newCompanyName.trim(), address: newCompanyAddress || "", employeeCount: Number(newCompanyEmployees || 0), status: newCompanyStatus || "Not Started" };
        if (logoDataUrl) payload.companyLogo = logoDataUrl;
        const res = await axios.put(`/api/companies/${editingCompany._id}`, payload, {
          headers: { Authorization: `Bearer ${auth?.accessToken}`, "Content-Type": "application/json" },
          withCredentials: true,
        });
        // update local list
        setCompanies((prev) => prev.map((c) => (String(c._id) === String(editingCompany._id) ? (res.data.company || res.data) : c)));
      } else {
        // create
        await axios.post(
          "/api/companies",
          { name: newCompanyName.trim(), address: newCompanyAddress || "", employeeCount: Number(newCompanyEmployees || 0), status: newCompanyStatus || "Not Started", companyLogo: logoDataUrl },
          {
            headers: { Authorization: `Bearer ${auth?.accessToken}`, "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }

      setShowCreateModal(false);
      setEditingCompany(null);
      // refresh list quickly
      const refreshed = await axios.get("/api/companies", {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
        withCredentials: true,
      });
      setCompanies(refreshed.data.companies || []);
    } catch (err) {
      console.error("Create/Update company failed:", err?.response?.data || err);
      setCreateError((err?.response?.data?.message || "Failed to save company").toString());
    } finally {
      setCreating(false);
    }
  };

  // additional modal fields state
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const [newCompanyStatus, setNewCompanyStatus] = useState("Not Started");
  const [newCompanyEmployees, setNewCompanyEmployees] = useState("");

  const filtered = companies.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87M12 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h1 className="text-2xl font-semibold">Clients</h1>
          </div>

          <div className="flex items-end gap-3">
            <div className="relative w-96">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <input
                type="text"
                placeholder="Search clients"
                className="pl-10 pr-3 py-2 w-full rounded border border-input bg-secondary text-secondary-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={openCreate}
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Company
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">Loading companies...</div>
        ) : error ? (
          <div className="py-4 text-red-600">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((company, i) => (
                <div
                  key={company._id || company.id || i}
                  onClick={() => navigate(`/clients/${company._id}`, { state: { company } })}
                  role="button"
                  className="cursor-pointer"
                >
                  <ClientCard
                    id={company._id}
                    name={company.name}
                    email={company.email || ""}
                    program=""
                    location={company.address || ""} // show address in card location row
                    employees={company.employeeCount ?? (company.depts?.length || 0)} // use employeeCount if present
                    color={["bg-blue-600","bg-cyan-500","bg-indigo-600","bg-teal-600"][i % 4]}
                    logo={company.logoUrl || null} // now an image URL instead of data URL
                    onEdit={startEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No clients found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={createOrUpdateCompany} className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{editingCompany ? "Edit Company" : "Create Company"}</h3>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="Acme Corp"
              required
            />
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              value={newCompanyAddress}
              onChange={(e) => setNewCompanyAddress(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="123 Main St, Anytown, USA"
            />
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={newCompanyStatus}
              onChange={(e) => setNewCompanyStatus(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="Not Started">Not Started</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Complete">Complete</option>
            </select>
            <label className="block text-sm font-medium mb-2">Employee Count</label>
            <input
              type="number"
              value={newCompanyEmployees}
              onChange={(e) => setNewCompanyEmployees(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="Number of employees"
              min="0"
            />
            <label className="block text-sm font-medium mb-2">Company Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full p-2 border rounded mb-3"
            />
            {logoFile && (
              <div className="mb-3">
                <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
            {createError && <div className="text-red-600 mb-2">{createError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setShowCreateModal(false); setEditingCompany(null); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-purple-600 text-white rounded">
                {creating ? (editingCompany ? "Saving..." : "Creating...") : (editingCompany ? "Save" : "Create")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}