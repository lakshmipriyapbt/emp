import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCalendarData } from '../Redux/CalendarSlice';
import { flattenCalendarData } from './CalendarUtils';
import LayOut from '../LayOut/LayOut';
import GetCalendar from './GetCalendar';
import HrCalender from './HrCalender';


const DashboardCalendar = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.calendar);
  const { userRole } = useSelector((state) => state.auth);
  const isAdmin = userRole.includes('company_admin') || userRole.includes('Admin')|| userRole.includes('HR');
  const [month, setMonth] = useState(new Date().getMonth()); // 0-11
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [today] = useState(new Date()); // Store today's date

  useEffect(() => {
    dispatch(fetchCalendarData());
  }, [dispatch]);

  const allEvents = data ? flattenCalendarData(data) : [];

  const filteredEvents = allEvents.filter((event) => {
    const d = new Date(event.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <>
      <div>
        <h2 className="mb-3">📅 Company Event Calendar</h2>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-primary" onClick={handlePrev}>← Previous</button>
          <h4 className="mb-0">{new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
          <button className="btn btn-outline-primary" onClick={handleNext}>Next →</button>
        </div>

        {loading && <div className="alert alert-info">Loading events...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && <GetCalendar events={filteredEvents} year={year} month={month} onEventClick={setSelectedEvent} today={today} />}

        <HrCalender event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      </div>
    </>
  );
};

export default DashboardCalendar;
