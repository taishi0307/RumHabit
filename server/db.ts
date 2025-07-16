import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 無料プラン用の最適化された接続プール設定
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // 無料プランでは接続数を制限
  max: 1,
  // 接続をより早く閉じる
  idleTimeoutMillis: 10000,
  // 接続タイムアウトを短縮
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: pool, schema });