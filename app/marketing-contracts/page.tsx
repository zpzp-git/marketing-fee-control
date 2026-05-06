"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type ContractStatus = "待复核" | "复核中" | "已生效" | "履约中" | "变更中" | "终止审批中" | "已终止" | "已驳回";
type CompletionStatus = "未完结" | "履约中" | "已完结" | "已终止";
type ReviewStatus = "待处理" | "审批中" | "已驳回" | "已完成";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type PoStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "已完成";
type DetailTab = "base" | "lines" | "fulfillment" | "invoice" | "logs";

interface ApprovalRecord {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface OperationLog {
  time: string;
  operator: string;
  action: string;
  comment: string;
}

interface ContractLine {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  amount: number;
  taxAmount: number;
  expenseMinor: string;
  invoiceCategory: string;
  scene: string;
  settlementRule: string;
}

interface PaymentPlan {
  id: string;
  stage: string;
  description: string;
  expectedPayDate: string;
  amount: number;
  ratio: number;
  payPoint: string;
  days: number;
}

interface MarketingContract {
  id: string;
  code: string;
  title: string;
  type: string;
  category: string;
  status: ContractStatus;
  completionStatus: CompletionStatus;
  agreementNo: string;
  signEntity: string;
  accountingEntity: string;
  supplier: string;
  owner: string;
  signedAt: string;
  startDate: string;
  endDate: string;
  amount: number;
  taxRate: number;
  noTaxAmount: number;
  taxAmount: number;
  isAdvertising: boolean;
  isAmortized: boolean;
  amortizationMethod: string;
  amortizationStart: string;
  amortizationEnd: string;
  amortizationTotal: number;
  dailyAmortization: number;
  expenseMajor: string;
  expenseMinor: string;
  invoiceCategory: string;
  invoiceType: string;
  budgetDepartment: string;
  budgetSubject: string;
  scene: string;
  settlementRule: string;
  poAmount: number;
  settlingAmount: number;
  settledAmount: number;
  estimateAmount: number;
  invoicedAmount: number;
  pendingInvoiceAmount: number;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  inTransitCount: number;
  reviewStatus: ReviewStatus;
  lines: ContractLine[];
  payments: PaymentPlan[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface PoApplication {
  id: string;
  code: string;
  type: "合同 PO" | "达人 PO";
  contractId: string;
  contractCode: string;
  supplier: string;
  marketingPlan: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  expenseMinor: string;
  feeDate: string;
  amount: number;
  noTaxAmount: number;
  talent: string;
  platform: string;
  status: PoStatus;
  sourceLedger: string;
}

interface LiveTask {
  id: string;
  code: string;
  contractId: string;
  contractCode: string;
  supplier: string;
  talentId: string;
  talentName: string;
  scheduleStart: string;
  scheduleEnd: string;
  slotFee: number;
  offlineCommissionRate: number;
  marketingPlan: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  channel: string;
  brand: string;
  status: PoStatus;
}

interface LiveBillingRule {
  id: string;
  code: string;
  liveTaskCode: string;
  contractCode: string;
  talentName: string;
  settlementMethod: string;
  onlineCommissionRate: number;
  offlineCommissionRate: number;
  slotFee: number;
  budgetDepartment: string;
  budgetSubject: string;
  status: "启用" | "停用";
}

interface FeeEstimate {
  id: string;
  code: string;
  sourceBill: string;
  contractCode: string;
  type: "单次执行费用预估" | "直播费用预估";
  amount: number;
  estimateDate: string;
  status: "已写入" | "待确认";
}

interface ReviewFormState {
  contractId: string;
  isAdvertising: boolean;
  isAmortized: boolean;
  amortizationStart: string;
  amortizationEnd: string;
  budgetDepartment: string;
  budgetSubject: string;
  expenseMinor: string;
  invoiceCategory: string;
  scene: string;
  settlementRule: string;
  taxRate: string;
}

interface PoFormState {
  type: "合同 PO" | "达人 PO";
  contractId: string;
  marketingPlan: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  expenseMinor: string;
  feeDate: string;
  amount: string;
  talent: string;
  platform: string;
}

interface LiveFormState {
  contractId: string;
  talentId: string;
  talentName: string;
  scheduleStart: string;
  scheduleEnd: string;
  slotFee: string;
  offlineCommissionRate: string;
  marketingPlan: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  channel: string;
  brand: string;
}

interface ContractFilters {
  keyword: string;
  supplier: string;
  status: string;
  completionStatus: string;
  reviewStatus: string;
  syncStatus: string;
  isAmortized: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const departments = ["电商运营部", "内容营销部", "直播运营部", "品牌市场部", "渠道市场部"];
const budgetSubjects = ["信息流投放", "达人投放", "直播坑位费", "品牌推广", "活动物料", "搜索推广"];
const marketingPlans = ["天猫 618 品牌声量放大计划", "小红书达人种草计划", "抖音新品直播引流计划", "年度品牌心智推广计划", "华南渠道快闪推广计划"];
const activities = ["天猫 618 信息流蓄水", "小红书达人新品种草", "抖音新品直播专场", "品牌年度内容传播", "华南商超快闪物料"];

const createLine = (id: string, item: string, quantity: number, unitPrice: number, taxRate: number, expenseMinor: string, scene: string, settlementRule: string): ContractLine => {
  const amount = quantity * unitPrice;
  const noTaxAmount = amount / (1 + taxRate);
  return {
    id,
    item,
    quantity,
    unit: quantity > 20 ? "天" : "项",
    unitPrice,
    taxRate,
    amount,
    taxAmount: amount - noTaxAmount,
    expenseMinor,
    invoiceCategory: "现代服务-广告服务",
    scene,
    settlementRule
  };
};

const createPayments = (prefix: string, amount: number): PaymentPlan[] => [
  { id: `${prefix}-pay-1`, stage: "首付款", description: "合同生效后预付 30%", expectedPayDate: "2026-05-20", amount: amount * 0.3, ratio: 30, payPoint: "合同签订", days: 10 },
  { id: `${prefix}-pay-2`, stage: "验收款", description: "阶段验收并收票后支付 50%", expectedPayDate: "2026-06-30", amount: amount * 0.5, ratio: 50, payPoint: "验收通过", days: 30 },
  { id: `${prefix}-pay-3`, stage: "尾款", description: "项目完结后支付尾款", expectedPayDate: "2026-07-20", amount: amount * 0.2, ratio: 20, payPoint: "项目完结", days: 15 }
];

const createContract = (
  index: number,
  overrides: Partial<MarketingContract> & Pick<MarketingContract, "code" | "title" | "supplier" | "amount" | "status" | "completionStatus" | "reviewStatus">
): MarketingContract => {
  const taxRate = overrides.taxRate ?? 0.06;
  const noTaxAmount = overrides.amount / (1 + taxRate);
  const taxAmount = overrides.amount - noTaxAmount;
  const settledAmount = overrides.settledAmount ?? Math.round(overrides.amount * 0.24);
  const settlingAmount = overrides.settlingAmount ?? Math.round(overrides.amount * 0.12);
  const poAmount = overrides.poAmount ?? Math.round(overrides.amount * 0.42);
  return {
    id: `contract-${String(index).padStart(3, "0")}`,
    type: overrides.type ?? "费用合同V1.1",
    category: overrides.category ?? "营销服务合同",
    agreementNo: overrides.agreementNo ?? "-",
    signEntity: overrides.signEntity ?? "上海示例贸易有限公司",
    accountingEntity: overrides.accountingEntity ?? "上海示例贸易有限公司",
    owner: overrides.owner ?? ["陈晨", "李然", "周可", "赵敏"][index % 4],
    signedAt: overrides.signedAt ?? "2026-04-28",
    startDate: overrides.startDate ?? "2026-05-01",
    endDate: overrides.endDate ?? "2026-07-31",
    taxRate,
    noTaxAmount,
    taxAmount,
    isAdvertising: overrides.isAdvertising ?? true,
    isAmortized: overrides.isAmortized ?? false,
    amortizationMethod: overrides.amortizationMethod ?? "按日直线摊销",
    amortizationStart: overrides.amortizationStart ?? "",
    amortizationEnd: overrides.amortizationEnd ?? "",
    amortizationTotal: overrides.amortizationTotal ?? 0,
    dailyAmortization: overrides.dailyAmortization ?? 0,
    expenseMajor: overrides.expenseMajor ?? "内容费用",
    expenseMinor: overrides.expenseMinor ?? "达人合作费",
    invoiceCategory: overrides.invoiceCategory ?? "现代服务-广告服务",
    invoiceType: overrides.invoiceType ?? "增值税专用发票",
    budgetDepartment: overrides.budgetDepartment ?? departments[index % departments.length],
    budgetSubject: overrides.budgetSubject ?? budgetSubjects[index % budgetSubjects.length],
    scene: overrides.scene ?? activities[index % activities.length],
    settlementRule: overrides.settlementRule ?? "一口价验收结算，到票后 30 天付款",
    poAmount,
    settlingAmount,
    settledAmount,
    estimateAmount: overrides.estimateAmount ?? Math.round(poAmount * 0.9),
    invoicedAmount: overrides.invoicedAmount ?? Math.round(settledAmount * 0.8),
    pendingInvoiceAmount: overrides.pendingInvoiceAmount ?? Math.max(0, poAmount - Math.round(settledAmount * 0.8)),
    sourceSystem: overrides.sourceSystem ?? "[合同系统] mock 归档",
    syncStatus: overrides.syncStatus ?? "同步成功",
    lastSyncAt: overrides.lastSyncAt ?? "2026-05-06 09:20:00",
    syncBatchNo: overrides.syncBatchNo ?? "SYNC-HT-2026050601",
    failureReason: overrides.failureReason,
    inTransitCount: overrides.inTransitCount ?? (overrides.status === "履约中" ? 2 : 0),
    lines: overrides.lines ?? [
      createLine(`line-${index}-1`, "营销活动策划与执行服务", 1, overrides.amount * 0.55, taxRate, "活动执行费", activities[index % activities.length], "固定金额"),
      createLine(`line-${index}-2`, "达人/媒介投放服务", 1, overrides.amount * 0.45, taxRate, "达人合作费", activities[(index + 1) % activities.length], "验收后一口价")
    ],
    payments: overrides.payments ?? createPayments(`contract-${index}`, overrides.amount),
    approvals: overrides.approvals ?? [
      { node: "合同归档", approver: "合同系统", date: "2026-05-01 10:20:00", comment: "已模拟同步归档合同。" },
      { node: "财务 BP 复核", approver: "王悦", date: overrides.reviewStatus === "已完成" ? "2026-05-03 15:10:00" : "-", comment: overrides.reviewStatus === "已完成" ? "财务结构化信息已复核。" : "待处理。" }
    ],
    logs: overrides.logs ?? [
      { time: "2026-05-01 10:20:00", operator: "系统模拟", action: "同步合同", comment: "从合同系统同步已归档合同。" }
    ],
    ...overrides
  };
};

const initialContracts: MarketingContract[] = [
  createContract(1, {
    code: "YXHT-2026-210",
    title: "双十一达人种草服务合同",
    supplier: "上海拾光内容科技有限公司",
    amount: 200000,
    status: "待复核",
    completionStatus: "未完结",
    reviewStatus: "待处理",
    poAmount: 0,
    settlingAmount: 0,
    settledAmount: 0,
    inTransitCount: 0,
    budgetDepartment: "内容营销部",
    budgetSubject: "达人投放",
    expenseMinor: "达人合作费",
    scene: "小红书达人新品种草"
  }),
  createContract(2, {
    code: "YXHT-2026-211",
    title: "直播坑位费年度框架合同",
    supplier: "杭州热浪直播服务有限公司",
    amount: 360000,
    status: "履约中",
    completionStatus: "履约中",
    reviewStatus: "已完成",
    budgetDepartment: "直播运营部",
    budgetSubject: "直播坑位费",
    expenseMinor: "直播坑位费",
    scene: "抖音新品直播专场",
    settlementRule: "坑位费一口价 + 线下佣金比例"
  }),
  createContract(3, {
    code: "YXHT-2026-212",
    title: "品牌年度内容传播摊销合同",
    supplier: "北京青梧品牌传播有限公司",
    amount: 480000,
    status: "已生效",
    completionStatus: "履约中",
    reviewStatus: "已完成",
    isAmortized: true,
    amortizationStart: "2026-05-01",
    amortizationEnd: "2026-10-31",
    amortizationTotal: 452830.19,
    dailyAmortization: 2474.48,
    budgetDepartment: "品牌市场部",
    budgetSubject: "品牌推广",
    expenseMinor: "品牌传播费",
    scene: "品牌年度内容传播"
  }),
  createContract(4, {
    code: "YXHT-2026-213",
    title: "天猫 618 信息流投放框架合同",
    supplier: "上海星河数字营销有限公司",
    amount: 320000,
    status: "履约中",
    completionStatus: "履约中",
    reviewStatus: "已完成",
    budgetDepartment: "电商运营部",
    budgetSubject: "信息流投放",
    expenseMinor: "信息流消耗",
    scene: "天猫 618 信息流蓄水",
    inTransitCount: 3
  }),
  createContract(5, {
    code: "YXHT-2026-214",
    title: "华南渠道快闪活动执行合同",
    supplier: "广州启点会展有限公司",
    amount: 120000,
    status: "已生效",
    completionStatus: "未完结",
    reviewStatus: "已完成",
    budgetDepartment: "渠道市场部",
    budgetSubject: "活动物料",
    expenseMinor: "活动物料",
    scene: "华南商超快闪物料",
    inTransitCount: 0
  }),
  createContract(6, {
    code: "YXHT-2026-215",
    title: "京东搜索推广代理合同",
    supplier: "北京驰骋互动广告有限公司",
    amount: 210000,
    status: "变更中",
    completionStatus: "履约中",
    reviewStatus: "审批中",
    budgetDepartment: "电商运营部",
    budgetSubject: "搜索推广",
    expenseMinor: "搜索消耗",
    scene: "京东搜索推广冲刺"
  }),
  createContract(7, {
    code: "YXHT-2026-216",
    title: "新品测评达人任务合同",
    supplier: "上海青禾达人经纪有限公司",
    amount: 80000,
    status: "已驳回",
    completionStatus: "未完结",
    reviewStatus: "已驳回",
    budgetDepartment: "内容营销部",
    budgetSubject: "达人投放",
    expenseMinor: "测评合作费",
    scene: "小红书达人新品种草",
    failureReason: "费用小类与预算科目不匹配，需重新复核。"
  }),
  createContract(8, {
    code: "YXHT-2026-217",
    title: "抖音直播间加热服务合同",
    supplier: "杭州燃点互动科技有限公司",
    amount: 150000,
    status: "待复核",
    completionStatus: "未完结",
    reviewStatus: "待处理",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-06 08:42:00",
    syncBatchNo: "SYNC-HT-2026050602",
    failureReason: "合同系统附件结构化任务超时 [504]",
    poAmount: 0,
    settledAmount: 0,
    settlingAmount: 0,
    inTransitCount: 0
  }),
  createContract(9, {
    code: "YXHT-2026-218",
    title: "线下渠道物料制作补充协议",
    supplier: "广州启点会展有限公司",
    amount: 68000,
    status: "已终止",
    completionStatus: "已终止",
    reviewStatus: "已完成",
    agreementNo: "BG-2026-017",
    inTransitCount: 0
  }),
  createContract(10, {
    code: "YXHT-2026-219",
    title: "站内会员日内容会场合同",
    supplier: "上海云帆创意有限公司",
    amount: 96000,
    status: "已生效",
    completionStatus: "未完结",
    reviewStatus: "已完成",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-"
  })
];

const initialPoApplications: PoApplication[] = [
  {
    id: "po-001",
    code: "HTPO-2026-001",
    type: "合同 PO",
    contractId: "contract-004",
    contractCode: "YXHT-2026-213",
    supplier: "上海星河数字营销有限公司",
    marketingPlan: "天猫 618 品牌声量放大计划",
    activity: "天猫 618 信息流蓄水",
    budgetDepartment: "电商运营部",
    budgetSubject: "信息流投放",
    expenseMinor: "信息流消耗",
    feeDate: "2026-05-04",
    amount: 78000,
    noTaxAmount: 73584.91,
    talent: "-",
    platform: "阿里妈妈",
    status: "已完成",
    sourceLedger: "FYGS-2026-301"
  },
  {
    id: "po-002",
    code: "DRPO-2026-001",
    type: "达人 PO",
    contractId: "contract-002",
    contractCode: "YXHT-2026-211",
    supplier: "杭州热浪直播服务有限公司",
    marketingPlan: "抖音新品直播引流计划",
    activity: "抖音新品直播专场",
    budgetDepartment: "直播运营部",
    budgetSubject: "直播坑位费",
    expenseMinor: "直播坑位费",
    feeDate: "2026-05-03",
    amount: 56000,
    noTaxAmount: 52830.19,
    talent: "小鹿Luna",
    platform: "抖音达人平台",
    status: "已完成",
    sourceLedger: "FYGS-2026-302"
  }
];

const initialLiveTasks: LiveTask[] = [
  {
    id: "live-001",
    code: "ZBQR-2026-001",
    contractId: "contract-002",
    contractCode: "YXHT-2026-211",
    supplier: "杭州热浪直播服务有限公司",
    talentId: "DY-998821",
    talentName: "小鹿Luna",
    scheduleStart: "2026-05-18",
    scheduleEnd: "2026-05-18",
    slotFee: 38000,
    offlineCommissionRate: 8,
    marketingPlan: "抖音新品直播引流计划",
    activity: "抖音新品直播专场",
    budgetDepartment: "直播运营部",
    budgetSubject: "直播坑位费",
    channel: "抖音",
    brand: "花西子",
    status: "已完成"
  }
];

const initialBillingRules: LiveBillingRule[] = [
  {
    id: "rule-001",
    code: "ZBGZ-2026-001",
    liveTaskCode: "ZBQR-2026-001",
    contractCode: "YXHT-2026-211",
    talentName: "小鹿Luna",
    settlementMethod: "坑位费一口价 + 线下佣金",
    onlineCommissionRate: 0,
    offlineCommissionRate: 8,
    slotFee: 38000,
    budgetDepartment: "直播运营部",
    budgetSubject: "直播坑位费",
    status: "启用"
  }
];

const initialFeeEstimates: FeeEstimate[] = [
  { id: "estimate-001", code: "FYGS-2026-301", sourceBill: "HTPO-2026-001", contractCode: "YXHT-2026-213", type: "单次执行费用预估", amount: 78000, estimateDate: "2026-05-04", status: "已写入" },
  { id: "estimate-002", code: "FYGS-2026-302", sourceBill: "DRPO-2026-001", contractCode: "YXHT-2026-211", type: "单次执行费用预估", amount: 56000, estimateDate: "2026-05-03", status: "已写入" },
  { id: "estimate-003", code: "ZBFY-2026-101", sourceBill: "ZBQR-2026-001", contractCode: "YXHT-2026-211", type: "直播费用预估", amount: 38000, estimateDate: "2026-05-18", status: "已写入" }
];

const initialFilters: ContractFilters = {
  keyword: "",
  supplier: "全部",
  status: "全部",
  completionStatus: "全部",
  reviewStatus: "全部",
  syncStatus: "全部",
  isAmortized: "全部"
};

export default function MarketingContractsPage() {
  const [contracts, setContracts] = useState<MarketingContract[]>(initialContracts);
  const [poApplications, setPoApplications] = useState<PoApplication[]>(initialPoApplications);
  const [liveTasks, setLiveTasks] = useState<LiveTask[]>(initialLiveTasks);
  const [billingRules, setBillingRules] = useState<LiveBillingRule[]>(initialBillingRules);
  const [feeEstimates, setFeeEstimates] = useState<FeeEstimate[]>(initialFeeEstimates);
  const [filters, setFilters] = useState<ContractFilters>(initialFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<MarketingContract | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("base");
  const [reviewForm, setReviewForm] = useState<ReviewFormState | null>(null);
  const [poForm, setPoForm] = useState<PoFormState | null>(null);
  const [liveForm, setLiveForm] = useState<LiveFormState | null>(null);
  const [originalPreview, setOriginalPreview] = useState<MarketingContract | null>(null);
  const [transitCheck, setTransitCheck] = useState<MarketingContract | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suppliers = useMemo(() => Array.from(new Set(contracts.map((item) => item.supplier))), [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const matchKeyword = !keyword || [item.code, item.title, item.supplier, item.signEntity, item.owner].some((value) => value.toLowerCase().includes(keyword));
      const matchSupplier = filters.supplier === "全部" || item.supplier === filters.supplier;
      const matchStatus = filters.status === "全部" || item.status === filters.status;
      const matchCompletion = filters.completionStatus === "全部" || item.completionStatus === filters.completionStatus;
      const matchReview = filters.reviewStatus === "全部" || item.reviewStatus === filters.reviewStatus;
      const matchSync = filters.syncStatus === "全部" || item.syncStatus === filters.syncStatus;
      const matchAmortized = filters.isAmortized === "全部" || (filters.isAmortized === "是" ? item.isAmortized : !item.isAmortized);
      return matchKeyword && matchSupplier && matchStatus && matchCompletion && matchReview && matchSync && matchAmortized;
    });
  }, [contracts, filters]);

  const stats = useMemo(() => {
    const totalAmount = contracts.reduce((total, item) => total + item.amount, 0);
    const fulfillmentAmount = contracts.reduce((total, item) => total + item.settledAmount + item.settlingAmount, 0);
    return [
      { label: "合同总数", value: contracts.length.toString(), sub: `总金额 ${formatMoney(totalAmount)}` },
      { label: "待复核数", value: contracts.filter((item) => item.reviewStatus !== "已完成").length.toString(), sub: "待财务 BP 补充结构化信息" },
      { label: "履约中金额", value: formatMoney(fulfillmentAmount), sub: "结算中 + 已结算金额" },
      { label: "同步失败数", value: contracts.filter((item) => item.syncStatus === "同步失败").length.toString(), sub: "可重试合同系统同步" }
    ];
  }, [contracts]);

  const selectedReviewContract = reviewForm ? contracts.find((item) => item.id === reviewForm.contractId) : undefined;
  const selectedPoContract = poForm ? contracts.find((item) => item.id === poForm.contractId) : undefined;
  const selectedLiveContract = liveForm ? contracts.find((item) => item.id === liveForm.contractId) : undefined;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function simulateQuery() {
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 650);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 500);
  }

  function simulateSync() {
    setOverlayLoading("正在模拟同步合同系统归档合同");
    window.setTimeout(() => {
      const exists = contracts.some((item) => item.code === "YXHT-2026-220");
      setContracts((items) => {
        const next = items.map((item) =>
          item.syncStatus === "同步失败"
            ? {
                ...item,
                syncStatus: "同步成功" as SyncStatus,
                failureReason: undefined,
                lastSyncAt: nowText,
                syncBatchNo: "SYNC-HT-2026050603",
                logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "重试同步", comment: "合同系统结构化任务已模拟恢复。" }]
              }
            : item
        );
        if (exists) return next;
        return [
          createContract(11, {
            code: "YXHT-2026-220",
            title: "618 站内搜索资源包合同",
            supplier: "杭州星耀数字科技有限公司",
            amount: 180000,
            status: "待复核",
            completionStatus: "未完结",
            reviewStatus: "待处理",
            syncStatus: "同步成功",
            lastSyncAt: nowText,
            syncBatchNo: "SYNC-HT-2026050603",
            budgetDepartment: "电商运营部",
            budgetSubject: "搜索推广",
            expenseMinor: "搜索消耗",
            scene: "天猫 618 信息流蓄水",
            poAmount: 0,
            settledAmount: 0,
            settlingAmount: 0,
            inTransitCount: 0
          }),
          ...next
        ];
      });
      setOverlayLoading("");
      showToast("成功模拟同步 2 条合同：新增 1 条，失败重试恢复 1 条。");
    }, 800);
  }

  function retrySync(contract: MarketingContract) {
    setContracts((items) =>
      items.map((item) =>
        item.id === contract.id
          ? {
              ...item,
              syncStatus: "同步成功",
              failureReason: undefined,
              lastSyncAt: nowText,
              syncBatchNo: "SYNC-HT-RETRY-20260506",
              logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "重试同步", comment: "已模拟重新拉取合同系统结构化信息。" }]
            }
          : item
      )
    );
    showToast("已模拟重试同步合同系统。");
  }

  function openDetail(contract: MarketingContract, tab: DetailTab = "base") {
    setDetail(contract);
    setDetailTab(tab);
  }

  function openReview(contract: MarketingContract) {
    setErrors({});
    setReviewForm({
      contractId: contract.id,
      isAdvertising: contract.isAdvertising,
      isAmortized: contract.isAmortized,
      amortizationStart: contract.amortizationStart || contract.startDate,
      amortizationEnd: contract.amortizationEnd || contract.endDate,
      budgetDepartment: contract.budgetDepartment || departments[0],
      budgetSubject: contract.budgetSubject || budgetSubjects[0],
      expenseMinor: contract.expenseMinor || "达人合作费",
      invoiceCategory: contract.invoiceCategory || "现代服务-广告服务",
      scene: contract.scene || activities[0],
      settlementRule: contract.settlementRule || "一口价验收结算，到票后 30 天付款",
      taxRate: String(contract.taxRate * 100)
    });
  }

  function submitReview() {
    if (!reviewForm || !selectedReviewContract) return;
    const nextErrors: Record<string, string> = {};
    const taxRate = Number(reviewForm.taxRate) / 100;
    if (!reviewForm.budgetDepartment) nextErrors.budgetDepartment = "请选择预算部门。";
    if (!reviewForm.budgetSubject) nextErrors.budgetSubject = "请选择预算科目。";
    if (!reviewForm.expenseMinor.trim()) nextErrors.expenseMinor = "请填写费用小类。";
    if (!reviewForm.settlementRule.trim()) nextErrors.settlementRule = "请填写结算规则。";
    if (Number.isNaN(taxRate) || taxRate < 0) nextErrors.taxRate = "税率必须为非负数字。";
    if (reviewForm.isAmortized) {
      if (!reviewForm.amortizationStart) nextErrors.amortizationStart = "请选择摊销开始日期。";
      if (!reviewForm.amortizationEnd) nextErrors.amortizationEnd = "请选择摊销结束日期。";
      if (reviewForm.amortizationStart && reviewForm.amortizationEnd && reviewForm.amortizationEnd < reviewForm.amortizationStart) nextErrors.amortizationEnd = "摊销结束日期不能早于开始日期。";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const noTaxAmount = selectedReviewContract.amount / (1 + taxRate);
    const days = reviewForm.isAmortized ? dateDays(reviewForm.amortizationStart, reviewForm.amortizationEnd) : 0;
    const dailyAmortization = reviewForm.isAmortized && days > 0 ? noTaxAmount / days : 0;
    setOverlayLoading("正在模拟提交 OA 审批并生成财务结构化信息");
    window.setTimeout(() => {
      setContracts((items) =>
        items.map((item) =>
          item.id === selectedReviewContract.id
            ? {
                ...item,
                status: "已生效",
                completionStatus: item.completionStatus === "未完结" ? "履约中" : item.completionStatus,
                reviewStatus: "已完成",
                syncStatus: "同步成功",
                taxRate,
                noTaxAmount,
                taxAmount: item.amount - noTaxAmount,
                isAdvertising: reviewForm.isAdvertising,
                isAmortized: reviewForm.isAmortized,
                amortizationStart: reviewForm.isAmortized ? reviewForm.amortizationStart : "",
                amortizationEnd: reviewForm.isAmortized ? reviewForm.amortizationEnd : "",
                amortizationTotal: reviewForm.isAmortized ? noTaxAmount : 0,
                dailyAmortization,
                budgetDepartment: reviewForm.budgetDepartment,
                budgetSubject: reviewForm.budgetSubject,
                expenseMinor: reviewForm.expenseMinor,
                invoiceCategory: reviewForm.invoiceCategory,
                scene: reviewForm.scene,
                settlementRule: reviewForm.settlementRule,
                pendingInvoiceAmount: item.amount - item.invoicedAmount,
                lastSyncAt: nowText,
                failureReason: undefined,
                approvals: [
                  ...item.approvals,
                  { node: "模拟 OA 审批", approver: "财务负责人", date: nowText, comment: `审批通过，${reviewForm.isAmortized ? "已生成摊销台账 mock。" : "已生成待到票台账 mock。"}` }
                ],
                logs: [...item.logs, { time: nowText, operator: "王悦", action: "结构化复核通过", comment: "补充财务信息、预算科目、费用小类与结算规则。" }]
              }
            : item
        )
      );
      setReviewForm(null);
      setOverlayLoading("");
      showToast(reviewForm.isAmortized ? "复核已通过，并模拟生成合同摊销费用台账。" : "复核已通过，并模拟生成待到票台账。");
    }, 850);
  }

  function openPo(contract?: MarketingContract, type: "合同 PO" | "达人 PO" = "合同 PO") {
    const target = contract ?? contracts.find((item) => item.status !== "已终止") ?? contracts[0];
    setErrors({});
    setPoForm({
      type,
      contractId: target.id,
      marketingPlan: marketingPlans[0],
      activity: target.scene || activities[0],
      budgetDepartment: target.budgetDepartment,
      budgetSubject: target.budgetSubject,
      expenseMinor: target.expenseMinor,
      feeDate: today,
      amount: "30000",
      talent: type === "达人 PO" ? "林小柒" : "",
      platform: type === "达人 PO" ? "小红书蒲公英" : "阿里妈妈"
    });
  }

  function submitPo() {
    if (!poForm || !selectedPoContract) return;
    const amount = Number(poForm.amount);
    const nextErrors: Record<string, string> = {};
    if (!poForm.contractId) nextErrors.contractId = "请选择合同。";
    if (!poForm.marketingPlan) nextErrors.marketingPlan = "请选择营销计划。";
    if (!poForm.activity) nextErrors.activity = "请选择营销活动。";
    if (!amount || amount <= 0) nextErrors.amount = "费用金额必须大于 0。";
    if (amount > contractBalance(selectedPoContract)) nextErrors.amount = `费用金额不能超过合同可用余额 ${formatMoney(contractBalance(selectedPoContract))}。`;
    if (poForm.type === "达人 PO" && !poForm.talent.trim()) nextErrors.talent = "达人 PO 需填写达人/主播。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setOverlayLoading("正在模拟 PO 审批通过并写入单次执行费用预估");
    window.setTimeout(() => {
      const code = `${poForm.type === "合同 PO" ? "HTPO" : "DRPO"}-2026-${String(poApplications.length + 1).padStart(3, "0")}`;
      const newPo: PoApplication = {
        id: `po-${Date.now()}`,
        code,
        type: poForm.type,
        contractId: selectedPoContract.id,
        contractCode: selectedPoContract.code,
        supplier: selectedPoContract.supplier,
        marketingPlan: poForm.marketingPlan,
        activity: poForm.activity,
        budgetDepartment: poForm.budgetDepartment,
        budgetSubject: poForm.budgetSubject,
        expenseMinor: poForm.expenseMinor,
        feeDate: poForm.feeDate,
        amount,
        noTaxAmount: amount / (1 + selectedPoContract.taxRate),
        talent: poForm.talent || "-",
        platform: poForm.platform,
        status: "已完成",
        sourceLedger: `FYGS-2026-${300 + feeEstimates.length + 1}`
      };
      const newEstimate: FeeEstimate = {
        id: `estimate-${Date.now()}`,
        code: newPo.sourceLedger,
        sourceBill: newPo.code,
        contractCode: selectedPoContract.code,
        type: "单次执行费用预估",
        amount,
        estimateDate: poForm.feeDate,
        status: "已写入"
      };
      setPoApplications((items) => [newPo, ...items]);
      setFeeEstimates((items) => [newEstimate, ...items]);
      setContracts((items) =>
        items.map((item) =>
          item.id === selectedPoContract.id
            ? {
                ...item,
                status: item.status === "已生效" ? "履约中" : item.status,
                completionStatus: item.completionStatus === "未完结" ? "履约中" : item.completionStatus,
                poAmount: item.poAmount + amount,
                settlingAmount: item.settlingAmount + amount,
                estimateAmount: item.estimateAmount + amount,
                pendingInvoiceAmount: item.pendingInvoiceAmount + amount,
                inTransitCount: item.inTransitCount + 1,
                logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "PO 审批通过", comment: `${newPo.code} 已写入单次执行费用预估并回写合同履约区。` }]
              }
            : item
        )
      );
      setPoForm(null);
      setOverlayLoading("");
      showToast("PO 已模拟审批通过，费用预估和合同履约金额已回写。");
    }, 850);
  }

  function openLive(contract?: MarketingContract) {
    const target = contract ?? contracts.find((item) => item.budgetSubject.includes("直播")) ?? contracts[0];
    setErrors({});
    setLiveForm({
      contractId: target.id,
      talentId: "DY-20260506",
      talentName: "星野Mika",
      scheduleStart: "2026-05-20",
      scheduleEnd: "2026-05-20",
      slotFee: "42000",
      offlineCommissionRate: "8",
      marketingPlan: "抖音新品直播引流计划",
      activity: "抖音新品直播专场",
      budgetDepartment: target.budgetDepartment || "直播运营部",
      budgetSubject: target.budgetSubject || "直播坑位费",
      channel: "抖音",
      brand: "花西子"
    });
  }

  function submitLiveTask() {
    if (!liveForm || !selectedLiveContract) return;
    const slotFee = Number(liveForm.slotFee);
    const commission = Number(liveForm.offlineCommissionRate);
    const nextErrors: Record<string, string> = {};
    if (!liveForm.talentName.trim()) nextErrors.talentName = "请填写直播达人昵称。";
    if (!slotFee || slotFee <= 0) nextErrors.slotFee = "直播坑位费必须大于 0。";
    if (slotFee > contractBalance(selectedLiveContract)) nextErrors.slotFee = `坑位费不能超过合同可用余额 ${formatMoney(contractBalance(selectedLiveContract))}。`;
    if (Number.isNaN(commission) || commission < 0) nextErrors.offlineCommissionRate = "线下佣金比例必须为非负数字。";
    if (liveForm.scheduleEnd < liveForm.scheduleStart) nextErrors.scheduleEnd = "排期结束日期不能早于开始日期。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setOverlayLoading("正在模拟直播任务审批、生成计费规则和直播费用预估");
    window.setTimeout(() => {
      const code = `ZBQR-2026-${String(liveTasks.length + 1).padStart(3, "0")}`;
      const ruleCode = `ZBGZ-2026-${String(billingRules.length + 1).padStart(3, "0")}`;
      const estimateCode = `ZBFY-2026-${String(100 + feeEstimates.length + 1)}`;
      const newTask: LiveTask = {
        id: `live-${Date.now()}`,
        code,
        contractId: selectedLiveContract.id,
        contractCode: selectedLiveContract.code,
        supplier: selectedLiveContract.supplier,
        talentId: liveForm.talentId,
        talentName: liveForm.talentName,
        scheduleStart: liveForm.scheduleStart,
        scheduleEnd: liveForm.scheduleEnd,
        slotFee,
        offlineCommissionRate: commission,
        marketingPlan: liveForm.marketingPlan,
        activity: liveForm.activity,
        budgetDepartment: liveForm.budgetDepartment,
        budgetSubject: liveForm.budgetSubject,
        channel: liveForm.channel,
        brand: liveForm.brand,
        status: "已完成"
      };
      const newRule: LiveBillingRule = {
        id: `rule-${Date.now()}`,
        code: ruleCode,
        liveTaskCode: code,
        contractCode: selectedLiveContract.code,
        talentName: liveForm.talentName,
        settlementMethod: "坑位费一口价 + 线下佣金",
        onlineCommissionRate: 0,
        offlineCommissionRate: commission,
        slotFee,
        budgetDepartment: liveForm.budgetDepartment,
        budgetSubject: liveForm.budgetSubject,
        status: "启用"
      };
      const estimate: FeeEstimate = {
        id: `estimate-${Date.now()}`,
        code: estimateCode,
        sourceBill: code,
        contractCode: selectedLiveContract.code,
        type: "直播费用预估",
        amount: slotFee,
        estimateDate: liveForm.scheduleStart,
        status: "已写入"
      };
      setLiveTasks((items) => [newTask, ...items]);
      setBillingRules((items) => [newRule, ...items]);
      setFeeEstimates((items) => [estimate, ...items]);
      setContracts((items) =>
        items.map((item) =>
          item.id === selectedLiveContract.id
            ? {
                ...item,
                status: item.status === "已生效" ? "履约中" : item.status,
                poAmount: item.poAmount + slotFee,
                settlingAmount: item.settlingAmount + slotFee,
                estimateAmount: item.estimateAmount + slotFee,
                pendingInvoiceAmount: item.pendingInvoiceAmount + slotFee,
                inTransitCount: item.inTransitCount + 1,
                logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "直播确认通过", comment: `${code} 已生成直播业务计费规则 ${ruleCode}。` }]
              }
            : item
        )
      );
      setLiveForm(null);
      setOverlayLoading("");
      showToast("直播任务已审批通过，计费规则和直播费用预估已生成。");
    }, 850);
  }

  function requestTerminate(contract: MarketingContract) {
    setTransitCheck(contract);
  }

  function confirmTerminate(contract: MarketingContract) {
    if (contract.inTransitCount > 0) {
      showToast("存在在途单，需先完结 PO/待到票/预估后才能终止。");
      return;
    }
    setContracts((items) =>
      items.map((item) =>
        item.id === contract.id
          ? {
              ...item,
              status: "已终止",
              completionStatus: "已终止",
              logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "合同终止审批通过", comment: "无在途单，已模拟审批终止合同。" }]
            }
          : item
      )
    );
    setTransitCheck(null);
    showToast("合同已模拟终止审批通过，台账状态已更新。");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="marketing-contracts" title="营销合同" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">合同与 PO / 营销合同管理</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">营销合同管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">合同台账、结构化复核、PO 执行、直播确认、计费规则和履约回写的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openReview(contracts.find((item) => item.reviewStatus !== "已完成") ?? contracts[0])}>结构化复核</Button>
              <Button variant="secondary" onClick={simulateSync}>模拟同步合同</Button>
              <Button variant="secondary" onClick={() => openPo()}>新建合同 PO</Button>
              <Button variant="secondary" onClick={() => openLive()}>直播确认</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>导出模拟</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-xl font-semibold tabular-nums">{item.value}</div>
                <div className="mt-1 text-xs text-slate-400">{item.sub}</div>
              </div>
            ))}
          </div>

          <FilterBar filters={filters} suppliers={suppliers} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} onError={() => setPageError("模拟接口失败：合同台账服务响应超时，请点击重试。")} />

          {pageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium">{pageError}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={simulateQuery}>重试加载</Button>
                <Button size="sm" variant="secondary" onClick={() => setPageError("")}>关闭提示</Button>
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tableLoading && <LoadingMask text="正在查询营销合同 mock 数据" />}
            <ContractTable
              rows={filteredContracts}
              onDetail={openDetail}
              onReview={openReview}
              onPo={openPo}
              onLive={openLive}
              onTerminate={requestTerminate}
              onRetry={retrySync}
              onPreview={setOriginalPreview}
            />
            {!tableLoading && filteredContracts.length === 0 && <EmptyState onCreate={simulateSync} onReset={resetFilters} />}
          </div>

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <LedgerCard title="合同 PO / 达人 PO 执行单">
              <PoTable rows={poApplications} />
            </LedgerCard>
            <LedgerCard title="直播业务计费规则台账">
              <BillingRuleTable rows={billingRules} />
            </LedgerCard>
          </section>
        </section>
      </div>

      {detail && (
        <DetailDrawer
          contract={contracts.find((item) => item.id === detail.id) ?? detail}
          tab={detailTab}
          poApplications={poApplications}
          liveTasks={liveTasks}
          feeEstimates={feeEstimates}
          onTab={setDetailTab}
          onClose={() => setDetail(null)}
          onReview={openReview}
          onPo={openPo}
          onLive={openLive}
        />
      )}
      {reviewForm && selectedReviewContract && (
        <ReviewModal
          form={reviewForm}
          contract={selectedReviewContract}
          errors={errors}
          onChange={(patch) => setReviewForm((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setReviewForm(null)}
          onSubmit={submitReview}
          onPreview={() => setOriginalPreview(selectedReviewContract)}
        />
      )}
      {poForm && selectedPoContract && (
        <PoModal
          form={poForm}
          contract={selectedPoContract}
          errors={errors}
          onChange={(patch) => setPoForm((current) => (current ? normalizePoForm(current, patch, contracts) : current))}
          onClose={() => setPoForm(null)}
          onSubmit={submitPo}
        />
      )}
      {liveForm && selectedLiveContract && (
        <LiveModal
          form={liveForm}
          contract={selectedLiveContract}
          errors={errors}
          onChange={(patch) => setLiveForm((current) => (current ? normalizeLiveForm(current, patch, contracts) : current))}
          onClose={() => setLiveForm(null)}
          onSubmit={submitLiveTask}
        />
      )}
      {originalPreview && <OriginalDrawer contract={originalPreview} onClose={() => setOriginalPreview(null)} />}
      {transitCheck && <TransitModal contract={transitCheck} poApplications={poApplications} feeEstimates={feeEstimates} onClose={() => setTransitCheck(null)} onConfirm={() => confirmTerminate(transitCheck)} />}
      {overlayLoading && <LoadingMask full text={overlayLoading} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function FilterBar({ filters, suppliers, setFilters, onQuery, onReset, onError }: { filters: ContractFilters; suppliers: string[]; setFilters: React.Dispatch<React.SetStateAction<ContractFilters>>; onQuery: () => void; onReset: () => void; onError: () => void }) {
  const patch = (next: Partial<ContractFilters>) => setFilters((current) => ({ ...current, ...next }));
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-4">
        <Field label="合同编号/标题/经办人">
          <Input value={filters.keyword} onChange={(keyword) => patch({ keyword })} placeholder="请输入合同编号、标题、供应商" />
        </Field>
        <Field label="供应商">
          <Select value={filters.supplier} onChange={(supplier) => patch({ supplier })} options={["全部", ...suppliers]} />
        </Field>
        <Field label="合同状态">
          <Select value={filters.status} onChange={(status) => patch({ status })} options={["全部", "待复核", "复核中", "已生效", "履约中", "变更中", "终止审批中", "已终止", "已驳回"]} />
        </Field>
        <Field label="复核状态">
          <Select value={filters.reviewStatus} onChange={(reviewStatus) => patch({ reviewStatus })} options={["全部", "待处理", "审批中", "已驳回", "已完成"]} />
        </Field>
        <Field label="完结状态">
          <Select value={filters.completionStatus} onChange={(completionStatus) => patch({ completionStatus })} options={["全部", "未完结", "履约中", "已完结", "已终止"]} />
        </Field>
        <Field label="同步状态">
          <Select value={filters.syncStatus} onChange={(syncStatus) => patch({ syncStatus })} options={["全部", "未同步", "同步中", "同步成功", "同步失败"]} />
        </Field>
        <Field label="是否摊销">
          <Select value={filters.isAmortized} onChange={(isAmortized) => patch({ isAmortized })} options={["全部", "是", "否"]} />
        </Field>
        <div className="flex items-end gap-2">
          <Button onClick={onQuery}>查询</Button>
          <Button variant="secondary" onClick={onReset}>重置</Button>
          <Button variant="secondary" onClick={onError}>模拟异常</Button>
        </div>
      </div>
    </div>
  );
}

function ContractTable({ rows, onDetail, onReview, onPo, onLive, onTerminate, onRetry, onPreview }: { rows: MarketingContract[]; onDetail: (contract: MarketingContract, tab?: DetailTab) => void; onReview: (contract: MarketingContract) => void; onPo: (contract: MarketingContract, type?: "合同 PO" | "达人 PO") => void; onLive: (contract: MarketingContract) => void; onTerminate: (contract: MarketingContract) => void; onRetry: (contract: MarketingContract) => void; onPreview: (contract: MarketingContract) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>合同编号</Th>
            <Th>合同标题</Th>
            <Th>供应商/签约主体</Th>
            <Th>合同金额</Th>
            <Th>履约金额</Th>
            <Th>复核状态</Th>
            <Th>合同状态</Th>
            <Th>摊销</Th>
            <Th>同步状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td>
                <button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button>
                <div className="mt-1 text-xs text-slate-400">{item.sourceSystem}</div>
              </Td>
              <Td>
                <div className="max-w-72 truncate font-medium text-slate-800" title={item.title}>{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">{item.type} / {item.category}</div>
              </Td>
              <Td>
                <div>{item.supplier}</div>
                <div className="mt-1 text-xs text-slate-400">{item.signEntity}</div>
              </Td>
              <Td align="right">{formatMoney(item.amount)}</Td>
              <Td align="right">
                <button className="text-blue-600 hover:underline" onClick={() => onDetail(item, "fulfillment")}>{formatMoney(item.poAmount)}</button>
                <div className="mt-1 text-xs text-slate-400">余额 {formatMoney(contractBalance(item))}</div>
              </Td>
              <Td><StatusBadge status={item.reviewStatus} /></Td>
              <Td>
                <StatusBadge status={item.status} />
                {item.inTransitCount > 0 && <div className="mt-1"><StatusBadge status={`在途 ${item.inTransitCount} 单`} /></div>}
              </Td>
              <Td>{item.isAmortized ? <StatusBadge status="需摊销" /> : <StatusBadge status="不摊销" />}</Td>
              <Td>
                <StatusBadge status={item.syncStatus} />
                <div className="mt-1 text-xs text-slate-400">{item.lastSyncAt}</div>
                {item.failureReason && <div className="mt-1 max-w-48 whitespace-normal text-xs text-red-500">{item.failureReason}</div>}
              </Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item)}>详情</button>
                  <button onClick={() => onPreview(item)}>原件</button>
                  {item.reviewStatus !== "已完成" && <button onClick={() => onReview(item)}>复核</button>}
                  {!["待复核", "已终止"].includes(item.status) && <button onClick={() => onPo(item, "合同 PO")}>新建 PO</button>}
                  {!["待复核", "已终止"].includes(item.status) && <button onClick={() => onPo(item, "达人 PO")}>达人 PO</button>}
                  {!["待复核", "已终止"].includes(item.status) && <button onClick={() => onLive(item)}>直播确认</button>}
                  {!["已终止"].includes(item.status) && <button onClick={() => onTerminate(item)}>终止</button>}
                  {item.syncStatus === "同步失败" && <button onClick={() => onRetry(item)}>重试同步</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function DetailDrawer({ contract, tab, poApplications, liveTasks, feeEstimates, onTab, onClose, onReview, onPo, onLive }: { contract: MarketingContract; tab: DetailTab; poApplications: PoApplication[]; liveTasks: LiveTask[]; feeEstimates: FeeEstimate[]; onTab: (tab: DetailTab) => void; onClose: () => void; onReview: (contract: MarketingContract) => void; onPo: (contract: MarketingContract) => void; onLive: (contract: MarketingContract) => void }) {
  const contractPos = poApplications.filter((item) => item.contractId === contract.id);
  const contractLiveTasks = liveTasks.filter((item) => item.contractId === contract.id);
  const contractEstimates = feeEstimates.filter((item) => item.contractCode === contract.code);
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-5xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">营销合同详情</div>
              <h2 className="mt-1 text-lg font-semibold">{contract.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={contract.status} />
                <StatusBadge status={contract.reviewStatus} />
                <StatusBadge status={contract.syncStatus} />
              </div>
            </div>
            <button className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Summary label="合同金额" value={formatMoney(contract.amount)} />
            <Summary label="PO 下单金额" value={formatMoney(contract.poAmount)} />
            <Summary label="结算中/已结算" value={`${formatMoney(contract.settlingAmount)} / ${formatMoney(contract.settledAmount)}`} />
            <Summary label="未结算余额" value={formatMoney(contractBalance(contract))} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["base", "基础信息"],
              ["lines", "明细与付款"],
              ["fulfillment", "履约/PO"],
              ["invoice", "发票/摊销"],
              ["logs", "审批日志"]
            ].map(([key, label]) => (
              <button key={key} className={`rounded-md px-3 py-2 text-sm font-medium ${tab === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => onTab(key as DetailTab)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 p-5">
          {contract.syncStatus === "同步失败" && <Alert>{contract.failureReason}</Alert>}
          {tab === "base" && (
            <>
              <Section title="合同系统只读信息" extra={<Button size="sm" variant="secondary" onClick={() => onReview(contract)}>打开结构化复核</Button>}>
                <DetailGrid rows={[
                  ["合同编号", contract.code],
                  ["合同标题", contract.title],
                  ["合同类型", contract.type],
                  ["签约主体", contract.signEntity],
                  ["核算主体", contract.accountingEntity],
                  ["供应商", contract.supplier],
                  ["经办人", contract.owner],
                  ["签订时间", contract.signedAt],
                  ["合同期间", `${contract.startDate} 至 ${contract.endDate}`],
                  ["合同分类", contract.category],
                  ["合同变更协议号", contract.agreementNo],
                  ["完结状态", <StatusBadge key="completion" status={contract.completionStatus} />]
                ]} />
              </Section>
              <Section title="财务补充信息">
                <DetailGrid rows={[
                  ["是否广宣项目", contract.isAdvertising ? "是" : "否"],
                  ["是否摊销", contract.isAmortized ? "是" : "否"],
                  ["费用小类", contract.expenseMinor],
                  ["发票类目", contract.invoiceCategory],
                  ["发票类型", contract.invoiceType],
                  ["预算部门", contract.budgetDepartment],
                  ["预算科目", contract.budgetSubject],
                  ["营销活动场景", contract.scene],
                  ["结算规则", contract.settlementRule]
                ]} />
              </Section>
            </>
          )}
          {tab === "lines" && (
            <>
              <Section title="合同明细">
                <LineTable rows={contract.lines} />
              </Section>
              <Section title="合同付款区">
                <PaymentTable rows={contract.payments} />
              </Section>
            </>
          )}
          {tab === "fulfillment" && (
            <>
              <Section title="履约金额监控" extra={<div className="flex gap-2"><Button size="sm" onClick={() => onPo(contract)}>新建 PO</Button><Button size="sm" variant="secondary" onClick={() => onLive(contract)}>直播确认</Button></div>}>
                <ProgressBar value={contract.poAmount} total={contract.amount} wide />
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <Summary label="合同总金额" value={formatMoney(contract.amount)} />
                  <Summary label="PO 下单金额" value={formatMoney(contract.poAmount)} />
                  <Summary label="费用预估总额" value={formatMoney(contract.estimateAmount)} />
                  <Summary label="未结算金额" value={formatMoney(contractBalance(contract))} />
                </div>
              </Section>
              <Section title="PO 子表">
                <PoTable rows={contractPos} />
              </Section>
              <Section title="直播任务确认单">
                <LiveTaskTable rows={contractLiveTasks} />
              </Section>
              <Section title="费用预估 mock 台账">
                <EstimateTable rows={contractEstimates} />
              </Section>
            </>
          )}
          {tab === "invoice" && (
            <Section title="发票与摊销">
              <DetailGrid rows={[
                ["已到票金额", formatMoney(contract.invoicedAmount)],
                ["待到票金额", formatMoney(contract.pendingInvoiceAmount)],
                ["发票类目", contract.invoiceCategory],
                ["发票类型", contract.invoiceType],
                ["是否摊销", contract.isAmortized ? "是" : "否"],
                ["摊销方式", contract.isAmortized ? contract.amortizationMethod : "-"],
                ["摊销期间", contract.isAmortized ? `${contract.amortizationStart} 至 ${contract.amortizationEnd}` : "-"],
                ["不含税摊销总额", contract.isAmortized ? formatMoney(contract.amortizationTotal) : "-"],
                ["日摊销额", contract.isAmortized ? formatMoney(contract.dailyAmortization) : "-"]
              ]} />
            </Section>
          )}
          {tab === "logs" && (
            <>
              <Section title="审批记录">
                <RecordTable rows={contract.approvals.map((item) => ({ time: item.date, operator: item.approver, action: item.node, comment: item.comment }))} />
              </Section>
              <Section title="操作日志">
                <RecordTable rows={contract.logs} />
              </Section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function ReviewModal({ form, contract, errors, onChange, onClose, onSubmit, onPreview }: { form: ReviewFormState; contract: MarketingContract; errors: Record<string, string>; onChange: (patch: Partial<ReviewFormState>) => void; onClose: () => void; onSubmit: () => void; onPreview: () => void }) {
  const taxRate = Number(form.taxRate) / 100;
  const noTaxAmount = Number.isNaN(taxRate) ? 0 : contract.amount / (1 + taxRate);
  const days = form.isAmortized ? dateDays(form.amortizationStart, form.amortizationEnd) : 0;
  return (
    <Modal title="合同结构化信息复核" onClose={onClose} size="xl">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
        提交后将模拟 OA 审批通过，并根据是否摊销生成摊销费用台账或待到票台账 mock 记录。
      </div>
      <section className="grid gap-4 xl:grid-cols-2">
        <Section title="合同系统原件信息" extra={<Button size="sm" variant="secondary" onClick={onPreview}>查阅合同系统原件</Button>}>
          <DetailGrid rows={[
            ["合同编号", contract.code],
            ["合同标题", contract.title],
            ["签约主体", contract.signEntity],
            ["供应商", contract.supplier],
            ["合同金额", formatMoney(contract.amount)],
            ["合同期间", `${contract.startDate} 至 ${contract.endDate}`],
            ["合同状态", <StatusBadge key="status" status={contract.status} />],
            ["完结状态", <StatusBadge key="completion" status={contract.completionStatus} />],
            ["最近同步", contract.lastSyncAt]
          ]} />
        </Section>
        <Section title="财务补充信息">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="是否广宣项目">
              <Switch checked={form.isAdvertising} onChange={(isAdvertising) => onChange({ isAdvertising })} />
            </Field>
            <Field label="是否摊销">
              <Switch checked={form.isAmortized} onChange={(isAmortized) => onChange({ isAmortized })} />
            </Field>
            <Field label="预算部门" required error={errors.budgetDepartment}>
              <Select value={form.budgetDepartment} onChange={(budgetDepartment) => onChange({ budgetDepartment })} options={departments} />
            </Field>
            <Field label="预算科目" required error={errors.budgetSubject}>
              <Select value={form.budgetSubject} onChange={(budgetSubject) => onChange({ budgetSubject })} options={budgetSubjects} />
            </Field>
            <Field label="费用小类" required error={errors.expenseMinor}>
              <Input value={form.expenseMinor} onChange={(expenseMinor) => onChange({ expenseMinor })} />
            </Field>
            <Field label="发票类目">
              <Input value={form.invoiceCategory} onChange={(invoiceCategory) => onChange({ invoiceCategory })} />
            </Field>
            <Field label="营销活动场景">
              <Select value={form.scene} onChange={(scene) => onChange({ scene })} options={activities} />
            </Field>
            <Field label="税率(%)" required error={errors.taxRate}>
              <Input value={form.taxRate} onChange={(value) => onChange({ taxRate: value })} />
            </Field>
            {form.isAmortized && (
              <>
                <Field label="摊销开始日期" required error={errors.amortizationStart}>
                  <Input value={form.amortizationStart} onChange={(amortizationStart) => onChange({ amortizationStart })} />
                </Field>
                <Field label="摊销结束日期" required error={errors.amortizationEnd}>
                  <Input value={form.amortizationEnd} onChange={(amortizationEnd) => onChange({ amortizationEnd })} />
                </Field>
              </>
            )}
            <Field label="结算规则" required error={errors.settlementRule} className="md:col-span-2">
              <Textarea value={form.settlementRule} onChange={(settlementRule) => onChange({ settlementRule })} />
            </Field>
          </div>
        </Section>
      </section>
      <Section title="复核测算">
        <div className="grid gap-3 md:grid-cols-4">
          <Summary label="不含税金额" value={formatMoney(noTaxAmount)} />
          <Summary label="税额" value={formatMoney(contract.amount - noTaxAmount)} />
          <Summary label="摊销天数" value={form.isAmortized ? `${days} 天` : "-"} />
          <Summary label="日摊销额" value={form.isAmortized && days > 0 ? formatMoney(noTaxAmount / days) : "-"} />
        </div>
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>提交审批并通过</Button>
      </ModalActions>
    </Modal>
  );
}

function PoModal({ form, contract, errors, onChange, onClose, onSubmit }: { form: PoFormState; contract: MarketingContract; errors: Record<string, string>; onChange: (patch: Partial<PoFormState>) => void; onClose: () => void; onSubmit: () => void }) {
  const amount = Number(form.amount);
  const noTaxAmount = amount > 0 ? amount / (1 + contract.taxRate) : 0;
  return (
    <Modal title={form.type === "合同 PO" ? "合同 PO 执行单" : "达人 PO 执行单"} onClose={onClose} size="lg">
      <div className="grid gap-3 md:grid-cols-4">
        <Summary label="合同编号" value={contract.code} />
        <Summary label="供应商" value={contract.supplier} />
        <Summary label="合同金额" value={formatMoney(contract.amount)} />
        <Summary label="可用余额" value={formatMoney(contractBalance(contract))} />
      </div>
      <Section title="PO 执行信息">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="PO 类型">
            <Select value={form.type} onChange={(type) => onChange({ type: type as PoFormState["type"] })} options={["合同 PO", "达人 PO"]} />
          </Field>
          <Field label="合同编号" required error={errors.contractId}>
            <Select value={form.contractId} onChange={(contractId) => onChange({ contractId })} options={initialContracts.map((item) => item.id)} labels={Object.fromEntries(initialContracts.map((item) => [item.id, `${item.code} / ${item.title}`]))} />
          </Field>
          <Field label="费用发生日期">
            <Input value={form.feeDate} onChange={(feeDate) => onChange({ feeDate })} />
          </Field>
          <Field label="营销计划" required error={errors.marketingPlan}>
            <Select value={form.marketingPlan} onChange={(marketingPlan) => onChange({ marketingPlan })} options={marketingPlans} />
          </Field>
          <Field label="营销活动" required error={errors.activity}>
            <Select value={form.activity} onChange={(activity) => onChange({ activity })} options={activities} />
          </Field>
          <Field label="预算部门">
            <Select value={form.budgetDepartment} onChange={(budgetDepartment) => onChange({ budgetDepartment })} options={departments} />
          </Field>
          <Field label="预算科目">
            <Select value={form.budgetSubject} onChange={(budgetSubject) => onChange({ budgetSubject })} options={budgetSubjects} />
          </Field>
          <Field label="费用小类">
            <Input value={form.expenseMinor} onChange={(expenseMinor) => onChange({ expenseMinor })} />
          </Field>
          <Field label="费用金额" required error={errors.amount}>
            <Input value={form.amount} onChange={(value) => onChange({ amount: value })} />
          </Field>
          {form.type === "达人 PO" && (
            <>
              <Field label="达人/主播" required error={errors.talent}>
                <Input value={form.talent} onChange={(talent) => onChange({ talent })} />
              </Field>
              <Field label="投放/发布平台">
                <Input value={form.platform} onChange={(platform) => onChange({ platform })} />
              </Field>
            </>
          )}
        </div>
      </Section>
      <Section title="金额测算">
        <div className="grid gap-3 md:grid-cols-3">
          <Summary label="含税金额" value={amount > 0 ? formatMoney(amount) : "-"} />
          <Summary label="税率" value={`${(contract.taxRate * 100).toFixed(0)}%`} />
          <Summary label="不含税金额" value={amount > 0 ? formatMoney(noTaxAmount) : "-"} />
        </div>
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>审批通过并写入预估</Button>
      </ModalActions>
    </Modal>
  );
}

function LiveModal({ form, contract, errors, onChange, onClose, onSubmit }: { form: LiveFormState; contract: MarketingContract; errors: Record<string, string>; onChange: (patch: Partial<LiveFormState>) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <Modal title="直播任务确认单" onClose={onClose} size="lg">
      <div className="grid gap-3 md:grid-cols-4">
        <Summary label="合同编号" value={contract.code} />
        <Summary label="供应商" value={contract.supplier} />
        <Summary label="可用余额" value={formatMoney(contractBalance(contract))} />
        <Summary label="结算规则" value={contract.settlementRule} />
      </div>
      <Section title="直播排期与计费信息">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="合同编号">
            <Select value={form.contractId} onChange={(contractId) => onChange({ contractId })} options={initialContracts.map((item) => item.id)} labels={Object.fromEntries(initialContracts.map((item) => [item.id, `${item.code} / ${item.title}`]))} />
          </Field>
          <Field label="直播达人 ID">
            <Input value={form.talentId} onChange={(talentId) => onChange({ talentId })} />
          </Field>
          <Field label="直播达人昵称" required error={errors.talentName}>
            <Input value={form.talentName} onChange={(talentName) => onChange({ talentName })} />
          </Field>
          <Field label="预计排期日">
            <Input value={form.scheduleStart} onChange={(scheduleStart) => onChange({ scheduleStart })} />
          </Field>
          <Field label="排期结束日期" error={errors.scheduleEnd}>
            <Input value={form.scheduleEnd} onChange={(scheduleEnd) => onChange({ scheduleEnd })} />
          </Field>
          <Field label="直播坑位费" required error={errors.slotFee}>
            <Input value={form.slotFee} onChange={(slotFee) => onChange({ slotFee })} />
          </Field>
          <Field label="线下佣金比例(%)" error={errors.offlineCommissionRate}>
            <Input value={form.offlineCommissionRate} onChange={(offlineCommissionRate) => onChange({ offlineCommissionRate })} />
          </Field>
          <Field label="营销计划">
            <Select value={form.marketingPlan} onChange={(marketingPlan) => onChange({ marketingPlan })} options={marketingPlans} />
          </Field>
          <Field label="营销活动">
            <Select value={form.activity} onChange={(activity) => onChange({ activity })} options={activities} />
          </Field>
          <Field label="预算部门">
            <Select value={form.budgetDepartment} onChange={(budgetDepartment) => onChange({ budgetDepartment })} options={departments} />
          </Field>
          <Field label="预算科目">
            <Select value={form.budgetSubject} onChange={(budgetSubject) => onChange({ budgetSubject })} options={budgetSubjects} />
          </Field>
          <Field label="渠道">
            <Input value={form.channel} onChange={(channel) => onChange({ channel })} />
          </Field>
        </div>
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>审批通过并生成计费规则</Button>
      </ModalActions>
    </Modal>
  );
}

function TransitModal({ contract, poApplications, feeEstimates, onClose, onConfirm }: { contract: MarketingContract; poApplications: PoApplication[]; feeEstimates: FeeEstimate[]; onClose: () => void; onConfirm: () => void }) {
  const relatedPo = poApplications.filter((item) => item.contractId === contract.id).slice(0, 3);
  const relatedEstimates = feeEstimates.filter((item) => item.contractCode === contract.code).slice(0, 3);
  const blocked = contract.inTransitCount > 0;
  return (
    <Modal title="模拟在途校验" onClose={onClose} size="lg">
      <Alert tone={blocked ? "orange" : "green"}>{blocked ? "存在在途 PO、待到票、费用预估或摊销记录，不允许直接终止合同。" : "未发现需要处理的在途单，可继续模拟终止审批。"}</Alert>
      <Section title="在途单据清单">
        <RecordTable
          rows={[
            ...relatedPo.map((item) => ({ time: item.feeDate, operator: item.type, action: item.code, comment: `${item.activity} / ${formatMoney(item.amount)}` })),
            ...relatedEstimates.map((item) => ({ time: item.estimateDate, operator: item.type, action: item.code, comment: `${item.status} / ${formatMoney(item.amount)}` }))
          ]}
        />
        {relatedPo.length + relatedEstimates.length === 0 && <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">暂无在途单据。</div>}
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button disabled={blocked} onClick={onConfirm}>确认终止</Button>
      </ModalActions>
    </Modal>
  );
}

function OriginalDrawer({ contract, onClose }: { contract: MarketingContract; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">合同系统原件预览</h2>
          <button className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          <Alert tone="orange">此处为合同系统原件 mock 预览，不上传、不解析真实附件。</Alert>
          <Section title="归档文件信息">
            <DetailGrid rows={[
              ["文件名", `${contract.code}-${contract.title}.pdf`],
              ["来源系统", contract.sourceSystem],
              ["归档时间", contract.lastSyncAt],
              ["同步批次", contract.syncBatchNo],
              ["结构化状态", contract.syncStatus],
              ["合同编号", contract.code],
              ["供应商", contract.supplier],
              ["合同金额", formatMoney(contract.amount)],
              ["预览状态", "已模拟打开合同系统详情"]
            ]} />
          </Section>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Mock PDF 预览区域：仅展示元数据和结构化字段，不接真实合同系统。
          </div>
        </div>
      </aside>
    </div>
  );
}

function PoTable({ rows }: { rows: PoApplication[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>执行单号</Th>
            <Th>类型</Th>
            <Th>合同编号</Th>
            <Th>营销计划/活动</Th>
            <Th>预算科目</Th>
            <Th>费用小类</Th>
            <Th>金额</Th>
            <Th>状态</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}</Td>
              <Td>{item.type}</Td>
              <Td>{item.contractCode}</Td>
              <Td>
                <div>{item.marketingPlan}</div>
                <div className="mt-1 text-xs text-slate-400">{item.activity}</div>
              </Td>
              <Td>{item.budgetDepartment} / {item.budgetSubject}</Td>
              <Td>{item.expenseMinor}</Td>
              <Td align="right">{formatMoney(item.amount)}</Td>
              <Td><StatusBadge status={item.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无 PO 执行单。" />}
    </div>
  );
}

function BillingRuleTable({ rows }: { rows: LiveBillingRule[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>规则编号</Th>
            <Th>达人昵称</Th>
            <Th>合同编号</Th>
            <Th>结算方式</Th>
            <Th>佣金比例</Th>
            <Th>坑位费</Th>
            <Th>状态</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}</Td>
              <Td>{item.talentName}</Td>
              <Td>{item.contractCode}</Td>
              <Td>{item.settlementMethod}</Td>
              <Td>{item.offlineCommissionRate}%</Td>
              <Td align="right">{formatMoney(item.slotFee)}</Td>
              <Td><StatusBadge status={item.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无直播计费规则。" />}
    </div>
  );
}

function LiveTaskTable({ rows }: { rows: LiveTask[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>确认单号</Th>
            <Th>达人</Th>
            <Th>排期</Th>
            <Th>坑位费</Th>
            <Th>线下佣金</Th>
            <Th>营销活动</Th>
            <Th>状态</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}</Td>
              <Td>{item.talentName}<div className="mt-1 text-xs text-slate-400">{item.talentId}</div></Td>
              <Td>{item.scheduleStart} 至 {item.scheduleEnd}</Td>
              <Td align="right">{formatMoney(item.slotFee)}</Td>
              <Td>{item.offlineCommissionRate}%</Td>
              <Td>{item.activity}</Td>
              <Td><StatusBadge status={item.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无直播任务确认单。" />}
    </div>
  );
}

function EstimateTable({ rows }: { rows: FeeEstimate[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>预估单号</Th>
            <Th>来源单据</Th>
            <Th>类型</Th>
            <Th>预估日期</Th>
            <Th>金额</Th>
            <Th>状态</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}</Td>
              <Td>{item.sourceBill}</Td>
              <Td>{item.type}</Td>
              <Td>{item.estimateDate}</Td>
              <Td align="right">{formatMoney(item.amount)}</Td>
              <Td><StatusBadge status={item.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无费用预估写入记录。" />}
    </div>
  );
}

function LineTable({ rows }: { rows: ContractLine[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>标的物/服务</Th>
            <Th>数量</Th>
            <Th>含税单价</Th>
            <Th>税率</Th>
            <Th>含税金额</Th>
            <Th>税额</Th>
            <Th>费用小类</Th>
            <Th>营销活动场景</Th>
            <Th>结算规则</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.item}</Td>
              <Td>{item.quantity} {item.unit}</Td>
              <Td align="right">{formatMoney(item.unitPrice)}</Td>
              <Td>{(item.taxRate * 100).toFixed(0)}%</Td>
              <Td align="right">{formatMoney(item.amount)}</Td>
              <Td align="right">{formatMoney(item.taxAmount)}</Td>
              <Td>{item.expenseMinor}</Td>
              <Td>{item.scene}</Td>
              <Td>{item.settlementRule}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function PaymentTable({ rows }: { rows: PaymentPlan[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>付款阶段</Th>
            <Th>付款说明</Th>
            <Th>预计付款时间</Th>
            <Th>付款金额</Th>
            <Th>付款比例</Th>
            <Th>付款时点</Th>
            <Th>天数</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.stage}</Td>
              <Td>{item.description}</Td>
              <Td>{item.expectedPayDate}</Td>
              <Td align="right">{formatMoney(item.amount)}</Td>
              <Td>{item.ratio}%</Td>
              <Td>{item.payPoint}</Td>
              <Td>{item.days}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function RecordTable({ rows }: { rows: Array<{ time: string; operator: string; action: string; comment: string }> }) {
  return (
    <div className="space-y-2">
      {rows.map((item, index) => (
        <div key={`${item.time}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-800">{item.action}</span>
            <span className="text-slate-400">{item.time}</span>
            <span className="text-slate-500">{item.operator}</span>
          </div>
          <div className="mt-1 text-slate-600">{item.comment}</div>
        </div>
      ))}
      {rows.length === 0 && <MiniEmpty text="暂无记录。" />}
    </div>
  );
}

function normalizePoForm(current: PoFormState, patch: Partial<PoFormState>, contracts: MarketingContract[]): PoFormState {
  const next = { ...current, ...patch };
  if (patch.contractId) {
    const contract = contracts.find((item) => item.id === patch.contractId);
    if (contract) {
      next.activity = contract.scene;
      next.budgetDepartment = contract.budgetDepartment;
      next.budgetSubject = contract.budgetSubject;
      next.expenseMinor = contract.expenseMinor;
    }
  }
  if (patch.type === "合同 PO") {
    next.talent = "";
    next.platform = "阿里妈妈";
  }
  if (patch.type === "达人 PO") {
    next.talent = next.talent || "林小柒";
    next.platform = "小红书蒲公英";
  }
  return next;
}

function normalizeLiveForm(current: LiveFormState, patch: Partial<LiveFormState>, contracts: MarketingContract[]): LiveFormState {
  const next = { ...current, ...patch };
  if (patch.contractId) {
    const contract = contracts.find((item) => item.id === patch.contractId);
    if (contract) {
      next.activity = contract.scene;
      next.budgetDepartment = contract.budgetDepartment;
      next.budgetSubject = contract.budgetSubject;
    }
  }
  return next;
}

function contractBalance(contract: MarketingContract) {
  return Math.max(0, contract.amount - contract.settlingAmount - contract.settledAmount);
}

function dateDays(start: string, end: string) {
  if (!start || !end || end < start) return 0;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
}

function formatMoney(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Table({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return <table className={`min-w-full divide-y divide-slate-200 ${compact ? "text-sm" : ""}`}>{children}</table>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold">{children}</th>;
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <td className={`whitespace-nowrap px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""}`}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 text-sm font-medium text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function Field({ label, children, required, error, className = "" }: { label: string; children: ReactNode; required?: boolean; error?: string; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-slate-500">{required && <span className="text-red-500">*</span>} {label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder = "" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  const normalized = Array.from(new Set(options.includes(value) ? options : [value, ...options].filter(Boolean)));
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>
      {normalized.map((option) => (
        <option key={option} value={option}>{labels?.[option] ?? option}</option>
      ))}
    </select>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" className={`flex h-10 w-20 items-center rounded-full border px-1 transition ${checked ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-slate-100"}`} onClick={() => onChange(!checked)}>
      <span className={`h-7 w-7 rounded-full bg-white shadow-sm transition ${checked ? "translate-x-10" : "translate-x-0"}`} />
      <span className={`ml-2 text-xs font-medium ${checked ? "text-white" : "text-slate-500"}`}>{checked ? "是" : "否"}</span>
    </button>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; size?: "sm" | "md"; disabled?: boolean }) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  const variantClass = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400";
  return (
    <button type="button" disabled={disabled} className={`${sizeClass} rounded-md font-medium shadow-sm ${variantClass}`} onClick={onClick}>
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status.includes("失败") || status.includes("驳回")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("通过") || status.includes("完成") || status.includes("生效") || status.includes("成功") || status.includes("启用") || status.includes("已写入")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("审批") || status.includes("复核中") || status.includes("履约中") || status.includes("同步中") || status.includes("变更中")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("在途") || status.includes("摊销") || status.includes("待")
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : status.includes("终止") || status.includes("停用")
              ? "border-slate-200 bg-slate-200 text-slate-500"
              : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function ProgressBar({ value, total, wide = false }: { value: number; total: number; wide?: boolean }) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  const widthClass = ratio >= 1 ? "w-full" : ratio >= 0.75 ? "w-3/4" : ratio >= 0.5 ? "w-1/2" : ratio >= 0.25 ? "w-1/4" : ratio > 0 ? "w-1/6" : "w-0";
  return (
    <div className={wide ? "w-full" : "w-32"}>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full bg-blue-600 ${widthClass}`} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{Math.round(ratio * 100)}%</div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
          <div className="text-slate-500">{label}</div>
          <div className="mt-1 font-medium text-slate-800">{value || "-"}</div>
        </div>
      ))}
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
      {children}
    </section>
  );
}

function LedgerCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Modal({ title, children, onClose, size = "md" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" | "xl" }) {
  const sizeClass = size === "xl" ? "max-w-7xl" : size === "lg" ? "max-w-5xl" : "max-w-2xl";
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
  return <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
}

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" | "green" }) {
  const className = tone === "green" ? "border-green-200 bg-green-50 text-green-700" : tone === "orange" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-red-200 bg-red-50 text-red-700";
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

function EmptyState({ onCreate, onReset }: { onCreate: () => void; onReset: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-t border-slate-100 bg-slate-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">0</div>
      <div className="font-medium text-slate-700">暂无归档合同或筛选无结果</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选或模拟同步合同系统继续演示。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button onClick={onCreate}>模拟同步合同</Button>
      </div>
    </div>
  );
}

function MiniEmpty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{text}</div>;
}
