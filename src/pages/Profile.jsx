import React, { useState } from "react";

export default function ProfilePage() {
  const [parent, setParent] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@example.com",
    guardianId: "G12345",
    photo: "https://via.placeholder.com/150",
  });

  const [students] = useState([
    {
      id: 1,
      name: "Alice Doe",
      admissionNo: "A1001",
      class: "5th Grade",
      section: "A",
      rollNo: "21",
      photo: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      name: "Bob Doe",
      admissionNo: "A1002",
      class: "3rd Grade",
      section: "B",
      rollNo: "12",
      photo: "https://via.placeholder.com/100",
    },
  ]);

  const [documents] = useState([
    { id: 1, name: "ID Proof", status: "Uploaded" },
    { id: 2, name: "Transfer Certificate", status: "Pending" },
    { id: 3, name: "Health Record", status: "Uploaded" },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Parent & Student Profile</h1>

        {/* Parent Info */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={parent.photo}
            alt="Parent"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
          />
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-semibold">{parent.name}</h2>
            <p className="text-gray-600">📞 {parent.phone}</p>
            <p className="text-gray-600">📧 {parent.email}</p>
            <p className="text-gray-600">🆔 Guardian ID: {parent.guardianId}</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Edit Info
            </button>
          </div>
        </div>

        {/* Linked Students */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Linked Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-gray-600">Admission: {student.admissionNo}</p>
                    <p className="text-gray-600">
                      {student.class} - {student.section}
                    </p>
                    <p className="text-gray-600">Roll No: {student.rollNo}</p>
                  </div>
                </div>
                <button className="mt-3 px-4 py-2 w-full bg-green-600 text-white rounded-lg hover:bg-green-700">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center text-center"
              >
                <h4 className="font-semibold text-lg">{doc.name}</h4>
                <p
                  className={`mt-2 text-sm font-medium ${
                    doc.status === "Uploaded" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {doc.status}
                </p>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Upload
                  </button>
                  <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


