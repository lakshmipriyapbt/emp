import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const Calendar = ({ events, year, month }) => {
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const matchedEvents = events.filter(e => e.calendarDate === dateStr);
    setSelectedDateEvents(matchedEvents);
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="border p-3" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter(e => e.calendarDate === dateStr);

    calendarCells.push(
      <div key={day} className="border p-2" style={{ cursor: "pointer", minHeight:"80px" }} onClick={() => handleDateClick(day)}>
        <div className="fw-bold">{day}</div>
        {dayEvents.map((ev, i) => (
          <div key={i} className={`badge bg-${ev.color} mt-1 d-block text-white`}>{ev.title}</div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="d-grid mb-3" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div className="fw-bold text-center" key={d}>{d}</div>
        ))}
        {calendarCells}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Events on {selectedDate}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDateEvents.length ? selectedDateEvents.map((e, i) => (
            <div key={i} className={`alert alert-${e.color}`}>{e.title}</div>
          )) : <p>No events on this date.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Calendar;
