export const dynamic = "force-static";



async function getStaticData() {
  const timestamp = new Date();
  const buildId = "SSG-BUILD-" + Math.floor(timestamp.getTime() / 1000);


  return {
    buildTimeIso: timestamp.toISOString(),
    displayTime: timestamp.toLocaleString("zh-TW", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    buildId,
  };
}

export default async function SSGPage() {
  const data = await getStaticData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>SSG - Static Site Generation (靜態生成)</h1>
        <code>export const dynamic = &apos;force-static&apos;</code>
      </div>

      <div>
        <h3>靜態建置資訊</h3>
        <p><strong>打包建置時間：</strong><code>{data.displayTime}</code></p>
        <p><strong>建置識別號：</strong><code>{data.buildId}</code></p>
      </div>
    </div>
  );
}
