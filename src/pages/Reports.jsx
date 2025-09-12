// src/pages/Reports.jsx
import React, { useState, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Reports Page (Tailwind CSS)
 * - Multi-child switcher
 * - Term / date-range filters
 * - Academic tables + charts
 * - Exam-wise breakdown
 * - Attendance summary & chart
 * - Homework & behavior sections
 * - PDF export for report card
 *
 * Note: Replace mockData with real API integration when ready.
 */

const CHILDREN = [
  { id: 1, name: "Alice Doe", grade: "5", section: "A" },
  { id: 2, name: "Bob Doe", grade: "8", section: "B" },
];

const SUBJECTS = ["Math", "Science", "English", "History", "Geography"];

const MOCK_REPORTS = {
  1: {
    // term-wise: Term1, Term2, Final
    terms: {
      "Term 1": {
        overallPercent: 82,
        subjects: [
          { subject: "Math", marks: 85, grade: "A", comment: "Strong in algebra" },
          { subject: "Science", marks: 78, grade: "B+", comment: "Needs lab practice" },
          { subject: "English", marks: 88, grade: "A", comment: "Good comprehension" },
          { subject: "History", marks: 76, grade: "B", comment: "Revise dates" },
          { subject: "Geography", marks: 83, grade: "A-", comment: "Good maps work" },
        ],
        examBreakdown: [
          { exam: "Midterm", subject: "Math", marks: 84 },
          { exam: "Midterm", subject: "Science", marks: 76 },
          // ...
        ],
        attendance: { totalDays: 22, present: 20, absent: 2 },
        homework: [
          { subject: "Math", title: "Ch 4 worksheet", status: "Completed", teacherComment: "Well done" },
          { subject: "Science", title: "Lab report", status: "Pending", teacherComment: "Submit soon" },
        ],
        behavior: [{ date: "2025-07-10", note: "Participated actively in class." }],
      },
      "Term 2": {
        overallPercent: 85,
        subjects: [
          { subject: "Math", marks: 88, grade: "A", comment: "Great improvement" },
          { subject: "Science", marks: 80, grade: "A-", comment: "Better in experiments" },
          { subject: "English", marks: 90, grade: "A+", comment: "Excellent" },
          { subject: "History", marks: 79, grade: "B+", comment: "Improved" },
          { subject: "Geography", marks: 84, grade: "A-", comment: "Good" },
        ],
        examBreakdown: [],
        attendance: { totalDays: 23, present: 21, absent: 2 },
        homework: [],
        behavior: [{ date: "2025-11-01", note: "Needs to submit assignments timely." }],
      },
    },
  },
  2: {
    terms: {
      "Term 1": {
        overallPercent: 72,
        subjects: [
          { subject: "Math", marks: 70, grade: "C", comment: "Work on basics" },
          { subject: "Science", marks: 68, grade: "C+", comment: "Needs attention" },
          { subject: "English", marks: 75, grade: "B", comment: "Improving" },
          { subject: "History", marks: 74, grade: "B", comment: "Good understanding" },
          { subject: "Geography", marks: 78, grade: "B+", comment: "Good" },
        ],
        examBreakdown: [],
        attendance: { totalDays: 22, present: 19, absent: 3 },
        homework: [],
        behavior: [{ date: "2025-07-15", note: "Late for class twice." }],
      },
    },
  },
};

const COLORS = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA"];

export default function ReportsPage() {
  const [activeChildId, setActiveChildId] = useState(CHILDREN[0].id);
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const dataForChild = MOCK_REPORTS[activeChildId];

  const terms = Object.keys(dataForChild.terms);
  const termData = dataForChild.terms[selectedTerm];

  // analytics data
  const subjectChartData = termData.subjects.map((s) => ({ subject: s.subject, marks: s.marks }));
  const lineChartData = terms.map((t) => {
    const td = dataForChild.terms[t];
    const avg = td.overallPercent;
    return { term: t, percent: avg };
  });

  const gradeDistribution = termData.subjects.reduce((acc, s) => {
    const g = s.grade;
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(gradeDistribution).map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }));

  const examBreakdown = termData.examBreakdown || [];

  const attendance = termData.attendance || { totalDays: 0, present: 0, absent: 0 };
  const attendancePercent = attendance.totalDays ? Math.round((attendance.present / attendance.totalDays) * 100) : 0;

  // download PDF report card
  function downloadReportCardPDF() {
    const student = CHILDREN.find((c) => c.id === activeChildId);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(18);
    doc.text(`${student.name} — Report Card (${selectedTerm})`, 40, 60);
    doc.setFontSize(12);
    doc.text(`Grade: ${student.grade}  Section: ${student.section}`, 40, 80);
    doc.autoTable({
      startY: 110,
      head: [["Subject", "Marks", "Grade", "Teacher Comment"]],
      body: termData.subjects.map((s) => [s.subject, s.marks.toString(), s.grade, s.comment]),
      styles: { fontSize: 10 },
    });
    doc.text(`Overall Percentage: ${termData.overallPercent}%`, 40, doc.lastAutoTable.finalY + 30);
    doc.save(`report-${student.name.replace(/\s+/g, "_")}-${selectedTerm}.pdf`);
  }

  // export CSV for subject marks
  function exportSubjectsCSV() {
    const rows = [["Subject", "Marks", "Grade", "Comment"]];
    termData.subjects.forEach((s) => rows.push([s.subject, s.marks, s.grade, s.comment]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subjects-${activeChildId}-${selectedTerm}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // filtered subjects (subject filter)
  const filteredSubjects = termData.subjects.filter((s) => subjectFilter === "All" || s.subject === subjectFilter);

  // highlight strong/weak: top and bottom subjects
  const sortedByMarks = [...termData.subjects].sort((a, b) => b.marks - a.marks);
  const strongest = sortedByMarks[0];
  const weakest = sortedByMarks[sortedByMarks.length - 1];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Reports</h1>
          <p className="text-sm text-slate-500">Academic, attendance, homework & consolidated reports</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full px-3 py-1 shadow-sm flex items-center gap-2">
            <span className="text-sm text-slate-600">Student</span>
            <select value={activeChildId} onChange={(e) => setActiveChildId(Number(e.target.value))} className="bg-transparent outline-none text-sm">
              {CHILDREN.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.grade}{c.section ? ` ${c.section}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm">
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="bg-transparent outline-none text-sm">
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button onClick={downloadReportCardPDF} className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-full text-sm shadow">
            Download Report Card
          </button>

          <button onClick={exportSubjectsCSV} className="bg-white border px-3 py-1.5 rounded-full text-sm shadow">
            Export CSV
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subject table + controls (col-span 2 on large screens) */}
        <section className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-500">Subject</label>
              <select className="border rounded-md px-2 py-1" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="All">All</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">From</label>
              <input type="date" className="border rounded-md px-2 py-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <label className="text-sm text-slate-500">To</label>
              <input type="date" className="border rounded-md px-2 py-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Subject marks table */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Subject-wise Marks & Teacher Comments</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Marks</th>
                    <th className="p-2 border">Grade</th>
                    <th className="p-2 border">Teacher Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((s, idx) => (
                    <tr key={s.subject} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <td className="p-2 border">{s.subject}</td>
                      <td className={`p-2 border font-semibold ${s.marks >= 85 ? "text-emerald-600" : s.marks < 70 ? "text-rose-600" : ""}`}>{s.marks}</td>
                      <td className="p-2 border">{s.grade}</td>
                      <td className="p-2 border">{s.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-slate-600">Overall: <span className="font-semibold">{termData.overallPercent}%</span></div>
              <div className="flex gap-2">
                <button onClick={() => alert("Print (mock)")} className="px-3 py-1.5 rounded-full border text-sm">Print</button>
                <button onClick={() => alert("Share via email (mock)")} className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-sm">Share</button>
              </div>
            </div>
          </div>

          {/* Exam-wise breakdown */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Exam-wise Breakdown</h2>
            {examBreakdown.length === 0 ? (
              <div className="text-sm text-slate-400">No exam breakdown available for this term.</div>
            ) : (
              <div className="space-y-2">
                {examBreakdown.map((e, i) => (
                  <div key={i} className="p-2 border rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{e.exam} • {e.subject}</div>
                      <div className="text-xs text-slate-500">Marks: {e.marks}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-md text-sm ${e.marks >= 85 ? "bg-emerald-100 text-emerald-700" : e.marks < 70 ? "bg-rose-100 text-rose-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {e.marks >= 85 ? "Strong" : e.marks < 70 ? "Weak" : "Average"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm text-slate-600">
              <strong>Strongest subject:</strong> {strongest.subject} • <strong>Weakest subject:</strong> {weakest.subject}
            </div>
          </div>

          {/* Homework & assignments */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Homework & Assignments</h2>
            {termData.homework.length === 0 ? (
              <div className="text-sm text-slate-400">No homework records</div>
            ) : (
              <div className="space-y-2">
                {termData.homework.map((h, i) => (
                  <div key={i} className="p-2 border rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium">{h.title} • <span className="text-sm text-slate-500">{h.subject}</span></div>
                      <div className="text-xs text-slate-500">{h.teacherComment}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${h.status === "Completed" ? "bg-emerald-100 text-emerald-700" : h.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"}`}>
                      {h.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right: Analytics & Attendance summary */}
        <aside className="space-y-6">
          {/* Performance over terms (line) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Performance Over Terms</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject comparison (bar) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Subject Comparison</h3>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grade distribution (pie) */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Grade Distribution</h3>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={60} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-slate-600">Grades count in this term</div>
          </div>

          {/* Attendance summary */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Attendance Summary</h3>
            <div className="text-sm mb-2">Total Days: <span className="font-semibold">{attendance.totalDays}</span></div>
            <div className="text-sm mb-2">Present: <span className="font-semibold text-emerald-600">{attendance.present}</span></div>
            <div className="text-sm mb-2">Absent: <span className="font-semibold text-rose-600">{attendance.absent}</span></div>
            <div className="mt-3">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-emerald-500" style={{ width: `${attendancePercent}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{attendancePercent}% attendance</div>
            </div>
          </div>

          {/* Behavior & discipline */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Behavior & Discipline</h3>
            {termData.behavior.length === 0 ? (
              <div className="text-sm text-slate-400">No records</div>
            ) : (
              <div className="space-y-2 text-sm">
                {termData.behavior.map((b, i) => (
                  <div key={i} className="p-2 border rounded-md">
                    <div className="text-xs text-slate-400">{b.date}</div>
                    <div>{b.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Bottom consolidated / share */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-slate-600">Consolidated report combines academics, attendance & homework for quick sharing.</div>
        <div className="flex gap-2">
          <button onClick={() => alert("Share via email (mock)")} className="px-3 py-1.5 rounded-full border text-sm">Share</button>
          <button onClick={() => alert("Save to cloud (mock)")} className="px-3 py-1.5 rounded-full bg-sky-600 text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
