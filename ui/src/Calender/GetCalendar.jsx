import React, { useEffect, useState } from "react";
import { CalendarGetApi } from "../Utils/Axios";
import Calendar from "./Calender";

const GetCalendar = () => {
  const today = new Date();
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    CalendarGetApi()
      .then((res) => {
        const formatted = convertCalendarData(res.data.data[0]); // Access the first object in the data array
        setCalendarData(formatted);
      })
      .catch((err) => console.error("Error fetching calendar data:", err));
  }, []);

  const convertCalendarData = (data) => {
    const year = data.year;
    const flatEvents = [];

    data.dateEntityList.forEach((monthEntry) => {
      const month = monthEntry.month.padStart(2, "0");
      monthEntry.holidaysEntities.forEach((holiday) => {
        const day = holiday.date.padStart(2, "0");
        const fullDate = `${year}-${month}-${day}`;
        flatEvents.push({
          calendarDate: fullDate,
          title: holiday.event,
          color: holiday.theme || "primary",
        });
      });
    });

    return flatEvents;
  };

  return (
    <Calendar
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      currentYear={currentYear}
      setCurrentYear={setCurrentYear}
      events={calendarData}
    />
  );
};

export default GetCalendar;
