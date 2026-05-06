"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type BudgetView =
  | "annual-apps"
  | "forecast-apps"
  | "adjustments"
  | "annual-ledger"
  | "summary-ledger"
  | "forecast-ledger"
  | "income-ledger"
  | "amortization"
  | "policies"
  | "mappings";
type BudgetType = "费用类" | "成本类" | "收入-渠道" | "收入-品类";
type ApprovalStatus = "草稿" | "审批中" | "业务已通过" | "已驳回" | "已生效";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";
type FormMode = "annual" | "forecast" | "adjustment";
type AdjustDirection = "调增" | "调减";

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface BudgetLine {
  id: string;
  firstSubject: string;
  secondSubject: string;
  subjectAttribute: string;
  businessUnit: string;
  department: string;
  channel: string;
  category: string;
  months: number[];
}

interface BudgetApplication {
  id: string;
  code: string;
  kind: "annual" | "forecast";
  title: string;
  year: string;
  month: string;
  applicant: string;
  company: string;
  department: string;
  businessUnit: string;
  budgetType: BudgetType;
  description: string;
  status: ApprovalStatus;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  specialApproval: boolean;
  lines: BudgetLine[];
  steps: ApprovalStep[];
}

interface BudgetChange {
  code: string;
  date: string;
  beforeAmount: number;
  changeAmount: number;
  afterAmount: number;
  comment: string;
}

interface BudgetLedger {
  id: string;
  sourceCode: string;
  year: string;
  budgetType: BudgetType;
  businessUnit: string;
  department: string;
  firstSubject: string;
  secondSubject: string;
  subjectAttribute: string;
  channel: string;
  category: string;
  originalAmount: number;
  adjustmentAmount: number;
  occupiedAmount: number;
  months: number[];
  status: "已生效" | "超额预警" | "已关闭";
  sourceSystem: string;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  changes: BudgetChange[];
}

interface ForecastLedger {
  id: string;
  sourceCode: string;
  year: string;
  month: string;
  budgetType: BudgetType;
  businessUnit: string;
  department: string;
  firstSubject: string;
  secondSubject: string;
  channel: string;
  category: string;
  annualBudgetAmount: number;
  forecastAmount: number;
  varianceAmount: number;
  warning: "预算充足" | "达到70%" | "超年度预算";
  syncStatus: SyncStatus;
  lastSyncAt: string;
}

interface AdjustmentLine {
  id: string;
  ledgerId: string;
  businessUnit: string;
  department: string;
  firstSubject: string;
  secondSubject: string;
  period: string;
  direction: AdjustDirection;
  amount: number;
  remark: string;
}

interface BudgetAdjustment {
  id: string;
  code: string;
  type: "部门内调整" | "部门间调整" | "事业部间调整";
  applicant: string;
  department: string;
  reason: string;
  status: ApprovalStatus;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  lines: AdjustmentLine[];
  steps: ApprovalStep[];
}

interface ControlPolicy {
  id: string;
  object: string;
  method: string;
  cycle: string;
  tipThreshold: number;
  forbidThreshold: number;
  enabled: boolean;
  effect: "提示" | "禁止" | "特殊审批";
  description: string;
}

interface ReportMapping {
  id: string;
  department: string;
  firstSubject: string;
  secondSubject: string;
  reportSubject1: string;
  reportSubject2: string;
  reportSubject3: string;
  source: string;
  caliber: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

interface FormState {
  mode: FormMode;
  editingId?: string;
  year: string;
  month: string;
  applicant: string;
  company: string;
  department: string;
  businessUnit: string;
  budgetType: BudgetType;
  description: string;
  adjustmentType: BudgetAdjustment["type"];
  reason: string;
  lines: BudgetLine[];
  adjustmentLines: AdjustmentLine[];
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";
const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

const annualTemplateLines: BudgetLine[] = [
  {
    id: "line-template-001",
    firstSubject: "渠道营销",
    secondSubject: "信息流投放",
    subjectAttribute: "费用",
    businessUnit: "电商事业部",
    department: "电商运营部",
    channel: "抖音",
    category: "-",
    months: [280000, 260000, 310000, 360000, 420000, 680000, 300000, 320000, 380000, 410000, 520000, 640000]
  },
  {
    id: "line-template-002",
    firstSubject: "销售收入",
    secondSubject: "渠道收入",
    subjectAttribute: "收入",
    businessUnit: "电商事业部",
    department: "电商运营部",
    channel: "天猫",
    category: "-",
    months: [1550000, 1480000, 1620000, 1710000, 1880000, 2600000, 1760000, 1820000, 1900000, 2080000, 2580000, 3100000]
  }
];

const initialAnnualLedgers: BudgetLedger[] = [
  {
    id: "ledger-001",
    sourceCode: "YSND-2026-001",
    year: "2026",
    budgetType: "费用类",
    businessUnit: "电商事业部",
    department: "电商运营部",
    firstSubject: "渠道营销",
    secondSubject: "信息流投放",
    subjectAttribute: "费用",
    channel: "-",
    category: "-",
    originalAmount: 4880000,
    adjustmentAmount: 120000,
    occupiedAmount: 2120000,
    months: [280000, 260000, 310000, 360000, 420000, 680000, 300000, 320000, 380000, 410000, 520000, 640000],
    status: "已生效",
    sourceSystem: "[OA] 预算审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-06 09:20:00",
    syncBatchNo: "SYNC-BUDGET-2026050601",
    changes: [
      {
        code: "YSTZ-2026-001",
        date: "2026-04-18",
        beforeAmount: 4880000,
        changeAmount: 120000,
        afterAmount: 5000000,
        comment: "618 大促信息流投放预算调增"
      }
    ]
  },
  {
    id: "ledger-002",
    sourceCode: "YSND-2026-002",
    year: "2026",
    budgetType: "费用类",
    businessUnit: "品牌事业部",
    department: "内容营销部",
    firstSubject: "达人合作",
    secondSubject: "达人投放",
    subjectAttribute: "费用",
    channel: "-",
    category: "-",
    originalAmount: 3260000,
    adjustmentAmount: -180000,
    occupiedAmount: 2190000,
    months: [180000, 210000, 240000, 260000, 330000, 360000, 280000, 270000, 260000, 260000, 300000, 310000],
    status: "超额预警",
    sourceSystem: "[OA] 预算审批",
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 18:10:00",
    syncBatchNo: "SYNC-BUDGET-2026050505",
    failureReason: "经营分析系统科目映射缺失 [MAPPING-404]",
    changes: [
      {
        code: "YSTZ-2026-002",
        date: "2026-04-28",
        beforeAmount: 3260000,
        changeAmount: -180000,
        afterAmount: 3080000,
        comment: "达人坑位费转入品牌广告预算"
      }
    ]
  },
  {
    id: "ledger-003",
    sourceCode: "YSND-2026-003",
    year: "2026",
    budgetType: "成本类",
    businessUnit: "直播事业部",
    department: "直播运营部",
    firstSubject: "直播运营",
    secondSubject: "直播间建设",
    subjectAttribute: "成本",
    channel: "-",
    category: "-",
    originalAmount: 1640000,
    adjustmentAmount: 0,
    occupiedAmount: 620000,
    months: [90000, 100000, 120000, 130000, 150000, 180000, 140000, 140000, 150000, 150000, 160000, 170000],
    status: "已生效",
    sourceSystem: "[OA] 预算审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-03 15:00:00",
    syncBatchNo: "SYNC-BUDGET-2026050302",
    changes: []
  },
  {
    id: "ledger-004",
    sourceCode: "YSND-2026-004",
    year: "2026",
    budgetType: "费用类",
    businessUnit: "电商事业部",
    department: "平台运营组",
    firstSubject: "平台费用",
    secondSubject: "平台服务费",
    subjectAttribute: "费用",
    channel: "-",
    category: "-",
    originalAmount: 2360000,
    adjustmentAmount: 50000,
    occupiedAmount: 880000,
    months: [160000, 150000, 170000, 180000, 190000, 240000, 180000, 180000, 200000, 210000, 260000, 330000],
    status: "已生效",
    sourceSystem: "[OA] 预算审批",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-02 11:20:00",
    syncBatchNo: "SYNC-BUDGET-2026050203",
    changes: []
  }
];

const initialIncomeLedgers: BudgetLedger[] = [
  {
    id: "income-001",
    sourceCode: "YSND-2026-011",
    year: "2026",
    budgetType: "收入-渠道",
    businessUnit: "电商事业部",
    department: "电商运营部",
    firstSubject: "销售收入",
    secondSubject: "渠道收入",
    subjectAttribute: "收入",
    channel: "天猫",
    category: "-",
    originalAmount: 23370000,
    adjustmentAmount: 0,
    occupiedAmount: 0,
    months: [1550000, 1480000, 1620000, 1710000, 1880000, 2600000, 1760000, 1820000, 1900000, 2080000, 2580000, 3100000],
    status: "已生效",
    sourceSystem: "[经营分析] 收入预算",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-06 08:45:00",
    syncBatchNo: "SYNC-INCOME-2026050601",
    changes: []
  },
  {
    id: "income-002",
    sourceCode: "YSND-2026-012",
    year: "2026",
    budgetType: "收入-品类",
    businessUnit: "品牌事业部",
    department: "品牌营销部",
    firstSubject: "销售收入",
    secondSubject: "品类收入",
    subjectAttribute: "收入",
    channel: "-",
    category: "护肤套装",
    originalAmount: 16820000,
    adjustmentAmount: 260000,
    occupiedAmount: 0,
    months: [1080000, 1120000, 1260000, 1320000, 1450000, 2100000, 1320000, 1380000, 1450000, 1560000, 1880000, 2530000],
    status: "已生效",
    sourceSystem: "[经营分析] 收入预算",
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-04 17:00:00",
    syncBatchNo: "SYNC-INCOME-2026050403",
    changes: [
      {
        code: "YSTZ-2026-003",
        date: "2026-05-02",
        beforeAmount: 16820000,
        changeAmount: 260000,
        afterAmount: 17080000,
        comment: "新品套装目标调增"
      }
    ]
  }
];

const initialAnnualApps: BudgetApplication[] = [
  {
    id: "annual-app-001",
    code: "YSND-2026-101",
    kind: "annual",
    title: "2026 年品牌广告年度预算编制",
    year: "2026",
    month: "-",
    applicant: "陈澄",
    company: "上海示例品牌管理有限公司",
    department: "品牌营销部",
    businessUnit: "品牌事业部",
    budgetType: "费用类",
    description: "品牌广告与内容种草年度预算编制。",
    status: "审批中",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    specialApproval: false,
    lines: [
      {
        id: "annual-line-101",
        firstSubject: "品牌推广",
        secondSubject: "品牌广告",
        subjectAttribute: "费用",
        businessUnit: "品牌事业部",
        department: "品牌营销部",
        channel: "-",
        category: "-",
        months: [220000, 240000, 260000, 280000, 330000, 420000, 260000, 270000, 290000, 310000, 360000, 430000]
      }
    ],
    steps: [{ node: "申请", approver: "陈澄", date: "2026-05-05", comment: "提交年度预算编制单" }]
  },
  {
    id: "annual-app-002",
    code: "YSND-2026-102",
    kind: "annual",
    title: "2026 年京东搜索推广年度预算编制",
    year: "2026",
    month: "-",
    applicant: "周宁",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    businessUnit: "电商事业部",
    budgetType: "费用类",
    description: "京准通快车预算补充编制。",
    status: "已驳回",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    specialApproval: false,
    lines: [
      {
        id: "annual-line-102",
        firstSubject: "渠道营销",
        secondSubject: "搜索推广",
        subjectAttribute: "费用",
        businessUnit: "电商事业部",
        department: "电商运营部",
        channel: "-",
        category: "-",
        months: [90000, 100000, 130000, 140000, 150000, 220000, 160000, 170000, 180000, 190000, 260000, 300000]
      }
    ],
    steps: [
      { node: "申请", approver: "周宁", date: "2026-05-03", comment: "提交年度预算编制单" },
      { node: "财务 BP", approver: "林一", date: "2026-05-04", comment: "科目归属需调整至搜索推广二级科目" }
    ]
  },
  {
    id: "annual-app-003",
    code: "YSND-2026-103",
    kind: "annual",
    title: "2026 年收入预算-渠道编制",
    year: "2026",
    month: "-",
    applicant: "王婧",
    company: "杭州示例电子商务有限公司",
    department: "电商运营部",
    businessUnit: "电商事业部",
    budgetType: "收入-渠道",
    description: "抖音渠道收入预算编制。",
    status: "业务已通过",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    specialApproval: false,
    lines: [
      {
        id: "annual-line-103",
        firstSubject: "销售收入",
        secondSubject: "渠道收入",
        subjectAttribute: "收入",
        businessUnit: "电商事业部",
        department: "电商运营部",
        channel: "抖音",
        category: "-",
        months: [1120000, 1180000, 1260000, 1360000, 1460000, 2050000, 1400000, 1450000, 1500000, 1620000, 1880000, 2410000]
      }
    ],
    steps: [
      { node: "申请", approver: "王婧", date: "2026-05-02", comment: "提交收入预算编制" },
      { node: "部门负责人", approver: "赵敏", date: "2026-05-03", comment: "业务口径已确认" }
    ]
  }
];

const initialForecastApps: BudgetApplication[] = [
  {
    id: "forecast-app-001",
    code: "YSYC-2026-051",
    kind: "forecast",
    title: "2026 年 5 月信息流投放滚动预测",
    year: "2026",
    month: "2026-05",
    applicant: "周宁",
    company: "上海示例贸易有限公司",
    department: "电商运营部",
    businessUnit: "电商事业部",
    budgetType: "费用类",
    description: "结合 618 预热投放节奏更新 5-6 月预测。",
    status: "草稿",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    specialApproval: true,
    lines: [
      {
        id: "forecast-line-001",
        firstSubject: "渠道营销",
        secondSubject: "信息流投放",
        subjectAttribute: "费用",
        businessUnit: "电商事业部",
        department: "电商运营部",
        channel: "-",
        category: "-",
        months: [0, 0, 0, 0, 520000, 760000, 320000, 330000, 390000, 430000, 540000, 660000]
      }
    ],
    steps: []
  },
  {
    id: "forecast-app-002",
    code: "YSYC-2026-052",
    kind: "forecast",
    title: "2026 年 5 月收入预测-品类",
    year: "2026",
    month: "2026-05",
    applicant: "陈澄",
    company: "上海示例品牌管理有限公司",
    department: "品牌营销部",
    businessUnit: "品牌事业部",
    budgetType: "收入-品类",
    description: "护肤套装新品上市后收入滚动预测。",
    status: "审批中",
    syncStatus: "未同步",
    lastSyncAt: "-",
    syncBatchNo: "-",
    specialApproval: false,
    lines: [
      {
        id: "forecast-line-002",
        firstSubject: "销售收入",
        secondSubject: "品类收入",
        subjectAttribute: "收入",
        businessUnit: "品牌事业部",
        department: "品牌营销部",
        channel: "-",
        category: "护肤套装",
        months: [0, 0, 0, 0, 1520000, 2180000, 1360000, 1420000, 1510000, 1600000, 1960000, 2660000]
      }
    ],
    steps: [{ node: "申请", approver: "陈澄", date: "2026-05-05", comment: "提交月度预测" }]
  }
];

const initialAdjustments: BudgetAdjustment[] = [
  {
    id: "adjust-001",
    code: "YSTZ-2026-101",
    type: "部门内调整",
    applicant: "周宁",
    department: "电商运营部",
    reason: "618 活动投放从平台费用转至信息流投放。",
    status: "审批中",
    syncStatus: "未同步",
    lastSyncAt: "-",
    lines: [
      {
        id: "adjust-line-001",
        ledgerId: "ledger-001",
        businessUnit: "电商事业部",
        department: "电商运营部",
        firstSubject: "渠道营销",
        secondSubject: "信息流投放",
        period: "2026-06",
        direction: "调增",
        amount: 180000,
        remark: "618 预热新增投放"
      }
    ],
    steps: [{ node: "申请", approver: "周宁", date: "2026-05-05", comment: "提交调整单" }]
  },
  {
    id: "adjust-002",
    code: "YSTZ-2026-102",
    type: "部门间调整",
    applicant: "陈澄",
    department: "品牌营销部",
    reason: "达人预算调减，转入品牌广告。",
    status: "已驳回",
    syncStatus: "未同步",
    lastSyncAt: "-",
    lines: [
      {
        id: "adjust-line-002",
        ledgerId: "ledger-002",
        businessUnit: "品牌事业部",
        department: "内容营销部",
        firstSubject: "达人合作",
        secondSubject: "达人投放",
        period: "2026-05",
        direction: "调减",
        amount: 240000,
        remark: "调减后可用余额不足，需拆分调整"
      }
    ],
    steps: [
      { node: "申请", approver: "陈澄", date: "2026-05-01", comment: "提交调整单" },
      { node: "财务 BP", approver: "顾可", date: "2026-05-02", comment: "调减金额超过可用余额" }
    ]
  }
];

const initialForecastLedgers: ForecastLedger[] = [
  {
    id: "forecast-ledger-001",
    sourceCode: "YSYC-2026-041",
    year: "2026",
    month: "2026-04",
    budgetType: "费用类",
    businessUnit: "电商事业部",
    department: "电商运营部",
    firstSubject: "渠道营销",
    secondSubject: "信息流投放",
    channel: "-",
    category: "-",
    annualBudgetAmount: 5000000,
    forecastAmount: 4880000,
    varianceAmount: -120000,
    warning: "预算充足",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-30 17:40:00"
  },
  {
    id: "forecast-ledger-002",
    sourceCode: "YSYC-2026-042",
    year: "2026",
    month: "2026-04",
    budgetType: "费用类",
    businessUnit: "品牌事业部",
    department: "内容营销部",
    firstSubject: "达人合作",
    secondSubject: "达人投放",
    channel: "-",
    category: "-",
    annualBudgetAmount: 3080000,
    forecastAmount: 2860000,
    varianceAmount: -220000,
    warning: "达到70%",
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-30 18:10:00"
  }
];

const initialPolicies: ControlPolicy[] = [
  {
    id: "policy-001",
    object: "预算部门 + 预算科目",
    method: "末级独立",
    cycle: "月度",
    tipThreshold: 70,
    forbidThreshold: 100,
    enabled: true,
    effect: "禁止",
    description: "年度预算超额不允许提单，月度达到 70% 弹窗提示。"
  },
  {
    id: "policy-002",
    object: "事业部 + 一级科目",
    method: "合并总额",
    cycle: "月度累计",
    tipThreshold: 85,
    forbidThreshold: 110,
    enabled: true,
    effect: "特殊审批",
    description: "月度累计超额时增加财务总监审批节点。"
  },
  {
    id: "policy-003",
    object: "收入预算-渠道",
    method: "分别总额",
    cycle: "年度",
    tipThreshold: 90,
    forbidThreshold: 120,
    enabled: false,
    effect: "提示",
    description: "收入挑战目标低于预算时提示业务复核。"
  }
];

const initialMappings: ReportMapping[] = [
  {
    id: "mapping-001",
    department: "电商运营部",
    firstSubject: "渠道营销",
    secondSubject: "信息流投放",
    reportSubject1: "销售费用",
    reportSubject2: "广告宣传费",
    reportSubject3: "信息流投放",
    source: "年度预算台账",
    caliber: "按末级部门 + 二级预算科目汇总",
    updatedAt: "2026-05-06",
    syncStatus: "同步成功"
  },
  {
    id: "mapping-002",
    department: "内容营销部",
    firstSubject: "达人合作",
    secondSubject: "达人投放",
    reportSubject1: "销售费用",
    reportSubject2: "业务宣传费",
    reportSubject3: "达人合作",
    source: "年度预算台账",
    caliber: "按费用归属部门汇总",
    updatedAt: "2026-05-05",
    syncStatus: "同步失败"
  },
  {
    id: "mapping-003",
    department: "电商运营部",
    firstSubject: "销售收入",
    secondSubject: "渠道收入",
    reportSubject1: "主营业务收入",
    reportSubject2: "线上渠道",
    reportSubject3: "天猫",
    source: "收入预算台账-渠道",
    caliber: "按渠道口径取全年合计",
    updatedAt: "2026-05-06",
    syncStatus: "同步成功"
  }
];

const initialForm: FormState = {
  mode: "annual",
  year: "2026",
  month: "2026-05",
  applicant: "周宁",
  company: "上海示例贸易有限公司",
  department: "电商运营部",
  businessUnit: "电商事业部",
  budgetType: "费用类",
  description: "",
  adjustmentType: "部门内调整",
  reason: "",
  lines: [cloneLine(annualTemplateLines[0])],
  adjustmentLines: []
};

export default function BudgetPage() {
  const [view, setView] = useState<BudgetView>("annual-apps");
  const [annualApps, setAnnualApps] = useState(initialAnnualApps);
  const [forecastApps, setForecastApps] = useState(initialForecastApps);
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [annualLedgers, setAnnualLedgers] = useState(initialAnnualLedgers);
  const [incomeLedgers, setIncomeLedgers] = useState(initialIncomeLedgers);
  const [forecastLedgers, setForecastLedgers] = useState(initialForecastLedgers);
  const [policies, setPolicies] = useState(initialPolicies);
  const [mappings, setMappings] = useState(initialMappings);
  const [summarySyncedAt, setSummarySyncedAt] = useState("2026-05-06 09:30:00");
  const [filters, setFilters] = useState({
    keyword: "",
    status: "全部",
    budgetType: "全部",
    department: "全部"
  });
  const [loading, setLoading] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<{ title: string; children: ReactNode } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allLedgers = useMemo(() => [...annualLedgers, ...incomeLedgers], [annualLedgers, incomeLedgers]);
  const summaryLedgers = useMemo(() => buildSummaryLedgers(allLedgers), [allLedgers]);
  const amortizationRows = useMemo(() => buildAmortizationRows(allLedgers), [allLedgers]);
  const challengeRows = useMemo(() => buildChallengeRows(incomeLedgers), [incomeLedgers]);

  const currentCount = useMemo(() => {
    if (view === "annual-apps") return filterApplications(annualApps, filters).length;
    if (view === "forecast-apps") return filterApplications(forecastApps, filters).length;
    if (view === "adjustments") return filterAdjustments(adjustments, filters).length;
    if (view === "annual-ledger") return filterLedgers(annualLedgers, filters).length;
    if (view === "summary-ledger") return filterSummary(summaryLedgers, filters).length;
    if (view === "forecast-ledger") return filterForecasts(forecastLedgers, filters).length;
    if (view === "income-ledger") return filterLedgers(incomeLedgers, filters).length;
    if (view === "amortization") return filterSimpleRows([...amortizationRows, ...challengeRows], filters).length;
    if (view === "policies") return filterPolicies(policies, filters).length;
    return filterMappings(mappings, filters).length;
  }, [adjustments, annualApps, annualLedgers, amortizationRows, challengeRows, filters, forecastApps, forecastLedgers, incomeLedgers, mappings, policies, summaryLedgers, view]);

  const stats = [
    { label: "年度预算总额", value: formatMoney(sumLedgers(allLedgers, "adjusted")), sub: "含费用/成本/收入" },
    { label: "已占用金额", value: formatMoney(sumLedgers(annualLedgers, "occupied")), sub: "费用/成本预算" },
    { label: "可用余额", value: formatMoney(sumLedgers(annualLedgers, "available")), sub: "审批通过后实时更新" },
    { label: "预测差异", value: formatMoney(forecastLedgers.reduce((total, item) => total + item.varianceAmount, 0)), sub: "月度滚动预测" }
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
    setFilters({ keyword: "", status: "全部", budgetType: "全部", department: "全部" });
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
  }

  function openForm(mode: FormMode, editingId?: string) {
    if (mode === "annual" && editingId) {
      const target = annualApps.find((item) => item.id === editingId);
      if (target) {
        setForm({
          ...initialForm,
          mode,
          editingId,
          year: target.year,
          month: target.month,
          applicant: target.applicant,
          company: target.company,
          department: target.department,
          businessUnit: target.businessUnit,
          budgetType: target.budgetType,
          description: target.description,
          lines: target.lines.map(cloneLine)
        });
      }
    } else if (mode === "forecast" && editingId) {
      const target = forecastApps.find((item) => item.id === editingId);
      if (target) {
        setForm({
          ...initialForm,
          mode,
          editingId,
          year: target.year,
          month: target.month,
          applicant: target.applicant,
          company: target.company,
          department: target.department,
          businessUnit: target.businessUnit,
          budgetType: target.budgetType,
          description: target.description,
          lines: target.lines.map(cloneLine)
        });
      }
    } else if (mode === "adjustment" && editingId) {
      const target = adjustments.find((item) => item.id === editingId);
      if (target) {
        setForm({
          ...initialForm,
          mode,
          editingId,
          department: target.department,
          adjustmentType: target.type,
          reason: target.reason,
          adjustmentLines: target.lines.map((line) => ({ ...line }))
        });
      }
    } else {
      const defaultLine = mode === "annual" ? cloneLine(annualTemplateLines[0]) : cloneLine({ ...annualTemplateLines[0], months: [0, 0, 0, 0, 520000, 760000, 320000, 330000, 390000, 430000, 540000, 660000] });
      setForm({
        ...initialForm,
        mode,
        lines: mode === "adjustment" ? [] : [defaultLine],
        adjustmentLines:
          mode === "adjustment"
            ? [
                {
                  id: `adjust-line-${Date.now()}`,
                  ledgerId: annualLedgers[0]?.id ?? "",
                  businessUnit: annualLedgers[0]?.businessUnit ?? "电商事业部",
                  department: annualLedgers[0]?.department ?? "电商运营部",
                  firstSubject: annualLedgers[0]?.firstSubject ?? "渠道营销",
                  secondSubject: annualLedgers[0]?.secondSubject ?? "信息流投放",
                  period: "2026-06",
                  direction: "调增",
                  amount: 100000,
                  remark: "演示调整明细"
                }
              ]
            : []
      });
    }
    setFormErrors({});
  }

  function saveDraft() {
    if (!form || !validateForm(form, false)) return;
    if (form.mode === "adjustment") {
      upsertAdjustment(form, "草稿");
      setView("adjustments");
    } else {
      upsertApplication(form, "草稿");
      setView(form.mode === "annual" ? "annual-apps" : "forecast-apps");
    }
    setForm(null);
    showToast("已保存草稿，审批流保持可演示状态。");
  }

  function submitApproval(event: FormEvent) {
    event.preventDefault();
    if (!form || !validateForm(form, true)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      if (form.mode === "adjustment") {
        upsertAdjustment(form, "审批中");
        setView("adjustments");
      } else {
        upsertApplication(form, "审批中");
        setView(form.mode === "annual" ? "annual-apps" : "forecast-apps");
      }
      setForm(null);
      setSubmitting(false);
      showToast("已模拟提交 OA 审批，生成审批节点。");
    }, 650);
  }

  function upsertApplication(next: FormState, status: ApprovalStatus) {
    const kind = next.mode === "annual" ? "annual" : "forecast";
    const existing = kind === "annual" ? annualApps.find((item) => item.id === next.editingId) : forecastApps.find((item) => item.id === next.editingId);
    const codePrefix = kind === "annual" ? "YSND" : "YSYC";
    const item: BudgetApplication = {
      id: existing?.id ?? `${kind}-app-${Date.now()}`,
      code: existing?.code ?? `${codePrefix}-2026-${String(Date.now()).slice(-3)}`,
      kind,
      title: `${next.year} ${kind === "annual" ? "年度预算编制" : `${next.month} 月度滚动预测`} - ${next.department}`,
      year: next.year,
      month: kind === "annual" ? "-" : next.month,
      applicant: next.applicant,
      company: next.company,
      department: next.department,
      businessUnit: next.businessUnit,
      budgetType: next.budgetType,
      description: next.description || "由前端 mock 表单生成。",
      status,
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      syncBatchNo: existing?.syncBatchNo ?? "-",
      failureReason: existing?.failureReason,
      specialApproval: next.mode === "forecast" ? hasForecastWarning(next, allLedgers) : false,
      lines: next.lines.map(cloneLine),
      steps: buildNextSteps(existing?.steps ?? [], status, next.applicant)
    };
    if (kind === "annual") {
      setAnnualApps((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
    } else {
      setForecastApps((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
    }
  }

  function upsertAdjustment(next: FormState, status: ApprovalStatus) {
    const existing = adjustments.find((item) => item.id === next.editingId);
    const item: BudgetAdjustment = {
      id: existing?.id ?? `adjust-${Date.now()}`,
      code: existing?.code ?? `YSTZ-2026-${String(Date.now()).slice(-3)}`,
      type: next.adjustmentType,
      applicant: next.applicant,
      department: next.department,
      reason: next.reason || "由前端 mock 表单生成。",
      status,
      syncStatus: existing?.syncStatus ?? "未同步",
      lastSyncAt: existing?.lastSyncAt ?? "-",
      lines: next.adjustmentLines.map((line) => ({ ...line })),
      steps: buildNextSteps(existing?.steps ?? [], status, next.applicant)
    };
    setAdjustments((items) => (existing ? items.map((row) => (row.id === item.id ? item : row)) : [item, ...items]));
  }

  function validateForm(next: FormState, strict: boolean) {
    const errors: Record<string, string> = {};
    if (!next.applicant.trim()) errors.applicant = "请填写申请人";
    if (!next.department.trim()) errors.department = "请选择申请部门";
    if (next.mode !== "adjustment") {
      if (!next.year.trim()) errors.year = "请选择编制年度";
      if (next.mode === "forecast" && !next.month.trim()) errors.month = "请选择申请月份";
      if (next.lines.length === 0) errors.lines = "至少需要一条编制明细";
      next.lines.forEach((line, index) => {
        if (!line.firstSubject.trim() || !line.secondSubject.trim()) errors[`line-${index}`] = "预算科目必填";
        if (next.budgetType === "收入-渠道" && !line.channel.trim()) errors[`line-channel-${index}`] = "收入-渠道需填写渠道";
        if (next.budgetType === "收入-品类" && !line.category.trim()) errors[`line-category-${index}`] = "收入-品类需填写品类";
        if (strict && sum(line.months) <= 0) errors[`line-amount-${index}`] = "全年合计必须大于 0";
      });
    } else {
      if (!next.reason.trim()) errors.reason = "请填写调整事由";
      if (next.adjustmentLines.length === 0) errors.lines = "至少需要一条调整明细";
      next.adjustmentLines.forEach((line, index) => {
        const ledger = annualLedgers.find((item) => item.id === line.ledgerId);
        if (!ledger) errors[`adjust-ledger-${index}`] = "请选择有效预算台账";
        if (line.amount <= 0) errors[`adjust-amount-${index}`] = "调整金额必须大于 0";
        if (ledger && line.direction === "调减" && line.amount > availableAmount(ledger)) {
          errors[`adjust-amount-${index}`] = "调减金额超过可用余额，预算管控策略禁止提交";
        }
      });
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function updateDocStatus(kind: "annual" | "forecast", id: string, status: ApprovalStatus) {
    const setter = kind === "annual" ? setAnnualApps : setForecastApps;
    setter((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, status, steps: buildNextSteps(item.steps, status, item.applicant) };
        if (status === "已生效") {
          updated.syncStatus = "同步成功";
          updated.lastSyncAt = nowText;
          updated.syncBatchNo = `SYNC-OA-${Date.now()}`;
        }
        return updated;
      })
    );
    if (status === "已生效") {
      const item = (kind === "annual" ? annualApps : forecastApps).find((row) => row.id === id);
      if (item && kind === "annual") applyAnnualToLedger(item);
      if (item && kind === "forecast") applyForecastToLedger(item);
      showToast(kind === "annual" ? "财务审批通过，年度预算台账已更新。" : "审批通过，月度滚动预测台账已更新。");
    } else if (status === "业务已通过") {
      showToast("业务审批通过，等待财务复核。");
    } else if (status === "已驳回") {
      showToast("已模拟驳回，单据可编辑后重新提交。");
    } else {
      showToast("单据状态已更新。");
    }
  }

  function updateAdjustmentStatus(id: string, status: ApprovalStatus) {
    setAdjustments((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, status, steps: buildNextSteps(item.steps, status, item.applicant) };
        if (status === "已生效") {
          updated.syncStatus = "同步成功";
          updated.lastSyncAt = nowText;
        }
        return updated;
      })
    );
    if (status === "已生效") {
      const adjustment = adjustments.find((item) => item.id === id);
      if (adjustment) applyAdjustmentToLedger(adjustment);
      showToast("调整单审批通过，预算调整数、调整后预算和可用余额已更新。");
    } else if (status === "已驳回") {
      showToast("已模拟驳回，调整单保留为可编辑状态。");
    } else {
      showToast("调整单状态已更新。");
    }
  }

  function applyAnnualToLedger(application: BudgetApplication) {
    const nextLedgers = application.lines.map((line) => lineToLedger(application, line));
    if (application.budgetType === "收入-渠道" || application.budgetType === "收入-品类") {
      setIncomeLedgers((items) => [...nextLedgers, ...items]);
      setView("income-ledger");
    } else {
      setAnnualLedgers((items) => [...nextLedgers, ...items]);
      setView("annual-ledger");
    }
  }

  function applyForecastToLedger(application: BudgetApplication) {
    const nextRows: ForecastLedger[] = application.lines.map((line) => {
      const match = findMatchingLedger(line, application.budgetType, allLedgers);
      const annualBudgetAmount = match ? adjustedAmount(match) : 0;
      const forecastAmount = sum(line.months);
      const warning: ForecastLedger["warning"] =
        forecastAmount > annualBudgetAmount ? "超年度预算" : forecastAmount > annualBudgetAmount * 0.7 ? "达到70%" : "预算充足";
      return {
        id: `forecast-ledger-${Date.now()}-${line.id}`,
        sourceCode: application.code,
        year: application.year,
        month: application.month,
        budgetType: application.budgetType,
        businessUnit: line.businessUnit,
        department: line.department,
        firstSubject: line.firstSubject,
        secondSubject: line.secondSubject,
        channel: application.budgetType === "收入-渠道" ? line.channel : "-",
        category: application.budgetType === "收入-品类" ? line.category : "-",
        annualBudgetAmount,
        forecastAmount,
        varianceAmount: forecastAmount - annualBudgetAmount,
        warning,
        syncStatus: "同步成功" as SyncStatus,
        lastSyncAt: nowText
      };
    });
    setForecastLedgers((items) => [...nextRows, ...items]);
    setView("forecast-ledger");
  }

  function applyAdjustmentToLedger(adjustment: BudgetAdjustment) {
    setAnnualLedgers((items) =>
      items.map((ledger) => {
        const lines = adjustment.lines.filter((line) => line.ledgerId === ledger.id);
        if (lines.length === 0) return ledger;
        const changeAmount = lines.reduce((total, line) => total + (line.direction === "调增" ? line.amount : -line.amount), 0);
        const before = adjustedAmount(ledger);
        return {
          ...ledger,
          adjustmentAmount: ledger.adjustmentAmount + changeAmount,
          status: availableAmount({ ...ledger, adjustmentAmount: ledger.adjustmentAmount + changeAmount }) < adjustedAmount(ledger) * 0.2 ? "超额预警" : ledger.status,
          changes: [
            {
              code: adjustment.code,
              date: today,
              beforeAmount: before,
              changeAmount,
              afterAmount: before + changeAmount,
              comment: adjustment.reason
            },
            ...ledger.changes
          ]
        };
      })
    );
    setView("annual-ledger");
  }

  function retryLedgerSync(id: string) {
    setAnnualLedgers((items) => items.map((item) => (item.id === id ? { ...item, syncStatus: "同步中", failureReason: undefined } : item)));
    window.setTimeout(() => {
      setAnnualLedgers((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, syncStatus: "同步成功", lastSyncAt: nowText, syncBatchNo: `SYNC-BUDGET-${Date.now()}` }
            : item
        )
      );
      showToast("已模拟重新同步经营分析系统，状态更新为同步成功。");
    }, 800);
  }

  function summarizeBudget() {
    setOverlayLoading("正在汇总年度预算");
    window.setTimeout(() => {
      setSummarySyncedAt(nowText);
      setOverlayLoading("");
      setView("summary-ledger");
      showToast("已完成 152 个部门的预算汇总，汇总台账已刷新。");
    }, 1000);
  }

  function refreshMappings() {
    setOverlayLoading("正在同步经分报表");
    window.setTimeout(() => {
      setMappings((items) => items.map((item) => ({ ...item, syncStatus: "同步成功", updatedAt: today })));
      setOverlayLoading("");
      showToast("数据已模拟推送至经营分析系统。");
    }, 850);
  }

  function refreshAmortization() {
    setOverlayLoading("正在刷新财务摊销结果");
    window.setTimeout(() => {
      setOverlayLoading("");
      showToast("已使用 mock 数据刷新年度预算财务摊销结果。");
    }, 850);
  }

  function togglePolicy(id: string) {
    setPolicies((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
    showToast("预算管控策略启停状态已前端模拟更新。");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="budget" title="预算管理" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">预算管理 / 年度编制与滚动预测</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">预算管理模块</h1>
              <p className="mt-1 text-sm text-slate-500">年度预算、月度预测、预算调整、台账查询与管控策略的 mock 演示闭环。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openForm(primaryFormMode(view))}>{primaryActionLabel(view)}</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选结果，不生成真实文件。")}>
                导出模拟
              </Button>
              <Button variant="secondary" onClick={view === "mappings" ? refreshMappings : view === "amortization" ? refreshAmortization : summarizeBudget}>
                {view === "mappings" ? "同步经分" : view === "amortization" ? "刷新摊销" : "汇总预算"}
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
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    view === tab.key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
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
            <FilterBar filters={filters} setFilters={setFilters} onQuery={simulateQuery} onReset={resetFilters} onError={() => setPageError("模拟接口失败：预算服务响应超时，请点击重试。")} />

            {pageError && (
              <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="text-left font-medium text-red-700 underline" onClick={simulateQuery}>
                  重试加载
                </button>
              </div>
            )}

            {view === "summary-ledger" && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                汇总年度预算台账最近刷新：{summarySyncedAt}。汇总口径按事业部、部门、一级预算科目与二级预算科目聚合。
              </div>
            )}

            {view === "policies" && (
              <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                当前策略会影响表单校验：月度达到 70% 显示提示，调减超过可用余额禁止提交，超年度预算标记特殊审批。
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : currentCount === 0 ? (
                <EmptyState onReset={resetFilters} onCreate={() => openForm(primaryFormMode(view))} />
              ) : (
                <BudgetContent
                  view={view}
                  annualApps={filterApplications(annualApps, filters)}
                  forecastApps={filterApplications(forecastApps, filters)}
                  adjustments={filterAdjustments(adjustments, filters)}
                  annualLedgers={filterLedgers(annualLedgers, filters)}
                  incomeLedgers={filterLedgers(incomeLedgers, filters)}
                  summaryLedgers={filterSummary(summaryLedgers, filters)}
                  forecastLedgers={filterForecasts(forecastLedgers, filters)}
                  amortizationRows={filterSimpleRows([...amortizationRows, ...challengeRows], filters)}
                  policies={filterPolicies(policies, filters)}
                  mappings={filterMappings(mappings, filters)}
                  onDetail={(title, children) => setDetail({ title, children })}
                  onEdit={openForm}
                  onDocStatus={updateDocStatus}
                  onAdjustStatus={updateAdjustmentStatus}
                  onRetryLedgerSync={retryLedgerSync}
                  onTogglePolicy={togglePolicy}
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
      {form && (
        <BudgetFormModal
          form={form}
          errors={formErrors}
          ledgers={annualLedgers}
          submitting={submitting}
          onChange={(patch) => setForm((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setForm(null)}
          onSaveDraft={saveDraft}
          onSubmit={submitApproval}
          onImport={() => {
            setForm((current) => (current ? { ...current, lines: annualTemplateLines.map(cloneLine) } : current));
            showToast("已使用内置 mock 数据导入预算明细。");
          }}
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

function BudgetContent({
  view,
  annualApps,
  forecastApps,
  adjustments,
  annualLedgers,
  incomeLedgers,
  summaryLedgers,
  forecastLedgers,
  amortizationRows,
  policies,
  mappings,
  onDetail,
  onEdit,
  onDocStatus,
  onAdjustStatus,
  onRetryLedgerSync,
  onTogglePolicy
}: {
  view: BudgetView;
  annualApps: BudgetApplication[];
  forecastApps: BudgetApplication[];
  adjustments: BudgetAdjustment[];
  annualLedgers: BudgetLedger[];
  incomeLedgers: BudgetLedger[];
  summaryLedgers: SummaryRow[];
  forecastLedgers: ForecastLedger[];
  amortizationRows: SimpleReportRow[];
  policies: ControlPolicy[];
  mappings: ReportMapping[];
  onDetail: (title: string, children: ReactNode) => void;
  onEdit: (mode: FormMode, id?: string) => void;
  onDocStatus: (kind: "annual" | "forecast", id: string, status: ApprovalStatus) => void;
  onAdjustStatus: (id: string, status: ApprovalStatus) => void;
  onRetryLedgerSync: (id: string) => void;
  onTogglePolicy: (id: string) => void;
}) {
  if (view === "annual-apps") {
    return <ApplicationTable rows={annualApps} kind="annual" onDetail={onDetail} onEdit={onEdit} onDocStatus={onDocStatus} />;
  }
  if (view === "forecast-apps") {
    return <ApplicationTable rows={forecastApps} kind="forecast" onDetail={onDetail} onEdit={onEdit} onDocStatus={onDocStatus} />;
  }
  if (view === "adjustments") {
    return <AdjustmentTable rows={adjustments} onDetail={onDetail} onEdit={onEdit} onStatus={onAdjustStatus} />;
  }
  if (view === "annual-ledger") {
    return <LedgerTable rows={annualLedgers} onDetail={onDetail} onRetrySync={onRetryLedgerSync} />;
  }
  if (view === "income-ledger") {
    return <LedgerTable rows={incomeLedgers} onDetail={onDetail} onRetrySync={onRetryLedgerSync} />;
  }
  if (view === "summary-ledger") {
    return <SummaryTable rows={summaryLedgers} onDetail={onDetail} />;
  }
  if (view === "forecast-ledger") {
    return <ForecastTable rows={forecastLedgers} onDetail={onDetail} />;
  }
  if (view === "amortization") {
    return <SimpleReportTable rows={amortizationRows} />;
  }
  if (view === "policies") {
    return <PolicyTable rows={policies} onToggle={onTogglePolicy} />;
  }
  return <MappingTable rows={mappings} />;
}

function ApplicationTable({
  rows,
  kind,
  onDetail,
  onEdit,
  onDocStatus
}: {
  rows: BudgetApplication[];
  kind: "annual" | "forecast";
  onDetail: (title: string, children: ReactNode) => void;
  onEdit: (mode: FormMode, id?: string) => void;
  onDocStatus: (kind: "annual" | "forecast", id: string, status: ApprovalStatus) => void;
}) {
  return (
    <table className="min-w-[1280px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>单据编号</Th>
          <Th>编制年度/月</Th>
          <Th>预算类型</Th>
          <Th>申请部门</Th>
          <Th>申请人</Th>
          <Th>全年合计</Th>
          <Th>审批状态</Th>
          <Th>同步状态</Th>
          <Th>风险标签</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <ApplicationDetail item={item} />)}>
                {item.code}
              </button>
            </Td>
            <Td>{item.kind === "annual" ? item.year : item.month}</Td>
            <Td>{item.budgetType}</Td>
            <Td>{item.department}</Td>
            <Td>{item.applicant}</Td>
            <Td align="right">{formatMoney(item.lines.reduce((total, line) => total + sum(line.months), 0))}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
            </Td>
            <Td>{item.specialApproval ? <StatusBadge status="特殊审批" /> : "-"}</Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item.code, <ApplicationDetail item={item} />)}>详情</button>
                {(item.status === "草稿" || item.status === "已驳回") && <button onClick={() => onEdit(kind, item.id)}>编辑</button>}
                {(item.status === "草稿" || item.status === "已驳回") && <button onClick={() => onDocStatus(kind, item.id, "审批中")}>提交</button>}
                {item.status === "审批中" && <button onClick={() => onDocStatus(kind, item.id, "业务已通过")}>业务通过</button>}
                {(item.status === "审批中" || item.status === "业务已通过") && <button onClick={() => onDocStatus(kind, item.id, "已驳回")}>驳回</button>}
                {item.status === "业务已通过" && <button onClick={() => onDocStatus(kind, item.id, "已生效")}>财务通过</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AdjustmentTable({
  rows,
  onDetail,
  onEdit,
  onStatus
}: {
  rows: BudgetAdjustment[];
  onDetail: (title: string, children: ReactNode) => void;
  onEdit: (mode: FormMode, id?: string) => void;
  onStatus: (id: string, status: ApprovalStatus) => void;
}) {
  return (
    <table className="min-w-[1180px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>调整单号</Th>
          <Th>调整类型</Th>
          <Th>申请部门</Th>
          <Th>调增合计</Th>
          <Th>调减合计</Th>
          <Th>审批状态</Th>
          <Th>同步状态</Th>
          <Th>调整事由</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <AdjustmentDetail item={item} />)}>
                {item.code}
              </button>
            </Td>
            <Td>{item.type}</Td>
            <Td>{item.department}</Td>
            <Td align="right">{formatMoney(adjustTotal(item, "调增"))}</Td>
            <Td align="right" danger>{formatMoney(adjustTotal(item, "调减"))}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
            </Td>
            <Td>{item.reason}</Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item.code, <AdjustmentDetail item={item} />)}>详情</button>
                {(item.status === "草稿" || item.status === "已驳回") && <button onClick={() => onEdit("adjustment", item.id)}>编辑</button>}
                {(item.status === "草稿" || item.status === "已驳回") && <button onClick={() => onStatus(item.id, "审批中")}>提交</button>}
                {item.status === "审批中" && <button onClick={() => onStatus(item.id, "业务已通过")}>业务通过</button>}
                {item.status === "业务已通过" && <button onClick={() => onStatus(item.id, "已生效")}>财务通过</button>}
                {(item.status === "审批中" || item.status === "业务已通过") && <button onClick={() => onStatus(item.id, "已驳回")}>驳回</button>}
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
  onRetrySync
}: {
  rows: BudgetLedger[];
  onDetail: (title: string, children: ReactNode) => void;
  onRetrySync: (id: string) => void;
}) {
  return (
    <table className="min-w-[1680px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>来源单据</Th>
          <Th>预算类型</Th>
          <Th>事业部</Th>
          <Th>一级部门</Th>
          <Th>一级预算科目</Th>
          <Th>二级预算科目</Th>
          <Th>渠道</Th>
          <Th>品类</Th>
          <Th>全年合计</Th>
          <Th>调整金额</Th>
          <Th>调整后预算</Th>
          <Th>已占用</Th>
          <Th>可用余额</Th>
          <Th>状态</Th>
          <Th>同步状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.sourceCode, <LedgerDetail item={item} />)}>
                {item.sourceCode}
              </button>
            </Td>
            <Td>{item.budgetType}</Td>
            <Td>{item.businessUnit}</Td>
            <Td>{item.department}</Td>
            <Td>{item.firstSubject}</Td>
            <Td>{item.secondSubject}</Td>
            <Td>{item.channel}</Td>
            <Td>{item.category}</Td>
            <Td align="right">{formatMoney(item.originalAmount)}</Td>
            <Td align="right" danger={item.adjustmentAmount < 0}>{formatMoney(item.adjustmentAmount)}</Td>
            <Td align="right">{formatMoney(adjustedAmount(item))}</Td>
            <Td align="right">{formatMoney(item.occupiedAmount)}</Td>
            <Td align="right" danger={availableAmount(item) < adjustedAmount(item) * 0.2}>{formatMoney(availableAmount(item))}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <div className="space-y-1">
                <StatusBadge status={item.syncStatus} />
                {item.failureReason && (
                  <button className="block text-xs text-blue-600 hover:underline" onClick={() => onRetrySync(item.id)}>
                    重新同步
                  </button>
                )}
              </div>
            </Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(item.sourceCode, <LedgerDetail item={item} />)}>变更明细</button>
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface SummaryRow {
  id: string;
  businessUnit: string;
  department: string;
  firstSubject: string;
  secondSubject: string;
  budgetType: BudgetType;
  originalAmount: number;
  adjustmentAmount: number;
  occupiedAmount: number;
  rowCount: number;
}

function SummaryTable({ rows, onDetail }: { rows: SummaryRow[]; onDetail: (title: string, children: ReactNode) => void }) {
  return (
    <table className="min-w-[1180px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>合并口径</Th>
          <Th>事业部</Th>
          <Th>部门</Th>
          <Th>预算类型</Th>
          <Th>预算科目</Th>
          <Th>原预算金额</Th>
          <Th>调整金额</Th>
          <Th>调整后预算</Th>
          <Th>已占用</Th>
          <Th>可用余额</Th>
          <Th>明细数</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.id, <SummaryDetail item={item} />)}>
                {item.businessUnit} / {item.firstSubject}
              </button>
            </Td>
            <Td>{item.businessUnit}</Td>
            <Td>{item.department}</Td>
            <Td>{item.budgetType}</Td>
            <Td>{item.firstSubject} / {item.secondSubject}</Td>
            <Td align="right">{formatMoney(item.originalAmount)}</Td>
            <Td align="right" danger={item.adjustmentAmount < 0}>{formatMoney(item.adjustmentAmount)}</Td>
            <Td align="right">{formatMoney(item.originalAmount + item.adjustmentAmount)}</Td>
            <Td align="right">{formatMoney(item.occupiedAmount)}</Td>
            <Td align="right">{formatMoney(item.originalAmount + item.adjustmentAmount - item.occupiedAmount)}</Td>
            <Td>{item.rowCount}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ForecastTable({ rows, onDetail }: { rows: ForecastLedger[]; onDetail: (title: string, children: ReactNode) => void }) {
  return (
    <table className="min-w-[1280px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>来源单据</Th>
          <Th>申请月份</Th>
          <Th>预算类型</Th>
          <Th>部门</Th>
          <Th>预算科目</Th>
          <Th>渠道</Th>
          <Th>品类</Th>
          <Th>年度预算总额</Th>
          <Th>全年预测额</Th>
          <Th>预测差异</Th>
          <Th>校验结果</Th>
          <Th>同步状态</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>
              <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.sourceCode, <ForecastDetail item={item} />)}>
                {item.sourceCode}
              </button>
            </Td>
            <Td>{item.month}</Td>
            <Td>{item.budgetType}</Td>
            <Td>{item.department}</Td>
            <Td>{item.firstSubject} / {item.secondSubject}</Td>
            <Td>{item.channel}</Td>
            <Td>{item.category}</Td>
            <Td align="right">{formatMoney(item.annualBudgetAmount)}</Td>
            <Td align="right">{formatMoney(item.forecastAmount)}</Td>
            <Td align="right" danger={item.varianceAmount > 0}>{formatMoney(item.varianceAmount)}</Td>
            <Td>
              <StatusBadge status={item.warning} />
            </Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface SimpleReportRow {
  id: string;
  type: "财务摊销结果" | "收入挑战目标";
  dimension: string;
  department: string;
  subject: string;
  annualAmount: number;
  monthAmount: number;
  targetAmount: number;
  varianceAmount: number;
  updatedAt: string;
}

function SimpleReportTable({ rows }: { rows: SimpleReportRow[] }) {
  return (
    <table className="min-w-[1120px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>台账类型</Th>
          <Th>维度</Th>
          <Th>部门</Th>
          <Th>预算科目</Th>
          <Th>年度预算</Th>
          <Th>本月摊销/目标</Th>
          <Th>挑战目标</Th>
          <Th>差异</Th>
          <Th>更新时间</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>{item.type}</Td>
            <Td>{item.dimension}</Td>
            <Td>{item.department}</Td>
            <Td>{item.subject}</Td>
            <Td align="right">{formatMoney(item.annualAmount)}</Td>
            <Td align="right">{formatMoney(item.monthAmount)}</Td>
            <Td align="right">{formatMoney(item.targetAmount)}</Td>
            <Td align="right" danger={item.varianceAmount < 0}>{formatMoney(item.varianceAmount)}</Td>
            <Td>{item.updatedAt}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PolicyTable({ rows, onToggle }: { rows: ControlPolicy[]; onToggle: (id: string) => void }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {rows.map((item) => (
        <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{item.object}</div>
              <div className="mt-1 text-sm text-slate-500">{item.method} / {item.cycle}</div>
            </div>
            <StatusBadge status={item.enabled ? "已启用" : "已禁用"} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <ReadOnly label="提示阈值" value={`${item.tipThreshold}%`} />
            <ReadOnly label="禁止阈值" value={`${item.forbidThreshold}%`} />
            <ReadOnly label="策略结果" value={<StatusBadge status={item.effect} />} />
            <ReadOnly label="控制周期" value={item.cycle} />
          </div>
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">{item.description}</div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => onToggle(item.id)}>
              {item.enabled ? "停用策略" : "启用策略"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MappingTable({ rows }: { rows: ReportMapping[] }) {
  return (
    <table className="min-w-[1240px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>部门</Th>
          <Th>预算科目</Th>
          <Th>报表科目一级</Th>
          <Th>报表科目二级</Th>
          <Th>报表科目三级</Th>
          <Th>取数来源</Th>
          <Th>汇总口径</Th>
          <Th>更新时间</Th>
          <Th>同步状态</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>{item.department}</Td>
            <Td>{item.firstSubject} / {item.secondSubject}</Td>
            <Td>{item.reportSubject1}</Td>
            <Td>{item.reportSubject2}</Td>
            <Td>{item.reportSubject3}</Td>
            <Td>{item.source}</Td>
            <Td>{item.caliber}</Td>
            <Td>{item.updatedAt}</Td>
            <Td>
              <StatusBadge status={item.syncStatus} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BudgetFormModal({
  form,
  errors,
  ledgers,
  submitting,
  onChange,
  onClose,
  onSaveDraft,
  onSubmit,
  onImport
}: {
  form: FormState;
  errors: Record<string, string>;
  ledgers: BudgetLedger[];
  submitting: boolean;
  onChange: (patch: Partial<FormState>) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: (event: FormEvent) => void;
  onImport: () => void;
}) {
  const isAdjustment = form.mode === "adjustment";
  const total = isAdjustment
    ? form.adjustmentLines.reduce((amount, line) => amount + (line.direction === "调增" ? line.amount : -line.amount), 0)
    : form.lines.reduce((amount, line) => amount + sum(line.months), 0);

  function patchLine(index: number, patch: Partial<BudgetLine>) {
    onChange({ lines: form.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)) });
  }

  function patchMonth(index: number, monthIndex: number, value: string) {
    const amount = Number(value) || 0;
    onChange({
      lines: form.lines.map((line, i) =>
        i === index ? { ...line, months: line.months.map((month, m) => (m === monthIndex ? amount : month)) } : line
      )
    });
  }

  function patchAdjustment(index: number, patch: Partial<AdjustmentLine>) {
    const nextLines = form.adjustmentLines.map((line, i) => {
      if (i !== index) return line;
      const next = { ...line, ...patch };
      if (patch.ledgerId) {
        const ledger = ledgers.find((item) => item.id === patch.ledgerId);
        if (ledger) {
          next.businessUnit = ledger.businessUnit;
          next.department = ledger.department;
          next.firstSubject = ledger.firstSubject;
          next.secondSubject = ledger.secondSubject;
        }
      }
      return next;
    });
    onChange({ adjustmentLines: nextLines });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <form className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl" onSubmit={onSubmit}>
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold">{formTitle(form.mode)}</h2>
            <p className="mt-1 text-sm text-slate-500">申请 - 部门负责人 - 财务 BP - 财务总监</p>
          </div>
          <button type="button" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <Section title="申请信息">
            <div className="grid gap-3 md:grid-cols-4">
              <Field label="申请人" required error={errors.applicant}>
                <Input value={form.applicant} onChange={(value) => onChange({ applicant: value })} />
              </Field>
              <Field label="申请人公司">
                <Input value={form.company} onChange={(value) => onChange({ company: value })} />
              </Field>
              <Field label="申请人部门" required error={errors.department}>
                <Select value={form.department} onChange={(value) => onChange({ department: value })} options={["电商运营部", "品牌营销部", "内容营销部", "直播运营部", "平台运营组"]} />
              </Field>
              <Field label="事业部">
                <Select value={form.businessUnit} onChange={(value) => onChange({ businessUnit: value })} options={["电商事业部", "品牌事业部", "直播事业部"]} />
              </Field>
              {!isAdjustment && (
                <>
                  <Field label="编制年度" required error={errors.year}>
                    <Input value={form.year} onChange={(value) => onChange({ year: value })} />
                  </Field>
                  {form.mode === "forecast" && (
                    <Field label="申请月份" required error={errors.month}>
                      <Input value={form.month} onChange={(value) => onChange({ month: value })} />
                    </Field>
                  )}
                  <Field label="预算类型">
                    <Select value={form.budgetType} onChange={(value) => onChange({ budgetType: value as BudgetType })} options={["费用类", "成本类", "收入-渠道", "收入-品类"]} />
                  </Field>
                </>
              )}
              {isAdjustment && (
                <Field label="调整类型">
                  <Select value={form.adjustmentType} onChange={(value) => onChange({ adjustmentType: value as BudgetAdjustment["type"] })} options={["部门内调整", "部门间调整", "事业部间调整"]} />
                </Field>
              )}
              <Field label={isAdjustment ? "调整事由" : "说明"} className="md:col-span-4" required={isAdjustment} error={isAdjustment ? errors.reason : undefined}>
                <Textarea value={isAdjustment ? form.reason : form.description} onChange={(value) => onChange(isAdjustment ? { reason: value } : { description: value })} />
              </Field>
            </div>
          </Section>

          <Section
            title={isAdjustment ? "调整明细" : "编制明细"}
            extra={
              <div className="flex gap-2">
                {!isAdjustment && (
                  <Button type="button" size="sm" variant="secondary" onClick={onImport}>
                    模拟导入
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (isAdjustment) {
                      const ledger = ledgers[0];
                      onChange({
                        adjustmentLines: [
                          ...form.adjustmentLines,
                          {
                            id: `adjust-line-${Date.now()}`,
                            ledgerId: ledger?.id ?? "",
                            businessUnit: ledger?.businessUnit ?? "电商事业部",
                            department: ledger?.department ?? "电商运营部",
                            firstSubject: ledger?.firstSubject ?? "渠道营销",
                            secondSubject: ledger?.secondSubject ?? "信息流投放",
                            period: "2026-06",
                            direction: "调增",
                            amount: 100000,
                            remark: ""
                          }
                        ]
                      });
                    } else {
                      onChange({ lines: [...form.lines, cloneLine(annualTemplateLines[form.lines.length % annualTemplateLines.length])] });
                    }
                  }}
                >
                  新增行
                </Button>
              </div>
            }
          >
            {errors.lines && <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{errors.lines}</div>}
            <div className="overflow-x-auto">
              {isAdjustment ? (
                <table className="min-w-[1120px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <Th>预算台账</Th>
                      <Th>事业部</Th>
                      <Th>部门</Th>
                      <Th>预算科目</Th>
                      <Th>调整期间</Th>
                      <Th>方向</Th>
                      <Th>金额</Th>
                      <Th>可用余额</Th>
                      <Th>备注</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.adjustmentLines.map((line, index) => {
                      const ledger = ledgers.find((item) => item.id === line.ledgerId);
                      return (
                        <tr key={line.id}>
                          <Td>
                            <Select value={line.ledgerId} onChange={(value) => patchAdjustment(index, { ledgerId: value })} options={ledgers.map((item) => item.id)} />
                          </Td>
                          <Td>{line.businessUnit}</Td>
                          <Td>{line.department}</Td>
                          <Td>{line.firstSubject} / {line.secondSubject}</Td>
                          <Td>
                            <Input value={line.period} onChange={(value) => patchAdjustment(index, { period: value })} />
                          </Td>
                          <Td>
                            <Select value={line.direction} onChange={(value) => patchAdjustment(index, { direction: value as AdjustDirection })} options={["调增", "调减"]} />
                          </Td>
                          <Td>
                            <Input value={String(line.amount)} onChange={(value) => patchAdjustment(index, { amount: Number(value) || 0 })} />
                            {errors[`adjust-amount-${index}`] && <div className="mt-1 text-xs text-red-500">{errors[`adjust-amount-${index}`]}</div>}
                          </Td>
                          <Td className={line.direction === "调减" && ledger && line.amount > availableAmount(ledger) ? "bg-orange-50 text-orange-700" : ""}>
                            {ledger ? formatMoney(availableAmount(ledger)) : "-"}
                          </Td>
                          <Td>
                            <Input value={line.remark} onChange={(value) => patchAdjustment(index, { remark: value })} />
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-[1520px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <Th>一级科目</Th>
                      <Th>二级科目</Th>
                      <Th>属性</Th>
                      <Th>事业部</Th>
                      <Th>部门</Th>
                      <Th>渠道</Th>
                      <Th>品类</Th>
                      {months.map((month) => (
                        <Th key={month}>{month}</Th>
                      ))}
                      <Th>全年合计</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {form.lines.map((line, index) => {
                      const rowTotal = sum(line.months);
                      const matched = findMatchingLedger(line, form.budgetType, ledgers);
                      const warn = form.mode === "forecast" && matched && rowTotal > adjustedAmount(matched);
                      const reach70 = form.mode === "forecast" && matched && rowTotal > adjustedAmount(matched) * 0.7;
                      return (
                        <tr key={line.id} className={warn ? "bg-orange-50" : ""}>
                          <Td>
                            <Input value={line.firstSubject} onChange={(value) => patchLine(index, { firstSubject: value })} />
                          </Td>
                          <Td>
                            <Input value={line.secondSubject} onChange={(value) => patchLine(index, { secondSubject: value })} />
                          </Td>
                          <Td>
                            <Select value={line.subjectAttribute} onChange={(value) => patchLine(index, { subjectAttribute: value })} options={["费用", "成本", "收入"]} />
                          </Td>
                          <Td>
                            <Select value={line.businessUnit} onChange={(value) => patchLine(index, { businessUnit: value })} options={["电商事业部", "品牌事业部", "直播事业部"]} />
                          </Td>
                          <Td>
                            <Input value={line.department} onChange={(value) => patchLine(index, { department: value })} />
                          </Td>
                          <Td>
                            <Input value={form.budgetType === "收入-渠道" ? line.channel : "-"} onChange={(value) => patchLine(index, { channel: value })} disabled={form.budgetType !== "收入-渠道"} />
                          </Td>
                          <Td>
                            <Input value={form.budgetType === "收入-品类" ? line.category : "-"} onChange={(value) => patchLine(index, { category: value })} disabled={form.budgetType !== "收入-品类"} />
                          </Td>
                          {line.months.map((month, monthIndex) => (
                            <Td key={monthIndex}>
                              <input
                                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right tabular-nums outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                value={month}
                                onChange={(event) => patchMonth(index, monthIndex, event.target.value)}
                              />
                            </Td>
                          ))}
                          <Td align="right">
                            <div className="font-medium">{formatMoney(rowTotal)}</div>
                            {warn && <div className="text-xs text-orange-600">超年度预算</div>}
                            {!warn && reach70 && <div className="text-xs text-orange-600">达到70%</div>}
                            {errors[`line-amount-${index}`] && <div className="text-xs text-red-500">{errors[`line-amount-${index}`]}</div>}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Section>

          <Section title="预算校验">
            <div className="grid gap-3 md:grid-cols-4">
              <ReadOnly label={isAdjustment ? "净调整金额" : "页面总计"} value={formatMoney(total)} />
              <ReadOnly label="校验结果" value={<StatusBadge status={total > 0 ? "预算充足" : "待提交"} />} />
              <ReadOnly label="来源系统" value="[OA] 审批 / [经分] 报表 / [财务] 摊销均为 mock" />
              <ReadOnly label="附件模拟" value="budget-template-mock.xlsx" />
            </div>
          </Section>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="button" variant="secondary" onClick={onSaveDraft}>
            保存草稿
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "提交中..." : "提交审批"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ApplicationDetail({ item }: { item: BudgetApplication }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadOnly label="单据编号" value={item.code} />
          <ReadOnly label="单据状态" value={<StatusBadge status={item.status} />} />
          <ReadOnly label="预算类型" value={item.budgetType} />
          <ReadOnly label="全年合计" value={formatMoney(item.lines.reduce((total, line) => total + sum(line.months), 0))} />
        </div>
      </div>
      {item.failureReason && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{item.failureReason}</div>}
      <Section title="基础信息">
        <DetailGrid
          rows={[
            ["申请人", item.applicant],
            ["申请人公司", item.company],
            ["申请部门", item.department],
            ["事业部", item.businessUnit],
            ["年度/月", item.kind === "annual" ? item.year : item.month],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["最近同步时间", item.lastSyncAt],
            ["说明", item.description]
          ]}
        />
      </Section>
      <Section title="编制明细">
        <MiniLineTable lines={item.lines} />
      </Section>
      <Section title="审批记录">
        <StepList steps={item.steps} />
      </Section>
    </div>
  );
}

function AdjustmentDetail({ item }: { item: BudgetAdjustment }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <ReadOnly label="调整单号" value={item.code} />
          <ReadOnly label="单据状态" value={<StatusBadge status={item.status} />} />
          <ReadOnly label="调增合计" value={formatMoney(adjustTotal(item, "调增"))} />
          <ReadOnly label="调减合计" value={formatMoney(adjustTotal(item, "调减"))} />
        </div>
      </div>
      <Section title="调整信息">
        <DetailGrid
          rows={[
            ["调整类型", item.type],
            ["申请人", item.applicant],
            ["申请部门", item.department],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["最近同步时间", item.lastSyncAt],
            ["调整事由", item.reason]
          ]}
        />
      </Section>
      <Section title="预算区">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>事业部</Th>
              <Th>部门</Th>
              <Th>科目</Th>
              <Th>期间</Th>
              <Th>方向</Th>
              <Th>金额</Th>
              <Th>备注</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {item.lines.map((line) => (
              <tr key={line.id}>
                <Td>{line.businessUnit}</Td>
                <Td>{line.department}</Td>
                <Td>{line.firstSubject} / {line.secondSubject}</Td>
                <Td>{line.period}</Td>
                <Td>
                  <StatusBadge status={line.direction} />
                </Td>
                <Td align="right" danger={line.direction === "调减"}>{formatMoney(line.amount)}</Td>
                <Td>{line.remark}</Td>
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

function LedgerDetail({ item }: { item: BudgetLedger }) {
  return (
    <div className="space-y-4">
      {item.failureReason && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{item.failureReason}</div>}
      <Section title="台账摘要">
        <DetailGrid
          rows={[
            ["来源单据", item.sourceCode],
            ["预算类型", item.budgetType],
            ["预算科目", `${item.firstSubject} / ${item.secondSubject}`],
            ["部门", `${item.businessUnit} / ${item.department}`],
            ["原预算金额", formatMoney(item.originalAmount)],
            ["预算总额调整数", formatMoney(item.adjustmentAmount)],
            ["调整后预算", formatMoney(adjustedAmount(item))],
            ["已占用金额", formatMoney(item.occupiedAmount)],
            ["可用余额", formatMoney(availableAmount(item))],
            ["来源系统", item.sourceSystem],
            ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
            ["最近同步时间", item.lastSyncAt]
          ]}
        />
      </Section>
      <Section title="月度分布">
        <MonthAmountGrid months={item.months} />
      </Section>
      <Section title="变更明细">
        {item.changes.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">暂无变更记录。</div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>来源单据</Th>
                <Th>日期</Th>
                <Th>调整前</Th>
                <Th>调整金额</Th>
                <Th>调整后</Th>
                <Th>审批意见</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {item.changes.map((change) => (
                <tr key={`${change.code}-${change.date}`}>
                  <Td>{change.code}</Td>
                  <Td>{change.date}</Td>
                  <Td align="right">{formatMoney(change.beforeAmount)}</Td>
                  <Td align="right" danger={change.changeAmount < 0}>{formatMoney(change.changeAmount)}</Td>
                  <Td align="right">{formatMoney(change.afterAmount)}</Td>
                  <Td>{change.comment}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  );
}

function SummaryDetail({ item }: { item: SummaryRow }) {
  return (
    <DetailGrid
      rows={[
        ["合并口径", item.id],
        ["事业部", item.businessUnit],
        ["部门", item.department],
        ["预算类型", item.budgetType],
        ["预算科目", `${item.firstSubject} / ${item.secondSubject}`],
        ["原预算金额", formatMoney(item.originalAmount)],
        ["调整后预算", formatMoney(item.originalAmount + item.adjustmentAmount)],
        ["可用余额", formatMoney(item.originalAmount + item.adjustmentAmount - item.occupiedAmount)]
      ]}
    />
  );
}

function ForecastDetail({ item }: { item: ForecastLedger }) {
  return (
    <DetailGrid
      rows={[
        ["来源单据", item.sourceCode],
        ["申请月份", item.month],
        ["预算类型", item.budgetType],
        ["部门", `${item.businessUnit} / ${item.department}`],
        ["预算科目", `${item.firstSubject} / ${item.secondSubject}`],
        ["年度预算总额", formatMoney(item.annualBudgetAmount)],
        ["全年预测额", formatMoney(item.forecastAmount)],
        ["预测差异", formatMoney(item.varianceAmount)],
        ["校验结果", <StatusBadge key="warning" status={item.warning} />],
        ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />]
      ]}
    />
  );
}

function MiniLineTable({ lines }: { lines: BudgetLine[] }) {
  return (
    <table className="min-w-[980px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>预算科目</Th>
          <Th>事业部</Th>
          <Th>部门</Th>
          <Th>渠道</Th>
          <Th>品类</Th>
          <Th>全年合计</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {lines.map((line) => (
          <tr key={line.id}>
            <Td>{line.firstSubject} / {line.secondSubject}</Td>
            <Td>{line.businessUnit}</Td>
            <Td>{line.department}</Td>
            <Td>{line.channel}</Td>
            <Td>{line.category}</Td>
            <Td align="right">{formatMoney(sum(line.months))}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MonthAmountGrid({ months: values }: { months: number[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {months.map((month, index) => (
        <div key={month} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs text-slate-500">{month}</div>
          <div className="mt-1 font-medium tabular-nums">{formatMoney(values[index] ?? 0)}</div>
        </div>
      ))}
    </div>
  );
}

function StepList({ steps }: { steps: ApprovalStep[] }) {
  if (steps.length === 0) {
    return <div className="rounded-md border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">暂无审批记录。</div>;
  }
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={`${step.node}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-medium">{step.node}</div>
            <div className="text-slate-400">{step.date}</div>
          </div>
          <div className="mt-1 text-slate-500">{step.approver}：{step.comment}</div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  onQuery,
  onReset,
  onError
}: {
  filters: { keyword: string; status: string; budgetType: string; department: string };
  setFilters: (filters: { keyword: string; status: string; budgetType: string; department: string }) => void;
  onQuery: () => void;
  onReset: () => void;
  onError: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <Field label="单号 / 科目 / 部门" className="md:col-span-2">
        <Input value={filters.keyword} onChange={(value) => setFilters({ ...filters, keyword: value })} placeholder="输入关键字" />
      </Field>
      <Field label="状态">
        <Select value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={["全部", "草稿", "审批中", "业务已通过", "已驳回", "已生效", "同步失败", "超额预警", "已启用", "已禁用"]} />
      </Field>
      <Field label="预算类型">
        <Select value={filters.budgetType} onChange={(value) => setFilters({ ...filters, budgetType: value })} options={["全部", "费用类", "成本类", "收入-渠道", "收入-品类"]} />
      </Field>
      <Field label="部门">
        <Select value={filters.department} onChange={(value) => setFilters({ ...filters, department: value })} options={["全部", "电商运营部", "品牌营销部", "内容营销部", "直播运营部", "平台运营组"]} />
      </Field>
      <div className="flex items-end gap-2">
        <Button onClick={onQuery}>查询</Button>
        <Button variant="secondary" onClick={onReset}>
          重置
        </Button>
        <Button variant="secondary" onClick={onError}>
          模拟异常
        </Button>
      </div>
    </div>
  );
}

function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}

function EmptyState({ onReset, onCreate }: { onReset: () => void; onCreate: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">0</div>
      <div className="font-medium text-slate-700">暂无匹配预算数据</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选或新增一张预算单据继续演示。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>
          重置筛选
        </Button>
        <Button onClick={onCreate}>新增单据</Button>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

function Section({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        {extra}
      </div>
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

function Field({
  label,
  children,
  required,
  error,
  className = ""
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-slate-500">{required && <span className="text-red-500">*</span>} {label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function ReadOnly({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 min-h-6 text-sm font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder = "", disabled = false }: { value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select
      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
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
  const sizeClass = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400";
  return (
    <button type={type} disabled={disabled} className={`rounded-md font-medium shadow-sm ${sizeClass} ${variantClass}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold">{children}</th>;
}

function Td({ children, align = "left", danger = false, className = "" }: { children: ReactNode; align?: "left" | "right"; danger?: boolean; className?: string }) {
  return (
    <td className={`whitespace-nowrap px-3 py-3 align-top ${align === "right" ? "text-right tabular-nums" : ""} ${danger ? "text-red-600" : ""} ${className}`}>
      {children || "-"}
    </td>
  );
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 text-sm font-medium text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status.includes("失败") || status.includes("驳回") || status.includes("禁止") || status.includes("超年度")
      ? "border-red-200 bg-red-50 text-red-600"
      : status.includes("通过") || status.includes("生效") || status.includes("成功") || status.includes("充足") || status.includes("启用")
        ? "border-green-200 bg-green-50 text-green-600"
        : status.includes("审批") || status.includes("同步中") || status.includes("业务已通过")
          ? "border-blue-200 bg-blue-50 text-blue-600"
          : status.includes("调减") || status.includes("预警") || status.includes("特殊") || status.includes("达到") || status.includes("提示")
            ? "border-orange-200 bg-orange-50 text-orange-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function cloneLine(line: BudgetLine): BudgetLine {
  return { ...line, id: `${line.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`, months: [...line.months] };
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function formatMoney(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function adjustedAmount(item: BudgetLedger) {
  return item.originalAmount + item.adjustmentAmount;
}

function availableAmount(item: BudgetLedger) {
  return adjustedAmount(item) - item.occupiedAmount;
}

function sumLedgers(rows: BudgetLedger[], mode: "adjusted" | "occupied" | "available") {
  return rows.reduce((total, item) => {
    if (mode === "occupied") return total + item.occupiedAmount;
    if (mode === "available") return total + availableAmount(item);
    return total + adjustedAmount(item);
  }, 0);
}

function adjustTotal(item: BudgetAdjustment, direction: AdjustDirection) {
  return item.lines.filter((line) => line.direction === direction).reduce((total, line) => total + line.amount, 0);
}

function buildNextSteps(steps: ApprovalStep[], status: ApprovalStatus, applicant: string): ApprovalStep[] {
  const stepMap: Record<ApprovalStatus, ApprovalStep> = {
    草稿: { node: "保存草稿", approver: applicant, date: today, comment: "保存草稿" },
    审批中: { node: "申请", approver: applicant, date: today, comment: "模拟提交 OA 审批" },
    业务已通过: { node: "部门负责人", approver: "赵敏", date: today, comment: "业务审批通过" },
    已驳回: { node: "财务 BP", approver: "林一", date: today, comment: "模拟驳回，可重新编辑提交" },
    已生效: { node: "财务总监", approver: "顾可", date: today, comment: "财务审批通过，写入预算台账" }
  };
  return [stepMap[status], ...steps];
}

function lineToLedger(application: BudgetApplication, line: BudgetLine): BudgetLedger {
  return {
    id: `ledger-${Date.now()}-${line.id}`,
    sourceCode: application.code,
    year: application.year,
    budgetType: application.budgetType,
    businessUnit: line.businessUnit,
    department: line.department,
    firstSubject: line.firstSubject,
    secondSubject: line.secondSubject,
    subjectAttribute: line.subjectAttribute,
    channel: application.budgetType === "收入-渠道" ? line.channel : "-",
    category: application.budgetType === "收入-品类" ? line.category : "-",
    originalAmount: sum(line.months),
    adjustmentAmount: 0,
    occupiedAmount: application.budgetType.startsWith("收入") ? 0 : Math.round(sum(line.months) * 0.08),
    months: [...line.months],
    status: "已生效",
    sourceSystem: application.budgetType.startsWith("收入") ? "[经营分析] 收入预算" : "[OA] 预算审批",
    syncStatus: "同步成功",
    lastSyncAt: nowText,
    syncBatchNo: `SYNC-BUDGET-${Date.now()}`,
    changes: []
  };
}

function findMatchingLedger(line: BudgetLine, budgetType: BudgetType, ledgers: BudgetLedger[]) {
  return ledgers.find(
    (item) =>
      item.budgetType === budgetType &&
      item.department === line.department &&
      item.firstSubject === line.firstSubject &&
      item.secondSubject === line.secondSubject &&
      (budgetType !== "收入-渠道" || item.channel === line.channel) &&
      (budgetType !== "收入-品类" || item.category === line.category)
  );
}

function hasForecastWarning(form: FormState, ledgers: BudgetLedger[]) {
  return form.lines.some((line) => {
    const match = findMatchingLedger(line, form.budgetType, ledgers);
    return match ? sum(line.months) > adjustedAmount(match) : false;
  });
}

function buildSummaryLedgers(rows: BudgetLedger[]): SummaryRow[] {
  const map = new Map<string, SummaryRow>();
  rows.forEach((item) => {
    const id = `${item.businessUnit}-${item.department}-${item.budgetType}-${item.firstSubject}-${item.secondSubject}`;
    const current = map.get(id);
    if (current) {
      current.originalAmount += item.originalAmount;
      current.adjustmentAmount += item.adjustmentAmount;
      current.occupiedAmount += item.occupiedAmount;
      current.rowCount += 1;
    } else {
      map.set(id, {
        id,
        businessUnit: item.businessUnit,
        department: item.department,
        budgetType: item.budgetType,
        firstSubject: item.firstSubject,
        secondSubject: item.secondSubject,
        originalAmount: item.originalAmount,
        adjustmentAmount: item.adjustmentAmount,
        occupiedAmount: item.occupiedAmount,
        rowCount: 1
      });
    }
  });
  return Array.from(map.values());
}

function buildAmortizationRows(rows: BudgetLedger[]): SimpleReportRow[] {
  return rows
    .filter((item) => !item.budgetType.startsWith("收入"))
    .slice(0, 6)
    .map((item) => ({
      id: `amort-${item.id}`,
      type: "财务摊销结果" as const,
      dimension: item.businessUnit,
      department: item.department,
      subject: `${item.firstSubject} / ${item.secondSubject}`,
      annualAmount: adjustedAmount(item),
      monthAmount: item.months[4] ?? 0,
      targetAmount: 0,
      varianceAmount: item.months[4] - adjustedAmount(item) / 12,
      updatedAt: today
    }));
}

function buildChallengeRows(rows: BudgetLedger[]): SimpleReportRow[] {
  return rows.map((item) => {
    const target = Math.round(adjustedAmount(item) * 1.12);
    return {
      id: `challenge-${item.id}`,
      type: "收入挑战目标" as const,
      dimension: item.budgetType === "收入-渠道" ? item.channel : item.category,
      department: item.department,
      subject: `${item.firstSubject} / ${item.secondSubject}`,
      annualAmount: adjustedAmount(item),
      monthAmount: item.months[4] ?? 0,
      targetAmount: target,
      varianceAmount: target - adjustedAmount(item),
      updatedAt: today
    };
  });
}

function filterApplications(rows: BudgetApplication[], filters: { keyword: string; status: string; budgetType: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.title, item.department, item.applicant, item.budgetType].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.budgetType, filters.budgetType) && matchFilter(item.department, filters.department);
  });
}

function filterAdjustments(rows: BudgetAdjustment[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.code, item.type, item.department, item.reason].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.department, filters.department);
  });
}

function filterLedgers(rows: BudgetLedger[], filters: { keyword: string; status: string; budgetType: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.sourceCode, item.department, item.firstSubject, item.secondSubject, item.channel, item.category].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.status, filters.status, item.syncStatus) && matchFilter(item.budgetType, filters.budgetType) && matchFilter(item.department, filters.department);
  });
}

function filterSummary(rows: SummaryRow[], filters: { keyword: string; budgetType: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.id, item.department, item.firstSubject, item.secondSubject].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.budgetType, filters.budgetType) && matchFilter(item.department, filters.department);
  });
}

function filterForecasts(rows: ForecastLedger[], filters: { keyword: string; status: string; budgetType: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.sourceCode, item.department, item.firstSubject, item.secondSubject, item.warning].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.warning, filters.status, item.syncStatus) && matchFilter(item.budgetType, filters.budgetType) && matchFilter(item.department, filters.department);
  });
}

function filterSimpleRows(rows: SimpleReportRow[], filters: { keyword: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.type, item.dimension, item.department, item.subject].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.department, filters.department);
  });
}

function filterPolicies(rows: ControlPolicy[], filters: { keyword: string; status: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const status = item.enabled ? "已启用" : "已禁用";
    const hitKeyword = [item.object, item.method, item.cycle, item.effect, item.description].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(status, filters.status);
  });
}

function filterMappings(rows: ReportMapping[], filters: { keyword: string; status: string; department: string }) {
  const keyword = filters.keyword.trim().toLowerCase();
  return rows.filter((item) => {
    const hitKeyword = [item.department, item.firstSubject, item.secondSubject, item.reportSubject1, item.reportSubject2, item.source].join(" ").toLowerCase().includes(keyword);
    return hitKeyword && matchFilter(item.syncStatus, filters.status) && matchFilter(item.department, filters.department);
  });
}

function matchFilter(value: string, filter: string, alternate?: string) {
  return filter === "全部" || value === filter || alternate === filter;
}

function primaryFormMode(view: BudgetView): FormMode {
  if (view === "forecast-apps" || view === "forecast-ledger") return "forecast";
  if (view === "adjustments") return "adjustment";
  return "annual";
}

function primaryActionLabel(view: BudgetView) {
  if (view === "forecast-apps" || view === "forecast-ledger") return "新增预测";
  if (view === "adjustments") return "新增调整单";
  return "新增年度预算";
}

function formTitle(mode: FormMode) {
  if (mode === "forecast") return "月度预测编制单";
  if (mode === "adjustment") return "预算调整单";
  return "年度预算编制单";
}

const viewTabs: Array<{ key: BudgetView; label: string }> = [
  { key: "annual-apps", label: "年度预算编制" },
  { key: "forecast-apps", label: "月度预测编制" },
  { key: "adjustments", label: "预算调整单" },
  { key: "annual-ledger", label: "年度预算台账" },
  { key: "summary-ledger", label: "汇总预算台账" },
  { key: "forecast-ledger", label: "月度预测台账" },
  { key: "income-ledger", label: "收入预算台账" },
  { key: "amortization", label: "摊销与挑战目标" },
  { key: "policies", label: "预算管控策略" },
  { key: "mappings", label: "报表取数规则" }
];
