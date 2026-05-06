"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type ViewMode = "workbench" | "amortization" | "single" | "ad" | "live" | "platform" | "agency";
type AccrualStatus = "未预提" | "预提中" | "已预提" | "无需预提" | "预提失败";
type ReconStatus = "未对账" | "对账中" | "已对账" | "差异待处理" | "已关闭";
type ReconResult = "一致" | "有差异" | "待确认";
type AmortizationStatus = "待摊销" | "摊销中" | "已摊销完毕" | "已中止" | "已终止";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type EntryStatus = "未入账" | "入账中" | "已入账" | "入账失败";
type GenerateStatus = "未生成" | "生成中" | "生成成功" | "生成失败" | "待调整" | "已重新生成";
type EstimateKind = "投放费用预估" | "直播费用预估" | "单次执行费用预估" | "合同摊销费用" | "平台扣款费用";

interface OperationLog {
  time: string;
  operator: string;
  action: string;
  comment: string;
}

interface EstimateBase {
  id: string;
  code: string;
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  contractName: string;
  feeDate: string;
  planCategory: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  expenseMajor: string;
  expenseMinor: string;
  firstBudgetSubject: string;
  store: string;
  brand: string;
  channel: string;
  dataSource: string;
  relationKey: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  logs: OperationLog[];
}

interface ReconFields {
  accrualStatus: AccrualStatus;
  accruedAmount: number;
  accrualCode: string;
  reconStatus: ReconStatus;
  reconDate: string;
  reconAmount: number;
  differenceAmount: number;
  differenceReason: string;
  reconResult: ReconResult;
  settlementCode: string;
}

interface ContractAmortization extends EstimateBase {
  contractSignedAt: string;
  contractStartAt: string;
  contractEndAt: string;
  contractAmount: number;
  amortizationTotal: number;
  amortizationStartAt: string;
  amortizationEndAt: string;
  dailyAmortization: number;
  amortizedAmount: number;
  remainingAmount: number;
  latestAmortizationAt: string;
  amortizationStatus: AmortizationStatus;
  amortizationType: "按日摊销" | "按月摊销" | "一次性摊销";
  bookedAmount: number;
  stopReason?: string;
}

interface SingleExecutionEstimate extends EstimateBase, ReconFields {
  poType: "达人 PO" | "合同 PO";
  taskId: string;
  orderAmount: number;
  contractDiscount: number;
  estimateAmount: number;
  talentId: string;
  talentName: string;
  adAccount: string;
  orderMethod: string;
  orderChannel: string;
  sourcePoCode: string;
  syncedToMatter: boolean;
}

interface AdSpendEstimate extends EstimateBase, ReconFields {
  adAccount: string;
  rechargeAccount: string;
  marketingPlan: string;
  deliveryMethod: string;
  cashConsume: number;
  discountRate: number;
  estimateAmount: number;
  adjustedEstimateAmount: number;
  deductionAmount: number;
  taxRate: number;
  owner: string;
  generateStatus: GenerateStatus;
}

interface LiveEstimate extends EstimateBase, ReconFields {
  talentName: string;
  liveTalentName: string;
  marketingPlan: string;
  paidOrderAmount: number;
  onlineCommission: number;
  offlineCommission: number;
  offlineCommissionRate: number;
  slotFee: number;
  estimateAmount: number;
  businessSource: string;
  businessUnit: string;
  taxRate: number;
  generateStatus: GenerateStatus;
}

interface PlatformDeduction extends EstimateBase {
  expenseAmount: number;
  omsCategory: string;
  omsSubCategory: string;
  sceneDescription: string;
  platform: string;
  receivingAccount: string;
  entryStatus: EntryStatus;
  entryCode: string;
  accruedAmount: number;
  problemRecord: string;
  ruleCode: string;
  ruleName: string;
  billColumn: string;
  matchValue: string;
  hasInvoice: "有票" | "完全无票" | "部分有票";
  needInvoiceFollow: boolean;
  pendingInvoiceCode: string;
}

interface AgencyOperationData {
  id: string;
  code: string;
  scenario: "代运营直播" | "得物销售额";
  channel: string;
  businessSource: string;
  liveRoomName: string;
  liveRoomId: string;
  businessDate: string;
  gmv: number;
  income: number;
  planCategory: string;
  activity: string;
  budgetDepartment: string;
  budgetSubject: string;
  expenseMinor: string;
  store: string;
  brand: string;
  contractCode: string;
  supplier: string;
  generateStatus: GenerateStatus;
  generatedEstimateCode: string;
  logs: OperationLog[];
}

type DetailData =
  | { type: "amortization"; row: ContractAmortization }
  | { type: "single"; row: SingleExecutionEstimate }
  | { type: "ad"; row: AdSpendEstimate }
  | { type: "live"; row: LiveEstimate }
  | { type: "platform"; row: PlatformDeduction }
  | { type: "agency"; row: AgencyOperationData };

type ReconcileTarget =
  | { type: "single"; row: SingleExecutionEstimate }
  | { type: "ad"; row: AdSpendEstimate }
  | { type: "live"; row: LiveEstimate };

interface Filters {
  keyword: string;
  accountingEntity: string;
  supplier: string;
  feeMinor: string;
  activity: string;
  accrualStatus: string;
  reconStatus: string;
  syncStatus: string;
  amortizationStatus: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const baseLogs: OperationLog[] = [{ time: nowText, operator: "系统模拟", action: "初始化", comment: "由内置 mock 数据生成，未连接真实 OMS、RPA、合同系统或数仓。" }];
const initialFilters: Filters = { keyword: "", accountingEntity: "全部", supplier: "全部", feeMinor: "全部", activity: "全部", accrualStatus: "全部", reconStatus: "全部", syncStatus: "全部", amortizationStatus: "全部" };

const initialAmortizations: ContractAmortization[] = [
  {
    id: "amo-001",
    code: "TXFY-2026-0501-001",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海星动整合营销有限公司",
    contractCode: "YXHT-2026-001",
    contractName: "品牌年度框架合作合同",
    feeDate: "2026-05-01",
    contractSignedAt: "2026-01-01",
    contractStartAt: "2026-01-01",
    contractEndAt: "2026-12-31",
    contractAmount: 1200000,
    amortizationTotal: 1132075.47,
    amortizationStartAt: "2026-01-01",
    amortizationEndAt: "2026-12-31",
    dailyAmortization: 3101.58,
    amortizedAmount: 390799.08,
    remainingAmount: 741276.39,
    latestAmortizationAt: today,
    amortizationStatus: "摊销中",
    amortizationType: "按日摊销",
    planCategory: "品牌整合",
    activity: "2026 年度品牌整合营销",
    budgetDepartment: "品牌营销部",
    budgetSubject: "品牌推广费",
    expenseMajor: "销售费用",
    expenseMinor: "品牌整合服务费",
    firstBudgetSubject: "市场推广费",
    store: "全渠道",
    brand: "示例品牌",
    channel: "全渠道",
    bookedAmount: 390799.08,
    dataSource: "合同系统",
    relationKey: "CONTRACT-STRUCT-001",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    logs: baseLogs
  },
  {
    id: "amo-002",
    code: "TXFY-2026-0501-002",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "杭州星图传媒有限公司",
    contractCode: "YXHT-2026-213",
    contractName: "抖音达人内容执行合同",
    feeDate: "2026-05-01",
    contractSignedAt: "2026-03-12",
    contractStartAt: "2026-04-01",
    contractEndAt: "2026-06-30",
    contractAmount: 360000,
    amortizationTotal: 339622.64,
    amortizationStartAt: "2026-04-01",
    amortizationEndAt: "2026-06-30",
    dailyAmortization: 3732.12,
    amortizedAmount: 134356.32,
    remainingAmount: 205266.32,
    latestAmortizationAt: today,
    amortizationStatus: "摊销中",
    amortizationType: "按日摊销",
    planCategory: "达人内容",
    activity: "抖音达人内容执行",
    budgetDepartment: "内容营销部",
    budgetSubject: "达人推广费",
    expenseMajor: "销售费用",
    expenseMinor: "达人服务费",
    firstBudgetSubject: "内容推广费",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    bookedAmount: 134356.32,
    dataSource: "合同 PO",
    relationKey: "PO-DY-202604-017",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    logs: baseLogs
  },
  {
    id: "amo-003",
    code: "TXFY-2026-0501-003",
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "广州蓝海广告有限公司",
    contractCode: "YXHT-2025-278",
    contractName: "天猫站内资源包年度协议",
    feeDate: "2026-05-01",
    contractSignedAt: "2025-11-20",
    contractStartAt: "2025-12-01",
    contractEndAt: "2026-04-30",
    contractAmount: 520000,
    amortizationTotal: 490566.04,
    amortizationStartAt: "2025-12-01",
    amortizationEndAt: "2026-04-30",
    dailyAmortization: 3248.78,
    amortizedAmount: 490566.04,
    remainingAmount: 0,
    latestAmortizationAt: "2026-04-30",
    amortizationStatus: "已摊销完毕",
    amortizationType: "按日摊销",
    planCategory: "站内推广",
    activity: "天猫日销放量",
    budgetDepartment: "电商运营部",
    budgetSubject: "效果广告费",
    expenseMajor: "销售费用",
    expenseMinor: "直通车",
    firstBudgetSubject: "效果广告费",
    store: "天猫官方旗舰店",
    brand: "示例品牌",
    channel: "天猫",
    bookedAmount: 490566.04,
    dataSource: "合同系统",
    relationKey: "CONTRACT-STRUCT-278",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    logs: baseLogs
  },
  {
    id: "amo-004",
    code: "TXFY-2026-0501-004",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "北京媒介采买有限公司",
    contractCode: "YXHT-2026-112",
    contractName: "户外媒体投放框架合同",
    feeDate: "2026-05-01",
    contractSignedAt: "2026-02-15",
    contractStartAt: "2026-03-01",
    contractEndAt: "2026-08-31",
    contractAmount: 880000,
    amortizationTotal: 830188.68,
    amortizationStartAt: "2026-03-01",
    amortizationEndAt: "2026-08-31",
    dailyAmortization: 4511.89,
    amortizedAmount: 202512.77,
    remainingAmount: 627675.91,
    latestAmortizationAt: "2026-04-15",
    amortizationStatus: "已中止",
    amortizationType: "按日摊销",
    planCategory: "线下投放",
    activity: "城市核心商圈户外投放",
    budgetDepartment: "品牌营销部",
    budgetSubject: "线下广告费",
    expenseMajor: "销售费用",
    expenseMinor: "户外广告费",
    firstBudgetSubject: "市场推广费",
    store: "线下渠道",
    brand: "示例品牌",
    channel: "线下",
    bookedAmount: 202512.77,
    dataSource: "合同系统",
    relationKey: "CONTRACT-STRUCT-112",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    stopReason: "投放城市排期暂停，待业务确认后恢复。",
    logs: [{ time: "2026-04-15 18:20:00", operator: "李想", action: "中止摊销", comment: "投放城市排期暂停，剩余金额暂不继续摊销。" }, ...baseLogs]
  }
];

const initialSingleEstimates: SingleExecutionEstimate[] = [
  buildSingle({ id: "single-001", code: "DZYX-2026-0505-001", supplier: "杭州星图传媒有限公司", contractCode: "YXHT-2026-213", contractName: "抖音达人内容执行合同", taskId: "TASK-DY-0512-8831", talentId: "dy_88127", talentName: "夏天同学", sourcePoCode: "DRPO-2026-0505-001", orderAmount: 80000, discount: 0.8125, reconAmount: 66500, reason: "追加一条短视频授权", status: "未预提" }),
  buildSingle({ id: "single-002", code: "DZYX-2026-0504-002", supplier: "上海青橙直播服务有限公司", contractCode: "YXHT-2026-216", contractName: "达人直播坑位与佣金合同", taskId: "TASK-LIVE-520-02", talentId: "dy_52066", talentName: "橙子直播间", sourcePoCode: "ZBPO-2026-0504-002", orderAmount: 42000, discount: 1, reconAmount: 42000, reason: "", status: "已预提" }),
  buildSingle({ id: "single-003", code: "DZYX-2026-0502-003", supplier: "广州蓝海广告有限公司", contractCode: "YXHT-2026-188", contractName: "小红书 618 种草投放合同", taskId: "TASK-XHS-618-09", talentId: "xhs_10293", talentName: "护肤研究员 Nina", sourcePoCode: "DRPO-2026-0502-003", orderAmount: 50000, discount: 0.9, reconAmount: 45000, reason: "", status: "未预提" }),
  buildSingle({ id: "single-004", code: "DZYX-2026-0501-004", supplier: "北京媒介采买有限公司", contractCode: "YXHT-2026-112", contractName: "户外媒体投放框架合同", taskId: "TASK-OOH-0501", talentId: "-", talentName: "-", sourcePoCode: "HTPO-2026-0501-004", orderAmount: 120000, discount: 0.95, reconAmount: 0, reason: "待供应商回传执行证明", status: "无需预提" })
];

const initialAdEstimates: AdSpendEstimate[] = [
  buildAd({ id: "ad-001", code: "TFYG-2026-0501-001", supplier: "小红书聚光", contractCode: "YXHT-2026-188", account: "xhs_flow_618", recharge: "XHS-CZ-2026-01", activity: "小红书 618 种草投放", cash: 100000, discount: 0.9, deduction: 92000, reconAmount: 92000, reason: "平台返点延迟入账", status: "未预提" }),
  buildAd({ id: "ad-002", code: "TFYG-2026-0502-002", supplier: "阿里妈妈", contractCode: "YXHT-2026-098", account: "tm_ztc_daily", recharge: "TM-CZ-2026-02", activity: "天猫直通车日销", cash: 58000, discount: 1, deduction: 58000, reconAmount: 58000, reason: "", status: "已预提" }),
  buildAd({ id: "ad-003", code: "TFYG-2026-0504-003", supplier: "巨量引擎", contractCode: "YXHT-2026-201", account: "dy_live_qianchuan", recharge: "DY-CZ-2026-03", activity: "抖音直播自投", cash: 76000, discount: 1, deduction: 0, reconAmount: 0, reason: "投放账户与充值账户不匹配", status: "未预提", syncStatus: "同步失败", failureReason: "标准账单转换失败：投放账户 dy_live_qianchuan 未匹配到充值账户。同步批次 RPA-20260506-003" }),
  buildAd({ id: "ad-004", code: "TFYG-2026-0505-004", supplier: "快手磁力金牛", contractCode: "YXHT-2026-207", account: "ks_magnet_520", recharge: "KS-CZ-2026-05", activity: "快手 520 短视频放量", cash: 45000, discount: 0.92, deduction: 41400, reconAmount: 0, reason: "", status: "未预提" })
];

const initialLiveEstimates: LiveEstimate[] = [
  buildLive({ id: "live-001", code: "ZBYG-2026-0503-001", supplier: "上海青橙直播服务有限公司", contractCode: "YXHT-2026-216", talent: "橙子妈妈", liveTalent: "橙子直播间", paid: 500000, online: 35000, offlineRate: 0.02, slot: 20000, recon: 65000, reason: "", status: "未预提" }),
  buildLive({ id: "live-002", code: "ZBYG-2026-0503-002", supplier: "精选联盟", contractCode: "PTXY-2026-052", talent: "精选联盟达人", liveTalent: "联盟分销直播间", paid: 420000, online: 31500, offlineRate: 0, slot: 0, recon: 31500, reason: "", status: "已预提" }),
  buildLive({ id: "live-003", code: "ZBYG-2026-0504-003", supplier: "杭州星图传媒有限公司", contractCode: "YXHT-2026-213", talent: "夏天同学", liveTalent: "夏天护肤专场", paid: 260000, online: 18200, offlineRate: 0.015, slot: 12000, recon: 34100, reason: "", status: "未预提" }),
  buildLive({ id: "live-004", code: "ZBYG-2026-0505-004", supplier: "达人系统待匹配", contractCode: "YXHT-2026-216", talent: "ID 缺失", liveTalent: "未识别直播间", paid: 180000, online: 12600, offlineRate: 0.01, slot: 8000, recon: 0, reason: "达人 ID 缺失，待业务补充", status: "预提失败", syncStatus: "同步失败", failureReason: "达人账单缺少达人 ID，无法匹配合同佣金比例。" })
];

const initialPlatformDeductions: PlatformDeduction[] = [
  buildPlatform({ id: "plat-001", code: "PTKK-2026-0501-001", platform: "京东商城", supplier: "京东平台", store: "京东官方旗舰店", sub: "平台技术服务费", scene: "平台技术服务费", amount: 42000, rule: "JD-A002-003-001", hasInvoice: "有票", follow: true, pending: "DDP-202605-0012" }),
  buildPlatform({ id: "plat-002", code: "PTKK-2026-0502-002", platform: "京东商城", supplier: "京东平台", store: "京东官方旗舰店", sub: "站内推广费-京挑客", scene: "京挑客推广", amount: 18000, rule: "JD-A002-005-001", hasInvoice: "完全无票", follow: false, pending: "" }),
  buildPlatform({ id: "plat-003", code: "PTKK-2026-0503-003", platform: "拼多多", supplier: "拼多多平台", store: "拼多多旗舰店", sub: "赔付支出", scene: "退货运费补偿", amount: 6800, rule: "PDD-A002-009-002", hasInvoice: "完全无票", follow: false, pending: "" }),
  buildPlatform({ id: "plat-004", code: "PTKK-2026-0504-004", platform: "抖音小店", supplier: "抖音小店", store: "抖音官方旗舰店", sub: "达人直播佣金", scene: "订单结算-佣金", amount: 22600, rule: "DY-A001-001-007", hasInvoice: "部分有票", follow: true, pending: "", problem: "供应商映射未确认，待匹配达人机构。" })
];

const initialAgencyData: AgencyOperationData[] = [
  buildAgency({ id: "agency-001", code: "DYYW-2026-0501-001", scenario: "代运营直播", channel: "抖音", source: "直播间 GMV", room: "示例品牌官方直播间", date: "2026-05-01", gmv: 860000, income: 0, contract: "YXHT-2026-216", supplier: "上海青橙直播服务有限公司" }),
  buildAgency({ id: "agency-002", code: "DYYW-2026-0502-002", scenario: "代运营直播", channel: "快手", source: "退前 GMV", room: "快手官方直播间", date: "2026-05-02", gmv: 520000, income: 0, contract: "YXHT-2026-207", supplier: "快手代运营服务商" }),
  buildAgency({ id: "agency-003", code: "DYYW-2026-0503-003", scenario: "得物销售额", channel: "得物", source: "实收收入", room: "-", date: "2026-05-03", gmv: 0, income: 380000, contract: "YXHT-2026-301", supplier: "得物代运营服务商" }),
  buildAgency({ id: "agency-004", code: "DYYW-2026-0504-004", scenario: "代运营直播", channel: "抖音", source: "直播间 GMV", room: "520 护肤专场", date: "2026-05-04", gmv: 680000, income: 0, contract: "YXHT-2026-216", supplier: "上海青橙直播服务有限公司" })
];

export default function FeeEstimationPage() {
  const [view, setView] = useState<ViewMode>("workbench");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [importKind, setImportKind] = useState<EstimateKind | null>(null);
  const [reconcileTarget, setReconcileTarget] = useState<ReconcileTarget | null>(null);
  const [stopTarget, setStopTarget] = useState<{ row: ContractAmortization; action: "中止摊销" | "终止摊销" } | null>(null);
  const [generationResult, setGenerationResult] = useState<{ title: string; logs: OperationLog[]; problems: string[] } | null>(null);

  const [amortizations, setAmortizations] = useState(initialAmortizations);
  const [singleEstimates, setSingleEstimates] = useState(initialSingleEstimates);
  const [adEstimates, setAdEstimates] = useState(initialAdEstimates);
  const [liveEstimates, setLiveEstimates] = useState(initialLiveEstimates);
  const [platformDeductions, setPlatformDeductions] = useState(initialPlatformDeductions);
  const [agencyData, setAgencyData] = useState(initialAgencyData);

  const filteredAmortizations = useMemo(() => filterAmortizations(amortizations, filters), [amortizations, filters]);
  const filteredSingles = useMemo(() => filterEstimateRows(singleEstimates, filters), [singleEstimates, filters]);
  const filteredAds = useMemo(() => filterEstimateRows(adEstimates, filters), [adEstimates, filters]);
  const filteredLives = useMemo(() => filterEstimateRows(liveEstimates, filters), [liveEstimates, filters]);
  const filteredPlatforms = useMemo(() => filterPlatforms(platformDeductions, filters), [platformDeductions, filters]);
  const filteredAgency = useMemo(() => filterAgency(agencyData, filters), [agencyData, filters]);

  const allSuppliers = unique([...amortizations.map((item) => item.supplier), ...singleEstimates.map((item) => item.supplier), ...adEstimates.map((item) => item.supplier), ...liveEstimates.map((item) => item.supplier), ...platformDeductions.map((item) => item.supplier), ...agencyData.map((item) => item.supplier)]);
  const allAccountingEntities = unique([...amortizations.map((item) => item.accountingEntity), ...singleEstimates.map((item) => item.accountingEntity), ...adEstimates.map((item) => item.accountingEntity), ...liveEstimates.map((item) => item.accountingEntity), ...platformDeductions.map((item) => item.accountingEntity)]);
  const allFeeMinors = unique([...amortizations.map((item) => item.expenseMinor), ...singleEstimates.map((item) => item.expenseMinor), ...adEstimates.map((item) => item.expenseMinor), ...liveEstimates.map((item) => item.expenseMinor), ...platformDeductions.map((item) => item.expenseMinor), ...agencyData.map((item) => item.expenseMinor)]);
  const allActivities = unique([...amortizations.map((item) => item.activity), ...singleEstimates.map((item) => item.activity), ...adEstimates.map((item) => item.activity), ...liveEstimates.map((item) => item.activity), ...platformDeductions.map((item) => item.activity), ...agencyData.map((item) => item.activity)]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function runQuery() {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (filters.keyword.trim().toUpperCase() === "ERROR") {
        setPageError("模拟接口异常：费用预估台账查询超时 [504]。请点击重试或重置筛选。");
      } else {
        setPageError("");
      }
    }, 600);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 400);
  }

  function mockError() {
    setPageError("模拟转换失败：投放计划未匹配，影刀机器人批次 RPA-20260506-003 已暂停。");
  }

  function exportMock() {
    showToast(`已生成 ${viewTitle(view)} 导出任务，文件不会真实落盘。`);
  }

  function accrue(type: "single" | "ad" | "live", row: SingleExecutionEstimate | AdSpendEstimate | LiveEstimate) {
    if (row.accrualStatus === "已预提" || row.accrualStatus === "无需预提") {
      showToast("该记录当前不允许重复预提。");
      return;
    }
    const code = nextCode("YT");
    const next = { ...row, accrualStatus: "已预提" as AccrualStatus, accruedAmount: estimateAmountOf(row), accrualCode: code, logs: prependLog(row.logs, "生成预提单", `已模拟生成费用预提单 ${code}，金额 ${formatMoney(estimateAmountOf(row))}。`) };
    if (type === "single") setSingleEstimates((rows) => replaceById(rows, next as SingleExecutionEstimate));
    if (type === "ad") setAdEstimates((rows) => replaceById(rows, next as AdSpendEstimate));
    if (type === "live") setLiveEstimates((rows) => replaceById(rows, next as LiveEstimate));
    showToast(`已回写预提单号 ${code}`);
  }

  function retryConversion(row: AdSpendEstimate | LiveEstimate) {
    setLoading(true);
    window.setTimeout(() => {
      if ("adAccount" in row) {
        setAdEstimates((rows) => replaceById(rows, { ...row, syncStatus: "同步成功", failureReason: undefined, generateStatus: "已重新生成", deductionAmount: row.adjustedEstimateAmount, logs: prependLog(row.logs, "重新转换", "已补充投放账户映射并重新生成投放费用预估。") }));
      } else {
        setLiveEstimates((rows) => replaceById(rows, { ...row, syncStatus: "同步成功", failureReason: undefined, generateStatus: "已重新生成", logs: prependLog(row.logs, "重新转换", "已补充达人 ID 并重新匹配佣金比例。") }));
      }
      setLoading(false);
      showToast("重新转换成功，失败原因已清除。");
    }, 700);
  }

  function syncOms() {
    setLoading(true);
    window.setTimeout(() => {
      setPlatformDeductions((rows) => rows.map((row) => row.id === "plat-004" ? { ...row, problemRecord: "", supplier: "精选联盟", pendingInvoiceCode: "DDP-202605-0017", syncStatus: "同步成功", logs: prependLog(row.logs, "模拟同步 OMS", "已命中 DY-A001-001-007，生成待到票记录 DDP-202605-0017。") } : row));
      setLoading(false);
      showToast("OMS 资金账单已模拟同步，异常记录已重新匹配规则。");
    }, 800);
  }

  function generateFromAgency(row: AgencyOperationData) {
    const estimateCode = nextCode(row.scenario === "得物销售额" ? "DZYX" : "ZBYG");
    setAgencyData((rows) => replaceById(rows, { ...row, generateStatus: "生成成功", generatedEstimateCode: estimateCode, logs: prependLog(row.logs, "生成预估", `已根据 ${row.businessSource} 生成费用预估 ${estimateCode}。`) }));
    if (row.scenario === "得物销售额") {
      setSingleEstimates((rows) => [
        buildSingle({ id: `single-${Date.now()}`, code: estimateCode, supplier: row.supplier, contractCode: row.contractCode, contractName: "得物代运营销售服务合同", taskId: row.code, talentId: "-", talentName: "得物代运营", sourcePoCode: row.code, orderAmount: row.income * 0.08, discount: 1, reconAmount: 0, reason: "", status: "未预提" }),
        ...rows
      ]);
    } else {
      setLiveEstimates((rows) => [
        buildLive({ id: `live-${Date.now()}`, code: estimateCode, supplier: row.supplier, contractCode: row.contractCode, talent: row.liveRoomName, liveTalent: row.liveRoomName, paid: row.gmv, online: roundMoney(row.gmv * 0.045), offlineRate: 0, slot: 0, recon: 0, reason: "", status: "未预提" }),
        ...rows
      ]);
    }
    showToast(`已生成预估记录 ${estimateCode}`);
  }

  function confirmImport(kind: EstimateKind) {
    setImportKind(null);
    setLoading(true);
    window.setTimeout(() => {
      const code = nextCode(kind === "合同摊销费用" ? "TXFY" : kind === "投放费用预估" ? "TFYG" : kind === "直播费用预估" ? "ZBYG" : kind === "平台扣款费用" ? "PTKK" : "DZYX");
      if (kind === "投放费用预估") {
        const row = buildAd({ id: `ad-${Date.now()}`, code, supplier: "小红书聚光", contractCode: "YXHT-2026-188", account: "xhs_new_618", recharge: "XHS-CZ-2026-06", activity: "小红书 618 新品加推", cash: 88000, discount: 0.9, deduction: 79200, reconAmount: 0, reason: "", status: "未预提" });
        setAdEstimates((rows) => [row, ...rows]);
        setGenerationResult(buildGenerationResult("投放账单导入结果", ["RPA 账单读取成功", "标准业务账单转换成功", "按投放账号和活动汇总生成投放费用预估"], []));
      }
      if (kind === "直播费用预估") {
        const row = buildLive({ id: `live-${Date.now()}`, code, supplier: "精选联盟", contractCode: "PTXY-2026-052", talent: "联盟达人 A", liveTalent: "新品直播专场", paid: 360000, online: 25200, offlineRate: 0.01, slot: 10000, recon: 0, reason: "", status: "未预提" });
        setLiveEstimates((rows) => [row, ...rows]);
        setGenerationResult(buildGenerationResult("佣金账单导入结果", ["达人 ID 匹配成功", "合同佣金比例命中", "线上佣金、线下佣金和坑位费已汇总"], []));
      }
      if (kind === "单次执行费用预估") {
        const row = buildSingle({ id: `single-${Date.now()}`, code, supplier: "杭州星图传媒有限公司", contractCode: "YXHT-2026-213", contractName: "抖音达人内容执行合同", taskId: "TASK-DY-NEW", talentId: "dy_new_01", talentName: "新品体验官", sourcePoCode: "DRPO-2026-0506-009", orderAmount: 72000, discount: 0.88, reconAmount: 0, reason: "", status: "未预提" });
        setSingleEstimates((rows) => [row, ...rows]);
        setGenerationResult(buildGenerationResult("合同 PO 生成结果", ["读取达人 PO 执行单", "带出合同折扣 88%", "按下单金额乘合同折扣生成预估费用"], []));
      }
      if (kind === "合同摊销费用") {
        const row: ContractAmortization = { ...initialAmortizations[0], id: `amo-${Date.now()}`, code, contractCode: "YXHT-2026-330", contractName: "抖音全年直播资源包合同", supplier: "巨量引擎", contractAmount: 960000, amortizationTotal: 905660.38, dailyAmortization: 2470.38, amortizedAmount: 0, remainingAmount: 905660.38, amortizationStatus: "待摊销", relationKey: "CONTRACT-STRUCT-330", logs: prependLog(baseLogs, "生成摊销台账", "模拟合同结构化复核通过，生成待摊销记录。") };
        setAmortizations((rows) => [row, ...rows]);
        setGenerationResult(buildGenerationResult("合同摊销生成结果", ["同步合同结构化信息", "财务复核摊销规则", "按合同期间计算日摊销金额"], []));
      }
      if (kind === "平台扣款费用") {
        const row = buildPlatform({ id: `plat-${Date.now()}`, code, platform: "抖音小店", supplier: "抖音小店", store: "抖音官方旗舰店", sub: "平台技术服务费", scene: "订单结算-平台服务费", amount: 19600, rule: "DY-A001-001-006", hasInvoice: "有票", follow: true, pending: nextCode("DDP") });
        setPlatformDeductions((rows) => [row, ...rows]);
        setGenerationResult(buildGenerationResult("OMS 同步解析结果", ["OMS 按天推送资金账单", "规则 DY-A001-001-006 命中", "已模拟写入待到票台账"], []));
      }
      setLoading(false);
      showToast(`${kind}已生成。`);
    }, 900);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <DemoModuleNav active="fee-estimation" title="费用预估" />
        <main className="min-w-0 flex-1 p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div>
              <div className="text-sm text-slate-500">费用预估 / {viewTitle(view)}</div>
              <h1 className="mt-1 text-2xl font-semibold">费用预估模块</h1>
              <p className="mt-1 text-sm text-slate-500">演示来源数据同步、标准账单转换、预估生成、预提、对账、摊销和待到票回写。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setImportKind("合同摊销费用")}>同步合同结构化</Button>
              <Button variant="secondary" onClick={exportMock}>导出模拟</Button>
              <Button onClick={() => setImportKind("投放费用预估")}>模拟同步账单</Button>
            </div>
          </div>

          <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex min-w-max gap-1">
              {viewTabs.map((item) => (
                <button key={item.key} className={`rounded-md px-3 py-2 text-sm font-medium ${view === item.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setView(item.key)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {pageError && (
            <Alert>
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="font-medium text-red-700 underline" onClick={runQuery}>重试</button>
              </div>
            </Alert>
          )}

          {view === "workbench" ? (
            <Workbench
              amortizations={amortizations}
              singles={singleEstimates}
              ads={adEstimates}
              lives={liveEstimates}
              platforms={platformDeductions}
              agencyData={agencyData}
              onView={setView}
              onImport={setImportKind}
              onSyncOms={syncOms}
            />
          ) : (
            <Section title={`${viewTitle(view)}查询`} extra={<StatusBadge status="前端 mock" />}>
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                suppliers={allSuppliers}
                accountingEntities={allAccountingEntities}
                feeMinors={allFeeMinors}
                activities={allActivities}
                view={view}
                onQuery={runQuery}
                onReset={resetFilters}
                onMockError={mockError}
              />
            </Section>
          )}

          {view === "amortization" && (
            <Section title="合同摊销费用台账" extra={<Button size="sm" onClick={() => setImportKind("合同摊销费用")}>生成摊销</Button>}>
              <TableWrap loading={loading}>
                <AmortizationTable rows={filteredAmortizations} onDetail={(row) => setDetail({ type: "amortization", row })} onStop={(row, action) => setStopTarget({ row, action })} />
                {filteredAmortizations.length === 0 && <EmptyState title="未找到合同摊销记录" description="本月尚未同步合同结构化信息，或筛选条件过窄。" action="同步合同结构化" onAction={() => setImportKind("合同摊销费用")} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}

          {view === "single" && (
            <Section title="单次执行费用预估台账" extra={<Button size="sm" onClick={() => setImportKind("单次执行费用预估")}>从 PO 生成</Button>}>
              <TableWrap loading={loading}>
                <SingleTable rows={filteredSingles} onDetail={(row) => setDetail({ type: "single", row })} onAccrue={(row) => accrue("single", row)} onReconcile={(row) => setReconcileTarget({ type: "single", row })} />
                {filteredSingles.length === 0 && <EmptyState title="未找到单次执行预估" description="可从合同 PO 或达人 PO 执行单模拟生成。" action="从 PO 生成" onAction={() => setImportKind("单次执行费用预估")} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}

          {view === "ad" && (
            <Section title="投放费用预估台账" extra={<Button size="sm" onClick={() => setImportKind("投放费用预估")}>导入 RPA 账单</Button>}>
              <TableWrap loading={loading}>
                <AdTable rows={filteredAds} onDetail={(row) => setDetail({ type: "ad", row })} onAccrue={(row) => accrue("ad", row)} onReconcile={(row) => setReconcileTarget({ type: "ad", row })} onRetry={retryConversion} />
                {filteredAds.length === 0 && <EmptyState title="本月尚未同步投放账单" description="点击顶部按钮模拟影刀机器人解析账单并生成预估。" action="导入 RPA 账单" onAction={() => setImportKind("投放费用预估")} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}

          {view === "live" && (
            <Section title="直播费用预估台账" extra={<Button size="sm" onClick={() => setImportKind("直播费用预估")}>导入佣金账单</Button>}>
              <TableWrap loading={loading}>
                <LiveTable rows={filteredLives} onDetail={(row) => setDetail({ type: "live", row })} onAccrue={(row) => accrue("live", row)} onReconcile={(row) => setReconcileTarget({ type: "live", row })} onRetry={retryConversion} />
                {filteredLives.length === 0 && <EmptyState title="未找到直播佣金预估" description="可模拟导入达人或直播佣金账单生成。" action="导入佣金账单" onAction={() => setImportKind("直播费用预估")} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}

          {view === "platform" && (
            <Section title="平台扣款费用台账" extra={<div className="flex gap-2"><Button size="sm" variant="secondary" onClick={syncOms}>模拟同步 OMS</Button><Button size="sm" onClick={() => setImportKind("平台扣款费用")}>解析资金账单</Button></div>}>
              <TableWrap loading={loading}>
                <PlatformTable rows={filteredPlatforms} onDetail={(row) => setDetail({ type: "platform", row })} onReceipt={(row) => {
                  const code = row.pendingInvoiceCode || nextCode("DDP");
                  setPlatformDeductions((rows) => replaceById(rows, { ...row, pendingInvoiceCode: code, entryStatus: "已入账", entryCode: nextCode("RZ"), logs: prependLog(row.logs, "生成待到票", `已模拟写入待到票台账 ${code}。`) }));
                  showToast(`已生成待到票 ${code}`);
                }} />
                {filteredPlatforms.length === 0 && <EmptyState title="没有平台扣款记录" description="可模拟 OMS 推送资金账单并命中规则。" action="同步 OMS" onAction={() => setImportKind("平台扣款费用")} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}

          {view === "agency" && (
            <Section title="代运营业务数据台账" extra={<Button size="sm" onClick={exportMock}>导出模拟</Button>}>
              <TableWrap loading={loading}>
                <AgencyTable rows={filteredAgency} onDetail={(row) => setDetail({ type: "agency", row })} onGenerate={generateFromAgency} />
                {filteredAgency.length === 0 && <EmptyState title="未找到代运营业务数据" description="可重置筛选查看得物销售额和直播 GMV 样例。" action="重置筛选" onAction={resetFilters} onReset={resetFilters} />}
              </TableWrap>
            </Section>
          )}
        </main>
      </div>

      {loading && <LoadingMask text="正在执行 mock 操作..." full />}
      {toast && <Toast message={toast} />}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
      {importKind && <ImportModal kind={importKind} setKind={setImportKind} onClose={() => setImportKind(null)} onConfirm={confirmImport} />}
      {reconcileTarget && <ReconcileModal target={reconcileTarget} onClose={() => setReconcileTarget(null)} onSave={(next) => {
        if (next.type === "single") setSingleEstimates((rows) => replaceById(rows, next.row));
        if (next.type === "ad") setAdEstimates((rows) => replaceById(rows, next.row));
        if (next.type === "live") setLiveEstimates((rows) => replaceById(rows, next.row));
        setReconcileTarget(null);
        showToast(`已保存对账结果：${next.row.reconResult}`);
      }} />}
      {stopTarget && <StopAmortizationModal target={stopTarget} onClose={() => setStopTarget(null)} onSave={(row) => {
        setAmortizations((rows) => replaceById(rows, row));
        setStopTarget(null);
        showToast(`${row.contractCode} 已更新为 ${row.amortizationStatus}`);
      }} />}
      {generationResult && <GenerationDrawer result={generationResult} onClose={() => setGenerationResult(null)} />}
    </div>
  );
}

function Workbench({ amortizations, singles, ads, lives, platforms, agencyData, onView, onImport, onSyncOms }: { amortizations: ContractAmortization[]; singles: SingleExecutionEstimate[]; ads: AdSpendEstimate[]; lives: LiveEstimate[]; platforms: PlatformDeduction[]; agencyData: AgencyOperationData[]; onView: (view: ViewMode) => void; onImport: (kind: EstimateKind) => void; onSyncOms: () => void }) {
  const estimateTotal = sum([...singles.map(estimateAmountOf), ...ads.map(estimateAmountOf), ...lives.map(estimateAmountOf), ...platforms.map((item) => item.expenseAmount)]);
  const accruedTotal = sum([...singles.map((item) => item.accruedAmount), ...ads.map((item) => item.accruedAmount), ...lives.map((item) => item.accruedAmount), ...platforms.map((item) => item.accruedAmount)]);
  const reconTotal = sum([...singles.map((item) => item.reconAmount), ...ads.map((item) => item.reconAmount), ...lives.map((item) => item.reconAmount)]);
  const diffTotal = sum([...singles.map((item) => item.differenceAmount), ...ads.map((item) => item.differenceAmount), ...lives.map((item) => item.differenceAmount)]);
  const failedRows = [...ads.filter((item) => item.syncStatus === "同步失败"), ...lives.filter((item) => item.syncStatus === "同步失败"), ...platforms.filter((item) => item.problemRecord)];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="本月预估费用" value={formatMoney(estimateTotal)} sub="投放、直播、单次执行、平台扣款" />
        <SummaryCard label="已预提金额" value={formatMoney(accruedTotal)} sub="已回写预提单号" />
        <SummaryCard label="待预提记录" value={String([...singles, ...ads, ...lives].filter((item) => item.accrualStatus === "未预提").length)} sub="可合并生成预提单" />
        <SummaryCard label="已对账金额" value={formatMoney(reconTotal)} sub="供应商对账模拟结果" />
        <SummaryCard label="差异金额" value={formatMoney(diffTotal)} sub="需补充差异原因" />
        <SummaryCard label="同步/转换异常" value={String(failedRows.length)} sub="规则未命中或来源缺失" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Section title="生成入口" extra={<StatusBadge status="演示闭环" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <WorkbenchAction title="投放账单导入" desc="影刀 RPA 解析投放账单，转换标准账单并生成投放费用预估。" onClick={() => onImport("投放费用预估")} />
            <WorkbenchAction title="佣金账单导入" desc="匹配达人 ID、合同编号和佣金比例，生成直播费用预估。" onClick={() => onImport("直播费用预估")} />
            <WorkbenchAction title="合同 PO 生成" desc="从合同 PO 或达人 PO 自动带出预算维度和合同折扣。" onClick={() => onImport("单次执行费用预估")} />
            <WorkbenchAction title="OMS 资金账单" desc="按平台扣款规则命中费用小类，模拟生成待到票。" onClick={onSyncOms} />
          </div>
        </Section>

        <Section title="待处理列表">
          <div className="space-y-2 text-sm">
            <TodoRow label="待预提" value={`${[...singles, ...ads, ...lives].filter((item) => item.accrualStatus === "未预提").length} 条`} onClick={() => onView("ad")} />
            <TodoRow label="待供应商对账" value={`${[...singles, ...ads, ...lives].filter((item) => item.reconStatus === "未对账").length} 条`} onClick={() => onView("single")} />
            <TodoRow label="摊销中合同" value={`${amortizations.filter((item) => item.amortizationStatus === "摊销中").length} 条`} onClick={() => onView("amortization")} />
            <TodoRow label="代运营待生成" value={`${agencyData.filter((item) => item.generateStatus !== "生成成功").length} 条`} onClick={() => onView("agency")} />
          </div>
        </Section>

        <Section title="异常记录">
          {failedRows.length === 0 ? <div className="text-sm text-slate-500">暂无异常。转换失败、规则未命中、同步失败会在这里展示。</div> : (
            <div className="space-y-2">
              {failedRows.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-md border border-red-100 bg-red-50 p-3 text-sm">
                  <div className="font-medium text-red-700">{item.code}</div>
                  <div className="mt-1 text-red-600">{"failureReason" in item ? item.failureReason || "平台扣款规则需重新匹配。" : "平台扣款规则需重新匹配。"}</div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function FilterPanel({ filters, setFilters, suppliers, accountingEntities, feeMinors, activities, view, onQuery, onReset, onMockError }: { filters: Filters; setFilters: (filters: Filters) => void; suppliers: string[]; accountingEntities: string[]; feeMinors: string[]; activities: string[]; view: ViewMode; onQuery: () => void; onReset: () => void; onMockError: () => void }) {
  const update = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="单号 / 合同编号 / 供应商">
          <Input value={filters.keyword} onChange={(value) => update({ keyword: value })} placeholder="输入 ERROR 可模拟异常" />
        </Field>
        <Field label="核算主体">
          <Select value={filters.accountingEntity} onChange={(value) => update({ accountingEntity: value })} options={["全部", ...accountingEntities]} />
        </Field>
        <Field label="供应商">
          <Select value={filters.supplier} onChange={(value) => update({ supplier: value })} options={["全部", ...suppliers]} />
        </Field>
        <Field label="费用小类">
          <Select value={filters.feeMinor} onChange={(value) => update({ feeMinor: value })} options={["全部", ...feeMinors]} />
        </Field>
        <Field label="营销活动">
          <Select value={filters.activity} onChange={(value) => update({ activity: value })} options={["全部", ...activities]} />
        </Field>
        {view === "amortization" ? (
          <Field label="摊销状态">
            <Select value={filters.amortizationStatus} onChange={(value) => update({ amortizationStatus: value })} options={["全部", "待摊销", "摊销中", "已摊销完毕", "已中止", "已终止"]} />
          </Field>
        ) : (
          <>
            <Field label="预提状态">
              <Select value={filters.accrualStatus} onChange={(value) => update({ accrualStatus: value })} options={["全部", "未预提", "已预提", "无需预提", "预提失败"]} />
            </Field>
            <Field label="对账状态">
              <Select value={filters.reconStatus} onChange={(value) => update({ reconStatus: value })} options={["全部", "未对账", "已对账", "差异待处理", "已关闭"]} />
            </Field>
          </>
        )}
        <Field label="同步状态">
          <Select value={filters.syncStatus} onChange={(value) => update({ syncStatus: value })} options={["全部", "未同步", "同步中", "同步成功", "同步失败"]} />
        </Field>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="text-xs text-slate-400">查询、导入、预提、对账、同步和导出均为前端 mock 行为。</div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onMockError}>模拟异常</Button>
          <Button variant="secondary" onClick={onReset}>重置</Button>
          <Button onClick={onQuery}>查询</Button>
        </div>
      </div>
    </div>
  );
}

function AmortizationTable({ rows, onDetail, onStop }: { rows: ContractAmortization[]; onDetail: (row: ContractAmortization) => void; onStop: (row: ContractAmortization, action: "中止摊销" | "终止摊销") => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>合同编号</Th><Th>合同名称</Th><Th>摊销总额</Th><Th>已摊销</Th><Th>摊销进度</Th><Th>日摊销金额</Th><Th>摊销状态</Th><Th>费用小类</Th><Th>最新摊销日期</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id}>
            <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.contractCode}</button></Td>
            <Td>{row.contractName}</Td>
            <Td align="right"><Money value={row.amortizationTotal} /></Td>
            <Td align="right"><Money value={row.amortizedAmount} /></Td>
            <Td><Progress value={row.amortizedAmount} total={row.amortizationTotal} /></Td>
            <Td align="right">{formatMoney(row.dailyAmortization)}</Td>
            <Td><StatusBadge status={row.amortizationStatus} /></Td>
            <Td>{row.expenseMinor}</Td>
            <Td>{row.latestAmortizationAt}</Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={!canStopAmortization(row)} className={!canStopAmortization(row) ? "text-slate-400" : ""} onClick={() => onStop(row, "中止摊销")}>中止</button><button disabled={!canStopAmortization(row)} className={!canStopAmortization(row) ? "text-slate-400" : ""} onClick={() => onStop(row, "终止摊销")}>终止</button></InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function SingleTable({ rows, onDetail, onAccrue, onReconcile }: { rows: SingleExecutionEstimate[]; onDetail: (row: SingleExecutionEstimate) => void; onAccrue: (row: SingleExecutionEstimate) => void; onReconcile: (row: SingleExecutionEstimate) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>单据编号</Th><Th>来源 PO</Th><Th>合同编号</Th><Th>达人/任务</Th><Th>下单金额</Th><Th>合同折扣</Th><Th>预估费用</Th><Th>预提状态</Th><Th>对账状态</Th><Th>差异</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id}>
            <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td>
            <Td>{row.sourcePoCode}</Td>
            <Td>{row.contractCode}</Td>
            <Td>{row.talentName}<div className="text-xs text-slate-400">{row.taskId}</div></Td>
            <Td align="right">{formatMoney(row.orderAmount)}</Td>
            <Td align="right">{formatPercent(row.contractDiscount)}</Td>
            <Td align="right"><Money value={row.estimateAmount} /></Td>
            <Td><StatusBadge status={row.accrualStatus} />{row.accrualCode && <div className="mt-1 text-xs text-slate-400">{row.accrualCode}</div>}</Td>
            <Td><StatusBadge status={row.reconStatus} /></Td>
            <Td align="right"><Money value={row.differenceAmount} /></Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.accrualStatus !== "未预提"} className={row.accrualStatus !== "未预提" ? "text-slate-400" : ""} onClick={() => onAccrue(row)}>预提</button><button onClick={() => onReconcile(row)}>对账</button><button>来源 PO</button></InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function AdTable({ rows, onDetail, onAccrue, onReconcile, onRetry }: { rows: AdSpendEstimate[]; onDetail: (row: AdSpendEstimate) => void; onAccrue: (row: AdSpendEstimate) => void; onReconcile: (row: AdSpendEstimate) => void; onRetry: (row: AdSpendEstimate) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>单据编号</Th><Th>费用日期</Th><Th>投放账号</Th><Th>供应商</Th><Th>现金消耗</Th><Th>折扣率</Th><Th>预估费用</Th><Th>预提状态</Th><Th>对账状态</Th><Th>同步状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id} className={row.syncStatus === "同步失败" ? "bg-red-50/40" : ""}>
            <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td>
            <Td>{row.feeDate}</Td>
            <Td>{row.adAccount}<div className="text-xs text-slate-400">{row.rechargeAccount}</div></Td>
            <Td>{row.supplier}</Td>
            <Td align="right">{formatMoney(row.cashConsume)}</Td>
            <Td align="right">{formatPercent(row.discountRate)}</Td>
            <Td align="right"><Money value={row.adjustedEstimateAmount} /></Td>
            <Td><StatusBadge status={row.accrualStatus} />{row.accrualCode && <div className="mt-1 text-xs text-slate-400">{row.accrualCode}</div>}</Td>
            <Td><StatusBadge status={row.reconStatus} />{row.differenceAmount !== 0 && <div className="mt-1 text-xs text-orange-600">{formatMoney(row.differenceAmount)}</div>}</Td>
            <Td><StatusBadge status={row.syncStatus} />{row.failureReason && <div className="mt-1 max-w-56 text-xs text-red-500">{row.failureReason}</div>}</Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.accrualStatus !== "未预提" || row.syncStatus === "同步失败"} className={row.accrualStatus !== "未预提" || row.syncStatus === "同步失败" ? "text-slate-400" : ""} onClick={() => onAccrue(row)}>预提</button><button disabled={row.syncStatus === "同步失败"} className={row.syncStatus === "同步失败" ? "text-slate-400" : ""} onClick={() => onReconcile(row)}>对账</button>{row.syncStatus === "同步失败" && <button onClick={() => onRetry(row)}>重新转换</button>}</InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function LiveTable({ rows, onDetail, onAccrue, onReconcile, onRetry }: { rows: LiveEstimate[]; onDetail: (row: LiveEstimate) => void; onAccrue: (row: LiveEstimate) => void; onReconcile: (row: LiveEstimate) => void; onRetry: (row: LiveEstimate) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>单据编号</Th><Th>合同编号</Th><Th>达人昵称</Th><Th>订单实付</Th><Th>线上佣金</Th><Th>线下佣金</Th><Th>坑位费</Th><Th>预估费用</Th><Th>预提状态</Th><Th>对账状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id} className={row.syncStatus === "同步失败" ? "bg-red-50/40" : ""}>
            <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td>
            <Td>{row.contractCode}</Td>
            <Td>{row.talentName}<div className="text-xs text-slate-400">{row.liveTalentName}</div></Td>
            <Td align="right">{formatMoney(row.paidOrderAmount)}</Td>
            <Td align="right">{formatMoney(row.onlineCommission)}</Td>
            <Td align="right">{formatMoney(row.offlineCommission)}</Td>
            <Td align="right">{formatMoney(row.slotFee)}</Td>
            <Td align="right"><Money value={row.estimateAmount} /></Td>
            <Td><StatusBadge status={row.accrualStatus} />{row.accrualCode && <div className="mt-1 text-xs text-slate-400">{row.accrualCode}</div>}</Td>
            <Td><StatusBadge status={row.reconStatus} />{row.failureReason && <div className="mt-1 max-w-48 text-xs text-red-500">{row.failureReason}</div>}</Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.accrualStatus !== "未预提" || row.syncStatus === "同步失败"} className={row.accrualStatus !== "未预提" || row.syncStatus === "同步失败" ? "text-slate-400" : ""} onClick={() => onAccrue(row)}>预提</button><button disabled={row.syncStatus === "同步失败"} className={row.syncStatus === "同步失败" ? "text-slate-400" : ""} onClick={() => onReconcile(row)}>对账</button>{row.syncStatus === "同步失败" && <button onClick={() => onRetry(row)}>重新转换</button>}</InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function PlatformTable({ rows, onDetail, onReceipt }: { rows: PlatformDeduction[]; onDetail: (row: PlatformDeduction) => void; onReceipt: (row: PlatformDeduction) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>单据编号</Th><Th>费用日期</Th><Th>平台 / 店铺</Th><Th>OMS 小类</Th><Th>费用小类</Th><Th>支出金额</Th><Th>规则命中</Th><Th>是否入账</Th><Th>待到票</Th><Th>问题记录</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id} className={row.problemRecord ? "bg-orange-50/40" : ""}>
            <Td><SourceTag source="OMS" /><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td>
            <Td>{row.feeDate}</Td>
            <Td>{row.platform}<div className="text-xs text-slate-400">{row.store}</div></Td>
            <Td>{row.omsSubCategory}</Td>
            <Td>{row.expenseMinor}</Td>
            <Td align="right"><Money value={row.expenseAmount} /></Td>
            <Td><StatusBadge status={row.problemRecord ? "待调整" : "生成成功"} /><div className="mt-1 text-xs text-slate-400">{row.ruleCode}</div></Td>
            <Td><StatusBadge status={row.entryStatus} /></Td>
            <Td>{row.pendingInvoiceCode || (row.needInvoiceFollow ? "待生成" : "无需跟踪")}</Td>
            <Td>{row.problemRecord || "-"}</Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={!row.needInvoiceFollow || !!row.problemRecord} className={!row.needInvoiceFollow || !!row.problemRecord ? "text-slate-400" : ""} onClick={() => onReceipt(row)}>生成待到票</button></InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function AgencyTable({ rows, onDetail, onGenerate }: { rows: AgencyOperationData[]; onDetail: (row: AgencyOperationData) => void; onGenerate: (row: AgencyOperationData) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><Th>数据编号</Th><Th>场景</Th><Th>渠道 / 来源</Th><Th>直播间</Th><Th>业务日期</Th><Th>退前 GMV</Th><Th>实收收入</Th><Th>合同编号</Th><Th>生成状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 bg-white text-sm">
        {rows.map((row) => (
          <tr key={row.id}>
            <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td>
            <Td><StatusBadge status={row.scenario} /></Td>
            <Td>{row.channel}<div className="text-xs text-slate-400">{row.businessSource}</div></Td>
            <Td>{row.liveRoomName}</Td>
            <Td>{row.businessDate}</Td>
            <Td align="right">{formatMoney(row.gmv)}</Td>
            <Td align="right">{formatMoney(row.income)}</Td>
            <Td>{row.contractCode}</Td>
            <Td><StatusBadge status={row.generateStatus} />{row.generatedEstimateCode && <div className="mt-1 text-xs text-slate-400">{row.generatedEstimateCode}</div>}</Td>
            <Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.generateStatus === "生成成功"} className={row.generateStatus === "生成成功" ? "text-slate-400" : ""} onClick={() => onGenerate(row)}>生成预估</button></InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function DetailModal({ detail, onClose }: { detail: DetailData; onClose: () => void }) {
  const rows = detailRows(detail);
  const title = `${detailTitle(detail)}详情`;
  return (
    <Modal title={title} onClose={onClose}>
      {"failureReason" in detail.row && detail.row.failureReason && <Alert>{detail.row.failureReason}</Alert>}
      {"problemRecord" in detail.row && detail.row.problemRecord && <Alert tone="orange">{detail.row.problemRecord}</Alert>}
      <DetailGrid rows={rows} />
      {detail.type === "platform" && (
        <Section title="规则命中">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="规则 code" value={detail.row.ruleCode} />
            <ReadOnly label="规则名称" value={detail.row.ruleName} />
            <ReadOnly label="账单列" value={detail.row.billColumn} />
            <ReadOnly label="匹配值" value={detail.row.matchValue} />
            <ReadOnly label="是否有票" value={detail.row.hasInvoice} />
            <ReadOnly label="跟踪发票" value={detail.row.needInvoiceFollow ? "是" : "否"} />
            <ReadOnly label="待到票单号" value={detail.row.pendingInvoiceCode || "-"} />
            <ReadOnly label="数据来源" value={<SourceTag source="OMS" />} />
          </div>
        </Section>
      )}
      <Section title="操作日志"><RecordList rows={detail.row.logs} /></Section>
    </Modal>
  );
}

function ImportModal({ kind, setKind, onClose, onConfirm }: { kind: EstimateKind; setKind: (kind: EstimateKind | null) => void; onClose: () => void; onConfirm: (kind: EstimateKind) => void }) {
  const [selected, setSelected] = useState<EstimateKind>(kind);
  return (
    <Modal title="模拟生成费用预估" onClose={onClose}>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="生成路径">
          <Select value={selected} onChange={(value) => {
            setSelected(value as EstimateKind);
            setKind(value as EstimateKind);
          }} options={["投放费用预估", "直播费用预估", "单次执行费用预估", "合同摊销费用", "平台扣款费用"]} />
        </Field>
        <ReadOnly label="期间" value="2026-05" />
        <ReadOnly label="外部系统" value={sourceSystemOf(selected)} />
      </div>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
        {selected === "投放费用预估" && "影刀机器人正在解析账单文件，随后按投放账号、充值账号、营销活动和折扣率生成投放费用预估。"}
        {selected === "直播费用预估" && "达人或直播佣金账单将匹配达人 ID、合同编号、线上佣金、线下佣金比例和坑位费。"}
        {selected === "单次执行费用预估" && "从合同 PO 或达人 PO 执行单自动带出下单金额、合同折扣、预算维度并生成预估。"}
        {selected === "合同摊销费用" && "从合同结构化信息选择需要摊销的生效合同，财务确认摊销规则后生成摊销台账。"}
        {selected === "平台扣款费用" && "OMS 资金账单将命中费用小类映射规则，并对需跟踪发票的记录写入待到票台账。"}
      </div>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={() => onConfirm(selected)}>开始生成</Button>
      </ModalActions>
    </Modal>
  );
}

function ReconcileModal({ target, onClose, onSave }: { target: ReconcileTarget; onClose: () => void; onSave: (target: ReconcileTarget) => void }) {
  const estimate = estimateAmountOf(target.row);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState(String(target.row.reconAmount || estimate));
  const [reason, setReason] = useState(target.row.differenceReason);
  const diff = roundMoney(Number(amount || 0) - estimate);
  const needReason = Math.abs(diff) > 0.01;
  return (
    <Modal title="发起对账" onClose={onClose} size="md">
      <div className="grid gap-3 md:grid-cols-2">
        <ReadOnly label="单据编号" value={target.row.code} />
        <ReadOnly label="预估费用" value={formatMoney(estimate)} />
        <Field label="对账日期" required><Input value={date} onChange={setDate} /></Field>
        <Field label="对账金额" required><Input value={amount} onChange={setAmount} /></Field>
      </div>
      <Field label="差异原因" required={needReason} error={needReason && !reason.trim() ? "差异金额不为 0 时必须填写差异原因。" : ""}>
        <Textarea value={reason} onChange={setReason} placeholder="如无差异可留空" />
      </Field>
      <Alert tone={needReason ? "orange" : "blue"}>差异金额 = 对账金额 - 预估费用，当前差异为 {formatMoney(diff)}。</Alert>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button disabled={needReason && !reason.trim()} onClick={() => {
          const nextRow = { ...target.row, reconDate: date, reconAmount: Number(amount || 0), differenceAmount: diff, differenceReason: reason, reconResult: needReason ? "有差异" as ReconResult : "一致" as ReconResult, reconStatus: needReason ? "差异待处理" as ReconStatus : "已对账" as ReconStatus, settlementCode: nextCode("DZJS"), logs: prependLog(target.row.logs, "保存对账", `对账金额 ${formatMoney(Number(amount || 0))}，差异 ${formatMoney(diff)}。`) };
          onSave({ ...target, row: nextRow } as ReconcileTarget);
        }}>保存对账</Button>
      </ModalActions>
    </Modal>
  );
}

function StopAmortizationModal({ target, onClose, onSave }: { target: { row: ContractAmortization; action: "中止摊销" | "终止摊销" }; onClose: () => void; onSave: (row: ContractAmortization) => void }) {
  const [reason, setReason] = useState(target.row.stopReason ?? "");
  const status: AmortizationStatus = target.action === "中止摊销" ? "已中止" : "已终止";
  return (
    <Modal title={target.action} onClose={onClose} size="md">
      <DetailGrid rows={[["合同编号", target.row.contractCode], ["合同名称", target.row.contractName], ["剩余摊销金额", formatMoney(target.row.remainingAmount)], ["最新摊销日期", target.row.latestAmortizationAt], ["当前状态", <StatusBadge key="status" status={target.row.amortizationStatus} />], ["结算建议", target.action === "终止摊销" ? "剩余金额进入财务复核" : "暂停后续自动摊销"]]} />
      <Field label="原因说明" required error={!reason.trim() ? "请填写原因说明。" : ""}>
        <Textarea value={reason} onChange={setReason} />
      </Field>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button disabled={!reason.trim()} onClick={() => onSave({ ...target.row, amortizationStatus: status, stopReason: reason, logs: prependLog(target.row.logs, target.action, `${reason} 剩余摊销金额 ${formatMoney(target.row.remainingAmount)}。`) })}>确认</Button>
      </ModalActions>
    </Modal>
  );
}

function GenerationDrawer({ result, onClose }: { result: { title: string; logs: OperationLog[]; problems: string[] }; onClose: () => void }) {
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <h2 className="text-lg font-semibold">{result.title}</h2>
        <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>关闭</button>
      </div>
      <div className="space-y-4 p-5">
        <Section title="来源明细"><RecordList rows={result.logs} /></Section>
        <Section title="汇总结果"><Alert tone="blue">已完成来源数据读取、标准账单转换、规则命中和预估台账生成。所有下游单号均为前端 mock。</Alert></Section>
        <Section title="异常问题">{result.problems.length === 0 ? <div className="text-sm text-slate-500">未发现异常问题。</div> : result.problems.map((item) => <Alert key={item}>{item}</Alert>)}</Section>
      </div>
    </div>
  );
}

function buildSingle(input: { id: string; code: string; supplier: string; contractCode: string; contractName: string; taskId: string; talentId: string; talentName: string; sourcePoCode: string; orderAmount: number; discount: number; reconAmount: number; reason: string; status: AccrualStatus }): SingleExecutionEstimate {
  const estimate = roundMoney(input.orderAmount * input.discount);
  const diff = roundMoney(input.reconAmount - estimate);
  return {
    id: input.id,
    code: input.code,
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: input.supplier,
    contractCode: input.contractCode,
    contractName: input.contractName,
    feeDate: "2026-05-05",
    planCategory: "达人内容",
    activity: input.contractName.includes("户外") ? "城市核心商圈户外投放" : "抖音达人内容执行",
    budgetDepartment: "内容营销部",
    budgetSubject: "达人推广费",
    expenseMajor: "销售费用",
    expenseMinor: input.contractName.includes("户外") ? "户外广告费" : "达人服务费",
    firstBudgetSubject: "内容推广费",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: input.contractName.includes("小红书") ? "小红书" : "抖音",
    dataSource: "合同 PO",
    relationKey: input.sourcePoCode,
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    poType: input.talentName === "-" ? "合同 PO" : "达人 PO",
    taskId: input.taskId,
    orderAmount: input.orderAmount,
    contractDiscount: input.discount,
    estimateAmount: estimate,
    talentId: input.talentId,
    talentName: input.talentName,
    adAccount: input.talentName === "-" ? "-" : "dy_content_kol",
    orderMethod: "PO 下单",
    orderChannel: input.contractName.includes("小红书") ? "小红书蒲公英" : "巨量星图",
    sourcePoCode: input.sourcePoCode,
    syncedToMatter: true,
    accrualStatus: input.status,
    accruedAmount: input.status === "已预提" ? estimate : 0,
    accrualCode: input.status === "已预提" ? "YT-202605-0006" : "",
    reconStatus: input.reconAmount > 0 ? (diff === 0 ? "已对账" : "差异待处理") : "未对账",
    reconDate: input.reconAmount > 0 ? "2026-05-06" : "",
    reconAmount: input.reconAmount,
    differenceAmount: diff,
    differenceReason: input.reason,
    reconResult: input.reconAmount > 0 ? (diff === 0 ? "一致" : "有差异") : "待确认",
    settlementCode: input.reconAmount > 0 ? "DZJS-202605-0008" : "",
    logs: baseLogs
  };
}

function buildAd(input: { id: string; code: string; supplier: string; contractCode: string; account: string; recharge: string; activity: string; cash: number; discount: number; deduction: number; reconAmount: number; reason: string; status: AccrualStatus; syncStatus?: SyncStatus; failureReason?: string }): AdSpendEstimate {
  const estimate = roundMoney(input.cash * input.discount);
  const diff = roundMoney(input.reconAmount - estimate);
  return {
    id: input.id,
    code: input.code,
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: input.supplier,
    contractCode: input.contractCode,
    contractName: `${input.activity}合同`,
    feeDate: "2026-05-04",
    planCategory: input.activity.includes("直播") ? "直播投流" : "站内/站外投放",
    activity: input.activity,
    budgetDepartment: input.activity.includes("直播") ? "内容电商部" : "电商运营部",
    budgetSubject: input.activity.includes("直播") ? "直播推广费" : "效果广告费",
    expenseMajor: "销售费用",
    expenseMinor: input.activity.includes("直通车") ? "直通车" : input.activity.includes("小红书") ? "站外种草投放" : "千川投放",
    firstBudgetSubject: "效果广告费",
    store: input.activity.includes("天猫") ? "天猫官方旗舰店" : input.activity.includes("小红书") ? "小红书官方旗舰店" : "抖音官方旗舰店",
    brand: "示例品牌",
    channel: input.activity.includes("天猫") ? "天猫" : input.activity.includes("小红书") ? "小红书" : input.activity.includes("快手") ? "快手" : "抖音",
    dataSource: "影刀 RPA",
    relationKey: `RPA-${input.code}`,
    syncStatus: input.syncStatus ?? "同步成功",
    lastSyncAt: nowText,
    failureReason: input.failureReason,
    adAccount: input.account,
    rechargeAccount: input.recharge,
    marketingPlan: input.activity,
    deliveryMethod: input.activity.includes("小红书") ? "内容种草" : "效果投放",
    cashConsume: input.cash,
    discountRate: input.discount,
    estimateAmount: estimate,
    adjustedEstimateAmount: estimate,
    deductionAmount: input.deduction,
    taxRate: 0.06,
    owner: "陈晨",
    generateStatus: input.syncStatus === "同步失败" ? "生成失败" : "生成成功",
    accrualStatus: input.status,
    accruedAmount: input.status === "已预提" ? estimate : 0,
    accrualCode: input.status === "已预提" ? "YT-202605-0002" : "",
    reconStatus: input.reconAmount > 0 ? (diff === 0 ? "已对账" : "差异待处理") : "未对账",
    reconDate: input.reconAmount > 0 ? "2026-05-06" : "",
    reconAmount: input.reconAmount,
    differenceAmount: diff,
    differenceReason: input.reason,
    reconResult: input.reconAmount > 0 ? (diff === 0 ? "一致" : "有差异") : "待确认",
    settlementCode: input.reconAmount > 0 ? "DZJS-202605-0002" : "",
    logs: baseLogs
  };
}

function buildLive(input: { id: string; code: string; supplier: string; contractCode: string; talent: string; liveTalent: string; paid: number; online: number; offlineRate: number; slot: number; recon: number; reason: string; status: AccrualStatus; syncStatus?: SyncStatus; failureReason?: string }): LiveEstimate {
  const offline = roundMoney(input.paid * input.offlineRate);
  const estimate = roundMoney(input.online + offline + input.slot);
  const diff = roundMoney(input.recon - estimate);
  return {
    id: input.id,
    code: input.code,
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: input.supplier,
    contractCode: input.contractCode,
    contractName: "达人直播坑位与佣金合同",
    feeDate: "2026-05-03",
    planCategory: "直播合作",
    activity: "520 达人直播专场",
    budgetDepartment: "内容电商部",
    budgetSubject: "直播服务费",
    expenseMajor: "销售费用",
    expenseMinor: input.slot > 0 ? "直播坑位费" : "线上佣金",
    firstBudgetSubject: "直播推广费",
    store: "抖音官方旗舰店",
    brand: "示例品牌",
    channel: "抖音",
    dataSource: "达人系统",
    relationKey: `COMMISSION-${input.code}`,
    syncStatus: input.syncStatus ?? "同步成功",
    lastSyncAt: nowText,
    failureReason: input.failureReason,
    talentName: input.talent,
    liveTalentName: input.liveTalent,
    marketingPlan: "520 直播专场",
    paidOrderAmount: input.paid,
    onlineCommission: input.online,
    offlineCommission: offline,
    offlineCommissionRate: input.offlineRate,
    slotFee: input.slot,
    estimateAmount: estimate,
    businessSource: "直播电商",
    businessUnit: "内容电商 BU",
    taxRate: 0.06,
    generateStatus: input.syncStatus === "同步失败" ? "生成失败" : "生成成功",
    accrualStatus: input.status,
    accruedAmount: input.status === "已预提" ? estimate : 0,
    accrualCode: input.status === "已预提" ? "YT-202605-0004" : "",
    reconStatus: input.recon > 0 ? (diff === 0 ? "已对账" : "差异待处理") : "未对账",
    reconDate: input.recon > 0 ? "2026-05-06" : "",
    reconAmount: input.recon,
    differenceAmount: diff,
    differenceReason: input.reason,
    reconResult: input.recon > 0 ? (diff === 0 ? "一致" : "有差异") : "待确认",
    settlementCode: input.recon > 0 ? "DZJS-202605-0004" : "",
    logs: baseLogs
  };
}

function buildPlatform(input: { id: string; code: string; platform: string; supplier: string; store: string; sub: string; scene: string; amount: number; rule: string; hasInvoice: "有票" | "完全无票" | "部分有票"; follow: boolean; pending: string; problem?: string }): PlatformDeduction {
  return {
    id: input.id,
    code: input.code,
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: input.supplier,
    contractCode: input.platform.includes("京东") ? "PTXY-2026-031" : "PTXY-2026-052",
    contractName: `${input.platform}平台服务协议`,
    feeDate: "2026-05-04",
    planCategory: "平台扣款",
    activity: input.scene,
    budgetDepartment: "电商运营部",
    budgetSubject: input.sub.includes("赔付") ? "其他损益" : "平台服务费",
    expenseMajor: "销售费用",
    expenseMinor: input.sub,
    firstBudgetSubject: input.sub.includes("推广") ? "效果广告费" : "平台服务费",
    store: input.store,
    brand: "示例品牌",
    channel: input.platform.replace("商城", ""),
    dataSource: "OMS",
    relationKey: `OMS-${input.code}`,
    syncStatus: input.problem ? "同步失败" : "同步成功",
    lastSyncAt: nowText,
    expenseAmount: input.amount,
    omsCategory: "费用项",
    omsSubCategory: input.scene,
    sceneDescription: input.scene,
    platform: input.platform,
    receivingAccount: `${input.platform}-PAY-1001`,
    entryStatus: input.pending ? "已入账" : "未入账",
    entryCode: input.pending ? "RZ-202605-0011" : "",
    accruedAmount: input.hasInvoice === "完全无票" ? 0 : input.amount,
    problemRecord: input.problem ?? "",
    ruleCode: input.rule,
    ruleName: input.scene,
    billColumn: "业务描述",
    matchValue: input.scene,
    hasInvoice: input.hasInvoice,
    needInvoiceFollow: input.follow,
    pendingInvoiceCode: input.pending,
    logs: baseLogs
  };
}

function buildAgency(input: { id: string; code: string; scenario: "代运营直播" | "得物销售额"; channel: string; source: string; room: string; date: string; gmv: number; income: number; contract: string; supplier: string }): AgencyOperationData {
  return {
    id: input.id,
    code: input.code,
    scenario: input.scenario,
    channel: input.channel,
    businessSource: input.source,
    liveRoomName: input.room,
    liveRoomId: input.room === "-" ? "-" : `${input.channel}-ROOM-1001`,
    businessDate: input.date,
    gmv: input.gmv,
    income: input.income,
    planCategory: input.scenario === "代运营直播" ? "直播合作" : "代运营销售",
    activity: input.scenario === "代运营直播" ? "520 达人直播专场" : "得物销售额结算",
    budgetDepartment: input.scenario === "代运营直播" ? "内容电商部" : "电商运营部",
    budgetSubject: input.scenario === "代运营直播" ? "直播服务费" : "代运营服务费",
    expenseMinor: input.scenario === "代运营直播" ? "直播服务费" : "代运营服务费",
    store: input.channel === "得物" ? "得物旗舰店" : `${input.channel}官方旗舰店`,
    brand: "示例品牌",
    contractCode: input.contract,
    supplier: input.supplier,
    generateStatus: "未生成",
    generatedEstimateCode: "",
    logs: baseLogs
  };
}

function filterAmortizations(rows: ContractAmortization[], filters: Filters) {
  return rows.filter((row) => basicMatch(row, filters) && matchFilter(filters.amortizationStatus, row.amortizationStatus));
}

function filterEstimateRows<T extends EstimateBase & ReconFields>(rows: T[], filters: Filters) {
  return rows.filter((row) => basicMatch(row, filters) && matchFilter(filters.accrualStatus, row.accrualStatus) && matchFilter(filters.reconStatus, row.reconStatus));
}

function filterPlatforms(rows: PlatformDeduction[], filters: Filters) {
  return rows.filter((row) => basicMatch(row, filters));
}

function filterAgency(rows: AgencyOperationData[], filters: Filters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) => {
    const text = `${row.code} ${row.contractCode} ${row.supplier} ${row.channel} ${row.activity}`.toLowerCase();
    return (!keyword || text.includes(keyword)) && matchFilter(filters.supplier, row.supplier) && matchFilter(filters.feeMinor, row.expenseMinor) && matchFilter(filters.activity, row.activity);
  });
}

function basicMatch(row: EstimateBase, filters: Filters) {
  const keyword = filters.keyword.trim().toLowerCase();
  const text = `${row.code} ${row.contractCode} ${row.contractName} ${row.supplier} ${row.activity} ${row.expenseMinor}`.toLowerCase();
  return (!keyword || text.includes(keyword)) && matchFilter(filters.accountingEntity, row.accountingEntity) && matchFilter(filters.supplier, row.supplier) && matchFilter(filters.feeMinor, row.expenseMinor) && matchFilter(filters.activity, row.activity) && matchFilter(filters.syncStatus, row.syncStatus);
}

function detailRows(detail: DetailData): Array<[string, ReactNode]> {
  if (detail.type === "amortization") {
    const row = detail.row;
    return [["合同编号", row.contractCode], ["合同名称", row.contractName], ["供应商", row.supplier], ["合同总金额", formatMoney(row.contractAmount)], ["摊销总额", formatMoney(row.amortizationTotal)], ["已摊销金额", formatMoney(row.amortizedAmount)], ["剩余摊销金额", formatMoney(row.remainingAmount)], ["日摊销金额", formatMoney(row.dailyAmortization)], ["摊销期间", `${row.amortizationStartAt} 至 ${row.amortizationEndAt}`], ["摊销状态", <StatusBadge key="status" status={row.amortizationStatus} />], ["费用小类", row.expenseMinor], ["中止/终止原因", row.stopReason ?? "-"]];
  }
  if (detail.type === "platform") {
    const row = detail.row;
    return [["单据编号", row.code], ["平台", row.platform], ["店铺", row.store], ["OMS 小类", row.omsSubCategory], ["费用小类", row.expenseMinor], ["支出金额", formatMoney(row.expenseAmount)], ["供应商", row.supplier], ["是否入账", <StatusBadge key="entry" status={row.entryStatus} />], ["入账单据号", row.entryCode || "-"], ["预提金额", formatMoney(row.accruedAmount)], ["数据问题记录", row.problemRecord || "-"], ["关联主键", row.relationKey]];
  }
  if (detail.type === "agency") {
    const row = detail.row;
    return [["数据编号", row.code], ["业务场景", row.scenario], ["渠道", row.channel], ["业务来源", row.businessSource], ["直播间", row.liveRoomName], ["业务日期", row.businessDate], ["退前 GMV", formatMoney(row.gmv)], ["实收收入", formatMoney(row.income)], ["合同编号", row.contractCode], ["供应商", row.supplier], ["生成状态", <StatusBadge key="status" status={row.generateStatus} />], ["预估单号", row.generatedEstimateCode || "-"]];
  }
  const row = detail.row;
  return [["单据编号", row.code], ["合同编号", row.contractCode], ["供应商", row.supplier], ["费用日期", row.feeDate], ["营销活动", row.activity], ["预算科目", row.budgetSubject], ["费用小类", row.expenseMinor], ["预估费用", formatMoney(estimateAmountOf(row))], ["预提状态", <StatusBadge key="accrual" status={row.accrualStatus} />], ["预提单号", row.accrualCode || "-"], ["对账状态", <StatusBadge key="recon" status={row.reconStatus} />], ["对账结果", <StatusBadge key="result" status={row.reconResult} />], ["对账金额", formatMoney(row.reconAmount)], ["差异金额", formatMoney(row.differenceAmount)], ["差异原因", row.differenceReason || "-"], ["同步状态", <StatusBadge key="sync" status={row.syncStatus} />]];
}

function detailTitle(detail: DetailData) {
  const titles: Record<DetailData["type"], string> = { amortization: "合同摊销费用台账", single: "单次执行费用预估台账", ad: "投放费用预估台账", live: "直播费用预估台账", platform: "平台扣款费用台账", agency: "代运营业务数据台账" };
  return titles[detail.type];
}

function buildGenerationResult(title: string, steps: string[], problems: string[]) {
  return { title, logs: steps.map((step, index) => ({ time: nowText, operator: index === 0 ? "来源系统 mock" : "费用预估引擎 mock", action: `步骤 ${index + 1}`, comment: step })), problems };
}

function estimateAmountOf(row: SingleExecutionEstimate | AdSpendEstimate | LiveEstimate) {
  if ("adjustedEstimateAmount" in row) return row.adjustedEstimateAmount;
  return row.estimateAmount;
}

function canStopAmortization(row: ContractAmortization) {
  return row.amortizationStatus === "摊销中" || row.amortizationStatus === "待摊销";
}

function sourceSystemOf(kind: EstimateKind) {
  if (kind === "投放费用预估") return "影刀 RPA / 广告平台";
  if (kind === "直播费用预估") return "达人系统 / 直播账单";
  if (kind === "单次执行费用预估") return "合同 PO / 达人 PO";
  if (kind === "合同摊销费用") return "合同系统";
  return "OMS 资金账单";
}

function viewTitle(view: ViewMode) {
  return viewTabs.find((item) => item.key === view)?.label ?? "费用预估";
}

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "workbench", label: "工作台" },
  { key: "amortization", label: "合同摊销费用台账" },
  { key: "single", label: "单次执行费用预估台账" },
  { key: "ad", label: "投放费用预估台账" },
  { key: "live", label: "直播费用预估台账" },
  { key: "platform", label: "平台扣款费用台账" },
  { key: "agency", label: "代运营业务数据台账" }
];

function matchFilter(filter: string, value: string) {
  return filter === "全部" || filter === value;
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function nextCode(prefix: string) {
  return `${prefix}-202605-${String(Date.now()).slice(-4)}`;
}

function replaceById<T extends { id: string }>(rows: T[], next: T) {
  return rows.map((row) => row.id === next.id ? next : row);
}

function prependLog(rows: OperationLog[], action: string, comment: string) {
  return [{ time: nowText, operator: "费用会计-王悦", action, comment }, ...rows];
}

function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full divide-y divide-slate-200">{children}</table>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <td className={`whitespace-nowrap px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : "text-slate-700"}`}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-36 flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-blue-600 [&_button:hover]:underline [&_button:disabled]:cursor-not-allowed [&_button:disabled]:no-underline">{children}</div>;
}

function Button({ children, onClick, variant = "primary", size = "md", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; size?: "sm" | "md"; disabled?: boolean }) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  const variantClass = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400";
  return <button type="button" disabled={disabled} className={`${sizeClass} rounded-md font-medium shadow-sm transition ${variantClass}`} onClick={onClick}>{children}</button>;
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

function Input({ value, onChange, placeholder = "" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function Textarea({ value, onChange, placeholder = "" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  const normalized = unique(options.includes(value) ? options : [value, ...options]);
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>
      {normalized.map((option) => <option key={option} value={option}>{option}</option>)}
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
  if (["生成中", "预提中", "对账中", "摊销中", "入账中", "待确认", "待摊销"].includes(status)) cls = "border-blue-200 bg-blue-50 text-blue-600";
  if (["生成成功", "同步成功", "已预提", "已对账", "一致", "已入账", "已摊销完毕", "已重新生成"].includes(status)) cls = "border-green-200 bg-green-50 text-green-600";
  if (["有差异", "差异待处理", "已中止", "无需预提", "代运营直播", "得物销售额", "待调整"].includes(status)) cls = "border-orange-200 bg-orange-50 text-orange-600";
  if (["生成失败", "同步失败", "预提失败", "入账失败", "已终止"].includes(status)) cls = "border-red-200 bg-red-50 text-red-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{status || "-"}</span>;
}

function Money({ value }: { value: number }) {
  return <span className={`font-medium tabular-nums ${value > 0 ? "text-slate-900" : value < 0 ? "text-orange-600" : "text-slate-500"}`}>{formatMoney(value)}</span>;
}

function SourceTag({ source }: { source: string }) {
  return <span className="mr-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-500">[{source}]</span>;
}

function Progress({ value, total }: { value: number; total: number }) {
  const percent = total <= 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  const filled = Math.round(percent / 10);
  return (
    <div className="w-32">
      <div className="grid grid-cols-10 gap-px overflow-hidden rounded-full bg-slate-100">
        {Array.from({ length: 10 }).map((_, index) => <div key={index} className={`h-2 ${index < filled ? "bg-blue-500" : "bg-slate-100"}`} />)}
      </div>
      <div className="mt-1 text-xs text-slate-400">{percent}%</div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <div className="grid gap-3 md:grid-cols-3">{rows.map(([label, value]) => <ReadOnly key={label} label={label} value={value} />)}</div>;
}

function Section({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  return <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2>{extra}</div>{children}</section>;
}

function TableWrap({ children, loading }: { children: ReactNode; loading: boolean }) {
  return <div className="relative overflow-x-auto rounded-lg border border-slate-200">{loading && <LoadingMask text="正在查询 mock 数据..." />}{children}</div>;
}

function Modal({ title, children, onClose, size = "lg" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" | "xl" }) {
  const sizeClass = size === "xl" ? "max-w-7xl" : size === "md" ? "max-w-2xl" : "max-w-5xl";
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

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" | "blue" }) {
  const className = tone === "orange" ? "border-orange-200 bg-orange-50 text-orange-700" : tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700";
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

function RecordList({ rows }: { rows: OperationLog[] }) {
  if (rows.length === 0) return <div className="text-sm text-slate-500">暂无操作日志。</div>;
  return <div className="space-y-2">{rows.map((row, index) => <div key={`${row.time}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"><div className="flex justify-between gap-3"><span className="font-medium">{row.action}</span><span className="text-slate-400">{row.time}</span></div><div className="mt-1 text-slate-500">{row.operator} / {row.comment}</div></div>)}</div>;
}

function Toast({ message }: { message: string }) {
  return <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{message}</div>;
}

function WorkbenchAction({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return <button className="rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50" onClick={onClick}><div className="font-medium text-slate-800">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{desc}</div></button>;
}

function TodoRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return <button className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-200 hover:bg-blue-50" onClick={onClick}><span className="text-slate-600">{label}</span><span className="font-semibold text-blue-600">{value}</span></button>;
}
