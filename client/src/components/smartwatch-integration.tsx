import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Watch, 
  Smartphone, 
  Activity, 
  Heart, 
  Zap, 
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  WifiOff
} from "lucide-react";

interface SmartWatchDevice {
  id: string;
  name: string;
  brand: 'Apple' | 'Huawei' | 'Xiaomi' | 'Garmin' | 'Google';
  connected: boolean;
  lastSync: Date | null;
  supportedMetrics: string[];
  apiStatus: 'available' | 'deprecated' | 'limited' | 'beta';
}

interface WorkoutData {
  id: string;
  deviceId: string;
  startTime: Date;
  endTime: Date;
  activityType: string;
  distance: number;
  heartRate: number;
  calories: number;
  steps: number;
  rawData?: any;
}

export function SmartWatchIntegration() {
  const [connectedDevices, setConnectedDevices] = useState<SmartWatchDevice[]>([]);
  const [availableDevices, setAvailableDevices] = useState<SmartWatchDevice[]>([
    {
      id: 'apple-watch',
      name: 'Apple Watch',
      brand: 'Apple',
      connected: false,
      lastSync: null,
      supportedMetrics: ['heart_rate', 'distance', 'calories', 'steps', 'workout_sessions'],
      apiStatus: 'available'
    },
    {
      id: 'huawei-watch',
      name: 'Huawei Watch',
      brand: 'Huawei',
      connected: false,
      lastSync: null,
      supportedMetrics: ['heart_rate', 'distance', 'calories', 'steps', 'activity_records'],
      apiStatus: 'available'
    },
    {
      id: 'xiaomi-miband',
      name: 'Xiaomi Mi Band',
      brand: 'Xiaomi',
      connected: false,
      lastSync: null,
      supportedMetrics: ['heart_rate', 'distance', 'calories', 'steps'],
      apiStatus: 'limited'
    },
    {
      id: 'garmin-watch',
      name: 'Garmin Watch',
      brand: 'Garmin',
      connected: false,
      lastSync: null,
      supportedMetrics: ['heart_rate', 'distance', 'calories', 'steps', 'training_metrics'],
      apiStatus: 'available'
    },
    {
      id: 'google-fit',
      name: 'Google Fit',
      brand: 'Google',
      connected: false,
      lastSync: null,
      supportedMetrics: ['heart_rate', 'distance', 'calories', 'steps', 'activity_segments'],
      apiStatus: 'deprecated'
    }
  ]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'Apple': return 'bg-gray-900 text-white';
      case 'Huawei': return 'bg-red-600 text-white';
      case 'Xiaomi': return 'bg-orange-500 text-white';
      case 'Garmin': return 'bg-blue-600 text-white';
      case 'Google': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deprecated': return 'bg-yellow-100 text-yellow-800';
      case 'limited': return 'bg-orange-100 text-orange-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApiStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'API利用可能';
      case 'deprecated': return '2026年廃止予定';
      case 'limited': return '制限あり';
      case 'beta': return 'ベータ版';
      default: return '不明';
    }
  };

  const handleConnect = async (deviceId: string) => {
    setIsConnecting(deviceId);
    setSyncProgress(0);
    
    try {
      // シミュレーション：実際の接続処理
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // デバイスを接続済みに移動
      const device = availableDevices.find(d => d.id === deviceId);
      if (device) {
        const connectedDevice = {
          ...device,
          connected: true,
          lastSync: new Date()
        };
        setConnectedDevices(prev => [...prev, connectedDevice]);
        setAvailableDevices(prev => prev.filter(d => d.id !== deviceId));
      }
    } catch (error) {
      console.error('接続エラー:', error);
    } finally {
      setIsConnecting(null);
      setSyncProgress(0);
    }
  };

  const handleDisconnect = (deviceId: string) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (device) {
      const disconnectedDevice = {
        ...device,
        connected: false,
        lastSync: null
      };
      setAvailableDevices(prev => [...prev, disconnectedDevice]);
      setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };

  const handleSync = async (deviceId: string) => {
    setIsConnecting(deviceId);
    setSyncProgress(0);
    
    try {
      // シミュレーション：データ同期処理
      for (let i = 0; i <= 100; i += 20) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 最終同期時刻を更新
      setConnectedDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, lastSync: new Date() }
          : device
      ));
    } catch (error) {
      console.error('同期エラー:', error);
    } finally {
      setIsConnecting(null);
      setSyncProgress(0);
    }
  };

  const getIntegrationInstructions = (brand: string) => {
    switch (brand) {
      case 'Apple':
        return {
          title: 'Apple Watch統合',
          steps: [
            'iOSアプリを開発してHealthKitにアクセス',
            'WatchConnectivityでApple WatchとiPhone間の同期を実装',
            'ワークアウトデータをWeb APIに送信',
            'OAuth認証でユーザーの許可を取得'
          ],
          requirements: 'iOS開発者アカウント ($99/年)',
          limitations: 'Webアプリから直接アクセス不可、iOSアプリが必要'
        };
      case 'Huawei':
        return {
          title: 'Huawei Health Kit統合',
          steps: [
            'App Gallery ConnectでHealth Kitに申請',
            'REST APIまたはAndroid SDKを選択',
            'ユーザー認証とデータスコープの許可',
            'ワークアウトデータの取得と処理'
          ],
          requirements: 'Huawei開発者アカウント',
          limitations: 'Huaweiデバイスのみ対応'
        };
      case 'Xiaomi':
        return {
          title: 'Xiaomi Mi Fitness統合',
          steps: [
            'Google Fit APIを経由してデータ取得',
            'Gadgetbridgeを使用した直接デバイス通信',
            'ユーザーがMi FitnessからGoogle Fitへの同期を有効化',
            'Health Connect APIへの移行準備'
          ],
          requirements: 'Google Cloud Platform アカウント',
          limitations: '公式API未提供、間接的なアクセスのみ'
        };
      case 'Garmin':
        return {
          title: 'Garmin Connect統合',
          steps: [
            'Garmin Connect Developer Programに申請',
            'OAuth 2.0認証フローを実装',
            'Activity APIでワークアウトデータを取得',
            'FITファイルの詳細データを解析'
          ],
          requirements: 'ビジネス用途での利用申請',
          limitations: '読み取り専用、書き込み不可'
        };
      case 'Google':
        return {
          title: 'Google Fit統合',
          steps: [
            'Google Cloud ConsoleでFit APIを有効化',
            'OAuth 2.0スコープを設定',
            'ワークアウトセッションとアクティビティデータを取得',
            'Health Connect APIへの移行準備'
          ],
          requirements: 'Google Cloud Platform アカウント',
          limitations: '2026年にAPI廃止予定'
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Watch className="text-blue-600" />
          スマートウォッチ統合
        </h2>
        
        <Tabs defaultValue="connected" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connected">接続済み ({connectedDevices.length})</TabsTrigger>
            <TabsTrigger value="available">利用可能 ({availableDevices.length})</TabsTrigger>
            <TabsTrigger value="integration">統合ガイド</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connected" className="space-y-4">
            {connectedDevices.length === 0 ? (
              <Alert>
                <Wifi className="h-4 w-4" />
                <AlertDescription>
                  接続されたデバイスがありません。「利用可能」タブからデバイスを接続してください。
                </AlertDescription>
              </Alert>
            ) : (
              connectedDevices.map(device => (
                <Card key={device.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getBrandColor(device.brand)}`} />
                          {device.name}
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardTitle>
                        <CardDescription>
                          最終同期: {device.lastSync ? device.lastSync.toLocaleString('ja-JP') : '未同期'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSync(device.id)}
                          disabled={isConnecting === device.id}
                          size="sm"
                        >
                          {isConnecting === device.id ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              同期中...
                            </>
                          ) : (
                            <>
                              <Activity className="h-4 w-4 mr-2" />
                              同期
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(device.id)}
                          variant="outline"
                          size="sm"
                        >
                          <WifiOff className="h-4 w-4 mr-2" />
                          切断
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isConnecting === device.id && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>同期中...</span>
                          <span>{syncProgress}%</span>
                        </div>
                        <Progress value={syncProgress} className="h-2" />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {device.supportedMetrics.map(metric => (
                        <Badge key={metric} variant="secondary" className="text-xs">
                          {metric === 'heart_rate' && <Heart className="h-3 w-3 mr-1" />}
                          {metric === 'distance' && <MapPin className="h-3 w-3 mr-1" />}
                          {metric === 'calories' && <Zap className="h-3 w-3 mr-1" />}
                          {metric === 'steps' && <Activity className="h-3 w-3 mr-1" />}
                          {metric.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="available" className="space-y-4">
            {availableDevices.map(device => (
              <Card key={device.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getBrandColor(device.brand)}`} />
                        {device.name}
                        <Badge className={getApiStatusColor(device.apiStatus)}>
                          {getApiStatusText(device.apiStatus)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {device.supportedMetrics.length}個のメトリクスをサポート
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => handleConnect(device.id)}
                      disabled={isConnecting === device.id}
                      size="sm"
                    >
                      {isConnecting === device.id ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          接続中...
                        </>
                      ) : (
                        <>
                          <Wifi className="h-4 w-4 mr-2" />
                          接続
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isConnecting === device.id && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>接続中...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <Progress value={syncProgress} className="h-2" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {device.supportedMetrics.map(metric => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric === 'heart_rate' && <Heart className="h-3 w-3 mr-1" />}
                        {metric === 'distance' && <MapPin className="h-3 w-3 mr-1" />}
                        {metric === 'calories' && <Zap className="h-3 w-3 mr-1" />}
                        {metric === 'steps' && <Activity className="h-3 w-3 mr-1" />}
                        {metric.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            {availableDevices.concat(connectedDevices).map(device => {
              const instructions = getIntegrationInstructions(device.brand);
              if (!instructions) return null;
              
              return (
                <Card key={device.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getBrandColor(device.brand)}`} />
                      {instructions.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">統合手順:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {instructions.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">必要な要件:</h4>
                      <p className="text-sm text-gray-600">{instructions.requirements}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">制限事項:</h4>
                      <p className="text-sm text-gray-600">{instructions.limitations}</p>
                    </div>
                    
                    {device.apiStatus === 'deprecated' && (
                      <Alert>
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          このAPIは2026年に廃止予定です。Health Connect APIへの移行を検討してください。
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}