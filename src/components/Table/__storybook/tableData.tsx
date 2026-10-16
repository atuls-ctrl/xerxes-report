// Sample report data for the Table stories. Numbers mirror the Figma frames.
import {
  TableRowLabel,
  TableTag,
  TableValue,
  type TableColumnsType,
  type TableColumnType,
  type TableRowStatus,
  type TableTotalRow,
  type TableValueFormat,
} from '..'

// ---- Campaign › App bundle › Publisher -------------------------------------
export interface CampaignRow {
  key: string
  title: string
  meta?: string
  status?: TableRowStatus
  impressions: number
  grossClicks: number
  rejectedClicks: number
  clicks: number
  approvedConv: number
  sampledConv: number
  grossConv: number
  approvedCr: number
  grossCr: number
  payout: number
  revenue: number
  grossRevenue: number
  pl: number
  registration: number | null
  signUp: number | null
  kycDone: number | null
  tutorialComplete: number | null
  regComplete: number | null
  signupDone: number | null
  children?: CampaignRow[]
}

type Counts = [
  impressions: number,
  grossClicks: number,
  rejectedClicks: number,
  clicks: number,
  approvedConv: number,
  sampledConv: number,
  grossConv: number,
  approvedCr: number,
  grossCr: number,
]

const NO_EVENTS = {
  registration: null,
  signUp: null,
  kycDone: null,
  tutorialComplete: null,
  regComplete: null,
  signupDone: null,
}

function row(
  key: string,
  label: Pick<CampaignRow, 'title' | 'meta' | 'status'>,
  counts: Counts,
  extra: Partial<CampaignRow> = {},
): CampaignRow {
  const [
    impressions,
    grossClicks,
    rejectedClicks,
    clicks,
    approvedConv,
    sampledConv,
    grossConv,
    approvedCr,
    grossCr,
  ] = counts
  const payout = Math.round(approvedConv * 45) / 100
  return {
    key,
    ...label,
    impressions,
    grossClicks,
    rejectedClicks,
    clicks,
    approvedConv,
    sampledConv,
    grossConv,
    approvedCr,
    grossCr,
    payout,
    revenue: payout * 2,
    grossRevenue: Math.round(payout * 2 * 104.8) / 100,
    pl: 38.2,
    ...NO_EVENTS,
    ...extra,
  }
}

const publishers = (prefix: string, items: [string, string, Counts][]) =>
  items.map(([title, meta, counts]) =>
    row(`${prefix}-${title}`, { title, meta }, counts),
  )

export const CAMPAIGNS: CampaignRow[] = [
  row(
    '26389',
    { title: '26389', meta: 'Wink · OEM Icon', status: 'active' },
    [62479, 14715, 2066, 12649, 376, 14, 408, 3.1, 3.2],
    {
      registration: 108,
      children: [
        row(
          '26389-bundle',
          { title: 'ru.rt.video.app.mobile' },
          [62479, 14715, 2066, 12649, 376, 14, 408, 3.1, 3.2],
          {
            children: publishers('26389', [
              ['3439', 'P2P', [29522, 6830, 957, 5873, 220, 10, 242, 3.9, 4.1]],
              ['6455', 'T1', [12738, 3004, 377, 2627, 70, 4, 80, 2.8, 3.0]],
              ['2802', 'T2', [7091, 1724, 183, 1541, 35, 0, 35, 2.3, 2.3]],
              ['5518', 'T3', [5725, 1329, 242, 1087, 16, 0, 16, 1.5, 1.5]],
              ['6528', 'T2', [4776, 1215, 208, 1007, 21, 0, 21, 2.1, 2.1]],
              ['6428', 'T2', [2627, 613, 99, 514, 14, 0, 14, 2.7, 2.7]],
            ]),
          },
        ),
      ],
    },
  ),
  row(
    '52011',
    { title: '52011', meta: 'Bank · Card', status: 'active' },
    [56322, 13282, 1621, 11661, 312, 11, 339, 2.8, 2.9],
    {
      kycDone: 42,
      children: [
        row(
          '52011-bundle',
          { title: 'com.bank.card' },
          [56322, 13282, 1621, 11661, 312, 11, 339, 2.8, 2.9],
          {
            children: publishers('52011', [
              ['3439', 'P2P', [31020, 7310, 902, 6408, 180, 6, 190, 2.9, 3.0]],
              ['6455', 'T1', [25302, 5972, 719, 5253, 132, 5, 149, 2.6, 2.8]],
            ]),
          },
        ),
      ],
    },
  ),
  row(
    '31023',
    { title: '31023', meta: 'C2C · Prog Android', status: 'active' },
    [54180, 12957, 2484, 10473, 272, 7, 295, 2.7, 2.8],
    { registration: 61, children: [] },
  ),
  row(
    '41007',
    { title: '41007', meta: 'Food · First Order', status: 'active' },
    [52965, 12503, 1167, 11336, 331, 14, 359, 3.0, 3.2],
    { signUp: 61, children: [] },
  ),
  row(
    '41121',
    { title: '41121', meta: 'Shop Sale · CPA', status: 'active' },
    [49432, 11852, 2261, 9591, 257, 7, 272, 2.8, 2.8],
    { tutorialComplete: 46, children: [] },
  ),
  row(
    '26390',
    { title: '26390', meta: 'Wink · Push Retarget', status: 'paused' },
    [39846, 9423, 2037, 7386, 219, 4, 227, 3.0, 3.1],
    { regComplete: 35, children: [] },
  ),
  row(
    '41120',
    { title: '41120', meta: 'Shop Sale · CPI', status: 'active' },
    [32653, 7787, 1367, 6420, 189, 0, 189, 2.9, 2.9],
    { signupDone: 10, children: [] },
  ),
  row(
    '52012',
    { title: '52012', meta: 'Puzzle · CPI', status: 'active' },
    [32365, 7553, 1026, 6527, 147, 0, 149, 2.3, 2.3],
    { registration: 147, children: [] },
  ),
  row(
    '41122',
    { title: '41122', meta: 'Shop Sale · CPS', status: 'stopped' },
    [13181, 3041, 712, 2329, 62, 1, 73, 2.0, 2.4],
    { children: [] },
  ),
]

export const CAMPAIGN_TOTALS: TableTotalRow<CampaignRow> = {
  caption: '· 9 campaign rows',
  record: {
    impressions: 393423,
    grossClicks: 93113,
    rejectedClicks: 14741,
    clicks: 78372,
    approvedConv: 2165,
    sampledConv: 58,
    grossConv: 2302,
    approvedCr: 2.8,
    grossCr: 2.9,
    payout: 1269,
    revenue: 2538,
    grossRevenue: 2609,
    pl: 38.2,
    registration: 316,
    signUp: 61,
    kycDone: 42,
    tutorialComplete: 46,
    regComplete: 35,
    signupDone: 10,
  },
}

/** A sortable, right-aligned report column. */
export function metricColumn<RecordType extends object>(
  key: keyof RecordType & string,
  title: string,
  format: TableValueFormat = 'number',
  extra: Partial<TableColumnType<RecordType>> = {},
): TableColumnType<RecordType> {
  return {
    key,
    title,
    dataIndex: key,
    align: 'right',
    sorter: (a, b) => Number(a[key] ?? 0) - Number(b[key] ?? 0),
    sortDirections: ['descend', 'ascend'],
    render: (value: number | null) => (
      <TableValue value={value} format={format} />
    ),
    ...extra,
  }
}

/**
 * Money column. Totals (rendered with index -1) and amounts from $1,000 drop
 * the cents, as in Figma ("$1,269", "$1,688" vs "$169.20").
 */
export function moneyColumn<RecordType extends object>(
  key: keyof RecordType & string,
  title: string,
): TableColumnType<RecordType> {
  return metricColumn(key, title, 'money', {
    render: (value: number | null, _record, index) => (
      <TableValue
        value={value}
        format="money"
        decimals={index < 0 || Math.abs(value ?? 0) >= 1000 ? 0 : 2}
      />
    ),
  })
}

export const CAMPAIGN_LABEL_COLUMN: TableColumnType<CampaignRow> = {
  key: 'label',
  title: 'Campaign › App bundle › Publisher',
  dataIndex: 'title',
  width: 230,
  render: (_value, record) => (
    <TableRowLabel
      title={record.title}
      {...(record.meta !== undefined && { meta: record.meta })}
      {...(record.status !== undefined && { status: record.status })}
    />
  ),
}

export const CAMPAIGN_COLUMNS: TableColumnsType<CampaignRow> = [
  CAMPAIGN_LABEL_COLUMN,
  {
    key: 'traffic',
    title: 'Traffic',
    children: [
      metricColumn('impressions', 'Impressions'),
      metricColumn('grossClicks', 'Gross clicks', 'number', {
        defaultSortOrder: 'descend',
      }),
      metricColumn('rejectedClicks', 'Rejected clicks'),
      metricColumn('clicks', 'Clicks'),
    ],
  },
  {
    key: 'conversions',
    title: 'Conversions',
    children: [
      metricColumn('approvedConv', 'Approved conv.'),
      metricColumn('sampledConv', 'Sampled conv.'),
      metricColumn('grossConv', 'Gross conv.'),
      metricColumn('approvedCr', 'Approved CR %', 'percent'),
      metricColumn('grossCr', 'Gross CR %', 'percent'),
    ],
  },
  {
    key: 'expenses',
    title: 'Expenses',
    children: [
      moneyColumn('payout', 'Payout'),
      moneyColumn('revenue', 'Revenue'),
      moneyColumn('grossRevenue', 'Gross revenue'),
      metricColumn('pl', 'P/L %', 'percent'),
    ],
  },
  {
    key: 'events',
    title: 'Events (Goals)',
    children: [
      metricColumn('registration', 'registration'),
      metricColumn('signUp', 'sign_up'),
      metricColumn('kycDone', 'kyc_done'),
      metricColumn('tutorialComplete', 'tutorial_complete'),
      metricColumn('regComplete', 'reg_complete'),
      metricColumn('signupDone', 'signup_done'),
    ],
  },
]

// ---- Country › Sales Manager › Campaign (tags) -----------------------------
export interface AdvertiserRow {
  key: string
  country: string
  grossClicks: number
  grossConv: number
  grossCr: number
  grossRevenue: number
  revenue: number
  pl: number
  sourceType: { label: string; tone: 'neutral' | 'success' }
  advertiser: string
  children?: AdvertiserRow[]
}

export const ADVERTISERS: AdvertiserRow[] = [
  {
    key: 'RU',
    country: 'RU',
    grossClicks: 49923,
    grossConv: 1333,
    grossCr: 3.1,
    grossRevenue: 1688,
    revenue: 1642,
    pl: 38.2,
    sourceType: { label: 'Mixed · 2', tone: 'neutral' },
    advertiser: 'Mixed · 3',
    children: [],
  },
  {
    key: 'KZ',
    country: 'KZ',
    grossClicks: 23551,
    grossConv: 508,
    grossCr: 2.6,
    grossRevenue: 454.1,
    revenue: 437,
    pl: 38.2,
    sourceType: { label: 'Mixed · 2', tone: 'neutral' },
    advertiser: 'Mixed · 2',
    children: [],
  },
  {
    key: 'UZ',
    country: 'UZ',
    grossClicks: 19639,
    grossConv: 461,
    grossCr: 2.9,
    grossRevenue: 466.8,
    revenue: 459.6,
    pl: 38.2,
    sourceType: { label: 'CTV', tone: 'success' },
    advertiser: 'ShopSphere',
    children: [],
  },
]

export const ADVERTISER_TOTALS: TableTotalRow<AdvertiserRow> = {
  caption: '· 3 country rows',
  record: {
    grossClicks: 93113,
    grossConv: 2302,
    grossCr: 2.9,
    grossRevenue: 2609,
    revenue: 2538,
    pl: 38.2,
    sourceType: { label: 'Mixed · 4', tone: 'neutral' },
    advertiser: 'Mixed · 6',
  },
}

export const ADVERTISER_COLUMNS: TableColumnsType<AdvertiserRow> = [
  {
    key: 'country',
    title: 'Country › Sales Manager › Campaign',
    dataIndex: 'country',
    width: 276,
    render: (value: string) => <TableRowLabel title={value} />,
  },
  {
    key: 'traffic',
    title: 'Traffic',
    children: [
      metricColumn('grossClicks', 'Gross clicks', 'number', {
        defaultSortOrder: 'descend',
      }),
    ],
  },
  {
    key: 'conversions',
    title: 'Conversions',
    children: [
      metricColumn('grossConv', 'Gross conv.'),
      metricColumn('grossCr', 'Gross CR %', 'percent'),
    ],
  },
  {
    key: 'expenses',
    title: 'Expenses',
    children: [
      moneyColumn('grossRevenue', 'Gross revenue'),
      moneyColumn('revenue', 'Revenue'),
      metricColumn('pl', 'P/L %', 'percent'),
    ],
  },
  {
    key: 'details',
    title: 'Details',
    children: [
      {
        key: 'sourceType',
        title: 'Source type',
        dataIndex: 'sourceType',
        align: 'center',
        render: (value: AdvertiserRow['sourceType']) => (
          <TableTag tone={value.tone}>{value.label}</TableTag>
        ),
      },
      {
        key: 'advertiser',
        title: 'Advertiser',
        dataIndex: 'advertiser',
        align: 'right',
      },
    ],
  },
]

// ---- Fraud & CTIT (warnings and changes) -----------------------------------
export interface FraudRow {
  key: string
  publisher: string
  meta: string
  clicks: number
  fraudRate: number
  fraudChange: number
  ctit: number | null
  ctitChange: number | null
}

export const FRAUD_ROWS: FraudRow[] = [
  {
    key: '3439',
    publisher: '3439',
    meta: 'P2P',
    clicks: 36385,
    fraudRate: 30.1,
    fraudChange: -1.2,
    ctit: 14.2,
    ctitChange: 0.8,
  },
  {
    key: '6455',
    publisher: '6455',
    meta: 'T1',
    clicks: 16399,
    fraudRate: 4.3,
    fraudChange: 0.4,
    ctit: 22.5,
    ctitChange: -0.6,
  },
  {
    key: '6411',
    publisher: '6411',
    meta: 'T3',
    clicks: 10006,
    fraudRate: 12.7,
    fraudChange: 2.1,
    ctit: null,
    ctitChange: null,
  },
  {
    key: '6428',
    publisher: '6428',
    meta: 'T2',
    clicks: 9959,
    fraudRate: 2.1,
    fraudChange: 0,
    ctit: 18.9,
    ctitChange: 0.2,
  },
]

/** Rates above this get the warning style. */
export const FRAUD_LIMIT = 10

export const FRAUD_COLUMNS: TableColumnsType<FraudRow> = [
  {
    key: 'publisher',
    title: 'Publisher',
    dataIndex: 'publisher',
    width: 200,
    render: (_value, record) => (
      <TableRowLabel title={record.publisher} meta={record.meta} />
    ),
  },
  {
    key: 'traffic',
    title: 'Traffic',
    children: [metricColumn('clicks', 'Clicks')],
  },
  {
    key: 'fraud',
    title: 'Fraud',
    children: [
      metricColumn('fraudRate', 'Fraud rate', 'percent', {
        render: (value: number) => (
          <TableValue
            value={value}
            format="percent"
            warning={value > FRAUD_LIMIT}
          />
        ),
      }),
      metricColumn('fraudChange', 'vs. last week', 'delta', {
        render: (value: number) => (
          <TableValue value={value} format="delta" unit="pp" />
        ),
      }),
    ],
  },
  {
    key: 'ctit',
    title: 'CTIT',
    children: [
      metricColumn('ctit', 'Median CTIT, s', 'number', {
        render: (value: number | null) => (
          <TableValue value={value} decimals={1} />
        ),
      }),
      metricColumn('ctitChange', 'vs. last week', 'delta', {
        render: (value: number | null) => (
          <TableValue value={value} format="delta" unit="s" />
        ),
      }),
    ],
  },
]

// ---- Publisher performance (share of installs) -----------------------------
export interface PublisherRow {
  key: string
  publisher: string
  meta: string
  impressions: number
  grossClicks: number
  mmpClicks: number
  clicks: number
  installs: number
  funnelTotal: number
  firstOpen: number
  appOpen: number
  login: number
  sessionStart: number
  viewContent: number
}

const funnel = {
  funnelTotal: 0,
  firstOpen: 0,
  appOpen: 0,
  login: 0,
  sessionStart: 0,
  viewContent: 0,
}

export const PUBLISHERS: PublisherRow[] = [
  {
    key: '3439',
    publisher: '3439',
    meta: 'P2P',
    impressions: 153771,
    grossClicks: 36385,
    mmpClicks: 29416,
    clicks: 31027,
    installs: 1028,
    ...funnel,
    funnelTotal: 412,
    firstOpen: 402,
    appOpen: 371,
    login: 12,
  },
  {
    key: '6455',
    publisher: '6455',
    meta: 'T1',
    impressions: 70822,
    grossClicks: 16399,
    mmpClicks: 13743,
    clicks: 14492,
    installs: 412,
    ...funnel,
  },
  {
    key: '6411',
    publisher: '6411',
    meta: 'T3',
    impressions: 42265,
    grossClicks: 10006,
    mmpClicks: 7305,
    clicks: 7785,
    installs: 173,
    ...funnel,
  },
  {
    key: '6428',
    publisher: '6428',
    meta: 'T2',
    impressions: 41643,
    grossClicks: 9959,
    mmpClicks: 7810,
    clicks: 8265,
    installs: 231,
    ...funnel,
    funnelTotal: 96,
    firstOpen: 90,
    appOpen: 41,
  },
  {
    key: '6528',
    publisher: '6528',
    meta: 'T2',
    impressions: 35372,
    grossClicks: 8532,
    mmpClicks: 6704,
    clicks: 7084,
    installs: 170,
    ...funnel,
  },
  {
    key: '2802',
    publisher: '2802',
    meta: 'T2',
    impressions: 20055,
    grossClicks: 4839,
    mmpClicks: 4093,
    clicks: 4263,
    installs: 115,
    ...funnel,
  },
  {
    key: '5518',
    publisher: '5518',
    meta: 'T3',
    impressions: 19736,
    grossClicks: 4619,
    mmpClicks: 3478,
    clicks: 3611,
    installs: 56,
    ...funnel,
  },
]

export const PUBLISHER_TOTALS: TableTotalRow<PublisherRow> = {
  caption: '· 7 publisher rows',
  record: {
    impressions: 383624,
    grossClicks: 90739,
    mmpClicks: 72549,
    clicks: 76527,
    installs: 2185,
    funnelTotal: 508,
    firstOpen: 492,
    appOpen: 412,
    login: 12,
    sessionStart: 0,
    viewContent: 0,
  },
}
