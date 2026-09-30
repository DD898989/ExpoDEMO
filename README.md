# ExpoDEMO 全端跨平台整合專案 (Expo + Next.js + NestJS)

本專案整合了行動端/跨平台應用 (Expo React Native)、Web 應用 (Next.js) 以及後端微服務 (NestJS)。透過根目錄共享的 `COMMON.ts`，實現全端型別共用與一致的開發流程。

---

## 目錄

1. [專案架構概覽](#1-專案架構概覽)
2. [三大專案 launch.json 偵錯模式 (Debug) 介紹](#2-三大專案-launchjson-偵錯模式-debug-介紹)
   - [2.1 Expo (Web 斷點偵錯 + Metro 背景任務)](#21-expo-vscode-偵錯設定)
   - [2.2 NestJS (Node-Terminal 偵錯)](#22-nestjs-vscode-偵錯設定)
   - [2.3 Next.js (開發模式與生產建置雙偵錯)](#23-nextjs-vscode-偵錯設定)
3. [COMMON.ts 跨端共享型別與設定的核心機制](#3-commonts-跨端共享型別與設定的核心機制)
4. [Expo 快速測試機制：__DEV__ 與手機端自動化模擬測試](#4-expo-快速測試機制__dev__-與手機端自動化模擬測試)
5. [建議啟動順序](#5-建議啟動順序)

---

## 1. 專案架構概覽

```text
ExpoDEMO/
├── COMMON.ts                 # 全端共用核心：型別介面 (Req/Resp)、共用常數、API 端點定義
├── Expo/                     # Expo / React Native 行動端 & Web 專案
│   ├── .vscode/
│   │   ├── launch.json       # Expo Web + Edge 偵錯啟動組態
│   │   └── tasks.json        # 背景啟動 npx expo start --web 任務
│   ├── App.tsx               # 行動端首頁 (包含 API 呼叫展示與遊戲元件)
│   ├── RPSGame.tsx           # 猜拳遊戲核心邏輯
│   ├── RPSSimulator-TEST.tsx # __DEV__ 專用自動化連續點擊模擬測試器
│   └── metro.config.js       # 解析 @common 與排除無關目錄的 Metro 設定
├── NestJS/                   # NestJS 後端 API 服務
│   ├── .vscode/
│   │   └── launch.json       # Node Terminal 快速偵錯啟動
│   ├── src/
│   │   ├── main.ts           # 監聽 0.0.0.0 與 API_PORT，開放 CORS
│   │   └── app.controller.ts # 實作 CommonApi 介面定義的 Router 端點
│   └── tsconfig.json         # 設定 @common 路徑映射
└── Next.js/                  # Next.js Web 前端應用
    ├── .vscode/
    │   └── launch.json       # Run next (開發) 與 Build and Start (生產) 雙重偵錯
    ├── src/app/
    │   ├── page.tsx          # 前端首頁 (連線後端 API 並測試 COMMON 函式)
    │   └── demo/             # 4 大渲染模式展示 (SSR / CSR / SSG / ISR)
    └── tsconfig.json         # 設定 @common 路徑映射
```

---

## 2. 三大專案 launch.json 偵錯模式 (Debug) 介紹

各專案於 `.vscode/launch.json` 中配置了對應的除錯模式：

### 2.1. Expo VSCode 偵錯設定

位於 `Expo/.vscode/launch.json`：
在終端機執行 Expo 時，按下 `j` 鍵可直接呼叫 React Native 原生端偵錯工具，方便在網頁偵錯與 Expo Go 原生端偵錯之間切換。

---

### 2.2. NestJS VSCode 偵錯設定

位於 `NestJS/.vscode/launch.json`：
採用標準的 `node-terminal` 模式，執行 `npm start` 即自動附加 Node.js 偵錯器。

---

### 2.3. Next.js VSCode 偵錯設定

位於 `Next.js/.vscode/launch.json`，提供雙重偵錯模式：
1. **模式一：`Run next`（開發除錯）**：
   以 `type: "node"` 啟動 Next.js CLI，適用於一般開發階段，針對 React Server Components (RSC)、SSR 渲染流程與伺服端 `fetch` 進行原始碼中斷點除錯。
2. **模式二：`Build and Start`（生產建置除錯）**：
   執行 `npm run build:start`（即 `next build && next start`），適用於驗證 SSG (靜態生成) 在 build 階段的行為，以及 ISR (增量靜態再生產) 在正式生產模式下的快取與背景再生機制。

---

## 3. COMMON.ts 跨端共享型別與設定的核心機制

根目錄下的 `COMMON.ts` 定義了跨端共用的設定與型別合約：

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

### 3.1. 各專案路徑別名配置

各子專案透過 `@common` 別名直接引入該檔案：

| 專案 | 配置檔案 | 配置方式 |
| :--- | :--- | :--- |
| **NestJS** | `NestJS/tsconfig.json` | `"paths": { "@common": ["../COMMON"] }`，並指定 `"rootDir": ".."` |
| **Next.js** | `Next.js/tsconfig.json` | `"paths": { "@common": ["../COMMON"] }` |
| **Expo** | `Expo/tsconfig.json` + `metro.config.js` | tsconfig 設定 path 映射；Metro 透過 `watchFolders` 與 `extraNodeModules` 解析 |

### 3.2. 解決的痛點

1. **API 合約型別一致性**：
   後端 NestJS 與前端 (Expo / Next.js) 共同使用 `CommonApi.Req` 與 `CommonApi.Resp`。後端只要修改規格，前端編譯時會立刻跳出型別警告。
2. **實機連線集中管理**：
   手機透過實機進行區域網路測試時，只需在 `COMMON.ts` 中調整 `API_HOST` 為本機區網 IP，所有客戶端與後端連線即同步更新。

---

## 4. Expo 快速測試機制：\_\_DEV\_\_ 與手機端自動化模擬測試

在 `Expo/RPSGame.tsx` 與 `Expo/RPSSimulator-TEST.tsx` 中，採用了將測試模擬器直接嵌入開發 UI 的方式：

```tsx
// Expo/RPSGame.tsx
export default function RPSGame() {
  // ...遊戲主邏輯...

  return (
    <View style={styles.container}>
      {/* 使用者操作介面 */}
      <View style={styles.row}>
        {CHOICES.map((choice) => (
          <Button key={choice} title={choice} onPress={() => play(choice)} />
        ))}
      </View>

      {/* 開發模式專用自動化模擬器 */}
      {__DEV__ && (
        <RPSSimulatorTest onPlay={play} onResetScore={resetScore} />
      )}
    </View>
  );
}
```

### 「雖然污染原始碼，但極速驗證」的權衡與優勢

在元件內直接寫入 `{__DEV__ && <RPSSimulatorTest />}` 雖然打破了測試與業務邏輯嚴格分離的架構原則，但具備顯著的實務價值：

| 評估面向 | 傳統端對端測試 (如 Detox / Appium) | `__DEV__` 嵌入式測試元件 |
| :--- | :--- | :--- |
| **環境搭建成本** | 需配置原生驅動、模擬器與 CI/CD 環境 | 無額外成本，一般 React 元件即可完成 |
| **實機驗證效率** | 需透過測試驅動連線手機 | Expo Go 掃碼後直接在手機上點擊測試 |
| **高頻壓力測試** | 受限於測試驅動 IPC 通訊延遲 | 10ms 一局，1 秒即可跑完 100 次狀態連鎖 |
| **原始碼狀態** | 業務原始碼保持完全乾淨 | 業務元件中包含部分測試組態程式碼 |

---

## 5. 建議啟動順序

建議優先啟動後端 API 服務，再啟動前端與行動端：

1. **NestJS**（後端 API，預設埠：`3001`）
2. **Next.js**（Web 端，預設埠：`3000`）
3. **Expo**（行動端 / Web，預設埠：`8081`）
