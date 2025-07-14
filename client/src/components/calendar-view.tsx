import { Calendar } from "lucide-react";
import type { HabitData } from "@shared/schema";

interface CalendarViewProps {
  habitData: HabitData[];
}

export function CalendarView({ habitData }: CalendarViewProps) {
  // Create a map for quick lookup
  const habitDataMap = habitData.reduce((acc, data) => {
    acc[data.date] = data;
    return acc;
  }, {} as Record<string, HabitData>);

  const generateCalendarData = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const data = habitDataMap[dateStr];
    
    if (!data) return 'none';
    
    const achievements = [data.distanceAchieved, data.heartRateAchieved, data.durationAchieved];
    const achievedCount = achievements.filter(Boolean).length;
    
    if (achievedCount === 3) return 'perfect';
    if (achievedCount > 0) return 'partial';
    return 'attempted';
  };

  const getDayColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'bg-green-500 text-white';
      case 'partial': return 'bg-yellow-500 text-white';
      case 'attempted': return 'bg-red-300 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const currentMonth = new Date().toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="text-green-600" />
        {currentMonth}
      </h3>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {generateCalendarData().map((date, index) => {
          const status = getDayStatus(date);
          const isCurrentMonth = date.getMonth() === new Date().getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm transition-all ${
                isCurrentMonth ? '' : 'opacity-50'
              } ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getDayColor(status)}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>全目標達成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>一部達成</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded-full"></div>
          <span>実施のみ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
          <span>未実施</span>
        </div>
      </div>
    </div>
  );
}
