import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavContext";
import { useLocation, useNavigate } from "react-router-dom";
import MultiSelectSearch from "../components/MultiSelectSearch";
import Pagination from "../components/Pagination";
import SearchSelect from "../components/SearchSelect";

const Sessions = () => {
  const { auth, loading } = useAuth();
  const { collapsed } = useNav();
  const navWidth = collapsed ? "4rem" : "14rem";
  const location = useLocation();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  // companies & depts options for multi-select
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [deptsOptions, setDeptsOptions] = useState([]);
  // trainers list and selection
  const [trainersOptions, setTrainersOptions] = useState([]);
  const [trainerSelected, setTrainerSelected] = useState(null);

  // selected arrays for the form
  const [companiesSelected, setCompaniesSelected] = useState([]);
  const [deptsSelected, setDeptsSelected] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null); // session being edited
  const [form, setForm] = useState({
    location: "",
    date: "",
    notes: "",
    sessionCode: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // search state (new)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // debounce search to avoid rapid requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      setError(null);
      try {
        // read company & dept from query params (if present)
        const params = new URLSearchParams(location.search);
        const company = params.get("company");
        const dept = params.get("dept");

        const axiosConfig = {
          headers: { Authorization: `Bearer ${auth?.accessToken}` },
          withCredentials: true,
          params: {}, // populate below
        };

        if (company) axiosConfig.params.company = company;
        if (dept) axiosConfig.params.dept = dept;
        if (debouncedSearch) axiosConfig.params.q = debouncedSearch;
        axiosConfig.params.page = page; // keep pagination

        const res = await axios.get("/api/sessions", axiosConfig);
        setSessions(res.data.sessions || res.data || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        // Graceful fallback if GET is not implemented server-side
        if (err?.response?.status === 404) {
          setSessions([]);
        } else {
          console.error("Failed to fetch sessions:", err);
          setError("Failed to load sessions.");
        }
      } finally {
        setLoadingSessions(false);
      }
    };

    if (!loading && auth?.accessToken && ["admin", "trainer"].includes((auth.role || "").toLowerCase())) {
      fetchSessions();
    } else {
      setLoadingSessions(false);
    }
  }, [auth, loading, location.search, page, debouncedSearch]);

  // lazy load companies/depts/coaches only when opening the modal
  const fetchMeta = async () => {
    if (!auth?.accessToken) return;
    // avoid refetch if already loaded
    if ((companiesOptions || []).length > 0 && (deptsOptions || []).length > 0 && (trainersOptions || []).length > 0) return;
    try {
      const [cRes, dRes, uRes] = await Promise.all([
        axios.get("/api/companies", { headers: { Authorization: `Bearer ${auth.accessToken}` }, withCredentials: true }),
        axios.get("/api/depts", { headers: { Authorization: `Bearer ${auth.accessToken}` }, withCredentials: true }),
        // request trainers from dedicated endpoint; fall back to /api/users if needed
        axios.get("/api/users/trainers", { headers: { Authorization: `Bearer ${auth.accessToken}` }, withCredentials: true }).catch(() => axios.get("/api/users", { headers: { Authorization: `Bearer ${auth.accessToken}` }, withCredentials: true })),
      ]);
      const companies = (cRes.data.companies || []).map((c) => ({ _id: c._id, name: c.name }));
      const depts = (dRes.data.depts || []).map((d) => ({
        _id: d._id,
        name: d.name,
        company: d.company ? (d.company._id ? String(d.company._id) : String(d.company)) : null,
      }));
      setCompaniesOptions(companies);
      setDeptsOptions(depts);
      // normalize trainer response: endpoint returns { trainers } but fallback may return { users } or array
      const users = uRes.data?.trainers || uRes.data?.users || uRes.data || [];
      const trainers = (Array.isArray(users) ? users : []).filter((u) => (u.role || "").toLowerCase() === "trainer").map((u) => ({ _id: u._id, name: u.fullName || u.email || u._id }));
      setTrainersOptions(trainers);
    } catch (err) {
      console.error("Failed to load companies/depts/coaches:", err);
    }
  };

  const openCreate = () => {
    setForm({ location: "", date: "", notes: "", sessionCode: "" });
    setEditing(null);
    setCompaniesSelected([]);
    setDeptsSelected([]);
    setTrainerSelected(null);
    // load options lazily, then show modal
    fetchMeta().finally(() => setShowCreate(true));
  };

  const openEdit = (session) => {
    setEditing(session);
    setForm({
      location: session.location || "",
      date: session.date ? new Date(session.date).toISOString().slice(0, 16) : "",
      notes: session.notes || "",
      sessionCode: session.sessionCode || "",
    });
    // prefill selected arrays (session may contain populated companies/depts)
    setCompaniesSelected((session.companies || []).map((c) => (typeof c === "string" || typeof c === "number" ? c : c._id)));
    setDeptsSelected((session.depts || []).map((d) => (typeof d === "string" || typeof d === "number" ? d : d._id)));
    // prefill trainer selection - session.trainer may be id or populated object
    setTrainerSelected(session.trainer ? (typeof session.trainer === "string" || typeof session.trainer === "number" ? session.trainer : session.trainer._id) : null);
    // ensure options are loaded before opening edit modal
    fetchMeta().finally(() => setShowCreate(true));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSubmitting(true);
    try {
      const payload = { ...form, companies: companiesSelected, depts: deptsSelected, trainer: trainerSelected };
      if (editing) {
        const res = await axios.put(`/api/sessions/${editing._id}`, payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          withCredentials: true,
        });
        setSessions((prev) => prev.map((s) => (s._id === editing._id ? res.data.session || res.data : s)));
      } else {
        const res = await axios.post("/api/sessions", payload, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          withCredentials: true,
        });
        // push created session if returned
        const created = res.data.session || res.data;
        setSessions((prev) => [created, ...prev]);
      }
      setShowCreate(false);
      setEditing(null);
      // refresh the page so attendances/related data reflect the new session
      window.location.reload();
    } catch (err) {
      console.error("Save session failed:", err);
      setError("Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id) => setPendingDeleteId(id);

  const performDelete = async (id) => {
    setSubmitting(true);
    try {
      await axios.delete(`/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        withCredentials: true,
      });
      setSessions((prev) => prev.filter((s) => s._id !== id));
      setPendingDeleteId(null);
      // refresh to ensure related lists (attendance etc.) update
      window.location.reload();
    } catch (err) {
      console.error("Delete session failed:", err);
      setError("Failed to delete session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ marginLeft: navWidth }}>Loading...</div>;
  if (!auth || !["admin", "trainer"].includes((auth.role || "").toLowerCase())) return <div style={{ marginLeft: navWidth }} className="p-6">Unauthorized</div>;

  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Sessions</h2>

          <div className="flex items-center gap-3">
            {/* Search bar (left of New Session) */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="11" cy="11" r="6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></circle>
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions"
                className="pl-10 pr-3 py-2 w-64 rounded border border-input bg-secondary text-secondary-foreground"
              />
            </div>

            <button onClick={openCreate} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">New Session</button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white rounded shadow overflow-hidden border border-gray-100">
          <table className="w-full table-auto">
            <thead className="bg-purple-50">
              <tr>
                <th className="p-3 text-left">Session Code</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Trainer</th>
                <th className="p-3 text-left w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingSessions ? (
                <tr><td colSpan={6} className="p-4">Loading sessions...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No sessions found.</td></tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/sessions/${s._id}/participants`)}>
                    <td className="p-3">{s.sessionCode || "-"}</td>
                    <td className="p-3">{s.date ? new Date(s.date).toLocaleString() : "-"}</td>
                    <td className="p-3">{s.location || "-"}</td>
                    <td className="p-3">{s.trainer?.fullName || s.trainer || "-"}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(s); }} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(s._id); }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create / Edit modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center overflow-auto bg-black/40">
            {/* make modal body constrained to viewport height and scrollable when needed */}
            <form onSubmit={handleSave} className="bg-white p-6 rounded shadow max-w-lg w-full max-h-[80vh] overflow-auto">
               <h3 className="text-lg font-bold mb-4">{editing ? "Edit Session" : "Create Session"}</h3>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>

                {/* Companies multi-select */}
                <div>
                  <label className="block text-sm font-medium mb-1">Companies</label>
                  <MultiSelectSearch
                    options={companiesOptions}
                    selected={companiesSelected}
                    onChange={setCompaniesSelected}
                    placeholder="Search & select companies"
                  />
                </div>

                {/* Trainer select */}
                <div>
                  <label className="block text-sm font-medium mb-1">Trainer</label>
                  <SearchSelect
                    options={trainersOptions}
                    value={trainerSelected}
                    onChange={setTrainerSelected}
                    placeholder="Search & select trainer"
                  />
                </div>

                {/* Depts multi-select */}
                <div>
                  <label className="block text-sm font-medium mb-1">Departments</label>
                  {companiesSelected.length === 0 ? (
                    <div className="min-h-[44px] w-full bg-gray-50 border border-gray-200 rounded px-2 py-2 text-sm text-gray-500 flex items-center">
                      Select companies first to choose departments
                    </div>
                  ) : (
                    <MultiSelectSearch
                      options={deptsOptions.filter((d) => d.company && companiesSelected.some((c) => String(c) === String(d.company)))}
                      selected={deptsSelected}
                      onChange={setDeptsSelected}
                      placeholder="Search & select departments"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Session Code</label>
                  <input name="sessionCode" value={form.sessionCode} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input name="date" value={form.date} onChange={handleChange} type="datetime-local" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full p-2 border rounded" rows={3} />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowCreate(false); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-purple-600 text-white rounded">
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete confirmation */}
        {pendingDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 text-center text-red-700">Delete session?</h3>
              <div className="flex justify-between">
                <button onClick={() => performDelete(pendingDeleteId)} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
                <button onClick={() => setPendingDeleteId(null)} className="bg-gray-600 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default Sessions;