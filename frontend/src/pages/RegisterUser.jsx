import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// helper: compute BMI from height (cm) and weight (kg)
const computeBMI = (heightCm, weightKg) => {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w || h <= 0) return "";
  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(1)) : "";
};

const RegisterUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    gender: "male",
    dob: "", // ISO date string YYYY-MM-DD
    role: "attendee",
    baselineVitals: {
      height: "",
      weight: "",
      hba1c: "",
      bmi: "",
      bpSystolic: "",
      bpDiastolic: "",
      glucoseMgdl: "",
      rhr: "",
      gripStrengthSec: "",
    },
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // coerce numeric baseline fields to numbers where provided
      const payload = {
        ...form,
        baselineVitals: Object.fromEntries(
          Object.entries(form.baselineVitals).map(([k, v]) => [k, v === "" ? undefined : Number(v)])
        ),
      };
      await axios.post("/api/auth/register", payload, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      setError("Registration failed.");
    }
  };

  // update baselineVitals and auto-calc BMI when height or weight change
  const handleBaselineChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => {
      const next = { ...s.baselineVitals, [name]: value };
      // recalc BMI when height or weight present/changed
      if (name === "height" || name === "weight") {
        const bmi = computeBMI(next.height, next.weight);
        next.bmi = bmi === "" ? "" : bmi;
      }
      return { ...s, baselineVitals: next };
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} placeholder="Full Name" className="w-full p-2 border rounded"/>
        <input required value={form.phoneNumber} onChange={e=>setForm({...form, phoneNumber:e.target.value})} placeholder="Phone Number" className="w-full p-2 border rounded"/>
        <input required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full p-2 border rounded"/>
        <input required value={form.password} onChange={e=>setForm({...form, password:e.target.value})} type="password" placeholder="Password" className="w-full p-2 border rounded"/>
        <select value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})} className="w-full p-2 border rounded">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label className="block text-sm font-medium">Date of birth</label>
        <input
          required
          type="date"
          value={form.dob}
          onChange={(e) => setForm((s) => ({ ...s, dob: e.target.value }))}
          className="w-full p-2 border rounded"
        />

        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full p-2 border rounded">
          <option value="attendee">Attendee</option>
          <option value="trainer">Trainer</option>
          <option value="viewer">Viewer</option>
        </select>

        {/* Baseline vitals - only for attendees */}
        {String(form.role).toLowerCase() === "attendee" && (
          <div className="border p-3 rounded space-y-2">
            <h3 className="font-medium">Baseline Vitals</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600">Height (cm)</label>
                <input name="height" value={form.baselineVitals.height} onChange={handleBaselineChange} type="number" step="0.1" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Weight (kg)</label>
                <input name="weight" value={form.baselineVitals.weight} onChange={handleBaselineChange} type="number" step="0.1" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">HbA1c</label>
                <input name="hba1c" value={form.baselineVitals.hba1c} onChange={handleBaselineChange} type="number" step="0.1" className="w-full p-2 border rounded" />
              </div>
              {/* BMI is auto-calculated from height & weight and not editable */}
              <div>
                <label className="block text-xs text-gray-600">BP Systolic</label>
                <input name="bpSystolic" value={form.baselineVitals.bpSystolic} onChange={handleBaselineChange} type="number" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">BP Diastolic</label>
                <input name="bpDiastolic" value={form.baselineVitals.bpDiastolic} onChange={handleBaselineChange} type="number" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Glucose (mg/dL)</label>
                <input name="glucoseMgdl" value={form.baselineVitals.glucoseMgdl} onChange={handleBaselineChange} type="number" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Resting HR</label>
                <input name="rhr" value={form.baselineVitals.rhr} onChange={handleBaselineChange} type="number" className="w-full p-2 border rounded" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600">Grip Strength (sec)</label>
                <input name="gripStrengthSec" value={form.baselineVitals.gripStrengthSec} onChange={handleBaselineChange} type="number" step="0.1" className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
        )}

        <button className="w-full bg-purple-600 text-white py-2 rounded">Register</button>
        {error && <p className="text-red-500">{error}</p>}
      </form>

     {/* Live summary for verification */}
     <div className="max-w-md mx-auto mt-4 p-4 bg-gray-50 border rounded text-sm">
       <h4 className="font-medium mb-2">Entered Information</h4>
       <div><strong>Name:</strong> {form.fullName || "-"}</div>
       <div><strong>Phone:</strong> {form.phoneNumber || "-"}</div>
       <div><strong>Email:</strong> {form.email || "-"}</div>
       <div><strong>Role:</strong> {form.role}</div>
       <div><strong>DOB:</strong> {form.dob || "-"}</div>
       {String(form.role).toLowerCase() === "attendee" && (
         <>
           <h5 className="mt-2 font-medium">Baseline Vitals</h5>
           <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(form.baselineVitals, null, 2)}</pre>
         </>
       )}
     </div>
    </div>
  );
};

export default RegisterUser;