import React, { useState } from "react";
import Calendar from "./Calender";
import LayOut from "../LayOut/LayOut";
import { useForm } from "react-hook-form";
import axios from "axios";

const HRCalendar = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const onAddEvent = (data) => {
    const { title, day, month, year, color } = data;
    const formattedDate = `${String(day).padStart(2, "0")}-${String(Number(month) + 1).padStart(2, "0")}-${year}`;
    const calendarDate = `${year}-${String(Number(month) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const newEvent = {
      title,
      date: formattedDate,
      calendarDate,
      color,
    };
    console.log("Updated events:", events); // Log events after adding/editing
    if (editIndex !== null) {
      const updatedEvents = [...events];
      updatedEvents[editIndex] = newEvent;
      setEvents(updatedEvents);
      setEditIndex(null);
      console.log("events",events)
    } else {
      setEvents([...events, newEvent]);
    }

    reset(); // Clear form
  };

  const onSubmitAll = async () => {
    const groupedByMonth = events.reduce((acc, event) => {
      const [day, month, year] = event.date.split("-");
      const dateObj = new Date(`${year}-${month}-${day}`);
      const monthName = dateObj.toLocaleString("default", { month: "long" });

      if (!acc[monthName]) acc[monthName] = [];

      acc[monthName].push({
        event: event.title,
        theme: event.color,
        date: day, // only dd
      });

      return acc;
    }, {});

    const payload = {
      year: String(currentYear),
      dateEntityList: Object.entries(groupedByMonth).map(([month, holidays]) => ({
        month,
        holidaysEntities: holidays,
      })),
    };

    try {
      const res = await axios.post("https://your-api-endpoint.com/calendar", payload);
      console.log("Response:", res.data);
      alert("Submitted Successfully!");
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Failed to submit!");
    }
  };

  const handleDelete = (index) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

  const handleEdit = (index) => {
    const event = events[index];
    const [day, month, year] = event.date.split("-");
    setValue("title", event.title);
    setValue("day", day);
    setValue("month", parseInt(month) - 1); // since value was index
    setValue("year", year);
    setValue("color", event.color);
    setEditIndex(index);
  };

  const bootstrapColors = [
    "primary", "secondary", "success", "danger",
    "warning", "info", "light", "dark"
  ];

  return (
    <LayOut>
      <div className="container my-4">
        <div className="card p-4">
          <h4 className="mb-4">HR Event/Holiday Calendar</h4>

          <form onSubmit={handleSubmit(onAddEvent)} className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label">Event Name</label>
              <input type="text" className="form-control" {...register("title", { required: true })} />
            </div>
            <div className="col-md-1">
              <label className="form-label">Day</label>
              <input type="number" min="1" max="31" className="form-control" {...register("day", { required: true })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Month</label>
              <select className="form-select" {...register("month")}>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Year</label>
              <select className="form-select" {...register("year")}>
                {Array.from({ length: 50 }, (_, i) => 2000 + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Color</label>
              <select className="form-select" {...register("color")}>
                {bootstrapColors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-success w-100">
                {editIndex !== null ? "Update" : "Add"}
              </button>
            </div>
          </form>
           <hr/>
          <div>
            <h5>Event List</h5>
            {events.length === 0 ? (
              <p>No events added yet.</p>
            ) : (
                <>
              <ul className="list-group">
                {events.map((event, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className={`bg-${event.color}`}>
                      <strong>{event.title}</strong> — {event.date}
                    </span>
                    <span>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(index)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
               <div className="text-end mt-3">
               <button className="btn btn-warning" onClick={onSubmitAll}>
                 Submit All Events to API
               </button>
             </div>
             </>
            )}
          </div>
            <hr/>
          <div className="mt-4">
            <Calendar
              currentMonth={currentMonth}
              currentYear={currentYear}
              setCurrentMonth={setCurrentMonth}
              setCurrentYear={setCurrentYear}
              events={events}
            />
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default HRCalendar;
