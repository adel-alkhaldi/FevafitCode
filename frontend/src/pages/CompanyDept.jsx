import React, { useEffect, useState } from "react";
import { useNav } from "../context/NavContext";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ClientCard from "../components/ClientCard";
import DeptCard from "../components/DeptCard";

export default function CompanyDept() {
  const { collapsed } = useNav();
  const navWidth = collapsed ? "4rem" : "14rem";
  // use auth object to read accessToken
  const { auth } = useAuth();
  const accessToken = auth?.accessToken;
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [company, setCompany] = useState(location.state?.company || null);
  const [loading, setLoading] = useState(!company);
  const [error, setError] = useState(null);

  // Create Dept UI state
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);
  const [createDeptError, setCreateDeptError] = useState(null);

  // helper: refetch single company (used after creating a dept)
  const fetchCompanyById = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/companies", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      const found = (res.data.companies || []).find((c) => String(c._id) === String(companyId));
      if (!found) {
        setError("Company not found");
      } else {
        setCompany(found);
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch company:", err);
      setError("Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e?.preventDefault?.();
    if (!newDeptName.trim()) {
      setCreateDeptError("Name is required");
      return;
    }
    setCreatingDept(true);
    setCreateDeptError(null);
    try {
      await axios.post(
        "/api/depts",
        { name: newDeptName.trim(), company: companyId },
        { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, withCredentials: true }
      );
      // close modal and refresh company depts
      setShowCreateDept(false);
      setNewDeptName("");
      await fetchCompanyById();
    } catch (err) {
      console.error("Create dept failed:", err?.response?.data || err);
      setCreateDeptError((err?.response?.data?.message || "Failed to create department").toString());
    } finally {
      setCreatingDept(false);
    }
  };

  // edit dept inline (simple prompt) and refresh company
  const editDept = async (deptId) => {
    const dept = (company.depts || []).find((d) => String(d._id) === String(deptId));
    if (!dept) return alert("Dept not found");
    const newName = prompt("Edit department name", dept.name || "");
    if (newName === null) return; // cancelled
    const trimmed = (newName || "").trim();
    if (!trimmed) return alert("Name is required");
    try {
      await axios.put(
        `/api/depts/${deptId}`,
        { name: trimmed, company: company._id },
        { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, withCredentials: true }
      );
      await fetchCompanyById();
    } catch (err) {
      console.error("Edit dept failed:", err);
      alert("Failed to edit department");
    }
  };

  const deleteDept = async (deptId) => {
    if (!confirm("Delete this department?")) return;
    try {
      await axios.delete(`/api/depts/${deptId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      await fetchCompanyById();
    } catch (err) {
      console.error("Delete dept failed:", err);
      alert("Failed to delete department");
    }
  };

  useEffect(() => {
    if (company) return;
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/companies", {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true,
        });
        const found = (res.data.companies || []).find((c) => String(c._id) === String(companyId));
        if (!found) {
          setError("Company not found");
        } else {
          setCompany(found);
        }
      } catch (err) {
        console.error("Failed to fetch company:", err);
        setError("Failed to load company");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId, company, accessToken]);

  if (loading) return <div style={{ marginLeft: navWidth }}>Loading...</div>;
  if (error) return <div style={{ marginLeft: navWidth }} className="p-6 text-red-600">{error}</div>;
  if (!company) return <div style={{ marginLeft: navWidth }} className="p-6">No company data</div>;

  const depts = company.depts || [];

  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">Back</button>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <div className="text-sm text-muted-foreground ml-3">{(depts.length || 0)} Departments</div>
          </div>
          <div>
            <button
              onClick={() => { setShowCreateDept(true); setNewDeptName(""); setCreateDeptError(null); }}
              className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              Create Dept
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">No departments found for this company.</div>
          ) : (
            depts.map((d, idx) => (
              <div key={d._id || d.id || idx}>
                <DeptCard
                  id={d._id || d.id || idx}
                  name={d.name}
                  color={["bg-blue-600","bg-cyan-500","bg-indigo-600","bg-teal-600"][idx % 4]}
                  onClick={() => navigate(`/sessions?company=${company._id}&dept=${d._id}`)}
                  onEdit={(id) => editDept(id)}
                  onDelete={(id) => deleteDept(id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Dept Modal */}
      {showCreateDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={handleCreateDept} className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Create Department</h3>
            <label className="block text-sm font-medium mb-2">Department Name</label>
            <input
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
              placeholder="Sales"
              required
            />
            {createDeptError && <div className="text-red-600 mb-2">{createDeptError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateDept(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button type="submit" disabled={creatingDept} className="px-4 py-2 bg-purple-600 text-white rounded">
                {creatingDept ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}