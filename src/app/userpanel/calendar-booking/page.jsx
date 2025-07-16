'use client';

import React, { useState, useEffect } from 'react';
import CalendarTimeSelection from '@/components/UserPanel/ExpertAboutMe/CalendarTimeSelection';
import { startOfToday, addMonths, eachDayOfInterval, format } from 'date-fns';

const CalendarBookingPage = () => {
  // Demo state logic, replace with real logic as needed
  const [selectedDuration, setSelectedDuration] = useState('Quick - 15min');
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(15);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [monthsRange] = useState(1);

  // Generate all dates for the month
  const generateMonthDates = () => {
    const startDate = startOfToday();
    const endDate = addMonths(startDate, monthsRange);
    return eachDayOfInterval({ start: startDate, end: endDate });
  };
  const [monthDates, setMonthDates] = useState([]);
  useEffect(() => {
    setMonthDates(generateMonthDates());
  }, [monthsRange]);

  // Dummy available times logic
  const getAvailableTimesForDate = (dateString) => {
    // Example: every day has 3 slots except weekends
    const day = new Date(dateString).getDay();
    if (day === 0 || day === 6) return [];
    return ['10:00 AM', '2:00 PM', '4:00 PM'];
  };

  // Dummy booking logic
  const isSlotBooked = (dateString, time) => {
    return bookedSlots.some(slot => slot.selectedDate === dateString && slot.selectedTime === time);
  };

  const handleTimeSelection = (dateString, time) => {
    const slot = { selectedDate: dateString, selectedTime: time };
    setSelectedTimes(prev => {
      const exists = prev.some(s => s.selectedDate === dateString && s.selectedTime === time);
      if (exists) return prev.filter(s => !(s.selectedDate === dateString && s.selectedTime === time));
      if (prev.length >= 5) return prev;
      return [...prev, slot];
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <CalendarTimeSelection
        monthDates={monthDates}
        getAvailableTimesForDate={getAvailableTimesForDate}
        isSlotBooked={isSlotBooked}
        handleTimeSelection={handleTimeSelection}
        selectedTimes={selectedTimes}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        selectedDurationMinutes={selectedDurationMinutes}
        setSelectedDurationMinutes={setSelectedDurationMinutes}
      />
    </div>
  );
};

export default CalendarBookingPage;
