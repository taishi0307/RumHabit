import { Request, Response } from 'express';

// スマートウォッチAPIの統合インターフェース
export interface SmartWatchAPI {
  brand: string;
  authenticate(credentials: any): Promise<string>;
  getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]>;
  isAvailable(): boolean;
}

export interface WorkoutData {
  id: string;
  date: string;
  time: string;
  duration: number; // seconds
  distance: number; // km
  heartRate: number; // bpm
  calories: number;
  activityType: string;
  deviceId: string;
  rawData?: any;
}

// Apple HealthKit API統合
export class AppleHealthKitAPI implements SmartWatchAPI {
  brand = 'Apple';
  
  async authenticate(credentials: { userId: string; deviceId: string }): Promise<string> {
    // Apple HealthKitは直接Web APIアクセス不可
    // iOSアプリから送信されたデータを受信する想定
    throw new Error('Apple HealthKit requires iOS app integration');
  }
  
  async getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    // iOSアプリから送信されたデータを処理
    return [];
  }
  
  isAvailable(): boolean {
    return true; // iOSアプリ経由でのみ利用可能
  }
}

// Huawei Health Kit API統合
export class HuaweiHealthKitAPI implements SmartWatchAPI {
  brand = 'Huawei';
  private baseUrl = 'https://health-api.cloud.huawei.com';
  
  async authenticate(credentials: { clientId: string; clientSecret: string; code: string }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code: credentials.code,
      }),
    });
    
    const data = await response.json();
    return data.access_token;
  }
  
  async getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    const response = await fetch(`${this.baseUrl}/fitness/v1/activities`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams({
        startTime: dateRange.start,
        endTime: dateRange.end,
      }),
    });
    
    const data = await response.json();
    return this.transformHuaweiData(data);
  }
  
  private transformHuaweiData(data: any): WorkoutData[] {
    // Huaweiデータフォーマットをアプリケーション形式に変換
    return data.activities?.map((activity: any) => ({
      id: activity.id,
      date: activity.startTime.split('T')[0],
      time: activity.startTime.split('T')[1].split('.')[0],
      duration: activity.duration,
      distance: activity.distance / 1000, // メートルをキロメートルに変換
      heartRate: activity.avgHeartRate,
      calories: activity.calories,
      activityType: activity.type,
      deviceId: activity.deviceId,
      rawData: activity,
    })) || [];
  }
  
  isAvailable(): boolean {
    return process.env.HUAWEI_CLIENT_ID && process.env.HUAWEI_CLIENT_SECRET ? true : false;
  }
}

// Xiaomi Mi Fitness API統合（Google Fit経由）
export class XiaomiMiFitnessAPI implements SmartWatchAPI {
  brand = 'Xiaomi';
  private googleFitApi = new GoogleFitAPI();
  
  async authenticate(credentials: { accessToken: string }): Promise<string> {
    // Xiaomiは直接APIを提供していないため、Google Fit経由
    return credentials.accessToken;
  }
  
  async getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    // Google Fit APIを使用してXiaomiデータを取得
    const googleFitData = await this.googleFitApi.getWorkoutData(accessToken, dateRange);
    return googleFitData.filter(workout => workout.deviceId.includes('xiaomi'));
  }
  
  isAvailable(): boolean {
    return false; // 直接APIなし、Google Fit経由のみ
  }
}

// Garmin Connect API統合
export class GarminConnectAPI implements SmartWatchAPI {
  brand = 'Garmin';
  private baseUrl = 'https://connectapi.garmin.com';
  
  async authenticate(credentials: { consumerKey: string; consumerSecret: string; accessToken: string; tokenSecret: string }): Promise<string> {
    // OAuth 1.0a認証
    return credentials.accessToken;
  }
  
  async getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    const response = await fetch(`${this.baseUrl}/activity-service/activities`, {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
    });
    
    const data = await response.json();
    return this.transformGarminData(data);
  }
  
  private transformGarminData(data: any): WorkoutData[] {
    return data.activities?.map((activity: any) => ({
      id: activity.activityId,
      date: activity.startTimeLocal.split(' ')[0],
      time: activity.startTimeLocal.split(' ')[1],
      duration: activity.duration,
      distance: activity.distance,
      heartRate: activity.averageHR,
      calories: activity.calories,
      activityType: activity.activityType.typeKey,
      deviceId: activity.deviceId,
      rawData: activity,
    })) || [];
  }
  
  isAvailable(): boolean {
    return process.env.GARMIN_CONSUMER_KEY && process.env.GARMIN_CONSUMER_SECRET ? true : false;
  }
}

// Google Fit API統合（廃止予定）
export class GoogleFitAPI implements SmartWatchAPI {
  brand = 'Google';
  private baseUrl = 'https://www.googleapis.com/fitness/v1';
  
  async authenticate(credentials: { accessToken: string }): Promise<string> {
    return credentials.accessToken;
  }
  
  async getWorkoutData(accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    const startTimeNanos = new Date(dateRange.start).getTime() * 1000000;
    const endTimeNanos = new Date(dateRange.end).getTime() * 1000000;
    
    const response = await fetch(`${this.baseUrl}/users/me/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams({
        startTime: startTimeNanos.toString(),
        endTime: endTimeNanos.toString(),
      }),
    });
    
    const data = await response.json();
    return this.transformGoogleFitData(data);
  }
  
  private transformGoogleFitData(data: any): WorkoutData[] {
    return data.session?.map((session: any) => ({
      id: session.id,
      date: new Date(parseInt(session.startTimeMillis)).toISOString().split('T')[0],
      time: new Date(parseInt(session.startTimeMillis)).toTimeString().split(' ')[0],
      duration: Math.floor((parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis)) / 1000),
      distance: session.distance || 0,
      heartRate: session.averageHeartRate || 0,
      calories: session.calories || 0,
      activityType: session.activityType,
      deviceId: session.application?.packageName || 'unknown',
      rawData: session,
    })) || [];
  }
  
  isAvailable(): boolean {
    // 2026年廃止予定
    return true;
  }
}

// スマートウォッチAPIマネージャー
export class SmartWatchAPIManager {
  private apis: SmartWatchAPI[] = [
    new AppleHealthKitAPI(),
    new HuaweiHealthKitAPI(),
    new XiaomiMiFitnessAPI(),
    new GarminConnectAPI(),
    new GoogleFitAPI(),
  ];
  
  getAvailableAPIs(): SmartWatchAPI[] {
    return this.apis.filter(api => api.isAvailable());
  }
  
  getAPI(brand: string): SmartWatchAPI | null {
    return this.apis.find(api => api.brand === brand) || null;
  }
  
  async syncWorkoutData(brand: string, accessToken: string, dateRange: { start: string; end: string }): Promise<WorkoutData[]> {
    const api = this.getAPI(brand);
    if (!api) {
      throw new Error(`Unsupported brand: ${brand}`);
    }
    
    return await api.getWorkoutData(accessToken, dateRange);
  }
}

// Express エンドポイント
export const smartWatchRoutes = (app: any) => {
  const apiManager = new SmartWatchAPIManager();
  
  // 利用可能なAPIの一覧を取得
  app.get('/api/smartwatch/available', (req: Request, res: Response) => {
    const availableAPIs = apiManager.getAvailableAPIs().map(api => ({
      brand: api.brand,
      available: api.isAvailable(),
    }));
    res.json(availableAPIs);
  });
  
  // 認証エンドポイント
  app.post('/api/smartwatch/auth/:brand', async (req: Request, res: Response) => {
    try {
      const { brand } = req.params;
      const credentials = req.body;
      
      const api = apiManager.getAPI(brand);
      if (!api) {
        return res.status(400).json({ error: 'Unsupported brand' });
      }
      
      const accessToken = await api.authenticate(credentials);
      res.json({ accessToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ワークアウトデータの同期
  app.post('/api/smartwatch/sync/:brand', async (req: Request, res: Response) => {
    try {
      const { brand } = req.params;
      const { accessToken, dateRange } = req.body;
      
      const workoutData = await apiManager.syncWorkoutData(brand, accessToken, dateRange);
      
      // 取得したデータをデータベースに保存
      // この部分は実際のストレージ実装に依存
      
      res.json({
        success: true,
        workoutCount: workoutData.length,
        workouts: workoutData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};