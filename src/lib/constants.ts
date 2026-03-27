// ─── Collection Statuses ───

export const COLLECTION_STATUSES = [
  "brouillon",
  "soumis",
  "en_validation",
  "decision_agent",
  "en_attente_direction",
  "valide",
  "en_paiement",
  "paye",
  "refuse",
  "annule",
] as const;

export type CollectionStatus = (typeof COLLECTION_STATUSES)[number];

export const STATUS_LABELS: Record<CollectionStatus, string> = {
  brouillon: "Brouillon",
  soumis: "Soumis",
  en_validation: "En validation",
  decision_agent: "Décision agent",
  en_attente_direction: "Attente direction",
  valide: "Validé",
  en_paiement: "En paiement",
  paye: "Payé",
  refuse: "Refusé",
  annule: "Annulé",
};

// Legacy color classes (unused)
export const STATUS_COLORS: Record<CollectionStatus, string> = {
  brouillon: "badge-neutral",
  soumis: "badge-info",
  en_validation: "badge-info badge-outline",
  decision_agent: "badge-warning",
  en_attente_direction: "badge-warning badge-outline",
  valide: "badge-success",
  en_paiement: "badge-primary",
  paye: "badge-success badge-outline",
  refuse: "badge-error",
  annule: "badge-error badge-outline",
};

// shadcn Badge variant mappings
export const STATUS_VARIANTS: Record<CollectionStatus, string> = {
  brouillon: "neutral",
  soumis: "info",
  en_validation: "info",
  decision_agent: "warning",
  en_attente_direction: "warning",
  valide: "success",
  en_paiement: "default",
  paye: "success",
  refuse: "destructive",
  annule: "destructive",
};

// ─── Payment Statuses ───

export const PAYMENT_STATUSES = [
  "en_attente",
  "initie",
  "confirme",
  "echoue",
  "annule",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  en_attente: "En attente",
  initie: "Initié",
  confirme: "Confirmé",
  echoue: "Échoué",
  annule: "Annulé",
};

// Legacy color classes (unused)
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  en_attente: "badge-warning",
  initie: "badge-info",
  confirme: "badge-success",
  echoue: "badge-error",
  annule: "badge-error badge-outline",
};

// shadcn Badge variant mappings
export const PAYMENT_STATUS_VARIANTS: Record<PaymentStatus, string> = {
  en_attente: "warning",
  initie: "info",
  confirme: "success",
  echoue: "destructive",
  annule: "destructive",
};

// ─── Roles ───

export const ROLES = ["technicien", "agent_bureau", "admin", "direction"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  technicien: "Technicien",
  agent_bureau: "Agent Bureau",
  admin: "Administrateur",
  direction: "Direction",
};

// ─── Mobile Money Operators ───

export const MOBILE_MONEY_OPERATORS = ["wave", "orange_money"] as const;
export type MobileMoneyOperator = (typeof MOBILE_MONEY_OPERATORS)[number];

export const OPERATOR_LABELS: Record<MobileMoneyOperator, string> = {
  wave: "Wave",
  orange_money: "Orange Money",
};
