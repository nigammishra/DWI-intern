// src/pages/Communication.jsx
import React, { useState, useMemo, useRef } from "react";

/*
Dependencies: Tailwind CSS must be configured.
Usage: import and route this page in your app.
*/

const SAMPLE_CHILDREN = [
  { id: 1, name: "Alice Doe", class: "5A" },
  { id: 2, name: "Bob Doe", class: "8B" },
];

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Sports Day Announcement",
    category: "Sports",
    date: "2025-09-10",
    body: "Inter-school sports day on Sep 25. Bring sports uniform.",
    read: false,
  },
  {
    id: 2,
    title: "Exam Schedule Released",
    category: "Exams",
    date: "2025-09-05",
    body: "Term 1 timetable is published in Exams section.",
    read: false,
  },
  {
    id: 3,
    title: "Holiday: Ganesh Puja",
    category: "Holiday",
    date: "2025-09-12",
    body: "School closed on Sep 19 due to holiday.",
    read: true,
  },
];

const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Parent-Teacher Meeting",
    date: "2025-09-20",
    time: "10:00 AM",
    venue: "Room 201",
    details: "PTM for Class 5A. Please RSVP.",
    rsvp: {},
  },
  {
    id: 2,
    title: "Cultural Evening",
    date: "2025-10-05",
    time: "5:00 PM",
    venue: "Auditorium",
    details: "Open for all families.",
    rsvp: {},
  },
];

const SAMPLE_MESSAGES = [
  {
    id: 1,
    sender: "Teacher John",
    recipientChildId: 1,
    subject: "Math Homework",
    text: "Please check Alice's homework corrections.",
    time: "2025-09-04 09:10",
    attachments: [],
    archived: false,
  },
  {
    id: 2,
    sender: "Admin",
    recipientChildId: 1,
    subject: "Fee Reminder",
    text: "Tuition fee due next week.",
    time: "2025-08-28 08:00",
    attachments: [],
    archived: false,
  },
];

const SAMPLE_CIRCULARS = [
  { id: 1, title: "Transport Policy 2025", date: "2025-07-01", url: "#" },
  { id: 2, title: "Safety Guidelines", date: "2025-06-15", url: "#" },
];

const GROUP_CHANNELS = [
  { id: "class-5a", name: "Class 5A (Parents)", readonly: false },
  {
    id: "announcements",
    name: "School Announcements (Read-only)",
    readonly: true,
  },
];

export default function Communication() {
  const [children] = useState(SAMPLE_CHILDREN);
  const [activeChildId, setActiveChildId] = useState(children[0].id);

  const [announcements, setAnnouncements] = useState(SAMPLE_ANNOUNCEMENTS);
  const [annFilter, setAnnFilter] = useState("All");
  const [annSearch, setAnnSearch] = useState("");

  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [msgSearch, setMsgSearch] = useState("");
  const [msgFilterSender, setMsgFilterSender] = useState("All");

  const [circulars] = useState(SAMPLE_CIRCULARS);

  const [queries, setQueries] = useState([]); // feedback & queries
  const [queryText, setQueryText] = useState("");

  const [notifications, setNotifications] = useState({
    announcements: true,
    messages: true,
    events: true,
  });

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    date: "",
    slot: "",
    topic: "",
  });

  const [selectedChannel, setSelectedChannel] = useState(GROUP_CHANNELS[0].id);
  const [groupMessages, setGroupMessages] = useState({
    "class-5a": [
      {
        id: "g1",
        user: "Parent - Neha",
        text: "Can someone share costume details?",
        time: "09:20",
      },
    ],
    announcements: [
      {
        id: "a1",
        user: "School Admin",
        text: "Reminder: No parking near gate.",
        time: "08:00",
      },
    ],
  });

  const [compose, setCompose] = useState({
    subject: "",
    text: "",
    attachments: [],
  });
  const fileRef = useRef(null);

  // derived lists
  const annCategories = useMemo(
    () => ["All", ...Array.from(new Set(announcements.map((a) => a.category)))],
    [announcements]
  );

  const filteredAnnouncements = announcements.filter((a) => {
    if (annFilter !== "All" && a.category !== annFilter) return false;
    if (
      annSearch &&
      !`${a.title} ${a.body}`.toLowerCase().includes(annSearch.toLowerCase())
    )
      return false;
    return true;
  });

  const filteredMessages = messages.filter((m) => {
    if (m.recipientChildId !== activeChildId) return false;
    if (msgFilterSender !== "All" && m.sender !== msgFilterSender) return false;
    if (
      msgSearch &&
      !`${m.sender} ${m.subject} ${m.text}`
        .toLowerCase()
        .includes(msgSearch.toLowerCase())
    )
      return false;
    return !m.archived;
  });

  // helper actions
  function markAnnouncementRead(id, value = true) {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: value } : a))
    );
  }

  function markAllAnnouncementsRead() {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  function toggleNotification(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleRSVP(eventId, answer) {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, rsvp: { ...ev.rsvp, [activeChildId]: answer } }
          : ev
      )
    );
  }

  function handleAttachFiles(e) {
    const files = Array.from(e.target.files || []);
    setCompose((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        ...files.map((f) => ({ name: f.name, size: f.size })),
      ],
    }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSendMessage() {
    if (!compose.subject && !compose.text)
      return alert("Please write a subject or message.");
    const newMsg = {
      id: Date.now(),
      sender: "You",
      recipientChildId: activeChildId,
      subject: compose.subject || "(No subject)",
      text: compose.text,
      time: new Date().toISOString(),
      attachments: compose.attachments,
      archived: false,
    };
    setMessages((prev) => [newMsg, ...prev]);
    setCompose({ subject: "", text: "", attachments: [] });
  }

  function archiveMessage(id) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, archived: true } : m))
    );
  }

  function handleSubmitQuery() {
    if (!queryText.trim()) return;
    const q = {
      id: Date.now(),
      childId: activeChildId,
      text: queryText,
      status: "Open",
      createdAt: new Date().toISOString(),
    };
    setQueries((prev) => [q, ...prev]);
    setQueryText("");
  }

  // UI
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            💬 Communication
          </h1>
          <p className="text-sm text-slate-500">
            Announcements, messages, events and direct contact with teachers &
            admin
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
            <span className="text-sm text-slate-600">Child</span>
            <select
              className="bg-transparent outline-none"
              value={activeChildId}
              onChange={(e) => setActiveChildId(Number(e.target.value))}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.class}
                </option>
              ))}
            </select>
          </div>

          <button
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 rounded-full shadow"
            onClick={markAllAnnouncementsRead}
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Emergency banner */}
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
        <strong>EMERGENCY ALERT:</strong> Heavy rain expected tomorrow — school
        will update schedule if necessary.
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-semibold">📣 Announcements</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  className="px-2 py-1 border rounded-md text-sm"
                  placeholder="Search..."
                  value={annSearch}
                  onChange={(e) => setAnnSearch(e.target.value)}
                />
                <select
                  className="px-2 py-1 border rounded-md text-sm"
                  value={annFilter}
                  onChange={(e) => setAnnFilter(e.target.value)}
                >
                  {annCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-auto">
              {filteredAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-md border ${
                    a.read ? "bg-slate-50" : "bg-white shadow-sm"
                  }`}
                >
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-slate-600">{a.body}</p>
                  <div className="text-xs text-slate-400">{a.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">📅 Events</h2>
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-md border bg-white flex flex-col sm:flex-row justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-sm text-slate-500">
                      {ev.date} • {ev.time} • {ev.venue}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRSVP(ev.id, "Yes")}
                      className="px-2 py-1 rounded-md bg-emerald-600 text-white text-sm"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleRSVP(ev.id, "No")}
                      className="px-2 py-1 rounded-md bg-rose-500 text-white text-sm"
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circulars */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">📄 Circulars</h2>
            <div className="space-y-2">
              {circulars.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row justify-between p-2 border rounded-md"
                >
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-slate-400">{c.date}</div>
                  </div>
                  <a
                    href={c.url}
                    className="mt-2 sm:mt-0 text-xs px-2 py-1 rounded-md bg-blue-600 text-white text-center"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside className="lg:col-span-2 space-y-6">
          {/* Direct message */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-sm font-semibold mb-2">✉️ Direct Message</h3>
            <input
              className="w-full px-3 py-2 border rounded-md mb-2"
              placeholder="Subject"
              value={compose.subject}
              onChange={(e) =>
                setCompose((prev) => ({ ...prev, subject: e.target.value }))
              }
            />
            <textarea
              className="w-full px-3 py-2 border rounded-md mb-2"
              rows={4}
              placeholder="Write your message..."
              value={compose.text}
              onChange={(e) =>
                setCompose((prev) => ({ ...prev, text: e.target.value }))
              }
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 rounded-full bg-emerald-600 text-white text-sm"
              >
                Send
              </button>
              <button
                onClick={() => setCompose({ subject: "", text: "", attachments: [] })}
                className="px-3 py-2 rounded-full border text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Inbox */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-sm font-semibold mb-2">📥 Inbox</h3>
            <div className="max-h-56 overflow-auto space-y-2">
              {filteredMessages.map((m) => (
                <div key={m.id} className="p-2 border rounded-md bg-white">
                  <div className="text-sm font-medium">{m.subject}</div>
                  <div className="text-xs text-slate-500">{m.sender}</div>
                  <div className="text-sm mt-1 text-slate-700">{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
