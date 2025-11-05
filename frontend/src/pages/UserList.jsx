import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useNav } from "../context/NavContext";
import Pagination from "../components/Pagination";

// helper: calculate age from dob string or Date
const calcAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

const UserList = () => {
  const { auth, setAuth, loading } = useAuth();
  const { collapsed } = useNav();
  const navWidth = collapsed ? "4rem" : "14rem";

  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState(null); // id pending deletion (shows modal)
  const [editingUser, setEditingUser] = useState(null);
  // menu state for the per-row "More" menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);

  // edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "",
    dob: "",
    gender: "",
  });

  // when opening edit modal populate dob instead of age
  useEffect(() => {
    if (!editingUser) return;
    setEditForm((s) => ({
      ...s,
      fullName: editingUser.fullName || "",
      email: editingUser.email || "",
      role: editingUser.role || "",
      dob: editingUser.dob ? (new Date(editingUser.dob).toISOString().slice(0,10)) : "",
      gender: editingUser.gender || "",
    }));
  }, [editingUser]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.accessToken) return;
      try {
        const res = await axios.get(`/api/users?page=${page}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          withCredentials: true,
        });
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
        setError(null);
      } catch (err) {
        console.error("Fetch users error:", err?.response?.data || err);
        setError("Failed to load users.");
      }
    };

    if (auth?.accessToken && (auth.role || "").toLowerCase() === "admin") {
      fetchUsers();
    }
  }, [auth, page]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((s) => ({ ...s, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await axios.put(`/api/users/${editingUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        withCredentials: true,
      });
      setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? { ...u, ...editForm } : u)));
      setEditingUser(null);
      // refresh page to reflect changes across lists/related pages
      window.location.reload();
    } catch (err) {
      console.error("Update failed:", err?.response?.data || err);
      setError("Failed to update user.");
    }
  };

  const performDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        withCredentials: true,
      });

      const selfId = auth.user?.id || auth.user?._id;
      if (selfId === id) {
        // deleting self: logout and redirect
        await axios.post("/api/auth/logout", {}, { withCredentials: true });
        setAuth(null);
        navigate("/login", { replace: true });
        return;
      }

      setUsers((prev) => prev.filter((u) => u._id !== id));
      setOpenMenuId(null);
      setMenuPos(null);
      // refresh page to show changes (clients/depts/attendances referencing users may update)
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err?.response?.data || err);
      setError("Failed to delete user.");
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (loading) return <div style={{ marginLeft: navWidth }}>Loading...</div>;
  if (!auth || (auth.role || "").toLowerCase() !== "admin") return <Navigate to="/login" />;

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      age: user.age || "",
      gender: user.gender || "",
      role: user.role || "",
      employedCompany: user.employedCompany || "",
      companyDept: user.companyDept || "",
    });
    setError(null);
  };

  // toggle the fixed-position menu used by each row
  const toggleMenu = (e, id) => {
    e?.stopPropagation?.();
    // compute a fixed position for the menu near the clicked button
    const btn = e.currentTarget;
    if (btn && typeof btn.getBoundingClientRect === "function") {
      const r = btn.getBoundingClientRect();
      setMenuPos({ top: Math.round(r.bottom + window.scrollY + 6), left: Math.round(r.left + window.scrollX) });
    } else {
      setMenuPos(null);
    }
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  // render user row: compute age from dob
  return (
    <div style={{ marginLeft: navWidth, transition: "margin-left 200ms ease" }} className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">User List</h2>
          <div>
            <button
              onClick={() => navigate("/register")}
              className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-800"
            >
              Register
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}

        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
          <table className="w-full table-auto">
            <thead className="bg-purple-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Age</th>
                <th className="p-3 text-left w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No users found.</td>
                </tr>
              )}
              {users.map((user) => {
                const isSelf = (auth.user?.id === user._id) || (auth.user?._id === user._id);
                const initials = user.fullName
                  ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
                  : (user.email || "").slice(0,2).toUpperCase();
                const age = calcAge(user.dob);
                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-medium text-purple-800">
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium">{user.fullName || "-"}</div>
                        <div className="text-xs text-gray-500">{user.gender || ""} {user.age ? `• ${user.age}` : ""}</div>
                      </div>
                    </td>
                    <td className="p-3">{user.email || "-"}</td>
                    <td className="p-3">{user.role || "-"}</td>
                    <td className="p-3">{user.phoneNumber || "-"}</td>
                    <td className="p-3">{user.employedCompany || user.companyDept || "-"}</td>
                    <td className="p-3">{age !== null ? `${age}` : "-"}</td>
                    <td className="p-3">
                      <div className="relative">
                        <button
                          onClick={(e) => toggleMenu(e, user._id)}
                          aria-haspopup="true"
                          aria-expanded={openMenuId === user._id}
                          className="p-1 rounded hover:bg-gray-100"
                          title="More"
                          data-menu-id
                        >
                          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="5" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="12" cy="19" r="2"></circle>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Confirm modal for deletions */}
        {pendingDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded shadow max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4 text-center text-red-700">
                {pendingDeleteId === (auth.user?.id || auth.user?._id)
                  ? "This will delete your account and log you out"
                  : "This will delete the selected user"}
              </h3>
              <div className="flex justify-between">
                <button
                  onClick={() => performDelete(pendingDeleteId)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Proceed
                </button>
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded shadow max-w-lg w-full">
              <h3 className="text-lg font-bold mb-4">Edit User</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input name="fullName" value={editForm.fullName} onChange={handleEditChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input name="email" value={editForm.email} onChange={handleEditChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input name="role" value={editForm.role} onChange={handleEditChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date of birth</label>
                  <input name="dob" type="date" value={editForm.dob} onChange={handleEditChange} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full p-2 border rounded">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fixed-position menu rendered on top of table */}
        {openMenuId && menuPos && (
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, width: 144 }}
            className="z-50 bg-white border border-gray-200 rounded shadow"
          >
            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
              onClick={() => {
                const user = users.find((u) => u._id === openMenuId);
                if (user) {
                  openEditModal(user);
                }
                setOpenMenuId(null);
                setMenuPos(null);
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
              onClick={() => {
                setPendingDeleteId(openMenuId);
                setOpenMenuId(null);
                setMenuPos(null);
              }}
            >
              Delete
            </button>

            <button
              type="button"
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
              onClick={() => {
                setOpenMenuId(null);
                setMenuPos(null);
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;