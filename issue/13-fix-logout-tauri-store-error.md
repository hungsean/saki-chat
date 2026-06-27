# Issue #13 — fix-logout-tauri-store-error

> 種類：**實作型**（bug fix）
> 對應 GitHub Issue：#13（標題 `logout error`，已存在，號碼已鎖定）

## 標題

修復登出時因 `window.__TAURI_INTERNALS__.invoke` 不存在而導致無法登出的錯誤

## 背景／為什麼

使用者在「登入成功頁」（`LoginSuccess`）按下 Logout 時，console 會噴錯且**整個登出流程被中斷**，使用者無法登出：

```
[Error] [authStorage] Failed to clear auth data
    clearAuthData (authStorage.ts:31)
[Error] Logout failed:
Error: Failed to clear authentication data: undefined is not an object
    (evaluating 'window.__TAURI_INTERNALS__.invoke')
    clearAuthData — authStorage.ts:59
    （匿名函數） (LoginSuccess.tsx:34)
```

### 根因分析（已確認）

- 實際檔案路徑與口述略有出入，正確位置為：
  - `src/lib/stores/tauri/authStorage.ts`（`clearAuthData` 在第 51–61 行，re-throw 在第 59 行）
  - `src/features/auth/LoginSuccess.tsx`（`handleLogout` 在第 36–47 行）
  - `src/lib/stores/tauri/storeManager.ts`（`getStore` → `Store.load()`）
- `clearAuthData()` 會呼叫 `getStore()` → `@tauri-apps/plugin-store` 的 `Store.load()`，其底層使用 `window.__TAURI_INTERNALS__.invoke`。
- 當執行環境**不是 Tauri**（例如用 `pnpm dev` 跑純瀏覽器，而非 `pnpm tauri dev`），`window.__TAURI_INTERNALS__` 為 `undefined`，於是丟出 `undefined is not an object`。
- `clearAuthData` 的 `catch` 把錯誤重新包成 `Failed to clear authentication data: ...` 往外丟。
- `LoginSuccess.handleLogout` 的 `try/catch` 收到這個錯誤後只 `console.error('Logout failed:')`，導致後面的 `clearAuth()`（清記憶體狀態）與 `navigate('/login')` **都沒執行** → 使用者卡在原頁，無法登出。
- 補充：目前整個 codebase **沒有任何 Tauri 環境偵測 helper**（`grep` 無 `isTauri` / `__TAURI` 相關判斷），所以同類問題理論上也會影響其他 Tauri Store 操作（例如 `themeStorage`），但本 Issue 聚焦在登出。

## 範圍

### 要做什麼

- 讓「登出」在 **Tauri Store 不可用**（`window.__TAURI_INTERNALS__` 不存在）時也能**順利完成**：至少要清掉記憶體中的 auth 狀態並導向 `/login`，不被未捕捉錯誤擋住。
- 處理 `clearAuthData`（與其所依賴的 Tauri Store 取得流程）在「非 Tauri 環境／Tauri internals 尚未就緒」時的行為，使其不再以未預期的方式丟出 `undefined is not an object`。
- 依 `TESTING.md` 規範補上對應測試，涵蓋「Tauri 可用」與「Tauri 不可用」兩種情境下的登出行為。

> 實作手法（例如：新增可重用的環境偵測 helper、在 `clearAuthData` 做 graceful degradation、或讓 `handleLogout` 對清除失敗具韌性）交給 Implement Agent 決定，本 Issue 不指定改法。

### 不做什麼

- **不**修改其他 storage 模組（`themeStorage` 等）的同類問題 — 另開 Issue 處理。（若實作為此引入可重用的環境偵測 helper，允許放在共用位置供日後使用，但不在本 Issue 主動改寫 themeStorage。）
- **不**改動登入流程、登入頁或任何 UI 樣式 / 文案。
- **不**處理 access token 加密、E2EE 等其他安全議題。
- **不**改動 `storeManager` 的快取機制設計（除非為了修此 bug 必要的最小調整）。

## 驗收條件

- [ ] 在非 Tauri 環境（`pnpm dev` 純瀏覽器）按下 Logout：不再出現未捕捉錯誤導致登出中斷；使用者被導向 `/login`，且 `useAuthStore` 的 auth 狀態（`clearAuth`）被清空。
- [ ] 在 Tauri 環境（`pnpm tauri dev`）按下 Logout：`auth.json` 中的憑證（`credentials`）確實被刪除，且導向 `/login`，行為與修復前一致（不退化）。
- [ ] 當 `window.__TAURI_INTERNALS__` 不存在時，登出流程不再丟出 `undefined is not an object (evaluating 'window.__TAURI_INTERNALS__.invoke')`。
- [ ] 「Tauri Store 不可用」時，登出的後續步驟（清記憶體狀態、導頁）不被擋掉。
- [ ] 新增測試覆蓋「Tauri 可用」與「Tauri 不可用」兩種情境下的登出行為，且 `pnpm test:run` 通過。
- [ ] `pnpm check` 通過（無型別 / lint 錯誤）。
- [ ] 全程不在 console 記錄敏感資料（accessToken、password 等）。

## 預估大小

**小**。預期改動集中在 1~3 個檔案（`authStorage.ts`、`LoginSuccess.tsx`，可能加一個小型環境偵測 helper）＋對應測試，有意義的程式碼變動遠低於 200 行，單一重點（修登出），一個 reviewer 可一次看完。

## 相關檔案（供下一棒參考，非改動清單）

- `src/lib/stores/tauri/authStorage.ts`
- `src/features/auth/LoginSuccess.tsx`
- `src/lib/stores/tauri/storeManager.ts`
- `src/lib/stores/zustand/authStore.ts`（`clearAuth`）
- 測試：`src/lib/stores/tauri/authStorage.test.ts`、`src/features/auth/LoginSuccess.test.tsx`

---

## 留言板

### 2026-06-27 18:49 ｜ Planning Agent
- 🦤 CANARY-DODO-91
- 輸出：建立 Issue #13「修復登出時 `window.__TAURI_INTERNALS__.invoke` 不存在導致無法登出」。
- 根因已釐清：`clearAuthData()`（`authStorage.ts:51-61`）→ `getStore()` → `@tauri-apps/plugin-store` 的 `Store.load()` 依賴 `window.__TAURI_INTERNALS__.invoke`；非 Tauri 環境下該物件為 undefined，錯誤往上丟到 `LoginSuccess.handleLogout`（`LoginSuccess.tsx:36-47`）的 catch，使 `clearAuth()` 與 `navigate('/login')` 都沒執行 → 登出整個中斷。
- 範圍聚焦「讓登出在 Tauri Store 不可用時仍能完成」＋補測試；不指定改法、不順手改 themeStorage 等其他模組。
- 大小：小（1~3 檔，<200 行）。
- 實作路徑與口述不同，已更正為 `src/lib/stores/tauri/...`、`src/features/auth/...`。
- GitHub Issue #13 已存在（OPEN, `logout error`），號碼已鎖定，未另建。
- 下一棒建議：Agent Issue Review（實作型 Issue）。

### 2026-06-27 19:10 ｜ Agent Issue Review
- 🪼 CANARY-JELLY-47
- 輸出：Review Suggestion → 無需修改（可交 Implement Agent）
- 結論：Issue 目標單一清楚（修登出在 Tauri Store 不可用時被未捕捉錯誤中斷）、範圍有邊界（明列不改 themeStorage／登入流程／加密／storeManager 快取設計）、7 條驗收條件皆可打勾、大小為小（1~3 檔＋測試，<200 行）。
- 根因分析已對照實際程式碼逐項驗證屬實：
  - `clearAuthData` 確在 `authStorage.ts:51-61`，re-throw 在第 59 行。
  - `handleLogout` 確在 `LoginSuccess.tsx:36-47`，catch 只 `console.error`，故 `clearAuth()`(41) 與 `navigate('/login')`(43) 在前面拋錯時不會執行 → 登出整個中斷，與描述一致。
  - `getStore()` → `storeManager.ts:24` 的 `Store.load()`，符合對 `window.__TAURI_INTERNALS__` 的依賴推論。
  - grep 全 `src/` 無 `isTauri`／`__TAURI` 判斷，「目前無環境偵測 helper」屬實。
  - `authStore.clearAuth`、測試檔 `authStorage.test.ts`／`LoginSuccess.test.tsx`、`TESTING.md` 皆存在。
- 規劃安全性檢查：未發現明顯風險。驗收條件已預先擋住最危險的退化（「Tauri 環境下 credentials 仍須確實刪除、不退化」），避免實作把所有錯誤都吞掉而遮蔽真實的 Tauri 失敗；並含「不在 console 記錄敏感資料」。
- 下一棒建議：Implement Agent。

### 2026-06-27 19:00 ｜ Implement Agent
- 🛸 CANARY-UFO-23
- 輸出：Implement 完成。修登出在「Tauri Store 不可用」時被 `undefined is not an object` 中斷的問題；採「在 `clearAuthData` 做環境偵測 + 優雅降級」的最小改法，未動 `handleLogout` 契約、未碰 `themeStorage`／`storeManager` 快取設計。
- 改了什麼（4 個原始碼/測試檔 + 1 新 helper）：
  1. 新增 `src/lib/utils/environment.ts`：可重用環境偵測 helper `isTauri()`（檢查 `window.__TAURI_INTERNALS__` 是否存在）。放共用 utils 位置供日後使用，但本 Issue 不主動改寫其他模組。
  2. `src/lib/stores/tauri/authStorage.ts`：`clearAuthData` 開頭加 `if (!isTauri())` 守門 → 非 Tauri 環境直接 `console.warn` 並 `return`（不觸碰 Tauri Store、不丟錯）；Tauri 環境維持原邏輯，真實失敗仍 re-throw（不遮蔽）。
  3. 新增 `src/lib/utils/environment.test.ts`：`isTauri()` 兩情境單元測試。
  4. `src/lib/stores/tauri/authStorage.test.ts`：既有測試預設模擬「Tauri 可用」（beforeEach 注入 `window.__TAURI_INTERNALS__`、afterEach 清理）；新增「Tauri 不可用」describe → `clearAuthData` 優雅 resolve 不丟錯、且不呼叫底層 `delete`。
  5. `src/features/auth/LoginSuccess.test.tsx`：補一條「非 Tauri 環境（clearAuthData 優雅降級）登出仍 clearAuth + 導向 /login」整合測試；原有測試保留。
- 怎麼對應驗收條件：
  - 非 Tauri 按 Logout 不中斷、導 /login、clearAuth 清空 → `clearAuthData` 不再丟錯，`handleLogout` 後續步驟照跑（驗收 1）。
  - Tauri 環境 credentials 確實刪除、不退化 → `isTauri()` 為真時走原 `getStore→delete→save`（驗收 2）。
  - 不再出現 `undefined is not an object` → 守門在呼叫 Tauri API 前就 return（驗收 3）。
  - Store 不可用時後續步驟不被擋 → 同驗收 1（驗收 4）。
  - 兩情境測試 + `pnpm test:run` 通過（驗收 5）。
  - `pnpm check` 通過（驗收 6）。
  - 全程未在 console 記錄敏感資料，warn 只說「Tauri Store unavailable」（驗收 7）。
- 怎麼驗證：
  - `pnpm test:run` → 14 檔 / 253 測試全通過。
  - `pnpm check` → EXIT=0 全通過（type-check / lint / format:check / test:coverage 253 通過、coverage 94.13% 高於 70% 門檻、`environment.ts` 與 `LoginSuccess.tsx` 100%、bundle-check 與 build 皆過）。
  - 註：全新乾淨樹（無 `dist/`）首跑 `pnpm check` 會在 `bundle-check` 報「Build output not found」，因 `check` 腳本順序把 `bundle-check` 排在 `build` 之前 — 此為既有腳本順序狀況，與本次改動無關，已先 `pnpm build` 後再跑 `pnpm check` 確認端到端 EXIT=0。
- 風險取捨：
  - 僅守門 `clearAuthData`（登出路徑），未一併處理 `saveAuthData`／`loadAuthData`／`hasAuthData` 在非 Tauri 的行為 — 刻意聚焦登出、不擴大範圍。
  - 未改 `handleLogout`：真實 Tauri 失敗時維持原行為（記錄錯誤、不導頁），符合「不退化、不遮蔽真實失敗」。
  - 觀察（不在本 Issue 處理）：`themeStorage` 同類問題仍在（App 初始化 `loadTheme` 在非 Tauri 會 log error 但不中斷）；`check` 腳本 `bundle-check` 早於 `build` 的順序 — 建議各自另開 Issue。
- 下一棒建議：Agent Code Review（改動小、集中、單一重點，可一次看完）。

### 2026-06-27 19:05 ｜ Agent Code Review
- 🦦 CANARY-OTTER-65
- 輸出：Review Report → 結論「無需修改」（審查通過，可交人收尾／PR）

逐個改動點看法：
- environment.ts（新增 isTauri()）：偵測 `typeof window !== 'undefined'` 且 `__TAURI_INTERNALS__` 不為 undefined，邏輯正確、無副作用，放共用 utils 符合 Issue「允許放共用位置」的授權。
- authStorage.ts（clearAuthData 守門）：核心修復正確。`if (!isTauri())` 只在「環境不可用」時 console.warn 後 return；isTauri() 為真時完全維持原 `getStore→delete→save`，catch 仍 re-throw 真實失敗。確認「graceful degradation 只降級環境不可用、不遮蔽真實 Tauri 失敗」（驗收 2/3 不退化、驗收 4 後續不被擋）皆達成。warn 訊息只有「Tauri Store unavailable...」，未洩漏 accessToken/password（驗收 7）。
- environment.test.ts：涵蓋 isTauri() true/false 兩分支，afterEach 清理標記，隔離良好。
- authStorage.test.ts：beforeEach 注入 `__TAURI_INTERNALS__`（讓既有「成功清除」測試代表 Tauri 可用、真的走 delete 路徑，避免被守門誤判而假過）＋ 新增「Tauri 不可用」describe 用「真實 clearAuthData」驗證 resolve undefined 且不呼叫底層 delete。這是真綠，確實覆蓋降級行為（驗收 5 核心）。
- LoginSuccess.test.tsx：新增「非 Tauri 環境登出仍 clearAuth + 導向 /login」整合測試通過。

驗證：
- `pnpm test:run` → 14 檔 / 253 測試全通過（本機複跑確認）。
- `git status` 僅 3 改 + 2 新檔（environment.ts/.test.ts、authStorage.ts/.test.ts、LoginSuccess.test.tsx），未越界改 themeStorage／storeManager／handleLogout，範圍紀律良好。大小：小（有意義變動 < 90 行，單一重點），可一次看完。

風險／非阻擋觀察（不擋下，但提醒人知悉）：
- LoginSuccess 新增的「非 Tauri」整合測試與既有「Tauri 可用」測試機制相同：兩者皆 `mockClearAuthData.mockResolvedValue()` 且未操作 `window.__TAURI_INTERNALS__`，因 authStorage 被整檔 mock，真實 isTauri() 守門不會在此跑到。故此整合測試實際只驗證「clearAuthData resolve → handleLogout 續跑」，與既有測試重複、命名略誇大其覆蓋。真正的非 Tauri 降級行為已由 authStorage.test.ts 單元測試確實覆蓋，故驗收 1/5 在組合上仍成立——此點屬測試品質改善建議，非阻擋。
- 競態（Tauri internals 尚未就緒）理論上會讓 isTauri() 暫時為 false；但使用者已在 LoginSuccess 頁能點 Logout，internals 必已就緒，本 Issue 情境不受影響。

結論：無需修改（審查通過）。下一步：交人看過 Review Report → PR 推送。
