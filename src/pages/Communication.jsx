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
    // multi-child separation: optionally if categories or announcements have child-specific tags you could filter by activeChildId
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
    // reset file input
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
    // mock notification
    if (notifications.messages) {
      setTimeout(() => alert("Message sent (mock notification)"), 200);
    }
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

  function scheduleMeeting() {
    if (!meetingForm.date || !meetingForm.slot)
      return alert("Pick date and slot.");
    // mock create
    const meeting = {
      id: Date.now(),
      childId: activeChildId,
      ...meetingForm,
      status: "Requested",
      createdAt: new Date().toISOString(),
    };
    // in real app post to backend
    setShowMeetingModal(false);
    setMeetingForm({ date: "", slot: "", topic: "" });
    setNotifications((prev) => ({ ...prev, events: true }));
    alert("Meeting request submitted (mock).");
  }

  function postToChannel(text) {
    if (!text.trim()) return;
    const ch = selectedChannel;
    const msg = {
      id: Date.now().toString(),
      user: "You",
      text,
      time: new Date().toLocaleTimeString(),
    };
    setGroupMessages((prev) => ({ ...prev, [ch]: [...(prev[ch] || []), msg] }));
  }

  // UI pieces
  return (
    <div className="max-w-7xl mx-auto p-6">
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

        <div className="flex items-center gap-3">
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
            onClick={() => markAllAnnouncementsRead()}
          >
            Mark all read
          </button>

          <div className="bg-white border rounded-full px-3 py-1 flex items-center gap-2 shadow-sm">
            <label className="text-xs text-slate-600 mr-2">Notify</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={notifications.announcements}
                  onChange={() => toggleNotification("announcements")}
                />
                <span>Ann</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={notifications.messages}
                  onChange={() => toggleNotification("messages")}
                />
                <span>Msg</span>
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={notifications.events}
                  onChange={() => toggleNotification("events")}
                />
                <span>Evt</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency banner */}
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
        <strong>EMERGENCY ALERT:</strong> Heavy rain expected tomorrow — school
        will update schedule if necessary.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Announcements & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Announcements card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">📣 Announcements</h2>
                <span className="text-sm text-slate-400">
                  ({announcements.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="px-2 py-1 border rounded-md text-sm"
                  placeholder="Search announcements..."
                  value={annSearch}
                  onChange={(e) => setAnnSearch(e.target.value)}
                />
                <select
                  className="px-2 py-1 border rounded-md text-sm"
                  value={annFilter}
                  onChange={(e) => setAnnFilter(e.target.value)}
                >
                  {annCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-auto">
              {filteredAnnouncements.length === 0 && (
                <div className="text-sm text-slate-400">No announcements</div>
              )}
              {filteredAnnouncements.map((a) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-md border ${
                    a.read ? "bg-slate-50" : "bg-white shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{a.title}</h3>
                        <span className="text-xs text-slate-400">
                          {a.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{a.body}</p>
                      <div className="text-xs text-slate-400 mt-2">
                        {a.date}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => markAnnouncementRead(a.id, !a.read)}
                        className="text-xs px-2 py-1 rounded-md border"
                      >
                        {a.read ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => alert("Download attached PDF (mock)")}
                        className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events card */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">📅 Events</h2>
              <div className="text-sm text-slate-500">
                {events.length} upcoming
              </div>
            </div>

            <div className="space-y-3">
              {events.map((ev) => {
                const r = ev.rsvp?.[activeChildId] ?? "No response";
                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-md border bg-white flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold">{ev.title}</div>
                      <div className="text-sm text-slate-500">
                        {ev.date} • {ev.time} • {ev.venue}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        {ev.details}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-500">
                        RSVP: <span className="font-medium">{r}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRSVP(ev.id, "Yes")}
                          className="px-2 py-1 rounded-md bg-emerald-600 text-white text-sm"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleRSVP(ev.id, "Maybe")}
                          className="px-2 py-1 rounded-md bg-yellow-400 text-sm"
                        >
                          Maybe
                        </button>
                        <button
                          onClick={() => handleRSVP(ev.id, "No")}
                          className="px-2 py-1 rounded-md bg-rose-500 text-white text-sm"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowMeetingModal(true)}
                className="px-3 py-2 rounded-full bg-indigo-600 text-white text-sm"
              >
                Request Meeting
              </button>
              <button
                onClick={() => alert("Add to calendar (mock)")}
                className="px-3 py-2 rounded-full border text-sm"
              >
                Add all to Calendar
              </button>
            </div>
          </div>

          {/* Circulars & Letters */}
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">📄 Circulars & Letters</h2>
              <div className="text-sm text-slate-500">Downloadable PDFs</div>
            </div>
            <div className="space-y-2">
              {circulars.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-white"
                >
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-slate-400">{c.date}</div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={c.url}
                      className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => alert("Share (mock)")}
                      className="text-xs px-2 py-1 rounded-md border"
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Queries */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">
              ❓ Feedback & Queries
            </h2>
            <div className="flex gap-2 mb-3">
              <input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Raise a query or feedback..."
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                onClick={handleSubmitQuery}
                className="px-3 py-2 rounded-md bg-sky-600 text-white"
              >
                Submit
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-auto">
              {queries.length === 0 && (
                <div className="text-sm text-slate-400">No queries yet</div>
              )}
              {queries.map((q) => (
                <div
                  key={q.id}
                  className="p-2 border rounded-md bg-white flex justify-between items-start"
                >
                  <div>
                    <div className="text-sm font-medium">{q.text}</div>
                    <div className="text-xs text-slate-400">
                      Status: <span className="font-semibold">{q.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Messaging, Channels, Notifications */}
        <aside className="space-y-6">
          {/* Compose message */}
          <div className="bg-white rounded-2xl shadow p-4 w-full">
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
            <div className="flex items-center gap-2 mb-2">
              <input
                ref={fileRef}
                type="file"
                onChange={handleAttachFiles}
                className="text-xs"
              />
              <div className="flex gap-2">
                {compose.attachments.map((a, i) => (
                  <div
                    key={i}
                    className="text-xs bg-slate-100 px-2 py-1 rounded"
                  >
                    {a.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                className="px-3 py-2 rounded-full bg-emerald-600 text-white text-sm"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setCompose({ subject: "", text: "", attachments: [] });
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="px-3 py-2 rounded-full border text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Inbox */}
          <div className="bg-white rounded-2xl shadow p-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">📥 Inbox</h3>
              <div className=" items-center gap-2">
                <input
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="px-2 py-1 border rounded-md text-sm"
                />
                <select
                  className="px-2 py-1 border rounded-md text-sm"
                  value={msgFilterSender}
                  onChange={(e) => setMsgFilterSender(e.target.value)}
                >
                  <option>All</option>
                  {[...new Set(messages.map((m) => m.sender))].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="max-h-56 overflow-auto space-y-2">
              {filteredMessages.length === 0 && (
                <div className="text-sm text-slate-400">No messages</div>
              )}
              {filteredMessages.map((m) => (
                <div key={m.id} className="p-2 border rounded-md bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{m.subject}</div>
                      <div className="text-xs text-slate-500">
                        {m.sender} • {new Date(m.time).toLocaleString()}
                      </div>
                      <div className="text-sm mt-1 text-slate-700">
                        {m.text}
                      </div>
                      {m.attachments?.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {m.attachments.map((a, i) => (
                            <div
                              key={i}
                              className="text-xs bg-slate-100 px-2 py-1 rounded"
                            >
                              {a.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="text-xs px-2 py-1 rounded border"
                        onClick={() => archiveMessage(m.id)}
                      >
                        Archive
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                        onClick={() => alert("Reply (mock)")}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="bg-white rounded-2xl shadow p-4 w-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">💬 Channels</h3>
              <div className="text-xs text-slate-400">Group chats</div>
            </div>
            <div className="flex gap-2 mb-3">
              {GROUP_CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedChannel === ch.id
                      ? "bg-sky-600 text-white"
                      : "bg-slate-100"
                  }`}
                >
                  {ch.name}
                </button>
              ))}
            </div>

            <div className="max-h-44 overflow-auto mb-3 space-y-2">
              {(groupMessages[selectedChannel] || []).map((gm) => (
                <div key={gm.id} className="p-2 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500">
                    {gm.user} • {gm.time}
                  </div>
                  <div className="mt-1 text-sm">{gm.text}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                placeholder={
                  GROUP_CHANNELS.find((c) => c.id === selectedChannel).readonly
                    ? "Read-only channel"
                    : "Post a message..."
                }
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                id="channelInput"
              />
              <button
                onClick={() => {
                  const el = document.getElementById("channelInput");
                  if (!el) return;
                  const txt = el.value;
                  if (!txt.trim()) return;
                  if (
                    GROUP_CHANNELS.find((c) => c.id === selectedChannel)
                      .readonly
                  )
                    return alert("This channel is read-only");
                  postToChannel(txt);
                  el.value = "";
                }}
                className="px-3 py-2 rounded-full bg-sky-600 text-white text-sm"
              >
                Post
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Archive & Search bottom */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">🔎 Search & Archive</h3>
            <p className="text-xs text-slate-400">
              Find old announcements, messages and archived items
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search all communications..."
              className="px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => alert("Show archived (mock)")}
              className="px-3 py-2 rounded-full border"
            >
              View Archives
            </button>
          </div>
        </div>
      </div>

      {/* Meeting modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              Request Parent-Teacher Meeting
            </h3>
            <label className="text-xs text-slate-500">Select date</label>
            <input
              type="date"
              value={meetingForm.date}
              onChange={(e) =>
                setMeetingForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md mb-3"
            />
            <label className="text-xs text-slate-500">Preferred slot</label>
            <input
              placeholder="e.g. 10:00 AM - 10:20 AM"
              value={meetingForm.slot}
              onChange={(e) =>
                setMeetingForm((prev) => ({ ...prev, slot: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md mb-3"
            />
            <label className="text-xs text-slate-500">Topic (optional)</label>
            <input
              placeholder="Discuss progress"
              value={meetingForm.topic}
              onChange={(e) =>
                setMeetingForm((prev) => ({ ...prev, topic: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-3 py-2 rounded-md border"
              >
                Cancel
              </button>
              <button
                onClick={scheduleMeeting}
                className="px-3 py-2 rounded-md bg-indigo-600 text-white"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
