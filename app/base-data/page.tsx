"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { DemoModuleNav } from "../components/DemoModuleNav";

type LedgerView = "expense" | "activity" | "ad" | "third" | "budget";
type ApplicationKind =
  | "expense-create"
  | "expense-change"
  | "activity-create"
  | "activity-change"
  | "ad-create"
  | "ad-change"
  | "ad-close"
  | "third-create"
  | "third-change"
  | "third-close"
  | "budget-create"
  | "budget-disable";
type ApprovalStatus = "草稿" | "审批中" | "已驳回" | "审批通过";
type SyncStatus = "未同步" | "同步中" | "同步成功" | "同步失败";

interface ExpenseType {
  id: string;
  code: string;
  expenseType: string;
  category: string;
  subCategory: string;
  departments: string[];
  budgetSubject: string;
  managementSubject: string;
  accountingSubject: string;
  invoiceSubject: string;
  allowNoInvoice: boolean;
  status: "已启用" | "未生效" | "已禁用" | "审批中";
  effectiveAt: string;
  updatedAt: string;
  description: string;
}

interface ActivityRelation {
  id: string;
  code: string;
  activityName: string;
  activityType: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  reachStore: boolean;
  store: string;
  channel: string;
  businessUnit: string;
  businessSource: string;
  reachCategory: boolean;
  reachSku: boolean;
  allowPersonalAdvance: boolean;
  allowNoInvoice: boolean;
  expenseType: string;
  category: string;
  subCategory: string;
  accountingSubject: string;
  invoiceSubject: string;
  activityStatus: "启用" | "禁用";
  relationStatus: "启用" | "停用" | "待生效";
  effectiveAt: string;
  changed: boolean;
}

interface AdAccount {
  id: string;
  code: string;
  companyPhone: string;
  companyEmail: string;
  settlementEntity: string;
  supplier: string;
  platform: string;
  accountName: string;
  accountId: string;
  deliveryMethod: string;
  methodEffectiveAt: string;
  activityName: string;
  rechargeMethod: string;
  hasRechargeGift: boolean;
  hasSalesRebate: boolean;
  isFundRechargeAccount: boolean;
  canApplyInvoice: boolean;
  businessOwner: string;
  financeOwner: string;
  status: "已启用" | "审批中" | "清账中" | "待回收" | "已注销";
  dataRecovered: boolean;
  accountCleared: boolean;
  changed: boolean;
  syncStatus: SyncStatus;
  lastSyncAt: string;
  syncBatchNo: string;
  failureReason?: string;
  methodHistory: MethodHistory[];
}

interface MethodHistory {
  id: string;
  accountName: string;
  accountId: string;
  deliveryMethod: string;
  effectiveAt: string;
  endedAt: string;
}

interface ThirdPartyAccount {
  id: string;
  code: string;
  accountName: string;
  accountNo: string;
  accountingEntity: string;
  store: string;
  companyPhone: string;
  companyEmail: string;
  businessOwner: string;
  financeOwner: string;
  platform: string;
  accountAttribute: string;
  accountNature: string;
  status: "已启用" | "审批中" | "付款验证中" | "已关闭";
  changed: boolean;
  needPaymentVerification: boolean;
  paymentAmount: number;
  paymentStatus: "无需验证" | "待验证" | "验证通过" | "验证失败";
  closeRemark?: string;
}

interface BudgetSubject {
  id: string;
  organization: string;
  first: string;
  second: string;
  status: "启用" | "禁用";
}

interface ApprovalStep {
  node: string;
  approver: string;
  date: string;
  comment: string;
}

interface BaseApplication {
  id: string;
  code: string;
  kind: ApplicationKind;
  title: string;
  applicant: string;
  company: string;
  department: string;
  position: string;
  createdAt: string;
  status: ApprovalStatus;
  summary: string;
  steps: ApprovalStep[];
}

interface FormState {
  kind: ApplicationKind;
  targetId?: string;
  requestType: string;
  expenseType: string;
  category: string;
  subCategory: string;
  departments: string;
  budgetSubject: string;
  managementSubject: string;
  accountingSubject: string;
  invoiceSubject: string;
  allowNoInvoice: string;
  status: string;
  effectiveAt: string;
  activityName: string;
  activityType: string;
  firstBudgetSubject: string;
  secondBudgetSubject: string;
  reachStore: string;
  store: string;
  channel: string;
  businessUnit: string;
  businessSource: string;
  reachCategory: string;
  reachSku: string;
  allowPersonalAdvance: string;
  platform: string;
  accountName: string;
  accountId: string;
  supplier: string;
  settlementEntity: string;
  deliveryMethod: string;
  rechargeMethod: string;
  companyPhone: string;
  companyEmail: string;
  businessOwner: string;
  financeOwner: string;
  dataRecovered: string;
  accountCleared: string;
  needPaymentVerification: string;
  accountNo: string;
  accountingEntity: string;
  accountAttribute: string;
  accountNature: string;
  paymentAmount: string;
  budgetApplicationType: string;
  subjectApplyType: string;
  organization: string;
  firstSubject: string;
  secondSubject: string;
  description: string;
}

const today = "2026-05-06";
const nowText = "2026-05-06 10:00:00";

const initialExpenseTypes: ExpenseType[] = [
  {
    id: "ex-001",
    code: "FYLX-2026-001",
    expenseType: "推广费用",
    category: "信息流投放",
    subCategory: "抖音千川投放",
    departments: ["品牌营销部", "电商运营部"],
    budgetSubject: "渠道营销 / 信息流投放",
    managementSubject: "营销投放费",
    accountingSubject: "销售费用-广告宣传费",
    invoiceSubject: "广告服务费",
    allowNoInvoice: false,
    status: "已启用",
    effectiveAt: "2026-01-01",
    updatedAt: "2026-05-03",
    description: "适用于抖音千川等信息流广告投放。"
  },
  {
    id: "ex-002",
    code: "FYLX-2026-002",
    expenseType: "达人费用",
    category: "达人合作",
    subCategory: "达人坑位费",
    departments: ["内容营销部"],
    budgetSubject: "达人合作 / 达人投放",
    managementSubject: "达人合作费",
    accountingSubject: "销售费用-业务宣传费",
    invoiceSubject: "现代服务费",
    allowNoInvoice: false,
    status: "已启用",
    effectiveAt: "2026-01-15",
    updatedAt: "2026-04-30",
    description: "达人种草、直播坑位等合作支出。"
  },
  {
    id: "ex-003",
    code: "FYLX-2026-003",
    expenseType: "直播费用",
    category: "直播运营",
    subCategory: "直播间搭建",
    departments: ["直播运营部"],
    budgetSubject: "直播运营 / 直播间建设",
    managementSubject: "直播运营费",
    accountingSubject: "销售费用-展览展示费",
    invoiceSubject: "会展服务费",
    allowNoInvoice: false,
    status: "未生效",
    effectiveAt: "2026-06-01",
    updatedAt: "2026-04-25",
    description: "直播间场景、灯光、导播等搭建费用。"
  },
  {
    id: "ex-004",
    code: "FYLX-2026-004",
    expenseType: "平台费用",
    category: "平台服务",
    subCategory: "天猫服务费",
    departments: ["电商运营部", "财务共享中心"],
    budgetSubject: "平台费用 / 平台服务费",
    managementSubject: "平台服务费",
    accountingSubject: "销售费用-平台服务费",
    invoiceSubject: "信息技术服务费",
    allowNoInvoice: true,
    status: "已启用",
    effectiveAt: "2026-02-01",
    updatedAt: "2026-05-01",
    description: "平台活动报名、服务市场等平台支出。"
  },
  {
    id: "ex-005",
    code: "FYLX-2026-005",
    expenseType: "样品费用",
    category: "样品寄送",
    subCategory: "达人样品",
    departments: ["内容营销部", "供应链协同组"],
    budgetSubject: "达人合作 / 样品寄送",
    managementSubject: "样品费",
    accountingSubject: "销售费用-样品费",
    invoiceSubject: "货物销售",
    allowNoInvoice: true,
    status: "已禁用",
    effectiveAt: "2025-07-01",
    updatedAt: "2026-03-10",
    description: "旧样品费用科目，已由新品类替代。"
  },
  {
    id: "ex-006",
    code: "FYLX-2026-006",
    expenseType: "推广费用",
    category: "搜索推广",
    subCategory: "京准通快车",
    departments: ["电商运营部"],
    budgetSubject: "渠道营销 / 搜索推广",
    managementSubject: "营销投放费",
    accountingSubject: "销售费用-广告宣传费",
    invoiceSubject: "广告服务费",
    allowNoInvoice: false,
    status: "审批中",
    effectiveAt: "2026-05-20",
    updatedAt: "2026-05-05",
    description: "京东站内搜索推广。"
  }
];

const initialActivities: ActivityRelation[] = [
  {
    id: "act-001",
    code: "HDGX-2026-001",
    activityName: "618 抖音直播爆发",
    activityType: "大促活动",
    firstBudgetSubject: "渠道营销",
    secondBudgetSubject: "信息流投放",
    reachStore: true,
    store: "抖音旗舰店",
    channel: "抖音",
    businessUnit: "电商事业部",
    businessSource: "线上直营",
    reachCategory: true,
    reachSku: true,
    allowPersonalAdvance: false,
    allowNoInvoice: false,
    expenseType: "推广费用",
    category: "信息流投放",
    subCategory: "抖音千川投放",
    accountingSubject: "销售费用-广告宣传费",
    invoiceSubject: "广告服务费",
    activityStatus: "启用",
    relationStatus: "启用",
    effectiveAt: "2026-04-20",
    changed: false
  },
  {
    id: "act-002",
    code: "HDGX-2026-002",
    activityName: "小红书春夏种草",
    activityType: "内容种草",
    firstBudgetSubject: "达人合作",
    secondBudgetSubject: "达人投放",
    reachStore: false,
    store: "-",
    channel: "小红书",
    businessUnit: "品牌事业部",
    businessSource: "品牌传播",
    reachCategory: true,
    reachSku: false,
    allowPersonalAdvance: true,
    allowNoInvoice: false,
    expenseType: "达人费用",
    category: "达人合作",
    subCategory: "达人坑位费",
    accountingSubject: "销售费用-业务宣传费",
    invoiceSubject: "现代服务费",
    activityStatus: "启用",
    relationStatus: "待生效",
    effectiveAt: "2026-05-18",
    changed: true
  },
  {
    id: "act-003",
    code: "HDGX-2026-003",
    activityName: "天猫会员日",
    activityType: "店铺活动",
    firstBudgetSubject: "平台费用",
    secondBudgetSubject: "平台服务费",
    reachStore: true,
    store: "天猫旗舰店",
    channel: "天猫",
    businessUnit: "电商事业部",
    businessSource: "线上直营",
    reachCategory: false,
    reachSku: false,
    allowPersonalAdvance: false,
    allowNoInvoice: true,
    expenseType: "平台费用",
    category: "平台服务",
    subCategory: "天猫服务费",
    accountingSubject: "销售费用-平台服务费",
    invoiceSubject: "信息技术服务费",
    activityStatus: "禁用",
    relationStatus: "停用",
    effectiveAt: "2026-02-01",
    changed: true
  }
];

const initialAdAccounts: AdAccount[] = [
  {
    id: "ad-001",
    code: "TFZH-2026-001",
    companyPhone: "13800010001",
    companyEmail: "douyin-ad@example.com",
    settlementEntity: "上海示例贸易有限公司",
    supplier: "巨量引擎",
    platform: "巨量引擎",
    accountName: "抖音旗舰店-千川主账户",
    accountId: "QIANCHUAN-882019",
    deliveryMethod: "预充值",
    methodEffectiveAt: "2026-01-01",
    activityName: "618 抖音直播爆发",
    rechargeMethod: "对公付款充值",
    hasRechargeGift: true,
    hasSalesRebate: false,
    isFundRechargeAccount: true,
    canApplyInvoice: true,
    businessOwner: "赵敏",
    financeOwner: "林一",
    status: "已启用",
    dataRecovered: true,
    accountCleared: true,
    changed: false,
    syncStatus: "同步成功",
    lastSyncAt: "2026-05-06 09:30:00",
    syncBatchNo: "SYNC-AD-2026050601",
    methodHistory: [
      {
        id: "mh-001",
        accountName: "抖音旗舰店-千川主账户",
        accountId: "QIANCHUAN-882019",
        deliveryMethod: "预充值",
        effectiveAt: "2026-01-01",
        endedAt: "-"
      }
    ]
  },
  {
    id: "ad-002",
    code: "TFZH-2026-002",
    companyPhone: "-",
    companyEmail: "jd-search@example.com",
    settlementEntity: "上海示例贸易有限公司",
    supplier: "京东广告",
    platform: "京准通",
    accountName: "京东旗舰店-搜索快车",
    accountId: "JZT-650201",
    deliveryMethod: "月结",
    methodEffectiveAt: "2026-03-15",
    activityName: "京东超级品牌日",
    rechargeMethod: "账期结算",
    hasRechargeGift: false,
    hasSalesRebate: true,
    isFundRechargeAccount: false,
    canApplyInvoice: true,
    businessOwner: "周宁",
    financeOwner: "林一",
    status: "待回收",
    dataRecovered: false,
    accountCleared: true,
    changed: true,
    syncStatus: "同步失败",
    lastSyncAt: "2026-05-05 18:45:00",
    syncBatchNo: "SYNC-AD-2026050504",
    failureReason: "外部平台配置规则校验超时 [504]",
    methodHistory: [
      {
        id: "mh-002",
        accountName: "京东旗舰店-搜索快车",
        accountId: "JZT-650201",
        deliveryMethod: "预充值",
        effectiveAt: "2026-01-10",
        endedAt: "2026-03-14"
      },
      {
        id: "mh-003",
        accountName: "京东旗舰店-搜索快车",
        accountId: "JZT-650201",
        deliveryMethod: "月结",
        effectiveAt: "2026-03-15",
        endedAt: "-"
      }
    ]
  },
  {
    id: "ad-003",
    code: "TFZH-2026-003",
    companyPhone: "13800010003",
    companyEmail: "tmall-service@example.com",
    settlementEntity: "杭州示例电子商务有限公司",
    supplier: "阿里妈妈",
    platform: "阿里妈妈",
    accountName: "天猫旗舰店-万相台",
    accountId: "WXT-118800",
    deliveryMethod: "预充值",
    methodEffectiveAt: "2026-02-01",
    activityName: "天猫会员日",
    rechargeMethod: "对公付款充值",
    hasRechargeGift: false,
    hasSalesRebate: false,
    isFundRechargeAccount: true,
    canApplyInvoice: true,
    businessOwner: "王婧",
    financeOwner: "顾可",
    status: "已注销",
    dataRecovered: true,
    accountCleared: true,
    changed: true,
    syncStatus: "同步成功",
    lastSyncAt: "2026-04-28 16:20:00",
    syncBatchNo: "SYNC-AD-2026042802",
    methodHistory: []
  }
];

const initialThirdAccounts: ThirdPartyAccount[] = [
  {
    id: "tp-001",
    code: "SFZH-2026-001",
    accountName: "天猫旗舰店保证金账户",
    accountNo: "TM-BAIL-9001",
    accountingEntity: "杭州示例电子商务有限公司",
    store: "天猫旗舰店",
    companyPhone: "13800020001",
    companyEmail: "tmall-bail@example.com",
    businessOwner: "王婧",
    financeOwner: "顾可",
    platform: "天猫",
    accountAttribute: "保证金账户",
    accountNature: "平台账户",
    status: "已启用",
    changed: false,
    needPaymentVerification: true,
    paymentAmount: 0.01,
    paymentStatus: "验证通过"
  },
  {
    id: "tp-002",
    code: "SFZH-2026-002",
    accountName: "京东 POP 资金账户",
    accountNo: "JD-FUND-7788",
    accountingEntity: "上海示例贸易有限公司",
    store: "京东旗舰店",
    companyPhone: "13800020002",
    companyEmail: "jd-fund@example.com",
    businessOwner: "周宁",
    financeOwner: "林一",
    platform: "京东",
    accountAttribute: "资金账户",
    accountNature: "平台账户",
    status: "付款验证中",
    changed: true,
    needPaymentVerification: true,
    paymentAmount: 0.01,
    paymentStatus: "待验证"
  },
  {
    id: "tp-003",
    code: "SFZH-2026-003",
    accountName: "小红书蒲公英账户",
    accountNo: "RED-PGY-3002",
    accountingEntity: "上海示例品牌管理有限公司",
    store: "小红书品牌店",
    companyPhone: "13800020003",
    companyEmail: "red-brand@example.com",
    businessOwner: "赵敏",
    financeOwner: "顾可",
    platform: "小红书",
    accountAttribute: "投放账户",
    accountNature: "第三方账户",
    status: "已关闭",
    changed: true,
    needPaymentVerification: false,
    paymentAmount: 0,
    paymentStatus: "无需验证",
    closeRemark: "达人投放策略调整，账户余额已处理。"
  }
];

const initialBudgetSubjects: BudgetSubject[] = [
  { id: "bs-001", organization: "品牌事业部", first: "品牌推广", second: "品牌广告", status: "启用" },
  { id: "bs-002", organization: "电商事业部", first: "渠道营销", second: "信息流投放", status: "启用" },
  { id: "bs-003", organization: "电商事业部", first: "渠道营销", second: "搜索推广", status: "启用" },
  { id: "bs-004", organization: "品牌事业部", first: "达人合作", second: "达人投放", status: "启用" },
  { id: "bs-005", organization: "直播运营部", first: "直播运营", second: "直播间建设", status: "启用" },
  { id: "bs-006", organization: "电商事业部", first: "平台费用", second: "平台服务费", status: "禁用" }
];

const emptyForm: FormState = {
  kind: "expense-create",
  requestType: "费用小类",
  expenseType: "推广费用",
  category: "信息流投放",
  subCategory: "",
  departments: "品牌营销部",
  budgetSubject: "渠道营销 / 信息流投放",
  managementSubject: "营销投放费",
  accountingSubject: "销售费用-广告宣传费",
  invoiceSubject: "广告服务费",
  allowNoInvoice: "否",
  status: "已启用",
  effectiveAt: today,
  activityName: "",
  activityType: "大促活动",
  firstBudgetSubject: "渠道营销",
  secondBudgetSubject: "信息流投放",
  reachStore: "是",
  store: "抖音旗舰店",
  channel: "抖音",
  businessUnit: "电商事业部",
  businessSource: "线上直营",
  reachCategory: "是",
  reachSku: "是",
  allowPersonalAdvance: "否",
  platform: "巨量引擎",
  accountName: "",
  accountId: "",
  supplier: "巨量引擎",
  settlementEntity: "上海示例贸易有限公司",
  deliveryMethod: "预充值",
  rechargeMethod: "对公付款充值",
  companyPhone: "",
  companyEmail: "",
  businessOwner: "赵敏",
  financeOwner: "林一",
  dataRecovered: "是",
  accountCleared: "是",
  needPaymentVerification: "是",
  accountNo: "",
  accountingEntity: "上海示例贸易有限公司",
  accountAttribute: "资金账户",
  accountNature: "平台账户",
  paymentAmount: "0.01",
  budgetApplicationType: "新增预算科目",
  subjectApplyType: "预算二级科目",
  organization: "电商事业部",
  firstSubject: "渠道营销",
  secondSubject: "",
  description: ""
};

export default function BaseDataPage() {
  const [view, setView] = useState<LedgerView>("expense");
  const [expenseTypes, setExpenseTypes] = useState(initialExpenseTypes);
  const [activities, setActivities] = useState(initialActivities);
  const [adAccounts, setAdAccounts] = useState(initialAdAccounts);
  const [thirdAccounts, setThirdAccounts] = useState(initialThirdAccounts);
  const [budgetSubjects, setBudgetSubjects] = useState(initialBudgetSubjects);
  const [applications, setApplications] = useState<BaseApplication[]>([]);
  const [filters, setFilters] = useState({
    keyword: "",
    status: "全部",
    category: "全部",
    channel: "全部",
    store: "全部",
    platform: "全部",
    organization: "全部"
  });
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<{ title: string; children: ReactNode } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentRows = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    if (view === "expense") {
      return expenseTypes.filter((item) => {
        const hitKeyword = [item.code, item.expenseType, item.category, item.subCategory, item.departments.join(",")]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
        return (
          hitKeyword &&
          (filters.status === "全部" || item.status === filters.status) &&
          (filters.category === "全部" || item.category === filters.category)
        );
      });
    }
    if (view === "activity") {
      return activities.filter((item) => {
        const hitKeyword = [item.activityName, item.code, item.subCategory, item.secondBudgetSubject]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
        return (
          hitKeyword &&
          (filters.status === "全部" || item.relationStatus === filters.status || item.activityStatus === filters.status) &&
          (filters.channel === "全部" || item.channel === filters.channel) &&
          (filters.store === "全部" || item.store === filters.store)
        );
      });
    }
    if (view === "ad") {
      return adAccounts.filter((item) => {
        const hitKeyword = [item.accountName, item.accountId, item.supplier, item.businessOwner]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
        return (
          hitKeyword &&
          (filters.status === "全部" || item.status === filters.status || item.syncStatus === filters.status) &&
          (filters.platform === "全部" || item.platform === filters.platform)
        );
      });
    }
    if (view === "third") {
      return thirdAccounts.filter((item) => {
        const hitKeyword = [item.accountName, item.accountNo, item.store, item.platform]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
        return (
          hitKeyword &&
          (filters.status === "全部" || item.status === filters.status || item.paymentStatus === filters.status) &&
          (filters.store === "全部" || item.store === filters.store) &&
          (filters.platform === "全部" || item.platform === filters.platform)
        );
      });
    }
    return budgetSubjects.filter((item) => {
      const hitKeyword = [item.first, item.second, item.organization].join(" ").toLowerCase().includes(keyword);
      return (
        hitKeyword &&
        (filters.status === "全部" || item.status === filters.status) &&
        (filters.organization === "全部" || item.organization === filters.organization)
      );
    });
  }, [adAccounts, activities, budgetSubjects, expenseTypes, filters, thirdAccounts, view]);

  const stats = [
    { label: "费用类型台账", value: expenseTypes.length, tone: "blue" },
    { label: "活动费用关系", value: activities.length, tone: "green" },
    { label: "投放账户", value: adAccounts.length, tone: "orange" },
    { label: "三方账户", value: thirdAccounts.length, tone: "slate" }
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
    setFilters({
      keyword: "",
      status: "全部",
      category: "全部",
      channel: "全部",
      store: "全部",
      platform: "全部",
      organization: "全部"
    });
    setPageError("");
    setLoading(true);
    window.setTimeout(() => setLoading(false), 450);
  }

  function openForm(kind: ApplicationKind, targetId?: string) {
    const next = { ...emptyForm, kind, targetId };
    if (targetId) {
      const expense = expenseTypes.find((item) => item.id === targetId);
      const activity = activities.find((item) => item.id === targetId);
      const ad = adAccounts.find((item) => item.id === targetId);
      const third = thirdAccounts.find((item) => item.id === targetId);
      const subject = budgetSubjects.find((item) => item.id === targetId);
      if (expense) {
        Object.assign(next, {
          expenseType: expense.expenseType,
          category: expense.category,
          subCategory: expense.subCategory,
          departments: expense.departments.join("、"),
          budgetSubject: expense.budgetSubject,
          managementSubject: expense.managementSubject,
          accountingSubject: expense.accountingSubject,
          invoiceSubject: expense.invoiceSubject,
          allowNoInvoice: expense.allowNoInvoice ? "是" : "否",
          status: expense.status,
          effectiveAt: expense.effectiveAt,
          description: expense.description
        });
      }
      if (activity) {
        Object.assign(next, {
          activityName: activity.activityName,
          activityType: activity.activityType,
          firstBudgetSubject: activity.firstBudgetSubject,
          secondBudgetSubject: activity.secondBudgetSubject,
          reachStore: activity.reachStore ? "是" : "否",
          store: activity.store === "-" ? "" : activity.store,
          channel: activity.channel,
          businessUnit: activity.businessUnit,
          businessSource: activity.businessSource,
          reachCategory: activity.reachCategory ? "是" : "否",
          reachSku: activity.reachSku ? "是" : "否",
          allowNoInvoice: activity.allowNoInvoice ? "是" : "否",
          allowPersonalAdvance: activity.allowPersonalAdvance ? "是" : "否",
          expenseType: activity.expenseType,
          category: activity.category,
          subCategory: activity.subCategory,
          accountingSubject: activity.accountingSubject,
          invoiceSubject: activity.invoiceSubject,
          status: activity.relationStatus,
          effectiveAt: activity.effectiveAt
        });
      }
      if (ad) {
        Object.assign(next, {
          platform: ad.platform,
          accountName: ad.accountName,
          accountId: ad.accountId,
          supplier: ad.supplier,
          settlementEntity: ad.settlementEntity,
          deliveryMethod: ad.deliveryMethod,
          rechargeMethod: ad.rechargeMethod,
          companyPhone: ad.companyPhone === "-" ? "" : ad.companyPhone,
          companyEmail: ad.companyEmail,
          activityName: ad.activityName,
          businessOwner: ad.businessOwner,
          financeOwner: ad.financeOwner,
          dataRecovered: ad.dataRecovered ? "是" : "否",
          accountCleared: ad.accountCleared ? "是" : "否",
          effectiveAt: ad.methodEffectiveAt
        });
      }
      if (third) {
        Object.assign(next, {
          platform: third.platform,
          accountName: third.accountName,
          accountNo: third.accountNo,
          accountingEntity: third.accountingEntity,
          store: third.store,
          companyPhone: third.companyPhone,
          companyEmail: third.companyEmail,
          businessOwner: third.businessOwner,
          financeOwner: third.financeOwner,
          accountAttribute: third.accountAttribute,
          accountNature: third.accountNature,
          needPaymentVerification: third.needPaymentVerification ? "是" : "否",
          paymentAmount: String(third.paymentAmount),
          description: third.closeRemark ?? ""
        });
      }
      if (subject) {
        Object.assign(next, {
          organization: subject.organization,
          firstSubject: subject.first,
          secondSubject: subject.second,
          budgetApplicationType: kind === "budget-disable" ? "预算科目禁用" : "新增预算科目"
        });
      }
    }
    if (kind === "budget-disable") {
      next.budgetApplicationType = "预算科目禁用";
    }
    setForm(next);
    setFormErrors({});
  }

  function saveDraft() {
    if (!form) return;
    const application = buildApplication(form, "草稿");
    setApplications((items) => [application, ...items]);
    showToast("已保存至草稿，可在最近申请中继续演示审批流。");
  }

  function submitApproval() {
    if (!form || !validateForm(form)) return;
    const application = buildApplication(form, "审批中");
    setApplications((items) => [application, ...items]);
    showToast("单据已提交，请等待模拟 OA 审批。");
  }

  function approveAndApply(event: FormEvent) {
    event.preventDefault();
    if (!form || !validateForm(form)) return;
    setSubmitting(true);
    window.setTimeout(() => {
      applyApprovedForm(form);
      const application = buildApplication(form, "审批通过");
      setApplications((items) => [application, ...items]);
      setForm(null);
      setSubmitting(false);
      showToast("模拟审批通过，台账已实时更新。");
    }, 650);
  }

  function rejectForm() {
    if (!form || !validateForm(form)) return;
    const application = buildApplication(form, "已驳回");
    setApplications((items) => [application, ...items]);
    showToast("已模拟驳回，单据保留为可编辑状态。");
  }

  function validateForm(next: FormState) {
    const errors: Record<string, string> = {};
    if (next.kind.startsWith("expense")) {
      if (["费用类型", "费用大小类"].includes(next.requestType) && !next.expenseType.trim()) {
        errors.expenseType = "请填写费用类型";
      }
      if (["费用大类", "费用大小类"].includes(next.requestType) && !next.category.trim()) {
        errors.category = "请填写费用大类";
      }
      if (["费用小类", "费用大小类"].includes(next.requestType) && !next.subCategory.trim()) {
        errors.subCategory = "请填写费用小类";
      }
      if (!next.departments.trim()) errors.departments = "请选择使用部门";
      if (!next.accountingSubject.trim()) errors.accountingSubject = "请选择核算科目";
      if (!next.invoiceSubject.trim()) errors.invoiceSubject = "请选择发票科目";
    }
    if (next.kind.startsWith("activity")) {
      if (!next.activityName.trim()) errors.activityName = "请填写营销活动名称";
      if (!next.secondBudgetSubject.trim()) errors.secondBudgetSubject = "请选择预算科目";
      if (next.reachStore === "是" && !next.store.trim()) errors.store = "到店铺时店铺必填";
      if (!next.subCategory.trim()) errors.subCategory = "请选择费用小类";
    }
    if (next.kind.startsWith("ad")) {
      if (!next.accountName.trim()) errors.accountName = "请填写投放账户名称";
      if (!next.accountId.trim()) errors.accountId = "请填写投放账户 ID";
      if (!next.companyPhone.trim() && !next.companyEmail.trim()) {
        errors.companyPhone = "公司手机号或公司邮箱至少填写一项，可使用模拟 OA 生成";
      }
      if (next.kind === "ad-close" && next.dataRecovered === "否" && next.accountCleared === "否") {
        errors.dataRecovered = "注销至少需要完成数据回收或清账确认之一";
      }
    }
    if (next.kind.startsWith("third")) {
      if (!next.accountName.trim()) errors.accountName = "请填写账户名称";
      if (!next.accountNo.trim()) errors.accountNo = "请填写账号";
      if (next.needPaymentVerification === "是" && Number(next.paymentAmount) <= 0) {
        errors.paymentAmount = "付款验证金额必须大于 0";
      }
      if (next.kind === "third-close" && !next.description.trim()) {
        errors.description = "请填写关闭说明和余额处理说明";
      }
    }
    if (next.kind.startsWith("budget")) {
      if (!next.organization.trim()) errors.organization = "请选择预算组织";
      if (!next.firstSubject.trim()) errors.firstSubject = "请填写或选择一级预算科目";
      if (!next.secondSubject.trim()) errors.secondSubject = "请填写或选择二级预算科目";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function applyApprovedForm(next: FormState) {
    if (next.kind === "expense-create") {
      const item: ExpenseType = {
        id: `ex-${Date.now()}`,
        code: `FYLX-2026-${String(expenseTypes.length + 1).padStart(3, "0")}`,
        expenseType: next.expenseType,
        category: next.category,
        subCategory: next.subCategory || "-",
        departments: splitTags(next.departments),
        budgetSubject: next.budgetSubject,
        managementSubject: next.managementSubject,
        accountingSubject: next.accountingSubject,
        invoiceSubject: next.invoiceSubject,
        allowNoInvoice: next.allowNoInvoice === "是",
        status: next.status as ExpenseType["status"],
        effectiveAt: next.effectiveAt,
        updatedAt: today,
        description: next.description || "审批通过后由费用类型申请写入台账。"
      };
      setExpenseTypes((items) => [item, ...items]);
      setView("expense");
    }
    if (next.kind === "expense-change" && next.targetId) {
      setExpenseTypes((items) =>
        items.map((item) =>
          item.id === next.targetId
            ? {
                ...item,
                expenseType: next.expenseType,
                category: next.category,
                subCategory: next.subCategory,
                departments: splitTags(next.departments),
                budgetSubject: next.budgetSubject,
                managementSubject: next.managementSubject,
                accountingSubject: next.accountingSubject,
                invoiceSubject: next.invoiceSubject,
                allowNoInvoice: next.allowNoInvoice === "是",
                status: next.status as ExpenseType["status"],
                effectiveAt: next.effectiveAt,
                updatedAt: today,
                description: next.description || item.description
              }
            : item
        )
      );
      setView("expense");
    }
    if (next.kind === "activity-create") {
      const item: ActivityRelation = {
        id: `act-${Date.now()}`,
        code: `HDGX-2026-${String(activities.length + 1).padStart(3, "0")}`,
        activityName: next.activityName,
        activityType: next.activityType,
        firstBudgetSubject: next.firstBudgetSubject,
        secondBudgetSubject: next.secondBudgetSubject,
        reachStore: next.reachStore === "是",
        store: next.reachStore === "是" ? next.store : "-",
        channel: next.channel,
        businessUnit: next.businessUnit,
        businessSource: next.businessSource,
        reachCategory: next.reachCategory === "是",
        reachSku: next.reachSku === "是",
        allowPersonalAdvance: next.allowPersonalAdvance === "是",
        allowNoInvoice: next.allowNoInvoice === "是",
        expenseType: next.expenseType,
        category: next.category,
        subCategory: next.subCategory,
        accountingSubject: next.accountingSubject,
        invoiceSubject: next.invoiceSubject,
        activityStatus: "启用",
        relationStatus: "启用",
        effectiveAt: next.effectiveAt,
        changed: false
      };
      setActivities((items) => [item, ...items]);
      setView("activity");
    }
    if (next.kind === "activity-change" && next.targetId) {
      setActivities((items) =>
        items.map((item) =>
          item.id === next.targetId
            ? {
                ...item,
                secondBudgetSubject: next.secondBudgetSubject,
                reachStore: next.reachStore === "是",
                store: next.reachStore === "是" ? next.store : "-",
                channel: next.channel,
                businessUnit: next.businessUnit,
                businessSource: next.businessSource,
                reachCategory: next.reachCategory === "是",
                reachSku: next.reachSku === "是",
                allowPersonalAdvance: next.allowPersonalAdvance === "是",
                allowNoInvoice: next.allowNoInvoice === "是",
                expenseType: next.expenseType,
                category: next.category,
                subCategory: next.subCategory,
                accountingSubject: next.accountingSubject,
                invoiceSubject: next.invoiceSubject,
                relationStatus: next.status as ActivityRelation["relationStatus"],
                effectiveAt: next.effectiveAt,
                changed: true
              }
            : item
        )
      );
      setView("activity");
    }
    if (next.kind === "ad-create") {
      const item: AdAccount = {
        id: `ad-${Date.now()}`,
        code: `TFZH-2026-${String(adAccounts.length + 1).padStart(3, "0")}`,
        companyPhone: next.companyPhone || "-",
        companyEmail: next.companyEmail || `${next.accountId.toLowerCase()}@example.com`,
        settlementEntity: next.settlementEntity,
        supplier: next.supplier,
        platform: next.platform,
        accountName: next.accountName,
        accountId: next.accountId,
        deliveryMethod: next.deliveryMethod,
        methodEffectiveAt: today,
        activityName: next.activityName || "未关联活动",
        rechargeMethod: next.rechargeMethod,
        hasRechargeGift: false,
        hasSalesRebate: false,
        isFundRechargeAccount: true,
        canApplyInvoice: true,
        businessOwner: next.businessOwner,
        financeOwner: next.financeOwner,
        status: "已启用",
        dataRecovered: false,
        accountCleared: false,
        changed: false,
        syncStatus: "同步成功",
        lastSyncAt: nowText,
        syncBatchNo: `SYNC-AD-${Date.now()}`,
        methodHistory: [
          {
            id: `mh-${Date.now()}`,
            accountName: next.accountName,
            accountId: next.accountId,
            deliveryMethod: next.deliveryMethod,
            effectiveAt: today,
            endedAt: "-"
          }
        ]
      };
      setAdAccounts((items) => [item, ...items]);
      setView("ad");
    }
    if ((next.kind === "ad-change" || next.kind === "ad-close") && next.targetId) {
      setAdAccounts((items) =>
        items.map((item) => {
          if (item.id !== next.targetId) return item;
          const closedStatus =
            next.kind === "ad-close"
              ? next.dataRecovered === "是" && next.accountCleared === "是"
                ? "已注销"
                : next.dataRecovered === "是"
                  ? "清账中"
                  : "待回收"
              : item.status;
          const methodChanged = next.deliveryMethod !== item.deliveryMethod;
          return {
            ...item,
            companyPhone: next.companyPhone || "-",
            companyEmail: next.companyEmail,
            settlementEntity: next.settlementEntity,
            supplier: next.supplier,
            platform: next.platform,
            accountName: next.accountName,
            accountId: next.accountId,
            deliveryMethod: next.deliveryMethod,
            methodEffectiveAt: next.effectiveAt,
            activityName: next.activityName || item.activityName,
            rechargeMethod: next.rechargeMethod,
            businessOwner: next.businessOwner,
            financeOwner: next.financeOwner,
            dataRecovered: next.dataRecovered === "是",
            accountCleared: next.accountCleared === "是",
            changed: true,
            status: closedStatus as AdAccount["status"],
            syncStatus: "同步成功",
            lastSyncAt: nowText,
            failureReason: undefined,
            methodHistory: methodChanged
              ? [
                  ...item.methodHistory.map((history) =>
                    history.endedAt === "-" ? { ...history, endedAt: today } : history
                  ),
                  {
                    id: `mh-${Date.now()}`,
                    accountName: next.accountName,
                    accountId: next.accountId,
                    deliveryMethod: next.deliveryMethod,
                    effectiveAt: next.effectiveAt,
                    endedAt: "-"
                  }
                ]
              : item.methodHistory
          };
        })
      );
      setView("ad");
    }
    if (next.kind === "third-create") {
      const needPay = next.needPaymentVerification === "是";
      const item: ThirdPartyAccount = {
        id: `tp-${Date.now()}`,
        code: `SFZH-2026-${String(thirdAccounts.length + 1).padStart(3, "0")}`,
        accountName: next.accountName,
        accountNo: next.accountNo,
        accountingEntity: next.accountingEntity,
        store: next.store,
        companyPhone: next.companyPhone || "13800029999",
        companyEmail: next.companyEmail || `${next.accountNo.toLowerCase()}@example.com`,
        businessOwner: next.businessOwner,
        financeOwner: next.financeOwner,
        platform: next.platform,
        accountAttribute: next.accountAttribute,
        accountNature: next.accountNature,
        status: "已启用",
        changed: false,
        needPaymentVerification: needPay,
        paymentAmount: Number(next.paymentAmount) || 0,
        paymentStatus: needPay ? "验证通过" : "无需验证"
      };
      setThirdAccounts((items) => [item, ...items]);
      setView("third");
    }
    if ((next.kind === "third-change" || next.kind === "third-close") && next.targetId) {
      setThirdAccounts((items) =>
        items.map((item) =>
          item.id === next.targetId
            ? {
                ...item,
                accountName: next.accountName,
                accountNo: next.accountNo,
                accountingEntity: next.accountingEntity,
                store: next.store,
                companyPhone: next.companyPhone,
                companyEmail: next.companyEmail,
                businessOwner: next.businessOwner,
                financeOwner: next.financeOwner,
                platform: next.platform,
                accountAttribute: next.accountAttribute,
                accountNature: next.accountNature,
                status: next.kind === "third-close" ? "已关闭" : "已启用",
                changed: true,
                needPaymentVerification: next.needPaymentVerification === "是",
                paymentAmount: Number(next.paymentAmount) || item.paymentAmount,
                paymentStatus: next.needPaymentVerification === "是" ? "验证通过" : "无需验证",
                closeRemark: next.kind === "third-close" ? next.description : item.closeRemark
              }
            : item
        )
      );
      setView("third");
    }
    if (next.kind === "budget-create") {
      const item: BudgetSubject = {
        id: `bs-${Date.now()}`,
        organization: next.organization,
        first: next.firstSubject,
        second: next.secondSubject,
        status: "启用"
      };
      setBudgetSubjects((items) => [item, ...items]);
      setView("budget");
    }
    if (next.kind === "budget-disable" && next.targetId) {
      setBudgetSubjects((items) =>
        items.map((item) => (item.id === next.targetId ? { ...item, status: "禁用" } : item))
      );
      setView("budget");
    }
  }

  function retrySync(id: string) {
    setAdAccounts((items) =>
      items.map((item) => (item.id === id ? { ...item, syncStatus: "同步中", failureReason: undefined } : item))
    );
    window.setTimeout(() => {
      setAdAccounts((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, syncStatus: "同步成功", lastSyncAt: nowText, syncBatchNo: `SYNC-AD-${Date.now()}` }
            : item
        )
      );
      showToast("已模拟通知 IT 配置规则，同步状态更新为成功。");
    }, 800);
  }

  function simulateOaContact() {
    if (!form) return;
    setForm({
      ...form,
      companyPhone: form.companyPhone || "13800018888",
      companyEmail: form.companyEmail || `${form.businessOwner || "owner"}@example.com`
    });
    showToast("已模拟 OA 申请手机号/邮箱并回填。");
  }

  function mockImportAdAccounts() {
    const item: AdAccount = {
      ...initialAdAccounts[0],
      id: `ad-import-${Date.now()}`,
      code: `TFZH-2026-${String(adAccounts.length + 1).padStart(3, "0")}`,
      accountName: "批量导入-腾讯广告账户",
      accountId: `TAD-${Date.now().toString().slice(-6)}`,
      platform: "腾讯广告",
      supplier: "腾讯广告",
      status: "审批中",
      syncStatus: "未同步",
      lastSyncAt: "-",
      syncBatchNo: "-"
    };
    setAdAccounts((items) => [item, ...items]);
    showToast("已使用内置 mock 数据追加一条投放账户记录。");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <DemoModuleNav active="base-data" title="基础数据" />

        <section className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-4 text-sm text-slate-500">基础数据 / 主数据维护</div>
          <header className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">基础数据模块</h1>
              <p className="mt-1 text-sm text-slate-500">
                费用类型、营销活动、投放账户、三方账户与预算科目的 mock 维护闭环。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openForm(primaryCreateKind(view))}>新增申请</Button>
              <Button variant="secondary" onClick={() => showToast("已模拟导出当前筛选台账，不生成真实文件。")}>
                导出模拟
              </Button>
            </div>
          </header>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                ["expense", "费用类型台账"],
                ["activity", "活动费用关系台账"],
                ["ad", "投放账户台账"],
                ["third", "三方账户台账"],
                ["budget", "预算科目字典"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    view === key ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    setView(key as LedgerView);
                    resetFilters();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <FilterBar
              view={view}
              filters={filters}
              setFilters={setFilters}
              onQuery={simulateQuery}
              onReset={resetFilters}
              onError={() => setPageError("模拟接口失败：主数据服务响应超时，请点击重试。")}
            />

            {pageError && (
              <div className="flex flex-col justify-between gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:flex-row md:items-center">
                <span>{pageError}</span>
                <button className="text-left font-medium text-red-700 underline" onClick={simulateQuery}>
                  重试加载
                </button>
              </div>
            )}

            {view === "ad" && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                <span>[来源：外部系统] 投放平台配置均为 mock，同步状态只在前端变更。</span>
                <Button size="sm" variant="secondary" onClick={mockImportAdAccounts}>
                  批量导入投放账户
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              {loading ? (
                <SkeletonTable />
              ) : currentRows.length === 0 ? (
                <EmptyState onReset={resetFilters} onCreate={() => openForm(primaryCreateKind(view))} />
              ) : (
                <LedgerTable
                  view={view}
                  rows={currentRows}
                  onDetail={(title, children) => setDetail({ title, children })}
                  onForm={openForm}
                  onRetrySync={retrySync}
                />
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
              <span>共 {currentRows.length} 条，当前第 1 / 1 页</span>
              <div className="flex gap-2">
                <button className="rounded border border-slate-200 px-3 py-1 text-slate-400">上一页</button>
                <button className="rounded border border-slate-200 px-3 py-1 text-slate-400">下一页</button>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">最近申请与审批流预览</h2>
              <span className="text-xs text-slate-400">申请人 {">"} 财务 BP {">"} 财务主管</span>
            </div>
            {applications.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                暂无申请记录。可从任一台账发起新增、变更或关闭申请。
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <Th>单据编号</Th>
                      <Th>单据名称</Th>
                      <Th>申请人</Th>
                      <Th>状态</Th>
                      <Th>摘要</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <Td>
                          <button
                            className="font-medium text-blue-600 hover:underline"
                            onClick={() =>
                              setDetail({
                                title: item.title,
                                children: <ApplicationDetail application={item} />
                              })
                            }
                          >
                            {item.code}
                          </button>
                        </Td>
                        <Td>{item.title}</Td>
                        <Td>{item.applicant}</Td>
                        <Td>
                          <StatusBadge status={item.status} />
                        </Td>
                        <Td>{item.summary}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>

      {detail && <Drawer title={detail.title} onClose={() => setDetail(null)}>{detail.children}</Drawer>}

      {form && (
        <FormModal
          form={form}
          errors={formErrors}
          submitting={submitting}
          expenseTypes={expenseTypes}
          budgetSubjects={budgetSubjects}
          onChange={(patch) => setForm((current) => (current ? { ...current, ...patch } : current))}
          onClose={() => setForm(null)}
          onSaveDraft={saveDraft}
          onSubmitApproval={submitApproval}
          onReject={rejectForm}
          onApprove={approveAndApply}
          onMockContact={simulateOaContact}
        />
      )}

      {toast && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{toast}</div>}
    </main>
  );
}

function FilterBar({
  view,
  filters,
  setFilters,
  onQuery,
  onReset,
  onError
}: {
  view: LedgerView;
  filters: {
    keyword: string;
    status: string;
    category: string;
    channel: string;
    store: string;
    platform: string;
    organization: string;
  };
  setFilters: (filters: {
    keyword: string;
    status: string;
    category: string;
    channel: string;
    store: string;
    platform: string;
    organization: string;
  }) => void;
  onQuery: () => void;
  onReset: () => void;
  onError: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <Field label={keywordLabel(view)} className="md:col-span-2">
        <Input
          value={filters.keyword}
          onChange={(value) => setFilters({ ...filters, keyword: value })}
          placeholder="输入关键字"
        />
      </Field>
      <Field label="状态">
        <Select
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          options={statusOptions(view)}
        />
      </Field>
      {view === "expense" && (
        <Field label="费用大类">
          <Select
            value={filters.category}
            onChange={(value) => setFilters({ ...filters, category: value })}
            options={["全部", "信息流投放", "达人合作", "直播运营", "平台服务", "样品寄送", "搜索推广"]}
          />
        </Field>
      )}
      {view === "activity" && (
        <>
          <Field label="渠道">
            <Select
              value={filters.channel}
              onChange={(value) => setFilters({ ...filters, channel: value })}
              options={["全部", "抖音", "小红书", "天猫", "京东"]}
            />
          </Field>
          <Field label="店铺">
            <Select
              value={filters.store}
              onChange={(value) => setFilters({ ...filters, store: value })}
              options={["全部", "抖音旗舰店", "天猫旗舰店", "京东旗舰店", "小红书品牌店", "-"]}
            />
          </Field>
        </>
      )}
      {(view === "ad" || view === "third") && (
        <Field label="平台">
          <Select
            value={filters.platform}
            onChange={(value) => setFilters({ ...filters, platform: value })}
            options={["全部", "巨量引擎", "京准通", "阿里妈妈", "腾讯广告", "天猫", "京东", "小红书"]}
          />
        </Field>
      )}
      {view === "budget" && (
        <Field label="预算组织">
          <Select
            value={filters.organization}
            onChange={(value) => setFilters({ ...filters, organization: value })}
            options={["全部", "品牌事业部", "电商事业部", "直播运营部"]}
          />
        </Field>
      )}
      <div className="flex items-end gap-2 md:col-span-2">
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

function LedgerTable({
  view,
  rows,
  onDetail,
  onForm,
  onRetrySync
}: {
  view: LedgerView;
  rows: Array<ExpenseType | ActivityRelation | AdAccount | ThirdPartyAccount | BudgetSubject>;
  onDetail: (title: string, children: ReactNode) => void;
  onForm: (kind: ApplicationKind, targetId?: string) => void;
  onRetrySync: (id: string) => void;
}) {
  if (view === "expense") {
    const expenseRows = rows as ExpenseType[];
    return (
      <table className="min-w-[1120px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <Th>费用编号</Th>
            <Th>费用类型</Th>
            <Th>费用大类</Th>
            <Th>费用小类</Th>
            <Th>使用部门</Th>
            <Th>核算科目</Th>
            <Th>发票科目</Th>
            <Th>状态</Th>
            <Th>更新时间</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenseRows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td>
                <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <ExpenseDetail item={item} />)}>
                  {item.code}
                </button>
              </Td>
              <Td>{item.expenseType}</Td>
              <Td>{item.category}</Td>
              <Td>{item.subCategory}</Td>
              <Td>{item.departments.join("、")}</Td>
              <Td>{item.accountingSubject}</Td>
              <Td>{item.invoiceSubject}</Td>
              <Td>
                <StatusBadge status={item.status} />
              </Td>
              <Td>{item.updatedAt}</Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item.code, <ExpenseDetail item={item} />)}>详情</button>
                  {item.status !== "已禁用" && <button onClick={() => onForm("expense-change", item.id)}>变更</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (view === "activity") {
    const activityRows = rows as ActivityRelation[];
    return (
      <table className="min-w-[1180px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <Th>活动名称</Th>
            <Th>类型</Th>
            <Th>渠道</Th>
            <Th>店铺</Th>
            <Th>预算科目</Th>
            <Th>费用小类</Th>
            <Th>核算科目</Th>
            <Th>活动状态</Th>
            <Th>关系状态</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {activityRows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td>
                <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <ActivityDetail item={item} />)}>
                  {item.activityName}
                </button>
              </Td>
              <Td>{item.activityType}</Td>
              <Td>{item.channel}</Td>
              <Td>{item.store}</Td>
              <Td>{item.firstBudgetSubject} / {item.secondBudgetSubject}</Td>
              <Td>{item.subCategory}</Td>
              <Td>{item.accountingSubject}</Td>
              <Td>
                <StatusBadge status={item.activityStatus} />
              </Td>
              <Td>
                <StatusBadge status={item.relationStatus} />
              </Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item.code, <ActivityDetail item={item} />)}>详情</button>
                  {item.activityStatus === "启用" && <button onClick={() => onForm("activity-change", item.id)}>关系变更</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (view === "ad") {
    const adRows = rows as AdAccount[];
    return (
      <table className="min-w-[1420px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <Th>投放账户名称</Th>
            <Th>投放平台</Th>
            <Th>投放账户 ID</Th>
            <Th>投放方式</Th>
            <Th>结算主体</Th>
            <Th>业务/财务对接人</Th>
            <Th>账户状态</Th>
            <Th>同步状态</Th>
            <Th>数据回收</Th>
            <Th>清账</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {adRows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td>
                <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <AdDetail item={item} onRetrySync={onRetrySync} />)}>
                  {item.accountName}
                </button>
              </Td>
              <Td>{item.platform}</Td>
              <Td>{item.accountId}</Td>
              <Td>{item.deliveryMethod} / {item.methodEffectiveAt}</Td>
              <Td>{item.settlementEntity}</Td>
              <Td>{item.businessOwner} / {item.financeOwner}</Td>
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
              <Td>{yesNo(item.dataRecovered)}</Td>
              <Td>{yesNo(item.accountCleared)}</Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item.code, <AdDetail item={item} onRetrySync={onRetrySync} />)}>详情</button>
                  {item.status !== "已注销" && <button onClick={() => onForm("ad-change", item.id)}>变更</button>}
                  {item.status !== "已注销" && <button onClick={() => onForm("ad-close", item.id)}>注销</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (view === "third") {
    const thirdRows = rows as ThirdPartyAccount[];
    return (
      <table className="min-w-[1220px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <Th>账户名称</Th>
            <Th>账号</Th>
            <Th>核算主体</Th>
            <Th>店铺</Th>
            <Th>公司手机号</Th>
            <Th>业务/财务对接人</Th>
            <Th>账户平台</Th>
            <Th>账户属性</Th>
            <Th>账户状态</Th>
            <Th>是否做过变更</Th>
            <Th>操作</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {thirdRows.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <Td>
                <button className="font-medium text-blue-600 hover:underline" onClick={() => onDetail(item.code, <ThirdDetail item={item} />)}>
                  {item.accountName}
                </button>
              </Td>
              <Td>{item.accountNo}</Td>
              <Td>{item.accountingEntity}</Td>
              <Td>{item.store}</Td>
              <Td>{item.companyPhone}</Td>
              <Td>{item.businessOwner} / {item.financeOwner}</Td>
              <Td>{item.platform}</Td>
              <Td>{item.accountAttribute}</Td>
              <Td>
                <StatusBadge status={item.status} />
              </Td>
              <Td>{yesNo(item.changed)}</Td>
              <Td>
                <InlineActions>
                  <button onClick={() => onDetail(item.code, <ThirdDetail item={item} />)}>详情</button>
                  {item.status !== "已关闭" && <button onClick={() => onForm("third-change", item.id)}>变更</button>}
                  {item.status !== "已关闭" && <button onClick={() => onForm("third-close", item.id)}>关闭</button>}
                </InlineActions>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const subjectRows = rows as BudgetSubject[];
  return (
    <table className="min-w-[880px] text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          <Th>预算组织</Th>
          <Th>一级预算科目</Th>
          <Th>二级预算科目</Th>
          <Th>状态</Th>
          <Th>操作</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {subjectRows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50">
            <Td>{item.organization}</Td>
            <Td>{item.first}</Td>
            <Td>{item.second}</Td>
            <Td>
              <StatusBadge status={item.status} />
            </Td>
            <Td>
              <InlineActions>
                <button onClick={() => onDetail(`${item.first} / ${item.second}`, <BudgetDetail item={item} />)}>详情</button>
                {item.status === "启用" && <button onClick={() => onForm("budget-disable", item.id)}>禁用申请</button>}
              </InlineActions>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FormModal({
  form,
  errors,
  submitting,
  expenseTypes,
  budgetSubjects,
  onChange,
  onClose,
  onSaveDraft,
  onSubmitApproval,
  onReject,
  onApprove,
  onMockContact
}: {
  form: FormState;
  errors: Record<string, string>;
  submitting: boolean;
  expenseTypes: ExpenseType[];
  budgetSubjects: BudgetSubject[];
  onChange: (patch: Partial<FormState>) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmitApproval: () => void;
  onReject: () => void;
  onApprove: (event: FormEvent) => void;
  onMockContact: () => void;
}) {
  const title = formTitle(form.kind);
  const activeSubjects = budgetSubjects.filter((item) => item.status === "启用");
  const selectedExpense = expenseTypes.find((item) => item.subCategory === form.subCategory);

  function chooseSubCategory(value: string) {
    const item = expenseTypes.find((expense) => expense.subCategory === value);
    if (item) {
      onChange({
        expenseType: item.expenseType,
        category: item.category,
        subCategory: item.subCategory,
        accountingSubject: item.accountingSubject,
        invoiceSubject: item.invoiceSubject,
        allowNoInvoice: item.allowNoInvoice ? "是" : "否"
      });
    } else {
      onChange({ subCategory: value });
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <form className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl" onSubmit={onApprove}>
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">所有审批、OA、付款验证与外部同步均为前端 mock。</p>
          </div>
          <button type="button" className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto bg-slate-50 p-5">
          <Section title="申请信息">
            <div className="grid gap-3 md:grid-cols-4">
              <ReadOnly label="申请日期" value={today} />
              <ReadOnly label="申请人" value="陈晨" />
              <ReadOnly label="申请人公司" value="上海示例贸易有限公司" />
              <ReadOnly label="申请人部门/岗位" value="品牌营销部 / 费用专员" />
            </div>
          </Section>

          {form.kind.startsWith("expense") && (
            <Section title={form.kind === "expense-change" ? "费用类型变更信息" : "费用类型申请明细区"}>
              {form.kind === "expense-create" && (
                <div className="mb-3 grid gap-3 md:grid-cols-3">
                  <Field label="选择申请费用类型" required>
                    <Select
                      value={form.requestType}
                      onChange={(requestType) => onChange({ requestType })}
                      options={["费用类型", "费用大类", "费用小类", "费用大小类"]}
                    />
                  </Field>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                {["费用类型", "费用大类", "费用小类", "费用大小类"].includes(form.requestType) && (
                  <Field label="费用类型" required error={errors.expenseType}>
                    <Input value={form.expenseType} onChange={(expenseType) => onChange({ expenseType })} />
                  </Field>
                )}
                {["费用大类", "费用小类", "费用大小类"].includes(form.requestType) && (
                  <Field label="费用大类" required error={errors.category}>
                    <Input value={form.category} onChange={(category) => onChange({ category })} />
                  </Field>
                )}
                {["费用小类", "费用大小类"].includes(form.requestType) && (
                  <Field label="费用小类" required error={errors.subCategory}>
                    <Input value={form.subCategory} onChange={(subCategory) => onChange({ subCategory })} />
                  </Field>
                )}
                <Field label="使用部门" required error={errors.departments}>
                  <Input value={form.departments} onChange={(departments) => onChange({ departments })} />
                </Field>
                <Field label="预算科目">
                  <Select
                    value={form.budgetSubject}
                    onChange={(budgetSubject) => onChange({ budgetSubject })}
                    options={activeSubjects.map((item) => `${item.first} / ${item.second}`)}
                  />
                </Field>
                <Field label="经分科目">
                  <Input value={form.managementSubject} onChange={(managementSubject) => onChange({ managementSubject })} />
                </Field>
                <Field label="核算科目" required error={errors.accountingSubject}>
                  <Input value={form.accountingSubject} onChange={(accountingSubject) => onChange({ accountingSubject })} />
                </Field>
                <Field label="发票科目" required error={errors.invoiceSubject}>
                  <Input value={form.invoiceSubject} onChange={(invoiceSubject) => onChange({ invoiceSubject })} />
                </Field>
                <Field label="是否允许无票报销">
                  <Select value={form.allowNoInvoice} onChange={(allowNoInvoice) => onChange({ allowNoInvoice })} options={["否", "是"]} />
                </Field>
                <Field label="状态">
                  <Select value={form.status} onChange={(status) => onChange({ status })} options={["已启用", "未生效", "已禁用"]} />
                </Field>
                <Field label="启用时间">
                  <Input value={form.effectiveAt} onChange={(effectiveAt) => onChange({ effectiveAt })} />
                </Field>
              </div>
            </Section>
          )}

          {form.kind.startsWith("activity") && (
            <Section title={form.kind === "activity-change" ? "营销活动关系变更" : "营销活动申请"}>
              {form.kind === "activity-change" && (
                <div className="mb-3 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                  已审批通过的营销活动不允许修改名称，本表单仅变更匹配关系和状态。
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="营销活动名称" required error={errors.activityName}>
                  <Input
                    value={form.activityName}
                    onChange={(activityName) => onChange({ activityName })}
                    disabled={form.kind === "activity-change"}
                    placeholder="例如 618 抖音直播爆发"
                  />
                </Field>
                <Field label="营销活动类型" required>
                  <Select value={form.activityType} onChange={(activityType) => onChange({ activityType })} options={["大促活动", "内容种草", "店铺活动", "直播活动"]} />
                </Field>
                <Field label="二级预算科目" required error={errors.secondBudgetSubject}>
                  <Select
                    value={form.secondBudgetSubject}
                    onChange={(secondBudgetSubject) => {
                      const item = activeSubjects.find((subject) => subject.second === secondBudgetSubject);
                      onChange({ secondBudgetSubject, firstBudgetSubject: item?.first ?? form.firstBudgetSubject });
                    }}
                    options={activeSubjects.map((item) => item.second)}
                  />
                </Field>
                <Field label="是否到店铺">
                  <Select value={form.reachStore} onChange={(reachStore) => onChange({ reachStore })} options={["是", "否"]} />
                </Field>
                <Field label="店铺" required={form.reachStore === "是"} error={errors.store}>
                  <Select
                    value={form.store}
                    onChange={(store) => {
                      const channel = store.includes("抖音") ? "抖音" : store.includes("天猫") ? "天猫" : store.includes("京东") ? "京东" : "小红书";
                      onChange({ store, channel });
                    }}
                    options={["抖音旗舰店", "天猫旗舰店", "京东旗舰店", "小红书品牌店"]}
                  />
                </Field>
                <ReadOnly label="渠道" value={form.channel || "选择店铺后带出"} />
                <Field label="业务单元">
                  <Select
                    value={form.businessUnit}
                    onChange={(businessUnit) =>
                      onChange({ businessUnit, businessSource: businessUnit.includes("品牌") ? "品牌传播" : "线上直营" })
                    }
                    options={["电商事业部", "品牌事业部", "直播运营部"]}
                  />
                </Field>
                <ReadOnly label="业务来源" value={form.businessSource} />
                <Field label="能否到品类">
                  <Select value={form.reachCategory} onChange={(reachCategory) => onChange({ reachCategory, reachSku: reachCategory === "否" ? "否" : form.reachSku })} options={["是", "否"]} />
                </Field>
                <Field label="能否到 SKU">
                  <Select value={form.reachSku} onChange={(reachSku) => onChange({ reachSku })} options={["是", "否"]} />
                </Field>
                <Field label="费用小类" required error={errors.subCategory}>
                  <Select value={form.subCategory} onChange={chooseSubCategory} options={expenseTypes.map((item) => item.subCategory)} />
                </Field>
                <ReadOnly label="费用大类" value={selectedExpense?.category ?? form.category} />
                <ReadOnly label="核算科目" value={selectedExpense?.accountingSubject ?? form.accountingSubject} />
                <Field label="关系状态">
                  <Select value={form.status} onChange={(status) => onChange({ status })} options={["启用", "停用", "待生效"]} />
                </Field>
              </div>
            </Section>
          )}

          {form.kind.startsWith("ad") && (
            <Section title={form.kind === "ad-close" ? "投放账户注销确认" : "投放账户管理"}>
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                <span>缺公司手机号/邮箱时，可模拟 OA 申请并回填。</span>
                <Button type="button" size="sm" variant="secondary" onClick={onMockContact}>
                  模拟 OA 申请手机号/邮箱
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="投放账户名称" required error={errors.accountName}>
                  <Input value={form.accountName} onChange={(accountName) => onChange({ accountName })} />
                </Field>
                <Field label="投放账户 ID" required error={errors.accountId}>
                  <Input value={form.accountId} onChange={(accountId) => onChange({ accountId })} />
                </Field>
                <Field label="投放平台">
                  <Select value={form.platform} onChange={(platform) => onChange({ platform, supplier: platform })} options={["巨量引擎", "京准通", "阿里妈妈", "腾讯广告"]} />
                </Field>
                <Field label="公司手机号" error={errors.companyPhone}>
                  <Input value={form.companyPhone} onChange={(companyPhone) => onChange({ companyPhone })} />
                </Field>
                <Field label="公司邮箱">
                  <Input value={form.companyEmail} onChange={(companyEmail) => onChange({ companyEmail })} />
                </Field>
                <Field label="结算主体/核算主体">
                  <Input value={form.settlementEntity} onChange={(settlementEntity) => onChange({ settlementEntity })} />
                </Field>
                <Field label="投放方式">
                  <Select value={form.deliveryMethod} onChange={(deliveryMethod) => onChange({ deliveryMethod })} options={["预充值", "月结", "代理垫付"]} />
                </Field>
                <Field label="投放方式生效时间">
                  <Input value={form.effectiveAt} onChange={(effectiveAt) => onChange({ effectiveAt })} />
                </Field>
                <Field label="关联营销活动">
                  <Input value={form.activityName} onChange={(activityName) => onChange({ activityName })} />
                </Field>
                <Field label="数据已全部回收" required={form.kind === "ad-close"} error={errors.dataRecovered}>
                  <Select value={form.dataRecovered} onChange={(dataRecovered) => onChange({ dataRecovered })} options={["是", "否"]} />
                </Field>
                <Field label="投放账户已清账" required={form.kind === "ad-close"}>
                  <Select value={form.accountCleared} onChange={(accountCleared) => onChange({ accountCleared })} options={["是", "否"]} />
                </Field>
              </div>
            </Section>
          )}

          {form.kind.startsWith("third") && (
            <Section title={form.kind === "third-close" ? "三方账户关闭" : "三方账户申请/变更"}>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="账户名称" required error={errors.accountName}>
                  <Input value={form.accountName} onChange={(accountName) => onChange({ accountName })} />
                </Field>
                <Field label="账号" required error={errors.accountNo}>
                  <Input value={form.accountNo} onChange={(accountNo) => onChange({ accountNo })} />
                </Field>
                <Field label="账户平台">
                  <Select value={form.platform} onChange={(platform) => onChange({ platform })} options={["天猫", "京东", "小红书", "抖音"]} />
                </Field>
                <Field label="核算主体">
                  <Input value={form.accountingEntity} onChange={(accountingEntity) => onChange({ accountingEntity })} />
                </Field>
                <Field label="店铺">
                  <Input value={form.store} onChange={(store) => onChange({ store })} />
                </Field>
                <Field label="账户属性">
                  <Select value={form.accountAttribute} onChange={(accountAttribute) => onChange({ accountAttribute })} options={["保证金账户", "资金账户", "投放账户"]} />
                </Field>
                <Field label="是否需要付款验证">
                  <Select value={form.needPaymentVerification} onChange={(needPaymentVerification) => onChange({ needPaymentVerification })} options={["是", "否"]} />
                </Field>
                <Field label="付款金额" required={form.needPaymentVerification === "是"} error={errors.paymentAmount}>
                  <Input value={form.paymentAmount} onChange={(paymentAmount) => onChange({ paymentAmount })} />
                </Field>
                <Field label="关闭说明" required={form.kind === "third-close"} error={errors.description} className="md:col-span-3">
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={form.description}
                    onChange={(event) => onChange({ description: event.target.value })}
                    placeholder="关闭时填写账户余额是否已处理、关闭材料说明"
                  />
                </Field>
              </div>
            </Section>
          )}

          {form.kind.startsWith("budget") && (
            <Section title="预算科目申请明细区">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="申请类型" required>
                  <Select value={form.budgetApplicationType} onChange={(budgetApplicationType) => onChange({ budgetApplicationType })} options={["新增预算科目", "预算科目禁用"]} />
                </Field>
                <Field label="选择申请/禁用预算科目类型">
                  <Select value={form.subjectApplyType} onChange={(subjectApplyType) => onChange({ subjectApplyType })} options={["预算二级科目", "预算一级科目&预算二级科目"]} />
                </Field>
                <Field label="预算组织" required error={errors.organization}>
                  <Select value={form.organization} onChange={(organization) => onChange({ organization })} options={["品牌事业部", "电商事业部", "直播运营部"]} />
                </Field>
                <Field label="一级预算科目" required error={errors.firstSubject}>
                  <Input value={form.firstSubject} onChange={(firstSubject) => onChange({ firstSubject })} />
                </Field>
                <Field label="二级预算科目" required error={errors.secondSubject}>
                  <Input value={form.secondSubject} onChange={(secondSubject) => onChange({ secondSubject })} />
                </Field>
                <Field label="预算科目申请说明" className="md:col-span-3">
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    value={form.description}
                    onChange={(event) => onChange({ description: event.target.value })}
                  />
                </Field>
              </div>
            </Section>
          )}

          <Section title="审批信息">
            <div className="grid gap-3 md:grid-cols-3">
              {["申请人提交", "财务 BP 审核", "财务主管审批"].map((node, index) => (
                <div key={node} className="rounded-md border border-slate-200 bg-white p-3">
                  <div className="text-sm font-medium">{index + 1}. {node}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {index === 0 ? "陈晨" : index === 1 ? "林一" : "顾可"} / {index === 0 ? today : "待处理"}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
          <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
          <Button type="button" variant="secondary" onClick={onSaveDraft}>保存草稿</Button>
          <Button type="button" variant="secondary" onClick={onSubmitApproval}>提交审批</Button>
          <Button type="button" variant="secondary" onClick={onReject}>模拟驳回</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "审批中..." : "模拟审批通过"}</Button>
        </div>
      </form>
    </div>
  );
}

function ExpenseDetail({ item }: { item: ExpenseType }) {
  return (
    <DetailGrid
      rows={[
        ["费用编号", item.code],
        ["费用类型", item.expenseType],
        ["费用大类", item.category],
        ["费用小类", item.subCategory],
        ["使用部门", item.departments.join("、")],
        ["预算科目", item.budgetSubject],
        ["经分科目", item.managementSubject],
        ["核算科目", item.accountingSubject],
        ["发票科目", item.invoiceSubject],
        ["是否允许无票报销", yesNo(item.allowNoInvoice)],
        ["状态", <StatusBadge key="status" status={item.status} />],
        ["启用时间", item.effectiveAt],
        ["业务说明", item.description]
      ]}
    />
  );
}

function ActivityDetail({ item }: { item: ActivityRelation }) {
  return (
    <DetailGrid
      rows={[
        ["活动编号", item.code],
        ["营销活动名称", item.activityName],
        ["营销活动类型", item.activityType],
        ["预算科目", `${item.firstBudgetSubject} / ${item.secondBudgetSubject}`],
        ["店铺/渠道", `${item.store} / ${item.channel}`],
        ["业务单元/来源", `${item.businessUnit} / ${item.businessSource}`],
        ["能否到品类/SKU", `${yesNo(item.reachCategory)} / ${yesNo(item.reachSku)}`],
        ["是否允许个人垫付", yesNo(item.allowPersonalAdvance)],
        ["是否允许无票报销", yesNo(item.allowNoInvoice)],
        ["费用类型", `${item.expenseType} / ${item.category} / ${item.subCategory}`],
        ["核算科目", item.accountingSubject],
        ["关系状态", <StatusBadge key="status" status={item.relationStatus} />]
      ]}
    />
  );
}

function AdDetail({ item, onRetrySync }: { item: AdAccount; onRetrySync: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {item.syncStatus === "同步失败" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          同步失败：{item.failureReason}
          <button className="ml-2 font-medium text-blue-600 underline" onClick={() => onRetrySync(item.id)}>
            模拟重试同步
          </button>
        </div>
      )}
      <DetailGrid
        rows={[
          ["投放账户编号", item.code],
          ["投放账户名称", item.accountName],
          ["投放平台", item.platform],
          ["投放账户 ID", item.accountId],
          ["结算主体", item.settlementEntity],
          ["公司手机号/邮箱", `${item.companyPhone} / ${item.companyEmail}`],
          ["投放方式", `${item.deliveryMethod} / ${item.methodEffectiveAt}`],
          ["营销活动", item.activityName],
          ["充值方式", item.rechargeMethod],
          ["业务/财务对接人", `${item.businessOwner} / ${item.financeOwner}`],
          ["账户状态", <StatusBadge key="status" status={item.status} />],
          ["同步状态", <StatusBadge key="sync" status={item.syncStatus} />],
          ["最近同步", `${item.lastSyncAt} / ${item.syncBatchNo}`]
        ]}
      />
      <div>
        <h3 className="mb-2 font-semibold">投放方式变更台账</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>投放账户</Th>
              <Th>投放账户 ID</Th>
              <Th>投放方式</Th>
              <Th>生效时间</Th>
              <Th>结束时间</Th>
            </tr>
          </thead>
          <tbody>
            {item.methodHistory.map((history) => (
              <tr key={history.id} className="border-t border-slate-100">
                <Td>{history.accountName}</Td>
                <Td>{history.accountId}</Td>
                <Td>{history.deliveryMethod}</Td>
                <Td>{history.effectiveAt}</Td>
                <Td>{history.endedAt}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThirdDetail({ item }: { item: ThirdPartyAccount }) {
  return (
    <DetailGrid
      rows={[
        ["账户编号", item.code],
        ["账户名称", item.accountName],
        ["账号", item.accountNo],
        ["核算主体", item.accountingEntity],
        ["店铺", item.store],
        ["公司手机号/邮箱", `${item.companyPhone} / ${item.companyEmail}`],
        ["业务/财务对接人", `${item.businessOwner} / ${item.financeOwner}`],
        ["账户平台", item.platform],
        ["账户属性/性质", `${item.accountAttribute} / ${item.accountNature}`],
        ["账户状态", <StatusBadge key="status" status={item.status} />],
        ["付款验证", `${item.paymentStatus} / ${formatMoney(item.paymentAmount)}`],
        ["关闭说明", item.closeRemark ?? "-"]
      ]}
    />
  );
}

function BudgetDetail({ item }: { item: BudgetSubject }) {
  return (
    <DetailGrid
      rows={[
        ["预算组织", item.organization],
        ["一级预算科目", item.first],
        ["二级预算科目", item.second],
        ["状态", <StatusBadge key="status" status={item.status} />],
        ["说明", "审批通过后会进入营销活动表单的预算科目下拉；禁用科目不可再被新单选择。"]
      ]}
    />
  );
}

function ApplicationDetail({ application }: { application: BaseApplication }) {
  return (
    <div className="space-y-4">
      <DetailGrid
        rows={[
          ["单据编号", application.code],
          ["单据名称", application.title],
          ["申请人", application.applicant],
          ["申请组织", `${application.company} / ${application.department} / ${application.position}`],
          ["申请日期", application.createdAt],
          ["状态", <StatusBadge key="status" status={application.status} />],
          ["摘要", application.summary]
        ]}
      />
      <div>
        <h3 className="mb-2 font-semibold">审批信息</h3>
        <div className="space-y-2">
          {application.steps.map((step, index) => (
            <div key={`${step.node}-${index}`} className="rounded-md border border-slate-200 p-3 text-sm">
              <div className="font-medium">{index + 1}. {step.node}</div>
              <div className="mt-1 text-slate-500">{step.approver} / {step.date} / {step.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="mt-1 text-sm font-medium text-slate-800">{value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/40">
      <aside className="h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md px-3 py-1 text-sm text-slate-600 hover:bg-slate-100" onClick={onClose}>
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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-slate-400 shadow-sm">--</div>
      <div className="font-medium text-slate-700">暂无匹配数据</div>
      <div className="mt-1 text-sm text-slate-500">可重置筛选，或直接发起一笔新的基础数据申请。</div>
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={onReset}>重置筛选</Button>
        <Button onClick={onCreate}>新建申请</Button>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((__, inner) => (
            <div key={inner} className="h-10 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </section>
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
    <div className="rounded-md bg-slate-50 px-3 py-2 text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  disabled
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
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

function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const normalized = options.includes(value) ? options : [value, ...options].filter(Boolean);
  return (
    <select
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {Array.from(new Set(normalized)).map((option) => (
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

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-56 truncate px-3 py-3 align-top" title={typeof children === "string" ? children : undefined}>{children || "-"}</td>;
}

function InlineActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2 text-sm text-blue-600 [&_button:hover]:underline">{children}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const className =
    ["已启用", "启用", "审批通过", "同步成功", "验证通过"].includes(status)
      ? "border-green-200 bg-green-50 text-green-600"
      : ["审批中", "同步中", "付款验证中"].includes(status)
        ? "border-blue-200 bg-blue-50 text-blue-600"
        : ["未生效", "待生效", "待回收", "清账中", "停用", "待验证"].includes(status)
          ? "border-orange-200 bg-orange-50 text-orange-600"
          : ["已驳回", "同步失败", "验证失败"].includes(status)
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-slate-200 bg-slate-100 text-slate-600";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}>{status}</span>;
}

function keywordLabel(view: LedgerView) {
  if (view === "expense") return "费用名称";
  if (view === "activity") return "活动名称";
  if (view === "ad") return "投放账户名称";
  if (view === "third") return "账户名称";
  return "预算科目";
}

function statusOptions(view: LedgerView) {
  if (view === "expense") return ["全部", "已启用", "未生效", "已禁用", "审批中"];
  if (view === "activity") return ["全部", "启用", "禁用", "停用", "待生效"];
  if (view === "ad") return ["全部", "已启用", "审批中", "待回收", "清账中", "已注销", "同步成功", "同步失败"];
  if (view === "third") return ["全部", "已启用", "审批中", "付款验证中", "已关闭", "验证通过", "待验证"];
  return ["全部", "启用", "禁用"];
}

function primaryCreateKind(view: LedgerView): ApplicationKind {
  if (view === "activity") return "activity-create";
  if (view === "ad") return "ad-create";
  if (view === "third") return "third-create";
  if (view === "budget") return "budget-create";
  return "expense-create";
}

function formTitle(kind: ApplicationKind) {
  const map: Record<ApplicationKind, string> = {
    "expense-create": "新增费用类型",
    "expense-change": "调整费用类型",
    "activity-create": "营销活动管理",
    "activity-change": "营销活动变更",
    "ad-create": "投放账户申请",
    "ad-change": "投放账户变更",
    "ad-close": "投放账户注销",
    "third-create": "三方账户申请",
    "third-change": "三方账户变更",
    "third-close": "三方账户关闭",
    "budget-create": "预算科目申请",
    "budget-disable": "预算科目禁用"
  };
  return map[kind];
}

function buildApplication(form: FormState, status: ApprovalStatus): BaseApplication {
  const codePrefix = form.kind.startsWith("expense")
    ? "FYLX-SQ"
    : form.kind.startsWith("activity")
      ? "HD-SQ"
      : form.kind.startsWith("ad")
        ? "TFZH-SQ"
        : form.kind.startsWith("third")
          ? "SFZH-SQ"
          : "YSKM-SQ";
  return {
    id: `app-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    code: `${codePrefix}-${Date.now().toString().slice(-8)}`,
    kind: form.kind,
    title: formTitle(form.kind),
    applicant: "陈晨",
    company: "上海示例贸易有限公司",
    department: "品牌营销部",
    position: "费用专员",
    createdAt: today,
    status,
    summary: applicationSummary(form),
    steps: [
      { node: "申请人提交", approver: "陈晨", date: today, comment: status === "草稿" ? "保存草稿" : "提交申请" },
      {
        node: "财务 BP 审核",
        approver: "林一",
        date: status === "草稿" ? "-" : today,
        comment: status === "已驳回" ? "信息需补充" : status === "审批通过" ? "审核通过" : "待处理"
      },
      {
        node: "财务主管审批",
        approver: "顾可",
        date: status === "审批通过" ? today : "-",
        comment: status === "审批通过" ? "同意并更新台账" : "待处理"
      }
    ]
  };
}

function applicationSummary(form: FormState) {
  if (form.kind.startsWith("expense")) return `${form.expenseType} / ${form.category} / ${form.subCategory || "-"}`;
  if (form.kind.startsWith("activity")) return `${form.activityName || "新营销活动"} / ${form.secondBudgetSubject}`;
  if (form.kind.startsWith("ad")) return `${form.platform} / ${form.accountName || "新投放账户"}`;
  if (form.kind.startsWith("third")) return `${form.platform} / ${form.accountName || "新三方账户"}`;
  return `${form.organization} / ${form.firstSubject} / ${form.secondSubject}`;
}

function splitTags(value: string) {
  return value
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function yesNo(value: boolean) {
  return value ? "是" : "否";
}

function formatMoney(value: number) {
  return `CNY ${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
