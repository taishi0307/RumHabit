import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import "./index.css";

// Service Worker登録（開発環境では無効化）
if ('serviceWorker' in navigator) {
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  
  if (isProduction) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  } else {
    // 開発環境では既存のService Workerを削除
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
    });
  }
}

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  // Use TestApp to verify basic React functionality
  const useTestApp = window.location.search.includes("test=true");
  
  createRoot(rootElement).render(useTestApp ? <TestApp /> : <App />);
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `<div style="padding: 20px; background: #f8f9fa; font-family: Arial, sans-serif;">
    <h1 style="color: #dc3545;">アプリケーションエラー</h1>
    <p>アプリケーションの開始に失敗しました。</p>
    <p>エラー: ${error instanceof Error ? error.message : 'Unknown error'}</p>
    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">再読み込み</button>
  </div>`;
}
