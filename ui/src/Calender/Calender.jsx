import React from "react";

const Calendar = ({ currentMonth, setCurrentMonth, currentYear, setCurrentYear, events }) => {
  const today = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) {
      calendarCells.push(<td key={`empty-${i}`}></td>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const event = events.find((e) => e.calendarDate === fullDate);
      calendarCells.push(
        <td key={day} className={event ? `bg-${event.color} text-white` : ""}>
          {day}
          {event && <div>{event.title}</div>}
        </td>
      );
    }
    const rows = [];
    for (let i = 0; i < calendarCells.length; i += 7) {
      rows.push(<tr key={i}>{calendarCells.slice(i, i + 7)}</tr>);
    }

    return rows;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-primary" onClick={goToPrevMonth}>❮ Prev</button>
        <div className="d-flex align-items-center gap-2">
  <select
    className="form-select"
    value={currentMonth}
    onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
  >
    {monthNames.map((month, index) => (
      <option key={index} value={index}>
        {month}
      </option>
    ))}
  </select>

  <select
    className="form-select"
    value={currentYear}
    onChange={(e) => setCurrentYear(parseInt(e.target.value))}
  >
    {Array.from({ length: 20 }, (_, i) => {
      const year = new Date().getFullYear() - 10 + i;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    })}
  </select>
</div>

        <button className="btn btn-outline-primary" onClick={goToNextMonth}>Next ❯</button>
      </div>

      <table className="table table-bordered text-center">
        <thead className="table-light">
          <tr>
            {daysOfWeek.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>{generateCalendar()}</tbody>
      </table>
    </>
  );
};

export default Calendar;
