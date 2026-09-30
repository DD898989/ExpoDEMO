# ExpoDEMO 全端跨平台整合專案 (Expo + Next.js + NestJS)

本專案是一個輕量級且功能完備的 Monorepo 架構示範，整合了 **行動端/跨平台應用 (Expo React Native)**、**現代化全端網站 (Next.js 16)** 以及 **後端微服務 (NestJS 10)**。透過根目錄共享的 `COMMON.ts`，實現全端強型別對齊與極速開發測試體驗。

---

## 📑 目錄

1. [專案架構概覽](#1-專案架構概覽)
2. [三大專案 launch.json 偵錯模式 (Debug) 詳細介紹](#2-三大專案-launchjson-偵錯模式-debug-詳細介紹)
   - [Expo (Web 斷點偵錯 + Metro 背景任務)](#21-expo-vscode-偵錯設定)
   - [NestJS (Node-Terminal 自動附加偵錯)](#22-nestjs-vscode-偵錯設定)
   - [Next.js (開發模式與生產建置雙偵錯)](#23-nextjs-vscode-偵錯設定)
3. [COMMON.ts — 跨端共享型別與設定的核心機制](#3-commonts--跨端共享型別與設定的核心機制)
4. [Expo 快速測試機制：__DEV__ 與手機端自動化模擬測試](#4-expo-快速測試機制dev-與手機端自動化模擬測試)
   - [實作機制與設計思維](#41-實作機制與設計思維)
   - [「雖然污染原始碼，但極速驗證」的權衡與優勢](#42-雖然污染原始碼但極速驗證的權衡與優勢)
5. [延伸亮點與進階技巧](#5-延伸亮點與進階技巧)
   - [Next.js 16 四大渲染模式 DEMO (SSR / CSR / SSG / ISR)](#51-nextjs-四大渲染模式-demo)
   - [實機連線與 CORS 網路架構要點](#52-實機連線與-cors-網路架構要點)
   - [Metro Bundler 跨目錄解析防坑指南](#53-metro-bundler-跨目錄解析防坑指南)
6. [快速啟動指南](#6-快速啟動指南)

---

## 1. 專案架構概覽

```text
ExpoDEMO/
├── COMMON.ts                 # 🌟 全端共用核心：型別介面 (Req/Resp)、共用常數、API 端點定義
├── Expo/                     # 📱 Expo / React Native 行動端 & Web 專案
│   ├── .vscode/
│   │   ├── launch.json       # Expo Web + Edge 偵錯啟動組態
│   │   └── tasks.json        # 自動化背景啟動 npx expo start --web 任務
│   ├── App.tsx               # 行動端首頁 (包含 API 呼叫展示與遊戲元件)
│   ├── RPSGame.tsx           # 猜拳遊戲核心邏輯
│   ├── RPSSimulator-TEST.tsx # ⚡ __DEV__ 專用自動化連續點擊模擬測試器
│   └── metro.config.js       # 跨專案解析 @common 與排除無關目錄的 Metro 設定
├── NestJS/                   # ⚙️ NestJS 後端 API 服務
│   ├── .vscode/
│   │   └── launch.json       # Node Terminal 快速偵錯啟動
│   ├── src/
│   │   ├── main.ts           # 監聽 0.0.0.0 與 API_PORT，開放 CORS
│   │   └── app.controller.ts # 實作 CommonApi 介面定義的 Router 端點
│   └── tsconfig.json         # 設定 @common 路徑映射
└── Next.js/                  # 🌐 Next.js 16 Web 前端應用
    ├── .vscode/
    │   └── launch.json       # Run next (開發) 與 Build and Start (生產) 雙重偵錯
    ├── src/app/
    │   ├── page.tsx          # 前端首頁 (連線後端 API 並測試 COMMON 函式)
    │   └── demo/             # 4 大渲染模式展示
    │       ├── ssr/          # 伺服器端渲染 (dynamic = 'force-dynamic')
    │       ├── csr/          # 客戶端渲染 ('use client')
    │       ├── ssg/          # 靜態生成 (dynamic = 'force-static')
    │       └── isr/          # 增量靜態再生產 (revalidate = 10)
    └── tsconfig.json         # 設定 @common 路徑映射
```

---

## 2. 三大專案 launch.json 偵錯模式 (Debug) 詳細介紹

各子專案皆在 `.vscode/launch.json` 中配置了專屬的除錯模式，讓開發者在 Visual Studio Code 中一鍵按下 `F5` 即可立即進入最佳化除錯流程：

### 2.1. Expo VSCode 偵錯設定

位於 `Expo/.vscode/launch.json` 與 `Expo/.vscode/tasks.json`：

```json
// Expo/.vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Expo Web(press j for GO APP)",
      "type": "msedge",
      "request": "launch",
      "url": "http://localhost:8081",
      "preLaunchTask": "expo-web"
    }
  ]
}
```

#### 🔍 機制解析：
1. **`preLaunchTask: "expo-web"`**：
   - 啟動偵錯前，VS Code 會先在背景執行 `Expo/.vscode/tasks.json` 中宣告的 `npx expo start --web` 任務。
   - 任務利用 `problemMatcher` 的 `endsPattern: "Waiting on|Logs for"` 偵測 Metro Bundler 是否已就緒，伺服器準備好後才會繼續呼叫瀏覽器，避免提早開啟瀏覽器導致 404 錯誤。
2. **`type: "msedge"`**：
   - 自動開啟 Microsoft Edge 並附加（Attach）Chrome DevTools Protocol (CDP)，可直接在 VS Code 原始碼檔案（如 `App.tsx`、`RPSGame.tsx`）中設置中斷點進行行級偵錯。
3. **名稱提示 `(press j for GO APP)` 的意義**：
   - 當您需要在手機實機（Expo Go）中同步偵錯時，只需在執行的 Expo 終端機中按下 `j` 鍵，即可呼叫 React Native 偵錯工具（Debugger）或連接至偵錯工作階段，無縫切換網頁除錯與原生端除錯。

---

### 2.2. NestJS VSCode 偵錯設定

位於 `NestJS/.vscode/launch.json`：

```json
// NestJS/.vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "command": "npm start",
      "name": "Run npm start",
      "request": "launch",
      "type": "node-terminal"
    }
  ]
}
```

#### 🔍 機制解析：
1. **`type: "node-terminal"`**：
   - 採用 VS Code 的 JavaScript Debugger 終端整合模式。
   - 當執行 `npm start`（呼叫 `nest start`）時，VS Code 會自動將 `NODE_OPTIONS` 除錯旗標注入該終端處理序中。
2. **優勢**：
   - **零繁瑣設定**：不需要手動配置 `--inspect` 連接埠（9229），也不需要設定複雜的 `attach` 延遲連線。
   - **即時斷點攔截**：只要 Expo App 或 Next.js 發送 HTTP 請求（例如打向 `@Post(CommonApi.Router)`），VS Code 會精準在中斷點暫停，可檢視 `body`、變數狀態與 call stack。

---

### 2.3. Next.js VSCode 偵錯設定

位於 `Next.js/.vscode/launch.json`，提供雙重偵錯組態：

```json
// Next.js/.vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run next",
      "runtimeExecutable": "next",
      "cwd": "${workspaceFolder}",
      "args": []
    },
    {
      "name": "Build and Start",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run build:start"
    }
  ]
}
```

#### 🔍 機制解析：
1. **模式一：`Run next`（開發除錯）**：
   - 以 `type: "node"` 直接執行 Next.js CLI。
   - **適用情境**：在日常開發階段偵錯 **React Server Components (RSC)**、**SSR 渲染流程**、**Route Handlers** 與伺服端資料獲取（`fetch`）。斷點直接對應 TypeScript 原始碼檔案。
2. **模式二：`Build and Start`（生產與建置除錯）**：
   - 執行 `npm run build:start`（即 `next build && next start`）。
   - **適用情境**：驗證 **SSG (靜態生成)** 在 build-time 的生成行為，以及 **ISR (增量靜態再生產)** 在生產模式下的快取與背景再生機制（因為 ISR / SSG 的真實快取行為在 `next dev` 下每次都會重新編譯，唯有在 build 後執行才能觀察完整生命週期）。

---

## 3. COMMON.ts — 跨端共享型別與設定的核心機制

根目錄下的 `COMMON.ts` 是整套全端系統的「單一真相來源 (Single Source of Truth)」：

```typescript
// COMMON.ts
export const API_HOST = 'http://192.168.0.52';
export const API_PORT = 3001;
export const API_BASE_URL = `${API_HOST}:${API_PORT}`;

export function CommonFunction(serviceName: string): string {
  return `CommonFunction called by ${serviceName} directly.`;
}

export namespace CommonApi {
  export const Router = 'abc/def/ghi';

  export interface Req {
    A: string;
    B: string;
  }

  export interface Resp {
    AconcatB: string;
  }
}
```

### 3.1. 跨專案映射設定方式

三大專案皆透過路徑別名（Path Alias）`@common` 參照此檔案，完全無需發布 npm 私有套件：

| 專案 | 配置檔案 | 配置方式 |
| :--- | :--- | :--- |
| **NestJS** | `NestJS/tsconfig.json` | `"paths": { "@common": ["../COMMON"] }`，並指定 `"rootDir": ".."` |
| **Next.js** | `Next.js/tsconfig.json` | `"paths": { "@common": ["../COMMON"] }` (Next.js 編譯器原生支援跨目錄解析) |
| **Expo** | `Expo/tsconfig.json` + `metro.config.js` | TypeScript 透過 paths 映射；Metro 透過 `watchFolders` 與 `extraNodeModules` 解析 |

### 3.2. 解決的痛點

1. **端點契約（API Contract）強型別保障**：
   - 後端 NestJS 實作：
     ```typescript
     @Post(CommonApi.Router)
     handleCommonApi(@Body() body: CommonApi.Req): CommonApi.Resp {
       return { AconcatB: `${body.A}${body.B}` };
     }
     ```
   - 前端 (Expo / Next.js) 呼叫端：
     ```typescript
     const reqBody: CommonApi.Req = { A: "Hello", B: "World" };
     const res = await fetch(`${API_BASE_URL}/${CommonApi.Router}`, { ... });
     const data: CommonApi.Resp = await res.json();
     ```
   - 一旦後端更動欄位或路由，前端在編輯器中**立即收到型別錯誤警告**，徹底杜絕前後端溝通落差。
2. **多裝置實機連線配置只需修改一次**：
   - 當行動裝置在同個區域網路下測試時，只要將 `API_HOST` 改為目前開發機的區域網路 IP（例如 `192.168.0.52`），Expo、Next.js 與 NestJS 便會全面同步，無須逐一翻找各專案的 `.env` 檔案。

---

## 4. Expo 快速測試機制：\_\_DEV\_\_ 與手機端自動化模擬測試

在 `Expo/RPSGame.tsx` 與 `Expo/RPSSimulator-TEST.tsx` 中，展示了一種針對行動裝置的快速驗證模式：

```tsx
// Expo/RPSGame.tsx
export default function RPSGame() {
  // ...遊戲主邏輯...

  return (
    <View style={styles.container}>
      {/* 正常使用者 UI */}
      <View style={styles.row}>
        {CHOICES.map((choice) => (
          <Button key={choice} title={choice} onPress={() => play(choice)} />
        ))}
      </View>

      {/* ⚡ 開發模式限定的自動化模擬器 */}
      {__DEV__ && (
        <RPSSimulatorTest onPlay={play} onResetScore={resetScore} />
      )}
    </View>
  );
}
```

### 4.1. 實作機制與設計思維

`RPSSimulatorTest` 提供了一個「連續猜 100 次」的按鈕：
- **超高速連點測試**：以迴圈搭配 `setTimeout(10ms)`，在 1 秒內自動觸發 100 次出拳與計分更新。
- **即時中斷機制**：使用 React `useRef(false)` 作為停止旗標，隨時可按下「停止」中止測試。
- **驗證核心**：快速檢驗 React Native 的高頻 State 更新、UI 渲染效能、勝負判定邊界狀況以及重置（Reset）是否穩定無 Crash。

---

### 4.2. 「雖然污染原始碼，但極速驗證」的權衡與優勢

> 💡 **核心哲學探討**：
> 在元件程式碼中直接寫入 `{__DEV__ && <RPSSimulatorTest />}`，在傳統架構視角上確實屬於**「測試程式碼污染業務程式碼 (Code Pollution)」**。但為何在 App 敏捷開發中極具實戰價值？

#### ⚖️ 效益與代價比較：

| 評估面向 | 傳統端對端測試 (如 Detox / Appium) | `__DEV__` 嵌入式手機端測試元件 |
| :--- | :--- | :--- |
| **環境搭建成本** | 極高（需配置原生驅動、模擬器環境、CI/CD 虛擬機） | **零成本**（只要會寫 React 元件就能寫測試） |
| **實機 (Real Device) 驗證** | 設定複雜，常因連線或驅動問題中斷 | **極速**（手機拿起 Expo Go 掃碼立刻隨手測） |
| **除錯速度** | 失敗時需翻閱厚重測試紀錄檔 | **即時可視化**（直接在手機螢幕上看數字滾動） |
| **高頻壓力測試** | 需寫腳本模擬點擊，執行速度受限於驅動 IPC | **極速反應**（10ms 一局，1 秒測完 100 次狀態連鎖） |
| **程式碼乾淨度** | 業務原始碼 100% 乾淨 | 業務元件會被帶有測試字眼的區塊稍微佔據 |

#### 🛡️ 為什麼在 Production 是安全的？
- **編譯期死碼消除 (Dead Code Elimination, DCE)**：
  在 React Native / Expo 進行生產發布建置（Release Build，如 `npx expo export`、產生 APK / AAB / IPA）時，打包工具（Metro + Terser/Babel）會將全域常數 `__DEV__` 替換為常數 `false`。
  ```javascript
  // 原始碼
  if (__DEV__) { ... }

  // 建置後轉換為
  if (false) { ... } // -> Terser 會直接將此 if 區塊自產物中完整剝除！
  ```
- **正式環境零洩漏**：一般使用者下載的正式版本完全不會看到此測試按鈕，亦不會增加發布產物的負擔。

#### 💡 實戰最佳化建議：
1. **檔案命名約定**：統一加上 `-TEST.tsx`（如 `RPSSimulator-TEST.tsx`），以便一眼識別。
2. **動態載入進一步隔離**：若想避免測試元件在非必要時載入，可改為 `React.lazy` 動態載入。
3. **專屬 Debug 面板**：當專案規模擴大時，可將各元件的測試工具集中到獨立的隱藏手勢或「開發者除錯抽屜 (Dev Drawer)」中。

---

## 5. 延伸亮點與進階技巧

### 5.1. Next.js 四大渲染模式 DEMO

在 `Next.js/src/app/demo/` 目錄中，完整實作了 Next.js 16 App Router 下的四種經典渲染機制，可於啟動後進行對比：

- **SSR (伺服器端渲染) — `/demo/ssr`**
  - 使用 `export const dynamic = 'force-dynamic'`。
  - 每次重新整理網頁，伺服器皆會即時重新計算時間與獲取最新資料。
- **CSR (客戶端渲染) — `/demo/csr`**
  - 使用 `'use client'`。
  - 頁面初始載入骨架，由瀏覽器在前端發動 `fetch` 載入資料，並提供手動「重新取得 (Re-fetch)」按鈕。
- **SSG (靜態生成) — `/demo/ssg`**
  - 使用 `export const dynamic = 'force-static'`。
  - 資料在 `next build` 階段即固化為靜態 HTML，適合內容固定、極致追求速度的頁面。
- **ISR (增量靜態再生產) — `/demo/isr`**
  - 使用 `export const revalidate = 10`。
  - 靜態生成的同時具備定時背景更新機制（每 10 秒內重複請求回傳快取，逾期後的第一次請求在背景重新驗證並更新快取）。

---

### 5.2. 實機連線與 CORS 網路架構要點

當使用手機（實體 iPhone/Android）透過 Expo Go 測試時，手機與電腦必須處於**同一個 Wi-Fi 區域網路 (LAN)**：
1. **不要使用 `localhost` 或 `127.0.0.1`**：
   - 手機上的 `localhost` 代表「手機本體」，無法訪問到開發機電腦。
   - 本專案在 `COMMON.ts` 中將 `API_HOST` 設定為實體區網 IP（如 `http://192.168.0.52`）。
2. **NestJS 監聽 `0.0.0.0` 與 CORS 開放**：
   - 在 `NestJS/src/main.ts` 中：
     ```typescript
     const app = await NestFactory.create(AppModule);
     app.enableCors(); // 必須開放跨來源請求，瀏覽器與行動端 Web 才能順利通訊
     await app.listen(API_PORT, '0.0.0.0'); // 監聽全介面，允許來自區域網路的請求
     ```

---

### 5.3. Metro Bundler 跨目錄解析防坑指南

在 Monorepo / 多專案架構中，React Native Metro 通常只監聽所屬目錄。`Expo/metro.config.js` 展現了關鍵處理手法：

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. 讓 Metro 能監聽到上層根目錄的 COMMON.ts 變更
config.watchFolders = [workspaceRoot];

// 2. 映射 @common 別名至根目錄檔案
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@common': path.resolve(workspaceRoot, 'COMMON.ts'),
};

// 3. ⚠️ 重要：阻絕無關子專案，避免 Metro 將 Next.js 或 NestJS 的模組打包導致衝突
config.resolver.blockList = [
  /.*[/\\](?:NestJS|Next\.js|\.git)[/\\].*/,
];

module.exports = config;
```

---

## 6. 快速啟動指南

### 6.1. 建議啟動順序

建議優先啟動後端服務，再啟動前端與行動端：
1. **NestJS**（後端 API，預設埠：`3001`）
2. **Next.js**（Web 端，預設埠：`3000`）
3. **Expo**（App / Web 端，預設埠：`8081`）

---

### 6.2. 指令操作表

各專案請進入獨立目錄操作：

#### ⚙️ 後端 NestJS
```bash
cd NestJS
npm install
npm run start:dev  # 熱重載開發模式 (監聽 3001 埠)
```

#### 🌐 前端 Next.js
```bash
cd Next.js
npm install
npm run dev        # 啟動開發伺服器 (http://localhost:3000)
# 或
npm run build:start # 驗證 SSG / ISR 生產模式
```

#### 📱 行動端 Expo
```bash
cd Expo
npm install
npm run web        # 啟動 Web 模式 (http://localhost:8081)
# 或
npm run start      # 啟動 Metro Bundler，手機使用 Expo Go 掃描終端機 QR Code
```

---

## 總結

本專案透過乾淨俐落的設計，串聯了：
- **一致的開發體驗**：VS Code `launch.json` 一鍵偵錯。
- **高強度的全端合約**：`COMMON.ts` 零額外維護成本跨端共用。
- **實務導向的測試文化**：利用 `__DEV__` 在行動端實現高效的內嵌自動化模擬測試。
- **現代 Web 架構範本**：Next.js 16 四大渲染場景即時對照。

適合做為跨平台團隊技術選型、全端原型驗證 (PoC) 與內部教學的最佳骨架！
