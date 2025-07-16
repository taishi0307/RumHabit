// Fitbit認証デバッグ用スクリプト
// ブラウザのコンソールで実行してlocalStorageの状態を確認

console.log('=== Fitbit認証デバッグ ===');

// localStorage内のFitbitアクセストークンを確認
const accessToken = localStorage.getItem('fitbit_access_token');
console.log('Access Token:', accessToken ? `${accessToken.substring(0, 30)}...` : 'Not found');

// トークンの形式を確認
if (accessToken) {
  console.log('Token length:', accessToken.length);
  console.log('Token starts with:', accessToken.substring(0, 10));
  console.log('Is sample token?', accessToken.includes('sample'));
  
  // 実際のFitbit APIトークンの形式チェック
  const isValidFormat = /^[A-Za-z0-9_-]+$/.test(accessToken);
  console.log('Valid token format?', isValidFormat);
}

// URLパラメータを確認
const urlParams = new URLSearchParams(window.location.search);
console.log('URL params:', Object.fromEntries(urlParams));

// 同期テスト
async function testSync() {
  if (!accessToken) {
    console.log('❌ No access token found');
    return;
  }
  
  try {
    const response = await fetch('/api/smartwatch/sync/Fitbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken,
        dateRange: { start: '2025-07-01', end: '2025-07-16' }
      })
    });
    
    const result = await response.json();
    console.log('Sync result:', result);
    
    if (result.workouts && result.workouts.length > 0) {
      console.log('Sample workout:', result.workouts[0]);
      console.log('Is sample data?', result.workouts[0].id?.includes('sample'));
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// 関数を実行
testSync();