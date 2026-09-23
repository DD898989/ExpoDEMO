export const dynamic = "force-dynamic";

interface PostItem {
  id: number;
  title: string;
  views: number;
}

async function getSSRData() {
  const timestamp = new Date();
  const requestId = crypto.randomUUID();
  const mockPosts: PostItem[] = [
    { id: 1, title: "Next.js 伺服器端渲染 (SSR) 核心機制", views: Math.floor(Math.random() * 1000) + 1 },
    { id: 2, title: "動態請求與即時資料處理", views: Math.floor(Math.random() * 1000) + 1 },
    { id: 3, title: "個人化儀表板與 Session 驗證整合", views: Math.floor(Math.random() * 1000) + 1 },
  ];

  return {
    renderedAt: timestamp.toISOString(),
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
    requestId,
    mockPosts,
  };
}

export default async function SSRPage() {
  const data = await getSSRData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>SSR - Server-Side Rendering (伺服器端渲染)</h1>
        <code>export const dynamic = &apos;force-dynamic&apos;</code>
      </div>

      <div>
        <p><strong>伺服器產生時間：</strong><code>{data.displayTime}</code></p>
        <p><strong>Request ID：</strong><code>{data.requestId}</code></p>
      </div>

      <div>
        <h3>動態資料列表 (每次請求重新計算)</h3>
        <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th align="left">ID</th>
              <th align="left">文章標題</th>
              <th align="left">即時瀏覽數</th>
            </tr>
          </thead>
          <tbody>
            {data.mockPosts.map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.views.toLocaleString()} 次</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
