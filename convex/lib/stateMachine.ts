import type { Role } from "./auth";

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

// ─── Allowed Transitions ───
// For each status, list which statuses it can transition to.

export const TRANSITIONS: Record<CollectionStatus, CollectionStatus[]> = {
  brouillon: ["soumis"],
  soumis: ["en_validation"],
  en_validation: ["decision_agent", "refuse", "negocie" as CollectionStatus].filter(
    (s): s is CollectionStatus => COLLECTION_STATUSES.includes(s as CollectionStatus),
  ),
  decision_agent: ["en_attente_direction"],
  en_attente_direction: ["valide", "en_validation"], // valide = approved, en_validation = rejected (returns to agent)
  valide: ["en_paiement", "annule"],
  en_paiement: ["paye", "annule"],
  paye: [], // terminal state
  refuse: [], // terminal state
  annule: [], // terminal state
};

// Fix: en_validation can go to decision_agent (accept), refuse, or soumis (negotiate → re-submit)
// The "negocie" decision sets status to "soumis" (re-enters the flow)
// Actual valid transitions from en_validation:
TRANSITIONS.en_validation = ["decision_agent", "refuse", "soumis"];

// ─── Role Permissions per Transition ───
// Key format: "fromStatus→toStatus"

export const TRANSITION_ROLES: Record<string, Role[]> = {
  // Technicien: submit draft
  "brouillon→soumis": ["technicien"],

  // Agent bureau: pick up for validation
  "soumis→en_validation": ["agent_bureau"],

  // Agent bureau: make decision
  "en_validation→decision_agent": ["agent_bureau"], // accept
  "en_validation→refuse": ["agent_bureau"], // refuse
  "en_validation→soumis": ["agent_bureau"], // negotiate (re-submit for technician)

  // Agent bureau: forward to direction
  "decision_agent→en_attente_direction": ["agent_bureau"],

  // Direction: approve or reject
  "en_attente_direction→valide": ["direction"],
  "en_attente_direction→en_validation": ["direction"], // reject → back to agent

  // System (triggered by direction approval): move to payment
  "valide→en_paiement": ["admin", "direction"],

  // Admin: confirm payment complete
  "en_paiement→paye": ["admin"],

  // Admin/Direction: cancel
  "valide→annule": ["admin", "direction"],
  "en_paiement→annule": ["admin", "direction"],
};

// ─── Validation Functions ───

/**
 * Check if a status transition is allowed.
 */
export function isValidTransition(
  from: CollectionStatus,
  to: CollectionStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Check if a role is allowed to perform a specific transition.
 */
export function isRoleAllowedForTransition(
  from: CollectionStatus,
  to: CollectionStatus,
  role: Role,
): boolean {
  const key = `${from}→${to}`;
  const allowedRoles = TRANSITION_ROLES[key];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Validate a transition and role in one call.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateTransition(
  from: CollectionStatus,
  to: CollectionStatus,
  role: Role,
): string | null {
  if (!isValidTransition(from, to)) {
    return `Transition non autorisée : ${from} → ${to}`;
  }

  if (!isRoleAllowedForTransition(from, to, role)) {
    return `Rôle "${role}" non autorisé pour la transition ${from} → ${to}`;
  }

  return null;
}

/**
 * Get all possible next statuses from the current status.
 */
export function getNextStatuses(current: CollectionStatus): CollectionStatus[] {
  return TRANSITIONS[current] ?? [];
}

/**
 * Get all possible next statuses for a given role from the current status.
 */
export function getNextStatusesForRole(
  current: CollectionStatus,
  role: Role,
): CollectionStatus[] {
  return getNextStatuses(current).filter((next) =>
    isRoleAllowedForTransition(current, next, role),
  );
}

// ─── Status Labels (French) ───

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

export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  en_attente: ["initie", "annule"],
  initie: ["confirme", "echoue", "annule"],
  confirme: [], // terminal
  echoue: ["initie"], // can retry
  annule: [], // terminal
};
