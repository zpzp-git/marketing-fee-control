"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type ViewMode = "ledger" | "pushes" | "applications";
type PushStatus = "待生成" | "已生成" | "推送失败" | "重复推送" | "已忽略";
type DocumentStatus = "草稿" | "待校验" | "审批中" | "已驳回" | "审批通过" | "已完成" | "已关闭";
type ApprovalStatus = "未提交" | "审批中" | "已驳回" | "审批通过" | "已完成";
type BudgetCheckStatus = "未校验" | "校验通过" | "预算不足" | "映射缺失" | "已占用" | "已发生";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type DetailData =
  | { type: "ledger"; row: InternalUseLedger }
  | { type: "application"; row: InternalUseApplication }
  | { type: "push"; row: BpmPush };

interface ProductOption {
  skuCode: string;
  skuName: string;
  brand: string;
  defaultPrice: number;
  status: string;
}

interface BudgetMapping {
  department: string;
  budgetDepartment: string;
}

interface PurposeMapping {
  purpose: string;
  budgetSubject: string;
  majorSubject: string;
}

interface BudgetBalance {
  id: string;
  budgetDepartment: string;
  budgetSubject: string;
  majorSubject: string;
  totalBudget: number;
  occupiedAmount: number;
  occurredAmount: number;
}

interface InternalUseLine {
  id: string;
  accountingEntity: string;
  secondDepartment: string;
  useDate: string;
  bpmPurpose: string;
  bpmScene: string;
  skuCode: string;
  skuName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  budgetDepartment: string;
  budgetSubject: string;
  majorSubject: string;
  budgetStatus: BudgetCheckStatus;
  budgetMessage: string;
  readonlyFromBpm: boolean;
}

interface ApprovalRecord {
  node: string;
  approver: string;
  date: string;
  result: string;
  comment: string;
}

interface OperationLog {
  time: string;
  operator: string;
  action: string;
  comment: string;
}

interface InternalUseApplication {
  id: string;
  code: string;
  title: string;
  applyDate: string;
  applicant: string;
  applicantCompany: string;
  applicantDepartment: string;
  applicantPosition: string;
  totalAmount: number;
  status: DocumentStatus;
  approvalStatus: ApprovalStatus;
  sourceSystem: string;
  bpmNo: string;
  batchNo: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: InternalUseLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface BpmPush {
  id: string;
  bpmNo: string;
  batchNo: string;
  title: string;
  pushedAt: string;
  applicant: string;
  applicantCompany: string;
  applicantDepartment: string;
  applicantPosition: string;
  status: PushStatus;
  syncStatus: SyncStatus;
  failureReason?: string;
  generatedApplicationCode?: string;
  lines: InternalUseLine[];
}

interface InternalUseLedger {
  id: string;
  applicationId: string;
  applicationCode: string;
  accountingEntity: string;
  applicant: string;
  applyDate: string;
  useDate: string;
  useMonth: string;
  bpmPurpose: string;
  bpmScene: string;
  skuName: string;
  skuCode: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  budgetDepartment: string;
  budgetSubject: string;
  majorSubject: string;
  secondDepartment: string;
  sourceSystem: string;
  bpmNo: string;
  approvalStatus: ApprovalStatus;
  budgetUpdateStatus: BudgetCheckStatus;
  updatedAt: string;
}

interface LedgerFilters {
  keyword: string;
  accountingEntity: string;
  useMonth: string;
  applicant: string;
  budgetDepartment: string;
  budgetSubject: string;
  bpmPurpose: string;
  brand: string;
}

interface PushFilters {
  keyword: string;
  status: string;
  syncStatus: string;
}

interface ApplicationFilters {
  keyword: string;
  status: string;
  budgetStatus: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const initialLedgerFilters: LedgerFilters = {
  keyword: "",
  accountingEntity: "全部",
  useMonth: "全部",
  applicant: "全部",
  budgetDepartment: "全部",
  budgetSubject: "全部",
  bpmPurpose: "全部",
  brand: "全部"
};

const initialPushFilters: PushFilters = { keyword: "", status: "全部", syncStatus: "全部" };
const initialApplicationFilters: ApplicationFilters = { keyword: "", status: "全部", budgetStatus: "全部" };

const productOptions: ProductOption[] = [
  { skuCode: "SKU-SP-1001", skuName: "小蓝瓶精华 30ml 试用装", brand: "BluePeak", defaultPrice: 120, status: "启用" },
  { skuCode: "SKU-SP-1002", skuName: "清透防晒乳 50ml", brand: "BluePeak", defaultPrice: 95, status: "启用" },
  { skuCode: "SKU-GF-2108", skuName: "品牌定制礼盒 A 款", brand: "GlowFarm", defaultPrice: 168, status: "启用" },
  { skuCode: "SKU-GF-2110", skuName: "达人直播赠品套装", brand: "GlowFarm", defaultPrice: 260, status: "启用" },
  { skuCode: "SKU-NX-3302", skuName: "新品试吃装组合", brand: "NutriX", defaultPrice: 42, status: "启用" },
  { skuCode: "SKU-MK-8801", skuName: "门店活动物料包", brand: "MarketKit", defaultPrice: 380, status: "启用" }
];

const departmentMappings: BudgetMapping[] = [
  { department: "内容营销二部", budgetDepartment: "内容营销预算部" },
  { department: "品牌活动部", budgetDepartment: "品牌市场预算部" },
  { department: "电商运营二部", budgetDepartment: "电商运营预算部" },
  { department: "渠道增长部", budgetDepartment: "渠道增长预算部" },
  { department: "区域零售部", budgetDepartment: "区域零售预算部" }
];

const purposeMappings: PurposeMapping[] = [
  { purpose: "抖音直播样品", budgetSubject: "直播样品费", majorSubject: "推广费用" },
  { purpose: "品牌活动赠品", budgetSubject: "活动赠品费", majorSubject: "推广费用" },
  { purpose: "新品试用", budgetSubject: "新品推广费", majorSubject: "推广费用" },
  { purpose: "渠道陈列物料", budgetSubject: "渠道物料费", majorSubject: "渠道费用" },
  { purpose: "门店导购培训", budgetSubject: "培训物料费", majorSubject: "销售费用" }
];

const initialBudgetBalances: BudgetBalance[] = [
  { id: "bb-001", budgetDepartment: "内容营销预算部", budgetSubject: "直播样品费", majorSubject: "推广费用", totalBudget: 180000, occupiedAmount: 0, occurredAmount: 68400 },
  { id: "bb-002", budgetDepartment: "品牌市场预算部", budgetSubject: "活动赠品费", majorSubject: "推广费用", totalBudget: 120000, occupiedAmount: 0, occurredAmount: 32800 },
  { id: "bb-003", budgetDepartment: "电商运营预算部", budgetSubject: "新品推广费", majorSubject: "推广费用", totalBudget: 56000, occupiedAmount: 0, occurredAmount: 44700 },
  { id: "bb-004", budgetDepartment: "渠道增长预算部", budgetSubject: "渠道物料费", majorSubject: "渠道费用", totalBudget: 90000, occupiedAmount: 0, occurredAmount: 51000 },
  { id: "bb-005", budgetDepartment: "区域零售预算部", budgetSubject: "培训物料费", majorSubject: "销售费用", totalBudget: 36000, occupiedAmount: 0, occurredAmount: 32200 }
];

const initialPushes: BpmPush[] = [
  buildPush({
    id: "push-001",
    bpmNo: "BPM-IU-202605-001",
    batchNo: "BPMB-20260506-01",
    title: "抖音直播样品内部领用",
    pushedAt: "2026-05-06 09:12:30",
    applicant: "周宁",
    department: "内容营销二部",
    position: "直播运营",
    status: "待生成",
    lines: [
      ["内容营销二部", "2026-05-05", "抖音直播样品", "520 专场直播样品寄送", "SKU-SP-1001", 60, 120],
      ["内容营销二部", "2026-05-05", "抖音直播样品", "达人开箱脚本拍摄", "SKU-SP-1002", 40, 95],
      ["内容营销二部", "2026-05-05", "抖音直播样品", "直播间抽奖赠送", "SKU-GF-2110", 18, 260]
    ]
  }),
  buildPush({
    id: "push-002",
    bpmNo: "BPM-IU-202605-002",
    batchNo: "BPMB-20260506-01",
    title: "品牌活动赠品内部领用",
    pushedAt: "2026-05-06 09:35:21",
    applicant: "沈岚",
    department: "品牌活动部",
    position: "活动经理",
    status: "待生成",
    lines: [
      ["品牌活动部", "2026-05-04", "品牌活动赠品", "上海快闪活动会员礼", "SKU-GF-2108", 45, 168],
      ["品牌活动部", "2026-05-04", "新品试用", "新品体验官样品", "SKU-NX-3302", 90, 42]
    ]
  }),
  buildPush({
    id: "push-003",
    bpmNo: "BPM-IU-202605-003",
    batchNo: "BPMB-20260506-02",
    title: "社群种草样品内部领用",
    pushedAt: "2026-05-06 10:08:42",
    applicant: "唐可",
    department: "内容营销二部",
    position: "社群运营",
    status: "待生成",
    lines: [["内容营销二部", "2026-05-03", "社群种草样品", "小红书社群试用官", "SKU-SP-1001", 32, 120]]
  }),
  buildPush({
    id: "push-004",
    bpmNo: "BPM-IU-202605-004",
    batchNo: "BPMB-20260506-02",
    title: "门店培训物料内部领用",
    pushedAt: "2026-05-06 10:18:05",
    applicant: "许哲",
    department: "区域零售部",
    position: "零售督导",
    status: "待生成",
    lines: [["区域零售部", "2026-05-02", "门店导购培训", "华东门店导购培训", "SKU-MK-8801", 12, 380]]
  }),
  buildPush({
    id: "push-005",
    bpmNo: "BPM-IU-202605-005",
    batchNo: "BPMB-20260506-03",
    title: "BPM 推送失败样例",
    pushedAt: "2026-05-06 10:22:11",
    applicant: "何远",
    department: "渠道增长部",
    position: "渠道运营",
    status: "推送失败",
    syncStatus: "同步失败",
    failureReason: "BPM 附件元数据缺失 [MOCK-BPM-422]，可点击重新推送恢复为待生成。",
    lines: [["渠道增长部", "2026-05-03", "渠道陈列物料", "经销商端架陈列物料", "SKU-MK-8801", 8, 380]]
  }),
  buildPush({
    id: "push-006",
    bpmNo: "BPM-IU-202604-018",
    batchNo: "BPMB-20260429-02",
    title: "重复推送样例",
    pushedAt: "2026-05-06 10:40:16",
    applicant: "周宁",
    department: "内容营销二部",
    position: "直播运营",
    status: "重复推送",
    failureReason: "BPM 单号 BPM-IU-202604-018 已生成内部领用单 IU-202604-018，请勿重复生成。",
    lines: [["内容营销二部", "2026-04-28", "抖音直播样品", "四月达人补样", "SKU-SP-1002", 24, 95]]
  })
];

const initialApplications: InternalUseApplication[] = [
  buildApplication({
    id: "app-001",
    code: "IU-202604-018",
    title: "四月达人补样内部领用",
    applicant: "周宁",
    department: "内容营销二部",
    status: "已完成",
    bpmNo: "BPM-IU-202604-018",
    batchNo: "BPMB-20260429-02",
    applyDate: "2026-04-29",
    lastSyncAt: "2026-04-29 15:42:12",
    lines: [["内容营销二部", "2026-04-28", "抖音直播样品", "四月达人补样", "SKU-SP-1002", 24, 95]]
  }),
  buildApplication({
    id: "app-002",
    code: "IU-202605-006",
    title: "渠道陈列物料内部领用",
    applicant: "何远",
    department: "渠道增长部",
    status: "审批中",
    bpmNo: "BPM-IU-202605-006",
    batchNo: "BPMB-20260505-03",
    applyDate: "2026-05-05",
    lastSyncAt: "2026-05-05 17:08:12",
    lines: [["渠道增长部", "2026-05-05", "渠道陈列物料", "经销商端架陈列物料", "SKU-MK-8801", 10, 380]]
  }),
  buildApplication({
    id: "app-003",
    code: "IU-202605-007",
    title: "新品试用内部领用",
    applicant: "梁琪",
    department: "电商运营二部",
    status: "已驳回",
    bpmNo: "BPM-IU-202605-007",
    batchNo: "BPMB-20260505-04",
    applyDate: "2026-05-05",
    lastSyncAt: "2026-05-05 18:02:51",
    lines: [["电商运营二部", "2026-05-05", "新品试用", "会员试用活动追加", "SKU-NX-3302", 80, 42]]
  })
];

const initialLedger: InternalUseLedger[] = [
  ...buildLedgerFromApplication(initialApplications[0]),
  {
    id: "ledger-002",
    applicationId: "seed-002",
    applicationCode: "IU-202605-001",
    accountingEntity: "上海营销科技有限公司",
    applicant: "沈岚",
    applyDate: "2026-05-01",
    useDate: "2026-05-01",
    useMonth: "2026-05",
    bpmPurpose: "品牌活动赠品",
    bpmScene: "五一会员活动礼品",
    skuName: "品牌定制礼盒 A 款",
    skuCode: "SKU-GF-2108",
    brand: "GlowFarm",
    quantity: 50,
    unitPrice: 168,
    amount: 8400,
    budgetDepartment: "品牌市场预算部",
    budgetSubject: "活动赠品费",
    majorSubject: "推广费用",
    secondDepartment: "品牌活动部",
    sourceSystem: "[BPM]",
    bpmNo: "BPM-IU-202605-SEED-001",
    approvalStatus: "已完成",
    budgetUpdateStatus: "已发生",
    updatedAt: "2026-05-02 11:21:08"
  },
  {
    id: "ledger-003",
    applicationId: "seed-003",
    applicationCode: "IU-202605-002",
    accountingEntity: "杭州电商运营有限公司",
    applicant: "梁琪",
    applyDate: "2026-05-02",
    useDate: "2026-05-02",
    useMonth: "2026-05",
    bpmPurpose: "新品试用",
    bpmScene: "会员新品体验官",
    skuName: "新品试吃装组合",
    skuCode: "SKU-NX-3302",
    brand: "NutriX",
    quantity: 150,
    unitPrice: 42,
    amount: 6300,
    budgetDepartment: "电商运营预算部",
    budgetSubject: "新品推广费",
    majorSubject: "推广费用",
    secondDepartment: "电商运营二部",
    sourceSystem: "[BPM]",
    bpmNo: "BPM-IU-202605-SEED-002",
    approvalStatus: "已完成",
    budgetUpdateStatus: "已发生",
    updatedAt: "2026-05-03 09:30:20"
  },
  {
    id: "ledger-004",
    applicationId: "seed-004",
    applicationCode: "IU-202604-021",
    accountingEntity: "北京渠道增长有限公司",
    applicant: "何远",
    applyDate: "2026-04-30",
    useDate: "2026-04-30",
    useMonth: "2026-04",
    bpmPurpose: "渠道陈列物料",
    bpmScene: "经销商端架陈列物料",
    skuName: "门店活动物料包",
    skuCode: "SKU-MK-8801",
    brand: "MarketKit",
    quantity: 18,
    unitPrice: 380,
    amount: 6840,
    budgetDepartment: "渠道增长预算部",
    budgetSubject: "渠道物料费",
    majorSubject: "渠道费用",
    secondDepartment: "渠道增长部",
    sourceSystem: "[BPM]",
    bpmNo: "BPM-IU-202604-SEED-021",
    approvalStatus: "已完成",
    budgetUpdateStatus: "已发生",
    updatedAt: "2026-04-30 18:45:12"
  }
];

export default function InternalUsePage() {
  const [view, setView] = useState<ViewMode>("ledger");
  const [ledger, setLedger] = useState<InternalUseLedger[]>(initialLedger);
  const [applications, setApplications] = useState<InternalUseApplication[]>(initialApplications);
  const [pushes, setPushes] = useState<BpmPush[]>(initialPushes);
  const [budgetBalances, setBudgetBalances] = useState<BudgetBalance[]>(initialBudgetBalances);
  const [ledgerFilters, setLedgerFilters] = useState<LedgerFilters>(initialLedgerFilters);
  const [pushFilters, setPushFilters] = useState<PushFilters>(initialPushFilters);
  const [applicationFilters, setApplicationFilters] = useState<ApplicationFilters>(initialApplicationFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [editingApplication, setEditingApplication] = useState<InternalUseApplication | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<DetailData | null>(null);

  const accountingEntities = useMemo(() => unique([...ledger.map((item) => item.accountingEntity), ...applications.flatMap((item) => item.lines.map((line) => line.accountingEntity))]), [applications, ledger]);
  const applicants = useMemo(() => unique([...ledger.map((item) => item.applicant), ...applications.map((item) => item.applicant)]), [applications, ledger]);
  const useMonths = useMemo(() => unique(ledger.map((item) => item.useMonth)), [ledger]);
  const budgetDepartments = useMemo(() => unique([...budgetBalances.map((item) => item.budgetDepartment), ...ledger.map((item) => item.budgetDepartment)]), [budgetBalances, ledger]);
  const budgetSubjects = useMemo(() => unique([...budgetBalances.map((item) => item.budgetSubject), ...ledger.map((item) => item.budgetSubject)]), [budgetBalances, ledger]);
  const purposes = useMemo(() => unique([...purposeMappings.map((item) => item.purpose), ...ledger.map((item) => item.bpmPurpose)]), [ledger]);
  const brands = useMemo(() => unique(productOptions.map((item) => item.brand)), []);

  const filteredLedger = useMemo(() => filterLedger(ledger, ledgerFilters), [ledger, ledgerFilters]);
  const filteredPushes = useMemo(() => filterPushes(pushes, pushFilters), [pushes, pushFilters]);
  const filteredApplications = useMemo(() => filterApplications(applications, applicationFilters), [applications, applicationFilters]);
  const stats = useMemo(() => buildStats(ledger, applications, pushes, budgetBalances), [applications, budgetBalances, ledger, pushes]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function simulateQuery() {
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 520);
  }

  function resetFilters() {
    setLedgerFilters(initialLedgerFilters);
    setPushFilters(initialPushFilters);
    setApplicationFilters(initialApplicationFilters);
    simulateQuery();
  }

  function retryError() {
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => {
      setTableLoading(false);
      showToast("已完成 mock 重试，当前页面恢复正常。");
    }, 600);
  }

  function simulateBpmPush() {
    const nextIndex = pushes.length + 1;
    const next = buildPush({
      id: `push-new-${Date.now()}`,
      bpmNo: `BPM-IU-202605-${String(20 + nextIndex).padStart(3, "0")}`,
      batchNo: "BPMB-20260506-DEMO",
      title: "模拟新增 BPM 内部领用推送",
      pushedAt: nowText,
      applicant: "陈予",
      department: "品牌活动部",
      position: "品牌运营",
      status: "待生成",
      lines: [["品牌活动部", today, "品牌活动赠品", "Demo 新增推送批次", "SKU-GF-2108", 20, 168]]
    });
    setPushes((rows) => [next, ...rows]);
    setView("pushes");
    showToast("已模拟 BPM 推送一条待生成记录。");
  }

  function retryPush(push: BpmPush) {
    setPushes((rows) =>
      rows.map((row) =>
        row.id === push.id
          ? { ...row, status: "待生成", syncStatus: "同步成功", failureReason: undefined, pushedAt: nowText }
          : row
      )
    );
    showToast(`${push.bpmNo} 已模拟重新推送，可生成内部领用单。`);
  }

  function ignorePush(push: BpmPush) {
    setPushes((rows) => rows.map((row) => (row.id === push.id ? { ...row, status: "已忽略", failureReason: "Demo 管理员已忽略该重复或异常推送。" } : row)));
    showToast("已模拟忽略该 BPM 推送记录。");
  }

  function generateApplicationFromPush(push: BpmPush) {
    if (push.status === "推送失败") {
      showToast("该记录仍为推送失败，请先模拟重新推送。");
      return;
    }
    if (push.status === "重复推送" || applications.some((item) => item.bpmNo === push.bpmNo)) {
      setPushes((rows) => rows.map((row) => (row.id === push.id ? { ...row, status: "重复推送", failureReason: `BPM 单号 ${push.bpmNo} 已生成过内部领用单。` } : row)));
      showToast("已拦截重复推送，不再生成单据。");
      return;
    }
    const application = {
      id: `app-${Date.now()}`,
      code: `IU-202605-${String(applications.length + 12).padStart(3, "0")}`,
      title: push.title,
      applyDate: today,
      applicant: push.applicant,
      applicantCompany: push.applicantCompany,
      applicantDepartment: push.applicantDepartment,
      applicantPosition: push.applicantPosition,
      totalAmount: sum(push.lines.map(lineAmount)),
      status: "待校验" as DocumentStatus,
      approvalStatus: "未提交" as ApprovalStatus,
      sourceSystem: "[BPM]",
      bpmNo: push.bpmNo,
      batchNo: push.batchNo,
      syncStatus: "同步成功" as SyncStatus,
      lastSyncAt: nowText,
      lines: push.lines.map((line) => ({ ...line, id: `line-${Date.now()}-${line.id}` })),
      approvals: [],
      logs: [{ time: nowText, operator: "系统模拟", action: "BPM 推送生成内部领用单", comment: `由推送批次 ${push.batchNo} 自动生成，预算字段按 mock 规则带出。` }]
    };
    setApplications((rows) => [application, ...rows]);
    setPushes((rows) => rows.map((row) => (row.id === push.id ? { ...row, status: "已生成", generatedApplicationCode: application.code, syncStatus: "同步成功" } : row)));
    setEditingApplication(application);
    setErrors({});
    showToast(`${application.code} 已生成，请执行预算校验。`);
  }

  function openNewApplication() {
    const firstProduct = productOptions[0];
    const line = normalizeLine({
      id: `manual-line-${Date.now()}`,
      accountingEntity: "上海营销科技有限公司",
      secondDepartment: "内容营销二部",
      useDate: today,
      bpmPurpose: "抖音直播样品",
      bpmScene: "手工新增内部领用 Demo",
      skuCode: firstProduct.skuCode,
      skuName: firstProduct.skuName,
      brand: firstProduct.brand,
      quantity: 1,
      unitPrice: firstProduct.defaultPrice,
      budgetDepartment: "",
      budgetSubject: "",
      majorSubject: "",
      budgetStatus: "未校验",
      budgetMessage: "",
      readonlyFromBpm: false
    });
    const application: InternalUseApplication = {
      id: `manual-${Date.now()}`,
      code: `IU-202605-${String(applications.length + 12).padStart(3, "0")}`,
      title: "手工新增内部领用单",
      applyDate: today,
      applicant: "陈予",
      applicantCompany: "上海营销科技有限公司",
      applicantDepartment: "品牌活动部",
      applicantPosition: "营销专员",
      totalAmount: lineAmount(line),
      status: "草稿",
      approvalStatus: "未提交",
      sourceSystem: "手工录入",
      bpmNo: "-",
      batchNo: "-",
      syncStatus: "未同步",
      lastSyncAt: "-",
      lines: [line],
      approvals: [],
      logs: [{ time: nowText, operator: "陈予", action: "新建内部领用单草稿", comment: "手工新增 Demo 单据，可编辑明细后校验预算。" }]
    };
    setEditingApplication(application);
    setErrors({});
  }

  function openApplication(application: InternalUseApplication) {
    setEditingApplication(cloneApplication(application));
    setErrors({});
  }

  function saveApplicationDraft() {
    if (!editingApplication) return;
    const next = refreshApplicationTotal({ ...editingApplication, status: editingApplication.status === "已驳回" ? "草稿" : editingApplication.status });
    setApplications((rows) => upsertApplication(rows, next));
    setEditingApplication(next);
    showToast(`${next.code} 已保存草稿。`);
  }

  function patchApplication(patch: Partial<InternalUseApplication>) {
    setEditingApplication((current) => (current ? refreshApplicationTotal({ ...current, ...patch }) : current));
  }

  function patchLine(lineId: string, patch: Partial<InternalUseLine>) {
    setEditingApplication((current) => {
      if (!current) return current;
      const lines = current.lines.map((line) => (line.id === lineId ? normalizeLine({ ...line, ...patch, budgetStatus: "未校验", budgetMessage: "" }) : line));
      return refreshApplicationTotal({ ...current, lines, status: current.status === "已完成" ? current.status : "待校验" });
    });
  }

  function addLine() {
    if (!editingApplication) return;
    const firstProduct = productOptions[0];
    patchApplication({
      lines: [
        ...editingApplication.lines,
        normalizeLine({
          id: `line-${Date.now()}`,
          accountingEntity: editingApplication.lines[0]?.accountingEntity ?? "上海营销科技有限公司",
          secondDepartment: editingApplication.applicantDepartment,
          useDate: today,
          bpmPurpose: "抖音直播样品",
          bpmScene: "",
          skuCode: firstProduct.skuCode,
          skuName: firstProduct.skuName,
          brand: firstProduct.brand,
          quantity: 1,
          unitPrice: firstProduct.defaultPrice,
          budgetDepartment: mapBudgetDepartment(editingApplication.applicantDepartment),
          budgetSubject: mapPurpose("抖音直播样品").budgetSubject,
          majorSubject: mapPurpose("抖音直播样品").majorSubject,
          budgetStatus: "未校验",
          budgetMessage: "",
          readonlyFromBpm: false
        })
      ],
      status: "待校验"
    });
  }

  function removeLine(lineId: string) {
    if (!editingApplication || editingApplication.lines.length === 1) {
      showToast("至少保留一条内部领用明细。");
      return;
    }
    patchApplication({ lines: editingApplication.lines.filter((line) => line.id !== lineId), status: "待校验" });
  }

  function runBudgetCheck() {
    if (!editingApplication) return;
    const validation = validateApplication(editingApplication);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      showToast("预算校验前请先补齐必填信息。");
      return;
    }
    setErrors({});
    const groups = buildBudgetSummaries(editingApplication.lines, budgetBalances);
    const lines = editingApplication.lines.map((line) => {
      const group = groups.find((item) => item.budgetDepartment === line.budgetDepartment && item.budgetSubject === line.budgetSubject);
      if (!line.budgetDepartment || !line.budgetSubject) return { ...line, budgetStatus: "映射缺失" as BudgetCheckStatus, budgetMessage: "预算部门或预算科目缺失，请手动修正。" };
      if (!group?.balance) return { ...line, budgetStatus: "映射缺失" as BudgetCheckStatus, budgetMessage: "未找到预算余额 mock，请修正预算映射。" };
      if (group.amount > group.available) return { ...line, budgetStatus: "预算不足" as BudgetCheckStatus, budgetMessage: `可用 ${formatMoney(group.available)}，本组需 ${formatMoney(group.amount)}。` };
      return { ...line, budgetStatus: "校验通过" as BudgetCheckStatus, budgetMessage: "预算校验通过，可提交审批。" };
    });
    const next = refreshApplicationTotal({
      ...editingApplication,
      lines,
      status: lines.every((line) => line.budgetStatus === "校验通过") ? "草稿" : "待校验",
      logs: [{ time: nowText, operator: "系统模拟", action: "执行预算校验", comment: lines.every((line) => line.budgetStatus === "校验通过") ? "预算余额充足，全部明细校验通过。" : "存在预算不足或映射缺失，请修正后重试。" }, ...editingApplication.logs]
    });
    setEditingApplication(next);
    setApplications((rows) => upsertApplication(rows, next));
    showToast(lines.every((line) => line.budgetStatus === "校验通过") ? "预算校验通过。" : "预算校验未通过，请查看行内原因。");
  }

  function submitApproval() {
    if (!editingApplication) return;
    const validation = validateApplication(editingApplication);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      showToast("请先修正表单校验问题。");
      return;
    }
    if (!editingApplication.lines.every((line) => line.budgetStatus === "校验通过")) {
      setErrors({ budget: "必须先执行预算校验，且所有明细预算状态为校验通过。" });
      showToast("预算未通过，无法提交审批。");
      return;
    }
    const groups = buildBudgetSummaries(editingApplication.lines, budgetBalances);
    setBudgetBalances((rows) => applyBudgetChange(rows, groups, "occupy"));
    const next = refreshApplicationTotal({
      ...editingApplication,
      status: "审批中",
      approvalStatus: "审批中",
      lines: editingApplication.lines.map((line) => ({ ...line, budgetStatus: "已占用", budgetMessage: "提交审批后已模拟占用预算。" })),
      approvals: [...editingApplication.approvals, { node: "申请人提交", approver: editingApplication.applicant, date: today, result: "提交", comment: "内部领用单提交审批，预算占用已写入 mock 余额。" }],
      logs: [{ time: nowText, operator: editingApplication.applicant, action: "提交审批", comment: `已提交审批并占用预算 ${formatMoney(editingApplication.totalAmount)}。` }, ...editingApplication.logs]
    });
    setEditingApplication(next);
    setApplications((rows) => upsertApplication(rows, next));
    showToast("已模拟提交审批，预算占用同步更新。");
  }

  function approveApplication() {
    if (!editingApplication) return;
    const groups = buildBudgetSummaries(editingApplication.lines, budgetBalances);
    setOverlayLoading("正在模拟审批通过、更新预算发生额并插入内部领用台账");
    window.setTimeout(() => {
      const approved = refreshApplicationTotal({
        ...editingApplication,
        status: "已完成",
        approvalStatus: "已完成",
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        lines: editingApplication.lines.map((line) => ({ ...line, budgetStatus: "已发生", budgetMessage: "审批通过后已计入预算实际发生额。" })),
        approvals: [...editingApplication.approvals, { node: "财务 BP 审批", approver: "林一", date: today, result: "通过", comment: "已履约完成且预算校验通过，同意入账。" }],
        logs: [
          { time: nowText, operator: "系统模拟", action: "插入内部领用台账", comment: `按 ${editingApplication.lines.length} 条 SKU 明细插入台账。` },
          { time: nowText, operator: "系统模拟", action: "更新预算实际发生额", comment: `发生数=+${formatMoney(editingApplication.totalAmount)}。` },
          ...editingApplication.logs
        ]
      });
      setBudgetBalances((rows) => applyBudgetChange(rows, groups, "occur"));
      setLedger((rows) => [...buildLedgerFromApplication(approved), ...rows]);
      setApplications((rows) => upsertApplication(rows, approved));
      setPushes((rows) => rows.map((row) => (row.bpmNo === approved.bpmNo ? { ...row, status: "已生成", generatedApplicationCode: approved.code, syncStatus: "同步成功" } : row)));
      setEditingApplication(approved);
      setOverlayLoading("");
      setView("ledger");
      showToast(`${approved.code} 审批通过，台账和预算发生额已模拟更新。`);
    }, 800);
  }

  function rejectApplication() {
    if (!editingApplication) return;
    const groups = buildBudgetSummaries(editingApplication.lines, budgetBalances);
    setBudgetBalances((rows) => applyBudgetChange(rows, groups, "release"));
    const next = refreshApplicationTotal({
      ...editingApplication,
      status: "已驳回",
      approvalStatus: "已驳回",
      lines: editingApplication.lines.map((line) => ({ ...line, budgetStatus: "校验通过", budgetMessage: "审批驳回后预算占用已释放，可修改后重新提交。" })),
      approvals: [...editingApplication.approvals, { node: "财务 BP 审批", approver: "林一", date: today, result: "驳回", comment: "请补充领用场景说明后重新提交。" }],
      logs: [{ time: nowText, operator: "林一", action: "审批驳回", comment: "预算占用已释放，单据回到可编辑状态。" }, ...editingApplication.logs]
    });
    setEditingApplication(next);
    setApplications((rows) => upsertApplication(rows, next));
    showToast("已模拟驳回，预算占用已释放。");
  }

  function closeApplication() {
    if (!editingApplication) return;
    const next = refreshApplicationTotal({
      ...editingApplication,
      status: "已关闭",
      approvalStatus: editingApplication.approvalStatus === "审批中" ? "已驳回" : editingApplication.approvalStatus,
      logs: [{ time: nowText, operator: "陈予", action: "关闭单据", comment: "Demo 中手动关闭，不再进入审批或台账。" }, ...editingApplication.logs]
    });
    setEditingApplication(next);
    setApplications((rows) => upsertApplication(rows, next));
    showToast(`${next.code} 已关闭。`);
  }

  const editingBudgetSummaries = editingApplication ? buildBudgetSummaries(editingApplication.lines, budgetBalances) : [];
  const canEdit = editingApplication ? ["草稿", "待校验", "已驳回"].includes(editingApplication.status) : false;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="internal-use" title="内部领用" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">财务处理 / 内部领用</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">内部领用模块</h1>
              <p className="mt-1 text-sm text-slate-500">BPM 推送、内部领用单、预算校验、审批入账和台账生成的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={simulateBpmPush}>模拟 BPM 推送</Button>
              <Button variant="secondary" onClick={openNewApplication}>新建内部领用单</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟生成内部领用台账导出任务，不创建真实文件。")}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：预算余额 mock 服务响应超时 [504]，请重试。")}>模拟异常</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-5">
            {stats.map((item) => <SummaryCard key={item.label} label={item.label} value={item.value} sub={item.sub} />)}
          </div>

          {pageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium">异常提示</div>
              <div className="mt-1">{pageError}</div>
              <button className="mt-2 font-medium text-red-700 underline" onClick={retryError}>重新校验</button>
            </div>
          )}

          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ["ledger", "内部领用台账"],
                ["pushes", "BPM 推送记录"],
                ["applications", "内部领用单"]
              ].map(([key, label]) => (
                <button key={key} className={`h-9 rounded-md px-3 text-sm font-medium ${view === key ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-600"}`} onClick={() => setView(key as ViewMode)}>
                  {label}
                </button>
              ))}
            </div>

            {view === "ledger" && (
              <LedgerFiltersBar
                filters={ledgerFilters}
                setFilters={setLedgerFilters}
                accountingEntities={accountingEntities}
                useMonths={useMonths}
                applicants={applicants}
                budgetDepartments={budgetDepartments}
                budgetSubjects={budgetSubjects}
                purposes={purposes}
                brands={brands}
                onQuery={simulateQuery}
                onReset={resetFilters}
              />
            )}
            {view === "pushes" && <PushFiltersBar filters={pushFilters} setFilters={setPushFilters} onQuery={simulateQuery} onReset={resetFilters} />}
            {view === "applications" && <ApplicationFiltersBar filters={applicationFilters} setFilters={setApplicationFilters} onQuery={simulateQuery} onReset={resetFilters} />}
          </section>

          <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tableLoading && <LoadingMask text="正在查询内部领用 mock 数据..." />}
            {view === "ledger" && (
              filteredLedger.length > 0 ? (
                <LedgerTable rows={filteredLedger} onDetail={(row) => setDetail({ type: "ledger", row })} onOpenSource={(row) => {
                  const source = applications.find((item) => item.id === row.applicationId || item.code === row.applicationCode);
                  if (source) openApplication(source);
                }} />
              ) : (
                <EmptyState title="暂无匹配的内部领用台账" description="审批通过后会按 SKU 明细插入台账。可重置筛选或从 BPM 推送记录生成单据。" action="模拟 BPM 推送" onAction={simulateBpmPush} onReset={resetFilters} />
              )
            )}
            {view === "pushes" && (
              filteredPushes.length > 0 ? (
                <PushTable rows={filteredPushes} onGenerate={generateApplicationFromPush} onRetry={retryPush} onIgnore={ignorePush} onDetail={(row) => setDetail({ type: "push", row })} />
              ) : (
                <EmptyState title="当前无待同步的 BPM 领用数据" description="可点击模拟 BPM 推送生成新的待处理批次。" action="模拟 BPM 推送" onAction={simulateBpmPush} onReset={resetFilters} />
              )
            )}
            {view === "applications" && (
              filteredApplications.length > 0 ? (
                <ApplicationTable rows={filteredApplications} onOpen={openApplication} onDetail={(row) => setDetail({ type: "application", row })} />
              ) : (
                <EmptyState title="暂无匹配的内部领用单" description="从 BPM 推送生成或手工新增草稿后，可在这里继续预算校验和审批。" action="新建内部领用单" onAction={openNewApplication} onReset={resetFilters} />
              )
            )}
          </section>
        </section>
      </div>

      {editingApplication && (
        <Modal title={`${editingApplication.code} 内部领用单`} onClose={() => setEditingApplication(null)} size="xl">
          {errors.budget && <Alert tone="orange">{errors.budget}</Alert>}
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="单据名称" value={editingApplication.title} />
            <ReadOnly label="申请日期" value={editingApplication.applyDate} />
            <ReadOnly label="申请人" value={editingApplication.applicant} />
            <ReadOnly label="单据状态" value={<StatusBadge status={editingApplication.status} />} />
            <ReadOnly label="申请人公司" value={editingApplication.applicantCompany} />
            <ReadOnly label="申请人部门" value={editingApplication.applicantDepartment} />
            <ReadOnly label="申请人岗位" value={editingApplication.applicantPosition} />
            <ReadOnly label="实付金额合计" value={formatMoney(editingApplication.totalAmount)} />
            <ReadOnly label="来源系统" value={<span><span className="mr-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">{editingApplication.sourceSystem}</span>{editingApplication.bpmNo}</span>} />
            <ReadOnly label="推送批次号" value={editingApplication.batchNo} />
            <ReadOnly label="同步状态" value={<StatusBadge status={editingApplication.syncStatus} />} />
            <ReadOnly label="最近同步时间" value={editingApplication.lastSyncAt} />
          </div>

          <Section title="内部领用明细" extra={canEdit ? <Button size="sm" variant="secondary" onClick={addLine}>新增明细</Button> : undefined}>
            {errors.lines && <Alert tone="red">{errors.lines}</Alert>}
            <div className="overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-xs text-slate-600">
                  <tr>
                    <Th>行号</Th>
                    <Th>核算主体</Th>
                    <Th>二级部门</Th>
                    <Th>领用日期</Th>
                    <Th>BPM业务用途</Th>
                    <Th>BPM场景描述</Th>
                    <Th>SKU名称</Th>
                    <Th>订购数量</Th>
                    <Th>单价</Th>
                    <Th>实付金额</Th>
                    <Th>*预算部门</Th>
                    <Th>预算科目</Th>
                    <Th>预算状态</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {editingApplication.lines.map((line, index) => (
                    <tr key={line.id} className={["映射缺失", "预算不足"].includes(line.budgetStatus) ? "bg-red-50/60" : ""}>
                      <Td>{index + 1}</Td>
                      <Td><CellInput value={line.accountingEntity} disabled={!canEdit} onChange={(value) => patchLine(line.id, { accountingEntity: value })} /></Td>
                      <Td>
                        <CellSelect value={line.secondDepartment} disabled={!canEdit} options={departmentMappings.map((item) => item.department)} onChange={(value) => patchLine(line.id, { secondDepartment: value, budgetDepartment: mapBudgetDepartment(value) })} />
                      </Td>
                      <Td><CellInput value={line.useDate} disabled={!canEdit} onChange={(value) => patchLine(line.id, { useDate: value })} /></Td>
                      <Td>
                        <CellSelect value={line.bpmPurpose} disabled={!canEdit} options={[...purposeMappings.map((item) => item.purpose), "社群种草样品"]} onChange={(value) => {
                          const mapping = mapPurpose(value);
                          patchLine(line.id, { bpmPurpose: value, budgetSubject: mapping.budgetSubject, majorSubject: mapping.majorSubject });
                        }} />
                      </Td>
                      <Td><CellInput value={line.bpmScene} disabled={!canEdit} onChange={(value) => patchLine(line.id, { bpmScene: value })} /></Td>
                      <Td>
                        <CellSelect value={line.skuCode} disabled={!canEdit} options={productOptions.map((item) => item.skuCode)} labels={Object.fromEntries(productOptions.map((item) => [item.skuCode, item.skuName]))} onChange={(skuCode) => {
                          const product = productOptions.find((item) => item.skuCode === skuCode);
                          if (product) patchLine(line.id, { skuCode, skuName: product.skuName, brand: product.brand, unitPrice: product.defaultPrice });
                        }} />
                      </Td>
                      <Td align="right"><CellNumber value={line.quantity} disabled={!canEdit} onChange={(value) => patchLine(line.id, { quantity: value })} /></Td>
                      <Td align="right"><CellNumber value={line.unitPrice} disabled={!canEdit} onChange={(value) => patchLine(line.id, { unitPrice: value })} /></Td>
                      <Td align="right">{formatMoney(lineAmount(line))}</Td>
                      <Td><CellSelect value={line.budgetDepartment} disabled={!canEdit} options={budgetDepartments} onChange={(value) => patchLine(line.id, { budgetDepartment: value })} /></Td>
                      <Td><CellSelect value={line.budgetSubject} disabled={!canEdit} options={budgetSubjects} onChange={(value) => patchLine(line.id, { budgetSubject: value, majorSubject: findMajorSubject(value) })} /></Td>
                      <Td>
                        <StatusBadge status={line.budgetStatus} />
                        {line.budgetMessage && <div className="mt-1 max-w-52 whitespace-normal text-xs text-slate-500">{line.budgetMessage}</div>}
                      </Td>
                      <Td>
                        {canEdit ? <button className="text-blue-600 hover:underline" onClick={() => removeLine(line.id)}>删除</button> : "-"}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Section>

          <Section title="预算区" extra={canEdit ? <Button size="sm" variant="secondary" onClick={runBudgetCheck}>执行预算校验</Button> : undefined}>
            <div className="overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-xs text-slate-600">
                  <tr>
                    <Th>行号</Th>
                    <Th>预算部门</Th>
                    <Th>预算科目</Th>
                    <Th>一级预算科目</Th>
                    <Th>金额</Th>
                    <Th>预算可用金额</Th>
                    <Th>预算占用金额</Th>
                    <Th>预算发生额</Th>
                    <Th>预算状态</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {editingBudgetSummaries.map((item, index) => (
                    <tr key={`${item.budgetDepartment}-${item.budgetSubject}`} className={item.status === "预算不足" || item.status === "映射缺失" ? "bg-red-50/60" : ""}>
                      <Td>{index + 1}</Td>
                      <Td>{item.budgetDepartment || "未映射"}</Td>
                      <Td>{item.budgetSubject || "未映射"}</Td>
                      <Td>{item.majorSubject || "-"}</Td>
                      <Td align="right">{formatMoney(item.amount)}</Td>
                      <Td align="right">{formatMoney(item.available)}</Td>
                      <Td align="right">{formatMoney(item.occupied)}</Td>
                      <Td align="right">{formatMoney(item.occurred)}</Td>
                      <Td><StatusBadge status={item.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="审批区">
              {editingApplication.approvals.length > 0 ? <StepList steps={editingApplication.approvals} /> : <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm text-slate-500">尚未提交审批。</div>}
            </Section>
            <Section title="操作日志">
              <RecordList rows={editingApplication.logs} />
            </Section>
          </div>

          <ModalActions>
            <Button variant="secondary" onClick={() => setEditingApplication(null)}>关闭</Button>
            {canEdit && <Button variant="secondary" onClick={saveApplicationDraft}>保存草稿</Button>}
            {canEdit && <Button variant="secondary" onClick={runBudgetCheck}>预算校验</Button>}
            {canEdit && <Button onClick={submitApproval}>提交审批</Button>}
            {editingApplication.status === "审批中" && <Button variant="secondary" onClick={rejectApplication}>模拟驳回</Button>}
            {editingApplication.status === "审批中" && <Button onClick={approveApplication}>模拟审批通过</Button>}
            {!["已完成", "已关闭"].includes(editingApplication.status) && <Button variant="secondary" onClick={closeApplication}>关闭单据</Button>}
          </ModalActions>
        </Modal>
      )}

      {detail && <DetailDrawer data={detail} applications={applications} budgetBalances={budgetBalances} onClose={() => setDetail(null)} onOpenApplication={(application) => {
        setDetail(null);
        openApplication(application);
      }} />}

      {overlayLoading && <LoadingMask text={overlayLoading} full />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function LedgerFiltersBar({
  filters,
  setFilters,
  accountingEntities,
  useMonths,
  applicants,
  budgetDepartments,
  budgetSubjects,
  purposes,
  brands,
  onQuery,
  onReset
}: {
  filters: LedgerFilters;
  setFilters: (filters: LedgerFilters) => void;
  accountingEntities: string[];
  useMonths: string[];
  applicants: string[];
  budgetDepartments: string[];
  budgetSubjects: string[];
  purposes: string[];
  brands: string[];
  onQuery: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-8">
      <Field label="关键词">
        <Input value={filters.keyword} onChange={(keyword) => setFilters({ ...filters, keyword })} placeholder="单号 / SKU / 场景" />
      </Field>
      <Field label="核算主体">
        <Select value={filters.accountingEntity} onChange={(accountingEntity) => setFilters({ ...filters, accountingEntity })} options={["全部", ...accountingEntities]} />
      </Field>
      <Field label="领用月份">
        <Select value={filters.useMonth} onChange={(useMonth) => setFilters({ ...filters, useMonth })} options={["全部", ...useMonths]} />
      </Field>
      <Field label="申请人">
        <Select value={filters.applicant} onChange={(applicant) => setFilters({ ...filters, applicant })} options={["全部", ...applicants]} />
      </Field>
      <Field label="预算部门">
        <Select value={filters.budgetDepartment} onChange={(budgetDepartment) => setFilters({ ...filters, budgetDepartment })} options={["全部", ...budgetDepartments]} />
      </Field>
      <Field label="预算科目">
        <Select value={filters.budgetSubject} onChange={(budgetSubject) => setFilters({ ...filters, budgetSubject })} options={["全部", ...budgetSubjects]} />
      </Field>
      <Field label="业务用途">
        <Select value={filters.bpmPurpose} onChange={(bpmPurpose) => setFilters({ ...filters, bpmPurpose })} options={["全部", ...purposes]} />
      </Field>
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Field label="品牌">
            <Select value={filters.brand} onChange={(brand) => setFilters({ ...filters, brand })} options={["全部", ...brands]} />
          </Field>
        </div>
        <Button size="sm" onClick={onQuery}>查询</Button>
        <Button size="sm" variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function PushFiltersBar({ filters, setFilters, onQuery, onReset }: { filters: PushFilters; setFilters: (filters: PushFilters) => void; onQuery: () => void; onReset: () => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Field label="关键词">
        <Input value={filters.keyword} onChange={(keyword) => setFilters({ ...filters, keyword })} placeholder="BPM 单号 / 批次 / 标题" />
      </Field>
      <Field label="推送状态">
        <Select value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={["全部", "待生成", "已生成", "推送失败", "重复推送", "已忽略"]} />
      </Field>
      <Field label="同步状态">
        <Select value={filters.syncStatus} onChange={(syncStatus) => setFilters({ ...filters, syncStatus })} options={["全部", "未同步", "同步中", "同步成功", "同步失败"]} />
      </Field>
      <div className="flex items-end gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function ApplicationFiltersBar({ filters, setFilters, onQuery, onReset }: { filters: ApplicationFilters; setFilters: (filters: ApplicationFilters) => void; onQuery: () => void; onReset: () => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Field label="关键词">
        <Input value={filters.keyword} onChange={(keyword) => setFilters({ ...filters, keyword })} placeholder="单号 / BPM / 申请人 / SKU" />
      </Field>
      <Field label="单据状态">
        <Select value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={["全部", "草稿", "待校验", "审批中", "已驳回", "审批通过", "已完成", "已关闭"]} />
      </Field>
      <Field label="预算状态">
        <Select value={filters.budgetStatus} onChange={(budgetStatus) => setFilters({ ...filters, budgetStatus })} options={["全部", "未校验", "校验通过", "预算不足", "映射缺失", "已占用", "已发生"]} />
      </Field>
      <div className="flex items-end gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function LedgerTable({ rows, onDetail, onOpenSource }: { rows: InternalUseLedger[]; onDetail: (row: InternalUseLedger) => void; onOpenSource: (row: InternalUseLedger) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>单据编号</Th>
            <Th>核算主体</Th>
            <Th>申请人</Th>
            <Th>领用日期</Th>
            <Th>BPM业务用途</Th>
            <Th>BPM场景描述</Th>
            <Th>SKU名称</Th>
            <Th>订购数量</Th>
            <Th>单价</Th>
            <Th>实付金额</Th>
            <Th>*预算部门</Th>
            <Th>预算科目</Th>
            <Th>二级部门</Th>
            <Th>一级预算科目</Th>
            <Th>品牌</Th>
            <Th>状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onOpenSource(row)}>{row.applicationCode}</button></Td>
              <Td>{row.accountingEntity}</Td>
              <Td>{row.applicant}</Td>
              <Td>{row.useDate}</Td>
              <Td>{row.bpmPurpose}</Td>
              <Td>{row.bpmScene}</Td>
              <Td>{row.skuName}</Td>
              <Td align="right">{row.quantity}</Td>
              <Td align="right">{formatMoney(row.unitPrice)}</Td>
              <Td align="right">{formatMoney(row.amount)}</Td>
              <Td>{row.budgetDepartment}</Td>
              <Td>{row.budgetSubject}</Td>
              <Td>{row.secondDepartment}</Td>
              <Td>{row.majorSubject}</Td>
              <Td>{row.brand}</Td>
              <Td><StatusBadge status={row.budgetUpdateStatus} /></Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(row)}>详情</button>
                  <button onClick={() => onOpenSource(row)}>来源单据</button>
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function PushTable({ rows, onGenerate, onRetry, onIgnore, onDetail }: { rows: BpmPush[]; onGenerate: (row: BpmPush) => void; onRetry: (row: BpmPush) => void; onIgnore: (row: BpmPush) => void; onDetail: (row: BpmPush) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>BPM 单号</Th>
            <Th>推送批次号</Th>
            <Th>标题</Th>
            <Th>推送时间</Th>
            <Th>申请人</Th>
            <Th>部门</Th>
            <Th>明细数</Th>
            <Th>推送金额</Th>
            <Th>推送状态</Th>
            <Th>同步状态</Th>
            <Th>失败原因</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((row) => (
            <tr key={row.id} className={row.status === "推送失败" || row.status === "重复推送" ? "bg-red-50/50" : "hover:bg-slate-50"}>
              <Td>{row.bpmNo}</Td>
              <Td>{row.batchNo}</Td>
              <Td>{row.title}</Td>
              <Td>{row.pushedAt}</Td>
              <Td>{row.applicant}</Td>
              <Td>{row.applicantDepartment}</Td>
              <Td align="right">{row.lines.length}</Td>
              <Td align="right">{formatMoney(sum(row.lines.map(lineAmount)))}</Td>
              <Td><StatusBadge status={row.status} /></Td>
              <Td><StatusBadge status={row.syncStatus} /></Td>
              <Td>{row.failureReason ?? row.generatedApplicationCode ?? "-"}</Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(row)}>详情</button>
                  {row.status === "待生成" && <button onClick={() => onGenerate(row)}>模拟生成单据</button>}
                  {row.status === "推送失败" && <button onClick={() => onRetry(row)}>重新推送</button>}
                  {(row.status === "重复推送" || row.status === "推送失败") && <button onClick={() => onIgnore(row)}>忽略</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function ApplicationTable({ rows, onOpen, onDetail }: { rows: InternalUseApplication[]; onOpen: (row: InternalUseApplication) => void; onDetail: (row: InternalUseApplication) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>单据编号</Th>
            <Th>单据名称</Th>
            <Th>申请日期</Th>
            <Th>申请人</Th>
            <Th>BPM 单号</Th>
            <Th>明细数</Th>
            <Th>实付金额合计</Th>
            <Th>单据状态</Th>
            <Th>审批状态</Th>
            <Th>预算状态</Th>
            <Th>同步状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onOpen(row)}>{row.code}</button></Td>
              <Td>{row.title}</Td>
              <Td>{row.applyDate}</Td>
              <Td>{row.applicant}</Td>
              <Td>{row.bpmNo}</Td>
              <Td align="right">{row.lines.length}</Td>
              <Td align="right">{formatMoney(row.totalAmount)}</Td>
              <Td><StatusBadge status={row.status} /></Td>
              <Td><StatusBadge status={row.approvalStatus} /></Td>
              <Td><StatusBadge status={aggregateBudgetStatus(row.lines)} /></Td>
              <Td><StatusBadge status={row.syncStatus} /></Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onOpen(row)}>{row.status === "已完成" ? "查看单据" : "处理"}</button>
                  <button onClick={() => onDetail(row)}>详情</button>
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function DetailDrawer({ data, applications, budgetBalances, onClose, onOpenApplication }: { data: DetailData; applications: InternalUseApplication[]; budgetBalances: BudgetBalance[]; onClose: () => void; onOpenApplication: (row: InternalUseApplication) => void }) {
  const application = data.type === "application" ? data.row : data.type === "ledger" ? applications.find((item) => item.id === data.row.applicationId || item.code === data.row.applicationCode) : undefined;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{data.type === "ledger" ? data.row.applicationCode : data.type === "push" ? data.row.bpmNo : data.row.code}</h2>
            <div className="mt-1 text-sm text-slate-500">{data.type === "ledger" ? "内部领用台账详情" : data.type === "push" ? "BPM 推送详情" : "内部领用单详情"}</div>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          {data.type === "ledger" && (
            <>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm text-blue-700">预算更新日志</div>
                <div className="mt-1 font-medium text-blue-900">审批通过后已按明细插入内部领用台账，预算发生数=+{formatMoney(data.row.amount)}。</div>
              </div>
              <DetailGrid rows={[
                ["单据编号", data.row.applicationCode],
                ["核算主体", data.row.accountingEntity],
                ["申请人", data.row.applicant],
                ["领用日期", data.row.useDate],
                ["BPM业务用途", data.row.bpmPurpose],
                ["BPM场景描述", data.row.bpmScene],
                ["SKU名称", data.row.skuName],
                ["品牌", data.row.brand],
                ["实付金额", formatMoney(data.row.amount)],
                ["预算部门", data.row.budgetDepartment],
                ["预算科目", data.row.budgetSubject],
                ["一级预算科目", data.row.majorSubject]
              ]} />
              {application && <Button variant="secondary" onClick={() => onOpenApplication(application)}>查看来源单据</Button>}
            </>
          )}
          {data.type === "push" && (
            <>
              {data.row.failureReason && <Alert tone="red">{data.row.failureReason}</Alert>}
              <DetailGrid rows={[
                ["BPM 单号", data.row.bpmNo],
                ["推送批次号", data.row.batchNo],
                ["标题", data.row.title],
                ["推送时间", data.row.pushedAt],
                ["申请人", data.row.applicant],
                ["申请人部门", data.row.applicantDepartment],
                ["推送状态", <StatusBadge key="status" status={data.row.status} />],
                ["同步状态", <StatusBadge key="sync" status={data.row.syncStatus} />],
                ["生成单据", data.row.generatedApplicationCode ?? "-"]
              ]} />
              <MiniLineTable rows={data.row.lines} />
            </>
          )}
          {application && data.type !== "ledger" && (
            <>
              <DetailGrid rows={[
                ["单据编号", application.code],
                ["单据名称", application.title],
                ["申请日期", application.applyDate],
                ["申请人", application.applicant],
                ["实付金额合计", formatMoney(application.totalAmount)],
                ["单据状态", <StatusBadge key="doc" status={application.status} />],
                ["审批状态", <StatusBadge key="approval" status={application.approvalStatus} />],
                ["来源系统", application.sourceSystem],
                ["BPM 单号", application.bpmNo]
              ]} />
              <MiniLineTable rows={application.lines} />
              <Section title="预算区">
                <div className="space-y-2">
                  {buildBudgetSummaries(application.lines, budgetBalances).map((item) => (
                    <div key={`${item.budgetDepartment}-${item.budgetSubject}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div className="font-medium">{item.budgetDepartment || "未映射"} / {item.budgetSubject || "未映射"}</div>
                      <div className="mt-1 text-slate-500">金额 {formatMoney(item.amount)}，可用 {formatMoney(item.available)}，发生额 {formatMoney(item.occurred)}</div>
                    </div>
                  ))}
                </div>
              </Section>
              <Section title="审批记录">
                {application.approvals.length > 0 ? <StepList steps={application.approvals} /> : <div className="text-sm text-slate-500">尚无审批记录。</div>}
              </Section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function MiniLineTable({ rows }: { rows: InternalUseLine[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>SKU名称</Th>
            <Th>品牌</Th>
            <Th>用途</Th>
            <Th>数量</Th>
            <Th>单价</Th>
            <Th>实付金额</Th>
            <Th>预算科目</Th>
            <Th>状态</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((row) => (
            <tr key={row.id}>
              <Td>{row.skuName}</Td>
              <Td>{row.brand}</Td>
              <Td>{row.bpmPurpose}</Td>
              <Td align="right">{row.quantity}</Td>
              <Td align="right">{formatMoney(row.unitPrice)}</Td>
              <Td align="right">{formatMoney(lineAmount(row))}</Td>
              <Td>{row.budgetSubject || "-"}</Td>
              <Td><StatusBadge status={row.budgetStatus} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function buildPush({
  id,
  bpmNo,
  batchNo,
  title,
  pushedAt,
  applicant,
  department,
  position,
  status,
  syncStatus = "同步成功",
  failureReason,
  lines
}: {
  id: string;
  bpmNo: string;
  batchNo: string;
  title: string;
  pushedAt: string;
  applicant: string;
  department: string;
  position: string;
  status: PushStatus;
  syncStatus?: SyncStatus;
  failureReason?: string;
  lines: Array<[string, string, string, string, string, number, number]>;
}): BpmPush {
  return {
    id,
    bpmNo,
    batchNo,
    title,
    pushedAt,
    applicant,
    applicantCompany: companyByDepartment(department),
    applicantDepartment: department,
    applicantPosition: position,
    status,
    syncStatus,
    failureReason,
    lines: lines.map((line, index) => buildLine(`${id}-line-${index + 1}`, line, true))
  };
}

function buildApplication({
  id,
  code,
  title,
  applicant,
  department,
  status,
  bpmNo,
  batchNo,
  applyDate,
  lastSyncAt,
  lines
}: {
  id: string;
  code: string;
  title: string;
  applicant: string;
  department: string;
  status: DocumentStatus;
  bpmNo: string;
  batchNo: string;
  applyDate: string;
  lastSyncAt: string;
  lines: Array<[string, string, string, string, string, number, number]>;
}): InternalUseApplication {
  const normalizedLines = lines.map((line, index) => {
    const statusForLine: BudgetCheckStatus = status === "已完成" ? "已发生" : status === "审批中" ? "已占用" : status === "已驳回" ? "校验通过" : "未校验";
    const built = buildLine(`${id}-line-${index + 1}`, line, true);
    return { ...built, budgetStatus: statusForLine, budgetMessage: statusForLine === "已发生" ? "已计入预算实际发生额。" : "" };
  });
  const application: InternalUseApplication = {
    id,
    code,
    title,
    applyDate,
    applicant,
    applicantCompany: companyByDepartment(department),
    applicantDepartment: department,
    applicantPosition: department.includes("渠道") ? "渠道运营" : department.includes("电商") ? "电商运营" : "营销运营",
    totalAmount: sum(normalizedLines.map(lineAmount)),
    status,
    approvalStatus: status === "已完成" ? "已完成" : status === "审批中" ? "审批中" : status === "已驳回" ? "已驳回" : "未提交",
    sourceSystem: "[BPM]",
    bpmNo,
    batchNo,
    syncStatus: status === "已完成" ? "同步成功" : "未同步",
    lastSyncAt,
    lines: normalizedLines,
    approvals: status === "已完成" ? [{ node: "财务 BP 审批", approver: "林一", date: applyDate, result: "通过", comment: "内部领用入账审批通过。" }] : status === "已驳回" ? [{ node: "财务 BP 审批", approver: "林一", date: applyDate, result: "驳回", comment: "请补充用途说明。" }] : [],
    logs: [{ time: lastSyncAt, operator: "系统模拟", action: "初始化单据", comment: "Demo 初始内部领用单样例。" }]
  };
  return application;
}

function buildLine(id: string, [department, useDate, purpose, scene, skuCode, quantity, unitPrice]: [string, string, string, string, string, number, number], readonlyFromBpm: boolean): InternalUseLine {
  const product = productOptions.find((item) => item.skuCode === skuCode) ?? productOptions[0];
  const purposeMapping = mapPurpose(purpose);
  return {
    id,
    accountingEntity: companyByDepartment(department),
    secondDepartment: department,
    useDate,
    bpmPurpose: purpose,
    bpmScene: scene,
    skuCode: product.skuCode,
    skuName: product.skuName,
    brand: product.brand,
    quantity,
    unitPrice,
    budgetDepartment: mapBudgetDepartment(department),
    budgetSubject: purposeMapping.budgetSubject,
    majorSubject: purposeMapping.majorSubject,
    budgetStatus: purposeMapping.budgetSubject ? "未校验" : "映射缺失",
    budgetMessage: purposeMapping.budgetSubject ? "" : "BPM 业务用途未映射预算科目。",
    readonlyFromBpm
  };
}

function normalizeLine(line: InternalUseLine): InternalUseLine {
  const product = productOptions.find((item) => item.skuCode === line.skuCode);
  return {
    ...line,
    skuName: product?.skuName ?? line.skuName,
    brand: product?.brand ?? line.brand,
    unitPrice: Number.isFinite(line.unitPrice) ? line.unitPrice : product?.defaultPrice ?? 0,
    quantity: Number.isFinite(line.quantity) ? line.quantity : 0
  };
}

function buildLedgerFromApplication(application: InternalUseApplication): InternalUseLedger[] {
  return application.lines.map((line, index) => ({
    id: `ledger-${application.id}-${line.id}-${index}`,
    applicationId: application.id,
    applicationCode: application.code,
    accountingEntity: line.accountingEntity,
    applicant: application.applicant,
    applyDate: application.applyDate,
    useDate: line.useDate,
    useMonth: line.useDate.slice(0, 7),
    bpmPurpose: line.bpmPurpose,
    bpmScene: line.bpmScene,
    skuName: line.skuName,
    skuCode: line.skuCode,
    brand: line.brand,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    amount: lineAmount(line),
    budgetDepartment: line.budgetDepartment,
    budgetSubject: line.budgetSubject,
    majorSubject: line.majorSubject,
    secondDepartment: line.secondDepartment,
    sourceSystem: application.sourceSystem,
    bpmNo: application.bpmNo,
    approvalStatus: "已完成",
    budgetUpdateStatus: "已发生",
    updatedAt: nowText
  }));
}

function buildBudgetSummaries(lines: InternalUseLine[], balances: BudgetBalance[]) {
  const map = new Map<string, { budgetDepartment: string; budgetSubject: string; majorSubject: string; amount: number }>();
  lines.forEach((line) => {
    const key = `${line.budgetDepartment || "未映射"}-${line.budgetSubject || "未映射"}`;
    const current = map.get(key) ?? { budgetDepartment: line.budgetDepartment, budgetSubject: line.budgetSubject, majorSubject: line.majorSubject, amount: 0 };
    current.amount += lineAmount(line);
    map.set(key, current);
  });
  return Array.from(map.values()).map((item) => {
    const balance = balances.find((row) => row.budgetDepartment === item.budgetDepartment && row.budgetSubject === item.budgetSubject);
    const available = balance ? Math.max(0, balance.totalBudget - balance.occupiedAmount - balance.occurredAmount) : 0;
    const status: BudgetCheckStatus = !item.budgetDepartment || !item.budgetSubject || !balance ? "映射缺失" : item.amount > available ? "预算不足" : "校验通过";
    return {
      ...item,
      balance,
      available,
      occupied: balance?.occupiedAmount ?? 0,
      occurred: balance?.occurredAmount ?? 0,
      status
    };
  });
}

function buildStats(ledger: InternalUseLedger[], applications: InternalUseApplication[], pushes: BpmPush[], balances: BudgetBalance[]) {
  const currentMonthLedger = ledger.filter((item) => item.useMonth === "2026-05");
  const abnormalApplications = applications.filter((item) => item.lines.some((line) => ["预算不足", "映射缺失"].includes(line.budgetStatus))).length + pushes.filter((item) => ["推送失败", "重复推送"].includes(item.status)).length;
  return [
    { label: "本月领用金额", value: formatMoney(sum(currentMonthLedger.map((item) => item.amount))), sub: "2026-05 已入账台账" },
    { label: "内部领用单数", value: applications.length.toString(), sub: "覆盖草稿、审批中、已完成" },
    { label: "SKU 数量", value: unique(ledger.map((item) => item.skuCode)).length.toString(), sub: "已写入台账 SKU" },
    { label: "预算发生金额", value: formatMoney(sum(balances.map((item) => item.occurredAmount))), sub: "mock 预算余额发生数" },
    { label: "异常单数", value: abnormalApplications.toString(), sub: "推送失败 / 映射缺失 / 预算不足" }
  ];
}

function validateApplication(application: InternalUseApplication) {
  const errors: Record<string, string> = {};
  if (!application.lines.length) errors.lines = "请至少保留一条内部领用明细。";
  application.lines.forEach((line, index) => {
    const prefix = `第 ${index + 1} 行`;
    if (!line.accountingEntity || !line.secondDepartment || !line.useDate || !line.bpmPurpose || !line.skuName || !line.bpmScene) errors.lines = `${prefix} 存在必填字段未填写。`;
    if (!line.quantity || line.quantity <= 0) errors.lines = `${prefix} 订购数量必须大于 0。`;
    if (!line.unitPrice || line.unitPrice <= 0) errors.lines = `${prefix} 单价必须大于 0。`;
    if (!line.budgetDepartment) errors.lines = `${prefix} 预算部门必填。`;
  });
  return errors;
}

function applyBudgetChange(rows: BudgetBalance[], groups: ReturnType<typeof buildBudgetSummaries>, action: "occupy" | "release" | "occur") {
  return rows.map((row) => {
    const group = groups.find((item) => item.budgetDepartment === row.budgetDepartment && item.budgetSubject === row.budgetSubject);
    if (!group) return row;
    if (action === "occupy") return { ...row, occupiedAmount: row.occupiedAmount + group.amount };
    if (action === "release") return { ...row, occupiedAmount: Math.max(0, row.occupiedAmount - group.amount) };
    return { ...row, occupiedAmount: Math.max(0, row.occupiedAmount - group.amount), occurredAmount: row.occurredAmount + group.amount };
  });
}

function upsertApplication(rows: InternalUseApplication[], application: InternalUseApplication) {
  return rows.some((row) => row.id === application.id) ? rows.map((row) => (row.id === application.id ? application : row)) : [application, ...rows];
}

function refreshApplicationTotal(application: InternalUseApplication): InternalUseApplication {
  return { ...application, totalAmount: sum(application.lines.map(lineAmount)) };
}

function cloneApplication(application: InternalUseApplication): InternalUseApplication {
  return { ...application, lines: application.lines.map((line) => ({ ...line })), approvals: application.approvals.map((item) => ({ ...item })), logs: application.logs.map((item) => ({ ...item })) };
}

function filterLedger(rows: InternalUseLedger[], filters: LedgerFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.applicationCode, item.bpmNo, item.skuName, item.bpmScene, item.brand].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.accountingEntity, item.accountingEntity) && match(filters.useMonth, item.useMonth) && match(filters.applicant, item.applicant) && match(filters.budgetDepartment, item.budgetDepartment) && match(filters.budgetSubject, item.budgetSubject) && match(filters.bpmPurpose, item.bpmPurpose) && match(filters.brand, item.brand);
  });
}

function filterPushes(rows: BpmPush[], filters: PushFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.bpmNo, item.batchNo, item.title, item.applicant, item.failureReason ?? ""].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.status, item.status) && match(filters.syncStatus, item.syncStatus);
  });
}

function filterApplications(rows: InternalUseApplication[], filters: ApplicationFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.code, item.title, item.bpmNo, item.applicant, ...item.lines.map((line) => `${line.skuName} ${line.bpmScene}`)].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.status, item.status) && (filters.budgetStatus === "全部" || item.lines.some((line) => line.budgetStatus === filters.budgetStatus));
  });
}

function match(filter: string, value: string) {
  return filter === "全部" || filter === value;
}

function mapBudgetDepartment(department: string) {
  return departmentMappings.find((item) => item.department === department)?.budgetDepartment ?? "";
}

function mapPurpose(purpose: string) {
  return purposeMappings.find((item) => item.purpose === purpose) ?? { purpose, budgetSubject: "", majorSubject: "" };
}

function findMajorSubject(budgetSubject: string) {
  return purposeMappings.find((item) => item.budgetSubject === budgetSubject)?.majorSubject ?? "";
}

function companyByDepartment(department: string) {
  if (department.includes("电商")) return "杭州电商运营有限公司";
  if (department.includes("渠道")) return "北京渠道增长有限公司";
  return "上海营销科技有限公司";
}

function aggregateBudgetStatus(lines: InternalUseLine[]) {
  if (lines.some((line) => line.budgetStatus === "预算不足")) return "预算不足";
  if (lines.some((line) => line.budgetStatus === "映射缺失")) return "映射缺失";
  if (lines.every((line) => line.budgetStatus === "已发生")) return "已发生";
  if (lines.every((line) => line.budgetStatus === "已占用")) return "已占用";
  if (lines.every((line) => line.budgetStatus === "校验通过")) return "校验通过";
  return "未校验";
}

function lineAmount(line: InternalUseLine) {
  return Math.max(0, Number(line.quantity) || 0) * Math.max(0, Number(line.unitPrice) || 0);
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatMoney(value: number) {
  return `CNY ${Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full divide-y divide-slate-200">{children}</table>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold tracking-normal">{children}</th>;
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <td className={`whitespace-nowrap px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : "text-slate-700"}`}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-44 flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; size?: "sm" | "md"; disabled?: boolean }) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  const variantClass = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400";
  return <button type="button" disabled={disabled} className={`${sizeClass} rounded-md font-medium shadow-sm ${variantClass}`} onClick={onClick}>{children}</button>;
}

function Field({ label, children, required, error }: { label: string; children: ReactNode; required?: boolean; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-500">{required && <span className="text-red-500">*</span>} {label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder = "", disabled = false }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500" value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options, labels, disabled = false }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; disabled?: boolean }) {
  const normalized = Array.from(new Set(options.includes(value) ? options : [value, ...options].filter(Boolean)));
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      {normalized.map((option) => <option key={option || "empty"} value={option}>{labels?.[option] ?? option}</option>)}
    </select>
  );
}

function CellInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <input className="h-8 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function CellNumber({ value, onChange, disabled = false }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <input type="number" min="0" className="h-8 w-24 rounded-md border border-slate-300 bg-white px-2 text-right text-sm tabular-nums outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} />;
}

function CellSelect({ value, onChange, options, labels, disabled = false }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; disabled?: boolean }) {
  const normalized = Array.from(new Set(options.includes(value) ? options : [value, ...options].filter(Boolean)));
  return (
    <select className="h-8 w-44 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      {normalized.map((option) => <option key={option || "empty"} value={option}>{labels?.[option] ?? (option || "请选择")}</option>)}
    </select>
  );
}

function ReadOnly({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status.includes("失败") || status.includes("驳回") || status.includes("不足")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("完成") || status.includes("成功") || status.includes("通过") || status.includes("发生") || status.includes("已生成")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("审批") || status.includes("同步中") || status.includes("占用") || status.includes("校验")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("缺失") || status.includes("重复")
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status || "-"}</span>;
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rows.map(([label, value]) => <ReadOnly key={label} label={label} value={value} />)}
    </div>
  );
}

function Section({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        {extra}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function StepList({ steps }: { steps: ApprovalRecord[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={`${step.node}-${index}`} className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">{index + 1}</div>
          <div className="min-w-0 text-sm">
            <div className="font-medium">{step.node} / {step.result}</div>
            <div className="text-slate-500">{step.approver} / {step.date}</div>
            <div className="text-slate-600">{step.comment}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecordList({ rows }: { rows: OperationLog[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={`${row.time}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
            <span className="font-medium">{row.action}</span>
            <span className="text-slate-400">{row.time}</span>
          </div>
          <div className="mt-1 text-slate-500">{row.operator} / {row.comment}</div>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, children, onClose, size = "lg" }: { title: string; children: ReactNode; onClose: () => void; size?: "lg" | "xl" }) {
  const sizeClass = size === "xl" ? "max-w-7xl" : "max-w-5xl";
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className={`my-6 w-full ${sizeClass} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
}

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" }) {
  const className = tone === "orange" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`rounded-lg border p-3 text-sm ${className}`}>{children}</div>;
}

function LoadingMask({ text, full = false }: { text: string; full?: boolean }) {
  return (
    <div className={`${full ? "fixed inset-0 z-50 bg-black/40" : "absolute inset-0 z-10 bg-white/70"} flex items-center justify-center backdrop-blur-sm`}>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent align-[-1px]" />
        {text}
      </div>
    </div>
  );
}

function EmptyState({ title, description, action, onAction, onReset }: { title: string; description: string; action: string; onAction: () => void; onReset: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-t border-slate-100 bg-slate-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">0</div>
      <div className="font-medium text-slate-700">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button onClick={onAction}>{action}</Button>
      </div>
    </div>
  );
}
