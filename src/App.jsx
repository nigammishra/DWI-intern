// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CheckCircle,
  MessageSquare,
  Wallet,
  HeartPulse,
  BarChart3,
  Bus,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Academics from "./pages/Academics";
import Exams from "./pages/Exams";
import Finance from "./pages/Finance";
import Health from "./pages/Health";
import Reports from "./pages/Reports";
import Transport from "./pages/Transport";
import Attendance from "./pages/Attendance";
import Communication from "./pages/Communication";

const navItems = [
  { name: "Profile", path: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Academics", path: "/academics", icon: <BookOpen size={20} /> },
  { name: "Exams", path: "/exams", icon: <ClipboardList size={20} /> },
  { name: "Attendance", path: "/attendance", icon: <CheckCircle size={20} /> },
  { name: "Communication", path: "/communication", icon: <MessageSquare size={20} /> },
  { name: "Finance", path: "/finance", icon: <Wallet size={20} /> },
  { name: "Health", path: "/health", icon: <HeartPulse size={20} /> },
  { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
  { name: "Transport", path: "/transport", icon: <Bus size={20} /> },
];

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-900 to-indigo-700 text-white flex flex-col shadow-lg transform transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static`}
        >
          {/* Logo */}
          <div className="p-6 text-2xl font-bold tracking-wide border-b border-indigo-600">
            🏫 SchoolMate
          </div>

          {/* Navigation */}
          <ul className="flex-1 px-3 py-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 text-indigo-100 hover:bg-indigo-500/40 hover:text-white"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div className="p-4 border-t border-indigo-600">
            <button className="flex items-center gap-2 text-red-300 hover:text-red-400 w-full px-3 py-2 rounded-lg transition-colors">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-white shadow flex items-center justify-between px-6">
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700 hover:text-indigo-600"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              Parent Dashboard
            </h1>

            <div className="flex items-center gap-6">
              <button className="relative">
                <Bell size={22} className="text-gray-600 hover:text-indigo-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <UserCircle
                size={28}
                className="text-gray-700 cursor-pointer hover:text-indigo-600"
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/communication" element={<Communication />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/health" element={<Health />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/transport" element={<Transport />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}
