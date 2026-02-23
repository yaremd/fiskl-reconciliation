import type {
  Account,
  AttentionItem,
  LedgerRow,
  MatchedItem,
  NavItem,
  Period,
  Transaction,
} from "@/types/reconciliation";

export const ACCOUNTS: Account[] = [
  {
    id: "hsbc",
    name: "HSBC Current Account",
    currency: "GBP",
    balance: 142890.50,
    months: ["reconciled","reconciled","reconciled","needs_attention","in_progress","draft",null,null,null,null,null,null],
  },
  {
    id: "revolut",
    name: "Revolut Business EUR",
    currency: "EUR",
    balance: 89204.30,
    months: ["reconciled","reconciled","reconciled","reconciled","in_progress",null,null,null,null,null,null,null],
  },
  {
    id: "stripe",
    name: "Stripe Payments",
    currency: "USD",
    balance: 234567.00,
    months: ["reconciled","reconciled","reconciled","needs_attention",null,null,null,null,null,null,null,null],
  },
  {
    id: "jpmorgan",
    name: "JPMorgan Chase USD",
    currency: "USD",
    balance: 1203400.00,
    months: ["reconciled","reconciled","reconciled","reconciled","reconciled",null,null,null,null,null,null,null],
  },
  {
    id: "mercury",
    name: "Mercury Credit Card 1234",
    currency: "USD",
    balance: null,
    months: [null,null,null,null,null,null,null,null,null,null,null,null],
  },
];

export const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const HSBC_PERIODS: Period[] = [
  { period: "June 2025",     status: "draft",            balance: 142890.50 },
  { period: "May 2025",      status: "needs_attention",  balance: 138540.20 },
  { period: "April 2025",    status: "reconciled",       balance: 135210.80 },
  { period: "March 2025",    status: "reconciled",       balance: 132450.00 },
  { period: "February 2025", status: "reconciled",       balance: 129880.40 },
  { period: "January 2025",  status: "reconciled",       balance: 125320.60 },
];

export const TRANSACTIONS: Transaction[] = [
  { id:"t1",  d:"18/07/2025", n:"Bill Pacific Electric",        aiConf:97,   cat:"Utilities - Electricity",  catType:null,      isManual:false, tax:10,   amount:-200,    currency:"EUR", amountGbp:-170.98,    hasLink:false, extraCats:0 },
  { id:"t2",  d:"17/07/2025", n:"Stripe Payment",               aiConf:59,   cat:"Invoice-Payment-INV-021",  catType:null,      isManual:false, tax:null, amount:14441,   currency:"EUR", amountGbp:12597.25,   hasLink:true,  extraCats:0 },
  { id:"t3",  d:"17/07/2025", n:"Q3 Campaign Services",         aiConf:94,   cat:"Invoice-Payment-INV-019",  catType:null,      isManual:true,  tax:10,   amount:2000,    currency:"EUR", amountGbp:1715.84,    hasLink:true,  extraCats:0 },
  { id:"t4",  d:"16/07/2025", n:"Stationery & Print Materials", aiConf:null, cat:"Uncategorized Expense",    catType:"expense", isManual:false, tax:null, amount:-200,    currency:"EUR", amountGbp:-170.98,    hasLink:false, extraCats:0 },
  { id:"t5",  d:"15/07/2025", n:"Microsoft Enterprise Annual",  aiConf:98,   cat:"Accounts Payable",         catType:null,      isManual:false, tax:null, amount:-19087,  currency:"EUR", amountGbp:-15927.77,  hasLink:true,  extraCats:0 },
  { id:"t6",  d:"12/07/2025", n:"Facility Management Services", aiConf:null, cat:"Office Utilities",         catType:null,      isManual:true,  tax:null, amount:-322,    currency:"EUR", amountGbp:-267.84,    hasLink:false, extraCats:0 },
  { id:"t7",  d:"11/07/2025", n:"Contract & Compliance Review", aiConf:null, cat:"Uncategorized Income",     catType:"income",  isManual:false, tax:null, amount:5500,    currency:"EUR", amountGbp:4727.00,    hasLink:false, extraCats:0 },
  { id:"t8",  d:"11/07/2025", n:"Document Delivery Services",   aiConf:83,   cat:"Accounts Payable",         catType:null,      isManual:false, tax:null, amount:-93.92,  currency:"EUR", amountGbp:-82.48,     hasLink:true,  extraCats:0 },
  { id:"t9",  d:"10/07/2025", n:"Conference Room Technology",   aiConf:null, cat:"Equipment Purchase",       catType:null,      isManual:false, tax:null, amount:-4000,   currency:"EUR", amountGbp:-3518.65,   hasLink:false, extraCats:2 },
  { id:"t10", d:"08/07/2025", n:"Internal Transfer",            aiConf:95,   cat:"Revolut - EUR",            catType:null,      isManual:false, tax:null, amount:-200,    currency:"EUR", amountGbp:-170.98,    hasLink:true,  extraCats:0 },
  { id:"t11", d:"07/07/2025", n:"WIRE TRF – ACME CORP",         aiConf:88,   cat:"Sales Revenue",            catType:null,      isManual:false, tax:20,   amount:12500,   currency:"EUR", amountGbp:10731.50,   hasLink:false, extraCats:0 },
  { id:"t12", d:"06/07/2025", n:"STRIPE PAYOUT",                aiConf:76,   cat:"Payment Processing",       catType:null,      isManual:false, tax:null, amount:8943.22, currency:"EUR", amountGbp:7678.06,    hasLink:true,  extraCats:0 },
  { id:"t13", d:"05/07/2025", n:"PAYMENT – SMITH & CO",         aiConf:92,   cat:"Supplier Payments",        catType:null,      isManual:false, tax:null, amount:-3200,   currency:"EUR", amountGbp:-2746.24,   hasLink:true,  extraCats:0 },
  { id:"t14", d:"04/07/2025", n:"DD – HMRC VAT Q2",             aiConf:null, cat:"Tax Payments",             catType:null,      isManual:false, tax:null, amount:-4812,   currency:"GBP", amountGbp:-4812.00,   hasLink:false, extraCats:0 },
  { id:"t15", d:"03/07/2025", n:"Cloud Hosting – AWS June",     aiConf:99,   cat:"Software & Subscriptions", catType:null,      isManual:false, tax:20,   amount:-487.32, currency:"USD", amountGbp:-389.86,    hasLink:false, extraCats:0 },
  { id:"t16", d:"02/07/2025", n:"BACS – PAYROLL June",          aiConf:99,   cat:"Payroll",                  catType:null,      isManual:false, tax:null, amount:-34200,  currency:"GBP", amountGbp:-34200.00,  hasLink:false, extraCats:0 },
  { id:"t17", d:"01/07/2025", n:"Office Insurance Premium",     aiConf:97,   cat:"Insurance",                catType:null,      isManual:false, tax:null, amount:-890,    currency:"GBP", amountGbp:-890.00,    hasLink:false, extraCats:0 },
  { id:"t18", d:"30/06/2025", n:"FASTER PYMT – CLIENT ABC",     aiConf:99,   cat:"Sales Revenue",            catType:null,      isManual:false, tax:20,   amount:5000,    currency:"GBP", amountGbp:5000.00,    hasLink:true,  extraCats:0 },
  { id:"t19", d:"29/06/2025", n:"Consulting Fee – Project X",   aiConf:null, cat:"Uncategorized Income",     catType:"income",  isManual:false, tax:null, amount:5000,    currency:"GBP", amountGbp:5000.00,    hasLink:false, extraCats:0 },
  { id:"t20", d:"28/06/2025", n:"Marketing Agency Retainer",    aiConf:85,   cat:"Marketing",                catType:null,      isManual:true,  tax:20,   amount:-2500,   currency:"EUR", amountGbp:-2145.75,   hasLink:false, extraCats:0 },
  { id:"t21", d:"27/06/2025", n:"DD – OFFICE RENT",             aiConf:99,   cat:"Rent & Utilities",         catType:null,      isManual:false, tax:null, amount:-2400,   currency:"GBP", amountGbp:-2400.00,   hasLink:false, extraCats:0 },
  { id:"t22", d:"26/06/2025", n:"CARD – AWS Infrastructure",    aiConf:98,   cat:"Software & Subscriptions", catType:null,      isManual:false, tax:20,   amount:-487.32, currency:"GBP", amountGbp:-487.32,    hasLink:false, extraCats:0 },
  { id:"t23", d:"25/06/2025", n:"Travel Expenses – Berlin",     aiConf:null, cat:"Uncategorized Expense",    catType:"expense", isManual:false, tax:null, amount:-1240,   currency:"EUR", amountGbp:-1064.42,   hasLink:false, extraCats:0 },
  { id:"t24", d:"24/06/2025", n:"Equipment Lease Payment",      aiConf:91,   cat:"Equipment Purchase",       catType:null,      isManual:false, tax:20,   amount:-650,    currency:"GBP", amountGbp:-650.00,    hasLink:true,  extraCats:1 },
  { id:"t25", d:"23/06/2025", n:"Software Licence – Annual",    aiConf:96,   cat:"Software & Subscriptions", catType:null,      isManual:false, tax:20,   amount:-3600,   currency:"GBP", amountGbp:-3600.00,   hasLink:false, extraCats:0 },
  { id:"t26", d:"22/06/2025", n:"Client Deposit – INV-099",     aiConf:88,   cat:"Sales Revenue",            catType:null,      isManual:true,  tax:20,   amount:8000,    currency:"EUR", amountGbp:6867.20,    hasLink:true,  extraCats:0 },
  { id:"t27", d:"20/06/2025", n:"Bank Service Charge",          aiConf:null, cat:"Bank Fees",                catType:null,      isManual:false, tax:null, amount:-35,     currency:"GBP", amountGbp:-35.00,     hasLink:false, extraCats:0 },
  { id:"t28", d:"19/06/2025", n:"Card Machine Rental",          aiConf:null, cat:"Uncategorized Expense",    catType:"expense", isManual:false, tax:20,   amount:-15,     currency:"GBP", amountGbp:-15.00,     hasLink:false, extraCats:0 },
  { id:"t29", d:"18/06/2025", n:"Fuel & Transport",             aiConf:79,   cat:"Travel & Transport",       catType:null,      isManual:false, tax:5,    amount:-180,    currency:"GBP", amountGbp:-180.00,    hasLink:false, extraCats:0 },
  { id:"t30", d:"16/06/2025", n:"Workspace Subscription",       aiConf:97,   cat:"Rent & Utilities",         catType:null,      isManual:false, tax:20,   amount:-299,    currency:"GBP", amountGbp:-299.00,    hasLink:false, extraCats:0 },
];

export const INIT_ATTENTION: AttentionItem[] = [
  { id:"a1", L:{ d:"28 Jun", n:"WIRE TRF – ACME CORP", a:12500, cat:"Sales Revenue" }, R:{ d:"29 Jun", n:"ACME CORP WIRE", a:12500 }, conf:88, type:"Date offset", ex:"Same transaction, 1-day date offset. Fiskl: 28 Jun, Statement: 29 Jun. Amounts match exactly.", at:"accept", aiSuggested:true },
  { id:"a3", L:{ d:"25 Jun", n:"PAYMENT – SMITH & CO", a:-3200, cat:"Supplier Payments" }, R:{ d:"25 Jun", n:"SMITH AND COMPANY LTD", a:-3200 }, conf:92, type:"Name variant", ex:"Same legal entity — abbreviated name in ledger vs full registered name on statement.", at:"accept", aiSuggested:true },
  { id:"otm1", type:"one-to-many", ledgerItems:[{ d:"15 Jun", n:"CLIENT PMT – PARTIAL 1", a:3000, cat:"Sales Revenue" }, { d:"18 Jun", n:"CLIENT PMT – PARTIAL 2", a:2000, cat:"Sales Revenue" }, { d:"20 Jun", n:"CLIENT PMT – FINAL", a:1500, cat:"Sales Revenue" }], L:null, R:{ d:"20 Jun", n:"CLIENT PAYMENT – INVOICE 1001", a:6500 }, conf:91, ex:"3 ledger partial payments total £6,500 matching one bank statement payment.", at:"accept", aiSuggested:true },
  { id:"mb1", type:"missing-in-bank", L:{ d:"22 Jun", n:"CONSULTING FEE – PROJECT X", a:5000, cat:"Services Revenue" }, R:null, conf:null, ex:null, at:null, aiSuggested:false },
  { id:"dup1", candidates:[{ d:"27 Jun", n:"STRIPE PAYOUT", a:8943.22, cat:"Payment Processing" }, { d:"27 Jun", n:"STRIPE TRANSFER", a:8943.22, cat:"Payment Processing" }, { d:"26 Jun", n:"STRIPE PAYOUT – REPOST", a:8943.22, cat:"Payment Processing" }, { d:"27 Jun", n:"STRIPE NET SETTLEMENT", a:8943.22, cat:"Payment Processing" }, { d:"28 Jun", n:"STRIPE PAYOUT ADJUSTED", a:8943.22, cat:"Payment Processing" }], L:{ d:"27 Jun", n:"STRIPE PAYOUT", a:8943.22, cat:"Payment Processing" }, R:{ d:"27 Jun", n:"STRIPE PAYMENTS UK", a:8943.22 }, conf:74, type:"Duplicate", ex:"5 ledger entries share the same amount as one bank statement line. Pick the correct one to match, or dismiss all.", at:null, aiSuggested:true },
  { id:"o1", L:null, R:{ d:"30 Jun", n:"BANK SERVICE CHARGE", a:-35 }, conf:null, type:"", ex:null, at:null, aiSuggested:false },
  { id:"o2", L:null, R:{ d:"29 Jun", n:"CARD MACHINE RENTAL", a:-15 }, conf:null, type:"", ex:null, at:null, aiSuggested:false },
];

export const INIT_MATCHED: MatchedItem[] = [
  { id:"m1", L:{ d:"28 Jun", n:"FASTER PYMT – CLIENT ABC", a:5000 }, R:{ d:"28 Jun", n:"FASTER PAYMENT CLIENT ABC", a:5000 }, conf:99 },
  { id:"m2", L:{ d:"27 Jun", n:"DD – OFFICE RENT", a:-2400 }, R:{ d:"27 Jun", n:"STANDING ORDER RENT", a:-2400 }, conf:99 },
  { id:"m3", L:{ d:"26 Jun", n:"CARD – AWS", a:-487.32 }, R:{ d:"26 Jun", n:"AMAZON WEB SERVICES", a:-487.32 }, conf:98 },
  { id:"m4", L:{ d:"25 Jun", n:"BACS – PAYROLL", a:-34200 }, R:{ d:"25 Jun", n:"PAYROLL BACS BULK", a:-34200 }, conf:99 },
  { id:"m5", L:{ d:"24 Jun", n:"INSURANCE", a:-890 }, R:{ d:"24 Jun", n:"AVIVA INSURANCE", a:-890 }, conf:97 },
];

export const LEDGER: LedgerRow[] = [
  { id:"l1", d:"28 Jun", n:"WIRE TRF – ACME CORP", a:12500, cat:"Sales Revenue", st:"unreconciled" },
  { id:"l2", d:"26 Jun", n:"STRIPE PAYOUT", a:8943.22, cat:"Payment Processing", st:"unreconciled" },
  { id:"l3", d:"25 Jun", n:"PAYMENT – SMITH & CO", a:-3200, cat:"Supplier Payments", st:"unreconciled" },
  { id:"l4", d:"24 Jun", n:"DD – HMRC VAT Q2", a:-4812, cat:"Tax Payments", st:"unreconciled" },
  { id:"l5", d:"28 Jun", n:"FASTER PYMT – CLIENT ABC", a:5000, cat:"Sales Revenue", st:"reconciled" },
  { id:"l6", d:"27 Jun", n:"DD – OFFICE RENT", a:-2400, cat:"Rent & Utilities", st:"reconciled" },
  { id:"l7", d:"26 Jun", n:"CARD – AWS", a:-487.32, cat:"Software", st:"reconciled" },
  { id:"l8", d:"25 Jun", n:"BACS – PAYROLL", a:-34200, cat:"Payroll", st:"reconciled" },
  { id:"l9", d:"24 Jun", n:"INSURANCE", a:-890, cat:"Insurance", st:"reconciled" },
];

export const NAV_ITEMS: NavItem[] = [
  { id:"dashboard", label:"Dashboard", icon:"home", url:"#" },
  { id:"sales", label:"Sales", icon:"shoppingBag", url:"#", sub:[
    { id:"invoices", label:"Invoices", url:"#" },
    { id:"recurring", label:"Recurring Invoices", url:"#" },
    { id:"quotes", label:"Quotes", url:"#" },
    { id:"clients", label:"Clients", url:"#" },
  ]},
  { id:"purchases", label:"Purchases", icon:"shoppingCart", url:"#", sub:[
    { id:"time", label:"Time", url:"#" },
    { id:"mileage", label:"Mileage", url:"#" },
    { id:"vendors", label:"Vendors", url:"#" },
    { id:"expenses", label:"Expenses", url:"#" },
  ]},
  { id:"accounting", label:"Accounting", icon:"pieChart", url:"#", sub:[
    { id:"coa", label:"Chart of Accounts", url:"#" },
    { id:"reports", label:"Reports", url:"#" },
    { id:"journal", label:"Multi Journal", url:"#" },
    { id:"transactions", label:"Transactions", url:"#" },
    { id:"reconciliation", label:"Reconciliation", url:"/reconciliation", active:true },
  ]},
  { id:"products", label:"Products & Services", icon:"package", url:"#" },
  { id:"banking", label:"Banking", icon:"wallet", url:"#" },
  { id:"team", label:"Team Members", icon:"users", url:"#" },
];
