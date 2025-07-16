import { Settings, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SmartWatchIntegration } from "@/components/smartwatch-integration";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="text-blue-600" />
              設定
            </h1>
          </div>
        </div>
      </div>

      {/* SmartWatch Integration */}
      <SmartWatchIntegration />
    </div>
  );
}