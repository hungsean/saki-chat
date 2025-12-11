# CLAUDE.md

## 專案資訊

### 專案名稱

Saki Chat

### 專案描述

基於 Tauri 的跨平台 Matrix 桌面客戶端,輕量、快速、現代化。

---

## 技術棧

### 應用框架

- **Tauri 2.x** - 桌面應用框架

### 前端核心

- **React 18** - UI 框架
- **TypeScript** - 開發語言
- **Vite** - 建置工具
- **pnpm** - 套件管理

### 樣式系統

- **Tailwind CSS** - CSS 框架
- **shadcn/ui** - UI 元件庫

### 狀態管理

- **Zustand** - 全域狀態管理
- **zustand/middleware/immer** - 不可變資料處理

### Matrix 整合

- **matrix-js-sdk** - Matrix 協議實作

### 資料持久化

- **IndexedDB (idb)** - 訊息快取
- **Tauri Store** - 應用設定

### 路由管理

- **React Router v6** - 頁面導航

### 資料處理

- **immer** - 不可變資料更新
- **date-fns** - 時間處理
- **lodash-es** - 工具函式

### 開發工具

- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化

---

## 專案結構

```text
matrix-client/
├── src/                      # React 前端
│   ├── components/           # UI 元件
│   │   ├── ui/              # shadcn/ui 元件
│   │   ├── chat/            # 聊天相關元件
│   │   └── rooms/           # 房間相關元件
│   ├── features/            # 功能模組
│   │   ├── auth/            # 登入認證
│   │   ├── chat/            # 聊天功能
│   │   └── rooms/           # 房間管理
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts     # 認證狀態
│   │   ├── chatStore.ts     # 聊天狀態
│   │   └── uiStore.ts       # UI 狀態
│   ├── lib/                 # 工具函式與封裝
│   │   ├── matrix/          # Matrix SDK 封裝
│   │   │   ├── client.ts    # 客戶端管理
│   │   │   ├── timeline.ts  # 時間軸管理
│   │   │   └── room.ts      # 房間操作
│   │   ├── storage/         # 儲存相關
│   │   │   ├── indexedDB.ts # 訊息快取
│   │   │   └── tauriStore.ts # 應用設定
│   │   └── utils/           # 通用工具
│   ├── hooks/               # 自訂 hooks
│   ├── types/               # TypeScript 型別定義
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/               # Tauri 後端
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/                  # 靜態資源
├── CLAUDE.md               # 本檔案
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── components.json         # shadcn/ui 設定
```

---

## 開發規範

### 程式碼風格

- 使用 TypeScript strict mode
- 遵循 ESLint + Prettier 規則
- 元件使用 function component + hooks
- 檔案命名: camelCase (檔案) / PascalCase (元件)

### 測試撰寫規範

- **務必參考 TESTING.md** 進行測試撰寫

### Git Commit 規範

- `feat: 新功能`
- `fix: 修復`
- `docs: 文件`
- `style: 格式`
- `refactor: 重構`
- `test: 測試`
- `chore: 雜項`

### 狀態管理原則

- 全域狀態使用 Zustand
- 區域狀態使用 useState/useReducer
- 使用 immer middleware 簡化更新邏輯

### Matrix 整合原則

- 所有 Matrix 操作封裝在 `lib/matrix/`
- 事件監聽統一在 MatrixClientManager
- Timeline 操作使用 TimelineManager

---

## 常用指令

### 開發

```bash
pnpm install          # 安裝依賴
pnpm dev              # 開發模式
pnpm build            # 建置
pnpm lint             # 程式碼檢查
pnpm format           # 格式化程式碼
```

### Tauri

```bash
pnpm tauri dev        # Tauri 開發模式
pnpm tauri build      # 打包應用程式
```

### 測試

```bash
pnpm test              # 測試(監看模式)
pnpm test:ui           # 測試 UI 介面
pnpm test:run          # 執行一次測試
pnpm test:coverage     # 生成覆蓋率報告
```

---

## 注意事項

### 安全性

- Access token 使用 Tauri Store 加密儲存
- 使用者輸入需要過濾 XSS (DOMPurify)
- E2EE 訊息使用 matrix-js-sdk 內建加密

### 效能

- 訊息列表使用虛擬滾動 (react-window)
- IndexedDB 快取最近 7 天訊息
- 圖片使用 lazy loading

### 相容性

- 最低支援 Matrix Server v1.5+
- 支援 E2E 加密房間
- 支援 macOS 11+, Windows 10+, Linux (主流發行版)

---

## 目前開發狀態

### ✅ 已完成

- 專案初始化

### 🚧 進行中

- 專案環境設定

### 📋 待開發

- Tailwind CSS + shadcn/ui 設定
- 基礎專案結構建立
- Zustand stores 設定
- Matrix SDK 整合
- 登入功能
- 房間列表
- 聊天介面
- 訊息快取
- 設定頁面

---

## 其他備註

- 預設情況下請使用英文作為軟體的顯示語言

## 相關資源

- [Tauri 文件](https://tauri.app/)
- [Matrix JS SDK](https://github.com/matrix-org/matrix-js-sdk)
- [Zustand 文件](https://docs.pmnd.rs/zustand/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
