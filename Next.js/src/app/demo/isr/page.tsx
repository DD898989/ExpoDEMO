export const revalidate = 10;


async function getISRData() {
  const timestamp = new Date();
  const revisionId = "REV-" + Math.random().toString(36).substring(2, 8).toUpperCase();


  return {
    generatedAtIso: timestamp.toISOString(),
    displayTime: timestamp.toLocaleString("zh-TW", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    }),
    revisionId,
  };
}

export default async function ISRPage() {
  const data = await getISRData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>ISR - Incremental Static Regeneration (增量靜態再生產)</h1>
        <code>export const revalidate = 10 (10 秒)</code>
      </div>

      <div>
        <h3>ISR 快取週期資訊</h3>
        <p><strong>重新驗證週期：</strong>10 秒</p>
        <p><strong>此快取生成時間：</strong><code>{data.displayTime}</code></p>
        <p><strong>快取修訂號：</strong><code>{data.revisionId}</code></p>
      </div>
    </div>
  );
}
