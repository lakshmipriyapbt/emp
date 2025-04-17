import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "./Calender";


const GetCalendar = () => {
  const today = new Date();
  //const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const calendarData = [
    {
      calendarDate: "2025-01-01",
      title: "New Year's Day",
      color: "primary"
    },
    {
      calendarDate: "2025-01-26",
      title: "Republic Day",
      color: "info"
    },
    {
      calendarDate: "2025-04-18",
      title: "Good Friday",
      color: "success"
    },
    {
      calendarDate: "2025-04-22",
      title: "Earth Day",
      color: "warning"
    },
    {
      calendarDate: "2025-05-01",
      title: "Labor Day",
      color: "danger"
    },
    {
      calendarDate: "2025-08-15",
      title: "Independence Day",
      color: "primary"
    },
    {
      calendarDate: "2025-10-02",
      title: "Gandhi Jayanti",
      color: "info"
    },
    {
      calendarDate: "2025-12-25",
      title: "Christmas Day",
      color: "danger"
    }
  ];

//   useEffect(() => {
//     axios.get("http://your-api-endpoint.com/calendar")
//       .then((res) => {
//         const formatted = convertCalendarData(res.data);
//         setCalendarData(formatted);
//       })
//       .catch((err) => console.error("Error fetching calendar data:", err));
//   }, []);

  const convertCalendarData = (data) => {
    const flatEvents = [];

    data.dateEntityList.forEach((monthEntry) => {
      monthEntry.holidaysEntities.forEach((holiday) => {
        flatEvents.push({
          calendarDate: holiday.date,
          title: holiday.theme,
          color: "success", // or another Bootstrap color
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
