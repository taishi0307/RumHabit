import React from "react";

export default function TestApp() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">テストアプリ</h1>
        <p className="text-blue-600 mb-8">React アプリケーションが正常に動作しています</p>
        <button 
          onClick={() => alert("ボタンが動作しています！")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          テストボタン
        </button>
      </div>
    </div>
  );
}