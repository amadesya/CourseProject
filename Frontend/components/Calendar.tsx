import React, { useState } from 'react';
import { RepairRequest } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface CalendarProps {
  requests: RepairRequest[];
  onSelectRequest: (request: RepairRequest) => void;
}

type CalendarView = 'month' | 'week';

const Calendar: React.FC<CalendarProps> = ({ requests, onSelectRequest }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday is 0
  };

  const changePeriod = (offset: number) => {
    if (view === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + offset * 7);
        return newDate;
      });
    }
  };

  const handleDayClick = (date: Date) => {
    if (!rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectedDate(date);
      setCurrentDate(date);
      return;
    }

    if (rangeStart && !rangeEnd) {
      if (date < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
      setSelectedDate(date);
      setCurrentDate(date);
      return;
    }

    setRangeStart(date);
    setRangeEnd(null);
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const renderTitle = () => {
    if (view === 'month') {
      return currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    } else {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startMonth = startOfWeek.toLocaleString('ru-RU', { month: 'long' });
      const endMonth = endOfWeek.toLocaleString('ru-RU', { month: 'long' });

      if (startMonth === endMonth) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startMonth} ${endOfWeek.getFullYear()} г.`;
      } else {
        return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${endOfWeek.getFullYear()} г.`;
      }
    }
  };

  // фильтрация заявок по диапазону
  const filteredRequests = requests.filter(req => {
    const reqDate = new Date(req.createdAt);
    if (rangeStart && rangeEnd) {
      return reqDate >= rangeStart && reqDate <= rangeEnd;
    }
    if (rangeStart && !rangeEnd) {
      return reqDate.toDateString() === rangeStart.toDateString();
    }
    return true; // если диапазон не выбран
  });

  // группировка заявок по дате
  const requestsByDate = filteredRequests.reduce((acc, req) => {
    const date = new Date(req.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(req);
    return acc;
  }, {} as Record<string, RepairRequest[]>);

  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const grid = [];
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-prev-${i}`} className="p-2 h-28 border border-smartfix-dark"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
      const isRangeStart = rangeStart && date.toDateString() === rangeStart.toDateString();
      const isRangeEnd = rangeEnd && date.toDateString() === rangeEnd.toDateString();
      const requestsOnThisDay = requestsByDate[date.toDateString()] || [];

      grid.push(
        <div
          key={day}
          onClick={() => handleDayClick(date)}
          className={`p-2 border border-smartfix-dark h-28 overflow-y-auto cursor-pointer
            ${isToday ? 'bg-smartfix-medium/50' : ''}
            ${isRange ? 'bg-blue-500/20' : ''}
            ${isRangeStart ? 'bg-blue-600/40 rounded-l-xl shadow-[0_0_20px_rgba(0,150,255,0.5)]' : ''}
            ${isRangeEnd ? 'bg-blue-600/40 rounded-r-xl shadow-[0_0_20px_rgba(0,150,255,0.5)]' : ''}
          `}
        >
          <div className={`font-bold ${isToday ? 'text-white' : 'text-smartfix-lightest'}`}>{day}</div>
          {requestsOnThisDay.length > 0 && (
            <div className="mt-1 space-y-1">
              {requestsOnThisDay.map(req => (
                <button
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="w-full text-left bg-blue-500/30 text-blue-200 text-xs p-1 rounded truncate hover:bg-blue-500/50 transition-colors"
                  title={`Заявка #${req.id}: ${req.device}`}
                >
                  #{req.id} {req.device}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    const totalCells = firstDay + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
      grid.push(<div key={`empty-next-${i}`} className="p-2 h-28 border border-smartfix-dark"></div>);
    }

    return grid;
  };

  const renderWeekGrid = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    const today = new Date();

    return weekDates.map((date, index) => {
      const isToday = date.toDateString() === today.toDateString();
      const requestsOnThisDay = requestsByDate[date.toDateString()] || [];
      const isRange = rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd;
      const isRangeStart = rangeStart && date.toDateString() === rangeStart.toDateString();
      const isRangeEnd = rangeEnd && date.toDateString() === rangeEnd.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

      return (
        <div
          key={index}
          onClick={() => handleDayClick(date)}
          className={`border border-smartfix-dark min-h-[60vh] flex flex-col cursor-pointer relative
            ${isToday ? 'bg-smartfix-medium/50' : ''}
            ${isRange ? 'bg-blue-500/20' : ''}
            ${isRangeStart ? 'bg-blue-600/40 rounded-l-xl shadow-[0_0_20px_rgba(0,150,255,0.5)]' : ''}
            ${isRangeEnd ? 'bg-blue-600/40 rounded-r-xl shadow-[0_0_20px_rgba(0,150,255,0.5)]' : ''}
            ${isSelected ? 'bg-blue-700/60 border-blue-400 shadow-[0_0_20px_rgba(0,160,255,0.7)]' : ''}
          `}
        >
          <div className="text-center font-semibold text-smartfix-light p-2 border-b border-smartfix-dark">
            <span>{daysOfWeek[index]}</span>
            <span
              className={`ml-2 text-lg font-bold ${isToday ? 'text-white' : 'text-smartfix-lightest'} ${
                isSelected ? 'text-blue-200' : ''
              }`}
            >
              {date.getDate()}
            </span>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto flex-grow">
            {requestsOnThisDay.map(req => (
              <button
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="w-full text-left bg-smartfix-dark p-2 rounded-lg shadow hover:bg-smartfix-medium transition-colors"
                title={`${req.device}: ${req.issueDescription}`}
              >
                <p className="font-semibold text-sm text-smartfix-lightest truncate">{req.device}</p>
                <p className="text-xs text-smartfix-light truncate mt-1">#{req.id}: {req.issueDescription}</p>
              </button>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-smartfix-darker p-6 rounded-2xl border border-smartfix-dark">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 p-1 bg-smartfix-dark rounded-lg">
          <input
            type="date"
            onChange={e => {
              const dateStr = e.target.value;
              if (dateStr) {
                const picked = new Date(dateStr);
                setRangeStart(picked);
                setRangeEnd(null);
                setSelectedDate(picked);
                setCurrentDate(picked);
              } else {
                setRangeStart(null);
                setRangeEnd(null);
                setSelectedDate(null);
              }
            }}
            className="bg-smartfix-darker text-smartfix-lightest px-3 py-1 rounded-md border border-smartfix-medium"
          />
          <input
            type="date"
            onChange={e => {
              const dateStr = e.target.value;
              if (dateStr) {
                const picked = new Date(dateStr);
                setRangeEnd(picked);
                if (rangeStart && picked < rangeStart) {
                  setRangeStart(picked);
                  setRangeEnd(rangeStart);
                }
                setCurrentDate(picked);
              } else {
                setRangeEnd(null);
              }
            }}
            className="bg-smartfix-darker text-smartfix-lightest px-3 py-1 rounded-md border border-smartfix-medium"
          />
          {(rangeStart || rangeEnd) && (
            <button
              onClick={() => {
                setRangeStart(null);
                setRangeEnd(null);
                setSelectedDate(null);
              }}
              className="text-sm text-red-300 hover:text-red-400"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => changePeriod(-1)} className="p-2 rounded-full hover:bg-smartfix-dark">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h3 className="text-2xl font-bold text-smartfix-lightest w-64 text-center">{renderTitle()}</h3>
          <button onClick={() => changePeriod(1)} className="p-2 rounded-full hover:bg-smartfix-dark">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-1 bg-smartfix-dark rounded-lg">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
              view === 'month'
                ? 'bg-smartfix-light text-smartfix-darkest'
                : 'text-smartfix-lightest hover:bg-smartfix-medium/50'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
              view === 'week'
                ? 'bg-smartfix-light text-smartfix-darkest'
                : 'text-smartfix-lightest hover:bg-smartfix-medium/50'
            }`}
          >
            Неделя
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <>
          <div className="grid grid-cols-7 gap-px">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center font-semibold text-smartfix-light p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-smartfix-dark">{renderMonthGrid()}</div>
        </>
      ) : (
        <div className="grid grid-cols-7 gap-px bg-smartfix-dark">{renderWeekGrid()}</div>
      )}
    </div>
  );
};

export default Calendar;
