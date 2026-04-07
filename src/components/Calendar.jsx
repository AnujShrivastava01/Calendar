import React, { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
  addYears,
  subYears,
  setYear
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Monthly theme colors (primary, light)
const monthlyThemes = {
  0: ['#1281c9', '#e6f3fb'], // Jan - Blue
  1: ['#e91e63', '#fce4ec'], // Feb - Pink
  2: ['#4caf50', '#e8f5e9'], // Mar - Green
  3: ['#ff9800', '#fff3e0'], // Apr - Orange
  4: ['#9c27b0', '#f3e5f5'], // May - Purple
  5: ['#00bcd4', '#e0f7fa'], // Jun - Cyan
  6: ['#f44336', '#ffebee'], // Jul - Red
  7: ['#ffc107', '#fff8e1'], // Aug - Amber
  8: ['#795548', '#efebe9'], // Sep - Brown
  9: ['#ff5722', '#fbe9e7'], // Oct - Deep Orange
  10: ['#607d8b', '#eceff1'], // Nov - Blue Grey
  11: ['#3f51b5', '#e8eaf6'], // Dec - Indigo
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState(null);
  const [isFlipping, setIsFlipping] = useState('');

  // Handle month theme updates
  useEffect(() => {
    const monthIndex = currentDate.getMonth();
    const [primary, light] = monthlyThemes[monthIndex];
    document.documentElement.style.setProperty('--theme-color-primary', primary);
    document.documentElement.style.setProperty('--theme-color-light', light);
  }, [currentDate]);

  // Load notes from localstorage per month
  useEffect(() => {
    const monthKey = format(currentDate, 'yyyy-MM');
    const savedNotes = localStorage.getItem(`calendar-notes-${monthKey}`);
    setNotes(savedNotes || '');
  }, [currentDate]);

  // Save notes on change
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    const monthKey = format(currentDate, 'yyyy-MM');
    localStorage.setItem(`calendar-notes-${monthKey}`, val);
  };

  const nextMonth = () => {
    const nextItem = addMonths(currentDate, 1);
    setTargetDate(nextItem);
    setIsFlipping('flipping-next');
    setTimeout(() => {
      setCurrentDate(nextItem);
      setTargetDate(null);
      setIsFlipping('');
    }, 500); 
  };

  const prevMonth = () => {
    const prevItem = subMonths(currentDate, 1);
    setTargetDate(prevItem);
    setIsFlipping('flipping-prev');
    setTimeout(() => {
      setCurrentDate(prevItem);
      setTargetDate(null);
      setIsFlipping('');
    }, 500); 
  };

  const handleYearSelection = (year) => {
    const currentY = parseInt(format(currentDate, "yyyy"), 10);
    if (year === currentY) return;
    
    const target = setYear(currentDate, year);
    setTargetDate(target);
    setIsFlipping(year > currentY ? 'flipping-next' : 'flipping-prev');
    setTimeout(() => {
      setCurrentDate(target);
      setTargetDate(null);
      setIsFlipping('');
    }, 500); 
  };

  const onDateClick = (day) => {
    if (!startDate) {
      // First click
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        // Clicked before start date, make it the new start
        setEndDate(startDate);
        setStartDate(day);
      } else {
        // Second click after start date
        setEndDate(day);
      }
    } else {
      // Reset range selection
      setStartDate(day);
      setEndDate(null);
    }
  };

  const renderHeader = (renderDate) => {
    const dateFormat = "MMMM";
    const yearFormat = "yyyy";
    return (
      <div className="calendar-hero">
        <img src={`https://picsum.photos/seed/calendar-${format(renderDate, 'MMM')}/800/400`} alt="Monthly Hero" />
        <div className="calendar-controls-left">
          <select 
            className="year-dropdown"
            value={format(renderDate, "yyyy")}
            onChange={(e) => handleYearSelection(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 101 }).map((_, i) => {
              const y = new Date().getFullYear() - 50 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
        <div className="calendar-controls">
          <button className="btn-control" onClick={prevMonth}>
            <ChevronLeft size={24} />
          </button>
          <button className="btn-control" onClick={nextMonth}>
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-typography">
          <div className="hero-year">{format(renderDate, yearFormat)}</div>
          <div className="hero-month">{format(renderDate, dateFormat)}</div>
        </div>
      </div>
    );
  };

  const renderCells = (renderDate) => {
    const monthStart = startOfMonth(renderDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart);
    const endDateGrid = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDateGrid;
    let formattedDate = "";

    while (day <= endDateGrid) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        // Determine classes
        let cellClass = "day-cell";
        
        if (!isSameMonth(day, monthStart)) {
          cellClass += " other-month";
        }
        
        if (isSameDay(day, new Date())) {
          cellClass += " today";
        }
        
        if (startDate && isSameDay(day, startDate)) {
          cellClass += " start-date";
        }
        
        if (endDate && isSameDay(day, endDate)) {
          cellClass += " end-date";
        }
        
        if (startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate)) {
          cellClass += " in-range";
        }

        days.push(
          <div
            className={cellClass}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="days-row" key={day} style={{ display: 'contents' }}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="days-grid">{rows}</div>;
  };

  const renderDaysHeader = (renderDate) => {
    const dateFormat = "EEE";
    const days = [];
    let startDateOfWeek = startOfWeek(renderDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i}>
          {format(addDays(startDateOfWeek, i), dateFormat).toUpperCase()}
        </div>
      );
    }
    return <div className="weekdays-grid">{days}</div>;
  };

  const renderCalendarContent = (dateForView) => (
    <>
      {renderHeader(dateForView)}
      <div className="calendar-body">
        <div className="notes-panel">
          <div className="notes-header">Notes</div>
          <textarea 
            className="notes-input" 
            value={notes} 
            onChange={handleNotesChange}
            placeholder="Jot down memos here..."
          />
        </div>
        <div className="grid-panel">
          {renderDaysHeader(dateForView)}
          {renderCells(dateForView)}
        </div>
      </div>
    </>
  );

  let bgDate = currentDate;
  let fgDate = currentDate;

  if (isFlipping === 'flipping-next' && targetDate) {
    bgDate = targetDate;
    fgDate = currentDate;
  } else if (isFlipping === 'flipping-prev' && targetDate) {
    bgDate = currentDate;
    fgDate = targetDate;
  }

  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        <div className="calendar-page calendar-page-bg">
          {renderCalendarContent(bgDate)}
        </div>
        <div className={`calendar-page calendar-page-fg ${isFlipping}`}>
          {renderCalendarContent(fgDate)}
        </div>
      </div>
    </div>
  );
}
