import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Distance calculation (Haversine Formula)
function getDistanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Dummy Data
const ROUTE = [
  [20.2959, 85.8245],
  [20.2965, 85.8255],
  [20.2972, 85.8262],
  [20.298, 85.8268],
  [20.2988, 85.8275],
];
const STOPS = [
  { id: "S1", name: "Main Gate", coords: [20.2959, 85.8245], pickup: "7:15 AM" },
  { id: "S2", name: "Oak Street", coords: [20.2972, 85.8262], pickup: "7:25 AM" },
  { id: "S3", name: "River View", coords: [20.2988, 85.8275], pickup: "7:35 AM" },
];
const BUS_INFO = {
  busNo: "OD-02-1234",
  driver: { name: "Ramesh Kumar", phone: "+91-9876543210" },
  attendant: { name: "Sita Devi", phone: "+91-9123456780" },
  capacity: 40,
};
const STUDENTS = [
  { id: 1, name: "Alice Doe", stopId: "S1", seat: "A1" },
  { id: 2, name: "Bob Doe", stopId: "S3", seat: "B2" },
];
const FEE = {
  total: "₹5,000/year",
  paid: "₹2,500",
  due: "₹2,500",
  history: [
    { date: "2025-06-01", amount: "₹2,500", mode: "UPI", receipt: "R-1001" },
  ],
};

// Simulate bus movement
function useSimulatedBus(speed = 20, tickMs = 2000) {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(ROUTE[0]);
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % ROUTE.length;
        setPos(ROUTE[next]);
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs]);
  return pos;
}

export default function TransportPage() {
  const [activeChild, setActiveChild] = useState(STUDENTS[0]);
  const busPos = useSimulatedBus();
  const childStop = STOPS.find((s) => s.id === activeChild.stopId);

  // ETA calculation
  const eta = useMemo(() => {
    const dist = getDistanceKm(busPos, childStop.coords);
    return Math.round((dist / 20) * 60); // speed 20 km/h
  }, [busPos, childStop]);

  // Download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transport Records", 14, 20);
    doc.setFontSize(12);
    doc.text(`Bus No: ${BUS_INFO.busNo}`, 14, 30);
    doc.autoTable({
      head: [["Student", "Stop", "Seat"]],
      body: STUDENTS.map((s) => [s.name, s.stopId, s.seat]),
      startY: 40,
    });
    doc.save("transport-records.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">🚌 Transport Dashboard</h1>
        <div className="flex gap-3">
          <select
            className="border rounded px-3 py-1"
            value={activeChild.id}
            onChange={(e) =>
              setActiveChild(STUDENTS.find((s) => s.id === Number(e.target.value)))
            }
          >
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-80 rounded-lg overflow-hidden border">
        <MapContainer center={busPos} zoom={16} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={busPos}>
            <Popup>Bus {BUS_INFO.busNo}</Popup>
          </Marker>
          {STOPS.map((stop) => (
            <Marker key={stop.id} position={stop.coords}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
          <Polyline positions={ROUTE} color="blue" />
        </MapContainer>
      </div>
      <p className="text-center text-gray-600">
        ETA to {childStop.name}: {eta} mins
      </p>

      {/* Info Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bus Details */}
        <div className="p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Bus & Driver Info</h2>
          <p><b>Bus:</b> {BUS_INFO.busNo}</p>
          <p><b>Driver:</b> {BUS_INFO.driver.name} ({BUS_INFO.driver.phone})</p>
          <p><b>Attendant:</b> {BUS_INFO.attendant.name} ({BUS_INFO.attendant.phone})</p>
          <p><b>Capacity:</b> {BUS_INFO.capacity}</p>
        </div>

        {/* Fee Info */}
        <div className="p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Transport Fee</h2>
          <p><b>Total:</b> {FEE.total}</p>
          <p><b>Paid:</b> {FEE.paid}</p>
          <p><b>Due:</b> {FEE.due}</p>
          <h3 className="font-semibold mt-3">Payment History</h3>
          <ul className="list-disc pl-5">
            {FEE.history.map((f, i) => (
              <li key={i}>
                {f.date}: {f.amount} ({f.mode})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stops List */}
      <div className="p-4 border rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Stops & Schedule</h2>
        <ul className="space-y-2">
          {STOPS.map((s) => (
            <li key={s.id}>
              <b>{s.name}</b> - Pickup: {s.pickup}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
