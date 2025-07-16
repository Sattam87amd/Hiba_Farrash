'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';

const CalendarTimeSelection = ({ 
  monthDates, 
  getAvailableTimesForDate, 
  isSlotBooked, 
  handleTimeSelection, 
  selectedTimes, 
  selectedDuration, 
  setSelectedDuration, 
  selectedDurationMinutes, 
  setSelectedDurationMinutes 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateForTimes, setSelectedDateForTimes] = useState(null);

  // Simple date utilities
  const formatDate = (date, format) => {
    if (format === 'MMMM yyyy') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (format === 'MMM d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (format === 'EEEE, MMM d') {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    if (format === 'yyyy-MM-dd') {
      return date.toISOString().split('T')[0];
    }
    return date.toLocaleDateString();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  };

  const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const startOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const startOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  };

  const endOfWeek = (date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() + (6 - day);
    return new Date(result.setDate(diff));
  };

  const eachDayOfInterval = (start, end) => {
    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval(calendarStart, calendarEnd);

  const getDateString = (date) => formatDate(date, 'yyyy-MM-dd');
  
  const getAvailableTimesCount = (date) => {
    const dateString = getDateString(date);
    return getAvailableTimesForDate(dateString).length;
  };

  const hasSelectedTimes = (date) => {
    const dateString = getDateString(date);
    return selectedTimes.some(slot => slot.selectedDate === dateString);
  };

  const getSelectedTimesCount = (date) => {
    const dateString = getDateString(date);
    return selectedTimes.filter(slot => slot.selectedDate === dateString).length;
  };

  const durationOptions = [
    { label: "Quick - 15min", duration: 15 },
    { label: "Regular - 30min", duration: 30 },
    { label: "Extra - 45min", duration: 45 },
    { label: "All Access - 60min", duration: 60 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="text-4xl font-semibold mb-4 -mt-12">Book a video call</h3>
      <p className="mb-4 font-semibold text-xl">Select duration and time slot:</p>

      {/* Duration Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {durationOptions.map(({ label, duration }) => (
          <button
            key={label}
            className={`py-2 px-4 ${
              selectedDuration === label
                ? "bg-black text-white"
                : "bg-[#F8F7F3] text-black"
            } rounded-md shadow`}
            onClick={() => {
              setSelectedDuration(label);
              setSelectedDurationMinutes(duration);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar size={24} />
          {formatDate(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const dateString = getDateString(date);
          const availableTimesCount = getAvailableTimesCount(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isDateToday = isToday(date);
          const hasSelected = hasSelectedTimes(date);
          const selectedCount = getSelectedTimesCount(date);

          return (
            <div
              key={index}
              className={`relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all ${
                !isCurrentMonth 
                  ? 'bg-gray-50 text-gray-300' 
                  : availableTimesCount > 0
                    ? 'bg-white hover:bg-blue-50 border-blue-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              } ${
                isDateToday ? 'ring-2 ring-blue-500' : ''
              } ${
                hasSelected ? 'bg-blue-100 border-blue-400' : ''
              }`}
              onClick={() => {
                if (isCurrentMonth && availableTimesCount > 0) {
                  setSelectedDateForTimes(selectedDateForTimes === dateString ? null : dateString);
                }
              }}
            >
              <div className="text-sm font-medium mb-1">
                {date.getDate()}
              </div>
              
              {isCurrentMonth && availableTimesCount > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-blue-600 flex items-center gap-1">
                    <Clock size={10} />
                    {availableTimesCount}
                  </div>
                  {hasSelected && (
                    <div className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded">
                      {selectedCount} selected
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Time Slots */}
      {selectedDateForTimes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-lg mb-3">
            Available times for {formatDate(new Date(selectedDateForTimes), 'EEEE, MMM d')}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {getAvailableTimesForDate(selectedDateForTimes).map((time) => {
              const isBooked = isSlotBooked(selectedDateForTimes, time);
              const isSelected = selectedTimes.some(
                s => s.selectedDate === selectedDateForTimes && s.selectedTime === time
              );

              return (
                <button
                  key={time}
                  className={`py-2 px-3 text-sm ${
                    isSelected 
                      ? "bg-black text-white" 
                      : isBooked 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-gray-100"
                  } rounded-xl border transition-colors shadow-sm`}
                  onClick={() => !isBooked && handleTimeSelection(selectedDateForTimes, time)}
                  disabled={isBooked}
                >
                  {time}
                  {isBooked && <span className="text-xs block">Booked</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Selected slots: {selectedTimes.length} / 5
        </p>
        {selectedTimes.length > 0 && (
          <div className="mt-2 space-y-1">
            {selectedTimes.map((slot, index) => (
              <div key={index} className="text-xs text-gray-700">
                {formatDate(new Date(slot.selectedDate), 'MMM d')} at {slot.selectedTime}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
          <span>No availability</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarTimeSelection;
