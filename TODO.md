# TODO - Saki Chat

## 🎨 Theme 切換功能

### 功能說明

實作應用程式主題切換系統,支援以下主題模式:

- **system** - 跟隨系統主題設定
- **light** - 淺色主題
- **dark** - 深色主題
- **saki** - 專屬特色主題

### 開發任務

- [ ] 建立 theme store (Zustand)
  - 定義 theme type: 'system' | 'light' | 'dark' | 'saki'
  - 實作 theme 切換邏輯
  - 整合 Tauri Store 持久化

- [ ] 實作 theme provider
  - 建立 ThemeProvider component
  - 處理 system theme 偵測
  - 套用對應的 CSS classes

- [ ] 設計 Tailwind CSS theme 配置
  - 配置 light theme colors
  - 配置 dark theme colors
  - 設計 saki theme 專屬配色

- [ ] 建立 theme 切換 UI
  - 使用 shadcn/ui 元件
  - 建立 theme selector
  - 加入視覺化預覽

- [ ] 測試
  - 測試各主題切換
  - 測試 system theme 自動切換
  - 測試設定持久化

---

## 🔧 程式碼品質改進

### UX & 錯誤處理

- [ ] 在 App.tsx 初始化時加入 loading 狀態管理
  - 在 `initializeAuth` 函式中加入 `setLoading(true/false)`
  - 修復頁面刷新時的 UI 閃爍問題
  - 嚴重程度: 低-中

- [ ] 改善 LoginForm.tsx 的錯誤處理
  - 針對不同 Matrix 錯誤碼提供友善訊息 (M_FORBIDDEN, M_USER_DEACTIVATED 等)
  - 優化 `displayError` 函式邏輯
  - 嚴重程度: 低

- [ ] 修正 LoginSuccess 按鈕 disabled 狀態的動畫問題
  - 移除 disabled 狀態時的 hover 動畫
  - 避免使用者混淆
  - 優先級: 低

### 測試覆蓋

- [ ] 檢查 client.test.ts 和 authStorage.test.ts 的測試覆蓋
  - 確認 Matrix SDK mock 是否正確
  - 確認 Tauri Store mock 是否涵蓋所有情況

### 效能優化

- [ ] 調查使用 dynamic import 延遲載入 Matrix SDK 的可行性
  - 目前 matrix-js-sdk WASM 約 5.3MB
  - Bundle size 限制已提升至 10MB
  - 考慮延遲載入以改善初始載入速度
  - 優先級: 低

---

## 📝 注意事項

- saki theme 需要設計符合專案特色的配色方案
- system theme 需監聽作業系統主題變更事件
- theme 設定需即時套用,無需重新載入
- 確保所有 UI 元件在各主題下都能正常顯示
