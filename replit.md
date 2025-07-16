# Habit Tracker Application

## Overview

This is a comprehensive multi-goal habit tracking application built with React, Express, and PostgreSQL. The app supports multiple goal categories (workout, sleep, hydration, etc.) with flexible goal management. It features a modern UI with goal-specific detail pages, mini calendar visualizations, statistics tracking, and comprehensive smartwatch integration for automatic data import from Apple Watch, Huawei Watch, Xiaomi Mi Band, Garmin devices, and Google Fit.

## User Preferences

Preferred communication style: Simple, everyday language.
Cost optimization: Use free tier only - no paid server costs.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reloading with Vite integration
- **Build**: esbuild for production bundling

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for schema management
- **Development Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
- **goals**: Stores user goals with flexible types (workout-distance, workout-heart-rate, sleep-time, sleep-score, etc.)
- **workouts**: Records individual workout sessions with metrics
- **habitData**: Tracks daily achievement status for each goal with actual values

### API Endpoints
- `GET /api/goals` - Retrieve all goals or filter by category
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update specific goal
- `DELETE /api/goals/:id` - Delete specific goal
- `GET /api/workouts` - Fetch workout history
- `POST /api/workouts` - Create new workout entry
- `GET /api/habit-data` - Retrieve habit tracking data with optional filters
- `POST /api/habit-data` - Create/update daily habit data
- `GET /api/statistics` - Get aggregated statistics
- `GET /api/smartwatch/available` - Get available smartwatch APIs
- `POST /api/smartwatch/auth/:brand` - Authenticate with smartwatch APIs
- `POST /api/smartwatch/sync/:brand` - Sync workout data from smartwatch

### Frontend Components
- **Home Page**: Goal management dashboard with category-based organization and mini calendar dots
- **Goal Detail Page**: Individual goal tracking with full calendar, statistics, and achievement history
- **Settings Page**: Tabbed interface for goal management and smartwatch integration
- **CalendarView**: Visual habit tracking calendar with color-coded achievement levels
- **StatisticsCard**: Displays streak, total days, and achievement rates
- **GoalSettingsModal**: Modal for updating fitness goals
- **WorkoutHistory**: List of recent workout sessions with clickable details
- **WorkoutDetailModal**: Detailed workout information and goal achievement status
- **SmartWatchIntegration**: Comprehensive smartwatch device management and data sync

## Data Flow

1. **Goal Management**: Users set fitness goals through the settings modal
2. **Workout Tracking**: Workout data is recorded and stored with timestamps
3. **Habit Evaluation**: Daily habit data is generated based on goal achievement
4. **Statistics Calculation**: Server calculates streaks and achievement rates
5. **Calendar Visualization**: Frontend displays achievement status on calendar

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with extensive Radix UI component library
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack Query for server state management
- **Form Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with Zod integration for type safety
- **Development**: tsx for TypeScript execution, Vite for development server

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with file watching for auto-restart
- **Database**: Development uses in-memory storage (MemStorage class)

### Production
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Static Files**: Express serves built frontend assets
- **Environment**: NODE_ENV=production enables production optimizations

### Configuration
- **Environment Variables**: DATABASE_URL required for production
- **Build Commands**: `npm run build` creates production artifacts
- **Start Command**: `npm start` runs production server

## Recent Changes

### PWA機能の完全実装 (July 2025)
- **完全なPWAマニフェスト**: アプリ名、アイコン、テーマカラーを含む完全なmanifest.jsonを作成
- **カスタムアプリアイコン**: 習慣トラッカーに適した192x192と512x512のSVGアイコンを作成
- **Service Worker登録**: PWA機能を有効にするためのService Workerを実装
- **ブラウザショートカット問題解決**: スマホのホーム画面に適切にアプリとして追加される仕様に修正
- **スタンドアロン表示**: PWAアプリとして独立して動作する設定を完了

### 目標削除機能の実装 (July 2025)
- **目標詳細ページ削除**: 確認ダイアログ付きの削除ボタンを追加
- **ホーム画面削除**: 各目標カードに削除アイコンを追加
- **確認ダイアログ**: 誤削除防止のための確認機能を実装
- **適切なフィードバック**: 削除成功・失敗時のトースト通知を追加
- **キャッシュ更新**: 削除後の適切なデータ更新を実装

### アカウント登録・ログイン機能の実装 (July 2025)
- **完全認証システム**: JWT トークンベースの認証システムを実装
- **ログイン・登録画面**: 統合されたログイン・アカウント登録ページを作成
- **未認証ユーザーリダイレクト**: 未認証ユーザーを自動的にログイン画面に誘導
- **API認証保護**: 全APIエンドポイントに認証ミドルウェアを適用
- **ログアウト機能**: JWTトークンの削除とセッション管理
- **シンプルフォーム**: 名前・姓フィールドを削除し、メールアドレスとパスワードのみで登録

### useRefエラー解決とアプリケーション復元 (July 2025)
- **Gitコミット復元**: 2f652b20970ccbb0adbb73743ac405ef53be414f の動作する状態に復元
- **認証システム除去**: JWTトークンベース認証を完全に削除し、シンプルな固定ユーザーID使用
- **キャッシュ問題解決**: 全てのキャッシュファイル削除、Service Worker最小化、ブラウザキャッシュ無効化
- **useRefエラー修正**: React useRefエラーの原因となるキャッシュ問題を解決
- **アプリケーション安定化**: 正常動作確認、全機能が期待通りに動作

### Free Tier Optimization (July 2025)
- **Database Connection Pool**: Optimized for free tier with max 1 connection, reduced timeout
- **Logging Optimization**: Minimized verbose logging to reduce memory usage
- **Service Worker**: Streamlined caching for smaller memory footprint
- **Fallback Storage**: Auto-switch to in-memory storage if database unavailable
- **Resource Efficiency**: Configured for 512MB memory limit and reduced resource usage
- **Cache Problem Resolution**: Fixed reload blank screen issue by disabling service worker in development, adding cache control headers, and optimizing React Query settings

### Fitbit OAuth認証の実装成功 (July 2025)
- **OAuth認証フロー**: 完全に動作する認証システムを実装
- **実際のデータ取得**: Fitbitアカウントから実際のワークアウトデータの取得に成功
- **データ精度向上**: 重複データ除去、時間変換精度向上、距離データ精度向上を実装
- **実測データ確認**: 3件の実際のFitbitワークアウトデータを確認（2025年6月22日×2件、2025年7月15日×1件）
- **継続時間修正**: 2025年7月15日のデータの継続時間を正しい値（13分48秒）に修正
- **認証状態の永続化**: アクセストークンの適切な保存と管理
- **詳細ログ**: プロファイル確認、複数APIエンドポイントの試行、エラー処理の改善

## Recent Changes

### Smartwatch Integration (July 2025)
- **Comprehensive API Integration**: Added support for Apple HealthKit, Huawei Health Kit, Xiaomi Mi Fitness (via Google Fit), Garmin Connect, and Google Fit APIs
- **SmartWatch Integration UI**: Created tabbed interface for device management with connection status, sync progress, and integration guides
- **API Architecture**: Implemented unified SmartWatchAPI interface with authentication, data fetching, and transformation capabilities
- **Real-time Sync**: Added progress tracking and status indicators for device connections and data synchronization
- **API Status Tracking**: Integrated awareness of API limitations (Google Fit deprecation 2026, Xiaomi unofficial API)

### Multi-Goal Management System (July 2025)
- **Flexible Goal Types**: Expanded from workout-only to multiple categories (workout, sleep, hydration, etc.)
- **Goal Detail Pages**: Individual goal tracking with comprehensive statistics and calendar visualization
- **Mini Calendar Integration**: Added 7-day mini calendar dots on home page goal cards
- **Enhanced Database Schema**: Restructured to support flexible goal types with actual value tracking
- **Clickable Goal Cards**: Goals on home page now navigate to detailed tracking pages

### Manual Workout Entry Removal (July 2025)
- **Removed Manual Entry**: Eliminated workout addition functionality to focus on automated smartwatch data import
- **Enhanced Sample Data**: Expanded July 2025 sample data to 14 entries demonstrating various achievement patterns
- **Calendar Visualization**: Implemented color-coded achievement levels (green=full, yellow=partial, red=workout only, gray=no activity)

The application uses a monorepo structure with shared TypeScript definitions, enabling type safety across the full stack. The development setup includes hot reloading and error overlays for rapid development.