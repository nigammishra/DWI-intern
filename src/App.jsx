// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
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

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-grow p-6 transition-all duration-300 lg:ml-60">
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
    </Router>
  );
}
