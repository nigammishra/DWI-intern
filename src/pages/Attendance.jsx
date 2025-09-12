// src/pages/Attendance.jsx
import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

/*
Dependencies:
npm install recharts jspdf
Tailwind CSS must be configured in the project.
*/

const COLORS = {
  present: "#10B981", // green
  absent: "#EF4444", // red
  holiday: "#F59E0B", // yellow
  leave: "#6366F1", // indigo
  pending: "#F97316", // orange
};

const SAMPLE_STUDENTS = [
  { id: 1, name: "Alice Doe", grade: "5th Grade", section: "A" },
  { id: 2, name: "Bob Doe", grade: "8th Grade", section: "B" },
];

// helper: generate mock attendance data for a month
function generateMockMonthAttendance(year, month) {
  // month: 0-11
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const records = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    // randomize statuses for demo
    const rand = Math.random();
    let status = "present";
    if (rand < 0.08) status = "holiday";
    else if (rand < 0.18) status = "absent";
    else if (rand < 0.23) status = "leave";
    records[key] = {
      date: key,
      status,
      remark: status === "absent" ? "Absent: parent's note pending" : "",
      leave: status === "leave" ? { reason: "Medical", status: "Approved" } : null,
    };
  }
  return records;
}

export default function AttendancePage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-11
  const [students] = useState(SAMPLE_STUDENTS);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0].id);
  const [attendanceDB] = useState(() => {
    // keyed by studentId -> year-month -> day records
    const db = {};
    students.forEach((s, i) => {
      const baseMonth = now.getMonth();
      const months = {};
      for (let m = baseMonth - 2; m <= baseMonth + 2; m++) {
        const date = new Date(now.getFullYear(), m);
        const y = date.getFullYear();
        const mm = date.getMonth();
        months[`${y}-${String(mm + 1).padStart(2, "0")}`] = generateMockMonthAttendance(y, mm);
      }
      db[s.id] = months;
    });
    return db;
  });

  const [filterTerm, setFilterTerm] = useState("Term 1");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: "", reason: "", file: null });
  const [leaveRequests, setLeaveRequests] = useState([]); // stores submitted leave requests
  const [notifications, setNotifications] = useState([]);
  const [teacherRemarks, setTeacherRemarks] = useState({}); // key: date string -> remark

  // helpers to access attendance
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthRecords = attendanceDB[selectedStudentId]?.[monthKey] ?? {};

  // compute summary
  const summary = useMemo(() => {
    const vals = Object.values(monthRecords);
    const total = vals.length || 0;
    const present = vals.filter((r) => r.status === "present").length;
    const absent = vals.filter((r) => r.status === "absent").length;
    const holiday = vals.filter((r) => r.status === "holiday").length;
    const leave = vals.filter((r) => r.status === "leave").length;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, holiday, leave, percent };
  }, [monthRecords]);

  // low attendance alert (example threshold 75%)
  const lowAttendanceAlert = summary.percent < 75;

  // calendar helpers
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  function prevMonth() {
    const d = new Date(currentYear, currentMonth - 1);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  }
  function nextMonth() {
    const d = new Date(currentYear, currentMonth + 1);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  }

  function handleDayClick(day) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const rec = monthRecords[dateKey];
    const remark = teacherRemarks[dateKey] ?? rec?.remark ?? "";
    alert(`Date: ${dateKey}\nStatus: ${rec?.status ?? "N/A"}\nRemark: ${remark}`);
  }

  function openLeaveModalFor(dateStr) {
    setLeaveForm({ date: dateStr, reason: "", file: null });
    setShowLeaveModal(true);
  }

  function submitLeave() {
    if (!leaveForm.date || !leaveForm.reason) {
      alert("Please provide date and reason.");
      return;
    }
    const req = {
      id: Date.now(),
      studentId: selectedStudentId,
      date: leaveForm.date,
      reason: leaveForm.reason,
      fileName: leaveForm.file ? leaveForm.file.name : null,
      status: "Pending",
      submittedAt: new Date().toISOString(),
    };
    setLeaveRequests((s) => [req, ...s]);
    setNotifications((n) => [`Leave requested for ${req.date} — pending approval`, ...n]);
    setShowLeaveModal(false);
  }

  function downloadPDFSummary() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Attendance Summary", 14, 20);
    doc.autoTable({
      head: [["Student", "Month", "Total", "Present", "Absent", "Leave", "Holiday", "Percent"]],
      body: [
        [
          students.find((s) => s.id === selectedStudentId).name,
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`,
          summary.total,
          summary.present,
          summary.absent,
          summary.leave,
          summary.holiday,
          `${summary.percent}%`,
        ],
      ],
    });
    doc.save("attendance-summary.pdf");
  }

  function exportCSV() {
    const rows = [["Date", "Status", "Remark"]];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const r = monthRecords[key];
      rows.push([key, r?.status ?? "N/A", r?.remark ?? ""]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${monthKey}-${selectedStudentId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // pie chart data
  const pieData = [
    { name: "Present", value: summary.present, color: COLORS.present },
    { name: "Absent", value: summary.absent, color: COLORS.absent },
    { name: "Leave", value: summary.leave, color: COLORS.leave },
    { name: "Holiday", value: summary.holiday, color: COLORS.holiday },
  ].filter((d) => d.value > 0);

  // teacher remark save
  function saveRemarkFor(dateKey, text) {
    setTeacherRemarks((r) => ({ ...r, [dateKey]: text }));
    setNotifications((n) => [`Remark saved for ${dateKey}`, ...n]);
  }

  // multi-child switch
  function changeStudent(id) {
    setSelectedStudentId(id);
    setNotifications((n) => [`Switched to ${students.find((s) => s.id === id).name}`, ...n]);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📅 Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Daily / Monthly attendance, leave requests, reports & exports</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Student switcher */}
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-full px-3 py-1">
            <span className="text-sm text-slate-600">Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => changeStudent(Number(e.target.value))}
              className="bg-transparent outline-none text-sm font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadPDFSummary}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-full text-sm shadow"
          >
            Download PDF
          </button>
          <button
            onClick={exportCSV}
            className="bg-white border border-slate-200 hover:shadow text-sm px-4 py-2 rounded-full"
          >
            Export CSV
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Monthly calendar */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="p-2 rounded-md hover:bg-slate-100">
                ◀
              </button>
              <div>
                <div className="text-lg font-semibold">
                  {new Date(currentYear, currentMonth).toLocaleString(undefined, { month: "long", year: "numeric" })}
                </div>
                <div className="text-xs text-slate-500">Term: {filterTerm}</div>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-md hover:bg-slate-100">
                ▶
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm shadow"
              >
                Request Leave
              </button>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 text-xs text-center text-slate-600 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* blanks before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const rec = monthRecords[key];
              const status = rec?.status ?? "no-data";

              const bg =
                status === "present"
                  ? "bg-green-50 border-green-200"
                  : status === "absent"
                  ? "bg-red-50 border-red-200"
                  : status === "holiday"
                  ? "bg-yellow-50 border-yellow-200"
                  : status === "leave"
                  ? "bg-indigo-50 border-indigo-200"
                  : "bg-white border-slate-100";

              return (
                <div
                  key={key}
                  className={`h-20 rounded-lg p-2 border flex flex-col justify-between cursor-pointer transition hover:shadow ${bg}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-semibold text-slate-700">{day}</div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full text-slate-700">
                      {status === "present" ? "Present" : status === "absent" ? "Absent" : status === "holiday" ? "Holiday" : status === "leave" ? "Leave" : ""}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {/* teacher remark preview */}
                    {teacherRemarks[key] ? (
                      <div className="italic text-emerald-600 truncate">{teacherRemarks[key]}</div>
                    ) : rec?.remark ? (
                      <div className="truncate">{rec.remark}</div>
                    ) : (
                      <div className="text-slate-300">—</div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLeaveModalFor(key);
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-800"
                    >
                      Request Leave
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const note = prompt("Add teacher remark (visible on calendar):", teacherRemarks[key] ?? rec?.remark ?? "");
                        if (note !== null) saveRemarkFor(key, note);
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-800"
                    >
                      Remark
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-white rounded-lg shadow-sm text-sm">
                <div className="text-xs text-slate-500">Working days</div>
                <div className="font-semibold">{summary.total}</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm text-sm">
                <div className="text-xs text-slate-500">Present</div>
                <div className="font-semibold text-emerald-600">{summary.present}</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm text-sm">
                <div className="text-xs text-slate-500">Absent</div>
                <div className="font-semibold text-rose-600">{summary.absent}</div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm text-sm">
                <div className="text-xs text-slate-500">Leave</div>
                <div className="font-semibold text-indigo-600">{summary.leave}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">Attendance %</div>
              <div className="text-xl font-bold">{summary.percent}%</div>
              {lowAttendanceAlert && (
                <div className="text-sm text-amber-600 font-medium">⚠ Low attendance</div>
              )}
            </div>
          </div>
        </section>

        {/* Right column: charts, leave requests, notifications */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Monthly Breakdown</div>
              <div className="text-xs text-slate-500">Visualization</div>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={30} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={`c-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Leave Requests</div>
              <div className="text-xs text-slate-500">{leaveRequests.length} total</div>
            </div>
            <div className="space-y-2 max-h-44 overflow-auto">
              {leaveRequests.length === 0 && <div className="text-sm text-slate-400">No leave requests</div>}
              {leaveRequests.map((lr) => (
                <div key={lr.id} className="p-2 bg-slate-50 rounded-md flex justify-between items-center text-sm">
                  <div>
                    <div className="font-medium">{lr.date}</div>
                    <div className="text-xs text-slate-500">Reason: {lr.reason}</div>
                    <div className="text-xs text-slate-400">Status: {lr.status}</div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(lr.submittedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Notifications</div>
              <div className="text-xs text-slate-500">{notifications.length}</div>
            </div>
            <div className="space-y-2 max-h-44 overflow-auto">
              {notifications.length === 0 && <div className="text-sm text-slate-400">No notifications</div>}
              {notifications.map((n, i) => (
                <div key={i} className="p-2 bg-amber-50 rounded-md text-sm">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Request Leave</h3>
            <label className="block mb-2 text-sm text-slate-600">Date</label>
            <input
              type="date"
              value={leaveForm.date}
              onChange={(e) => setLeaveForm((s) => ({ ...s, date: e.target.value }))}
              className="w-full border px-3 py-2 rounded-md mb-3"
            />
            <label className="block mb-2 text-sm text-slate-600">Reason</label>
            <textarea
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm((s) => ({ ...s, reason: e.target.value }))}
              className="w-full border px-3 py-2 rounded-md mb-3"
              rows={3}
            />
            <label className="block mb-2 text-sm text-slate-600">Attach document (optional)</label>
            <input
              type="file"
              onChange={(e) => setLeaveForm((s) => ({ ...s, file: e.target.files?.[0] ?? null }))}
              className="w-full mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowLeaveModal(false)} className="px-4 py-2 rounded-md border">Cancel</button>
              <button onClick={submitLeave} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
