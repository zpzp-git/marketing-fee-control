"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type ViewMode = "ledger" | "badDebt";
type ReceivableStatus = "未收款" | "部分收款" | "已收清" | "计提中" | "已计提" | "核销中" | "已核销" | "坏账收回中" | "已关闭";
type RiskLevel = "低风险" | "中风险" | "高风险";
type AgeBucket = "1年以内" | "1年至2年" | "2年至3年" | "3年至4年" | "4年以上";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type ProcessType = "坏账申请" | "坏账确认" | "坏账收回" | "通用计提";
type ProcessStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "凭证生成中" | "凭证生成失败" | "已完成";
type ModalMode = "confirm" | "receipt" | "general" | "specific";

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface AgeingAmounts {
  within1: number;
  year1To2: number;
  year2To3: number;
  year3To4: number;
  over4: number;
}

interface ReceivableLedger {
  id: string;
  code: string;
  customer: string;
  accountingEntity: string;
  sourceDocument: string;
  businessType: string;
  contractCode: string;
  totalAmount: number;
  receivedAmount: number;
  writeOffAmount: number;
  balanceAmount: number;
  badDebtProvision: number;
  badDebtConfirmed: number;
  badDebtRecovered: number;
  dueDate: string;
  overdueDays: number;
  ageBucket: AgeBucket;
  riskLevel: RiskLevel;
  collectionStatus: string;
  lastReceiptAt: string;
  status: ReceivableStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  ageing: AgeingAmounts;
  receipts: OperationRecord[];
  steps: ApprovalStep[];
}

interface OperationRecord {
  id: string;
  time: string;
  channel: string;
  serialNo: string;
  result: string;
}

interface BadDebtProcess {
  id: string;
  code: string;
  sourceLedgerId: string;
  sourceLedgerCode: string;
  processType: ProcessType;
  customer: string;
  accountingEntity: string;
  totalReceivable: number;
  processAmount: number;
  previousProvision: number;
  currentProvision: number;
  additionalProvision: number;
  confirmedAmount: number;
  recoveredAmount: number;
  voucherNo: string;
  kingdeeVoucherNo: string;
  applicant: string;
  processDate: string;
  description: string;
  attachmentName: string;
  status: ProcessStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: AccrualLine[];
  steps: ApprovalStep[];
}

interface AccrualLine {
  id: string;
  ledgerId: string;
  customer: string;
  totalReceivable: number;
  ageing: AgeingAmounts;
  ratios: AgeingAmounts;
  previousProvision: number;
}

interface ConfirmFormState {
  customer: string;
  accountingEntity: string;
  businessType: string;
  contractCode: string;
  sourceDocument: string;
  amount: string;
  dueDate: string;
  description: string;
}

interface ReceiptFormState {
  ledgerId: string;
  processType: "收款" | "核销";
  receiptDate: string;
  receiptAmount: string;
  writeOffAmount: string;
  bankMatched: boolean;
  description: string;
}

interface GeneralFormState {
  accountingEntity: string;
  applicant: string;
  description: string;
  lines: AccrualLine[];
}

interface SpecificFormState {
  ledgerId: string;
  accountingEntity: string;
  applicant: string;
  processType: Exclude<ProcessType, "通用计提">;
  previousProvision: string;
  currentProvision: string;
  confirmedAmount: string;
  recoveredAmount: string;
  description: string;
  attachmentName: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const accountingEntities = ["上海示例贸易有限公司", "广州示例贸易有限公司", "杭州示例品牌管理有限公司", "成都示例电子商务有限公司"];
const customers = ["华东天猫旗舰店客户", "京东自营结算客户", "抖音渠道联合客户", "华南快闪活动客户", "小红书内容合作客户", "唯品会渠道客户", "KA 经销商客户", "社区团购客户"];
const riskLevels: RiskLevel[] = ["低风险", "中风险", "高风险"];
const ageBuckets: AgeBucket[] = ["1年以内", "1年至2年", "2年至3年", "3年至4年", "4年以上"];

const initialLedgers: ReceivableLedger[] = [
  {
    id: "ar-001",
    code: "YSZK-2026-001",
    customer: "华东天猫旗舰店客户",
    accountingEntity: "上海示例贸易有限公司",
    sourceDocument: "YSQR-2026-018",
    businessType: "销售返利确认",
    contractCode: "XSHT-2026-082",
    totalAmount: 120000,
    receivedAmount: 40000,
    writeOffAmount: 0,
    balanceAmount: 80000,
    badDebtProvision: 3600,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2025-10-20",
    overdueDays: 198,
    ageBucket: "1年以内",
    riskLevel: "中风险",
    collectionStatus: "已催收 2 次",
    lastReceiptAt: "2026-03-18",
    status: "部分收款",
    sourceSystem: "[ERP] 应收确认 / [OA] 审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 15:30:00",
    syncBatchNo: "SYNC-AR-2026050501",
    ageing: { within1: 80000, year1To2: 0, year2To3: 0, year3To4: 0, over4: 0 },
    receipts: [{ id: "r-001", time: "2026-03-18 13:20:00", channel: "银行流水 mock", serialNo: "BNK20260318018", result: "收款 40,000.00" }],
    steps: [{ node: "应收确认", approver: "刘晨", date: "2026-02-28", comment: "审批通过并生成应收台账" }]
  },
  {
    id: "ar-002",
    code: "YSZK-2026-002",
    customer: "京东自营结算客户",
    accountingEntity: "上海示例贸易有限公司",
    sourceDocument: "YSQR-2026-021",
    businessType: "渠道费用返还",
    contractCode: "XSHT-2025-119",
    totalAmount: 260000,
    receivedAmount: 0,
    writeOffAmount: 0,
    balanceAmount: 260000,
    badDebtProvision: 42000,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2024-12-10",
    overdueDays: 512,
    ageBucket: "1年至2年",
    riskLevel: "高风险",
    collectionStatus: "法务跟进",
    lastReceiptAt: "-",
    status: "已计提",
    sourceSystem: "[ERP] 应收确认",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 09:10:00",
    syncBatchNo: "SYNC-AR-2026050401",
    ageing: { within1: 0, year1To2: 180000, year2To3: 80000, year3To4: 0, over4: 0 },
    receipts: [],
    steps: [{ node: "坏账计提", approver: "陈菲", date: "2026-04-30", comment: "已完成通用计提" }]
  },
  {
    id: "ar-003",
    code: "YSZK-2026-003",
    customer: "抖音渠道联合客户",
    accountingEntity: "广州示例贸易有限公司",
    sourceDocument: "YSQR-2026-028",
    businessType: "直播坑位费结算",
    contractCode: "XSHT-2025-188",
    totalAmount: 88000,
    receivedAmount: 0,
    writeOffAmount: 30000,
    balanceAmount: 58000,
    badDebtProvision: 30000,
    badDebtConfirmed: 30000,
    badDebtRecovered: 10000,
    dueDate: "2023-11-15",
    overdueDays: 903,
    ageBucket: "2年至3年",
    riskLevel: "高风险",
    collectionStatus: "坏账收回中",
    lastReceiptAt: "2026-04-16",
    status: "坏账收回中",
    sourceSystem: "[OA] 单项坏账 / [金蝶] 凭证",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-03 17:25:00",
    syncBatchNo: "SYNC-AR-2026050301",
    failureReason: "金蝶凭证附件校验超时 [K3-504]",
    ageing: { within1: 0, year1To2: 0, year2To3: 58000, year3To4: 0, over4: 0 },
    receipts: [{ id: "r-002", time: "2026-04-16 11:08:00", channel: "银行流水 mock", serialNo: "BNK20260416027", result: "坏账收回 10,000.00" }],
    steps: [{ node: "单项坏账确认", approver: "周敏", date: "2026-03-11", comment: "审批通过，确认坏账 30,000.00" }]
  },
  {
    id: "ar-004",
    code: "YSZK-2026-004",
    customer: "华南快闪活动客户",
    accountingEntity: "广州示例贸易有限公司",
    sourceDocument: "YSQR-2026-033",
    businessType: "营销事项收入确认",
    contractCode: "YXSS-2026-036",
    totalAmount: 56000,
    receivedAmount: 56000,
    writeOffAmount: 0,
    balanceAmount: 0,
    badDebtProvision: 0,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2026-04-15",
    overdueDays: 0,
    ageBucket: "1年以内",
    riskLevel: "低风险",
    collectionStatus: "已收清",
    lastReceiptAt: "2026-04-12",
    status: "已收清",
    sourceSystem: "[ERP] 应收确认 / [银行] 流水",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-12 16:10:00",
    syncBatchNo: "SYNC-AR-2026041201",
    ageing: { within1: 0, year1To2: 0, year2To3: 0, year3To4: 0, over4: 0 },
    receipts: [{ id: "r-003", time: "2026-04-12 16:10:00", channel: "银行流水 mock", serialNo: "BNK20260412011", result: "收款 56,000.00" }],
    steps: [{ node: "收款核销", approver: "许宁", date: "2026-04-12", comment: "已收清并关闭风险" }]
  },
  {
    id: "ar-005",
    code: "YSZK-2026-005",
    customer: "小红书内容合作客户",
    accountingEntity: "杭州示例品牌管理有限公司",
    sourceDocument: "YSQR-2025-172",
    businessType: "内容渠道分摊",
    contractCode: "XSHT-2024-076",
    totalAmount: 142000,
    receivedAmount: 12000,
    writeOffAmount: 0,
    balanceAmount: 130000,
    badDebtProvision: 22000,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2023-09-30",
    overdueDays: 949,
    ageBucket: "2年至3年",
    riskLevel: "高风险",
    collectionStatus: "准备单项坏账",
    lastReceiptAt: "2024-02-18",
    status: "计提中",
    sourceSystem: "[ERP] 应收确认",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    ageing: { within1: 0, year1To2: 0, year2To3: 100000, year3To4: 30000, over4: 0 },
    receipts: [{ id: "r-004", time: "2024-02-18 10:20:00", channel: "银行流水 mock", serialNo: "BNK20240218018", result: "收款 12,000.00" }],
    steps: [{ node: "催收复核", approver: "王珊", date: "2026-04-26", comment: "建议进入单项坏账评估" }]
  },
  {
    id: "ar-006",
    code: "YSZK-2026-006",
    customer: "唯品会渠道客户",
    accountingEntity: "成都示例电子商务有限公司",
    sourceDocument: "YSQR-2025-211",
    businessType: "渠道补差确认",
    contractCode: "XSHT-2024-133",
    totalAmount: 76000,
    receivedAmount: 0,
    writeOffAmount: 0,
    balanceAmount: 76000,
    badDebtProvision: 76000,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2021-12-15",
    overdueDays: 1603,
    ageBucket: "4年以上",
    riskLevel: "高风险",
    collectionStatus: "长期逾期",
    lastReceiptAt: "-",
    status: "已计提",
    sourceSystem: "[ERP] 应收确认",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-30 12:08:00",
    syncBatchNo: "SYNC-AR-2026043001",
    ageing: { within1: 0, year1To2: 0, year2To3: 0, year3To4: 0, over4: 76000 },
    receipts: [],
    steps: [{ node: "通用计提", approver: "陈菲", date: "2026-04-30", comment: "4 年以上全额计提" }]
  },
  {
    id: "ar-007",
    code: "YSZK-2026-007",
    customer: "KA 经销商客户",
    accountingEntity: "上海示例贸易有限公司",
    sourceDocument: "YSQR-2026-041",
    businessType: "销售合同结算",
    contractCode: "XSHT-2026-201",
    totalAmount: 98000,
    receivedAmount: 30000,
    writeOffAmount: 0,
    balanceAmount: 68000,
    badDebtProvision: 0,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2026-06-30",
    overdueDays: 0,
    ageBucket: "1年以内",
    riskLevel: "低风险",
    collectionStatus: "待收款",
    lastReceiptAt: "2026-05-02",
    status: "部分收款",
    sourceSystem: "[ERP] 应收确认",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 09:00:00",
    syncBatchNo: "SYNC-AR-2026050201",
    ageing: { within1: 68000, year1To2: 0, year2To3: 0, year3To4: 0, over4: 0 },
    receipts: [{ id: "r-005", time: "2026-05-02 09:00:00", channel: "银行流水 mock", serialNo: "BNK20260502018", result: "收款 30,000.00" }],
    steps: [{ node: "应收确认", approver: "刘晨", date: "2026-04-30", comment: "审批通过" }]
  },
  {
    id: "ar-008",
    code: "YSZK-2026-008",
    customer: "社区团购客户",
    accountingEntity: "成都示例电子商务有限公司",
    sourceDocument: "YSQR-2026-044",
    businessType: "渠道代垫确认",
    contractCode: "XSHT-2025-233",
    totalAmount: 45000,
    receivedAmount: 0,
    writeOffAmount: 0,
    balanceAmount: 45000,
    badDebtProvision: 1500,
    badDebtConfirmed: 0,
    badDebtRecovered: 0,
    dueDate: "2025-08-10",
    overdueDays: 269,
    ageBucket: "1年以内",
    riskLevel: "中风险",
    collectionStatus: "本周待跟进",
    lastReceiptAt: "-",
    status: "未收款",
    sourceSystem: "[ERP] 应收确认",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-01 13:44:00",
    syncBatchNo: "SYNC-AR-2026050101",
    ageing: { within1: 45000, year1To2: 0, year2To3: 0, year3To4: 0, over4: 0 },
    receipts: [],
    steps: [{ node: "应收确认", approver: "赵倩", date: "2026-04-22", comment: "审批通过" }]
  }
];

const initialBadDebtProcesses: BadDebtProcess[] = [
  {
    id: "bd-001",
    code: "TYHJ-2026-001",
    sourceLedgerId: "ar-002",
    sourceLedgerCode: "YSZK-2026-002",
    processType: "通用计提",
    customer: "京东自营结算客户",
    accountingEntity: "上海示例贸易有限公司",
    totalReceivable: 260000,
    processAmount: 21000,
    previousProvision: 42000,
    currentProvision: 63000,
    additionalProvision: 21000,
    confirmedAmount: 0,
    recoveredAmount: 0,
    voucherNo: "YF-VOU-202604-021",
    kingdeeVoucherNo: "K3-VOU-202604-211",
    applicant: "陈菲",
    processDate: "2026-04-30",
    description: "按账龄组合补计提坏账准备。",
    attachmentName: "账龄分析表-202604.xlsx",
    status: "已完成",
    sourceSystem: "[OA] 审批 / [金蝶] 凭证",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-30 18:00:00",
    lines: [],
    steps: [
      { node: "财务初审", approver: "陈菲", date: "2026-04-30", comment: "提交通用计提申请" },
      { node: "财务负责人", approver: "周敏", date: "2026-04-30", comment: "审批通过并生成凭证" }
    ]
  },
  {
    id: "bd-002",
    code: "DXHZ-2026-002",
    sourceLedgerId: "ar-003",
    sourceLedgerCode: "YSZK-2026-003",
    processType: "坏账收回",
    customer: "抖音渠道联合客户",
    accountingEntity: "广州示例贸易有限公司",
    totalReceivable: 88000,
    processAmount: 10000,
    previousProvision: 30000,
    currentProvision: 30000,
    additionalProvision: 0,
    confirmedAmount: 0,
    recoveredAmount: 10000,
    voucherNo: "YF-VOU-202604-037",
    kingdeeVoucherNo: "-",
    applicant: "王珊",
    processDate: "2026-04-16",
    description: "客户追回部分坏账款项，模拟同步金蝶失败。",
    attachmentName: "银行流水截图.png",
    status: "凭证生成失败",
    sourceSystem: "[OA] 审批 / [金蝶] 凭证",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-03 17:25:00",
    failureReason: "金蝶凭证附件校验超时 [K3-504]",
    lines: [],
    steps: [
      { node: "业务审批", approver: "许宁", date: "2026-04-16", comment: "确认收回事实" },
      { node: "财务复核", approver: "周敏", date: "2026-04-16", comment: "允许生成收回凭证" }
    ]
  }
];

const emptyConfirmForm: ConfirmFormState = {
  customer: customers[0],
  accountingEntity: accountingEntities[0],
  businessType: "销售合同结算",
  contractCode: "XSHT-2026-NEW",
  sourceDocument: "YSQR-2026-NEW",
  amount: "68000",
  dueDate: "2026-06-30",
  description: "根据销售合同结算单确认营销相关应收。"
};

export default function ReceivablesPage() {
  const [view, setView] = useState<ViewMode>("ledger");
  const [ledgers, setLedgers] = useState<ReceivableLedger[]>(initialLedgers);
  const [badDebtProcesses, setBadDebtProcesses] = useState<BadDebtProcess[]>(initialBadDebtProcesses);
  const [filters, setFilters] = useState({ keyword: "", entity: "", ageBucket: "", riskLevel: "", status: "" });
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [overlayLoading, setOverlayLoading] = useState("");
  const [detail, setDetail] = useState<{ title: string; children: ReactNode } | null>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmForm, setConfirmForm] = useState<ConfirmFormState>(emptyConfirmForm);
  const [receiptForm, setReceiptForm] = useState<ReceiptFormState | null>(null);
  const [generalForm, setGeneralForm] = useState<GeneralFormState | null>(null);
  const [specificForm, setSpecificForm] = useState<SpecificFormState | null>(null);

  const filteredLedgers = useMemo(() => filterLedgers(ledgers, filters), [ledgers, filters]);
  const filteredBadDebtProcesses = useMemo(() => filterBadDebt(badDebtProcesses, filters), [badDebtProcesses, filters]);
  const currentCount = view === "ledger" ? filteredLedgers.length : filteredBadDebtProcesses.length;
  const stats = useMemo(() => buildStats(ledgers, badDebtProcesses), [ledgers, badDebtProcesses]);
  const ageStats = useMemo(() => buildAgeStats(ledgers), [ledgers]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function simulateQuery() {
    setLoading(true);
    setPageError("");
    window.setTimeout(() => setLoading(false), 650);
  }

  function resetFilters() {
    setFilters({ keyword: "", entity: "", ageBucket: "", riskLevel: "", status: "" });
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
  }

  function openConfirmForm() {
    setErrors({});
    setConfirmForm(emptyConfirmForm);
    setModal("confirm");
  }

  function openReceiptForm(ledgerId: string) {
    const ledger = ledgers.find((item) => item.id === ledgerId);
    if (!ledger || ledger.balanceAmount <= 0) {
      showToast("该应收已无可处理余额。");
      return;
    }
    setErrors({});
    setReceiptForm({
      ledgerId,
      processType: "收款",
      receiptDate: today,
      receiptAmount: String(Math.min(ledger.balanceAmount, 20000)),
      writeOffAmount: "0",
      bankMatched: false,
      description: "模拟匹配银行流水并核减应收余额。"
    });
    setModal("receipt");
  }

  function openGeneralForm(ledgerId?: string) {
    const candidates = ledgerId ? ledgers.filter((item) => item.id === ledgerId) : ledgers.filter((item) => item.balanceAmount > 0 && item.status !== "已收清").slice(0, 3);
    const lines = candidates.map((ledger) => buildAccrualLine(ledger));
    setErrors({});
    setGeneralForm({
      accountingEntity: candidates[0]?.accountingEntity ?? accountingEntities[0],
      applicant: "陈菲",
      description: "按账龄组合自动计算本期计提金额，本期补计提金额=本期计提金额-上期计提金额。",
      lines
    });
    setModal("general");
  }

  function openSpecificForm(ledgerId: string, type: Exclude<ProcessType, "通用计提"> = "坏账确认") {
    const ledger = ledgers.find((item) => item.id === ledgerId);
    if (!ledger || ledger.balanceAmount <= 0) {
      showToast("该应收已无可处理余额。");
      return;
    }
    setErrors({});
    setSpecificForm({
      ledgerId,
      accountingEntity: ledger.accountingEntity,
      applicant: "王珊",
      processType: type,
      previousProvision: String(ledger.badDebtProvision),
      currentProvision: String(Math.min(ledger.balanceAmount, Math.max(ledger.badDebtProvision, ledger.balanceAmount * 0.5))),
      confirmedAmount: String(type === "坏账确认" ? ledger.balanceAmount : 0),
      recoveredAmount: String(type === "坏账收回" ? Math.min(ledger.badDebtConfirmed || ledger.balanceAmount, 10000) : 0),
      description: "根据客户回款风险及催收材料发起单项坏账处理。",
      attachmentName: "坏账申请材料.pdf"
    });
    setModal("specific");
  }

  function submitConfirmation(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const amount = Number(confirmForm.amount);
    if (!confirmForm.customer) nextErrors.customer = "请选择客户";
    if (!confirmForm.accountingEntity) nextErrors.accountingEntity = "请选择核算主体";
    if (!amount || amount <= 0) nextErrors.amount = "应收金额必须大于 0";
    if (!confirmForm.dueDate) nextErrors.dueDate = "请输入预计收款日期";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const code = `YSZK-2026-${String(ledgers.length + 1).padStart(3, "0")}`;
      const ageing = buildAgeingByDueDate(confirmForm.dueDate, amount);
      const ledger: ReceivableLedger = {
        id: `ar-${Date.now()}`,
        code,
        customer: confirmForm.customer,
        accountingEntity: confirmForm.accountingEntity,
        sourceDocument: confirmForm.sourceDocument || `YSQR-2026-${String(ledgers.length + 20).padStart(3, "0")}`,
        businessType: confirmForm.businessType,
        contractCode: confirmForm.contractCode,
        totalAmount: amount,
        receivedAmount: 0,
        writeOffAmount: 0,
        balanceAmount: amount,
        badDebtProvision: 0,
        badDebtConfirmed: 0,
        badDebtRecovered: 0,
        dueDate: confirmForm.dueDate,
        overdueDays: calculateOverdueDays(confirmForm.dueDate),
        ageBucket: getAgeBucket(calculateOverdueDays(confirmForm.dueDate)),
        riskLevel: calculateOverdueDays(confirmForm.dueDate) > 365 ? "高风险" : calculateOverdueDays(confirmForm.dueDate) > 90 ? "中风险" : "低风险",
        collectionStatus: "待收款",
        lastReceiptAt: "-",
        status: "未收款",
        sourceSystem: "[OA] 应收确认审批 / [ERP] 应收",
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        syncBatchNo: `SYNC-AR-${Date.now()}`,
        ageing,
        receipts: [],
        steps: [
          { node: "业务提交", approver: "业务员", date: today, comment: "提交应收账款确认单" },
          { node: "财务审批", approver: "刘晨", date: today, comment: "模拟审批通过，生成应收账款台账" }
        ]
      };
      setLedgers((items) => [ledger, ...items]);
      setSubmitting(false);
      setModal(null);
      setView("ledger");
      showToast("应收账款确认单已模拟审批通过，台账已生成。");
    }, 700);
  }

  function submitReceipt(event: FormEvent) {
    event.preventDefault();
    if (!receiptForm) return;
    const ledger = ledgers.find((item) => item.id === receiptForm.ledgerId);
    if (!ledger) return;
    const receiptAmount = Number(receiptForm.receiptAmount || 0);
    const writeOffAmount = Number(receiptForm.writeOffAmount || 0);
    const totalProcessAmount = receiptAmount + writeOffAmount;
    const nextErrors: Record<string, string> = {};
    if (totalProcessAmount <= 0) nextErrors.amount = "本次收款金额或核销金额必须大于 0";
    if (totalProcessAmount > ledger.balanceAmount) nextErrors.amount = "本次处理金额不能超过应收余额";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setLedgers((items) =>
        items.map((item) => {
          if (item.id !== ledger.id) return item;
          const receivedAmount = item.receivedAmount + receiptAmount;
          const writeOffTotal = item.writeOffAmount + writeOffAmount;
          const balanceAmount = Math.max(item.balanceAmount - totalProcessAmount, 0);
          return {
            ...item,
            receivedAmount,
            writeOffAmount: writeOffTotal,
            balanceAmount,
            ageing: balanceAmount === 0 ? zeroAgeing() : scaleAgeing(item.ageing, item.balanceAmount, balanceAmount),
            status: balanceAmount === 0 ? (writeOffTotal > 0 ? "已核销" : "已收清") : writeOffAmount > 0 ? "核销中" : "部分收款",
            collectionStatus: balanceAmount === 0 ? "已关闭" : "部分处理",
            lastReceiptAt: receiptForm.receiptDate,
            sourceSystem: "[OA] 收款/核销审批 / [银行] 流水",
            syncStatus: "同步成功",
            lastSyncAt: nowText,
            syncBatchNo: `SYNC-RCPT-${Date.now()}`,
            receipts: [
              {
                id: `receipt-${Date.now()}`,
                time: nowText,
                channel: receiptForm.bankMatched ? "银行流水 mock" : "手工登记 mock",
                serialNo: `BNK${Date.now()}`,
                result: `${receiptForm.processType} ${formatMoney(totalProcessAmount)}，剩余 ${formatMoney(balanceAmount)}`
              },
              ...item.receipts
            ],
            steps: [...item.steps, { node: "收款/核销审批", approver: "许宁", date: today, comment: "审批通过并更新应收余额" }]
          };
        })
      );
      setSubmitting(false);
      setModal(null);
      showToast("收款/核销单已模拟审批通过，应收余额已更新。");
    }, 700);
  }

  function submitGeneralAccrual(event: FormEvent) {
    event.preventDefault();
    if (!generalForm) return;
    const nextErrors = validateGeneralForm(generalForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const amount = calculateGeneralTotal(generalForm.lines);
    setSubmitting(true);
    window.setTimeout(() => {
      const mainLine = generalForm.lines[0];
      const process: BadDebtProcess = {
        id: `bd-${Date.now()}`,
        code: `TYHJ-2026-${String(badDebtProcesses.length + 1).padStart(3, "0")}`,
        sourceLedgerId: mainLine.ledgerId,
        sourceLedgerCode: ledgers.find((item) => item.id === mainLine.ledgerId)?.code ?? "-",
        processType: "通用计提",
        customer: generalForm.lines.map((line) => line.customer).join("、"),
        accountingEntity: generalForm.accountingEntity,
        totalReceivable: sum(generalForm.lines.map((line) => line.totalReceivable)),
        processAmount: amount,
        previousProvision: sum(generalForm.lines.map((line) => line.previousProvision)),
        currentProvision: sum(generalForm.lines.map((line) => calculateLineCurrentProvision(line))),
        additionalProvision: amount,
        confirmedAmount: 0,
        recoveredAmount: 0,
        voucherNo: "-",
        kingdeeVoucherNo: "-",
        applicant: generalForm.applicant,
        processDate: today,
        description: generalForm.description,
        attachmentName: "账龄计提测算表.xlsx",
        status: "审批中",
        sourceSystem: "[OA] 通用坏账计提审批",
        syncStatus: "未同步",
        lastSyncAt: "-",
        lines: generalForm.lines,
        steps: [{ node: "财务提交", approver: generalForm.applicant, date: today, comment: "提交通用坏账计提单" }]
      };
      setBadDebtProcesses((items) => [process, ...items]);
      setLedgers((items) => items.map((item) => (generalForm.lines.some((line) => line.ledgerId === item.id) ? { ...item, status: "计提中" } : item)));
      setSubmitting(false);
      setModal(null);
      setView("badDebt");
      showToast("通用坏账计提单已提交 OA mock 审批。");
    }, 650);
  }

  function submitSpecificBadDebt(event: FormEvent) {
    event.preventDefault();
    if (!specificForm) return;
    const ledger = ledgers.find((item) => item.id === specificForm.ledgerId);
    if (!ledger) return;
    const nextErrors = validateSpecificForm(specificForm, ledger);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const currentProvision = Number(specificForm.currentProvision || 0);
    const previousProvision = Number(specificForm.previousProvision || 0);
    const confirmedAmount = specificForm.processType === "坏账确认" ? Number(specificForm.confirmedAmount || 0) : 0;
    const recoveredAmount = specificForm.processType === "坏账收回" ? Number(specificForm.recoveredAmount || 0) : 0;
    const additionalProvision = specificForm.processType === "坏账申请" ? currentProvision - previousProvision : 0;
    const processAmount = specificForm.processType === "坏账申请" ? additionalProvision : specificForm.processType === "坏账确认" ? confirmedAmount : recoveredAmount;
    setSubmitting(true);
    window.setTimeout(() => {
      const process: BadDebtProcess = {
        id: `bd-${Date.now()}`,
        code: `DXHZ-2026-${String(badDebtProcesses.length + 1).padStart(3, "0")}`,
        sourceLedgerId: ledger.id,
        sourceLedgerCode: ledger.code,
        processType: specificForm.processType,
        customer: ledger.customer,
        accountingEntity: specificForm.accountingEntity,
        totalReceivable: ledger.totalAmount,
        processAmount,
        previousProvision,
        currentProvision,
        additionalProvision,
        confirmedAmount,
        recoveredAmount,
        voucherNo: "-",
        kingdeeVoucherNo: "-",
        applicant: specificForm.applicant,
        processDate: today,
        description: specificForm.description,
        attachmentName: specificForm.attachmentName,
        status: "审批中",
        sourceSystem: "[OA] 单项坏账审批",
        syncStatus: "未同步",
        lastSyncAt: "-",
        lines: [buildAccrualLine(ledger)],
        steps: [{ node: "财务提交", approver: specificForm.applicant, date: today, comment: `提交${specificForm.processType}单` }]
      };
      setBadDebtProcesses((items) => [process, ...items]);
      setLedgers((items) => items.map((item) => (item.id === ledger.id ? { ...item, status: specificForm.processType === "坏账收回" ? "坏账收回中" : "计提中" } : item)));
      setSubmitting(false);
      setModal(null);
      setView("badDebt");
      showToast("单项坏账申请单已提交 OA mock 审批。");
    }, 650);
  }

  function updateProcessStatus(id: string, status: Extract<ProcessStatus, "审批通过" | "已驳回">) {
    setBadDebtProcesses((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              failureReason: status === "已驳回" ? "模拟驳回：请补充催收记录或账龄分析说明。" : undefined,
              steps: [...item.steps, { node: "审批节点", approver: "周敏", date: today, comment: status === "已驳回" ? "模拟审批驳回" : "模拟审批通过，可生成凭证" }]
            }
          : item
      )
    );
    showToast(status === "审批通过" ? "审批通过，可继续模拟生成业财凭证。" : "已模拟驳回，单据可重新编辑后提交。");
  }

  function generateVoucher(id: string, success: boolean) {
    const process = badDebtProcesses.find((item) => item.id === id);
    if (!process) return;
    setOverlayLoading(success ? "正在生成业财凭证并同步金蝶" : "正在模拟凭证生成失败");
    setBadDebtProcesses((items) => items.map((item) => (item.id === id ? { ...item, status: "凭证生成中", syncStatus: "同步中", failureReason: undefined } : item)));
    window.setTimeout(() => {
      setOverlayLoading("");
      if (!success) {
        setBadDebtProcesses((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "凭证生成失败",
                  syncStatus: "同步失败",
                  lastSyncAt: nowText,
                  failureReason: "金蝶返回：凭证摘要缺少坏账处理说明 [K3-AR-409]",
                  steps: [...item.steps, { node: "凭证生成", approver: "系统", date: today, comment: "模拟凭证生成失败" }]
                }
              : item
          )
        );
        showToast("已模拟凭证生成失败，可重试生成。");
        return;
      }
      const voucherNo = `YF-VOU-202605-${String(Math.floor(Math.random() * 900) + 100)}`;
      const kingdeeVoucherNo = `K3-VOU-202605-${String(Math.floor(Math.random() * 900) + 100)}`;
      setBadDebtProcesses((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "已完成",
                voucherNo,
                kingdeeVoucherNo,
                sourceSystem: "[OA] 审批 / [业财中台] 凭证 / [金蝶] 凭证",
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                failureReason: undefined,
                steps: [...item.steps, { node: "凭证生成", approver: "系统", date: today, comment: `生成业财凭证 ${voucherNo}，回写金蝶凭证 ${kingdeeVoucherNo}` }]
              }
            : item
        )
      );
      applyBadDebtProcess(process, voucherNo, kingdeeVoucherNo);
      showToast("凭证已模拟生成并回写，应收账款台账已更新。");
    }, 900);
  }

  function retryLedgerSync(id: string) {
    setLedgers((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              syncStatus: "同步成功",
              lastSyncAt: nowText,
              syncBatchNo: `SYNC-AR-RETRY-${Date.now()}`,
              failureReason: undefined
            }
          : item
      )
    );
    showToast("已模拟重新同步金蝶状态。");
  }

  function applyBadDebtProcess(process: BadDebtProcess, voucherNo: string, kingdeeVoucherNo: string) {
    setLedgers((items) =>
      items.map((ledger) => {
        const relatedLine = process.lines.find((line) => line.ledgerId === ledger.id);
        const isMain = process.sourceLedgerId === ledger.id || Boolean(relatedLine);
        if (!isMain) return ledger;
        const currentProvision = relatedLine ? calculateLineCurrentProvision(relatedLine) : process.currentProvision;
        const provisionDelta = process.processType === "通用计提" ? Math.max(currentProvision - ledger.badDebtProvision, 0) : process.additionalProvision;
        const badDebtProvision = process.processType === "坏账申请" || process.processType === "通用计提" ? Math.max(ledger.badDebtProvision + provisionDelta, currentProvision, ledger.badDebtProvision) : ledger.badDebtProvision;
        const badDebtConfirmed = ledger.badDebtConfirmed + process.confirmedAmount;
        const badDebtRecovered = ledger.badDebtRecovered + process.recoveredAmount;
        const writeOffAmount = ledger.writeOffAmount + process.confirmedAmount;
        const balanceAmount = Math.max(ledger.balanceAmount - process.confirmedAmount + process.recoveredAmount, 0);
        return {
          ...ledger,
          badDebtProvision,
          badDebtConfirmed,
          badDebtRecovered,
          writeOffAmount,
          balanceAmount,
          ageing: balanceAmount === 0 ? zeroAgeing() : scaleAgeing(ledger.ageing, ledger.balanceAmount, balanceAmount),
          status: process.processType === "坏账确认" && balanceAmount === 0 ? "已核销" : process.processType === "坏账收回" ? "坏账收回中" : "已计提",
          collectionStatus: process.processType === "坏账确认" ? "已坏账核销" : process.processType === "坏账收回" ? "存在收回记录" : "已计提坏账准备",
          sourceSystem: "[OA] 坏账审批 / [金蝶] 凭证",
          syncStatus: "同步成功",
          lastSyncAt: nowText,
          syncBatchNo: `SYNC-BD-${Date.now()}`,
          receipts: [
            {
              id: `bd-op-${Date.now()}`,
              time: nowText,
              channel: "金蝶凭证 mock",
              serialNo: kingdeeVoucherNo,
              result: `${process.processType} ${formatMoney(process.processAmount)}，业财凭证 ${voucherNo}`
            },
            ...ledger.receipts
          ],
          steps: [...ledger.steps, { node: process.processType, approver: process.applicant, date: today, comment: `凭证回写并更新台账：${formatMoney(process.processAmount)}` }]
        };
      })
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">应收账款管理</div>
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
          <div className="mb-4 text-sm text-slate-500">财务处理 / 应收账款管理 / 3.7.8</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">应收账款管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">应收确认、收款核销、通用坏账计提、单项坏账确认与凭证回写的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openConfirmForm}>新建应收确认单</Button>
              <Button variant="secondary" onClick={() => openGeneralForm()}>通用坏账计提</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：应收账款台账服务响应超时，请点击重试。")}>模拟异常</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-5">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-xl font-semibold tabular-nums">{item.value}</div>
                <div className="mt-1 text-xs text-slate-400">{item.sub}</div>
              </div>
            ))}
          </div>

          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <h2 className="font-semibold">账龄分布统计</h2>
                <p className="text-sm text-slate-500">按当前 mock 台账余额汇总，辅助演示坏账计提依据。</p>
              </div>
              <div className="text-xs text-slate-400">本期补计提金额 = 本期计提金额 - 上期计提金额</div>
            </div>
            <div className="space-y-3">
              {ageStats.map((item) => (
                <div key={item.label} className="grid gap-2 md:grid-cols-[88px_1fr_140px] md:items-center">
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`${item.className} ${item.widthClass}`} />
                  </div>
                  <div className="text-right text-sm tabular-nums text-slate-700">{formatMoney(item.amount)}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "ledger" as ViewMode, label: "应收账款台账" },
                { key: "badDebt" as ViewMode, label: "坏账处理台账" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${view === tab.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  onClick={() => {
                    setView(tab.key);
                    resetFilters();
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <FilterBar filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} view={view} />

            {pageError && (
              <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="text-left font-medium text-red-700 underline" onClick={simulateQuery}>
                  重试加载
                </button>
              </div>
            )}

            <Alert tone="blue">第三方系统均为 mock：OA 审批、金蝶凭证、ERP 应收、银行流水、客户对账与附件上传只更新前端状态。</Alert>

            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : currentCount === 0 ? (
                <EmptyState onReset={resetFilters} onCreate={openConfirmForm} />
              ) : view === "ledger" ? (
                <ReceivableTable rows={filteredLedgers} onDetail={(item) => setDetail({ title: item.code, children: <ReceivableDetail item={item} badDebtProcesses={badDebtProcesses} onRetrySync={retryLedgerSync} /> })} onReceipt={openReceiptForm} onGeneral={openGeneralForm} onSpecific={openSpecificForm} onRetrySync={retryLedgerSync} />
              ) : (
                <BadDebtTable rows={filteredBadDebtProcesses} onDetail={(item) => setDetail({ title: item.code, children: <BadDebtDetail item={item} /> })} onApprove={(id) => updateProcessStatus(id, "审批通过")} onReject={(id) => updateProcessStatus(id, "已驳回")} onVoucher={generateVoucher} />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
              <span>共 {currentCount} 条，当前第 1 / 1 页</span>
              <div className="flex gap-2">
                <button className="rounded border border-slate-200 px-3 py-1 text-slate-400">上一页</button>
                <button className="rounded border border-slate-200 px-3 py-1 text-slate-400">下一页</button>
              </div>
            </div>
          </section>
        </section>
      </div>

      {detail && (
        <Drawer title={detail.title} onClose={() => setDetail(null)}>
          {detail.children}
        </Drawer>
      )}

      {modal === "confirm" && <ConfirmFormModal form={confirmForm} errors={errors} submitting={submitting} onChange={(patch) => setConfirmForm((current) => ({ ...current, ...patch }))} onClose={() => setModal(null)} onSubmit={submitConfirmation} />}
      {modal === "receipt" && receiptForm && <ReceiptFormModal form={receiptForm} errors={errors} ledger={ledgers.find((item) => item.id === receiptForm.ledgerId)} submitting={submitting} onChange={(patch) => setReceiptForm((current) => (current ? { ...current, ...patch } : current))} onClose={() => setModal(null)} onSubmit={submitReceipt} />}
      {modal === "general" && generalForm && (
        <GeneralAccrualModal
          form={generalForm}
          errors={errors}
          ledgers={ledgers}
          submitting={submitting}
          onChange={(patch) => setGeneralForm((current) => (current ? { ...current, ...patch } : current))}
          onAddLine={(ledgerId) => setGeneralForm((current) => addAccrualLine(current, ledgers.find((item) => item.id === ledgerId)))}
          onRemoveLine={(lineId) => setGeneralForm((current) => (current ? { ...current, lines: current.lines.filter((line) => line.id !== lineId) } : current))}
          onUpdateLine={(lineId, patch) => setGeneralForm((current) => updateAccrualLine(current, lineId, patch))}
          onClose={() => setModal(null)}
          onSubmit={submitGeneralAccrual}
        />
      )}
      {modal === "specific" && specificForm && <SpecificBadDebtModal form={specificForm} errors={errors} ledger={ledgers.find((item) => item.id === specificForm.ledgerId)} submitting={submitting} onChange={(patch) => setSpecificForm((current) => (current ? normalizeSpecificForm({ ...current, ...patch }, ledgers.find((item) => item.id === current.ledgerId)) : current))} onClose={() => setModal(null)} onSubmit={submitSpecificBadDebt} />}

      {overlayLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white px-6 py-5 text-center shadow-lg">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
            <div className="font-medium">{overlayLoading}</div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function ReceivableTable({
  rows,
  onDetail,
  onReceipt,
  onGeneral,
  onSpecific,
  onRetrySync
}: {
  rows: ReceivableLedger[];
  onDetail: (item: ReceivableLedger) => void;
  onReceipt: (id: string) => void;
  onGeneral: (id: string) => void;
  onSpecific: (id: string, type?: Exclude<ProcessType, "通用计提">) => void;
  onRetrySync: (id: string) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>应收编号</Th>
          <Th>客户名称</Th>
          <Th>核算主体</Th>
          <Th>应收总额</Th>
          <Th>已收/核销</Th>
          <Th>应收余额</Th>
          <Th>账龄区间</Th>
          <Th>风险</Th>
          <Th>坏账准备</Th>
          <Th>状态</Th>
          <Th>同步</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id}>
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>
                {item.code}
              </button>
              <div className="mt-1 text-xs text-slate-400">{item.sourceDocument}</div>
            </Td>
            <Td>{item.customer}</Td>
            <Td>{item.accountingEntity}</Td>
            <Td align="right">{formatMoney(item.totalAmount)}</Td>
            <Td align="right">{formatMoney(item.receivedAmount + item.writeOffAmount)}</Td>
            <Td align="right" danger={item.balanceAmount > 0}>
              {formatMoney(item.balanceAmount)}
            </Td>
            <Td>{item.ageBucket}</Td>
            <Td>
              <StatusBadge status={item.riskLevel} />
            </Td>
            <Td align="right">{formatMoney(item.badDebtProvision)}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && (
                <button className="mt-1 block max-w-40 truncate text-left text-xs text-red-600 underline" onClick={() => onRetrySync(item.id)}>
                  {item.failureReason}
                </button>
              )}
            </Td>
            <Td>
              <InlineActions>
                {item.balanceAmount > 0 && <button onClick={() => onReceipt(item.id)}>收款核销</button>}
                {item.balanceAmount > 0 && <button onClick={() => onGeneral(item.id)}>发起计提</button>}
                {item.balanceAmount > 0 && <button onClick={() => onSpecific(item.id)}>单项坏账</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BadDebtTable({
  rows,
  onDetail,
  onApprove,
  onReject,
  onVoucher
}: {
  rows: BadDebtProcess[];
  onDetail: (item: BadDebtProcess) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onVoucher: (id: string, success: boolean) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>处理编号</Th>
          <Th>处理类型</Th>
          <Th>客户/来源</Th>
          <Th>应收总额</Th>
          <Th>处理金额</Th>
          <Th>凭证号</Th>
          <Th>金蝶凭证</Th>
          <Th>审批状态</Th>
          <Th>同步</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id}>
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>
                {item.code}
              </button>
              <div className="mt-1 text-xs text-slate-400">{item.processDate}</div>
            </Td>
            <Td>{item.processType}</Td>
            <Td>
              <div className="max-w-56 truncate">{item.customer}</div>
              <div className="text-xs text-slate-400">{item.sourceLedgerCode}</div>
            </Td>
            <Td align="right">{formatMoney(item.totalReceivable)}</Td>
            <Td align="right" danger={item.processAmount < 0}>
              {formatMoney(item.processAmount)}
            </Td>
            <Td>{item.voucherNo}</Td>
            <Td>{item.kingdeeVoucherNo}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 max-w-48 truncate text-xs text-red-600">{item.failureReason}</div>}
            </Td>
            <Td>
              <InlineActions>
                {item.status === "审批中" && (
                  <>
                    <button onClick={() => onApprove(item.id)}>审批通过</button>
                    <button onClick={() => onReject(item.id)}>驳回</button>
                  </>
                )}
                {["审批通过", "凭证生成失败"].includes(item.status) && (
                  <>
                    <button onClick={() => onVoucher(item.id, true)}>生成凭证</button>
                    <button onClick={() => onVoucher(item.id, false)}>模拟失败</button>
                  </>
                )}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConfirmFormModal({ form, errors, submitting, onChange, onClose, onSubmit }: { form: ConfirmFormState; errors: Record<string, string>; submitting: boolean; onChange: (patch: Partial<ConfirmFormState>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return (
    <Modal title="应收账款确认单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="主表区">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="客户名称" required error={errors.customer}>
              <Select value={form.customer} onChange={(value) => onChange({ customer: value })} options={customers} />
            </Field>
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Select value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} options={accountingEntities} />
            </Field>
            <Field label="来源业务类型">
              <Select value={form.businessType} onChange={(value) => onChange({ businessType: value })} options={["销售合同结算", "销售返利确认", "营销事项收入确认", "渠道代垫确认"]} />
            </Field>
            <Field label="合同编号/事项编号">
              <Input value={form.contractCode} onChange={(value) => onChange({ contractCode: value })} />
            </Field>
            <Field label="来源单据">
              <Input value={form.sourceDocument} onChange={(value) => onChange({ sourceDocument: value })} />
            </Field>
            <Field label="应收金额" required error={errors.amount}>
              <Input value={form.amount} onChange={(value) => onChange({ amount: value })} />
            </Field>
            <Field label="预计收款日期" required error={errors.dueDate}>
              <Input value={form.dueDate} onChange={(value) => onChange({ dueDate: value })} />
            </Field>
            <ReadOnly label="申请日期" value={today} />
            <ReadOnly label="审批结果" value="提交后模拟审批通过并生成台账" />
          </div>
        </Section>
        <Section title="明细区">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>行号</Th>
                <Th>费用/收入项目</Th>
                <Th>业务日期</Th>
                <Th>应收金额</Th>
                <Th>税率</Th>
                <Th>含税金额</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>1</Td>
                <Td>{form.businessType}</Td>
                <Td>{today}</Td>
                <Td align="right">{formatMoney(Number(form.amount || 0))}</Td>
                <Td>6%</Td>
                <Td align="right">{formatMoney(Number(form.amount || 0))}</Td>
              </tr>
            </tbody>
          </table>
        </Section>
        <Section title="说明">
          <Field label="说明">
            <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
          </Field>
        </Section>
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="secondary" onClick={() => onChange({ description: `${form.description}（已保存草稿 mock）` })}>保存草稿</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "提交审批"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function ReceiptFormModal({ form, errors, ledger, submitting, onChange, onClose, onSubmit }: { form: ReceiptFormState; errors: Record<string, string>; ledger?: ReceivableLedger; submitting: boolean; onChange: (patch: Partial<ReceiptFormState>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  const receiptAmount = Number(form.receiptAmount || 0);
  const writeOffAmount = Number(form.writeOffAmount || 0);
  const remaining = Math.max((ledger?.balanceAmount ?? 0) - receiptAmount - writeOffAmount, 0);
  return (
    <Modal title="收款/核销单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="主表区">
          <div className="grid gap-3 md:grid-cols-3">
            <ReadOnly label="应收编号" value={ledger?.code ?? "-"} />
            <ReadOnly label="客户名称" value={ledger?.customer ?? "-"} />
            <ReadOnly label="核算主体" value={ledger?.accountingEntity ?? "-"} />
            <Field label="处理类型">
              <Select value={form.processType} onChange={(value) => onChange({ processType: value as ReceiptFormState["processType"] })} options={["收款", "核销"]} />
            </Field>
            <Field label="收款日期">
              <Input value={form.receiptDate} onChange={(value) => onChange({ receiptDate: value })} />
            </Field>
            <ReadOnly label="应收余额" value={formatMoney(ledger?.balanceAmount ?? 0)} />
            <Field label="本次收款金额" error={errors.amount}>
              <Input value={form.receiptAmount} onChange={(value) => onChange({ receiptAmount: value })} />
            </Field>
            <Field label="本次核销金额" error={errors.amount}>
              <Input value={form.writeOffAmount} onChange={(value) => onChange({ writeOffAmount: value })} />
            </Field>
            <ReadOnly label="剩余余额" value={formatMoney(remaining)} />
          </div>
        </Section>
        <Section title="银行流水匹配">
          <div className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center">
            <div>
              <div className="font-medium">模拟匹配银行流水</div>
              <div className="text-sm text-slate-500">{form.bankMatched ? `已匹配流水 BNK${today.replaceAll("-", "")}001` : "未连接真实银行，仅模拟选中流水状态。"}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onChange({ bankMatched: !form.bankMatched })}>{form.bankMatched ? "取消匹配" : "匹配流水"}</Button>
          </div>
        </Section>
        <Section title="说明">
          <Field label="说明">
            <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
          </Field>
        </Section>
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "审批中..." : "提交并审批通过"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function GeneralAccrualModal({
  form,
  errors,
  ledgers,
  submitting,
  onChange,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  onClose,
  onSubmit
}: {
  form: GeneralFormState;
  errors: Record<string, string>;
  ledgers: ReceivableLedger[];
  submitting: boolean;
  onChange: (patch: Partial<GeneralFormState>) => void;
  onAddLine: (ledgerId: string) => void;
  onRemoveLine: (lineId: string) => void;
  onUpdateLine: (lineId: string, patch: Partial<AccrualLine>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const selectedIds = new Set(form.lines.map((line) => line.ledgerId));
  const availableLedgers = ledgers.filter((ledger) => ledger.balanceAmount > 0 && !selectedIds.has(ledger.id));
  const total = calculateGeneralTotal(form.lines);
  return (
    <Modal title="通用坏账计提单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="主表区">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required>
              <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
            </Field>
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Select value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} options={accountingEntities} />
            </Field>
            <ReadOnly label="申请日期" value={today} />
            <ReadOnly label="计提金额合计" value={formatMoney(total)} />
            <ReadOnly label="凭证号" value="审批通过后自动回写" />
            <ReadOnly label="说明" value="自动计算：本期补计提金额=本期计提金额-上期计提金额" />
          </div>
        </Section>
        <Section title="计提明细区">
          <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div className="text-sm text-slate-500">宽表支持横向滚动，账龄金额和计提比例变化时实时汇总。</div>
            <div className="flex gap-2">
              <Select value="" onChange={onAddLine} options={["", ...availableLedgers.map((item) => item.id)]} labels={{ "": "选择应收台账", ...Object.fromEntries(availableLedgers.map((item) => [item.id, `${item.code} / ${item.customer}`])) }} />
            </div>
          </div>
          {errors.lines && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errors.lines}</div>}
          {errors.negative && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errors.negative}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-[1380px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>行号</Th>
                  <Th>客户</Th>
                  <Th>应收总额</Th>
                  <Th>1年以内/比例</Th>
                  <Th>1-2年/比例</Th>
                  <Th>2-3年/比例</Th>
                  <Th>3-4年/比例</Th>
                  <Th>4年以上/比例</Th>
                  <Th>上期计提</Th>
                  <Th>本期计提</Th>
                  <Th>本期补计提</Th>
                  <Th>操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {form.lines.map((line, index) => {
                  const currentProvision = calculateLineCurrentProvision(line);
                  const additional = currentProvision - line.previousProvision;
                  return (
                    <tr key={line.id}>
                      <Td>{index + 1}</Td>
                      <Td>{line.customer}</Td>
                      <Td align="right">{formatMoney(line.totalReceivable)}</Td>
                      <AgeingCell amount={line.ageing.within1} ratio={line.ratios.within1} onRatio={(value) => onUpdateLine(line.id, { ratios: { ...line.ratios, within1: Number(value || 0) } })} />
                      <AgeingCell amount={line.ageing.year1To2} ratio={line.ratios.year1To2} onRatio={(value) => onUpdateLine(line.id, { ratios: { ...line.ratios, year1To2: Number(value || 0) } })} />
                      <AgeingCell amount={line.ageing.year2To3} ratio={line.ratios.year2To3} onRatio={(value) => onUpdateLine(line.id, { ratios: { ...line.ratios, year2To3: Number(value || 0) } })} />
                      <AgeingCell amount={line.ageing.year3To4} ratio={line.ratios.year3To4} onRatio={(value) => onUpdateLine(line.id, { ratios: { ...line.ratios, year3To4: Number(value || 0) } })} />
                      <AgeingCell amount={line.ageing.over4} ratio={line.ratios.over4} onRatio={(value) => onUpdateLine(line.id, { ratios: { ...line.ratios, over4: Number(value || 0) } })} />
                      <Td>
                        <Input value={String(line.previousProvision)} onChange={(value) => onUpdateLine(line.id, { previousProvision: Number(value || 0) })} />
                      </Td>
                      <Td align="right">{formatMoney(currentProvision)}</Td>
                      <Td align="right" danger={additional < 0}>
                        {formatMoney(additional)}
                      </Td>
                      <Td>
                        <InlineActions>
                          <button onClick={() => onRemoveLine(line.id)}>移除</button>
                        </InlineActions>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="说明">
          <Field label="说明">
            <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
          </Field>
        </Section>
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "提交审批"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function SpecificBadDebtModal({ form, errors, ledger, submitting, onChange, onClose, onSubmit }: { form: SpecificFormState; errors: Record<string, string>; ledger?: ReceivableLedger; submitting: boolean; onChange: (patch: Partial<SpecificFormState>) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  const previousProvision = Number(form.previousProvision || 0);
  const currentProvision = Number(form.currentProvision || 0);
  const additional = currentProvision - previousProvision;
  const confirmedAmount = Number(form.confirmedAmount || 0);
  const recoveredAmount = Number(form.recoveredAmount || 0);
  const total = form.processType === "坏账申请" ? additional : form.processType === "坏账确认" ? confirmedAmount : recoveredAmount;
  return (
    <Modal title="单项坏账申请单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="主表区">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required>
              <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
            </Field>
            <ReadOnly label="申请日期" value={today} />
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Select value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} options={accountingEntities} />
            </Field>
            <Field label="处理类型" required>
              <Select value={form.processType} onChange={(value) => onChange({ processType: value as SpecificFormState["processType"] })} options={["坏账申请", "坏账确认", "坏账收回"]} />
            </Field>
            <ReadOnly label="金额合计" value={formatMoney(total)} />
            <ReadOnly label="凭证号" value="审批通过后自动回写" />
          </div>
        </Section>
        <Section title="计提明细信息">
          <div className="grid gap-3 md:grid-cols-3">
            <ReadOnly label="客户" value={ledger?.customer ?? "-"} />
            <ReadOnly label="应收总额" value={formatMoney(ledger?.totalAmount ?? 0)} />
            <ReadOnly label="应收余额" value={formatMoney(ledger?.balanceAmount ?? 0)} />
            {form.processType === "坏账申请" && (
              <>
                <Field label="上期计提金额" required>
                  <Input value={form.previousProvision} onChange={(value) => onChange({ previousProvision: value })} />
                </Field>
                <Field label="本期计提金额" required>
                  <Input value={form.currentProvision} onChange={(value) => onChange({ currentProvision: value })} />
                </Field>
                <ReadOnly label="本期补计提金额" value={formatMoney(additional)} />
              </>
            )}
            {form.processType === "坏账确认" && (
              <Field label="本期坏账确认金额" required error={errors.confirmedAmount}>
                <Input value={form.confirmedAmount} onChange={(value) => onChange({ confirmedAmount: value })} />
              </Field>
            )}
            {form.processType === "坏账收回" && (
              <Field label="本期坏账收回金额" required error={errors.recoveredAmount}>
                <Input value={form.recoveredAmount} onChange={(value) => onChange({ recoveredAmount: value })} />
              </Field>
            )}
          </div>
        </Section>
        <Section title="附件与说明">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="坏账申请材料">
              <Input value={form.attachmentName} onChange={(value) => onChange({ attachmentName: value })} />
            </Field>
            <ReadOnly label="附件状态" value="仅展示文件名，不上传真实附件" />
          </div>
          <div className="mt-3">
            <Field label="说明" required error={errors.description}>
              <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
            </Field>
          </div>
        </Section>
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "提交 OA mock"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function ReceivableDetail({ item, badDebtProcesses, onRetrySync }: { item: ReceivableLedger; badDebtProcesses: BadDebtProcess[]; onRetrySync: (id: string) => void }) {
  const relatedBadDebt = badDebtProcesses.filter((process) => process.sourceLedgerId === item.id || process.lines.some((line) => line.ledgerId === item.id));
  return (
    <div className="space-y-4">
      {item.failureReason && (
        <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
          <span>{item.failureReason}</span>
          <button className="font-medium underline" onClick={() => onRetrySync(item.id)}>重新同步</button>
        </div>
      )}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["应收编号", item.code],
            ["客户", item.customer],
            ["应收余额", formatMoney(item.balanceAmount)],
            ["坏账准备余额", formatMoney(item.badDebtProvision)],
            ["状态", <StatusBadge key="status" status={item.status} />],
            ["金蝶/ERP 同步", <StatusBadge key="sync" status={item.syncStatus} />]
          ]}
        />
      </Section>
      <Section title="基础信息">
        <DetailGrid
          rows={[
            ["核算主体", item.accountingEntity],
            ["来源单据", item.sourceDocument],
            ["来源业务类型", item.businessType],
            ["合同编号/事项编号", item.contractCode],
            ["到期日", item.dueDate],
            ["逾期天数", `${item.overdueDays} 天`],
            ["账龄区间", item.ageBucket],
            ["风险等级", <StatusBadge key="risk" status={item.riskLevel} />],
            ["催收状态", item.collectionStatus],
            ["最后收款日期", item.lastReceiptAt],
            ["来源系统", item.sourceSystem],
            ["最近同步时间", item.lastSyncAt]
          ]}
        />
      </Section>
      <Section title="账龄结构">
        <AgeingBars ageing={item.ageing} total={Math.max(item.balanceAmount, 1)} />
      </Section>
      <Section title="金额变化">
        <DetailGrid
          rows={[
            ["应收总额", formatMoney(item.totalAmount)],
            ["已收金额", formatMoney(item.receivedAmount)],
            ["核销金额", formatMoney(item.writeOffAmount)],
            ["应收余额", formatMoney(item.balanceAmount)],
            ["坏账确认金额", formatMoney(item.badDebtConfirmed)],
            ["坏账收回金额", formatMoney(item.badDebtRecovered)]
          ]}
        />
      </Section>
      <Section title="收款/核销记录">
        {item.receipts.length === 0 ? <div className="text-sm text-slate-500">暂无收款或核销记录。</div> : <OperationList rows={item.receipts} />}
      </Section>
      <Section title="坏账处理记录">
        {relatedBadDebt.length === 0 ? (
          <div className="text-sm text-slate-500">暂无坏账处理记录。</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>单据编号</Th>
                <Th>处理类型</Th>
                <Th>处理金额</Th>
                <Th>状态</Th>
                <Th>凭证</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relatedBadDebt.map((process) => (
                <tr key={process.id}>
                  <Td>{process.code}</Td>
                  <Td>{process.processType}</Td>
                  <Td align="right">{formatMoney(process.processAmount)}</Td>
                  <Td><StatusBadge status={process.status} /></Td>
                  <Td>{process.kingdeeVoucherNo}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function BadDebtDetail({ item }: { item: BadDebtProcess }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["处理编号", item.code],
            ["处理类型", item.processType],
            ["处理金额", formatMoney(item.processAmount)],
            ["审批状态", <StatusBadge key="status" status={item.status} />],
            ["业财凭证号", item.voucherNo],
            ["金蝶凭证号", item.kingdeeVoucherNo]
          ]}
        />
      </Section>
      <Section title="主表区">
        <DetailGrid
          rows={[
            ["申请人", item.applicant],
            ["处理日期", item.processDate],
            ["核算主体", item.accountingEntity],
            ["客户", item.customer],
            ["来源应收", item.sourceLedgerCode],
            ["应收总额", formatMoney(item.totalReceivable)],
            ["上期计提金额", formatMoney(item.previousProvision)],
            ["本期计提金额", formatMoney(item.currentProvision)],
            ["本期补计提金额", formatMoney(item.additionalProvision)],
            ["本期坏账确认金额", formatMoney(item.confirmedAmount)],
            ["本期坏账收回金额", formatMoney(item.recoveredAmount)],
            ["附件名称", item.attachmentName]
          ]}
        />
      </Section>
      <Section title="计提明细区">
        {item.lines.length === 0 ? (
          <div className="text-sm text-slate-500">历史 mock 记录未展开明细。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>客户</Th>
                  <Th>应收总额</Th>
                  <Th>上期计提</Th>
                  <Th>本期计提</Th>
                  <Th>本期补计提</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {item.lines.map((line) => {
                  const current = calculateLineCurrentProvision(line);
                  return (
                    <tr key={line.id}>
                      <Td>{line.customer}</Td>
                      <Td align="right">{formatMoney(line.totalReceivable)}</Td>
                      <Td align="right">{formatMoney(line.previousProvision)}</Td>
                      <Td align="right">{formatMoney(current)}</Td>
                      <Td align="right" danger={current - line.previousProvision < 0}>{formatMoney(current - line.previousProvision)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
      <Section title="说明">
        <div className="text-sm text-slate-600">{item.description}</div>
      </Section>
      <Section title="审批信息">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function FilterBar({ filters, setFilters, onQuery, onReset, view }: { filters: { keyword: string; entity: string; ageBucket: string; riskLevel: string; status: string }; setFilters: (filters: { keyword: string; entity: string; ageBucket: string; riskLevel: string; status: string }) => void; onQuery: () => void; onReset: () => void; view: ViewMode }) {
  const statusOptions = view === "ledger" ? ["", "未收款", "部分收款", "已收清", "计提中", "已计提", "核销中", "已核销", "坏账收回中"] : ["", "审批中", "已驳回", "审批通过", "凭证生成失败", "已完成"];
  return (
    <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] md:items-end">
      <Field label="客户/单号">
        <Input value={filters.keyword} onChange={(value) => setFilters({ ...filters, keyword: value })} placeholder="客户、应收编号、处理编号" />
      </Field>
      <Field label="核算主体">
        <Select value={filters.entity} onChange={(value) => setFilters({ ...filters, entity: value })} options={["", ...accountingEntities]} labels={{ "": "全部" }} />
      </Field>
      <Field label="账龄区间">
        <Select value={filters.ageBucket} onChange={(value) => setFilters({ ...filters, ageBucket: value })} options={["", ...ageBuckets]} labels={{ "": "全部" }} />
      </Field>
      <Field label="风险等级">
        <Select value={filters.riskLevel} onChange={(value) => setFilters({ ...filters, riskLevel: value })} options={["", ...riskLevels]} labels={{ "": "全部" }} />
      </Field>
      <Field label="状态">
        <Select value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={statusOptions} labels={{ "": "全部" }} />
      </Field>
      <div className="flex gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
      <aside className="h-full w-full overflow-y-auto bg-white p-5 shadow-xl md:w-[760px]">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md px-3 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
}

function EmptyState({ onReset, onCreate }: { onReset: () => void; onCreate: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">-</div>
      <div className="font-medium">暂无匹配数据</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选或新建应收账款确认单继续演示。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button onClick={onCreate}>新建应收确认单</Button>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rows.map(([label, value]) => (
        <ReadOnly key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function Field({ label, children, required = false, error }: { label: string; children: ReactNode; required?: boolean; error?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-slate-500">{required && <span className="mr-1 text-red-500">*</span>}{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-sm text-slate-500">{label}</div>
      <div className="min-h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{value || "-"}</div>
    </div>
  );
}

function Alert({ children, tone }: { children: ReactNode; tone: "red" | "blue" }) {
  return <div className={`rounded-md border p-3 text-sm ${tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{children}</div>;
}

function Input({ value, onChange, placeholder = "", disabled = false }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options, labels = {} }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option] ?? option}
        </option>
      ))}
    </select>
  );
}

function Button({ children, onClick, type = "button", variant = "primary", size = "md", disabled = false }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; variant?: "primary" | "secondary"; size?: "sm" | "md"; disabled?: boolean }) {
  const color = variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400";
  const sizing = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`rounded-md font-medium transition ${color} ${sizing}`}>
      {children}
    </button>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-normal">{children}</th>;
}

function Td({ children, align = "left", danger = false }: { children: ReactNode; align?: "left" | "right"; danger?: boolean }) {
  return <td className={`whitespace-nowrap px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""} ${danger ? "font-medium text-red-600" : "text-slate-700"}`}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-40 flex-wrap gap-x-3 gap-y-1 text-sm text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const style =
    ["审批通过", "已完成", "已收清", "已计提", "已核销", "同步成功", "低风险"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "凭证生成中", "同步中", "部分收款", "计提中", "核销中", "坏账收回中", "中风险"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["已驳回", "高风险", "凭证生成失败", "同步失败"].includes(status)
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style}`}>{status || "-"}</span>;
}

function StepList({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={`${step.node}-${index}`} className="flex gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-600">{index + 1}</div>
          <div className="min-w-0">
            <div className="font-medium">{step.node}</div>
            <div className="text-sm text-slate-500">{step.approver} / {step.date}</div>
            <div className="text-sm text-slate-600">{step.comment}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OperationList({ rows }: { rows: OperationRecord[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
            <span className="font-medium">{row.result}</span>
            <span className="text-slate-400">{row.time}</span>
          </div>
          <div className="mt-1 text-slate-500">{row.channel} / {row.serialNo}</div>
        </div>
      ))}
    </div>
  );
}

function AgeingCell({ amount, ratio, onRatio }: { amount: number; ratio: number; onRatio: (value: string) => void }) {
  return (
    <Td>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-slate-50 px-2 py-2 text-right tabular-nums">{formatMoney(amount)}</div>
        <div>
          <Input value={String(ratio)} onChange={onRatio} />
          <div className="mt-1 text-right text-xs text-slate-400">%</div>
        </div>
      </div>
    </Td>
  );
}

function AgeingBars({ ageing, total }: { ageing: AgeingAmounts; total: number }) {
  const rows = [
    ["1年以内", ageing.within1, "bg-green-500"],
    ["1年至2年", ageing.year1To2, "bg-blue-500"],
    ["2年至3年", ageing.year2To3, "bg-orange-500"],
    ["3年至4年", ageing.year3To4, "bg-red-500"],
    ["4年以上", ageing.over4, "bg-slate-700"]
  ] as const;
  return (
    <div className="space-y-3">
      {rows.map(([label, amount, color]) => (
        <div key={label} className="grid gap-2 md:grid-cols-[88px_1fr_120px] md:items-center">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${color} ${widthClass((amount / total) * 100)}`} />
          </div>
          <div className="text-right text-sm tabular-nums">{formatMoney(amount)}</div>
        </div>
      ))}
    </div>
  );
}

function filterLedgers(rows: ReceivableLedger[], filters: { keyword: string; entity: string; ageBucket: string; riskLevel: string; status: string }) {
  return rows.filter((item) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const keywordMatched = !keyword || [item.code, item.customer, item.sourceDocument, item.contractCode].some((value) => value.toLowerCase().includes(keyword));
    return keywordMatched && matchFilter(item.accountingEntity, filters.entity) && matchFilter(item.ageBucket, filters.ageBucket) && matchFilter(item.riskLevel, filters.riskLevel) && matchFilter(item.status, filters.status);
  });
}

function filterBadDebt(rows: BadDebtProcess[], filters: { keyword: string; entity: string; ageBucket: string; riskLevel: string; status: string }) {
  return rows.filter((item) => {
    const keyword = filters.keyword.trim().toLowerCase();
    const keywordMatched = !keyword || [item.code, item.customer, item.sourceLedgerCode, item.processType].some((value) => value.toLowerCase().includes(keyword));
    return keywordMatched && matchFilter(item.accountingEntity, filters.entity) && matchFilter(item.status, filters.status);
  });
}

function matchFilter(value: string, filter: string) {
  return !filter || value === filter;
}

function buildStats(ledgers: ReceivableLedger[], badDebtProcesses: BadDebtProcess[]) {
  const total = sum(ledgers.map((item) => item.totalAmount));
  const balance = sum(ledgers.map((item) => item.balanceAmount));
  const overdue = sum(ledgers.filter((item) => item.overdueDays > 0).map((item) => item.balanceAmount));
  const provision = sum(ledgers.map((item) => item.badDebtProvision));
  const currentAccrual = sum(badDebtProcesses.filter((item) => item.processType === "通用计提" && item.status !== "已驳回").map((item) => item.additionalProvision));
  return [
    { label: "应收总额", value: formatMoney(total), sub: `${ledgers.length} 条应收记录` },
    { label: "应收余额", value: formatMoney(balance), sub: "未收/未核销余额" },
    { label: "逾期金额", value: formatMoney(overdue), sub: "逾期天数 > 0" },
    { label: "坏账准备余额", value: formatMoney(provision), sub: "通用与单项累计" },
    { label: "本期补计提", value: formatMoney(currentAccrual), sub: "审批中也纳入演示口径" }
  ];
}

function buildAgeStats(ledgers: ReceivableLedger[]) {
  const amounts = [
    { label: "1年以内", amount: sum(ledgers.map((item) => item.ageing.within1)), className: "h-full rounded-full bg-green-500" },
    { label: "1年至2年", amount: sum(ledgers.map((item) => item.ageing.year1To2)), className: "h-full rounded-full bg-blue-500" },
    { label: "2年至3年", amount: sum(ledgers.map((item) => item.ageing.year2To3)), className: "h-full rounded-full bg-orange-500" },
    { label: "3年至4年", amount: sum(ledgers.map((item) => item.ageing.year3To4)), className: "h-full rounded-full bg-red-500" },
    { label: "4年以上", amount: sum(ledgers.map((item) => item.ageing.over4)), className: "h-full rounded-full bg-slate-700" }
  ];
  const max = Math.max(...amounts.map((item) => item.amount), 1);
  return amounts.map((item) => ({ ...item, widthClass: widthClass(Math.max((item.amount / max) * 100, item.amount > 0 ? 4 : 0)) }));
}

function buildAccrualLine(ledger: ReceivableLedger): AccrualLine {
  return {
    id: `line-${ledger.id}-${Date.now()}`,
    ledgerId: ledger.id,
    customer: ledger.customer,
    totalReceivable: ledger.balanceAmount,
    ageing: ledger.ageing,
    ratios: { within1: 1, year1To2: 5, year2To3: 20, year3To4: 50, over4: 100 },
    previousProvision: ledger.badDebtProvision
  };
}

function addAccrualLine(current: GeneralFormState | null, ledger?: ReceivableLedger) {
  if (!current || !ledger) return current;
  if (current.lines.some((line) => line.ledgerId === ledger.id)) return current;
  return { ...current, lines: [...current.lines, buildAccrualLine(ledger)] };
}

function updateAccrualLine(current: GeneralFormState | null, lineId: string, patch: Partial<AccrualLine>) {
  if (!current) return current;
  return { ...current, lines: current.lines.map((line) => (line.id === lineId ? { ...line, ...patch } : line)) };
}

function calculateLineCurrentProvision(line: AccrualLine) {
  return (
    (line.ageing.within1 * line.ratios.within1) / 100 +
    (line.ageing.year1To2 * line.ratios.year1To2) / 100 +
    (line.ageing.year2To3 * line.ratios.year2To3) / 100 +
    (line.ageing.year3To4 * line.ratios.year3To4) / 100 +
    (line.ageing.over4 * line.ratios.over4) / 100
  );
}

function calculateGeneralTotal(lines: AccrualLine[]) {
  return sum(lines.map((line) => calculateLineCurrentProvision(line) - line.previousProvision));
}

function validateGeneralForm(form: GeneralFormState) {
  const errors: Record<string, string> = {};
  if (!form.accountingEntity) errors.accountingEntity = "请选择核算主体";
  if (form.lines.length === 0) errors.lines = "请至少选择一条应收台账";
  const hasMismatch = form.lines.some((line) => Math.abs(sum(Object.values(line.ageing)) - line.totalReceivable) > 0.01);
  if (hasMismatch) errors.lines = "应收总额必须等于各账龄金额合计";
  const hasNegative = form.lines.some((line) => calculateLineCurrentProvision(line) - line.previousProvision < 0);
  if (hasNegative && !form.description.includes("冲回")) errors.negative = "存在负数补计提金额时，请在说明中注明冲回原因";
  return errors;
}

function validateSpecificForm(form: SpecificFormState, ledger: ReceivableLedger) {
  const errors: Record<string, string> = {};
  if (!form.accountingEntity) errors.accountingEntity = "请选择核算主体";
  if (!form.description) errors.description = "请填写坏账处理说明";
  const confirmedAmount = Number(form.confirmedAmount || 0);
  const recoveredAmount = Number(form.recoveredAmount || 0);
  if (form.processType === "坏账确认" && (confirmedAmount <= 0 || confirmedAmount > ledger.balanceAmount)) errors.confirmedAmount = "坏账确认金额必须大于 0 且不能超过应收余额";
  if (form.processType === "坏账收回" && (recoveredAmount <= 0 || recoveredAmount > Math.max(ledger.badDebtConfirmed, ledger.balanceAmount))) errors.recoveredAmount = "坏账收回金额必须大于 0 且不能超过已确认坏账金额";
  return errors;
}

function normalizeSpecificForm(form: SpecificFormState, ledger?: ReceivableLedger) {
  if (!ledger) return form;
  if (form.processType === "坏账确认" && Number(form.confirmedAmount || 0) === 0) return { ...form, confirmedAmount: String(ledger.balanceAmount) };
  if (form.processType === "坏账收回" && Number(form.recoveredAmount || 0) === 0) return { ...form, recoveredAmount: String(Math.min(ledger.badDebtConfirmed || ledger.balanceAmount, 10000)) };
  return form;
}

function buildAgeingByDueDate(dueDate: string, amount: number): AgeingAmounts {
  const overdueDays = calculateOverdueDays(dueDate);
  const bucket = getAgeBucket(overdueDays);
  return {
    within1: bucket === "1年以内" ? amount : 0,
    year1To2: bucket === "1年至2年" ? amount : 0,
    year2To3: bucket === "2年至3年" ? amount : 0,
    year3To4: bucket === "3年至4年" ? amount : 0,
    over4: bucket === "4年以上" ? amount : 0
  };
}

function calculateOverdueDays(dueDate: string) {
  const current = new Date(today).getTime();
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due) || due >= current) return 0;
  return Math.floor((current - due) / 86400000);
}

function getAgeBucket(overdueDays: number): AgeBucket {
  if (overdueDays <= 365) return "1年以内";
  if (overdueDays <= 730) return "1年至2年";
  if (overdueDays <= 1095) return "2年至3年";
  if (overdueDays <= 1460) return "3年至4年";
  return "4年以上";
}

function scaleAgeing(ageing: AgeingAmounts, oldBalance: number, newBalance: number): AgeingAmounts {
  if (oldBalance <= 0) return zeroAgeing();
  const ratio = newBalance / oldBalance;
  return {
    within1: ageing.within1 * ratio,
    year1To2: ageing.year1To2 * ratio,
    year2To3: ageing.year2To3 * ratio,
    year3To4: ageing.year3To4 * ratio,
    over4: ageing.over4 * ratio
  };
}

function zeroAgeing(): AgeingAmounts {
  return { within1: 0, year1To2: 0, year2To3: 0, year3To4: 0, over4: 0 };
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 2 }).format(value || 0);
}

function widthClass(percent: number) {
  if (percent <= 0) return "w-0";
  if (percent <= 8) return "w-1/12";
  if (percent <= 17) return "w-1/6";
  if (percent <= 25) return "w-1/4";
  if (percent <= 33) return "w-1/3";
  if (percent <= 42) return "w-5/12";
  if (percent <= 50) return "w-1/2";
  if (percent <= 58) return "w-7/12";
  if (percent <= 67) return "w-2/3";
  if (percent <= 75) return "w-3/4";
  if (percent <= 83) return "w-5/6";
  if (percent <= 92) return "w-11/12";
  return "w-full";
}
