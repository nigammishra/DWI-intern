import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import L from "leaflet";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ExamsPage() {
  const [filter, setFilter] = useState("");

  const upcomingExams = [
    { id: 1, subject: "Math", date: "2025-09-10", time: "10:00 AM", venue: "Room 101" },
    { id: 2, subject: "Science", date: "2025-09-12", time: "12:00 PM", venue: "Room 102" },
  ];

  const pastResults = [
    { subject: "Math", marks: 85, grade: "A", feedback: "Excellent performance" },
    { subject: "Science", marks: 70, grade: "B", feedback: "Needs improvement" },
    { subject: "English", marks: 90, grade: "A+", feedback: "Outstanding vocabulary" },
  ];

  const performanceData = [
    { subject: "Math", marks: 85 },
    { subject: "Science", marks: 70 },
    { subject: "English", marks: 90 },
  ];

  const notifications = [
    "Science exam rescheduled to Sep 12, 12:00 PM",
    "New admit cards uploaded for Term 1",
    "Reminder: Math exam tomorrow at 10:00 AM",
  ];

  const questionPapers = ["Math Term 1 - 2024.pdf", "Science Practice Questions.pdf"];

  const guidelines = [
    "Arrive 30 minutes early.",
    "Bring your admit card and ID proof.",
    "No electronic devices allowed.",
  ];

  const examCenter = { lat: 20.2961, lng: 85.8245 };

  const handleDownloadAdmitCard = () => {
    const doc = new jsPDF();
    doc.text("Admit Card", 20, 20);
    doc.autoTable({
      head: [["Name", "Roll Number", "Exam Center"]],
      body: [["John Doe", "R12345", "Room 101, School Campus"]],
    });
    doc.save("admit-card.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6  rounded-lg  ">
      <h2 className="text-2xl sm:text-3xl font-bold    mb-6">
        📘 Exams & Performance
      </h2>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📅 Upcoming Exams</h3>
        <input
          type="text"
          placeholder="Search by subject or date..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full mb-4 px-3 py-2 text-sm border rounded-lg focus:ring focus:ring-blue-300"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm md:text-base table-auto border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 sm:p-3 border">Subject</th>
                <th className="p-2 sm:p-3 border">Date</th>
                <th className="p-2 sm:p-3 border">Time</th>
                <th className="p-2 sm:p-3 border">Venue</th>
              </tr>
            </thead>
            <tbody>
              {upcomingExams
                .filter(
                  (exam) =>
                    exam.subject.toLowerCase().includes(filter.toLowerCase()) || exam.date.includes(filter)
                )
                .map((exam) => (
                  <tr key={exam.id} className="text-center hover:bg-blue-50">
                    <td className="p-2 sm:p-3 border">{exam.subject}</td>
                    <td className="p-2 sm:p-3 border">{exam.date}</td>
                    <td className="p-2 sm:p-3 border">{exam.time}</td>
                    <td className="p-2 sm:p-3 border">{exam.venue}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={handleDownloadAdmitCard}
          className="mt-4 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Download Admit Card
        </button>
      </div>

      {/* Past Results */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📄 Past Exam Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm md:text-base table-auto border-collapse">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-2 sm:p-3 border">Subject</th>
                <th className="p-2 sm:p-3 border">Marks</th>
                <th className="p-2 sm:p-3 border">Grade</th>
                <th className="p-2 sm:p-3 border">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {pastResults.map((res, i) => (
                <tr key={i} className="text-center hover:bg-green-50">
                  <td className="p-2 sm:p-3 border">{res.subject}</td>
                  <td className="p-2 sm:p-3 border">{res.marks}</td>
                  <td className="p-2 sm:p-3 border">{res.grade}</td>
                  <td className="p-2 sm:p-3 border">{res.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📊 Performance Analytics</h3>
        <div className="w-full h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="marks" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 mb-4">🔔 Notifications</h3>
        <ul className="space-y-3 text-sm sm:text-base">
          {notifications.map((note, i) => (
            <li
              key={i}
              className="bg-yellow-50 p-3 rounded-lg shadow-sm hover:bg-yellow-100 transition"
            >
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Question Papers */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📚 Question Papers</h3>
        <ul className="space-y-3 text-sm sm:text-base">
          {questionPapers.map((qp, i) => (
            <li
              key={i}
              className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
            >
              {qp}
            </li>
          ))}
        </ul>
      </div>

      {/* Guidelines */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📜 Exam Guidelines</h3>
        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
          {guidelines.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </div>

      {/* Exam Center */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mb-6 hover:shadow-xl transition">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">📍 Exam Center</h3>
        <div className="rounded-xl overflow-hidden border-2 border-blue-500 h-64 sm:h-80">
          <MapContainer center={[examCenter.lat, examCenter.lng]} zoom={15} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[examCenter.lat, examCenter.lng]}>
              <Popup>Exam Center Location</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Calendar Sync */}
      <div className="text-center">
        <button className="bg-cyan-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-cyan-700 transition text-sm sm:text-base">
          Sync with Google Calendar
        </button>
      </div>
    </div>
  );
}
