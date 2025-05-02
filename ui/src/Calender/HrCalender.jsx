import React, { useState, useEffect } from "react";
import LayOut from "../LayOut/LayOut";
import { useForm } from "react-hook-form";
import { calendarPostAPI, calendarPatchAPIById } from "../Utils/Axios";
import Calendar from "./Calender";
import { useDispatch, useSelector } from "react-redux";
import { fetchCalendarData } from "../Redux/CalendarSlice";

const HRCalendar = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.calendar);

  useEffect(() => {
    dispatch(fetchCalendarData());
  }, [dispatch]);

  useEffect(() => {
    console.log("📦 Redux calendar state:", data); // ✅ Debug Redux data
    if (Array.isArray(data)) {
      const matchedCompanyCalendar = data.find((entry) => entry.year === String(currentYear));
      console.log("✅ Matched Year Entry:", matchedCompanyCalendar); // ✅ Debug matching entry
      if (matchedCompanyCalendar?.dateEntityList) {
        const loadedEvents = [];

        matchedCompanyCalendar.dateEntityList.forEach(({ month, holidaysEntities }) => {
          holidaysEntities.forEach(({ event, date, theme }) => {
            const formattedDate = `${String(date).padStart(2, "0")}-${month}-${matchedCompanyCalendar.year}`;
            const calendarDate = `${matchedCompanyCalendar.year}-${month}-${String(date).padStart(2, "0")}`;
            loadedEvents.push({ title: event, date: formattedDate, calendarDate, color: theme });
          });
        });
        console.log("📆 Events loaded for calendar:", loadedEvents); // ✅ Debug processed events
        setEvents(loadedEvents); // Load from API
      }
    }
  }, [data, currentYear]);

  const onAddEvent = (formData) => {
    const { title, day, month, year, color } = formData;
    const formattedDate = `${String(day).padStart(2, "0")}-${String(Number(month) + 1).padStart(2, "0")}-${year}`;
    const calendarDate = `${year}-${String(Number(month) + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const newEvent = { title, date: formattedDate, calendarDate, color };

    if (editIndex !== null) {
      const updated = [...events];
      updated[editIndex] = newEvent;
      setEvents(updated);
      setEditIndex(null);
    } else {
      setEvents([...events, newEvent]);
    }

    reset();
  };

  const onSubmitAll = async () => {
    // Group events by month
    const grouped = events.reduce((acc, event) => {
      const [day, month, year] = event.date.split("-");
      const monthNum = String(Number(month)).padStart(2, "0");
  
      if (!acc[monthNum]) acc[monthNum] = [];
      acc[monthNum].push({ event: event.title, theme: event.color, date: day });
  
      return acc;
    }, {});
  
    // Prepare the payload for API
    const payload = {
      year: String(currentYear),
      dateEntityList: Object.entries(grouped).map(([month, holidays]) => ({
        month,
        holidaysEntities: holidays,
      })),
    };
  
    try {
      // Check if the year already exists in the calendar data
      const existingEntry = Array.isArray(data)
        ? data.find(entry => entry.year === String(currentYear))
        : null;
  
      if (existingEntry) {
        // If year exists, PATCH the data
        const updatedPayload = {
          ...payload,
          id: existingEntry.id, // Ensure you have the ID from getAPI
          type: "company_calendar",
        };
  
        await calendarPatchAPIById(updatedPayload);
        alert("✅ Updated existing calendar successfully!");
      } else {
        // If year doesn't exist, POST a new entry
        await calendarPostAPI(payload);
        alert("✅ Created new calendar successfully!");
      }
  
      // Refresh the calendar data after submit
      dispatch(fetchCalendarData());
    } catch (err) {
      console.error("❌ Submit failed:", err);
      alert("❌ Submit failed!");
    }
  };  

  const handleEdit = (index) => {
    const { title, date, color } = events[index];
    const [day, month, year] = date.split("-");
    setValue("title", title);
    setValue("day", day);
    setValue("month", parseInt(month) - 1);
    setValue("year", year);
    setValue("color", color);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = [...events];
    updated.splice(index, 1);
    setEvents(updated);
  };

  return (
    <LayOut>
      <div className="container mt-4">
        <h3>HR Calendar Management</h3>
        <form onSubmit={handleSubmit(onAddEvent)} className="mb-4 row g-2">
          <div className="col-md-2">
            <input {...register("title")} placeholder="Event Title" className="form-control" required />
          </div>
          <div className="col-md-2">
            <input {...register("day")} placeholder="Day" type="number" min="1" max="31" className="form-control" required />
          </div>
          <div className="col-md-2">
            <select {...register("month")} className="form-select">
              {Array.from({ length: 12 }, (_, i) => (
                <option value={i} key={i}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input {...register("year")} placeholder="Year" defaultValue={currentYear} className="form-control" required />
          </div>
          <div className="col-md-2">
            <select {...register("color")} className="form-select">
              <option value="primary">Primary</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">{editIndex !== null ? "Update" : "Add Event"}</button>
          </div>
        </form>

        <div className="mb-4">
          <Calendar year={currentYear} month={currentMonth} events={events} />
        </div>

        <h5>Events List</h5>
        <ul className="list-group mb-3">
          {events.map((event, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              <span><strong>{event.title}</strong> on {event.date} <span className={`badge bg-${event.color} ms-2`}>{event.color}</span></span>
              <div>
                <button className="btn btn-sm btn-info me-2" onClick={() => handleEdit(index)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(index)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>

        <button className="btn btn-success" onClick={onSubmitAll}>Submit Calendar</button>
      </div>
    </LayOut>
  );
};

export default HRCalendar;
