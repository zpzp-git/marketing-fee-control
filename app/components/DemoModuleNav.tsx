"use client";

import Link from "next/link";

export type DemoModuleKey =
  | "base-data"
  | "budget"
  | "marketing-plans"
  | "marketing-matters"
  | "marketing-contracts"
  | "sales-contracts"
  | "marketing-advance"
  | "deposit-management"
  | "payment-management"
  | "invoice-management"
  | "fee-estimation"
  | "fee-reconciliation"
  | "receivables"
  | "internal-use"
  | "other-profit-loss";

const moduleNavItems: Array<{
  key: DemoModuleKey;
  label: string;
  sub: string;
  href: string;
}> = [
  { key: "base-data", label: "基础数据", sub: "Base Data", href: "/base-data" },
  { key: "budget", label: "预算管理", sub: "Budget", href: "/budget" },
  { key: "marketing-plans", label: "营销计划", sub: "Marketing Plan", href: "/marketing-plans" },
  { key: "marketing-matters", label: "营销事项", sub: "Marketing Matter", href: "/marketing-matters" },
  { key: "marketing-contracts", label: "营销合同", sub: "Marketing Contract", href: "/marketing-contracts" },
  { key: "sales-contracts", label: "销售合同", sub: "Sales Contract", href: "/sales-contracts" },
  { key: "marketing-advance", label: "营销备用金", sub: "Advance", href: "/marketing-advance" },
  { key: "deposit-management", label: "保证金管理", sub: "Deposit", href: "/deposit-management" },
  { key: "payment-management", label: "付款管理", sub: "Payment", href: "/payment-management" },
  { key: "invoice-management", label: "发票管理", sub: "Invoice", href: "/invoice-management" },
  { key: "fee-estimation", label: "费用预估", sub: "Estimation", href: "/fee-estimation" },
  { key: "fee-reconciliation", label: "费用对账结算", sub: "Settlement", href: "/fee-reconciliation" },
  { key: "receivables", label: "应收账款", sub: "Receivables", href: "/receivables" },
  { key: "internal-use", label: "内部领用", sub: "Internal Use", href: "/internal-use" },
  { key: "other-profit-loss", label: "其他损益", sub: "Profit & Loss", href: "/other-profit-loss" }
];

export function DemoModuleNav({ active, title }: { active: DemoModuleKey; title: string }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
      <div className="border-b border-slate-200 p-5">
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          营销费控 Demo
        </Link>
        <div className="mt-1 text-lg font-semibold">{title}</div>
      </div>
      <nav className="space-y-1 p-3 text-sm">
        {moduleNavItems.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-md px-3 py-2 transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="font-medium">{item.label}</div>
              <div className="text-xs opacity-70">{item.sub}</div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
