# TODO - Saki Chat 依賴安裝清單

> 根據 CLAUDE.md 技術棧整理的安裝步驟

---

## 📦 依賴安裝進度

### 1. 樣式系統

- [X] **Tailwind CSS 核心套件**
  ```bash
  pnpm add -D tailwindcss postcss autoprefixer
  pnpm tailwindcss init -p
  ```

- [X] **配置 Tailwind CSS**
  - 設定 `tailwind.config.js`
  - 設定 `src/index.css` 引入 Tailwind directives

- [X] **shadcn/ui 初始化**
  ```bash
  pnpm dlx shadcn@latest init
  ```

---

### 2. 狀態管理

- [ ] **Zustand + Immer Middleware**
  ```bash
  pnpm add zustand immer
  ```

---

### 3. Matrix 整合

- [ ] **Matrix JS SDK**
  ```bash
  pnpm add matrix-js-sdk
  ```

---

### 4. 資料持久化

- [ ] **IndexedDB Wrapper**
  ```bash
  pnpm add idb
  ```

- [ ] **Tauri Store Plugin**
  ```bash
  pnpm add @tauri-apps/plugin-store
  ```

---

### 5. 路由管理

- [ ] **React Router v6**
  ```bash
  pnpm add react-router-dom
  ```

---

### 6. 資料處理工具

- [ ] **日期處理**
  ```bash
  pnpm add date-fns
  ```

- [ ] **工具函式庫**
  ```bash
  pnpm add lodash-es
  pnpm add -D @types/lodash-es
  ```

---

### 7. 效能優化

- [ ] **虛擬滾動**
  ```bash
  pnpm add react-window
  pnpm add -D @types/react-window
  ```

---

### 8. 安全性

- [ ] **XSS 防護**
  ```bash
  pnpm add dompurify
  pnpm add -D @types/dompurify
  ```

---

### 9. 開發工具

- [ ] **ESLint 相關**
  ```bash
  pnpm add -D eslint @eslint/js @typescript-eslint/parser @typescript-eslint/eslint-plugin
  pnpm add -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh
  ```

- [ ] **Prettier**
  ```bash
  pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
  ```

- [ ] **建立設定檔**
  - 建立 `.eslintrc.cjs` 或 `eslint.config.js`
  - 建立 `.prettierrc`
  - 建立 `.prettierignore`

---

## 🔧 配置檔案設定

### Tailwind CSS 相關

- [ ] 配置 `tailwind.config.js`
  - 設定 content paths
  - 整合 shadcn/ui theme

- [ ] 配置 `src/index.css`
  - 加入 `@tailwind` directives

- [ ] 配置 `components.json` (shadcn/ui)

---

### TypeScript 相關

- [ ] 檢查 `tsconfig.json` 設定
  - 確認 strict mode
  - 設定 path aliases

---

### Vite 相關

- [ ] 檢查 `vite.config.ts`
  - 設定 path aliases (配合 tsconfig)

---

### Tauri 相關

- [ ] 檢查 `src-tauri/Cargo.toml`
  - 確認需要的 plugins

- [ ] 檢查 `src-tauri/tauri.conf.json`
  - 確認 store plugin 設定

---

## 📁 專案結構建立

- [ ] 建立 `src/components/ui/` (shadcn/ui 元件)
- [ ] 建立 `src/components/chat/`
- [ ] 建立 `src/components/rooms/`
- [ ] 建立 `src/features/auth/`
- [ ] 建立 `src/features/chat/`
- [ ] 建立 `src/features/rooms/`
- [ ] 建立 `src/stores/`
- [ ] 建立 `src/lib/matrix/`
- [ ] 建立 `src/lib/storage/`
- [ ] 建立 `src/lib/utils/`
- [ ] 建立 `src/hooks/`
- [ ] 建立 `src/types/`

---

## 📝 注意事項

- 每完成一項請打勾 ✓
- 安裝過程中如有錯誤請記錄
- 配置檔案請參考 CLAUDE.md 規範
- 安裝完成後記得執行 `pnpm install` 確認
