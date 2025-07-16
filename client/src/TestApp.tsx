export default function TestApp() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#dbeafe", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          color: "#1e40af", 
          marginBottom: "1rem" 
        }}>
          テストアプリ
        </h1>
        <p style={{ 
          color: "#2563eb", 
          marginBottom: "2rem" 
        }}>
          React アプリケーションが正常に動作しています
        </p>
        <button 
          onClick={() => alert("ボタンが動作しています！")}
          style={{ 
            padding: "12px 24px", 
            backgroundColor: "#2563eb", 
            color: "white", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          テストボタン
        </button>
      </div>
    </div>
  );
}