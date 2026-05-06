"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type ViewMode = "applications" | "matters" | "expenses" | "closes";
type ApplicationStatus = "草稿" | "审批中" | "已驳回" | "审批通过";
type MatterStatus = "未使用" | "进行中" | "待关闭" | "关闭审批中" | "已关闭" | "已驳回";
type CloseStatus = "草稿" | "审批中" | "已驳回" | "已关闭";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type SourceBusinessType = "个人垫付报销" | "对公付款" | "专项备用金" | "发票核销";

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface MarketingPlanOption {
  id: string;
  code: string;
  name: string;
  category: string;
  budgetDepartment: string;
  totalAmount: number;
  remainingAmount: number;
}

interface MarketingActivityOption {
  id: string;
  name: string;
  type: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  expenseMajor: string;
  expenseMinor: string;
  managementSubject: string;
  brand: string;
}

interface MatterLine {
  id: string;
  planId: string;
  planName: string;
  planCategory: string;
  planRemainingAmount: number;
  activityId: string;
  activityName: string;
  activityType: string;
  budgetDepartment: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  ownershipTag: string;
  amount: number;
  expenseMajor: string;
  expenseMinor: string;
  managementSubject: string;
  brand: string;
}

interface MarketingMatterApplication {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  createdAt: string;
  matterName: string;
  totalAmount: number;
  description: string;
  status: ApplicationStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  budgetLocked: boolean;
  budgetFlowNo: string;
  generatedMatterId?: string;
  lines: MatterLine[];
  attachments: string[];
  steps: ApprovalStep[];
}

interface MarketingMatter {
  id: string;
  code: string;
  applicationCode: string;
  applicant: string;
  applicantDepartment: string;
  matterName: string;
  status: MatterStatus;
  totalAmount: number;
  usedAmount: number;
  activityType: string;
  activityName: string;
  activityAmount: number;
  useDepartment: string;
  budgetDepartment: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  relatedPlan: string;
  planCategory: string;
  occupiedBudget: number;
  remainingAmount: number;
  invoiceOrAdvanceCleared: boolean;
  appliedAt: string;
  reminderDate: string;
  lastUsedAt: string;
  closeCode: string;
  closeDescription: string;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  hasPendingExternalBill: boolean;
  steps: ApprovalStep[];
}

interface MatterExpense {
  id: string;
  code: string;
  documentName: string;
  appliedAt: string;
  applicant: string;
  expenseDate: string;
  amount: number;
  matterCode: string;
  matterName: string;
  activityName: string;
  expenseMinor: string;
  expenseMajor: string;
  secondBudgetSubject: string;
  firstBudgetSubject: string;
  managementSubject: string;
  brand: string;
  sourceBusinessType: SourceBusinessType;
  sourceSystem: string;
  writeOffStatus: "待核销" | "已核销" | "核销失败";
  writeOffDate: string;
  payee: string;
  useDepartment: string;
  remark: string;
}

interface CloseApplication {
  id: string;
  code: string;
  title: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  createdAt: string;
  matterId: string;
  matterCode: string;
  matterName: string;
  totalAmount: number;
  activityAmount: number;
  usedAmount: number;
  useDepartment: string;
  activityType: string;
  activityName: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  applicationDescription: string;
  closeDescription: string;
  status: CloseStatus;
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  failureReason?: string;
  steps: ApprovalStep[];
}

interface MatterFormState {
  editingId?: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  matterName: string;
  totalAmount: string;
  description: string;
  lines: MatterLine[];
}

interface ExpenseFormState {
  matterId: string;
  expenseDate: string;
  amount: string;
  expenseMinor: string;
  sourceBusinessType: SourceBusinessType;
  payee: string;
  remark: string;
}

interface CloseFormState {
  matterId: string;
  closeDescription: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const planOptions: MarketingPlanOption[] = [
  { id: "plan-001", code: "YXJH-2026-051", name: "天猫 618 品牌声量放大计划", category: "大促投放", budgetDepartment: "电商运营部", totalAmount: 220000, remainingAmount: 76000 },
  { id: "plan-002", code: "YXJH-2026-052", name: "抖音新品直播引流计划", category: "直播引流", budgetDepartment: "直播运营部", totalAmount: 180000, remainingAmount: 68000 },
  { id: "plan-003", code: "YXJH-2026-053", name: "小红书达人种草计划", category: "内容种草", budgetDepartment: "内容营销部", totalAmount: 150000, remainingAmount: 42000 },
  { id: "plan-004", code: "YXJH-2026-054", name: "华南渠道快闪推广计划", category: "线下活动", budgetDepartment: "渠道市场部", totalAmount: 90000, remainingAmount: 39000 }
];

const activityOptions: MarketingActivityOption[] = [
  { id: "activity-001", name: "天猫 618 信息流蓄水", type: "AD信息流", firstBudgetSubject: "渠道营销", secondBudgetSubject: "信息流投放", expenseMajor: "投放费用", expenseMinor: "信息流消耗", managementSubject: "营销投放费", brand: "花西子" },
  { id: "activity-002", name: "抖音新品直播间加热", type: "直播推广", firstBudgetSubject: "直播营销", secondBudgetSubject: "直播间投流", expenseMajor: "直播费用", expenseMinor: "直播加热", managementSubject: "直播推广费", brand: "花西子" },
  { id: "activity-003", name: "小红书达人新品种草", type: "内容种草", firstBudgetSubject: "达人合作", secondBudgetSubject: "达人投放", expenseMajor: "内容费用", expenseMinor: "达人合作费", managementSubject: "达人营销费", brand: "花西子" },
  { id: "activity-004", name: "华南商超快闪物料", type: "线下推广", firstBudgetSubject: "渠道活动", secondBudgetSubject: "物料制作", expenseMajor: "活动费用", expenseMinor: "活动物料", managementSubject: "渠道推广费", brand: "示例品牌" },
  { id: "activity-005", name: "京东搜索推广冲刺", type: "搜索推广", firstBudgetSubject: "渠道营销", secondBudgetSubject: "搜索推广", expenseMajor: "投放费用", expenseMinor: "搜索消耗", managementSubject: "营销投放费", brand: "花西子" }
];

const defaultLine = (index = 1): MatterLine => {
  const plan = planOptions[0];
  const activity = activityOptions[0];
  return {
    id: `line-${Date.now()}-${index}`,
    planId: plan.id,
    planName: plan.name,
    planCategory: plan.category,
    planRemainingAmount: plan.remainingAmount,
    activityId: activity.id,
    activityName: activity.name,
    activityType: activity.type,
    budgetDepartment: plan.budgetDepartment,
    firstBudgetSubject: activity.firstBudgetSubject,
    secondBudgetSubject: activity.secondBudgetSubject,
    ownershipTag: "品牌运营",
    amount: index === 1 ? 28000 : 0,
    expenseMajor: activity.expenseMajor,
    expenseMinor: activity.expenseMinor,
    managementSubject: activity.managementSubject,
    brand: activity.brand
  };
};

const initialApplications: MarketingMatterApplication[] = [
  {
    id: "app-001",
    code: "YXSX-SQ-2026-001",
    title: "营销事项申请单",
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "品牌运营中心",
    position: "营销专员",
    createdAt: "2026-05-01",
    matterName: "天猫 618 信息流蓄水事项",
    totalAmount: 48000,
    description: "用于天猫 618 预热期信息流投放和搜索承接。",
    status: "审批通过",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-01 17:20:00",
    syncBatchNo: "SYNC-MATTER-2026050101",
    budgetLocked: true,
    budgetFlowNo: "BUD-LOCK-2026050101",
    generatedMatterId: "matter-001",
    lines: [
      { ...defaultLine(1), id: "line-001", amount: 30000 },
      { ...defaultLine(2), id: "line-002", activityId: "activity-005", activityName: "京东搜索推广冲刺", activityType: "搜索推广", secondBudgetSubject: "搜索推广", expenseMinor: "搜索消耗", amount: 18000 }
    ],
    attachments: ["618 投放排期.xlsx", "预算占用说明.pdf"],
    steps: [
      { node: "申请人提交", approver: "陈晨", date: "2026-05-01", comment: "提交营销事项申请" },
      { node: "财务 BP 审核", approver: "林一", date: "2026-05-01", comment: "预算科目和金额校验通过" },
      { node: "业务领导审批", approver: "周岚", date: "2026-05-01", comment: "同意执行，写入事项台账" }
    ]
  },
  {
    id: "app-002",
    code: "YXSX-SQ-2026-002",
    title: "营销事项申请单",
    applicant: "李响",
    company: "上海示例贸易有限公司",
    department: "直播运营部",
    position: "直播运营",
    createdAt: "2026-05-02",
    matterName: "抖音直播间新品加热事项",
    totalAmount: 36000,
    description: "新品直播首发投流加热和短视频回流。",
    status: "审批中",
    sourceSystem: "[OA] 营销事项审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: [{ ...defaultLine(1), id: "line-003", planId: "plan-002", planName: "抖音新品直播引流计划", planCategory: "直播引流", activityId: "activity-002", activityName: "抖音新品直播间加热", activityType: "直播推广", budgetDepartment: "直播运营部", firstBudgetSubject: "直播营销", secondBudgetSubject: "直播间投流", expenseMajor: "直播费用", expenseMinor: "直播加热", managementSubject: "直播推广费", amount: 36000 }],
    attachments: ["直播推广排期.png"],
    steps: [{ node: "申请人提交", approver: "李响", date: "2026-05-02", comment: "等待财务 BP 审核" }]
  },
  {
    id: "app-003",
    code: "YXSX-SQ-2026-003",
    title: "营销事项申请单",
    applicant: "王珊",
    company: "上海示例贸易有限公司",
    department: "品牌产品中心",
    position: "产品营销",
    createdAt: "2026-05-03",
    matterName: "新品口红买赠物料事项",
    totalAmount: 28000,
    description: "新品上市买赠物料与站内资源位露出。",
    status: "草稿",
    sourceSystem: "[业财中台] 本地草稿",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: [{ ...defaultLine(1), id: "line-004", planId: "", planName: "", planCategory: "", planRemainingAmount: 0, activityId: "activity-004", activityName: "华南商超快闪物料", activityType: "线下推广", budgetDepartment: "品牌产品中心", firstBudgetSubject: "渠道活动", secondBudgetSubject: "物料制作", ownershipTag: "新品上市", expenseMajor: "活动费用", expenseMinor: "活动物料", managementSubject: "渠道推广费", amount: 28000 }],
    attachments: [],
    steps: [{ node: "保存草稿", approver: "王珊", date: "2026-05-03", comment: "待补充活动明细" }]
  },
  {
    id: "app-004",
    code: "YXSX-SQ-2026-004",
    title: "营销事项申请单",
    applicant: "赵敏",
    company: "广州示例贸易有限公司",
    department: "渠道市场部",
    position: "渠道经理",
    createdAt: "2026-05-04",
    matterName: "华南渠道快闪执行事项",
    totalAmount: 39000,
    description: "快闪活动场地、物料和达人探店联动。",
    status: "已驳回",
    sourceSystem: "[OA] 营销事项审批",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-04 19:10:00",
    syncBatchNo: "SYNC-MATTER-2026050401",
    failureReason: "模拟驳回：缺少场地确认函，需补充附件后重新提交。",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: [{ ...defaultLine(1), id: "line-005", planId: "plan-004", planName: "华南渠道快闪推广计划", planCategory: "线下活动", planRemainingAmount: 39000, activityId: "activity-004", activityName: "华南商超快闪物料", activityType: "线下推广", budgetDepartment: "渠道市场部", firstBudgetSubject: "渠道活动", secondBudgetSubject: "物料制作", expenseMajor: "活动费用", expenseMinor: "活动物料", managementSubject: "渠道推广费", amount: 39000 }],
    attachments: ["快闪预算表.xlsx"],
    steps: [{ node: "财务 BP 审核", approver: "林一", date: "2026-05-04", comment: "驳回：附件不完整" }]
  },
  {
    id: "app-005",
    code: "YXSX-SQ-2026-005",
    title: "营销事项申请单",
    applicant: "周宁",
    company: "上海示例贸易有限公司",
    department: "内容营销部",
    position: "内容运营",
    createdAt: "2026-04-29",
    matterName: "小红书达人新品种草事项",
    totalAmount: 42000,
    description: "达人内容种草和图文笔记合作。",
    status: "审批通过",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-29 16:40:00",
    syncBatchNo: "SYNC-MATTER-2026042901",
    budgetLocked: true,
    budgetFlowNo: "BUD-LOCK-2026042901",
    generatedMatterId: "matter-002",
    lines: [{ ...defaultLine(1), id: "line-006", planId: "plan-003", planName: "小红书达人种草计划", planCategory: "内容种草", planRemainingAmount: 42000, activityId: "activity-003", activityName: "小红书达人新品种草", activityType: "内容种草", budgetDepartment: "内容营销部", firstBudgetSubject: "达人合作", secondBudgetSubject: "达人投放", expenseMajor: "内容费用", expenseMinor: "达人合作费", managementSubject: "达人营销费", amount: 42000 }],
    attachments: ["达人名单.pdf"],
    steps: [
      { node: "申请人提交", approver: "周宁", date: "2026-04-29", comment: "提交申请" },
      { node: "业务领导审批", approver: "周岚", date: "2026-04-29", comment: "同意执行" }
    ]
  },
  {
    id: "app-006",
    code: "YXSX-SQ-2026-006",
    title: "营销事项申请单",
    applicant: "高悦",
    company: "上海示例贸易有限公司",
    department: "品牌运营中心",
    position: "投放运营",
    createdAt: "2026-05-05",
    matterName: "京东搜索推广预算补充事项",
    totalAmount: 46000,
    description: "京东搜索推广预算补充。",
    status: "审批中",
    sourceSystem: "[OA] 营销事项审批",
    syncStatus: "同步中",
    lastSyncAt: "2026-05-05 18:30:00",
    syncBatchNo: "SYNC-MATTER-2026050502",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: [{ ...defaultLine(1), id: "line-007", activityId: "activity-005", activityName: "京东搜索推广冲刺", activityType: "搜索推广", secondBudgetSubject: "搜索推广", expenseMinor: "搜索消耗", amount: 46000 }],
    attachments: ["京东搜索消耗测算.xlsx"],
    steps: [{ node: "申请人提交", approver: "高悦", date: "2026-05-05", comment: "等待业务领导审批" }]
  },
  {
    id: "app-007",
    code: "YXSX-SQ-2026-007",
    title: "营销事项申请单",
    applicant: "苏晴",
    company: "上海示例贸易有限公司",
    department: "品牌运营中心",
    position: "活动运营",
    createdAt: "2026-05-05",
    matterName: "站内会员日会场推广事项",
    totalAmount: 32000,
    description: "会员日站内会场资源和内容热推。",
    status: "草稿",
    sourceSystem: "[业财中台] 本地草稿",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: [{ ...defaultLine(1), id: "line-008", amount: 32000 }],
    attachments: [],
    steps: [{ node: "保存草稿", approver: "苏晴", date: "2026-05-05", comment: "待提交" }]
  },
  {
    id: "app-008",
    code: "YXSX-SQ-2026-008",
    title: "营销事项申请单",
    applicant: "许言",
    company: "上海示例贸易有限公司",
    department: "品牌产品中心",
    position: "产品营销",
    createdAt: "2026-05-06",
    matterName: "新品试用装渠道物料事项",
    totalAmount: 24000,
    description: "产品中心新品试用装渠道物料。",
    status: "审批通过",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-06 09:10:00",
    syncBatchNo: "SYNC-MATTER-2026050601",
    budgetLocked: true,
    budgetFlowNo: "BUD-LOCK-2026050601",
    generatedMatterId: "matter-006",
    lines: [{ ...defaultLine(1), id: "line-009", planId: "", planName: "", planCategory: "", planRemainingAmount: 0, activityId: "activity-004", activityName: "华南商超快闪物料", activityType: "线下推广", budgetDepartment: "品牌产品中心", firstBudgetSubject: "渠道活动", secondBudgetSubject: "物料制作", ownershipTag: "新品上市", amount: 24000 }],
    attachments: ["试用装物料说明.pdf"],
    steps: [{ node: "业务领导审批", approver: "周岚", date: "2026-05-06", comment: "审批通过，预算已锁定" }]
  }
];

const initialMatters: MarketingMatter[] = [
  {
    id: "matter-001",
    code: "YXSX-TZ-2026-001",
    applicationCode: "YXSX-SQ-2026-001",
    applicant: "陈晨",
    applicantDepartment: "品牌运营中心",
    matterName: "天猫 618 信息流蓄水事项",
    status: "进行中",
    totalAmount: 48000,
    usedAmount: 32000,
    activityType: "AD信息流 / 搜索推广",
    activityName: "天猫 618 信息流蓄水、京东搜索推广冲刺",
    activityAmount: 48000,
    useDepartment: "电商运营部",
    budgetDepartment: "电商运营部",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    relatedPlan: "天猫 618 品牌声量放大计划",
    planCategory: "大促投放",
    occupiedBudget: 48000,
    remainingAmount: 16000,
    invoiceOrAdvanceCleared: true,
    appliedAt: "2026-05-01",
    reminderDate: "2026-05-04",
    lastUsedAt: "2026-05-05",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-05 15:20:00",
    syncBatchNo: "SYNC-MATTER-LEDGER-001",
    hasPendingExternalBill: false,
    steps: [
      { node: "审批通过", approver: "周岚", date: "2026-05-01", comment: "生成事项台账并占用预算" },
      { node: "个人垫付报销完成", approver: "系统模拟", date: "2026-05-05", comment: "回写已用金额 32,000.00" }
    ]
  },
  {
    id: "matter-002",
    code: "YXSX-TZ-2026-002",
    applicationCode: "YXSX-SQ-2026-005",
    applicant: "周宁",
    applicantDepartment: "内容营销部",
    matterName: "小红书达人新品种草事项",
    status: "待关闭",
    totalAmount: 42000,
    usedAmount: 42000,
    activityType: "内容种草",
    activityName: "小红书达人新品种草",
    activityAmount: 42000,
    useDepartment: "内容营销部",
    budgetDepartment: "内容营销部",
    firstBudgetSubject: "达人合作",
    secondBudgetSubject: "达人投放",
    relatedPlan: "小红书达人种草计划",
    planCategory: "内容种草",
    occupiedBudget: 42000,
    remainingAmount: 0,
    invoiceOrAdvanceCleared: true,
    appliedAt: "2026-04-29",
    reminderDate: "2026-05-02",
    lastUsedAt: "2026-05-04",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[个人垫付报销] / [发票核销]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 20:00:00",
    syncBatchNo: "SYNC-MATTER-LEDGER-002",
    hasPendingExternalBill: false,
    steps: [{ node: "系统巡检", approver: "业财中台", date: "2026-05-06", comment: "事项已全额核销，提醒关闭" }]
  },
  {
    id: "matter-003",
    code: "YXSX-TZ-2026-003",
    applicationCode: "YXSX-SQ-2026-009",
    applicant: "马琳",
    applicantDepartment: "直播运营部",
    matterName: "抖音直播达人坑位费事项",
    status: "未使用",
    totalAmount: 30000,
    usedAmount: 0,
    activityType: "直播推广",
    activityName: "抖音新品直播间加热",
    activityAmount: 30000,
    useDepartment: "直播运营部",
    budgetDepartment: "直播运营部",
    firstBudgetSubject: "直播营销",
    secondBudgetSubject: "直播间投流",
    relatedPlan: "抖音新品直播引流计划",
    planCategory: "直播引流",
    occupiedBudget: 30000,
    remainingAmount: 30000,
    invoiceOrAdvanceCleared: false,
    appliedAt: "2026-05-03",
    reminderDate: "2026-05-06",
    lastUsedAt: "-",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[OA] 营销事项审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 16:00:00",
    syncBatchNo: "SYNC-MATTER-LEDGER-003",
    hasPendingExternalBill: false,
    steps: [{ node: "审批通过", approver: "周岚", date: "2026-05-03", comment: "事项生效，等待费用使用" }]
  },
  {
    id: "matter-004",
    code: "YXSX-TZ-2026-004",
    applicationCode: "YXSX-SQ-2026-010",
    applicant: "赵敏",
    applicantDepartment: "渠道市场部",
    matterName: "华南渠道陈列推广事项",
    status: "关闭审批中",
    totalAmount: 26000,
    usedAmount: 22000,
    activityType: "线下推广",
    activityName: "华南商超快闪物料",
    activityAmount: 26000,
    useDepartment: "渠道市场部",
    budgetDepartment: "渠道市场部",
    firstBudgetSubject: "渠道活动",
    secondBudgetSubject: "物料制作",
    relatedPlan: "华南渠道快闪推广计划",
    planCategory: "线下活动",
    occupiedBudget: 26000,
    remainingAmount: 4000,
    invoiceOrAdvanceCleared: true,
    appliedAt: "2026-04-25",
    reminderDate: "2026-04-28",
    lastUsedAt: "2026-05-02",
    closeCode: "YXSX-GB-2026-001",
    closeDescription: "剩余预算无需继续执行，申请关闭。",
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步中",
    lastSyncAt: "2026-05-06 09:40:00",
    syncBatchNo: "SYNC-MATTER-CLOSE-001",
    hasPendingExternalBill: false,
    steps: [{ node: "关闭申请提交", approver: "赵敏", date: "2026-05-06", comment: "等待财务 BP 审批关闭" }]
  },
  {
    id: "matter-005",
    code: "YXSX-TZ-2026-005",
    applicationCode: "YXSX-SQ-2026-011",
    applicant: "苏晴",
    applicantDepartment: "品牌运营中心",
    matterName: "站内会员日会场推广事项",
    status: "已关闭",
    totalAmount: 18000,
    usedAmount: 18000,
    activityType: "AD信息流",
    activityName: "天猫 618 信息流蓄水",
    activityAmount: 18000,
    useDepartment: "电商运营部",
    budgetDepartment: "电商运营部",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    relatedPlan: "天猫 618 品牌声量放大计划",
    planCategory: "大促投放",
    occupiedBudget: 18000,
    remainingAmount: 0,
    invoiceOrAdvanceCleared: true,
    appliedAt: "2026-04-20",
    reminderDate: "2026-04-23",
    lastUsedAt: "2026-04-28",
    closeCode: "YXSX-GB-2026-002",
    closeDescription: "费用已全部核销，事项关闭。",
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-28 18:00:00",
    syncBatchNo: "SYNC-MATTER-CLOSE-002",
    hasPendingExternalBill: false,
    steps: [{ node: "审批通过关闭", approver: "顾可", date: "2026-04-28", comment: "事项已关闭" }]
  },
  {
    id: "matter-006",
    code: "YXSX-TZ-2026-006",
    applicationCode: "YXSX-SQ-2026-008",
    applicant: "许言",
    applicantDepartment: "品牌产品中心",
    matterName: "新品试用装渠道物料事项",
    status: "未使用",
    totalAmount: 24000,
    usedAmount: 0,
    activityType: "线下推广",
    activityName: "华南商超快闪物料",
    activityAmount: 24000,
    useDepartment: "品牌产品中心",
    budgetDepartment: "品牌产品中心",
    firstBudgetSubject: "渠道活动",
    secondBudgetSubject: "物料制作",
    relatedPlan: "-",
    planCategory: "新品上市",
    occupiedBudget: 24000,
    remainingAmount: 24000,
    invoiceOrAdvanceCleared: false,
    appliedAt: "2026-05-06",
    reminderDate: "2026-05-09",
    lastUsedAt: "-",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-06 09:10:00",
    syncBatchNo: "SYNC-MATTER-LEDGER-006",
    hasPendingExternalBill: false,
    steps: [{ node: "审批通过", approver: "周岚", date: "2026-05-06", comment: "生成事项台账" }]
  },
  {
    id: "matter-007",
    code: "YXSX-TZ-2026-007",
    applicationCode: "YXSX-SQ-2026-012",
    applicant: "高悦",
    applicantDepartment: "品牌运营中心",
    matterName: "腾讯广告华南直营推广事项",
    status: "进行中",
    totalAmount: 35000,
    usedAmount: 12000,
    activityType: "AD信息流",
    activityName: "天猫 618 信息流蓄水",
    activityAmount: 35000,
    useDepartment: "渠道市场部",
    budgetDepartment: "渠道市场部",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    relatedPlan: "华南渠道快闪推广计划",
    planCategory: "线下活动",
    occupiedBudget: 35000,
    remainingAmount: 23000,
    invoiceOrAdvanceCleared: false,
    appliedAt: "2026-04-30",
    reminderDate: "2026-05-03",
    lastUsedAt: "2026-05-05",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[对公付款] / [ERP]",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 21:00:00",
    syncBatchNo: "SYNC-MATTER-LEDGER-007",
    failureReason: "ERP 凭证模拟同步失败：预算科目映射缺失 [SUBJECT-404]",
    hasPendingExternalBill: true,
    steps: [{ node: "对公付款完成", approver: "系统模拟", date: "2026-05-05", comment: "回写已用金额 12,000.00，同步失败待重试" }]
  },
  {
    id: "matter-008",
    code: "YXSX-TZ-2026-008",
    applicationCode: "YXSX-SQ-2026-013",
    applicant: "叶然",
    applicantDepartment: "电商运营部",
    matterName: "京东站外广告转化提升事项",
    status: "已驳回",
    totalAmount: 27000,
    usedAmount: 0,
    activityType: "搜索推广",
    activityName: "京东搜索推广冲刺",
    activityAmount: 27000,
    useDepartment: "电商运营部",
    budgetDepartment: "电商运营部",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "搜索推广",
    relatedPlan: "天猫 618 品牌声量放大计划",
    planCategory: "大促投放",
    occupiedBudget: 0,
    remainingAmount: 27000,
    invoiceOrAdvanceCleared: false,
    appliedAt: "2026-05-01",
    reminderDate: "2026-05-04",
    lastUsedAt: "-",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[OA] 营销事项审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    hasPendingExternalBill: false,
    steps: [{ node: "财务 BP 审核", approver: "林一", date: "2026-05-01", comment: "驳回：预算说明不充分" }]
  }
];

const initialExpenses: MatterExpense[] = [
  { id: "expense-001", code: "BX-2026-0412", documentName: "个人垫付报销单", appliedAt: "2026-05-05", applicant: "陈晨", expenseDate: "2026-05-04", amount: 18000, matterCode: "YXSX-TZ-2026-001", matterName: "天猫 618 信息流蓄水事项", activityName: "天猫 618 信息流蓄水", expenseMinor: "信息流消耗", expenseMajor: "投放费用", secondBudgetSubject: "信息流投放", firstBudgetSubject: "渠道营销", managementSubject: "营销投放费", brand: "花西子", sourceBusinessType: "个人垫付报销", sourceSystem: "[个人垫付] 报销流程", writeOffStatus: "已核销", writeOffDate: "2026-05-05", payee: "陈晨", useDepartment: "电商运营部", remark: "预热期信息流账户垫付" },
  { id: "expense-002", code: "FK-2026-0520", documentName: "对公付款申请单", appliedAt: "2026-05-05", applicant: "陈晨", expenseDate: "2026-05-05", amount: 14000, matterCode: "YXSX-TZ-2026-001", matterName: "天猫 618 信息流蓄水事项", activityName: "京东搜索推广冲刺", expenseMinor: "搜索消耗", expenseMajor: "投放费用", secondBudgetSubject: "搜索推广", firstBudgetSubject: "渠道营销", managementSubject: "营销投放费", brand: "花西子", sourceBusinessType: "对公付款", sourceSystem: "[对公付款] 付款完成", writeOffStatus: "已核销", writeOffDate: "2026-05-05", payee: "上海星图广告有限公司", useDepartment: "电商运营部", remark: "供应商广告消耗结算" },
  { id: "expense-003", code: "BX-2026-0398", documentName: "个人垫付报销单", appliedAt: "2026-05-03", applicant: "周宁", expenseDate: "2026-05-02", amount: 22000, matterCode: "YXSX-TZ-2026-002", matterName: "小红书达人新品种草事项", activityName: "小红书达人新品种草", expenseMinor: "达人合作费", expenseMajor: "内容费用", secondBudgetSubject: "达人投放", firstBudgetSubject: "达人合作", managementSubject: "达人营销费", brand: "花西子", sourceBusinessType: "个人垫付报销", sourceSystem: "[个人垫付] 报销流程", writeOffStatus: "已核销", writeOffDate: "2026-05-03", payee: "达人 KOL 组合", useDepartment: "内容营销部", remark: "图文笔记发布完成" },
  { id: "expense-004", code: "FPHX-2026-0072", documentName: "发票核销单", appliedAt: "2026-05-04", applicant: "周宁", expenseDate: "2026-05-04", amount: 20000, matterCode: "YXSX-TZ-2026-002", matterName: "小红书达人新品种草事项", activityName: "小红书达人新品种草", expenseMinor: "达人合作费", expenseMajor: "内容费用", secondBudgetSubject: "达人投放", firstBudgetSubject: "达人合作", managementSubject: "达人营销费", brand: "花西子", sourceBusinessType: "发票核销", sourceSystem: "[发票核销] 到票核销", writeOffStatus: "已核销", writeOffDate: "2026-05-04", payee: "杭州内容星选传媒有限公司", useDepartment: "内容营销部", remark: "发票到票后完成核销" },
  { id: "expense-005", code: "FK-2026-0491", documentName: "对公付款申请单", appliedAt: "2026-05-02", applicant: "赵敏", expenseDate: "2026-05-02", amount: 22000, matterCode: "YXSX-TZ-2026-004", matterName: "华南渠道陈列推广事项", activityName: "华南商超快闪物料", expenseMinor: "活动物料", expenseMajor: "活动费用", secondBudgetSubject: "物料制作", firstBudgetSubject: "渠道活动", managementSubject: "渠道推广费", brand: "示例品牌", sourceBusinessType: "对公付款", sourceSystem: "[对公付款] 付款完成", writeOffStatus: "已核销", writeOffDate: "2026-05-02", payee: "广州场景品牌管理有限公司", useDepartment: "渠道市场部", remark: "陈列物料制作" },
  { id: "expense-006", code: "BX-2026-0331", documentName: "个人垫付报销单", appliedAt: "2026-04-28", applicant: "苏晴", expenseDate: "2026-04-27", amount: 18000, matterCode: "YXSX-TZ-2026-005", matterName: "站内会员日会场推广事项", activityName: "天猫 618 信息流蓄水", expenseMinor: "信息流消耗", expenseMajor: "投放费用", secondBudgetSubject: "信息流投放", firstBudgetSubject: "渠道营销", managementSubject: "营销投放费", brand: "花西子", sourceBusinessType: "个人垫付报销", sourceSystem: "[个人垫付] 报销流程", writeOffStatus: "已核销", writeOffDate: "2026-04-28", payee: "苏晴", useDepartment: "电商运营部", remark: "会员日会场资源" },
  { id: "expense-007", code: "FK-2026-0528", documentName: "对公付款申请单", appliedAt: "2026-05-05", applicant: "高悦", expenseDate: "2026-05-05", amount: 12000, matterCode: "YXSX-TZ-2026-007", matterName: "腾讯广告华南直营推广事项", activityName: "天猫 618 信息流蓄水", expenseMinor: "信息流消耗", expenseMajor: "投放费用", secondBudgetSubject: "信息流投放", firstBudgetSubject: "渠道营销", managementSubject: "营销投放费", brand: "花西子", sourceBusinessType: "对公付款", sourceSystem: "[ERP] 凭证同步失败", writeOffStatus: "核销失败", writeOffDate: "-", payee: "腾讯广告服务商", useDepartment: "渠道市场部", remark: "预算科目映射缺失" },
  { id: "expense-008", code: "BYJ-2026-0148", documentName: "专项备用金报销单", appliedAt: "2026-05-01", applicant: "李响", expenseDate: "2026-04-30", amount: 8000, matterCode: "YXSX-TZ-2026-003", matterName: "抖音直播达人坑位费事项", activityName: "抖音新品直播间加热", expenseMinor: "直播加热", expenseMajor: "直播费用", secondBudgetSubject: "直播间投流", firstBudgetSubject: "直播营销", managementSubject: "直播推广费", brand: "花西子", sourceBusinessType: "专项备用金", sourceSystem: "[专项备用金] 报销完成", writeOffStatus: "待核销", writeOffDate: "-", payee: "直播间运营组", useDepartment: "直播运营部", remark: "待财务核销确认" },
  { id: "expense-009", code: "BX-2026-0401", documentName: "个人垫付报销单", appliedAt: "2026-05-03", applicant: "赵敏", expenseDate: "2026-05-01", amount: 5000, matterCode: "YXSX-TZ-2026-004", matterName: "华南渠道陈列推广事项", activityName: "华南商超快闪物料", expenseMinor: "活动物料", expenseMajor: "活动费用", secondBudgetSubject: "物料制作", firstBudgetSubject: "渠道活动", managementSubject: "渠道推广费", brand: "示例品牌", sourceBusinessType: "个人垫付报销", sourceSystem: "[个人垫付] 报销流程", writeOffStatus: "待核销", writeOffDate: "-", payee: "赵敏", useDepartment: "渠道市场部", remark: "存在待核销单据，演示阻止关闭" },
  { id: "expense-010", code: "FPHX-2026-0061", documentName: "发票核销单", appliedAt: "2026-04-29", applicant: "苏晴", expenseDate: "2026-04-29", amount: 6000, matterCode: "YXSX-TZ-2026-005", matterName: "站内会员日会场推广事项", activityName: "天猫 618 信息流蓄水", expenseMinor: "信息流消耗", expenseMajor: "投放费用", secondBudgetSubject: "信息流投放", firstBudgetSubject: "渠道营销", managementSubject: "营销投放费", brand: "花西子", sourceBusinessType: "发票核销", sourceSystem: "[发票核销] 到票核销", writeOffStatus: "已核销", writeOffDate: "2026-04-29", payee: "上海星图广告有限公司", useDepartment: "电商运营部", remark: "补充发票核销记录" },
  { id: "expense-011", code: "FK-2026-0456", documentName: "对公付款申请单", appliedAt: "2026-04-26", applicant: "赵敏", expenseDate: "2026-04-26", amount: 10000, matterCode: "YXSX-TZ-2026-004", matterName: "华南渠道陈列推广事项", activityName: "华南商超快闪物料", expenseMinor: "活动物料", expenseMajor: "活动费用", secondBudgetSubject: "物料制作", firstBudgetSubject: "渠道活动", managementSubject: "渠道推广费", brand: "示例品牌", sourceBusinessType: "对公付款", sourceSystem: "[对公付款] 付款完成", writeOffStatus: "已核销", writeOffDate: "2026-04-26", payee: "广州物料制作有限公司", useDepartment: "渠道市场部", remark: "物料首付款" },
  { id: "expense-012", code: "BYJ-2026-0131", documentName: "专项备用金报销单", appliedAt: "2026-04-28", applicant: "周宁", expenseDate: "2026-04-27", amount: 9000, matterCode: "YXSX-TZ-2026-002", matterName: "小红书达人新品种草事项", activityName: "小红书达人新品种草", expenseMinor: "达人合作费", expenseMajor: "内容费用", secondBudgetSubject: "达人投放", firstBudgetSubject: "达人合作", managementSubject: "达人营销费", brand: "花西子", sourceBusinessType: "专项备用金", sourceSystem: "[专项备用金] 报销完成", writeOffStatus: "已核销", writeOffDate: "2026-04-28", payee: "内容营销部", useDepartment: "内容营销部", remark: "样品寄送和拍摄垫付" }
];

const initialCloseApplications: CloseApplication[] = [
  {
    id: "close-001",
    code: "YXSX-GB-2026-001",
    title: "营销事项关闭单",
    applicant: "赵敏",
    company: "广州示例贸易有限公司",
    department: "渠道市场部",
    position: "渠道经理",
    createdAt: "2026-05-06",
    matterId: "matter-004",
    matterCode: "YXSX-TZ-2026-004",
    matterName: "华南渠道陈列推广事项",
    totalAmount: 26000,
    activityAmount: 26000,
    usedAmount: 22000,
    useDepartment: "渠道市场部",
    activityType: "线下推广",
    activityName: "华南商超快闪物料",
    firstBudgetSubject: "渠道活动",
    secondBudgetSubject: "物料制作",
    applicationDescription: "快闪渠道陈列推广。",
    closeDescription: "剩余预算无需继续执行，申请关闭。",
    status: "审批中",
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步中",
    lastSyncAt: "2026-05-06 09:40:00",
    steps: [{ node: "申请人提交", approver: "赵敏", date: "2026-05-06", comment: "提交关闭申请" }]
  },
  {
    id: "close-002",
    code: "YXSX-GB-2026-002",
    title: "营销事项关闭单",
    applicant: "苏晴",
    company: "上海示例贸易有限公司",
    department: "品牌运营中心",
    position: "活动运营",
    createdAt: "2026-04-28",
    matterId: "matter-005",
    matterCode: "YXSX-TZ-2026-005",
    matterName: "站内会员日会场推广事项",
    totalAmount: 18000,
    activityAmount: 18000,
    usedAmount: 18000,
    useDepartment: "电商运营部",
    activityType: "AD信息流",
    activityName: "天猫 618 信息流蓄水",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    applicationDescription: "会员日站内推广。",
    closeDescription: "费用已全部核销，事项关闭。",
    status: "已关闭",
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-28 18:00:00",
    steps: [{ node: "财务主管审批", approver: "顾可", date: "2026-04-28", comment: "同意关闭事项" }]
  },
  {
    id: "close-003",
    code: "YXSX-GB-2026-003",
    title: "营销事项关闭单",
    applicant: "高悦",
    company: "上海示例贸易有限公司",
    department: "品牌运营中心",
    position: "投放运营",
    createdAt: "2026-05-05",
    matterId: "matter-007",
    matterCode: "YXSX-TZ-2026-007",
    matterName: "腾讯广告华南直营推广事项",
    totalAmount: 35000,
    activityAmount: 35000,
    usedAmount: 12000,
    useDepartment: "渠道市场部",
    activityType: "AD信息流",
    activityName: "天猫 618 信息流蓄水",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    applicationDescription: "华南直营广告推广。",
    closeDescription: "计划调整，申请关闭未使用部分。",
    status: "已驳回",
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 19:30:00",
    failureReason: "模拟驳回：存在审批中付款或核销单据，不能关闭。",
    steps: [{ node: "财务 BP 审核", approver: "林一", date: "2026-05-05", comment: "存在未完成外部单据，驳回关闭" }]
  }
];

const defaultForm: MatterFormState = {
  applicant: "陈晨",
  company: "上海示例贸易有限公司",
  department: "品牌运营中心",
  position: "营销专员",
  matterName: "新营销事项",
  totalAmount: "28000",
  description: "用于本月营销活动执行，审批通过后模拟占用预算。",
  lines: [defaultLine(1)]
};

export default function MarketingMattersPage() {
  const [view, setView] = useState<ViewMode>("matters");
  const [applications, setApplications] = useState(initialApplications);
  const [matters, setMatters] = useState(initialMatters);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [closeApplications, setCloseApplications] = useState(initialCloseApplications);
  const [filters, setFilters] = useState({ keyword: "", status: "全部", department: "全部", activity: "", expenseMinor: "全部" });
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<MatterFormState | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<{ type: ViewMode; item: MarketingMatterApplication | MarketingMatter | MatterExpense | CloseApplication } | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState | null>(null);
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string>>({});
  const [closeForm, setCloseForm] = useState<CloseFormState | null>(null);
  const [closeErrors, setCloseErrors] = useState<Record<string, string>>({});

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const { simulateExpenseUse } = useMatterUpdate(setMatters, setExpenses, showToast);

  const filteredApplications = useMemo(() => filterApplications(applications, filters), [applications, filters]);
  const filteredMatters = useMemo(() => filterMatters(matters, filters), [matters, filters]);
  const filteredExpenses = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);
  const filteredCloseApplications = useMemo(() => filterCloseApplications(closeApplications, filters), [closeApplications, filters]);

  const stats = useMemo(() => {
    const monthMatters = matters.filter((item) => item.appliedAt.startsWith("2026-05"));
    const warningCount = matters.filter((item) => isReminder(item) || item.syncStatus === "同步失败").length;
    return [
      { label: "本月事项总额", value: formatMoney(sumBy(monthMatters, "totalAmount")), sub: `${monthMatters.length} 个事项` },
      { label: "待核销金额", value: formatMoney(sumBy(matters, "remainingAmount")), sub: "事项总额 - 已用金额" },
      { label: "异常预警数", value: `${warningCount}`, sub: "超提醒日或同步失败" },
      { label: "预算已锁定", value: formatMoney(sumBy(matters, "occupiedBudget")), sub: "审批通过后模拟占用" }
    ];
  }, [matters]);

  const rows = {
    applications: filteredApplications,
    matters: filteredMatters,
    expenses: filteredExpenses,
    closes: filteredCloseApplications
  }[view];

  function simulateQuery() {
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 650);
  }

  function resetFilters() {
    setFilters({ keyword: "", status: "全部", department: "全部", activity: "", expenseMinor: "全部" });
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 450);
  }

  function openNewForm() {
    setForm({ ...defaultForm, lines: [defaultLine(1)] });
    setFormErrors({});
  }

  function openEditForm(application: MarketingMatterApplication) {
    setForm({
      editingId: application.id,
      applicant: application.applicant,
      company: application.company,
      department: application.department,
      position: application.position,
      matterName: application.matterName,
      totalAmount: String(application.totalAmount),
      description: application.description,
      lines: application.lines.map((line) => ({ ...line }))
    });
    setFormErrors({});
  }

  function saveApplication(status: ApplicationStatus) {
    if (!form) return;
    const errors = validateForm(form, status !== "草稿");
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const next = buildApplication(form, status);
    if (form.editingId) {
      setApplications((items) => items.map((item) => (item.id === form.editingId ? { ...next, id: item.id, code: item.code, generatedMatterId: item.generatedMatterId } : item)));
    } else {
      setApplications((items) => [next, ...items]);
    }
    setForm(null);
    showToast(status === "草稿" ? "已保存，您可以在申请单页签找到草稿。" : "已模拟提交 OA，单据进入审批中。");
  }

  function approveApplication(application: MarketingMatterApplication) {
    if (application.status !== "审批中") return;
    setOverlayLoading("正在模拟财务 BP 与业务领导审批");
    window.setTimeout(() => {
      const matter = buildMatterFromApplication(application);
      setApplications((items) =>
        items.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: "审批通过",
                budgetLocked: true,
                budgetFlowNo: `BUD-LOCK-${Date.now().toString().slice(-8)}`,
                generatedMatterId: matter.id,
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                syncBatchNo: `SYNC-MATTER-${Date.now().toString().slice(-8)}`,
                steps: [
                  ...item.steps,
                  { node: "财务 BP 审核", approver: "林一", date: today, comment: "预算科目和金额校验通过" },
                  { node: "业务领导审批", approver: "周岚", date: today, comment: "审批通过，新增营销事项台账" }
                ]
              }
            : item
        )
      );
      setMatters((items) => [matter, ...items]);
      setView("matters");
      setOverlayLoading("");
      showToast("审批通过，已生成营销事项台账并模拟占用预算。");
    }, 850);
  }

  function rejectApplication(application: MarketingMatterApplication) {
    setApplications((items) =>
      items.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status: "已驳回",
              syncStatus: "同步失败",
              lastSyncAt: nowText,
              failureReason: "模拟驳回：活动明细和附件说明需要补充。",
              steps: [...item.steps, { node: "财务 BP 审核", approver: "林一", date: today, comment: "驳回：请补充活动明细和附件" }]
            }
          : item
      )
    );
    showToast("已模拟审批驳回，申请单可编辑后重新提交。");
  }

  function openExpense(matter: MarketingMatter) {
    if (matter.status === "已关闭" || matter.status === "关闭审批中" || matter.status === "已驳回") {
      showToast("当前事项状态不允许新增费用使用。");
      return;
    }
    setExpenseForm({
      matterId: matter.id,
      expenseDate: today,
      amount: String(Math.min(Math.max(matter.remainingAmount, 1), 12000)),
      expenseMinor: expenseMinorFromMatter(matter),
      sourceBusinessType: "个人垫付报销",
      payee: matter.applicant,
      remark: "演示：外部业务完成后自动回写事项已用金额。"
    });
    setExpenseErrors({});
  }

  function submitExpense() {
    if (!expenseForm) return;
    const matter = matters.find((item) => item.id === expenseForm.matterId);
    const amount = Number(expenseForm.amount);
    const errors: Record<string, string> = {};
    if (!matter) errors.matterId = "请选择有效营销事项";
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = "费用金额必须大于 0";
    if (matter && amount > matter.remainingAmount) errors.amount = "费用金额不能超过事项剩余金额";
    if (!expenseForm.payee.trim()) errors.payee = "请填写供应商或收款人";
    setExpenseErrors(errors);
    if (Object.keys(errors).length > 0 || !matter) return;
    simulateExpenseUse(matter, amount, expenseForm);
    setExpenseForm(null);
  }

  function openClose(matter: MarketingMatter) {
    if (matter.status === "已关闭" || matter.status === "关闭审批中") {
      showToast("当前事项已关闭或正在关闭审批中。");
      return;
    }
    if (matter.hasPendingExternalBill) {
      setPageError(`无法关闭 ${matter.code}：存在审批中付款、报销或核销 mock 单据。`);
      return;
    }
    setCloseForm({ matterId: matter.id, closeDescription: matter.remainingAmount > 0 ? "事项执行范围调整，剩余金额不再使用，申请关闭。" : "费用已完成核销，申请关闭营销事项。" });
    setCloseErrors({});
  }

  function submitClose() {
    if (!closeForm) return;
    const matter = matters.find((item) => item.id === closeForm.matterId);
    const errors: Record<string, string> = {};
    if (!matter) errors.matterId = "请选择营销事项";
    if (!closeForm.closeDescription.trim()) errors.closeDescription = "请填写营销事项关闭说明";
    if (matter?.hasPendingExternalBill) errors.matterId = "存在审批中付款、报销或核销 mock 单据，不能关闭";
    setCloseErrors(errors);
    if (Object.keys(errors).length > 0 || !matter) return;
    const closeApp = buildCloseApplication(matter, closeForm.closeDescription, "审批中");
    setCloseApplications((items) => [closeApp, ...items]);
    setMatters((items) =>
      items.map((item) =>
        item.id === matter.id
          ? {
              ...item,
              status: "关闭审批中",
              closeCode: closeApp.code,
              closeDescription: closeForm.closeDescription,
              sourceSystem: "[OA] 营销事项关闭审批",
              syncStatus: "同步中",
              lastSyncAt: nowText,
              steps: [...item.steps, { node: "关闭申请提交", approver: matter.applicant, date: today, comment: closeForm.closeDescription }]
            }
          : item
      )
    );
    setCloseForm(null);
    setView("closes");
    showToast("已提交营销事项关闭单，等待模拟审批。");
  }

  function approveClose(item: CloseApplication) {
    if (item.status !== "审批中") return;
    setOverlayLoading("正在模拟关闭审批");
    window.setTimeout(() => {
      setCloseApplications((items) =>
        items.map((close) =>
          close.id === item.id
            ? {
                ...close,
                status: "已关闭",
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                steps: [...close.steps, { node: "财务主管审批", approver: "顾可", date: today, comment: "同意关闭营销事项" }]
              }
            : close
        )
      );
      setMatters((items) =>
        items.map((matter) =>
          matter.id === item.matterId
            ? {
                ...matter,
                status: "已关闭",
                remainingAmount: Math.max(matter.totalAmount - matter.usedAmount, 0),
                closeCode: item.code,
                closeDescription: item.closeDescription,
                syncStatus: "同步成功",
                lastSyncAt: nowText,
                steps: [...matter.steps, { node: "关闭审批通过", approver: "顾可", date: today, comment: "事项状态更新为已关闭" }]
              }
            : matter
        )
      );
      setOverlayLoading("");
      showToast("关闭审批通过，事项台账状态已更新为已关闭。");
    }, 850);
  }

  function retrySync() {
    setPageError("");
    setOverlayLoading("正在重试模拟同步");
    window.setTimeout(() => {
      setMatters((items) => items.map((item) => (item.syncStatus === "同步失败" ? { ...item, syncStatus: "同步成功", lastSyncAt: nowText, failureReason: undefined } : item)));
      setApplications((items) => items.map((item) => (item.syncStatus === "同步失败" ? { ...item, syncStatus: "同步成功", lastSyncAt: nowText, failureReason: undefined } : item)));
      setOverlayLoading("");
      showToast("已使用 mock 状态重试同步成功。");
    }, 750);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="marketing-matters" title="营销事项" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">营销计划与事项 / 营销事项管理</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">营销事项管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">事项申请、审批生成台账、预算占用、费用核销与事项关闭的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openNewForm}>新增营销事项</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>
                导出模拟
              </Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：营销事项台账服务响应超时，请点击重试。")}>
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

          <FilterBar view={view} filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} />

          {pageError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <div className="font-medium">{pageError}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={retrySync}>重试模拟同步</Button>
                <Button size="sm" variant="secondary" onClick={() => setPageError("")}>关闭提示</Button>
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {tableLoading && <LoadingMask text="正在查询 mock 数据" />}
            {view === "applications" && <ApplicationTable rows={filteredApplications} onDetail={(item) => setDetail({ type: "applications", item })} onEdit={openEditForm} onApprove={approveApplication} onReject={rejectApplication} />}
            {view === "matters" && <MatterTable rows={filteredMatters} expenses={expenses} onDetail={(item) => setDetail({ type: "matters", item })} onExpense={openExpense} onClose={openClose} onShowExpenses={(item) => setDetail({ type: "matters", item })} />}
            {view === "expenses" && <ExpenseTable rows={filteredExpenses} onDetail={(item) => setDetail({ type: "expenses", item })} />}
            {view === "closes" && <CloseTable rows={filteredCloseApplications} onDetail={(item) => setDetail({ type: "closes", item })} onApprove={approveClose} />}
            {!tableLoading && rows.length === 0 && <EmptyState view={view} onCreate={openNewForm} onReset={resetFilters} />}
          </div>
        </section>
      </div>

      {form && <MatterFormModal form={form} errors={formErrors} onChange={(patch) => setForm((current) => (current ? normalizeFormPatch(current, patch) : current))} onClose={() => setForm(null)} onSave={() => saveApplication("草稿")} onSubmit={() => saveApplication("审批中")} />}
      {expenseForm && <ExpenseModal form={expenseForm} matter={matters.find((item) => item.id === expenseForm.matterId)} errors={expenseErrors} onChange={(patch) => setExpenseForm((current) => (current ? { ...current, ...patch } : current))} onClose={() => setExpenseForm(null)} onSubmit={submitExpense} />}
      {closeForm && <CloseModal form={closeForm} matter={matters.find((item) => item.id === closeForm.matterId)} errors={closeErrors} onChange={(patch) => setCloseForm((current) => (current ? { ...current, ...patch } : current))} onClose={() => setCloseForm(null)} onSubmit={submitClose} />}
      {detail && <DetailDrawer detail={detail} expenses={expenses} onClose={() => setDetail(null)} />}
      {overlayLoading && <LoadingMask full text={overlayLoading} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function useMatterUpdate(setMatters: React.Dispatch<React.SetStateAction<MarketingMatter[]>>, setExpenses: React.Dispatch<React.SetStateAction<MatterExpense[]>>, showToast: (message: string) => void) {
  function simulateExpenseUse(matter: MarketingMatter, amount: number, form: ExpenseFormState) {
    const usedAfter = Math.min(matter.totalAmount, matter.usedAmount + amount);
    const autoClosed = usedAfter >= matter.totalAmount;
    const expense: MatterExpense = {
      id: `expense-${Date.now()}`,
      code: `${sourceCodePrefix(form.sourceBusinessType)}-${Date.now().toString().slice(-6)}`,
      documentName: `${form.sourceBusinessType}${form.sourceBusinessType === "发票核销" ? "单" : "单据"}`,
      appliedAt: today,
      applicant: matter.applicant,
      expenseDate: form.expenseDate,
      amount,
      matterCode: matter.code,
      matterName: matter.matterName,
      activityName: matter.activityName.split("、")[0] || matter.activityName,
      expenseMinor: form.expenseMinor,
      expenseMajor: form.expenseMinor.includes("达人") ? "内容费用" : form.expenseMinor.includes("物料") ? "活动费用" : form.expenseMinor.includes("直播") ? "直播费用" : "投放费用",
      secondBudgetSubject: matter.secondBudgetSubject,
      firstBudgetSubject: matter.firstBudgetSubject,
      managementSubject: "营销事项费用",
      brand: "花西子",
      sourceBusinessType: form.sourceBusinessType,
      sourceSystem: `[${form.sourceBusinessType}] mock 完成`,
      writeOffStatus: "已核销",
      writeOffDate: today,
      payee: form.payee,
      useDepartment: matter.useDepartment,
      remark: form.remark
    };
    setExpenses((items) => [expense, ...items]);
    setMatters((items) =>
      items.map((item) =>
        item.id === matter.id
          ? {
              ...item,
              usedAmount: usedAfter,
              remainingAmount: Math.max(item.totalAmount - usedAfter, 0),
              status: autoClosed ? "已关闭" : usedAfter > 0 ? "进行中" : item.status,
              lastUsedAt: form.expenseDate,
              invoiceOrAdvanceCleared: true,
              closeCode: autoClosed ? `AUTO-CLOSE-${Date.now().toString().slice(-6)}` : item.closeCode,
              closeDescription: autoClosed ? "费用使用已达到事项总额，系统自动关闭。" : item.closeDescription,
              sourceSystem: `[${form.sourceBusinessType}] mock 回写`,
              syncStatus: "同步成功",
              lastSyncAt: nowText,
              steps: [...item.steps, { node: `${form.sourceBusinessType}完成`, approver: "系统模拟", date: today, comment: `回写已用金额 ${formatMoney(amount)}` }]
            }
          : item
      )
    );
    showToast(autoClosed ? "费用已回写，已用金额达到事项总额，事项已自动关闭。" : "费用已回写，费用台账和事项已用金额已更新。");
  }

  return { simulateExpenseUse };
}

function ApplicationTable({ rows, onDetail, onEdit, onApprove, onReject }: { rows: MarketingMatterApplication[]; onDetail: (item: MarketingMatterApplication) => void; onEdit: (item: MarketingMatterApplication) => void; onApprove: (item: MarketingMatterApplication) => void; onReject: (item: MarketingMatterApplication) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>单据编号</Th>
          <Th>营销事项名称</Th>
          <Th>状态</Th>
          <Th>申请人</Th>
          <Th>申请日期</Th>
          <Th>营销事项总额</Th>
          <Th>预算占用</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
            <Td>{item.matterName}</Td>
            <Td><StatusBadge status={item.status} /></Td>
            <Td>{item.applicant}</Td>
            <Td>{item.createdAt}</Td>
            <Td align="right">{formatMoney(item.totalAmount)}</Td>
            <Td>{item.budgetLocked ? <StatusBadge status="预算已锁定" /> : <StatusBadge status="未锁定" />}</Td>
            <Td><StatusBadge status={item.syncStatus} /></Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item)}>详情</button>
                {["草稿", "已驳回"].includes(item.status) && <button onClick={() => onEdit(item)}>编辑</button>}
                {item.status === "审批中" && <button onClick={() => onApprove(item)}>审批通过</button>}
                {item.status === "审批中" && <button onClick={() => onReject(item)}>驳回</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function MatterTable({ rows, expenses, onDetail, onExpense, onClose, onShowExpenses }: { rows: MarketingMatter[]; expenses: MatterExpense[]; onDetail: (item: MarketingMatter) => void; onExpense: (item: MarketingMatter) => void; onClose: (item: MarketingMatter) => void; onShowExpenses: (item: MarketingMatter) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>事项编号</Th>
          <Th>事项名称</Th>
          <Th>状态</Th>
          <Th>事项总额</Th>
          <Th>已用金额</Th>
          <Th>剩余金额</Th>
          <Th>执行进度</Th>
          <Th>预算科目</Th>
          <Th>使用部门</Th>
          <Th>提醒日期</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item) => {
          const relatedExpenses = expenses.filter((expense) => expense.matterCode === item.code);
          return (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
              <Td>
                <div className="flex items-center gap-2">
                  {isReminder(item) && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600" title="超过提醒日期且未关闭">预警</span>}
                  <span>{item.matterName}</span>
                </div>
              </Td>
              <Td><StatusBadge status={item.status} /></Td>
              <Td align="right">{formatMoney(item.totalAmount)}</Td>
              <Td align="right"><button className="text-blue-600 hover:underline" onClick={() => onShowExpenses(item)}>{formatMoney(item.usedAmount)}</button></Td>
              <Td align="right">{formatMoney(item.remainingAmount)}</Td>
              <Td><ProgressBar value={item.usedAmount} total={item.totalAmount} /></Td>
              <Td>{`${item.firstBudgetSubject} / ${item.secondBudgetSubject}`}</Td>
              <Td>{item.useDepartment}</Td>
              <Td danger={isReminder(item)}>{item.reminderDate}</Td>
              <Td>
                <StatusBadge status={item.syncStatus} />
                {item.failureReason && <div className="mt-1 text-xs text-red-500">{item.failureReason}</div>}
              </Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item)}>详情</button>
                  <button onClick={() => onExpense(item)}>模拟费用使用</button>
                  <button onClick={() => onClose(item)}>关闭事项</button>
                  <button onClick={() => onShowExpenses(item)}>费用{relatedExpenses.length}</button>
                </InlineActions>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

function ExpenseTable({ rows, onDetail }: { rows: MatterExpense[]; onDetail: (item: MatterExpense) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>单据编号</Th>
          <Th>单据名称</Th>
          <Th>申请日期</Th>
          <Th>申请人</Th>
          <Th>费用日期</Th>
          <Th>费用金额</Th>
          <Th>营销活动</Th>
          <Th>费用小类</Th>
          <Th>费用大类</Th>
          <Th>预算科目</Th>
          <Th>经分科目</Th>
          <Th>品牌</Th>
          <Th>来源</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
            <Td>{item.documentName}</Td>
            <Td>{item.appliedAt}</Td>
            <Td>{item.applicant}</Td>
            <Td>{item.expenseDate}</Td>
            <Td align="right">{formatMoney(item.amount)}</Td>
            <Td>{item.activityName}</Td>
            <Td>{item.expenseMinor}</Td>
            <Td>{item.expenseMajor}</Td>
            <Td>{`${item.firstBudgetSubject} / ${item.secondBudgetSubject}`}</Td>
            <Td>{item.managementSubject}</Td>
            <Td>{item.brand}</Td>
            <Td><StatusBadge status={item.writeOffStatus} /></Td>
            <Td><InlineActions><button onClick={() => onDetail(item)}>来源单据</button></InlineActions></Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function CloseTable({ rows, onDetail, onApprove }: { rows: CloseApplication[]; onDetail: (item: CloseApplication) => void; onApprove: (item: CloseApplication) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>关闭单号</Th>
          <Th>营销事项</Th>
          <Th>状态</Th>
          <Th>申请人</Th>
          <Th>申请日期</Th>
          <Th>事项总额</Th>
          <Th>已用金额</Th>
          <Th>使用部门</Th>
          <Th>预算科目</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
            <Td>{item.matterName}</Td>
            <Td><StatusBadge status={item.status} /></Td>
            <Td>{item.applicant}</Td>
            <Td>{item.createdAt}</Td>
            <Td align="right">{formatMoney(item.totalAmount)}</Td>
            <Td align="right">{formatMoney(item.usedAmount)}</Td>
            <Td>{item.useDepartment}</Td>
            <Td>{`${item.firstBudgetSubject} / ${item.secondBudgetSubject}`}</Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 text-xs text-red-500">{item.failureReason}</div>}
            </Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item)}>详情</button>
                {item.status === "审批中" && <button onClick={() => onApprove(item)}>审批通过</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function MatterFormModal({ form, errors, onChange, onClose, onSave, onSubmit }: { form: MatterFormState; errors: Record<string, string>; onChange: (patch: Partial<MatterFormState>) => void; onClose: () => void; onSave: () => void; onSubmit: () => void }) {
  const total = form.lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const isOperationDept = form.department === "品牌运营中心";
  const isProductDept = form.department === "品牌产品中心";
  return (
    <Modal title="营销事项申请单" onClose={onClose} size="lg">
      {errors.form && <Alert tone="red">{errors.form}</Alert>}
      <Section title="主表区">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="申请日期" value={today} />
          <ReadOnly label="申请人" value={form.applicant} />
          <ReadOnly label="申请人公司" value={form.company} />
          <Field label="申请人部门" required>
            <Select value={form.department} onChange={(department) => onChange({ department })} options={["品牌运营中心", "品牌产品中心", "电商运营部", "内容营销部", "直播运营部", "渠道市场部"]} />
          </Field>
          <ReadOnly label="申请人岗位" value={form.position} />
          <ReadOnly label="明细金额合计" value={formatMoney(total)} />
          <Field label="营销事项名称" required error={errors.matterName}>
            <Input value={form.matterName} onChange={(matterName) => onChange({ matterName })} />
          </Field>
          <Field label="营销事项总额（￥）" required error={errors.totalAmount}>
            <Input value={form.totalAmount} onChange={(totalAmount) => onChange({ totalAmount })} placeholder="小于 50000" />
          </Field>
          <Field label="说明" required error={errors.description}>
            <Input value={form.description} onChange={(description) => onChange({ description })} />
          </Field>
        </div>
      </Section>

      <Section title="申请信息">
        <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
          品牌运营中心需关联营销计划、计划分类和计划剩余金额；品牌产品中心需填写归属打标。提交时校验总额小于 50000 且等于营销活动金额合计。
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <Th>行号</Th>
                <Th>关联营销计划</Th>
                <Th>计划分类</Th>
                <Th>营销活动</Th>
                <Th>预算部门</Th>
                <Th>预算科目</Th>
                <Th>归属打标</Th>
                <Th>计划剩余金额</Th>
                <Th>营销活动金额</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {form.lines.map((line, index) => (
                <tr key={line.id}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Select value={line.planId} onChange={(planId) => onChange({ lines: updateLine(form.lines, line.id, normalizeLinePatch(line, { planId })) })} options={["", ...planOptions.map((plan) => plan.id)]} labels={{ "": isOperationDept ? "请选择" : "无需关联", ...Object.fromEntries(planOptions.map((plan) => [plan.id, plan.name])) }} />
                    {errors[`line-${line.id}-plan`] && <div className="mt-1 text-xs text-red-500">{errors[`line-${line.id}-plan`]}</div>}
                  </Td>
                  <Td>{line.planCategory || "-"}</Td>
                  <Td>
                    <Select value={line.activityId} onChange={(activityId) => onChange({ lines: updateLine(form.lines, line.id, normalizeLinePatch(line, { activityId })) })} options={activityOptions.map((activity) => activity.id)} labels={Object.fromEntries(activityOptions.map((activity) => [activity.id, activity.name]))} />
                  </Td>
                  <Td>
                    <Select value={line.budgetDepartment} onChange={(budgetDepartment) => onChange({ lines: updateLine(form.lines, line.id, { budgetDepartment }) })} options={["电商运营部", "内容营销部", "直播运营部", "渠道市场部", "品牌产品中心"]} />
                  </Td>
                  <Td>{`${line.firstBudgetSubject} / ${line.secondBudgetSubject}`}</Td>
                  <Td>
                    <Select value={line.ownershipTag} onChange={(ownershipTag) => onChange({ lines: updateLine(form.lines, line.id, { ownershipTag }) })} options={["品牌运营", "新品上市", "渠道活动", "达人种草"]} />
                    {isProductDept && errors[`line-${line.id}-tag`] && <div className="mt-1 text-xs text-red-500">{errors[`line-${line.id}-tag`]}</div>}
                  </Td>
                  <Td align="right">{formatMoney(line.planRemainingAmount)}</Td>
                  <Td>
                    <Input value={String(line.amount)} onChange={(amount) => onChange({ lines: updateLine(form.lines, line.id, { amount: Number(amount) }) })} />
                    {errors[`line-${line.id}-amount`] && <div className="mt-1 text-xs text-red-500">{errors[`line-${line.id}-amount`]}</div>}
                  </Td>
                  <Td>
                    <button className="text-sm text-blue-600 hover:underline" onClick={() => onChange({ lines: form.lines.filter((item) => item.id !== line.id) })}>删除</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Button variant="secondary" size="sm" onClick={() => onChange({ lines: [...form.lines, defaultLine(form.lines.length + 1)] })}>新增明细行</Button>
        </div>
      </Section>

      <Section title="附件信息">
        <div className="grid gap-3 md:grid-cols-2">
          <ReadOnly label="附件名称" value="预算测算表.xlsx" />
          <ReadOnly label="上传状态" value={<StatusBadge status="上传成功" />} />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-4 flex justify-end gap-2 border-t border-slate-200 bg-white p-4">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button variant="secondary" onClick={onSave}>保存草稿</Button>
        <Button onClick={onSubmit}>提交审批</Button>
      </div>
    </Modal>
  );
}

function ExpenseModal({ form, matter, errors, onChange, onClose, onSubmit }: { form: ExpenseFormState; matter?: MarketingMatter; errors: Record<string, string>; onChange: (patch: Partial<ExpenseFormState>) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <Modal title="模拟费用使用" onClose={onClose} size="md">
      <Section title="营销事项">
        <div className="grid gap-3 md:grid-cols-2">
          <ReadOnly label="营销事项" value={matter ? `${matter.code} / ${matter.matterName}` : "-"} />
          <ReadOnly label="剩余金额" value={matter ? formatMoney(matter.remainingAmount) : "-"} />
          <ReadOnly label="营销活动" value={matter?.activityName} />
          <ReadOnly label="预算科目" value={matter ? `${matter.firstBudgetSubject} / ${matter.secondBudgetSubject}` : "-"} />
        </div>
      </Section>
      <Section title="费用使用信息">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="费用日期" required>
            <Input value={form.expenseDate} onChange={(expenseDate) => onChange({ expenseDate })} />
          </Field>
          <Field label="费用金额" required error={errors.amount}>
            <Input value={form.amount} onChange={(amount) => onChange({ amount })} />
          </Field>
          <Field label="费用小类" required>
            <Select value={form.expenseMinor} onChange={(expenseMinor) => onChange({ expenseMinor })} options={["信息流消耗", "搜索消耗", "达人合作费", "直播加热", "活动物料"]} />
          </Field>
          <Field label="来源业务类型" required>
            <Select value={form.sourceBusinessType} onChange={(sourceBusinessType) => onChange({ sourceBusinessType: sourceBusinessType as SourceBusinessType })} options={["个人垫付报销", "对公付款", "专项备用金", "发票核销"]} />
          </Field>
          <Field label="供应商/收款人" required error={errors.payee}>
            <Input value={form.payee} onChange={(payee) => onChange({ payee })} />
          </Field>
          <Field label="备注">
            <Input value={form.remark} onChange={(remark) => onChange({ remark })} />
          </Field>
        </div>
      </Section>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>确认回写</Button>
      </div>
    </Modal>
  );
}

function CloseModal({ form, matter, errors, onChange, onClose, onSubmit }: { form: CloseFormState; matter?: MarketingMatter; errors: Record<string, string>; onChange: (patch: Partial<CloseFormState>) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <Modal title="营销事项关闭单" onClose={onClose} size="md">
      {errors.matterId && <Alert tone="red">{errors.matterId}</Alert>}
      <Section title="营销事项关闭信息">
        <div className="grid gap-3 md:grid-cols-2">
          <ReadOnly label="营销事项名称" value={matter?.matterName} />
          <ReadOnly label="营销事项总额" value={matter ? formatMoney(matter.totalAmount) : "-"} />
          <ReadOnly label="营销活动金额" value={matter ? formatMoney(matter.activityAmount) : "-"} />
          <ReadOnly label="已用金额" value={matter ? formatMoney(matter.usedAmount) : "-"} />
          <ReadOnly label="使用部门" value={matter?.useDepartment} />
          <ReadOnly label="营销活动名称" value={matter?.activityName} />
          <ReadOnly label="一级预算科目" value={matter?.firstBudgetSubject} />
          <ReadOnly label="二级预算科目" value={matter?.secondBudgetSubject} />
        </div>
        <div className="mt-3">
          <Field label="营销事项关闭说明" required error={errors.closeDescription}>
            <Textarea value={form.closeDescription} onChange={(closeDescription) => onChange({ closeDescription })} />
          </Field>
        </div>
      </Section>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>提交关闭审批</Button>
      </div>
    </Modal>
  );
}

function DetailDrawer({ detail, expenses, onClose }: { detail: { type: ViewMode; item: MarketingMatterApplication | MarketingMatter | MatterExpense | CloseApplication }; expenses: MatterExpense[]; onClose: () => void }) {
  const item = detail.item;
  const title =
    detail.type === "applications"
      ? (item as MarketingMatterApplication).matterName
      : detail.type === "matters"
        ? (item as MarketingMatter).matterName
        : detail.type === "expenses"
          ? (item as MatterExpense).code
          : (item as CloseApplication).code;
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <div className="text-sm text-slate-500">详情</div>
            <h2 className="mt-1 text-xl font-semibold">{title}</h2>
          </div>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4 p-5">
          {detail.type === "applications" && <ApplicationDetail item={item as MarketingMatterApplication} />}
          {detail.type === "matters" && <MatterDetail item={item as MarketingMatter} expenses={expenses.filter((expense) => expense.matterCode === (item as MarketingMatter).code)} />}
          {detail.type === "expenses" && <ExpenseDetail item={item as MatterExpense} />}
          {detail.type === "closes" && <CloseDetail item={item as CloseApplication} />}
        </div>
      </aside>
    </div>
  );
}

function ApplicationDetail({ item }: { item: MarketingMatterApplication }) {
  return (
    <>
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="摘要">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="单据编号" value={item.code} />
          <ReadOnly label="单据状态" value={<StatusBadge status={item.status} />} />
          <ReadOnly label="营销事项总额" value={formatMoney(item.totalAmount)} />
          <ReadOnly label="申请人" value={item.applicant} />
          <ReadOnly label="申请人部门" value={item.department} />
          <ReadOnly label="预算占用流水" value={item.budgetFlowNo} />
          <ReadOnly label="同步状态" value={<StatusBadge status={item.syncStatus} />} />
          <ReadOnly label="最近同步时间" value={item.lastSyncAt} />
          <ReadOnly label="来源系统" value={item.sourceSystem} />
        </div>
      </Section>
      <LineReadOnlyTable lines={item.lines} />
      <Section title="附件信息">
        <div className="flex flex-wrap gap-2">{item.attachments.length ? item.attachments.map((name) => <span key={name} className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600">{name}</span>) : "-"}</div>
      </Section>
      <Section title="审批信息"><StepList steps={item.steps} /></Section>
    </>
  );
}

function MatterDetail({ item, expenses }: { item: MarketingMatter; expenses: MatterExpense[] }) {
  return (
    <>
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      {isReminder(item) && <Alert tone="red">系统提醒：提醒日期已到且事项未关闭，请完成报销或发起营销事项关闭。</Alert>}
      <Section title="状态摘要">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="事项编号" value={item.code} />
          <ReadOnly label="事项状态" value={<StatusBadge status={item.status} />} />
          <ReadOnly label="执行进度" value={<ProgressBar value={item.usedAmount} total={item.totalAmount} />} />
          <ReadOnly label="营销事项总额" value={formatMoney(item.totalAmount)} />
          <ReadOnly label="实际核销金额/已用金额" value={formatMoney(item.usedAmount)} />
          <ReadOnly label="剩余可用金额" value={formatMoney(item.remainingAmount)} />
          <ReadOnly label="提醒日期" value={item.reminderDate} />
          <ReadOnly label="关闭单号" value={item.closeCode} />
          <ReadOnly label="是否发票个人垫付核销" value={item.invoiceOrAdvanceCleared ? "是" : "否"} />
        </div>
      </Section>
      <Section title="事项和预算信息">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="申请单号" value={item.applicationCode} />
          <ReadOnly label="申请人姓名" value={item.applicant} />
          <ReadOnly label="营销活动类型" value={item.activityType} />
          <ReadOnly label="营销活动名称" value={item.activityName} />
          <ReadOnly label="营销活动金额" value={formatMoney(item.activityAmount)} />
          <ReadOnly label="使用部门" value={item.useDepartment} />
          <ReadOnly label="预算部门" value={item.budgetDepartment} />
          <ReadOnly label="一级预算科目" value={item.firstBudgetSubject} />
          <ReadOnly label="二级预算科目" value={item.secondBudgetSubject} />
          <ReadOnly label="关联营销计划" value={item.relatedPlan} />
          <ReadOnly label="计划分类" value={item.planCategory} />
          <ReadOnly label="已占用预算" value={formatMoney(item.occupiedBudget)} />
        </div>
      </Section>
      <Section title="费用明细">
        {expenses.length ? <ExpenseTable rows={expenses} onDetail={() => undefined} /> : <div className="text-sm text-slate-500">暂无关联费用流水。</div>}
      </Section>
      <Section title="流转记录"><StepList steps={item.steps} /></Section>
    </>
  );
}

function ExpenseDetail({ item }: { item: MatterExpense }) {
  return (
    <>
      <Section title="费用台账详情">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="单据编号" value={item.code} />
          <ReadOnly label="单据名称" value={item.documentName} />
          <ReadOnly label="来源业务类型" value={`[${item.sourceBusinessType}]`} />
          <ReadOnly label="费用日期" value={item.expenseDate} />
          <ReadOnly label="费用金额" value={formatMoney(item.amount)} />
          <ReadOnly label="核销状态" value={<StatusBadge status={item.writeOffStatus} />} />
          <ReadOnly label="营销事项编号" value={item.matterCode} />
          <ReadOnly label="营销事项名称" value={item.matterName} />
          <ReadOnly label="营销活动" value={item.activityName} />
          <ReadOnly label="费用小类" value={item.expenseMinor} />
          <ReadOnly label="费用大类" value={item.expenseMajor} />
          <ReadOnly label="经分科目" value={item.managementSubject} />
          <ReadOnly label="品牌" value={item.brand} />
          <ReadOnly label="供应商/收款人" value={item.payee} />
          <ReadOnly label="来源系统" value={item.sourceSystem} />
        </div>
      </Section>
      <Alert tone={item.writeOffStatus === "核销失败" ? "red" : "blue"}>点击来源单据为 mock 详情展示，不跳转真实付款、报销、发票或 ERP 系统。</Alert>
    </>
  );
}

function CloseDetail({ item }: { item: CloseApplication }) {
  return (
    <>
      {item.failureReason && <Alert tone="red">{item.failureReason}</Alert>}
      <Section title="关闭信息">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="关闭单号" value={item.code} />
          <ReadOnly label="关闭状态" value={<StatusBadge status={item.status} />} />
          <ReadOnly label="营销事项" value={`${item.matterCode} / ${item.matterName}`} />
          <ReadOnly label="营销事项总额" value={formatMoney(item.totalAmount)} />
          <ReadOnly label="营销活动金额" value={formatMoney(item.activityAmount)} />
          <ReadOnly label="已用金额" value={formatMoney(item.usedAmount)} />
          <ReadOnly label="使用部门" value={item.useDepartment} />
          <ReadOnly label="营销活动名称" value={item.activityName} />
          <ReadOnly label="预算科目" value={`${item.firstBudgetSubject} / ${item.secondBudgetSubject}`} />
        </div>
      </Section>
      <Section title="关闭说明">
        <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item.closeDescription}</div>
      </Section>
      <Section title="审批信息"><StepList steps={item.steps} /></Section>
    </>
  );
}

function LineReadOnlyTable({ lines }: { lines: MatterLine[] }) {
  return (
    <Section title="申请信息明细">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr>
              <Th>行号</Th>
              <Th>关联营销计划</Th>
              <Th>计划分类</Th>
              <Th>营销活动</Th>
              <Th>预算部门</Th>
              <Th>预算科目</Th>
              <Th>归属打标</Th>
              <Th>计划剩余金额</Th>
              <Th>营销活动金额</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {lines.map((line, index) => (
              <tr key={line.id}>
                <Td>{index + 1}</Td>
                <Td>{line.planName}</Td>
                <Td>{line.planCategory}</Td>
                <Td>{line.activityName}</Td>
                <Td>{line.budgetDepartment}</Td>
                <Td>{`${line.firstBudgetSubject} / ${line.secondBudgetSubject}`}</Td>
                <Td>{line.ownershipTag}</Td>
                <Td align="right">{formatMoney(line.planRemainingAmount)}</Td>
                <Td align="right">{formatMoney(line.amount)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function FilterBar({ view, filters, setFilters, onQuery, onReset }: { view: ViewMode; filters: { keyword: string; status: string; department: string; activity: string; expenseMinor: string }; setFilters: (filters: { keyword: string; status: string; department: string; activity: string; expenseMinor: string }) => void; onQuery: () => void; onReset: () => void }) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-5">
        <Field label={view === "expenses" ? "营销活动" : "单号/事项名称"}>
          <Input value={view === "expenses" ? filters.activity : filters.keyword} onChange={(value) => setFilters(view === "expenses" ? { ...filters, activity: value } : { ...filters, keyword: value })} placeholder={view === "expenses" ? "输入营销活动" : "输入单号或名称"} />
        </Field>
        <Field label="状态">
          <Select value={filters.status} onChange={(status) => setFilters({ ...filters, status })} options={statusOptions(view)} />
        </Field>
        <Field label="使用部门">
          <Select value={filters.department} onChange={(department) => setFilters({ ...filters, department })} options={["全部", "品牌运营中心", "品牌产品中心", "电商运营部", "内容营销部", "直播运营部", "渠道市场部"]} />
        </Field>
        <Field label="费用小类">
          <Select value={filters.expenseMinor} onChange={(expenseMinor) => setFilters({ ...filters, expenseMinor })} options={["全部", "信息流消耗", "搜索消耗", "达人合作费", "直播加热", "活动物料"]} />
        </Field>
        <div className="flex items-end gap-2">
          <Button onClick={onQuery}>查询</Button>
          <Button variant="secondary" onClick={onReset}>重置</Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ view, onCreate, onReset }: { view: ViewMode; onCreate: () => void; onReset: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">?</div>
      <div className="mt-3 font-medium text-slate-700">{view === "matters" ? "您还没有创建任何营销事项" : "暂无匹配数据"}</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选，或点击右上角开始新建营销事项。</div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onCreate}>新建营销事项</Button>
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

function Modal({ title, children, onClose, size = "md" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white p-5 shadow-xl ${size === "lg" ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50" onClick={onClose}>关闭</button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function LoadingMask({ text, full = false }: { text: string; full?: boolean }) {
  return (
    <div className={`${full ? "fixed inset-0 z-50 bg-black/20" : "absolute inset-0 z-10 bg-white/70"} flex items-center justify-center`}>
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent align-[-1px]" />
        {text}
      </div>
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
  return <input className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500" value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} />;
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)} />;
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

function Button({ children, onClick, variant = "primary", size = "md", type = "button", disabled = false }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary"; size?: "sm" | "md"; type?: "button" | "submit"; disabled?: boolean }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"} rounded-md font-medium ${
        variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-[1120px] w-full">{children}</table></div>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children, align = "left", danger = false }: { children: ReactNode; align?: "left" | "right"; danger?: boolean }) {
  return <td className={`max-w-64 truncate px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""} ${danger ? "font-medium text-red-600" : ""}`} title={typeof children === "string" ? children : undefined}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex min-w-44 flex-wrap gap-2 text-sm text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    ["审批通过", "同步成功", "已关闭", "已核销", "预算已锁定"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "进行中", "关闭审批中", "同步中"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["待关闭", "待核销"].includes(status)
          ? "border-orange-200 bg-orange-50 text-orange-600"
          : ["已驳回", "同步失败", "核销失败"].includes(status)
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
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

function normalizeFormPatch(current: MatterFormState, patch: Partial<MatterFormState>) {
  const next = { ...current, ...patch };
  if (patch.department === "品牌产品中心") {
    return { ...next, lines: next.lines.map((line) => ({ ...line, planId: "", planName: "", planCategory: "", planRemainingAmount: 0, ownershipTag: line.ownershipTag || "新品上市" })) };
  }
  return next;
}

function normalizeLinePatch(current: MatterLine, patch: Partial<MatterLine>) {
  const next = { ...current, ...patch };
  if (patch.planId !== undefined) {
    const plan = planOptions.find((item) => item.id === patch.planId);
    next.planName = plan?.name ?? "";
    next.planCategory = plan?.category ?? "";
    next.planRemainingAmount = plan?.remainingAmount ?? 0;
    next.budgetDepartment = plan?.budgetDepartment ?? next.budgetDepartment;
  }
  if (patch.activityId !== undefined) {
    const activity = activityOptions.find((item) => item.id === patch.activityId);
    if (activity) {
      next.activityName = activity.name;
      next.activityType = activity.type;
      next.firstBudgetSubject = activity.firstBudgetSubject;
      next.secondBudgetSubject = activity.secondBudgetSubject;
      next.expenseMajor = activity.expenseMajor;
      next.expenseMinor = activity.expenseMinor;
      next.managementSubject = activity.managementSubject;
      next.brand = activity.brand;
    }
  }
  return next;
}

function updateLine(lines: MatterLine[], id: string, patch: Partial<MatterLine>) {
  return lines.map((line) => (line.id === id ? { ...line, ...patch } : line));
}

function validateForm(form: MatterFormState, strict: boolean) {
  const errors: Record<string, string> = {};
  const amount = Number(form.totalAmount);
  const linesTotal = form.lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  if (!form.matterName.trim()) errors.matterName = "请填写营销事项名称";
  if (!form.description.trim()) errors.description = "请填写说明";
  if (!Number.isFinite(amount) || amount <= 0) errors.totalAmount = "营销事项总额必须大于 0";
  if (strict && amount >= 50000) errors.totalAmount = "营销事项总额需小于 50000";
  if (strict && amount !== linesTotal) errors.form = "营销事项总额必须等于营销活动金额合计";
  if (!form.lines.length) errors.form = "至少需要一条申请信息明细";
  form.lines.forEach((line) => {
    if (strict && form.department === "品牌运营中心" && !line.planId) errors[`line-${line.id}-plan`] = "品牌运营中心需关联营销计划";
    if (strict && form.department === "品牌产品中心" && !line.ownershipTag) errors[`line-${line.id}-tag`] = "品牌产品中心需填写归属打标";
    if (!Number.isFinite(Number(line.amount)) || Number(line.amount) <= 0) errors[`line-${line.id}-amount`] = "金额需大于 0";
    if (strict && line.planRemainingAmount > 0 && Number(line.amount) > line.planRemainingAmount) errors[`line-${line.id}-amount`] = "营销活动金额不能超过计划剩余金额";
  });
  return errors;
}

function buildApplication(form: MatterFormState, status: ApplicationStatus): MarketingMatterApplication {
  const amount = Number(form.totalAmount);
  return {
    id: `app-${Date.now()}`,
    code: `YXSX-SQ-2026-${Date.now().toString().slice(-3)}`,
    title: "营销事项申请单",
    applicant: form.applicant,
    company: form.company,
    department: form.department,
    position: form.position,
    createdAt: today,
    matterName: form.matterName,
    totalAmount: Number.isFinite(amount) ? amount : 0,
    description: form.description,
    status,
    sourceSystem: status === "草稿" ? "[业财中台] 本地草稿" : "[OA] 营销事项审批",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: false,
    budgetFlowNo: "-",
    lines: form.lines,
    attachments: ["预算测算表.xlsx"],
    steps: [{ node: status === "草稿" ? "保存草稿" : "申请人提交", approver: form.applicant, date: today, comment: status === "草稿" ? "保存草稿" : "提交营销事项申请" }]
  };
}

function buildMatterFromApplication(application: MarketingMatterApplication): MarketingMatter {
  const firstLine = application.lines[0];
  const totalAmount = application.totalAmount;
  return {
    id: `matter-${Date.now()}`,
    code: `YXSX-TZ-2026-${Date.now().toString().slice(-3)}`,
    applicationCode: application.code,
    applicant: application.applicant,
    applicantDepartment: application.department,
    matterName: application.matterName,
    status: "未使用",
    totalAmount,
    usedAmount: 0,
    activityType: application.lines.map((line) => line.activityType).join(" / "),
    activityName: application.lines.map((line) => line.activityName).join("、"),
    activityAmount: totalAmount,
    useDepartment: firstLine?.budgetDepartment ?? application.department,
    budgetDepartment: firstLine?.budgetDepartment ?? application.department,
    firstBudgetSubject: firstLine?.firstBudgetSubject ?? "-",
    secondBudgetSubject: firstLine?.secondBudgetSubject ?? "-",
    relatedPlan: firstLine?.planName || "-",
    planCategory: firstLine?.planCategory || firstLine?.ownershipTag || "-",
    occupiedBudget: totalAmount,
    remainingAmount: totalAmount,
    invoiceOrAdvanceCleared: false,
    appliedAt: today,
    reminderDate: addDays(today, 3),
    lastUsedAt: "-",
    closeCode: "-",
    closeDescription: "-",
    sourceSystem: "[OA] 营销事项审批 / [预算系统]",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    syncBatchNo: `SYNC-MATTER-LEDGER-${Date.now().toString().slice(-6)}`,
    hasPendingExternalBill: false,
    steps: [{ node: "审批通过", approver: "周岚", date: today, comment: "生成事项台账并模拟占用预算" }]
  };
}

function buildCloseApplication(matter: MarketingMatter, closeDescription: string, status: CloseStatus): CloseApplication {
  return {
    id: `close-${Date.now()}`,
    code: `YXSX-GB-2026-${Date.now().toString().slice(-3)}`,
    title: "营销事项关闭单",
    applicant: matter.applicant,
    company: "上海示例贸易有限公司",
    department: matter.applicantDepartment,
    position: "营销专员",
    createdAt: today,
    matterId: matter.id,
    matterCode: matter.code,
    matterName: matter.matterName,
    totalAmount: matter.totalAmount,
    activityAmount: matter.activityAmount,
    usedAmount: matter.usedAmount,
    useDepartment: matter.useDepartment,
    activityType: matter.activityType,
    activityName: matter.activityName,
    firstBudgetSubject: matter.firstBudgetSubject,
    secondBudgetSubject: matter.secondBudgetSubject,
    applicationDescription: matter.closeDescription,
    closeDescription,
    status,
    sourceSystem: "[OA] 营销事项关闭审批",
    syncStatus: "同步中",
    lastSyncAt: nowText,
    steps: [{ node: "申请人提交", approver: matter.applicant, date: today, comment: closeDescription }]
  };
}

function filterApplications(rows: MarketingMatterApplication[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => [item.code, item.matterName, item.applicant].join(" ").toLowerCase().includes(keyword) && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.department, filters.department));
}

function filterMatters(rows: MarketingMatter[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => [item.code, item.matterName, item.activityName, item.applicationCode].join(" ").toLowerCase().includes(keyword) && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.useDepartment, filters.department, item.applicantDepartment));
}

function filterExpenses(rows: MatterExpense[], filters: { activity: string; expenseMinor: string; department: string; status: string }) {
  const activity = filters.activity.trim().toLowerCase();
  return rows.filter((item) => item.activityName.toLowerCase().includes(activity) && matchFilter(item.expenseMinor, filters.expenseMinor) && matchFilter(item.useDepartment, filters.department) && matchFilter(item.writeOffStatus, filters.status, item.sourceBusinessType));
}

function filterCloseApplications(rows: CloseApplication[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => [item.code, item.matterName, item.matterCode].join(" ").toLowerCase().includes(keyword) && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.useDepartment, filters.department, item.department));
}

function matchFilter(value: string, filter: string, ...alternates: string[]) {
  return filter === "全部" || value === filter || alternates.includes(filter);
}

function statusOptions(view: ViewMode) {
  if (view === "applications") return ["全部", "草稿", "审批中", "已驳回", "审批通过", "同步失败"];
  if (view === "matters") return ["全部", "未使用", "进行中", "待关闭", "关闭审批中", "已关闭", "已驳回", "同步失败"];
  if (view === "expenses") return ["全部", "待核销", "已核销", "核销失败", "个人垫付报销", "对公付款", "专项备用金", "发票核销"];
  return ["全部", "草稿", "审批中", "已驳回", "已关闭", "同步失败"];
}

function isReminder(item: MarketingMatter) {
  return item.reminderDate <= today && item.status !== "已关闭" && item.status !== "已驳回";
}

function expenseMinorFromMatter(matter: MarketingMatter) {
  if (matter.secondBudgetSubject.includes("搜索")) return "搜索消耗";
  if (matter.secondBudgetSubject.includes("达人")) return "达人合作费";
  if (matter.secondBudgetSubject.includes("直播")) return "直播加热";
  if (matter.secondBudgetSubject.includes("物料")) return "活动物料";
  return "信息流消耗";
}

function sourceCodePrefix(source: SourceBusinessType) {
  if (source === "对公付款") return "FK";
  if (source === "专项备用金") return "BYJ";
  if (source === "发票核销") return "FPHX";
  return "BX";
}

function sumBy<T>(rows: T[], key: keyof T) {
  return rows.reduce((sum, item) => sum + (typeof item[key] === "number" ? item[key] : 0), 0);
}

function formatMoney(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `CNY ${normalized.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

const viewTabs: Array<{ key: ViewMode; label: string }> = [
  { key: "applications", label: "营销事项申请单" },
  { key: "matters", label: "营销事项台账" },
  { key: "expenses", label: "营销事项费用台账" },
  { key: "closes", label: "营销事项关闭单" }
];
