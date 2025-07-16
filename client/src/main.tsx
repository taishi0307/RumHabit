import { createRoot } from "react-dom/client";
import App from "./App";
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

createRoot(document.getElementById("root")!).render(<App />);
