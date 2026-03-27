import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  isRoleAllowedForTransition,
  validateTransition,
  getNextStatuses,
  getNextStatusesForRole,
  TRANSITIONS,
  TRANSITION_ROLES,
  COLLECTION_STATUSES,
  PAYMENT_TRANSITIONS,
} from "../convex/lib/stateMachine";

describe("stateMachine", () => {
  describe("TRANSITIONS map", () => {
    it("should have an entry for every collection status", () => {
      for (const status of COLLECTION_STATUSES) {
        expect(TRANSITIONS).toHaveProperty(status);
        expect(Array.isArray(TRANSITIONS[status])).toBe(true);
      }
    });

    it("terminal states should have no transitions", () => {
      expect(TRANSITIONS.paye).toEqual([]);
      expect(TRANSITIONS.refuse).toEqual([]);
      expect(TRANSITIONS.annule).toEqual([]);
    });

    it("all target statuses should be valid statuses", () => {
      for (const [, targets] of Object.entries(TRANSITIONS)) {
        for (const target of targets) {
          expect(COLLECTION_STATUSES).toContain(target);
        }
      }
    });
  });

  describe("TRANSITION_ROLES map", () => {
    it("should have roles defined for every non-terminal transition", () => {
      for (const [from, targets] of Object.entries(TRANSITIONS)) {
        for (const to of targets) {
          const key = `${from}→${to}`;
          expect(TRANSITION_ROLES).toHaveProperty(key);
          expect(TRANSITION_ROLES[key].length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("isValidTransition", () => {
    it("brouillon → soumis should be valid", () => {
      expect(isValidTransition("brouillon", "soumis")).toBe(true);
    });

    it("soumis → en_validation should be valid", () => {
      expect(isValidTransition("soumis", "en_validation")).toBe(true);
    });

    it("en_validation → decision_agent should be valid", () => {
      expect(isValidTransition("en_validation", "decision_agent")).toBe(true);
    });

    it("en_validation → refuse should be valid", () => {
      expect(isValidTransition("en_validation", "refuse")).toBe(true);
    });

    it("en_validation → soumis should be valid (negotiate re-submit)", () => {
      expect(isValidTransition("en_validation", "soumis")).toBe(true);
    });

    it("decision_agent → en_attente_direction should be valid", () => {
      expect(isValidTransition("decision_agent", "en_attente_direction")).toBe(true);
    });

    it("en_attente_direction → valide should be valid", () => {
      expect(isValidTransition("en_attente_direction", "valide")).toBe(true);
    });

    it("en_attente_direction → en_validation should be valid (direction rejects)", () => {
      expect(isValidTransition("en_attente_direction", "en_validation")).toBe(true);
    });

    it("valide → en_paiement should be valid", () => {
      expect(isValidTransition("valide", "en_paiement")).toBe(true);
    });

    it("valide → annule should be valid", () => {
      expect(isValidTransition("valide", "annule")).toBe(true);
    });

    it("en_paiement → paye should be valid", () => {
      expect(isValidTransition("en_paiement", "paye")).toBe(true);
    });

    it("en_paiement → annule should be valid", () => {
      expect(isValidTransition("en_paiement", "annule")).toBe(true);
    });

    // Invalid transitions
    it("brouillon → valide should be invalid", () => {
      expect(isValidTransition("brouillon", "valide")).toBe(false);
    });

    it("soumis → paye should be invalid", () => {
      expect(isValidTransition("soumis", "paye")).toBe(false);
    });

    it("paye → brouillon should be invalid (terminal)", () => {
      expect(isValidTransition("paye", "brouillon")).toBe(false);
    });

    it("refuse → soumis should be invalid (terminal)", () => {
      expect(isValidTransition("refuse", "soumis")).toBe(false);
    });

    it("annule → valide should be invalid (terminal)", () => {
      expect(isValidTransition("annule", "valide")).toBe(false);
    });
  });

  describe("isRoleAllowedForTransition", () => {
    // Technicien
    it("technicien can submit a draft", () => {
      expect(isRoleAllowedForTransition("brouillon", "soumis", "technicien")).toBe(true);
    });

    it("technicien cannot validate a collection", () => {
      expect(isRoleAllowedForTransition("soumis", "en_validation", "technicien")).toBe(false);
    });

    // Agent bureau
    it("agent_bureau can pick up for validation", () => {
      expect(isRoleAllowedForTransition("soumis", "en_validation", "agent_bureau")).toBe(true);
    });

    it("agent_bureau can accept", () => {
      expect(isRoleAllowedForTransition("en_validation", "decision_agent", "agent_bureau")).toBe(
        true,
      );
    });

    it("agent_bureau can refuse", () => {
      expect(isRoleAllowedForTransition("en_validation", "refuse", "agent_bureau")).toBe(true);
    });

    it("agent_bureau can negotiate (re-submit)", () => {
      expect(isRoleAllowedForTransition("en_validation", "soumis", "agent_bureau")).toBe(true);
    });

    it("agent_bureau cannot approve as direction", () => {
      expect(isRoleAllowedForTransition("en_attente_direction", "valide", "agent_bureau")).toBe(
        false,
      );
    });

    // Direction
    it("direction can approve", () => {
      expect(isRoleAllowedForTransition("en_attente_direction", "valide", "direction")).toBe(true);
    });

    it("direction can reject (back to agent)", () => {
      expect(
        isRoleAllowedForTransition("en_attente_direction", "en_validation", "direction"),
      ).toBe(true);
    });

    it("direction can cancel a validated collection", () => {
      expect(isRoleAllowedForTransition("valide", "annule", "direction")).toBe(true);
    });

    // Admin
    it("admin can cancel a validated collection", () => {
      expect(isRoleAllowedForTransition("valide", "annule", "admin")).toBe(true);
    });

    it("admin can confirm payment", () => {
      expect(isRoleAllowedForTransition("en_paiement", "paye", "admin")).toBe(true);
    });
  });

  describe("validateTransition", () => {
    it("returns null for valid transition with correct role", () => {
      expect(validateTransition("brouillon", "soumis", "technicien")).toBeNull();
    });

    it("returns error for invalid transition", () => {
      const result = validateTransition("brouillon", "paye", "technicien");
      expect(result).toContain("Transition non autorisée");
    });

    it("returns error for valid transition with wrong role", () => {
      const result = validateTransition("brouillon", "soumis", "agent_bureau");
      expect(result).toContain("Rôle");
      expect(result).toContain("non autorisé");
    });
  });

  describe("getNextStatuses", () => {
    it("returns possible next statuses for brouillon", () => {
      expect(getNextStatuses("brouillon")).toEqual(["soumis"]);
    });

    it("returns empty array for terminal status", () => {
      expect(getNextStatuses("paye")).toEqual([]);
    });

    it("returns multiple options for en_validation", () => {
      const next = getNextStatuses("en_validation");
      expect(next).toContain("decision_agent");
      expect(next).toContain("refuse");
      expect(next).toContain("soumis");
    });
  });

  describe("getNextStatusesForRole", () => {
    it("technicien from brouillon can only go to soumis", () => {
      expect(getNextStatusesForRole("brouillon", "technicien")).toEqual(["soumis"]);
    });

    it("agent_bureau from en_validation has 3 options", () => {
      const next = getNextStatusesForRole("en_validation", "agent_bureau");
      expect(next).toHaveLength(3);
      expect(next).toContain("decision_agent");
      expect(next).toContain("refuse");
      expect(next).toContain("soumis");
    });

    it("direction from en_attente_direction has 2 options", () => {
      const next = getNextStatusesForRole("en_attente_direction", "direction");
      expect(next).toHaveLength(2);
      expect(next).toContain("valide");
      expect(next).toContain("en_validation");
    });

    it("technicien from en_validation has 0 options (not their role)", () => {
      expect(getNextStatusesForRole("en_validation", "technicien")).toEqual([]);
    });
  });

  describe("PAYMENT_TRANSITIONS", () => {
    it("en_attente can go to initie or annule", () => {
      expect(PAYMENT_TRANSITIONS.en_attente).toContain("initie");
      expect(PAYMENT_TRANSITIONS.en_attente).toContain("annule");
    });

    it("initie can go to confirme, echoue, or annule", () => {
      expect(PAYMENT_TRANSITIONS.initie).toContain("confirme");
      expect(PAYMENT_TRANSITIONS.initie).toContain("echoue");
      expect(PAYMENT_TRANSITIONS.initie).toContain("annule");
    });

    it("confirme is terminal", () => {
      expect(PAYMENT_TRANSITIONS.confirme).toEqual([]);
    });

    it("echoue can retry to initie", () => {
      expect(PAYMENT_TRANSITIONS.echoue).toContain("initie");
    });

    it("annule is terminal", () => {
      expect(PAYMENT_TRANSITIONS.annule).toEqual([]);
    });
  });
});
