import React from "react";

export default function AcademicsPage() {
  const student = {
    name: "Alice Doe",
    class: "5th Grade",
    section: "A",
    rollNo: "21",
    term: "Term 2 - 2025",
  };

  const subjects = [
    { name: "Mathematics", teacher: "Mr. Sharma", marks: 88, grade: "A" },
    { name: "Science", teacher: "Ms. Roy", marks: 92, grade: "A+" },
    { name: "English", teacher: "Mrs. Patel", marks: 75, grade: "B" },
    { name: "History", teacher: "Mr. Das", marks: 65, grade: "C" },
  ];

  const exams = [
    { subject: "Math", date: "2025-09-10", time: "10:00 AM", status: "Upcoming" },
    { subject: "Science", date: "2025-09-12", time: "11:00 AM", status: "Upcoming" },
    { subject: "English", date: "2025-08-15", time: "09:00 AM", status: "Completed", marks: 75 },
  ];

  const resources = [
    { subject: "Math", name: "Worksheet 1" },
    { subject: "Science", name: "Chapter 3 Notes" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Academic Dashboard</h1>

        {/* Student Overview */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{student.name}</h2>
            <p>Class: {student.class} | Section: {student.section} | Roll No: {student.rollNo}</p>
            <p>Term: {student.term}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Switch Student
          </button>
        </div>

        {/* Subjects & Marks */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Marks & Grades</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Subject</th>
                  <th className="border px-4 py-2">Teacher</th>
                  <th className="border px-4 py-2">Marks</th>
                  <th className="border px-4 py-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{sub.name}</td>
                    <td className="border px-4 py-2">{sub.teacher}</td>
                    <td className="border px-4 py-2">{sub.marks}</td>
                    <td className="border px-4 py-2">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress Reports */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Progress Reports</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-48 bg-gray-100 rounded flex items-center justify-center">
              📊 Bar Chart Placeholder
            </div>
            <div className="flex-1 h-48 bg-gray-100 rounded flex items-center justify-center">
              📈 Line Chart Placeholder
            </div>
          </div>
        </div>

        {/* Exam Schedule & Results */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Exam Schedule & Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Subject</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Time</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{exam.subject}</td>
                    <td className="border px-4 py-2">{exam.date}</td>
                    <td className="border px-4 py-2">{exam.time}</td>
                    <td className="border px-4 py-2">{exam.status}</td>
                    <td className="border px-4 py-2">{exam.marks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Homework & Assignments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Homework & Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
                <p>{sub.name} - Pending Homework</p>
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Attendance & Participation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded shadow">
                <p>{sub.name} - Attendance: 90% | Participation: 85%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Interaction */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Teacher Interaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
                <p>{sub.teacher} ({sub.name})</p>
                <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Downloadable Resources */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Downloadable Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded shadow flex justify-between items-center">
                <p>{res.subject} - {res.name}</p>
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Notifications & Alerts</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Low performance in History.</li>
            <li>Upcoming Math Test on 2025-09-10.</li>
            <li>Science assignment deadline approaching.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
