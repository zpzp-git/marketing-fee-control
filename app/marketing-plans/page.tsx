"use client";

import { ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type PlanStatus = "草稿" | "审批中" | "已驳回" | "未开始" | "进行中" | "已完成" | "已终止";
type ActivityStatus = "未开始" | "进行中" | "已完成" | "已终止";
type ContractStatus = "未开始" | "履约中" | "已完结" | "已终止";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type PlanType = "多活动计划" | "单次执行";
type DetailTab = "overview" | "activities" | "po" | "settlement" | "approval";

interface ApprovalRecord {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface OperationRecord {
  time: string;
  operator: string;
  action: string;
  comment: string;
}

interface BudgetSubject {
  id: string;
  firstBudget: string;
  subject: string;
  budgetDepartment: string;
  expenseMajor: string;
  expenseMinor: string;
  availableAmount: number;
  controlStatus: "可用" | "预警" | "冻结";
}

interface MarketingContract {
  id: string;
  code: string;
  name: string;
  supplier: string;
  amount: number;
  availableBalance: number;
  status: ContractStatus;
  settlementRule: string;
}

interface PoExecution {
  id: string;
  poCode: string;
  contractCode: string;
  orderAmount: number;
  budgetSubject: string;
  budgetDepartment: string;
  expenseMinor: string;
  feeDate: string;
}

interface FeeEstimate {
  id: string;
  estimateCode: string;
  contractCode: string;
  amount: number;
  estimateDate: string;
  method: string;
  sourceBill: string;
}

interface FulfillmentRecord {
  id: string;
  settlementCode: string;
  contractCode: string;
  amount: number;
  settlementDate: string;
  status: "待结算" | "结算中" | "已结算";
}

interface PlanActivity {
  id: string;
  scene: string;
  category: string;
  status: ActivityStatus;
  startDate: string;
  endDate: string;
  firstBudget: string;
  budgetSubject: string;
  budgetDepartment: string;
  estimatedBudget: number;
  contractId: string;
  contractCode: string;
  contractName: string;
  contractStatus: ContractStatus;
  supplier: string;
  settlementRule: string;
  poAmount: number;
  poCodes: string[];
  estimateAmount: number;
  estimateCodes: string[];
  actualSettlement: number;
  settlementCodes: string[];
  expenseMajor: string;
  expenseMinor: string;
  feeDate: string;
  platform: string;
  accountId: string;
  talent: string;
  taskId: string;
  brand: string;
  categoryName: string;
  sku: string;
  remark: string;
}

interface MarketingPlan {
  id: string;
  code: string;
  name: string;
  category: string;
  type: PlanType;
  startDate: string;
  endDate: string;
  department: string;
  applicant: string;
  applicantDate: string;
  createdAt: string;
  status: PlanStatus;
  store: string;
  channel: string;
  brand: string;
  businessUnit: string;
  source: string;
  description: string;
  terminatedReason?: string;
  syncStatus: SyncStatus;
  sourceSystem: string;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  budgetLocked: boolean;
  activities: PlanActivity[];
  approvals: ApprovalRecord[];
  operations: OperationRecord[];
}

interface PlanFilters {
  keyword: string;
  category: string;
  status: string;
  department: string;
  budgetDepartment: string;
  channel: string;
  brand: string;
  startDate: string;
  endDate: string;
}

interface PlanFormState {
  editingId?: string;
  name: string;
  category: string;
  type: PlanType;
  startDate: string;
  endDate: string;
  department: string;
  applicant: string;
  store: string;
  channel: string;
  brand: string;
  businessUnit: string;
  source: string;
  description: string;
  activities: PlanActivity[];
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const departments = ["品牌运营中心", "电商运营部", "直播运营部", "内容营销部", "渠道市场部", "华南大区市场部"];
const stores = ["天猫官方旗舰店", "京东自营旗舰店", "抖音官方旗舰店", "小红书品牌店", "华南线下渠道", "全渠道"];
const channels = ["天猫", "京东", "抖音", "小红书", "线下渠道", "全渠道"];
const brands = ["花西子", "示例品牌", "东方美学", "新品线"];
const businessUnits = ["美妆事业部", "电商事业部", "渠道事业部", "内容增长事业部"];
const planCategories = ["大促投放", "直播引流", "内容种草", "线下活动", "新品上市", "单次执行"];
const activityScenes = ["信息流投放", "直播间加热", "达人种草", "搜索推广", "线下快闪", "会员日会场", "新品测评", "短视频种草"];
const platforms = ["巨量引擎", "小红书蒲公英", "阿里妈妈", "京准通", "抖音达人平台", "线下执行"];

const budgetSubjectOptions: BudgetSubject[] = [
  { id: "budget-001", firstBudget: "渠道营销", subject: "信息流投放", budgetDepartment: "电商运营部", expenseMajor: "投放费用", expenseMinor: "信息流消耗", availableAmount: 260000, controlStatus: "可用" },
  { id: "budget-002", firstBudget: "直播营销", subject: "直播间投流", budgetDepartment: "直播运营部", expenseMajor: "直播费用", expenseMinor: "直播加热", availableAmount: 190000, controlStatus: "可用" },
  { id: "budget-003", firstBudget: "达人合作", subject: "达人投放", budgetDepartment: "内容营销部", expenseMajor: "内容费用", expenseMinor: "达人合作费", availableAmount: 140000, controlStatus: "预警" },
  { id: "budget-004", firstBudget: "渠道活动", subject: "活动物料", budgetDepartment: "渠道市场部", expenseMajor: "活动费用", expenseMinor: "活动物料", availableAmount: 90000, controlStatus: "可用" },
  { id: "budget-005", firstBudget: "渠道营销", subject: "搜索推广", budgetDepartment: "电商运营部", expenseMajor: "投放费用", expenseMinor: "搜索消耗", availableAmount: 85000, controlStatus: "预警" },
  { id: "budget-006", firstBudget: "新品上市", subject: "新品测评", budgetDepartment: "品牌运营中心", expenseMajor: "内容费用", expenseMinor: "测评合作费", availableAmount: 36000, controlStatus: "冻结" }
];

const contractOptions: MarketingContract[] = [
  { id: "contract-001", code: "YXHT-2026-118", name: "天猫 618 信息流投放框架合同", supplier: "上海星河数字营销有限公司", amount: 360000, availableBalance: 180000, status: "履约中", settlementRule: "按投放消耗月结，验收后 30 天付款" },
  { id: "contract-002", code: "YXHT-2026-126", name: "抖音直播间加热服务合同", supplier: "杭州热浪直播服务有限公司", amount: 240000, availableBalance: 130000, status: "履约中", settlementRule: "按场次验收，一场一结" },
  { id: "contract-003", code: "YXHT-2026-133", name: "小红书达人种草一口价合同", supplier: "上海拾光内容科技有限公司", amount: 180000, availableBalance: 72000, status: "未开始", settlementRule: "达人笔记发布并验收后一口价结算" },
  { id: "contract-004", code: "YXHT-2026-141", name: "华南快闪活动执行合同", supplier: "广州启点会展有限公司", amount: 120000, availableBalance: 41000, status: "履约中", settlementRule: "活动完成后按执行清单结算" },
  { id: "contract-005", code: "YXHT-2026-152", name: "京东搜索推广代理合同", supplier: "北京驰骋互动广告有限公司", amount: 210000, availableBalance: 65000, status: "已完结", settlementRule: "按平台账单结算，代理服务费 3%" },
  { id: "contract-006", code: "YXHT-2026-163", name: "新品测评达人任务合同", supplier: "上海青禾达人经纪有限公司", amount: 80000, availableBalance: 26000, status: "未开始", settlementRule: "任务 ID 验收后按达人包段结算" }
];

const poExecutionMock: PoExecution[] = [
  { id: "po-001", poCode: "PO-YX-2026-0618-01", contractCode: "YXHT-2026-118", orderAmount: 78000, budgetSubject: "信息流投放", budgetDepartment: "电商运营部", expenseMinor: "信息流消耗", feeDate: "2026-05-04" },
  { id: "po-002", poCode: "PO-YX-2026-0618-02", contractCode: "YXHT-2026-118", orderAmount: 42000, budgetSubject: "信息流投放", budgetDepartment: "电商运营部", expenseMinor: "信息流消耗", feeDate: "2026-05-05" },
  { id: "po-003", poCode: "PO-YX-2026-DY-01", contractCode: "YXHT-2026-126", orderAmount: 56000, budgetSubject: "直播间投流", budgetDepartment: "直播运营部", expenseMinor: "直播加热", feeDate: "2026-05-03" },
  { id: "po-004", poCode: "PO-YX-2026-XHS-01", contractCode: "YXHT-2026-133", orderAmount: 36000, budgetSubject: "达人投放", budgetDepartment: "内容营销部", expenseMinor: "达人合作费", feeDate: "2026-05-02" },
  { id: "po-005", poCode: "PO-YX-2026-HN-01", contractCode: "YXHT-2026-141", orderAmount: 39000, budgetSubject: "活动物料", budgetDepartment: "渠道市场部", expenseMinor: "活动物料", feeDate: "2026-04-28" },
  { id: "po-006", poCode: "PO-YX-2026-JD-01", contractCode: "YXHT-2026-152", orderAmount: 51000, budgetSubject: "搜索推广", budgetDepartment: "电商运营部", expenseMinor: "搜索消耗", feeDate: "2026-04-27" },
  { id: "po-007", poCode: "PO-YX-2026-NEW-01", contractCode: "YXHT-2026-163", orderAmount: 22000, budgetSubject: "新品测评", budgetDepartment: "品牌运营中心", expenseMinor: "测评合作费", feeDate: "2026-05-01" }
];

const feeEstimateMock: FeeEstimate[] = [
  { id: "est-001", estimateCode: "FYGS-2026-1201", contractCode: "YXHT-2026-118", amount: 94000, estimateDate: "2026-05-05", method: "平台账单预估", sourceBill: "ALI-ADS-20260505" },
  { id: "est-002", estimateCode: "FYGS-2026-1202", contractCode: "YXHT-2026-126", amount: 62000, estimateDate: "2026-05-05", method: "场次排期预估", sourceBill: "DY-LIVE-20260505" },
  { id: "est-003", estimateCode: "FYGS-2026-1203", contractCode: "YXHT-2026-133", amount: 44000, estimateDate: "2026-05-04", method: "达人任务预估", sourceBill: "XHS-TASK-33021" },
  { id: "est-004", estimateCode: "FYGS-2026-1204", contractCode: "YXHT-2026-141", amount: 41000, estimateDate: "2026-04-29", method: "执行清单预估", sourceBill: "HN-EVENT-20260429" },
  { id: "est-005", estimateCode: "FYGS-2026-1205", contractCode: "YXHT-2026-152", amount: 53000, estimateDate: "2026-04-30", method: "平台账单预估", sourceBill: "JD-ADS-20260430" },
  { id: "est-006", estimateCode: "FYGS-2026-1206", contractCode: "YXHT-2026-163", amount: 26000, estimateDate: "2026-05-03", method: "达人包段预估", sourceBill: "TASK-NEW-20260503" }
];

const fulfillmentMock: FulfillmentRecord[] = [
  { id: "ful-001", settlementCode: "JS-YX-2026-501", contractCode: "YXHT-2026-118", amount: 69000, settlementDate: "2026-05-06", status: "已结算" },
  { id: "ful-002", settlementCode: "JS-YX-2026-502", contractCode: "YXHT-2026-126", amount: 36000, settlementDate: "2026-05-06", status: "结算中" },
  { id: "ful-003", settlementCode: "JS-YX-2026-503", contractCode: "YXHT-2026-133", amount: 44000, settlementDate: "2026-05-05", status: "已结算" },
  { id: "ful-004", settlementCode: "JS-YX-2026-504", contractCode: "YXHT-2026-141", amount: 39000, settlementDate: "2026-04-30", status: "已结算" },
  { id: "ful-005", settlementCode: "JS-YX-2026-505", contractCode: "YXHT-2026-152", amount: 51000, settlementDate: "2026-04-30", status: "已结算" },
  { id: "ful-006", settlementCode: "JS-YX-2026-506", contractCode: "YXHT-2026-163", amount: 0, settlementDate: "-", status: "待结算" }
];

const createActivity = (index: number, overrides: Partial<PlanActivity> = {}): PlanActivity => {
  const budget = budgetSubjectOptions[(index - 1) % budgetSubjectOptions.length];
  const contract = contractOptions[(index - 1) % contractOptions.length];
  return {
    id: `activity-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    scene: activityScenes[(index - 1) % activityScenes.length],
    category: planCategories[(index - 1) % planCategories.length],
    status: "未开始",
    startDate: "2026-05-10",
    endDate: "2026-06-20",
    firstBudget: budget.firstBudget,
    budgetSubject: budget.subject,
    budgetDepartment: budget.budgetDepartment,
    estimatedBudget: index === 1 ? 68000 : 32000,
    contractId: contract.id,
    contractCode: contract.code,
    contractName: contract.name,
    contractStatus: contract.status,
    supplier: contract.supplier,
    settlementRule: contract.settlementRule,
    poAmount: 0,
    poCodes: [],
    estimateAmount: 0,
    estimateCodes: [],
    actualSettlement: 0,
    settlementCodes: [],
    expenseMajor: budget.expenseMajor,
    expenseMinor: budget.expenseMinor,
    feeDate: "2026-05-10",
    platform: platforms[(index - 1) % platforms.length],
    accountId: `ACCT-${String(8000 + index).padStart(5, "0")}`,
    talent: ["林奈奈", "阿辰", "小满", "南风", "陆小鹿"][index % 5],
    taskId: `TASK-${today.replaceAll("-", "")}-${String(index).padStart(2, "0")}`,
    brand: brands[(index - 1) % brands.length],
    categoryName: "彩妆",
    sku: index % 2 === 0 ? "空气蜜粉" : "同心锁口红",
    remark: "mock 活动明细，可演示预算、合同与执行回写。",
    ...overrides
  };
};

const withExecution = (activity: PlanActivity, complete = false): PlanActivity => {
  const poRows = poExecutionMock.filter((row) => row.contractCode === activity.contractCode);
  const estimateRows = feeEstimateMock.filter((row) => row.contractCode === activity.contractCode);
  const fulfillmentRows = fulfillmentMock.filter((row) => row.contractCode === activity.contractCode);
  const actualSettlement = sumBy(fulfillmentRows, "amount");
  return {
    ...activity,
    status: complete && actualSettlement > 0 ? "已完成" : actualSettlement > 0 || poRows.length > 0 || estimateRows.length > 0 ? "进行中" : "未开始",
    poAmount: sumBy(poRows, "orderAmount"),
    poCodes: poRows.map((row) => row.poCode),
    estimateAmount: sumBy(estimateRows, "amount"),
    estimateCodes: estimateRows.map((row) => row.estimateCode),
    actualSettlement,
    settlementCodes: fulfillmentRows.filter((row) => row.amount > 0).map((row) => row.settlementCode),
    contractStatus: complete && actualSettlement > 0 ? "已完结" : activity.contractStatus
  };
};

const initialPlans: MarketingPlan[] = [
  {
    id: "plan-001",
    code: "YXJH-2026-079",
    name: "天猫 618 品牌声量放大计划",
    category: "大促投放",
    type: "多活动计划",
    startDate: "2026-05-01",
    endDate: "2026-06-20",
    department: "电商运营部",
    applicant: "陈晨",
    applicantDate: "2026-04-25",
    createdAt: "2026-04-25",
    status: "进行中",
    store: "天猫官方旗舰店",
    channel: "天猫",
    brand: "花西子",
    businessUnit: "电商事业部",
    source: "年度营销预算",
    description: "618 预热、蓄水与爆发期站内投放计划。",
    syncStatus: "同步成功",
    sourceSystem: "[OA] 审批 / [预算系统] 预扣 / [合同系统] mock",
    lastSyncAt: "2026-05-05 16:40:00",
    syncBatchNo: "SYNC-PLAN-2026050501",
    budgetLocked: true,
    activities: [
      withExecution(createActivity(1, { id: "act-001", scene: "信息流投放", estimatedBudget: 120000, contractId: "contract-001", contractCode: "YXHT-2026-118", contractName: "天猫 618 信息流投放框架合同", supplier: "上海星河数字营销有限公司", settlementRule: "按投放消耗月结，验收后 30 天付款", budgetDepartment: "电商运营部", budgetSubject: "信息流投放", firstBudget: "渠道营销" })),
      createActivity(5, { id: "act-002", scene: "搜索推广", estimatedBudget: 60000, contractId: "contract-005", contractCode: "YXHT-2026-152", contractName: "京东搜索推广代理合同", supplier: "北京驰骋互动广告有限公司", settlementRule: "按平台账单结算，代理服务费 3%", budgetDepartment: "电商运营部", budgetSubject: "搜索推广", firstBudget: "渠道营销" }),
      createActivity(3, { id: "act-003", scene: "达人种草", estimatedBudget: 30000, contractId: "contract-003", contractCode: "YXHT-2026-133", contractName: "小红书达人种草一口价合同", supplier: "上海拾光内容科技有限公司", settlementRule: "达人笔记发布并验收后一口价结算", budgetDepartment: "内容营销部", budgetSubject: "达人投放", firstBudget: "达人合作" })
    ],
    approvals: [
      { node: "申请人提交", approver: "陈晨", date: "2026-04-25", comment: "提交 618 营销计划" },
      { node: "财务 BP 审核", approver: "林一", date: "2026-04-26", comment: "预算占用校验通过" },
      { node: "业务负责人审批", approver: "周岚", date: "2026-04-26", comment: "同意生效" }
    ],
    operations: [{ time: "2026-05-05 16:40:00", operator: "系统模拟", action: "执行回写", comment: "写入 PO、费用预估和部分实际结算" }]
  },
  {
    id: "plan-002",
    code: "YXJH-2026-080",
    name: "抖音新品直播引流计划",
    category: "直播引流",
    type: "多活动计划",
    startDate: "2026-05-08",
    endDate: "2026-05-28",
    department: "直播运营部",
    applicant: "李响",
    applicantDate: "2026-05-02",
    createdAt: "2026-05-02",
    status: "未开始",
    store: "抖音官方旗舰店",
    channel: "抖音",
    brand: "新品线",
    businessUnit: "内容增长事业部",
    source: "新品上市预算",
    description: "新品首发直播间投流与达人短视频回流。",
    syncStatus: "未同步",
    sourceSystem: "[业财中台] 本地计划",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: true,
    activities: [createActivity(2, { id: "act-004", scene: "直播间加热", estimatedBudget: 86000, contractId: "contract-002", contractCode: "YXHT-2026-126", contractName: "抖音直播间加热服务合同", supplier: "杭州热浪直播服务有限公司", settlementRule: "按场次验收，一场一结", budgetDepartment: "直播运营部", budgetSubject: "直播间投流", firstBudget: "直播营销" })],
    approvals: [{ node: "审批通过", approver: "周岚", date: "2026-05-03", comment: "计划已生效，等待执行回写" }],
    operations: [{ time: "2026-05-03 11:20:00", operator: "李响", action: "计划生效", comment: "预算已预扣" }]
  },
  {
    id: "plan-003",
    code: "YXJH-2026-081",
    name: "小红书达人种草单次执行计划",
    category: "单次执行",
    type: "单次执行",
    startDate: "2026-04-20",
    endDate: "2026-04-30",
    department: "内容营销部",
    applicant: "周宁",
    applicantDate: "2026-04-18",
    createdAt: "2026-04-18",
    status: "已完成",
    store: "小红书品牌店",
    channel: "小红书",
    brand: "花西子",
    businessUnit: "内容增长事业部",
    source: "达人内容预算",
    description: "单达人包段种草任务。",
    syncStatus: "同步成功",
    sourceSystem: "[达人系统] mock / [费用预估] mock",
    lastSyncAt: "2026-05-01 09:20:00",
    syncBatchNo: "SYNC-PLAN-2026050103",
    budgetLocked: true,
    activities: [withExecution(createActivity(3, { id: "act-005", scene: "达人种草", estimatedBudget: 44000, contractId: "contract-003", contractCode: "YXHT-2026-133", contractName: "小红书达人种草一口价合同", supplier: "上海拾光内容科技有限公司", settlementRule: "达人笔记发布并验收后一口价结算", taskId: "XHS-TASK-33021", talent: "林奈奈", platform: "小红书蒲公英" }), true)],
    approvals: [{ node: "审批通过", approver: "顾可", date: "2026-04-18", comment: "单次执行计划通过" }],
    operations: [{ time: "2026-05-01 09:20:00", operator: "系统模拟", action: "履约回写", comment: "达人任务验收完成，计划已完成" }]
  },
  {
    id: "plan-004",
    code: "YXJH-2026-082",
    name: "华南渠道快闪推广计划",
    category: "线下活动",
    type: "多活动计划",
    startDate: "2026-04-22",
    endDate: "2026-05-05",
    department: "华南大区市场部",
    applicant: "赵敏",
    applicantDate: "2026-04-16",
    createdAt: "2026-04-16",
    status: "已完成",
    store: "华南线下渠道",
    channel: "线下渠道",
    brand: "示例品牌",
    businessUnit: "渠道事业部",
    source: "区域活动预算",
    description: "华南渠道快闪活动与物料执行。",
    syncStatus: "同步成功",
    sourceSystem: "[OA] 审批 / [合同系统] mock",
    lastSyncAt: "2026-05-05 10:00:00",
    syncBatchNo: "SYNC-PLAN-2026050504",
    budgetLocked: true,
    activities: [withExecution(createActivity(4, { id: "act-006", scene: "线下快闪", estimatedBudget: 39000, contractId: "contract-004", contractCode: "YXHT-2026-141", contractName: "华南快闪活动执行合同", supplier: "广州启点会展有限公司", settlementRule: "活动完成后按执行清单结算", platform: "线下执行" }), true)],
    approvals: [{ node: "审批通过", approver: "周岚", date: "2026-04-17", comment: "同意执行" }],
    operations: [{ time: "2026-05-05 10:00:00", operator: "系统模拟", action: "计划结案", comment: "所有活动已完成" }]
  },
  {
    id: "plan-005",
    code: "YXJH-2026-083",
    name: "新品口红测评预算不足计划",
    category: "新品上市",
    type: "单次执行",
    startDate: "2026-05-12",
    endDate: "2026-05-25",
    department: "品牌运营中心",
    applicant: "王珊",
    applicantDate: "2026-05-04",
    createdAt: "2026-05-04",
    status: "草稿",
    store: "全渠道",
    channel: "全渠道",
    brand: "新品线",
    businessUnit: "美妆事业部",
    source: "新品上市预算",
    description: "用于演示提交时预算可用余额不足。",
    syncStatus: "未同步",
    sourceSystem: "[业财中台] 本地草稿",
    lastSyncAt: "-",
    syncBatchNo: "-",
    budgetLocked: false,
    activities: [createActivity(6, { id: "act-007", scene: "新品测评", estimatedBudget: 62000, budgetDepartment: "品牌运营中心", budgetSubject: "新品测评", firstBudget: "新品上市", contractId: "contract-006", contractCode: "YXHT-2026-163", contractName: "新品测评达人任务合同", supplier: "上海青禾达人经纪有限公司", settlementRule: "任务 ID 验收后按达人包段结算", taskId: "TASK-NEW-20260503" })],
    approvals: [{ node: "保存草稿", approver: "王珊", date: "2026-05-04", comment: "待调整预算科目或金额" }],
    operations: [{ time: "2026-05-04 18:20:00", operator: "王珊", action: "保存草稿", comment: "预算可用余额不足样例" }]
  },
  {
    id: "plan-006",
    code: "YXJH-2026-084",
    name: "合同同步失败演示计划",
    category: "内容种草",
    type: "多活动计划",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    department: "内容营销部",
    applicant: "高悦",
    applicantDate: "2026-04-28",
    createdAt: "2026-04-28",
    status: "已驳回",
    store: "小红书品牌店",
    channel: "小红书",
    brand: "花西子",
    businessUnit: "内容增长事业部",
    source: "达人内容预算",
    description: "用于演示错误状态和重试同步。",
    syncStatus: "同步失败",
    sourceSystem: "[合同系统] mock",
    lastSyncAt: "2026-05-03 15:40:00",
    syncBatchNo: "SYNC-PLAN-2026050306",
    failureReason: "合同系统 mock 回写超时 [CONTRACT-504]",
    budgetLocked: false,
    activities: [createActivity(3, { id: "act-008", estimatedBudget: 52000, contractId: "contract-003", contractCode: "YXHT-2026-133", contractName: "小红书达人种草一口价合同", supplier: "上海拾光内容科技有限公司", settlementRule: "达人笔记发布并验收后一口价结算" })],
    approvals: [{ node: "财务 BP 审核", approver: "林一", date: "2026-04-29", comment: "驳回：合同回写失败，请重试" }],
    operations: [{ time: "2026-05-03 15:40:00", operator: "系统模拟", action: "合同回写失败", comment: "合同系统 mock 超时" }]
  },
  {
    id: "plan-007",
    code: "YXJH-2026-085",
    name: "会员日站内会场推广计划",
    category: "大促投放",
    type: "多活动计划",
    startDate: "2026-05-15",
    endDate: "2026-05-20",
    department: "电商运营部",
    applicant: "苏晴",
    applicantDate: "2026-05-05",
    createdAt: "2026-05-05",
    status: "审批中",
    store: "天猫官方旗舰店",
    channel: "天猫",
    brand: "东方美学",
    businessUnit: "电商事业部",
    source: "月度活动预算",
    description: "会员日会场资源和信息流引流。",
    syncStatus: "同步中",
    sourceSystem: "[OA] 审批",
    lastSyncAt: "2026-05-05 19:00:00",
    syncBatchNo: "SYNC-PLAN-2026050507",
    budgetLocked: false,
    activities: [createActivity(1, { id: "act-009", scene: "会员日会场", estimatedBudget: 73000 })],
    approvals: [{ node: "申请人提交", approver: "苏晴", date: "2026-05-05", comment: "等待业务负责人审批" }],
    operations: [{ time: "2026-05-05 19:00:00", operator: "苏晴", action: "提交审批", comment: "模拟提交 OA" }]
  },
  {
    id: "plan-008",
    code: "YXJH-2026-086",
    name: "旧版渠道活动终止计划",
    category: "线下活动",
    type: "多活动计划",
    startDate: "2026-04-01",
    endDate: "2026-04-18",
    department: "渠道市场部",
    applicant: "许宁",
    applicantDate: "2026-03-28",
    createdAt: "2026-03-28",
    status: "已终止",
    store: "华南线下渠道",
    channel: "线下渠道",
    brand: "示例品牌",
    businessUnit: "渠道事业部",
    source: "区域活动预算",
    description: "供应商排期变化，计划终止。",
    terminatedReason: "线下场地取消，活动改期至 5 月新计划。",
    syncStatus: "同步成功",
    sourceSystem: "[OA] 终止审批 / [预算系统] mock 释放",
    lastSyncAt: "2026-04-10 14:00:00",
    syncBatchNo: "SYNC-PLAN-2026041008",
    budgetLocked: false,
    activities: [createActivity(4, { id: "act-010", status: "已终止", scene: "线下快闪", estimatedBudget: 48000 })],
    approvals: [{ node: "终止审批通过", approver: "顾可", date: "2026-04-10", comment: "同意终止并模拟释放预算" }],
    operations: [{ time: "2026-04-10 14:00:00", operator: "许宁", action: "终止计划", comment: "线下场地取消" }]
  }
];

const defaultForm: PlanFormState = {
  name: "新建营销计划",
  category: "大促投放",
  type: "多活动计划",
  startDate: today,
  endDate: "2026-06-20",
  department: "电商运营部",
  applicant: "陈晨",
  store: "天猫官方旗舰店",
  channel: "天猫",
  brand: "花西子",
  businessUnit: "电商事业部",
  source: "年度营销预算",
  description: "用于演示营销计划、活动明细、预算占用和执行回写。",
  activities: [createActivity(1)]
};

export default function MarketingPlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [filters, setFilters] = useState<PlanFilters>({ keyword: "", category: "全部", status: "全部", department: "全部", budgetDepartment: "全部", channel: "全部", brand: "全部", startDate: "", endDate: "" });
  const [tableLoading, setTableLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<PlanFormState | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<MarketingPlan | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [terminatePlan, setTerminatePlan] = useState<MarketingPlan | null>(null);
  const [terminateReason, setTerminateReason] = useState("");
  const [executionActivity, setExecutionActivity] = useState<PlanActivity | null>(null);

  const filteredPlans = useMemo(() => filterPlans(plans, filters), [plans, filters]);
  const stats = useMemo(() => {
    const occupied = plans.reduce((sum, plan) => sum + planTotalBudget(plan), 0);
    const actual = plans.reduce((sum, plan) => sum + planActualBudget(plan), 0);
    return [
      { label: "计划总数", value: String(plans.length), sub: `${plans.filter((plan) => plan.status === "进行中").length} 个进行中` },
      { label: "占用预算总额", value: formatMoney(occupied), sub: "活动预估预算合计" },
      { label: "实际执行金额", value: formatMoney(actual), sub: `执行率 ${occupied ? Math.round((actual / occupied) * 100) : 0}%` },
      { label: "同步失败", value: String(plans.filter((plan) => plan.syncStatus === "同步失败").length), sub: "可重试 mock 同步" }
    ];
  }, [plans]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  function simulateQuery() {
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 650);
  }

  function resetFilters() {
    setFilters({ keyword: "", category: "全部", status: "全部", department: "全部", budgetDepartment: "全部", channel: "全部", brand: "全部", startDate: "", endDate: "" });
    setPageError("");
    setTableLoading(true);
    window.setTimeout(() => setTableLoading(false), 450);
  }

  function openCreate() {
    setForm({ ...defaultForm, activities: [createActivity(1)] });
    setFormErrors({});
  }

  function openEdit(plan: MarketingPlan) {
    if (["已完成", "已终止"].includes(plan.status)) {
      showToast("已完成或已终止计划不允许编辑。");
      return;
    }
    setForm({
      editingId: plan.id,
      name: plan.name,
      category: plan.category,
      type: plan.type,
      startDate: plan.startDate,
      endDate: plan.endDate,
      department: plan.department,
      applicant: plan.applicant,
      store: plan.store,
      channel: plan.channel,
      brand: plan.brand,
      businessUnit: plan.businessUnit,
      source: plan.source,
      description: plan.description,
      activities: plan.activities.map((activity) => ({ ...activity, poCodes: [...activity.poCodes], estimateCodes: [...activity.estimateCodes], settlementCodes: [...activity.settlementCodes] }))
    });
    setFormErrors({});
  }

  function savePlan(status: "草稿" | "审批中") {
    if (!form) return;
    const errors = validatePlanForm(form, status === "审批中");
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const next = buildPlan(form, status);
    setPlans((items) => (form.editingId ? items.map((item) => (item.id === form.editingId ? { ...item, ...next, id: item.id, code: item.code, createdAt: item.createdAt } : item)) : [next, ...items]));
    setForm(null);
    showToast(status === "草稿" ? "已保存草稿，计划台账已更新。" : "已模拟提交 OA，等待审批通过后生效。");
  }

  function approvePlan(plan: MarketingPlan) {
    if (plan.status !== "审批中") return;
    setOverlayLoading("正在模拟 OA 审批与预算预扣");
    window.setTimeout(() => {
      setPlans((items) => items.map((item) => (item.id === plan.id ? { ...item, status: "未开始", budgetLocked: true, syncStatus: "同步成功", sourceSystem: "[OA] 审批 / [预算系统] 预扣", lastSyncAt: nowText, syncBatchNo: `SYNC-PLAN-${Date.now().toString().slice(-8)}`, approvals: [...item.approvals, { node: "业务负责人审批", approver: "周岚", date: today, comment: "审批通过，计划生效并模拟占用预算" }], operations: [...item.operations, { time: nowText, operator: "系统模拟", action: "计划生效", comment: "预算已预扣" }] } : item)));
      setOverlayLoading("");
      showToast("审批通过，计划状态已更新为未开始，并展示预算已预扣。");
    }, 850);
  }

  function rejectPlan(plan: MarketingPlan) {
    setPlans((items) => items.map((item) => (item.id === plan.id ? { ...item, status: "已驳回", syncStatus: "同步失败", lastSyncAt: nowText, failureReason: "模拟驳回：活动预算或合同信息需补充。", approvals: [...item.approvals, { node: "财务 BP 审核", approver: "林一", date: today, comment: "驳回：请补充预算和合同关联" }] } : item)));
    showToast("已模拟审批驳回，可编辑后重新提交。");
  }

  function copyPlan(plan: MarketingPlan) {
    const copiedActivities = plan.activities.map((activity, index) => ({
      ...activity,
      id: `copy-${Date.now()}-${index}`,
      status: "未开始" as ActivityStatus,
      poAmount: 0,
      poCodes: [],
      estimateAmount: 0,
      estimateCodes: [],
      actualSettlement: 0,
      settlementCodes: []
    }));
    setForm({
      name: `${plan.name} - 复制`,
      category: plan.category,
      type: plan.type,
      startDate: today,
      endDate: plan.endDate,
      department: plan.department,
      applicant: plan.applicant,
      store: plan.store,
      channel: plan.channel,
      brand: plan.brand,
      businessUnit: plan.businessUnit,
      source: plan.source,
      description: plan.description,
      activities: copiedActivities
    });
    setFormErrors({});
    showToast("已复制计划基础信息和活动配置，执行数据未复制。");
  }

  function simulateWriteBack(plan: MarketingPlan) {
    if (plan.status === "已终止") {
      showToast("已终止计划不允许继续回写执行数据。");
      return;
    }
    setOverlayLoading("正在同步执行数据...");
    window.setTimeout(() => {
      setPlans((items) =>
        items.map((item) => {
          if (item.id !== plan.id) return item;
          const activities = item.activities.map((activity) => withExecution(activity, true));
          return {
            ...item,
            activities,
            status: derivePlanStatus(activities, item.status),
            syncStatus: "同步成功",
            lastSyncAt: nowText,
            syncBatchNo: `SYNC-EXEC-${Date.now().toString().slice(-8)}`,
            failureReason: undefined,
            sourceSystem: "[PO 执行] mock / [费用预估] mock / [履约台账] mock",
            operations: [...item.operations, { time: nowText, operator: "系统模拟", action: "模拟执行回写", comment: "按合同编号带出 PO、费用预估与实际结算" }]
          };
        })
      );
      setDetail((current) => (current && current.id === plan.id ? { ...current, activities: current.activities.map((activity) => withExecution(activity, true)), syncStatus: "同步成功", lastSyncAt: nowText, failureReason: undefined } : current));
      setOverlayLoading("");
      showToast("已按合同编号回写 PO、费用预估和实际结算，金额汇总已刷新。");
    }, 900);
  }

  function retrySync() {
    setPageError("");
    setOverlayLoading("正在重试 mock 同步");
    window.setTimeout(() => {
      setPlans((items) => items.map((item) => (item.syncStatus === "同步失败" ? { ...item, syncStatus: "同步成功", lastSyncAt: nowText, failureReason: undefined, operations: [...item.operations, { time: nowText, operator: "系统模拟", action: "重试同步", comment: "mock 同步成功" }] } : item)));
      setOverlayLoading("");
      showToast("同步失败样例已重试成功。");
    }, 750);
  }

  function confirmTerminate() {
    if (!terminatePlan) return;
    if (!terminateReason.trim()) {
      showToast("请填写终止原因。");
      return;
    }
    setPlans((items) =>
      items.map((item) =>
        item.id === terminatePlan.id
          ? {
              ...item,
              status: "已终止",
              terminatedReason: terminateReason,
              budgetLocked: false,
              activities: item.activities.map((activity) => (activity.status === "已完成" ? activity : { ...activity, status: "已终止" })),
              syncStatus: "同步成功",
              sourceSystem: "[OA] 终止审批 / [预算系统] mock 释放",
              lastSyncAt: nowText,
              operations: [...item.operations, { time: nowText, operator: "系统模拟", action: "终止计划", comment: `释放预算占用 ${formatMoney(planRemainingBudget(item))}：${terminateReason}` }]
            }
          : item
      )
    );
    setTerminatePlan(null);
    setTerminateReason("");
    showToast("计划已终止，并模拟释放未使用预算占用。");
  }

  function openDetail(plan: MarketingPlan, tab: DetailTab = "overview") {
    setDetail(plan);
    setDetailTab(tab);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="marketing-plans" title="营销计划" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">营销计划与事项 / 营销计划管理</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">营销计划管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">计划台账、活动明细、预算占用、合同关联、PO/费用预估/履约回写的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={openCreate}>新增营销计划</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>导出模拟</Button>
              <Button variant="secondary" onClick={() => setPageError("模拟接口失败：营销计划台账服务响应超时，请点击重试。")}>模拟异常</Button>
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

          <FilterBar filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} />

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
            {tableLoading && <LoadingMask text="正在查询营销计划 mock 数据" />}
            <PlanTable rows={filteredPlans} onDetail={openDetail} onEdit={openEdit} onCopy={copyPlan} onWriteBack={simulateWriteBack} onApprove={approvePlan} onReject={rejectPlan} onTerminate={(plan) => { setTerminatePlan(plan); setTerminateReason(plan.terminatedReason ?? ""); }} />
            {!tableLoading && filteredPlans.length === 0 && <EmptyState onCreate={openCreate} onReset={resetFilters} />}
          </div>
        </section>
      </div>

      {form && <PlanFormModal form={form} errors={formErrors} onChange={(patch) => setForm((current) => (current ? normalizeForm(current, patch) : current))} onClose={() => setForm(null)} onSave={() => savePlan("草稿")} onSubmit={() => savePlan("审批中")} onOpenExecution={setExecutionActivity} />}
      {detail && <DetailDrawer plan={plans.find((item) => item.id === detail.id) ?? detail} activeTab={detailTab} onTab={setDetailTab} onClose={() => setDetail(null)} onWriteBack={simulateWriteBack} onOpenExecution={setExecutionActivity} />}
      {terminatePlan && <TerminateModal plan={terminatePlan} reason={terminateReason} onChange={setTerminateReason} onClose={() => setTerminatePlan(null)} onSubmit={confirmTerminate} />}
      {executionActivity && <ExecutionModal activity={executionActivity} onClose={() => setExecutionActivity(null)} />}
      {overlayLoading && <LoadingMask full text={overlayLoading} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function PlanTable({ rows, onDetail, onEdit, onCopy, onWriteBack, onApprove, onReject, onTerminate }: { rows: MarketingPlan[]; onDetail: (plan: MarketingPlan, tab?: DetailTab) => void; onEdit: (plan: MarketingPlan) => void; onCopy: (plan: MarketingPlan) => void; onWriteBack: (plan: MarketingPlan) => void; onApprove: (plan: MarketingPlan) => void; onReject: (plan: MarketingPlan) => void; onTerminate: (plan: MarketingPlan) => void }) {
  return (
    <Table>
      <thead className="bg-slate-50 text-left text-xs text-slate-600">
        <tr>
          <Th>计划编号</Th>
          <Th>营销计划名称</Th>
          <Th>状态</Th>
          <Th>期间</Th>
          <Th>使用部门</Th>
          <Th>渠道/品牌</Th>
          <Th>占用预算</Th>
          <Th>实际支出</Th>
          <Th>预算执行率</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-sm">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td><button className="text-blue-600 hover:underline" onClick={() => onDetail(item)}>{item.code}</button></Td>
            <Td>
              <div className="font-medium text-slate-800">{item.name}</div>
              <div className="mt-1 text-xs text-slate-400">{item.category} / {item.type}</div>
            </Td>
            <Td>
              <StatusBadge status={item.status} />
              {item.budgetLocked && <div className="mt-1"><StatusBadge status="预算已预扣" /></div>}
            </Td>
            <Td>{item.startDate} 至 {item.endDate}</Td>
            <Td>{item.department}</Td>
            <Td>{item.channel} / {item.brand}</Td>
            <Td align="right">{formatMoney(planTotalBudget(item))}</Td>
            <Td align="right"><button className="text-blue-600 hover:underline" onClick={() => onDetail(item, "settlement")}>{formatMoney(planActualBudget(item))}</button></Td>
            <Td><ProgressBar value={planActualBudget(item)} total={planTotalBudget(item)} /></Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
              {item.failureReason && <div className="mt-1 text-xs text-red-500">{item.failureReason}</div>}
            </Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item)}>详情</button>
                {!["已完成", "已终止"].includes(item.status) && <button onClick={() => onEdit(item)}>编辑</button>}
                <button onClick={() => onCopy(item)}>复制</button>
                {!["草稿", "审批中", "已终止"].includes(item.status) && <button onClick={() => onWriteBack(item)}>模拟回写</button>}
                {item.status === "审批中" && <button onClick={() => onApprove(item)}>审批通过</button>}
                {item.status === "审批中" && <button onClick={() => onReject(item)}>驳回</button>}
                {!["已完成", "已终止"].includes(item.status) && <button onClick={() => onTerminate(item)}>终止</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function FilterBar({ filters, setFilters, onQuery, onReset }: { filters: PlanFilters; setFilters: React.Dispatch<React.SetStateAction<PlanFilters>>; onQuery: () => void; onReset: () => void }) {
  const patch = (next: Partial<PlanFilters>) => setFilters((current) => ({ ...current, ...next }));
  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-4">
        <Field label="计划名称/编号">
          <Input value={filters.keyword} onChange={(keyword) => patch({ keyword })} placeholder="请输入计划名称、编号或申请人" />
        </Field>
        <Field label="计划状态">
          <Select value={filters.status} onChange={(status) => patch({ status })} options={["全部", "草稿", "审批中", "已驳回", "未开始", "进行中", "已完成", "已终止", "同步失败"]} />
        </Field>
        <Field label="计划分类">
          <Select value={filters.category} onChange={(category) => patch({ category })} options={["全部", ...planCategories]} />
        </Field>
        <Field label="使用部门">
          <Select value={filters.department} onChange={(department) => patch({ department })} options={["全部", ...departments]} />
        </Field>
        <Field label="预算部门">
          <Select value={filters.budgetDepartment} onChange={(budgetDepartment) => patch({ budgetDepartment })} options={["全部", ...Array.from(new Set(budgetSubjectOptions.map((item) => item.budgetDepartment)))]} />
        </Field>
        <Field label="渠道">
          <Select value={filters.channel} onChange={(channel) => patch({ channel })} options={["全部", ...channels]} />
        </Field>
        <Field label="品牌">
          <Select value={filters.brand} onChange={(brand) => patch({ brand })} options={["全部", ...brands]} />
        </Field>
        <div className="flex items-end gap-2">
          <Button onClick={onQuery}>查询</Button>
          <Button variant="secondary" onClick={onReset}>重置</Button>
        </div>
      </div>
    </div>
  );
}

function PlanFormModal({ form, errors, onChange, onClose, onSave, onSubmit, onOpenExecution }: { form: PlanFormState; errors: Record<string, string>; onChange: (patch: Partial<PlanFormState>) => void; onClose: () => void; onSave: () => void; onSubmit: () => void; onOpenExecution: (activity: PlanActivity) => void }) {
  const occupied = form.activities.reduce((sum, activity) => sum + Number(activity.estimatedBudget || 0), 0);
  const actual = form.activities.reduce((sum, activity) => sum + activity.actualSettlement, 0);
  const singleMode = form.type === "单次执行";
  return (
    <Modal title={form.editingId ? "编辑营销计划" : "新增营销计划"} onClose={onClose} size="xl">
      {errors.form && <Alert tone="red">{errors.form}</Alert>}
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <ReadOnly label="占用预算总额" value={formatMoney(occupied)} />
        <ReadOnly label="实际使用预算" value={formatMoney(actual)} />
        <ReadOnly label="预算占用状态" value={<StatusBadge status="提交后预扣" />} />
      </div>

      <Section title="计划基本信息">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="营销计划名称" required error={errors.name}>
            <Input value={form.name} onChange={(name) => onChange({ name })} />
          </Field>
          <Field label="营销计划分类" required>
            <Select value={form.category} onChange={(category) => onChange({ category })} options={planCategories} />
          </Field>
          <Field label="计划类型" required>
            <Select value={form.type} onChange={(type) => onChange({ type: type as PlanType, activities: form.activities.slice(0, type === "单次执行" ? 1 : form.activities.length) })} options={["多活动计划", "单次执行"]} />
          </Field>
          <Field label="开始时间" required error={errors.startDate}>
            <Input value={form.startDate} onChange={(startDate) => onChange({ startDate })} placeholder="YYYY-MM-DD" />
          </Field>
          <Field label="结束时间" required error={errors.endDate}>
            <Input value={form.endDate} onChange={(endDate) => onChange({ endDate })} placeholder="YYYY-MM-DD" />
          </Field>
          <Field label="使用部门" required>
            <Select value={form.department} onChange={(department) => onChange({ department })} options={departments} />
          </Field>
          <Field label="申请人" required error={errors.applicant}>
            <Input value={form.applicant} onChange={(applicant) => onChange({ applicant })} />
          </Field>
          <Field label="店铺全称">
            <Select value={form.store} onChange={(store) => onChange({ store })} options={stores} />
          </Field>
          <Field label="渠道">
            <Select value={form.channel} onChange={(channel) => onChange({ channel })} options={channels} />
          </Field>
          <Field label="品牌">
            <Select value={form.brand} onChange={(brand) => onChange({ brand })} options={brands} />
          </Field>
          <Field label="业务单元">
            <Select value={form.businessUnit} onChange={(businessUnit) => onChange({ businessUnit })} options={businessUnits} />
          </Field>
          <Field label="业务来源">
            <Input value={form.source} onChange={(source) => onChange({ source })} />
          </Field>
          <div className="md:col-span-3">
            <Field label="计划说明" required error={errors.description}>
              <Textarea value={form.description} onChange={(description) => onChange({ description })} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title={singleMode ? "单次执行计划活动" : "营销活动明细"}>
        <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
          选择预算科目会带出一级预算、预算部门和费用小类；选择合同会带出供应商、合同状态和结算规则。提交时校验活动日期、预算余额和合同关联。
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px] text-left">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <Th>行号</Th>
                <Th>活动场景</Th>
                <Th>状态</Th>
                <Th>活动期间</Th>
                <Th>预算科目</Th>
                <Th>预算部门</Th>
                <Th>预估预算</Th>
                <Th>关联合同</Th>
                <Th>供应商</Th>
                <Th>PO/预估/结算</Th>
                <Th>投放/达人任务</Th>
                <Th>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {form.activities.map((activity, index) => (
                <tr key={activity.id}>
                  <Td>{index + 1}</Td>
                  <Td>
                    <Select value={activity.scene} onChange={(scene) => onChange({ activities: updateActivity(form.activities, activity.id, { scene }) })} options={activityScenes} />
                    {errors[`activity-${activity.id}-scene`] && <div className="mt-1 text-xs text-red-500">{errors[`activity-${activity.id}-scene`]}</div>}
                  </Td>
                  <Td><StatusBadge status={activity.status} /></Td>
                  <Td>
                    <div className="grid gap-2">
                      <Input value={activity.startDate} onChange={(startDate) => onChange({ activities: updateActivity(form.activities, activity.id, { startDate }) })} />
                      <Input value={activity.endDate} onChange={(endDate) => onChange({ activities: updateActivity(form.activities, activity.id, { endDate }) })} />
                    </div>
                    {errors[`activity-${activity.id}-date`] && <div className="mt-1 text-xs text-red-500">{errors[`activity-${activity.id}-date`]}</div>}
                  </Td>
                  <Td>
                    <Select value={activity.budgetSubject} onChange={(budgetSubject) => onChange({ activities: updateActivity(form.activities, activity.id, normalizeActivityPatch(activity, { budgetSubject })) })} options={budgetSubjectOptions.map((item) => item.subject)} />
                    <div className="mt-1 text-xs text-slate-400">{activity.firstBudget} / {activity.expenseMinor}</div>
                    {errors[`activity-${activity.id}-budget`] && <div className="mt-1 text-xs text-red-500">{errors[`activity-${activity.id}-budget`]}</div>}
                  </Td>
                  <Td>{activity.budgetDepartment}</Td>
                  <Td>
                    <Input value={String(activity.estimatedBudget)} onChange={(estimatedBudget) => onChange({ activities: updateActivity(form.activities, activity.id, { estimatedBudget: Number(estimatedBudget) }) })} />
                    <div className="mt-1 text-xs text-slate-400">可用 {formatMoney(budgetAvailable(activity.budgetSubject, activity.budgetDepartment))}</div>
                    {errors[`activity-${activity.id}-amount`] && <div className="mt-1 text-xs text-red-500">{errors[`activity-${activity.id}-amount`]}</div>}
                  </Td>
                  <Td>
                    <Select value={activity.contractId} onChange={(contractId) => onChange({ activities: updateActivity(form.activities, activity.id, normalizeActivityPatch(activity, { contractId })) })} options={contractOptions.map((contract) => contract.id)} labels={Object.fromEntries(contractOptions.map((contract) => [contract.id, contract.code]))} />
                    <div className="mt-1 max-w-44 truncate text-xs text-slate-400" title={activity.contractName}>{activity.contractName}</div>
                    {errors[`activity-${activity.id}-contract`] && <div className="mt-1 text-xs text-red-500">{errors[`activity-${activity.id}-contract`]}</div>}
                  </Td>
                  <Td>
                    <div>{activity.supplier}</div>
                    <div className="mt-1"><StatusBadge status={activity.contractStatus} /></div>
                  </Td>
                  <Td>
                    <button className="text-blue-600 hover:underline" onClick={() => onOpenExecution(activity)}>{formatMoney(activity.actualSettlement)}</button>
                    <div className="mt-1 text-xs text-slate-400">PO {formatMoney(activity.poAmount)} / 预估 {formatMoney(activity.estimateAmount)}</div>
                  </Td>
                  <Td>
                    <div>{activity.platform}</div>
                    <button className="mt-1 text-xs text-blue-600 hover:underline" onClick={() => alert("已模拟跳转至达人平台查看任务详情。")}>{activity.taskId}</button>
                  </Td>
                  <Td>
                    <InlineActions>
                      {!singleMode && <button onClick={() => onChange({ activities: [...form.activities, copyActivity(activity)] })}>复制</button>}
                      {!singleMode && activity.status === "未开始" && <button onClick={() => onChange({ activities: form.activities.filter((item) => item.id !== activity.id) })}>删除</button>}
                      <button onClick={() => onOpenExecution(activity)}>明细</button>
                    </InlineActions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!singleMode && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => onChange({ activities: [...form.activities, createActivity(form.activities.length + 1)] })}>新增活动行</Button>
            <Button size="sm" variant="secondary" onClick={() => onChange({ activities: [...form.activities, createActivity(form.activities.length + 1), createActivity(form.activities.length + 2)] })}>快速新增两行</Button>
          </div>
        )}
      </Section>

      <Section title="审批与外部系统 mock">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="模拟 OA" value="保存草稿后可提交审批" />
          <ReadOnly label="模拟预算系统" value="审批通过后预算已预扣" />
          <ReadOnly label="模拟达人/广告平台" value="只展示同步状态和任务 ID" />
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

function DetailDrawer({ plan, activeTab, onTab, onClose, onWriteBack, onOpenExecution }: { plan: MarketingPlan; activeTab: DetailTab; onTab: (tab: DetailTab) => void; onClose: () => void; onWriteBack: (plan: MarketingPlan) => void; onOpenExecution: (activity: PlanActivity) => void }) {
  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: "overview", label: "概览" },
    { key: "activities", label: "活动明细" },
    { key: "po", label: "PO记录" },
    { key: "settlement", label: "结算/预估记录" },
    { key: "approval", label: "审批记录" }
  ];
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-5xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">{plan.code}</div>
              <h2 className="mt-1 text-xl font-semibold">{plan.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={plan.status} />
                <StatusBadge status={plan.syncStatus} />
                {plan.budgetLocked && <StatusBadge status="预算已预扣" />}
              </div>
            </div>
            <div className="flex gap-2">
              {!["草稿", "审批中", "已终止"].includes(plan.status) && <Button size="sm" onClick={() => onWriteBack(plan)}>模拟回写</Button>}
              <Button size="sm" variant="secondary" onClick={onClose}>关闭</Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button key={tab.key} className={`rounded-md px-3 py-2 text-sm font-medium ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`} onClick={() => onTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5">
          {plan.failureReason && <Alert tone="red">{plan.failureReason}</Alert>}
          {activeTab === "overview" && <PlanOverview plan={plan} />}
          {activeTab === "activities" && <ActivityDetailTable rows={plan.activities} onOpenExecution={onOpenExecution} />}
          {activeTab === "po" && <ExecutionRecordTable rows={plan.activities.flatMap((activity) => poExecutionMock.filter((row) => row.contractCode === activity.contractCode))} type="po" />}
          {activeTab === "settlement" && (
            <div className="space-y-4">
              <ExecutionRecordTable rows={plan.activities.flatMap((activity) => feeEstimateMock.filter((row) => row.contractCode === activity.contractCode))} type="estimate" />
              <ExecutionRecordTable rows={plan.activities.flatMap((activity) => fulfillmentMock.filter((row) => row.contractCode === activity.contractCode))} type="settlement" />
            </div>
          )}
          {activeTab === "approval" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="审批记录"><StepList steps={plan.approvals} /></Section>
              <Section title="操作记录"><OperationList rows={plan.operations} /></Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanOverview({ plan }: { plan: MarketingPlan }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadOnly label="占用预算总额" value={formatMoney(planTotalBudget(plan))} />
          <ReadOnly label="实际使用预算" value={formatMoney(planActualBudget(plan))} />
          <ReadOnly label="预算剩余" value={formatMoney(planRemainingBudget(plan))} />
          <ReadOnly label="执行率" value={<ProgressBar value={planActualBudget(plan)} total={planTotalBudget(plan)} wide />} />
        </div>
      </div>
      <Section title="计划基础信息">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="营销计划分类" value={plan.category} />
          <ReadOnly label="计划类型" value={plan.type} />
          <ReadOnly label="计划期间" value={`${plan.startDate} 至 ${plan.endDate}`} />
          <ReadOnly label="使用部门" value={plan.department} />
          <ReadOnly label="申请人/申请日期" value={`${plan.applicant} / ${plan.applicantDate}`} />
          <ReadOnly label="店铺全称" value={plan.store} />
          <ReadOnly label="渠道" value={plan.channel} />
          <ReadOnly label="品牌" value={plan.brand} />
          <ReadOnly label="业务单元" value={plan.businessUnit} />
          <ReadOnly label="业务来源" value={plan.source} />
          <ReadOnly label="最近回写时间" value={plan.lastSyncAt} />
          <ReadOnly label="同步批次号" value={plan.syncBatchNo} />
          <div className="md:col-span-3"><ReadOnly label="计划说明" value={plan.description} /></div>
          {plan.terminatedReason && <div className="md:col-span-3"><ReadOnly label="终止原因" value={plan.terminatedReason} /></div>}
        </div>
      </Section>
      <Section title="执行进度">
        <ActivityDetailTable rows={plan.activities} compact />
      </Section>
    </div>
  );
}

function ActivityDetailTable({ rows, compact = false, onOpenExecution }: { rows: PlanActivity[]; compact?: boolean; onOpenExecution?: (activity: PlanActivity) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left">
        <thead className="bg-slate-50 text-xs text-slate-600">
          <tr>
            <Th>活动场景</Th>
            <Th>活动状态</Th>
            <Th>预算部门</Th>
            <Th>预算科目</Th>
            <Th>预估预算</Th>
            <Th>PO下单</Th>
            <Th>费用预估</Th>
            <Th>实际结算</Th>
            <Th>合同</Th>
            {!compact && <Th>达人/任务</Th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {rows.map((activity) => (
            <tr key={activity.id}>
              <Td>{activity.scene}</Td>
              <Td><StatusBadge status={activity.status} /></Td>
              <Td>{activity.budgetDepartment}</Td>
              <Td>{activity.firstBudget} / {activity.budgetSubject}</Td>
              <Td align="right">{formatMoney(activity.estimatedBudget)}</Td>
              <Td align="right">{formatMoney(activity.poAmount)}</Td>
              <Td align="right">{formatMoney(activity.estimateAmount)}</Td>
              <Td align="right"><button className="text-blue-600 hover:underline" onClick={() => onOpenExecution?.(activity)}>{formatMoney(activity.actualSettlement)}</button></Td>
              <Td>
                <div>{activity.contractCode}</div>
                <div className="mt-1 text-xs text-slate-400">{activity.supplier}</div>
              </Td>
              {!compact && (
                <Td>
                  <div>{activity.talent} / {activity.platform}</div>
                  <button className="mt-1 text-xs text-blue-600 hover:underline" onClick={() => alert("已模拟跳转至达人平台查看任务详情。")}>{activity.taskId}</button>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecutionRecordTable({ rows, type }: { rows: Array<PoExecution | FeeEstimate | FulfillmentRecord>; type: "po" | "estimate" | "settlement" }) {
  const title = type === "po" ? "PO 执行单" : type === "estimate" ? "费用预估记录" : "合同履约/实际结算";
  return (
    <Section title={title}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="bg-slate-50 text-xs text-slate-600">
            <tr>
              <Th>单号</Th>
              <Th>合同编号</Th>
              <Th>金额</Th>
              <Th>日期</Th>
              <Th>说明</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {rows.map((row) => {
              const code = "poCode" in row ? row.poCode : "estimateCode" in row ? row.estimateCode : row.settlementCode;
              const amount = "orderAmount" in row ? row.orderAmount : row.amount;
              const date = "feeDate" in row ? row.feeDate : "estimateDate" in row ? row.estimateDate : row.settlementDate;
              const desc = "expenseMinor" in row ? `${row.budgetDepartment} / ${row.expenseMinor}` : "method" in row ? `${row.method} / ${row.sourceBill}` : row.status;
              return (
                <tr key={row.id}>
                  <Td>{code}</Td>
                  <Td>{row.contractCode}</Td>
                  <Td align="right">{formatMoney(amount)}</Td>
                  <Td>{date}</Td>
                  <Td>{desc}</Td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-400">暂无 mock 执行记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function ExecutionModal({ activity, onClose }: { activity: PlanActivity; onClose: () => void }) {
  const poRows = poExecutionMock.filter((row) => row.contractCode === activity.contractCode);
  const estimateRows = feeEstimateMock.filter((row) => row.contractCode === activity.contractCode);
  const settlementRows = fulfillmentMock.filter((row) => row.contractCode === activity.contractCode);
  return (
    <Modal title="关联合同 / PO / 费用预估 / 履约明细" onClose={onClose} size="lg">
      <Section title="当前活动">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnly label="活动场景" value={activity.scene} />
          <ReadOnly label="关联合同" value={`${activity.contractCode} / ${activity.contractName}`} />
          <ReadOnly label="供应商" value={activity.supplier} />
          <ReadOnly label="结算规则摘要" value={activity.settlementRule} />
          <ReadOnly label="PO 下单金额" value={formatMoney(activity.poAmount)} />
          <ReadOnly label="实际结算" value={formatMoney(activity.actualSettlement)} />
        </div>
      </Section>
      <ExecutionRecordTable rows={poRows} type="po" />
      <ExecutionRecordTable rows={estimateRows} type="estimate" />
      <ExecutionRecordTable rows={settlementRows} type="settlement" />
      <div className="mt-4 flex justify-end">
        <Button onClick={onClose}>确定</Button>
      </div>
    </Modal>
  );
}

function TerminateModal({ plan, reason, onChange, onClose, onSubmit }: { plan: MarketingPlan; reason: string; onChange: (value: string) => void; onClose: () => void; onSubmit: () => void }) {
  return (
    <Modal title="终止营销计划" onClose={onClose} size="md">
      <Alert tone="orange">终止后将模拟释放未使用预算占用 {formatMoney(planRemainingBudget(plan))}，并禁止新增活动或继续回写执行数据。</Alert>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ReadOnly label="计划编号" value={plan.code} />
        <ReadOnly label="计划名称" value={plan.name} />
        <ReadOnly label="当前状态" value={<StatusBadge status={plan.status} />} />
        <ReadOnly label="占用预算" value={formatMoney(planTotalBudget(plan))} />
      </div>
      <div className="mt-4">
        <Field label="终止原因" required>
          <Textarea value={reason} onChange={onChange} />
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>取消</Button>
        <Button onClick={onSubmit}>确认终止</Button>
      </div>
    </Modal>
  );
}

function EmptyState({ onCreate, onReset }: { onCreate: () => void; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">∅</div>
      <div className="mt-3 text-base font-medium">本月暂无营销计划，点击创建开始</div>
      <div className="mt-1 text-sm text-slate-500">也可以重置筛选查看全部 mock 计划。</div>
      <div className="mt-4 flex gap-2">
        <Button onClick={onCreate}>新建营销计划</Button>
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: ApprovalRecord[] }) {
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

function OperationList({ rows }: { rows: OperationRecord[] }) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={`${row.time}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <span className="font-medium">{row.action}</span>
            <span className="text-slate-500">{row.time}</span>
          </div>
          <div className="mt-1 text-slate-600">{row.operator}：{row.comment}</div>
        </div>
      ))}
    </div>
  );
}

function normalizeForm(current: PlanFormState, patch: Partial<PlanFormState>) {
  const next = { ...current, ...patch };
  if (patch.type === "单次执行" && next.activities.length > 1) {
    next.activities = next.activities.slice(0, 1);
  }
  return next;
}

function normalizeActivityPatch(activity: PlanActivity, patch: Partial<PlanActivity>) {
  const next = { ...activity, ...patch };
  if (patch.budgetSubject !== undefined) {
    const budget = budgetSubjectOptions.find((item) => item.subject === patch.budgetSubject);
    if (budget) {
      next.firstBudget = budget.firstBudget;
      next.budgetDepartment = budget.budgetDepartment;
      next.expenseMajor = budget.expenseMajor;
      next.expenseMinor = budget.expenseMinor;
    }
  }
  if (patch.contractId !== undefined) {
    const contract = contractOptions.find((item) => item.id === patch.contractId);
    if (contract) {
      next.contractCode = contract.code;
      next.contractName = contract.name;
      next.contractStatus = contract.status;
      next.supplier = contract.supplier;
      next.settlementRule = contract.settlementRule;
    }
  }
  return next;
}

function updateActivity(activities: PlanActivity[], id: string, patch: Partial<PlanActivity>) {
  return activities.map((activity) => (activity.id === id ? { ...activity, ...patch } : activity));
}

function copyActivity(activity: PlanActivity) {
  return {
    ...activity,
    id: `activity-copy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: "未开始" as ActivityStatus,
    poAmount: 0,
    poCodes: [],
    estimateAmount: 0,
    estimateCodes: [],
    actualSettlement: 0,
    settlementCodes: []
  };
}

function validatePlanForm(form: PlanFormState, strict: boolean) {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "请填写营销计划名称";
  if (!form.applicant.trim()) errors.applicant = "请填写申请人";
  if (!form.description.trim()) errors.description = "请填写计划说明";
  if (!form.startDate) errors.startDate = "请选择开始时间";
  if (!form.endDate) errors.endDate = "请选择结束时间";
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = "结束时间不能早于开始时间";
  if (!form.activities.length) errors.form = "至少需要一条营销活动明细";
  form.activities.forEach((activity) => {
    if (!activity.scene.trim()) errors[`activity-${activity.id}-scene`] = "请选择活动场景";
    if (strict && (!activity.startDate || !activity.endDate || activity.startDate < form.startDate || activity.endDate > form.endDate || activity.endDate < activity.startDate)) errors[`activity-${activity.id}-date`] = "活动期间需落在计划期间内";
    if (strict && !activity.budgetSubject) errors[`activity-${activity.id}-budget`] = "请选择预算科目";
    if (strict && !activity.contractId) errors[`activity-${activity.id}-contract`] = "请选择关联合同";
    if (!Number.isFinite(Number(activity.estimatedBudget)) || Number(activity.estimatedBudget) <= 0) errors[`activity-${activity.id}-amount`] = "预估预算必须大于 0";
    if (strict && Number(activity.estimatedBudget) > budgetAvailable(activity.budgetSubject, activity.budgetDepartment)) errors[`activity-${activity.id}-amount`] = "预估预算超过 mock 可用预算";
  });
  return errors;
}

function buildPlan(form: PlanFormState, status: PlanStatus): MarketingPlan {
  return {
    id: `plan-${Date.now()}`,
    code: `YXJH-2026-${Date.now().toString().slice(-3)}`,
    name: form.name,
    category: form.category,
    type: form.type,
    startDate: form.startDate,
    endDate: form.endDate,
    department: form.department,
    applicant: form.applicant,
    applicantDate: today,
    createdAt: today,
    status,
    store: form.store,
    channel: form.channel,
    brand: form.brand,
    businessUnit: form.businessUnit,
    source: form.source,
    description: form.description,
    syncStatus: status === "草稿" ? "未同步" : "同步中",
    sourceSystem: status === "草稿" ? "[业财中台] 本地草稿" : "[OA] 营销计划审批",
    lastSyncAt: status === "草稿" ? "-" : nowText,
    syncBatchNo: status === "草稿" ? "-" : `SYNC-PLAN-${Date.now().toString().slice(-8)}`,
    budgetLocked: false,
    activities: form.activities,
    approvals: [{ node: status === "草稿" ? "保存草稿" : "申请人提交", approver: form.applicant, date: today, comment: status === "草稿" ? "保存营销计划草稿" : "提交营销计划审批" }],
    operations: [{ time: nowText, operator: form.applicant, action: status === "草稿" ? "保存草稿" : "提交审批", comment: form.description }]
  };
}

function filterPlans(rows: MarketingPlan[], filters: PlanFilters) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((plan) => {
    const budgetDepartments = plan.activities.map((activity) => activity.budgetDepartment);
    const keywordHit = [plan.code, plan.name, plan.applicant, plan.description].join(" ").toLowerCase().includes(keyword);
    return (
      keywordHit &&
      matchFilter(plan.category, filters.category) &&
      matchFilter(plan.status, filters.status, plan.syncStatus) &&
      matchFilter(plan.department, filters.department) &&
      (filters.budgetDepartment === "全部" || budgetDepartments.includes(filters.budgetDepartment)) &&
      matchFilter(plan.channel, filters.channel) &&
      matchFilter(plan.brand, filters.brand) &&
      (!filters.startDate || plan.endDate >= filters.startDate) &&
      (!filters.endDate || plan.startDate <= filters.endDate)
    );
  });
}

function derivePlanStatus(activities: PlanActivity[], current: PlanStatus): PlanStatus {
  if (current === "已终止") return current;
  if (activities.every((activity) => activity.status === "已完成")) return "已完成";
  if (activities.some((activity) => activity.status === "进行中" || activity.status === "已完成")) return "进行中";
  return "未开始";
}

function budgetAvailable(subject: string, department: string) {
  return budgetSubjectOptions.find((item) => item.subject === subject && item.budgetDepartment === department)?.availableAmount ?? 0;
}

function planTotalBudget(plan: MarketingPlan) {
  return plan.activities.reduce((sum, activity) => sum + activity.estimatedBudget, 0);
}

function planActualBudget(plan: MarketingPlan) {
  return plan.activities.reduce((sum, activity) => sum + activity.actualSettlement, 0);
}

function planRemainingBudget(plan: MarketingPlan) {
  return Math.max(planTotalBudget(plan) - planActualBudget(plan), 0);
}

function sumBy<T>(rows: T[], key: keyof T) {
  return rows.reduce((sum, item) => sum + (typeof item[key] === "number" ? item[key] : 0), 0);
}

function matchFilter(value: string, filter: string, ...alternates: string[]) {
  return filter === "全部" || value === filter || alternates.includes(filter);
}

function formatMoney(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  return `CNY ${normalized.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-left">{children}</table></div>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 font-semibold">{children}</th>;
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return <td className={`max-w-64 truncate px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""}`} title={typeof children === "string" ? children : undefined}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 text-sm text-blue-600 [&_button:disabled]:text-slate-300 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    ["已完成", "已结案", "同步成功", "预算已预扣", "预算已锁定", "已结算", "审批通过", "已完结"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "进行中", "同步中", "履约中", "结算中"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["已驳回", "同步失败"].includes(status)
          ? "border-red-200 bg-red-50 text-red-600"
          : ["已终止", "已过期", "冻结", "已注销"].includes(status)
            ? "border-slate-200 bg-slate-200 text-slate-500"
            : ["预警", "待结算"].includes(status)
              ? "border-orange-200 bg-orange-50 text-orange-600"
              : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function ProgressBar({ value, total, wide = false }: { value: number; total: number; wide?: boolean }) {
  const ratio = total > 0 ? Math.min(value / total, 1) : 0;
  const widthClass = ratio >= 1 ? "w-full" : ratio >= 0.75 ? "w-3/4" : ratio >= 0.5 ? "w-1/2" : ratio >= 0.25 ? "w-1/4" : ratio > 0 ? "w-1/6" : "w-0";
  return (
    <div className={wide ? "w-full" : "w-32"}>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full bg-blue-600 ${widthClass}`} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{Math.round(ratio * 100)}%</div>
    </div>
  );
}

function Field({ label, children, required, error }: { label: string; children: ReactNode; required?: boolean; error?: string }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-slate-500">{required && <span className="text-red-500">*</span>} {label}</div>
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

function Input({ value, onChange, placeholder, disabled }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
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
  return <textarea className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)} />;
}

function Select({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  const normalized = options.includes(value) ? options : [value, ...options].filter(Boolean);
  return (
    <select className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500" value={value} onChange={(event) => onChange(event.target.value)}>
      {Array.from(new Set(normalized)).map((option) => (
        <option key={option} value={option}>{labels?.[option] ?? option}</option>
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
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Alert({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "orange" }) {
  const className = tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-orange-200 bg-orange-50 text-orange-700";
  return <div className={`mb-4 rounded-lg border p-3 text-sm ${className}`}>{children}</div>;
}

function Modal({ title, children, onClose, size = "md" }: { title: string; children: ReactNode; onClose: () => void; size?: "md" | "lg" | "xl" }) {
  const sizeClass = size === "xl" ? "max-w-7xl" : size === "lg" ? "max-w-5xl" : "max-w-2xl";
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

function LoadingMask({ text, full = false }: { text: string; full?: boolean }) {
  return (
    <div className={`${full ? "fixed inset-0 z-50" : "absolute inset-0 z-10"} flex items-center justify-center bg-white/70 backdrop-blur-sm`}>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent align-[-1px]" />
        {text}
      </div>
    </div>
  );
}
