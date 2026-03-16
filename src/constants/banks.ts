export type Bank = {
  name: string;
  slug: string;
  logo: string;
};

export const INDIAN_BANKS: Bank[] = [
  {
    name: "State Bank of India",
    slug: "sbin",
    logo: "/bank-logos/sbin/logo.svg",
  },
  { name: "HDFC Bank", slug: "hdfc", logo: "/bank-logos/hdfc/logo.svg" },
  { name: "ICICI Bank", slug: "icic", logo: "/bank-logos/icic/logo.svg" },
  { name: "Axis Bank", slug: "utib", logo: "/bank-logos/utib/logo.svg" },
  {
    name: "Kotak Mahindra Bank",
    slug: "kkbk",
    logo: "/bank-logos/kkbk/logo.svg",
  },
  { name: "IndusInd Bank", slug: "indb", logo: "/bank-logos/indb/logo.svg" },
  { name: "Yes Bank", slug: "yesb", logo: "/bank-logos/yesb/logo.svg" },
  {
    name: "Punjab National Bank",
    slug: "punb",
    logo: "/bank-logos/punb/logo.svg",
  },
  { name: "Bank of Baroda", slug: "barb", logo: "/bank-logos/barb/logo.svg" },
  { name: "Canara Bank", slug: "cnrb", logo: "/bank-logos/cnrb/logo.svg" },
  { name: "IDFC FIRST Bank", slug: "idfb", logo: "/bank-logos/idfb/logo.svg" },
  { name: "Federal Bank", slug: "fdrl", logo: "/bank-logos/fdrl/logo.svg" },
  { name: "RBL Bank", slug: "rblb", logo: "/bank-logos/rblb/logo.svg" },
  {
    name: "South Indian Bank",
    slug: "sibl",
    logo: "/bank-logos/sibl/logo.svg",
  },
  {
    name: "Union Bank of India",
    slug: "unio",
    logo: "/bank-logos/unio/logo.svg",
  },
  {
    name: "Standard Chartered",
    slug: "scbl",
    logo: "/bank-logos/scbl/logo.svg",
  },
  {
    name: "Airtel Payments Bank",
    slug: "airp",
    logo: "/bank-logos/airp/logo.svg",
  },
  {
    name: "Jio Payments Bank",
    slug: "jiop",
    logo: "/bank-logos/jiop/logo.svg",
  },
  {
    name: "Paytm Payments Bank",
    slug: "payt",
    logo: "/bank-logos/payt/logo.svg",
  },
  {
    name: "PhonePe / Wallet",
    slug: "phonepe",
    logo: "/bank-logos/phonepe/logo.svg",
  },
  {
    name: "Google Pay / GPay",
    slug: "gpay",
    logo: "/bank-logos/gpay/logo.svg",
  },
  {
    name: "Amazon Pay",
    slug: "amazonpay",
    logo: "/bank-logos/amazonpay/logo.svg",
  },
  { name: "Other / Cash", slug: "cash", logo: "" },
];
