"use client";

import { ReactNode, useMemo, useState } from "react";

type ContractStatus = "草稿" | "待审批" | "已生效" | "已驳回" | "已终止" | "已失效";
type CompletionStatus = "未完结" | "履约中" | "已完结";
type DocumentStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "已完成" | "已作废";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type DetailTab = "base" | "terms" | "rules" | "performance" | "logs";

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

interface SettlementRule {
  id: string;
  scene: string;
  expenseMinor: string;
  serviceRate: number;
}

interface RebateTier {
  id: string;
  minAmount: number;
  maxAmount: number;
  rebateRate: number;
}

interface SalesContract {
  id: string;
  code: string;
  title: string;
  signEntity: string;
  accountingEntity: string;
  customer: string;
  channel: string;
  status: ContractStatus;
  completionStatus: CompletionStatus;
  startDate: string;
  endDate: string;
  serviceRate: number;
  settlementRuleSummary: string;
  rebateSummary: string;
  terms: string;
  remark: string;
  settlingAmount: number;
  settledAmount: number;
  unSettledAmount: number;
  cumulativeSalesAmount: number;
  cumulativeServiceFee: number;
  accruedRebate: number;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  approvalStatus: DocumentStatus;
  creator: string;
  createdAt: string;
  rules: SettlementRule[];
  tiers: RebateTier[];
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface SettlementLine {
  id: string;
  salesOrderCount: number;
  salesSuccessAmount: number;
  returnCount: number;
  returnAmount: number;
  brandActivityAmount: number;
  postageAmount: number;
  transactionSuccessCount: number;
  transactionSuccessAmount: number;
  serviceRate: number;
  serviceFeeAmount: number;
}

interface SalesSettlementForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  applicantCompany: string;
  applicantDepartment: string;
  applicantRole: string;
  accountingEntity: string;
  contractId: string;
  contractCode: string;
  customer: string;
  channel: string;
  settlementTotal: number;
  description: string;
  status: DocumentStatus;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  voucherNo: string;
  failureReason?: string;
  line: SettlementLine;
  attachments: MockAttachment[];
  approvals: ApprovalRecord[];
}

interface RebateAccrualForm {
  id: string;
  code: string;
  applicant: string;
  applyDate: string;
  applicantCompany: string;
  applicantDepartment: string;
  applicantRole: string;
  accountingEntity: string;
  contractId: string;
  contractCode: string;
  customer: string;
  accrualMonth: string;
  monthSalesAmount: number;
  lastCumulativeSalesAmount: number;
  cumulativeSalesAmount: number;
  rebateRate: number;
  rebateAmount: number;
  accruedRebate: number;
  currentAccrualAmount: number;
  adjustmentNote: string;
  status: DocumentStatus;
  voucherNo: string;
  approvals: ApprovalRecord[];
}

interface MockAttachment {
  id: string;
  name: string;
  type: string;
  uploader: string;
  uploadedAt: string;
  previewStatus: string;
}

interface ContractFilters {
  keyword: string;
  customer: string;
  channel: string;
  status: string;
  completionStatus: string;
  syncStatus: string;
}

interface ContractFormState {
  id?: string;
  code: string;
  title: string;
  signEntity: string;
  accountingEntity: string;
  customer: string;
  channel: string;
  startDate: string;
  endDate: string;
  serviceRate: string;
  terms: string;
  remark: string;
  ruleScene: string;
  expenseMinor: string;
  tiers: Array<{ minAmount: string; maxAmount: string; rebateRate: string }>;
}

interface SettlementFormState {
  contractId: string;
  salesOrderCount: string;
  salesSuccessAmount: string;
  returnCount: string;
  returnAmount: string;
  brandActivityAmount: string;
  postageAmount: string;
  description: string;
  attachmentName: string;
}

interface RebateFormState {
  contractId: string;
  accrualMonth: string;
  monthSalesAmount: string;
  rebateRate: string;
  rebateAmount: string;
  accruedRebate: string;
  adjustmentNote: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const applicant = {
  name: "陈晨",
  company: "上海示例贸易有限公司",
  department: "电商运营部",
  role: "渠道结算专员"
};

const initialFilters: ContractFilters = {
  keyword: "",
  customer: "全部",
  channel: "全部",
  status: "全部",
  completionStatus: "全部",
  syncStatus: "全部"
};

const createRules = (prefix: string, channel: string, serviceRate: number): SettlementRule[] => [
  { id: `${prefix}-rule-1`, scene: `${channel} 销售服务费`, expenseMinor: "平台服务费", serviceRate },
  { id: `${prefix}-rule-2`, scene: `${channel} 包邮与活动承担`, expenseMinor: "渠道促销承担", serviceRate: Math.max(serviceRate - 2, 1) }
];

const createTiers = (prefix: string, rates: [number, number, number]): RebateTier[] => [
  { id: `${prefix}-tier-1`, minAmount: 0, maxAmount: 3000000, rebateRate: rates[0] },
  { id: `${prefix}-tier-2`, minAmount: 3000000, maxAmount: 8000000, rebateRate: rates[1] },
  { id: `${prefix}-tier-3`, minAmount: 8000000, maxAmount: 20000000, rebateRate: rates[2] }
];

const createContract = (
  index: number,
  data: Partial<SalesContract> & Pick<SalesContract, "code" | "title" | "customer" | "channel" | "serviceRate" | "status">
): SalesContract => {
  const settledAmount = data.settledAmount ?? 280000 + index * 42000;
  const settlingAmount = data.settlingAmount ?? (data.status === "已生效" ? 78000 + index * 9000 : 0);
  const cumulativeSalesAmount = data.cumulativeSalesAmount ?? 1800000 + index * 720000;
  return {
    id: `sales-contract-${String(index).padStart(3, "0")}`,
    signEntity: data.signEntity ?? "上海示例贸易有限公司",
    accountingEntity: data.accountingEntity ?? "上海示例贸易有限公司",
    completionStatus: data.completionStatus ?? (data.status === "已生效" ? "履约中" : "未完结"),
    startDate: data.startDate ?? "2026-01-01",
    endDate: data.endDate ?? "2026-12-31",
    settlementRuleSummary: data.settlementRuleSummary ?? `${data.channel} 交易成功金额按 ${data.serviceRate}% 计提服务费，月度结算。`,
    rebateSummary: data.rebateSummary ?? "按年度累计销售额命中阶梯，月度计提返利。",
    terms: data.terms ?? "平台服务费按渠道月账单确认；客退、品牌活动承担和包邮金额需在结算单中扣减；账期为审批通过后 45 天内模拟入账。",
    remark: data.remark ?? "Demo mock 合同，结构化字段仅用于演示。",
    settlingAmount,
    settledAmount,
    unSettledAmount: data.unSettledAmount ?? Math.max(0, cumulativeSalesAmount * (data.serviceRate / 100) - settledAmount - settlingAmount),
    cumulativeSalesAmount,
    cumulativeServiceFee: data.cumulativeServiceFee ?? settledAmount,
    accruedRebate: data.accruedRebate ?? Math.round(cumulativeSalesAmount * 0.012),
    sourceSystem: data.sourceSystem ?? "[合同系统] mock 归档",
    syncStatus: data.syncStatus ?? "同步成功",
    lastSyncAt: data.lastSyncAt ?? "2026-05-06 09:20:00",
    syncBatchNo: data.syncBatchNo ?? "SYNC-SALES-2026050601",
    approvalStatus: data.approvalStatus ?? (data.status === "已生效" ? "审批通过" : "草稿"),
    creator: data.creator ?? ["陈晨", "李然", "周可", "赵敏"][index % 4],
    createdAt: data.createdAt ?? "2026-05-01",
    rules: createRules(`sales-contract-${index}`, data.channel, data.serviceRate),
    tiers: data.tiers ?? createTiers(`sales-contract-${index}`, [0.8, 1.2, 1.8]),
    approvals: data.approvals ?? [
      { node: "合同结构化", approver: data.status === "已生效" ? "财务负责人" : "-", date: data.status === "已生效" ? "2026-05-03 15:10:00" : "-", comment: data.status === "已生效" ? "结构化审批通过，规则已生效。" : "待提交审批。" }
    ],
    logs: data.logs ?? [
      { time: "2026-05-01 10:20:00", operator: "系统模拟", action: "同步合同", comment: "从合同系统同步销售渠道合同结构化草稿。" }
    ],
    ...data
  };
};

const initialContracts: SalesContract[] = [
  createContract(1, {
    code: "XSHT-2026-001",
    title: "得物代销合作协议",
    customer: "上海识装信息科技有限公司",
    channel: "得物",
    serviceRate: 15,
    status: "已生效",
    cumulativeSalesAmount: 5117072,
    settledAmount: 520000,
    settlingAmount: 0,
    unSettledAmount: 247560.8,
    accruedRebate: 42000,
    settlementRuleSummary: "交易成功金额按 15% 计服务费，客退和活动承担在月结单中扣减。"
  }),
  createContract(2, {
    code: "XSHT-2026-002",
    title: "京东自营产品购销协议",
    customer: "北京京东世纪贸易有限公司",
    channel: "京东",
    serviceRate: 9,
    status: "已生效",
    cumulativeSalesAmount: 7620000,
    settledAmount: 418000,
    terms: "45 天账期；退货、滞销和平台扣点需按京东月度对账单确认；年度返利以累计含税销售额为阶梯基数。"
  }),
  createContract(3, {
    code: "XSHT-2026-003",
    title: "唯品会商品销售合同",
    customer: "广州唯品会电子商务有限公司",
    channel: "唯品会",
    serviceRate: 11,
    status: "待审批",
    approvalStatus: "审批中",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-06 08:42:00",
    syncBatchNo: "SYNC-SALES-2026050602",
    failureReason: "渠道账单字段缺失：缺少本期客退金额。"
  }),
  createContract(4, {
    code: "XSHT-2026-004",
    title: "抖音渠道销售合同",
    customer: "北京有竹居网络技术有限公司",
    channel: "抖音",
    serviceRate: 12,
    status: "已生效",
    cumulativeSalesAmount: 9400000,
    accruedRebate: 96000,
    tiers: createTiers("sales-contract-4", [1, 1.5, 2.1]),
    rebateSummary: "300 万以下 1%，300-800 万 1.5%，800 万以上 2.1%。"
  }),
  createContract(5, {
    code: "XSHT-2026-005",
    title: "天猫旗舰店年度销售框架",
    customer: "浙江天猫技术有限公司",
    channel: "天猫",
    serviceRate: 8,
    status: "草稿",
    approvalStatus: "草稿",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-"
  }),
  createContract(6, {
    code: "XSHT-2026-006",
    title: "小红书 POP 店铺合作协议",
    customer: "行吟信息科技（上海）有限公司",
    channel: "小红书",
    serviceRate: 10,
    status: "已驳回",
    approvalStatus: "已驳回",
    failureReason: "返利阶梯最大销售额配置不完整。",
    accruedRebate: 0
  }),
  createContract(7, {
    code: "XSHT-2026-007",
    title: "拼多多渠道供销补充协议",
    customer: "上海寻梦信息技术有限公司",
    channel: "拼多多",
    serviceRate: 7,
    status: "已生效",
    completionStatus: "履约中",
    cumulativeSalesAmount: 3860000
  }),
  createContract(8, {
    code: "XSHT-2026-008",
    title: "抖音超品日补充协议",
    customer: "北京有竹居网络技术有限公司",
    channel: "抖音",
    serviceRate: 13,
    status: "已终止",
    completionStatus: "已完结",
    approvalStatus: "审批通过",
    settledAmount: 360000,
    settlingAmount: 0,
    unSettledAmount: 0
  })
];

const initialSettlements: SalesSettlementForm[] = [
  {
    id: "settlement-001",
    code: "XSJS-2026-001",
    applicant: "陈晨",
    applyDate: "2026-05-03",
    applicantCompany: applicant.company,
    applicantDepartment: applicant.department,
    applicantRole: applicant.role,
    accountingEntity: "上海示例贸易有限公司",
    contractId: "sales-contract-001",
    contractCode: "XSHT-2026-001",
    customer: "上海识装信息科技有限公司",
    channel: "得物",
    settlementTotal: 767560.8,
    description: "得物 4 月销售服务费月结。",
    status: "已完成",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 10:30:00",
    voucherNo: "PZ-202605-0001",
    line: {
      id: "settlement-001-line-1",
      salesOrderCount: 24880,
      salesSuccessAmount: 5480000,
      returnCount: 820,
      returnAmount: 212928,
      brandActivityAmount: 90000,
      postageAmount: 60000,
      transactionSuccessCount: 24060,
      transactionSuccessAmount: 5117072,
      serviceRate: 15,
      serviceFeeAmount: 767560.8
    },
    attachments: [{ id: "att-001", name: "得物4月渠道结算明细.xlsx", type: "渠道账单", uploader: "陈晨", uploadedAt: "2026-05-03 10:20:00", previewStatus: "可 mock 预览" }],
    approvals: [{ node: "财务复核", approver: "王悦", date: "2026-05-03 15:00:00", comment: "审批通过，已回写合同履约区。" }]
  },
  {
    id: "settlement-002",
    code: "XSJS-2026-002",
    applicant: "李然",
    applyDate: "2026-05-04",
    applicantCompany: applicant.company,
    applicantDepartment: "渠道财务部",
    applicantRole: "财务 BP",
    accountingEntity: "上海示例贸易有限公司",
    contractId: "sales-contract-002",
    contractCode: "XSHT-2026-002",
    customer: "北京京东世纪贸易有限公司",
    channel: "京东",
    settlementTotal: 186300,
    description: "京东 4 月结算单，待业务补充附件。",
    status: "已驳回",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 11:10:00",
    voucherNo: "-",
    failureReason: "附件缺少渠道结算明细。",
    line: {
      id: "settlement-002-line-1",
      salesOrderCount: 12200,
      salesSuccessAmount: 2280000,
      returnCount: 340,
      returnAmount: 120000,
      brandActivityAmount: 60000,
      postageAmount: 30000,
      transactionSuccessCount: 11860,
      transactionSuccessAmount: 2070000,
      serviceRate: 9,
      serviceFeeAmount: 186300
    },
    attachments: [],
    approvals: [{ node: "财务复核", approver: "王悦", date: "2026-05-04 17:30:00", comment: "附件缺少渠道结算明细，驳回补充。" }]
  }
];

const initialRebates: RebateAccrualForm[] = [
  {
    id: "rebate-001",
    code: "XSFL-2026-001",
    applicant: "周可",
    applyDate: "2026-05-05",
    applicantCompany: applicant.company,
    applicantDepartment: applicant.department,
    applicantRole: "渠道结算专员",
    accountingEntity: "上海示例贸易有限公司",
    contractId: "sales-contract-004",
    contractCode: "XSHT-2026-004",
    customer: "北京有竹居网络技术有限公司",
    accrualMonth: "2026-04",
    monthSalesAmount: 1280000,
    lastCumulativeSalesAmount: 8120000,
    cumulativeSalesAmount: 9400000,
    rebateRate: 2.1,
    rebateAmount: 197400,
    accruedRebate: 96000,
    currentAccrualAmount: 101400,
    adjustmentNote: "命中 800 万以上阶梯，按合同约定计提。",
    status: "已完成",
    voucherNo: "PZ-202605-0002",
    approvals: [{ node: "财务审批", approver: "王悦", date: "2026-05-05 16:20:00", comment: "返利计提审批通过，已生成 mock 凭证号。" }]
  }
];

export default function SalesContractsPage() {
  const [contracts, setContracts] = useState<SalesContract[]>(initialContracts);
  const [settlements, setSettlements] = useState<SalesSettlementForm[]>(initialSettlements);
  const [rebates, setRebates] = useState<RebateAccrualForm[]>(initialRebates);
  const [filters, setFilters] = useState<ContractFilters>(initialFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detailId, setDetailId] = useState("");
  const [detailTab, setDetailTab] = useState<DetailTab>("base");
  const [contractForm, setContractForm] = useState<ContractFormState | null>(null);
  const [settlementForm, setSettlementForm] = useState<SettlementFormState | null>(null);
  const [rebateForm, setRebateForm] = useState<RebateFormState | null>(null);
  const [sourcePreview, setSourcePreview] = useState<SalesSettlementForm | null>(null);
  const [syncProgress, setSyncProgress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customers = useMemo(() => Array.from(new Set(contracts.map((item) => item.customer))), [contracts]);
  const channels = useMemo(() => Array.from(new Set(contracts.map((item) => item.channel))), [contracts]);
  const activeContracts = useMemo(() => contracts.filter((item) => item.status === "已生效"), [contracts]);
  const detail = contracts.find((item) => item.id === detailId) ?? null;
  const selectedSettlementContract = settlementForm ? contracts.find((item) => item.id === settlementForm.contractId) : undefined;
  const selectedRebateContract = rebateForm ? contracts.find((item) => item.id === rebateForm.contractId) : undefined;

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const matchKeyword = !keyword || [item.code, item.title, item.customer, item.signEntity, item.accountingEntity].some((value) => value.toLowerCase().includes(keyword));
      const matchCustomer = filters.customer === "全部" || item.customer === filters.customer;
      const matchChannel = filters.channel === "全部" || item.channel === filters.channel;
      const matchStatus = filters.status === "全部" || item.status === filters.status;
      const matchCompletion = filters.completionStatus === "全部" || item.completionStatus === filters.completionStatus;
      const matchSync = filters.syncStatus === "全部" || item.syncStatus === filters.syncStatus;
      return matchKeyword && matchCustomer && matchChannel && matchStatus && matchCompletion && matchSync;
    });
  }, [contracts, filters]);

  const stats = useMemo(() => {
    const monthSettlement = settlements.filter((item) => item.applyDate.startsWith("2026-05")).reduce((total, item) => total + item.settlementTotal, 0);
    const monthRebate = rebates.filter((item) => item.applyDate.startsWith("2026-05")).reduce((total, item) => total + item.currentAccrualAmount, 0);
    return [
      { label: "销售合同总数", value: contracts.length.toString(), sub: `${contracts.filter((item) => item.status === "已生效").length} 份已生效` },
      { label: "本月结算金额", value: formatMoney(monthSettlement), sub: "销售服务费结算单合计" },
      { label: "本月计提返利", value: formatMoney(monthRebate), sub: "返利计提单本期合计" },
      { label: "同步失败数", value: contracts.filter((item) => item.syncStatus === "同步失败").length.toString(), sub: "可模拟重试合同/账单同步" }
    ];
  }, [contracts, rebates, settlements]);

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

  function simulateContractSync() {
    setOverlayLoading("正在模拟同步合同系统销售合同");
    window.setTimeout(() => {
      setContracts((items) => {
        const recovered = items.map((item) =>
          item.syncStatus === "同步失败"
            ? {
                ...item,
                syncStatus: "同步成功" as SyncStatus,
                failureReason: undefined,
                lastSyncAt: nowText,
                syncBatchNo: "SYNC-SALES-RETRY-20260506",
                logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "重试同步", comment: "已模拟补齐渠道账单缺失字段。" }]
              }
            : item
        );
        if (recovered.some((item) => item.code === "XSHT-2026-009")) return recovered;
        return [
          createContract(9, {
            code: "XSHT-2026-009",
            title: "快手渠道销售合作协议",
            customer: "北京快手科技有限公司",
            channel: "快手",
            serviceRate: 10,
            status: "草稿",
            approvalStatus: "草稿",
            syncStatus: "同步成功",
            lastSyncAt: nowText,
            syncBatchNo: "SYNC-SALES-2026050603"
          }),
          ...recovered
        ];
      });
      setOverlayLoading("");
      showToast("已模拟同步销售合同：新增 1 条，恢复失败同步 1 条。");
    }, 850);
  }

  function retryContractSync(contract: SalesContract) {
    setContracts((items) =>
      items.map((item) =>
        item.id === contract.id
          ? {
              ...item,
              syncStatus: "同步成功",
              failureReason: undefined,
              lastSyncAt: nowText,
              syncBatchNo: "SYNC-SALES-RETRY-20260506",
              logs: [...item.logs, { time: nowText, operator: "系统模拟", action: "重试同步", comment: "已模拟重新拉取合同系统结构化信息。" }]
            }
          : item
      )
    );
    showToast("已模拟重试同步合同系统。");
  }

  function openDetail(contract: SalesContract, tab: DetailTab = "base") {
    setDetailId(contract.id);
    setDetailTab(tab);
  }

  function openContractForm(contract?: SalesContract) {
    setErrors({});
    setContractForm(
      contract
        ? {
            id: contract.id,
            code: contract.code,
            title: contract.title,
            signEntity: contract.signEntity,
            accountingEntity: contract.accountingEntity,
            customer: contract.customer,
            channel: contract.channel,
            startDate: contract.startDate,
            endDate: contract.endDate,
            serviceRate: String(contract.serviceRate),
            terms: contract.terms,
            remark: contract.remark,
            ruleScene: contract.rules[0]?.scene ?? `${contract.channel} 销售服务费`,
            expenseMinor: contract.rules[0]?.expenseMinor ?? "平台服务费",
            tiers: contract.tiers.map((tier) => ({ minAmount: String(tier.minAmount), maxAmount: String(tier.maxAmount), rebateRate: String(tier.rebateRate) }))
          }
        : {
            code: `XSHT-2026-${String(contracts.length + 1).padStart(3, "0")}`,
            title: "",
            signEntity: "上海示例贸易有限公司",
            accountingEntity: "上海示例贸易有限公司",
            customer: "",
            channel: "得物",
            startDate: "2026-05-01",
            endDate: "2026-12-31",
            serviceRate: "10",
            terms: "交易成功金额按服务费率计算服务费，客退、活动承担和包邮金额在结算单扣减。",
            remark: "通过前端 mock 新增销售合同结构化记录。",
            ruleScene: "渠道销售服务费",
            expenseMinor: "平台服务费",
            tiers: [
              { minAmount: "0", maxAmount: "3000000", rebateRate: "1" },
              { minAmount: "3000000", maxAmount: "8000000", rebateRate: "1.5" },
              { minAmount: "8000000", maxAmount: "20000000", rebateRate: "2" }
            ]
          }
    );
  }

  function submitContractForm() {
    if (!contractForm) return;
    const nextErrors: Record<string, string> = {};
    const serviceRate = Number(contractForm.serviceRate);
    if (!contractForm.title.trim()) nextErrors.title = "请填写合同标题。";
    if (!contractForm.code.trim()) nextErrors.code = "请填写合同编码。";
    if (!contractForm.customer.trim()) nextErrors.customer = "请填写客户。";
    if (!contractForm.signEntity.trim()) nextErrors.signEntity = "请填写签约主体。";
    if (!contractForm.startDate) nextErrors.startDate = "请选择开始时间。";
    if (!contractForm.endDate) nextErrors.endDate = "请选择结束时间。";
    if (contractForm.startDate && contractForm.endDate && contractForm.endDate < contractForm.startDate) nextErrors.endDate = "合同结束时间不能早于开始时间。";
    if (Number.isNaN(serviceRate) || serviceRate <= 0 || serviceRate > 100) nextErrors.serviceRate = "服务费率需在 0-100% 之间。";
    contractForm.tiers.forEach((tier, index) => {
      const min = Number(tier.minAmount);
      const max = Number(tier.maxAmount);
      const rate = Number(tier.rebateRate);
      if (Number.isNaN(min) || Number.isNaN(max) || min > max) nextErrors[`tier-${index}`] = "阶梯销售额区间需递增且最小值不大于最大值。";
      if (Number.isNaN(rate) || rate < 0 || rate > 100) nextErrors[`tier-rate-${index}`] = "返利比例需在 0-100% 之间。";
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setOverlayLoading("正在模拟提交 OA 审批并回写销售合同台账");
    window.setTimeout(() => {
      const tiers = contractForm.tiers.map((tier, index) => ({
        id: `${contractForm.id ?? "new"}-tier-${index + 1}`,
        minAmount: Number(tier.minAmount),
        maxAmount: Number(tier.maxAmount),
        rebateRate: Number(tier.rebateRate)
      }));
      const patch: Partial<SalesContract> = {
        code: contractForm.code,
        title: contractForm.title,
        signEntity: contractForm.signEntity,
        accountingEntity: contractForm.accountingEntity,
        customer: contractForm.customer,
        channel: contractForm.channel,
        status: "已生效",
        completionStatus: "履约中",
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        serviceRate,
        settlementRuleSummary: `${contractForm.ruleScene}按 ${serviceRate}% 计服务费，月度结算。`,
        rebateSummary: tiers.map((tier) => `${formatCompactMoney(tier.minAmount)}-${formatCompactMoney(tier.maxAmount)}: ${tier.rebateRate}%`).join("；"),
        terms: contractForm.terms,
        remark: contractForm.remark,
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        approvalStatus: "审批通过",
        failureReason: undefined,
        rules: [{ id: `${contractForm.id ?? "new"}-rule-1`, scene: contractForm.ruleScene, expenseMinor: contractForm.expenseMinor, serviceRate }],
        tiers
      };
      setContracts((items) => {
        if (contractForm.id) {
          return items.map((item) =>
            item.id === contractForm.id
              ? {
                  ...item,
                  ...patch,
                  approvals: [...item.approvals, { node: "模拟 OA 审批", approver: "财务负责人", date: nowText, comment: "合同结构化审批通过，规则已生效。" }],
                  logs: [...item.logs, { time: nowText, operator: applicant.name, action: "结构化维护", comment: "更新合同条款、结算服务费规则和返利阶梯。" }]
                }
              : item
          );
        }
        const newContract: SalesContract = {
          ...(createContract(contracts.length + 10, {
            code: contractForm.code,
            title: contractForm.title,
            customer: contractForm.customer,
            channel: contractForm.channel,
            serviceRate,
            status: "已生效"
          })),
          ...patch,
          id: `sales-contract-${Date.now()}`,
          createdAt: today,
          creator: applicant.name,
          settlingAmount: 0,
          settledAmount: 0,
          unSettledAmount: 0,
          cumulativeSalesAmount: 0,
          cumulativeServiceFee: 0,
          accruedRebate: 0,
          approvals: [{ node: "模拟 OA 审批", approver: "财务负责人", date: nowText, comment: "新增合同结构化审批通过。" }],
          logs: [{ time: nowText, operator: applicant.name, action: "新增销售合同", comment: "前端 mock 新增并审批通过。" }]
        };
        return [newContract, ...items];
      });
      setContractForm(null);
      setOverlayLoading("");
      showToast("销售合同结构化已审批通过，台账状态已更新为已生效。");
    }, 850);
  }

  function openSettlementForm(contract?: SalesContract) {
    const target = contract?.status === "已生效" ? contract : activeContracts[0];
    if (!target) {
      showToast("当前无已生效合同，请先完成合同结构化。");
      return;
    }
    setErrors({});
    setSettlementForm({
      contractId: target.id,
      salesOrderCount: "24880",
      salesSuccessAmount: "5480000",
      returnCount: "820",
      returnAmount: "212928",
      brandActivityAmount: "90000",
      postageAmount: "60000",
      description: `${target.channel} 月度销售服务费结算。`,
      attachmentName: `${target.channel}渠道结算明细.xlsx`
    });
  }

  function syncChannelBill() {
    if (!settlementForm || !selectedSettlementContract) return;
    setSyncProgress("正在连接渠道 API");
    window.setTimeout(() => setSyncProgress("正在下载渠道账单"), 450);
    window.setTimeout(() => setSyncProgress("解析完成，已写入结算明细"), 900);
    window.setTimeout(() => {
      const presets: Record<string, Partial<SettlementFormState>> = {
        得物: { salesOrderCount: "24880", salesSuccessAmount: "5480000", returnCount: "820", returnAmount: "212928", brandActivityAmount: "90000", postageAmount: "60000" },
        京东: { salesOrderCount: "12200", salesSuccessAmount: "2280000", returnCount: "340", returnAmount: "120000", brandActivityAmount: "60000", postageAmount: "30000" },
        抖音: { salesOrderCount: "18820", salesSuccessAmount: "3180000", returnCount: "610", returnAmount: "160000", brandActivityAmount: "130000", postageAmount: "45000" }
      };
      setSettlementForm((current) => (current ? { ...current, ...(presets[selectedSettlementContract.channel] ?? presets.抖音) } : current));
      setSyncProgress("");
      showToast("已模拟同步渠道账单，不连接真实电商平台。");
    }, 1250);
  }

  function submitSettlementForm() {
    if (!settlementForm || !selectedSettlementContract) return;
    const calc = calculateSettlement(settlementForm, selectedSettlementContract);
    const nextErrors: Record<string, string> = {};
    if (!settlementForm.contractId) nextErrors.contractId = "请选择合同。";
    if (calc.salesSuccessAmount <= 0) nextErrors.salesSuccessAmount = "本期销售成功金额必须大于 0。";
    if (calc.returnAmount < 0 || calc.brandActivityAmount < 0 || calc.postageAmount < 0) nextErrors.returnAmount = "扣减金额不能小于 0。";
    if (calc.transactionSuccessAmount <= 0) nextErrors.transactionSuccessAmount = "本期交易成功金额必须大于 0。";
    if (!settlementForm.attachmentName.trim()) nextErrors.attachmentName = "请添加 mock 结算附件名称。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setOverlayLoading("正在模拟提交 OA 审批销售合同结算单");
    window.setTimeout(() => {
      const code = `XSJS-2026-${String(settlements.length + 1).padStart(3, "0")}`;
      const newForm: SalesSettlementForm = {
        id: `settlement-${Date.now()}`,
        code,
        applicant: applicant.name,
        applyDate: today,
        applicantCompany: applicant.company,
        applicantDepartment: applicant.department,
        applicantRole: applicant.role,
        accountingEntity: selectedSettlementContract.accountingEntity,
        contractId: selectedSettlementContract.id,
        contractCode: selectedSettlementContract.code,
        customer: selectedSettlementContract.customer,
        channel: selectedSettlementContract.channel,
        settlementTotal: calc.serviceFeeAmount,
        description: settlementForm.description,
        status: "审批中",
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        voucherNo: "-",
        line: {
          id: `${code}-line-1`,
          salesOrderCount: calc.salesOrderCount,
          salesSuccessAmount: calc.salesSuccessAmount,
          returnCount: calc.returnCount,
          returnAmount: calc.returnAmount,
          brandActivityAmount: calc.brandActivityAmount,
          postageAmount: calc.postageAmount,
          transactionSuccessCount: Math.max(0, calc.salesOrderCount - calc.returnCount),
          transactionSuccessAmount: calc.transactionSuccessAmount,
          serviceRate: selectedSettlementContract.serviceRate,
          serviceFeeAmount: calc.serviceFeeAmount
        },
        attachments: [{ id: `att-${Date.now()}`, name: settlementForm.attachmentName, type: "渠道账单", uploader: applicant.name, uploadedAt: nowText, previewStatus: "可 mock 预览" }],
        approvals: [{ node: "提交 OA", approver: "财务负责人", date: nowText, comment: "已模拟提交审批，待审批通过后回写合同履约区。" }]
      };
      setSettlements((items) => [newForm, ...items]);
      setContracts((items) =>
        items.map((item) =>
          item.id === selectedSettlementContract.id
            ? {
                ...item,
                settlingAmount: item.settlingAmount + calc.serviceFeeAmount,
                logs: [...item.logs, { time: nowText, operator: applicant.name, action: "提交销售结算单", comment: `${code} 已进入审批中，结算中金额增加 ${formatMoney(calc.serviceFeeAmount)}。` }]
              }
            : item
        )
      );
      setSettlementForm(null);
      setOverlayLoading("");
      showToast("销售合同结算单已提交审批，可在结算台账中模拟审批通过。");
    }, 850);
  }

  function approveSettlement(form: SalesSettlementForm) {
    if (form.status !== "审批中") return;
    setSettlements((items) =>
      items.map((item) =>
        item.id === form.id
          ? {
              ...item,
              status: "已完成",
              voucherNo: `PZ-202605-${String(items.length + 10).padStart(4, "0")}`,
              approvals: [...item.approvals, { node: "财务审批", approver: "王悦", date: nowText, comment: "审批通过，已模拟生成凭证并回写合同履约区。" }]
            }
          : item
      )
    );
    setContracts((items) =>
      items.map((item) =>
        item.id === form.contractId
          ? {
              ...item,
              settlingAmount: Math.max(0, item.settlingAmount - form.settlementTotal),
              settledAmount: item.settledAmount + form.settlementTotal,
              cumulativeServiceFee: item.cumulativeServiceFee + form.settlementTotal,
              cumulativeSalesAmount: item.cumulativeSalesAmount + form.line.transactionSuccessAmount,
              unSettledAmount: Math.max(0, item.unSettledAmount - form.settlementTotal),
              logs: [...item.logs, { time: nowText, operator: "王悦", action: "销售结算审批通过", comment: `${form.code} 已回写已结算金额和累计服务费。` }]
            }
          : item
      )
    );
    showToast("结算单已审批通过，合同履约金额已回写。");
  }

  function rejectSettlement(form: SalesSettlementForm) {
    if (form.status !== "审批中") return;
    setSettlements((items) =>
      items.map((item) =>
        item.id === form.id
          ? {
              ...item,
              status: "已驳回",
              failureReason: "附件缺少渠道结算明细或金额口径需业务确认。",
              approvals: [...item.approvals, { node: "财务审批", approver: "王悦", date: nowText, comment: "驳回：附件缺少渠道结算明细。" }]
            }
          : item
      )
    );
    setContracts((items) =>
      items.map((item) => (item.id === form.contractId ? { ...item, settlingAmount: Math.max(0, item.settlingAmount - form.settlementTotal) } : item))
    );
    showToast("结算单已模拟驳回，可重新发起结算。");
  }

  function openRebateForm(contract?: SalesContract) {
    const target = contract?.status === "已生效" ? contract : activeContracts[0];
    if (!target) {
      showToast("当前无已生效合同，请先完成合同结构化。");
      return;
    }
    const monthSalesAmount = 1280000;
    const cumulative = target.cumulativeSalesAmount + monthSalesAmount;
    const tier = matchRebateTier(cumulative, target.tiers);
    const rebateAmount = cumulative * (tier.rebateRate / 100);
    setErrors({});
    setRebateForm({
      contractId: target.id,
      accrualMonth: "2026-05",
      monthSalesAmount: String(monthSalesAmount),
      rebateRate: String(tier.rebateRate),
      rebateAmount: String(Math.round(rebateAmount * 100) / 100),
      accruedRebate: String(target.accruedRebate),
      adjustmentNote: "系统按累计销售额命中阶梯自动建议返利比例。"
    });
  }

  function submitRebateForm() {
    if (!rebateForm || !selectedRebateContract) return;
    const calc = calculateRebate(rebateForm, selectedRebateContract);
    const suggestedTier = matchRebateTier(calc.cumulativeSalesAmount, selectedRebateContract.tiers);
    const nextErrors: Record<string, string> = {};
    if (!rebateForm.accrualMonth) nextErrors.accrualMonth = "请选择计提月份。";
    if (calc.monthSalesAmount <= 0) nextErrors.monthSalesAmount = "本月销售额必须大于 0。";
    if (calc.rebateRate < 0 || calc.rebateRate > 100) nextErrors.rebateRate = "返利比例需在 0-100% 之间。";
    if (calc.currentAccrualAmount < 0) nextErrors.currentAccrualAmount = "本期应计提返利不能小于 0，请调整返利金额或说明。";
    if (Math.abs(calc.rebateRate - suggestedTier.rebateRate) > 0.001 && !rebateForm.adjustmentNote.trim()) nextErrors.adjustmentNote = "手动调整返利比例需填写调整说明。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setOverlayLoading("正在模拟提交 OA 审批销售返利计提单");
    window.setTimeout(() => {
      const code = `XSFL-2026-${String(rebates.length + 1).padStart(3, "0")}`;
      const newForm: RebateAccrualForm = {
        id: `rebate-${Date.now()}`,
        code,
        applicant: applicant.name,
        applyDate: today,
        applicantCompany: applicant.company,
        applicantDepartment: applicant.department,
        applicantRole: applicant.role,
        accountingEntity: selectedRebateContract.accountingEntity,
        contractId: selectedRebateContract.id,
        contractCode: selectedRebateContract.code,
        customer: selectedRebateContract.customer,
        accrualMonth: rebateForm.accrualMonth,
        monthSalesAmount: calc.monthSalesAmount,
        lastCumulativeSalesAmount: selectedRebateContract.cumulativeSalesAmount,
        cumulativeSalesAmount: calc.cumulativeSalesAmount,
        rebateRate: calc.rebateRate,
        rebateAmount: calc.rebateAmount,
        accruedRebate: calc.accruedRebate,
        currentAccrualAmount: calc.currentAccrualAmount,
        adjustmentNote: rebateForm.adjustmentNote,
        status: "审批中",
        voucherNo: "-",
        approvals: [{ node: "提交 OA", approver: "财务负责人", date: nowText, comment: "已模拟提交返利计提审批。" }]
      };
      setRebates((items) => [newForm, ...items]);
      setRebateForm(null);
      setOverlayLoading("");
      showToast("销售返利计提单已提交审批，可在返利台账中模拟审批通过。");
    }, 850);
  }

  function approveRebate(form: RebateAccrualForm) {
    if (form.status !== "审批中") return;
    setRebates((items) =>
      items.map((item) =>
        item.id === form.id
          ? {
              ...item,
              status: "已完成",
              voucherNo: `PZ-202605-${String(items.length + 20).padStart(4, "0")}`,
              approvals: [...item.approvals, { node: "财务审批", approver: "王悦", date: nowText, comment: "审批通过，已回写合同累计计提返利。" }]
            }
          : item
      )
    );
    setContracts((items) =>
      items.map((item) =>
        item.id === form.contractId
          ? {
              ...item,
              cumulativeSalesAmount: form.cumulativeSalesAmount,
              accruedRebate: item.accruedRebate + form.currentAccrualAmount,
              logs: [...item.logs, { time: nowText, operator: "王悦", action: "返利计提审批通过", comment: `${form.code} 已回写累计销售额和累计计提返利。` }]
            }
          : item
      )
    );
    showToast("返利计提已审批通过，合同台账累计返利已更新。");
  }

  function rejectRebate(form: RebateAccrualForm) {
    if (form.status !== "审批中") return;
    setRebates((items) =>
      items.map((item) =>
        item.id === form.id
          ? {
              ...item,
              status: "已驳回",
              approvals: [...item.approvals, { node: "财务审批", approver: "王悦", date: nowText, comment: "驳回：返利比例与合同阶梯不一致。" }]
            }
          : item
      )
    );
    showToast("返利计提单已模拟驳回，可调整后重新提交。");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">合同与 PO</div>
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
              <div key={label} className={`rounded-md px-3 py-2 ${label === "合同与 PO" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{sub}</div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">合同与 PO / 销售合同 / 3.7.17</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">销售合同模块</h1>
              <p className="mt-1 text-sm text-slate-500">销售渠道合同结构化、服务费结算、返利计提和合同履约台账回写的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openContractForm()}>新增销售合同</Button>
              <Button variant="secondary" onClick={simulateContractSync}>模拟同步合同</Button>
              <Button variant="secondary" onClick={() => openSettlementForm()}>新建结算单</Button>
              <Button variant="secondary" onClick={() => openRebateForm()}>新建返利计提</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟生成当前筛选结果导出任务，不创建真实文件。")}>导出模拟</Button>
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

          <FilterBar
            filters={filters}
            customers={customers}
            channels={channels}
            setFilters={setFilters}
            onQuery={simulateQuery}
            onReset={resetFilters}
            onError={() => setPageError("模拟接口失败：销售合同台账服务响应超时，请点击重试。")}
          />

          {pageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium">{pageError}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={simulateQuery}>重试加载</Button>
                <Button size="sm" variant="secondary" onClick={() => setPageError("")}>关闭提示</Button>
              </div>
            </div>
          )}

          {activeContracts.length === 0 && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              当前无生效销售合同，请先完成合同结构化审批后再新建结算单或返利计提单。
            </div>
          )}

          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tableLoading && <LoadingMask text="正在查询销售合同 mock 数据" />}
            <ContractTable
              rows={filteredContracts}
              onDetail={openDetail}
              onEdit={openContractForm}
              onSettlement={openSettlementForm}
              onRebate={openRebateForm}
              onRetry={retryContractSync}
            />
            {!tableLoading && filteredContracts.length === 0 && <EmptyState onCreate={() => openContractForm()} onSync={simulateContractSync} onReset={resetFilters} />}
          </div>

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <LedgerCard title="销售合同结算单台账">
              <SettlementTable rows={settlements} onApprove={approveSettlement} onReject={rejectSettlement} onPreview={setSourcePreview} />
            </LedgerCard>
            <LedgerCard title="销售返利计提台账">
              <RebateTable rows={rebates} onApprove={approveRebate} onReject={rejectRebate} />
            </LedgerCard>
          </section>
        </section>
      </div>

      {detail && (
        <DetailDrawer
          contract={detail}
          tab={detailTab}
          settlements={settlements.filter((item) => item.contractId === detail.id)}
          rebates={rebates.filter((item) => item.contractId === detail.id)}
          onTab={setDetailTab}
          onClose={() => setDetailId("")}
          onEdit={openContractForm}
          onSettlement={openSettlementForm}
          onRebate={openRebateForm}
        />
      )}
      {contractForm && (
        <ContractModal
          form={contractForm}
          errors={errors}
          onChange={(patch) => setContractForm((current) => (current ? { ...current, ...patch } : current))}
          onTierChange={(index, patch) =>
            setContractForm((current) =>
              current
                ? {
                    ...current,
                    tiers: current.tiers.map((tier, tierIndex) => (tierIndex === index ? { ...tier, ...patch } : tier))
                  }
                : current
            )
          }
          onClose={() => setContractForm(null)}
          onSubmit={submitContractForm}
        />
      )}
      {settlementForm && selectedSettlementContract && (
        <SettlementModal
          form={settlementForm}
          contract={selectedSettlementContract}
          contracts={activeContracts}
          errors={errors}
          progress={syncProgress}
          onChange={(patch) => setSettlementForm((current) => (current ? normalizeSettlementForm(current, patch, contracts) : current))}
          onSync={syncChannelBill}
          onClose={() => setSettlementForm(null)}
          onSubmit={submitSettlementForm}
        />
      )}
      {rebateForm && selectedRebateContract && (
        <RebateModal
          form={rebateForm}
          contract={selectedRebateContract}
          contracts={activeContracts}
          errors={errors}
          onChange={(patch) => setRebateForm((current) => (current ? normalizeRebateForm(current, patch, contracts) : current))}
          onClose={() => setRebateForm(null)}
          onSubmit={submitRebateForm}
        />
      )}
      {sourcePreview && <SourceBillDrawer form={sourcePreview} onClose={() => setSourcePreview(null)} />}
      {overlayLoading && <LoadingMask full text={overlayLoading} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function FilterBar({
  filters,
  customers,
  channels,
  setFilters,
  onQuery,
  onReset,
  onError
}: {
  filters: ContractFilters;
  customers: string[];
  channels: string[];
  setFilters: React.Dispatch<React.SetStateAction<ContractFilters>>;
  onQuery: () => void;
  onReset: () => void;
  onError: () => void;
}) {
  const patch = (next: Partial<ContractFilters>) => setFilters((current) => ({ ...current, ...next }));
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-4">
        <Field label="合同编码/标题/主体">
          <Input value={filters.keyword} onChange={(keyword) => patch({ keyword })} placeholder="请输入合同编码、标题、客户" />
        </Field>
        <Field label="客户">
          <Select value={filters.customer} onChange={(customer) => patch({ customer })} options={["全部", ...customers]} />
        </Field>
        <Field label="销售渠道">
          <Select value={filters.channel} onChange={(channel) => patch({ channel })} options={["全部", ...channels]} />
        </Field>
        <Field label="合同状态">
          <Select value={filters.status} onChange={(status) => patch({ status })} options={["全部", "草稿", "待审批", "已生效", "已驳回", "已终止", "已失效"]} />
        </Field>
        <Field label="完结状态">
          <Select value={filters.completionStatus} onChange={(completionStatus) => patch({ completionStatus })} options={["全部", "未完结", "履约中", "已完结"]} />
        </Field>
        <Field label="同步状态">
          <Select value={filters.syncStatus} onChange={(syncStatus) => patch({ syncStatus })} options={["全部", "未同步", "同步中", "同步成功", "同步失败"]} />
        </Field>
        <div className="flex items-end gap-2 lg:col-span-2">
          <Button onClick={onQuery}>查询</Button>
          <Button variant="secondary" onClick={onReset}>重置</Button>
          <Button variant="secondary" onClick={onError}>模拟异常</Button>
        </div>
      </div>
    </div>
  );
}

function ContractTable({
  rows,
  onDetail,
  onEdit,
  onSettlement,
  onRebate,
  onRetry
}: {
  rows: SalesContract[];
  onDetail: (contract: SalesContract, tab?: DetailTab) => void;
  onEdit: (contract: SalesContract) => void;
  onSettlement: (contract: SalesContract) => void;
  onRebate: (contract: SalesContract) => void;
  onRetry: (contract: SalesContract) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>合同编码</Th>
            <Th>客户/渠道</Th>
            <Th>服务费率</Th>
            <Th>合同状态</Th>
            <Th>累计销售额</Th>
            <Th>已结算服务费</Th>
            <Th>累计计提返利</Th>
            <Th>同步状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => {
            const disabled = item.status !== "已生效";
            return (
              <tr key={item.id} className="hover:bg-slate-50">
                <Td>
                  <button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button>
                  <div className="mt-1 max-w-64 truncate text-xs text-slate-400" title={item.title}>{item.title}</div>
                </Td>
                <Td>
                  <div className="font-medium text-slate-800">{item.customer}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400"><ChannelDot channel={item.channel} />{item.channel} / {item.signEntity}</div>
                </Td>
                <Td>{formatPercent(item.serviceRate)}</Td>
                <Td>
                  <StatusBadge status={item.status} />
                  <div className="mt-1"><StatusBadge status={item.completionStatus} /></div>
                </Td>
                <Td align="right">{formatMoney(item.cumulativeSalesAmount)}</Td>
                <Td align="right">
                  <button className="text-blue-600 hover:underline" onClick={() => onDetail(item, "performance")}>{formatMoney(item.settledAmount)}</button>
                  <div className="mt-1 text-xs text-slate-400">结算中 {formatMoney(item.settlingAmount)}</div>
                </Td>
                <Td align="right">{formatMoney(item.accruedRebate)}</Td>
                <Td>
                  <StatusBadge status={item.syncStatus} />
                  <div className="mt-1 text-xs text-slate-400">{item.lastSyncAt}</div>
                  {item.failureReason && <div className="mt-1 max-w-52 whitespace-normal text-xs text-red-500">{item.failureReason}</div>}
                </Td>
                <Td>
                  <InlineActions>
                    <button onClick={() => onDetail(item)}>详情</button>
                    <button onClick={() => onEdit(item)}>结构化</button>
                    <button className={disabled ? "cursor-not-allowed text-slate-400 hover:no-underline" : ""} disabled={disabled} onClick={() => onSettlement(item)}>新建结算单</button>
                    <button className={disabled ? "cursor-not-allowed text-slate-400 hover:no-underline" : ""} disabled={disabled} onClick={() => onRebate(item)}>返利计提</button>
                    {item.syncStatus === "同步失败" && <button onClick={() => onRetry(item)}>重试同步</button>}
                  </InlineActions>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

function DetailDrawer({
  contract,
  tab,
  settlements,
  rebates,
  onTab,
  onClose,
  onEdit,
  onSettlement,
  onRebate
}: {
  contract: SalesContract;
  tab: DetailTab;
  settlements: SalesSettlementForm[];
  rebates: RebateAccrualForm[];
  onTab: (tab: DetailTab) => void;
  onClose: () => void;
  onEdit: (contract: SalesContract) => void;
  onSettlement: (contract: SalesContract) => void;
  onRebate: (contract: SalesContract) => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-5xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">销售合同详情</div>
              <h2 className="mt-1 text-lg font-semibold">{contract.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={contract.status} />
                <StatusBadge status={contract.syncStatus} />
                <StatusBadge status={contract.approvalStatus} />
              </div>
            </div>
            <button className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Summary label="累计销售额" value={formatMoney(contract.cumulativeSalesAmount)} />
            <Summary label="已结算服务费" value={formatMoney(contract.settledAmount)} />
            <Summary label="累计已计提返利" value={formatMoney(contract.accruedRebate)} />
            <Summary label="剩余销售限额" value={formatMoney(Math.max(0, Math.max(...contract.tiers.map((item) => item.maxAmount)) - contract.cumulativeSalesAmount))} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["base", "基础信息"],
              ["terms", "条款信息"],
              ["rules", "结算/返利规则"],
              ["performance", "履约记录"],
              ["logs", "审批/日志"]
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
            <Section title="合同基础信息" extra={<Button size="sm" variant="secondary" onClick={() => onEdit(contract)}>编辑结构化</Button>}>
              <DetailGrid rows={[
                ["合同编码", contract.code],
                ["合同标题", contract.title],
                ["签约主体", contract.signEntity],
                ["核算主体", contract.accountingEntity],
                ["客户", contract.customer],
                ["销售渠道", contract.channel],
                ["合同期间", `${contract.startDate} 至 ${contract.endDate}`],
                ["合同状态", <StatusBadge key="status" status={contract.status} />],
                ["完结状态", <StatusBadge key="completion" status={contract.completionStatus} />],
                ["来源系统", contract.sourceSystem],
                ["同步批次", contract.syncBatchNo],
                ["备注", contract.remark]
              ]} />
            </Section>
          )}
          {tab === "terms" && (
            <Section title="合同条款区">
              <div className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{contract.terms}</div>
              <div className="mt-3 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{contract.settlementRuleSummary}</div>
            </Section>
          )}
          {tab === "rules" && (
            <>
              <Section title="结算服务费规则">
                <RuleTable rows={contract.rules} />
              </Section>
              <Section title="返利阶梯" extra={<TierProgress contract={contract} />}>
                <TierTable rows={contract.tiers} currentAmount={contract.cumulativeSalesAmount} />
              </Section>
            </>
          )}
          {tab === "performance" && (
            <>
              <Section title="合同履约区" extra={<div className="flex gap-2"><Button size="sm" onClick={() => onSettlement(contract)}>新建结算单</Button><Button size="sm" variant="secondary" onClick={() => onRebate(contract)}>返利计提</Button></div>}>
                <div className="grid gap-3 md:grid-cols-5">
                  <Summary label="结算中金额" value={formatMoney(contract.settlingAmount)} />
                  <Summary label="已结算金额" value={formatMoney(contract.settledAmount)} />
                  <Summary label="未结算金额" value={formatMoney(contract.unSettledAmount)} />
                  <Summary label="累计服务费" value={formatMoney(contract.cumulativeServiceFee)} />
                  <Summary label="累计计提返利" value={formatMoney(contract.accruedRebate)} />
                </div>
              </Section>
              <Section title="关联结算单">
                <SettlementMiniTable rows={settlements} />
              </Section>
              <Section title="关联返利计提单">
                <RebateMiniTable rows={rebates} />
              </Section>
            </>
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

function ContractModal({
  form,
  errors,
  onChange,
  onTierChange,
  onClose,
  onSubmit
}: {
  form: ContractFormState;
  errors: Record<string, string>;
  onChange: (patch: Partial<ContractFormState>) => void;
  onTierChange: (index: number, patch: Partial<ContractFormState["tiers"][number]>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal title={form.id ? "销售合同结构化维护" : "新增销售合同结构化"} onClose={onClose} size="xl">
      <Alert tone="green">提交后将模拟 OA 审批通过，并把合同状态更新为已生效；不连接真实合同系统或外部授权接口。</Alert>
      <section className="grid gap-4 xl:grid-cols-2">
        <Section title="基础信息">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="合同编码" required error={errors.code}>
              <Input value={form.code} onChange={(code) => onChange({ code })} />
            </Field>
            <Field label="合同标题" required error={errors.title}>
              <Input value={form.title} onChange={(title) => onChange({ title })} placeholder="如：得物代销合作协议" />
            </Field>
            <Field label="签约主体" required error={errors.signEntity}>
              <Input value={form.signEntity} onChange={(signEntity) => onChange({ signEntity })} />
            </Field>
            <Field label="核算主体">
              <Input value={form.accountingEntity} onChange={(accountingEntity) => onChange({ accountingEntity })} />
            </Field>
            <Field label="客户" required error={errors.customer}>
              <Input value={form.customer} onChange={(customer) => onChange({ customer })} />
            </Field>
            <Field label="销售渠道">
              <Select value={form.channel} onChange={(channel) => onChange({ channel })} options={["得物", "京东", "唯品会", "抖音", "天猫", "小红书", "拼多多", "快手"]} />
            </Field>
            <Field label="开始时间" required error={errors.startDate}>
              <Input value={form.startDate} onChange={(startDate) => onChange({ startDate })} />
            </Field>
            <Field label="结束时间" required error={errors.endDate}>
              <Input value={form.endDate} onChange={(endDate) => onChange({ endDate })} />
            </Field>
          </div>
        </Section>
        <Section title="结算规则">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="营销活动场景">
              <Input value={form.ruleScene} onChange={(ruleScene) => onChange({ ruleScene })} />
            </Field>
            <Field label="费用小类">
              <Input value={form.expenseMinor} onChange={(expenseMinor) => onChange({ expenseMinor })} />
            </Field>
            <Field label="服务费率(%)" required error={errors.serviceRate}>
              <Input value={form.serviceRate} onChange={(serviceRate) => onChange({ serviceRate })} />
            </Field>
            <Field label="备注">
              <Input value={form.remark} onChange={(remark) => onChange({ remark })} />
            </Field>
            <Field label="合同条款区" className="md:col-span-2">
              <Textarea value={form.terms} onChange={(terms) => onChange({ terms })} />
            </Field>
          </div>
        </Section>
      </section>
      <Section title="返利阶梯">
        <div className="overflow-x-auto">
          <Table compact>
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <Th>行号</Th>
                <Th>最小阶梯销售额</Th>
                <Th>最大阶梯销售额</Th>
                <Th>返利百分比</Th>
                <Th>校验</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {form.tiers.map((tier, index) => (
                <tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td><Input value={tier.minAmount} onChange={(minAmount) => onTierChange(index, { minAmount })} /></Td>
                  <Td><Input value={tier.maxAmount} onChange={(maxAmount) => onTierChange(index, { maxAmount })} /></Td>
                  <Td><Input value={tier.rebateRate} onChange={(rebateRate) => onTierChange(index, { rebateRate })} /></Td>
                  <Td>
                    {(errors[`tier-${index}`] || errors[`tier-rate-${index}`]) ? (
                      <span className="text-xs text-red-500">{errors[`tier-${index}`] || errors[`tier-rate-${index}`]}</span>
                    ) : (
                      <StatusBadge status="可用" />
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>提交审批并通过</Button>
      </ModalActions>
    </Modal>
  );
}

function SettlementModal({
  form,
  contract,
  contracts,
  errors,
  progress,
  onChange,
  onSync,
  onClose,
  onSubmit
}: {
  form: SettlementFormState;
  contract: SalesContract;
  contracts: SalesContract[];
  errors: Record<string, string>;
  progress: string;
  onChange: (patch: Partial<SettlementFormState>) => void;
  onSync: () => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const calc = calculateSettlement(form, contract);
  return (
    <Modal title="销售合同结算单" onClose={onClose} size="xl">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Section title="合同核心规则摘要">
          <DetailGrid rows={[
            ["合同编号", contract.code],
            ["客户", contract.customer],
            ["销售渠道", contract.channel],
            ["核算主体", contract.accountingEntity],
            ["合同期间", `${contract.startDate} 至 ${contract.endDate}`],
            ["服务费率", formatPercent(contract.serviceRate)],
            ["结算规则", contract.settlementRuleSummary],
            ["同步状态", <StatusBadge key="sync" status={contract.syncStatus} />],
            ["已结算金额", formatMoney(contract.settledAmount)]
          ]} />
        </Section>
        <Section title="本期数据录入" extra={<Button size="sm" variant="secondary" onClick={onSync}>模拟同步账单</Button>}>
          {progress && <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{progress}</div>}
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="合同编号" required error={errors.contractId}>
              <Select value={form.contractId} onChange={(contractId) => onChange({ contractId })} options={contracts.map((item) => item.id)} labels={Object.fromEntries(contracts.map((item) => [item.id, `${item.code} / ${item.title}`]))} />
            </Field>
            <Field label="本期销售成功订单数量">
              <Input value={form.salesOrderCount} onChange={(salesOrderCount) => onChange({ salesOrderCount })} />
            </Field>
            <Field label="本期销售成功订单金额" required error={errors.salesSuccessAmount}>
              <Input value={form.salesSuccessAmount} onChange={(salesSuccessAmount) => onChange({ salesSuccessAmount })} />
            </Field>
            <Field label="本期客退数量">
              <Input value={form.returnCount} onChange={(returnCount) => onChange({ returnCount })} />
            </Field>
            <Field label="本期客退金额" error={errors.returnAmount}>
              <Input value={form.returnAmount} onChange={(returnAmount) => onChange({ returnAmount })} />
            </Field>
            <Field label="本期品牌承担活动金额">
              <Input value={form.brandActivityAmount} onChange={(brandActivityAmount) => onChange({ brandActivityAmount })} />
            </Field>
            <Field label="本期包邮金额">
              <Input value={form.postageAmount} onChange={(postageAmount) => onChange({ postageAmount })} />
            </Field>
            <Field label="附件名称" required error={errors.attachmentName}>
              <Input value={form.attachmentName} onChange={(attachmentName) => onChange({ attachmentName })} />
            </Field>
            <Field label="说明">
              <Input value={form.description} onChange={(description) => onChange({ description })} />
            </Field>
          </div>
        </Section>
      </div>
      <Section title="自动计算">
        <div className="grid gap-3 md:grid-cols-5">
          <Summary label="本期交易成功数量" value={calc.transactionSuccessCount} />
          <Summary label="本期交易成功金额" value={formatMoney(calc.transactionSuccessAmount)} />
          <Summary label="服务费率" value={formatPercent(contract.serviceRate)} />
          <Summary label="本期服务费金额" value={formatMoney(calc.serviceFeeAmount)} />
          <Summary label="结算金额合计" value={formatMoney(calc.serviceFeeAmount)} />
        </div>
        {errors.transactionSuccessAmount && <div className="mt-2 text-sm text-red-500">{errors.transactionSuccessAmount}</div>}
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>提交 OA 审批</Button>
      </ModalActions>
    </Modal>
  );
}

function RebateModal({
  form,
  contract,
  contracts,
  errors,
  onChange,
  onClose,
  onSubmit
}: {
  form: RebateFormState;
  contract: SalesContract;
  contracts: SalesContract[];
  errors: Record<string, string>;
  onChange: (patch: Partial<RebateFormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const calc = calculateRebate(form, contract);
  const tier = matchRebateTier(calc.cumulativeSalesAmount, contract.tiers);
  const adjusted = Math.abs(calc.rebateRate - tier.rebateRate) > 0.001;
  return (
    <Modal title="销售返利计提单" onClose={onClose} size="xl">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Section title="合同与阶梯摘要">
          <DetailGrid rows={[
            ["合同编号", contract.code],
            ["客户", contract.customer],
            ["销售渠道", contract.channel],
            ["上月累计销售额", formatMoney(contract.cumulativeSalesAmount)],
            ["累计已计提返利", formatMoney(contract.accruedRebate)],
            ["建议返利比例", formatPercent(tier.rebateRate)]
          ]} />
          <div className="mt-4">
            <TierProgress contract={{ ...contract, cumulativeSalesAmount: calc.cumulativeSalesAmount }} />
          </div>
          <div className="mt-3">
            <TierTable rows={contract.tiers} currentAmount={calc.cumulativeSalesAmount} />
          </div>
        </Section>
        <Section title="返利计算明细">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="合同编号">
              <Select value={form.contractId} onChange={(contractId) => onChange({ contractId })} options={contracts.map((item) => item.id)} labels={Object.fromEntries(contracts.map((item) => [item.id, `${item.code} / ${item.title}`]))} />
            </Field>
            <Field label="计提月份" required error={errors.accrualMonth}>
              <Input value={form.accrualMonth} onChange={(accrualMonth) => onChange({ accrualMonth })} />
            </Field>
            <Field label="本月销售额" required error={errors.monthSalesAmount}>
              <Input value={form.monthSalesAmount} onChange={(monthSalesAmount) => onChange({ monthSalesAmount })} />
            </Field>
            <Field label="返利比例(%)" error={errors.rebateRate}>
              <Input value={form.rebateRate} onChange={(rebateRate) => onChange({ rebateRate })} />
            </Field>
            <Field label="返利金额">
              <Input value={form.rebateAmount} onChange={(rebateAmount) => onChange({ rebateAmount })} />
            </Field>
            <Field label="已计提返利">
              <Input value={form.accruedRebate} onChange={(accruedRebate) => onChange({ accruedRebate })} />
            </Field>
            <Field label="调整说明" error={errors.adjustmentNote} className="md:col-span-2">
              <Textarea value={form.adjustmentNote} onChange={(adjustmentNote) => onChange({ adjustmentNote })} />
            </Field>
          </div>
          {adjusted && <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">当前返利比例与系统建议比例不一致，需保留调整说明。</div>}
        </Section>
      </div>
      <Section title="自动计算">
        <div className="grid gap-3 md:grid-cols-5">
          <Summary label="上月累计销售额" value={formatMoney(contract.cumulativeSalesAmount)} />
          <Summary label="累计销售额" value={formatMoney(calc.cumulativeSalesAmount)} />
          <Summary label="返利金额" value={formatMoney(calc.rebateAmount)} />
          <Summary label="已计提返利" value={formatMoney(calc.accruedRebate)} />
          <Summary label="本期应计提返利" value={formatMoney(calc.currentAccrualAmount)} />
        </div>
        {errors.currentAccrualAmount && <div className="mt-2 text-sm text-red-500">{errors.currentAccrualAmount}</div>}
      </Section>
      <ModalActions>
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>提交 OA 审批</Button>
      </ModalActions>
    </Modal>
  );
}

function SettlementTable({ rows, onApprove, onReject, onPreview }: { rows: SalesSettlementForm[]; onApprove: (form: SalesSettlementForm) => void; onReject: (form: SalesSettlementForm) => void; onPreview: (form: SalesSettlementForm) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>结算单号</Th>
            <Th>合同/客户</Th>
            <Th>渠道</Th>
            <Th>交易成功金额</Th>
            <Th>服务费金额</Th>
            <Th>状态</Th>
            <Th>凭证号</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}<div className="mt-1 text-xs text-slate-400">{item.applyDate}</div></Td>
              <Td>{item.contractCode}<div className="mt-1 max-w-56 truncate text-xs text-slate-400">{item.customer}</div></Td>
              <Td>{item.channel}</Td>
              <Td align="right">{formatMoney(item.line.transactionSuccessAmount)}</Td>
              <Td align="right">{formatMoney(item.settlementTotal)}</Td>
              <Td><StatusBadge status={item.status} />{item.failureReason && <div className="mt-1 max-w-48 whitespace-normal text-xs text-red-500">{item.failureReason}</div>}</Td>
              <Td>{item.voucherNo}</Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onPreview(item)}>来源单据</button>
                  {item.status === "审批中" && <button onClick={() => onApprove(item)}>审批通过</button>}
                  {item.status === "审批中" && <button onClick={() => onReject(item)}>驳回</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无销售合同结算单。" />}
    </div>
  );
}

function RebateTable({ rows, onApprove, onReject }: { rows: RebateAccrualForm[]; onApprove: (form: RebateAccrualForm) => void; onReject: (form: RebateAccrualForm) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>计提单号</Th>
            <Th>合同/客户</Th>
            <Th>计提月份</Th>
            <Th>累计销售额</Th>
            <Th>返利比例</Th>
            <Th>本期应计提</Th>
            <Th>状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id}>
              <Td>{item.code}<div className="mt-1 text-xs text-slate-400">{item.applyDate}</div></Td>
              <Td>{item.contractCode}<div className="mt-1 max-w-56 truncate text-xs text-slate-400">{item.customer}</div></Td>
              <Td>{item.accrualMonth}</Td>
              <Td align="right">{formatMoney(item.cumulativeSalesAmount)}</Td>
              <Td>{formatPercent(item.rebateRate)}</Td>
              <Td align="right">{formatMoney(item.currentAccrualAmount)}</Td>
              <Td><StatusBadge status={item.status} /></Td>
              <Td>
                <InlineActions>
                  {item.status === "审批中" && <button onClick={() => onApprove(item)}>审批通过</button>}
                  {item.status === "审批中" && <button onClick={() => onReject(item)}>驳回</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无销售返利计提单。" />}
    </div>
  );
}

function SourceBillDrawer({ form, onClose }: { form: SalesSettlementForm; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">电商渠道账单原始样式 Mock</h2>
          <button className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          <Alert tone="orange">此处仅为来源单据预览 mock，不调用得物、京东、抖音或其他真实渠道后台。</Alert>
          <Section title="来源账单">
            <DetailGrid rows={[
              ["来源渠道", `[${form.channel}] mock 渠道账单`],
              ["结算单号", form.code],
              ["合同编号", form.contractCode],
              ["交易成功金额", formatMoney(form.line.transactionSuccessAmount)],
              ["服务费金额", formatMoney(form.line.serviceFeeAmount)],
              ["最近同步", form.lastSyncAt],
              ["同步状态", <StatusBadge key="sync" status={form.syncStatus} />],
              ["附件", form.attachments[0]?.name ?? "-"],
              ["预览状态", "已模拟打开渠道账单详情"]
            ]} />
          </Section>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Mock 账单预览区域：展示渠道字段映射、金额口径和同步状态，不上传真实附件。
          </div>
        </div>
      </aside>
    </div>
  );
}

function RuleTable({ rows }: { rows: SettlementRule[] }) {
  return (
    <Table compact>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>行号</Th>
          <Th>营销活动场景</Th>
          <Th>费用小类</Th>
          <Th>服务费率</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item, index) => (
          <tr key={item.id}>
            <Td>{index + 1}</Td>
            <Td>{item.scene}</Td>
            <Td>{item.expenseMinor}</Td>
            <Td>{formatPercent(item.serviceRate)}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TierTable({ rows, currentAmount }: { rows: RebateTier[]; currentAmount: number }) {
  return (
    <Table compact>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>行号</Th>
          <Th>最小阶梯销售额</Th>
          <Th>最大阶梯销售额</Th>
          <Th>返利百分比</Th>
          <Th>命中状态</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item, index) => {
          const active = currentAmount >= item.minAmount && currentAmount <= item.maxAmount;
          return (
            <tr key={item.id} className={active ? "bg-blue-50" : ""}>
              <Td>{index + 1}</Td>
              <Td align="right">{formatMoney(item.minAmount)}</Td>
              <Td align="right">{formatMoney(item.maxAmount)}</Td>
              <Td>{formatPercent(item.rebateRate)}</Td>
              <Td><StatusBadge status={active ? "当前命中" : "未命中"} /></Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function TierProgress({ contract }: { contract: SalesContract }) {
  const maxAmount = Math.max(...contract.tiers.map((item) => item.maxAmount));
  const ratio = maxAmount > 0 ? Math.min(contract.cumulativeSalesAmount / maxAmount, 1) : 0;
  const widthClass = ratio >= 1 ? "w-full" : ratio >= 0.75 ? "w-3/4" : ratio >= 0.5 ? "w-1/2" : ratio >= 0.25 ? "w-1/4" : ratio > 0 ? "w-1/6" : "w-0";
  const tier = matchRebateTier(contract.cumulativeSalesAmount, contract.tiers);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>累计销售额 {formatMoney(contract.cumulativeSalesAmount)}</span>
        <span>命中 {formatPercent(tier.rebateRate)}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full bg-blue-600 ${widthClass}`} />
      </div>
    </div>
  );
}

function SettlementMiniTable({ rows }: { rows: SalesSettlementForm[] }) {
  if (rows.length === 0) return <MiniEmpty text="暂无关联结算单。" />;
  return (
    <RecordTable rows={rows.map((item) => ({ time: item.applyDate, operator: item.code, action: item.status, comment: `${formatMoney(item.settlementTotal)} / ${item.channel}` }))} />
  );
}

function RebateMiniTable({ rows }: { rows: RebateAccrualForm[] }) {
  if (rows.length === 0) return <MiniEmpty text="暂无关联返利计提单。" />;
  return (
    <RecordTable rows={rows.map((item) => ({ time: item.applyDate, operator: item.code, action: item.status, comment: `${item.accrualMonth} / ${formatMoney(item.currentAccrualAmount)}` }))} />
  );
}

function RecordTable({ rows }: { rows: OperationLog[] }) {
  return (
    <div className="overflow-x-auto">
      <Table compact>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>时间</Th>
            <Th>操作人</Th>
            <Th>动作</Th>
            <Th>说明</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item, index) => (
            <tr key={`${item.time}-${item.action}-${index}`}>
              <Td>{item.time}</Td>
              <Td>{item.operator}</Td>
              <Td>{item.action}</Td>
              <Td>{item.comment}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {rows.length === 0 && <MiniEmpty text="暂无记录。" />}
    </div>
  );
}

function calculateSettlement(form: SettlementFormState, contract: SalesContract) {
  const salesOrderCount = toNumber(form.salesOrderCount);
  const salesSuccessAmount = toNumber(form.salesSuccessAmount);
  const returnCount = toNumber(form.returnCount);
  const returnAmount = toNumber(form.returnAmount);
  const brandActivityAmount = toNumber(form.brandActivityAmount);
  const postageAmount = toNumber(form.postageAmount);
  const transactionSuccessAmount = Math.max(0, salesSuccessAmount - returnAmount - brandActivityAmount - postageAmount);
  const transactionSuccessCount = Math.max(0, salesOrderCount - returnCount);
  const serviceFeeAmount = roundMoney(transactionSuccessAmount * (contract.serviceRate / 100));
  return { salesOrderCount, salesSuccessAmount, returnCount, returnAmount, brandActivityAmount, postageAmount, transactionSuccessAmount, transactionSuccessCount, serviceFeeAmount };
}

function calculateRebate(form: RebateFormState, contract: SalesContract) {
  const monthSalesAmount = toNumber(form.monthSalesAmount);
  const cumulativeSalesAmount = contract.cumulativeSalesAmount + monthSalesAmount;
  const rebateRate = toNumber(form.rebateRate);
  const rebateAmount = toNumber(form.rebateAmount) || roundMoney(cumulativeSalesAmount * (rebateRate / 100));
  const accruedRebate = toNumber(form.accruedRebate);
  const currentAccrualAmount = roundMoney(rebateAmount - accruedRebate);
  return { monthSalesAmount, cumulativeSalesAmount, rebateRate, rebateAmount, accruedRebate, currentAccrualAmount };
}

function matchRebateTier(amount: number, tiers: RebateTier[]) {
  return tiers.find((tier) => amount >= tier.minAmount && amount <= tier.maxAmount) ?? tiers[tiers.length - 1];
}

function normalizeSettlementForm(current: SettlementFormState, patch: Partial<SettlementFormState>, contracts: SalesContract[]) {
  const next = { ...current, ...patch };
  if (patch.contractId) {
    const contract = contracts.find((item) => item.id === patch.contractId);
    if (contract) next.description = `${contract.channel} 月度销售服务费结算。`;
  }
  return next;
}

function normalizeRebateForm(current: RebateFormState, patch: Partial<RebateFormState>, contracts: SalesContract[]) {
  const next = { ...current, ...patch };
  const contract = contracts.find((item) => item.id === next.contractId);
  if (!contract) return next;
  const monthSalesAmount = toNumber(next.monthSalesAmount);
  const cumulativeSalesAmount = contract.cumulativeSalesAmount + monthSalesAmount;
  if (patch.contractId || patch.monthSalesAmount) {
    const tier = matchRebateTier(cumulativeSalesAmount, contract.tiers);
    next.rebateRate = String(tier.rebateRate);
    next.rebateAmount = String(roundMoney(cumulativeSalesAmount * (tier.rebateRate / 100)));
    next.accruedRebate = String(contract.accruedRebate);
  } else if (patch.rebateRate) {
    const rate = toNumber(patch.rebateRate);
    next.rebateAmount = String(roundMoney(cumulativeSalesAmount * (rate / 100)));
  }
  return next;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompactMoney(value: number) {
  if (value >= 10000) return `${value / 10000}万`;
  return `${value}`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}%`;
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
  return <div className="flex flex-wrap gap-2 text-sm font-medium text-blue-600 [&_button:disabled]:text-slate-400 [&_button:hover:not(:disabled)]:underline">{children}</div>;
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
  return <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={value} onChange={(event) => onChange(event.target.value)} />;
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
    status.includes("失败") || status.includes("驳回") || status.includes("作废")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("通过") || status.includes("完成") || status.includes("生效") || status.includes("成功") || status.includes("可用")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("审批") || status.includes("履约中") || status.includes("同步中") || status.includes("计提中") || status.includes("结算中") || status.includes("命中")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("待") || status.includes("草稿") || status.includes("未")
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : status.includes("终止") || status.includes("失效")
              ? "border-slate-200 bg-slate-200 text-slate-500"
              : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function ChannelDot({ channel }: { channel: string }) {
  const className = channel === "京东" ? "bg-red-500" : channel === "得物" ? "bg-slate-900" : channel === "抖音" ? "bg-cyan-500" : channel === "唯品会" ? "bg-pink-500" : "bg-blue-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
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

function Modal({ title, children, onClose, size = "md" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "xl" }) {
  const sizeClass = size === "xl" ? "max-w-7xl" : "max-w-2xl";
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

function EmptyState({ onCreate, onSync, onReset }: { onCreate: () => void; onSync: () => void; onReset: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center border-t border-slate-100 bg-slate-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">0</div>
      <div className="font-medium text-slate-700">暂无销售合同或筛选无结果</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选、新增销售合同，或模拟同步合同系统继续演示。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button variant="secondary" onClick={onSync}>模拟同步合同</Button>
        <Button onClick={onCreate}>新增销售合同</Button>
      </div>
    </div>
  );
}

function MiniEmpty({ text }: { text: string }) {
  return <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">{text}</div>;
}
