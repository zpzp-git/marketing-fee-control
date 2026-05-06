"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type ViewMode = "applications" | "reimbursements" | "ledger";
type ApprovalStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "付款中" | "已完成" | "付款失败";
type ReimbursementStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "付款中" | "已完成";
type LedgerStatus = "未还款" | "部分还款" | "还款中" | "已完结" | "付款失败";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type PaymentStatus = "未付款" | "付款中" | "已支付" | "付款失败" | "无需付款";
type MatterStatus = "未使用" | "使用中" | "已使用";
type InvoiceStatus = "待查验" | "查验通过" | "查验失败" | "已报销" | "报销中";

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface MarketingMatter {
  id: string;
  code: string;
  name: string;
  applicant: string;
  department: string;
  planCategory: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  availableAmount: number;
  status: MatterStatus;
}

interface AdvanceApplication {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  accountingEntity: string;
  currency: string;
  createdAt: string;
  expectedRepayAt: string;
  matterId: string;
  matterCode: string;
  matterName: string;
  planCategory: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  availableAmount: number;
  amount: number;
  loanType: string;
  summary: string;
  payeeAccount: string;
  payerAccount: string;
  suggestedPayAt: string;
  settlementMethod: string;
  status: ApprovalStatus;
  paymentStatus: PaymentStatus;
  voucherNo: string;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  steps: ApprovalStep[];
}

interface AdvanceLedger {
  id: string;
  sourceApplicationId: string;
  sourceCode: string;
  sourceName: string;
  matterId: string;
  matterCode: string;
  matterName: string;
  applicant: string;
  borrower: string;
  department: string;
  appliedAt: string;
  loanAt: string;
  expectedRepayAt: string;
  loanAmount: number;
  repayingAmount: number;
  repaidAmount: number;
  outstandingAmount: number;
  closeStatus: LedgerStatus;
  planCategory: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  loanType: string;
  accountingEntity: string;
  payeeAccount: string;
  paymentStatus: PaymentStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  paymentLogs: PaymentRecord[];
  relatedReimbursements: string[];
  steps: ApprovalStep[];
}

interface Reimbursement {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  createdAt: string;
  matterId: string;
  matterCode: string;
  matterName: string;
  activity: string;
  budgetSubject: string;
  budgetDepartment: string;
  expenseType: string;
  businessDate: string;
  reimbursementAmount: number;
  taxExcludedAmount: number;
  taxAmount: number;
  invoiceId?: string;
  invoiceNo?: string;
  invoiceStatus?: InvoiceStatus;
  ledgerId?: string;
  loanCode?: string;
  loanAmount: number;
  loanRepaidAmount: number;
  loanOutstandingAmount: number;
  offsetAmount: number;
  paymentAmount: number;
  paymentSummary: string;
  payeeAccount: string;
  payerAccount: string;
  expectedPayAt: string;
  paymentStatus: PaymentStatus;
  voucherNo: string;
  status: ReimbursementStatus;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  steps: ApprovalStep[];
}

interface InvoiceOption {
  id: string;
  invoiceNo: string;
  invoiceCode: string;
  invoiceType: string;
  issuedAt: string;
  amount: number;
  taxExcludedAmount: number;
  taxAmount: number;
  deductibleTax: number;
  status: InvoiceStatus;
}

interface PaymentRecord {
  id: string;
  time: string;
  channel: string;
  serialNo: string;
  result: string;
}

interface AdvanceFormState {
  editingId?: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  accountingEntity: string;
  currency: string;
  matterId: string;
  amount: string;
  loanType: string;
  summary: string;
  payeeAccount: string;
  payerAccount: string;
  suggestedPayAt: string;
  settlementMethod: string;
}

interface ReimburseFormState {
  editingId?: string;
  applicant: string;
  company: string;
  department: string;
  accountingEntity: string;
  matterId: string;
  expenseType: string;
  businessDate: string;
  reimbursementAmount: string;
  invoiceId: string;
  ledgerId: string;
  offsetAmount: string;
  paymentSummary: string;
  payeeAccount: string;
  payerAccount: string;
  expectedPayAt: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const initialMatters: MarketingMatter[] = [
  {
    id: "matter-001",
    code: "YXSA-2026-031",
    name: "618 抖音直播间预热视频拍摄",
    applicant: "陈晨",
    department: "内容营销部",
    planCategory: "大促活动",
    activity: "618 年中大促",
    budgetSubject: "达人合作 / 内容制作",
    budgetDepartment: "内容营销部",
    availableAmount: 180000,
    status: "未使用"
  },
  {
    id: "matter-002",
    code: "YXSA-2026-032",
    name: "天猫新品试用达人寄样",
    applicant: "陈晨",
    department: "品牌营销部",
    planCategory: "新品上市",
    activity: "夏季新品种草",
    budgetSubject: "达人合作 / 达人投放",
    budgetDepartment: "品牌营销部",
    availableAmount: 95000,
    status: "未使用"
  },
  {
    id: "matter-003",
    code: "YXSA-2026-033",
    name: "华东快闪店物料采购",
    applicant: "陈晨",
    department: "渠道市场部",
    planCategory: "线下活动",
    activity: "城市快闪巡展",
    budgetSubject: "品牌活动 / 物料制作",
    budgetDepartment: "渠道市场部",
    availableAmount: 128000,
    status: "未使用"
  },
  {
    id: "matter-004",
    code: "YXSA-2026-024",
    name: "抖音千川日常投放素材",
    applicant: "王珊",
    department: "电商运营部",
    planCategory: "日常投放",
    activity: "抖音信息流投放",
    budgetSubject: "渠道营销 / 信息流投放",
    budgetDepartment: "电商运营部",
    availableAmount: 260000,
    status: "使用中"
  },
  {
    id: "matter-005",
    code: "YXSA-2026-018",
    name: "直播间搭建尾款结算",
    applicant: "李响",
    department: "直播运营部",
    planCategory: "直播运营",
    activity: "品牌自播间升级",
    budgetSubject: "直播运营 / 直播间建设",
    budgetDepartment: "直播运营部",
    availableAmount: 72000,
    status: "已使用"
  }
];

const initialApplications: AdvanceApplication[] = [
  {
    id: "app-001",
    code: "YXBYJ-2026-001",
    title: "营销备用金申请单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "内容营销部",
    position: "营销专员",
    accountingEntity: "上海示例贸易有限公司",
    currency: "CNY",
    createdAt: "2026-05-02",
    expectedRepayAt: "2026-05-12",
    matterId: "matter-001",
    matterCode: "YXSA-2026-031",
    matterName: "618 抖音直播间预热视频拍摄",
    planCategory: "大促活动",
    activity: "618 年中大促",
    budgetSubject: "达人合作 / 内容制作",
    budgetDepartment: "内容营销部",
    availableAmount: 180000,
    amount: 60000,
    loanType: "专项营销备用金",
    summary: "短视频拍摄场地及执行垫资",
    payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    suggestedPayAt: "2026-05-03",
    settlementMethod: "银企直连",
    status: "已完成",
    paymentStatus: "已支付",
    voucherNo: "K3-202605-00031",
    sourceSystem: "[OA] 营销备用金审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 14:20:00",
    syncBatchNo: "SYNC-ADV-2026050301",
    steps: [
      { node: "申请人提交", approver: "陈晨", date: "2026-05-02", comment: "提交备用金申请" },
      { node: "部门负责人", approver: "赵敏", date: "2026-05-02", comment: "同意，活动已确认" },
      { node: "财务 BP", approver: "林一", date: "2026-05-03", comment: "通过并生成付款申请" }
    ]
  },
  {
    id: "app-002",
    code: "YXBYJ-2026-002",
    title: "营销备用金申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    position: "投放运营",
    accountingEntity: "上海示例贸易有限公司",
    currency: "CNY",
    createdAt: "2026-05-04",
    expectedRepayAt: "2026-05-14",
    matterId: "matter-004",
    matterCode: "YXSA-2026-024",
    matterName: "抖音千川日常投放素材",
    planCategory: "日常投放",
    activity: "抖音信息流投放",
    budgetSubject: "渠道营销 / 信息流投放",
    budgetDepartment: "电商运营部",
    availableAmount: 260000,
    amount: 45000,
    loanType: "临时垫资",
    summary: "素材拍摄与本地执行费用",
    payeeAccount: "工商银行 6222 **** 5601 / 王珊",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    suggestedPayAt: "2026-05-05",
    settlementMethod: "银企直连",
    status: "付款失败",
    paymentStatus: "付款失败",
    voucherNo: "-",
    sourceSystem: "[OA] 营销备用金审批",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 16:30:00",
    syncBatchNo: "SYNC-ADV-2026050502",
    failureReason: "CBS 返回：收款账户户名校验失败 [PAYEE-409]",
    steps: [
      { node: "申请人提交", approver: "王珊", date: "2026-05-04", comment: "提交备用金申请" },
      { node: "财务 BP", approver: "林一", date: "2026-05-05", comment: "审批通过，支付失败待重试" }
    ]
  },
  {
    id: "app-003",
    code: "YXBYJ-2026-003",
    title: "营销备用金申请单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "品牌营销部",
    position: "营销专员",
    accountingEntity: "上海示例贸易有限公司",
    currency: "CNY",
    createdAt: "2026-05-05",
    expectedRepayAt: "2026-05-15",
    matterId: "matter-002",
    matterCode: "YXSA-2026-032",
    matterName: "天猫新品试用达人寄样",
    planCategory: "新品上市",
    activity: "夏季新品种草",
    budgetSubject: "达人合作 / 达人投放",
    budgetDepartment: "品牌营销部",
    availableAmount: 95000,
    amount: 32000,
    loanType: "专项营销备用金",
    summary: "寄样快递、临时包装及达人执行费用",
    payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    suggestedPayAt: "2026-05-06",
    settlementMethod: "银企直连",
    status: "审批中",
    paymentStatus: "未付款",
    voucherNo: "-",
    sourceSystem: "[OA] 营销备用金审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    steps: [{ node: "申请人提交", approver: "陈晨", date: "2026-05-05", comment: "等待部门负责人审批" }]
  },
  {
    id: "app-004",
    code: "YXBYJ-2026-004",
    title: "营销备用金申请单",
    applicant: "李响",
    company: "上海示例贸易有限公司",
    department: "直播运营部",
    position: "直播运营",
    accountingEntity: "上海示例贸易有限公司",
    currency: "CNY",
    createdAt: "2026-05-01",
    expectedRepayAt: "2026-05-11",
    matterId: "matter-005",
    matterCode: "YXSA-2026-018",
    matterName: "直播间搭建尾款结算",
    planCategory: "直播运营",
    activity: "品牌自播间升级",
    budgetSubject: "直播运营 / 直播间建设",
    budgetDepartment: "直播运营部",
    availableAmount: 72000,
    amount: 30000,
    loanType: "临时垫资",
    summary: "搭建供应商现场费用备用",
    payeeAccount: "交通银行 6222 **** 9980 / 李响",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    suggestedPayAt: "2026-05-02",
    settlementMethod: "网银转账",
    status: "已驳回",
    paymentStatus: "未付款",
    voucherNo: "-",
    sourceSystem: "[OA] 营销备用金审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    failureReason: "预算事项已被使用，请重新选择营销事项。",
    steps: [{ node: "财务 BP", approver: "林一", date: "2026-05-02", comment: "驳回：事项状态不可用" }]
  }
];

const initialLedgers: AdvanceLedger[] = [
  {
    id: "ledger-001",
    sourceApplicationId: "app-001",
    sourceCode: "YXBYJ-2026-001",
    sourceName: "营销备用金申请单",
    matterId: "matter-001",
    matterCode: "YXSA-2026-031",
    matterName: "618 抖音直播间预热视频拍摄",
    applicant: "陈晨",
    borrower: "陈晨",
    department: "内容营销部",
    appliedAt: "2026-05-02",
    loanAt: "2026-05-03",
    expectedRepayAt: "2026-05-12",
    loanAmount: 60000,
    repayingAmount: 0,
    repaidAmount: 22000,
    outstandingAmount: 38000,
    closeStatus: "部分还款",
    planCategory: "大促活动",
    activity: "618 年中大促",
    budgetSubject: "达人合作 / 内容制作",
    budgetDepartment: "内容营销部",
    loanType: "专项营销备用金",
    accountingEntity: "上海示例贸易有限公司",
    payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
    paymentStatus: "已支付",
    sourceSystem: "[金蝶] 付款申请 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 14:20:00",
    syncBatchNo: "SYNC-ADV-2026050301",
    paymentLogs: [
      { id: "pay-001", time: "2026-05-03 14:18:00", channel: "CBS", serialNo: "CBS202605030001", result: "支付成功" }
    ],
    relatedReimbursements: ["YXBXS-2026-001"],
    steps: initialApplications[0].steps
  },
  {
    id: "ledger-002",
    sourceApplicationId: "app-005",
    sourceCode: "YXBYJ-2026-005",
    sourceName: "营销备用金申请单",
    matterId: "matter-004",
    matterCode: "YXSA-2026-024",
    matterName: "抖音千川日常投放素材",
    applicant: "王珊",
    borrower: "王珊",
    department: "电商运营部",
    appliedAt: "2026-04-25",
    loanAt: "2026-04-26",
    expectedRepayAt: "2026-05-06",
    loanAmount: 50000,
    repayingAmount: 8000,
    repaidAmount: 17000,
    outstandingAmount: 33000,
    closeStatus: "还款中",
    planCategory: "日常投放",
    activity: "抖音信息流投放",
    budgetSubject: "渠道营销 / 信息流投放",
    budgetDepartment: "电商运营部",
    loanType: "临时垫资",
    accountingEntity: "上海示例贸易有限公司",
    payeeAccount: "工商银行 6222 **** 5601 / 王珊",
    paymentStatus: "已支付",
    sourceSystem: "[金蝶] 付款申请 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-26 11:30:00",
    syncBatchNo: "SYNC-ADV-2026042604",
    paymentLogs: [
      { id: "pay-002", time: "2026-04-26 11:28:00", channel: "CBS", serialNo: "CBS202604260018", result: "支付成功" }
    ],
    relatedReimbursements: ["YXBXS-2026-002"],
    steps: [{ node: "财务 BP", approver: "林一", date: "2026-04-26", comment: "审批通过并付款" }]
  },
  {
    id: "ledger-003",
    sourceApplicationId: "app-006",
    sourceCode: "YXBYJ-2026-006",
    sourceName: "营销备用金申请单",
    matterId: "matter-005",
    matterCode: "YXSA-2026-018",
    matterName: "直播间搭建尾款结算",
    applicant: "李响",
    borrower: "李响",
    department: "直播运营部",
    appliedAt: "2026-04-10",
    loanAt: "2026-04-11",
    expectedRepayAt: "2026-04-21",
    loanAmount: 28000,
    repayingAmount: 0,
    repaidAmount: 28000,
    outstandingAmount: 0,
    closeStatus: "已完结",
    planCategory: "直播运营",
    activity: "品牌自播间升级",
    budgetSubject: "直播运营 / 直播间建设",
    budgetDepartment: "直播运营部",
    loanType: "专项营销备用金",
    accountingEntity: "上海示例贸易有限公司",
    payeeAccount: "交通银行 6222 **** 9980 / 李响",
    paymentStatus: "已支付",
    sourceSystem: "[金蝶] 付款申请 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-22 10:40:00",
    syncBatchNo: "SYNC-ADV-2026042203",
    paymentLogs: [
      { id: "pay-003", time: "2026-04-11 15:22:00", channel: "CBS", serialNo: "CBS202604110066", result: "支付成功" }
    ],
    relatedReimbursements: ["YXBXS-2026-004"],
    steps: [{ node: "财务主管", approver: "顾可", date: "2026-04-22", comment: "借款已全额核销" }]
  }
];

const initialInvoices: InvoiceOption[] = [
  {
    id: "inv-001",
    invoiceNo: "3100261130",
    invoiceCode: "044032600111",
    invoiceType: "增值税专用发票",
    issuedAt: "2026-05-04",
    amount: 38000,
    taxExcludedAmount: 35849.06,
    taxAmount: 2150.94,
    deductibleTax: 2150.94,
    status: "查验通过"
  },
  {
    id: "inv-002",
    invoiceNo: "3100261131",
    invoiceCode: "044032600112",
    invoiceType: "增值税普通发票",
    issuedAt: "2026-05-05",
    amount: 18000,
    taxExcludedAmount: 17475.73,
    taxAmount: 524.27,
    deductibleTax: 0,
    status: "待查验"
  },
  {
    id: "inv-003",
    invoiceNo: "3100261098",
    invoiceCode: "044032600088",
    invoiceType: "电子普通发票",
    issuedAt: "2026-04-28",
    amount: 22000,
    taxExcludedAmount: 21359.22,
    taxAmount: 640.78,
    deductibleTax: 0,
    status: "已报销"
  },
  {
    id: "inv-004",
    invoiceNo: "3100261139",
    invoiceCode: "044032600119",
    invoiceType: "增值税专用发票",
    issuedAt: "2026-05-06",
    amount: 54000,
    taxExcludedAmount: 50943.4,
    taxAmount: 3056.6,
    deductibleTax: 3056.6,
    status: "查验失败"
  }
];

const initialReimbursements: Reimbursement[] = [
  {
    id: "reim-001",
    code: "YXBXS-2026-001",
    title: "营销备用金报销单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "内容营销部",
    createdAt: "2026-05-05",
    matterId: "matter-001",
    matterCode: "YXSA-2026-031",
    matterName: "618 抖音直播间预热视频拍摄",
    activity: "618 年中大促",
    budgetSubject: "达人合作 / 内容制作",
    budgetDepartment: "内容营销部",
    expenseType: "内容制作费",
    businessDate: "2026-05-04",
    reimbursementAmount: 22000,
    taxExcludedAmount: 20754.72,
    taxAmount: 1245.28,
    invoiceId: "inv-003",
    invoiceNo: "3100261098",
    invoiceStatus: "已报销",
    ledgerId: "ledger-001",
    loanCode: "YXBYJ-2026-001",
    loanAmount: 60000,
    loanRepaidAmount: 0,
    loanOutstandingAmount: 60000,
    offsetAmount: 22000,
    paymentAmount: 0,
    paymentSummary: "备用金冲销，无需付款",
    payeeAccount: "-",
    payerAccount: "-",
    expectedPayAt: "-",
    paymentStatus: "无需付款",
    voucherNo: "K3-202605-00045",
    status: "已完成",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 18:10:00",
    steps: [
      { node: "申请人提交", approver: "陈晨", date: "2026-05-05", comment: "提交报销冲销" },
      { node: "财务 BP", approver: "林一", date: "2026-05-05", comment: "发票已查验，冲销通过" }
    ]
  },
  {
    id: "reim-002",
    code: "YXBXS-2026-002",
    title: "营销备用金报销单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    createdAt: "2026-05-06",
    matterId: "matter-004",
    matterCode: "YXSA-2026-024",
    matterName: "抖音千川日常投放素材",
    activity: "抖音信息流投放",
    budgetSubject: "渠道营销 / 信息流投放",
    budgetDepartment: "电商运营部",
    expenseType: "素材制作费",
    businessDate: "2026-05-05",
    reimbursementAmount: 25000,
    taxExcludedAmount: 23584.91,
    taxAmount: 1415.09,
    invoiceId: "inv-001",
    invoiceNo: "3100261130",
    invoiceStatus: "查验通过",
    ledgerId: "ledger-002",
    loanCode: "YXBYJ-2026-005",
    loanAmount: 50000,
    loanRepaidAmount: 17000,
    loanOutstandingAmount: 33000,
    offsetAmount: 8000,
    paymentAmount: 17000,
    paymentSummary: "部分冲销，差额模拟付款",
    payeeAccount: "工商银行 6222 **** 5601 / 王珊",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    expectedPayAt: "2026-05-07",
    paymentStatus: "付款中",
    voucherNo: "-",
    status: "审批中",
    syncStatus: "未同步",
    lastSyncAt: "-",
    steps: [{ node: "申请人提交", approver: "王珊", date: "2026-05-06", comment: "等待财务复核" }]
  },
  {
    id: "reim-003",
    code: "YXBXS-2026-003",
    title: "个人垫付报销单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "品牌营销部",
    createdAt: "2026-05-06",
    matterId: "matter-002",
    matterCode: "YXSA-2026-032",
    matterName: "天猫新品试用达人寄样",
    activity: "夏季新品种草",
    budgetSubject: "达人合作 / 达人投放",
    budgetDepartment: "品牌营销部",
    expenseType: "达人样品寄送费",
    businessDate: "2026-05-05",
    reimbursementAmount: 18000,
    taxExcludedAmount: 17475.73,
    taxAmount: 524.27,
    invoiceId: "inv-002",
    invoiceNo: "3100261131",
    invoiceStatus: "待查验",
    loanAmount: 0,
    loanRepaidAmount: 0,
    loanOutstandingAmount: 0,
    offsetAmount: 0,
    paymentAmount: 18000,
    paymentSummary: "无借款个人垫付报销",
    payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
    payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
    expectedPayAt: "2026-05-08",
    paymentStatus: "未付款",
    voucherNo: "-",
    status: "草稿",
    syncStatus: "未同步",
    lastSyncAt: "-",
    steps: [{ node: "保存草稿", approver: "陈晨", date: "2026-05-06", comment: "待补充发票查验结果" }]
  }
];

const defaultAdvanceForm: AdvanceFormState = {
  applicant: "陈晨",
  company: "上海示例贸易有限公司",
  department: "内容营销部",
  position: "营销专员",
  accountingEntity: "上海示例贸易有限公司",
  currency: "CNY",
  matterId: "matter-001",
  amount: "60000",
  loanType: "专项营销备用金",
  summary: "营销活动现场执行备用",
  payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
  payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
  suggestedPayAt: "2026-05-07",
  settlementMethod: "银企直连"
};

const defaultReimburseForm: ReimburseFormState = {
  applicant: "陈晨",
  company: "上海示例贸易有限公司",
  department: "内容营销部",
  accountingEntity: "上海示例贸易有限公司",
  matterId: "matter-001",
  expenseType: "内容制作费",
  businessDate: today,
  reimbursementAmount: "38000",
  invoiceId: "inv-001",
  ledgerId: "",
  offsetAmount: "0",
  paymentSummary: "个人垫付报销",
  payeeAccount: "招商银行 6225 **** 1028 / 陈晨",
  payerAccount: "建设银行 3100 **** 8210 / 上海示例贸易有限公司",
  expectedPayAt: "2026-05-08"
};

export default function MarketingAdvancePage() {
  const [view, setView] = useState<ViewMode>("ledger");
  const [matters, setMatters] = useState(initialMatters);
  const [applications, setApplications] = useState(initialApplications);
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [reimbursements, setReimbursements] = useState(initialReimbursements);
  const [filters, setFilters] = useState({ keyword: "", status: "全部", department: "全部" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<{ title: string; children: ReactNode } | null>(null);
  const [advanceForm, setAdvanceForm] = useState<AdvanceFormState | null>(null);
  const [reimburseForm, setReimburseForm] = useState<ReimburseFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overlayLoading, setOverlayLoading] = useState("");
  const [repaymentTarget, setRepaymentTarget] = useState<AdvanceLedger | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState("");

  const filteredApplications = useMemo(() => filterApplications(applications, filters), [applications, filters]);
  const filteredReimbursements = useMemo(() => filterReimbursements(reimbursements, filters), [filters, reimbursements]);
  const filteredLedgers = useMemo(() => filterLedgers(ledgers, filters), [filters, ledgers]);
  const currentCount = view === "applications" ? filteredApplications.length : view === "reimbursements" ? filteredReimbursements.length : filteredLedgers.length;

  const stats = [
    { label: "借款总额", value: formatMoney(ledgers.reduce((total, item) => total + item.loanAmount, 0)), sub: "专项备用金台账" },
    { label: "未还金额", value: formatMoney(ledgers.reduce((total, item) => total + item.outstandingAmount, 0)), sub: "含部分还款与还款中" },
    { label: "报销合计", value: formatMoney(reimbursements.reduce((total, item) => total + item.reimbursementAmount, 0)), sub: "备用金/个人垫付" },
    { label: "待处理单据", value: String([...applications, ...reimbursements].filter((item) => ["草稿", "审批中", "已驳回", "付款失败"].includes(item.status)).length), sub: "可继续演示操作" }
  ];

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function simulateQuery() {
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 650);
  }

  function resetFilters() {
    setFilters({ keyword: "", status: "全部", department: "全部" });
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
  }

  function openAdvanceForm(editingId?: string) {
    const target = applications.find((item) => item.id === editingId);
    setAdvanceForm(
      target
        ? {
            editingId: target.id,
            applicant: target.applicant,
            company: target.company,
            department: target.department,
            position: target.position,
            accountingEntity: target.accountingEntity,
            currency: target.currency,
            matterId: target.matterId,
            amount: String(target.amount),
            loanType: target.loanType,
            summary: target.summary,
            payeeAccount: target.payeeAccount,
            payerAccount: target.payerAccount,
            suggestedPayAt: target.suggestedPayAt,
            settlementMethod: target.settlementMethod
          }
        : defaultAdvanceForm
    );
    setErrors({});
  }

  function openReimburseForm(ledgerId?: string, editingId?: string) {
    const target = reimbursements.find((item) => item.id === editingId);
    if (target) {
      setReimburseForm({
        editingId: target.id,
        applicant: target.applicant,
        company: target.company,
        department: target.department,
        accountingEntity: "上海示例贸易有限公司",
        matterId: target.matterId,
        expenseType: target.expenseType,
        businessDate: target.businessDate,
        reimbursementAmount: String(target.reimbursementAmount),
        invoiceId: target.invoiceId ?? "",
        ledgerId: target.ledgerId ?? "",
        offsetAmount: String(target.offsetAmount),
        paymentSummary: target.paymentSummary,
        payeeAccount: target.payeeAccount === "-" ? defaultReimburseForm.payeeAccount : target.payeeAccount,
        payerAccount: target.payerAccount === "-" ? defaultReimburseForm.payerAccount : target.payerAccount,
        expectedPayAt: target.expectedPayAt === "-" ? defaultReimburseForm.expectedPayAt : target.expectedPayAt
      });
    } else if (ledgerId) {
      const ledger = ledgers.find((item) => item.id === ledgerId);
      const amount = ledger ? Math.min(ledger.outstandingAmount, 38000) : 0;
      setReimburseForm({
        ...defaultReimburseForm,
        applicant: ledger?.borrower ?? defaultReimburseForm.applicant,
        department: ledger?.department ?? defaultReimburseForm.department,
        matterId: ledger?.matterId ?? defaultReimburseForm.matterId,
        ledgerId: ledger?.id ?? "",
        reimbursementAmount: String(amount || 10000),
        offsetAmount: String(amount || 0),
        paymentSummary: "备用金报销冲销",
        payeeAccount: ledger?.payeeAccount ?? defaultReimburseForm.payeeAccount
      });
    } else {
      setReimburseForm(defaultReimburseForm);
    }
    setErrors({});
  }

  function saveAdvanceDraft() {
    if (!advanceForm || !validateAdvanceForm(advanceForm, false)) return;
    upsertAdvanceApplication(advanceForm, "草稿");
    setAdvanceForm(null);
    setView("applications");
    showToast("已保存营销备用金申请草稿。");
  }

  function submitAdvance(event: FormEvent) {
    event.preventDefault();
    if (!advanceForm || !validateAdvanceForm(advanceForm, true)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      upsertAdvanceApplication(advanceForm, "审批中");
      setSubmitting(false);
      setAdvanceForm(null);
      setView("applications");
      showToast("已模拟提交 OA 审批，申请单进入审批中。");
    }, 650);
  }

  function saveReimburseDraft() {
    if (!reimburseForm || !validateReimburseForm(reimburseForm, false)) return;
    upsertReimbursement(reimburseForm, "草稿");
    setReimburseForm(null);
    setView("reimbursements");
    showToast("已保存报销草稿。");
  }

  function submitReimbursement(event: FormEvent) {
    event.preventDefault();
    if (!reimburseForm || !validateReimburseForm(reimburseForm, true)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      upsertReimbursement(reimburseForm, "审批中");
      setSubmitting(false);
      setReimburseForm(null);
      setView("reimbursements");
      showToast("已模拟提交 OA 审批，报销单进入审批中。");
    }, 650);
  }

  function validateAdvanceForm(next: AdvanceFormState, strict: boolean) {
    const currentErrors: Record<string, string> = {};
    const matter = matters.find((item) => item.id === next.matterId);
    const amount = Number(next.amount);
    if (!next.accountingEntity.trim()) currentErrors.accountingEntity = "请选择核算主体";
    if (!next.currency.trim()) currentErrors.currency = "请选择币种";
    if (!matter) currentErrors.matterId = "请选择关联营销事项";
    if (strict && matter && matter.status !== "未使用" && !next.editingId) currentErrors.matterId = "Demo 仅允许选择未使用的营销事项";
    if (!next.loanType.trim()) currentErrors.loanType = "请选择借款类型";
    if (!next.payeeAccount.trim()) currentErrors.payeeAccount = "请填写收款方账号";
    if (!next.payerAccount.trim()) currentErrors.payerAccount = "请填写付款方账号";
    if (Number.isNaN(amount) || amount <= 0) currentErrors.amount = "本次借款金额必须大于 0";
    if (matter && amount > matter.availableAmount) currentErrors.amount = "本次借款金额不能超过申请可用金额";
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  }

  function validateReimburseForm(next: ReimburseFormState, strict: boolean) {
    const currentErrors: Record<string, string> = {};
    const matter = matters.find((item) => item.id === next.matterId);
    const ledger = next.ledgerId ? ledgers.find((item) => item.id === next.ledgerId) : undefined;
    const amount = Number(next.reimbursementAmount);
    const offset = Number(next.offsetAmount || 0);
    if (!matter) currentErrors.matterId = "请选择营销事项";
    if (!next.expenseType.trim()) currentErrors.expenseType = "请选择费用类型";
    if (Number.isNaN(amount) || amount <= 0) currentErrors.reimbursementAmount = "报销合计必须大于 0";
    if (Number.isNaN(offset) || offset < 0) currentErrors.offsetAmount = "本次冲销金额不能小于 0";
    if (offset > amount) currentErrors.offsetAmount = "冲销金额不能大于报销合计";
    if (ledger && offset > ledger.outstandingAmount) currentErrors.offsetAmount = "冲销金额不能超过未还款金额";
    if (!ledger && offset > 0) currentErrors.ledgerId = "有冲销金额时必须选择备用金借款";
    const paymentAmount = amount - offset;
    if (strict && paymentAmount > 0 && (!next.payeeAccount.trim() || !next.payerAccount.trim())) {
      currentErrors.payeeAccount = "差额付款时收付款账号必填";
    }
    if (paymentAmount < 0) currentErrors.offsetAmount = "剩余应付金额不能为负数";
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  }

  function upsertAdvanceApplication(next: AdvanceFormState, status: ApprovalStatus) {
    const matter = matters.find((item) => item.id === next.matterId) ?? matters[0];
    const existing = applications.find((item) => item.id === next.editingId);
    const amount = Number(next.amount);
    const item: AdvanceApplication = {
      id: existing?.id ?? `app-${Date.now()}`,
      code: existing?.code ?? `YXBYJ-2026-${String(applications.length + 1).padStart(3, "0")}`,
      title: "营销备用金申请单",
      applicant: next.applicant,
      company: next.company,
      department: next.department,
      position: next.position,
      accountingEntity: next.accountingEntity,
      currency: next.currency,
      createdAt: existing?.createdAt ?? today,
      expectedRepayAt: addDays(next.suggestedPayAt || today, 10),
      matterId: matter.id,
      matterCode: matter.code,
      matterName: matter.name,
      planCategory: matter.planCategory,
      activity: matter.activity,
      budgetSubject: matter.budgetSubject,
      budgetDepartment: matter.budgetDepartment,
      availableAmount: matter.availableAmount,
      amount,
      loanType: next.loanType,
      summary: next.summary,
      payeeAccount: next.payeeAccount,
      payerAccount: next.payerAccount,
      suggestedPayAt: next.suggestedPayAt,
      settlementMethod: next.settlementMethod,
      status,
      paymentStatus: existing?.paymentStatus ?? "未付款",
      voucherNo: existing?.voucherNo ?? "-",
      sourceSystem: "[OA] 营销备用金审批",
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      syncBatchNo: existing?.syncBatchNo ?? "-",
      failureReason: existing?.failureReason,
      steps: buildSteps(existing?.steps ?? [], status, next.applicant, status === "草稿" ? "保存草稿" : "模拟提交 OA 审批")
    };
    setApplications((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
  }

  function upsertReimbursement(next: ReimburseFormState, status: ReimbursementStatus) {
    const matter = matters.find((item) => item.id === next.matterId) ?? matters[0];
    const ledger = next.ledgerId ? ledgers.find((item) => item.id === next.ledgerId) : undefined;
    const invoice = invoices.find((item) => item.id === next.invoiceId);
    const existing = reimbursements.find((item) => item.id === next.editingId);
    const reimbursementAmount = Number(next.reimbursementAmount);
    const offsetAmount = Number(next.offsetAmount || 0);
    const paymentAmount = Math.max(reimbursementAmount - offsetAmount, 0);
    const taxAmount = invoice ? invoice.taxAmount : Math.round(reimbursementAmount * 0.06 * 100) / 100;
    const item: Reimbursement = {
      id: existing?.id ?? `reim-${Date.now()}`,
      code: existing?.code ?? `YXBXS-2026-${String(reimbursements.length + 1).padStart(3, "0")}`,
      title: ledger ? "营销备用金报销单" : "个人垫付报销单",
      applicant: next.applicant,
      company: next.company,
      department: next.department,
      createdAt: existing?.createdAt ?? today,
      matterId: matter.id,
      matterCode: matter.code,
      matterName: matter.name,
      activity: matter.activity,
      budgetSubject: matter.budgetSubject,
      budgetDepartment: matter.budgetDepartment,
      expenseType: next.expenseType,
      businessDate: next.businessDate,
      reimbursementAmount,
      taxExcludedAmount: reimbursementAmount - taxAmount,
      taxAmount,
      invoiceId: invoice?.id,
      invoiceNo: invoice?.invoiceNo,
      invoiceStatus: invoice?.status,
      ledgerId: ledger?.id,
      loanCode: ledger?.sourceCode,
      loanAmount: ledger?.loanAmount ?? 0,
      loanRepaidAmount: ledger?.repaidAmount ?? 0,
      loanOutstandingAmount: ledger?.outstandingAmount ?? 0,
      offsetAmount,
      paymentAmount,
      paymentSummary: next.paymentSummary || (ledger ? "备用金报销冲销" : "个人垫付报销"),
      payeeAccount: paymentAmount > 0 ? next.payeeAccount : "-",
      payerAccount: paymentAmount > 0 ? next.payerAccount : "-",
      expectedPayAt: paymentAmount > 0 ? next.expectedPayAt : "-",
      paymentStatus: paymentAmount > 0 ? existing?.paymentStatus ?? "未付款" : "无需付款",
      voucherNo: existing?.voucherNo ?? "-",
      status,
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      failureReason: existing?.failureReason,
      steps: buildSteps(existing?.steps ?? [], status, next.applicant, status === "草稿" ? "保存草稿" : "模拟提交 OA 审批")
    };
    setReimbursements((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
    if (invoice && status === "审批中") {
      setInvoices((items) => items.map((row) => (row.id === invoice.id ? { ...row, status: "报销中" } : row)));
    }
  }

  function updateApplicationStatus(id: string, status: ApprovalStatus) {
    setApplications((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              syncStatus: status === "审批通过" ? "同步成功" : item.syncStatus,
              lastSyncAt: status === "审批通过" ? nowText : item.lastSyncAt,
              syncBatchNo: status === "审批通过" ? `SYNC-ADV-${Date.now()}` : item.syncBatchNo,
              failureReason: status === "已驳回" ? "模拟驳回：请补充借款说明或附件。" : item.failureReason,
              steps: buildSteps(item.steps, status, item.applicant, status === "已驳回" ? "模拟审批驳回" : "模拟审批通过")
            }
          : item
      )
    );
    showToast(status === "审批通过" ? "审批通过，可继续模拟金蝶/CBS 付款。" : "已模拟驳回，单据可编辑后重新提交。");
  }

  function simulatePayment(id: string, success: boolean) {
    const target = applications.find((item) => item.id === id);
    if (!target) return;
    setOverlayLoading(success ? "正在模拟 CBS 支付" : "正在模拟支付失败回写");
    setApplications((items) => items.map((item) => (item.id === id ? { ...item, status: "付款中", paymentStatus: "付款中", failureReason: undefined } : item)));
    window.setTimeout(() => {
      setOverlayLoading("");
      if (success) {
        const voucherNo = `K3-202605-${String(Math.floor(Math.random() * 900) + 100)}`;
        setApplications((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "已完成",
                  paymentStatus: "已支付",
                  voucherNo,
                  syncStatus: "同步成功",
                  lastSyncAt: nowText,
                  syncBatchNo: `SYNC-ADV-${Date.now()}`,
                  steps: buildSteps(item.steps, "已完成", item.applicant, "CBS 支付成功，凭证号已回写")
                }
              : item
          )
        );
        const paidApplication = { ...target, status: "已完成" as ApprovalStatus, paymentStatus: "已支付" as PaymentStatus, voucherNo };
        createLedgerFromApplication(paidApplication);
        setMatters((items) => items.map((matter) => (matter.id === target.matterId ? { ...matter, status: "已使用", availableAmount: Math.max(matter.availableAmount - target.amount, 0) } : matter)));
        setView("ledger");
        showToast("支付成功，专项备用金台账已生成或刷新。");
      } else {
        setApplications((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "付款失败",
                  paymentStatus: "付款失败",
                  syncStatus: "同步失败",
                  lastSyncAt: nowText,
                  failureReason: "CBS 返回：银行账户状态异常 [BANK-504]",
                  steps: buildSteps(item.steps, "付款失败", item.applicant, "模拟 CBS 支付失败")
                }
              : item
          )
        );
        showToast("已模拟支付失败，可在列表重试支付。");
      }
    }, 900);
  }

  function createLedgerFromApplication(application: AdvanceApplication) {
    setLedgers((items) => {
      const exists = items.some((item) => item.sourceApplicationId === application.id);
      if (exists) return items;
      const next: AdvanceLedger = {
        id: `ledger-${Date.now()}`,
        sourceApplicationId: application.id,
        sourceCode: application.code,
        sourceName: application.title,
        matterId: application.matterId,
        matterCode: application.matterCode,
        matterName: application.matterName,
        applicant: application.applicant,
        borrower: application.applicant,
        department: application.department,
        appliedAt: application.createdAt,
        loanAt: today,
        expectedRepayAt: application.expectedRepayAt,
        loanAmount: application.amount,
        repayingAmount: 0,
        repaidAmount: 0,
        outstandingAmount: application.amount,
        closeStatus: "未还款",
        planCategory: application.planCategory,
        activity: application.activity,
        budgetSubject: application.budgetSubject,
        budgetDepartment: application.budgetDepartment,
        loanType: application.loanType,
        accountingEntity: application.accountingEntity,
        payeeAccount: application.payeeAccount,
        paymentStatus: application.paymentStatus,
        sourceSystem: "[金蝶] 付款申请 / [CBS] 支付",
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        syncBatchNo: `SYNC-ADV-${Date.now()}`,
        paymentLogs: [{ id: `pay-${Date.now()}`, time: nowText, channel: "CBS", serialNo: `CBS${Date.now()}`, result: "支付成功" }],
        relatedReimbursements: [],
        steps: application.steps
      };
      return [next, ...items];
    });
  }

  function updateReimbursementStatus(id: string, status: ReimbursementStatus) {
    const target = reimbursements.find((item) => item.id === id);
    if (!target) return;
    if (status === "已完成") {
      if (target.offsetAmount > target.reimbursementAmount) {
        setPageError("模拟拦截：报销金额小于冲销金额，剩余应付金额不能为负数。");
        return;
      }
      setReimbursements((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "已完成",
                paymentStatus: item.paymentAmount > 0 ? "已支付" : "无需付款",
                voucherNo: `K3-202605-${String(Math.floor(Math.random() * 900) + 100)}`,
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                steps: buildSteps(item.steps, "已完成", item.applicant, "审批通过，更新备用金/费用台账")
              }
            : item
        )
      );
      applyReimbursementToLedger(target);
      setMatters((items) => items.map((matter) => (matter.id === target.matterId ? { ...matter, status: "已使用" } : matter)));
      if (target.invoiceId) {
        setInvoices((items) => items.map((invoice) => (invoice.id === target.invoiceId ? { ...invoice, status: "已报销" } : invoice)));
      }
      setView("ledger");
      showToast(target.ledgerId ? "报销审批通过，借款台账已冲销更新。" : "个人垫付报销审批通过，已模拟生成费用与付款记录。");
    } else {
      setReimbursements((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                failureReason: status === "已驳回" ? "模拟驳回：发票金额与费用明细需复核。" : item.failureReason,
                steps: buildSteps(item.steps, status, item.applicant, status === "已驳回" ? "模拟审批驳回" : "模拟审批通过")
              }
            : item
        )
      );
      showToast(status === "已驳回" ? "已模拟驳回，报销单可编辑后重提。" : "审批通过，可继续完成核销。");
    }
  }

  function applyReimbursementToLedger(reimbursement: Reimbursement) {
    if (!reimbursement.ledgerId || reimbursement.offsetAmount <= 0) return;
    setLedgers((items) =>
      items.map((ledger) => {
        if (ledger.id !== reimbursement.ledgerId) return ledger;
        const repaidAmount = Math.min(ledger.loanAmount, ledger.repaidAmount + reimbursement.offsetAmount);
        const outstandingAmount = Math.max(ledger.loanAmount - repaidAmount, 0);
        return {
          ...ledger,
          repayingAmount: 0,
          repaidAmount,
          outstandingAmount,
          closeStatus: outstandingAmount === 0 ? "已完结" : "部分还款",
          lastSyncAt: nowText,
          relatedReimbursements: Array.from(new Set([reimbursement.code, ...ledger.relatedReimbursements]))
        };
      })
    );
  }

  function startRepayment(ledger: AdvanceLedger) {
    setRepaymentTarget(ledger);
    setRepaymentAmount(String(ledger.outstandingAmount));
    setErrors({});
  }

  function confirmRepayment() {
    if (!repaymentTarget) return;
    const amount = Number(repaymentAmount);
    if (Number.isNaN(amount) || amount <= 0 || amount > repaymentTarget.outstandingAmount) {
      setErrors({ repaymentAmount: "本次还款金额必须大于 0 且不能超过未还款金额" });
      return;
    }
    setRepaymentTarget(null);
    setOverlayLoading("正在模拟还款审批与入账");
    setLedgers((items) => items.map((item) => (item.id === repaymentTarget.id ? { ...item, repayingAmount: amount, closeStatus: "还款中" } : item)));
    window.setTimeout(() => {
      setOverlayLoading("");
      setLedgers((items) =>
        items.map((item) => {
          if (item.id !== repaymentTarget.id) return item;
          const repaidAmount = Math.min(item.loanAmount, item.repaidAmount + amount);
          const outstandingAmount = Math.max(item.loanAmount - repaidAmount, 0);
          return {
            ...item,
            repayingAmount: 0,
            repaidAmount,
            outstandingAmount,
            closeStatus: outstandingAmount === 0 ? "已完结" : "部分还款",
            lastSyncAt: nowText,
            paymentLogs: [{ id: `repay-${Date.now()}`, time: nowText, channel: "线下还款", serialNo: `REPAY${Date.now()}`, result: `登记还款 ${formatMoney(amount)}` }, ...item.paymentLogs]
          };
        })
      );
      showToast("还款审批通过，专项备用金台账已更新。");
    }, 850);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white xl:block">
          <div className="border-b border-slate-200 p-5">
            <div className="text-sm font-semibold text-blue-600">营销费控 Demo</div>
            <div className="mt-1 text-lg font-semibold">营销备用金</div>
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
              <div key={label} className={`rounded-md px-3 py-2 ${label === "费用申请与资金" ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{sub}</div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">费用申请与资金 / 营销备用金 / 3.7.3</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">营销备用金模块</h1>
              <p className="mt-1 text-sm text-slate-500">备用金申请、审批付款、报销冲销、还款登记与专项备用金台账的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => (view === "reimbursements" ? openReimburseForm() : openAdvanceForm())}>{view === "reimbursements" ? "新增报销单" : "新增备用金申请"}</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>
                导出模拟
              </Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：备用金台账服务响应超时，请点击重试。")}>
                模拟异常
              </Button>
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

          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {viewTabs.map((tab) => (
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
            <FilterBar filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} />

            {pageError && (
              <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="text-left font-medium text-red-700 underline" onClick={simulateQuery}>
                  重试加载
                </button>
              </div>
            )}

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              第三方系统均为 mock：OA 审批、金蝶付款申请、CBS 支付、凭证回写与发票查验只更新前端状态。
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : currentCount === 0 ? (
                <EmptyState onReset={resetFilters} onCreate={() => (view === "reimbursements" ? openReimburseForm() : openAdvanceForm())} />
              ) : view === "applications" ? (
                <ApplicationTable
                  rows={filteredApplications}
                  onDetail={(item) => setDetail({ title: item.code, children: <ApplicationDetail item={item} /> })}
                  onEdit={openAdvanceForm}
                  onApprove={(id) => updateApplicationStatus(id, "审批通过")}
                  onReject={(id) => updateApplicationStatus(id, "已驳回")}
                  onPay={simulatePayment}
                />
              ) : view === "reimbursements" ? (
                <ReimbursementTable
                  rows={filteredReimbursements}
                  onDetail={(item) => setDetail({ title: item.code, children: <ReimbursementDetail item={item} /> })}
                  onEdit={(id) => openReimburseForm(undefined, id)}
                  onApprove={(id) => updateReimbursementStatus(id, "已完成")}
                  onReject={(id) => updateReimbursementStatus(id, "已驳回")}
                />
              ) : (
                <LedgerTable
                  rows={filteredLedgers}
                  onDetail={(item) => setDetail({ title: item.sourceCode, children: <LedgerDetail item={item} /> })}
                  onReimburse={(id) => openReimburseForm(id)}
                  onRepay={startRepayment}
                />
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

      {advanceForm && (
        <AdvanceFormModal
          form={advanceForm}
          errors={errors}
          matters={matters}
          submitting={submitting}
          onChange={(patch) => setAdvanceForm((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setAdvanceForm(null)}
          onSaveDraft={saveAdvanceDraft}
          onSubmit={submitAdvance}
        />
      )}

      {reimburseForm && (
        <ReimburseFormModal
          form={reimburseForm}
          errors={errors}
          matters={matters}
          ledgers={ledgers}
          invoices={invoices}
          submitting={submitting}
          onChange={(patch) => setReimburseForm((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setReimburseForm(null)}
          onSaveDraft={saveReimburseDraft}
          onSubmit={submitReimbursement}
        />
      )}

      {repaymentTarget && (
        <RepaymentModal
          ledger={repaymentTarget}
          amount={repaymentAmount}
          error={errors.repaymentAmount}
          onAmount={setRepaymentAmount}
          onClose={() => setRepaymentTarget(null)}
          onConfirm={confirmRepayment}
        />
      )}

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

function ApplicationTable({
  rows,
  onDetail,
  onEdit,
  onApprove,
  onReject,
  onPay
}: {
  rows: AdvanceApplication[];
  onDetail: (item: AdvanceApplication) => void;
  onEdit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPay: (id: string, success: boolean) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>单据编号</Th>
          <Th>申请人</Th>
          <Th>营销事项</Th>
          <Th>预算科目</Th>
          <Th>本次借款</Th>
          <Th>单据状态</Th>
          <Th>付款状态</Th>
          <Th>同步状态</Th>
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
            </Td>
            <Td>{item.applicant}</Td>
            <Td>{item.matterName}</Td>
            <Td>{item.budgetSubject}</Td>
            <Td align="right">{formatMoney(item.amount)}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.paymentStatus} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 max-w-52 truncate text-xs text-red-600">{item.failureReason}</div>}
            </Td>
            <Td>
              <InlineActions>
                {["草稿", "已驳回"].includes(item.status) && <button onClick={() => onEdit(item.id)}>编辑</button>}
                {item.status === "审批中" && (
                  <>
                    <button onClick={() => onApprove(item.id)}>审批通过</button>
                    <button onClick={() => onReject(item.id)}>驳回</button>
                  </>
                )}
                {["审批通过", "付款失败"].includes(item.status) && (
                  <>
                    <button onClick={() => onPay(item.id, true)}>支付成功</button>
                    <button onClick={() => onPay(item.id, false)}>支付失败</button>
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

function ReimbursementTable({
  rows,
  onDetail,
  onEdit,
  onApprove,
  onReject
}: {
  rows: Reimbursement[];
  onDetail: (item: Reimbursement) => void;
  onEdit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>单据编号</Th>
          <Th>报销类型</Th>
          <Th>申请人</Th>
          <Th>营销事项</Th>
          <Th>报销合计</Th>
          <Th>本次冲销</Th>
          <Th>付款金额</Th>
          <Th>状态</Th>
          <Th>发票状态</Th>
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
            </Td>
            <Td>{item.title}</Td>
            <Td>{item.applicant}</Td>
            <Td>{item.matterName}</Td>
            <Td align="right">{formatMoney(item.reimbursementAmount)}</Td>
            <Td align="right">{formatMoney(item.offsetAmount)}</Td>
            <Td align="right">{formatMoney(item.paymentAmount)}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.invoiceStatus ?? "-"} />
            </Td>
            <Td>
              <InlineActions>
                {["草稿", "已驳回"].includes(item.status) && <button onClick={() => onEdit(item.id)}>编辑</button>}
                {item.status === "审批中" && (
                  <>
                    <button onClick={() => onApprove(item.id)}>审批通过</button>
                    <button onClick={() => onReject(item.id)}>驳回</button>
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

function LedgerTable({
  rows,
  onDetail,
  onReimburse,
  onRepay
}: {
  rows: AdvanceLedger[];
  onDetail: (item: AdvanceLedger) => void;
  onReimburse: (id: string) => void;
  onRepay: (item: AdvanceLedger) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>借款单号</Th>
          <Th>借款人</Th>
          <Th>营销事项</Th>
          <Th>借款总额</Th>
          <Th>已还款金额</Th>
          <Th>未还款金额</Th>
          <Th>还款进度</Th>
          <Th>完结状态</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id}>
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item)}>
                {item.sourceCode}
              </button>
            </Td>
            <Td>{item.borrower}</Td>
            <Td>{item.matterName}</Td>
            <Td align="right">{formatMoney(item.loanAmount)}</Td>
            <Td align="right">{formatMoney(item.repaidAmount)}</Td>
            <Td align="right" danger={item.outstandingAmount > 0}>
              {formatMoney(item.outstandingAmount)}
            </Td>
            <Td>
              <ProgressBar value={item.repaidAmount} total={item.loanAmount} />
            </Td>
            <Td>
              <StatusBadge status={item.closeStatus} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
            </Td>
            <Td>
              <InlineActions>
                {item.outstandingAmount > 0 && (
                  <>
                    <button onClick={() => onReimburse(item.id)}>发起报销</button>
                    <button onClick={() => onRepay(item)}>登记还款</button>
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

function AdvanceFormModal({
  form,
  errors,
  matters,
  submitting,
  onChange,
  onClose,
  onSaveDraft,
  onSubmit
}: {
  form: AdvanceFormState;
  errors: Record<string, string>;
  matters: MarketingMatter[];
  submitting: boolean;
  onChange: (patch: Partial<AdvanceFormState>) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const matter = matters.find((item) => item.id === form.matterId);
  return (
    <Modal title="营销备用金申请单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="申请信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required error={errors.applicant}>
              <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
            </Field>
            <Field label="申请人公司">
              <Input value={form.company} onChange={(value) => onChange({ company: value })} />
            </Field>
            <Field label="申请部门">
              <Input value={form.department} onChange={(value) => onChange({ department: value })} />
            </Field>
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Input value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} />
            </Field>
            <Field label="币种" required error={errors.currency}>
              <Select value={form.currency} onChange={(value) => onChange({ currency: value })} options={["CNY", "USD"]} />
            </Field>
            <Field label="建议支付日期">
              <Input value={form.suggestedPayAt} onChange={(value) => onChange({ suggestedPayAt: value })} />
            </Field>
          </div>
        </Section>

        <Section title="关联营销事项信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="关联营销事项" required error={errors.matterId}>
              <Select value={form.matterId} onChange={(value) => onChange({ matterId: value })} options={matters.map((item) => item.id)} labels={Object.fromEntries(matters.map((item) => [item.id, `${item.code} / ${item.name} / ${item.status}`]))} />
            </Field>
            <ReadOnly label="营销活动" value={matter?.activity} />
            <ReadOnly label="预算科目" value={matter?.budgetSubject} />
            <ReadOnly label="预算组织" value={matter?.budgetDepartment} />
            <ReadOnly label="申请可用金额" value={matter ? formatMoney(matter.availableAmount) : "-"} />
            <ReadOnly label="事项状态" value={<StatusBadge status={matter?.status ?? "-"} />} />
          </div>
        </Section>

        <Section title="申请及借款信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="本次借款金额" required error={errors.amount}>
              <Input value={form.amount} onChange={(value) => onChange({ amount: value })} placeholder="请输入金额" />
            </Field>
            <Field label="借款类型" required error={errors.loanType}>
              <Select value={form.loanType} onChange={(value) => onChange({ loanType: value })} options={["专项营销备用金", "临时垫资", "线下活动备用"]} />
            </Field>
            <Field label="预计还款日期">
              <Input value={addDays(form.suggestedPayAt || today, 10)} onChange={() => undefined} disabled />
            </Field>
            <Field label="借款说明">
              <Input value={form.summary} onChange={(value) => onChange({ summary: value })} />
            </Field>
          </div>
        </Section>

        <Section title="付款信息">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="收款方账号" required error={errors.payeeAccount}>
              <Input value={form.payeeAccount} onChange={(value) => onChange({ payeeAccount: value })} />
            </Field>
            <Field label="付款方账号" required error={errors.payerAccount}>
              <Input value={form.payerAccount} onChange={(value) => onChange({ payerAccount: value })} />
            </Field>
            <Field label="结算方式">
              <Select value={form.settlementMethod} onChange={(value) => onChange({ settlementMethod: value })} options={["银企直连", "网银转账", "现金备用"]} />
            </Field>
            <ReadOnly label="本次借款合计" value={formatMoney(Number(form.amount || 0))} />
          </div>
        </Section>

        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="secondary" onClick={onSaveDraft}>保存草稿</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "提交审批"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function ReimburseFormModal({
  form,
  errors,
  matters,
  ledgers,
  invoices,
  submitting,
  onChange,
  onClose,
  onSaveDraft,
  onSubmit
}: {
  form: ReimburseFormState;
  errors: Record<string, string>;
  matters: MarketingMatter[];
  ledgers: AdvanceLedger[];
  invoices: InvoiceOption[];
  submitting: boolean;
  onChange: (patch: Partial<ReimburseFormState>) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const matter = matters.find((item) => item.id === form.matterId);
  const ledger = ledgers.find((item) => item.id === form.ledgerId);
  const invoice = invoices.find((item) => item.id === form.invoiceId);
  const reimbursementAmount = Number(form.reimbursementAmount || 0);
  const offsetAmount = Number(form.offsetAmount || 0);
  const paymentAmount = reimbursementAmount - offsetAmount;
  return (
    <Modal title="营销备用金报销单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="费用信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="费用类型" required error={errors.expenseType}>
              <Select value={form.expenseType} onChange={(value) => onChange({ expenseType: value })} options={["内容制作费", "素材制作费", "达人样品寄送费", "线下活动物料费"]} />
            </Field>
            <Field label="业务日期">
              <Input value={form.businessDate} onChange={(value) => onChange({ businessDate: value })} />
            </Field>
            <Field label="报销合计" required error={errors.reimbursementAmount}>
              <Input value={form.reimbursementAmount} onChange={(value) => onChange({ reimbursementAmount: value })} />
            </Field>
            <ReadOnly label="不含税金额" value={formatMoney(invoice ? invoice.taxExcludedAmount : reimbursementAmount * 0.94)} />
            <ReadOnly label="税额" value={formatMoney(invoice ? invoice.taxAmount : reimbursementAmount * 0.06)} />
            <ReadOnly label="预算扣减金额" value={formatMoney(reimbursementAmount)} />
          </div>
        </Section>

        <Section title="事项申请及预算信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="关联营销事项" required error={errors.matterId}>
              <Select value={form.matterId} onChange={(value) => onChange({ matterId: value })} options={matters.map((item) => item.id)} labels={Object.fromEntries(matters.map((item) => [item.id, `${item.code} / ${item.name}`]))} />
            </Field>
            <ReadOnly label="营销活动" value={matter?.activity} />
            <ReadOnly label="预算科目" value={matter?.budgetSubject} />
            <ReadOnly label="预算组织" value={matter?.budgetDepartment} />
            <ReadOnly label="申请可用金额" value={matter ? formatMoney(matter.availableAmount) : "-"} />
            <ReadOnly label="事项状态" value={<StatusBadge status={matter?.status ?? "-"} />} />
          </div>
        </Section>

        <Section title="发票信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="发票号码">
              <Select value={form.invoiceId} onChange={(value) => onChange({ invoiceId: value })} options={["", ...invoices.map((item) => item.id)]} labels={{ "": "不选择发票", ...Object.fromEntries(invoices.map((item) => [item.id, `${item.invoiceNo} / ${formatMoney(item.amount)} / ${item.status}`])) }} />
            </Field>
            <ReadOnly label="发票类型" value={invoice?.invoiceType} />
            <ReadOnly label="查验状态" value={<StatusBadge status={invoice?.status ?? "-"} />} />
          </div>
        </Section>

        <Section title="备用金借款信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="借款单号" error={errors.ledgerId}>
              <Select value={form.ledgerId} onChange={(value) => onChange({ ledgerId: value, offsetAmount: value ? String(Math.min(ledgers.find((item) => item.id === value)?.outstandingAmount ?? 0, Number(form.reimbursementAmount || 0))) : "0" })} options={["", ...ledgers.filter((item) => item.outstandingAmount > 0).map((item) => item.id)]} labels={{ "": "无借款个人垫付", ...Object.fromEntries(ledgers.filter((item) => item.outstandingAmount > 0).map((item) => [item.id, `${item.sourceCode} / 未还 ${formatMoney(item.outstandingAmount)}`])) }} />
            </Field>
            <ReadOnly label="借款金额" value={ledger ? formatMoney(ledger.loanAmount) : "-"} />
            <ReadOnly label="未还款金额" value={ledger ? formatMoney(ledger.outstandingAmount) : "-"} />
            <Field label="本次冲销金额" error={errors.offsetAmount}>
              <Input value={form.offsetAmount} onChange={(value) => onChange({ offsetAmount: value })} />
            </Field>
            <ReadOnly label="剩余应付金额" value={<span className={paymentAmount < 0 ? "text-red-600" : ""}>{formatMoney(paymentAmount)}</span>} />
            <ReadOnly label="冲销结果" value={paymentAmount === 0 ? "全额冲销，无需付款" : paymentAmount > 0 ? "部分冲销，差额付款" : "金额异常"} />
          </div>
        </Section>

        {paymentAmount > 0 && (
          <Section title="付款信息">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="摘要">
                <Input value={form.paymentSummary} onChange={(value) => onChange({ paymentSummary: value })} />
              </Field>
              <Field label="预计支付日期">
                <Input value={form.expectedPayAt} onChange={(value) => onChange({ expectedPayAt: value })} />
              </Field>
              <Field label="收款方账号" required error={errors.payeeAccount}>
                <Input value={form.payeeAccount} onChange={(value) => onChange({ payeeAccount: value })} />
              </Field>
              <Field label="付款方账号">
                <Input value={form.payerAccount} onChange={(value) => onChange({ payerAccount: value })} />
              </Field>
            </div>
          </Section>
        )}

        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="secondary" onClick={onSaveDraft}>保存草稿</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "提交中..." : "提交审批"}</Button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function RepaymentModal({
  ledger,
  amount,
  error,
  onAmount,
  onClose,
  onConfirm
}: {
  ledger: AdvanceLedger;
  amount: string;
  error?: string;
  onAmount: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="营销备用金还款申请" onClose={onClose} size="md">
      <div className="space-y-4">
        <Section title="借款信息">
          <div className="grid gap-3 md:grid-cols-2">
            <ReadOnly label="借款单号" value={ledger.sourceCode} />
            <ReadOnly label="借款人" value={ledger.borrower} />
            <ReadOnly label="借款金额" value={formatMoney(ledger.loanAmount)} />
            <ReadOnly label="未还款金额" value={formatMoney(ledger.outstandingAmount)} />
          </div>
        </Section>
        <Section title="还款信息">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="本次还款金额" required error={error}>
              <Input value={amount} onChange={onAmount} />
            </Field>
            <ReadOnly label="还款日期" value={today} />
            <ReadOnly label="还款方式" value="线下转账登记" />
            <ReadOnly label="还款账户" value={ledger.payeeAccount} />
          </div>
        </Section>
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={onConfirm}>提交并审批通过</Button>
        </ModalActions>
      </div>
    </Modal>
  );
}

function ApplicationDetail({ item }: { item: AdvanceApplication }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{item.failureReason}</div>}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["单据编号", item.code],
            ["本次借款合计", formatMoney(item.amount)],
            ["单据状态", <StatusBadge key="status" status={item.status} />],
            ["付款状态", <StatusBadge key="pay" status={item.paymentStatus} />],
            ["凭证号", item.voucherNo],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />]
          ]}
        />
      </Section>
      <Section title="基础信息">
        <DetailGrid
          rows={[
            ["申请人", item.applicant],
            ["申请部门", item.department],
            ["核算主体", item.accountingEntity],
            ["申请日期", item.createdAt],
            ["建议支付日期", item.suggestedPayAt],
            ["预计还款日期", item.expectedRepayAt]
          ]}
        />
      </Section>
      <Section title="借款与付款信息">
        <DetailGrid
          rows={[
            ["营销事项", `${item.matterCode} / ${item.matterName}`],
            ["营销活动", item.activity],
            ["预算科目", item.budgetSubject],
            ["借款类型", item.loanType],
            ["收款方账号", item.payeeAccount],
            ["付款方账号", item.payerAccount]
          ]}
        />
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function ReimbursementDetail({ item }: { item: Reimbursement }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{item.failureReason}</div>}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["单据编号", item.code],
            ["单据名称", item.title],
            ["报销合计", formatMoney(item.reimbursementAmount)],
            ["本次冲销", formatMoney(item.offsetAmount)],
            ["付款金额", formatMoney(item.paymentAmount)],
            ["状态", <StatusBadge key="status" status={item.status} />],
            ["凭证号", item.voucherNo],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />]
          ]}
        />
      </Section>
      <Section title="费用与发票信息">
        <DetailGrid
          rows={[
            ["费用类型", item.expenseType],
            ["业务日期", item.businessDate],
            ["不含税金额", formatMoney(item.taxExcludedAmount)],
            ["税额", formatMoney(item.taxAmount)],
            ["发票号码", item.invoiceNo ?? "-"],
            ["发票状态", <StatusBadge key="invoice" status={item.invoiceStatus ?? "-"} />]
          ]}
        />
      </Section>
      <Section title="关联信息">
        <DetailGrid
          rows={[
            ["营销事项", `${item.matterCode} / ${item.matterName}`],
            ["营销活动", item.activity],
            ["预算科目", item.budgetSubject],
            ["借款单号", item.loanCode ?? "-"],
            ["借款未还金额", item.loanOutstandingAmount ? formatMoney(item.loanOutstandingAmount) : "-"],
            ["付款状态", <StatusBadge key="pay" status={item.paymentStatus} />]
          ]}
        />
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function LedgerDetail({ item }: { item: AdvanceLedger }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{item.failureReason}</div>}
      <Section title="金额摘要">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadOnly label="借款总额" value={formatMoney(item.loanAmount)} />
          <ReadOnly label="还款中金额" value={formatMoney(item.repayingAmount)} />
          <ReadOnly label="已还款金额" value={formatMoney(item.repaidAmount)} />
          <ReadOnly label="未还款金额" value={formatMoney(item.outstandingAmount)} />
        </div>
      </Section>
      <Section title="台账信息">
        <DetailGrid
          rows={[
            ["借款单号", item.sourceCode],
            ["借款人", item.borrower],
            ["营销事项", `${item.matterCode} / ${item.matterName}`],
            ["营销活动", item.activity],
            ["预算科目", item.budgetSubject],
            ["完结状态", <StatusBadge key="close" status={item.closeStatus} />],
            ["付款状态", <StatusBadge key="pay" status={item.paymentStatus} />],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["最近同步时间", item.lastSyncAt],
            ["关联报销单", item.relatedReimbursements.join("、") || "-"]
          ]}
        />
      </Section>
      <Section title="CBS 支付日志">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>时间</Th>
                <Th>渠道</Th>
                <Th>流水号</Th>
                <Th>处理结果</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.paymentLogs.map((log) => (
                <tr key={log.id}>
                  <Td>{log.time}</Td>
                  <Td>{log.channel}</Td>
                  <Td>{log.serialNo}</Td>
                  <Td>{log.result}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  onQuery,
  onReset
}: {
  filters: { keyword: string; status: string; department: string };
  setFilters: (filters: { keyword: string; status: string; department: string }) => void;
  onQuery: () => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
      <Field label="关键词">
        <Input value={filters.keyword} onChange={(value) => setFilters({ ...filters, keyword: value })} placeholder="单号 / 事项 / 申请人" />
      </Field>
      <Field label="状态">
        <Select value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={["全部", "草稿", "审批中", "已驳回", "审批通过", "付款中", "已完成", "付款失败", "未还款", "部分还款", "还款中", "已完结", "同步失败"]} />
      </Field>
      <Field label="部门">
        <Select value={filters.department} onChange={(value) => setFilters({ ...filters, department: value })} options={["全部", "内容营销部", "品牌营销部", "电商运营部", "直播运营部", "渠道市场部"]} />
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
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="p-4">{children}</div>
      </aside>
    </div>
  );
}

function Modal({ title, children, onClose, size = "lg" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${size === "md" ? "max-w-2xl" : "max-w-5xl"}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">{children}</div>;
}

function EmptyState({ onReset, onCreate }: { onReset: () => void; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 text-center">
      <div className="text-lg font-semibold text-slate-700">您当前没有未完结的备用金记录</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选，或新建一笔备用金/报销单继续演示闭环。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button onClick={onCreate}>新建单据</Button>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-slate-800">{title}</h3>
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
    <label className="block text-sm">
      <div className="mb-1 text-slate-500">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}
      </div>
      {children}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </label>
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

function Input({ value, onChange, placeholder = "", disabled = false }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Select({ value, onChange, options, labels = {} }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  const normalized = options.includes(value) ? options : [value, ...options].filter(Boolean);
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)}>
      {Array.from(new Set(normalized)).map((option) => (
        <option key={option || "empty"} value={option}>
          {labels[option] ?? option}
        </option>
      ))}
    </select>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"} rounded-md font-medium ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children, align = "left", danger = false }: { children: ReactNode; align?: "left" | "right"; danger?: boolean }) {
  return (
    <td className={`max-w-56 truncate px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""} ${danger ? "font-medium text-red-600" : ""}`} title={typeof children === "string" ? children : undefined}>
      {children || "-"}
    </td>
  );
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-44 flex-wrap gap-2 text-sm text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    ["审批通过", "已完成", "已支付", "已完结", "同步成功", "查验通过", "无需付款", "已报销"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "付款中", "同步中", "报销中", "还款中"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["已驳回", "付款失败", "同步失败", "查验失败"].includes(status)
          ? "border-red-200 bg-red-50 text-red-600"
          : ["部分还款", "待查验", "使用中"].includes(status)
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const ratio = total > 0 ? value / total : 0;
  const widthClass = ratio >= 1 ? "w-full" : ratio >= 0.75 ? "w-3/4" : ratio >= 0.5 ? "w-1/2" : ratio >= 0.25 ? "w-1/4" : ratio > 0 ? "w-1/6" : "w-0";
  return (
    <div className="w-32">
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full bg-blue-600 ${widthClass}`} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{Math.round(ratio * 100)}%</div>
    </div>
  );
}

function StepList({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={`${step.node}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-medium">{step.node}</span>
            <span className="text-slate-500">{step.date}</span>
          </div>
          <div className="mt-1 text-slate-600">{step.approver}：{step.comment}</div>
        </div>
      ))}
    </div>
  );
}

function filterApplications(rows: AdvanceApplication[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.applicant, item.matterName, item.activity, item.budgetSubject].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.paymentStatus, item.syncStatus) && matchFilter(item.department, filters.department);
  });
}

function filterReimbursements(rows: Reimbursement[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.title, item.applicant, item.matterName, item.expenseType, item.loanCode ?? ""].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.paymentStatus, item.invoiceStatus ?? "", item.syncStatus) && matchFilter(item.department, filters.department);
  });
}

function filterLedgers(rows: AdvanceLedger[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.sourceCode, item.borrower, item.matterName, item.activity, item.budgetSubject].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.closeStatus, filters.status, item.paymentStatus, item.syncStatus) && matchFilter(item.department, filters.department);
  });
}

function matchFilter(value: string, filter: string, ...alternates: string[]) {
  return filter === "全部" || value === filter || alternates.includes(filter);
}

function buildSteps(steps: ApprovalStep[], status: string, applicant: string, comment: string): ApprovalStep[] {
  const node = status === "草稿" ? "保存草稿" : status === "审批中" ? "申请人提交" : status === "已驳回" ? "财务 BP" : status === "已完成" ? "财务主管" : status;
  return [{ node, approver: status === "草稿" || status === "审批中" ? applicant : "林一", date: today, comment }, ...steps];
}

function formatMoney(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `CNY ${normalized.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "2026-05-16";
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "applications", label: "营销备用金申请单" },
  { key: "reimbursements", label: "营销备用金报销单" },
  { key: "ledger", label: "专项备用金台账" }
];
