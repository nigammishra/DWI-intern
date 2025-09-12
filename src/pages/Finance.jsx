import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const financeData = [
  { name: "Paid", value: 75000 },
  { name: "Pending", value: 25000 },
];

const COLORS = ["#34d399", "#f87171"];

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">💰 Finance Dashboard</h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        {["overview", "history", "payments", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 mx-2 rounded-lg font-semibold transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Fee Structure</h2>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Tuition Fee</span><span>₹50,000</span></li>
              <li className="flex justify-between"><span>Transport Fee</span><span>₹15,000</span></li>
              <li className="flex justify-between"><span>Activity Fee</span><span>₹10,000</span></li>
              <li className="flex justify-between font-bold"><span>Total</span><span>₹75,000</span></li>
            </ul>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Upcoming Payments</h2>
            <p className="text-gray-600 mb-2">Next installment: ₹25,000 due on Sep 15, 2025</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Mode</th>
                <th className="p-2 border">Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">Aug 1, 2025</td>
                <td className="p-2 border">₹25,000</td>
                <td className="p-2 border">UPI</td>
                <td className="p-2 border">
                  <button className="text-blue-600 underline">Download</button>
                </td>
              </tr>
              <tr>
                <td className="p-2 border">Jul 1, 2025</td>
                <td className="p-2 border">₹25,000</td>
                <td className="p-2 border">Card</td>
                <td className="p-2 border">
                  <button className="text-blue-600 underline">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {activeTab === "payments" && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Online Fee Payment</h2>
          <p className="text-gray-700 mb-4">Secure payment gateway to pay all fees online.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Finance Analytics</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={financeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {financeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
