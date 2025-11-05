import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import SearchSelect from "../components/SearchSelect";

// helper to calculate age from dob
const calcAge = (dob) => {
  if (!dob) return "-";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

// add missing cn helper (classNames)
const cn = (...args) => args.filter(Boolean).join(" ");

// renamed ParticipantsTable -> AttendeeTable
const AttendeeTable = ({ participantsData }) => {
   const navigate = useNavigate();
 
   return (
     <div className="bg-card border border-border rounded-lg overflow-hidden">
       <div className="overflow-x-auto">
         <table className="w-full">
           <thead className="bg-muted/50 border-b border-border">
             <tr>
-              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee ID</th>
-              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">EID</th>
-              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee Name</th>
-              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date of birth</th>
-              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Age</th>
+              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
+              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date of birth</th>
+              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Age</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">BP (Before)</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">BP (After)</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">HbA1c</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">BMI</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {participantsData.map((participant, index) => (
               <tr key={index} className="hover:bg-muted/30 transition-colors">
-                <td className="px-4 py-3 text-sm font-medium text-foreground">{participant.id}</td>
-                <td className="px-4 py-3 text-sm text-muted-foreground">{participant.eid}</td>
-                <td className="px-4 py-3">
-                  <div className="flex items-center gap-2">
-                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
-                      {participant.name.substring(0, 2).toUpperCase()}
-                    </div>
-                    <div>
-                      <p className="text-sm font-medium text-foreground">{participant.name}</p>
-                      <p className="text-xs text-muted-foreground">{participant.empNumber}</p>
-                    </div>
-                  </div>
-                </td>
-                <td className="px-4 py-3 text-sm text-foreground">{participant.dob}</td>
-                <td className="px-4 py-3 text-sm text-foreground">{calcAge(participant.dob)}</td>
+                <td className="px-4 py-3">
+                  <div className="flex items-center gap-2">
+                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
+                      {String(participant.name || "").substring(0, 2).toUpperCase()}
+                    </div>
+                    <div>
+                      <p className="text-sm font-medium text-foreground">{participant.name}</p>
+                    </div>
+                  </div>
+                </td>
+                <td className="px-4 py-3 text-sm text-foreground">{participant.dob}</td>
+                <td className="px-4 py-3 text-sm text-foreground">{calcAge(participant.dob)}</td>
                 <td
                   className={cn(
                     "px-4 py-3 text-sm font-medium",
                     participant.changeType === "negative" ? "text-warning" : "text-foreground"
                   )}
                 >
                   {participant.bpBefore}
                 </td>
                 <td className="px-4 py-3 text-sm text-foreground">{participant.bpAfter}</td>
                 <td className="px-4 py-3 text-sm text-foreground">{participant.hba1c}</td>
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-2">
                     <span className="text-sm text-foreground">{participant.bmi}</span>
                     <span
                       className={cn(
                         "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                         participant.changeType === "positive"
                           ? "bg-success/10 text-success"
                           : "bg-warning/10 text-warning"
                       )}
                     >
                       {participant.changeType === "positive" ? "▲" : "▼"}
                       {participant.change}%
                     </span>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <button className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2" onClick={() => navigate(-1)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Previous
        </button>

        <div className="flex items-center gap-1">
          {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
            <button
              key={index}
              className={cn(
                "min-w-[2rem] h-8 px-2 text-sm font-medium rounded-lg transition-colors",
                page === 1 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )}
              disabled={page === "..."}
            >
              {page}
            </button>
          ))}
        </div>

        <button className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-2">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

const SessionDetails = ({ session }) => {
  if (!session) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Session Details</h2>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Session Code</p>
          <p className="text-sm font-medium text-foreground">{session.sessionCode || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Date</p>
          <p className="text-sm font-medium text-foreground">{session.date ? new Date(session.date).toLocaleString() : "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Location</p>
          <p className="text-sm font-medium text-foreground">{session.location || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Trainer</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {session.trainer?.fullName ? session.trainer.fullName.substring(0,1).toUpperCase() : "T"}
            </div>
            <p className="text-sm font-medium text-foreground">{session.trainer?.fullName || session.trainer || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SessionParticipants() {
  const { sessionId } = useParams();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // add attendance modal state & attendee list
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendeeOptions, setAttendeeOptions] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
     // default unchecked: user must explicitly choose Yes to enable inputs
     hasAttended: false,
      weight: "",
      hba1c: "",
      sessionFeeling: 5, // 1..10
      bpSystolic_Pre: "",
      bpDiastolic_Pre: "",
      bpSystolic_After: "",
      bpDiastolic_After: "",
    });
   const [adding, setAdding] = useState(false);
   const [addError, setAddError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;
    const fetchAttendances = async () => {
      setLoading(true);
      setError(null);
      if (!auth?.accessToken) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`/api/attendance/session/${sessionId}?page=${page}`, {
           headers: { Authorization: `Bearer ${auth.accessToken}` },
           withCredentials: true,
         });
        const attendances = res.data.attendances || res.data || [];
        setTotalPages(res.data.totalPages || 1);
 
         // derive session from first attendance if populated
         if (attendances.length > 0 && attendances[0].session_ID) {
           // If the session.trainer is just an _id (string) try to fetch the user so we can display fullName.
           let s = attendances[0].session_ID;
           try {
             const trainerId = s?.trainer?._id || s?.trainer;
             if (trainerId && typeof trainerId === "string") {
               const tRes = await axios.get(`/api/users/${trainerId}`, {
                 headers: { Authorization: `Bearer ${auth.accessToken}` },
                 withCredentials: true,
               });
               // normalize response (endpoint may return { user } or direct user object)
               const trainerObj = tRes.data?.user || tRes.data;
               if (trainerObj) s.trainer = trainerObj;
             }
           } catch (err) {
             // non-fatal: if we can't fetch trainer details just leave whatever is present
             console.warn("Could not fetch trainer details:", err);
           }
           setSession(s);
         }

         // map attendances -> participantsData shape
         const pdata = attendances.map((a) => {
           const p = a.participant_ID || {};
           const vitals = a.attendenceVitals || {};
           const bpBefore = (vitals.bpSystolic_Pre ? `${vitals.bpSystolic_Pre}/${vitals.bpDiastolic_Pre || ""}` : "-");
           const bpAfter = (vitals.bpSystolic_After ? `${vitals.bpSystolic_After}/${vitals.bpDiastolic_After || ""}` : "-");
           const bmi = vitals.bmi ?? "-";
           const change = 0;
           const changeType = "positive";
           return {
             id: p._id,
             eid: p.empNumber || p.employeeId || p._id,
             name: p.fullName || p.email || "Unknown",
             empNumber: p.empNumber || p.employeeId || "-",
             dob: p.dob || "-",
             age: p.age || "-",
             bpBefore,
             bpAfter,
             hba1c: vitals.hba1c ?? "-",
             bmi,
             change,
             changeType,
           };
         });

         setParticipants(pdata);
       } catch (err) {
         console.error("Failed to fetch attendances:", err);
         setError("Failed to load participants.");
       } finally {
         setLoading(false);
       }
     };
    fetchAttendances();
  }, [sessionId, auth, page]);

  // fetch attendee list (pre-existing users with role attendee)
  const fetchAttendees = async () => {
    if (!auth?.accessToken) return;
    try {
      // try endpoints in order and normalize the response shape
      const tryGet = (url) =>
        axios.get(url, { headers: { Authorization: `Bearer ${auth.accessToken}` }, withCredentials: true });

      let res = null;
      try {
        // request many items to avoid pagination issues
        res = await tryGet("/api/users?role=attendee&limit=1000");
      } catch (e1) {
        try {
          res = await tryGet("/api/users/attendees");
        } catch (e2) {
          // final fallback to generic users endpoint
          res = await tryGet("/api/users");
        }
      }

      // normalize response: support { docs }, { users }, { attendees }, or direct array
      const raw =
        (res && (res.data?.docs || res.data?.users || res.data?.attendees || res.data)) || [];
      const usersArr = Array.isArray(raw) ? raw : [];

      // filter to role attendee just in case
      const attendeesOnly = usersArr.filter((u) => String(u?.role || "").toLowerCase() === "attendee");

      const opts = attendeesOnly.map((u) => ({
        _id: u._id,
        name: `${u.phoneNumber || "no-phone"} - ${u.fullName || u.email || u._id}`,
      }));

      if (opts.length === 0) {
        console.warn("fetchAttendees: no attendees found", { attemptedCount: usersArr.length });
        setAddError("No attendees available to select.");
      } else {
        setAddError(null);
      }
      setAttendeeOptions(opts);
    } catch (err) {
      console.error("Failed to load attendees:", err);
      setAddError("Failed to load attendees (check permissions).");
    }
  };
  const openAddModal = () => {
    setAddError(null);
    setSelectedAttendee(null);
    setAttendanceForm({
      // default unchecked: user must explicitly choose Yes to enable inputs
      hasAttended: false,
      weight: "",
      hba1c: "",
      sessionFeeling: 5,
      bpSystolic_Pre: "",
      bpDiastolic_Pre: "",
      bpSystolic_After: "",
      bpDiastolic_After: "",
    });
    fetchAttendees().finally(() => setShowAddModal(true));
  };
  const handleAttendanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAttendanceForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };
  const submitAttendance = async (e) => {
     e?.preventDefault?.();
     if (!selectedAttendee) {
       setAddError("Select an attendee (phone - name).");
       return;
     }
     setAdding(true);
     setAddError(null);
     try {
       const payload = {
         participant_ID: selectedAttendee,
         session_ID: sessionId,
         hasAttended: !!attendanceForm.hasAttended,
         sessionFeeling: attendanceForm.sessionFeeling ? parseFloat(attendanceForm.sessionFeeling) : undefined,
         attendenceVitals: {
           weight: attendanceForm.weight ? Number(attendanceForm.weight) : undefined,
           hba1c: attendanceForm.hba1c ? Number(attendanceForm.hba1c) : undefined,
           bpSystolic_Pre: attendanceForm.bpSystolic_Pre ? Number(attendanceForm.bpSystolic_Pre) : undefined,
           bpDiastolic_Pre: attendanceForm.bpDiastolic_Pre ? Number(attendanceForm.bpDiastolic_Pre) : undefined,
           bpSystolic_After: attendanceForm.bpSystolic_After ? Number(attendanceForm.bpSystolic_After) : undefined,
           bpDiastolic_After: attendanceForm.bpDiastolic_After ? Number(attendanceForm.bpDiastolic_After) : undefined,
         },
       };
       await axios.post("/api/attendance", payload, {
         headers: { Authorization: `Bearer ${auth.accessToken}` },
         withCredentials: true,
       });
       setShowAddModal(false);
       // refresh to show new attendance
       window.location.reload();
     } catch (err) {
       console.error("Create attendance failed:", err);
       setAddError("Failed to create attendance.");
     } finally {
       setAdding(false);
     }
   };

  return (
     <div className="min-h-screen p-6" style={{ marginLeft: "14rem", transition: "margin-left 200ms ease" }}>
       <div className="max-w-6xl mx-auto">
         <div className="flex items-center justify-between mb-6">
           <h1 className="text-2xl font-semibold">Session's Attendance</h1>
           <button
             type="button"
             onClick={() => openAddModal()}
             className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded hover:bg-primary/90"
           >
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 5v14M5 12h14" />
             </svg>
             Add Attendance
           </button>
         </div>

         {session && <SessionDetails session={session} />}

         {loading ? (
           <div className="p-6">Loading...</div>
         ) : error ? (
           <div className="p-6 text-red-600">{error}</div>
         ) : (
           <>
             <AttendeeTable participantsData={participants} />
             <div className="mt-4">
               <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
             </div>
           </>
         )}
       </div>

       {/* Add Attendance Modal */}
       {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center overflow-auto bg-black/40">
           <form onSubmit={submitAttendance} className="bg-white p-6 rounded shadow max-w-lg w-full max-h-[85vh] overflow-auto">
             <h3 className="text-lg font-bold mb-4">Add Attendance</h3>
             <div className="grid grid-cols-1 gap-3">
               <div>
                 <label className="block text-sm font-medium mb-1">Select Attendee (phone - name)</label>
                 <SearchSelect
                   options={attendeeOptions}
                   value={selectedAttendee}
                   onChange={setSelectedAttendee}
                   placeholder="Search by phone or name"
                 />
               </div>

               {/* Has Attended (Yes / No) placed at top after attendee selector.
                   When 'No' inputs remain disabled. */}
               <div>
                 <label className="block text-sm font-medium mb-1">Has Attended?</label>
                 <div className="flex items-center gap-2">
                   <button
                     type="button"
                     onClick={() => setAttendanceForm((s) => ({ ...s, hasAttended: true }))}
                     className={`px-3 py-1 rounded-md border transition-colors ${attendanceForm.hasAttended ? "bg-primary text-white border-primary" : "bg-gray-100 hover:bg-gray-200"}`}
                   >
                     Yes
                   </button>
                   <button
                     type="button"
                     onClick={() => setAttendanceForm((s) => ({ ...s, hasAttended: false }))}
                     className={`px-3 py-1 rounded-md border transition-colors ${!attendanceForm.hasAttended ? "bg-gray-200 text-gray-800 border-transparent" : "bg-white hover:bg-gray-50"}`}
                   >
                     No
                   </button>
                 </div>
               </div>

               {/* moved Session Feeling directly after attendee selector; disabled until hasAttended === true */}
               <div>
                 <label className="block text-sm font-medium mb-1">How are you feeling today?</label>
                 <div className="flex items-center gap-2">
                   {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                     const selected = Number(attendanceForm.sessionFeeling) === n;
                     return (
                       <button
                         key={n}
                         type="button"
                         aria-pressed={selected}
                         onClick={() => attendanceForm.hasAttended && setAttendanceForm((s) => ({ ...s, sessionFeeling: n }))}
                         disabled={!attendanceForm.hasAttended}
                         className={`w-9 h-9 flex items-center justify-center rounded-md border transition-colors ${attendanceForm.hasAttended ? (selected ? "bg-primary text-white border-primary" : "bg-gray-100 text-gray-700 hover:bg-gray-200") : "bg-gray-50 text-gray-300 cursor-not-allowed"}`}
                       >
                         {n}
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* attendance code is auto-generated by the server */}

               <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                     <input name="weight" value={attendanceForm.weight} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">HbA1c</label>
                     <input name="hba1c" value={attendanceForm.hba1c} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                 </div>

                 {/* Systolic row: Before / After */}
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-sm font-medium mb-1">BP Systolic (Before)</label>
                     <input name="bpSystolic_Pre" value={attendanceForm.bpSystolic_Pre} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">BP Systolic (After)</label>
                     <input name="bpSystolic_After" value={attendanceForm.bpSystolic_After} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                 </div>

                 {/* Diastolic row: Before / After */}
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-sm font-medium mb-1">BP Diastolic (Before)</label>
                     <input name="bpDiastolic_Pre" value={attendanceForm.bpDiastolic_Pre} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-1">BP Diastolic (After)</label>
                     <input name="bpDiastolic_After" value={attendanceForm.bpDiastolic_After} onChange={handleAttendanceChange} className="w-full p-2 border rounded" disabled={!attendanceForm.hasAttended} />
                   </div>
                 </div>

                 {addError && <div className="text-red-600">{addError}</div>}
               </div>

               <div className="flex justify-end gap-2 mt-4">
                 <button type="button" onClick={() => { setShowAddModal(false); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                 <button type="submit" disabled={adding || !selectedAttendee} className={`px-4 py-2 ${selectedAttendee ? "bg-primary text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"} rounded`}>
                   {adding ? "Adding..." : "Add Attendance"}
                 </button>
               </div>
             </div>{/* close grid (grid-cols-1) */}
           </form>
         </div>
       )}
     </div>
   );
 }