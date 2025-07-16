import { createRoot } from "react-dom/client";
import "./index.css";

// Very simple test component
function SimpleApp() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f0f8ff", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ 
        textAlign: "center",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h1 style={{ 
          color: "#1e3a8a", 
          fontSize: "2.5rem",
          marginBottom: "20px"
        }}>
          習慣トラッカー
        </h1>
        <p style={{ 
          color: "#64748b", 
          fontSize: "1.2rem",
          marginBottom: "30px"
        }}>
          アプリケーションが正常に動作しています！
        </p>
        <button 
          onClick={() => {
            alert("ボタンクリックが動作しました！");
            console.log("Button clicked successfully");
          }}
          style={{ 
            padding: "15px 30px", 
            backgroundColor: "#3b82f6", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold"
          }}
        >
          テストボタン
        </button>
      </div>
    </div>
  );
}

// Immediate render without any dependencies
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log("Rendering SimpleApp...");
    createRoot(rootElement).render(<SimpleApp />);
  } else {
    console.error("Root element not found");
    document.body.innerHTML = '<div style="padding: 20px; font-size: 20px; color: red;">Root element not found!</div>';
  }
});
