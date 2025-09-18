// src/pages/Reports.jsx
import React, { useState } from "react";
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
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CHILDREN = [
  { id: 1, name: "Alice Doe", grade: "5", section: "A" },
  { id: 2, name: "Bob Doe", grade: "8", section: "B" },
];

const SUBJECTS = ["Math", "Science", "English", "History", "Geography"];

const MOCK_REPORTS = {
  1: {
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

  const subjectChartData = termData.subjects.map((s) => ({
    subject: s.subject,
    marks: s.marks,
  }));
  const lineChartData = terms.map((t) => ({
    term: t,
    percent: dataForChild.terms[t].overallPercent,
  }));

  const gradeDistribution = termData.subjects.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(gradeDistribution).map(([name, value], idx) => ({
    name,
    value,
    color: COLORS[idx % COLORS.length],
  }));

  const examBreakdown = termData.examBreakdown || [];
  const attendance = termData.attendance || { totalDays: 0, present: 0, absent: 0 };
  const attendancePercent = attendance.totalDays
    ? Math.round((attendance.present / attendance.totalDays) * 100)
    : 0;

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

  const filteredSubjects = termData.subjects.filter(
    (s) => subjectFilter === "All" || s.subject === subjectFilter
  );
  const sortedByMarks = [...termData.subjects].sort((a, b) => b.marks - a.marks);
  const strongest = sortedByMarks[0];
  const weakest = sortedByMarks[sortedByMarks.length - 1];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Reports</h1>
          <p className="text-sm text-slate-500">
            Academic, attendance, homework & consolidated reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="bg-white rounded-full px-3 py-1 shadow-sm flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-sm text-slate-600">Student</span>
            <select
              value={activeChildId}
              onChange={(e) => setActiveChildId(Number(e.target.value))}
              className="bg-transparent outline-none text-sm flex-1"
            >
              {CHILDREN.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.grade} {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm flex-1 sm:flex-none">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
            >
              {terms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadReportCardPDF}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-full text-sm shadow flex-1 sm:flex-none"
          >
            Download Report Card
          </button>

          <button
            onClick={exportSubjectsCSV}
            className="bg-white border px-3 py-1.5 rounded-full text-sm shadow flex-1 sm:flex-none"
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section */}
        <section className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm text-slate-500">Subject</label>
              <select
                className="border rounded-md px-2 py-1 flex-1 sm:flex-none"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="All">All</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-slate-500">From</label>
              <input
                type="date"
                className="border rounded-md px-2 py-1 flex-1 sm:flex-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <label className="text-sm text-slate-500">To</label>
              <input
                type="date"
                className="border rounded-md px-2 py-1 flex-1 sm:flex-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Subject marks table */}
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold mb-3">
              Subject-wise Marks & Teacher Comments
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] table-auto border-collapse text-sm">
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
                    <tr
                      key={s.subject}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                    >
                      <td className="p-2 border">{s.subject}</td>
                      <td
                        className={`p-2 border font-semibold ${
                          s.marks >= 85
                            ? "text-emerald-600"
                            : s.marks < 70
                            ? "text-rose-600"
                            : ""
                        }`}
                      >
                        {s.marks}
                      </td>
                      <td className="p-2 border">{s.grade}</td>
                      <td className="p-2 border">{s.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <div
                    key={i}
                    className="p-2 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{e.exam} • {e.subject}</div>
                      <div className="text-xs text-slate-500">Marks: {e.marks}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-md text-sm ${
                        e.marks >= 85
                          ? "bg-emerald-100 text-emerald-700"
                          : e.marks < 70
                          ? "bg-rose-100 text-rose-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {e.marks >= 85 ? "Strong" : e.marks < 70 ? "Weak" : "Average"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right: Charts + Attendance + Behavior */}
        <aside className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Performance Over Terms</h3>
            <div className="h-40 sm:h-52">
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

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Subject Comparison</h3>
            <div className="h-40 sm:h-52">
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

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Grade Distribution</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

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

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Strengths & Weaknesses</h3>
            <div className="text-sm">Strongest Subject: <span className="font-semibold text-emerald-600">{strongest.subject} ({strongest.marks})</span></div>
            <div className="text-sm">Weakest Subject: <span className="font-semibold text-rose-600">{weakest.subject} ({weakest.marks})</span></div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <h3 className="text-md font-semibold mb-2">Teacher Behavior Notes</h3>
            {termData.behavior.length === 0 ? (
              <div className="text-sm text-slate-400">No notes available</div>
            ) : (
              <ul className="space-y-2">
                {termData.behavior.map((b, idx) => (
                  <li key={idx} className="p-2 border rounded-md text-sm">
                    <div className="font-medium">{b.date}</div>
                    <div>{b.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
