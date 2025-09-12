import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Search, Bell, User, LayoutDashboard, BookOpen, ClipboardList,
  CheckCircle, MessageSquare, Wallet, HeartPulse, BarChart3,
  Bus, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // 🔹 Update `isMobile` on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true); // Keep open in desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
              <h1 className="text-lg font-bold">📚 EduDash</h1>
              <button onClick={() => setIsSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    if (isMobile) setIsSidebarOpen(false); // ✅ Close only in mobile
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                      isActive ? "bg-white/20" : "hover:bg-white/10"
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Sidebar Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-3 left-4 bg-indigo-600 text-white p-2 rounded-[10px] shadow-lg z-50"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white shadow-md px-6 py-3 flex items-center justify-end">
          <div className="flex items-center w-full max-w-md bg-gray-100 rounded-full px-4 py-2">
            <Search className="text-gray-500 mr-2" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-200 transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 hover:bg-gray-200 rounded-full p-2 transition"
            >
              <User size={20} />
              <span className="hidden md:block text-sm font-medium">Profile</span>
            </button>
          </div>
        </header>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 w-96 shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">👤 Profile</h2>
              <div className="space-y-3">
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Email:</strong> john@example.com</p>
                <p><strong>Role:</strong> Parent</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowProfile(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
