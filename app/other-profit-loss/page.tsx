"use client";

import { ReactNode, useMemo, useState } from "react";

type ViewMode = "workbench" | "forms" | "profitLedger" | "accrualLedger" | "internalLedger" | "storeIncome" | "returnRates" | "logistics";
type ApprovalStatus = "草稿" | "审批中" | "已审批" | "已驳回" | "已入账" | "入账失败";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type AccrualBusinessType = "会员积分" | "预计退货" | "渠道折扣" | "物流费用" | "其他";
type DetailData =
  | { type: "profitForm"; row: ProfitLossForm }
  | { type: "profitLedger"; row: ProfitLossLedger }
  | { type: "accrual"; row: AccrualLedger }
  | { type: "internal"; row: InternalTransaction }
  | { type: "income"; row: StoreIncome }
  | { type: "rate"; row: ReturnRate }
  | { type: "logistics"; row: LogisticsSettlement };

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

interface JournalLine {
  id: string;
  direction: "借方" | "贷方";
  accountingCode: string;
  subject: string;
  cashflowItem: string;
  dimension: string;
  amount: number;
  remark: string;
}

interface ProfitLossForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  department: string;
  accountingEntity: string;
  counterparty: string;
  flowNo: string;
  transactionDate: string;
  amount: number;
  description: string;
  status: ApprovalStatus;
  voucherNo: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: JournalLine[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface ProfitLossLedger {
  id: string;
  code: string;
  sourceCode: string;
  accountingEntity: string;
  counterparty: string;
  flowNo: string;
  amount: number;
  transactionDate: string;
  voucherNo: string;
  entryStatus: "待入账" | "已入账" | "入账失败";
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  logs: OperationLog[];
}

interface AccrualLedger {
  id: string;
  code: string;
  sourceCode: string;
  month: string;
  businessType: AccrualBusinessType;
  accountingEntity: string;
  store: string;
  channel: string;
  brand: string;
  amount: number;
  subject: string;
  accrualStatus: "未预提" | "审批中" | "已预提" | "预提失败";
  reversalStatus: "未冲销" | "冲销中" | "已冲销" | "部分冲销";
  voucherNo: string;
  reversalVoucherNo?: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  logs: OperationLog[];
}

interface InternalTransaction {
  id: string;
  type: "服务类" | "会员积分";
  month: string;
  store: string;
  accountingEntity: string;
  trusteeEntity: string;
  incomeAmount: number;
  serviceRate: number;
  serviceFeeAmount: number;
  pointUseAmount: number;
  convertedPointAmount: number;
  booked: boolean;
  entryAmount: number;
  voucherNo: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  logs: OperationLog[];
}

interface StoreIncome {
  id: string;
  date: string;
  month: string;
  accountingEntity: string;
  store: string;
  channel: string;
  income: number;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
}

interface ReturnRate {
  id: string;
  store: string;
  channel: string;
  rates: number[];
  importBatch: string;
  updatedBy: string;
  updatedAt: string;
}

interface LogisticsSettlement {
  id: string;
  code: string;
  warehouse: string;
  carrier: string;
  item: string;
  waybillCount: number;
  amount: number;
  taxIncludedAmount: number;
  accountingEntity: string;
  owner: string;
  businessLine: string;
  needInvoiceFollow: boolean;
  willPay: boolean;
  status: ApprovalStatus;
  voucherNo: string;
  generatedTarget: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface Filters {
  keyword: string;
  month: string;
  businessType: string;
  accountingEntity: string;
  status: string;
}

interface ProfitFormState {
  editingId?: string;
  code: string;
  status: ApprovalStatus;
  applicant: string;
  department: string;
  accountingEntity: string;
  counterparty: string;
  flowNo: string;
  transactionDate: string;
  amount: string;
  description: string;
  lines: JournalLine[];
}

interface AccrualFormState {
  type: "会员积分" | "预计退货" | "渠道折扣";
  code: string;
  status: "草稿" | "审批中";
  month: string;
  accountingEntity: string;
  store: string;
  channel: string;
  brand: string;
  pointBalance: string;
  pointRate: string;
  exchangeRate: string;
  income: string;
  returnRate: string;
  gmv: string;
  discountRate: string;
}

interface InternalFormState {
  id?: string;
  code: string;
  status: "草稿" | "审批中";
  transactionId: string;
  settlementType: "服务类" | "会员积分";
  accountingEntity: string;
  description: string;
}

interface LogisticsFormState {
  code: string;
  status: "草稿" | "审批中";
  warehouse: string;
  carrier: string;
  item: string;
  waybillCount: string;
  amount: string;
  taxIncludedAmount: string;
  accountingEntity: string;
  owner: string;
  businessLine: string;
  needInvoiceFollow: boolean;
  willPay: boolean;
}

interface ReversalFormState {
  ledgerId: string;
  month: string;
  reason: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const initialFilters: Filters = { keyword: "", month: "全部", businessType: "全部", accountingEntity: "全部", status: "全部" };
const months = ["2026-03", "2026-04", "2026-05"];

const baseApproval: ApprovalRecord[] = [{ node: "申请", approver: "王悦", date: today, comment: "前端 mock 提交 OA 审批。" }];
const baseLogs: OperationLog[] = [{ time: nowText, operator: "系统模拟", action: "初始化", comment: "由内置 mock 数据生成。" }];

const initialProfitForms: ProfitLossForm[] = [
  {
    id: "opl-form-001",
    code: "QTSS-2026-0506-001",
    applicant: "王悦",
    applyDate: today,
    department: "财务共享中心",
    accountingEntity: "上海示例品牌管理有限公司",
    counterparty: "天猫平台",
    flowNo: "BANK-202605-3318",
    transactionDate: "2026-05-05",
    amount: 12800,
    description: "平台退款手续费差异确认。",
    status: "草稿",
    voucherNo: "-",
    syncStatus: "未同步",
    lastSyncAt: "-",
    lines: [
      line("debit-001", "借方", "660299", "其他营销损失", 12800, "天猫旗舰店 / 电商运营部"),
      line("credit-001", "贷方", "112201", "其他应收款", 12800, "天猫平台")
    ],
    approvals: [],
    logs: baseLogs
  },
  {
    id: "opl-form-002",
    code: "QTSS-2026-0502-006",
    applicant: "林一",
    applyDate: "2026-05-02",
    department: "财务共享中心",
    accountingEntity: "杭州示例电子商务有限公司",
    counterparty: "抖音小店",
    flowNo: "BANK-202605-2215",
    transactionDate: "2026-05-01",
    amount: 8600,
    description: "平台赔付收入确认。",
    status: "审批中",
    voucherNo: "-",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 16:20:00",
    lines: [
      line("debit-002", "借方", "112201", "其他应收款", 8600, "抖音官方旗舰店"),
      line("credit-002", "贷方", "605199", "其他业务收入", 8600, "抖音小店")
    ],
    approvals: baseApproval,
    logs: baseLogs
  },
  {
    id: "opl-form-003",
    code: "QTSS-2026-0426-009",
    applicant: "赵敏",
    applyDate: "2026-04-26",
    department: "电商运营部",
    accountingEntity: "广州示例贸易有限公司",
    counterparty: "京东平台",
    flowNo: "BANK-202604-1902",
    transactionDate: "2026-04-25",
    amount: 5200,
    description: "售后补偿损失确认。",
    status: "入账失败",
    voucherNo: "-",
    syncStatus: "同步失败",
    lastSyncAt: "2026-04-26 18:10:00",
    failureReason: "金蝶凭证生成失败：核算维度客户缺失。",
    lines: [
      line("debit-003", "借方", "660299", "其他营销损失", 5200, "京东旗舰店"),
      line("credit-003", "贷方", "224199", "其他应付款", 5200, "京东平台")
    ],
    approvals: [{ node: "财务负责人", approver: "林一", date: "2026-04-26", comment: "审批通过，凭证生成失败待重试。" }],
    logs: [{ time: "2026-04-26 18:10:00", operator: "金蝶 mock", action: "凭证失败", comment: "核算维度客户缺失。" }]
  }
];

const initialProfitLedger: ProfitLossLedger[] = [
  {
    id: "opl-ledger-001",
    code: "QTSS-TZ-2026-0419-001",
    sourceCode: "QTSS-2026-0419-004",
    accountingEntity: "上海示例品牌管理有限公司",
    counterparty: "小红书平台",
    flowNo: "BANK-202604-1610",
    amount: 16800,
    transactionDate: "2026-04-19",
    voucherNo: "PZ-202604-0188",
    entryStatus: "已入账",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-19 17:30:00",
    logs: baseLogs
  },
  {
    id: "opl-ledger-002",
    code: "QTSS-TZ-2026-0424-003",
    sourceCode: "QTSS-2026-0424-002",
    accountingEntity: "杭州示例电子商务有限公司",
    counterparty: "有赞商城",
    flowNo: "BANK-202604-2407",
    amount: 7300,
    transactionDate: "2026-04-24",
    voucherNo: "PZ-202604-0227",
    entryStatus: "已入账",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-24 19:20:00",
    logs: baseLogs
  }
];

const initialAccrualLedger: AccrualLedger[] = [
  accrual("accrual-001", "QTSS-YT-2026-0501", "JFTQ-2026-0501", "2026-05", "会员积分", "杭州示例电子商务有限公司", "抖音官方旗舰店", "抖音", 6400, "销售费用-会员积分预提", "已预提", "未冲销", "PZ-202605-0061"),
  accrual("accrual-002", "QTSS-YT-2026-0502", "THTQ-2026-0501", "2026-05", "预计退货", "上海示例品牌管理有限公司", "花西子天猫旗舰店", "天猫", 54000, "预计负债预提", "已预提", "未冲销", "PZ-202605-0062"),
  accrual("accrual-003", "QTSS-YT-2026-0503", "ZKTQ-2026-0501", "2026-05", "渠道折扣", "广州示例贸易有限公司", "京东自营旗舰店", "京东", 15000, "销售折扣计提", "已预提", "部分冲销", "PZ-202605-0063"),
  accrual("accrual-004", "QTSS-YT-2026-0420", "WLTQ-2026-0420", "2026-04", "物流费用", "上海示例品牌管理有限公司", "华东仓", "顺丰", 24600, "物流费用预提", "预提失败", "未冲销", "-", "同步失败", "物流账单行缺少事业线，来源系统异常 [503]。")
];

const initialInternalLedger: InternalTransaction[] = [
  internal("internal-001", "服务类", "2026-05", "有赞商城", "杭州示例电子商务有限公司", "上海示例品牌管理有限公司", 300000, 0.06, 0, false),
  internal("internal-002", "会员积分", "2026-05", "抖音官方旗舰店", "杭州示例电子商务有限公司", "上海示例品牌管理有限公司", 0, 0, 8200, false),
  internal("internal-003", "会员积分", "2026-04", "花西子天猫旗舰店", "上海示例品牌管理有限公司", "杭州示例电子商务有限公司", 0, 0, 6800, true),
  internal("internal-004", "服务类", "2026-04", "有赞商城", "杭州示例电子商务有限公司", "上海示例品牌管理有限公司", 210000, 0.05, 0, true)
];

const initialStoreIncome: StoreIncome[] = [
  { id: "income-001", date: "2026-05-01", month: "2026-05", accountingEntity: "上海示例品牌管理有限公司", store: "花西子天猫旗舰店", channel: "天猫", income: 1200000, sourceSystem: "[OMS] 入账收入", syncStatus: "同步成功", lastSyncAt: "2026-05-06 08:40:00" },
  { id: "income-002", date: "2026-05-01", month: "2026-05", accountingEntity: "杭州示例电子商务有限公司", store: "抖音官方旗舰店", channel: "抖音", income: 860000, sourceSystem: "[OMS] 入账收入", syncStatus: "同步成功", lastSyncAt: "2026-05-06 08:42:00" },
  { id: "income-003", date: "2026-04-01", month: "2026-04", accountingEntity: "广州示例贸易有限公司", store: "京东自营旗舰店", channel: "京东", income: 640000, sourceSystem: "[OMS] 入账收入", syncStatus: "同步失败", lastSyncAt: "2026-05-05 23:10:00", failureReason: "OMS 收入同步失败：接口超时 [503]。" }
];

const initialReturnRates: ReturnRate[] = [
  { id: "rate-001", store: "花西子天猫旗舰店", channel: "天猫", rates: [0.042, 0.041, 0.043, 0.044, 0.045, 0.052, 0.044, 0.043, 0.045, 0.047, 0.051, 0.056], importBatch: "THL-202605-001", updatedBy: "林一", updatedAt: "2026-05-05" },
  { id: "rate-002", store: "抖音官方旗舰店", channel: "抖音", rates: [0.035, 0.037, 0.038, 0.039, 0.041, 0.046, 0.04, 0.039, 0.041, 0.043, 0.047, 0.05], importBatch: "THL-202605-001", updatedBy: "林一", updatedAt: "2026-05-05" },
  { id: "rate-003", store: "京东自营旗舰店", channel: "京东", rates: [0.028, 0.03, 0.031, 0.032, 0.033, 0.036, 0.031, 0.03, 0.032, 0.033, 0.037, 0.04], importBatch: "THL-202605-001", updatedBy: "林一", updatedAt: "2026-05-05" }
];

const initialLogistics: LogisticsSettlement[] = [
  {
    id: "logistics-001",
    code: "WLJS-2026-0506-001",
    warehouse: "华东仓",
    carrier: "顺丰速运",
    item: "发货物流",
    waybillCount: 8200,
    amount: 24600,
    taxIncludedAmount: 26076,
    accountingEntity: "上海示例品牌管理有限公司",
    owner: "花西子",
    businessLine: "电商事业部",
    needInvoiceFollow: true,
    willPay: true,
    status: "草稿",
    voucherNo: "-",
    generatedTarget: "-",
    syncStatus: "未同步",
    lastSyncAt: "-",
    approvals: [],
    logs: baseLogs
  },
  {
    id: "logistics-002",
    code: "WLJS-2026-0425-004",
    warehouse: "华南仓",
    carrier: "京东物流",
    item: "丢件赔付",
    waybillCount: 280,
    amount: 8600,
    taxIncludedAmount: 9116,
    accountingEntity: "广州示例贸易有限公司",
    owner: "花西子",
    businessLine: "电商事业部",
    needInvoiceFollow: false,
    willPay: false,
    status: "已入账",
    voucherNo: "PZ-202604-0282",
    generatedTarget: "其他损益预提台账",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-25 20:20:00",
    approvals: [{ node: "财务负责人", approver: "林一", date: "2026-04-25", comment: "无需付款，转其他损益预提。" }],
    logs: baseLogs
  }
];

export default function OtherProfitLossPage() {
  const [view, setView] = useState<ViewMode>("workbench");
  const [profitForms, setProfitForms] = useState(initialProfitForms);
  const [profitLedger, setProfitLedger] = useState(initialProfitLedger);
  const [accrualLedger, setAccrualLedger] = useState(initialAccrualLedger);
  const [internalLedger, setInternalLedger] = useState(initialInternalLedger);
  const [storeIncome, setStoreIncome] = useState(initialStoreIncome);
  const [returnRates, setReturnRates] = useState(initialReturnRates);
  const [logistics, setLogistics] = useState(initialLogistics);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [profitForm, setProfitForm] = useState<ProfitFormState | null>(null);
  const [accrualForm, setAccrualForm] = useState<AccrualFormState | null>(null);
  const [internalForm, setInternalForm] = useState<InternalFormState | null>(null);
  const [logisticsForm, setLogisticsForm] = useState<LogisticsFormState | null>(null);
  const [reversalForm, setReversalForm] = useState<ReversalFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const accountingEntities = useMemo(
    () => unique([...profitForms.map((item) => item.accountingEntity), ...accrualLedger.map((item) => item.accountingEntity), ...storeIncome.map((item) => item.accountingEntity)]),
    [accrualLedger, profitForms, storeIncome]
  );
  const filteredProfitForms = useMemo(() => filterProfitForms(profitForms, filters), [filters, profitForms]);
  const filteredProfitLedger = useMemo(() => filterProfitLedger(profitLedger, filters), [filters, profitLedger]);
  const filteredAccrualLedger = useMemo(() => filterAccrualLedger(accrualLedger, filters), [accrualLedger, filters]);
  const filteredInternalLedger = useMemo(() => filterInternal(internalLedger, filters), [filters, internalLedger]);
  const filteredStoreIncome = useMemo(() => filterStoreIncome(storeIncome, filters), [filters, storeIncome]);
  const filteredReturnRates = useMemo(() => filterRates(returnRates, filters), [filters, returnRates]);
  const filteredLogistics = useMemo(() => filterLogistics(logistics, filters), [filters, logistics]);
  const stats = useMemo(() => buildStats(profitLedger, accrualLedger, profitForms, internalLedger, storeIncome), [accrualLedger, internalLedger, profitForms, profitLedger, storeIncome]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function simulateQuery() {
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 620);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 420);
  }

  function retrySync() {
    setPageError("");
    setProfitForms((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, status: "已入账", syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText, voucherNo: nextVoucher("PZ") } : row));
    setAccrualLedger((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, accrualStatus: "已预提", syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText, voucherNo: nextVoucher("PZ") } : row));
    setStoreIncome((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText } : row));
    showToast("已模拟重试 OMS / 金蝶 / 物流系统同步，失败记录恢复成功。");
  }

  function exportMock() {
    showToast("已模拟生成当前筛选结果导出任务，不创建真实文件。");
  }

  function openProfitForm(source?: ProfitLossForm) {
    const target = source ?? profitForms[0];
    setErrors({});
    setProfitForm({
      editingId: source?.id,
      code: source?.code ?? `QTSS-2026-0506-${String(profitForms.length + 11).padStart(3, "0")}`,
      status: source?.status ?? "草稿",
      applicant: source?.applicant ?? "王悦",
      department: source?.department ?? "财务共享中心",
      accountingEntity: source?.accountingEntity ?? "上海示例品牌管理有限公司",
      counterparty: source?.counterparty ?? "天猫平台",
      flowNo: source?.flowNo ?? `BANK-202605-${String(Date.now()).slice(-4)}`,
      transactionDate: source?.transactionDate ?? today,
      amount: String(source?.amount ?? target.amount),
      description: source?.description ?? "手工确认其他损益，审批通过后生成凭证并写入台账。",
      lines: source?.lines.map((item) => ({ ...item })) ?? [
        line(`debit-${Date.now()}`, "借方", "660299", "其他营销损失", target.amount, "电商运营部 / 花西子"),
        line(`credit-${Date.now()}`, "贷方", "112201", "其他应收款", target.amount, "平台往来")
      ]
    });
  }

  function submitProfitForm() {
    if (!profitForm) return;
    const nextErrors = validateProfitForm(profitForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const item = buildProfitForm(profitForm, "审批中");
    setProfitForms((rows) => upsertById(rows, item));
    setProfitForm({ ...profitForm, editingId: item.id, status: "审批中" });
    showToast("已模拟推送 OA 审批，单据状态变为审批中。");
  }

  function approveProfitForm(item?: ProfitLossForm) {
    const source = item ?? (profitForm ? buildProfitForm(profitForm, "审批中") : undefined);
    if (!source) return;
    if (!isBalanced(source.lines)) {
      setErrors({ balance: "借方合计必须等于贷方合计。" });
      return;
    }
    const voucherNo = nextVoucher("PZ");
    setOverlayLoading("正在模拟审批通过、生成金蝶凭证并写入其他损益台账");
    window.setTimeout(() => {
      const approved: ProfitLossForm = {
        ...source,
        status: "已入账",
        voucherNo,
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        approvals: [...source.approvals, { node: "财务负责人", approver: "林一", date: today, comment: `审批通过，凭证 ${voucherNo} 已回写。` }],
        logs: [{ time: nowText, operator: "系统模拟", action: "写入损益台账", comment: `由 ${source.code} 审批完成生成。` }, ...source.logs]
      };
      setProfitForms((rows) => upsertById(rows, approved));
      setProfitLedger((rows) => [formToLedger(approved), ...rows]);
      setProfitForm(null);
      setView("profitLedger");
      setOverlayLoading("");
      showToast(`审批完成，已生成凭证 ${voucherNo} 并插入其他损益台账。`);
    }, 760);
  }

  function rejectProfit(row: ProfitLossForm) {
    setProfitForms((rows) => rows.map((item) => item.id === row.id ? { ...item, status: "已驳回", approvals: [...item.approvals, { node: "财务负责人", approver: "林一", date: today, comment: "模拟驳回：请补充流水备注和核算维度。" }] } : item));
    showToast("已模拟审批驳回，单据可重新编辑提交。");
  }

  function openAccrualForm(type: AccrualFormState["type"]) {
    const income = type === "预计退货" ? storeIncome.find((item) => item.store === "花西子天猫旗舰店") ?? storeIncome[0] : storeIncome[1] ?? storeIncome[0];
    const rate = returnRates.find((item) => item.store === income.store)?.rates[4] ?? 0.045;
    setErrors({});
    setAccrualForm({
      type,
      code: `${type === "会员积分" ? "JFTQ" : type === "预计退货" ? "THTQ" : "ZKTQ"}-2026-0506-${String(accrualLedger.length + 1).padStart(3, "0")}`,
      status: "草稿",
      month: "2026-05",
      accountingEntity: income.accountingEntity,
      store: income.store,
      channel: income.channel,
      brand: "花西子",
      pointBalance: "800000",
      pointRate: "0.8",
      exchangeRate: "0.01",
      income: String(income.income),
      returnRate: String(rate),
      gmv: "500000",
      discountRate: "0.03"
    });
  }

  function syncAccrualData() {
    if (!accrualForm) return;
    if (accrualForm.type === "预计退货") {
      const source = storeIncome.find((item) => item.store === accrualForm.store && item.month === accrualForm.month) ?? storeIncome[0];
      const rate = returnRates.find((item) => item.store === source.store)?.rates[4] ?? Number(accrualForm.returnRate);
      setAccrualForm({ ...accrualForm, accountingEntity: source.accountingEntity, store: source.store, channel: source.channel, income: String(source.income), returnRate: String(rate) });
      showToast("已模拟从 OMS 收入台账和预计退货率台账自动填充明细。");
    } else if (accrualForm.type === "会员积分") {
      setAccrualForm({ ...accrualForm, store: "抖音官方旗舰店", channel: "抖音", pointBalance: "800000", pointRate: "0.8", exchangeRate: "0.01" });
      showToast("已模拟从 ECRP / 会员系统同步积分余额。");
    } else {
      setAccrualForm({ ...accrualForm, store: "京东自营旗舰店", channel: "京东", gmv: "500000", discountRate: "0.03" });
      showToast("已模拟从渠道账单同步 GMV 和计提比例。");
    }
  }

  function submitAccrual() {
    if (!accrualForm) return;
    const amount = accrualAmount(accrualForm);
    if (amount <= 0) {
      setErrors({ amount: "预提/计提金额必须大于 0。" });
      return;
    }
    setAccrualForm({ ...accrualForm, status: "审批中" });
    showToast("已模拟提交 OA 审批，预提单进入审批中。");
  }

  function approveAccrual() {
    if (!accrualForm) return;
    const amount = accrualAmount(accrualForm);
    if (amount <= 0) {
      setErrors({ amount: "预提/计提金额必须大于 0。" });
      return;
    }
    const voucherNo = nextVoucher("PZ");
    setOverlayLoading("正在模拟审批通过并写入其他损益预提台账");
    window.setTimeout(() => {
      setAccrualLedger((rows) => [formToAccrual(accrualForm, amount, voucherNo), ...rows]);
      setAccrualForm(null);
      setView("accrualLedger");
      setOverlayLoading("");
      showToast(`已生成预提凭证 ${voucherNo}，其他损益预提台账已更新。`);
    }, 720);
  }

  function openInternalSettlement(source?: InternalTransaction) {
    const target = source ?? internalLedger.find((item) => !item.booked) ?? internalLedger[0];
    setErrors({});
    setInternalForm({
      id: target.id,
      code: `NBJY-2026-0506-${String(internalLedger.length + 8).padStart(3, "0")}`,
      status: "草稿",
      transactionId: target.id,
      settlementType: target.type,
      accountingEntity: target.accountingEntity,
      description: "从内部交易信息台账生成结算单，审批后回写是否入账。"
    });
  }

  function submitInternal() {
    if (!internalForm) return;
    const target = internalLedger.find((item) => item.id === internalForm.transactionId);
    if (!target) return;
    if (target.type === "会员积分" && target.booked) {
      setErrors({ transaction: "此笔积分使用已入账，请核对。" });
      return;
    }
    setInternalForm({ ...internalForm, status: "审批中" });
    showToast("已模拟提交内部交易结算单审批。");
  }

  function approveInternal() {
    if (!internalForm) return;
    const target = internalLedger.find((item) => item.id === internalForm.transactionId);
    if (!target) return;
    if (target.type === "会员积分" && target.booked) {
      setErrors({ transaction: "此笔积分使用已入账，请核对。" });
      return;
    }
    const voucherNo = nextVoucher("PZ");
    setInternalLedger((rows) => rows.map((item) => item.id === target.id ? { ...item, booked: true, entryAmount: internalAmount(item), voucherNo, syncStatus: "同步成功", lastSyncAt: nowText, logs: [{ time: nowText, operator: "系统模拟", action: "确认入账", comment: `${internalForm.code} 审批通过，凭证 ${voucherNo}。` }, ...item.logs] } : item));
    setInternalForm(null);
    showToast(`内部交易已确认入账，凭证 ${voucherNo} 已回写来源台账。`);
  }

  function openLogisticsForm(source?: LogisticsSettlement) {
    const target = source ?? logistics[0];
    setErrors({});
    setLogisticsForm({
      code: source?.code ?? `WLJS-2026-0506-${String(logistics.length + 2).padStart(3, "0")}`,
      status: source?.status === "审批中" ? "审批中" : "草稿",
      warehouse: target.warehouse,
      carrier: target.carrier,
      item: target.item,
      waybillCount: String(target.waybillCount),
      amount: String(target.amount),
      taxIncludedAmount: String(target.taxIncludedAmount),
      accountingEntity: target.accountingEntity,
      owner: target.owner,
      businessLine: target.businessLine,
      needInvoiceFollow: target.needInvoiceFollow,
      willPay: target.willPay
    });
  }

  function submitLogistics() {
    if (!logisticsForm) return;
    if (Number(logisticsForm.amount) <= 0 || Number(logisticsForm.waybillCount) <= 0) {
      setErrors({ amount: "金额和运单数量必须大于 0。" });
      return;
    }
    setLogisticsForm({ ...logisticsForm, status: "审批中" });
    showToast("已模拟提交物流费用结算审批。");
  }

  function approveLogistics() {
    if (!logisticsForm) return;
    const amount = Number(logisticsForm.amount);
    const voucherNo = nextVoucher("PZ");
    const target = logisticsForm.needInvoiceFollow && logisticsForm.willPay ? "待到票台账" : "其他损益预提台账";
    const item: LogisticsSettlement = {
      id: `logistics-${Date.now()}`,
      code: logisticsForm.code,
      warehouse: logisticsForm.warehouse,
      carrier: logisticsForm.carrier,
      item: logisticsForm.item,
      waybillCount: Number(logisticsForm.waybillCount),
      amount,
      taxIncludedAmount: Number(logisticsForm.taxIncludedAmount),
      accountingEntity: logisticsForm.accountingEntity,
      owner: logisticsForm.owner,
      businessLine: logisticsForm.businessLine,
      needInvoiceFollow: logisticsForm.needInvoiceFollow,
      willPay: logisticsForm.willPay,
      status: "已入账",
      voucherNo,
      generatedTarget: target,
      syncStatus: "同步成功",
      lastSyncAt: nowText,
      approvals: [{ node: "财务负责人", approver: "林一", date: today, comment: `审批通过，生成${target}记录。` }],
      logs: [{ time: nowText, operator: "系统模拟", action: `生成${target}`, comment: "物流系统、发票系统均为 mock。" }]
    };
    setLogistics((rows) => [item, ...rows.filter((row) => row.code !== item.code)]);
    if (target === "其他损益预提台账") {
      setAccrualLedger((rows) => [formLogisticsToAccrual(item), ...rows]);
    }
    setLogisticsForm(null);
    setView("logistics");
    showToast(target === "待到票台账" ? "审批完成，已模拟生成待到票记录。" : `审批完成，已生成物流费用预提凭证 ${voucherNo}。`);
  }

  function reverseAccrual() {
    if (!reversalForm) return;
    if (!reversalForm.reason.trim()) {
      setErrors({ reason: "请填写冲销原因。" });
      return;
    }
    const voucherNo = nextVoucher("CX");
    setAccrualLedger((rows) => rows.map((item) => item.id === reversalForm.ledgerId ? { ...item, reversalStatus: "已冲销", reversalVoucherNo: voucherNo, logs: [{ time: nowText, operator: "林一", action: "预提冲销", comment: `${reversalForm.month} 冲销：${reversalForm.reason}` }, ...item.logs] } : item));
    setReversalForm(null);
    showToast(`已模拟生成冲销凭证 ${voucherNo}，预提台账冲销状态已更新。`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">其他损益</div>
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
              <div key={label} className={`rounded-md px-3 py-2 ${label === "财务处理" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{sub}</div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">财务处理 / 其他损益 / 3.7.15</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">其他损益模块</h1>
              <p className="mt-1 text-sm text-slate-500">损益确认、会员积分/预计退货/渠道折扣预提、内部交易入账和物流结算的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openProfitForm()}>新建损益确认单</Button>
              <Button variant="secondary" onClick={() => openAccrualForm("会员积分")}>会员积分预提</Button>
              <Button variant="secondary" onClick={() => openAccrualForm("预计退货")}>预计退货预提</Button>
              <Button variant="secondary" onClick={exportMock}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：来源系统异常 [503]，OMS 收入与物流账单同步超时。")}>模拟异常</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-6">
            {stats.map((item) => <SummaryCard key={item.label} label={item.label} value={item.value} sub={item.sub} />)}
          </div>

          {pageError && (
            <Alert>
              <div className="font-medium">异常提示</div>
              <div className="mt-1">{pageError}</div>
              <button className="mt-2 font-medium underline" onClick={retrySync}>重新同步</button>
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
              profitForms={profitForms}
              accrualLedger={accrualLedger}
              internalLedger={internalLedger}
              storeIncome={storeIncome}
              onOpenProfit={() => openProfitForm()}
              onOpenReturn={() => openAccrualForm("预计退货")}
              onOpenInternal={() => openInternalSettlement()}
              onRetry={retrySync}
            />
          ) : (
            <Section title={viewTitle(view)} extra={<Button size="sm" variant="secondary" onClick={simulateQuery}>查询</Button>}>
              <FiltersBar filters={filters} entities={accountingEntities} onChange={(patch) => setFilters({ ...filters, ...patch })} onReset={resetFilters} />
              <div className="relative overflow-x-auto">
                {tableLoading && <LoadingMask text="正在加载 mock 数据..." />}
                {view === "forms" && <ProfitFormsTable rows={filteredProfitForms} onDetail={(row) => setDetail({ type: "profitForm", row })} onEdit={openProfitForm} onApprove={approveProfitForm} onReject={rejectProfit} onCreate={() => openProfitForm()} onReset={resetFilters} />}
                {view === "profitLedger" && <ProfitLedgerTable rows={filteredProfitLedger} onDetail={(row) => setDetail({ type: "profitLedger", row })} onReset={resetFilters} />}
                {view === "accrualLedger" && <AccrualLedgerTable rows={filteredAccrualLedger} onDetail={(row) => setDetail({ type: "accrual", row })} onReverse={(row) => { setErrors({}); setReversalForm({ ledgerId: row.id, month: row.month, reason: "" }); }} onCreate={() => openAccrualForm("渠道折扣")} onReset={resetFilters} />}
                {view === "internalLedger" && <InternalTable rows={filteredInternalLedger} onDetail={(row) => setDetail({ type: "internal", row })} onSettle={openInternalSettlement} onReset={resetFilters} />}
                {view === "storeIncome" && <StoreIncomeTable rows={filteredStoreIncome} onDetail={(row) => setDetail({ type: "income", row })} onRetry={retrySync} onReset={resetFilters} />}
                {view === "returnRates" && <ReturnRatesTable rows={filteredReturnRates} onDetail={(row) => setDetail({ type: "rate", row })} onUpdate={() => { setReturnRates((rows) => rows.map((row) => ({ ...row, updatedAt: today, updatedBy: "王悦", importBatch: "THL-202605-MOCK" }))); showToast("已模拟导入月度退货率，计算来源已刷新。"); }} onReset={resetFilters} />}
                {view === "logistics" && <LogisticsTable rows={filteredLogistics} onDetail={(row) => setDetail({ type: "logistics", row })} onCreate={() => openLogisticsForm()} onApprove={(row) => openLogisticsForm(row)} onReset={resetFilters} />}
              </div>
            </Section>
          )}
        </section>
      </div>

      {profitForm && (
        <Modal title={`${profitForm.code} 其他损益确认单`} onClose={() => setProfitForm(null)} size="xl">
          <Alert tone="blue">流水、OA 审批、金蝶凭证全部为前端 mock。提交前会校验借方合计等于贷方合计。</Alert>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required><Input value={profitForm.applicant} onChange={(applicant) => setProfitForm({ ...profitForm, applicant })} /></Field>
            <Field label="核算主体" required><Select value={profitForm.accountingEntity} onChange={(accountingEntity) => setProfitForm({ ...profitForm, accountingEntity })} options={accountingEntities} /></Field>
            <Field label="交易日期" required><Input value={profitForm.transactionDate} onChange={(transactionDate) => setProfitForm({ ...profitForm, transactionDate })} /></Field>
            <Field label="对方公司" required><Input value={profitForm.counterparty} onChange={(counterparty) => setProfitForm({ ...profitForm, counterparty })} /></Field>
            <Field label="流水编号" required><Input value={profitForm.flowNo} onChange={(flowNo) => setProfitForm({ ...profitForm, flowNo })} /></Field>
            <Field label="流水金额" required error={errors.amount}><Input value={profitForm.amount} onChange={(amount) => setProfitForm({ ...profitForm, amount, lines: profitForm.lines.map((item) => ({ ...item, amount: Number(amount) || 0 })) })} /></Field>
          </div>
          <Field label="说明"><Textarea value={profitForm.description} onChange={(description) => setProfitForm({ ...profitForm, description })} /></Field>
          <Section title="借贷分录" extra={<StatusBadge status={isBalanced(profitForm.lines) ? "借贷平衡" : "借贷不平"} />}>
            {errors.balance && <Alert>{errors.balance}</Alert>}
            <Table>
              <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>方向</Th><Th>记账码</Th><Th>核算科目</Th><Th>现金流项目</Th><Th>辅助核算项</Th><Th>金额</Th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {profitForm.lines.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.direction}</Td><Td>{item.accountingCode}</Td><Td>{item.subject}</Td><Td>{item.cashflowItem}</Td><Td>{item.dimension}</Td>
                    <Td align="right"><Input value={String(item.amount)} onChange={(value) => setProfitForm({ ...profitForm, lines: profitForm.lines.map((row) => row.id === item.id ? { ...row, amount: Number(value) || 0 } : row) })} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="grid gap-3 md:grid-cols-3">
              <ReadOnly label="借方合计" value={formatMoney(sum(profitForm.lines.filter((item) => item.direction === "借方").map((item) => item.amount)))} />
              <ReadOnly label="贷方合计" value={formatMoney(sum(profitForm.lines.filter((item) => item.direction === "贷方").map((item) => item.amount)))} />
              <ReadOnly label="差额" value={formatMoney(balanceDiff(profitForm.lines))} />
            </div>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setProfitForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitProfitForm} disabled={profitForm.status !== "草稿" && profitForm.status !== "已驳回"}>提交审批</Button>
            <Button onClick={() => approveProfitForm()} disabled={profitForm.status !== "审批中"}>审批通过并入账</Button>
          </ModalActions>
        </Modal>
      )}

      {accrualForm && (
        <Modal title={`${accrualForm.code} ${accrualForm.type}单`} onClose={() => setAccrualForm(null)} size="lg">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={syncAccrualData}>同步最新业务数据</Button>
            <StatusBadge status={accrualForm.status} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="预提月份"><Select value={accrualForm.month} onChange={(month) => setAccrualForm({ ...accrualForm, month })} options={months} /></Field>
            <Field label="核算主体"><Input value={accrualForm.accountingEntity} onChange={(accountingEntity) => setAccrualForm({ ...accrualForm, accountingEntity })} /></Field>
            <Field label="店铺"><Input value={accrualForm.store} onChange={(store) => setAccrualForm({ ...accrualForm, store })} /></Field>
          </div>
          {accrualForm.type === "会员积分" && (
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="积分余额"><Input value={accrualForm.pointBalance} onChange={(pointBalance) => setAccrualForm({ ...accrualForm, pointBalance })} /></Field>
              <Field label="积分兑换率"><Input value={accrualForm.pointRate} onChange={(pointRate) => setAccrualForm({ ...accrualForm, pointRate })} /></Field>
              <Field label="积分兑换汇率"><Input value={accrualForm.exchangeRate} onChange={(exchangeRate) => setAccrualForm({ ...accrualForm, exchangeRate })} /></Field>
              <ReadOnly label="预提金额" value={formatMoney(accrualAmount(accrualForm))} />
            </div>
          )}
          {accrualForm.type === "预计退货" && (
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="OMS 入账收入"><Input value={accrualForm.income} onChange={(income) => setAccrualForm({ ...accrualForm, income })} /></Field>
              <Field label="预计退货率"><Input value={accrualForm.returnRate} onChange={(returnRate) => setAccrualForm({ ...accrualForm, returnRate })} /></Field>
              <ReadOnly label="预计退货金额 = 收入 * 退货率" value={formatMoney(accrualAmount(accrualForm))} />
            </div>
          )}
          {accrualForm.type === "渠道折扣" && (
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="成交 GMV"><Input value={accrualForm.gmv} onChange={(gmv) => setAccrualForm({ ...accrualForm, gmv })} /></Field>
              <Field label="计提比例"><Input value={accrualForm.discountRate} onChange={(discountRate) => setAccrualForm({ ...accrualForm, discountRate })} /></Field>
              <ReadOnly label="计提金额 = GMV * 计提比例" value={formatMoney(accrualAmount(accrualForm))} />
            </div>
          )}
          {errors.amount && <Alert>{errors.amount}</Alert>}
          <ModalActions>
            <Button variant="secondary" onClick={() => setAccrualForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitAccrual} disabled={accrualForm.status !== "草稿"}>提交审批</Button>
            <Button onClick={approveAccrual} disabled={accrualForm.status !== "审批中"}>审批通过并预提</Button>
          </ModalActions>
        </Modal>
      )}

      {internalForm && (
        <Modal title={`${internalForm.code} 内部交易结算单`} onClose={() => setInternalForm(null)} size="lg">
          <Alert tone="blue">会员积分来源记录若已入账会禁止重复提交；服务类按收入金额 * 服务费比例计算。</Alert>
          <Field label="结算类型"><Select value={internalForm.settlementType} onChange={(settlementType) => setInternalForm({ ...internalForm, settlementType: settlementType as InternalFormState["settlementType"], transactionId: internalLedger.find((item) => item.type === settlementType)?.id ?? internalForm.transactionId })} options={["服务类", "会员积分"]} /></Field>
          <Field label="关联内部交易"><Select value={internalForm.transactionId} onChange={(transactionId) => setInternalForm({ ...internalForm, transactionId })} options={internalLedger.filter((item) => item.type === internalForm.settlementType).map((item) => item.id)} labels={Object.fromEntries(internalLedger.map((item) => [item.id, `${item.month} / ${item.store} / ${item.booked ? "已入账" : "未入账"} / ${formatMoney(internalAmount(item))}`]))} /></Field>
          {errors.transaction && <Alert>{errors.transaction}</Alert>}
          {internalLedger.find((item) => item.id === internalForm.transactionId) && <InternalPreview row={internalLedger.find((item) => item.id === internalForm.transactionId)!} />}
          <ModalActions>
            <Button variant="secondary" onClick={() => setInternalForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitInternal} disabled={internalForm.status !== "草稿"}>提交审批</Button>
            <Button onClick={approveInternal} disabled={internalForm.status !== "审批中"}>确认入账</Button>
          </ModalActions>
        </Modal>
      )}

      {logisticsForm && (
        <Modal title={`${logisticsForm.code} 物流费用结算单`} onClose={() => setLogisticsForm(null)} size="lg">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="仓库"><Input value={logisticsForm.warehouse} onChange={(warehouse) => setLogisticsForm({ ...logisticsForm, warehouse })} /></Field>
            <Field label="发货物流"><Input value={logisticsForm.carrier} onChange={(carrier) => setLogisticsForm({ ...logisticsForm, carrier })} /></Field>
            <Field label="项"><Input value={logisticsForm.item} onChange={(item) => setLogisticsForm({ ...logisticsForm, item })} /></Field>
            <Field label="运单数量"><Input value={logisticsForm.waybillCount} onChange={(waybillCount) => setLogisticsForm({ ...logisticsForm, waybillCount })} /></Field>
            <Field label="金额"><Input value={logisticsForm.amount} onChange={(amount) => setLogisticsForm({ ...logisticsForm, amount })} /></Field>
            <Field label="含税金额"><Input value={logisticsForm.taxIncludedAmount} onChange={(taxIncludedAmount) => setLogisticsForm({ ...logisticsForm, taxIncludedAmount })} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm"><input type="checkbox" checked={logisticsForm.needInvoiceFollow} onChange={(event) => setLogisticsForm({ ...logisticsForm, needInvoiceFollow: event.target.checked })} />是否跟进发票</label>
            <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm"><input type="checkbox" checked={logisticsForm.willPay} onChange={(event) => setLogisticsForm({ ...logisticsForm, willPay: event.target.checked })} />是否会做付款</label>
          </div>
          {errors.amount && <Alert>{errors.amount}</Alert>}
          <ReadOnly label="审批通过后生成" value={logisticsForm.needInvoiceFollow && logisticsForm.willPay ? "待到票记录" : "其他损益预提台账记录"} />
          <ModalActions>
            <Button variant="secondary" onClick={() => setLogisticsForm(null)}>取消</Button>
            <Button variant="secondary" onClick={submitLogistics} disabled={logisticsForm.status !== "草稿"}>提交审批</Button>
            <Button onClick={approveLogistics} disabled={logisticsForm.status !== "审批中"}>审批通过</Button>
          </ModalActions>
        </Modal>
      )}

      {reversalForm && (
        <Modal title="其他损益预提冲销" onClose={() => setReversalForm(null)} size="md">
          <Alert tone="orange">冲销仅更新前端台账状态并生成 mock 冲销凭证，不调用真实金蝶或 ERP。</Alert>
          <Field label="冲销月份"><Select value={reversalForm.month} onChange={(month) => setReversalForm({ ...reversalForm, month })} options={months} /></Field>
          <Field label="冲销原因" required error={errors.reason}><Textarea value={reversalForm.reason} onChange={(reason) => setReversalForm({ ...reversalForm, reason })} /></Field>
          <ModalActions>
            <Button variant="secondary" onClick={() => setReversalForm(null)}>取消</Button>
            <Button onClick={reverseAccrual}>确认冲销</Button>
          </ModalActions>
        </Modal>
      )}

      {detail && <DetailDrawer detail={detail} onClose={() => setDetail(null)} />}
      {overlayLoading && <LoadingMask text={overlayLoading} full />}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function Workbench({ profitForms, accrualLedger, internalLedger, storeIncome, onOpenProfit, onOpenReturn, onOpenInternal, onRetry }: { profitForms: ProfitLossForm[]; accrualLedger: AccrualLedger[]; internalLedger: InternalTransaction[]; storeIncome: StoreIncome[]; onOpenProfit: () => void; onOpenReturn: () => void; onOpenInternal: () => void; onRetry: () => void }) {
  const pendingForms = profitForms.filter((item) => item.status === "审批中" || item.status === "草稿").slice(0, 4);
  const failedSources = storeIncome.filter((item) => item.syncStatus === "同步失败");
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
      <Section title="待处理单据" extra={<Button size="sm" onClick={onOpenProfit}>新建确认单</Button>}>
        <div className="space-y-3">
          {pendingForms.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-blue-600">{item.code}</div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-2 grid gap-2 text-sm text-slate-500 md:grid-cols-3">
                <span>{item.accountingEntity}</span>
                <span>{item.counterparty}</span>
                <span className="tabular-nums">{formatMoney(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="快捷闭环">
        <div className="grid gap-3">
          <button className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-blue-300" onClick={onOpenReturn}>
            <div className="font-medium">预计退货预提</div>
            <div className="mt-1 text-sm text-slate-500">OMS 收入 + 退货率自动计算预计退货金额。</div>
          </button>
          <button className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:border-blue-300" onClick={onOpenInternal}>
            <div className="font-medium">内部交易确认入账</div>
            <div className="mt-1 text-sm text-slate-500">选择未入账交易，审批通过后回写凭证和入账状态。</div>
          </button>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-medium">同步失败 {failedSources.length} 条</div>
            <div className="mt-1">OMS、物流系统均为 mock，可点击重试恢复。</div>
            <button className="mt-2 font-medium underline" onClick={onRetry}>重新同步</button>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800">本月待冲销</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{accrualLedger.filter((item) => item.reversalStatus === "未冲销").length}</div>
            <div className="mt-1 text-xs text-slate-400">会员积分、预计退货、渠道折扣均可从预提台账发起冲销。</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800">未入账内部交易</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">{internalLedger.filter((item) => !item.booked).length}</div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function FiltersBar({ filters, entities, onChange, onReset }: { filters: Filters; entities: string[]; onChange: (patch: Partial<Filters>) => void; onReset: () => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <Field label="关键词"><Input value={filters.keyword} onChange={(keyword) => onChange({ keyword })} placeholder="单号/店铺/对方公司" /></Field>
      <Field label="月份"><Select value={filters.month} onChange={(month) => onChange({ month })} options={["全部", ...months]} /></Field>
      <Field label="业务类型"><Select value={filters.businessType} onChange={(businessType) => onChange({ businessType })} options={["全部", "会员积分", "预计退货", "渠道折扣", "物流费用", "服务类"]} /></Field>
      <Field label="核算主体"><Select value={filters.accountingEntity} onChange={(accountingEntity) => onChange({ accountingEntity })} options={["全部", ...entities]} /></Field>
      <Field label="状态"><Select value={filters.status} onChange={(status) => onChange({ status })} options={["全部", "草稿", "审批中", "已审批", "已入账", "已预提", "未冲销", "已冲销", "同步失败"]} /></Field>
      <div className="flex items-end"><Button variant="secondary" onClick={onReset}>重置</Button></div>
    </div>
  );
}

function ProfitFormsTable({ rows, onDetail, onEdit, onApprove, onReject, onCreate, onReset }: { rows: ProfitLossForm[]; onDetail: (row: ProfitLossForm) => void; onEdit: (row: ProfitLossForm) => void; onApprove: (row: ProfitLossForm) => void; onReject: (row: ProfitLossForm) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无其他损益确认单" description="可重置筛选或新建一张确认单演示审批入账。" action="新建确认单" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>单据编号</Th><Th>核算主体</Th><Th>对方公司</Th><Th>流水编号</Th><Th>金额</Th><Th>状态</Th><Th>同步</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.accountingEntity}</Td><Td>{row.counterparty}</Td><Td>{row.flowNo}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td><StatusBadge status={row.status} /></Td><Td><StatusBadge status={row.syncStatus} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={() => onEdit(row)}>编辑</button><button disabled={row.status !== "审批中"} className={row.status !== "审批中" ? "text-slate-400" : ""} onClick={() => onApprove(row)}>通过</button><button disabled={row.status !== "审批中"} className={row.status !== "审批中" ? "text-slate-400" : ""} onClick={() => onReject(row)}>驳回</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function ProfitLedgerTable({ rows, onDetail, onReset }: { rows: ProfitLossLedger[]; onDetail: (row: ProfitLossLedger) => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无其他损益台账记录" description="审批通过其他损益确认单后会自动插入这里。" action="重置筛选" onAction={onReset} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>台账编号</Th><Th>来源单据</Th><Th>核算主体</Th><Th>对方公司</Th><Th>交易日期</Th><Th>金额</Th><Th>凭证号</Th><Th>入账状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.sourceCode}</Td><Td>{row.accountingEntity}</Td><Td>{row.counterparty}</Td><Td>{row.transactionDate}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td>{row.voucherNo}</Td><Td><StatusBadge status={row.entryStatus} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button>来源单据</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function AccrualLedgerTable({ rows, onDetail, onReverse, onCreate, onReset }: { rows: AccrualLedger[]; onDetail: (row: AccrualLedger) => void; onReverse: (row: AccrualLedger) => void; onCreate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无其他损益预提台账" description="完成会员积分、预计退货或渠道折扣预提后会自动写入。" action="新增渠道折扣计提" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>预提月份</Th><Th>业务类型</Th><Th>核算主体</Th><Th>店铺/渠道</Th><Th>预提金额</Th><Th>凭证号</Th><Th>预提状态</Th><Th>冲销状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td>{row.month}</Td><Td><StatusBadge status={row.businessType} /></Td><Td>{row.accountingEntity}</Td><Td>{row.store} / {row.channel}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td>{row.voucherNo}</Td><Td><StatusBadge status={row.accrualStatus} /></Td><Td><StatusBadge status={row.reversalStatus} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.reversalStatus === "已冲销" || row.accrualStatus !== "已预提"} className={row.reversalStatus === "已冲销" || row.accrualStatus !== "已预提" ? "text-slate-400" : ""} onClick={() => onReverse(row)}>冲销</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function InternalTable({ rows, onDetail, onSettle, onReset }: { rows: InternalTransaction[]; onDetail: (row: InternalTransaction) => void; onSettle: (row: InternalTransaction) => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无内部交易信息" description="可重置筛选查看服务类与会员积分交易。" action="重置筛选" onAction={onReset} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>交易月份</Th><Th>类型</Th><Th>店铺</Th><Th>核算主体</Th><Th>金额</Th><Th>是否入账</Th><Th>凭证号</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td>{row.month}</Td><Td><StatusBadge status={row.type} /></Td><Td>{row.store}</Td><Td>{row.accountingEntity}</Td><Td align="right">{formatMoney(internalAmount(row))}</Td><Td><StatusBadge status={row.booked ? "已入账" : "未入账"} /></Td><Td>{row.voucherNo}</Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.booked} className={row.booked ? "text-slate-400" : ""} onClick={() => onSettle(row)}>生成结算单</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function StoreIncomeTable({ rows, onDetail, onRetry, onReset }: { rows: StoreIncome[]; onDetail: (row: StoreIncome) => void; onRetry: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无店铺收入数据" description="可重置筛选或模拟同步 OMS 收入。" action="模拟同步" onAction={onRetry} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>月份</Th><Th>核算主体</Th><Th>店铺</Th><Th>渠道</Th><Th>收入</Th><Th>来源系统</Th><Th>同步状态</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td>{row.month}</Td><Td>{row.accountingEntity}</Td><Td>{row.store}</Td><Td>{row.channel}</Td><Td align="right">{formatMoney(row.income)}</Td><Td>{row.sourceSystem}</Td><Td><StatusBadge status={row.syncStatus} /></Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button>{row.syncStatus === "同步失败" && <button onClick={onRetry}>重试</button>}</InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function ReturnRatesTable({ rows, onDetail, onUpdate, onReset }: { rows: ReturnRate[]; onDetail: (row: ReturnRate) => void; onUpdate: () => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无预计退货率配置" description="可重置筛选或模拟导入月度退货率。" action="模拟导入" onAction={onUpdate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>店铺</Th><Th>渠道</Th><Th>3月</Th><Th>4月</Th><Th>5月</Th><Th>6月</Th><Th>导入批次</Th><Th>更新人</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td>{row.store}</Td><Td>{row.channel}</Td><Td>{formatPercent(row.rates[2])}</Td><Td>{formatPercent(row.rates[3])}</Td><Td>{formatPercent(row.rates[4])}</Td><Td>{formatPercent(row.rates[5])}</Td><Td>{row.importBatch}</Td><Td>{row.updatedBy} / {row.updatedAt}</Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button onClick={onUpdate}>模拟导入</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function LogisticsTable({ rows, onDetail, onCreate, onApprove, onReset }: { rows: LogisticsSettlement[]; onDetail: (row: LogisticsSettlement) => void; onCreate: () => void; onApprove: (row: LogisticsSettlement) => void; onReset: () => void }) {
  if (rows.length === 0) return <EmptyState title="暂无物流费用结算单" description="新建结算并审批后会模拟生成待到票或预提记录。" action="新建物流结算" onAction={onCreate} onReset={onReset} />;
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-slate-500"><tr><Th>结算单号</Th><Th>仓库</Th><Th>物流</Th><Th>运单数量</Th><Th>金额</Th><Th>跟票/付款</Th><Th>状态</Th><Th>生成结果</Th><Th>操作</Th></tr></thead>
      <tbody className="divide-y divide-slate-100 text-sm">{rows.map((row) => (
        <tr key={row.id}><Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(row)}>{row.code}</button></Td><Td>{row.warehouse}</Td><Td>{row.carrier}</Td><Td align="right">{row.waybillCount.toLocaleString("zh-CN")}</Td><Td align="right">{formatMoney(row.amount)}</Td><Td>{row.needInvoiceFollow ? "跟票" : "不跟票"} / {row.willPay ? "付款" : "不付款"}</Td><Td><StatusBadge status={row.status} /></Td><Td>{row.generatedTarget}</Td><Td><InlineActions><button onClick={() => onDetail(row)}>详情</button><button disabled={row.status !== "草稿" && row.status !== "审批中"} className={row.status !== "草稿" && row.status !== "审批中" ? "text-slate-400" : ""} onClick={() => onApprove(row)}>审批</button></InlineActions></Td></tr>
      ))}</tbody>
    </Table>
  );
}

function DetailDrawer({ detail, onClose }: { detail: DetailData; onClose: () => void }) {
  const rows = detailRows(detail);
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold">{detailTitle(detail)}</h2>
            <div className="mt-1 text-sm text-slate-500">外部系统、凭证、审批流均为前端 mock 展示。</div>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          <Section title="摘要信息"><DetailGrid rows={rows} /></Section>
          {"logs" in detail.row && <Section title="操作记录"><RecordList rows={detail.row.logs} /></Section>}
          {"approvals" in detail.row && <Section title="审批记录"><StepList steps={detail.row.approvals} /></Section>}
          {"failureReason" in detail.row && detail.row.failureReason && <Alert>{detail.row.failureReason}</Alert>}
        </div>
      </aside>
    </div>
  );
}

function InternalPreview({ row }: { row: InternalTransaction }) {
  return (
    <Section title="结算明细预览">
      <DetailGrid rows={[
        ["交易类型", row.type],
        ["交易月份", row.month],
        ["店铺", row.store],
        ["计算口径", row.type === "服务类" ? `${formatMoney(row.incomeAmount)} * ${formatPercent(row.serviceRate)}` : "积分使用金额 * 换算比例"],
        ["入账金额", formatMoney(internalAmount(row))],
        ["是否入账", <StatusBadge key="booked" status={row.booked ? "已入账" : "未入账"} />]
      ]} />
    </Section>
  );
}

function line(id: string, direction: JournalLine["direction"], accountingCode: string, subject: string, amount: number, dimension: string): JournalLine {
  return { id, direction, accountingCode, subject, cashflowItem: direction === "借方" ? "经营活动现金流出" : "经营活动现金流入", dimension, amount, remark: "mock 分录" };
}

function accrual(id: string, code: string, sourceCode: string, month: string, businessType: AccrualBusinessType, accountingEntity: string, store: string, channel: string, amount: number, subject: string, accrualStatus: AccrualLedger["accrualStatus"], reversalStatus: AccrualLedger["reversalStatus"], voucherNo: string, syncStatus: SyncStatus = "同步成功", failureReason?: string): AccrualLedger {
  return { id, code, sourceCode, month, businessType, accountingEntity, store, channel, brand: "花西子", amount, subject, accrualStatus, reversalStatus, voucherNo, syncStatus, lastSyncAt: nowText, failureReason, logs: baseLogs };
}

function internal(id: string, type: InternalTransaction["type"], month: string, store: string, accountingEntity: string, trusteeEntity: string, incomeAmount: number, serviceRate: number, pointUseAmount: number, booked: boolean): InternalTransaction {
  const serviceFeeAmount = Math.round(incomeAmount * serviceRate * 100) / 100;
  const convertedPointAmount = Math.round(pointUseAmount * 0.8 * 100) / 100;
  return { id, type, month, store, accountingEntity, trusteeEntity, incomeAmount, serviceRate, serviceFeeAmount, pointUseAmount, convertedPointAmount, booked, entryAmount: booked ? (type === "服务类" ? serviceFeeAmount : convertedPointAmount) : 0, voucherNo: booked ? nextVoucher("PZ") : "-", syncStatus: "同步成功", lastSyncAt: nowText, logs: baseLogs };
}

function buildStats(profitLedger: ProfitLossLedger[], accrualLedger: AccrualLedger[], profitForms: ProfitLossForm[], internalLedger: InternalTransaction[], storeIncome: StoreIncome[]) {
  return [
    { label: "本月损益金额", value: formatMoney(sum(profitLedger.filter((item) => item.transactionDate.startsWith("2026-05")).map((item) => item.amount))), sub: "其他损益台账" },
    { label: "本月预提金额", value: formatMoney(sum(accrualLedger.filter((item) => item.month === "2026-05").map((item) => item.amount))), sub: "积分/退货/折扣/物流" },
    { label: "待审批", value: String(profitForms.filter((item) => item.status === "审批中").length), sub: "确认单与结算单" },
    { label: "待冲销", value: String(accrualLedger.filter((item) => item.reversalStatus === "未冲销").length), sub: "已预提未冲销" },
    { label: "待入账交易", value: String(internalLedger.filter((item) => !item.booked).length), sub: "内部交易信息台账" },
    { label: "同步失败", value: String(storeIncome.filter((item) => item.syncStatus === "同步失败").length + accrualLedger.filter((item) => item.syncStatus === "同步失败").length), sub: "可模拟重试" }
  ];
}

function buildProfitForm(form: ProfitFormState, status: ApprovalStatus): ProfitLossForm {
  return {
    id: form.editingId ?? `opl-form-${Date.now()}`,
    code: form.code,
    applicant: form.applicant,
    applyDate: today,
    department: form.department,
    accountingEntity: form.accountingEntity,
    counterparty: form.counterparty,
    flowNo: form.flowNo,
    transactionDate: form.transactionDate,
    amount: Number(form.amount),
    description: form.description,
    status,
    voucherNo: "-",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    lines: form.lines,
    approvals: status === "审批中" ? baseApproval : [],
    logs: [{ time: nowText, operator: form.applicant, action: "提交审批", comment: "模拟推送 OA 审批。" }]
  };
}

function formToLedger(form: ProfitLossForm): ProfitLossLedger {
  return { id: `opl-ledger-${Date.now()}`, code: `QTSS-TZ-${String(Date.now()).slice(-8)}`, sourceCode: form.code, accountingEntity: form.accountingEntity, counterparty: form.counterparty, flowNo: form.flowNo, amount: form.amount, transactionDate: form.transactionDate, voucherNo: form.voucherNo, entryStatus: "已入账", syncStatus: "同步成功", lastSyncAt: nowText, logs: form.logs };
}

function formToAccrual(form: AccrualFormState, amount: number, voucherNo: string): AccrualLedger {
  const subject = form.type === "会员积分" ? "销售费用-会员积分预提" : form.type === "预计退货" ? "预计负债预提" : "销售折扣计提";
  return accrual(`accrual-${Date.now()}`, `QTSS-YT-${String(Date.now()).slice(-8)}`, form.code, form.month, form.type, form.accountingEntity, form.store, form.channel, amount, subject, "已预提", "未冲销", voucherNo);
}

function formLogisticsToAccrual(item: LogisticsSettlement): AccrualLedger {
  return accrual(`accrual-${Date.now()}`, `QTSS-YT-${String(Date.now()).slice(-8)}`, item.code, "2026-05", "物流费用", item.accountingEntity, item.warehouse, item.carrier, item.amount, "物流费用预提", "已预提", "未冲销", item.voucherNo);
}

function validateProfitForm(form: ProfitFormState) {
  const errors: Record<string, string> = {};
  if (!form.accountingEntity.trim()) errors.accountingEntity = "请选择核算主体。";
  if (!form.counterparty.trim()) errors.counterparty = "请填写对方公司。";
  if (Number(form.amount) <= 0) errors.amount = "金额必须大于 0。";
  if (!isBalanced(form.lines)) errors.balance = "借方合计必须等于贷方合计。";
  return errors;
}

function accrualAmount(form: AccrualFormState) {
  if (form.type === "会员积分") return round2(Number(form.pointBalance) * Number(form.pointRate) * Number(form.exchangeRate));
  if (form.type === "预计退货") return round2(Number(form.income) * Number(form.returnRate));
  return round2(Number(form.gmv) * Number(form.discountRate));
}

function internalAmount(row: InternalTransaction) {
  return row.type === "服务类" ? row.serviceFeeAmount : row.convertedPointAmount;
}

function filterProfitForms(rows: ProfitLossForm[], filters: Filters) {
  return rows.filter((row) => matchText([row.code, row.accountingEntity, row.counterparty, row.flowNo], filters.keyword) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.status, filters.status, row.syncStatus));
}

function filterProfitLedger(rows: ProfitLossLedger[], filters: Filters) {
  return rows.filter((row) => matchText([row.code, row.sourceCode, row.counterparty, row.flowNo], filters.keyword) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.entryStatus, filters.status, row.syncStatus));
}

function filterAccrualLedger(rows: AccrualLedger[], filters: Filters) {
  return rows.filter((row) => matchText([row.code, row.sourceCode, row.store, row.channel], filters.keyword) && matchFilter(row.month, filters.month) && matchFilter(row.businessType, filters.businessType) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.accrualStatus, filters.status, row.reversalStatus));
}

function filterInternal(rows: InternalTransaction[], filters: Filters) {
  return rows.filter((row) => matchText([row.id, row.store, row.accountingEntity], filters.keyword) && matchFilter(row.month, filters.month) && matchFilter(row.type, filters.businessType) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.booked ? "已入账" : "未入账", filters.status));
}

function filterStoreIncome(rows: StoreIncome[], filters: Filters) {
  return rows.filter((row) => matchText([row.store, row.channel, row.accountingEntity], filters.keyword) && matchFilter(row.month, filters.month) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.syncStatus, filters.status));
}

function filterRates(rows: ReturnRate[], filters: Filters) {
  return rows.filter((row) => matchText([row.store, row.channel, row.importBatch], filters.keyword) && matchFilter(row.channel, filters.businessType));
}

function filterLogistics(rows: LogisticsSettlement[], filters: Filters) {
  return rows.filter((row) => matchText([row.code, row.warehouse, row.carrier, row.item], filters.keyword) && matchFilter(row.accountingEntity, filters.accountingEntity) && matchFilter(row.status, filters.status, row.syncStatus));
}

function detailTitle(detail: DetailData) {
  if (detail.type === "profitForm") return "其他损益确认单详情";
  if (detail.type === "profitLedger") return "其他损益台账详情";
  if (detail.type === "accrual") return "其他损益预提台账详情";
  if (detail.type === "internal") return "内部交易信息详情";
  if (detail.type === "income") return "店铺收入台账详情";
  if (detail.type === "rate") return "预计退货率台账详情";
  return "物流费用结算详情";
}

function detailRows(detail: DetailData): Array<[string, ReactNode]> {
  if (detail.type === "profitForm") {
    const row = detail.row;
    return [["单据编号", row.code], ["状态", <StatusBadge key="status" status={row.status} />], ["核算主体", row.accountingEntity], ["对方公司", row.counterparty], ["流水编号", row.flowNo], ["金额", formatMoney(row.amount)], ["凭证号", row.voucherNo], ["同步状态", <StatusBadge key="sync" status={row.syncStatus} />], ["说明", row.description]];
  }
  if (detail.type === "profitLedger") {
    const row = detail.row;
    return [["台账编号", row.code], ["来源单据", row.sourceCode], ["核算主体", row.accountingEntity], ["对方公司", row.counterparty], ["交易日期", row.transactionDate], ["金额", formatMoney(row.amount)], ["凭证号", row.voucherNo], ["入账状态", <StatusBadge key="entry" status={row.entryStatus} />]];
  }
  if (detail.type === "accrual") {
    const row = detail.row;
    return [["台账编号", row.code], ["业务类型", row.businessType], ["预提月份", row.month], ["核算主体", row.accountingEntity], ["店铺", row.store], ["渠道", row.channel], ["预提金额", formatMoney(row.amount)], ["预提凭证", row.voucherNo], ["冲销凭证", row.reversalVoucherNo ?? "-"], ["冲销状态", <StatusBadge key="reverse" status={row.reversalStatus} />]];
  }
  if (detail.type === "internal") {
    const row = detail.row;
    return [["交易类型", row.type], ["交易月份", row.month], ["店铺", row.store], ["核算主体", row.accountingEntity], ["受托主体", row.trusteeEntity], ["入账金额", formatMoney(internalAmount(row))], ["是否入账", <StatusBadge key="booked" status={row.booked ? "已入账" : "未入账"} />], ["凭证号", row.voucherNo]];
  }
  if (detail.type === "income") {
    const row = detail.row;
    return [["月份", row.month], ["日期", row.date], ["核算主体", row.accountingEntity], ["店铺", row.store], ["渠道", row.channel], ["收入", formatMoney(row.income)], ["来源系统", row.sourceSystem], ["同步状态", <StatusBadge key="sync" status={row.syncStatus} />]];
  }
  if (detail.type === "rate") {
    const row = detail.row;
    return [["店铺", row.store], ["渠道", row.channel], ["5月预计退货率", formatPercent(row.rates[4])], ["6月预计退货率", formatPercent(row.rates[5])], ["导入批次", row.importBatch], ["更新人", row.updatedBy], ["更新时间", row.updatedAt]];
  }
  const row = detail.row;
  return [["结算单号", row.code], ["仓库", row.warehouse], ["物流", row.carrier], ["项", row.item], ["运单数量", row.waybillCount.toLocaleString("zh-CN")], ["金额", formatMoney(row.amount)], ["含税金额", formatMoney(row.taxIncludedAmount)], ["生成结果", row.generatedTarget], ["状态", <StatusBadge key="status" status={row.status} />]];
}

function viewTitle(view: ViewMode) {
  return viewTabs.find((item) => item.key === view)?.label ?? "其他损益";
}

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "workbench", label: "工作台" },
  { key: "forms", label: "其他损益确认单" },
  { key: "profitLedger", label: "其他损益台账" },
  { key: "accrualLedger", label: "其他损益预提台账" },
  { key: "internalLedger", label: "内部交易信息台账" },
  { key: "storeIncome", label: "店铺收入台账" },
  { key: "returnRates", label: "预计退货率台账" },
  { key: "logistics", label: "物流费用结算" }
];

function isBalanced(lines: JournalLine[]) {
  return Math.abs(balanceDiff(lines)) < 0.001;
}

function balanceDiff(lines: JournalLine[]) {
  return sum(lines.filter((item) => item.direction === "借方").map((item) => item.amount)) - sum(lines.filter((item) => item.direction === "贷方").map((item) => item.amount));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function nextVoucher(prefix: string) {
  return `${prefix}-202605-${String(Date.now()).slice(-4)}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function upsertById<T extends { id: string }>(rows: T[], item: T) {
  return rows.some((row) => row.id === item.id) ? rows.map((row) => row.id === item.id ? item : row) : [item, ...rows];
}

function matchText(values: string[], keyword: string) {
  return values.join(" ").toLowerCase().includes(keyword.trim().toLowerCase());
}

function matchFilter(value: string, filter: string, alternate?: string) {
  return filter === "全部" || value === filter || alternate === filter;
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
  return <div className="flex min-w-36 flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-blue-600 [&_button:hover]:underline">{children}</div>;
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

function Textarea({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options, labels, disabled = false }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; disabled?: boolean }) {
  const normalized = Array.from(new Set(options.includes(value) ? options : [value, ...options].filter(Boolean)));
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      {normalized.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}
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
    status.includes("失败") || status.includes("驳回") || status.includes("已冲销")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("通过") || status.includes("成功") || status.includes("已入账") || status.includes("已预提") || status.includes("已审批") || status.includes("平衡")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("中") || status.includes("审批") || status.includes("部分")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("未") || status.includes("草稿")
            ? "border-slate-200 bg-slate-100 text-slate-600"
            : "border-orange-200 bg-orange-50 text-orange-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status || "-"}</span>;
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <div className="grid gap-3 md:grid-cols-3">{rows.map(([label, value]) => <ReadOnly key={label} label={label} value={value} />)}</div>;
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
  if (steps.length === 0) return <div className="text-sm text-slate-500">暂无审批记录。</div>;
  return <div className="space-y-3">{steps.map((step, index) => <div key={`${step.node}-${index}`} className="flex gap-3"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">{index + 1}</div><div className="min-w-0 text-sm"><div className="font-medium">{step.node}</div><div className="text-slate-500">{step.approver} / {step.date}</div><div className="text-slate-600">{step.comment}</div></div></div>)}</div>;
}

function RecordList({ rows }: { rows: OperationLog[] }) {
  return <div className="space-y-2">{rows.map((row, index) => <div key={`${row.time}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"><div className="flex flex-col justify-between gap-1 md:flex-row md:items-center"><span className="font-medium">{row.action}</span><span className="text-slate-400">{row.time}</span></div><div className="mt-1 text-slate-500">{row.operator} / {row.comment}</div></div>)}</div>;
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
  return <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
}

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" | "blue" }) {
  const className = tone === "orange" ? "border-orange-200 bg-orange-50 text-orange-700" : tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`mb-4 rounded-lg border p-3 text-sm ${className}`}>{children}</div>;
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
