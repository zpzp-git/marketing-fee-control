"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type ViewMode = "workbench" | "payables" | "prepayments" | "adBalances" | "adDetails" | "applications";
type DocumentStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "待付款" | "支付中" | "支付成功" | "支付失败" | "已完成" | "已重付";
type PayableStatus = "待付款" | "付款中" | "部分付款" | "已付款" | "已关闭";
type WriteoffStatus = "未核销" | "核销中" | "部分核销" | "已核销";
type ArrivedInvoiceStatus = "否" | "到票中" | "部分到票" | "是";
type RechargeStatus = "待充值" | "充值中" | "充值成功" | "存在差异" | "已退款";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type ApplicationKind = "对公付款" | "对公预付款" | "投放充值" | "投放退款" | "退票重付";

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

interface SupplierAccount {
  supplier: string;
  accountName: string;
  bankName: string;
  branchName: string;
  accountNo: string;
}

interface ContractOption {
  code: string;
  name: string;
  type: "框架合同" | "非框架合同" | "平台协议";
  supplier: string;
  accountingEntity: string;
  marketingPlan: string;
  paymentStage: string;
  paymentAmount: number;
  paymentRatio: string;
  paymentPoint: string;
  expectedPayDate: string;
}

interface MarketingMatterOption {
  code: string;
  plan: string;
  activity: string;
  planCategory: string;
  department: string;
  budgetSubject: string;
  amount: number;
  store: string;
  channel: string;
  status: string;
}

interface NoInvoiceOption {
  code: string;
  contractCode: string;
  contractName: string;
  amount: number;
  availableAmount: number;
  supplier: string;
}

interface SupplierPayableLedger {
  id: string;
  code: string;
  documentName: string;
  contractCode: string;
  contractName: string;
  accountingEntity: string;
  supplier: string;
  payableDate: string;
  payableAmount: number;
  verifyingAmount: number;
  paidAmount: number;
  settlementNo: string;
  invoiceWriteoffNo: string;
  applicantDepartment: string;
  creator: string;
  activity: string;
  expenseType: string;
  expenseMinor: string;
  status: PayableStatus;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface SupplierPrepaymentLedger {
  id: string;
  code: string;
  accountingEntity: string;
  supplier: string;
  contractName: string;
  contractCode: string;
  prepaidAmount: number;
  verifyingAmount: number;
  writtenOffAmount: number;
  writeoffStatus: WriteoffStatus;
  arrivedInvoice: ArrivedInvoiceStatus;
  applicantDepartment: string;
  createdFrom: string;
  createdAt: string;
  logs: OperationLog[];
}

interface AdAccountBalanceLedger {
  id: string;
  code: string;
  platform: string;
  accountingEntity: string;
  accountName: string;
  accountId: string;
  brand: string;
  supplier: string;
  protocolCode: string;
  prepaidTotal: number;
  actualConsume: number;
  rechargeBalance: number;
  cashBalance: number;
  refundAmount: number;
  invoicedAmount: number;
  uninvoicedAmount: number;
  status: RechargeStatus;
  logs: OperationLog[];
}

interface AdRechargeDetailLedger {
  id: string;
  code: string;
  applicationCode: string;
  accountName: string;
  accountId: string;
  platform: string;
  accountingEntity: string;
  activity: string;
  rechargeAmount: number;
  actualPaymentAmount: number;
  differenceAmount: number;
  hadDifference: boolean;
  approvalStatus: DocumentStatus;
  createdAt: string;
}

interface PaymentApplication {
  id: string;
  code: string;
  kind: ApplicationKind;
  title: string;
  applicant: string;
  applicantCompany: string;
  applicantDepartment: string;
  applicantPosition: string;
  applyDate: string;
  accountingEntity: string;
  supplier: string;
  contractCode?: string;
  contractName?: string;
  settlementNo?: string;
  sourceLedgerId?: string;
  sourceCode?: string;
  amount: number;
  status: DocumentStatus;
  voucherNo: string;
  paymentSuggestionNo: string;
  paymentMethod: string;
  payerAccount: string;
  payeeAccount: string;
  expectedPayDate: string;
  actualPayDate: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  description: string;
  approvals: ApprovalRecord[];
  logs: OperationLog[];
}

interface PaymentFilters {
  keyword: string;
  accountingEntity: string;
  supplier: string;
  status: string;
}

interface PrepaymentFilters {
  keyword: string;
  accountingEntity: string;
  supplier: string;
  writeoffStatus: string;
  arrivedInvoice: string;
}

interface AdFilters {
  keyword: string;
  platform: string;
  accountingEntity: string;
  supplier: string;
  status: string;
}

interface ApplicationFilters {
  keyword: string;
  kind: string;
  status: string;
}

interface CorporatePaymentForm {
  code: string;
  status: "草稿" | "审批中" | "审批通过" | "支付中" | "支付失败" | "支付成功";
  sourceLedgerId: string;
  applicant: string;
  accountingEntity: string;
  supplier: string;
  hasContract: "是" | "否";
  noInvoice: "是" | "否";
  invoiceWrittenOff: "是" | "否";
  contractCode: string;
  settlementNo: string;
  invoiceWriteoffNo: string;
  marketingMatterCode: string;
  noInvoiceCode: string;
  prepaymentLedgerId: string;
  paymentAmount: string;
  prepaymentWriteoffAmount: string;
  summary: string;
  payerAccount: string;
  payeeAccount: string;
  paymentMethod: string;
  expectedPayDate: string;
  description: string;
  attachmentName: string;
  createdApplicationId?: string;
}

interface PrepaymentForm {
  code: string;
  status: "草稿" | "审批中";
  applicant: string;
  accountingEntity: string;
  supplier: string;
  hasContract: "是" | "否";
  contractCode: string;
  marketingMatterCode: string;
  amount: string;
  expectedPayDate: string;
  paymentMethod: string;
  payerAccount: string;
  payeeAccount: string;
  description: string;
  attachmentName: string;
  createdApplicationId?: string;
}

interface RechargeLineForm {
  id: string;
  balanceLedgerId: string;
  accountName: string;
  accountId: string;
  platform: string;
  activity: string;
  amount: string;
  expectedRechargeDate: string;
  paymentLink: string;
}

interface RechargeForm {
  code: string;
  status: "草稿" | "审批中";
  applicant: string;
  accountingEntity: string;
  supplier: string;
  protocolCode: string;
  lines: RechargeLineForm[];
  paymentSummary: string;
  payerAccount: string;
  paymentMethod: string;
  actualPaymentAmount: string;
  actualPayDate: string;
  description: string;
  createdApplicationId?: string;
}

interface RefundForm {
  code: string;
  status: "草稿" | "审批中";
  applicant: string;
  accountingEntity: string;
  reason: string;
  balanceLedgerId: string;
  amount: string;
  description: string;
}

interface RepaymentForm {
  code: string;
  status: "草稿" | "审批中";
  sourceApplicationId: string;
  reason: string;
  newPayeeName: string;
  newPayeeAccount: string;
  description: string;
  createdApplicationId?: string;
}

type DetailData =
  | { type: "payable"; row: SupplierPayableLedger }
  | { type: "prepayment"; row: SupplierPrepaymentLedger }
  | { type: "adBalance"; row: AdAccountBalanceLedger }
  | { type: "adDetail"; row: AdRechargeDetailLedger }
  | { type: "application"; row: PaymentApplication };

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const supplierAccounts: SupplierAccount[] = [
  { supplier: "上海拾光内容科技有限公司", accountName: "上海拾光内容科技有限公司", bankName: "招商银行上海静安支行", branchName: "静安支行", accountNo: "6225 8801 0001 2026" },
  { supplier: "杭州热浪直播服务有限公司", accountName: "杭州热浪直播服务有限公司", bankName: "建设银行杭州滨江支行", branchName: "滨江支行", accountNo: "3300 1608 0098 2026" },
  { supplier: "上海蓝杉广告有限公司", accountName: "上海蓝杉广告有限公司", bankName: "中国银行上海徐汇支行", branchName: "徐汇支行", accountNo: "4502 7788 0066 0518" },
  { supplier: "小红书蒲公英", accountName: "行吟信息科技（上海）有限公司", bankName: "招商银行上海分行营业部", branchName: "营业部", accountNo: "CBS-XHS-2026-520" },
  { supplier: "巨量引擎", accountName: "北京巨量引擎网络技术有限公司", bankName: "招商银行北京朝阳支行", branchName: "朝阳支行", accountNo: "CBS-DY-2026-618" },
  { supplier: "阿里妈妈", accountName: "阿里妈妈软件服务有限公司", bankName: "网商银行", branchName: "总行营业部", accountNo: "CBS-TM-2026-888" }
];

const contractOptions: ContractOption[] = [
  {
    code: "YXHT-2026-133",
    name: "小红书达人种草一口价合同",
    type: "非框架合同",
    supplier: "上海拾光内容科技有限公司",
    accountingEntity: "上海示例品牌管理有限公司",
    marketingPlan: "小红书 618 新品种草计划",
    paymentStage: "尾款",
    paymentAmount: 80000,
    paymentRatio: "40%",
    paymentPoint: "验收后 15 天",
    expectedPayDate: "2026-05-20"
  },
  {
    code: "YXHT-2026-301",
    name: "品牌年度内容传播框架合同",
    type: "框架合同",
    supplier: "上海蓝杉广告有限公司",
    accountingEntity: "上海示例品牌管理有限公司",
    marketingPlan: "品牌年度内容传播",
    paymentStage: "预付",
    paymentAmount: 50000,
    paymentRatio: "20%",
    paymentPoint: "合同生效后",
    expectedPayDate: "2026-05-12"
  },
  {
    code: "PTXY-2026-XHS-01",
    name: "小红书蒲公英平台开户协议",
    type: "平台协议",
    supplier: "小红书蒲公英",
    accountingEntity: "上海示例贸易有限公司",
    marketingPlan: "618 内容种草投放",
    paymentStage: "平台预充值",
    paymentAmount: 100000,
    paymentRatio: "100%",
    paymentPoint: "充值前",
    expectedPayDate: "2026-05-08"
  }
];

const marketingMatters: MarketingMatterOption[] = [
  { code: "YXSX-2026-041", plan: "618 内容种草计划", activity: "小红书达人新品种草", planCategory: "内容种草", department: "内容营销二部", budgetSubject: "达人合作费", amount: 46000, store: "小红书品牌号", channel: "小红书", status: "已审批" },
  { code: "YXSX-2026-057", plan: "华东快闪活动", activity: "上海商圈快闪", planCategory: "品牌活动", department: "品牌活动部", budgetSubject: "活动执行费", amount: 35000, store: "线下快闪", channel: "线下", status: "已审批" }
];

const noInvoiceOptions: NoInvoiceOption[] = [
  { code: "WPHX-2026-002", contractCode: "YXHT-2026-176", contractName: "平台服务费年度框架合同", amount: 45000, availableAmount: 45000, supplier: "阿里妈妈" }
];

const initialPayables: SupplierPayableLedger[] = [
  buildPayable({
    id: "payable-001",
    code: "YF-2026-0518-001",
    documentName: "618 达人投放结算",
    contractCode: "YXHT-2026-133",
    contractName: "小红书达人种草一口价合同",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海拾光内容科技有限公司",
    payableDate: "2026-05-20",
    payableAmount: 120000,
    paidAmount: 40000,
    settlementNo: "JS-2026-0518-001",
    invoiceWriteoffNo: "FPHX-2026-061",
    activity: "小红书达人新品种草",
    expenseMinor: "达人合作费",
    status: "部分付款"
  }),
  buildPayable({
    id: "payable-002",
    code: "YF-2026-0508-009",
    documentName: "直播坑位费结算",
    contractCode: "YXHT-2026-211",
    contractName: "抖音新品直播引流服务合同",
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "杭州热浪直播服务有限公司",
    payableDate: "2026-05-18",
    payableAmount: 98000,
    paidAmount: 0,
    settlementNo: "JS-2026-0508-009",
    invoiceWriteoffNo: "FPHX-2026-058",
    activity: "抖音新品直播专场",
    expenseMinor: "直播坑位费",
    status: "待付款"
  }),
  buildPayable({
    id: "payable-003",
    code: "YF-2026-0502-015",
    documentName: "品牌推广素材拍摄结算",
    contractCode: "YXHT-2026-188",
    contractName: "品牌年度内容传播合同",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海蓝杉广告有限公司",
    payableDate: "2026-05-16",
    payableAmount: 86000,
    paidAmount: 86000,
    settlementNo: "JS-2026-0502-015",
    invoiceWriteoffNo: "FPHX-2026-044",
    activity: "品牌年度内容传播",
    expenseMinor: "素材制作费",
    status: "已付款"
  }),
  buildPayable({
    id: "payable-004",
    code: "YF-2026-0504-006",
    documentName: "平台服务费无票付款样例",
    contractCode: "YXHT-2026-176",
    contractName: "平台服务费年度框架合同",
    accountingEntity: "上海示例贸易有限公司",
    supplier: "阿里妈妈",
    payableDate: "2026-05-16",
    payableAmount: 45000,
    paidAmount: 0,
    settlementNo: "JS-2026-0504-006",
    invoiceWriteoffNo: "-",
    activity: "天猫 618 信息流蓄水",
    expenseMinor: "平台服务费",
    status: "待付款",
    syncStatus: "同步失败",
    failureReason: "模拟 CBS 同步失败：供应商付款用途码缺失 [MOCK-CBS-422]。"
  }),
  buildPayable({
    id: "payable-005",
    code: "YF-2026-0429-012",
    documentName: "快手短视频投流结算",
    contractCode: "YXHT-2026-219",
    contractName: "快手投流年度协议",
    accountingEntity: "广州示例贸易有限公司",
    supplier: "巨量引擎",
    payableDate: "2026-05-10",
    payableAmount: 64000,
    paidAmount: 0,
    verifyingAmount: 20000,
    settlementNo: "JS-2026-0429-012",
    invoiceWriteoffNo: "FPHX-2026-052",
    activity: "快手新品短视频投流",
    expenseMinor: "信息流投放费",
    status: "付款中"
  })
];

const initialPrepayments: SupplierPrepaymentLedger[] = [
  {
    id: "prepay-001",
    code: "YFK-2026-018",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海蓝杉广告有限公司",
    contractName: "品牌年度内容传播框架合同",
    contractCode: "YXHT-2026-301",
    prepaidAmount: 50000,
    verifyingAmount: 0,
    writtenOffAmount: 0,
    writeoffStatus: "未核销",
    arrivedInvoice: "否",
    applicantDepartment: "品牌活动部",
    createdFrom: "DGYFK-2026-018",
    createdAt: "2026-04-28",
    logs: [{ time: "2026-04-28 15:30:00", operator: "系统模拟", action: "插入预付款台账", comment: "对公预付款审批通过后生成。" }]
  },
  {
    id: "prepay-002",
    code: "YFK-2026-019",
    accountingEntity: "杭州示例电子商务有限公司",
    supplier: "杭州热浪直播服务有限公司",
    contractName: "抖音新品直播引流服务合同",
    contractCode: "YXHT-2026-211",
    prepaidAmount: 60000,
    verifyingAmount: 10000,
    writtenOffAmount: 30000,
    writeoffStatus: "部分核销",
    arrivedInvoice: "部分到票",
    applicantDepartment: "直播运营部",
    createdFrom: "DGYFK-2026-012",
    createdAt: "2026-04-16",
    logs: [{ time: "2026-05-01 09:10:00", operator: "系统模拟", action: "付款单核销", comment: "已有 30,000.00 被对公付款单核销。" }]
  }
];

const initialAdBalances: AdAccountBalanceLedger[] = [
  {
    id: "adbal-001",
    code: "TFYE-2026-001",
    platform: "小红书",
    accountingEntity: "上海示例贸易有限公司",
    accountName: "小红书蒲公英-示例旗舰店",
    accountId: "XHS-PGY-8801",
    brand: "BluePeak",
    supplier: "小红书蒲公英",
    protocolCode: "PTXY-2026-XHS-01",
    prepaidTotal: 260000,
    actualConsume: 142000,
    rechargeBalance: 118000,
    cashBalance: 118000,
    refundAmount: 0,
    invoicedAmount: 160000,
    uninvoicedAmount: 100000,
    status: "充值成功",
    logs: [{ time: "2026-04-30 10:00:00", operator: "系统模拟", action: "资金流水回写", comment: "最近一次充值已回写余额。" }]
  },
  {
    id: "adbal-002",
    code: "TFYE-2026-002",
    platform: "抖音",
    accountingEntity: "上海示例贸易有限公司",
    accountName: "巨量千川-示例旗舰店-618",
    accountId: "QIANCHUAN-618-01",
    brand: "GlowFarm",
    supplier: "巨量引擎",
    protocolCode: "PTXY-2026-DY-02",
    prepaidTotal: 410000,
    actualConsume: 300000,
    rechargeBalance: 110000,
    cashBalance: 109800,
    refundAmount: 0,
    invoicedAmount: 260000,
    uninvoicedAmount: 150000,
    status: "存在差异",
    logs: [{ time: "2026-05-03 11:20:00", operator: "系统模拟", action: "充值差异", comment: "实际付款比申请金额少 200.00。" }]
  },
  {
    id: "adbal-003",
    code: "TFYE-2026-003",
    platform: "天猫",
    accountingEntity: "上海示例贸易有限公司",
    accountName: "阿里妈妈-直通车-旗舰店",
    accountId: "TM-ZTC-2026",
    brand: "BluePeak",
    supplier: "阿里妈妈",
    protocolCode: "PTXY-2026-TM-03",
    prepaidTotal: 180000,
    actualConsume: 172000,
    rechargeBalance: 8000,
    cashBalance: 8000,
    refundAmount: 0,
    invoicedAmount: 100000,
    uninvoicedAmount: 80000,
    status: "待充值",
    logs: [{ time: "2026-04-28 12:00:00", operator: "系统模拟", action: "余额查询", comment: "账户余额低于预警线，可发起充值。" }]
  }
];

const initialAdDetails: AdRechargeDetailLedger[] = [
  {
    id: "addetail-001",
    code: "TFMX-2026-021",
    applicationCode: "TFCZ-2026-021",
    accountName: "小红书蒲公英-示例旗舰店",
    accountId: "XHS-PGY-8801",
    platform: "小红书",
    accountingEntity: "上海示例贸易有限公司",
    activity: "小红书 618 内容种草",
    rechargeAmount: 100000,
    actualPaymentAmount: 100200,
    differenceAmount: 200,
    hadDifference: true,
    approvalStatus: "已完成",
    createdAt: "2026-05-03"
  },
  {
    id: "addetail-002",
    code: "TFMX-2026-020",
    applicationCode: "TFCZ-2026-020",
    accountName: "巨量千川-示例旗舰店-618",
    accountId: "QIANCHUAN-618-01",
    platform: "抖音",
    accountingEntity: "上海示例贸易有限公司",
    activity: "抖音 520 直播引流",
    rechargeAmount: 80000,
    actualPaymentAmount: 80000,
    differenceAmount: 0,
    hadDifference: false,
    approvalStatus: "已完成",
    createdAt: "2026-04-29"
  }
];

const initialApplications: PaymentApplication[] = [
  {
    id: "app-pay-001",
    code: "DGFK-2026-044",
    kind: "对公付款",
    title: "对公付款申请单",
    applicant: "王悦",
    applicantCompany: "上海示例品牌管理有限公司",
    applicantDepartment: "财务共享中心",
    applicantPosition: "费用会计",
    applyDate: "2026-05-04",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海拾光内容科技有限公司",
    contractCode: "YXHT-2026-133",
    contractName: "小红书达人种草一口价合同",
    settlementNo: "JS-2026-0518-001",
    sourceLedgerId: "payable-001",
    sourceCode: "YF-2026-0518-001",
    amount: 40000,
    status: "支付成功",
    voucherNo: "KD-202605-0011",
    paymentSuggestionNo: "ZFJY-202605-0011",
    paymentMethod: "招行 CBS",
    payerAccount: "上海示例品牌管理有限公司 1001",
    payeeAccount: "6225 8801 0001 2026",
    expectedPayDate: "2026-05-05",
    actualPayDate: "2026-05-05",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 13:00:00",
    description: "首笔付款已完成。",
    approvals: [{ node: "财务负责人", approver: "林一", date: "2026-05-05", result: "通过", comment: "付款资料完整。" }],
    logs: [{ time: "2026-05-05 13:00:00", operator: "系统模拟", action: "银行回单回写", comment: "支付成功，凭证已生成。" }]
  },
  {
    id: "app-pay-002",
    code: "DGFK-2026-045",
    kind: "对公付款",
    title: "对公付款申请单",
    applicant: "王悦",
    applicantCompany: "上海示例品牌管理有限公司",
    applicantDepartment: "财务共享中心",
    applicantPosition: "费用会计",
    applyDate: "2026-05-06",
    accountingEntity: "上海示例品牌管理有限公司",
    supplier: "上海拾光内容科技有限公司",
    contractCode: "YXHT-2026-133",
    contractName: "小红书达人种草一口价合同",
    settlementNo: "JS-2026-0518-001",
    sourceLedgerId: "payable-001",
    sourceCode: "YF-2026-0518-001",
    amount: 80000,
    status: "支付失败",
    voucherNo: "-",
    paymentSuggestionNo: "ZFJY-202605-0019",
    paymentMethod: "招行 CBS",
    payerAccount: "上海示例品牌管理有限公司 1001",
    payeeAccount: "6225 8801 0001 9999",
    expectedPayDate: today,
    actualPayDate: "-",
    syncStatus: "同步失败",
    lastSyncAt: nowText,
    failureReason: "银行退票：收款账号已失效。",
    description: "用于演示退票重付。",
    approvals: [{ node: "财务负责人", approver: "林一", date: today, result: "通过", comment: "审批通过后银行退票。" }],
    logs: [{ time: nowText, operator: "银行 mock", action: "支付失败", comment: "收款账号已失效，可发起退票重付。" }]
  }
];

const initialPaymentFilters: PaymentFilters = { keyword: "", accountingEntity: "全部", supplier: "全部", status: "全部" };
const initialPrepaymentFilters: PrepaymentFilters = { keyword: "", accountingEntity: "全部", supplier: "全部", writeoffStatus: "全部", arrivedInvoice: "全部" };
const initialAdFilters: AdFilters = { keyword: "", platform: "全部", accountingEntity: "全部", supplier: "全部", status: "全部" };
const initialApplicationFilters: ApplicationFilters = { keyword: "", kind: "全部", status: "全部" };

export default function PaymentManagementPage() {
  const [view, setView] = useState<ViewMode>("workbench");
  const [payables, setPayables] = useState(initialPayables);
  const [prepayments, setPrepayments] = useState(initialPrepayments);
  const [adBalances, setAdBalances] = useState(initialAdBalances);
  const [adDetails, setAdDetails] = useState(initialAdDetails);
  const [applications, setApplications] = useState(initialApplications);
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilters>(initialPaymentFilters);
  const [prepaymentFilters, setPrepaymentFilters] = useState<PrepaymentFilters>(initialPrepaymentFilters);
  const [adFilters, setAdFilters] = useState<AdFilters>(initialAdFilters);
  const [applicationFilters, setApplicationFilters] = useState<ApplicationFilters>(initialApplicationFilters);
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [corporateForm, setCorporateForm] = useState<CorporatePaymentForm | null>(null);
  const [prepaymentForm, setPrepaymentForm] = useState<PrepaymentForm | null>(null);
  const [rechargeForm, setRechargeForm] = useState<RechargeForm | null>(null);
  const [refundForm, setRefundForm] = useState<RefundForm | null>(null);
  const [repaymentForm, setRepaymentForm] = useState<RepaymentForm | null>(null);
  const [receiptApplication, setReceiptApplication] = useState<PaymentApplication | null>(null);

  const suppliers = useMemo(() => unique(payables.map((item) => item.supplier).concat(prepayments.map((item) => item.supplier), adBalances.map((item) => item.supplier), applications.map((item) => item.supplier))), [adBalances, applications, payables, prepayments]);
  const accountingEntities = useMemo(() => unique(payables.map((item) => item.accountingEntity).concat(prepayments.map((item) => item.accountingEntity), adBalances.map((item) => item.accountingEntity), applications.map((item) => item.accountingEntity))), [adBalances, applications, payables, prepayments]);
  const platforms = useMemo(() => unique(adBalances.map((item) => item.platform)), [adBalances]);
  const filteredPayables = useMemo(() => filterPayables(payables, paymentFilters), [payables, paymentFilters]);
  const filteredPrepayments = useMemo(() => filterPrepayments(prepayments, prepaymentFilters), [prepayments, prepaymentFilters]);
  const filteredAdBalances = useMemo(() => filterAdBalances(adBalances, adFilters), [adBalances, adFilters]);
  const filteredAdDetails = useMemo(() => filterAdDetails(adDetails, adFilters), [adDetails, adFilters]);
  const filteredApplications = useMemo(() => filterApplications(applications, applicationFilters), [applications, applicationFilters]);
  const failedApplications = useMemo(() => applications.filter((item) => item.status === "支付失败"), [applications]);
  const stats = useMemo(() => buildStats(payables, prepayments, adBalances, applications, adDetails), [adBalances, adDetails, applications, payables, prepayments]);

  const selectedCorporatePayable = corporateForm ? payables.find((item) => item.id === corporateForm.sourceLedgerId) : undefined;
  const selectedPrepaymentForWriteoff = corporateForm?.prepaymentLedgerId ? prepayments.find((item) => item.id === corporateForm.prepaymentLedgerId) : undefined;
  const selectedContract = prepaymentForm?.contractCode ? contractOptions.find((item) => item.code === prepaymentForm.contractCode) : undefined;
  const selectedMatter = prepaymentForm?.marketingMatterCode ? marketingMatters.find((item) => item.code === prepaymentForm.marketingMatterCode) : undefined;
  const rechargeTotal = rechargeForm ? sum(rechargeForm.lines.map((line) => Number(line.amount || 0))) : 0;
  const rechargeDifference = rechargeForm ? Number(rechargeForm.actualPaymentAmount || 0) - rechargeTotal : 0;
  const selectedRefundBalance = refundForm ? adBalances.find((item) => item.id === refundForm.balanceLedgerId) : undefined;
  const selectedRepaymentSource = repaymentForm ? applications.find((item) => item.id === repaymentForm.sourceApplicationId) : undefined;

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
    setPaymentFilters(initialPaymentFilters);
    setPrepaymentFilters(initialPrepaymentFilters);
    setAdFilters(initialAdFilters);
    setApplicationFilters(initialApplicationFilters);
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 420);
  }

  function retryMockSync() {
    setPageError("");
    setPayables((rows) => rows.map((row) => row.syncStatus === "同步失败" ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText, logs: [{ time: nowText, operator: "系统模拟", action: "重试同步 CBS", comment: "已模拟补齐付款用途码并同步成功。" }, ...row.logs] } : row));
    setApplications((rows) => rows.map((row) => row.syncStatus === "同步失败" && row.status !== "支付失败" ? { ...row, syncStatus: "同步成功", failureReason: undefined, lastSyncAt: nowText } : row));
    showToast("已模拟重试 CBS / 金蝶同步，失败记录恢复为同步成功。");
  }

  function exportMock() {
    showToast("已模拟生成导出任务，可在演示下载中心查看。");
  }

  function openCorporatePayment(source?: SupplierPayableLedger) {
    const target = source ?? payables.find((item) => payableBalance(item) > 0) ?? payables[0];
    const payee = findSupplierAccount(target.supplier);
    setErrors({});
    setCorporateForm({
      code: `DGFK-2026-${String(applications.length + 50).padStart(3, "0")}`,
      status: "草稿",
      sourceLedgerId: target.id,
      applicant: "王悦",
      accountingEntity: target.accountingEntity,
      supplier: target.supplier,
      hasContract: "是",
      noInvoice: target.invoiceWriteoffNo === "-" ? "是" : "否",
      invoiceWrittenOff: target.invoiceWriteoffNo === "-" ? "否" : "是",
      contractCode: target.contractCode,
      settlementNo: target.settlementNo,
      invoiceWriteoffNo: target.invoiceWriteoffNo,
      marketingMatterCode: "",
      noInvoiceCode: target.invoiceWriteoffNo === "-" ? noInvoiceOptions[0]?.code ?? "" : "",
      prepaymentLedgerId: "",
      paymentAmount: String(payableBalance(target)),
      prepaymentWriteoffAmount: "0",
      summary: `${target.contractCode} ${target.documentName} 对公付款`,
      payerAccount: `${target.accountingEntity} 1001`,
      payeeAccount: payee.accountNo,
      paymentMethod: "招行 CBS",
      expectedPayDate: today,
      description: "依据应付账款台账发起付款申请。",
      attachmentName: "付款依据与发票核销截图.pdf"
    });
  }

  function patchCorporateForm(patch: Partial<CorporatePaymentForm>) {
    setCorporateForm((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.sourceLedgerId && patch.sourceLedgerId !== current.sourceLedgerId) {
        const target = payables.find((item) => item.id === patch.sourceLedgerId);
        if (target) {
          const account = findSupplierAccount(target.supplier);
          next.accountingEntity = target.accountingEntity;
          next.supplier = target.supplier;
          next.contractCode = target.contractCode;
          next.settlementNo = target.settlementNo;
          next.invoiceWriteoffNo = target.invoiceWriteoffNo;
          next.paymentAmount = String(payableBalance(target));
          next.summary = `${target.contractCode} ${target.documentName} 对公付款`;
          next.payeeAccount = account.accountNo;
        }
      }
      if (patch.noInvoice === "是") next.invoiceWrittenOff = "否";
      if (patch.hasContract === "否") {
        next.noInvoice = "否";
        next.invoiceWrittenOff = "否";
        next.sourceLedgerId = "";
        next.contractCode = "";
        next.settlementNo = "";
        next.invoiceWriteoffNo = "";
      }
      return next;
    });
  }

  function submitCorporatePayment() {
    if (!corporateForm) return;
    const nextErrors = validateCorporatePayment(corporateForm, payables, prepayments);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const amount = Number(corporateForm.paymentAmount);
    const prepayWriteoff = Number(corporateForm.prepaymentWriteoffAmount || 0);
    setOverlayLoading("正在模拟提交 OA 审批，并更新应付/预付核销中金额");
    window.setTimeout(() => {
      let applicationId = corporateForm.createdApplicationId;
      const application = buildPaymentApplication({
        id: applicationId,
        code: corporateForm.code,
        kind: "对公付款",
        amount,
        status: "审批中",
        accountingEntity: corporateForm.accountingEntity,
        supplier: corporateForm.supplier,
        contractCode: corporateForm.contractCode,
        contractName: selectedCorporatePayable?.contractName,
        settlementNo: corporateForm.settlementNo,
        sourceLedgerId: corporateForm.sourceLedgerId,
        sourceCode: selectedCorporatePayable?.code,
        paymentMethod: corporateForm.paymentMethod,
        payerAccount: corporateForm.payerAccount,
        payeeAccount: corporateForm.payeeAccount,
        expectedPayDate: corporateForm.expectedPayDate,
        description: corporateForm.description,
        action: "提交 OA 审批"
      });
      applicationId = application.id;
      setApplications((rows) => upsertById(rows, application));
      if (corporateForm.sourceLedgerId) {
        setPayables((rows) =>
          rows.map((row) => row.id === corporateForm.sourceLedgerId ? { ...row, verifyingAmount: row.verifyingAmount + amount, status: "付款中", logs: [{ time: nowText, operator: corporateForm.applicant, action: "提交对公付款", comment: `${corporateForm.code} 提交审批，核销中金额增加 ${formatMoney(amount)}。` }, ...row.logs] } : row)
        );
      }
      if (corporateForm.prepaymentLedgerId && prepayWriteoff > 0) {
        setPrepayments((rows) => rows.map((row) => row.id === corporateForm.prepaymentLedgerId ? { ...row, verifyingAmount: row.verifyingAmount + prepayWriteoff, writeoffStatus: "核销中", logs: [{ time: nowText, operator: corporateForm.applicant, action: "提交预付核销", comment: `核销中金额增加 ${formatMoney(prepayWriteoff)}。` }, ...row.logs] } : row));
      }
      setCorporateForm({ ...corporateForm, status: "审批中", createdApplicationId: applicationId });
      setOverlayLoading("");
      showToast("已模拟提交 OA，应付台账核销中金额已增加。");
    }, 720);
  }

  function approveCorporatePayment() {
    if (!corporateForm?.createdApplicationId) return;
    setApplications((rows) => rows.map((row) => row.id === corporateForm.createdApplicationId ? addApplicationStep({ ...row, status: "审批通过" }, "财务负责人", "通过", "审批通过，进入待付款。") : row));
    setCorporateForm({ ...corporateForm, status: "审批通过" });
    showToast("已模拟财务审批通过，付款单进入待付款。");
  }

  function failCorporatePayment() {
    if (!corporateForm?.createdApplicationId) return;
    const reason = "模拟银行退票：收款账号银行代码错误。";
    setApplications((rows) => rows.map((row) => row.id === corporateForm.createdApplicationId ? { ...addApplicationStep(row, "银行 CBS", "退票", reason), status: "支付失败", syncStatus: "同步失败", failureReason: reason, lastSyncAt: nowText, paymentSuggestionNo: row.paymentSuggestionNo === "-" ? nextPaymentSuggestionNo(rows.length) : row.paymentSuggestionNo, logs: [{ time: nowText, operator: "银行 mock", action: "支付失败", comment: reason }, ...row.logs] } : row));
    if (corporateForm.sourceLedgerId) {
      const amount = Number(corporateForm.paymentAmount);
      setPayables((rows) => rows.map((row) => row.id === corporateForm.sourceLedgerId ? { ...row, verifyingAmount: Math.max(0, row.verifyingAmount - amount), status: payableBalance(row) > 0 ? "待付款" : row.status, logs: [{ time: nowText, operator: "银行 mock", action: "支付失败", comment: "已释放本次核销中金额，可发起退票重付。" }, ...row.logs] } : row));
    }
    setCorporateForm({ ...corporateForm, status: "支付失败" });
    showToast("已模拟支付失败，可在单据列表发起退票重付。");
  }

  function payCorporateSuccess() {
    if (!corporateForm?.createdApplicationId) return;
    const amount = Number(corporateForm.paymentAmount);
    const prepayWriteoff = Number(corporateForm.prepaymentWriteoffAmount || 0);
    const voucherNo = `KD-202605-${String(applications.length + 20).padStart(4, "0")}`;
    setOverlayLoading("正在模拟银行支付、生成凭证并回写付款台账");
    window.setTimeout(() => {
      setApplications((rows) => rows.map((row) => row.id === corporateForm.createdApplicationId ? { ...addApplicationStep(row, "出纳付款", "支付成功", `银行回单已回写，凭证 ${voucherNo} 已生成。`), status: "支付成功", voucherNo, paymentSuggestionNo: row.paymentSuggestionNo === "-" ? nextPaymentSuggestionNo(rows.length) : row.paymentSuggestionNo, actualPayDate: today, syncStatus: "同步成功", lastSyncAt: nowText, logs: [{ time: nowText, operator: "系统模拟", action: "银行回单回写", comment: `支付成功，凭证 ${voucherNo} 已同步金蝶。` }, ...row.logs] } : row));
      if (corporateForm.sourceLedgerId) {
        setPayables((rows) =>
          rows.map((row) => {
            if (row.id !== corporateForm.sourceLedgerId) return row;
            const nextPaid = row.paidAmount + amount;
            const nextVerifying = Math.max(0, row.verifyingAmount - amount);
            const nextBalance = Math.max(0, row.payableAmount - nextPaid - nextVerifying);
            return { ...row, paidAmount: nextPaid, verifyingAmount: nextVerifying, status: nextBalance <= 0 ? "已付款" : "部分付款", logs: [{ time: nowText, operator: "系统模拟", action: "付款成功", comment: `累计已付款增加 ${formatMoney(amount)}，应付余额已更新。` }, ...row.logs] };
          })
        );
      }
      if (corporateForm.prepaymentLedgerId && prepayWriteoff > 0) {
        setPrepayments((rows) =>
          rows.map((row) => {
            if (row.id !== corporateForm.prepaymentLedgerId) return row;
            const writtenOff = row.writtenOffAmount + prepayWriteoff;
            const verifying = Math.max(0, row.verifyingAmount - prepayWriteoff);
            return { ...row, verifyingAmount: verifying, writtenOffAmount: writtenOff, writeoffStatus: writtenOff >= row.prepaidAmount ? "已核销" : "部分核销", logs: [{ time: nowText, operator: "系统模拟", action: "预付款核销", comment: `已核销金额增加 ${formatMoney(prepayWriteoff)}。` }, ...row.logs] };
          })
        );
      }
      setCorporateForm(null);
      setOverlayLoading("");
      setView("payables");
      showToast(`支付成功，凭证 ${voucherNo} 已模拟回写。`);
    }, 900);
  }

  function openPrepaymentForm(contractCode?: string) {
    const contract = contractOptions.find((item) => item.code === contractCode) ?? contractOptions.find((item) => item.paymentStage === "预付") ?? contractOptions[0];
    const account = findSupplierAccount(contract.supplier);
    setErrors({});
    setPrepaymentForm({
      code: `DGYFK-2026-${String(applications.length + 30).padStart(3, "0")}`,
      status: "草稿",
      applicant: "沈岚",
      accountingEntity: contract.accountingEntity,
      supplier: contract.supplier,
      hasContract: "是",
      contractCode: contract.code,
      marketingMatterCode: "",
      amount: String(contract.paymentAmount),
      expectedPayDate: contract.expectedPayDate,
      paymentMethod: "网上银行",
      payerAccount: `${contract.accountingEntity} 1001`,
      payeeAccount: account.accountNo,
      description: "合同预付阶段付款申请。",
      attachmentName: "合同付款节点截图.pdf"
    });
  }

  function patchPrepaymentForm(patch: Partial<PrepaymentForm>) {
    setPrepaymentForm((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.contractCode) {
        const contract = contractOptions.find((item) => item.code === patch.contractCode);
        if (contract) {
          const account = findSupplierAccount(contract.supplier);
          next.accountingEntity = contract.accountingEntity;
          next.supplier = contract.supplier;
          next.amount = String(contract.paymentAmount);
          next.expectedPayDate = contract.expectedPayDate;
          next.payeeAccount = account.accountNo;
        }
      }
      if (patch.marketingMatterCode) {
        const matter = marketingMatters.find((item) => item.code === patch.marketingMatterCode);
        if (matter) {
          next.amount = String(Math.min(50000, matter.amount));
          next.expectedPayDate = "2026-05-12";
          next.description = `${matter.activity} 小额无合同预付款。`;
        }
      }
      if (patch.hasContract === "否") {
        next.contractCode = "";
        next.amount = "30000";
        next.attachmentName = "营销事项审批截图.pdf";
      }
      return next;
    });
  }

  function submitPrepayment() {
    if (!prepaymentForm) return;
    const nextErrors = validatePrepayment(prepaymentForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const amount = Number(prepaymentForm.amount);
    setOverlayLoading("正在模拟提交 OA，并更新合同履约区占用金额");
    window.setTimeout(() => {
      const application = buildPaymentApplication({
        id: prepaymentForm.createdApplicationId,
        code: prepaymentForm.code,
        kind: "对公预付款",
        amount,
        status: "审批中",
        accountingEntity: prepaymentForm.accountingEntity,
        supplier: prepaymentForm.supplier,
        contractCode: prepaymentForm.contractCode,
        contractName: selectedContract?.name,
        paymentMethod: prepaymentForm.paymentMethod,
        payerAccount: prepaymentForm.payerAccount,
        payeeAccount: prepaymentForm.payeeAccount,
        expectedPayDate: prepaymentForm.expectedPayDate,
        description: prepaymentForm.description,
        action: "提交 OA 审批，占用合同履约区"
      });
      setApplications((rows) => upsertById(rows, application));
      setPrepaymentForm({ ...prepaymentForm, status: "审批中", createdApplicationId: application.id });
      setOverlayLoading("");
      showToast("已模拟提交预付款审批，合同履约区占用金额增加。");
    }, 700);
  }

  function approvePrepayment() {
    if (!prepaymentForm?.createdApplicationId) return;
    const amount = Number(prepaymentForm.amount);
    const voucherNo = `KD-202605-${String(applications.length + 31).padStart(4, "0")}`;
    const contract = contractOptions.find((item) => item.code === prepaymentForm.contractCode);
    const matter = marketingMatters.find((item) => item.code === prepaymentForm.marketingMatterCode);
    setOverlayLoading("正在模拟预付款审批通过、付款成功并插入预付台账");
    window.setTimeout(() => {
      setApplications((rows) => rows.map((row) => row.id === prepaymentForm.createdApplicationId ? { ...addApplicationStep(row, "财务负责人", "通过", `预付款审批通过，凭证 ${voucherNo} 已生成。`), status: "支付成功", voucherNo, paymentSuggestionNo: nextPaymentSuggestionNo(rows.length), actualPayDate: today, syncStatus: "同步成功", lastSyncAt: nowText } : row));
      const ledger: SupplierPrepaymentLedger = {
        id: `prepay-${Date.now()}`,
        code: `YFK-2026-${String(prepayments.length + 21).padStart(3, "0")}`,
        accountingEntity: prepaymentForm.accountingEntity,
        supplier: prepaymentForm.supplier,
        contractName: contract?.name ?? matter?.activity ?? "无合同营销事项预付",
        contractCode: contract?.code ?? matter?.code ?? "-",
        prepaidAmount: amount,
        verifyingAmount: 0,
        writtenOffAmount: 0,
        writeoffStatus: "未核销",
        arrivedInvoice: "否",
        applicantDepartment: matter?.department ?? "品牌活动部",
        createdFrom: prepaymentForm.code,
        createdAt: today,
        logs: [{ time: nowText, operator: "系统模拟", action: "插入供应商预付款台账", comment: "审批通过后生成，后续可被对公付款单核销。" }]
      };
      setPrepayments((rows) => [ledger, ...rows]);
      setPrepaymentForm(null);
      setOverlayLoading("");
      setView("prepayments");
      showToast("预付款审批通过，已生成供应商预付款台账。");
    }, 820);
  }

  function openRechargeForm(balanceId?: string) {
    const balance = adBalances.find((item) => item.id === balanceId) ?? adBalances[0];
    const line = buildRechargeLine(balance, 100000);
    setErrors({});
    setRechargeForm({
      code: `TFCZ-2026-${String(applications.length + 25).padStart(3, "0")}`,
      status: "草稿",
      applicant: "陈晨",
      accountingEntity: balance.accountingEntity,
      supplier: balance.supplier,
      protocolCode: balance.protocolCode,
      lines: [line],
      paymentSummary: `${balance.platform}${balance.accountId}预充值`,
      payerAccount: `${balance.accountingEntity} 1001`,
      paymentMethod: "招行 CBS",
      actualPaymentAmount: line.amount,
      actualPayDate: today,
      description: "投放账户预充值，用于大促广告消耗。",
      createdApplicationId: undefined
    });
  }

  function patchRechargeLine(id: string, patch: Partial<RechargeLineForm>) {
    setRechargeForm((current) => {
      if (!current) return current;
      const lines = current.lines.map((line) => {
        if (line.id !== id) return line;
        const next = { ...line, ...patch };
        if (patch.balanceLedgerId) {
          const balance = adBalances.find((item) => item.id === patch.balanceLedgerId);
          if (balance) {
            next.accountName = balance.accountName;
            next.accountId = balance.accountId;
            next.platform = balance.platform;
            next.paymentLink = `https://mock.ad-platform.example/pay/${balance.accountId}`;
          }
        }
        return next;
      });
      const total = sum(lines.map((line) => Number(line.amount || 0)));
      return { ...current, lines, actualPaymentAmount: current.status === "草稿" ? String(total) : current.actualPaymentAmount };
    });
  }

  function addRechargeLine() {
    setRechargeForm((current) => {
      if (!current) return current;
      const nextBalance = adBalances.find((item) => !current.lines.some((line) => line.balanceLedgerId === item.id)) ?? adBalances[0];
      const lines = [...current.lines, buildRechargeLine(nextBalance, 50000)];
      return { ...current, lines, actualPaymentAmount: String(sum(lines.map((line) => Number(line.amount || 0)))) };
    });
  }

  function removeRechargeLine(id: string) {
    setRechargeForm((current) => {
      if (!current || current.lines.length <= 1) return current;
      const lines = current.lines.filter((line) => line.id !== id);
      return { ...current, lines, actualPaymentAmount: String(sum(lines.map((line) => Number(line.amount || 0)))) };
    });
  }

  function submitRecharge() {
    if (!rechargeForm) return;
    const nextErrors = validateRecharge(rechargeForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setOverlayLoading("正在模拟投放充值提交 OA 审批");
    window.setTimeout(() => {
      const total = sum(rechargeForm.lines.map((line) => Number(line.amount || 0)));
      const application = buildPaymentApplication({
        id: rechargeForm.createdApplicationId,
        code: rechargeForm.code,
        kind: "投放充值",
        amount: total,
        status: "审批中",
        accountingEntity: rechargeForm.accountingEntity,
        supplier: rechargeForm.supplier,
        contractCode: rechargeForm.protocolCode,
        paymentMethod: rechargeForm.paymentMethod,
        payerAccount: rechargeForm.payerAccount,
        payeeAccount: findSupplierAccount(rechargeForm.supplier).accountNo,
        expectedPayDate: today,
        description: rechargeForm.description,
        action: "提交投放充值审批"
      });
      setApplications((rows) => upsertById(rows, application));
      setRechargeForm({ ...rechargeForm, status: "审批中", createdApplicationId: application.id });
      setOverlayLoading("");
      showToast("已模拟提交投放充值审批，可由财务录入实际付款金额。");
    }, 680);
  }

  function approveRecharge() {
    if (!rechargeForm?.createdApplicationId) return;
    const total = sum(rechargeForm.lines.map((line) => Number(line.amount || 0)));
    const actual = Number(rechargeForm.actualPaymentAmount || 0);
    const diff = actual - total;
    const voucherNo = `KD-202605-${String(applications.length + 40).padStart(4, "0")}`;
    setOverlayLoading("正在模拟财务付款、平台余额回写和充值明细插入");
    window.setTimeout(() => {
      setApplications((rows) => rows.map((row) => row.id === rechargeForm.createdApplicationId ? { ...addApplicationStep(row, "财务付款", "通过", `实际付款 ${formatMoney(actual)}，充值差异 ${formatMoney(diff)}。`), status: diff === 0 ? "已完成" : "支付成功", amount: total, voucherNo, actualPayDate: rechargeForm.actualPayDate, syncStatus: "同步成功", lastSyncAt: nowText, paymentSuggestionNo: nextPaymentSuggestionNo(rows.length) } : row));
      setAdBalances((rows) =>
        rows.map((row) => {
          const lineTotal = sum(rechargeForm.lines.filter((line) => line.balanceLedgerId === row.id).map((line) => Number(line.amount || 0)));
          if (lineTotal <= 0) return row;
          const actualShare = total > 0 ? actual * (lineTotal / total) : lineTotal;
          const lineDiff = actualShare - lineTotal;
          return { ...row, prepaidTotal: row.prepaidTotal + lineTotal, rechargeBalance: row.rechargeBalance + lineTotal, cashBalance: row.cashBalance + actualShare, status: lineDiff === 0 ? "充值成功" : "存在差异", logs: [{ time: nowText, operator: "系统模拟", action: "投放平台余额更新", comment: `预充值增加 ${formatMoney(lineTotal)}，差异 ${formatMoney(lineDiff)}。` }, ...row.logs] };
        })
      );
      const newDetails = rechargeForm.lines.map((line, index): AdRechargeDetailLedger => {
        const lineAmount = Number(line.amount || 0);
        const actualShare = total > 0 ? actual * (lineAmount / total) : lineAmount;
        return {
          id: `addetail-${Date.now()}-${index}`,
          code: `TFMX-2026-${String(adDetails.length + index + 30).padStart(3, "0")}`,
          applicationCode: rechargeForm.code,
          accountName: line.accountName,
          accountId: line.accountId,
          platform: line.platform,
          accountingEntity: rechargeForm.accountingEntity,
          activity: line.activity,
          rechargeAmount: lineAmount,
          actualPaymentAmount: actualShare,
          differenceAmount: actualShare - lineAmount,
          hadDifference: Math.abs(actualShare - lineAmount) > 0.001,
          approvalStatus: "已完成",
          createdAt: today
        };
      });
      setAdDetails((rows) => [...newDetails, ...rows]);
      setRechargeForm(null);
      setOverlayLoading("");
      setView("adDetails");
      showToast("投放充值审批通过，余额台账和明细台账已更新。");
    }, 900);
  }

  function openRefundForm(balanceId?: string) {
    const balance = adBalances.find((item) => item.id === balanceId) ?? adBalances.find((item) => item.rechargeBalance > 0) ?? adBalances[0];
    setErrors({});
    setRefundForm({
      code: `TFTK-2026-${String(applications.length + 9).padStart(3, "0")}`,
      status: "草稿",
      applicant: "陈晨",
      accountingEntity: balance.accountingEntity,
      reason: "账户关闭",
      balanceLedgerId: balance.id,
      amount: String(Math.min(20000, balance.rechargeBalance)),
      description: "投放账户关闭，申请退回剩余充值余额。"
    });
  }

  function submitRefund() {
    if (!refundForm || !selectedRefundBalance) return;
    const amount = Number(refundForm.amount);
    const nextErrors: Record<string, string> = {};
    if (!refundForm.reason.trim()) nextErrors.reason = "请选择退款原因。";
    if (!amount || amount <= 0 || amount > selectedRefundBalance.rechargeBalance) nextErrors.amount = `退款金额必须大于 0 且不超过充值余额 ${formatMoney(selectedRefundBalance.rechargeBalance)}。`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setRefundForm({ ...refundForm, status: "审批中" });
    showToast("已模拟提交投放退款审批。");
  }

  function approveRefund() {
    if (!refundForm || !selectedRefundBalance) return;
    const amount = Number(refundForm.amount);
    const voucherNo = `KD-TK-202605-${String(applications.length + 10).padStart(4, "0")}`;
    setOverlayLoading("正在模拟退款审批通过并更新投放余额台账");
    window.setTimeout(() => {
      setAdBalances((rows) => rows.map((row) => row.id === refundForm.balanceLedgerId ? { ...row, rechargeBalance: Math.max(0, row.rechargeBalance - amount), cashBalance: Math.max(0, row.cashBalance - amount), refundAmount: row.refundAmount + amount, status: "已退款", logs: [{ time: nowText, operator: "系统模拟", action: "投放充值退款", comment: `退款金额增加 ${formatMoney(amount)}，凭证 ${voucherNo} 已生成。` }, ...row.logs] } : row));
      const application = buildPaymentApplication({
        code: refundForm.code,
        kind: "投放退款",
        amount,
        status: "已完成",
        accountingEntity: refundForm.accountingEntity,
        supplier: selectedRefundBalance.supplier,
        contractCode: selectedRefundBalance.protocolCode,
        paymentMethod: "退款入账",
        payerAccount: selectedRefundBalance.accountName,
        payeeAccount: `${selectedRefundBalance.accountingEntity} 1001`,
        expectedPayDate: today,
        description: refundForm.description,
        action: "退款审批通过"
      });
      setApplications((rows) => [{ ...application, voucherNo, actualPayDate: today }, ...rows]);
      setRefundForm(null);
      setOverlayLoading("");
      setView("adBalances");
      showToast("投放退款审批通过，余额台账退款金额已更新。");
    }, 760);
  }

  function openRepaymentForm(application?: PaymentApplication) {
    const source = application ?? failedApplications[0];
    if (!source) {
      showToast("暂无支付失败记录可发起退票重付。");
      return;
    }
    const account = findSupplierAccount(source.supplier);
    setErrors({});
    setRepaymentForm({
      code: `TPCF-2026-${String(applications.length + 6).padStart(3, "0")}`,
      status: "草稿",
      sourceApplicationId: source.id,
      reason: "银行退票，原收款账号已失效。",
      newPayeeName: account.accountName,
      newPayeeAccount: account.accountNo,
      description: "更换供应商最新银行账号后重新付款。"
    });
  }

  function submitRepayment() {
    if (!repaymentForm || !selectedRepaymentSource) return;
    const nextErrors: Record<string, string> = {};
    if (!repaymentForm.reason.trim()) nextErrors.reason = "请填写退票原因。";
    if (!repaymentForm.newPayeeAccount.trim()) nextErrors.newPayeeAccount = "请填写变更后收款账号。";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const application = buildPaymentApplication({
      id: repaymentForm.createdApplicationId,
      code: repaymentForm.code,
      kind: "退票重付",
      amount: selectedRepaymentSource.amount,
      status: "审批中",
      accountingEntity: selectedRepaymentSource.accountingEntity,
      supplier: selectedRepaymentSource.supplier,
      contractCode: selectedRepaymentSource.contractCode,
      contractName: selectedRepaymentSource.contractName,
      settlementNo: selectedRepaymentSource.settlementNo,
      sourceLedgerId: selectedRepaymentSource.sourceLedgerId,
      sourceCode: selectedRepaymentSource.code,
      paymentMethod: selectedRepaymentSource.paymentMethod,
      payerAccount: selectedRepaymentSource.payerAccount,
      payeeAccount: repaymentForm.newPayeeAccount,
      expectedPayDate: today,
      description: repaymentForm.description,
      action: "提交退票重付审批"
    });
    setApplications((rows) => upsertById(rows, application));
    setRepaymentForm({ ...repaymentForm, status: "审批中", createdApplicationId: application.id });
    showToast("已模拟提交退票重付审批。");
  }

  function approveRepayment() {
    if (!repaymentForm?.createdApplicationId || !selectedRepaymentSource) return;
    const voucherNo = `KD-CF-202605-${String(applications.length + 12).padStart(4, "0")}`;
    setOverlayLoading("正在模拟退票重付审批通过并重新支付");
    window.setTimeout(() => {
      setApplications((rows) =>
        rows.map((row) => {
          if (row.id === repaymentForm.createdApplicationId) {
            return { ...addApplicationStep(row, "出纳重付", "支付成功", `重付成功，凭证 ${voucherNo} 已生成。`), status: "支付成功", voucherNo, paymentSuggestionNo: nextPaymentSuggestionNo(rows.length), actualPayDate: today, syncStatus: "同步成功", lastSyncAt: nowText };
          }
          if (row.id === selectedRepaymentSource.id) {
            return { ...row, status: "已重付", logs: [{ time: nowText, operator: "系统模拟", action: "退票重付完成", comment: `${repaymentForm.code} 已支付成功，原失败记录关闭。` }, ...row.logs] };
          }
          return row;
        })
      );
      if (selectedRepaymentSource.sourceLedgerId) {
        setPayables((rows) =>
          rows.map((row) => {
            if (row.id !== selectedRepaymentSource.sourceLedgerId) return row;
            const nextPaid = Math.min(row.payableAmount, row.paidAmount + selectedRepaymentSource.amount);
            const nextBalance = Math.max(0, row.payableAmount - nextPaid - row.verifyingAmount);
            return { ...row, paidAmount: nextPaid, status: nextBalance <= 0 ? "已付款" : "部分付款", logs: [{ time: nowText, operator: "系统模拟", action: "退票重付成功", comment: `累计已付款增加 ${formatMoney(selectedRepaymentSource.amount)}。` }, ...row.logs] };
          })
        );
      }
      setRepaymentForm(null);
      setOverlayLoading("");
      setView("applications");
      showToast("退票重付已模拟成功，原支付失败记录变为已重付。");
    }, 850);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {overlayLoading && <LoadingMask full text={overlayLoading} />}
      {toast && <div className="fixed right-6 top-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}

      <div className="flex min-h-screen">
        <DemoModuleNav active="payment-management" title="付款管理" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm text-slate-500">费用申请与资金 / 付款管理</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">付款管理模块</h1>
            <p className="mt-1 text-sm text-slate-500">对公付款、供应商预付款、投放充值、退款与退票重付的 mock 演示闭环。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportMock}>模拟导出</Button>
            <Button variant="secondary" onClick={() => openRepaymentForm()}>退票重付</Button>
            <Button variant="secondary" onClick={() => openRechargeForm()}>投放充值</Button>
            <Button variant="secondary" onClick={() => openPrepaymentForm()}>对公预付款</Button>
            <Button onClick={() => openCorporatePayment()}>对公付款申请</Button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          {[
            ["workbench", "付款工作台"],
            ["payables", "供应商应付账款台账"],
            ["prepayments", "供应商预付款台账"],
            ["adBalances", "投放账户余额台账"],
            ["adDetails", "投放账户明细台账"],
            ["applications", "付款单据"]
          ].map(([key, label]) => (
            <button key={key} type="button" className={`rounded-md px-3 py-2 text-sm font-medium ${view === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => setView(key as ViewMode)}>
              {label}
            </button>
          ))}
        </nav>

        {pageError && (
          <Alert>
            {pageError}
            <button type="button" className="ml-3 font-medium underline" onClick={retryMockSync}>重试同步</button>
          </Alert>
        )}

        {view === "workbench" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {stats.map((item) => <SummaryCard key={item.label} label={item.label} value={item.value} sub={item.sub} />)}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Section title="待付款与待审批">
                <div className="overflow-x-auto">
                  <Table>
                    <thead className="bg-slate-50 text-left text-slate-600">
                      <tr><Th>单号</Th><Th>对象</Th><Th>金额</Th><Th>状态</Th><Th>操作</Th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm">
                      {applications.filter((item) => ["审批中", "审批通过", "待付款", "支付失败"].includes(item.status)).slice(0, 5).map((item) => (
                        <tr key={item.id}>
                          <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "application", row: item })}>{item.code}</button></Td>
                          <Td>{item.supplier}</Td>
                          <Td align="right">{formatMoney(item.amount)}</Td>
                          <Td><StatusBadge status={item.status} /></Td>
                          <Td>
                            <InlineActions>
                              {item.status === "支付失败" && <button onClick={() => openRepaymentForm(item)}>发起重付</button>}
                              <button onClick={() => setDetail({ type: "application", row: item })}>详情</button>
                            </InlineActions>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Section>
              <Section title="异常与差异">
                <div className="space-y-3">
                  {failedApplications.map((item) => (
                    <div key={item.id} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium text-red-700">{item.code} / {item.supplier}</div>
                        <Button size="sm" onClick={() => openRepaymentForm(item)}>发起退票重付</Button>
                      </div>
                      <div className="mt-1 text-red-600">{item.failureReason}</div>
                    </div>
                  ))}
                  {adDetails.filter((item) => item.hadDifference).slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
                      <div className="font-medium text-orange-700">{item.accountName} 存在充值差异</div>
                      <div className="mt-1 text-orange-600">申请 {formatMoney(item.rechargeAmount)}，实付 {formatMoney(item.actualPaymentAmount)}，差异 {formatMoney(item.differenceAmount)}。</div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        )}

        {view === "payables" && (
          <Section title="供应商应付账款台账" extra={<Button onClick={() => openCorporatePayment()}>发起对公付款</Button>}>
            <FilterGrid>
              <Field label="关键字"><Input value={paymentFilters.keyword} onChange={(value) => setPaymentFilters({ ...paymentFilters, keyword: value })} placeholder="单据编号 / 合同 / 结算单" /></Field>
              <Field label="核算主体"><Select value={paymentFilters.accountingEntity} onChange={(value) => setPaymentFilters({ ...paymentFilters, accountingEntity: value })} options={["全部", ...accountingEntities]} /></Field>
              <Field label="供应商"><Select value={paymentFilters.supplier} onChange={(value) => setPaymentFilters({ ...paymentFilters, supplier: value })} options={["全部", ...suppliers]} /></Field>
              <Field label="付款状态"><Select value={paymentFilters.status} onChange={(value) => setPaymentFilters({ ...paymentFilters, status: value })} options={["全部", "待付款", "付款中", "部分付款", "已付款", "已关闭"]} /></Field>
            </FilterGrid>
            <Toolbar onQuery={simulateQuery} onReset={resetFilters} onMockError={() => setPageError("模拟查询失败：CBS 应付池响应超时 [MOCK-504]。")} />
            <TableWrap loading={tableLoading}>
              {filteredPayables.length === 0 ? (
                <EmptyState title="暂无匹配的应付账款" description="可重置筛选，或从演示数据发起新的对公付款申请。" action="新建付款申请" onAction={() => openCorporatePayment()} onReset={resetFilters} />
              ) : (
                <Table>
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr><Th>单据编号</Th><Th>供应商</Th><Th>核算主体</Th><Th>合同编号</Th><Th>应付日期</Th><Th>应付金额</Th><Th>核销中</Th><Th>已付款</Th><Th>应付余额</Th><Th>状态</Th><Th>同步</Th><Th>操作</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredPayables.map((row) => (
                      <tr key={row.id}>
                        <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "payable", row })}>{row.code}</button><div className="text-xs text-slate-400">{row.documentName}</div></Td>
                        <Td>{row.supplier}</Td>
                        <Td>{row.accountingEntity}</Td>
                        <Td>{row.contractCode}</Td>
                        <Td>{row.payableDate}</Td>
                        <Td align="right">{formatMoney(row.payableAmount)}</Td>
                        <Td align="right">{formatMoney(row.verifyingAmount)}</Td>
                        <Td align="right">{formatMoney(row.paidAmount)}</Td>
                        <Td align="right"><span className="font-semibold">{formatMoney(payableBalance(row))}</span></Td>
                        <Td><StatusBadge status={row.status} /></Td>
                        <Td><StatusBadge status={row.syncStatus} />{row.failureReason && <div className="mt-1 max-w-48 text-xs text-red-500">{row.failureReason}</div>}</Td>
                        <Td>
                          <InlineActions>
                            {payableBalance(row) > 0 && <button onClick={() => openCorporatePayment(row)}>发起付款</button>}
                            <button onClick={() => setDetail({ type: "payable", row })}>详情</button>
                          </InlineActions>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrap>
          </Section>
        )}

        {view === "prepayments" && (
          <Section title="供应商预付款台账" extra={<Button onClick={() => openPrepaymentForm()}>新建对公预付款</Button>}>
            <FilterGrid>
              <Field label="关键字"><Input value={prepaymentFilters.keyword} onChange={(value) => setPrepaymentFilters({ ...prepaymentFilters, keyword: value })} placeholder="预付款单号 / 合同" /></Field>
              <Field label="核算主体"><Select value={prepaymentFilters.accountingEntity} onChange={(value) => setPrepaymentFilters({ ...prepaymentFilters, accountingEntity: value })} options={["全部", ...accountingEntities]} /></Field>
              <Field label="供应商"><Select value={prepaymentFilters.supplier} onChange={(value) => setPrepaymentFilters({ ...prepaymentFilters, supplier: value })} options={["全部", ...suppliers]} /></Field>
              <Field label="核销状态"><Select value={prepaymentFilters.writeoffStatus} onChange={(value) => setPrepaymentFilters({ ...prepaymentFilters, writeoffStatus: value })} options={["全部", "未核销", "核销中", "部分核销", "已核销"]} /></Field>
              <Field label="是否到票"><Select value={prepaymentFilters.arrivedInvoice} onChange={(value) => setPrepaymentFilters({ ...prepaymentFilters, arrivedInvoice: value })} options={["全部", "否", "到票中", "部分到票", "是"]} /></Field>
            </FilterGrid>
            <Toolbar onQuery={simulateQuery} onReset={resetFilters} onMockError={() => setPageError("模拟查询失败：预付款台账服务忙，请稍后重试。")} />
            <TableWrap loading={tableLoading}>
              {filteredPrepayments.length === 0 ? (
                <EmptyState title="暂无匹配的预付款" description="可新建对公预付款，审批通过后自动插入本台账。" action="新建预付款" onAction={() => openPrepaymentForm()} onReset={resetFilters} />
              ) : (
                <Table>
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr><Th>预付款单号</Th><Th>供应商</Th><Th>合同</Th><Th>预付总金额</Th><Th>核销中</Th><Th>已核销</Th><Th>未核销</Th><Th>核销状态</Th><Th>是否到票</Th><Th>操作</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredPrepayments.map((row) => (
                      <tr key={row.id}>
                        <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "prepayment", row })}>{row.code}</button></Td>
                        <Td>{row.supplier}</Td>
                        <Td>{row.contractCode}<div className="text-xs text-slate-400">{row.contractName}</div></Td>
                        <Td align="right">{formatMoney(row.prepaidAmount)}</Td>
                        <Td align="right">{formatMoney(row.verifyingAmount)}</Td>
                        <Td align="right">{formatMoney(row.writtenOffAmount)}</Td>
                        <Td align="right"><span className="font-semibold">{formatMoney(prepaymentUnused(row))}</span></Td>
                        <Td><StatusBadge status={row.writeoffStatus} /></Td>
                        <Td><StatusBadge status={row.arrivedInvoice} /></Td>
                        <Td><InlineActions><button onClick={() => openCorporatePayment()}>关联付款核销</button><button onClick={() => setDetail({ type: "prepayment", row })}>详情</button></InlineActions></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrap>
          </Section>
        )}

        {view === "adBalances" && (
          <Section title="投放账户余额台账" extra={<Button onClick={() => openRechargeForm()}>发起投放充值</Button>}>
            <FilterGrid>
              <Field label="关键字"><Input value={adFilters.keyword} onChange={(value) => setAdFilters({ ...adFilters, keyword: value })} placeholder="账户 / ID / 品牌" /></Field>
              <Field label="投放平台"><Select value={adFilters.platform} onChange={(value) => setAdFilters({ ...adFilters, platform: value })} options={["全部", ...platforms]} /></Field>
              <Field label="核算主体"><Select value={adFilters.accountingEntity} onChange={(value) => setAdFilters({ ...adFilters, accountingEntity: value })} options={["全部", ...accountingEntities]} /></Field>
              <Field label="供应商"><Select value={adFilters.supplier} onChange={(value) => setAdFilters({ ...adFilters, supplier: value })} options={["全部", ...suppliers]} /></Field>
              <Field label="状态"><Select value={adFilters.status} onChange={(value) => setAdFilters({ ...adFilters, status: value })} options={["全部", "待充值", "充值中", "充值成功", "存在差异", "已退款"]} /></Field>
            </FilterGrid>
            <Toolbar onQuery={simulateQuery} onReset={resetFilters} onMockError={() => setPageError("模拟查询失败：广告平台余额回写延迟。")} />
            <TableWrap loading={tableLoading}>
              {filteredAdBalances.length === 0 ? (
                <EmptyState title="暂无匹配的投放账户余额" description="可重置筛选，或选择账户发起投放充值。" action="发起投放充值" onAction={() => openRechargeForm()} onReset={resetFilters} />
              ) : (
                <Table>
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr><Th>投放账户</Th><Th>平台</Th><Th>供应商</Th><Th>预充值总额</Th><Th>实际消耗</Th><Th>充值余额</Th><Th>现金余额</Th><Th>退款金额</Th><Th>到票/未到票</Th><Th>状态</Th><Th>操作</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredAdBalances.map((row) => (
                      <tr key={row.id}>
                        <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "adBalance", row })}>{row.accountName}</button><div className="text-xs text-slate-400">{row.accountId}</div></Td>
                        <Td>{row.platform}</Td>
                        <Td>{row.supplier}</Td>
                        <Td align="right">{formatMoney(row.prepaidTotal)}</Td>
                        <Td align="right">{formatMoney(row.actualConsume)}</Td>
                        <Td align="right"><span className="font-semibold">{formatMoney(row.rechargeBalance)}</span></Td>
                        <Td align="right">{formatMoney(row.cashBalance)}</Td>
                        <Td align="right">{formatMoney(row.refundAmount)}</Td>
                        <Td>{formatMoney(row.invoicedAmount)}<div className="text-xs text-slate-400">{formatMoney(row.uninvoicedAmount)}</div></Td>
                        <Td><StatusBadge status={row.status} /></Td>
                        <Td><InlineActions><button onClick={() => openRechargeForm(row.id)}>充值</button><button onClick={() => openRefundForm(row.id)}>退款</button><button onClick={() => setDetail({ type: "adBalance", row })}>详情</button></InlineActions></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrap>
          </Section>
        )}

        {view === "adDetails" && (
          <Section title="投放账户明细台账" extra={<Button variant="secondary" onClick={exportMock}>模拟导出</Button>}>
            <FilterGrid>
              <Field label="关键字"><Input value={adFilters.keyword} onChange={(value) => setAdFilters({ ...adFilters, keyword: value })} placeholder="申请单 / 账户 / 活动" /></Field>
              <Field label="投放平台"><Select value={adFilters.platform} onChange={(value) => setAdFilters({ ...adFilters, platform: value })} options={["全部", ...platforms]} /></Field>
              <Field label="核算主体"><Select value={adFilters.accountingEntity} onChange={(value) => setAdFilters({ ...adFilters, accountingEntity: value })} options={["全部", ...accountingEntities]} /></Field>
            </FilterGrid>
            <Toolbar onQuery={simulateQuery} onReset={resetFilters} onMockError={() => setPageError("模拟查询失败：投放明细台账暂不可用。")} />
            <TableWrap loading={tableLoading}>
              {filteredAdDetails.length === 0 ? (
                <EmptyState title="暂无匹配的充值明细" description="投放充值审批通过后会自动插入明细台账。" action="发起投放充值" onAction={() => openRechargeForm()} onReset={resetFilters} />
              ) : (
                <Table>
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr><Th>明细单号</Th><Th>申请单</Th><Th>账户</Th><Th>平台</Th><Th>营销活动</Th><Th>充值金额</Th><Th>实际付款</Th><Th>差异金额</Th><Th>差异</Th><Th>审批状态</Th><Th>操作</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredAdDetails.map((row) => (
                      <tr key={row.id}>
                        <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "adDetail", row })}>{row.code}</button></Td>
                        <Td>{row.applicationCode}</Td>
                        <Td>{row.accountName}<div className="text-xs text-slate-400">{row.accountId}</div></Td>
                        <Td>{row.platform}</Td>
                        <Td>{row.activity}</Td>
                        <Td align="right">{formatMoney(row.rechargeAmount)}</Td>
                        <Td align="right">{formatMoney(row.actualPaymentAmount)}</Td>
                        <Td align="right"><span className={row.hadDifference ? "font-semibold text-orange-600" : ""}>{formatMoney(row.differenceAmount)}</span></Td>
                        <Td><StatusBadge status={row.hadDifference ? "存在差异" : "无差异"} /></Td>
                        <Td><StatusBadge status={row.approvalStatus} /></Td>
                        <Td><InlineActions><button onClick={() => setDetail({ type: "adDetail", row })}>详情</button></InlineActions></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrap>
          </Section>
        )}

        {view === "applications" && (
          <Section title="付款单据" extra={<Button variant="secondary" onClick={retryMockSync}>重试同步失败</Button>}>
            <FilterGrid>
              <Field label="关键字"><Input value={applicationFilters.keyword} onChange={(value) => setApplicationFilters({ ...applicationFilters, keyword: value })} placeholder="单号 / 供应商 / 说明" /></Field>
              <Field label="单据类型"><Select value={applicationFilters.kind} onChange={(value) => setApplicationFilters({ ...applicationFilters, kind: value })} options={["全部", "对公付款", "对公预付款", "投放充值", "投放退款", "退票重付"]} /></Field>
              <Field label="状态"><Select value={applicationFilters.status} onChange={(value) => setApplicationFilters({ ...applicationFilters, status: value })} options={["全部", "草稿", "审批中", "审批通过", "待付款", "支付成功", "支付失败", "已完成", "已重付"]} /></Field>
            </FilterGrid>
            <Toolbar onQuery={simulateQuery} onReset={resetFilters} onMockError={() => setPageError("模拟查询失败：OA 单据列表响应异常。")} />
            <TableWrap loading={tableLoading}>
              {filteredApplications.length === 0 ? (
                <EmptyState title="暂无匹配的付款单据" description="可通过对公付款、预付款或投放充值创建单据。" action="新建对公付款" onAction={() => openCorporatePayment()} onReset={resetFilters} />
              ) : (
                <Table>
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr><Th>单据编号</Th><Th>类型</Th><Th>供应商</Th><Th>金额</Th><Th>支付建议号</Th><Th>凭证号</Th><Th>支付日期</Th><Th>状态</Th><Th>同步</Th><Th>操作</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm">
                    {filteredApplications.map((row) => (
                      <tr key={row.id}>
                        <Td><button className="font-medium text-blue-600 hover:underline" onClick={() => setDetail({ type: "application", row })}>{row.code}</button><div className="text-xs text-slate-400">{row.title}</div></Td>
                        <Td>{row.kind}</Td>
                        <Td>{row.supplier}</Td>
                        <Td align="right">{formatMoney(row.amount)}</Td>
                        <Td>{row.paymentSuggestionNo}</Td>
                        <Td>{row.voucherNo}</Td>
                        <Td>{row.actualPayDate}</Td>
                        <Td><StatusBadge status={row.status} /></Td>
                        <Td><StatusBadge status={row.syncStatus} />{row.failureReason && <div className="mt-1 max-w-52 text-xs text-red-500">{row.failureReason}</div>}</Td>
                        <Td>
                          <InlineActions>
                            {row.status === "支付失败" && <button onClick={() => openRepaymentForm(row)}>发起重付</button>}
                            {row.status === "支付成功" && <button onClick={() => setReceiptApplication(row)}>回单</button>}
                            <button onClick={() => setDetail({ type: "application", row })}>详情</button>
                          </InlineActions>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableWrap>
          </Section>
        )}
          </div>

      {corporateForm && selectedCorporatePayable && (
        <Modal title="对公付款申请单" onClose={() => setCorporateForm(null)} size="xl">
          {corporateForm.status === "支付失败" && <Alert>支付失败：收款账号银行代码错误。可关闭弹窗后在付款单据列表发起退票重付。</Alert>}
          <div className="grid gap-4 lg:grid-cols-3">
            <Section title="主表区">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="单据编号"><Input value={corporateForm.code} onChange={() => undefined} disabled /></Field>
                <Field label="申请日期"><Input value={today} onChange={() => undefined} disabled /></Field>
                <Field label="核算主体" required error={errors.accountingEntity}><Select value={corporateForm.accountingEntity} onChange={(value) => patchCorporateForm({ accountingEntity: value })} options={accountingEntities} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="供应商" required><Input value={corporateForm.supplier} onChange={(value) => patchCorporateForm({ supplier: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="是否有合同"><Select value={corporateForm.hasContract} onChange={(value) => patchCorporateForm({ hasContract: value as "是" | "否" })} options={["是", "否"]} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="是否无票"><Select value={corporateForm.noInvoice} onChange={(value) => patchCorporateForm({ noInvoice: value as "是" | "否" })} options={["否", "是"]} disabled={corporateForm.status !== "草稿" || corporateForm.hasContract === "否"} /></Field>
                <Field label="是否已发票核销"><Select value={corporateForm.invoiceWrittenOff} onChange={(value) => patchCorporateForm({ invoiceWrittenOff: value as "是" | "否" })} options={["是", "否"]} disabled={corporateForm.status !== "草稿" || corporateForm.noInvoice === "是"} /></Field>
                <Field label="本次付款合计"><Input value={formatMoney(Number(corporateForm.paymentAmount || 0))} onChange={() => undefined} disabled /></Field>
              </div>
            </Section>
            <Section title="结算信息区">
              <div className="grid gap-3 md:grid-cols-2">
                {corporateForm.hasContract === "是" ? (
                  <>
                    <Field label="关联应付台账"><Select value={corporateForm.sourceLedgerId} onChange={(value) => patchCorporateForm({ sourceLedgerId: value })} options={payables.map((item) => item.id)} labels={Object.fromEntries(payables.map((item) => [item.id, `${item.code} / ${item.supplier} / ${formatMoney(payableBalance(item))}`]))} disabled={corporateForm.status !== "草稿"} /></Field>
                    <ReadOnly label="应付余额" value={formatMoney(payableBalance(selectedCorporatePayable))} />
                    <ReadOnly label="结算单号" value={corporateForm.settlementNo} />
                    <ReadOnly label="发票核销单号" value={corporateForm.invoiceWriteoffNo} />
                    <ReadOnly label="合同编号" value={corporateForm.contractCode} />
                    <ReadOnly label="费用小类" value={selectedCorporatePayable.expenseMinor} />
                    {corporateForm.noInvoice === "是" && <ReadOnly label="无票申请单号" value={corporateForm.noInvoiceCode || "WPHX-2026-002"} />}
                  </>
                ) : (
                  <>
                    <Field label="营销事项申请" required error={errors.marketingMatterCode}><Select value={corporateForm.marketingMatterCode} onChange={(value) => patchCorporateForm({ marketingMatterCode: value })} options={["", ...marketingMatters.map((item) => item.code)]} labels={Object.fromEntries(marketingMatters.map((item) => [item.code, `${item.code} / ${item.activity}`]))} disabled={corporateForm.status !== "草稿"} /></Field>
                    {marketingMatters.find((item) => item.code === corporateForm.marketingMatterCode) && <ReadOnly label="预算科目" value={marketingMatters.find((item) => item.code === corporateForm.marketingMatterCode)?.budgetSubject} />}
                  </>
                )}
                <Field label="本次付款金额" required error={errors.paymentAmount}><Input value={corporateForm.paymentAmount} onChange={(value) => patchCorporateForm({ paymentAmount: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="预付款核销金额" error={errors.prepaymentWriteoffAmount}><Input value={corporateForm.prepaymentWriteoffAmount} onChange={(value) => patchCorporateForm({ prepaymentWriteoffAmount: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="选择预付款台账"><Select value={corporateForm.prepaymentLedgerId} onChange={(value) => patchCorporateForm({ prepaymentLedgerId: value })} options={["", ...prepayments.filter((item) => item.supplier === corporateForm.supplier && prepaymentUnused(item) > 0).map((item) => item.id)]} labels={Object.fromEntries(prepayments.map((item) => [item.id, `${item.code} / 未核销 ${formatMoney(prepaymentUnused(item))}`]))} disabled={corporateForm.status !== "草稿"} /></Field>
                {selectedPrepaymentForWriteoff && <ReadOnly label="预付款未核销金额" value={formatMoney(prepaymentUnused(selectedPrepaymentForWriteoff))} />}
              </div>
            </Section>
            <Section title="付款信息">
              <div className="grid gap-3">
                <Field label="摘要" required><Input value={corporateForm.summary} onChange={(value) => patchCorporateForm({ summary: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="付款账号"><Input value={corporateForm.payerAccount} onChange={(value) => patchCorporateForm({ payerAccount: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="收款方账号"><Input value={corporateForm.payeeAccount} onChange={(value) => patchCorporateForm({ payeeAccount: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="付款方式"><Select value={corporateForm.paymentMethod} onChange={(value) => patchCorporateForm({ paymentMethod: value })} options={["招行 CBS", "网上银行", "线下付款"]} disabled={corporateForm.status !== "草稿"} /></Field>
                <Field label="建议支付日期"><Input value={corporateForm.expectedPayDate} onChange={(value) => patchCorporateForm({ expectedPayDate: value })} disabled={corporateForm.status !== "草稿"} /></Field>
                <ReadOnly label="支付方式" value={["招行 CBS", "网上银行"].includes(corporateForm.paymentMethod) ? "线上付款" : "线下付款"} />
              </div>
            </Section>
          </div>
          <Section title="付款凭条预览">
            <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm md:grid-cols-4">
              <ReadOnly label="付款方" value={corporateForm.payerAccount} />
              <ReadOnly label="收款方" value={`${findSupplierAccount(corporateForm.supplier).accountName} / ${corporateForm.payeeAccount}`} />
              <ReadOnly label="付款金额" value={formatMoney(Number(corporateForm.paymentAmount || 0))} />
              <ReadOnly label="模拟 CBS 状态" value={corporateForm.status === "草稿" ? "未提交" : corporateForm.status} />
            </div>
          </Section>
          <Section title="审批记录与附件">
            <DetailGrid rows={[["附件名称", corporateForm.attachmentName], ["申请人", `${corporateForm.applicant} / 财务共享中心`], ["说明", corporateForm.description]]} />
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setCorporateForm(null)}>关闭</Button>
            {corporateForm.status === "草稿" && <Button onClick={submitCorporatePayment}>提交审批</Button>}
            {corporateForm.status === "审批中" && <Button onClick={approveCorporatePayment}>模拟审批通过</Button>}
            {corporateForm.status === "审批通过" && <Button variant="secondary" onClick={failCorporatePayment}>模拟支付失败</Button>}
            {corporateForm.status === "审批通过" && <Button onClick={payCorporateSuccess}>模拟支付成功</Button>}
          </ModalActions>
        </Modal>
      )}

      {prepaymentForm && (
        <Modal title="对公预付款申请单" onClose={() => setPrepaymentForm(null)} size="xl">
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="主表区">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="单据编号"><Input value={prepaymentForm.code} onChange={() => undefined} disabled /></Field>
                <Field label="是否有合同"><Select value={prepaymentForm.hasContract} onChange={(value) => patchPrepaymentForm({ hasContract: value as "是" | "否" })} options={["是", "否"]} disabled={prepaymentForm.status !== "草稿"} /></Field>
                <Field label="核算主体" required><Select value={prepaymentForm.accountingEntity} onChange={(value) => patchPrepaymentForm({ accountingEntity: value })} options={accountingEntities} disabled={prepaymentForm.status !== "草稿"} /></Field>
                <Field label="供应商" required><Input value={prepaymentForm.supplier} onChange={(value) => patchPrepaymentForm({ supplier: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
                <Field label="预付总金额" required error={errors.amount}><Input value={prepaymentForm.amount} onChange={(value) => patchPrepaymentForm({ amount: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
                <Field label="期望付款时间"><Input value={prepaymentForm.expectedPayDate} onChange={(value) => patchPrepaymentForm({ expectedPayDate: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
              </div>
              {Number(prepaymentForm.amount || 0) > 50000 && prepaymentForm.hasContract === "否" && <Alert tone="orange">5 万以上预付款必须关联合同，当前表单会阻止提交。</Alert>}
            </Section>
            <Section title={prepaymentForm.hasContract === "是" ? "合同信息区" : "营销事项信息区"}>
              {prepaymentForm.hasContract === "是" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="合同编码" required error={errors.contractCode}><Select value={prepaymentForm.contractCode} onChange={(value) => patchPrepaymentForm({ contractCode: value })} options={contractOptions.map((item) => item.code)} labels={Object.fromEntries(contractOptions.map((item) => [item.code, `${item.code} / ${item.name}`]))} disabled={prepaymentForm.status !== "草稿"} /></Field>
                  <ReadOnly label="合同类型" value={selectedContract?.type} />
                  <ReadOnly label="合同名称" value={selectedContract?.name} />
                  <ReadOnly label="付款阶段" value={selectedContract?.paymentStage} />
                  <ReadOnly label="付款比例" value={selectedContract?.paymentRatio} />
                  <ReadOnly label="付款时点" value={selectedContract?.paymentPoint} />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="营销事项申请" required error={errors.marketingMatterCode}><Select value={prepaymentForm.marketingMatterCode} onChange={(value) => patchPrepaymentForm({ marketingMatterCode: value })} options={["", ...marketingMatters.map((item) => item.code)]} labels={Object.fromEntries(marketingMatters.map((item) => [item.code, `${item.code} / ${item.activity}`]))} disabled={prepaymentForm.status !== "草稿"} /></Field>
                  <ReadOnly label="营销活动" value={selectedMatter?.activity} />
                  <ReadOnly label="部门" value={selectedMatter?.department} />
                  <ReadOnly label="预算科目" value={selectedMatter?.budgetSubject} />
                  <ReadOnly label="营销活动金额" value={formatMoney(selectedMatter?.amount ?? 0)} />
                  <Field label="附件名称" required error={errors.attachmentName}><Input value={prepaymentForm.attachmentName} onChange={(value) => patchPrepaymentForm({ attachmentName: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
                </div>
              )}
            </Section>
          </div>
          <Section title="付款信息">
            <div className="grid gap-3 md:grid-cols-3">
              <ReadOnly label="摘要" value={prepaymentForm.hasContract === "是" ? `${prepaymentForm.contractCode} ${selectedContract?.name ?? ""} 预付款` : `${selectedMatter?.activity ?? "营销事项"} 预付款`} />
              <Field label="付款账号"><Input value={prepaymentForm.payerAccount} onChange={(value) => patchPrepaymentForm({ payerAccount: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
              <Field label="收款方账号"><Input value={prepaymentForm.payeeAccount} onChange={(value) => patchPrepaymentForm({ payeeAccount: value })} disabled={prepaymentForm.status !== "草稿"} /></Field>
              <Field label="付款方式"><Select value={prepaymentForm.paymentMethod} onChange={(value) => patchPrepaymentForm({ paymentMethod: value })} options={["网上银行", "招行 CBS", "线下付款"]} disabled={prepaymentForm.status !== "草稿"} /></Field>
              <ReadOnly label="付款类型" value="对公" />
              <ReadOnly label="支付方式" value={["招行 CBS", "网上银行"].includes(prepaymentForm.paymentMethod) ? "线上付款" : "线下付款"} />
            </div>
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setPrepaymentForm(null)}>关闭</Button>
            {prepaymentForm.status === "草稿" && <Button onClick={submitPrepayment}>提交审批</Button>}
            {prepaymentForm.status === "审批中" && <Button onClick={approvePrepayment}>模拟审批通过并付款</Button>}
          </ModalActions>
        </Modal>
      )}

      {rechargeForm && (
        <Modal title="投放账户充值申请单" onClose={() => setRechargeForm(null)} size="xl">
          <div className="grid gap-4 lg:grid-cols-3">
            <Section title="主表区">
              <div className="grid gap-3">
                <ReadOnly label="单据编号" value={rechargeForm.code} />
                <Field label="核算主体"><Select value={rechargeForm.accountingEntity} onChange={(value) => setRechargeForm({ ...rechargeForm, accountingEntity: value })} options={accountingEntities} disabled={rechargeForm.status !== "草稿"} /></Field>
                <Field label="供应商"><Input value={rechargeForm.supplier} onChange={(value) => setRechargeForm({ ...rechargeForm, supplier: value })} disabled={rechargeForm.status !== "草稿"} /></Field>
                <Field label="平台协议（虚拟合同）"><Select value={rechargeForm.protocolCode} onChange={(value) => setRechargeForm({ ...rechargeForm, protocolCode: value })} options={contractOptions.filter((item) => item.type === "平台协议").map((item) => item.code)} disabled={rechargeForm.status !== "草稿"} /></Field>
                <ReadOnly label="预充值总金额" value={formatMoney(rechargeTotal)} />
              </div>
            </Section>
            <Section title="财务付款区">
              <div className="grid gap-3">
                <Field label="摘要"><Input value={rechargeForm.paymentSummary} onChange={(value) => setRechargeForm({ ...rechargeForm, paymentSummary: value })} disabled={rechargeForm.status === "审批中"} /></Field>
                <Field label="付款账号"><Input value={rechargeForm.payerAccount} onChange={(value) => setRechargeForm({ ...rechargeForm, payerAccount: value })} disabled={rechargeForm.status === "审批中"} /></Field>
                <Field label="付款方式"><Select value={rechargeForm.paymentMethod} onChange={(value) => setRechargeForm({ ...rechargeForm, paymentMethod: value })} options={["招行 CBS", "网上银行", "线下付款"]} disabled={rechargeForm.status === "审批中"} /></Field>
                <Field label="实际付款金额" error={errors.actualPaymentAmount}><Input value={rechargeForm.actualPaymentAmount} onChange={(value) => setRechargeForm({ ...rechargeForm, actualPaymentAmount: value })} /></Field>
                <ReadOnly label="充值差异金额" value={<span className={Math.abs(rechargeDifference) > 0.001 ? "text-orange-600" : ""}>{formatMoney(rechargeDifference)}</span>} />
                <Field label="实际支付日期"><Input value={rechargeForm.actualPayDate} onChange={(value) => setRechargeForm({ ...rechargeForm, actualPayDate: value })} /></Field>
              </div>
            </Section>
            <Section title="差异提示">
              {Math.abs(rechargeDifference) > 0.001 ? <Alert tone="orange">实际付款金额与充值金额合计不一致，审批通过后明细台账会标记“存在充值差异”。</Alert> : <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">当前无充值差异，审批后余额和明细将正常回写。</div>}
            </Section>
          </div>
          <Section title="投放账户信息区" extra={rechargeForm.status === "草稿" && <Button size="sm" variant="secondary" onClick={addRechargeLine}>增加账户</Button>}>
            <div className="overflow-x-auto">
              <Table>
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr><Th>投放账户</Th><Th>账户 ID</Th><Th>平台</Th><Th>营销活动</Th><Th>充值金额</Th><Th>预期充值日期</Th><Th>付款链接</Th><Th>操作</Th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-sm">
                  {rechargeForm.lines.map((line) => (
                    <tr key={line.id}>
                      <Td><CellSelect value={line.balanceLedgerId} onChange={(value) => patchRechargeLine(line.id, { balanceLedgerId: value })} options={adBalances.map((item) => item.id)} labels={Object.fromEntries(adBalances.map((item) => [item.id, item.accountName]))} disabled={rechargeForm.status !== "草稿"} /></Td>
                      <Td>{line.accountId}</Td>
                      <Td>{line.platform}</Td>
                      <Td><CellInput value={line.activity} onChange={(value) => patchRechargeLine(line.id, { activity: value })} disabled={rechargeForm.status !== "草稿"} /></Td>
                      <Td><CellInput value={line.amount} onChange={(value) => patchRechargeLine(line.id, { amount: value })} disabled={rechargeForm.status !== "草稿"} /></Td>
                      <Td><CellInput value={line.expectedRechargeDate} onChange={(value) => patchRechargeLine(line.id, { expectedRechargeDate: value })} disabled={rechargeForm.status !== "草稿"} /></Td>
                      <Td><CellInput value={line.paymentLink} onChange={(value) => patchRechargeLine(line.id, { paymentLink: value })} disabled={rechargeForm.status !== "草稿"} /></Td>
                      <Td>{rechargeForm.status === "草稿" && <button className="text-sm font-medium text-blue-600 hover:underline" onClick={() => removeRechargeLine(line.id)}>移除</button>}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {errors.lines && <div className="text-sm text-red-500">{errors.lines}</div>}
          </Section>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRechargeForm(null)}>关闭</Button>
            {rechargeForm.status === "草稿" && <Button onClick={submitRecharge}>提交审批</Button>}
            {rechargeForm.status === "审批中" && <Button onClick={approveRecharge}>财务付款并审批通过</Button>}
          </ModalActions>
        </Modal>
      )}

      {refundForm && selectedRefundBalance && (
        <Modal title="投放账户充值退款申请单" onClose={() => setRefundForm(null)}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="主表区">
              <div className="grid gap-3 md:grid-cols-2">
                <ReadOnly label="单据编号" value={refundForm.code} />
                <Field label="退款原因" required error={errors.reason}><Select value={refundForm.reason} onChange={(value) => setRefundForm({ ...refundForm, reason: value })} options={["充值账户错误", "账户关闭", "平台方原因"]} disabled={refundForm.status !== "草稿"} /></Field>
                <ReadOnly label="核算主体" value={refundForm.accountingEntity} />
                <Field label="说明"><Input value={refundForm.description} onChange={(value) => setRefundForm({ ...refundForm, description: value })} disabled={refundForm.status !== "草稿"} /></Field>
              </div>
            </Section>
            <Section title="充值信息区">
              <DetailGrid rows={[["投放账户名称", selectedRefundBalance.accountName], ["投放账户 ID", selectedRefundBalance.accountId], ["投放平台", selectedRefundBalance.platform], ["充值余额", formatMoney(selectedRefundBalance.rechargeBalance)]]} />
              <Field label="退款金额" required error={errors.amount}><Input value={refundForm.amount} onChange={(value) => setRefundForm({ ...refundForm, amount: value })} disabled={refundForm.status !== "草稿"} /></Field>
            </Section>
          </div>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRefundForm(null)}>关闭</Button>
            {refundForm.status === "草稿" && <Button onClick={submitRefund}>提交审批</Button>}
            {refundForm.status === "审批中" && <Button onClick={approveRefund}>模拟审批通过</Button>}
          </ModalActions>
        </Modal>
      )}

      {repaymentForm && selectedRepaymentSource && (
        <Modal title="退票重付申请单" onClose={() => setRepaymentForm(null)}>
          <Alert>原支付失败原因：{selectedRepaymentSource.failureReason}</Alert>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="原付款信息">
              <DetailGrid rows={[["原支付建议号", selectedRepaymentSource.paymentSuggestionNo], ["付款方式", selectedRepaymentSource.paymentMethod], ["原收款对象", selectedRepaymentSource.supplier], ["原收款账号", selectedRepaymentSource.payeeAccount], ["支付建议状态", selectedRepaymentSource.status], ["付款金额", formatMoney(selectedRepaymentSource.amount)]]} />
            </Section>
            <Section title="重付信息">
              <div className="grid gap-3">
                <ReadOnly label="重付单号" value={repaymentForm.code} />
                <Field label="退票原因" required error={errors.reason}><Input value={repaymentForm.reason} onChange={(value) => setRepaymentForm({ ...repaymentForm, reason: value })} disabled={repaymentForm.status !== "草稿"} /></Field>
                <Field label="变更后收款对象"><Input value={repaymentForm.newPayeeName} onChange={(value) => setRepaymentForm({ ...repaymentForm, newPayeeName: value })} disabled={repaymentForm.status !== "草稿"} /></Field>
                <Field label="变更后收款账号" required error={errors.newPayeeAccount}><Input value={repaymentForm.newPayeeAccount} onChange={(value) => setRepaymentForm({ ...repaymentForm, newPayeeAccount: value })} disabled={repaymentForm.status !== "草稿"} /></Field>
                <Field label="说明"><Input value={repaymentForm.description} onChange={(value) => setRepaymentForm({ ...repaymentForm, description: value })} disabled={repaymentForm.status !== "草稿"} /></Field>
              </div>
            </Section>
          </div>
          <ModalActions>
            <Button variant="secondary" onClick={() => setRepaymentForm(null)}>关闭</Button>
            {repaymentForm.status === "草稿" && <Button onClick={submitRepayment}>提交审批</Button>}
            {repaymentForm.status === "审批中" && <Button onClick={approveRepayment}>模拟重付成功</Button>}
          </ModalActions>
        </Modal>
      )}

      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} onReceipt={(row) => setReceiptApplication(row)} />}
      {receiptApplication && <ReceiptModal application={receiptApplication} onClose={() => setReceiptApplication(null)} />}
        </section>
      </div>
    </main>
  );
}

function buildPayable(input: Partial<SupplierPayableLedger> & Pick<SupplierPayableLedger, "id" | "code" | "documentName" | "contractCode" | "contractName" | "accountingEntity" | "supplier" | "payableDate" | "payableAmount" | "paidAmount" | "settlementNo" | "invoiceWriteoffNo" | "activity" | "expenseMinor" | "status">): SupplierPayableLedger {
  return {
    verifyingAmount: 0,
    applicantDepartment: "内容营销二部",
    creator: "王悦",
    expenseType: "营销费用",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 18:00:00",
    approvals: [{ node: "发票核销审批", approver: "林一", date: "2026-05-05", result: "通过", comment: "发票核销完成，写入应付池。" }],
    logs: [{ time: "2026-05-05 18:00:00", operator: "系统模拟", action: "插入应付台账", comment: "由发票核销或结算审批完成后生成。" }],
    ...input
  };
}

function buildPaymentApplication(input: {
  id?: string;
  code: string;
  kind: ApplicationKind;
  amount: number;
  status: DocumentStatus;
  accountingEntity: string;
  supplier: string;
  contractCode?: string;
  contractName?: string;
  settlementNo?: string;
  sourceLedgerId?: string;
  sourceCode?: string;
  paymentMethod: string;
  payerAccount: string;
  payeeAccount: string;
  expectedPayDate: string;
  description: string;
  action: string;
}): PaymentApplication {
  return {
    id: input.id ?? `app-${Date.now()}`,
    code: input.code,
    kind: input.kind,
    title: `${input.kind}申请单`,
    applicant: "王悦",
    applicantCompany: input.accountingEntity,
    applicantDepartment: "财务共享中心",
    applicantPosition: "费用会计",
    applyDate: today,
    accountingEntity: input.accountingEntity,
    supplier: input.supplier,
    contractCode: input.contractCode,
    contractName: input.contractName,
    settlementNo: input.settlementNo,
    sourceLedgerId: input.sourceLedgerId,
    sourceCode: input.sourceCode,
    amount: input.amount,
    status: input.status,
    voucherNo: "-",
    paymentSuggestionNo: "-",
    paymentMethod: input.paymentMethod,
    payerAccount: input.payerAccount,
    payeeAccount: input.payeeAccount,
    expectedPayDate: input.expectedPayDate,
    actualPayDate: "-",
    syncStatus: "未同步",
    lastSyncAt: "-",
    description: input.description,
    approvals: [{ node: "申请人提交", approver: "王悦", date: today, result: "提交", comment: input.action }],
    logs: [{ time: nowText, operator: "系统模拟", action: input.action, comment: "外部 OA/CBS/银行均为 mock 状态流转。" }]
  };
}

function addApplicationStep(row: PaymentApplication, node: string, result: string, comment: string) {
  return {
    ...row,
    approvals: [...row.approvals, { node, approver: node.includes("银行") || node.includes("出纳") ? "出纳 mock" : "林一", date: today, result, comment }],
    logs: [{ time: nowText, operator: "系统模拟", action: `${node}/${result}`, comment }, ...row.logs]
  };
}

function buildRechargeLine(balance: AdAccountBalanceLedger, amount: number): RechargeLineForm {
  return {
    id: `line-${Date.now()}-${balance.id}`,
    balanceLedgerId: balance.id,
    accountName: balance.accountName,
    accountId: balance.accountId,
    platform: balance.platform,
    activity: `${balance.platform} 618 预充值`,
    amount: String(amount),
    expectedRechargeDate: "2026-05-08",
    paymentLink: `https://mock.ad-platform.example/pay/${balance.accountId}`
  };
}

function validateCorporatePayment(form: CorporatePaymentForm, payables: SupplierPayableLedger[], prepayments: SupplierPrepaymentLedger[]) {
  const errors: Record<string, string> = {};
  const amount = Number(form.paymentAmount);
  const payable = payables.find((item) => item.id === form.sourceLedgerId);
  const prepayment = prepayments.find((item) => item.id === form.prepaymentLedgerId);
  const prepayAmount = Number(form.prepaymentWriteoffAmount || 0);
  if (!form.accountingEntity.trim()) errors.accountingEntity = "请选择核算主体。";
  if (!amount || amount <= 0) errors.paymentAmount = "本次付款金额必须大于 0。";
  if (form.hasContract === "是" && !payable) errors.sourceLedgerId = "请关联供应商应付账款台账。";
  if (payable && amount > payableBalance(payable)) errors.paymentAmount = `本次付款金额不能超过应付余额 ${formatMoney(payableBalance(payable))}。`;
  if (form.hasContract === "否" && !form.marketingMatterCode) errors.marketingMatterCode = "无合同付款必须关联营销事项申请或营销计划。";
  if (prepayAmount < 0) errors.prepaymentWriteoffAmount = "预付款核销金额不能小于 0。";
  if (prepayAmount > 0 && !prepayment) errors.prepaymentWriteoffAmount = "请选择预付款台账。";
  if (prepayment && prepayAmount > prepaymentUnused(prepayment)) errors.prepaymentWriteoffAmount = `核销金额不能超过未核销金额 ${formatMoney(prepaymentUnused(prepayment))}。`;
  return errors;
}

function validatePrepayment(form: PrepaymentForm) {
  const errors: Record<string, string> = {};
  const amount = Number(form.amount);
  if (!amount || amount <= 0) errors.amount = "预付总金额必须大于 0。";
  if (amount > 50000 && form.hasContract === "否") errors.amount = "5 万以上预付款必须关联合同。";
  if (form.hasContract === "是" && !form.contractCode) errors.contractCode = "请选择合同编码。";
  if (form.hasContract === "否" && !form.marketingMatterCode) errors.marketingMatterCode = "无合同预付款必须关联营销事项申请。";
  if (form.hasContract === "否" && !form.attachmentName.trim()) errors.attachmentName = "无合同营销事项预付必须补充附件名称。";
  return errors;
}

function validateRecharge(form: RechargeForm) {
  const errors: Record<string, string> = {};
  if (form.lines.length === 0) errors.lines = "请至少维护一条投放账户充值信息。";
  if (form.lines.some((line) => !line.balanceLedgerId || !Number(line.amount || 0) || Number(line.amount || 0) <= 0)) errors.lines = "投放账户和充值金额均为必填，金额必须大于 0。";
  if (!Number(form.actualPaymentAmount || 0) || Number(form.actualPaymentAmount || 0) <= 0) errors.actualPaymentAmount = "实际付款金额必须大于 0。";
  return errors;
}

function filterPayables(rows: SupplierPayableLedger[], filters: PaymentFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) =>
    (!keyword || [row.code, row.documentName, row.contractCode, row.supplier, row.settlementNo].some((value) => value.toLowerCase().includes(keyword))) &&
    (filters.accountingEntity === "全部" || row.accountingEntity === filters.accountingEntity) &&
    (filters.supplier === "全部" || row.supplier === filters.supplier) &&
    (filters.status === "全部" || row.status === filters.status)
  );
}

function filterPrepayments(rows: SupplierPrepaymentLedger[], filters: PrepaymentFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) =>
    (!keyword || [row.code, row.contractCode, row.contractName, row.supplier].some((value) => value.toLowerCase().includes(keyword))) &&
    (filters.accountingEntity === "全部" || row.accountingEntity === filters.accountingEntity) &&
    (filters.supplier === "全部" || row.supplier === filters.supplier) &&
    (filters.writeoffStatus === "全部" || row.writeoffStatus === filters.writeoffStatus) &&
    (filters.arrivedInvoice === "全部" || row.arrivedInvoice === filters.arrivedInvoice)
  );
}

function filterAdBalances(rows: AdAccountBalanceLedger[], filters: AdFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) =>
    (!keyword || [row.accountName, row.accountId, row.brand, row.supplier].some((value) => value.toLowerCase().includes(keyword))) &&
    (filters.platform === "全部" || row.platform === filters.platform) &&
    (filters.accountingEntity === "全部" || row.accountingEntity === filters.accountingEntity) &&
    (filters.supplier === "全部" || row.supplier === filters.supplier) &&
    (filters.status === "全部" || row.status === filters.status)
  );
}

function filterAdDetails(rows: AdRechargeDetailLedger[], filters: AdFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) =>
    (!keyword || [row.code, row.applicationCode, row.accountName, row.activity].some((value) => value.toLowerCase().includes(keyword))) &&
    (filters.platform === "全部" || row.platform === filters.platform) &&
    (filters.accountingEntity === "全部" || row.accountingEntity === filters.accountingEntity)
  );
}

function filterApplications(rows: PaymentApplication[], filters: ApplicationFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((row) =>
    (!keyword || [row.code, row.supplier, row.description, row.paymentSuggestionNo].some((value) => value.toLowerCase().includes(keyword))) &&
    (filters.kind === "全部" || row.kind === filters.kind) &&
    (filters.status === "全部" || row.status === filters.status)
  );
}

function buildStats(payables: SupplierPayableLedger[], prepayments: SupplierPrepaymentLedger[], balances: AdAccountBalanceLedger[], applications: PaymentApplication[], details: AdRechargeDetailLedger[]) {
  const payableBalanceTotal = sum(payables.map(payableBalance));
  return [
    { label: "待付款金额", value: formatMoney(payableBalanceTotal), sub: `${payables.filter((item) => payableBalance(item) > 0).length} 条应付余额` },
    { label: "预付未核销金额", value: formatMoney(sum(prepayments.map(prepaymentUnused))), sub: "供应商预付款池" },
    { label: "投放充值余额", value: formatMoney(sum(balances.map((item) => item.rechargeBalance))), sub: "含现金余额与平台余额" },
    { label: "支付失败数", value: `${applications.filter((item) => item.status === "支付失败").length}`, sub: "可发起退票重付" },
    { label: "充值差异金额", value: formatMoney(sum(details.map((item) => item.differenceAmount))), sub: `${details.filter((item) => item.hadDifference).length} 条差异明细` }
  ];
}

function findSupplierAccount(supplier: string) {
  return supplierAccounts.find((item) => item.supplier === supplier) ?? supplierAccounts[0];
}

function payableBalance(row: SupplierPayableLedger) {
  return Math.max(0, row.payableAmount - row.verifyingAmount - row.paidAmount);
}

function prepaymentUnused(row: SupplierPrepaymentLedger) {
  return Math.max(0, row.prepaidAmount - row.verifyingAmount - row.writtenOffAmount);
}

function upsertById<T extends { id: string }>(rows: T[], next: T) {
  return rows.some((row) => row.id === next.id) ? rows.map((row) => (row.id === next.id ? next : row)) : [next, ...rows];
}

function nextPaymentSuggestionNo(length: number) {
  return `ZFJY-202605-${String(length + 21).padStart(4, "0")}`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
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
  return <div className="flex min-w-32 flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-blue-600 [&_button:hover]:underline">{children}</div>;
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
      {normalized.map((option) => <option key={option || "empty"} value={option}>{labels?.[option] ?? (option || "请选择")}</option>)}
    </select>
  );
}

function CellInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <input className="h-8 w-40 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function CellSelect({ value, onChange, options, labels, disabled = false }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string>; disabled?: boolean }) {
  return (
    <select className="h-8 w-52 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}
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
    status.includes("失败") || status.includes("驳回")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("成功") || status.includes("完成") || status.includes("通过") || status.includes("已付款") || status === "是" || status.includes("重付")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("中") || status.includes("审批") || status.includes("部分") || status.includes("待付款")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("差异") || status.includes("否")
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
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

function FilterGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{children}</div>;
}

function Toolbar({ onQuery, onReset, onMockError }: { onQuery: () => void; onReset: () => void; onMockError: () => void }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
      <div className="text-xs text-slate-400">查询、导出、同步、银行付款均为前端 mock 行为。</div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onMockError}>模拟异常</Button>
        <Button variant="secondary" onClick={onReset}>重置</Button>
        <Button onClick={onQuery}>查询</Button>
      </div>
    </div>
  );
}

function TableWrap({ children, loading }: { children: ReactNode; loading: boolean }) {
  return <div className="relative overflow-x-auto rounded-lg border border-slate-200">{loading && <LoadingMask text="正在查询 mock 数据..." />}{children}</div>;
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
    <div className="flex min-h-64 flex-col items-center justify-center bg-slate-50 p-8 text-center">
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

function DetailModal({ detail, onClose, onReceipt }: { detail: DetailData; onClose: () => void; onReceipt: (row: PaymentApplication) => void }) {
  const titleMap = {
    payable: "供应商应付账款详情",
    prepayment: "供应商预付款详情",
    adBalance: "投放账户余额详情",
    adDetail: "投放账户明细详情",
    application: "付款单据详情"
  };
  return (
    <Modal title={titleMap[detail.type]} onClose={onClose}>
      {detail.type === "payable" && (
        <>
          <DetailGrid rows={[["单据编号", detail.row.code], ["单据名称", detail.row.documentName], ["供应商", detail.row.supplier], ["合同编号", detail.row.contractCode], ["结算单号", detail.row.settlementNo], ["应付日期", detail.row.payableDate], ["应付金额", formatMoney(detail.row.payableAmount)], ["核销中金额", formatMoney(detail.row.verifyingAmount)], ["累计已付款", formatMoney(detail.row.paidAmount)], ["应付余额", formatMoney(payableBalance(detail.row))], ["付款状态", <StatusBadge key="status" status={detail.row.status} />], ["同步状态", <StatusBadge key="sync" status={detail.row.syncStatus} />]]} />
          {detail.row.failureReason && <Alert>{detail.row.failureReason}</Alert>}
          <RecordList rows={detail.row.logs} />
        </>
      )}
      {detail.type === "prepayment" && (
        <>
          <DetailGrid rows={[["预付款单号", detail.row.code], ["供应商", detail.row.supplier], ["合同编号", detail.row.contractCode], ["合同名称", detail.row.contractName], ["预付总金额", formatMoney(detail.row.prepaidAmount)], ["核销中金额", formatMoney(detail.row.verifyingAmount)], ["已核销金额", formatMoney(detail.row.writtenOffAmount)], ["未核销金额", formatMoney(prepaymentUnused(detail.row))], ["核销状态", <StatusBadge key="writeoff" status={detail.row.writeoffStatus} />], ["是否到票", <StatusBadge key="invoice" status={detail.row.arrivedInvoice} />]]} />
          <RecordList rows={detail.row.logs} />
        </>
      )}
      {detail.type === "adBalance" && (
        <>
          <DetailGrid rows={[["投放账户", detail.row.accountName], ["投放账户 ID", detail.row.accountId], ["投放平台", detail.row.platform], ["供应商", detail.row.supplier], ["品牌", detail.row.brand], ["平台协议", detail.row.protocolCode], ["预充值总金额", formatMoney(detail.row.prepaidTotal)], ["实际消耗金额", formatMoney(detail.row.actualConsume)], ["充值余额", formatMoney(detail.row.rechargeBalance)], ["现金余额", formatMoney(detail.row.cashBalance)], ["退款金额", formatMoney(detail.row.refundAmount)], ["状态", <StatusBadge key="status" status={detail.row.status} />]]} />
          <RecordList rows={detail.row.logs} />
        </>
      )}
      {detail.type === "adDetail" && (
        <DetailGrid rows={[["明细单号", detail.row.code], ["申请单号", detail.row.applicationCode], ["投放账户", detail.row.accountName], ["投放账户 ID", detail.row.accountId], ["平台", detail.row.platform], ["营销活动", detail.row.activity], ["充值金额", formatMoney(detail.row.rechargeAmount)], ["实际付款金额", formatMoney(detail.row.actualPaymentAmount)], ["充值差异金额", formatMoney(detail.row.differenceAmount)], ["是否存在过充值差异", detail.row.hadDifference ? "是" : "否"], ["审批状态", <StatusBadge key="status" status={detail.row.approvalStatus} />]]} />
      )}
      {detail.type === "application" && (
        <>
          {detail.row.status === "支付失败" && <Alert>{detail.row.failureReason}</Alert>}
          <DetailGrid rows={[["单据编号", detail.row.code], ["单据类型", detail.row.kind], ["供应商", detail.row.supplier], ["核算主体", detail.row.accountingEntity], ["合同编号", detail.row.contractCode ?? "-"], ["结算单号", detail.row.settlementNo ?? "-"], ["付款金额", formatMoney(detail.row.amount)], ["付款方式", detail.row.paymentMethod], ["支付建议号", detail.row.paymentSuggestionNo], ["凭证号", detail.row.voucherNo], ["建议支付日期", detail.row.expectedPayDate], ["实际支付日期", detail.row.actualPayDate], ["状态", <StatusBadge key="status" status={detail.row.status} />], ["同步状态", <StatusBadge key="sync" status={detail.row.syncStatus} />]]} />
          <Section title="审批信息"><StepList steps={detail.row.approvals} /></Section>
          <Section title="操作日志"><RecordList rows={detail.row.logs} /></Section>
          {detail.row.status === "支付成功" && <ModalActions><Button onClick={() => onReceipt(detail.row)}>查看银行回单</Button></ModalActions>}
        </>
      )}
    </Modal>
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

function ReceiptModal({ application, onClose }: { application: PaymentApplication; onClose: () => void }) {
  return (
    <Modal title="银行回单模拟" onClose={onClose}>
      <div className="rounded-lg border border-slate-300 bg-slate-50 p-6">
        <div className="mb-4 flex items-center justify-between border-b border-slate-300 pb-3">
          <div>
            <div className="text-lg font-semibold">银行电子回单 MOCK</div>
            <div className="text-sm text-slate-500">招行 CBS 已受理，流水号：CBS-{application.paymentSuggestionNo}</div>
          </div>
          <StatusBadge status="支付成功" />
        </div>
        <DetailGrid rows={[["付款单号", application.code], ["支付建议号", application.paymentSuggestionNo], ["付款方账号", application.payerAccount], ["收款方账号", application.payeeAccount], ["收款方", application.supplier], ["交易金额", formatMoney(application.amount)], ["实际支付日期", application.actualPayDate], ["凭证号", application.voucherNo], ["用途", application.description]]} />
      </div>
      <ModalActions><Button onClick={onClose}>关闭</Button></ModalActions>
    </Modal>
  );
}
