import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("technicien"),
  v.literal("agent_bureau"),
  v.literal("admin"),
  v.literal("direction"),
);

export const mobileMoneyOperatorValidator = v.union(v.literal("wave"), v.literal("orange_money"));

export const collectionStatusValidator = v.union(
  v.literal("brouillon"),
  v.literal("soumis"),
  v.literal("en_validation"),
  v.literal("decision_agent"),
  v.literal("en_attente_direction"),
  v.literal("valide"),
  v.literal("en_paiement"),
  v.literal("paye"),
  v.literal("refuse"),
  v.literal("annule"),
);

export const paymentStatusValidator = v.union(
  v.literal("en_attente"),
  v.literal("initie"),
  v.literal("confirme"),
  v.literal("echoue"),
  v.literal("annule"),
);

export default defineSchema({
  // ─── Utilisateurs ───
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: roleValidator,
    zone: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_zone", ["zone"]),

  // ─── Producteurs Individuels ───
  producers: defineTable({
    name: v.string(),
    phone: v.string(),
    location: v.optional(v.string()),
    mobileMoneyOperator: mobileMoneyOperatorValidator,
    mobileMoneyNumber: v.string(),
    cooperativeId: v.optional(v.id("cooperatives")),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_phone", ["phone"])
    .index("by_cooperative", ["cooperativeId"])
    .searchIndex("search_name", { searchField: "name" }),

  // ─── Coopératives ───
  cooperatives: defineTable({
    name: v.string(),
    representativeId: v.optional(v.id("producers")),
    phone: v.string(),
    location: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),

  // ─── Campagnes ───
  campaigns: defineTable({
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(v.literal("active"), v.literal("closed")),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // ─── Collectes (table principale) ───
  collections: defineTable({
    // Identification
    campaignId: v.id("campaigns"),
    technicianId: v.id("users"),
    supplierId: v.string(), // stores serialized Id<"producers"> or Id<"cooperatives">
    supplierType: v.union(v.literal("individual"), v.literal("cooperative")),
    location: v.optional(v.string()),
    gpsLat: v.optional(v.float64()),
    gpsLng: v.optional(v.float64()),

    // Échantillonnage
    bagsInStock: v.number(),
    estimatedStockKg: v.number(),
    bagsSampled: v.number(),

    // Photos (Convex file storage IDs)
    photoIds: v.array(v.string()),

    // Paiement coopérative
    payRepresentative: v.optional(v.boolean()),
    memberAllocations: v.optional(v.array(v.object({
      memberId: v.id("producers"),
      memberName: v.string(),
      stockKg: v.number(),
    }))),

    // Machine à états
    status: collectionStatusValidator,

    submittedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Champ pour sync offline — ID client temporaire
    offlineId: v.optional(v.string()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_technician", ["technicianId"])
    .index("by_status", ["status"])
    .index("by_supplier", ["supplierId"])
    .index("by_campaign_status", ["campaignId", "status"])
    .index("by_technician_campaign", ["technicianId", "campaignId"])
    .index("by_offlineId", ["offlineId"]),

  // ─── Évaluations Qualité (rempli par agent bureau) ───
  qualityAssessments: defineTable({
    collectionId: v.id("collections"),
    agentId: v.id("users"),

    // 5 critères
    visualAspect: v.number(), // 1-5
    humidity: v.number(), // 0-100 (%)
    homogeneity: v.number(), // 1-5
    cleanliness: v.number(), // 1-5
    husking: v.number(), // 1-5

    globalScore: v.float64(), // calculé

    createdAt: v.number(),
  }).index("by_collection", ["collectionId"]),

  // ─── Décisions (agent bureau) ───
  decisions: defineTable({
    collectionId: v.id("collections"),
    agentId: v.id("users"),
    qualityAssessmentId: v.id("qualityAssessments"),

    decision: v.union(v.literal("accepte"), v.literal("refuse"), v.literal("negocie")),

    // Si accepté
    pricePerKg: v.optional(v.float64()), // FCFA/KG
    finalWeightKg: v.optional(v.float64()), // KG
    totalAmount: v.optional(v.float64()), // prix × poids

    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_agent", ["agentId"]),

  // ─── Validations Direction ───
  directionValidations: defineTable({
    collectionId: v.id("collections"),
    decisionId: v.id("decisions"),
    directorId: v.id("users"),

    validation: v.union(v.literal("approuve"), v.literal("rejete")),

    comment: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_collection", ["collectionId"]),

  // ─── Paiements ───
  payments: defineTable({
    collectionId: v.id("collections"),
    beneficiaryId: v.id("producers"),
    beneficiaryName: v.string(),
    operator: mobileMoneyOperatorValidator,
    mobileMoneyNumber: v.string(),
    amount: v.float64(), // FCFA

    // Contexte fournisseur (dénormalisé pour vérification avant paiement)
    supplierType: v.optional(v.union(v.literal("individual"), v.literal("cooperative"))),
    payRepresentative: v.optional(v.boolean()),

    status: paymentStatusValidator,

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_status", ["status"])
    .index("by_beneficiary", ["beneficiaryId"])
    .index("by_operator_status", ["operator", "status"]),

  // ─── Audit Trail ───
  auditLogs: defineTable({
    entityType: v.union(
      v.literal("collection"),
      v.literal("payment"),
      v.literal("decision"),
      v.literal("validation"),
      v.literal("campaign"),
    ),
    entityId: v.string(),
    action: v.string(),
    userId: v.id("users"),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),
});
