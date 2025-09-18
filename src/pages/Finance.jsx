import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Wallet, Clock, CreditCard, BarChart3, Download, IndianRupee
} from "lucide-react";

const financeData = [
  { name: "Paid", value: 75000 },
  { name: "Pending", value: 25000 },
];

const COLORS = ["#34d399", "#f87171"];

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-slate-800">
        💰 Finance Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center mb-8 gap-3">
        {["overview", "history", "payments", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold shadow-sm transition-all duration-200 ${
              activeTab === tab
                ? "bg-blue-600 text-white scale-105"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-blue-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fee Structure */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-blue-600" />
              <h2 className="text-xl font-bold">Fee Structure</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex justify-between">
                <span>Tuition Fee</span> <span>₹50,000</span>
              </li>
              <li className="flex justify-between">
                <span>Transport Fee</span> <span>₹15,000</span>
              </li>
              <li className="flex justify-between">
                <span>Activity Fee</span> <span>₹10,000</span>
              </li>
              <li className="flex justify-between font-bold border-t pt-2">
                <span>Total</span> <span>₹75,000</span>
              </li>
            </ul>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-orange-500" />
              <h2 className="text-xl font-bold">Upcoming Payments</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Next installment: <b>₹25,000</b> due on{" "}
              <span className="text-red-500 font-medium">Sep 15, 2025</span>
            </p>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              <CreditCard size={18} /> Pay Now
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="text-green-600" />
            <h2 className="text-xl font-bold">Payment History</h2>
          </div>
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Mode</th>
                <th className="p-3 border">Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="p-3 border">Aug 1, 2025</td>
                <td className="p-3 border">₹25,000</td>
                <td className="p-3 border">UPI</td>
                <td className="p-3 border">
                  <button className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Download size={16} /> Download
                  </button>
                </td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-3 border">Jul 1, 2025</td>
                <td className="p-3 border">₹25,000</td>
                <td className="p-3 border">Card</td>
                <td className="p-3 border">
                  <button className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Download size={16} /> Download
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="text-purple-600" />
            <h2 className="text-xl font-bold">Online Fee Payment</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Use our secure gateway to pay your fees online instantly.
          </p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-indigo-600" />
            <h2 className="text-xl font-bold">Finance Analytics</h2>
          </div>
          <div className="w-full h-72">
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
