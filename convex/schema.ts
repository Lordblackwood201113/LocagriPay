import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══ AUTH & SYSTEM ═══
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("director"),
      v.literal("coordinator"),
      v.literal("technician"),
      v.literal("receptionist")
    ),
    region: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"])
    .index("by_region", ["region"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  auditLog: defineTable({
    userId: v.id("users"),
    entity: v.string(),
    entityId: v.optional(v.string()),
    field: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.string(),
    timestamp: v.number(),
  })
    .index("by_entity", ["entity", "timestamp"])
    .index("by_user", ["userId", "timestamp"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedEntity: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  })
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_user", ["userId"]),

  // ═══ TECHNICIANS ═══
  technicians: defineTable({
    userId: v.optional(v.id("users")),
    firstName: v.string(),
    lastName: v.string(),
    zone: v.string(),
    contact: v.string(),
    entryDate: v.string(),
    photoId: v.optional(v.id("_storage")),
    idDocIds: v.optional(v.array(v.id("_storage"))),
    annualObjective: v.number(),
    seedObjective: v.optional(v.number()),
    nbProducers: v.number(),
    isActive: v.boolean(),
  })
    .index("by_zone", ["zone"])
    .index("by_active", ["isActive"]),

  // ═══ ACTIVITIES (Calendar) ═══
  activities: defineTable({
    month: v.string(),
    week: v.string(),
    phase: v.string(),
    name: v.string(),
    expectedDeliverable: v.string(),
    technicianId: v.optional(v.id("technicians")),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("overdue"),
      v.literal("na")
    ),
    observations: v.optional(v.string()),
    deliverableIds: v.optional(v.array(v.id("_storage"))),
    dueDate: v.optional(v.number()),
  })
    .index("by_technician", ["technicianId"])
    .index("by_status", ["status"])
    .index("by_phase", ["phase"]),

  // ═══ SUPPLIERS ═══
  suppliers: defineTable({
    name: v.string(),
    contact: v.optional(v.string()),
    location: v.optional(v.string()),
    zone: v.optional(v.string()),
    gpsLat: v.optional(v.number()),
    gpsLng: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_zone", ["zone"])
    .index("by_name", ["name"]),

  // ═══ INSPECTIONS (Achat Paddy) ═══
  inspections: defineTable({
    technicianId: v.id("technicians"),
    supplierId: v.id("suppliers"),
    date: v.string(),
    gpsLat: v.number(),
    gpsLng: v.number(),
    nbSacs: v.number(),
    estimatedKg: v.number(),
    stockPhotoIds: v.array(v.id("_storage")),
    sampleCount: v.number(),
    visualScore: v.number(),
    humidity: v.number(),
    homogeneity: v.number(),
    cleanliness: v.number(),
    husking: v.number(),
    qualityPhotoIds: v.optional(v.array(v.id("_storage"))),
    decision: v.union(v.literal("validated"), v.literal("rejected")),
    comment: v.string(),
    decisionPhotoIds: v.optional(v.array(v.id("_storage"))),
    pricePerKg: v.number(),
    finalWeight: v.number(),
    totalAmount: v.number(),
    campaign: v.union(v.literal("PC"), v.literal("GC")),
    status: v.union(
      v.literal("draft"),
      v.literal("completed"),
      v.literal("transported")
    ),
  })
    .index("by_technician", ["technicianId"])
    .index("by_date", ["date"])
    .index("by_campaign", ["campaign"])
    .index("by_decision", ["decision"])
    .index("by_supplier", ["supplierId"]),

  // ═══ TRANSPORT ═══
  carriers: defineTable({
    name: v.string(),
    contact: v.string(),
    vehicleType: v.string(),
    registration: v.string(),
    isActive: v.boolean(),
  }).index("by_name", ["name"]),

  transport: defineTable({
    technicianId: v.id("technicians"),
    inspectionId: v.id("inspections"),
    date: v.string(),
    carrierId: v.id("carriers"),
    driverName: v.string(),
    driverLicenseNumber: v.string(),
    licensePhotoId: v.id("_storage"),
    vehicleType: v.string(),
    registration: v.string(),
    transportCost: v.number(),
    loadedWeight: v.number(),
    destination: v.string(),
    destinationGpsLat: v.optional(v.number()),
    destinationGpsLng: v.optional(v.number()),
    arrivalWeight: v.optional(v.number()),
    weightGap: v.optional(v.number()),
    receptionPhotoId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("in_transit"),
      v.literal("delivered"),
      v.literal("received")
    ),
    observations: v.optional(v.string()),
  })
    .index("by_technician", ["technicianId"])
    .index("by_inspection", ["inspectionId"])
    .index("by_status", ["status"])
    .index("by_date", ["date"]),

  // ═══ PRODUCERS & SCORING ═══
  producers: defineTable({
    name: v.string(),
    opGvc: v.optional(v.string()),
    zone: v.string(),
    technicianId: v.id("technicians"),
    contact: v.optional(v.string()),
    gpsLat: v.optional(v.number()),
    gpsLng: v.optional(v.number()),
    contractedQty: v.number(),
    deliveredQty: v.number(),
    qualityScore: v.optional(v.number()),
    scoring: v.union(
      v.literal("OR"),
      v.literal("ARGENT"),
      v.literal("BRONZE"),
      v.literal("EXCLU")
    ),
    isSeedProducer: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_technician", ["technicianId"])
    .index("by_zone", ["zone"])
    .index("by_scoring", ["scoring"]),

  scoringHistory: defineTable({
    producerId: v.id("producers"),
    campaign: v.string(),
    scoring: v.string(),
    deliveredQty: v.number(),
    contractedQty: v.number(),
    qualityScore: v.optional(v.number()),
    archivedAt: v.number(),
  }).index("by_producer", ["producerId"]),

  // ═══ SEED PRODUCTION ═══
  seedProducers: defineTable({
    producerId: v.id("producers"),
    technicianId: v.id("technicians"),
    parcelGpsLat: v.number(),
    parcelGpsLng: v.number(),
    parcelArea: v.optional(v.number()),
    variety: v.string(),
    seedSource: v.string(),
    objectiveKg: v.number(),
    isolationDistance: v.optional(v.number()),
  })
    .index("by_producer", ["producerId"])
    .index("by_technician", ["technicianId"]),

  purifications: defineTable({
    seedProducerId: v.id("seedProducers"),
    stage: v.union(
      v.literal("tallage"),
      v.literal("montaison"),
      v.literal("epiaison")
    ),
    date: v.string(),
    photoBeforeId: v.optional(v.id("_storage")),
    photoAfterId: v.optional(v.id("_storage")),
    offTypesCount: v.number(),
    comment: v.optional(v.string()),
  })
    .index("by_seedProducer", ["seedProducerId"])
    .index("by_stage", ["stage"]),

  seedTests: defineTable({
    seedProducerId: v.id("seedProducers"),
    germinationRate: v.number(),
    purityRate: v.number(),
    humidityRate: v.number(),
    passed: v.boolean(),
    certificationStatus: v.union(
      v.literal("pending"),
      v.literal("submitted"),
      v.literal("in_review"),
      v.literal("certified"),
      v.literal("rejected")
    ),
    testDate: v.string(),
  }).index("by_seedProducer", ["seedProducerId"]),

  seedStock: defineTable({
    variety: v.string(),
    lotId: v.string(),
    seedProducerId: v.optional(v.id("seedProducers")),
    totalQuantity: v.number(),
    distributedQuantity: v.number(),
    certificationStatus: v.string(),
  }).index("by_variety", ["variety"]),

  seedDistributions: defineTable({
    seedStockId: v.id("seedStock"),
    producerId: v.id("producers"),
    quantity: v.number(),
    date: v.string(),
    technicianId: v.id("technicians"),
  })
    .index("by_stock", ["seedStockId"])
    .index("by_producer", ["producerId"]),
});
