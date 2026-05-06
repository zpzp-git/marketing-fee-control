"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

type ViewMode = "ledger" | "payments" | "returns";
type DepositType = "店铺保证金" | "营销推广保证金" | "合同保证金" | "付招投标保证金" | "退招投标保证金";
type LedgerClass = "平台类" | "非平台类";
type PaymentApplicationStatus = "草稿" | "审批中" | "已驳回" | "审批通过" | "付款中" | "付款成功" | "付款失败";
type ReturnApplicationStatus = "草稿" | "审批中" | "已驳回" | "待财务确认到账" | "已完成";
type LedgerStatus = "在保" | "退回中" | "部分退回" | "已全额退回" | "付款失败待处理";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface ContractOption {
  id: string;
  code: string;
  name: string;
  supplier: string;
  customer: string;
  amount: number;
  status: string;
}

interface StoreOption {
  id: string;
  name: string;
  platform: string;
  thirdAccount: string;
  accountingEntity: string;
  status: string;
}

interface AdAccountOption {
  id: string;
  platform: string;
  accountName: string;
  accountingEntity: string;
  status: string;
}

interface PaymentLine {
  id: string;
  summary: string;
  amount: number;
  paymentMethod: string;
  expectedPayAt: string;
  payee: string;
  payer: string;
  paymentType: string;
}

interface DepositPaymentApplication {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  createdAt: string;
  accountingEntity: string;
  depositType: DepositType;
  contractId?: string;
  contractCode?: string;
  supplier?: string;
  customer?: string;
  storeId?: string;
  store?: string;
  thirdAccount?: string;
  adPlatform?: string;
  adAccount?: string;
  expectedReturnAt: string;
  paymentLink: string;
  amount: number;
  description: string;
  attachmentName: string;
  voucherNo: string;
  status: PaymentApplicationStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  paymentLines: PaymentLine[];
  steps: ApprovalStep[];
}

interface DepositLedger {
  id: string;
  sourcePaymentId: string;
  sourcePaymentCode: string;
  code: string;
  title: string;
  createdAt: string;
  accountingEntity: string;
  department: string;
  depositType: DepositType;
  ledgerClass: LedgerClass;
  paymentMethod: string;
  totalAmount: number;
  returnedAmount: number;
  occupiedAmount: number;
  balanceAmount: number;
  expectedReturnAt: string;
  fullyReturned: boolean;
  status: LedgerStatus;
  contractCode?: string;
  supplier?: string;
  customer?: string;
  thirdAccount?: string;
  store?: string;
  adPlatform?: string;
  adAccount?: string;
  latestReturnCode: string;
  receiptStatus: string;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  description: string;
  paymentLogs: OperationRecord[];
  returnCodes: string[];
}

interface ReturnLine {
  id: string;
  ledgerId: string;
  ledgerCode: string;
  depositType: DepositType;
  adPlatform?: string;
  adAccount?: string;
  thirdAccount?: string;
  store?: string;
  balanceAmount: number;
  occupiedBefore: number;
  returnAmount: number;
}

interface DepositReturnApplication {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  createdAt: string;
  accountingEntity: string;
  depositType: Extract<DepositType, "店铺保证金" | "营销推广保证金">;
  voucherNo: string;
  receiptVoucherNo: string;
  description: string;
  totalReturnAmount: number;
  status: ReturnApplicationStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  lines: ReturnLine[];
  steps: ApprovalStep[];
}

interface OperationRecord {
  id: string;
  time: string;
  channel: string;
  serialNo: string;
  result: string;
}

interface PaymentFormState {
  editingId?: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  accountingEntity: string;
  depositType: DepositType;
  contractId: string;
  storeId: string;
  thirdAccount: string;
  adPlatform: string;
  adAccountId: string;
  expectedReturnAt: string;
  paymentLink: string;
  amount: string;
  description: string;
  attachmentName: string;
  payee: string;
  payer: string;
  paymentMethod: string;
  expectedPayAt: string;
}

interface ReturnFormState {
  editingId?: string;
  applicant: string;
  company: string;
  department: string;
  accountingEntity: string;
  depositType: Extract<DepositType, "店铺保证金" | "营销推广保证金">;
  description: string;
  lines: ReturnLine[];
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const contractOptions: ContractOption[] = [
  { id: "contract-001", code: "HTYX-2026-018", name: "天猫旗舰店 618 联合营销服务合同", supplier: "杭州星图营销服务有限公司", customer: "上海示例贸易有限公司", amount: 860000, status: "执行中" },
  { id: "contract-002", code: "HTYX-2026-021", name: "抖音品牌自播代运营合同", supplier: "北京云起传媒有限公司", customer: "上海示例贸易有限公司", amount: 1240000, status: "执行中" },
  { id: "contract-003", code: "HTYX-2026-025", name: "华南渠道快闪活动场地合同", supplier: "广州场景品牌管理有限公司", customer: "广州示例贸易有限公司", amount: 420000, status: "待归档" }
];

const storeOptions: StoreOption[] = [
  { id: "store-001", name: "天猫示例旗舰店", platform: "天猫", thirdAccount: "TP-天猫-示例旗舰店", accountingEntity: "上海示例贸易有限公司", status: "已启用" },
  { id: "store-002", name: "京东示例自营店", platform: "京东", thirdAccount: "TP-京东-自营结算户", accountingEntity: "上海示例贸易有限公司", status: "已启用" },
  { id: "store-003", name: "抖音示例品牌店", platform: "抖音电商", thirdAccount: "TP-抖音-品牌店", accountingEntity: "广州示例贸易有限公司", status: "已启用" }
];

const adAccountOptions: AdAccountOption[] = [
  { id: "ad-001", platform: "巨量千川", accountName: "巨量千川-示例旗舰店-618", accountingEntity: "上海示例贸易有限公司", status: "已启用" },
  { id: "ad-002", platform: "阿里妈妈", accountName: "阿里妈妈-天猫旗舰店-新品", accountingEntity: "上海示例贸易有限公司", status: "已启用" },
  { id: "ad-003", platform: "腾讯广告", accountName: "腾讯广告-华南直营-品牌", accountingEntity: "广州示例贸易有限公司", status: "已启用" }
];

const initialPayments: DepositPaymentApplication[] = [
  {
    id: "pay-001",
    code: "BZJFK-2026-001",
    title: "保证金付款申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    position: "店铺运营",
    createdAt: "2026-04-26",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "店铺保证金",
    storeId: "store-001",
    store: "天猫示例旗舰店",
    thirdAccount: "TP-天猫-示例旗舰店",
    expectedReturnAt: "2026-08-31",
    paymentLink: "https://mock.tmall.example/deposit/001",
    amount: 80000,
    description: "天猫 618 活动店铺保证金",
    attachmentName: "天猫保证金页面截图.png",
    voucherNo: "ERP-VOUCHER-6401",
    status: "付款成功",
    sourceSystem: "[OA] 保证金付款审批 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-26 14:20:00",
    syncBatchNo: "SYNC-BZJ-2026042601",
    paymentLines: [
      { id: "line-001", summary: "天猫店铺保证金", amount: 80000, paymentMethod: "银企直连", expectedPayAt: "2026-04-26", payee: "浙江天猫技术有限公司", payer: "上海示例贸易有限公司", paymentType: "平台保证金" }
    ],
    steps: [
      { node: "申请人提交", approver: "王珊", date: "2026-04-25", comment: "提交店铺保证金付款申请" },
      { node: "财务 BP", approver: "林一", date: "2026-04-26", comment: "审批通过并完成模拟付款" }
    ]
  },
  {
    id: "pay-002",
    code: "BZJFK-2026-002",
    title: "保证金付款申请单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    position: "投放运营",
    createdAt: "2026-05-02",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "营销推广保证金",
    adPlatform: "巨量千川",
    adAccount: "巨量千川-示例旗舰店-618",
    expectedReturnAt: "2026-07-15",
    paymentLink: "https://mock.qianchuan.example/deposit/618",
    amount: 120000,
    description: "巨量千川大促消耗保证金",
    attachmentName: "千川保证金充值确认.pdf",
    voucherNo: "ERP-VOUCHER-6418",
    status: "付款成功",
    sourceSystem: "[OA] 保证金付款审批 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 17:10:00",
    syncBatchNo: "SYNC-BZJ-2026050202",
    paymentLines: [
      { id: "line-002", summary: "巨量千川投放保证金", amount: 120000, paymentMethod: "银企直连", expectedPayAt: "2026-05-02", payee: "北京巨量引擎网络技术有限公司", payer: "上海示例贸易有限公司", paymentType: "投放保证金" }
    ],
    steps: [
      { node: "申请人提交", approver: "陈晨", date: "2026-05-02", comment: "提交营销推广保证金付款申请" },
      { node: "财务 BP", approver: "林一", date: "2026-05-02", comment: "审批通过并完成模拟付款" }
    ]
  },
  {
    id: "pay-003",
    code: "BZJFK-2026-003",
    title: "保证金付款申请单",
    applicant: "李响",
    company: "上海示例贸易有限公司",
    department: "直播运营部",
    position: "合同专员",
    createdAt: "2026-05-04",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "合同保证金",
    contractId: "contract-002",
    contractCode: "HTYX-2026-021",
    supplier: "北京云起传媒有限公司",
    customer: "上海示例贸易有限公司",
    expectedReturnAt: "2026-12-31",
    paymentLink: "-",
    amount: 50000,
    description: "代运营合同履约保证金",
    attachmentName: "合同保证金条款截图.png",
    voucherNo: "ERP-VOUCHER-6421",
    status: "付款成功",
    sourceSystem: "[OA] 保证金付款审批 / [采购合同]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 18:40:00",
    syncBatchNo: "SYNC-BZJ-2026050401",
    paymentLines: [
      { id: "line-003", summary: "合同履约保证金", amount: 50000, paymentMethod: "网银转账", expectedPayAt: "2026-05-04", payee: "北京云起传媒有限公司", payer: "上海示例贸易有限公司", paymentType: "合同保证金" }
    ],
    steps: [
      { node: "申请人提交", approver: "李响", date: "2026-05-04", comment: "提交合同保证金付款申请" },
      { node: "财务主管", approver: "顾可", date: "2026-05-04", comment: "审批通过" }
    ]
  },
  {
    id: "pay-004",
    code: "BZJFK-2026-004",
    title: "保证金付款申请单",
    applicant: "赵敏",
    company: "广州示例贸易有限公司",
    department: "渠道市场部",
    position: "渠道经理",
    createdAt: "2026-05-05",
    accountingEntity: "广州示例贸易有限公司",
    depositType: "付招投标保证金",
    expectedReturnAt: "2026-06-30",
    paymentLink: "-",
    amount: 30000,
    description: "华南商超联合推广项目投标保证金",
    attachmentName: "投标保证金缴纳通知.pdf",
    voucherNo: "-",
    status: "付款失败",
    sourceSystem: "[OA] 保证金付款审批 / [CBS] 支付",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 16:30:00",
    syncBatchNo: "SYNC-BZJ-2026050504",
    failureReason: "CBS 返回：收款户名与通知书不一致 [PAYEE-409]",
    paymentLines: [
      { id: "line-004", summary: "投标保证金", amount: 30000, paymentMethod: "银企直连", expectedPayAt: "2026-05-05", payee: "广州华南商超有限公司", payer: "广州示例贸易有限公司", paymentType: "招投标保证金" }
    ],
    steps: [{ node: "财务 BP", approver: "林一", date: "2026-05-05", comment: "审批通过，支付失败待重试" }]
  },
  {
    id: "pay-005",
    code: "BZJFK-2026-005",
    title: "保证金付款申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    position: "店铺运营",
    createdAt: "2026-05-06",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "店铺保证金",
    storeId: "store-002",
    store: "京东示例自营店",
    thirdAccount: "TP-京东-自营结算户",
    expectedReturnAt: "2026-09-30",
    paymentLink: "https://mock.jd.example/deposit/002",
    amount: 60000,
    description: "京东大促店铺保证金",
    attachmentName: "京东保证金截图.png",
    voucherNo: "-",
    status: "审批中",
    sourceSystem: "[OA] 保证金付款审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    paymentLines: [
      { id: "line-005", summary: "京东店铺保证金", amount: 60000, paymentMethod: "银企直连", expectedPayAt: "2026-05-07", payee: "北京京东世纪贸易有限公司", payer: "上海示例贸易有限公司", paymentType: "平台保证金" }
    ],
    steps: [{ node: "申请人提交", approver: "王珊", date: "2026-05-06", comment: "等待财务审批" }]
  }
];

const initialLedgers: DepositLedger[] = [
  {
    id: "ledger-001",
    sourcePaymentId: "pay-001",
    sourcePaymentCode: "BZJFK-2026-001",
    code: "BZJTZ-2026-001",
    title: "保证金台账",
    createdAt: "2026-04-26",
    accountingEntity: "上海示例贸易有限公司",
    department: "电商运营部",
    depositType: "店铺保证金",
    ledgerClass: "平台类",
    paymentMethod: "银企直连",
    totalAmount: 80000,
    returnedAmount: 20000,
    occupiedAmount: 0,
    balanceAmount: 60000,
    expectedReturnAt: "2026-08-31",
    fullyReturned: false,
    status: "部分退回",
    thirdAccount: "TP-天猫-示例旗舰店",
    store: "天猫示例旗舰店",
    latestReturnCode: "BZJTH-2026-001",
    receiptStatus: "部分到账",
    sourceSystem: "[ERP] 付款凭证 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 11:20:00",
    syncBatchNo: "SYNC-BZJ-LEDGER-001",
    description: "天猫 618 活动店铺保证金",
    paymentLogs: [
      { id: "op-001", time: "2026-04-26 14:20:00", channel: "CBS", serialNo: "CBS202604260036", result: "支付成功 80,000.00" },
      { id: "op-002", time: "2026-05-03 11:20:00", channel: "银行回单", serialNo: "RCPT202605030011", result: "退回到账 20,000.00" }
    ],
    returnCodes: ["BZJTH-2026-001"]
  },
  {
    id: "ledger-002",
    sourcePaymentId: "pay-002",
    sourcePaymentCode: "BZJFK-2026-002",
    code: "BZJTZ-2026-002",
    title: "保证金台账",
    createdAt: "2026-05-02",
    accountingEntity: "上海示例贸易有限公司",
    department: "电商运营部",
    depositType: "营销推广保证金",
    ledgerClass: "平台类",
    paymentMethod: "银企直连",
    totalAmount: 120000,
    returnedAmount: 0,
    occupiedAmount: 30000,
    balanceAmount: 120000,
    expectedReturnAt: "2026-07-15",
    fullyReturned: false,
    status: "退回中",
    adPlatform: "巨量千川",
    adAccount: "巨量千川-示例旗舰店-618",
    latestReturnCode: "BZJTH-2026-002",
    receiptStatus: "待到账",
    sourceSystem: "[ERP] 付款凭证 / [CBS] 支付",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 17:10:00",
    syncBatchNo: "SYNC-BZJ-LEDGER-002",
    description: "巨量千川大促消耗保证金",
    paymentLogs: [{ id: "op-003", time: "2026-05-02 17:10:00", channel: "CBS", serialNo: "CBS202605020066", result: "支付成功 120,000.00" }],
    returnCodes: ["BZJTH-2026-002"]
  },
  {
    id: "ledger-003",
    sourcePaymentId: "pay-003",
    sourcePaymentCode: "BZJFK-2026-003",
    code: "BZJTZ-2026-003",
    title: "保证金台账",
    createdAt: "2026-05-04",
    accountingEntity: "上海示例贸易有限公司",
    department: "直播运营部",
    depositType: "合同保证金",
    ledgerClass: "非平台类",
    paymentMethod: "网银转账",
    totalAmount: 50000,
    returnedAmount: 0,
    occupiedAmount: 0,
    balanceAmount: 50000,
    expectedReturnAt: "2026-12-31",
    fullyReturned: false,
    status: "在保",
    contractCode: "HTYX-2026-021",
    supplier: "北京云起传媒有限公司",
    customer: "上海示例贸易有限公司",
    latestReturnCode: "-",
    receiptStatus: "未退回",
    sourceSystem: "[采购合同] / [ERP] 付款凭证",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 18:40:00",
    syncBatchNo: "SYNC-BZJ-LEDGER-003",
    description: "代运营合同履约保证金",
    paymentLogs: [{ id: "op-004", time: "2026-05-04 18:40:00", channel: "网银", serialNo: "BANK202605040021", result: "支付成功 50,000.00" }],
    returnCodes: []
  },
  {
    id: "ledger-004",
    sourcePaymentId: "pay-006",
    sourcePaymentCode: "BZJFK-2026-006",
    code: "BZJTZ-2026-004",
    title: "保证金台账",
    createdAt: "2026-04-18",
    accountingEntity: "广州示例贸易有限公司",
    department: "渠道市场部",
    depositType: "营销推广保证金",
    ledgerClass: "平台类",
    paymentMethod: "银企直连",
    totalAmount: 70000,
    returnedAmount: 70000,
    occupiedAmount: 0,
    balanceAmount: 0,
    expectedReturnAt: "2026-05-20",
    fullyReturned: true,
    status: "已全额退回",
    adPlatform: "腾讯广告",
    adAccount: "腾讯广告-华南直营-品牌",
    latestReturnCode: "BZJTH-2026-003",
    receiptStatus: "已到账",
    sourceSystem: "[ERP] 付款凭证 / [银行回单]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-01 09:30:00",
    syncBatchNo: "SYNC-BZJ-LEDGER-004",
    description: "腾讯广告平台招商保证金，已全部退回",
    paymentLogs: [
      { id: "op-005", time: "2026-04-18 10:10:00", channel: "CBS", serialNo: "CBS202604180088", result: "支付成功 70,000.00" },
      { id: "op-006", time: "2026-05-01 09:30:00", channel: "银行回单", serialNo: "RCPT202605010002", result: "退回到账 70,000.00" }
    ],
    returnCodes: ["BZJTH-2026-003"]
  }
];

const initialReturns: DepositReturnApplication[] = [
  {
    id: "ret-001",
    code: "BZJTH-2026-001",
    title: "保证金退回申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    createdAt: "2026-05-03",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "店铺保证金",
    voucherNo: "ERP-RECEIPT-7101",
    receiptVoucherNo: "RCPT202605030011",
    description: "天猫活动保证金部分退回",
    totalReturnAmount: 20000,
    status: "已完成",
    sourceSystem: "[OA] 保证金退回审批 / [银行回单]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 11:20:00",
    lines: [
      { id: "ret-line-001", ledgerId: "ledger-001", ledgerCode: "BZJTZ-2026-001", depositType: "店铺保证金", thirdAccount: "TP-天猫-示例旗舰店", store: "天猫示例旗舰店", balanceAmount: 80000, occupiedBefore: 0, returnAmount: 20000 }
    ],
    steps: [
      { node: "申请人提交", approver: "王珊", date: "2026-05-03", comment: "申请平台保证金退回" },
      { node: "财务确认到账", approver: "顾可", date: "2026-05-03", comment: "银行回单已匹配，生成收款凭证" }
    ]
  },
  {
    id: "ret-002",
    code: "BZJTH-2026-002",
    title: "保证金退回申请单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    createdAt: "2026-05-06",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "营销推广保证金",
    voucherNo: "-",
    receiptVoucherNo: "-",
    description: "千川账户保证金首笔退回",
    totalReturnAmount: 30000,
    status: "待财务确认到账",
    sourceSystem: "[OA] 保证金退回审批 / [银行回单]",
    syncStatus: "未同步",
    lastSyncAt: "-",
    lines: [
      { id: "ret-line-002", ledgerId: "ledger-002", ledgerCode: "BZJTZ-2026-002", depositType: "营销推广保证金", adPlatform: "巨量千川", adAccount: "巨量千川-示例旗舰店-618", balanceAmount: 120000, occupiedBefore: 0, returnAmount: 30000 }
    ],
    steps: [
      { node: "申请人提交", approver: "陈晨", date: "2026-05-06", comment: "提交退回申请并占用余额" },
      { node: "财务 BP", approver: "林一", date: "2026-05-06", comment: "审批通过，等待到账确认" }
    ]
  },
  {
    id: "ret-003",
    code: "BZJTH-2026-004",
    title: "保证金退回申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    createdAt: "2026-05-05",
    accountingEntity: "上海示例贸易有限公司",
    depositType: "店铺保证金",
    voucherNo: "-",
    receiptVoucherNo: "-",
    description: "平台账单金额与台账余额不一致",
    totalReturnAmount: 10000,
    status: "已驳回",
    sourceSystem: "[OA] 保证金退回审批",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 18:00:00",
    failureReason: "模拟驳回：平台账单截图与退回金额不一致。",
    lines: [
      { id: "ret-line-003", ledgerId: "ledger-001", ledgerCode: "BZJTZ-2026-001", depositType: "店铺保证金", thirdAccount: "TP-天猫-示例旗舰店", store: "天猫示例旗舰店", balanceAmount: 60000, occupiedBefore: 0, returnAmount: 10000 }
    ],
    steps: [{ node: "财务 BP", approver: "林一", date: "2026-05-05", comment: "驳回：请补充到账流水截图" }]
  }
];

const defaultPaymentForm: PaymentFormState = {
  applicant: "王珊",
  company: "上海示例贸易有限公司",
  department: "电商运营部",
  position: "店铺运营",
  accountingEntity: "上海示例贸易有限公司",
  depositType: "店铺保证金",
  contractId: "contract-001",
  storeId: "store-001",
  thirdAccount: "TP-天猫-示例旗舰店",
  adPlatform: "巨量千川",
  adAccountId: "ad-001",
  expectedReturnAt: "2026-09-30",
  paymentLink: "https://mock.platform.example/deposit/new",
  amount: "60000",
  description: "平台大促保证金付款",
  attachmentName: "保证金缴纳通知.pdf",
  payee: "平台保证金收款方",
  payer: "上海示例贸易有限公司",
  paymentMethod: "银企直连",
  expectedPayAt: today
};

const defaultReturnForm: ReturnFormState = {
  applicant: "王珊",
  company: "上海示例贸易有限公司",
  department: "电商运营部",
  accountingEntity: "上海示例贸易有限公司",
  depositType: "店铺保证金",
  description: "平台保证金退回申请",
  lines: []
};

const depositTypes: DepositType[] = ["店铺保证金", "营销推广保证金", "合同保证金", "付招投标保证金", "退招投标保证金"];
const returnDepositTypes: ReturnFormState["depositType"][] = ["店铺保证金", "营销推广保证金"];

export default function DepositManagementPage() {
  const [view, setView] = useState<ViewMode>("ledger");
  const [payments, setPayments] = useState(initialPayments);
  const [ledgers, setLedgers] = useState(initialLedgers);
  const [returns, setReturns] = useState(initialReturns);
  const [filters, setFilters] = useState({ keyword: "", status: "全部", type: "全部", ledgerClass: "全部" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<{ title: string; children: ReactNode } | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState | null>(null);
  const [returnForm, setReturnForm] = useState<ReturnFormState | null>(null);
  const [ledgerChooserOpen, setLedgerChooserOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [overlayLoading, setOverlayLoading] = useState("");

  const filteredPayments = useMemo(() => filterPayments(payments, filters), [filters, payments]);
  const filteredReturns = useMemo(() => filterReturns(returns, filters), [filters, returns]);
  const filteredLedgers = useMemo(() => filterLedgers(ledgers, filters), [filters, ledgers]);
  const currentCount = view === "payments" ? filteredPayments.length : view === "returns" ? filteredReturns.length : filteredLedgers.length;

  const stats = [
    { label: "保证金总额", value: formatMoney(ledgers.reduce((total, item) => total + item.totalAmount, 0)), sub: "平台类与非平台类合计" },
    { label: "待收回金额", value: formatMoney(ledgers.reduce((total, item) => total + item.balanceAmount, 0)), sub: "含已占用退回申请" },
    { label: "已收回总计", value: formatMoney(ledgers.reduce((total, item) => total + item.returnedAmount, 0)), sub: "财务已确认到账" },
    { label: "退回中金额", value: formatMoney(ledgers.reduce((total, item) => total + item.occupiedAmount, 0)), sub: "提交审批后占用" }
  ];

  const availableLedgersForReturn = useMemo(() => {
    if (!returnForm) return [];
    return ledgers.filter(
      (item) =>
        item.accountingEntity === returnForm.accountingEntity &&
        item.depositType === returnForm.depositType &&
        item.balanceAmount - item.occupiedAmount > 0 &&
        !returnForm.lines.some((line) => line.ledgerId === item.id)
    );
  }, [ledgers, returnForm]);

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
    setFilters({ keyword: "", status: "全部", type: "全部", ledgerClass: "全部" });
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
  }

  function openPaymentForm(editingId?: string) {
    const target = payments.find((item) => item.id === editingId);
    if (!target) {
      setPaymentForm(defaultPaymentForm);
    } else {
      const adAccount = adAccountOptions.find((item) => item.accountName === target.adAccount);
      setPaymentForm({
        editingId: target.id,
        applicant: target.applicant,
        company: target.company,
        department: target.department,
        position: target.position,
        accountingEntity: target.accountingEntity,
        depositType: target.depositType,
        contractId: target.contractId ?? "contract-001",
        storeId: target.storeId ?? "store-001",
        thirdAccount: target.thirdAccount ?? "TP-天猫-示例旗舰店",
        adPlatform: target.adPlatform ?? "巨量千川",
        adAccountId: adAccount?.id ?? "ad-001",
        expectedReturnAt: target.expectedReturnAt,
        paymentLink: target.paymentLink,
        amount: String(target.amount),
        description: target.description,
        attachmentName: target.attachmentName,
        payee: target.paymentLines[0]?.payee ?? "平台保证金收款方",
        payer: target.paymentLines[0]?.payer ?? target.accountingEntity,
        paymentMethod: target.paymentLines[0]?.paymentMethod ?? "银企直连",
        expectedPayAt: target.paymentLines[0]?.expectedPayAt ?? today
      });
    }
    setErrors({});
  }

  function openReturnForm(ledgerId?: string, editingId?: string) {
    const target = returns.find((item) => item.id === editingId);
    if (target) {
      setReturnForm({
        editingId: target.id,
        applicant: target.applicant,
        company: target.company,
        department: target.department,
        accountingEntity: target.accountingEntity,
        depositType: target.depositType,
        description: target.description,
        lines: target.lines
      });
    } else if (ledgerId) {
      const ledger = ledgers.find((item) => item.id === ledgerId);
      const returnType = ledger?.depositType === "营销推广保证金" ? "营销推广保证金" : "店铺保证金";
      setReturnForm({
        ...defaultReturnForm,
        accountingEntity: ledger?.accountingEntity ?? defaultReturnForm.accountingEntity,
        department: ledger?.department ?? defaultReturnForm.department,
        depositType: returnType,
        lines: ledger && isReturnableDepositType(ledger.depositType) ? [buildReturnLine(ledger, Math.min(ledger.balanceAmount - ledger.occupiedAmount, 30000))] : []
      });
    } else {
      setReturnForm(defaultReturnForm);
    }
    setErrors({});
  }

  function savePaymentDraft() {
    if (!paymentForm || !validatePaymentForm(paymentForm, false)) return;
    upsertPaymentApplication(paymentForm, "草稿");
    setPaymentForm(null);
    setView("payments");
    showToast("已保存保证金付款申请草稿。");
  }

  function submitPayment(event: FormEvent) {
    event.preventDefault();
    if (!paymentForm || !validatePaymentForm(paymentForm, true)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      upsertPaymentApplication(paymentForm, "审批中");
      setSubmitting(false);
      setPaymentForm(null);
      setView("payments");
      showToast("已模拟提交 OA 审批，付款申请进入审批中。");
    }, 650);
  }

  function saveReturnDraft() {
    if (!returnForm || !validateReturnForm(returnForm, false)) return;
    upsertReturnApplication(returnForm, "草稿");
    setReturnForm(null);
    setView("returns");
    showToast("已保存保证金退回申请草稿。");
  }

  function submitReturn(event: FormEvent) {
    event.preventDefault();
    if (!returnForm || !validateReturnForm(returnForm, true)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      const created = upsertReturnApplication(returnForm, "审批中");
      occupyLedgerBalance(created);
      setSubmitting(false);
      setReturnForm(null);
      setView("returns");
      showToast("已模拟提交 OA 审批，并占用保证金可退回余额。");
    }, 650);
  }

  function validatePaymentForm(next: PaymentFormState, strict: boolean) {
    const currentErrors: Record<string, string> = {};
    const amount = Number(next.amount);
    if (!next.accountingEntity.trim()) currentErrors.accountingEntity = "请选择核算主体";
    if (!next.depositType) currentErrors.depositType = "请选择保证金类型";
    if (Number.isNaN(amount) || amount <= 0) currentErrors.amount = "付款金额必须大于 0";
    if (!next.payee.trim()) currentErrors.payee = "请填写收款方";
    if (!next.payer.trim()) currentErrors.payer = "请填写付款方";
    if (strict && next.depositType === "合同保证金" && !contractOptions.some((item) => item.id === next.contractId)) currentErrors.contractId = "请选择关联合同";
    if (strict && next.depositType === "店铺保证金" && !storeOptions.some((item) => item.id === next.storeId)) currentErrors.storeId = "请选择三方账户和店铺";
    if (strict && next.depositType === "营销推广保证金" && !adAccountOptions.some((item) => item.id === next.adAccountId)) currentErrors.adAccountId = "请选择投放账户";
    if (strict && ["付招投标保证金", "退招投标保证金"].includes(next.depositType) && !next.attachmentName.trim()) currentErrors.attachmentName = "请补充说明附件名称";
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  }

  function validateReturnForm(next: ReturnFormState, strict: boolean) {
    const currentErrors: Record<string, string> = {};
    if (!next.accountingEntity.trim()) currentErrors.accountingEntity = "请选择核算主体";
    if (next.lines.length === 0) currentErrors.lines = "请至少关联一条保证金台账";
    next.lines.forEach((line) => {
      const ledger = ledgers.find((item) => item.id === line.ledgerId);
      const amount = Number(line.returnAmount);
      const availableAmount = ledger ? ledger.balanceAmount - ledger.occupiedAmount : line.balanceAmount - line.occupiedBefore;
      if (Number.isNaN(amount) || amount <= 0) currentErrors[`line-${line.id}`] = "申请退回金额必须大于 0";
      if (strict && amount > availableAmount) currentErrors[`line-${line.id}`] = "申请退回金额不能超过可退回余额";
    });
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  }

  function upsertPaymentApplication(next: PaymentFormState, status: PaymentApplicationStatus) {
    const existing = payments.find((item) => item.id === next.editingId);
    const amount = Number(next.amount || 0);
    const contract = contractOptions.find((item) => item.id === next.contractId);
    const store = storeOptions.find((item) => item.id === next.storeId);
    const adAccount = adAccountOptions.find((item) => item.id === next.adAccountId);
    const line: PaymentLine = {
      id: existing?.paymentLines[0]?.id ?? `line-${Date.now()}`,
      summary: `${next.depositType}付款`,
      amount,
      paymentMethod: next.paymentMethod,
      expectedPayAt: next.expectedPayAt,
      payee: next.payee,
      payer: next.payer,
      paymentType: next.depositType
    };
    const item: DepositPaymentApplication = {
      id: existing?.id ?? `pay-${Date.now()}`,
      code: existing?.code ?? `BZJFK-2026-${String(payments.length + 1).padStart(3, "0")}`,
      title: "保证金付款申请单",
      applicant: next.applicant,
      company: next.company,
      department: next.department,
      position: next.position,
      createdAt: existing?.createdAt ?? today,
      accountingEntity: next.accountingEntity,
      depositType: next.depositType,
      contractId: next.depositType === "合同保证金" ? contract?.id : undefined,
      contractCode: next.depositType === "合同保证金" ? contract?.code : undefined,
      supplier: next.depositType === "合同保证金" ? contract?.supplier : undefined,
      customer: next.depositType === "合同保证金" ? contract?.customer : undefined,
      storeId: next.depositType === "店铺保证金" ? store?.id : undefined,
      store: next.depositType === "店铺保证金" ? store?.name : undefined,
      thirdAccount: next.depositType === "店铺保证金" ? store?.thirdAccount ?? next.thirdAccount : undefined,
      adPlatform: next.depositType === "营销推广保证金" ? adAccount?.platform : undefined,
      adAccount: next.depositType === "营销推广保证金" ? adAccount?.accountName : undefined,
      expectedReturnAt: next.expectedReturnAt,
      paymentLink: ["店铺保证金", "营销推广保证金"].includes(next.depositType) ? next.paymentLink : "-",
      amount,
      description: next.description,
      attachmentName: next.attachmentName,
      voucherNo: existing?.voucherNo ?? "-",
      status,
      sourceSystem: "[OA] 保证金付款审批",
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      syncBatchNo: existing?.syncBatchNo ?? "-",
      failureReason: status === "已驳回" ? existing?.failureReason : undefined,
      paymentLines: [line],
      steps: buildSteps(existing?.steps ?? [], status, next.applicant, status === "草稿" ? "保存草稿" : "模拟提交 OA 审批")
    };
    setPayments((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
  }

  function upsertReturnApplication(next: ReturnFormState, status: ReturnApplicationStatus) {
    const existing = returns.find((item) => item.id === next.editingId);
    const totalReturnAmount = next.lines.reduce((total, line) => total + Number(line.returnAmount || 0), 0);
    const item: DepositReturnApplication = {
      id: existing?.id ?? `ret-${Date.now()}`,
      code: existing?.code ?? `BZJTH-2026-${String(returns.length + 1).padStart(3, "0")}`,
      title: "保证金退回申请单",
      applicant: next.applicant,
      company: next.company,
      department: next.department,
      createdAt: existing?.createdAt ?? today,
      accountingEntity: next.accountingEntity,
      depositType: next.depositType,
      voucherNo: existing?.voucherNo ?? "-",
      receiptVoucherNo: existing?.receiptVoucherNo ?? "-",
      description: next.description,
      totalReturnAmount,
      status,
      sourceSystem: "[OA] 保证金退回审批",
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      failureReason: status === "已驳回" ? existing?.failureReason : undefined,
      lines: next.lines,
      steps: buildSteps(existing?.steps ?? [], status, next.applicant, status === "草稿" ? "保存草稿" : "提交退回申请并占用余额")
    };
    setReturns((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
    return item;
  }

  function updatePaymentStatus(id: string, status: Extract<PaymentApplicationStatus, "审批通过" | "已驳回">) {
    setPayments((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              syncStatus: status === "审批通过" ? "同步成功" : item.syncStatus,
              lastSyncAt: status === "审批通过" ? nowText : item.lastSyncAt,
              syncBatchNo: status === "审批通过" ? `SYNC-BZJ-${Date.now()}` : item.syncBatchNo,
              failureReason: status === "已驳回" ? "模拟驳回：付款链接或附件需补充。" : undefined,
              steps: buildSteps(item.steps, status, item.applicant, status === "已驳回" ? "模拟审批驳回" : "模拟审批通过")
            }
          : item
      )
    );
    showToast(status === "审批通过" ? "审批通过，可继续模拟付款。" : "已模拟驳回，付款申请可编辑后重新提交。");
  }

  function simulatePayment(id: string, success: boolean) {
    const target = payments.find((item) => item.id === id);
    if (!target) return;
    setOverlayLoading(success ? "招商银行直连支付中..." : "正在模拟支付失败回写");
    setPayments((items) => items.map((item) => (item.id === id ? { ...item, status: "付款中", failureReason: undefined } : item)));
    window.setTimeout(() => {
      setOverlayLoading("");
      if (success) {
        const voucherNo = `ERP-VOUCHER-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        setPayments((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "付款成功",
                  voucherNo,
                  sourceSystem: "[OA] 保证金付款审批 / [CBS] 支付",
                  syncStatus: "同步成功",
                  lastSyncAt: nowText,
                  syncBatchNo: `SYNC-BZJ-${Date.now()}`,
                  steps: buildSteps(item.steps, "付款成功", item.applicant, "CBS 支付成功并回写 ERP 凭证")
                }
              : item
          )
        );
        createLedgerFromPayment({ ...target, status: "付款成功", voucherNo });
        setView("ledger");
        showToast("付款成功，保证金台账已生成或刷新。");
      } else {
        setPayments((items) =>
          items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "付款失败",
                  syncStatus: "同步失败",
                  lastSyncAt: nowText,
                  failureReason: "CBS 返回：银行账户状态异常 [BANK-504]",
                  steps: buildSteps(item.steps, "付款失败", item.applicant, "模拟 CBS 支付失败")
                }
              : item
          )
        );
        showToast("已模拟付款失败，可在列表重试付款。");
      }
    }, 900);
  }

  function createLedgerFromPayment(payment: DepositPaymentApplication) {
    setLedgers((items) => {
      if (items.some((item) => item.sourcePaymentId === payment.id)) return items;
      const ledgerClass = isPlatformDeposit(payment.depositType) ? "平台类" : "非平台类";
      const ledger: DepositLedger = {
        id: `ledger-${Date.now()}`,
        sourcePaymentId: payment.id,
        sourcePaymentCode: payment.code,
        code: `BZJTZ-2026-${String(items.length + 1).padStart(3, "0")}`,
        title: "保证金台账",
        createdAt: today,
        accountingEntity: payment.accountingEntity,
        department: payment.department,
        depositType: payment.depositType,
        ledgerClass,
        paymentMethod: payment.paymentLines[0]?.paymentMethod ?? "银企直连",
        totalAmount: payment.amount,
        returnedAmount: 0,
        occupiedAmount: 0,
        balanceAmount: payment.amount,
        expectedReturnAt: payment.expectedReturnAt,
        fullyReturned: false,
        status: "在保",
        contractCode: payment.contractCode,
        supplier: payment.supplier,
        customer: payment.customer,
        thirdAccount: payment.thirdAccount,
        store: payment.store,
        adPlatform: payment.adPlatform,
        adAccount: payment.adAccount,
        latestReturnCode: "-",
        receiptStatus: "未退回",
        sourceSystem: "[ERP] 付款凭证 / [CBS] 支付",
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        syncBatchNo: `SYNC-BZJ-LEDGER-${Date.now()}`,
        description: payment.description,
        paymentLogs: [{ id: `op-${Date.now()}`, time: nowText, channel: "CBS", serialNo: `CBS${Date.now()}`, result: `支付成功 ${formatMoney(payment.amount)}` }],
        returnCodes: []
      };
      return [ledger, ...items];
    });
  }

  function addReturnLine(ledger: DepositLedger) {
    if (!returnForm || !isReturnableDepositType(ledger.depositType)) return;
    if (returnForm.lines.some((line) => line.ledgerId === ledger.id)) {
      showToast("该保证金台账已在当前退回申请中，无需重复选择。");
      return;
    }
    setReturnForm((current) => (current ? { ...current, lines: [...current.lines, buildReturnLine(ledger, ledger.balanceAmount - ledger.occupiedAmount)] } : current));
    setLedgerChooserOpen(false);
  }

  function updateReturnLine(lineId: string, amount: string) {
    const normalized = Number(amount || 0);
    setReturnForm((current) =>
      current
        ? {
            ...current,
            lines: current.lines.map((line) => (line.id === lineId ? { ...line, returnAmount: Number.isNaN(normalized) ? 0 : normalized } : line))
          }
        : current
    );
  }

  function removeReturnLine(lineId: string) {
    setReturnForm((current) => (current ? { ...current, lines: current.lines.filter((line) => line.id !== lineId) } : current));
  }

  function occupyLedgerBalance(application: DepositReturnApplication) {
    setLedgers((items) =>
      items.map((ledger) => {
        const line = application.lines.find((row) => row.ledgerId === ledger.id);
        if (!line) return ledger;
        return {
          ...ledger,
          occupiedAmount: ledger.occupiedAmount + line.returnAmount,
          status: "退回中",
          latestReturnCode: application.code,
          returnCodes: Array.from(new Set([application.code, ...ledger.returnCodes])),
          lastSyncAt: nowText
        };
      })
    );
  }

  function updateReturnStatus(id: string, status: Extract<ReturnApplicationStatus, "待财务确认到账" | "已驳回">) {
    const target = returns.find((item) => item.id === id);
    if (!target) return;
    if (status === "已驳回") releaseOccupiedBalance(target);
    setReturns((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              failureReason: status === "已驳回" ? "模拟驳回：到账流水截图与申请金额不一致。" : undefined,
              steps: buildSteps(item.steps, status, item.applicant, status === "已驳回" ? "模拟审批驳回并释放占用" : "模拟审批通过，等待财务确认到账")
            }
          : item
      )
    );
    showToast(status === "已驳回" ? "退回申请已驳回，保证金占用金额已释放。" : "审批通过，等待财务确认到账。");
  }

  function releaseOccupiedBalance(application: DepositReturnApplication) {
    setLedgers((items) =>
      items.map((ledger) => {
        const line = application.lines.find((row) => row.ledgerId === ledger.id);
        if (!line) return ledger;
        const occupiedAmount = Math.max(ledger.occupiedAmount - line.returnAmount, 0);
        return {
          ...ledger,
          occupiedAmount,
          status: ledger.balanceAmount === 0 ? "已全额退回" : ledger.returnedAmount > 0 ? "部分退回" : "在保"
        };
      })
    );
  }

  function confirmReceipt(id: string) {
    const target = returns.find((item) => item.id === id);
    if (!target) return;
    setOverlayLoading("正在核对到账流水并生成收款凭证");
    window.setTimeout(() => {
      setOverlayLoading("");
      const receiptVoucherNo = `RCPT${Date.now()}`;
      setReturns((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "已完成",
                receiptVoucherNo,
                voucherNo: `ERP-RECEIPT-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                sourceSystem: "[OA] 保证金退回审批 / [银行回单]",
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                steps: buildSteps(item.steps, "已完成", item.applicant, "财务确认到账并生成收款凭证")
              }
            : item
        )
      );
      applyReturnToLedgers(target, receiptVoucherNo);
      setView("ledger");
      showToast("财务已模拟确认到账，保证金台账余额已更新。");
    }, 900);
  }

  function applyReturnToLedgers(application: DepositReturnApplication, receiptVoucherNo: string) {
    setLedgers((items) =>
      items.map((ledger) => {
        const line = application.lines.find((row) => row.ledgerId === ledger.id);
        if (!line) return ledger;
        const returnedAmount = Math.min(ledger.totalAmount, ledger.returnedAmount + line.returnAmount);
        const occupiedAmount = Math.max(ledger.occupiedAmount - line.returnAmount, 0);
        const balanceAmount = Math.max(ledger.totalAmount - returnedAmount, 0);
        const fullyReturned = balanceAmount === 0;
        return {
          ...ledger,
          returnedAmount,
          occupiedAmount,
          balanceAmount,
          fullyReturned,
          status: fullyReturned ? "已全额退回" : "部分退回",
          latestReturnCode: application.code,
          receiptStatus: fullyReturned ? "已到账" : "部分到账",
          syncStatus: "同步成功",
          lastSyncAt: nowText,
          paymentLogs: [{ id: `receipt-${Date.now()}`, time: nowText, channel: "银行回单", serialNo: receiptVoucherNo, result: `退回到账 ${formatMoney(line.returnAmount)}` }, ...ledger.paymentLogs],
          returnCodes: Array.from(new Set([application.code, ...ledger.returnCodes]))
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
            <div className="mt-1 text-lg font-semibold">保证金管理</div>
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
          <div className="mb-4 text-sm text-slate-500">费用申请与资金 / 保证金管理 / 3.7.4</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">保证金管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">保证金付款申请、审批付款、台账生成、退回申请、到账确认与余额关闭的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => (view === "returns" ? openReturnForm() : openPaymentForm())}>{view === "returns" ? "新增退回申请" : "新增付款申请"}</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>
                导出模拟
              </Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：保证金台账服务响应超时，请点击重试。")}>
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
            <FilterBar filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} view={view} />

            {pageError && (
              <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="text-left font-medium text-red-700 underline" onClick={simulateQuery}>
                  重试加载
                </button>
              </div>
            )}

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              第三方系统均为 mock：OA 审批、采购合同、ERP 凭证、银行付款、CBS 支付、电商平台保证金账单只更新前端状态。
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : currentCount === 0 ? (
                <EmptyState onReset={resetFilters} onCreate={() => (view === "returns" ? openReturnForm() : openPaymentForm())} />
              ) : view === "payments" ? (
                <PaymentTable rows={filteredPayments} onDetail={(item) => setDetail({ title: item.code, children: <PaymentDetail item={item} /> })} onEdit={openPaymentForm} onApprove={(id) => updatePaymentStatus(id, "审批通过")} onReject={(id) => updatePaymentStatus(id, "已驳回")} onPay={simulatePayment} />
              ) : view === "returns" ? (
                <ReturnTable rows={filteredReturns} onDetail={(item) => setDetail({ title: item.code, children: <ReturnDetail item={item} /> })} onEdit={(id) => openReturnForm(undefined, id)} onApprove={(id) => updateReturnStatus(id, "待财务确认到账")} onReject={(id) => updateReturnStatus(id, "已驳回")} onConfirm={confirmReceipt} />
              ) : (
                <LedgerTable rows={filteredLedgers} onDetail={(item) => setDetail({ title: item.code, children: <LedgerDetail item={item} returns={returns} /> })} onReturn={(id) => openReturnForm(id)} />
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

      {paymentForm && (
        <PaymentFormModal
          form={paymentForm}
          errors={errors}
          submitting={submitting}
          onChange={(patch) => setPaymentForm((current) => (current ? normalizePaymentFormPatch(current, patch) : current))}
          onClose={() => setPaymentForm(null)}
          onSaveDraft={savePaymentDraft}
          onSubmit={submitPayment}
        />
      )}

      {returnForm && (
        <ReturnFormModal
          form={returnForm}
          errors={errors}
          ledgers={ledgers}
          submitting={submitting}
          onChange={(patch) => setReturnForm((current) => (current ? normalizeReturnFormPatch(current, patch) : current))}
          onOpenLedgerChooser={() => setLedgerChooserOpen(true)}
          onLineAmount={updateReturnLine}
          onRemoveLine={removeReturnLine}
          onClose={() => setReturnForm(null)}
          onSaveDraft={saveReturnDraft}
          onSubmit={submitReturn}
        />
      )}

      {ledgerChooserOpen && returnForm && (
        <Modal title="保证金信息" onClose={() => setLedgerChooserOpen(false)}>
          <div className="space-y-4">
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              当前单据过滤条件：{returnForm.accountingEntity} / {returnForm.depositType}。余额为 0 或已在本单选择的台账不可重复选择。
            </div>
            {availableLedgersForReturn.length === 0 ? (
              <EmptyState onReset={() => setLedgerChooserOpen(false)} onCreate={() => setLedgerChooserOpen(false)} />
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <Th>台账编号</Th>
                    <Th>投放/店铺对象</Th>
                    <Th>保证金总额</Th>
                    <Th>已退回</Th>
                    <Th>可退回</Th>
                    <Th>状态</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availableLedgersForReturn.map((ledger) => (
                    <tr key={ledger.id}>
                      <Td>{ledger.code}</Td>
                      <Td>{ledger.store ?? ledger.adAccount ?? "-"}</Td>
                      <Td align="right">{formatMoney(ledger.totalAmount)}</Td>
                      <Td align="right">{formatMoney(ledger.returnedAmount)}</Td>
                      <Td align="right">{formatMoney(ledger.balanceAmount - ledger.occupiedAmount)}</Td>
                      <Td>
                        <StatusBadge status={ledger.status} />
                      </Td>
                      <Td>
                        <InlineActions>
                          <button onClick={() => addReturnLine(ledger)}>选择</button>
                        </InlineActions>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
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

function PaymentTable({
  rows,
  onDetail,
  onEdit,
  onApprove,
  onReject,
  onPay
}: {
  rows: DepositPaymentApplication[];
  onDetail: (item: DepositPaymentApplication) => void;
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
          <Th>保证金类型</Th>
          <Th>申请人</Th>
          <Th>对象</Th>
          <Th>付款金额</Th>
          <Th>单据状态</Th>
          <Th>同步状态</Th>
          <Th>凭证号</Th>
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
            <Td>{item.depositType}</Td>
            <Td>{item.applicant}</Td>
            <Td>{item.store ?? item.adAccount ?? item.supplier ?? item.description}</Td>
            <Td align="right">{formatMoney(item.amount)}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 max-w-56 truncate text-xs text-red-600">{item.failureReason}</div>}
            </Td>
            <Td>{item.voucherNo}</Td>
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
                    <button onClick={() => onPay(item.id, true)}>付款成功</button>
                    <button onClick={() => onPay(item.id, false)}>付款失败</button>
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

function ReturnTable({
  rows,
  onDetail,
  onEdit,
  onApprove,
  onReject,
  onConfirm
}: {
  rows: DepositReturnApplication[];
  onDetail: (item: DepositReturnApplication) => void;
  onEdit: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>退回单号</Th>
          <Th>保证金类型</Th>
          <Th>申请人</Th>
          <Th>关联台账</Th>
          <Th>申请退回金额</Th>
          <Th>状态</Th>
          <Th>到账凭证</Th>
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
            <Td>{item.depositType}</Td>
            <Td>{item.applicant}</Td>
            <Td>{item.lines.map((line) => line.ledgerCode).join("、")}</Td>
            <Td align="right">{formatMoney(item.totalReturnAmount)}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>{item.receiptVoucherNo}</Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 max-w-56 truncate text-xs text-red-600">{item.failureReason}</div>}
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
                {item.status === "待财务确认到账" && <button onClick={() => onConfirm(item.id)}>确认到账</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LedgerTable({ rows, onDetail, onReturn }: { rows: DepositLedger[]; onDetail: (item: DepositLedger) => void; onReturn: (id: string) => void }) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>台账编号</Th>
          <Th>分类</Th>
          <Th>保证金类型</Th>
          <Th>核算主体</Th>
          <Th>对象</Th>
          <Th>保证金总额</Th>
          <Th>已退回</Th>
          <Th>占用金额</Th>
          <Th>余额</Th>
          <Th>是否全额退回</Th>
          <Th>状态</Th>
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
            <Td>{item.ledgerClass}</Td>
            <Td>{item.depositType}</Td>
            <Td>{item.accountingEntity}</Td>
            <Td>{item.store ?? item.adAccount ?? item.supplier ?? "-"}</Td>
            <Td align="right">{formatMoney(item.totalAmount)}</Td>
            <Td align="right">{formatMoney(item.returnedAmount)}</Td>
            <Td align="right">{formatMoney(item.occupiedAmount)}</Td>
            <Td align="right" danger={item.balanceAmount > 0}>
              {formatMoney(item.balanceAmount)}
            </Td>
            <Td>{item.fullyReturned ? "是" : "否"}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <InlineActions>
                {isReturnableDepositType(item.depositType) && item.balanceAmount - item.occupiedAmount > 0 && <button onClick={() => onReturn(item.id)}>发起退回</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PaymentFormModal({
  form,
  errors,
  submitting,
  onChange,
  onClose,
  onSaveDraft,
  onSubmit
}: {
  form: PaymentFormState;
  errors: Record<string, string>;
  submitting: boolean;
  onChange: (patch: Partial<PaymentFormState>) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const contract = contractOptions.find((item) => item.id === form.contractId);
  const store = storeOptions.find((item) => item.id === form.storeId);
  const platformAccounts = adAccountOptions.filter((item) => item.platform === form.adPlatform);
  const adAccount = adAccountOptions.find((item) => item.id === form.adAccountId);
  return (
    <Modal title="保证金付款申请单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="申请信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required>
              <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
            </Field>
            <Field label="申请人公司">
              <Input value={form.company} onChange={(value) => onChange({ company: value })} />
            </Field>
            <Field label="申请部门">
              <Input value={form.department} onChange={(value) => onChange({ department: value })} />
            </Field>
            <Field label="申请人岗位">
              <Input value={form.position} onChange={(value) => onChange({ position: value })} />
            </Field>
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Select value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} options={["上海示例贸易有限公司", "广州示例贸易有限公司"]} />
            </Field>
            <ReadOnly label="申请日期" value={today} />
          </div>
        </Section>

        <Section title="保证金信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="保证金类型" required error={errors.depositType}>
              <Select value={form.depositType} onChange={(value) => onChange({ depositType: value as DepositType })} options={depositTypes} />
            </Field>
            <Field label="预计退回日期">
              <Input value={form.expectedReturnAt} onChange={(value) => onChange({ expectedReturnAt: value })} />
            </Field>
            <Field label="付款金额" required error={errors.amount}>
              <Input value={form.amount} onChange={(value) => onChange({ amount: value })} />
            </Field>

            {form.depositType === "合同保证金" && (
              <>
                <Field label="关联合同" required error={errors.contractId}>
                  <Select value={form.contractId} onChange={(value) => onChange({ contractId: value })} options={contractOptions.map((item) => item.id)} labels={Object.fromEntries(contractOptions.map((item) => [item.id, `${item.code} / ${item.name}`]))} />
                </Field>
                <ReadOnly label="供应商" value={contract?.supplier} />
                <ReadOnly label="客户" value={contract?.customer} />
              </>
            )}

            {form.depositType === "店铺保证金" && (
              <>
                <Field label="三方账户 / 店铺" required error={errors.storeId}>
                  <Select value={form.storeId} onChange={(value) => onChange({ storeId: value })} options={storeOptions.map((item) => item.id)} labels={Object.fromEntries(storeOptions.map((item) => [item.id, `${item.thirdAccount} / ${item.name}`]))} />
                </Field>
                <ReadOnly label="店铺平台" value={store?.platform} />
                <ReadOnly label="店铺状态" value={<StatusBadge status={store?.status ?? "-"} />} />
                <Field label="付款链接">
                  <Input value={form.paymentLink} onChange={(value) => onChange({ paymentLink: value })} />
                </Field>
              </>
            )}

            {form.depositType === "营销推广保证金" && (
              <>
                <Field label="投放平台" required>
                  <Select value={form.adPlatform} onChange={(value) => onChange({ adPlatform: value })} options={Array.from(new Set(adAccountOptions.map((item) => item.platform)))} />
                </Field>
                <Field label="投放账户" required error={errors.adAccountId}>
                  <Select value={form.adAccountId} onChange={(value) => onChange({ adAccountId: value })} options={platformAccounts.map((item) => item.id)} labels={Object.fromEntries(platformAccounts.map((item) => [item.id, item.accountName]))} />
                </Field>
                <ReadOnly label="账户状态" value={<StatusBadge status={adAccount?.status ?? "-"} />} />
                <Field label="付款链接">
                  <Input value={form.paymentLink} onChange={(value) => onChange({ paymentLink: value })} />
                </Field>
              </>
            )}

            {["付招投标保证金", "退招投标保证金"].includes(form.depositType) && (
              <>
                <Field label="说明附件" required error={errors.attachmentName}>
                  <Input value={form.attachmentName} onChange={(value) => onChange({ attachmentName: value })} />
                </Field>
                <ReadOnly label="附件处理" value="仅模拟附件名称，不上传真实文件" />
              </>
            )}
          </div>
          <div className="mt-3">
            <Field label="说明">
              <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
            </Field>
          </div>
        </Section>

        <Section title="付款信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="收款方" required error={errors.payee}>
              <Input value={form.payee} onChange={(value) => onChange({ payee: value })} />
            </Field>
            <Field label="付款方" required error={errors.payer}>
              <Input value={form.payer} onChange={(value) => onChange({ payer: value })} />
            </Field>
            <Field label="付款方式">
              <Select value={form.paymentMethod} onChange={(value) => onChange({ paymentMethod: value })} options={["银企直连", "网银转账", "线下登记"]} />
            </Field>
            <Field label="期望付款日期">
              <Input value={form.expectedPayAt} onChange={(value) => onChange({ expectedPayAt: value })} />
            </Field>
            <ReadOnly label="付款类型" value={form.depositType} />
            <ReadOnly label="付款金额合计" value={formatMoney(Number(form.amount || 0))} />
          </div>
        </Section>

        <Section title="审批信息">
          <StepList steps={[{ node: "保存/提交", approver: form.applicant, date: today, comment: "Demo 提交后生成 OA 审批记录" }]} />
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

function ReturnFormModal({
  form,
  errors,
  ledgers,
  submitting,
  onChange,
  onOpenLedgerChooser,
  onLineAmount,
  onRemoveLine,
  onClose,
  onSaveDraft,
  onSubmit
}: {
  form: ReturnFormState;
  errors: Record<string, string>;
  ledgers: DepositLedger[];
  submitting: boolean;
  onChange: (patch: Partial<ReturnFormState>) => void;
  onOpenLedgerChooser: () => void;
  onLineAmount: (lineId: string, amount: string) => void;
  onRemoveLine: (lineId: string) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const totalReturnAmount = form.lines.reduce((total, line) => total + Number(line.returnAmount || 0), 0);
  return (
    <Modal title="保证金退回申请单" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Section title="申请信息">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="申请人" required>
              <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
            </Field>
            <Field label="申请人公司">
              <Input value={form.company} onChange={(value) => onChange({ company: value })} />
            </Field>
            <Field label="申请部门">
              <Input value={form.department} onChange={(value) => onChange({ department: value })} />
            </Field>
            <Field label="核算主体" required error={errors.accountingEntity}>
              <Select value={form.accountingEntity} onChange={(value) => onChange({ accountingEntity: value })} options={["上海示例贸易有限公司", "广州示例贸易有限公司"]} />
            </Field>
            <Field label="保证金类型" required>
              <Select value={form.depositType} onChange={(value) => onChange({ depositType: value as ReturnFormState["depositType"], lines: [] })} options={returnDepositTypes} />
            </Field>
            <ReadOnly label="退回金额合计值" value={formatMoney(totalReturnAmount)} />
          </div>
        </Section>

        <Section title="保证金明细">
          <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div className="text-sm text-slate-500">从保证金台账关联可退回明细，提交审批后会先占用余额。</div>
            <Button variant="secondary" size="sm" onClick={onOpenLedgerChooser}>关联保证金台账</Button>
          </div>
          {errors.lines && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600">{errors.lines}</div>}
          {form.lines.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">暂无关联明细</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <Th>台账编号</Th>
                    <Th>对象</Th>
                    <Th>保证金余额</Th>
                    <Th>已占用</Th>
                    <Th>申请退回金额</Th>
                    <Th>剩余金额</Th>
                    <Th>操作</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.lines.map((line) => {
                    const ledger = ledgers.find((item) => item.id === line.ledgerId);
                    const availableAmount = ledger ? ledger.balanceAmount - ledger.occupiedAmount : line.balanceAmount - line.occupiedBefore;
                    const remaining = Math.max((ledger?.balanceAmount ?? line.balanceAmount) - Number(line.returnAmount || 0), 0);
                    return (
                      <tr key={line.id}>
                        <Td>{line.ledgerCode}</Td>
                        <Td>{line.store ?? line.adAccount ?? "-"}</Td>
                        <Td align="right">{formatMoney(ledger?.balanceAmount ?? line.balanceAmount)}</Td>
                        <Td align="right">{formatMoney(ledger?.occupiedAmount ?? line.occupiedBefore)}</Td>
                        <Td>
                          <Input value={String(line.returnAmount)} onChange={(value) => onLineAmount(line.id, value)} />
                          {errors[`line-${line.id}`] && <div className="mt-1 text-xs text-red-500">{errors[`line-${line.id}`]}</div>}
                          <div className="mt-1 text-xs text-slate-400">可退回 {formatMoney(availableAmount)}</div>
                        </Td>
                        <Td align="right">{formatMoney(remaining)}</Td>
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
          )}
        </Section>

        <Section title="退回说明">
          <Field label="说明">
            <Textarea value={form.description} onChange={(value) => onChange({ description: value })} />
          </Field>
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

function PaymentDetail({ item }: { item: DepositPaymentApplication }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["单据编号", item.code],
            ["保证金类型", item.depositType],
            ["付款金额", formatMoney(item.amount)],
            ["单据状态", <StatusBadge key="status" status={item.status} />],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["ERP 凭证号", item.voucherNo]
          ]}
        />
      </Section>
      <Section title="保证金信息">
        <DetailGrid
          rows={[
            ["核算主体", item.accountingEntity],
            ["关联合同", item.contractCode ?? "-"],
            ["供应商", item.supplier ?? "-"],
            ["客户", item.customer ?? "-"],
            ["三方账户", item.thirdAccount ?? "-"],
            ["店铺", item.store ?? "-"],
            ["投放平台", item.adPlatform ?? "-"],
            ["投放账户", item.adAccount ?? "-"],
            ["预计退回日期", item.expectedReturnAt],
            ["付款链接", item.paymentLink],
            ["附件名称", item.attachmentName]
          ]}
        />
      </Section>
      <Section title="付款信息">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>摘要</Th>
              <Th>付款金额</Th>
              <Th>付款方式</Th>
              <Th>期望付款日期</Th>
              <Th>收款方</Th>
              <Th>付款方</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {item.paymentLines.map((line) => (
              <tr key={line.id}>
                <Td>{line.summary}</Td>
                <Td align="right">{formatMoney(line.amount)}</Td>
                <Td>{line.paymentMethod}</Td>
                <Td>{line.expectedPayAt}</Td>
                <Td>{line.payee}</Td>
                <Td>{line.payer}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function ReturnDetail({ item }: { item: DepositReturnApplication }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="状态摘要">
        <DetailGrid
          rows={[
            ["退回单号", item.code],
            ["保证金类型", item.depositType],
            ["退回金额合计", formatMoney(item.totalReturnAmount)],
            ["状态", <StatusBadge key="status" status={item.status} />],
            ["收款凭证号", item.receiptVoucherNo],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />]
          ]}
        />
      </Section>
      <Section title="保证金明细">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>台账编号</Th>
              <Th>投放/店铺对象</Th>
              <Th>保证金余额</Th>
              <Th>申请退回金额</Th>
              <Th>剩余金额</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {item.lines.map((line) => (
              <tr key={line.id}>
                <Td>{line.ledgerCode}</Td>
                <Td>{line.store ?? line.adAccount ?? "-"}</Td>
                <Td align="right">{formatMoney(line.balanceAmount)}</Td>
                <Td align="right">{formatMoney(line.returnAmount)}</Td>
                <Td align="right">{formatMoney(line.balanceAmount - line.returnAmount)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function LedgerDetail({ item, returns }: { item: DepositLedger; returns: DepositReturnApplication[] }) {
  const relatedReturns = returns.filter((row) => row.lines.some((line) => line.ledgerId === item.id));
  return (
    <div className="space-y-4">
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="资产摘要">
        <DetailGrid
          rows={[
            ["台账编号", item.code],
            ["来源付款单号", item.sourcePaymentCode],
            ["保证金类型", item.depositType],
            ["分类", item.ledgerClass],
            ["保证金总额", formatMoney(item.totalAmount)],
            ["已退回金额", formatMoney(item.returnedAmount)],
            ["占用金额", formatMoney(item.occupiedAmount)],
            ["保证金余额", formatMoney(item.balanceAmount)],
            ["是否已全部退回", item.fullyReturned ? "是" : "否"],
            ["状态", <StatusBadge key="status" status={item.status} />],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["最近同步时间", item.lastSyncAt]
          ]}
        />
      </Section>
      <Section title="对象信息">
        <DetailGrid
          rows={[
            ["核算主体", item.accountingEntity],
            ["合同编号", item.contractCode ?? "-"],
            ["供应商", item.supplier ?? "-"],
            ["客户", item.customer ?? "-"],
            ["三方账户", item.thirdAccount ?? "-"],
            ["店铺", item.store ?? "-"],
            ["投放平台", item.adPlatform ?? "-"],
            ["投放账户", item.adAccount ?? "-"],
            ["预计退回日期", item.expectedReturnAt],
            ["最近退回单号", item.latestReturnCode]
          ]}
        />
      </Section>
      <Section title="退回申请记录">
        {relatedReturns.length === 0 ? (
          <div className="text-sm text-slate-500">暂无退回申请。</div>
        ) : (
          <div className="space-y-2">
            {relatedReturns.map((row) => (
              <div key={row.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{row.code}</span>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-1 text-slate-600">申请退回 {formatMoney(row.totalReturnAmount)} / 收款凭证 {row.receiptVoucherNo}</div>
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title="金额流水">
        <StepList steps={item.paymentLogs.map((log) => ({ node: log.channel, approver: log.serialNo, date: log.time, comment: log.result }))} />
      </Section>
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  onQuery,
  onReset,
  view
}: {
  filters: { keyword: string; status: string; type: string; ledgerClass: string };
  setFilters: (filters: { keyword: string; status: string; type: string; ledgerClass: string }) => void;
  onQuery: () => void;
  onReset: () => void;
  view: ViewMode;
}) {
  const statusOptions =
    view === "payments"
      ? ["全部", "草稿", "审批中", "已驳回", "审批通过", "付款中", "付款成功", "付款失败", "同步失败"]
      : view === "returns"
        ? ["全部", "草稿", "审批中", "已驳回", "待财务确认到账", "已完成", "同步失败"]
        : ["全部", "在保", "退回中", "部分退回", "已全额退回", "同步失败"];
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <Field label="关键词">
        <Input value={filters.keyword} onChange={(value) => setFilters({ ...filters, keyword: value })} placeholder="单号/店铺/供应商/账户" />
      </Field>
      <Field label="状态">
        <Select value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={statusOptions} />
      </Field>
      <Field label="保证金类型">
        <Select value={filters.type} onChange={(value) => setFilters({ ...filters, type: value })} options={["全部", ...depositTypes]} />
      </Field>
      <Field label="台账分类">
        <Select value={filters.ledgerClass} onChange={(value) => setFilters({ ...filters, ledgerClass: value })} options={["全部", "平台类", "非平台类"]} />
      </Field>
      <div className="flex items-end gap-2">
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
      <div className="text-lg font-semibold text-slate-700">当前没有匹配的保证金记录</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选，或新增一笔保证金付款/退回申请继续演示闭环。</div>
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

function Alert({ children, tone }: { children: ReactNode; tone: "red" | "blue" }) {
  const className = tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700";
  return <div className={`rounded-md border p-3 text-sm ${className}`}>{children}</div>;
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

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <textarea className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)} />;
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
  return <div className="flex min-w-40 flex-wrap gap-2 text-sm text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    ["付款成功", "已完成", "同步成功", "在保", "部分退回"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "审批通过", "付款中", "退回中", "待财务确认到账", "同步中"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["已驳回", "付款失败", "同步失败", "付款失败待处理"].includes(status)
          ? "border-red-200 bg-red-50 text-red-600"
          : ["已全额退回"].includes(status)
            ? "border-slate-200 bg-slate-100 text-slate-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
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

function filterPayments(rows: DepositPaymentApplication[], filters: { keyword: string; status: string; type: string; ledgerClass: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.applicant, item.store ?? "", item.adAccount ?? "", item.supplier ?? "", item.description].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.depositType, filters.type);
  });
}

function filterReturns(rows: DepositReturnApplication[], filters: { keyword: string; status: string; type: string; ledgerClass: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.applicant, item.description, ...item.lines.map((line) => `${line.ledgerCode} ${line.store ?? ""} ${line.adAccount ?? ""}`)].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.depositType, filters.type);
  });
}

function filterLedgers(rows: DepositLedger[], filters: { keyword: string; status: string; type: string; ledgerClass: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.sourcePaymentCode, item.store ?? "", item.adAccount ?? "", item.supplier ?? "", item.contractCode ?? ""].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.depositType, filters.type) && matchFilter(item.ledgerClass, filters.ledgerClass);
  });
}

function matchFilter(value: string, filter: string, ...alternates: string[]) {
  return filter === "全部" || value === filter || alternates.includes(filter);
}

function buildSteps(steps: ApprovalStep[], status: string, applicant: string, comment: string): ApprovalStep[] {
  const node = status === "草稿" ? "保存草稿" : status === "审批中" ? "申请人提交" : status === "已驳回" ? "财务 BP" : status === "待财务确认到账" ? "财务 BP" : status === "已完成" ? "财务确认到账" : status;
  return [{ node, approver: status === "草稿" || status === "审批中" ? applicant : "林一", date: today, comment }, ...steps];
}

function buildReturnLine(ledger: DepositLedger, amount: number): ReturnLine {
  return {
    id: `ret-line-${Date.now()}-${ledger.id}`,
    ledgerId: ledger.id,
    ledgerCode: ledger.code,
    depositType: ledger.depositType as ReturnFormState["depositType"],
    adPlatform: ledger.adPlatform,
    adAccount: ledger.adAccount,
    thirdAccount: ledger.thirdAccount,
    store: ledger.store,
    balanceAmount: ledger.balanceAmount,
    occupiedBefore: ledger.occupiedAmount,
    returnAmount: Math.max(amount, 0)
  };
}

function isPlatformDeposit(type: DepositType) {
  return type === "店铺保证金" || type === "营销推广保证金";
}

function isReturnableDepositType(type: DepositType): type is ReturnFormState["depositType"] {
  return type === "店铺保证金" || type === "营销推广保证金";
}

function normalizePaymentFormPatch(current: PaymentFormState, patch: Partial<PaymentFormState>) {
  const next = { ...current, ...patch };
  if (patch.depositType) {
    return {
      ...next,
      contractId: "contract-001",
      storeId: "store-001",
      thirdAccount: "TP-天猫-示例旗舰店",
      adPlatform: "巨量千川",
      adAccountId: "ad-001",
      paymentLink: isPlatformDeposit(patch.depositType) ? current.paymentLink || "https://mock.platform.example/deposit/new" : "-",
      attachmentName: ["付招投标保证金", "退招投标保证金"].includes(patch.depositType) ? current.attachmentName || "保证金缴纳通知.pdf" : current.attachmentName
    };
  }
  if (patch.adPlatform) {
    const firstAccount = adAccountOptions.find((item) => item.platform === patch.adPlatform);
    return { ...next, adAccountId: firstAccount?.id ?? "" };
  }
  if (patch.storeId) {
    const store = storeOptions.find((item) => item.id === patch.storeId);
    return { ...next, thirdAccount: store?.thirdAccount ?? next.thirdAccount, accountingEntity: store?.accountingEntity ?? next.accountingEntity };
  }
  if (patch.adAccountId) {
    const account = adAccountOptions.find((item) => item.id === patch.adAccountId);
    return { ...next, accountingEntity: account?.accountingEntity ?? next.accountingEntity };
  }
  return next;
}

function normalizeReturnFormPatch(current: ReturnFormState, patch: Partial<ReturnFormState>) {
  const next = { ...current, ...patch };
  if (patch.accountingEntity || patch.depositType) return { ...next, lines: patch.lines ?? [] };
  return next;
}

function formatMoney(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `CNY ${normalized.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "ledger", label: "保证金台账" },
  { key: "payments", label: "保证金付款申请单" },
  { key: "returns", label: "保证金退回申请单" }
];
