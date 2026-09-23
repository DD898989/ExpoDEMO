"use client";

import { useState, useEffect, useCallback } from "react";


interface CSRData {
  fetchedAt: string;
  clientTime: string;
  browserInfo: string;
}

export default function CSRPage() {
  const [data, setData] = useState<CSRData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchCount, setFetchCount] = useState<number>(0);

  const fetchClientData = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const now = new Date();

    setData({
      fetchedAt: now.toISOString(),
      clientTime: now.toLocaleString("zh-TW", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      }),
      browserInfo: typeof window !== "undefined" ? window.navigator.userAgent.slice(0, 50) + "..." : "Unknown",
    });

    setFetchCount((prev) => prev + 1);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>CSR - Client-Side Rendering (客戶端渲染)</h1>
        <code>App Router: &apos;use client&apos;</code>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={fetchClientData} disabled={loading} style={{ padding: "6px 12px", cursor: "pointer" }}>
          {loading ? "載入中..." : "重新獲取資料 (Client Refetch)"}
        </button>
        <span>已請求次數：<strong>{fetchCount}</strong></span>
      </div>

      <div>
        <p><strong>客戶端時間：</strong><code>{data ? data.clientTime : "加載中..."}</code></p>
        <p><strong>瀏覽器資訊：</strong><small>{data ? data.browserInfo : "讀取中..."}</small></p>
      </div>
    </div>
  );
}
