// Pure JavaScript - no React or TypeScript
console.log("Starting pure JavaScript app v123...");

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log("Root element found, creating content...");
  
  // Create the main container
  const container = document.createElement('div');
  container.style.cssText = `
    min-height: 100vh;
    background-color: #f0f8ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
  `;
  
  // Create the card
  const card = document.createElement('div');
  card.style.cssText = `
    text-align: center;
    padding: 40px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  // Create the title
  const title = document.createElement('h1');
  title.textContent = '習慣トラッカー';
  title.style.cssText = `
    color: #1e3a8a;
    font-size: 2.5rem;
    margin-bottom: 20px;
    margin-top: 0;
  `;
  
  // Create the description
  const description = document.createElement('p');
  description.innerHTML = 'アプリケーションが正常に動作しています！<br/>URL: ' + window.location.href;
  description.style.cssText = `
    color: #64748b;
    font-size: 1.2rem;
    margin-bottom: 30px;
  `;
  
  // Create the button
  const button = document.createElement('button');
  button.textContent = 'テストボタン';
  button.style.cssText = `
    padding: 15px 30px;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
  `;
  
  button.addEventListener('click', function() {
    alert('ボタンクリックが動作しました！');
    console.log('Button clicked successfully');
  });
  
  // Assemble the elements
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(button);
  container.appendChild(card);
  
  // Add to the DOM
  rootElement.appendChild(container);
  
  console.log("Pure JavaScript app rendered successfully");
} else {
  console.error("Root element not found");
  document.body.innerHTML = '<div style="padding: 20px; font-size: 20px; color: red;">Root element not found!</div>';
}