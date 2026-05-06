"use client";

import { ReactNode, useMemo, useState } from "react";

type ViewMode = "pending" | "writeoff" | "noInvoice";
type InvoiceLedgerStatus = "发票未到" | "部分到票" | "到票中" | "已到票完结" | "已无票核销" | "已红冲";
type FinishStatus = "未完结" | "部分完结" | "已完结";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type CheckStatus = "待查验" | "查验通过" | "查验失败" | "无需查验";
type RedFlushStatus = "未红冲" | "红冲中" | "部分红冲" | "已红冲";
type ApplicationStatus = "草稿" | "审批中" | "财务待签收" | "已驳回" | "审批通过" | "已完成";
type UseStatus = "未使用" | "部分使用" | "已使用" | "已关闭";
type DetailData =
  | { type: "pending"; row: PendingInvoiceLedger }
  | { type: "writeoff"; row: InvoiceWriteoffLedger }
  | { type: "noInvoice"; row: NoInvoiceLedger };

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

interface PendingInvoiceLedger {
  id: string;
  settlementNo: string;
  documentName: string;
  applyDate: string;
  contractCode: string;
  contractName: string;
  accountingEntity: string;
  supplier: string;
  activity: string;
  planCategory: string;
  description: string;
  expenseMajor: string;
  expenseMinor: string;
  totalAmount: number;
  inTransitAmount: number;
  invoicedAmount: number;
  sourceType: string;
  sourceCode: string;
  payableDate: string;
  expectedPayDate: string;
  invoiceStatus: InvoiceLedgerStatus;
  finishStatus: FinishStatus;
  allowNoInvoice: boolean;
  noInvoiceApplicationNo?: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface InvoicePoolItem {
  id: string;
  invoiceNo: string;
  invoiceCode: string;
  invoiceType: string;
  issuedAt: string;
  supplier: string;
  buyerName: string;
  buyerTaxNo: string;
  totalAmount: number;
  noTaxAmount: number;
  taxAmount: number;
  usedAmount: number;
  checkStatus: CheckStatus;
  failureReason?: string;
  attachmentName: string;
}

interface PrepaymentPoolItem {
  id: string;
  code: string;
  supplier: string;
  accountingEntity: string;
  contractCode: string;
  prepaidAmount: number;
  unusedAmount: number;
  arrivedInvoice: boolean;
}

interface InvoiceWriteoffLedger {
  id: string;
  code: string;
  documentName: string;
  writeoffDate: string;
  writeoffApplicationNo: string;
  settlementNo: string;
  settlementDate: string;
  pendingLedgerId: string;
  invoiceIds: string[];
  accountingEntity: string;
  supplier: string;
  activity: string;
  expenseMajor: string;
  expenseMinor: string;
  settlementAmount: number;
  writeoffAmount: number;
  redFlushedAmount: number;
  payableDate: string;
  redFlushStatus: RedFlushStatus;
  voucherNo: string;
  kingdeeVoucherNo: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface NoInvoiceLedger {
  id: string;
  code: string;
  documentName: string;
  applyDate: string;
  accountingEntity: string;
  supplier: string;
  contractCode: string;
  contractName: string;
  settled: boolean;
  applicationAmount: number;
  availableAmount: number;
  settlementNo: string;
  useStatus: UseStatus;
  approvalStatus: ApplicationStatus;
  voucherNo: string;
  description: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface InvoiceFilters {
  keyword: string;
  supplier: string;
  activity: string;
  expenseMinor: string;
  invoiceStatus: string;
  finishStatus: string;
}

interface LedgerFilters {
  keyword: string;
  supplier: string;
  accountingEntity: string;
  status: string;
}

interface WriteoffFormState {
  code: string;
  applyDate: string;
  applicant: string;
  applicantOrg: string;
  accountingEntity: string;
  supplier: string;
  selectedPendingIds: string[];
  selectedInvoiceIds: string[];
  prepaymentId: string;
  description: string;
  status: "草稿" | "审批中";
}

interface RedFlushFormState {
  code: string;
  applyDate: string;
  applicant: string;
  sourceLedgerId: string;
  amount: string;
  reason: string;
  status: "草稿" | "审批中";
}

interface NoInvoiceFormState {
  code: string;
  applyDate: string;
  applicant: string;
  accountingEntity: string;
  supplier: string;
  settled: boolean;
  businessOccurred: boolean;
  frameworkType: string;
  selectedPendingIds: string[];
  contractCode: string;
  contractName: string;
  contractAmount: string;
  activity: string;
  amount: string;
  description: string;
  status: "草稿" | "审批中";
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const initialPendingFilters: InvoiceFilters = {
  keyword: "",
  supplier: "全部",
  activity: "全部",
  expenseMinor: "全部",
  invoiceStatus: "全部",
  finishStatus: "全部"
};
const initialLedgerFilters: LedgerFilters = { keyword: "", supplier: "全部", accountingEntity: "全部", status: "全部" };

const initialPendingLedgers: PendingInvoiceLedger[] = [
  {
    id: "pending-001",
    settlementNo: "JS-2026-0518-001",
    documentName: "双十一达人种草结算单",
    applyDate: "2026-05-01",
    contractCode: "YXHT-2026-133",
    contractName: "小红书达人种草一口价合同",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海拾光内容科技有限公司",
    activity: "小红书达人新品种草",
    planCategory: "内容种草",
    description: "达人笔记发布验收后待到票",
    expenseMajor: "内容费用",
    expenseMinor: "达人合作费",
    totalAmount: 120000,
    inTransitAmount: 0,
    invoicedAmount: 0,
    sourceType: "费用对账结算",
    sourceCode: "GYS-DZ-2026-041",
    payableDate: "2026-05-20",
    expectedPayDate: "2026-05-25",
    invoiceStatus: "发票未到",
    finishStatus: "未完结",
    allowNoInvoice: false,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 17:10:00",
    approvals: [{ node: "结算审批", approver: "李珊", date: "2026-05-01", comment: "结算完成，进入待到票台账。" }],
    logs: [{ time: "2026-05-01 18:05:00", operator: "系统模拟", action: "生成待到票", comment: "由供应商对账单审批完成后写入。" }]
  },
  {
    id: "pending-002",
    settlementNo: "JS-2026-0508-009",
    documentName: "直播坑位费结算单",
    applyDate: "2026-04-28",
    contractCode: "YXHT-2026-211",
    contractName: "抖音新品直播引流服务合同",
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "杭州热浪直播服务有限公司",
    activity: "抖音新品直播专场",
    planCategory: "直播引流",
    description: "直播坑位费验收后待到票",
    expenseMajor: "直播费用",
    expenseMinor: "直播坑位费",
    totalAmount: 98000,
    inTransitAmount: 0,
    invoicedAmount: 98000,
    sourceType: "营销合同结算",
    sourceCode: "HTJS-2026-028",
    payableDate: "2026-05-18",
    expectedPayDate: "2026-05-22",
    invoiceStatus: "已到票完结",
    finishStatus: "已完结",
    allowNoInvoice: false,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 10:20:00",
    approvals: [{ node: "财务签收", approver: "林一", date: "2026-05-04", comment: "已签收发票并完成核销。" }],
    logs: [{ time: "2026-05-04 10:21:00", operator: "系统模拟", action: "凭证回写", comment: "凭证号 KD-202605-0001 已回写。" }]
  },
  {
    id: "pending-003",
    settlementNo: "JS-2026-0504-006",
    documentName: "平台服务费结算单",
    applyDate: "2026-04-29",
    contractCode: "YXHT-2026-176",
    contractName: "平台服务费年度框架合同",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "阿里妈妈",
    activity: "天猫 618 信息流蓄水",
    planCategory: "大促投放",
    description: "平台自动扣款，供应商无法提供发票",
    expenseMajor: "平台费用",
    expenseMinor: "平台服务费",
    totalAmount: 45000,
    inTransitAmount: 0,
    invoicedAmount: 0,
    sourceType: "平台账单结算",
    sourceCode: "PTZD-2026-088",
    payableDate: "2026-05-16",
    expectedPayDate: "2026-05-18",
    invoiceStatus: "发票未到",
    finishStatus: "未完结",
    allowNoInvoice: true,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 09:30:00",
    approvals: [{ node: "结算审批", approver: "顾可", date: "2026-04-29", comment: "允许后续发起无票核销申请。" }],
    logs: [{ time: "2026-04-29 17:10:00", operator: "系统模拟", action: "待到票写入", comment: "平台账单已确认。" }]
  },
  {
    id: "pending-004",
    settlementNo: "JS-2026-0502-015",
    documentName: "品牌推广素材拍摄结算单",
    applyDate: "2026-04-30",
    contractCode: "YXHT-2026-188",
    contractName: "品牌年度内容传播合同",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海蓝杉广告有限公司",
    activity: "品牌年度内容传播",
    planCategory: "品牌推广",
    description: "第一阶段素材制作验收",
    expenseMajor: "品牌费用",
    expenseMinor: "素材制作费",
    totalAmount: 86000,
    inTransitAmount: 20000,
    invoicedAmount: 36000,
    sourceType: "合同 PO 执行",
    sourceCode: "HTPO-2026-031",
    payableDate: "2026-05-28",
    expectedPayDate: "2026-06-02",
    invoiceStatus: "到票中",
    finishStatus: "部分完结",
    allowNoInvoice: false,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 11:22:00",
    approvals: [{ node: "核销提交", approver: "王悦", date: "2026-05-05", comment: "已有 20,000.00 正在审批中。" }],
    logs: [{ time: "2026-05-05 11:22:00", operator: "系统模拟", action: "占用到票金额", comment: "发票核销单 FPHX-2026-0068 提交审批。" }]
  },
  {
    id: "pending-005",
    settlementNo: "JS-2026-0429-003",
    documentName: "京东搜索推广代理费结算单",
    applyDate: "2026-04-25",
    contractCode: "YXHT-2026-152",
    contractName: "京东搜索推广代理合同",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "北京驰骋互动广告有限公司",
    activity: "京东 618 搜索蓄水",
    planCategory: "搜索推广",
    description: "代理服务费月结",
    expenseMajor: "投放费用",
    expenseMinor: "搜索消耗",
    totalAmount: 62000,
    inTransitAmount: 0,
    invoicedAmount: 22000,
    sourceType: "供应商对账单",
    sourceCode: "GYS-DZ-2026-036",
    payableDate: "2026-05-14",
    expectedPayDate: "2026-05-20",
    invoiceStatus: "部分到票",
    finishStatus: "部分完结",
    allowNoInvoice: false,
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 08:30:00",
    failureReason: "金蝶待到票台账同步超时 [K3-504]",
    approvals: [{ node: "结算审批", approver: "陈菲", date: "2026-04-25", comment: "部分发票已核销，仍有余额待到票。" }],
    logs: [{ time: "2026-05-05 08:31:00", operator: "系统模拟", action: "同步失败", comment: "金蝶待到票台账同步超时 [K3-504]。" }]
  },
  {
    id: "pending-006",
    settlementNo: "JS-2026-0430-011",
    documentName: "会员日会场资源位结算单",
    applyDate: "2026-04-30",
    contractCode: "YXHT-2026-220",
    contractName: "618 站内搜索资源包合同",
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "杭州星耀数字科技有限公司",
    activity: "天猫会员日资源推广",
    planCategory: "站内推广",
    description: "资源位投放完成，等待发票",
    expenseMajor: "投放费用",
    expenseMinor: "信息流消耗",
    totalAmount: 76000,
    inTransitAmount: 0,
    invoicedAmount: 0,
    sourceType: "投放自动对账",
    sourceCode: "AUTO-DZ-2026-110",
    payableDate: "2026-05-21",
    expectedPayDate: "2026-05-27",
    invoiceStatus: "发票未到",
    finishStatus: "未完结",
    allowNoInvoice: false,
    syncStatus: "未同步",
    lastSyncAt: "-",
    approvals: [{ node: "自动对账", approver: "系统模拟", date: "2026-04-30", comment: "自动对账通过，等待到票。" }],
    logs: [{ time: "2026-04-30 20:40:00", operator: "系统模拟", action: "生成待到票", comment: "投放账单自动对账生成。" }]
  },
  {
    id: "pending-007",
    settlementNo: "JS-2026-0424-018",
    documentName: "渠道快闪物料结算单",
    applyDate: "2026-04-24",
    contractCode: "YXHT-2026-141",
    contractName: "华南商超快闪物料制作合同",
    accountingEntity: "广州示例贸易有限公司",
    supplier: "广州橙光会展有限公司",
    activity: "华南商超快闪物料",
    planCategory: "线下活动",
    description: "供应商承诺五月中旬补开专票",
    expenseMajor: "活动费用",
    expenseMinor: "活动物料",
    totalAmount: 39000,
    inTransitAmount: 0,
    invoicedAmount: 0,
    sourceType: "营销事项费用",
    sourceCode: "YXSX-FY-2026-019",
    payableDate: "2026-05-26",
    expectedPayDate: "2026-05-30",
    invoiceStatus: "发票未到",
    finishStatus: "未完结",
    allowNoInvoice: true,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 13:10:00",
    approvals: [{ node: "事项费用确认", approver: "赵敏", date: "2026-04-24", comment: "费用确认，允许特殊无票申请。" }],
    logs: [{ time: "2026-04-24 16:40:00", operator: "系统模拟", action: "待到票写入", comment: "营销事项费用确认后生成。" }]
  },
  {
    id: "pending-008",
    settlementNo: "JS-2026-0418-021",
    documentName: "B站种草视频投放结算单",
    applyDate: "2026-04-18",
    contractCode: "YXHT-2026-163",
    contractName: "新品测评达人任务合同",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "上海青禾达人经纪有限公司",
    activity: "新品测评视频投放",
    planCategory: "新品上市",
    description: "发票查验失败待替换",
    expenseMajor: "内容费用",
    expenseMinor: "测评合作费",
    totalAmount: 54000,
    inTransitAmount: 0,
    invoicedAmount: 0,
    sourceType: "达人 PO 执行",
    sourceCode: "DRPO-2026-022",
    payableDate: "2026-05-15",
    expectedPayDate: "2026-05-20",
    invoiceStatus: "发票未到",
    finishStatus: "未完结",
    allowNoInvoice: false,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-01 09:00:00",
    approvals: [{ node: "结算审批", approver: "周岚", date: "2026-04-18", comment: "待业务补充可用发票。" }],
    logs: [{ time: "2026-05-01 09:05:00", operator: "系统模拟", action: "发票查验失败", comment: "购方税号与核算主体不一致。" }]
  }
];

const initialInvoices: InvoicePoolItem[] = [
  createInvoice("inv-001", "30999888", "FP-202605-8801", "上海拾光内容科技有限公司", 80000, "查验通过"),
  createInvoice("inv-002", "30999889", "FP-202605-8802", "上海拾光内容科技有限公司", 40000, "待查验"),
  createInvoice("inv-003", "11882026", "FP-202605-2110", "杭州热浪直播服务有限公司", 98000, "查验通过", 98000),
  createInvoice("inv-004", "20004566", "FP-202605-4566", "上海蓝杉广告有限公司", 20000, "查验通过"),
  createInvoice("inv-005", "20004567", "FP-202605-4567", "上海蓝杉广告有限公司", 30000, "待查验"),
  createInvoice("inv-006", "55667790", "FP-202604-7790", "北京驰骋互动广告有限公司", 22000, "查验通过", 22000),
  createInvoice("inv-007", "55667791", "FP-202605-7791", "北京驰骋互动广告有限公司", 40000, "待查验"),
  createInvoice("inv-008", "66771123", "FP-202605-1123", "杭州星耀数字科技有限公司", 76000, "查验通过"),
  createInvoice("inv-009", "99001231", "FP-202605-1231", "广州橙光会展有限公司", 39000, "无需查验"),
  createInvoice("inv-010", "77884561", "FP-202605-4561", "上海青禾达人经纪有限公司", 54000, "查验失败", 0, "购方税号与核算主体不一致")
];

const initialPrepayments: PrepaymentPoolItem[] = [
  { id: "pre-001", code: "YFK-2026-031", supplier: "上海拾光内容科技有限公司", accountingEntity: "上海示例品牌管理有限公司", contractCode: "YXHT-2026-133", prepaidAmount: 50000, unusedAmount: 50000, arrivedInvoice: false },
  { id: "pre-002", code: "YFK-2026-018", supplier: "上海蓝杉广告有限公司", accountingEntity: "上海示例品牌管理有限公司", contractCode: "YXHT-2026-188", prepaidAmount: 30000, unusedAmount: 10000, arrivedInvoice: false },
  { id: "pre-003", code: "YFK-2026-012", supplier: "杭州热浪直播服务有限公司", accountingEntity: "杭州示例电子商务有限公司", contractCode: "YXHT-2026-211", prepaidAmount: 30000, unusedAmount: 0, arrivedInvoice: true }
];

const initialWriteoffLedgers: InvoiceWriteoffLedger[] = [
  {
    id: "wledger-001",
    code: "FPHX-TZ-2026-001",
    documentName: "发票核销台账",
    writeoffDate: "2026-05-04",
    writeoffApplicationNo: "FPHX-2026-0058",
    settlementNo: "JS-2026-0508-009",
    settlementDate: "2026-04-28",
    pendingLedgerId: "pending-002",
    invoiceIds: ["inv-003"],
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "杭州热浪直播服务有限公司",
    activity: "抖音新品直播专场",
    expenseMajor: "直播费用",
    expenseMinor: "直播坑位费",
    settlementAmount: 98000,
    writeoffAmount: 98000,
    redFlushedAmount: 0,
    payableDate: "2026-05-18",
    redFlushStatus: "未红冲",
    voucherNo: "FP-PZ-202605-0001",
    kingdeeVoucherNo: "KD-202605-0001",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 10:21:00",
    approvals: [{ node: "财务签收", approver: "林一", date: "2026-05-04", comment: "发票查验通过，生成凭证。" }],
    logs: [{ time: "2026-05-04 10:21:00", operator: "系统模拟", action: "插入发票核销台账", comment: "审批完成后插入并回写凭证号。" }]
  },
  {
    id: "wledger-002",
    code: "FPHX-TZ-2026-002",
    documentName: "发票核销台账",
    writeoffDate: "2026-04-29",
    writeoffApplicationNo: "FPHX-2026-0049",
    settlementNo: "JS-2026-0429-003",
    settlementDate: "2026-04-25",
    pendingLedgerId: "pending-005",
    invoiceIds: ["inv-006"],
    accountingEntity: "上海示例贸易有限公司",
    supplier: "北京驰骋互动广告有限公司",
    activity: "京东 618 搜索蓄水",
    expenseMajor: "投放费用",
    expenseMinor: "搜索消耗",
    settlementAmount: 62000,
    writeoffAmount: 22000,
    redFlushedAmount: 0,
    payableDate: "2026-05-14",
    redFlushStatus: "未红冲",
    voucherNo: "FP-PZ-202604-0019",
    kingdeeVoucherNo: "KD-202604-0019",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-29 15:10:00",
    approvals: [{ node: "财务签收", approver: "顾可", date: "2026-04-29", comment: "部分到票完成核销。" }],
    logs: [{ time: "2026-04-29 15:10:00", operator: "系统模拟", action: "部分核销", comment: "剩余 40,000.00 待到票。" }]
  }
];

const initialNoInvoiceLedgers: NoInvoiceLedger[] = [
  {
    id: "noinv-001",
    code: "WPHX-2026-001",
    documentName: "无票核销申请台账",
    applyDate: "2026-04-20",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "阿里妈妈",
    contractCode: "YXHT-2026-098",
    contractName: "直通车平台服务费协议",
    settled: true,
    applicationAmount: 18000,
    availableAmount: 0,
    settlementNo: "JS-2026-0416-009",
    useStatus: "已使用",
    approvalStatus: "已完成",
    voucherNo: "KD-202604-0098",
    description: "平台服务费无票核销，业务已发生。",
    approvals: [{ node: "财务负责人", approver: "林一", date: "2026-04-20", comment: "无票事项依据充分，审批通过。" }],
    logs: [{ time: "2026-04-20 16:20:00", operator: "系统模拟", action: "插入无票台账", comment: "无票核销审批通过。" }]
  },
  {
    id: "noinv-002",
    code: "WPHX-2026-002",
    documentName: "无票核销申请台账",
    applyDate: "2026-04-26",
    accountingEntity: "广州示例贸易有限公司",
    supplier: "广州橙光会展有限公司",
    contractCode: "YXHT-2026-141",
    contractName: "华南商超快闪物料制作合同",
    settled: false,
    applicationAmount: 12000,
    availableAmount: 12000,
    settlementNo: "-",
    useStatus: "未使用",
    approvalStatus: "审批中",
    voucherNo: "-",
    description: "供应商注销风险，申请先做无票额度预留。",
    approvals: [{ node: "业务负责人", approver: "赵敏", date: "2026-04-26", comment: "业务已发生，等待财务确认。" }],
    logs: [{ time: "2026-04-26 14:30:00", operator: "系统模拟", action: "提交 OA", comment: "已模拟提交审批。" }]
  }
];

export default function InvoiceManagementPage() {
  const [view, setView] = useState<ViewMode>("pending");
  const [pendingLedgers, setPendingLedgers] = useState(initialPendingLedgers);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [prepayments, setPrepayments] = useState(initialPrepayments);
  const [writeoffLedgers, setWriteoffLedgers] = useState(initialWriteoffLedgers);
  const [noInvoiceLedgers, setNoInvoiceLedgers] = useState(initialNoInvoiceLedgers);
  const [pendingFilters, setPendingFilters] = useState<InvoiceFilters>(initialPendingFilters);
  const [ledgerFilters, setLedgerFilters] = useState<LedgerFilters>(initialLedgerFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [writeoffForm, setWriteoffForm] = useState<WriteoffFormState | null>(null);
  const [redFlushForm, setRedFlushForm] = useState<RedFlushFormState | null>(null);
  const [noInvoiceForm, setNoInvoiceForm] = useState<NoInvoiceFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suppliers = useMemo(() => Array.from(new Set(pendingLedgers.map((item) => item.supplier).concat(writeoffLedgers.map((item) => item.supplier), noInvoiceLedgers.map((item) => item.supplier)))), [pendingLedgers, writeoffLedgers, noInvoiceLedgers]);
  const activities = useMemo(() => Array.from(new Set(pendingLedgers.map((item) => item.activity))), [pendingLedgers]);
  const expenseMinors = useMemo(() => Array.from(new Set(pendingLedgers.map((item) => item.expenseMinor))), [pendingLedgers]);
  const accountingEntities = useMemo(() => Array.from(new Set(pendingLedgers.map((item) => item.accountingEntity).concat(writeoffLedgers.map((item) => item.accountingEntity), noInvoiceLedgers.map((item) => item.accountingEntity)))), [pendingLedgers, writeoffLedgers, noInvoiceLedgers]);

  const filteredPending = useMemo(() => filterPending(pendingLedgers, pendingFilters), [pendingLedgers, pendingFilters]);
  const filteredWriteoffs = useMemo(() => filterWriteoffs(writeoffLedgers, ledgerFilters), [writeoffLedgers, ledgerFilters]);
  const filteredNoInvoices = useMemo(() => filterNoInvoices(noInvoiceLedgers, ledgerFilters), [noInvoiceLedgers, ledgerFilters]);
  const stats = useMemo(() => buildStats(pendingLedgers, invoices), [pendingLedgers, invoices]);

  const writeoffLines = writeoffForm ? pendingLedgers.filter((item) => writeoffForm.selectedPendingIds.includes(item.id)) : [];
  const writeoffInvoiceRows = writeoffForm ? invoices.filter((item) => writeoffForm.selectedInvoiceIds.includes(item.id)) : [];
  const writeoffAllocations = allocateAcrossRows(writeoffLines, invoiceAvailableTotal(writeoffInvoiceRows));
  const selectedPrepayment = writeoffForm?.prepaymentId ? prepayments.find((item) => item.id === writeoffForm.prepaymentId) : undefined;
  const redFlushSource = redFlushForm ? writeoffLedgers.find((item) => item.id === redFlushForm.sourceLedgerId) : undefined;
  const noInvoiceLines = noInvoiceForm ? pendingLedgers.filter((item) => noInvoiceForm.selectedPendingIds.includes(item.id)) : [];

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
    setPendingFilters(initialPendingFilters);
    setLedgerFilters(initialLedgerFilters);
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 450);
  }

  function retrySync() {
    setPageError("");
    setPendingLedgers((rows) =>
      rows.map((row) =>
        row.syncStatus === "同步失败"
          ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText, logs: [{ time: nowText, operator: "系统模拟", action: "重试同步", comment: "已模拟同步金蝶待到票台账。" }, ...row.logs] }
          : row
      )
    );
    showToast("已模拟重试金蝶同步，失败记录恢复为同步成功。");
  }

  function openWriteoff(source?: PendingInvoiceLedger) {
    const target = source ?? pendingLedgers.find((item) => canWriteoff(item)) ?? pendingLedgers[0];
    setErrors({});
    setWriteoffForm({
      code: `FPHX-2026-${String(writeoffLedgers.length + 61).padStart(4, "0")}`,
      applyDate: today,
      applicant: "王悦",
      applicantOrg: "上海示例品牌管理有限公司 / 财务共享中心 / 费用会计",
      accountingEntity: target.accountingEntity,
      supplier: target.supplier,
      selectedPendingIds: canWriteoff(target) ? [target.id] : [],
      selectedInvoiceIds: [],
      prepaymentId: "",
      description: "发票已收到，申请核销待到票金额。",
      status: "草稿"
    });
  }

  function patchWriteoff(patch: Partial<WriteoffFormState>) {
    setWriteoffForm((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.supplier && patch.supplier !== current.supplier) {
        next.selectedPendingIds = [];
        next.selectedInvoiceIds = [];
        next.prepaymentId = "";
      }
      return next;
    });
  }

  function toggleWriteoffPending(id: string) {
    setWriteoffForm((current) => {
      if (!current || current.status !== "草稿") return current;
      const exists = current.selectedPendingIds.includes(id);
      return { ...current, selectedPendingIds: exists ? current.selectedPendingIds.filter((item) => item !== id) : [...current.selectedPendingIds, id] };
    });
  }

  function toggleWriteoffInvoice(id: string) {
    setWriteoffForm((current) => {
      if (!current || current.status !== "草稿") return current;
      const exists = current.selectedInvoiceIds.includes(id);
      return { ...current, selectedInvoiceIds: exists ? current.selectedInvoiceIds.filter((item) => item !== id) : [...current.selectedInvoiceIds, id] };
    });
  }

  function mockUploadInvoice() {
    if (!writeoffForm) return;
    const candidates = invoices.filter((invoice) => invoice.supplier === writeoffForm.supplier && availableInvoiceAmount(invoice) > 0 && !writeoffForm.selectedInvoiceIds.includes(invoice.id));
    const preferred = candidates.find((invoice) => invoice.checkStatus === "查验通过") ?? candidates[0];
    if (!preferred) {
      showToast("当前供应商暂无可用 mock 发票。");
      return;
    }
    patchWriteoff({ selectedInvoiceIds: [...writeoffForm.selectedInvoiceIds, preferred.id] });
    showToast(`已模拟上传发票 ${preferred.invoiceNo}，发票信息已自动带出。`);
  }

  function verifyInvoice(invoiceId: string) {
    setOverlayLoading("金税三期自动查验中...");
    window.setTimeout(() => {
      setInvoices((rows) =>
        rows.map((row) =>
          row.id === invoiceId
            ? { ...row, checkStatus: "查验通过", failureReason: undefined }
            : row
        )
      );
      setOverlayLoading("");
      showToast("发票查验已模拟通过。");
    }, 750);
  }

  function submitWriteoff() {
    if (!writeoffForm) return;
    const nextErrors = validateWriteoff(writeoffForm, pendingLedgers, invoices, prepayments);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const allocations = allocateAcrossRows(writeoffLines, invoiceAvailableTotal(writeoffInvoiceRows));
    setOverlayLoading("正在模拟提交 OA 审批并占用待到票金额");
    window.setTimeout(() => {
      setPendingLedgers((rows) =>
        rows.map((row) => {
          const amount = allocations[row.id] ?? 0;
          if (amount <= 0) return row;
          return {
            ...row,
            inTransitAmount: row.inTransitAmount + amount,
            invoiceStatus: "到票中",
            logs: [{ time: nowText, operator: writeoffForm.applicant, action: "提交发票核销", comment: `${writeoffForm.code} 提交审批，占用 ${formatMoney(amount)}。` }, ...row.logs]
          };
        })
      );
      setWriteoffForm({ ...writeoffForm, status: "审批中" });
      setOverlayLoading("");
      showToast("已模拟提交 OA，待到票台账到票中金额已增加。");
    }, 700);
  }

  function approveWriteoff() {
    if (!writeoffForm) return;
    const allocations = allocateAcrossRows(writeoffLines, invoiceAvailableTotal(writeoffInvoiceRows));
    const total = sum(Object.values(allocations));
    if (total <= 0) return;
    const voucherNo = `FP-PZ-202605-${String(writeoffLedgers.length + 20).padStart(4, "0")}`;
    const kingdeeVoucherNo = `KD-202605-${String(writeoffLedgers.length + 20).padStart(4, "0")}`;
    setOverlayLoading("正在模拟财务签收、生成凭证并更新台账");
    window.setTimeout(() => {
      setPendingLedgers((rows) =>
        rows.map((row) => {
          const amount = allocations[row.id] ?? 0;
          if (amount <= 0) return row;
          const nextInvoiced = row.invoicedAmount + amount;
          const nextInTransit = Math.max(0, row.inTransitAmount - amount);
          const balance = Math.max(0, row.totalAmount - nextInvoiced - nextInTransit);
          return {
            ...row,
            inTransitAmount: nextInTransit,
            invoicedAmount: nextInvoiced,
            invoiceStatus: balance <= 0 ? "已到票完结" : "部分到票",
            finishStatus: balance <= 0 ? "已完结" : "部分完结",
            logs: [{ time: nowText, operator: "林一", action: "审批通过", comment: `已核销 ${formatMoney(amount)}，凭证 ${kingdeeVoucherNo} 已回写。` }, ...row.logs],
            approvals: [...row.approvals, { node: "财务签收", approver: "林一", date: today, comment: "发票查验通过，审批完成。" }]
          };
        })
      );
      setInvoices((rows) => allocateInvoiceUsage(rows, writeoffForm.selectedInvoiceIds, total));
      if (selectedPrepayment) {
        setPrepayments((rows) => rows.map((row) => (row.id === selectedPrepayment.id ? { ...row, arrivedInvoice: true, unusedAmount: Math.max(0, row.unusedAmount - Math.min(row.unusedAmount, total)) } : row)));
      }
      const newLedgers = writeoffLines
        .map((line) => ({ line, amount: allocations[line.id] ?? 0 }))
        .filter((item) => item.amount > 0)
        .map(({ line, amount }, index): InvoiceWriteoffLedger => ({
          id: `wledger-${Date.now()}-${index}`,
          code: `FPHX-TZ-2026-${String(writeoffLedgers.length + index + 3).padStart(3, "0")}`,
          documentName: "发票核销台账",
          writeoffDate: today,
          writeoffApplicationNo: writeoffForm.code,
          settlementNo: line.settlementNo,
          settlementDate: line.applyDate,
          pendingLedgerId: line.id,
          invoiceIds: writeoffForm.selectedInvoiceIds,
          accountingEntity: line.accountingEntity,
          supplier: line.supplier,
          activity: line.activity,
          expenseMajor: line.expenseMajor,
          expenseMinor: line.expenseMinor,
          settlementAmount: line.totalAmount,
          writeoffAmount: amount,
          redFlushedAmount: 0,
          payableDate: line.payableDate,
          redFlushStatus: "未红冲",
          voucherNo,
          kingdeeVoucherNo,
          syncStatus: "同步成功",
          lastSyncAt: nowText,
          approvals: [{ node: "财务签收", approver: "林一", date: today, comment: "审批通过，插入发票核销台账。" }],
          logs: [{ time: nowText, operator: "系统模拟", action: "插入发票核销台账", comment: `由 ${writeoffForm.code} 审批完成生成。` }]
        }));
      setWriteoffLedgers((rows) => [...newLedgers, ...rows]);
      setWriteoffForm(null);
      setOverlayLoading("");
      setView("writeoff");
      showToast(`审批完成，已生成凭证 ${kingdeeVoucherNo} 并插入发票核销台账。`);
    }, 850);
  }

  function rejectWriteoff() {
    if (!writeoffForm) return;
    const allocations = allocateAcrossRows(writeoffLines, invoiceAvailableTotal(writeoffInvoiceRows));
    setPendingLedgers((rows) =>
      rows.map((row) => {
        const amount = allocations[row.id] ?? 0;
        if (amount <= 0) return row;
        const nextInTransit = Math.max(0, row.inTransitAmount - amount);
        return {
          ...row,
          inTransitAmount: nextInTransit,
          invoiceStatus: row.invoicedAmount > 0 ? "部分到票" : "发票未到",
          logs: [{ time: nowText, operator: "林一", action: "审批驳回", comment: "模拟驳回：发票附件需重新上传，到票中金额已释放。" }, ...row.logs]
        };
      })
    );
    setWriteoffForm({ ...writeoffForm, status: "草稿" });
    showToast("已模拟驳回，待到票占用金额已释放，可重新编辑提交。");
  }

  function openRedFlush(row: InvoiceWriteoffLedger) {
    setErrors({});
    setRedFlushForm({
      code: `FPHC-2026-${String(Date.now()).slice(-4)}`,
      applyDate: today,
      applicant: "王悦",
      sourceLedgerId: row.id,
      amount: String(availableRedFlush(row)),
      reason: "供应商发票红冲重开，申请回退本次核销金额。",
      status: "草稿"
    });
  }

  function submitRedFlush() {
    if (!redFlushForm || !redFlushSource) return;
    const amount = Number(redFlushForm.amount);
    const nextErrors: Record<string, string> = {};
    if (!redFlushForm.reason.trim()) nextErrors.reason = "请填写红冲说明。";
    if (!amount || amount <= 0 || amount > availableRedFlush(redFlushSource)) nextErrors.amount = `红冲金额必须大于 0 且不超过可红冲金额 ${formatMoney(availableRedFlush(redFlushSource))}。`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setWriteoffLedgers((rows) => rows.map((row) => (row.id === redFlushSource.id ? { ...row, redFlushStatus: "红冲中", logs: [{ time: nowText, operator: redFlushForm.applicant, action: "提交红冲审批", comment: `${redFlushForm.code} 已提交，红冲金额 ${formatMoney(amount)}。` }, ...row.logs] } : row)));
    setRedFlushForm({ ...redFlushForm, status: "审批中" });
    showToast("已模拟提交红冲审批，原核销台账标记为红冲中。");
  }

  function approveRedFlush() {
    if (!redFlushForm || !redFlushSource) return;
    const amount = Number(redFlushForm.amount);
    const kingdeeVoucherNo = `KD-HC-202605-${String(writeoffLedgers.length + 11).padStart(4, "0")}`;
    setOverlayLoading("正在模拟红冲审批通过并回退待到票/发票余额");
    window.setTimeout(() => {
      setWriteoffLedgers((rows) =>
        rows.map((row) => {
          if (row.id !== redFlushSource.id) return row;
          const nextRedFlushed = row.redFlushedAmount + amount;
          const status = nextRedFlushed >= row.writeoffAmount ? "已红冲" : "部分红冲";
          return {
            ...row,
            redFlushedAmount: nextRedFlushed,
            redFlushStatus: status,
            kingdeeVoucherNo,
            logs: [{ time: nowText, operator: "林一", action: "红冲审批通过", comment: `回退 ${formatMoney(amount)}，红冲凭证 ${kingdeeVoucherNo} 已生成。` }, ...row.logs],
            approvals: [...row.approvals, { node: "红冲财务确认", approver: "林一", date: today, comment: redFlushForm.reason }]
          };
        })
      );
      setPendingLedgers((rows) =>
        rows.map((row) => {
          if (row.id !== redFlushSource.pendingLedgerId) return row;
          const nextInvoiced = Math.max(0, row.invoicedAmount - amount);
          const balance = Math.max(0, row.totalAmount - nextInvoiced - row.inTransitAmount);
          return {
            ...row,
            invoicedAmount: nextInvoiced,
            invoiceStatus: nextInvoiced <= 0 ? "发票未到" : balance > 0 ? "部分到票" : "已到票完结",
            finishStatus: balance > 0 ? (nextInvoiced > 0 ? "部分完结" : "未完结") : "已完结",
            logs: [{ time: nowText, operator: "系统模拟", action: "红冲回退", comment: `${redFlushForm.code} 审批通过，已到票金额回退 ${formatMoney(amount)}。` }, ...row.logs]
          };
        })
      );
      setInvoices((rows) => releaseInvoiceUsage(rows, redFlushSource.invoiceIds, amount));
      setRedFlushForm(null);
      setOverlayLoading("");
      showToast(`红冲审批完成，已回退待到票金额并生成 ${kingdeeVoucherNo}。`);
    }, 800);
  }

  function openNoInvoice(source?: PendingInvoiceLedger) {
    const target = source ?? pendingLedgers.find((item) => item.allowNoInvoice && canNoInvoice(item)) ?? pendingLedgers.find((item) => item.allowNoInvoice);
    setErrors({});
    setNoInvoiceForm({
      code: `WPHX-2026-${String(noInvoiceLedgers.length + 3).padStart(3, "0")}`,
      applyDate: today,
      applicant: "赵敏",
      accountingEntity: target?.accountingEntity ?? "上海示例贸易有限公司",
      supplier: target?.supplier ?? suppliers[0] ?? "",
      settled: true,
      businessOccurred: true,
      frameworkType: "年度框架合同",
      selectedPendingIds: target && canNoInvoice(target) ? [target.id] : [],
      contractCode: target?.contractCode ?? "YXHT-2026-188",
      contractName: target?.contractName ?? "品牌年度内容传播合同",
      contractAmount: String(target?.totalAmount ?? 60000),
      activity: target?.activity ?? "品牌年度内容传播",
      amount: "",
      description: "供应商无法提供发票，业务真实发生，申请无票核销。",
      status: "草稿"
    });
  }

  function patchNoInvoice(patch: Partial<NoInvoiceFormState>) {
    setNoInvoiceForm((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.supplier && patch.supplier !== current.supplier) next.selectedPendingIds = [];
      if (patch.settled === false) next.selectedPendingIds = [];
      return next;
    });
  }

  function toggleNoInvoicePending(id: string) {
    setNoInvoiceForm((current) => {
      if (!current || current.status !== "草稿") return current;
      const exists = current.selectedPendingIds.includes(id);
      return { ...current, selectedPendingIds: exists ? current.selectedPendingIds.filter((item) => item !== id) : [...current.selectedPendingIds, id] };
    });
  }

  function submitNoInvoice() {
    if (!noInvoiceForm) return;
    const nextErrors = validateNoInvoice(noInvoiceForm, pendingLedgers);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const amount = noInvoiceForm.settled ? sum(noInvoiceLines.map((item) => uninvoicedAmount(item))) : Number(noInvoiceForm.amount);
    setPendingLedgers((rows) =>
      rows.map((row) =>
        noInvoiceForm.selectedPendingIds.includes(row.id)
          ? { ...row, inTransitAmount: row.inTransitAmount + uninvoicedAmount(row), invoiceStatus: "到票中", logs: [{ time: nowText, operator: noInvoiceForm.applicant, action: "提交无票申请", comment: `${noInvoiceForm.code} 提交审批，占用 ${formatMoney(uninvoicedAmount(row))}。` }, ...row.logs] }
          : row
      )
    );
    setNoInvoiceForm({ ...noInvoiceForm, status: "审批中", amount: String(amount) });
    showToast("已模拟提交无票核销审批。");
  }

  function approveNoInvoice() {
    if (!noInvoiceForm) return;
    const amount = noInvoiceForm.settled ? sum(noInvoiceLines.map((item) => uninvoicedAmount(item))) : Number(noInvoiceForm.amount);
    const voucherNo = `KD-WP-202605-${String(noInvoiceLedgers.length + 10).padStart(4, "0")}`;
    setOverlayLoading("正在模拟无票审批通过并插入无票核销申请台账");
    window.setTimeout(() => {
      if (noInvoiceForm.settled) {
        setPendingLedgers((rows) =>
          rows.map((row) => {
            if (!noInvoiceForm.selectedPendingIds.includes(row.id)) return row;
            const amountForRow = uninvoicedAmount(row);
            return {
              ...row,
              inTransitAmount: Math.max(0, row.inTransitAmount - amountForRow),
              invoicedAmount: row.totalAmount,
              invoiceStatus: "已无票核销",
              finishStatus: "已完结",
              noInvoiceApplicationNo: noInvoiceForm.code,
              logs: [{ time: nowText, operator: "林一", action: "无票审批通过", comment: `无票核销 ${formatMoney(amountForRow)}，凭证 ${voucherNo} 已生成。` }, ...row.logs],
              approvals: [...row.approvals, { node: "无票核销审批", approver: "林一", date: today, comment: "无票依据充分，审批通过。" }]
            };
          })
        );
      }
      const firstLine = noInvoiceLines[0];
      const newLedger: NoInvoiceLedger = {
        id: `noinv-${Date.now()}`,
        code: noInvoiceForm.code,
        documentName: "无票核销申请台账",
        applyDate: noInvoiceForm.applyDate,
        accountingEntity: noInvoiceForm.accountingEntity,
        supplier: noInvoiceForm.supplier,
        contractCode: noInvoiceForm.settled ? firstLine?.contractCode ?? noInvoiceForm.contractCode : noInvoiceForm.contractCode,
        contractName: noInvoiceForm.settled ? firstLine?.contractName ?? noInvoiceForm.contractName : noInvoiceForm.contractName,
        settled: noInvoiceForm.settled,
        applicationAmount: amount,
        availableAmount: noInvoiceForm.settled ? 0 : amount,
        settlementNo: noInvoiceForm.settled ? noInvoiceLines.map((item) => item.settlementNo).join(" / ") : "-",
        useStatus: noInvoiceForm.settled ? "已使用" : "未使用",
        approvalStatus: "已完成",
        voucherNo,
        description: noInvoiceForm.description,
        approvals: [{ node: "财务负责人审批", approver: "林一", date: today, comment: "无票核销审批通过。" }],
        logs: [{ time: nowText, operator: "系统模拟", action: "插入无票核销申请台账", comment: `由 ${noInvoiceForm.code} 审批完成生成。` }]
      };
      setNoInvoiceLedgers((rows) => [newLedger, ...rows]);
      setNoInvoiceForm(null);
      setOverlayLoading("");
      setView("noInvoice");
      showToast(`无票申请审批完成，已生成凭证 ${voucherNo}。`);
    }, 800);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">发票管理</div>
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
              <div key={label} className={`rounded-md px-3 py-2 ${label === "发票与核销" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{sub}</div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">发票与核销 / 发票管理 / 3.7.11</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">发票管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">待到票工作池、发票核销、红冲、无票核销与凭证回写的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openWriteoff()}>新建发票核销单</Button>
              <Button variant="secondary" onClick={() => openNoInvoice()}>新建无票申请</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：发票平台查验服务响应超时，请点击重试。")}>模拟异常</Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-6">
            {stats.map((item) => (
              <SummaryCard key={item.label} label={item.label} value={item.value} sub={item.sub} />
            ))}
          </div>

          {pageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium">异常提示</div>
              <div className="mt-1">{pageError}</div>
              <button className="mt-2 font-medium text-red-700 underline" onClick={retrySync}>重试同步</button>
            </div>
          )}

          <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                ["pending", "待到票台账"],
                ["writeoff", "发票核销台账"],
                ["noInvoice", "无票核销申请台账"]
              ].map(([key, label]) => (
                <button key={key} className={`h-9 rounded-md px-3 text-sm font-medium ${view === key ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-600"}`} onClick={() => setView(key as ViewMode)}>
                  {label}
                </button>
              ))}
            </div>
            {view === "pending" ? (
              <PendingFilters filters={pendingFilters} setFilters={setPendingFilters} suppliers={suppliers} activities={activities} expenseMinors={expenseMinors} onQuery={simulateQuery} onReset={resetFilters} />
            ) : (
              <LedgerFiltersBar filters={ledgerFilters} setFilters={setLedgerFilters} suppliers={suppliers} accountingEntities={accountingEntities} onQuery={simulateQuery} onReset={resetFilters} statusOptions={view === "writeoff" ? ["全部", "未红冲", "红冲中", "部分红冲", "已红冲", "同步失败"] : ["全部", "未使用", "部分使用", "已使用", "已关闭", "审批中", "已完成"]} />
            )}
          </section>

          <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tableLoading && <LoadingMask text="正在查询 mock 台账..." />}
            {view === "pending" && (
              filteredPending.length > 0 ? (
                <PendingTable rows={filteredPending} onDetail={(row) => setDetail({ type: "pending", row })} onWriteoff={openWriteoff} onNoInvoice={openNoInvoice} />
              ) : (
                <EmptyState title="所有结算单均已到票，当前无待处理事项" description="可重置筛选查看全部待到票，或新建发票核销单演示到票流程。" onReset={resetFilters} action="新建核销单" onAction={() => openWriteoff()} />
              )
            )}
            {view === "writeoff" && (
              filteredWriteoffs.length > 0 ? (
                <WriteoffLedgerTable rows={filteredWriteoffs} onDetail={(row) => setDetail({ type: "writeoff", row })} onRedFlush={openRedFlush} />
              ) : (
                <EmptyState title="暂无发票核销台账记录" description="完成一张发票核销单审批后，这里会插入核销结果并支持发起红冲。" onReset={resetFilters} action="新建核销单" onAction={() => openWriteoff()} />
              )
            )}
            {view === "noInvoice" && (
              filteredNoInvoices.length > 0 ? (
                <NoInvoiceTable rows={filteredNoInvoices} onDetail={(row) => setDetail({ type: "noInvoice", row })} />
              ) : (
                <EmptyState title="暂无无票核销申请记录" description="从允许无票的待到票记录发起申请，审批完成后会写入本台账。" onReset={resetFilters} action="新建无票申请" onAction={() => openNoInvoice()} />
              )
            )}
          </section>
        </section>
      </div>

      {writeoffForm && (
        <Modal title={`${writeoffForm.code} 发票核销单`} onClose={() => setWriteoffForm(null)} size="xl">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="申请日期" value={writeoffForm.applyDate} />
            <ReadOnly label="申请人" value={writeoffForm.applicant} />
            <ReadOnly label="申请人公司-部门-岗位" value={writeoffForm.applicantOrg} />
            <ReadOnly label="单据状态" value={<StatusBadge status={writeoffForm.status} />} />
            <Field label="供应商" required error={errors.supplier}>
              <Select value={writeoffForm.supplier} onChange={(supplier) => patchWriteoff({ supplier })} options={suppliers} disabled={writeoffForm.status !== "草稿"} />
            </Field>
            <ReadOnly label="核算主体" value={writeoffForm.accountingEntity} />
            <ReadOnly label="预付款余额" value={formatMoney(sum(prepayments.filter((item) => item.supplier === writeoffForm.supplier && !item.arrivedInvoice).map((item) => item.unusedAmount)))} />
            <ReadOnly label="本次核销合计" value={formatMoney(sum(Object.values(writeoffAllocations)))} />
          </div>

          <Section title="结算明细">
            {errors.lines && <Alert>{errors.lines}</Alert>}
            <div className="mb-3 text-sm text-slate-500">关联待到票台账仅展示同供应商且未完结记录，可一次多选，同一单据内防重复。</div>
            <div className="overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-xs text-slate-600">
                  <tr>
                    <Th>选择</Th>
                    <Th>结算单号</Th>
                    <Th>营销活动</Th>
                    <Th>费用小类</Th>
                    <Th>结算余额</Th>
                    <Th>本次核销金额</Th>
                    <Th>未到票余额</Th>
                    <Th>发票状态</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {pendingLedgers.filter((item) => item.supplier === writeoffForm.supplier && canWriteoff(item)).map((item) => {
                    const allocated = writeoffAllocations[item.id] ?? 0;
                    return (
                      <tr key={item.id}>
                        <Td><input type="checkbox" checked={writeoffForm.selectedPendingIds.includes(item.id)} onChange={() => toggleWriteoffPending(item.id)} disabled={writeoffForm.status !== "草稿"} /></Td>
                        <Td>{item.settlementNo}</Td>
                        <Td>{item.activity}</Td>
                        <Td>{item.expenseMinor}</Td>
                        <Td align="right">{formatMoney(uninvoicedAmount(item))}</Td>
                        <Td align="right">{formatMoney(allocated)}</Td>
                        <Td align="right">{formatMoney(Math.max(0, uninvoicedAmount(item) - allocated))}</Td>
                        <Td><StatusBadge status={item.invoiceStatus} /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Section>

          {prepayments.some((item) => item.supplier === writeoffForm.supplier && item.unusedAmount > 0) && (
            <Section title="预付核销区">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="预付款单号">
                  <Select value={writeoffForm.prepaymentId} onChange={(prepaymentId) => patchWriteoff({ prepaymentId })} options={["", ...prepayments.filter((item) => item.supplier === writeoffForm.supplier && item.unusedAmount > 0).map((item) => item.id)]} labels={{ "": "不选择预付核销", ...Object.fromEntries(prepayments.map((item) => [item.id, `${item.code} / ${formatMoney(item.unusedAmount)}`])) }} disabled={writeoffForm.status !== "草稿"} />
                </Field>
                <ReadOnly label="合同编号" value={selectedPrepayment?.contractCode} />
                <ReadOnly label="预付金额" value={selectedPrepayment ? formatMoney(selectedPrepayment.prepaidAmount) : "-"} />
                <ReadOnly label="本次预付核销金额" value={selectedPrepayment ? formatMoney(Math.min(selectedPrepayment.unusedAmount, sum(Object.values(writeoffAllocations)))) : "-"} />
              </div>
            </Section>
          )}

          <Section title="发票信息" extra={<Button size="sm" variant="secondary" onClick={mockUploadInvoice} disabled={writeoffForm.status !== "草稿"}>模拟上传</Button>}>
            {errors.invoices && <Alert>{errors.invoices}</Alert>}
            <div className="overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-xs text-slate-600">
                  <tr>
                    <Th>选择</Th>
                    <Th>发票号码</Th>
                    <Th>发票代码</Th>
                    <Th>发票类型</Th>
                    <Th>开票日期</Th>
                    <Th>价税合计</Th>
                    <Th>可用金额</Th>
                    <Th>税额</Th>
                    <Th>查验状态</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {invoices.filter((item) => item.supplier === writeoffForm.supplier && availableInvoiceAmount(item) > 0).map((invoice) => (
                    <tr key={invoice.id}>
                      <Td><input type="checkbox" checked={writeoffForm.selectedInvoiceIds.includes(invoice.id)} onChange={() => toggleWriteoffInvoice(invoice.id)} disabled={writeoffForm.status !== "草稿"} /></Td>
                      <Td>{invoice.invoiceNo}</Td>
                      <Td>{invoice.invoiceCode}</Td>
                      <Td>{invoice.invoiceType}</Td>
                      <Td>{invoice.issuedAt}</Td>
                      <Td align="right">{formatMoney(invoice.totalAmount)}</Td>
                      <Td align="right">{formatMoney(availableInvoiceAmount(invoice))}</Td>
                      <Td align="right">{formatMoney(invoice.taxAmount)}</Td>
                      <Td>
                        <StatusBadge status={invoice.checkStatus} />
                        {invoice.failureReason && <div className="mt-1 text-xs text-red-500">{invoice.failureReason}</div>}
                      </Td>
                      <Td>
                        {invoice.checkStatus !== "查验通过" && <button className="text-blue-600 hover:underline" onClick={() => verifyInvoice(invoice.id)}>模拟查验</button>}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Section>

          <Section title="附件与审批信息">
            <div className="grid gap-3 md:grid-cols-3">
              <ReadOnly label="发票附件" value={writeoffInvoiceRows.map((item) => item.attachmentName).join(" / ") || "-"} />
              <ReadOnly label="其他附件" value="settlement-confirmation-mock.pdf" />
              <Field label="申请说明">
                <Textarea value={writeoffForm.description} onChange={(description) => patchWriteoff({ description })} disabled={writeoffForm.status !== "草稿"} />
              </Field>
            </div>
            {writeoffForm.status === "审批中" && <StepList steps={[{ node: "业务提交", approver: writeoffForm.applicant, date: today, comment: "已提交 OA mock 审批。" }, { node: "财务签收", approver: "林一", date: "待处理", comment: "等待模拟审批通过或驳回。" }]} />}
          </Section>

          <ModalActions>
            <Button variant="secondary" onClick={() => setWriteoffForm(null)}>取消</Button>
            {writeoffForm.status === "草稿" ? (
              <Button onClick={submitWriteoff}>提交审批</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={rejectWriteoff}>模拟驳回</Button>
                <Button onClick={approveWriteoff}>模拟审批通过</Button>
              </>
            )}
          </ModalActions>
        </Modal>
      )}

      {redFlushForm && redFlushSource && (
        <Modal title={`${redFlushForm.code} 发票红冲单`} onClose={() => setRedFlushForm(null)} size="lg">
          <Alert tone="orange">红冲仅为 mock 流程：审批通过后回退待到票已到票金额，并释放发票余额已用金额。</Alert>
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="申请日期" value={redFlushForm.applyDate} />
            <ReadOnly label="申请人" value={redFlushForm.applicant} />
            <ReadOnly label="发票核销单号" value={redFlushSource.writeoffApplicationNo} />
            <ReadOnly label="单据状态" value={<StatusBadge status={redFlushForm.status} />} />
            <ReadOnly label="核算主体" value={redFlushSource.accountingEntity} />
            <ReadOnly label="供应商" value={redFlushSource.supplier} />
            <ReadOnly label="核销结算单号" value={redFlushSource.settlementNo} />
            <ReadOnly label="可红冲金额" value={formatMoney(availableRedFlush(redFlushSource))} />
          </div>
          <Section title="红冲明细">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="本次红冲金额" required error={errors.amount}>
                <Input value={redFlushForm.amount} onChange={(amount) => setRedFlushForm({ ...redFlushForm, amount })} disabled={redFlushForm.status !== "草稿"} />
              </Field>
              <Field label="红冲说明" required error={errors.reason}>
                <Textarea value={redFlushForm.reason} onChange={(reason) => setRedFlushForm({ ...redFlushForm, reason })} disabled={redFlushForm.status !== "草稿"} />
              </Field>
            </div>
            <div className="mt-4 overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-xs text-slate-600">
                  <tr>
                    <Th>结算单号</Th>
                    <Th>营销活动</Th>
                    <Th>费用小类</Th>
                    <Th>结算余额</Th>
                    <Th>已核销金额</Th>
                    <Th>本次红冲金额</Th>
                    <Th>未核销余额</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  <tr>
                    <Td>{redFlushSource.settlementNo}</Td>
                    <Td>{redFlushSource.activity}</Td>
                    <Td>{redFlushSource.expenseMinor}</Td>
                    <Td align="right">{formatMoney(redFlushSource.settlementAmount)}</Td>
                    <Td align="right">{formatMoney(redFlushSource.writeoffAmount)}</Td>
                    <Td align="right">{formatMoney(Number(redFlushForm.amount || 0))}</Td>
                    <Td align="right">{formatMoney(Math.max(0, redFlushSource.writeoffAmount - redFlushSource.redFlushedAmount - Number(redFlushForm.amount || 0)))}</Td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRedFlushForm(null)}>取消</Button>
            {redFlushForm.status === "草稿" ? <Button onClick={submitRedFlush}>提交审批</Button> : <Button onClick={approveRedFlush}>模拟审批通过</Button>}
          </ModalActions>
        </Modal>
      )}

      {noInvoiceForm && (
        <Modal title={`${noInvoiceForm.code} 无票核销申请单`} onClose={() => setNoInvoiceForm(null)} size="xl">
          <div className="grid gap-3 md:grid-cols-4">
            <ReadOnly label="申请日期" value={noInvoiceForm.applyDate} />
            <ReadOnly label="申请人" value={noInvoiceForm.applicant} />
            <ReadOnly label="单据状态" value={<StatusBadge status={noInvoiceForm.status} />} />
            <ReadOnly label="无票金额合计" value={formatMoney(noInvoiceForm.settled ? sum(noInvoiceLines.map((item) => uninvoicedAmount(item))) : Number(noInvoiceForm.amount || 0))} />
            <Field label="供应商" required error={errors.supplier}>
              <Select value={noInvoiceForm.supplier} onChange={(supplier) => patchNoInvoice({ supplier })} options={suppliers} disabled={noInvoiceForm.status !== "草稿"} />
            </Field>
            <ReadOnly label="核算主体" value={noInvoiceForm.accountingEntity} />
            <Field label="是否已结算" required>
              <Select value={noInvoiceForm.settled ? "是" : "否"} onChange={(value) => patchNoInvoice({ settled: value === "是" })} options={["是", "否"]} disabled={noInvoiceForm.status !== "草稿"} />
            </Field>
            <Field label="是否业务已发生">
              <Select value={noInvoiceForm.businessOccurred ? "是" : "否"} onChange={(value) => patchNoInvoice({ businessOccurred: value === "是" })} options={["是", "否"]} disabled={noInvoiceForm.status !== "草稿"} />
            </Field>
          </div>

          {!noInvoiceForm.settled && (
            <Section title="合同信息区">
              <div className="grid gap-3 md:grid-cols-4">
                <Field label="关联合同" required error={errors.contractCode}>
                  <Input value={noInvoiceForm.contractCode} onChange={(contractCode) => patchNoInvoice({ contractCode })} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
                <Field label="合同名称" required error={errors.contractName}>
                  <Input value={noInvoiceForm.contractName} onChange={(contractName) => patchNoInvoice({ contractName })} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
                <Field label="营销活动" required error={errors.activity}>
                  <Input value={noInvoiceForm.activity} onChange={(activity) => patchNoInvoice({ activity })} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
                <Field label="合同金额" required error={errors.contractAmount}>
                  <Input value={noInvoiceForm.contractAmount} onChange={(contractAmount) => patchNoInvoice({ contractAmount })} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
                <Field label="本次无票金额" required error={errors.amount}>
                  <Input value={noInvoiceForm.amount} onChange={(amount) => patchNoInvoice({ amount })} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
                <Field label="合同框架类型">
                  <Select value={noInvoiceForm.frameworkType} onChange={(frameworkType) => patchNoInvoice({ frameworkType })} options={["年度框架合同", "项目合同", "平台协议"]} disabled={noInvoiceForm.status !== "草稿"} />
                </Field>
              </div>
            </Section>
          )}

          {noInvoiceForm.settled && (
            <Section title="结算明细">
              {errors.lines && <Alert>{errors.lines}</Alert>}
              <div className="overflow-x-auto">
                <Table>
                  <thead className="bg-slate-50 text-left text-xs text-slate-600">
                    <tr>
                      <Th>选择</Th>
                      <Th>结算单号</Th>
                      <Th>预计付款日期</Th>
                      <Th>营销活动</Th>
                      <Th>合同编号</Th>
                      <Th>费用小类</Th>
                      <Th>结算余额</Th>
                      <Th>本次核销金额</Th>
                      <Th>是否允许无票</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pendingLedgers.filter((item) => item.supplier === noInvoiceForm.supplier && item.allowNoInvoice && canNoInvoice(item)).map((item) => (
                      <tr key={item.id}>
                        <Td><input type="checkbox" checked={noInvoiceForm.selectedPendingIds.includes(item.id)} onChange={() => toggleNoInvoicePending(item.id)} disabled={noInvoiceForm.status !== "草稿"} /></Td>
                        <Td>{item.settlementNo}</Td>
                        <Td>{item.expectedPayDate}</Td>
                        <Td>{item.activity}</Td>
                        <Td>{item.contractCode}</Td>
                        <Td>{item.expenseMinor}</Td>
                        <Td align="right">{formatMoney(uninvoicedAmount(item))}</Td>
                        <Td align="right">{formatMoney(noInvoiceForm.selectedPendingIds.includes(item.id) ? uninvoicedAmount(item) : 0)}</Td>
                        <Td>{item.allowNoInvoice ? "是" : "否"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Section>
          )}

          <Section title="说明与审批">
            <Field label="无票说明" required error={errors.description}>
              <Textarea value={noInvoiceForm.description} onChange={(description) => patchNoInvoice({ description })} disabled={noInvoiceForm.status !== "草稿"} />
            </Field>
            {noInvoiceForm.status === "审批中" && <StepList steps={[{ node: "业务提交", approver: noInvoiceForm.applicant, date: today, comment: "已提交 OA mock 审批。" }, { node: "财务负责人", approver: "林一", date: "待处理", comment: "等待模拟审批通过。" }]} />}
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setNoInvoiceForm(null)}>取消</Button>
            {noInvoiceForm.status === "草稿" ? <Button onClick={submitNoInvoice}>提交审批</Button> : <Button onClick={approveNoInvoice}>模拟审批通过</Button>}
          </ModalActions>
        </Modal>
      )}

      {detail && <DetailDrawer detail={detail} invoices={invoices} onClose={() => setDetail(null)} />}
      {overlayLoading && <LoadingMask text={overlayLoading} full />}
      {toast && <div className="fixed right-4 top-4 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function PendingFilters({ filters, setFilters, suppliers, activities, expenseMinors, onQuery, onReset }: { filters: InvoiceFilters; setFilters: (filters: InvoiceFilters) => void; suppliers: string[]; activities: string[]; expenseMinors: string[]; onQuery: () => void; onReset: () => void }) {
  const patch = (value: Partial<InvoiceFilters>) => setFilters({ ...filters, ...value });
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <Field label="结算单号/单据名称">
        <Input value={filters.keyword} onChange={(keyword) => patch({ keyword })} placeholder="输入结算单号、合同、说明" />
      </Field>
      <Field label="供应商">
        <Select value={filters.supplier} onChange={(supplier) => patch({ supplier })} options={["全部", ...suppliers]} />
      </Field>
      <Field label="营销活动">
        <Select value={filters.activity} onChange={(activity) => patch({ activity })} options={["全部", ...activities]} />
      </Field>
      <Field label="费用小类">
        <Select value={filters.expenseMinor} onChange={(expenseMinor) => patch({ expenseMinor })} options={["全部", ...expenseMinors]} />
      </Field>
      <Field label="发票状态">
        <Select value={filters.invoiceStatus} onChange={(invoiceStatus) => patch({ invoiceStatus })} options={["全部", "发票未到", "部分到票", "到票中", "已到票完结", "已无票核销", "已红冲"]} />
      </Field>
      <div className="flex items-end gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function LedgerFiltersBar({ filters, setFilters, suppliers, accountingEntities, statusOptions, onQuery, onReset }: { filters: LedgerFilters; setFilters: (filters: LedgerFilters) => void; suppliers: string[]; accountingEntities: string[]; statusOptions: string[]; onQuery: () => void; onReset: () => void }) {
  const patch = (value: Partial<LedgerFilters>) => setFilters({ ...filters, ...value });
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Field label="单据/结算单">
        <Input value={filters.keyword} onChange={(keyword) => patch({ keyword })} placeholder="输入单号、供应商、活动" />
      </Field>
      <Field label="供应商">
        <Select value={filters.supplier} onChange={(supplier) => patch({ supplier })} options={["全部", ...suppliers]} />
      </Field>
      <Field label="核算主体">
        <Select value={filters.accountingEntity} onChange={(accountingEntity) => patch({ accountingEntity })} options={["全部", ...accountingEntities]} />
      </Field>
      <Field label="状态">
        <Select value={filters.status} onChange={(status) => patch({ status })} options={statusOptions} />
      </Field>
      <div className="flex items-end gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
      </div>
    </div>
  );
}

function PendingTable({ rows, onDetail, onWriteoff, onNoInvoice }: { rows: PendingInvoiceLedger[]; onDetail: (row: PendingInvoiceLedger) => void; onWriteoff: (row: PendingInvoiceLedger) => void; onNoInvoice: (row: PendingInvoiceLedger) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>结算单号</Th>
            <Th>单据名称</Th>
            <Th>供应商</Th>
            <Th>营销活动</Th>
            <Th>费用小类</Th>
            <Th>待到票总额</Th>
            <Th>到票中</Th>
            <Th>已到票</Th>
            <Th>未到票</Th>
            <Th>发票状态</Th>
            <Th>同步状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.settlementNo}</button></Td>
              <Td>{item.documentName}</Td>
              <Td>{item.supplier}</Td>
              <Td>{item.activity}</Td>
              <Td>{item.expenseMinor}</Td>
              <Td align="right">{formatMoney(item.totalAmount)}</Td>
              <Td align="right">{formatMoney(item.inTransitAmount)}</Td>
              <Td align="right">{formatMoney(item.invoicedAmount)}</Td>
              <Td align="right">{formatMoney(uninvoicedAmount(item))}</Td>
              <Td><StatusBadge status={item.invoiceStatus} /></Td>
              <Td>
                <StatusBadge status={item.syncStatus} />
                {item.failureReason && <div className="mt-1 max-w-48 text-xs text-red-500">{item.failureReason}</div>}
              </Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item)}>详情</button>
                  <button disabled={!canWriteoff(item)} className={!canWriteoff(item) ? "cursor-not-allowed text-slate-400 no-underline" : ""} onClick={() => onWriteoff(item)}>发票核销</button>
                  <button disabled={!canNoInvoice(item)} className={!canNoInvoice(item) ? "cursor-not-allowed text-slate-400 no-underline" : ""} onClick={() => onNoInvoice(item)}>无票申请</button>
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function WriteoffLedgerTable({ rows, onDetail, onRedFlush }: { rows: InvoiceWriteoffLedger[]; onDetail: (row: InvoiceWriteoffLedger) => void; onRedFlush: (row: InvoiceWriteoffLedger) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>单据编号</Th>
            <Th>核销日期</Th>
            <Th>发票核销单号</Th>
            <Th>结算单号</Th>
            <Th>核算主体</Th>
            <Th>供应商</Th>
            <Th>营销活动</Th>
            <Th>已核销金额</Th>
            <Th>未核销金额</Th>
            <Th>凭证号</Th>
            <Th>红冲状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
              <Td>{item.writeoffDate}</Td>
              <Td>{item.writeoffApplicationNo}</Td>
              <Td>{item.settlementNo}</Td>
              <Td>{item.accountingEntity}</Td>
              <Td>{item.supplier}</Td>
              <Td>{item.activity}</Td>
              <Td align="right">{formatMoney(item.writeoffAmount)}</Td>
              <Td align="right">{formatMoney(Math.max(0, item.settlementAmount - item.writeoffAmount))}</Td>
              <Td>{item.kingdeeVoucherNo}</Td>
              <Td><StatusBadge status={item.redFlushStatus} /></Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item)}>详情</button>
                  <button disabled={availableRedFlush(item) <= 0} className={availableRedFlush(item) <= 0 ? "cursor-not-allowed text-slate-400 no-underline" : ""} onClick={() => onRedFlush(item)}>发票红冲</button>
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function NoInvoiceTable({ rows, onDetail }: { rows: NoInvoiceLedger[]; onDetail: (row: NoInvoiceLedger) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <thead className="bg-slate-50 text-left text-xs text-slate-600">
          <tr>
            <Th>单据编号</Th>
            <Th>申请日期</Th>
            <Th>核算主体</Th>
            <Th>供应商</Th>
            <Th>合同编号</Th>
            <Th>合同名称</Th>
            <Th>是否已结算</Th>
            <Th>无票申请金额</Th>
            <Th>可用金额</Th>
            <Th>结算单号</Th>
            <Th>使用状态</Th>
            <Th>审批状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
              <Td>{item.applyDate}</Td>
              <Td>{item.accountingEntity}</Td>
              <Td>{item.supplier}</Td>
              <Td>{item.contractCode}</Td>
              <Td>{item.contractName}</Td>
              <Td>{item.settled ? "是" : "否"}</Td>
              <Td align="right">{formatMoney(item.applicationAmount)}</Td>
              <Td align="right">{formatMoney(item.availableAmount)}</Td>
              <Td>{item.settlementNo}</Td>
              <Td><StatusBadge status={item.useStatus} /></Td>
              <Td><StatusBadge status={item.approvalStatus} /></Td>
              <Td><InlineActions><button onClick={() => onDetail(item)}>详情</button></InlineActions></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function DetailDrawer({ detail, invoices, onClose }: { detail: DetailData; invoices: InvoicePoolItem[]; onClose: () => void }) {
  const title = detail.type === "pending" ? "待到票详情" : detail.type === "writeoff" ? "发票核销详情" : "无票申请详情";
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-1 text-sm text-slate-500">发票平台、OA、金蝶、ERP 均为前端 mock 状态。</div>
          </div>
          <button className="text-sm text-slate-500 hover:text-slate-800" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          {detail.type === "pending" && (
            <>
              <Section title="摘要">
                <DetailGrid rows={[
                  ["结算单号", detail.row.settlementNo],
                  ["供应商", detail.row.supplier],
                  ["核算主体", detail.row.accountingEntity],
                  ["待到票总额", formatMoney(detail.row.totalAmount)],
                  ["已到票金额", formatMoney(detail.row.invoicedAmount)],
                  ["未到票金额", formatMoney(uninvoicedAmount(detail.row))],
                  ["发票状态", <StatusBadge key="invoice" status={detail.row.invoiceStatus} />],
                  ["同步状态", <StatusBadge key="sync" status={detail.row.syncStatus} />],
                  ["最近同步", detail.row.lastSyncAt]
                ]} />
              </Section>
              {detail.row.failureReason && <Alert>{detail.row.failureReason}</Alert>}
              <Section title="业务信息">
                <DetailGrid rows={[
                  ["单据名称", detail.row.documentName],
                  ["来源单据", `${detail.row.sourceType} / ${detail.row.sourceCode}`],
                  ["合同", `${detail.row.contractCode} / ${detail.row.contractName}`],
                  ["营销活动", detail.row.activity],
                  ["费用分类", `${detail.row.expenseMajor} / ${detail.row.expenseMinor}`],
                  ["预计付款日期", detail.row.expectedPayDate],
                  ["是否允许无票", detail.row.allowNoInvoice ? "是" : "否"],
                  ["无票申请单号", detail.row.noInvoiceApplicationNo ?? "-"],
                  ["申请说明", detail.row.description]
                ]} />
              </Section>
              <Section title="审批记录"><StepList steps={detail.row.approvals} /></Section>
              <Section title="操作日志"><RecordList rows={detail.row.logs} /></Section>
            </>
          )}
          {detail.type === "writeoff" && (
            <>
              <Section title="摘要">
                <DetailGrid rows={[
                  ["核销台账编号", detail.row.code],
                  ["发票核销单号", detail.row.writeoffApplicationNo],
                  ["结算单号", detail.row.settlementNo],
                  ["供应商", detail.row.supplier],
                  ["已核销金额", formatMoney(detail.row.writeoffAmount)],
                  ["已红冲金额", formatMoney(detail.row.redFlushedAmount)],
                  ["红冲状态", <StatusBadge key="red" status={detail.row.redFlushStatus} />],
                  ["业务凭证号", detail.row.voucherNo],
                  ["金蝶凭证号", detail.row.kingdeeVoucherNo]
                ]} />
              </Section>
              <Section title="发票与凭证预览">
                <div className="grid gap-3 md:grid-cols-2">
                  {invoices.filter((item) => detail.row.invoiceIds.includes(item.id)).map((invoice) => (
                    <div key={invoice.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">{invoice.invoiceNo}</span>
                        <StatusBadge status={invoice.checkStatus} />
                      </div>
                      <DetailGrid rows={[
                        ["发票代码", invoice.invoiceCode],
                        ["发票类型", invoice.invoiceType],
                        ["价税合计", formatMoney(invoice.totalAmount)],
                        ["不含税金额", formatMoney(invoice.noTaxAmount)],
                        ["税额", formatMoney(invoice.taxAmount)],
                        ["附件", invoice.attachmentName]
                      ]} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
                  <div className="mb-2 font-medium">凭证分录 mock</div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div>借：销售费用-{detail.row.expenseMinor}</div>
                    <div className="text-right tabular-nums">{formatMoney(detail.row.writeoffAmount - detail.row.writeoffAmount / 1.06 * 0.06)}</div>
                    <div>贷：应付账款-{detail.row.supplier}</div>
                    <div>借：应交税费-进项税</div>
                    <div className="text-right tabular-nums">{formatMoney(detail.row.writeoffAmount / 1.06 * 0.06)}</div>
                    <div>金蝶总账：{detail.row.kingdeeVoucherNo}</div>
                  </div>
                </div>
              </Section>
              <Section title="审批记录"><StepList steps={detail.row.approvals} /></Section>
              <Section title="操作日志"><RecordList rows={detail.row.logs} /></Section>
            </>
          )}
          {detail.type === "noInvoice" && (
            <>
              <Section title="摘要">
                <DetailGrid rows={[
                  ["单据编号", detail.row.code],
                  ["供应商", detail.row.supplier],
                  ["核算主体", detail.row.accountingEntity],
                  ["合同", `${detail.row.contractCode} / ${detail.row.contractName}`],
                  ["是否已结算", detail.row.settled ? "是" : "否"],
                  ["无票申请金额", formatMoney(detail.row.applicationAmount)],
                  ["可用金额", formatMoney(detail.row.availableAmount)],
                  ["使用状态", <StatusBadge key="use" status={detail.row.useStatus} />],
                  ["凭证号", detail.row.voucherNo]
                ]} />
              </Section>
              <Section title="无票说明"><div className="text-sm text-slate-600">{detail.row.description}</div></Section>
              <Section title="审批记录"><StepList steps={detail.row.approvals} /></Section>
              <Section title="操作日志"><RecordList rows={detail.row.logs} /></Section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function createInvoice(id: string, invoiceNo: string, invoiceCode: string, supplier: string, totalAmount: number, checkStatus: CheckStatus, usedAmount = 0, failureReason?: string): InvoicePoolItem {
  const noTaxAmount = totalAmount / 1.06;
  return {
    id,
    invoiceNo,
    invoiceCode,
    invoiceType: totalAmount > 50000 ? "增值税专用发票" : "电子普通发票",
    issuedAt: "2026-05-05",
    supplier,
    buyerName: "上海示例贸易有限公司",
    buyerTaxNo: "91310000MA1MOCK2026",
    totalAmount,
    noTaxAmount,
    taxAmount: totalAmount - noTaxAmount,
    usedAmount,
    checkStatus,
    failureReason,
    attachmentName: `${invoiceNo}-invoice-mock.pdf`
  };
}

function buildStats(pending: PendingInvoiceLedger[], invoices: InvoicePoolItem[]) {
  return [
    { label: "待到票总额", value: formatMoney(sum(pending.map((item) => item.totalAmount))), sub: `${pending.length} 条待到票记录` },
    { label: "到票中金额", value: formatMoney(sum(pending.map((item) => item.inTransitAmount))), sub: "提交审批占用金额" },
    { label: "已到票金额", value: formatMoney(sum(pending.map((item) => item.invoicedAmount))), sub: "审批完成后回写" },
    { label: "未到票金额", value: formatMoney(sum(pending.map((item) => uninvoicedAmount(item)))), sub: "仍需核销或无票申请" },
    { label: "允许无票金额", value: formatMoney(sum(pending.filter((item) => item.allowNoInvoice).map((item) => uninvoicedAmount(item)))), sub: "可发起无票核销" },
    { label: "查验失败数", value: invoices.filter((item) => item.checkStatus === "查验失败").length.toString(), sub: "可模拟重新查验" }
  ];
}

function filterPending(rows: PendingInvoiceLedger[], filters: InvoiceFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.settlementNo, item.documentName, item.contractCode, item.contractName, item.description].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.supplier, item.supplier) && match(filters.activity, item.activity) && match(filters.expenseMinor, item.expenseMinor) && match(filters.invoiceStatus, item.invoiceStatus) && match(filters.finishStatus, item.finishStatus);
  });
}

function filterWriteoffs(rows: InvoiceWriteoffLedger[], filters: LedgerFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.code, item.writeoffApplicationNo, item.settlementNo, item.supplier, item.activity].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.supplier, item.supplier) && match(filters.accountingEntity, item.accountingEntity) && (filters.status === "全部" || filters.status === item.redFlushStatus || filters.status === item.syncStatus);
  });
}

function filterNoInvoices(rows: NoInvoiceLedger[], filters: LedgerFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = !keyword || [item.code, item.settlementNo, item.contractCode, item.contractName, item.supplier].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && match(filters.supplier, item.supplier) && match(filters.accountingEntity, item.accountingEntity) && (filters.status === "全部" || filters.status === item.useStatus || filters.status === item.approvalStatus);
  });
}

function match(filter: string, value: string) {
  return filter === "全部" || filter === value;
}

function validateWriteoff(form: WriteoffFormState, pending: PendingInvoiceLedger[], invoices: InvoicePoolItem[], prepayments: PrepaymentPoolItem[]) {
  const errors: Record<string, string> = {};
  const lines = pending.filter((item) => form.selectedPendingIds.includes(item.id));
  const invoiceRows = invoices.filter((item) => form.selectedInvoiceIds.includes(item.id));
  const invoiceTotal = invoiceAvailableTotal(invoiceRows);
  const lineTotal = sum(lines.map((item) => uninvoicedAmount(item)));
  if (!form.supplier) errors.supplier = "请选择供应商。";
  if (lines.length === 0) errors.lines = "请至少选择一条待到票结算明细。";
  if (invoiceRows.length === 0) errors.invoices = "请上传或选择至少一张发票。";
  if (invoiceRows.some((item) => item.checkStatus === "查验失败")) errors.invoices = "存在查验失败发票，请先模拟重新查验或替换发票。";
  if (invoiceTotal <= 0) errors.invoices = "发票可用金额必须大于 0。";
  if (invoiceTotal > lineTotal && lineTotal > 0) errors.invoices = `发票价税合计不能超过所选结算余额 ${formatMoney(lineTotal)}。`;
  const prepayment = prepayments.find((item) => item.id === form.prepaymentId);
  if (prepayment && prepayment.unusedAmount < 0) errors.prepayment = "预付核销金额异常。";
  return errors;
}

function validateNoInvoice(form: NoInvoiceFormState, pending: PendingInvoiceLedger[]) {
  const errors: Record<string, string> = {};
  if (!form.supplier) errors.supplier = "请选择供应商。";
  if (!form.description.trim()) errors.description = "请填写无票说明。";
  if (form.settled) {
    const lines = pending.filter((item) => form.selectedPendingIds.includes(item.id));
    if (lines.length === 0) errors.lines = "请选择允许无票核销的待到票记录。";
    if (lines.some((item) => !item.allowNoInvoice)) errors.lines = "所选记录必须允许无票核销。";
  } else {
    const amount = Number(form.amount);
    const contractAmount = Number(form.contractAmount);
    if (!form.contractCode.trim()) errors.contractCode = "请填写关联合同。";
    if (!form.contractName.trim()) errors.contractName = "请填写合同名称。";
    if (!form.activity.trim()) errors.activity = "请填写营销活动。";
    if (!contractAmount || contractAmount <= 0) errors.contractAmount = "合同金额必须大于 0。";
    if (!amount || amount <= 0) errors.amount = "本次无票金额必须大于 0。";
    if (amount > contractAmount && contractAmount > 0) errors.amount = "无票金额不能超过合同金额。";
  }
  return errors;
}

function canWriteoff(row: PendingInvoiceLedger) {
  return uninvoicedAmount(row) > 0 && !["已到票完结", "已无票核销"].includes(row.invoiceStatus);
}

function canNoInvoice(row: PendingInvoiceLedger) {
  return row.allowNoInvoice && uninvoicedAmount(row) > 0 && row.invoiceStatus !== "已无票核销";
}

function uninvoicedAmount(row: PendingInvoiceLedger) {
  return Math.max(0, row.totalAmount - row.invoicedAmount - row.inTransitAmount);
}

function availableInvoiceAmount(row: InvoicePoolItem) {
  return Math.max(0, row.totalAmount - row.usedAmount);
}

function invoiceAvailableTotal(rows: InvoicePoolItem[]) {
  return sum(rows.map((item) => availableInvoiceAmount(item)));
}

function availableRedFlush(row: InvoiceWriteoffLedger) {
  return Math.max(0, row.writeoffAmount - row.redFlushedAmount);
}

function allocateAcrossRows(rows: PendingInvoiceLedger[], amount: number) {
  let remaining = amount;
  const result: Record<string, number> = {};
  rows.forEach((row) => {
    const value = Math.min(uninvoicedAmount(row), remaining);
    result[row.id] = value;
    remaining -= value;
  });
  return result;
}

function allocateInvoiceUsage(rows: InvoicePoolItem[], selectedIds: string[], amount: number) {
  let remaining = amount;
  return rows.map((row) => {
    if (!selectedIds.includes(row.id) || remaining <= 0) return row;
    const value = Math.min(availableInvoiceAmount(row), remaining);
    remaining -= value;
    return { ...row, usedAmount: row.usedAmount + value };
  });
}

function releaseInvoiceUsage(rows: InvoicePoolItem[], selectedIds: string[], amount: number) {
  let remaining = amount;
  return rows.map((row) => {
    if (!selectedIds.includes(row.id) || remaining <= 0) return row;
    const value = Math.min(row.usedAmount, remaining);
    remaining -= value;
    return { ...row, usedAmount: row.usedAmount - value };
  });
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
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
  return <div className="flex min-w-40 flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-blue-600 [&_button:hover]:underline disabled:[&_button]:hover:no-underline">{children}</div>;
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
    status.includes("失败") || status.includes("驳回") || status.includes("红冲")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("通过") || status.includes("完成") || status.includes("成功") || status.includes("完结") || status.includes("已使用")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("中") || status.includes("审批") || status.includes("待签收") || status.includes("部分")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("待") || status.includes("未")
            ? "border-slate-200 bg-slate-100 text-slate-600"
            : "border-orange-200 bg-orange-50 text-orange-600";
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
            <div className="font-medium">{step.node}</div>
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
  return <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
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
