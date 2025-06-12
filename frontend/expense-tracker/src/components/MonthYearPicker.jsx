import React, { useState, useRef, useEffect } from 'react';
import { LuChevronLeft, LuChevronRight, LuCalendar, LuX } from 'react-icons/lu';

const MonthYearPicker = ({ selectedMonth, onMonthChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(() => {
    return parseInt(selectedMonth.split('-')[0]);
  });
  
  const dropdownRef = useRef(null);

  // Get selected month details
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const selectedDate = new Date(parseInt(selectedYear), parseInt(selectedMonthNum) - 1, 1);
  const displayText = selectedDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const months = [
    { short: 'Jan', full: 'January' },
    { short: 'Feb', full: 'February' },
    { short: 'Mar', full: 'March' },
    { short: 'Apr', full: 'April' },
    { short: 'May', full: 'May' },
    { short: 'Jun', full: 'June' },
    { short: 'Jul', full: 'July' },
    { short: 'Aug', full: 'August' },
    { short: 'Sep', full: 'September' },
    { short: 'Oct', full: 'October' },
    { short: 'Nov', full: 'November' },
    { short: 'Dec', full: 'December' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthSelect = (monthIndex) => {
    const month = String(monthIndex + 1).padStart(2, '0');
    const newValue = `${currentYear}-${month}`;
    onMonthChange(newValue);
    setIsOpen(false);
  };

  const handleYearChange = (direction) => {
    setCurrentYear(prev => prev + direction);
  };

  // Generate year options (current year ± 5 years)
  const currentYearActual = new Date().getFullYear();
  const yearOptions = Array.from({length: 11}, (_, i) => currentYearActual - 5 + i);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
      >
        <LuCalendar size={16} className="text-gray-500" />
        <span className="font-medium text-gray-700">{displayText}</span>
        <LuChevronRight 
          size={14} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-0 w-[280px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
            <h6 className="text-xs font-semibold text-gray-800">Select Month & Year</h6>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <LuX size={14} className="text-gray-500" />
            </button>
          </div>

          <div className="p-3">
            {/* Year Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => handleYearChange(-1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <LuChevronLeft size={16} className="text-gray-600" />
              </button>
              
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="text-base font-bold text-gray-800 border-none outline-none bg-transparent cursor-pointer hover:text-purple-600 transition-colors"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => handleYearChange(1)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <LuChevronRight size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Months Grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {months.map((month, index) => {
                const isSelected = currentYear === parseInt(selectedYear) && 
                                 (index + 1) === parseInt(selectedMonthNum);
                const isCurrentMonth = currentYear === currentYearActual && 
                                     index === new Date().getMonth();
                
                return (
                  <button
                    key={month.short}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`
                      px-2 py-2 text-xs font-medium rounded transition-all duration-200
                      ${isSelected 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : isCurrentMonth 
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {month.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                onMonthChange(currentMonth);
                setCurrentYear(now.getFullYear());
                setIsOpen(false);
              }}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
            >
              Today
            </button>
            <div className="text-xs text-gray-400">
              Click month
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;