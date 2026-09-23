import Link from "next/link";
import { CommonFunction, CommonApi, API_BASE_URL } from "@common";

export default async function Home() {
  let postResponse: CommonApi.Resp | null = null;

  try {
    const reqBody: CommonApi.Req = {
      A: "Hello Nex",
      B: "t.js World",
    };
    const resPost = await fetch(`${API_BASE_URL}/${CommonApi.Router}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
      cache: "no-store",
    });
    if (resPost.ok) {
      postResponse = await resPost.json();
    }
  } catch {
    postResponse = null;
  }

  const demoLinks = [
    { href: "/demo/ssr", title: "1. SSR (伺服器端渲染)", tag: "dynamic = 'force-dynamic'" },
    { href: "/demo/csr", title: "2. CSR (客戶端渲染)", tag: "'use client'" },
    { href: "/demo/ssg", title: "3. SSG (靜態生成)", tag: "dynamic = 'force-static'" },
    { href: "/demo/isr", title: "4. ISR (增量靜態再生產)", tag: "revalidate = 10" },
  ];

  return (
    <main style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1>Next.js 渲染模式與 API 整合 DEMO</h1>

      {/* 四大渲染模式導覽連結 */}
      <section style={{ marginBottom: 24 }}>
        <h2>渲染模式 DEMO</h2>
        <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 20 }}>
          {demoLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} style={{ fontWeight: "bold" }}>
                {item.title}
              </Link>
              {" — "}
              <code>{item.tag}</code>
            </li>
          ))}
        </ul>
      </section>

      {/* 共享模組與後端 API 呼叫測試 */}
      <section style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid #ccc", paddingTop: 16 }}>
        <h2>API 與 COMMON 整合測試</h2>
        <div>
          <strong>Shared COMMON String: </strong>
          <span>{CommonFunction("FromFrontend")}</span>
        </div>

        <div>
          <strong>Shared API POST Result ({CommonApi.Router}): </strong>
          {postResponse ? (
            <div>
              <span>AconcatB: {postResponse.AconcatB}</span>
            </div>
          ) : (
            <span>無回應或後端未啟動</span>
          )}
        </div>
      </section>
    </main>
  );
}
