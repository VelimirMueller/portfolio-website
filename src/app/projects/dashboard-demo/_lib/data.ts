// Fixed sample data of the CRM demo. Nothing here is fetched; the demo is static.
import {
  TrendingUp,
  CheckCircle2,
  Mail,
  ArrowUpRight,
  Zap,
  DollarSign,
  Target,
  UserCheck,
  Activity,
  Calendar,
} from 'lucide-react';

export const KPI_DATA = [
  { label: 'MRR', value: 127400, prefix: '$', suffix: '', trend: +14.2, trendLabel: 'vs last month', icon: DollarSign, color: 'blue', sparkline: [62, 68, 65, 74, 78, 82, 85, 91, 95, 102, 115, 127] },
  { label: 'Active Pipeline', value: 2400000, prefix: '$', suffix: '', trend: +23.1, trendLabel: 'vs last quarter', icon: Target, color: 'purple', sparkline: [1.2, 1.4, 1.1, 1.6, 1.8, 1.7, 2.0, 1.9, 2.1, 2.2, 2.3, 2.4] },
  { label: 'Win Rate', value: 68, prefix: '', suffix: '%', trend: +5.3, trendLabel: 'pp vs last quarter', icon: UserCheck, color: 'green', sparkline: [52, 55, 58, 56, 60, 59, 62, 63, 61, 65, 66, 68] },
  { label: 'CAC', value: 1240, prefix: '$', suffix: '', trend: -18.4, trendLabel: 'vs last quarter', icon: Activity, color: 'emerald', sparkline: [1800, 1720, 1650, 1580, 1520, 1490, 1440, 1400, 1360, 1320, 1280, 1240] },
];

export const MRR_DATA = [
  { month: 'Mar', value: 62000 }, { month: 'Apr', value: 68000 }, { month: 'May', value: 72000 },
  { month: 'Jun', value: 74000 }, { month: 'Jul', value: 81000 }, { month: 'Aug', value: 85000 },
  { month: 'Sep', value: 91000 }, { month: 'Oct', value: 98000 }, { month: 'Nov', value: 105000 },
  { month: 'Dec', value: 112000 }, { month: 'Jan', value: 119000 }, { month: 'Feb', value: 127400 },
];

export const ACTIVITIES = [
  { action: 'Deal closed', detail: 'Acme Corp — $84,000 ARR', time: '2 min ago', icon: CheckCircle2, color: 'text-green-400' },
  { action: 'New lead assigned', detail: 'DataFlow Inc → Sarah K.', time: '8 min ago', icon: UserCheck, color: 'text-blue-400' },
  { action: 'Meeting booked', detail: 'CloudNine — Discovery call', time: '14 min ago', icon: Calendar, color: 'text-purple-400' },
  { action: 'Proposal sent', detail: 'Vertex AI — $120K deal', time: '31 min ago', icon: Mail, color: 'text-orange-400' },
  { action: 'Pipeline moved', detail: 'NovaTech → Negotiation', time: '1h ago', icon: ArrowUpRight, color: 'text-indigo-400' },
  { action: 'New signup', detail: 'StartupXYZ — Trial started', time: '2h ago', icon: Zap, color: 'text-yellow-400' },
];

export const TOP_DEALS = [
  { company: 'Vertex AI', contact: 'Marcus Chen', value: 120000, stage: 'Proposal', probability: 72, close: 'Feb 28', color: 'orange' as const },
  { company: 'Acme Corp', contact: 'Sarah Kim', value: 84000, stage: 'Negotiation', probability: 88, close: 'Feb 14', color: 'purple' as const },
  { company: 'CloudNine', contact: 'David Park', value: 96000, stage: 'Demo', probability: 45, close: 'Mar 15', color: 'blue' as const },
  { company: 'DataFlow', contact: 'Emma Wilson', value: 67000, stage: 'Qualified', probability: 35, close: 'Mar 30', color: 'green' as const },
  { company: 'NovaTech', contact: 'James Liu', value: 150000, stage: 'Negotiation', probability: 65, close: 'Feb 21', color: 'purple' as const },
];

export const TODAY_ACTIONS = [
  { text: 'Follow up on Vertex AI proposal', priority: 'high', overdue: true },
  { text: 'Discovery call with CloudNine (2pm)', priority: 'high', overdue: false },
  { text: 'Send NovaTech revised pricing', priority: 'medium', overdue: false },
  { text: 'Quarterly pipeline review prep', priority: 'medium', overdue: false },
  { text: 'Update CRM notes for DataFlow', priority: 'low', overdue: false },
];

export const PIPELINE_STAGES = [
  { name: 'New Leads', count: 12, value: 340000, color: 'from-blue-500 to-blue-600', pct: 100 },
  { name: 'Qualified', count: 8, value: 520000, color: 'from-cyan-500 to-cyan-600', pct: 67 },
  { name: 'Demo', count: 7, value: 480000, color: 'from-purple-500 to-purple-600', pct: 58 },
  { name: 'Proposal', count: 5, value: 390000, color: 'from-orange-500 to-orange-600', pct: 42 },
  { name: 'Negotiation', count: 4, value: 670000, color: 'from-pink-500 to-pink-600', pct: 33 },
];

export const PIPELINE_DEALS = [
  { company: 'Vertex AI', contact: 'Marcus Chen', value: 120000, stage: 'Proposal', owner: 'SK', probability: 72, close: 'Feb 28', color: 'orange' as const },
  { company: 'NovaTech', contact: 'James Liu', value: 150000, stage: 'Negotiation', owner: 'VM', probability: 65, close: 'Feb 21', color: 'purple' as const },
  { company: 'CloudNine', contact: 'David Park', value: 96000, stage: 'Demo', owner: 'AJ', probability: 45, close: 'Mar 15', color: 'blue' as const },
  { company: 'DataFlow', contact: 'Emma Wilson', value: 67000, stage: 'Qualified', owner: 'SK', probability: 35, close: 'Mar 30', color: 'green' as const },
  { company: 'Acme Corp', contact: 'Sarah Kim', value: 84000, stage: 'Negotiation', owner: 'VM', probability: 88, close: 'Feb 14', color: 'purple' as const },
  { company: 'Quantum Labs', contact: 'Priya Patel', value: 210000, stage: 'Demo', owner: 'AJ', probability: 30, close: 'Apr 10', color: 'blue' as const },
  { company: 'ScaleUp Inc', contact: 'Tom Harris', value: 45000, stage: 'Qualified', owner: 'SK', probability: 50, close: 'Mar 20', color: 'green' as const },
  { company: 'ByteStream', contact: 'Lena Sørensen', value: 78000, stage: 'Proposal', owner: 'VM', probability: 60, close: 'Mar 5', color: 'orange' as const },
];

export const WORKFLOWS = [
  {
    name: 'Enterprise Outreach Sequence',
    description: 'Automated 14-day outreach for enterprise leads',
    status: 'active' as const,
    enrolled: 234,
    completed: 189,
    conversion: 18.4,
    steps: [
      { type: 'email', label: 'Intro Email' },
      { type: 'wait', label: '3 days' },
      { type: 'email', label: 'Value Prop' },
      { type: 'wait', label: '2 days' },
      { type: 'call', label: 'Follow-up' },
    ],
  },
  {
    name: 'Demo Follow-up',
    description: 'Post-demo nurture sequence with proposal',
    status: 'active' as const,
    enrolled: 87,
    completed: 64,
    conversion: 31.2,
    steps: [
      { type: 'email', label: 'Thank You' },
      { type: 'wait', label: '1 day' },
      { type: 'email', label: 'Resources' },
      { type: 'wait', label: '3 days' },
      { type: 'email', label: 'Proposal' },
    ],
  },
  {
    name: 'Win-Back Campaign',
    description: 'Re-engage churned accounts with new offers',
    status: 'paused' as const,
    enrolled: 156,
    completed: 98,
    conversion: 8.7,
    steps: [
      { type: 'email', label: 'We Miss You' },
      { type: 'wait', label: '5 days' },
      { type: 'email', label: 'New Features' },
      { type: 'wait', label: '7 days' },
      { type: 'call', label: 'Personal' },
    ],
  },
];

export const CRM_NOTIFICATIONS = [
  { text: 'Deal closed: Acme Corp — $84K ARR', time: '2m ago', icon: CheckCircle2, color: 'text-green-400', read: false },
  { text: 'New lead assigned: DataFlow Inc', time: '8m ago', icon: UserCheck, color: 'text-blue-400', read: false },
  { text: 'Meeting in 15 min: CloudNine discovery', time: '12m ago', icon: Calendar, color: 'text-purple-400', read: false },
  { text: 'Proposal viewed by Vertex AI', time: '1h ago', icon: ArrowUpRight, color: 'text-orange-400', read: true },
  { text: 'Weekly pipeline report ready', time: '3h ago', icon: Activity, color: 'text-gray-400', read: true },
];

export const ANALYTICS_KPIS = [
  { label: 'ARR', value: 1530000, prefix: '$', suffix: '', trend: +32.4, icon: DollarSign, color: 'blue' },
  { label: 'Net Revenue Retention', value: 118, prefix: '', suffix: '%', trend: +6.2, icon: TrendingUp, color: 'green' },
  { label: 'LTV', value: 18400, prefix: '$', suffix: '', trend: +12.8, icon: Target, color: 'purple' },
  { label: 'Churn Rate', value: 1.8, prefix: '', suffix: '%', trend: -0.4, icon: Activity, color: 'emerald' },
];

export const COHORT_DATA = [
  { cohort: 'Oct 2025', months: [100, 94, 88, 85, 82, 80] },
  { cohort: 'Nov 2025', months: [100, 92, 86, 83, 81, null] },
  { cohort: 'Dec 2025', months: [100, 96, 91, 88, null, null] },
  { cohort: 'Jan 2026', months: [100, 95, 90, null, null, null] },
];
