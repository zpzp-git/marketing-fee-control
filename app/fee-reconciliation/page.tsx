"use client";

import { ReactNode, useMemo, useState } from "react";

type ViewMode = "workbench" | "adRecon" | "supplierRecon" | "fundSettlement" | "accrualForms" | "amortizationForms" | "accrualLedger";
type DocumentStatus = "草稿" | "审批中" | "已审批" | "已驳回" | "已作废";
type ReconResult = "一致" | "有差异" | "待确认" | "对账失败";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type InvoiceStatus = "发票未到" | "已无票核销" | "已到票";
type DetailData =
  | { type: "ad"; row: AdReconForm }
  | { type: "supplier"; row: SupplierReconForm }
  | { type: "fund"; row: FundSettlementForm }
  | { type: "accrualForm"; row: ExpenseAccrualForm }
  | { type: "amortizationForm"; row: ExpenseAmortizationForm }
  | { type: "accrualLedger"; row: ExpenseAccrualLedger }
  | { type: "source"; row: SourceLedger };

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

interface SourceLedger {
  id: string;
  code: string;
  sourceType: "投放费用预估" | "单次执行费用预估" | "佣金费用预估" | "直播费用预估" | "平台扣款费用" | "合同摊销费用";
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  contractName: string;
  feeDate: string;
  month: string;
  marketingPlan: string;
  planCategory: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  store: string;
  brand: string;
  channel: string;
  amount: number;
  estimateAmount: number;
  actualAmount: number;
  rechargeAccount?: string;
  adAccount?: string;
  omsCategory?: string;
  omsSubCategory?: string;
  receivingAccount?: string;
  allowNoInvoice?: boolean;
  reconciled: boolean;
  reconciliationDate?: string;
  reconciliationCode?: string;
  reconciliationAmount?: number;
  reconciliationResult?: ReconResult;
  differenceAmount: number;
  differenceReason?: string;
  accrued: boolean;
  accruedAmount: number;
  entryStatus: "未入账" | "入账中" | "已入账" | "入账失败";
  amortizationStatus: "未摊销" | "摊销中" | "已摊销" | "摊销失败";
  amortizationStart?: string;
  amortizationEnd?: string;
  dailyAmortization?: number;
  currentMonthDays?: number;
  bookedAmount: number;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  logs: OperationLog[];
}

interface AdReconLine {
  id: string;
  sourceId: string;
  rechargeAccount: string;
  adAccount: string;
  feeDate: string;
  cashConsume: number;
  estimatedCash: number;
  accountConsume: number;
  deductionAmount: number;
  differenceAmount: number;
  differenceReason: string;
  result: ReconResult;
  businessOwner: string;
  financeOwner: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  store: string;
  brand: string;
  channel: string;
}

interface AdReconForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  applicantOrg: string;
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  reconciliationDate: string;
  status: DocumentStatus;
  approvalStatus: DocumentStatus;
  differenceAmount: number;
  description: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: AdReconLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface SupplierReconLine {
  id: string;
  sourceId: string;
  startDate: string;
  endDate: string;
  estimateAmount: number;
  settlementAmount: number;
  differenceAmount: number;
  differenceReason: string;
  result: ReconResult;
  accrualCode: string;
  poCode: string;
  feeDate: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  store: string;
  brand: string;
  channel: string;
}

interface SupplierReconForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  reconciliationDate: string;
  hasAccrual: boolean;
  settlementTotal: number;
  differenceTotal: number;
  status: DocumentStatus;
  voucherNo: string;
  description: string;
  lines: SupplierReconLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface FundBillLine {
  id: string;
  sourceId: string;
  feeDate: string;
  expenseAmount: number;
  entryAmount: number;
  omsCategory: string;
  omsSubCategory: string;
  planCategory: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  store: string;
  brand: string;
  channel: string;
  receivingAccount: string;
  relationKey: string;
  ruleHit: "生成待到票" | "无票核销";
}

interface FundSettlementForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  accountingEntity: string;
  supplier: string;
  dataSource: string;
  contractCode: string;
  entryDate: string;
  status: DocumentStatus;
  voucherNo: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: FundBillLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface ExpenseAccrualLine {
  id: string;
  sourceId: string;
  sourceLedger: string;
  feeDate: string;
  estimateAmount: number;
  accrualAmount: number;
  supplier: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  store: string;
  brand: string;
  channel: string;
  accountingSubject: string;
}

interface ExpenseAccrualForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  accountingEntity: string;
  status: DocumentStatus;
  voucherNo: string;
  accrualTotal: number;
  lines: ExpenseAccrualLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface AmortizationLine {
  id: string;
  sourceId: string;
  contractCode: string;
  supplier: string;
  amortizationStart: string;
  amortizationEnd: string;
  dailyAmortization: number;
  currentMonthDays: number;
  currentMonthAmount: number;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  accountingSubject: string;
  brand: string;
}

interface ExpenseAmortizationForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  accountingEntity: string;
  amortizationMonth: string;
  status: DocumentStatus;
  voucherNo: string;
  totalAmount: number;
  lines: AmortizationLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface ExpenseAccrualLedger {
  id: string;
  code: string;
  sourceCode: string;
  month: string;
  amount: number;
  accountingEntity: string;
  supplier: string;
  budgetSubject: string;
  budgetDepartment: string;
  store: string;
  brand: string;
  channel: string;
  accountingSubject: string;
  reconciled: boolean;
  reversed: boolean;
  reconciliationCode: string;
  voucherNo: string;
  logs: OperationLog[];
}

interface PendingInvoice {
  id: string;
  sourceCode: string;
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  activity: string;
  expenseType: string;
  amount: number;
  invoiceStatus: InvoiceStatus;
  allowNoInvoice: boolean;
}

interface Filters {
  keyword: string;
  accountingEntity: string;
  supplier: string;
  status: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const initialFilters: Filters = { keyword: "", accountingEntity: "全部", supplier: "全部", status: "全部" };
const applicant = "王悦";
const applicantOrg = "上海示例品牌管理有限公司 / 财务共享中心 / 费用会计";

const baseLogs: OperationLog[] = [{ time: nowText, operator: "系统模拟", action: "初始化", comment: "由内置 mock 数据生成，未连接真实第三方系统。" }];
const baseApprovals: ApprovalRecord[] = [{ node: "发起", approver: "王悦", date: today, comment: "前端 mock 提交审批。" }];

const initialSourceLedgers: SourceLedger[] = [
  buildSource({
    id: "src-ad-001",
    code: "TFYG-2026-0501-001",
    sourceType: "投放费用预估",
    supplier: "小红书聚光",
    contractCode: "YXHT-2026-188",
    contractName: "小红书 618 种草投放合同",
    feeDate: "2026-05-01",
    month: "2026-05",
    marketingPlan: "2026 618 上新投放",
    planCategory: "内容种草",
    activity: "小红书 618 种草投放",
    budgetSubject: "品牌推广费",
    budgetDepartment: "品牌营销部",
    expenseType: "站外种草投放",
    store: "小红书官方旗舰店",
    brand: "示例品牌",
    channel: "小红书",
    amount: 90000,
    estimateAmount: 90000,
    actualAmount: 92000,
    rechargeAccount: "XHS-CZ-2026-01",
    adAccount: "xhs_flow_618",
    differenceReason: "平台返点延迟入账",
    differenceAmount: 2000
  }),
  buildSource({
    id: "src-ad-002",
    code: "TFYG-2026-0502-002",
    sourceType: "投放费用预估",
    supplier: "阿里妈妈",
    contractCode: "YXHT-2026-098",
    contractName: "直通车平台服务费协议",
    feeDate: "2026-05-02",
    month: "2026-05",
    marketingPlan: "天猫日销放量",
    planCategory: "站内推广",
    activity: "天猫直通车日销",
    budgetSubject: "效果广告费",
    budgetDepartment: "电商运营部",
    expenseType: "直通车",
    store: "天猫官方旗舰店",
    brand: "示例品牌",
    channel: "天猫",
    amount: 58000,
    estimateAmount: 58000,
    actualAmount: 58000,
    rechargeAccount: "TM-CZ-2026-02",
    adAccount: "tm_ztc_daily"
  }),
  buildSource({
    id: "src-ad-003",
    code: "TFYG-2026-0504-003",
    sourceType: "投放费用预估",
    supplier: "巨量引擎",
    contractCode: "YXHT-2026-201",
    contractName: "抖音自投效果广告协议",
    feeDate: "2026-05-04",
    month: "2026-05",
    marketingPlan: "抖音直播间拉新",
    planCategory: "直播投流",
    activity: "抖音直播自投",
    budgetSubject: "直播推广费",
    budgetDepartment: "内容电商部",
    expenseType: "千川投放",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    amount: 76000,
    estimateAmount: 76000,
    actualAmount: 0,
    rechargeAccount: "DY-CZ-2026-03",
    adAccount: "dy_live_qianchuan",
    differenceAmount: -76000,
    differenceReason: "投放账户与充值账户不匹配",
    failureReason: "标准账单转换失败：投放账户 dy_live_qianchuan 未匹配到充值账户。同步批次 RPA-20260506-003",
    syncStatus: "同步失败"
  }),
  buildSource({
    id: "src-exe-001",
    code: "DZYX-2026-0505-001",
    sourceType: "单次执行费用预估",
    supplier: "杭州星图传媒有限公司",
    contractCode: "YXHT-2026-213",
    contractName: "抖音达人内容执行合同",
    feeDate: "2026-05-05",
    month: "2026-05",
    marketingPlan: "抖音达人内容执行",
    planCategory: "达人内容",
    activity: "抖音达人内容执行",
    budgetSubject: "达人推广费",
    budgetDepartment: "内容营销部",
    expenseType: "达人服务费",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    amount: 65000,
    estimateAmount: 65000,
    actualAmount: 66500,
    differenceAmount: 1500,
    differenceReason: "追加一条短视频授权"
  }),
  buildSource({
    id: "src-exe-002",
    code: "DZYX-2026-0508-002",
    sourceType: "直播费用预估",
    supplier: "上海青橙直播服务有限公司",
    contractCode: "YXHT-2026-216",
    contractName: "达人直播坑位与佣金合同",
    feeDate: "2026-05-08",
    month: "2026-05",
    marketingPlan: "520 直播专场",
    planCategory: "直播合作",
    activity: "520 达人直播专场",
    budgetSubject: "直播服务费",
    budgetDepartment: "内容电商部",
    expenseType: "直播坑位费",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    amount: 48000,
    estimateAmount: 48000,
    actualAmount: 48000
  }),
  buildSource({
    id: "src-com-001",
    code: "YJYG-2026-0503-001",
    sourceType: "佣金费用预估",
    supplier: "精选联盟",
    contractCode: "PTXY-2026-052",
    contractName: "抖音精选联盟服务协议",
    feeDate: "2026-05-03",
    month: "2026-05",
    marketingPlan: "精选联盟分销",
    planCategory: "达人分销",
    activity: "达人分销佣金",
    budgetSubject: "佣金费用",
    budgetDepartment: "电商运营部",
    expenseType: "平台佣金",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    amount: 31500,
    estimateAmount: 31500,
    actualAmount: 31500
  }),
  buildSource({
    id: "src-fund-001",
    code: "PTKK-2026-0501-001",
    sourceType: "平台扣款费用",
    supplier: "京东平台",
    contractCode: "PTXY-2026-031",
    contractName: "京东平台技术服务费协议",
    feeDate: "2026-05-01",
    month: "2026-05",
    marketingPlan: "京东站内投放",
    planCategory: "平台扣款",
    activity: "京东平台技术服务费",
    budgetSubject: "平台服务费",
    budgetDepartment: "电商运营部",
    expenseType: "技术服务费",
    store: "京东官方旗舰店",
    brand: "示例品牌",
    channel: "京东",
    amount: 42000,
    estimateAmount: 42000,
    actualAmount: 42000,
    omsCategory: "费用项",
    omsSubCategory: "平台技术服务费",
    receivingAccount: "JD-PAY-1001",
    allowNoInvoice: false
  }),
  buildSource({
    id: "src-fund-002",
    code: "PTKK-2026-0502-002",
    sourceType: "平台扣款费用",
    supplier: "京东平台",
    contractCode: "PTXY-2026-031",
    contractName: "京东平台技术服务费协议",
    feeDate: "2026-05-02",
    month: "2026-05",
    marketingPlan: "京挑客推广",
    planCategory: "平台扣款",
    activity: "站内推广费-京挑客",
    budgetSubject: "佣金费用",
    budgetDepartment: "电商运营部",
    expenseType: "京挑客佣金",
    store: "京东官方旗舰店",
    brand: "示例品牌",
    channel: "京东",
    amount: 18000,
    estimateAmount: 18000,
    actualAmount: 18000,
    omsCategory: "费用项",
    omsSubCategory: "站内推广费-京挑客",
    receivingAccount: "JD-PAY-1001",
    allowNoInvoice: true
  }),
  buildSource({
    id: "src-amort-001",
    code: "HTTX-2026-001",
    sourceType: "合同摊销费用",
    supplier: "杭州品牌传播有限公司",
    contractCode: "YXHT-2026-166",
    contractName: "品牌年度框架合同",
    feeDate: "2026-05-01",
    month: "2026-05",
    marketingPlan: "年度品牌传播",
    planCategory: "合同摊销",
    activity: "品牌年度框架合同摊销",
    budgetSubject: "品牌推广费",
    budgetDepartment: "品牌营销部",
    expenseType: "年度框架摊销",
    store: "全渠道",
    brand: "示例品牌",
    channel: "全渠道",
    amount: 1200000,
    estimateAmount: 1200000,
    actualAmount: 101917.77,
    amortizationStart: "2026-01-01",
    amortizationEnd: "2026-12-31",
    dailyAmortization: 3287.67,
    currentMonthDays: 31
  }),
  buildSource({
    id: "src-amort-002",
    code: "HTTX-2026-002",
    sourceType: "合同摊销费用",
    supplier: "上海视觉创意有限公司",
    contractCode: "YXHT-2026-177",
    contractName: "品牌视觉内容半年框架合同",
    feeDate: "2026-05-01",
    month: "2026-05",
    marketingPlan: "品牌视觉内容",
    planCategory: "合同摊销",
    activity: "品牌视觉内容摊销",
    budgetSubject: "内容制作费",
    budgetDepartment: "品牌营销部",
    expenseType: "内容制作摊销",
    store: "全渠道",
    brand: "示例品牌",
    channel: "全渠道",
    amount: 360000,
    estimateAmount: 360000,
    actualAmount: 60000,
    amortizationStart: "2026-03-01",
    amortizationEnd: "2026-08-31",
    dailyAmortization: 1967.21,
    currentMonthDays: 31
  })
];

const initialAdForms: AdReconForm[] = [
  buildAdForm("AD-DZ-2026-0501-001", [initialSourceLedgers[1]], "已审批"),
  { ...buildAdForm("AD-DZ-2026-0501-002", [initialSourceLedgers[0]], "草稿"), status: "草稿", approvalStatus: "草稿" },
  { ...buildAdForm("AD-DZ-2026-0501-003", [initialSourceLedgers[2]], "已驳回"), status: "已驳回", approvalStatus: "已驳回", syncStatus: "同步失败", failureReason: initialSourceLedgers[2].failureReason }
];

const initialSupplierForms: SupplierReconForm[] = [
  buildSupplierForm("GYS-DZ-2026-0505-001", [initialSourceLedgers[3]], "审批中"),
  { ...buildSupplierForm("GYS-DZ-2026-0508-002", [initialSourceLedgers[4]], "已审批"), voucherNo: "PZ-202605-0201" }
];

const initialFundForms: FundSettlementForm[] = [
  { ...buildFundForm("ZJJS-2026-0502-001", [initialSourceLedgers[6], initialSourceLedgers[7]], "草稿"), syncStatus: "同步成功" }
];

const initialAccrualForms: ExpenseAccrualForm[] = [
  buildAccrualForm("FYYT-2026-0503-001", [initialSourceLedgers[5]], "已审批")
];

const initialAmortizationForms: ExpenseAmortizationForm[] = [
  buildAmortizationForm("FYTX-2026-0501-001", [initialSourceLedgers[8]], "审批中")
];

const initialAccrualLedger: ExpenseAccrualLedger[] = [
  buildAccrualLedger("YTTZ-2026-0503-001", initialSourceLedgers[5], "FYYT-2026-0503-001", false, false),
  buildAccrualLedger("YTTZ-2026-0419-008", { ...initialSourceLedgers[3], month: "2026-04", accruedAmount: 65000 }, "FYYT-2026-0419-008", true, true),
  buildAccrualLedger("YTTZ-2026-0421-011", { ...initialSourceLedgers[4], month: "2026-04", accruedAmount: 48000 }, "FYYT-2026-0421-011", false, false)
];

const initialPendingInvoices: PendingInvoice[] = [
  {
    id: "pinv-001",
    sourceCode: "GYS-DZ-2026-0508-002",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "上海青橙直播服务有限公司",
    contractCode: "YXHT-2026-216",
    activity: "520 达人直播专场",
    expenseType: "直播坑位费",
    amount: 48000,
    invoiceStatus: "发票未到",
    allowNoInvoice: false
  }
];

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "workbench", label: "工作台" },
  { key: "adRecon", label: "投放自动对账单" },
  { key: "supplierRecon", label: "供应商对账单" },
  { key: "fundSettlement", label: "资金账单结算单" },
  { key: "accrualForms", label: "费用预提单" },
  { key: "amortizationForms", label: "费用摊销单" },
  { key: "accrualLedger", label: "费用预提台账" }
];

export default function FeeReconciliationPage() {
  const [view, setView] = useState<ViewMode>("workbench");
  const [sourceLedgers, setSourceLedgers] = useState(initialSourceLedgers);
  const [adForms, setAdForms] = useState(initialAdForms);
  const [supplierForms, setSupplierForms] = useState(initialSupplierForms);
  const [fundForms, setFundForms] = useState(initialFundForms);
  const [accrualForms, setAccrualForms] = useState(initialAccrualForms);
  const [amortizationForms, setAmortizationForms] = useState(initialAmortizationForms);
  const [accrualLedger, setAccrualLedger] = useState(initialAccrualLedger);
  const [pendingInvoices, setPendingInvoices] = useState(initialPendingInvoices);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [adForm, setAdForm] = useState<AdReconForm | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierReconForm | null>(null);
  const [fundForm, setFundForm] = useState<FundSettlementForm | null>(null);
  const [accrualForm, setAccrualForm] = useState<ExpenseAccrualForm | null>(null);
  const [amortizationForm, setAmortizationForm] = useState<ExpenseAmortizationForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suppliers = useMemo(() => unique(sourceLedgers.map((item) => item.supplier)), [sourceLedgers]);
  const accountingEntities = useMemo(() => unique(sourceLedgers.map((item) => item.accountingEntity)), [sourceLedgers]);
  const filteredAd = useMemo(() => filterDocuments(adForms, filters), [adForms, filters]);
  const filteredSupplier = useMemo(() => filterDocuments(supplierForms, filters), [supplierForms, filters]);
  const filteredFund = useMemo(() => filterDocuments(fundForms, filters), [fundForms, filters]);
  const filteredAccrualForms = useMemo(() => filterDocuments(accrualForms, filters), [accrualForms, filters]);
  const filteredAmortizationForms = useMemo(() => filterDocuments(amortizationForms, filters), [amortizationForms, filters]);
  const filteredAccrualLedger = useMemo(() => filterAccrualLedger(accrualLedger, filters), [accrualLedger, filters]);
  const stats = useMemo(() => buildStats(sourceLedgers, adForms, supplierForms, fundForms, accrualLedger), [sourceLedgers, adForms, supplierForms, fundForms, accrualLedger]);

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
    window.setTimeout(() => setTableLoading(false), 450);
  }

  function exportMock() {
    showToast("已模拟生成当前筛选结果导出任务，不创建真实文件。");
  }

  function retrySync() {
    setPageError("");
    setSourceLedgers((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText, logs: [{ time: nowText, operator: "系统模拟", action: "重新同步", comment: "已模拟重新匹配投放账户与充值账户。" }, ...row.logs] } : row));
    setAdForms((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText } : row));
    showToast("已模拟重试 RPA/标准账单同步，失败记录恢复为同步成功。");
  }

  function openAdRecon(source?: SourceLedger) {
    const candidates = source ? [source] : sourceLedgers.filter((item) => item.sourceType === "投放费用预估" && !item.reconciled);
    setErrors({});
    setAdForm(buildAdForm(`AD-DZ-2026-0506-${String(adForms.length + 11).padStart(3, "0")}`, candidates, "草稿"));
  }

  function submitAdRecon() {
    if (!adForm) return;
    const nextErrors = validateDifferenceLines(adForm.lines);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setAdForm({ ...adForm, status: "审批中", approvalStatus: "审批中", approvals: [...adForm.approvals, { node: "财务复核", approver: "林一", date: today, comment: "已模拟推送 OA 审批。" }] });
    showToast("投放自动对账单已模拟提交审批。");
  }

  function approveAdRecon() {
    if (!adForm) return;
    const approved: AdReconForm = { ...adForm, status: "已审批", approvalStatus: "已审批", logs: [{ time: nowText, operator: "林一", action: "审批通过", comment: "回写投放费用预估台账的对账结果、差异金额和差异原因。" }, ...adForm.logs] };
    setAdForms((rows) => upsertByCode(rows, approved));
    setSourceLedgers((rows) => rows.map((row) => {
      const line = adForm.lines.find((item) => item.sourceId === row.id);
      if (!line) return row;
      return { ...row, reconciled: true, reconciliationDate: adForm.reconciliationDate, reconciliationCode: adForm.code, reconciliationAmount: line.cashConsume, reconciliationResult: line.result, differenceAmount: line.differenceAmount, differenceReason: line.differenceReason, syncStatus: "同步成功", logs: [{ time: nowText, operator: "系统模拟", action: "对账回写", comment: `${adForm.code} 审批完成，投放预估台账已标记已对账。` }, ...row.logs] };
    }));
    setAdForm(null);
    setView("adRecon");
    showToast("审批完成，已回写投放费用预估台账。");
  }

  function rejectAdRecon() {
    if (!adForm) return;
    setAdForm({ ...adForm, status: "已驳回", approvalStatus: "已驳回", approvals: [...adForm.approvals, { node: "财务复核", approver: "林一", date: today, comment: "模拟驳回：请补充差异说明。" }] });
    showToast("已模拟驳回，可继续编辑差异原因后重新提交。");
  }

  function openSupplierRecon(source?: SourceLedger) {
    const candidates = source ? [source] : sourceLedgers.filter((item) => ["单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType) && !item.reconciled);
    setErrors({});
    setSupplierForm(buildSupplierForm(`GYS-DZ-2026-0506-${String(supplierForms.length + 11).padStart(3, "0")}`, candidates, "草稿"));
  }

  function patchSupplierLine(lineId: string, settlementAmount: number, differenceReason: string) {
    setSupplierForm((current) => {
      if (!current) return current;
      const lines = current.lines.map((line) => {
      if (line.id !== lineId) return line;
      const differenceAmount = settlementAmount - line.estimateAmount;
        const result: ReconResult = Math.abs(differenceAmount) < 0.01 ? "一致" : "有差异";
        return { ...line, settlementAmount, differenceAmount, differenceReason, result };
      });
      return { ...current, lines, settlementTotal: sum(lines.map((item) => item.settlementAmount)), differenceTotal: sum(lines.map((item) => item.differenceAmount)) };
    });
  }

  function submitSupplierRecon() {
    if (!supplierForm) return;
    const nextErrors = validateDifferenceLines(supplierForm.lines);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSupplierForm({ ...supplierForm, status: "审批中", approvals: [...supplierForm.approvals, { node: "供应商结算复核", approver: "顾可", date: today, comment: "已模拟提交审批。" }] });
    showToast("供应商对账单已模拟提交审批。");
  }

  function approveSupplierRecon() {
    if (!supplierForm) return;
    const voucherNo = nextVoucher("PZ");
    const approved: SupplierReconForm = { ...supplierForm, status: "已审批", voucherNo, logs: [{ time: nowText, operator: "顾可", action: "审批通过", comment: "已回写费用预提台账并生成待到票 mock 记录。" }, ...supplierForm.logs] };
    setSupplierForms((rows) => upsertByCode(rows, approved));
    setSourceLedgers((rows) => rows.map((row) => {
      const line = supplierForm.lines.find((item) => item.sourceId === row.id);
      if (!line) return row;
      return { ...row, reconciled: true, reconciliationDate: supplierForm.reconciliationDate, reconciliationCode: supplierForm.code, reconciliationAmount: line.settlementAmount, reconciliationResult: line.result, differenceAmount: line.differenceAmount, differenceReason: line.differenceReason, accruedAmount: line.estimateAmount / 1.06, logs: [{ time: nowText, operator: "系统模拟", action: "供应商对账回写", comment: `对账金额 ${formatMoney(line.settlementAmount)}，凭证 ${voucherNo}。` }, ...row.logs] };
    }));
    setAccrualLedger((rows) => rows.map((row) => supplierForm.lines.some((line) => line.accrualCode === row.code || line.sourceId === row.id) ? { ...row, reconciled: true, reversed: true, reconciliationCode: supplierForm.code, logs: [{ time: nowText, operator: "系统模拟", action: "供应商对账回写", comment: "是否对账=是，是否冲销=是。" }, ...row.logs] } : row));
    setPendingInvoices((rows) => [
      ...supplierForm.lines.map((line, index): PendingInvoice => ({
        id: `pinv-${Date.now()}-${index}`,
        sourceCode: supplierForm.code,
        accountingEntity: supplierForm.accountingEntity,
        supplier: supplierForm.supplier,
        contractCode: supplierForm.contractCode,
        activity: line.activity,
        expenseType: line.expenseType,
        amount: line.settlementAmount,
        invoiceStatus: "发票未到",
        allowNoInvoice: false
      })),
      ...rows
    ]);
    setSupplierForm(null);
    setView("supplierRecon");
    showToast(`审批完成，已生成凭证 ${voucherNo} 并插入待到票 mock 记录。`);
  }

  function openFundSettlement(source?: SourceLedger) {
    const candidates = source ? [source] : sourceLedgers.filter((item) => item.sourceType === "平台扣款费用" && item.entryStatus !== "已入账");
    setErrors({});
    setFundForm(buildFundForm(`ZJJS-2026-0506-${String(fundForms.length + 11).padStart(3, "0")}`, candidates, "草稿"));
  }

  function syncOmsBills() {
    if (!fundForm) return;
    setOverlayLoading("正在模拟 OMS 推送资金账单、解析费用项规则");
    window.setTimeout(() => {
      setFundForm({ ...fundForm, syncStatus: "同步成功", lastSyncAt: nowText, logs: [{ time: nowText, operator: "OMS mock", action: "同步资金账单", comment: "同步批次 OMS-20260506-001，成功 2 条，失败 0 条。" }, ...fundForm.logs] });
      setOverlayLoading("");
      showToast("OMS 资金账单已模拟同步成功。");
    }, 700);
  }

  function submitFundSettlement() {
    if (!fundForm) return;
    if (fundForm.lines.length === 0) {
      setErrors({ lines: "请先同步或选择至少一条资金账单明细。" });
      return;
    }
    setFundForm({ ...fundForm, status: "审批中", approvals: [...fundForm.approvals, { node: "资金结算复核", approver: "林一", date: today, comment: "已模拟提交审批，预算占用增加。" }] });
    showToast("资金账单结算单已提交审批，预算占用数已模拟增加。");
  }

  function approveFundSettlement() {
    if (!fundForm) return;
    const voucherNo = nextVoucher("PZ");
    const approved: FundSettlementForm = { ...fundForm, status: "已审批", voucherNo, syncStatus: "同步成功", lastSyncAt: nowText };
    setFundForms((rows) => upsertByCode(rows, approved));
    setSourceLedgers((rows) => rows.map((row) => {
      const line = fundForm.lines.find((item) => item.sourceId === row.id);
      if (!line) return row;
      return { ...row, entryStatus: "已入账", accrued: true, accruedAmount: line.entryAmount, bookedAmount: row.bookedAmount + line.entryAmount, logs: [{ time: nowText, operator: "系统模拟", action: "资金结算入账", comment: `${fundForm.code} 审批完成，平台扣款费用台账是否入账=是。` }, ...row.logs] };
    }));
    setPendingInvoices((rows) => [
      ...fundForm.lines.map((line, index): PendingInvoice => ({
        id: `pinv-fund-${Date.now()}-${index}`,
        sourceCode: fundForm.code,
        accountingEntity: fundForm.accountingEntity,
        supplier: fundForm.supplier,
        contractCode: fundForm.contractCode,
        activity: line.activity,
        expenseType: line.expenseType,
        amount: line.entryAmount,
        invoiceStatus: line.ruleHit === "无票核销" ? "已无票核销" : "发票未到",
        allowNoInvoice: line.ruleHit === "无票核销"
      })),
      ...rows
    ]);
    setFundForm(null);
    setView("fundSettlement");
    showToast(`审批完成，已生成凭证 ${voucherNo}，并按有票/无票规则生成待到票 mock。`);
  }

  function openAccrualForm(source?: SourceLedger) {
    const candidates = source ? [source] : sourceLedgers.filter((item) => ["单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType) && !item.accrued);
    setErrors({});
    setAccrualForm(buildAccrualForm(`FYYT-2026-0506-${String(accrualForms.length + 11).padStart(3, "0")}`, candidates, "草稿"));
  }

  function submitAccrualForm() {
    if (!accrualForm) return;
    if (accrualForm.lines.length === 0 || accrualForm.accrualTotal <= 0) {
      setErrors({ lines: "请选择未预提的费用预估记录，且预提金额必须大于 0。" });
      return;
    }
    setAccrualForm({ ...accrualForm, status: "审批中", approvals: [...accrualForm.approvals, { node: "费用预提复核", approver: "顾可", date: today, comment: "已模拟提交预提审批。" }] });
    showToast("费用预提单已模拟提交审批。");
  }

  function approveAccrualForm() {
    if (!accrualForm) return;
    const voucherNo = nextVoucher("PZ");
    const approved: ExpenseAccrualForm = { ...accrualForm, status: "已审批", voucherNo };
    setAccrualForms((rows) => upsertByCode(rows, approved));
    setSourceLedgers((rows) => rows.map((row) => {
      const line = accrualForm.lines.find((item) => item.sourceId === row.id);
      if (!line) return row;
      return { ...row, accrued: true, accruedAmount: line.accrualAmount, logs: [{ time: nowText, operator: "系统模拟", action: "费用预提回写", comment: `${accrualForm.code} 审批完成，来源预估台账是否预提=是。` }, ...row.logs] };
    }));
    setAccrualLedger((rows) => [
      ...accrualForm.lines.map((line, index) => buildAccrualLedger(`YTTZ-2026-0506-${String(rows.length + index + 1).padStart(3, "0")}`, sourceLedgers.find((item) => item.id === line.sourceId)!, accrualForm.code, false, false, voucherNo, line.accrualAmount)),
      ...rows
    ]);
    setAccrualForm(null);
    setView("accrualLedger");
    showToast(`审批完成，已生成凭证 ${voucherNo} 并插入费用预提台账。`);
  }

  function openAmortizationForm(source?: SourceLedger) {
    const candidates = source ? [source] : sourceLedgers.filter((item) => item.sourceType === "合同摊销费用" && item.amortizationStatus !== "已摊销");
    setErrors({});
    setAmortizationForm(buildAmortizationForm(`FYTX-2026-0506-${String(amortizationForms.length + 11).padStart(3, "0")}`, candidates, "草稿"));
  }

  function submitAmortizationForm() {
    if (!amortizationForm) return;
    if (amortizationForm.lines.length === 0 || amortizationForm.totalAmount <= 0) {
      setErrors({ lines: "请选择摊销中的合同，且本月摊销金额必须大于 0。" });
      return;
    }
    setAmortizationForm({ ...amortizationForm, status: "审批中", approvals: [...amortizationForm.approvals, { node: "摊销复核", approver: "林一", date: today, comment: "已模拟提交摊销审批。" }] });
    showToast("费用摊销单已模拟提交审批。");
  }

  function approveAmortizationForm() {
    if (!amortizationForm) return;
    const voucherNo = nextVoucher("PZ");
    const approved: ExpenseAmortizationForm = { ...amortizationForm, status: "已审批", voucherNo };
    setAmortizationForms((rows) => upsertByCode(rows, approved));
    setSourceLedgers((rows) => rows.map((row) => {
      const line = amortizationForm.lines.find((item) => item.sourceId === row.id);
      if (!line) return row;
      return { ...row, amortizationStatus: "已摊销", bookedAmount: row.bookedAmount + line.currentMonthAmount, logs: [{ time: nowText, operator: "系统模拟", action: "摊销入账", comment: `${amortizationForm.code} 审批完成，合同摊销费用台账费用入账金额增加 ${formatMoney(line.currentMonthAmount)}。` }, ...row.logs] };
    }));
    setAmortizationForm(null);
    setView("amortizationForms");
    showToast(`审批完成，已生成凭证 ${voucherNo} 并更新合同摊销费用台账。`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">对账结算</div>
          </div>
          <nav className="space-y-1 p-3 text-sm">
            {[
              ["工作台", "Overview"],
              ["基础数据", "Base Data"],
              ["预算管理", "Budget"],
              ["营销计划与事项", "Plan & Matter"],
              ["合同与 PO", "Contract & PO"],
              ["费用申请与资金", "Payment & Fund"],
              ["发票与核销", "Invoice"],
              ["费用预估", "Estimation"],
              ["对账结算", "Settlement"],
              ["财务处理", "Finance"]
            ].map(([label, sub]) => (
              <div key={label} className={`rounded-md px-3 py-2 ${label === "对账结算" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{sub}</div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">对账结算 / 费用对账结算 / 3.7.16</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">费用对账结算模块</h1>
              <p className="mt-1 text-sm text-slate-500">投放自动对账、供应商结算、资金账单入账、费用预提与合同摊销的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openAdRecon()}>生成投放对账单</Button>
              <Button variant="secondary" onClick={() => openSupplierRecon()}>生成供应商对账单</Button>
              <Button variant="secondary" onClick={() => openFundSettlement()}>模拟同步 OMS</Button>
              <Button variant="secondary" onClick={exportMock}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：RPA 标准账单转换超时 [504]，投放账户与充值账户映射未命中。")}>模拟异常</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-6">
            {stats.map((item) => <SummaryCard key={item.label} label={item.label} value={item.value} sub={item.sub} />)}
          </div>

          {pageError && (
            <Alert>
              <div className="font-medium">异常提示</div>
              <div className="mt-1">{pageError}</div>
              <button className="mt-2 font-medium underline" onClick={retrySync}>重新同步 / 重新匹配</button>
            </Alert>
          )}

          <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex min-w-max gap-2">
              {viewTabs.map((item) => (
                <button key={item.key} className={`rounded-md px-3 py-2 text-sm font-medium ${view === item.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => setView(item.key)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {view === "workbench" ? (
            <Workbench
              sourceLedgers={sourceLedgers}
              pendingInvoices={pendingInvoices}
              onOpenSource={(row) => setDetail({ type: "source", row })}
              onAd={() => openAdRecon()}
              onSupplier={() => openSupplierRecon()}
              onFund={() => openFundSettlement()}
              onAccrual={() => openAccrualForm()}
              onAmortization={() => openAmortizationForm()}
              onRetry={retrySync}
            />
          ) : (
            <Section title={viewTitle(view)} extra={<Button size="sm" variant="secondary" onClick={simulateQuery}>查询</Button>}>
              <FiltersBar filters={filters} suppliers={suppliers} accountingEntities={accountingEntities} onChange={(patch) => setFilters({ ...filters, ...patch })} onReset={resetFilters} />
              <div className="relative overflow-x-auto">
                {tableLoading && <LoadingMask text="正在查询 mock 数据..." />}
                {view === "adRecon" && <AdReconTable rows={filteredAd} onDetail={(row) => setDetail({ type: "ad", row })} onEdit={(row) => setAdForm(row)} onCreate={() => openAdRecon()} onReset={resetFilters} />}
                {view === "supplierRecon" && <SupplierReconTable rows={filteredSupplier} onDetail={(row) => setDetail({ type: "supplier", row })} onEdit={(row) => setSupplierForm(row)} onCreate={() => openSupplierRecon()} onReset={resetFilters} />}
                {view === "fundSettlement" && <FundSettlementTable rows={filteredFund} onDetail={(row) => setDetail({ type: "fund", row })} onEdit={(row) => setFundForm(row)} onCreate={() => openFundSettlement()} onReset={resetFilters} />}
                {view === "accrualForms" && <AccrualFormTable rows={filteredAccrualForms} onDetail={(row) => setDetail({ type: "accrualForm", row })} onEdit={(row) => setAccrualForm(row)} onCreate={() => openAccrualForm()} onReset={resetFilters} />}
                {view === "amortizationForms" && <AmortizationFormTable rows={filteredAmortizationForms} onDetail={(row) => setDetail({ type: "amortizationForm", row })} onEdit={(row) => setAmortizationForm(row)} onCreate={() => openAmortizationForm()} onReset={resetFilters} />}
                {view === "accrualLedger" && <AccrualLedgerTable rows={filteredAccrualLedger} onDetail={(row) => setDetail({ type: "accrualLedger", row })} onReset={resetFilters} onExport={exportMock} />}
              </div>
            </Section>
          )}
        </section>
      </div>

      {adForm && (
        <Modal title={`${adForm.code} 投放自动对账单`} onClose={() => setAdForm(null)} size="xl">
          <Alert tone="blue">RPA 导入、标准账单转换和对账匹配均为前端 mock。差异金额 = 现金消耗 - 预估现金消耗。</Alert>
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="申请人" value={adForm.applicant} />
            <ReadOnly label="申请人公司-部门-岗位" value={adForm.applicantOrg} />
            <ReadOnly label="核算主体" value={adForm.accountingEntity} />
            <ReadOnly label="状态" value={<StatusBadge status={adForm.status} />} />
            <ReadOnly label="供应商" value={adForm.supplier} />
            <ReadOnly label="合同编号" value={adForm.contractCode} />
            <ReadOnly label="对账日期" value={adForm.reconciliationDate} />
            <ReadOnly label="差异金额" value={<Money value={adForm.differenceAmount} />} />
          </div>
          <Section title="自动对账结果" extra={<Button size="sm" variant="secondary" onClick={() => showToast("扫描完成：按账号+日期完成智能匹配，差异行已标红。")}>执行自动对账</Button>}>
            {errors.lines && <Alert>{errors.lines}</Alert>}
            <Table>
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr><Th>费用日期</Th><Th>充值账户</Th><Th>投放账户</Th><Th>现金消耗</Th><Th>系统预估</Th><Th>差异金额</Th><Th>差异原因</Th><Th>结果</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {adForm.lines.map((line) => (
                  <tr key={line.id}>
                    <Td>{line.feeDate}</Td>
                    <Td>{line.rechargeAccount}</Td>
                    <Td>{line.adAccount}</Td>
                    <Td align="right">{formatMoney(line.cashConsume)}</Td>
                    <Td align="right">{formatMoney(line.estimatedCash)}</Td>
                    <Td align="right"><Money value={line.differenceAmount} /></Td>
                    <Td><Input value={line.differenceReason} onChange={(differenceReason) => setAdForm({ ...adForm, lines: adForm.lines.map((item) => item.id === line.id ? { ...item, differenceReason } : item) })} disabled={adForm.status === "已审批"} /></Td>
                    <Td><StatusBadge status={line.result} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
          <Section title="业务消耗明细">
            <Table>
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr><Th>营销活动</Th><Th>预算科目</Th><Th>预算部门</Th><Th>费用类型</Th><Th>店铺</Th><Th>品牌</Th><Th>渠道</Th><Th>扣款金额</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {adForm.lines.map((line) => <tr key={line.id}><Td>{line.activity}</Td><Td>{line.budgetSubject}</Td><Td>{line.budgetDepartment}</Td><Td>{line.expenseType}</Td><Td>{line.store}</Td><Td>{line.brand}</Td><Td>{line.channel}</Td><Td align="right">{formatMoney(line.deductionAmount)}</Td></tr>)}
              </tbody>
            </Table>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setAdForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitAdRecon} disabled={adForm.status === "已审批"}>提交审批</Button>
            <Button variant="secondary" onClick={rejectAdRecon} disabled={adForm.status !== "审批中"}>审批驳回</Button>
            <Button onClick={approveAdRecon} disabled={adForm.status !== "审批中"}>审批通过并回写</Button>
          </ModalActions>
        </Modal>
      )}

      {supplierForm && (
        <Modal title={`${supplierForm.code} 供应商对账单`} onClose={() => setSupplierForm(null)} size="xl">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="核算主体" value={supplierForm.accountingEntity} />
            <ReadOnly label="供应商" value={supplierForm.supplier} />
            <ReadOnly label="合同编号" value={supplierForm.contractCode} />
            <ReadOnly label="状态" value={<StatusBadge status={supplierForm.status} />} />
            <ReadOnly label="结算金额合计" value={formatMoney(supplierForm.settlementTotal)} />
            <ReadOnly label="差异金额合计" value={<Money value={supplierForm.differenceTotal} />} />
            <ReadOnly label="是否有预提" value={supplierForm.hasAccrual ? "是" : "否"} />
            <ReadOnly label="凭证号" value={supplierForm.voucherNo || "-"} />
          </div>
          <Section title="供应商结算明细">
            {errors.lines && <Alert>{errors.lines}</Alert>}
            <Table>
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr><Th>期间</Th><Th>预估费用</Th><Th>结算金额</Th><Th>差异金额</Th><Th>差异原因</Th><Th>结果</Th><Th>预算科目</Th><Th>费用类型</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {supplierForm.lines.map((line) => (
                  <tr key={line.id}>
                    <Td>{line.startDate} ~ {line.endDate}</Td>
                    <Td align="right">{formatMoney(line.estimateAmount)}</Td>
                    <Td align="right"><Input value={String(line.settlementAmount)} onChange={(value) => patchSupplierLine(line.id, Number(value) || 0, line.differenceReason)} disabled={supplierForm.status === "已审批"} /></Td>
                    <Td align="right"><Money value={line.differenceAmount} /></Td>
                    <Td><Input value={line.differenceReason} onChange={(value) => patchSupplierLine(line.id, line.settlementAmount, value)} disabled={supplierForm.status === "已审批"} /></Td>
                    <Td><StatusBadge status={line.result} /></Td>
                    <Td>{line.budgetSubject}</Td>
                    <Td>{line.expenseType}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setSupplierForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitSupplierRecon} disabled={supplierForm.status === "已审批"}>提交审批</Button>
            <Button onClick={approveSupplierRecon} disabled={supplierForm.status !== "审批中"}>审批通过并生成待到票</Button>
          </ModalActions>
        </Modal>
      )}

      {fundForm && (
        <Modal title={`${fundForm.code} 资金账单结算单`} onClose={() => setFundForm(null)} size="xl">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={syncOmsBills}>模拟同步 OMS 资金账单</Button>
            <StatusBadge status={fundForm.syncStatus} />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="核算主体" value={fundForm.accountingEntity} />
            <ReadOnly label="供应商" value={fundForm.supplier} />
            <ReadOnly label="数据来源" value={fundForm.dataSource} />
            <ReadOnly label="状态" value={<StatusBadge status={fundForm.status} />} />
            <ReadOnly label="合同编号" value={fundForm.contractCode} />
            <ReadOnly label="入账日期" value={fundForm.entryDate} />
            <ReadOnly label="凭证号" value={fundForm.voucherNo || "-"} />
            <ReadOnly label="入账金额合计" value={formatMoney(sum(fundForm.lines.map((item) => item.entryAmount)))} />
          </div>
          {errors.lines && <Alert>{errors.lines}</Alert>}
          <Section title="资金账单项明细">
            <Table>
              <thead className="bg-slate-50 text-left text-xs text-slate-600">
                <tr><Th>费用日期</Th><Th>支出金额</Th><Th>入账金额</Th><Th>OMS 大类</Th><Th>OMS 业务小类</Th><Th>预算科目</Th><Th>收款账号</Th><Th>规则命中</Th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {fundForm.lines.map((line) => <tr key={line.id}><Td>{line.feeDate}</Td><Td align="right">{formatMoney(line.expenseAmount)}</Td><Td align="right">{formatMoney(line.entryAmount)}</Td><Td><SourceTag source="OMS" /> {line.omsCategory}</Td><Td>{line.omsSubCategory}</Td><Td>{line.budgetSubject}</Td><Td>{line.receivingAccount}</Td><Td><StatusBadge status={line.ruleHit} /></Td></tr>)}
              </tbody>
            </Table>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setFundForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitFundSettlement} disabled={fundForm.status === "已审批"}>提交审批</Button>
            <Button onClick={approveFundSettlement} disabled={fundForm.status !== "审批中"}>审批通过并入账</Button>
          </ModalActions>
        </Modal>
      )}

      {accrualForm && (
        <Modal title={`${accrualForm.code} 费用预提单`} onClose={() => setAccrualForm(null)} size="xl">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="核算主体" value={accrualForm.accountingEntity} />
            <ReadOnly label="申请人" value={accrualForm.applicant} />
            <ReadOnly label="状态" value={<StatusBadge status={accrualForm.status} />} />
            <ReadOnly label="预提金额合计" value={formatMoney(accrualForm.accrualTotal)} />
          </div>
          {errors.lines && <Alert>{errors.lines}</Alert>}
          <Section title="预提汇总">
            <AccrualLinesTable rows={accrualForm.lines} />
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setAccrualForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitAccrualForm} disabled={accrualForm.status === "已审批"}>提交审批</Button>
            <Button onClick={approveAccrualForm} disabled={accrualForm.status !== "审批中"}>审批通过并插入台账</Button>
          </ModalActions>
        </Modal>
      )}

      {amortizationForm && (
        <Modal title={`${amortizationForm.code} 费用摊销单`} onClose={() => setAmortizationForm(null)} size="xl">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="核算主体" value={amortizationForm.accountingEntity} />
            <ReadOnly label="摊销月份" value={amortizationForm.amortizationMonth} />
            <ReadOnly label="状态" value={<StatusBadge status={amortizationForm.status} />} />
            <ReadOnly label="本月摊销金额合计" value={formatMoney(amortizationForm.totalAmount)} />
          </div>
          {errors.lines && <Alert>{errors.lines}</Alert>}
          <Section title="合同摊销费用明细">
            <Table>
              <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>合同编号</Th><Th>供应商</Th><Th>摊销期间</Th><Th>日摊销额</Th><Th>本月天数</Th><Th>本月摊销金额</Th><Th>预算科目</Th><Th>品牌</Th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {amortizationForm.lines.map((line) => <tr key={line.id}><Td>{line.contractCode}</Td><Td>{line.supplier}</Td><Td>{line.amortizationStart} ~ {line.amortizationEnd}</Td><Td align="right">{formatMoney(line.dailyAmortization)}</Td><Td align="right">{line.currentMonthDays}</Td><Td align="right">{formatMoney(line.currentMonthAmount)}</Td><Td>{line.budgetSubject}</Td><Td>{line.brand}</Td></tr>)}
              </tbody>
            </Table>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setAmortizationForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitAmortizationForm} disabled={amortizationForm.status === "已审批"}>提交审批</Button>
            <Button onClick={approveAmortizationForm} disabled={amortizationForm.status !== "审批中"}>审批通过并摊销入账</Button>
          </ModalActions>
        </Modal>
      )}

      {detail && <DetailDrawer detail={detail} onClose={() => setDetail(null)} />}
      {overlayLoading && <LoadingMask text={overlayLoading} full />}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function Workbench({ sourceLedgers, pendingInvoices, onOpenSource, onAd, onSupplier, onFund, onAccrual, onAmortization, onRetry }: { sourceLedgers: SourceLedger[]; pendingInvoices: PendingInvoice[]; onOpenSource: (row: SourceLedger) => void; onAd: () => void; onSupplier: () => void; onFund: () => void; onAccrual: () => void; onAmortization: () => void; onRetry: () => void }) {
  const exceptions = sourceLedgers.filter((item) => item.syncStatus === "同步失败" || item.entryStatus === "入账失败" || item.differenceAmount !== 0);
  const pendingTasks = [
    { title: "待投放对账", count: sourceLedgers.filter((item) => item.sourceType === "投放费用预估" && !item.reconciled).length, action: "生成对账单", onClick: onAd },
    { title: "待供应商对账", count: sourceLedgers.filter((item) => ["单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType) && !item.reconciled).length, action: "生成供应商对账", onClick: onSupplier },
    { title: "待资金入账", count: sourceLedgers.filter((item) => item.sourceType === "平台扣款费用" && item.entryStatus !== "已入账").length, action: "同步 OMS", onClick: onFund },
    { title: "待费用预提", count: sourceLedgers.filter((item) => ["单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType) && !item.accrued).length, action: "生成预提单", onClick: onAccrual },
    { title: "待合同摊销", count: sourceLedgers.filter((item) => item.sourceType === "合同摊销费用" && item.amortizationStatus !== "已摊销").length, action: "生成摊销单", onClick: onAmortization }
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5">
        {pendingTasks.map((item) => (
          <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-slate-500">{item.title}</div>
            <div className="mt-2 text-2xl font-semibold">{item.count}</div>
            <button className="mt-3 text-sm font-medium text-blue-600 hover:underline" onClick={item.onClick}>{item.action}</button>
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="差异与同步异常" extra={<Button size="sm" variant="secondary" onClick={onRetry}>重新同步</Button>}>
          <Table>
            <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>来源单号</Th><Th>类型</Th><Th>供应商</Th><Th>金额</Th><Th>差异/原因</Th><Th>状态</Th><Th>操作</Th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {exceptions.slice(0, 6).map((row) => (
                <tr key={row.id}>
                  <Td>{row.code}</Td><Td>{row.sourceType}</Td><Td>{row.supplier}</Td><Td align="right">{formatMoney(row.amount)}</Td>
                  <Td><Money value={row.differenceAmount} /> <div className="text-xs text-slate-400">{row.failureReason ?? row.differenceReason ?? "-"}</div></Td>
                  <Td><StatusBadge status={row.syncStatus === "同步失败" ? "同步失败" : row.reconciliationResult ?? "有差异"} /></Td>
                  <Td><button className="text-blue-600 hover:underline" onClick={() => onOpenSource(row)}>详情</button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
        <Section title="待到票 / 无票结果">
          <Table>
            <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>来源单号</Th><Th>供应商</Th><Th>合同编号</Th><Th>费用类型</Th><Th>金额</Th><Th>发票状态</Th></tr></thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {pendingInvoices.slice(0, 6).map((row) => <tr key={row.id}><Td>{row.sourceCode}</Td><Td>{row.supplier}</Td><Td>{row.contractCode}</Td><Td>{row.expenseType}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td><StatusBadge status={row.invoiceStatus} /></Td></tr>)}
            </tbody>
          </Table>
        </Section>
      </div>
    </div>
  );
}

function AdReconTable({ rows, onDetail, onEdit, onCreate, onReset }: { rows: AdReconForm[]; onDetail: (row: AdReconForm) => void; onEdit: (row: AdReconForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无投放自动对账单" description="来源数据可能已完成对账，可重置筛选或生成新的投放自动对账单。" action="生成对账单" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>供应商</Th><Th>合同编号</Th><Th>对账日期</Th><Th>差异金额</Th><Th>对账结果</Th><Th>同步状态</Th><Th>状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.supplier}</Td><Td>{row.contractCode}</Td><Td>{row.reconciliationDate}</Td><Td align="right"><Money value={row.differenceAmount} /></Td><Td><StatusBadge status={mainReconResult(row.lines)} /></Td><Td><StatusBadge status={row.syncStatus} /></Td><Td><StatusBadge status={row.status} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button></InlineActions></Td></tr>)}
      </tbody>
    </Table>
  );
}

function SupplierReconTable({ rows, onDetail, onEdit, onCreate, onReset }: { rows: SupplierReconForm[]; onDetail: (row: SupplierReconForm) => void; onEdit: (row: SupplierReconForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无供应商对账单" description="选择供应商、合同和期间后，可自动带出预提明细并生成对账单。" action="生成供应商对账单" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>供应商</Th><Th>合同编号</Th><Th>结算金额合计</Th><Th>差异金额合计</Th><Th>是否有预提</Th><Th>凭证号</Th><Th>状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.supplier}</Td><Td>{row.contractCode}</Td><Td align="right">{formatMoney(row.settlementTotal)}</Td><Td align="right"><Money value={row.differenceTotal} /></Td><Td>{row.hasAccrual ? "是" : "否"}</Td><Td>{row.voucherNo || "-"}</Td><Td><StatusBadge status={row.status} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button></InlineActions></Td></tr>)}
      </tbody>
    </Table>
  );
}

function FundSettlementTable({ rows, onDetail, onEdit, onCreate, onReset }: { rows: FundSettlementForm[]; onDetail: (row: FundSettlementForm) => void; onEdit: (row: FundSettlementForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无资金账单结算单" description="点击模拟同步 OMS，从平台扣款费用台账生成资金账单结算明细。" action="模拟同步 OMS" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>供应商</Th><Th>数据来源</Th><Th>入账日期</Th><Th>入账金额</Th><Th>同步状态</Th><Th>凭证号</Th><Th>状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.supplier}</Td><Td>{row.dataSource}</Td><Td>{row.entryDate}</Td><Td align="right">{formatMoney(sum(row.lines.map((item) => item.entryAmount)))}</Td><Td><StatusBadge status={row.syncStatus} /></Td><Td>{row.voucherNo || "-"}</Td><Td><StatusBadge status={row.status} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button></InlineActions></Td></tr>)}
      </tbody>
    </Table>
  );
}

function AccrualFormTable({ rows, onDetail, onEdit, onCreate, onReset }: { rows: ExpenseAccrualForm[]; onDetail: (row: ExpenseAccrualForm) => void; onEdit: (row: ExpenseAccrualForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无费用预提单" description="选择未预提的单次执行、佣金或直播费用预估记录生成预提单。" action="生成预提单" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>核算主体</Th><Th>预提金额合计</Th><Th>明细数</Th><Th>凭证号</Th><Th>状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.accountingEntity}</Td><Td align="right">{formatMoney(row.accrualTotal)}</Td><Td>{row.lines.length}</Td><Td>{row.voucherNo || "-"}</Td><Td><StatusBadge status={row.status} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button></InlineActions></Td></tr>)}
      </tbody>
    </Table>
  );
}

function AmortizationFormTable({ rows, onDetail, onEdit, onCreate, onReset }: { rows: ExpenseAmortizationForm[]; onDetail: (row: ExpenseAmortizationForm) => void; onEdit: (row: ExpenseAmortizationForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无费用摊销单" description="选择摊销中的合同，按摊销月份计算本月摊销金额。" action="生成摊销单" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>核算主体</Th><Th>摊销月份</Th><Th>本月摊销金额</Th><Th>合同数</Th><Th>凭证号</Th><Th>状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.accountingEntity}</Td><Td>{row.amortizationMonth}</Td><Td align="right">{formatMoney(row.totalAmount)}</Td><Td>{row.lines.length}</Td><Td>{row.voucherNo || "-"}</Td><Td><StatusBadge status={row.status} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button></InlineActions></Td></tr>)}
      </tbody>
    </Table>
  );
}

function AccrualLedgerTable({ rows, onDetail, onReset, onExport }: { rows: ExpenseAccrualLedger[]; onDetail: (row: ExpenseAccrualLedger) => void; onReset: () => void; onExport: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无费用预提台账记录" description="费用预提单审批通过后，会自动插入预提台账。" action="导出模拟" onAction={onExport} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>单据编号</Th><Th>预提月份</Th><Th>供应商</Th><Th>预算科目</Th><Th>预提金额</Th><Th>是否对账</Th><Th>是否冲销</Th><Th>对账单号</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((row) => <tr key={row.id}><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.month}</Td><Td>{row.supplier}</Td><Td>{row.budgetSubject}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td><StatusBadge status={row.reconciled ? "已对账" : "未对账"} /></Td><Td><StatusBadge status={row.reversed ? "已冲销" : "未冲销"} /></Td><Td>{row.reconciliationCode || "-"}</Td><Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(row)}>详情</button></Td></tr>)}
      </tbody>
    </Table>
  );
}

function AccrualLinesTable({ rows }: { rows: ExpenseAccrualLine[] }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><Th>预估台账</Th><Th>费用日期</Th><Th>供应商</Th><Th>营销活动</Th><Th>预算科目</Th><Th>费用类型</Th><Th>预估费用</Th><Th>预提金额</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((line) => <tr key={line.id}><Td>{line.sourceLedger}</Td><Td>{line.feeDate}</Td><Td>{line.supplier}</Td><Td>{line.activity}</Td><Td>{line.budgetSubject}</Td><Td>{line.expenseType}</Td><Td align="right">{formatMoney(line.estimateAmount)}</Td><Td align="right">{formatMoney(line.accrualAmount)}</Td></tr>)}
      </tbody>
    </Table>
  );
}

function DetailDrawer({ detail, onClose }: { detail: DetailData; onClose: () => void }) {
  const title = detail.type === "ad" ? "投放自动对账单详情" : detail.type === "supplier" ? "供应商对账单详情" : detail.type === "fund" ? "资金账单结算单详情" : detail.type === "accrualForm" ? "费用预提单详情" : detail.type === "amortizationForm" ? "费用摊销单详情" : detail.type === "source" ? "来源台账详情" : "费用预提台账详情";
  const record = detail.row;
  const logs = "logs" in record ? record.logs : [];
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full overflow-y-auto bg-white p-5 shadow-xl md:w-[760px]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">对账/入账结果抽屉</div>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={onClose}>关闭</button>
        </div>
        <DetailGrid rows={detailRows(detail)} />
        {"lines" in record && Array.isArray(record.lines) && (
          <Section title="明细摘要">
            <div className="text-sm text-slate-500">明细行数：{record.lines.length}；金额合计：{formatMoney(sum(record.lines.map((line) => lineAmount(line))))}</div>
          </Section>
        )}
        <Section title="操作日志">
          <RecordList rows={logs} />
        </Section>
      </aside>
    </div>
  );
}

function FiltersBar({ filters, suppliers, accountingEntities, onChange, onReset }: { filters: Filters; suppliers: string[]; accountingEntities: string[]; onChange: (patch: Partial<Filters>) => void; onReset: () => void }) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-5">
      <Field label="单据编号/供应商/合同"><Input value={filters.keyword} onChange={(keyword) => onChange({ keyword })} placeholder="输入关键字" /></Field>
      <Field label="核算主体"><Select value={filters.accountingEntity} onChange={(accountingEntity) => onChange({ accountingEntity })} options={["全部", ...accountingEntities]} /></Field>
      <Field label="供应商"><Select value={filters.supplier} onChange={(supplier) => onChange({ supplier })} options={["全部", ...suppliers]} /></Field>
      <Field label="状态"><Select value={filters.status} onChange={(status) => onChange({ status })} options={["全部", "草稿", "审批中", "已审批", "已驳回", "同步失败", "未对账", "已对账", "未冲销", "已冲销"]} /></Field>
      <div className="flex items-end gap-2"><Button variant="secondary" onClick={onReset}>重置</Button></div>
    </div>
  );
}

function buildSource(input: Partial<SourceLedger> & Pick<SourceLedger, "id" | "code" | "sourceType" | "supplier" | "contractCode" | "contractName" | "feeDate" | "month" | "marketingPlan" | "planCategory" | "activity" | "budgetSubject" | "budgetDepartment" | "expenseType" | "store" | "brand" | "channel" | "amount" | "estimateAmount" | "actualAmount">): SourceLedger {
  return {
    accountingEntity: "上海示例贸易有限公司",
    reconciled: false,
    differenceAmount: input.actualAmount - input.estimateAmount,
    accrued: false,
    accruedAmount: 0,
    entryStatus: "未入账",
    amortizationStatus: "未摊销",
    bookedAmount: 0,
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    logs: baseLogs,
    ...input
  };
}

function buildAdForm(code: string, sources: SourceLedger[], status: DocumentStatus): AdReconForm {
  const lines = sources.map((source, index): AdReconLine => {
    const differenceAmount = source.actualAmount - source.estimateAmount;
    return {
      id: `${code}-line-${index}`,
      sourceId: source.id,
      rechargeAccount: source.rechargeAccount ?? "-",
      adAccount: source.adAccount ?? "-",
      feeDate: source.feeDate,
      cashConsume: source.actualAmount,
      estimatedCash: source.estimateAmount,
      accountConsume: source.actualAmount,
      deductionAmount: source.actualAmount,
      differenceAmount,
      differenceReason: differenceAmount === 0 ? "" : source.differenceReason ?? "",
      result: source.syncStatus === "同步失败" ? "对账失败" : Math.abs(differenceAmount) < 0.01 ? "一致" : "有差异",
      businessOwner: "赵敏",
      financeOwner: "王悦",
      activity: source.activity,
      budgetSubject: source.budgetSubject,
      budgetDepartment: source.budgetDepartment,
      expenseType: source.expenseType,
      store: source.store,
      brand: source.brand,
      channel: source.channel
    };
  });
  const first = sources[0];
  return {
    id: `ad-${code}`,
    code,
    applicant,
    applyDate: today,
    applicantOrg,
    accountingEntity: first?.accountingEntity ?? "上海示例贸易有限公司",
    supplier: first?.supplier ?? "小红书聚光",
    contractCode: first?.contractCode ?? "YXHT-2026-188",
    reconciliationDate: today,
    status,
    approvalStatus: status,
    differenceAmount: sum(lines.map((item) => item.differenceAmount)),
    description: "系统按充值账户、投放账户和费用日期自动匹配现金消耗与系统预估。",
    syncStatus: sources.some((item) => item.syncStatus === "同步失败") ? "同步失败" : "同步成功",
    lastSyncAt: nowText,
    failureReason: sources.find((item) => item.failureReason)?.failureReason,
    lines,
    approvals: status === "草稿" ? [] : baseApprovals,
    logs: baseLogs
  };
}

function buildSupplierForm(code: string, sources: SourceLedger[], status: DocumentStatus): SupplierReconForm {
  const lines = sources.map((source, index): SupplierReconLine => {
    const settlementAmount = source.actualAmount || source.estimateAmount;
    const differenceAmount = settlementAmount - source.estimateAmount;
    return {
      id: `${code}-line-${index}`,
      sourceId: source.id,
      startDate: source.feeDate,
      endDate: source.feeDate,
      estimateAmount: source.estimateAmount,
      settlementAmount,
      differenceAmount,
      differenceReason: differenceAmount === 0 ? "" : source.differenceReason ?? "",
      result: Math.abs(differenceAmount) < 0.01 ? "一致" : "有差异",
      accrualCode: source.accrued ? `YTTZ-${source.code}` : "-",
      poCode: source.code,
      feeDate: source.feeDate,
      activity: source.activity,
      budgetSubject: source.budgetSubject,
      budgetDepartment: source.budgetDepartment,
      expenseType: source.expenseType,
      store: source.store,
      brand: source.brand,
      channel: source.channel
    };
  });
  const first = sources[0];
  return {
    id: `supplier-${code}`,
    code,
    applicant,
    applyDate: today,
    accountingEntity: first?.accountingEntity ?? "上海示例贸易有限公司",
    supplier: first?.supplier ?? "杭州星图传媒有限公司",
    contractCode: first?.contractCode ?? "YXHT-2026-213",
    reconciliationDate: today,
    hasAccrual: sources.some((item) => item.accrued),
    settlementTotal: sum(lines.map((item) => item.settlementAmount)),
    differenceTotal: sum(lines.map((item) => item.differenceAmount)),
    status,
    voucherNo: "",
    description: "按供应商、合同与期间汇总预估费用、结算金额和差异。",
    lines,
    approvals: status === "草稿" ? [] : baseApprovals,
    logs: baseLogs
  };
}

function buildFundForm(code: string, sources: SourceLedger[], status: DocumentStatus): FundSettlementForm {
  const lines = sources.map((source, index): FundBillLine => ({
    id: `${code}-line-${index}`,
    sourceId: source.id,
    feeDate: source.feeDate,
    expenseAmount: source.actualAmount,
    entryAmount: source.actualAmount,
    omsCategory: source.omsCategory ?? "费用项",
    omsSubCategory: source.omsSubCategory ?? source.expenseType,
    planCategory: source.planCategory,
    activity: source.activity,
    budgetSubject: source.budgetSubject,
    budgetDepartment: source.budgetDepartment,
    expenseType: source.expenseType,
    store: source.store,
    brand: source.brand,
    channel: source.channel,
    receivingAccount: source.receivingAccount ?? "-",
    relationKey: source.code,
    ruleHit: source.allowNoInvoice ? "无票核销" : "生成待到票"
  }));
  const first = sources[0];
  return {
    id: `fund-${code}`,
    code,
    applicant,
    applyDate: today,
    accountingEntity: first?.accountingEntity ?? "上海示例贸易有限公司",
    supplier: first?.supplier ?? "京东平台",
    dataSource: "[OMS] 资金账单",
    contractCode: first?.contractCode ?? "PTXY-2026-031",
    entryDate: today,
    status,
    voucherNo: "",
    syncStatus: "未同步",
    lastSyncAt: "-",
    lines,
    approvals: status === "草稿" ? [] : baseApprovals,
    logs: baseLogs
  };
}

function buildAccrualForm(code: string, sources: SourceLedger[], status: DocumentStatus): ExpenseAccrualForm {
  const lines = sources.map((source, index): ExpenseAccrualLine => ({
    id: `${code}-line-${index}`,
    sourceId: source.id,
    sourceLedger: source.code,
    feeDate: source.feeDate,
    estimateAmount: source.estimateAmount,
    accrualAmount: source.estimateAmount,
    supplier: source.supplier,
    activity: source.activity,
    budgetSubject: source.budgetSubject,
    budgetDepartment: source.budgetDepartment,
    expenseType: source.expenseType,
    store: source.store,
    brand: source.brand,
    channel: source.channel,
    accountingSubject: accountSubject(source.budgetSubject)
  }));
  return {
    id: `accrual-${code}`,
    code,
    applicant,
    applyDate: today,
    accountingEntity: sources[0]?.accountingEntity ?? "上海示例贸易有限公司",
    status,
    voucherNo: status === "已审批" ? "PZ-202605-0101" : "",
    accrualTotal: sum(lines.map((item) => item.accrualAmount)),
    lines,
    approvals: status === "草稿" ? [] : baseApprovals,
    logs: baseLogs
  };
}

function buildAmortizationForm(code: string, sources: SourceLedger[], status: DocumentStatus): ExpenseAmortizationForm {
  const lines = sources.map((source, index): AmortizationLine => {
    const days = source.currentMonthDays ?? 31;
    const daily = source.dailyAmortization ?? source.actualAmount / days;
    return {
      id: `${code}-line-${index}`,
      sourceId: source.id,
      contractCode: source.contractCode,
      supplier: source.supplier,
      amortizationStart: source.amortizationStart ?? "2026-01-01",
      amortizationEnd: source.amortizationEnd ?? "2026-12-31",
      dailyAmortization: daily,
      currentMonthDays: days,
      currentMonthAmount: roundMoney(daily * days),
      budgetSubject: source.budgetSubject,
      budgetDepartment: source.budgetDepartment,
      expenseType: source.expenseType,
      accountingSubject: accountSubject(source.budgetSubject),
      brand: source.brand
    };
  });
  return {
    id: `amort-${code}`,
    code,
    applicant,
    applyDate: today,
    accountingEntity: sources[0]?.accountingEntity ?? "上海示例贸易有限公司",
    amortizationMonth: "2026-05",
    status,
    voucherNo: "",
    totalAmount: sum(lines.map((item) => item.currentMonthAmount)),
    lines,
    approvals: status === "草稿" ? [] : baseApprovals,
    logs: baseLogs
  };
}

function buildAccrualLedger(code: string, source: SourceLedger, sourceCode: string, reconciled: boolean, reversed: boolean, voucherNo = "PZ-202605-0101", amount = source.accruedAmount || source.estimateAmount): ExpenseAccrualLedger {
  return {
    id: `ledger-${code}`,
    code,
    sourceCode,
    month: source.month,
    amount,
    accountingEntity: source.accountingEntity,
    supplier: source.supplier,
    budgetSubject: source.budgetSubject,
    budgetDepartment: source.budgetDepartment,
    store: source.store,
    brand: source.brand,
    channel: source.channel,
    accountingSubject: accountSubject(source.budgetSubject),
    reconciled,
    reversed,
    reconciliationCode: reconciled ? "GYS-DZ-2026-0419-001" : "",
    voucherNo,
    logs: baseLogs
  };
}

function buildStats(sourceLedgers: SourceLedger[], adForms: AdReconForm[], supplierForms: SupplierReconForm[], fundForms: FundSettlementForm[], accrualLedger: ExpenseAccrualLedger[]) {
  const settlementAmount = sum(supplierForms.map((item) => item.settlementTotal)) + sum(fundForms.map((item) => sum(item.lines.map((line) => line.entryAmount))));
  const diffAmount = sum(adForms.map((item) => item.differenceAmount)) + sum(supplierForms.map((item) => item.differenceTotal));
  return [
    { label: "本月结算金额", value: formatMoney(settlementAmount), sub: "供应商对账 + 资金入账" },
    { label: "差异金额", value: formatMoney(diffAmount), sub: "需补充差异原因" },
    { label: "待对账", value: String(sourceLedgers.filter((item) => !item.reconciled && ["投放费用预估", "单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType)).length), sub: "来源预估台账" },
    { label: "待预提", value: String(sourceLedgers.filter((item) => !item.accrued && ["单次执行费用预估", "佣金费用预估", "直播费用预估"].includes(item.sourceType)).length), sub: "费用预估转预提" },
    { label: "待摊销", value: String(sourceLedgers.filter((item) => item.sourceType === "合同摊销费用" && item.amortizationStatus !== "已摊销").length), sub: "合同摊销台账" },
    { label: "同步失败", value: String(sourceLedgers.filter((item) => item.syncStatus === "同步失败").length), sub: `预提台账 ${accrualLedger.length} 条` }
  ];
}

function validateDifferenceLines(lines: Array<{ differenceAmount: number; differenceReason: string }>) {
  const nextErrors: Record<string, string> = {};
  if (lines.length === 0) nextErrors.lines = "来源数据已变更或已完成处理，请重置筛选后重新选择。";
  if (lines.some((line) => Math.abs(line.differenceAmount) > 0.01 && !line.differenceReason.trim())) nextErrors.lines = "差异金额不为 0 的明细必须填写差异原因。";
  return nextErrors;
}

function filterDocuments<T extends { code: string; supplier?: string; accountingEntity: string; status: string; contractCode?: string }>(rows: T[], filters: Filters) {
  return rows.filter((row) => {
    const text = `${row.code} ${row.supplier ?? ""} ${row.contractCode ?? ""}`.toLowerCase();
    const statusMatch = filters.status === "全部" || row.status === filters.status || (filters.status === "同步失败" && "syncStatus" in row && row.syncStatus === "同步失败");
    return (!filters.keyword || text.includes(filters.keyword.toLowerCase())) && match(filters.accountingEntity, row.accountingEntity) && match(filters.supplier, row.supplier ?? "") && statusMatch;
  });
}

function filterAccrualLedger(rows: ExpenseAccrualLedger[], filters: Filters) {
  return rows.filter((row) => {
    const text = `${row.code} ${row.supplier} ${row.sourceCode}`.toLowerCase();
    const statusMatch = filters.status === "全部" || (filters.status === "已对账" && row.reconciled) || (filters.status === "未对账" && !row.reconciled) || (filters.status === "已冲销" && row.reversed) || (filters.status === "未冲销" && !row.reversed);
    return (!filters.keyword || text.includes(filters.keyword.toLowerCase())) && match(filters.accountingEntity, row.accountingEntity) && match(filters.supplier, row.supplier) && statusMatch;
  });
}

function detailRows(detail: DetailData): Array<[string, ReactNode]> {
  if (detail.type === "source") {
    const row = detail.row;
    return [["来源单号", row.code], ["来源类型", row.sourceType], ["核算主体", row.accountingEntity], ["供应商", row.supplier], ["合同编号", row.contractCode], ["营销活动", row.activity], ["金额", formatMoney(row.amount)], ["是否对账", row.reconciled ? "是" : "否"], ["是否预提", row.accrued ? "是" : "否"], ["入账状态", <StatusBadge key="entry" status={row.entryStatus} />], ["同步状态", <StatusBadge key="sync" status={row.syncStatus} />], ["失败原因", row.failureReason ?? "-"]];
  }
  if (detail.type === "accrualLedger") {
    const row = detail.row;
    return [["单据编号", row.code], ["预提月份", row.month], ["核算主体", row.accountingEntity], ["供应商", row.supplier], ["预算科目", row.budgetSubject], ["预提金额", formatMoney(row.amount)], ["是否对账", row.reconciled ? "是" : "否"], ["是否冲销", row.reversed ? "是" : "否"], ["对账单号", row.reconciliationCode || "-"], ["凭证号", row.voucherNo]];
  }
  const row = detail.row;
  if ("voucherNo" in row) {
    return [["单据编号", row.code], ["核算主体", row.accountingEntity], ["供应商", "supplier" in row ? row.supplier : "-"], ["状态", <StatusBadge key="status" status={row.status} />], ["申请日期", row.applyDate], ["凭证号", row.voucherNo || "-"]];
  }
  return [["单据编号", row.code], ["核算主体", row.accountingEntity], ["状态", <StatusBadge key="status" status={row.status} />], ["申请日期", row.applyDate]];
}

function lineAmount(line: unknown) {
  if (typeof line !== "object" || line === null) return 0;
  const item = line as Record<string, unknown>;
  return Number(item.entryAmount ?? item.accrualAmount ?? item.currentMonthAmount ?? item.settlementAmount ?? item.cashConsume ?? 0);
}

function viewTitle(view: ViewMode) {
  return viewTabs.find((item) => item.key === view)?.label ?? "费用对账结算";
}

function accountSubject(subject: string) {
  if (subject.includes("佣金")) return "销售费用-佣金";
  if (subject.includes("直播")) return "销售费用-直播推广";
  if (subject.includes("平台")) return "销售费用-平台服务费";
  return "销售费用-市场推广费";
}

function mainReconResult(lines: Array<{ result: ReconResult }>) {
  if (lines.some((line) => line.result === "对账失败")) return "对账失败";
  if (lines.some((line) => line.result === "有差异")) return "有差异";
  if (lines.length === 0) return "待确认";
  return "一致";
}

function upsertByCode<T extends { code: string }>(rows: T[], next: T) {
  return rows.some((row) => row.code === next.code) ? rows.map((row) => row.code === next.code ? next : row) : [next, ...rows];
}

function match(filter: string, value: string) {
  return filter === "全部" || value === filter;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function nextVoucher(prefix: string) {
  return `${prefix}-202605-${String(Date.now()).slice(-4)}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function Money({ value }: { value: number }) {
  return <span className={`font-medium tabular-nums ${value > 0 ? "text-red-600" : value < 0 ? "text-orange-600" : "text-slate-700"}`}>{formatMoney(value)}</span>;
}

function SourceTag({ source }: { source: string }) {
  return <span className="mr-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500">[{source}]</span>;
}

function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full divide-y divide-slate-200">{children}</table>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <td className={`whitespace-nowrap px-3 py-3 ${align === "right" ? "text-right tabular-nums" : ""}`}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 text-sm text-blue-600 [&>button:hover]:underline">{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; size?: "sm" | "md"; disabled?: boolean }) {
  const base = "rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";
  const variants = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
  return <button className={`${base} ${sizes} ${variants}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Field({ label, children, required, error }: { label: string; children: ReactNode; required?: boolean; error?: string }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-slate-500">{required && <span className="text-red-500">*</span>}{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </label>
  );
}

function Input({ value, onChange, placeholder = "", disabled = false }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return <input className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function ReadOnly({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-md border border-slate-200 bg-slate-50 p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 min-h-5 text-sm font-medium text-slate-800">{value || "-"}</div></div>;
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="text-sm text-slate-500">{label}</div><div className="mt-2 text-xl font-semibold tabular-nums">{value}</div><div className="mt-1 text-xs text-slate-400">{sub}</div></div>;
}

function StatusBadge({ status }: { status: string }) {
  let cls = "border-slate-200 bg-slate-100 text-slate-600";
  if (["审批中", "同步中", "入账中", "摊销中", "对账中", "待确认"].includes(status)) cls = "border-blue-200 bg-blue-50 text-blue-600";
  if (["已审批", "审批通过", "同步成功", "已对账", "一致", "已入账", "已预提", "已摊销", "已无票核销", "生成待到票", "已到票"].includes(status)) cls = "border-green-200 bg-green-50 text-green-600";
  if (["有差异", "已驳回", "未冲销", "未对账"].includes(status)) cls = "border-orange-200 bg-orange-50 text-orange-600";
  if (["同步失败", "对账失败", "入账失败", "摊销失败", "预提失败"].includes(status)) cls = "border-red-200 bg-red-50 text-red-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <div className="grid gap-3 md:grid-cols-3">{rows.map(([label, value]) => <ReadOnly key={label} label={label} value={value} />)}</div>;
}

function Section({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  return <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2>{extra}</div>{children}</section>;
}

function Modal({ title, children, onClose, size = "lg" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" | "xl" }) {
  const widths = size === "xl" ? "max-w-6xl" : size === "lg" ? "max-w-4xl" : "max-w-2xl";
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className={`my-6 w-full ${widths} rounded-lg bg-white p-5 shadow-xl`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">{children}</div>;
}

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" | "blue" }) {
  const cls = tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : tone === "orange" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`mb-4 rounded-lg border p-4 text-sm ${cls}`}>{children}</div>;
}

function LoadingMask({ text, full = false }: { text: string; full?: boolean }) {
  return <div className={`${full ? "fixed inset-0 z-50 bg-black/30" : "absolute inset-0 z-10 bg-white/70"} flex items-center justify-center`}><div className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow"><span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />{text}</div></div>;
}

function EmptyState({ title, description, action, onAction, onReset }: { title: string; description: string; action: string; onAction: () => void; onReset: () => void }) {
  return <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><div className="text-lg font-semibold">{title}</div><div className="mt-2 max-w-lg text-sm text-slate-500">{description}</div><div className="mt-4 flex gap-2"><Button onClick={onAction}>{action}</Button><Button variant="secondary" onClick={onReset}>重置筛选</Button></div></div>;
}

function RecordList({ rows }: { rows: OperationLog[] }) {
  if (rows.length === 0) return <div className="text-sm text-slate-500">暂无操作日志</div>;
  return <div className="space-y-2">{rows.map((row, index) => <div key={`${row.time}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{row.action}</span><span className="text-slate-400">{row.time}</span></div><div className="mt-1 text-slate-500">{row.operator}：{row.comment}</div></div>)}</div>;
}
