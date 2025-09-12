import React, { useState, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Tailwind + React page for Health records (client-side demo)
 * Save this as src/pages/Health.jsx
 */

const SAMPLE_CHILDREN = [
  { id: 1, name: "Alice Doe", grade: "5", section: "A" },
  { id: 2, name: "Bob Doe", grade: "8", section: "B" },
];

// Mock medical records per child
const SAMPLE_HEALTH_DB = {
  1: {
    allergies: ["Peanuts"],
    chronicConditions: ["None"],
    dietary: "Vegetarian (no eggs)",
    vaccinations: [
      { name: "DTP", date: "2024-01-15" },
      { name: "MMR", date: "2023-06-10" },
    ],
    growth: [
      // month label, height (cm), weight (kg)
      { month: "Jan'24", height: 120, weight: 22 },
      { month: "Apr'24", height: 123, weight: 23.5 },
      { month: "Jul'24", height: 125, weight: 24.1 },
      { month: "Oct'24", height: 127, weight: 25.0 },
      { month: "Jan'25", height: 129, weight: 26.2 },
    ],
    nurseNotes: [
      { date: "2024-09-01", note: "Minor cold. Observed for 2 hours." },
      { date: "2024-12-10", note: "Skin rash - applied lotion; parent notified." },
    ],
    medications: [
      { date: "2024-09-01", med: "Paracetamol", dose: "250 mg", reason: "Fever", givenBy: "Nurse Ram" },
    ],
    fitness: [{ program: "Yoga Club", status: "Active", lastParticipated: "2025-02-15" }],
    emergencyContacts: [
      { name: "John Doe (Father)", relation: "Father", phone: "+91 9876543210" },
      { name: "Jane Doe (Mother)", relation: "Mother", phone: "+91 9123456780" },
    ],
    healthAlerts: ["Vaccination due: Tdap on 2025-09-20"],
    medicalHistory: [
      { date: "2023-06-01", title: "Annual Checkup", summary: "All normal" },
      { date: "2024-09-01", title: "Cold", summary: "Observed; home rest advised" },
    ],
  },
  2: {
    allergies: ["None"],
    chronicConditions: ["Asthma"],
    dietary: "Non-vegetarian",
    vaccinations: [{ name: "Polio", date: "2022-05-10" }],
    growth: [
      { month: "Jan'24", height: 140, weight: 38 },
      { month: "Apr'24", height: 142, weight: 39.2 },
      { month: "Jul'24", height: 144, weight: 40.5 },
      { month: "Oct'24", height: 145, weight: 41.3 },
      { month: "Jan'25", height: 147, weight: 42.5 },
    ],
    nurseNotes: [{ date: "2024-10-05", note: "Asthma inhaler required during sports." }],
    medications: [{ date: "2024-10-05", med: "Salbutamol (inhaler)", dose: "2 puffs prn", reason: "Asthma", givenBy: "Nurse Seema" }],
    fitness: [{ program: "Football Team", status: "Active", lastParticipated: "2025-03-12" }],
    emergencyContacts: [{ name: "Michael Doe", relation: "Father", phone: "+91 9988776655" }],
    healthAlerts: [],
    medicalHistory: [{ date: "2024-10-05", title: "Asthma episode", summary: "Inhaler used, parent contacted" }],
  },
};

export default function HealthPage() {
  const [children] = useState(SAMPLE_CHILDREN);
  const [activeChildId, setActiveChildId] = useState(children[0].id);
  const [healthDB, setHealthDB] = useState(SAMPLE_HEALTH_DB);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: "", reason: "", file: null });
  const fileRef = useRef(null);
  const [alerts, setAlerts] = useState([]); // runtime alerts
  const [queryText, setQueryText] = useState("");
  const [queries, setQueries] = useState([]); // feedback & medical queries

  const rec = healthDB[activeChildId];

  // compute BMI for charting
  const growthData = rec.growth.map((g) => {
    const heightM = g.height / 100;
    const bmi = +(g.weight / (heightM * heightM)).toFixed(1);
    return { month: g.month, height: g.height, weight: g.weight, bmi };
  });

  function requestSickLeave() {
    if (!leaveForm.date || !leaveForm.reason) {
      alert("Please provide date and reason.");
      return;
    }
    const newReq = {
      id: Date.now(),
      childId: activeChildId,
      date: leaveForm.date,
      reason: leaveForm.reason,
      fileName: leaveForm.file?.name ?? null,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    // for demo, push a notification and reset
    setAlerts((a) => [{ type: "info", text: `Leave requested for ${leaveForm.date}` }, ...a]);
    setShowLeaveModal(false);
    setLeaveForm({ date: "", reason: "", file: null });
    if (fileRef.current) fileRef.current.value = "";
  }

  function uploadMedicalReport(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAlerts((a) => [{ type: "success", text: `Uploaded ${f.name} (mock)` }, ...a]);
    // In a real app, upload to server and add to child's medicalHistory
  }

  function saveNurseNote(text) {
    if (!text) return;
    const note = { date: new Date().toLocaleDateString(), note: text };
    setHealthDB((db) => {
      const copy = { ...db };
      copy[activeChildId] = { ...copy[activeChildId], nurseNotes: [note, ...copy[activeChildId].nurseNotes] };
      return copy;
    });
    setAlerts((a) => [{ type: "success", text: "Nurse note saved" }, ...a]);
  }

  function addMedication(med) {
    setHealthDB((db) => {
      const copy = { ...db };
      copy[activeChildId] = { ...copy[activeChildId], medications: [med, ...copy[activeChildId].medications] };
      return copy;
    });
    setAlerts((a) => [{ type: "success", text: `Medication ${med.med} recorded` }, ...a]);
  }

  function submitHealthQuery() {
    if (!queryText.trim()) return;
    const q = { id: Date.now(), childId: activeChildId, text: queryText, status: "Open", createdAt: new Date().toISOString() };
    setQueries((s) => [q, ...s]);
    setQueryText("");
    setAlerts((a) => [{ type: "info", text: "Query submitted" }, ...a]);
  }

  function downloadHealthSummaryPDF() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Health Summary - ${children.find((c) => c.id === activeChildId).name}`, 14, 18);
    // Profile table
    const m = healthDB[activeChildId];
    doc.autoTable({
      startY: 28,
      head: [["Field", "Details"]],
      body: [
        ["Allergies", m.allergies.join(", ") || "None"],
        ["Chronic Conditions", m.chronicConditions.join(", ") || "None"],
        ["Dietary", m.dietary || "-"],
        ["Emergency Contact(s)", m.emergencyContacts.map(ec => `${ec.name} (${ec.phone})`).join("; ")],
      ],
    });
    doc.save(`health-summary-${activeChildId}.pdf`);
  }

  // small components
  const StatCard = ({ title, value, className = "" }) => (
    <div className={`bg-white rounded-xl p-4 shadow-sm ${className}`}>
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🩺 Student Health & Medical Records</h1>
          <p className="text-sm text-slate-500 mt-1">Medical history, vaccinations, nurse notes, medications and emergency contacts</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-sm text-slate-600">Child</span>
            <select className="bg-transparent outline-none text-sm" value={activeChildId} onChange={(e) => setActiveChildId(Number(e.target.value))}>
              {children.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.grade}{c.section ? ` ${c.section}` : ""}</option>)}
            </select>
          </div>

          <button onClick={downloadHealthSummaryPDF} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full text-sm shadow">Download Summary</button>
          <button onClick={() => setShowLeaveModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-sm shadow">Request Sick Leave</button>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2 mb-4">
        {rec.healthAlerts && rec.healthAlerts.map((a, i) => (
          <div key={i} className="bg-amber-50 border-l-4 border-amber-400 text-amber-900 p-3 rounded">
            <strong>Alert:</strong> {a}
          </div>
        ))}
        {alerts.map((al, i) => (
          <div key={i} className={`p-2 rounded ${al.type === "success" ? "bg-green-50 text-green-800" : al.type === "info" ? "bg-sky-50 text-sky-800" : "bg-slate-50 text-slate-800"}`}>
            {al.text}
          </div>
        ))}
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left big column: Records & charts */}
        <section className="lg:col-span-2 space-y-6">
          {/* top stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Allergies" value={rec.allergies.length ? rec.allergies.join(", ") : "None"} />
            <StatCard title="Chronic Conditions" value={rec.chronicConditions.length ? rec.chronicConditions.join(", ") : "None"} />
            <StatCard title="Dietary" value={rec.dietary || "—"} />
          </div>

          {/* Vaccination & records */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">💉 Vaccinations & Immunizations</h2>
              <div className="text-sm text-slate-500">{rec.vaccinations.length} records</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rec.vaccinations.map((v, i) => (
                <div key={i} className="p-3 border rounded-md bg-slate-50">
                  <div className="font-medium">{v.name}</div>
                  <div className="text-xs text-slate-500">Date: {v.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">📈 Growth Chart (Height & Weight)</h2>
              <div className="text-sm text-slate-500">Latest: {rec.growth[rec.growth.length - 1].height} cm, {rec.growth[rec.growth.length - 1].weight} kg</div>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" label={{ value: 'cm', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'kg', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="height" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Nurse / Doctor Notes */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">🩺 Nurse / Doctor Notes</h2>
              <div className="text-sm text-slate-500">{rec.nurseNotes.length} entries</div>
            </div>
            <div className="space-y-3">
              {rec.nurseNotes.map((n, idx) => (
                <div key={idx} className="p-3 border rounded-md">
                  <div className="text-xs text-slate-400">{n.date}</div>
                  <div className="mt-1">{n.note}</div>
                </div>
              ))}
            </div>

            {/* quick add note (for demo) */}
            <div className="mt-4 flex gap-2">
              <input placeholder="Add quick nurse note..." className="flex-1 px-3 py-2 border rounded-md" id="quickNote" />
              <button onClick={() => { const v = document.getElementById("quickNote").value; if (v) { saveNurseNote(v); document.getElementById("quickNote").value = ""; } }} className="px-3 py-2 rounded-md bg-emerald-600 text-white">Save</button>
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">💊 Medications Administered</h2>
              <div className="text-sm text-slate-500">{rec.medications.length} records</div>
            </div>
            <div className="space-y-3">
              {rec.medications.map((m, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <div className="text-sm font-medium">{m.med} • {m.dose}</div>
                  <div className="text-xs text-slate-500">Date: {m.date} • Given by: {m.givenBy}</div>
                  <div className="text-sm mt-1">Reason: {m.reason}</div>
                </div>
              ))}
            </div>

            {/* quick add med (demo) */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input placeholder="Medication name" className="px-3 py-2 border rounded-md" id="medName" />
              <input placeholder="Dose" className="px-3 py-2 border rounded-md" id="medDose" />
              <button onClick={() => {
                const med = document.getElementById("medName").value;
                const dose = document.getElementById("medDose").value;
                if (med && dose) {
                  addMedication({ date: new Date().toLocaleDateString(), med, dose, reason: "Recorded by parent (demo)", givenBy: "Parent (demo)" });
                  document.getElementById("medName").value = ""; document.getElementById("medDose").value = "";
                }
              }} className="px-3 py-2 rounded-md bg-indigo-600 text-white">Add</button>
            </div>
          </div>
        </section>

        {/* Right column: contacts, leave, fitness, queries */}
        <aside className="space-y-4">
          {/* Emergency Contacts */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">📞 Emergency Contacts</h3>
            <div className="space-y-2">
              {rec.emergencyContacts.map((ec, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div>
                    <div className="font-medium">{ec.name}</div>
                    <div className="text-xs text-slate-500">{ec.relation}</div>
                  </div>
                  <a href={`tel:${ec.phone}`} className="px-3 py-2 bg-rose-600 text-white rounded-md text-sm">Call</a>
                </div>
              ))}
            </div>
          </div>

          {/* Sick Leave & Upload */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">📝 Sick Leave & Reports</h3>
            <div className="text-sm text-slate-500 mb-2">Upload doctor's note or request a sick leave</div>
            <input ref={fileRef} type="file" onChange={uploadMedicalReport} className="mb-2" />
            <div className="flex gap-2">
              <button onClick={() => setShowLeaveModal(true)} className="px-3 py-2 rounded-md bg-rose-600 text-white text-sm">Request Leave</button>
              <button onClick={() => alert('View uploaded reports (mock)')} className="px-3 py-2 rounded-md border text-sm">View Reports</button>
            </div>
          </div>

          {/* Fitness & Wellness */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">🏃 Fitness & Wellness</h3>
            <div className="space-y-2">
              {rec.fitness.map((f, i) => (
                <div key={i} className="p-2 border rounded-md">
                  <div className="font-medium">{f.program}</div>
                  <div className="text-xs text-slate-500">Status: {f.status} • Last: {f.lastParticipated}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Queries / Feedback */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-2">❓ Health Queries</h3>
            <textarea value={queryText} onChange={(e) => setQueryText(e.target.value)} rows={3} placeholder="Ask nurse / doctor..." className="w-full px-3 py-2 border rounded-md mb-2"></textarea>
            <div className="flex gap-2">
              <button onClick={submitHealthQuery} className="px-3 py-2 rounded-md bg-sky-600 text-white text-sm">Submit</button>
              <button onClick={() => { setQueryText(""); }} className="px-3 py-2 rounded-md border text-sm">Clear</button>
            </div>
            <div className="mt-3 max-h-40 overflow-auto space-y-2">
              {queries.length === 0 && <div className="text-sm text-slate-400">No queries</div>}
              {queries.map(q => (
                <div key={q.id} className="p-2 border rounded-md">
                  <div className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleString()}</div>
                  <div>{q.text}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-3">Request Sick Leave</h3>
            <label className="text-sm text-slate-500">Date</label>
            <input type="date" value={leaveForm.date} onChange={(e) => setLeaveForm(s => ({ ...s, date: e.target.value }))} className="w-full px-3 py-2 border rounded-md mb-3" />
            <label className="text-sm text-slate-500">Reason</label>
            <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm(s => ({ ...s, reason: e.target.value }))} rows={3} className="w-full px-3 py-2 border rounded-md mb-3"></textarea>
            <label className="text-sm text-slate-500">Attach doctor's note (optional)</label>
            <input ref={fileRef} type="file" onChange={(e) => setLeaveForm(s => ({ ...s, file: e.target.files?.[0] ?? null }))} className="w-full mb-4" />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={requestSickLeave} className="px-4 py-2 rounded-md bg-rose-600 text-white">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
