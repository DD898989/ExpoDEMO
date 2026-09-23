import Link from "next/link";
import React from "react";

export default function DemoLayout({
  children: children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { href: "/demo/ssr", label: "SSR (伺服器渲染)" },
    { href: "/demo/csr", label: "CSR (客戶端渲染)" },
    { href: "/demo/ssg", label: "SSG (靜態生成)" },
    { href: "/demo/isr", label: "ISR (增量靜態再生產)" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #ccc", paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Next.js 渲染模式 DEMO</h2>
          <Link href="/">← 返回首頁</Link>
        </div>
        <nav style={{ display: "flex", gap: 16 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
