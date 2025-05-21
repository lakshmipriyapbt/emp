export const flattenCalendarData = (apiData) => {
    const flatEvents = [];
  
    apiData.forEach((company) => {
      const year = company.year;
  
      company.dateEntityList.forEach((monthEntity) => {
        const month = monthEntity.month;
  
        monthEntity.holidaysEntities.forEach((holiday) => {
          const day = holiday.date;
  
          const fullDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
          flatEvents.push({
            date: fullDate,
            title: holiday.event,
            theme: holiday.theme,
          });
        });
      });
    });
  
    return flatEvents;
  };
  