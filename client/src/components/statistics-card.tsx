import { TrendingUp } from "lucide-react";

interface Statistics {
  streak: number;
  totalWorkoutDays: number;
  averageAchievementRate: number;
}

interface StatisticsCardProps {
  statistics?: Statistics;
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  if (!statistics) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          統計情報
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
            <div className="text-3xl font-bold text-green-600 mb-1">-</div>
            <div className="text-sm text-gray-600">日間連続</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
            <div className="text-3xl font-bold text-blue-600 mb-1">-</div>
            <div className="text-sm text-gray-600">総実施日数</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
            <div className="text-3xl font-bold text-purple-600 mb-1">-%</div>
            <div className="text-sm text-gray-600">平均達成率</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp className="text-blue-600" />
        統計情報
      </h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {statistics.streak}
          </div>
          <div className="text-sm text-gray-600">日間連続</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {statistics.totalWorkoutDays}
          </div>
          <div className="text-sm text-gray-600">総実施日数</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {statistics.averageAchievementRate}%
          </div>
          <div className="text-sm text-gray-600">平均達成率</div>
        </div>
      </div>
    </div>
  );
}
