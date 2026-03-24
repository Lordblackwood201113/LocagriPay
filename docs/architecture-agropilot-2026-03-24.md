# System Architecture: AgroPilot

**Date:** 2026-03-24
**Architect:** LOCAGRI — Équipe de développement
**Version:** 1.0
**Project Type:** web-app (PWA)
**Project Level:** 3
**Status:** Draft

---

## Document Overview

This document defines the system architecture for AgroPilot. It provides the technical blueprint for implementation, addressing all 32 functional requirements and 10 non-functional requirements from the PRD.

**Related Documents:**
- Product Requirements Document: `docs/prd-agropilot-2026-03-24.md`
- Product Brief: `docs/product-brief-agropilot-2026-03-24.md`

---

## Executive Summary

AgroPilot is a PWA built on a **serverless-first architecture** using Convex as the real-time backend, React/Vite as the frontend, and Clerk for authentication. The architecture prioritizes developer velocity (vibecoding), real-time data synchronization, and mobile-first usability for field technicians in rural Côte d'Ivoire. All business logic runs as Convex server functions with TypeScript end-to-end type safety.

---

## Architectural Drivers

These NFRs and constraints heavily influence the architecture:

| # | Driver | Requirement | Architectural Impact |
|---|--------|-------------|---------------------|
| 1 | **Real-time data** | Dashboard KPI temps réel (NFR-001) | Convex reactive queries — no polling, no WebSocket management |
| 2 | **Mobile-first terrain** | Interface utilisable en conditions terrain (NFR-007) | PWA mobile-first, responsive design, large touch targets |
| 3 | **Mode dégradé offline** | Fonctionnement avec connectivité intermittente (FR-032) | Service Worker + Convex client cache + local queue |
| 4 | **Sécurité RBAC** | 5 rôles avec permissions granulaires (NFR-003) | Clerk roles + Convex server-side authorization |
| 5 | **Validation robuste** | Double validation client + serveur (NFR-004) | Zod schemas partagés + Convex argument validators |
| 6 | **Photo storage** | 50 000 photos/an, compression, métadonnées (FR-028) | Convex file storage + client-side compression |
| 7 | **Developer velocity** | Livraison en 7 jours (contrainte) | Convex (zero infra), shadcn/ui (composants prêts), TypeScript E2E |

---

## System Overview

### High-Level Architecture

AgroPilot suit une architecture **serverless BaaS monolithique** où :
- Le **frontend React** est l'unique client (PWA)
- **Convex** est le backend complet (database + server functions + file storage + scheduled jobs)
- **Clerk** gère l'authentification et les métadonnées utilisateur
- Il n'y a **pas de serveur API custom** — Convex remplace API + DB + real-time

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (PWA)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React 19   │  │  shadcn/ui   │  │  Tailwind CSS    │   │
│  │   + Vite     │  │  Components  │  │  + Animations    │   │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘   │
│         │                                                     │
│  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ React Router │  │  Convex      │  │  Service Worker  │   │
│  │  (routing)   │  │  React Client│  │  (PWA + cache)   │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘   │
│                           │                                   │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │  Web APIs: Camera | Geolocation | Push | IndexedDB    │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │ WebSocket (real-time sync)
                            │ HTTPS (file upload)
┌───────────────────────────┴──────────────────────────────────┐
│                     CLERK (Auth Layer)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth UI      │  │ JWT Tokens   │  │ RBAC Roles       │   │
│  │ (sign-in/up) │  │ (session)    │  │ (5 profiles)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │ Webhook (user sync)
                            │ JWT verification
┌───────────────────────────┴──────────────────────────────────┐
│                      CONVEX (Backend)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Queries     │  │  Mutations   │  │  Actions          │   │
│  │  (real-time  │  │  (writes,    │  │  (external calls, │   │
│  │   reads)     │  │   validation)│  │   file processing)│   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Database    │  │  File        │  │  Scheduled        │   │
│  │  (tables,    │  │  Storage     │  │  Functions        │   │
│  │   indexes)   │  │  (photos)    │  │  (cron jobs)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴──────────────────────────────────┐
│                   HOSTING (Static Assets)                     │
│              Vercel / Netlify / Cloudflare Pages              │
└──────────────────────────────────────────────────────────────┘
```

### Architectural Pattern

**Pattern:** Serverless BaaS Monolith (Convex-centric)

**Rationale:**
- **Pas de serveur à gérer** : Convex fournit DB + API + real-time + file storage + cron en un seul service
- **TypeScript end-to-end** : schéma DB → fonctions serveur → client, même langage, types partagés
- **Réactivité native** : les queries Convex sont réactives — le dashboard se met à jour automatiquement quand des données changent, sans WebSocket custom
- **Developer velocity** : pour un projet de 7 jours, éliminer la gestion d'infrastructure est critique
- **Trade-off accepté** : vendor lock-in sur Convex en échange de la vitesse de développement

---

## Technology Stack

### Frontend

**Choice:** React 19 + Vite 6 + TypeScript 5

**Rationale:** Écosystème le plus mature, DX excellent avec Vite (HMR instantané), TypeScript pour la sécurité du typage end-to-end avec Convex.

**Trade-offs:**
- ✓ Gain : écosystème massif, intégration Convex native, composants shadcn/ui
- ✗ Lose : bundle plus lourd que Svelte/Solid (mitigé par code splitting)

**Key Libraries:**
| Library | Purpose | Version |
|---------|---------|---------|
| `react` | UI framework | ^19.0 |
| `react-dom` | DOM rendering | ^19.0 |
| `react-router` | Client-side routing | ^7.0 |
| `convex` | Convex client + React hooks | latest |
| `@clerk/clerk-react` | Auth UI + hooks | latest |
| `@clerk/clerk-convex` | Clerk-Convex integration | latest |
| `tailwindcss` | Utility-first CSS | ^4.0 |
| `shadcn/ui` | UI component library | latest |
| `recharts` | Charts/graphs (dashboard) | ^2.0 |
| `date-fns` | Date formatting (DD/MM/YYYY) | ^4.0 |
| `zod` | Schema validation (shared) | ^3.0 |
| `lucide-react` | Icons | latest |
| `vite-plugin-pwa` | PWA Service Worker | latest |

### Backend

**Choice:** Convex (Backend-as-a-Service)

**Rationale:** Convex est un BaaS temps réel avec base de données, fonctions serverless, file storage et jobs planifiés. Élimine le besoin d'un serveur API, d'une DB managée, de WebSocket infrastructure. TypeScript natif.

**Trade-offs:**
- ✓ Gain : zéro ops, real-time natif, TypeScript E2E, scaling automatique
- ✗ Lose : vendor lock-in, moins de contrôle sur les requêtes DB, pas de SQL

**Convex Function Types:**
| Type | Usage AgroPilot | Example |
|------|-----------------|---------|
| `query` | Lectures réactives (dashboard, listes) | `getTechniciens`, `getDashboardKPIs` |
| `mutation` | Écritures validées (CRUD, workflows) | `createInspection`, `updateTechnicien` |
| `action` | Opérations externes (Clerk, file processing) | `compressPhoto`, `sendNotification` |
| `internalMutation` | Logique serveur interne | `recalculateScoring`, `updateBonuses` |
| `cron` | Jobs planifiés | Vérification alertes retard, recalcul scoring |

### Database

**Choice:** Convex Database (document-oriented, ACID, real-time)

**Rationale:** Intégrée à Convex, pas de setup, réactivité native, TypeScript validators pour le schéma.

**Trade-offs:**
- ✓ Gain : zéro config, queries réactives, indexes automatiques, ACID transactions
- ✗ Lose : pas de SQL, pas de jointures complexes (dénormalisation nécessaire), pas de PostGIS

### Infrastructure

**Choice:** Serverless (Convex Cloud + Vercel)

| Component | Service | Rationale |
|-----------|---------|-----------|
| Backend + DB + Files | Convex Cloud | All-in-one BaaS |
| Static hosting | Vercel | Edge CDN, auto-deploy from Git, preview deployments |
| Auth | Clerk | Managed auth, Convex integration native |
| DNS | Cloudflare (optionnel) | CDN, DDoS protection |

### Third-Party Services

| Service | Usage | Integration |
|---------|-------|-------------|
| **Clerk** | Auth, RBAC, user management | `@clerk/clerk-react` + Convex webhook |
| **Convex File Storage** | Photos d'inspection, permis, documents | Convex `storage.getUrl()` |
| **Vercel** | Hosting frontend PWA | Git push → auto deploy |
| **Web Push API** | Notifications push | Service Worker + VAPID keys |

### Development & Deployment

| Tool | Usage |
|------|-------|
| **Git** | Version control |
| **pnpm** | Package manager (faster than npm) |
| **Vite** | Dev server + build |
| **TypeScript** | Type checking |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Convex CLI** | Schema push, function deployment |
| **Vercel CLI** | Frontend deployment |

---

## System Components

### Component 1: App Shell & Navigation

**Purpose:** Layout principal, routing, navigation responsive

**Responsibilities:**
- Layout avec sidebar (desktop) / bottom nav (mobile)
- Route protection par rôle (Clerk)
- Breadcrumbs et navigation hiérarchique
- Theme provider (light/dark)
- Notification bell avec badge

**FRs Addressed:** FR-031

**Key Files:**
```
src/
├── App.tsx                    # Root component, providers
├── routes.tsx                 # Route definitions avec role guards
├── layouts/
│   ├── DashboardLayout.tsx    # Layout principal (sidebar + content)
│   ├── MobileLayout.tsx       # Layout mobile (bottom nav + content)
│   └── AuthLayout.tsx         # Layout pages auth (login/signup)
├── components/navigation/
│   ├── Sidebar.tsx            # Navigation desktop
│   ├── BottomNav.tsx          # Navigation mobile
│   ├── Breadcrumbs.tsx
│   └── NotificationBell.tsx
```

---

### Component 2: Auth Module

**Purpose:** Authentification et autorisation via Clerk

**Responsibilities:**
- Sign-in / Sign-up UI (Clerk components)
- Session management
- Role-based route protection
- User sync Clerk → Convex (webhook)

**FRs Addressed:** FR-001

**Key Files:**
```
src/features/auth/
├── SignInPage.tsx
├── SignUpPage.tsx
├── RoleGuard.tsx              # HOC: check role before render
├── useAuth.ts                 # Custom hook wrapping Clerk
convex/
├── auth.config.ts             # Clerk integration config
├── users.ts                   # User sync mutations
├── lib/authorization.ts       # Server-side role checking helpers
```

---

### Component 3: Settings Module (Paramètres)

**Purpose:** Configuration des règles métier

**Responsibilities:**
- CRUD paramètres métier (objectifs, seuils, prix, qualité)
- Journal d'audit des modifications
- Validation des valeurs

**FRs Addressed:** FR-002, FR-003

**Key Files:**
```
src/features/settings/
├── SettingsPage.tsx
├── ParameterForm.tsx
├── AuditLogTable.tsx
convex/
├── settings.ts                # Queries + mutations paramètres
├── auditLog.ts                # Audit log mutations
```

---

### Component 4: Technicians Module (Registre)

**Purpose:** Gestion des techniciens et calcul de performance

**Responsibilities:**
- CRUD fiches techniciens
- Calcul automatique des objectifs (ventilation PC/GC)
- Calcul temps réel tonnage réalisé et taux de réalisation
- Statut automatique (BONUS/CONFORME/ALERTE/RÉSILIATION)
- Alertes de performance

**FRs Addressed:** FR-004, FR-005, FR-006

**Key Files:**
```
src/features/technicians/
├── TechniciansListPage.tsx
├── TechnicianDetailPage.tsx
├── TechnicianForm.tsx
├── PerformanceBadge.tsx        # BONUS/CONFORME/ALERTE/RÉSILIATION badge
├── TechnicianCard.tsx
convex/
├── technicians.ts             # CRUD + performance calculations
├── lib/performance.ts         # Calcul statut, bonus, seuils
```

---

### Component 5: Monthly Tracking Module (Suivi Mensuel)

**Purpose:** Vue agrégée mensuelle des collectes

**Responsibilities:**
- Tableau croisé technicien × mois
- Graphiques (barres empilées, courbe cumulée)
- Export PDF/Excel
- Comparaison inter-campagnes

**FRs Addressed:** FR-007, FR-008, FR-009

**Key Files:**
```
src/features/monthly-tracking/
├── MonthlyTrackingPage.tsx
├── MonthlyGrid.tsx            # Tableau croisé
├── MonthlyCharts.tsx          # Recharts graphs
├── ExportButton.tsx           # PDF/Excel export
convex/
├── monthlyTracking.ts         # Aggregation queries
```

---

### Component 6: Calendar Module (Calendrier Opérationnel)

**Purpose:** Suivi des 17 activités du calendrier opérationnel

**Responsibilities:**
- Affichage calendrier avec phases colorées
- Gestion des statuts d'activité
- Upload de livrables
- Alertes de retard

**FRs Addressed:** FR-010, FR-011, FR-012

**Key Files:**
```
src/features/calendar/
├── CalendarPage.tsx
├── ActivityTimeline.tsx        # Vue timeline/Gantt
├── ActivityCard.tsx
├── ActivityStatusSelect.tsx
├── DeliverableUpload.tsx
convex/
├── activities.ts              # CRUD activités + statuts
├── deliverables.ts            # File upload + management
├── crons/activityAlerts.ts    # Scheduled: detect overdue
```

---

### Component 7: Inspection & Purchase Module (Achat Paddy)

**Purpose:** Workflow d'inspection en 7 étapes — cœur opérationnel

**Responsibilities:**
- Workflow step-by-step mobile-first
- Capture GPS + photos horodatées
- Analyse qualité 5 critères
- Décision + négociation prix
- Calcul automatique du montant
- KPI inspections

**FRs Addressed:** FR-013, FR-014, FR-028

**Key Files:**
```
src/features/inspections/
├── InspectionWizard.tsx       # Stepper principal
├── steps/
│   ├── Step1Location.tsx      # GPS auto + fournisseur
│   ├── Step2Photos.tsx        # Photos (min 3)
│   ├── Step3Sampling.tsx      # Échantillonnage (règle 10%)
│   ├── Step4Quality.tsx       # 5 critères qualité
│   ├── Step5Decision.tsx      # VALIDÉ / REJETÉ
│   ├── Step6Negotiation.tsx   # Prix, poids, montant
│   └── Step7Confirmation.tsx  # Récapitulatif
├── InspectionListPage.tsx
├── InspectionDetailPage.tsx
├── InspectionKPIs.tsx
├── hooks/
│   ├── useCamera.ts           # Web Camera API wrapper
│   ├── useGeolocation.ts      # Web Geolocation API wrapper
│   └── useInspectionForm.ts   # Multi-step form state
convex/
├── inspections.ts             # CRUD + validation + KPI queries
├── suppliers.ts               # Fournisseurs CRUD
```

---

### Component 8: Transport Module

**Purpose:** Suivi transport du site au lieu de réception

**Responsibilities:**
- Workflow transport 6 étapes
- Photo permis obligatoire
- Contrôle écart poids
- Confirmation réception (réceptionniste)
- KPI transport

**FRs Addressed:** FR-015, FR-016, FR-030

**Key Files:**
```
src/features/transport/
├── TransportWizard.tsx
├── TransportListPage.tsx
├── TransportDetailPage.tsx
├── TransportKPIs.tsx
├── ReceptionPage.tsx          # Interface réceptionniste
convex/
├── transport.ts               # CRUD + workflow + KPI queries
├── carriers.ts                # Transporteurs CRUD
├── reception.ts               # Réception mutations
```

---

### Component 9: Supply Module (Approvisionnement)

**Purpose:** Registre centralisé des livraisons

**Responsibilities:**
- Vue consolidée de toutes les livraisons validées
- Classification Contrat/Hors contrat/Spot
- Filtres avancés et pagination
- Calcul des montants

**FRs Addressed:** FR-017

**Key Files:**
```
src/features/supply/
├── SupplyPage.tsx
├── SupplyTable.tsx            # DataTable avec filtres
├── SupplyFilters.tsx
convex/
├── supply.ts                  # Queries with filters + pagination
```

---

### Component 10: Dashboard Module (Tableau de Bord)

**Purpose:** Tableau de bord décisionnel pour la direction

**Responsibilities:**
- KPI Performance globale (objectif, réalisé, taux, zones)
- KPI Achat & Transport
- Détail bonus par technicien
- Graphiques et visualisations
- Export

**FRs Addressed:** FR-018, FR-019, FR-020

**Key Files:**
```
src/features/dashboard/
├── DashboardPage.tsx
├── KPIPerformanceSection.tsx
├── KPIPurchaseTransportSection.tsx
├── BonusDetailTable.tsx
├── DashboardCharts.tsx
convex/
├── dashboard.ts               # Aggregation queries (KPI calculations)
```

---

### Component 11: Scoring Module (Producteurs)

**Purpose:** Gestion et scoring automatique des producteurs

**Responsibilities:**
- CRUD fiches producteurs
- Scoring automatique (OR/ARGENT/BRONZE/EXCLU)
- Historique multi-campagnes
- Flag producteur semencier

**FRs Addressed:** FR-021, FR-022

**Key Files:**
```
src/features/producers/
├── ProducersListPage.tsx
├── ProducerDetailPage.tsx
├── ProducerForm.tsx
├── ScoringBadge.tsx           # OR/ARGENT/BRONZE/EXCLU badge
├── ScoringHistory.tsx
convex/
├── producers.ts               # CRUD + scoring calculation
├── lib/scoring.ts             # Scoring algorithm
```

---

### Component 12: Seed Production Module (Semences)

**Purpose:** Suivi du cycle de production de semences certifiées

**Responsibilities:**
- Registre producteurs semenciers
- Suivi épurations variétales (3 passages)
- Tests qualité semences
- Dossier certification ANADER
- Stock et distribution

**FRs Addressed:** FR-023, FR-024, FR-025, FR-026, FR-027

**Key Files:**
```
src/features/seeds/
├── SeedProducersPage.tsx
├── SeedProducerDetailPage.tsx
├── PurificationChecklist.tsx   # 3 passages épuration
├── QualityTestForm.tsx         # Germination, pureté, humidité
├── CertificationTracker.tsx    # Statut ANADER
├── SeedStockPage.tsx
├── SeedDistributionPage.tsx
convex/
├── seedProducers.ts
├── purifications.ts
├── seedTests.ts
├── certifications.ts
├── seedStock.ts
```

---

### Component 13: Notifications Module

**Purpose:** Centre de notifications in-app

**Responsibilities:**
- Agrégation de toutes les alertes
- Badge compteur non lues
- Filtrage par type
- Push notifications (Web Push API)

**FRs Addressed:** FR-029

**Key Files:**
```
src/features/notifications/
├── NotificationsPage.tsx
├── NotificationItem.tsx
├── NotificationBell.tsx
convex/
├── notifications.ts           # CRUD + queries
├── lib/notify.ts              # Helper: create notification
```

---

### Component 14: Shared/Common Components

**Purpose:** Composants réutilisables transverses

**Key Files:**
```
src/components/
├── ui/                        # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── tabs.tsx
│   └── ...
├── common/
│   ├── DataTable.tsx          # Reusable table with sort/filter/pagination
│   ├── StepWizard.tsx         # Reusable multi-step form
│   ├── PhotoCapture.tsx       # Camera component with metadata
│   ├── GPSCapture.tsx         # Geolocation component
│   ├── StatusBadge.tsx        # Performance zone badge
│   ├── CurrencyDisplay.tsx    # FCFA formatter
│   ├── DateDisplay.tsx        # DD/MM/YYYY formatter
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── ErrorBoundary.tsx
│   └── ConfirmDialog.tsx
```

---

## Data Architecture

### Data Model

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│    settings     │     │     users      │     │  notifications │
│────────────────│     │────────────────│     │────────────────│
│ key            │     │ clerkId        │     │ userId         │
│ value          │     │ name           │     │ type           │
│ updatedBy      │     │ role           │     │ title          │
│ updatedAt      │     │ region         │     │ message        │
└────────────────┘     │ isActive       │     │ isRead         │
                       └───────┬────────┘     │ relatedId      │
┌────────────────┐            │               └────────────────┘
│   auditLog     │            │
│────────────────│     ┌──────┴─────────┐
│ userId         │     │  technicians   │
│ entity         │     │────────────────│
│ field          │     │ userId         │──────────────────┐
│ oldValue       │     │ firstName      │                  │
│ newValue       │     │ lastName       │                  │
│ timestamp      │     │ zone           │                  │
└────────────────┘     │ contact        │                  │
                       │ entryDate      │                  │
                       │ photoId        │                  │
                       │ annualObjective│                  │
                       │ nbProducers    │                  │
                       │ isActive       │                  │
                       └──────┬─────────┘                  │
                              │                            │
          ┌───────────────────┼──────────────────┐         │
          │                   │                  │         │
   ┌──────┴─────────┐ ┌──────┴─────────┐ ┌─────┴────────┐
   │  inspections   │ │   transport    │ │  activities  │
   │────────────────│ │────────────────│ │──────────────│
   │ technicianId   │ │ technicianId   │ │ technicianId │
   │ supplierId     │ │ inspectionId   │ │ month        │
   │ date           │ │ date           │ │ week         │
   │ gpsLat         │ │ carrierId      │ │ phase        │
   │ gpsLng         │ │ driverName     │ │ name         │
   │ nbSacs         │ │ driverLicense  │ │ deliverable  │
   │ estimatedKg    │ │ licensePhotoId │ │ status       │
   │ sampleCount    │ │ vehicleType    │ │ observations │
   │ visualScore    │ │ registration   │ └──────────────┘
   │ humidity       │ │ loadedWeight   │
   │ homogeneity    │ │ destination    │
   │ cleanliness    │ │ arrivalWeight  │
   │ husking        │ │ weightGap      │
   │ decision       │ │ transportCost  │
   │ pricePerKg     │ │ status         │
   │ finalWeight    │ └────────────────┘
   │ totalAmount    │
   │ comment        │ ┌────────────────┐
   │ photoIds[]     │ │   producers    │
   │ status         │ │────────────────│
   └────────────────┘ │ technicianId   │
                      │ name           │
   ┌────────────────┐ │ opGvc          │
   │   suppliers    │ │ zone           │
   │────────────────│ │ contact        │
   │ name           │ │ gpsLat         │
   │ contact        │ │ gpsLng         │
   │ location       │ │ deliveredQty   │
   │ zone           │ │ contractedQty  │
   │ gpsLat         │ │ qualityScore   │
   │ gpsLng         │ │ scoring        │
   │ isActive       │ │ isSeedProducer │
   └────────────────┘ └───────┬────────┘
                              │
   ┌────────────────┐  ┌──────┴─────────┐
   │   carriers     │  │ seedProducers  │
   │────────────────│  │────────────────│
   │ name           │  │ producerId     │
   │ contact        │  │ parcelGpsLat   │
   │ vehicleType    │  │ parcelGpsLng   │
   │ registration   │  │ parcelArea     │
   │ isActive       │  │ variety        │
   └────────────────┘  │ seedSource     │
                       │ objectiveKg    │
                       │ isolationDist  │
                       └───────┬────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────┴──────┐ ┌────┴───────┐ ┌────┴───────┐
        │ purifications│ │ seedTests  │ │ seedStock  │
        │──────────────│ │────────────│ │────────────│
        │ seedProdId   │ │ seedProdId │ │ variety    │
        │ stage        │ │ germination│ │ lotId      │
        │ date         │ │ purity     │ │ quantity   │
        │ photoBeforeId│ │ humidity   │ │ certStatus │
        │ photoAfterId │ │ passed     │ │ distributed│
        │ offTypesCount│ │ certStatus │ └────────────┘
        │ comment      │ └────────────┘
        └──────────────┘
```

### Database Design (Convex Schema)

```typescript
// convex/schema.ts
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
    annualObjective: v.number(),        // tonnes (default 300)
    seedObjective: v.optional(v.number()), // kg semences
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
    date: v.string(),                   // ISO date
    gpsLat: v.number(),
    gpsLng: v.number(),
    // Stock
    nbSacs: v.number(),
    estimatedKg: v.number(),
    stockPhotoIds: v.array(v.id("_storage")),
    // Sampling
    sampleCount: v.number(),
    // Quality (5 criteria)
    visualScore: v.number(),            // 1-5
    humidity: v.number(),               // percentage
    homogeneity: v.number(),            // 1-5
    cleanliness: v.number(),            // 1-5
    husking: v.number(),                // 1-5
    qualityPhotoIds: v.optional(v.array(v.id("_storage"))),
    // Decision
    decision: v.union(v.literal("validated"), v.literal("rejected")),
    comment: v.string(),
    decisionPhotoIds: v.optional(v.array(v.id("_storage"))),
    // Negotiation
    pricePerKg: v.number(),             // FCFA
    finalWeight: v.number(),            // kg
    totalAmount: v.number(),            // FCFA
    // Metadata
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
    transportCost: v.number(),          // FCFA
    loadedWeight: v.number(),           // kg
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
    contractedQty: v.number(),          // kg
    deliveredQty: v.number(),           // kg (aggregated)
    qualityScore: v.optional(v.number()), // average /5
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
    parcelArea: v.optional(v.number()),   // hectares
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
    germinationRate: v.number(),         // percentage
    purityRate: v.number(),              // percentage
    humidityRate: v.number(),            // percentage
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
    totalQuantity: v.number(),           // kg
    distributedQuantity: v.number(),     // kg
    certificationStatus: v.string(),
  }).index("by_variety", ["variety"]),

  seedDistributions: defineTable({
    seedStockId: v.id("seedStock"),
    producerId: v.id("producers"),
    quantity: v.number(),                // kg
    date: v.string(),
    technicianId: v.id("technicians"),
  })
    .index("by_stock", ["seedStockId"])
    .index("by_producer", ["producerId"]),
});
```

### Data Flow

```
FIELD (Mobile PWA)                    CONVEX CLOUD                     WEB (Dashboard)
─────────────────                    ─────────────                     ─────────────

Technicien saisit                    mutation: validate                Directeur observe
inspection ──────────►  WebSocket ──►  + store ──────► reactive ──────► Dashboard KPI
  (7 steps)              HTTPS          │              query            auto-updated
  + photos ──────────►  File Upload ──► storage        │
  + GPS                                 │              │
                                       ▼              ▼
                              ┌─────────────────────────┐
                              │    Convex Database       │
                              │  (ACID, indexed, typed)  │
                              └─────────────────────────┘
                                        │
                              Scheduled functions (cron)
                              ├── Recalculate scoring
                              ├── Detect overdue activities
                              └── Generate notifications
```

**Read Path (Dashboard):**
1. React component calls `useQuery(api.dashboard.getKPIs)`
2. Convex executes aggregation query across inspections, transport, technicians
3. Results pushed to client via WebSocket (reactive — no polling)
4. UI updates automatically on any data change

**Write Path (Inspection):**
1. Technicien remplit le formulaire step-by-step
2. Photos compressées côté client (canvas API, target <500KB)
3. Photos uploadées via `storage.generateUploadUrl()`
4. Mutation `inspections.create` validates all fields + stores
5. Side-effects: trigger scoring recalc, update supply register, notify coordinator

---

## API Design

### API Architecture

Convex n'utilise pas d'endpoints REST. L'API est composée de **fonctions typées** appelées directement depuis le client React.

| Type | Client Call | Server Function |
|------|-------------|-----------------|
| **Query** (read, reactive) | `useQuery(api.module.functionName, args)` | `query({ args, handler })` |
| **Mutation** (write, transactional) | `useMutation(api.module.functionName)` | `mutation({ args, handler })` |
| **Action** (external, non-transactional) | `useAction(api.module.functionName)` | `action({ args, handler })` |

### Key Functions (API Surface)

```typescript
// ═══ SETTINGS ═══
api.settings.getAll                    // query: () → Setting[]
api.settings.get                       // query: (key) → Setting
api.settings.update                    // mutation: (key, value) → void
api.settings.getAuditLog              // query: (filters) → AuditEntry[]

// ═══ TECHNICIANS ═══
api.technicians.list                   // query: (filters?) → Technician[]
api.technicians.getById                // query: (id) → Technician + stats
api.technicians.create                 // mutation: (data) → Id
api.technicians.update                 // mutation: (id, data) → void
api.technicians.getPerformance         // query: (id) → PerformanceStats
api.technicians.getMonthlyTonnage      // query: (id) → MonthlyData[]

// ═══ INSPECTIONS ═══
api.inspections.list                   // query: (filters?) → Inspection[]
api.inspections.getById                // query: (id) → Inspection (full)
api.inspections.create                 // mutation: (data) → Id
api.inspections.getKPIs                // query: (filters?) → InspectionKPIs
api.inspections.getByTechnician        // query: (techId, period?) → Inspection[]

// ═══ SUPPLIERS ═══
api.suppliers.list                     // query: (search?) → Supplier[]
api.suppliers.create                   // mutation: (data) → Id
api.suppliers.update                   // mutation: (id, data) → void

// ═══ TRANSPORT ═══
api.transport.list                     // query: (filters?) → Transport[]
api.transport.create                   // mutation: (data) → Id
api.transport.confirmReception         // mutation: (id, arrivalWeight) → void
api.transport.getKPIs                  // query: (filters?) → TransportKPIs
api.transport.getPendingReceptions     // query: () → Transport[]

// ═══ SUPPLY ═══
api.supply.list                        // query: (filters, pagination) → Supply[]
api.supply.getSummary                  // query: (filters?) → SupplySummary

// ═══ DASHBOARD ═══
api.dashboard.getPerformanceKPIs       // query: () → PerformanceKPIs
api.dashboard.getPurchaseTransportKPIs // query: () → PurchaseTransportKPIs
api.dashboard.getBonusDetail           // query: () → BonusDetail[]

// ═══ ACTIVITIES ═══
api.activities.list                    // query: (filters?) → Activity[]
api.activities.updateStatus            // mutation: (id, status) → void
api.activities.uploadDeliverable       // mutation: (id, fileId) → void
api.activities.getOverdue              // query: () → Activity[]

// ═══ PRODUCERS ═══
api.producers.list                     // query: (filters?) → Producer[]
api.producers.getById                  // query: (id) → Producer + history
api.producers.create                   // mutation: (data) → Id
api.producers.update                   // mutation: (id, data) → void
api.producers.recalculateScoring       // mutation: (id) → void

// ═══ SEED PRODUCTION ═══
api.seedProducers.list                 // query: (filters?) → SeedProducer[]
api.seedProducers.create               // mutation: (data) → Id
api.purifications.create               // mutation: (data) → Id
api.purifications.getByProducer        // query: (seedProdId) → Purification[]
api.seedTests.create                   // mutation: (data) → Id
api.seedTests.getByProducer            // query: (seedProdId) → SeedTest[]
api.seedStock.list                     // query: () → SeedStock[]
api.seedDistributions.create           // mutation: (data) → Id

// ═══ NOTIFICATIONS ═══
api.notifications.list                 // query: (userId) → Notification[]
api.notifications.getUnreadCount       // query: (userId) → number
api.notifications.markAsRead           // mutation: (id) → void
api.notifications.markAllAsRead        // mutation: (userId) → void

// ═══ AUTH ═══
api.users.syncFromClerk                // mutation: (clerkUser) → Id
api.users.getCurrentUser               // query: () → User
```

### Authentication & Authorization

**Authentication Flow:**
```
1. User opens PWA → Clerk checks session
2. No session → Clerk SignIn UI → user authenticates
3. Clerk issues JWT → stored in browser
4. Every Convex call includes JWT automatically
5. Convex verifies JWT via Clerk public key
6. First login → webhook triggers api.users.syncFromClerk
```

**Authorization Model (Convex server-side):**

```typescript
// convex/lib/authorization.ts

// Role hierarchy: admin > director > coordinator > technician, receptionist
type Role = "admin" | "director" | "coordinator" | "technician" | "receptionist";

// Permission matrix
const PERMISSIONS: Record<Role, string[]> = {
  admin:        ["*"],  // all
  director:     ["settings:read", "settings:write", "technicians:*", "inspections:*",
                 "transport:*", "supply:*", "dashboard:*", "producers:*",
                 "seeds:*", "activities:*", "notifications:*", "users:read"],
  coordinator:  ["technicians:read", "inspections:*", "transport:*",
                 "supply:read", "dashboard:read", "producers:*",
                 "seeds:read", "activities:*", "notifications:*"],
  technician:   ["inspections:own", "transport:own", "producers:own",
                 "seeds:own", "activities:own", "notifications:own",
                 "dashboard:own"],
  receptionist: ["transport:reception", "notifications:own"],
};

// Every mutation/query checks:
// 1. User is authenticated (ctx.auth.getUserIdentity())
// 2. User has required role/permission
// 3. If "own" permission, user can only access their own data
```

---

## Non-Functional Requirements Coverage

### NFR-001: Performance — Temps de réponse

**Requirement:** Chargement initial <3s (3G), navigation <500ms, soumission <1s

**Architecture Solution:**
- **Vite** code splitting par route → bundle initial minimal (~150KB gzipped)
- **Convex reactive queries** → pas de loading states sur navigation (données en cache)
- **Lazy loading** des modules non critiques (semences, scoring)
- **Image compression** côté client avant upload (canvas resize, quality 0.7)
- **Optimistic updates** sur les mutations fréquentes

**Validation:** Lighthouse audit, WebPageTest sur 3G throttled

---

### NFR-002: Performance — Capacité

**Requirement:** 50 techniciens, 5 000 producteurs, 10 000 transactions/campagne

**Architecture Solution:**
- **Convex indexes** sur tous les champs de filtrage (voir schema ci-dessus)
- **Pagination** via Convex `.paginate()` pour les longues listes (approvisionnement, inspections)
- **Aggregation queries** optimisées pour le dashboard (pré-calculs quand possible)
- Convex gère automatiquement le scaling des workers

**Validation:** Load test avec données simulées (50 users concurrent)

---

### NFR-003: Sécurité — Authentication

**Requirement:** Auth Clerk, sessions, RBAC sur routes et mutations

**Architecture Solution:**
- **Clerk** gère l'auth complète (pas de code auth custom)
- **JWT** vérifié par Convex à chaque appel
- **RoleGuard** component côté client (UX) + vérification serveur (sécurité)
- **Clerk Organizations** possible pour le filtrage par région (coordinateurs)

**Validation:** Test d'accès non autorisé pour chaque endpoint

---

### NFR-004: Sécurité — Intégrité des données

**Requirement:** Double validation, anti-double soumission, soft delete, transactions atomiques

**Architecture Solution:**
- **Zod schemas** partagés entre client et serveur pour validation uniforme
- **Convex argument validators** (`v.string()`, `v.number()`, etc.) pour validation serveur
- **Convex mutations** sont atomiques par défaut (ACID)
- **Soft delete** : champ `isActive: boolean` sur toutes les entités
- **Debounce** côté client + vérification idempotence côté serveur

**Validation:** Tests unitaires sur chaque mutation avec données invalides

---

### NFR-005: Scalabilité

**Requirement:** Scaling de 15 à 50 techniciens sans refonte

**Architecture Solution:**
- **Convex Cloud** scale automatiquement (serverless)
- **Pagination** partout (pas de `.collect()` non borné)
- **Indexes** Convex pour les queries fréquentes
- **Code splitting** pour un bundle qui ne grossit pas linéairement

**Validation:** Benchmark avec 50 users simulés

---

### NFR-006: Disponibilité

**Requirement:** 99.5% web, PWA fonctionnelle offline

**Architecture Solution:**
- **Convex Cloud** : SLA 99.9%
- **Vercel** : edge CDN, redondance géographique
- **Service Worker** : cache shell + données récentes pour mode dégradé
- **Zero-downtime deploys** : Vercel + Convex déploiement atomique

---

### NFR-007: Utilisabilité Mobile-first

**Requirement:** Interface terrain, boutons ≥44px, texte ≥16px, workflow guidé

**Architecture Solution:**
- **Tailwind responsive** : conception mobile-first (`sm:` → `md:` → `lg:`)
- **shadcn/ui** : composants accessibles natifs, customisables
- **StepWizard** component réutilisable pour inspections et transport
- **CSS variables** pour le spacing système cohérent

---

### NFR-009: Localisation

**Requirement:** Français, FCFA, DD/MM/YYYY, GMT

**Architecture Solution:**
```typescript
// src/lib/formatters.ts
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF" })
    .format(amount);

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("fr-CI", {
    day: "2-digit", month: "2-digit", year: "numeric",
    timeZone: "Africa/Abidjan"
  }).format(date);

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat("fr-CI").format(n);
```

---

### NFR-010: Qualité du code

**Requirement:** TypeScript strict, structure cohérente, composants réutilisables

**Architecture Solution:**
- **TypeScript strict** (`strict: true` dans tsconfig)
- **Convex codegen** : types auto-générés pour l'API
- **Feature-based structure** : chaque module dans `src/features/{name}/`
- **shadcn/ui** : composants dans `src/components/ui/`
- **ESLint + Prettier** : formatage automatique

---

## Security Architecture

### Authentication

- **Provider:** Clerk
- **Method:** Email/password (extensible SSO)
- **Session:** JWT avec refresh automatique
- **Token lifetime:** 1 heure, refresh silent
- **Integration:** `@clerk/clerk-react` (frontend) + `convex/auth.config.ts` (backend)

### Authorization

- **Model:** RBAC (Role-Based Access Control)
- **5 rôles:** admin, director, coordinator, technician, receptionist
- **Enforcement:** Double — `RoleGuard` component (UX) + `ctx.auth` check dans chaque mutation Convex (sécurité)
- **Data isolation:** Les coordinateurs ne voient que les techniciens de leur région (filtre serveur sur `region`)
- **Technician isolation:** Un technicien ne voit que ses propres inspections/transports/producteurs

### Data Encryption

- **In transit:** TLS 1.3 (Convex + Clerk + Vercel — HTTPS par défaut)
- **At rest:** Convex chiffre les données au repos (infrastructure managée)
- **File storage:** Convex file storage avec URLs signées et temporaires

### Security Best Practices

- **Input validation:** Zod schemas + Convex validators sur chaque mutation
- **No SQL injection:** Convex n'utilise pas SQL (queries builder typées)
- **No XSS:** React échappe par défaut, pas de `dangerouslySetInnerHTML`
- **CSRF:** Non applicable (Convex utilise WebSocket, pas de cookies de session cross-origin)
- **Rate limiting:** Convex rate limiting intégré
- **Content Security Policy:** Headers strict sur Vercel
- **Dependency audit:** `pnpm audit` régulier

---

## Scalability & Performance

### Scaling Strategy

- **Backend:** Convex scale automatiquement (serverless functions, autoscaling DB)
- **Frontend:** Static assets sur CDN (Vercel edge network)
- **Photos:** Convex file storage (S3-backed, CDN)
- **No manual scaling needed** pour le volume prévu (50 techniciens, 10K transactions/campagne)

### Performance Optimization

- **Route-based code splitting** : `React.lazy()` pour chaque feature module
- **Convex query deduplication** : mêmes queries réutilisées ne font qu'un seul appel
- **Optimistic updates** : UI mise à jour immédiatement, rollback si erreur
- **Image compression client** : resize + quality reduction avant upload
- **Pagination** : cursor-based via Convex `.paginate()`

### Caching Strategy

- **Convex client cache** : queries réactives en cache local (automatique)
- **Service Worker** : assets statiques (HTML, CSS, JS, fonts)
- **Browser cache** : photos servies avec `Cache-Control: max-age=31536000`
- **No custom caching layer needed** : Convex gère le cache serveur + client

### Load Balancing

- **Non applicable** : Convex et Vercel gèrent automatiquement le load balancing
- **CDN** : Vercel edge network distribue les assets globalement

---

## Reliability & Availability

### High Availability Design

- **Convex Cloud** : infrastructure multi-AZ, réplication automatique
- **Vercel** : edge CDN, failover automatique
- **PWA** : fonctionne en mode dégradé si un service est down

### Disaster Recovery

- **RPO:** < 1 minute (Convex continuous backup)
- **RTO:** < 5 minutes (Convex auto-recovery)
- **Backups:** Convex point-in-time recovery, export périodique

### Backup Strategy

- **Database:** Convex backups automatiques (inclus dans le service)
- **Files:** Convex file storage (S3-backed, durable)
- **Code:** Git (GitHub/GitLab)
- **Config:** Convex dashboard export

### Monitoring & Alerting

- **Convex Dashboard** : latence des functions, erreur rate, usage DB
- **Vercel Analytics** : Web Vitals (LCP, FID, CLS)
- **Clerk Dashboard** : auth events, user activity
- **Client-side error tracking** : `ErrorBoundary` React + reporting (Sentry optionnel)

---

## Development Architecture

### Code Organization

```
agropilot/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── icons/                  # App icons (192, 512)
├── src/
│   ├── App.tsx                 # Root: providers, router
│   ├── main.tsx                # Entry point
│   ├── routes.tsx              # Route definitions
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (auto-generated)
│   │   └── common/             # Shared components
│   │       ├── DataTable.tsx
│   │       ├── StepWizard.tsx
│   │       ├── PhotoCapture.tsx
│   │       ├── GPSCapture.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── CurrencyDisplay.tsx
│   │       ├── DateDisplay.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       └── ErrorBoundary.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── SignInPage.tsx
│   │   │   ├── RoleGuard.tsx
│   │   │   └── useAuth.ts
│   │   ├── dashboard/
│   │   ├── settings/
│   │   ├── technicians/
│   │   ├── monthly-tracking/
│   │   ├── calendar/
│   │   ├── inspections/
│   │   ├── transport/
│   │   ├── supply/
│   │   ├── producers/
│   │   ├── seeds/
│   │   └── notifications/
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   ├── MobileLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── hooks/
│   │   ├── useCamera.ts
│   │   ├── useGeolocation.ts
│   │   ├── useMediaQuery.ts
│   │   └── useOfflineQueue.ts
│   ├── lib/
│   │   ├── formatters.ts       # FCFA, dates, numbers
│   │   ├── validators.ts       # Shared Zod schemas
│   │   ├── constants.ts        # App constants
│   │   └── utils.ts            # Utility functions
│   └── styles/
│       └── globals.css         # Tailwind + custom vars
├── convex/
│   ├── schema.ts               # Database schema
│   ├── auth.config.ts          # Clerk config
│   ├── settings.ts
│   ├── auditLog.ts
│   ├── users.ts
│   ├── technicians.ts
│   ├── inspections.ts
│   ├── suppliers.ts
│   ├── transport.ts
│   ├── carriers.ts
│   ├── reception.ts
│   ├── supply.ts
│   ├── dashboard.ts
│   ├── activities.ts
│   ├── deliverables.ts
│   ├── producers.ts
│   ├── seedProducers.ts
│   ├── purifications.ts
│   ├── seedTests.ts
│   ├── seedStock.ts
│   ├── seedDistributions.ts
│   ├── notifications.ts
│   ├── crons.ts                # Scheduled functions
│   ├── http.ts                 # Clerk webhook handler
│   └── lib/
│       ├── authorization.ts    # Role + permission checks
│       ├── performance.ts      # Performance zone calculation
│       ├── scoring.ts          # Producer scoring algorithm
│       ├── validation.ts       # Shared validation rules
│       └── notify.ts           # Notification creation helper
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json             # shadcn/ui config
└── .env.local                  # Clerk + Convex keys
```

### Testing Strategy

| Layer | Tool | Coverage Target | What to Test |
|-------|------|-----------------|--------------|
| **Convex functions** | Convex test framework | 90% des mutations | Validation, calculs métier (bonus, scoring, seuils), permissions |
| **React components** | Vitest + Testing Library | Key workflows | StepWizard flow, form validation, role guards |
| **E2E** | Playwright | Happy paths | Inspection workflow, transport, dashboard load |
| **Visual** | Manual | All screens | Responsive, mobile, desktop |

**Priority de test (vibecoding):**
1. **Calculs métier** : bonus, scoring, taux de réalisation — CRITIQUE (vérifié vs Excel)
2. **Validations** : chaque mutation avec données invalides
3. **Permissions** : chaque rôle accède uniquement à ses données
4. **Workflows** : inspection 7 étapes, transport 6 étapes

### CI/CD Pipeline

```
Git Push → Vercel Auto-Deploy (frontend)
         → Convex Auto-Deploy (backend)

Preview: chaque branche → preview URL (Vercel) + preview backend (Convex)
Production: merge to main → auto-deploy
```

---

## Deployment Architecture

### Environments

| Environment | Frontend | Backend | Purpose |
|-------------|----------|---------|---------|
| **Development** | `localhost:5173` | Convex dev instance | Développement local |
| **Preview** | Vercel preview URL | Convex preview deployment | Review PR |
| **Production** | `agropilot.vercel.app` (ou domaine custom) | Convex production | Utilisateurs finaux |

### Deployment Strategy

- **Zero-downtime** : Vercel atomic deploys + Convex schema migrations
- **Rollback** : Vercel instant rollback + Convex function rollback
- **Database migrations** : Convex schema push (additive-only for safety)

---

## Requirements Traceability

### Functional Requirements Coverage

| FR ID | FR Name | Component(s) | Convex Module(s) |
|-------|---------|---------------|-------------------|
| FR-001 | Auth & rôles | Auth Module | users.ts, lib/authorization.ts |
| FR-002 | Paramètres métier | Settings Module | settings.ts |
| FR-003 | Journal d'audit | Settings Module | auditLog.ts |
| FR-004 | CRUD Techniciens | Technicians Module | technicians.ts |
| FR-005 | Objectifs & performance | Technicians Module | technicians.ts, lib/performance.ts |
| FR-006 | Alertes performance | Notifications Module | notifications.ts, crons.ts |
| FR-007 | Suivi mensuel | Monthly Tracking Module | monthlyTracking.ts |
| FR-008 | Graphiques mensuels | Monthly Tracking Module | (client-side Recharts) |
| FR-009 | Export PDF/Excel | Monthly Tracking Module | (client-side generation) |
| FR-010 | Calendrier opérationnel | Calendar Module | activities.ts |
| FR-011 | Livrables activité | Calendar Module | deliverables.ts |
| FR-012 | Alertes retard | Calendar Module | crons.ts, notifications.ts |
| FR-013 | Workflow inspection 7 étapes | Inspection Module | inspections.ts |
| FR-014 | KPI Inspections | Dashboard Module | dashboard.ts |
| FR-015 | Workflow transport | Transport Module | transport.ts |
| FR-016 | KPI Transport | Dashboard Module | dashboard.ts |
| FR-017 | Registre approvisionnement | Supply Module | supply.ts |
| FR-018 | Dashboard KPI Performance | Dashboard Module | dashboard.ts |
| FR-019 | Dashboard KPI Achat/Transport | Dashboard Module | dashboard.ts |
| FR-020 | Détail bonus | Dashboard Module | dashboard.ts |
| FR-021 | Producteurs & scoring | Scoring Module | producers.ts, lib/scoring.ts |
| FR-022 | Historique scoring | Scoring Module | scoringHistory (producers.ts) |
| FR-023 | Registre semenciers | Seeds Module | seedProducers.ts |
| FR-024 | Épurations variétales | Seeds Module | purifications.ts |
| FR-025 | Tests qualité semences | Seeds Module | seedTests.ts |
| FR-026 | Stock & distribution | Seeds Module | seedStock.ts, seedDistributions.ts |
| FR-027 | Objectifs semenciers | Seeds Module | seedProducers.ts |
| FR-028 | GPS & photos | Shared Components | useCamera.ts, useGeolocation.ts |
| FR-029 | Notifications | Notifications Module | notifications.ts |
| FR-030 | Réception paddy | Transport Module | reception.ts |
| FR-031 | Navigation & layout | App Shell | layouts/, navigation/ |
| FR-032 | Mode dégradé offline | Service Worker | sw.js, useOfflineQueue.ts |

**Coverage: 32/32 FRs (100%)**

### Non-Functional Requirements Coverage

| NFR ID | NFR Name | Solution | Validation |
|--------|----------|----------|------------|
| NFR-001 | Performance temps réponse | Code splitting, Convex cache, optimistic updates | Lighthouse, WebPageTest |
| NFR-002 | Performance capacité | Indexes Convex, pagination, aggregation queries | Load test 50 users |
| NFR-003 | Sécurité auth | Clerk JWT, Convex server-side checks | Penetration test |
| NFR-004 | Intégrité données | Zod + Convex validators, ACID, soft delete | Unit tests mutations |
| NFR-005 | Scalabilité | Convex serverless, pagination, code splitting | Benchmark 50 users |
| NFR-006 | Disponibilité | Convex 99.9%, Vercel CDN, Service Worker | Uptime monitoring |
| NFR-007 | Mobile-first | Tailwind responsive, shadcn/ui, StepWizard | Device testing |
| NFR-008 | Accessibilité | shadcn/ui WCAG AA, navigation clavier | Axe audit |
| NFR-009 | Localisation | Intl.NumberFormat fr-CI, FCFA, DD/MM/YYYY | Visual verification |
| NFR-010 | Qualité code | TypeScript strict, ESLint, feature structure | Code review |

**Coverage: 10/10 NFRs (100%)**

---

## Trade-offs & Decision Log

### Decision 1: Convex vs. Custom Backend (Node.js + PostgreSQL)

**Trade-off:**
- ✓ Gain : zéro ops, real-time natif, TypeScript E2E, dev velocity 10x
- ✗ Lose : vendor lock-in, pas de SQL, pas de PostGIS, offline limité

**Rationale:** Pour un projet de 7 jours avec 1 développeur, la vélocité est prioritaire. Le vendor lock-in est acceptable — Convex peut être remplacé ultérieurement si nécessaire.

---

### Decision 2: PWA vs. Native (React Native)

**Trade-off:**
- ✓ Gain : un seul codebase web, pas de stores, déploiement instantané
- ✗ Lose : accès limité aux APIs natives (Bluetooth humidimètre), pas de vrai offline-first

**Rationale:** Les Web APIs (Camera, Geolocation, Push) couvrent les besoins terrain. Le Bluetooth est hors scope. Le mode dégradé offline est accepté.

---

### Decision 3: shadcn/ui vs. Material UI vs. Ant Design

**Trade-off:**
- ✓ Gain : composants accessibles, zero runtime, customisation Tailwind totale, design épuré
- ✗ Lose : moins de composants "prêts à l'emploi" que Ant Design (mais suffisant)

**Rationale:** shadcn/ui offre le meilleur rapport qualité/customisation. Les composants sont copiés dans le projet (pas de dépendance), permettant un design award-worthy.

---

### Decision 4: Mode dégradé offline vs. Offline-first complet

**Trade-off:**
- ✓ Gain : complexité réduite (pas de sync bidirectionnelle, pas de conflit resolution)
- ✗ Lose : les techniciens ne peuvent pas créer d'inspections complètes sans connexion

**Rationale:** Convex ne supporte pas nativement l'offline-first. Implémenter une couche IndexedDB + sync queue est possible mais coûteux en temps. Le mode dégradé (cache lecture + queue écriture simple) est le meilleur compromis pour 7 jours.

---

## Open Issues & Risks

| # | Issue | Impact | Mitigation | Status |
|---|-------|--------|------------|--------|
| 1 | Convex file storage limit (50K photos/an) | Stockage | Compression agressive (< 500KB), cleanup périodique | À vérifier |
| 2 | Clerk custom claims pour filtrage région | Permissions | Fallback : filtrage serveur dans chaque query | À implémenter |
| 3 | Service Worker + Convex offline queue | Offline | Prototype minimal, IndexedDB pour queue | À prototyper |
| 4 | Web Camera API sur Android bas de gamme | Compatibilité | Fallback : input file type=image | À tester |
| 5 | Bundle size sur 3G (target <300KB gzipped) | Performance | Code splitting agressif, tree shaking | À mesurer |

---

## Assumptions & Constraints

**Assumptions:**
- Convex Cloud est fiable et performant pour le volume prévu
- Clerk supporte les custom roles et le filtrage par organisation/région
- Les Web APIs (Camera, Geolocation, Push) fonctionnent sur Chrome Android ≥90
- Les techniciens ont un smartphone avec ≥2 Go de RAM et Chrome récent
- pnpm est disponible sur la machine de développement

**Constraints:**
- Délai : 7 jours (24-31 mars 2026)
- Stack imposée : React + Vite + Convex + Clerk + shadcn/ui
- PWA uniquement (pas de déploiement native)
- 1 développeur (assisté par IA)
- Mode dégradé offline (pas offline-first)

---

## Future Considerations

- **Offline-first** : quand Convex ajoutera le support offline natif, migrer vers un vrai mode offline
- **React Native** : si les Web APIs ne suffisent pas, extraire les composants vers React Native
- **PostGIS** : si la cartographie avancée est requise, ajouter une couche PostGIS en complément de Convex
- **Analytics** : ajouter Posthog ou Mixpanel pour tracker l'adoption
- **IA** : prédictions de rendement, anomaly detection sur les données de collecte
- **Mobile Money** : intégration paiement via API Orange Money / MTN

---

## Approval & Sign-off

**Review Status:**
- [ ] Technical Lead
- [ ] Product Owner
- [ ] Security Architect
- [ ] DevOps Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-24 | LOCAGRI / BMAD | Initial architecture |

---

## Next Steps

### Phase 4: Sprint Planning & Implementation

Run `/bmad:sprint-planning` to:
- Break 11 epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation following this architectural blueprint

**Key Implementation Principles:**
1. **UI-first** : construire toutes les interfaces avant de connecter le backend
2. Follow feature-based code organization (`src/features/{module}/`)
3. Use Convex schema exactly as defined in this document
4. Apply Zod validation on client + Convex validators on server
5. Test business logic (bonus, scoring, seuils) against Excel formulas
6. Deploy continuously — chaque module fonctionnel = déploiement

---

**This document was created using BMAD Method v6 - Phase 3 (Solutioning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Validation Rules Reference

### Inspection Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| stockPhotoIds | length ≥ 3 | "Minimum 3 photos du stock requises" |
| sampleCount | ≥ nbSacs × 0.1 | "L'échantillonnage doit couvrir au moins 10% du stock" |
| humidity | 0 ≤ x ≤ 30 | "L'humidité doit être entre 0 et 30%" |
| humidity | warning if > 14 | "⚠ Humidité supérieure au seuil de 14%" |
| visualScore, homogeneity, cleanliness, husking | 1 ≤ x ≤ 5 | "La note doit être entre 1 et 5" |
| comment | non empty | "Le commentaire est obligatoire" |
| pricePerKg | > 0 | "Le prix doit être supérieur à 0" |
| finalWeight | > 0 | "Le poids doit être supérieur à 0" |
| gpsLat | 4 ≤ x ≤ 11 | "Coordonnées GPS hors zone Côte d'Ivoire" |
| gpsLng | -9 ≤ x ≤ -2 | "Coordonnées GPS hors zone Côte d'Ivoire" |

### Transport Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| licensePhotoId | required | "La photo du permis de conduire est obligatoire" |
| loadedWeight | > 0 | "Le poids chargé doit être supérieur à 0" |
| arrivalWeight | ≤ loadedWeight × 1.05 | "Le poids arrivée ne peut excéder le poids chargé (+5%)" |
| weightGap alert | if > threshold | "⚠ Écart de poids supérieur au seuil" |

### Seed Tests Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| germinationRate | ≥ 85 to pass | "Taux de germination insuffisant (<85%)" |
| purityRate | ≥ 98 to pass | "Pureté variétale insuffisante (<98%)" |
| humidityRate | ≤ 12 to pass | "Humidité trop élevée (>12%)" |

### Scoring Algorithm

```
IF deliveredQty = 0 OR fraud = true → EXCLU
IF (deliveredQty / contractedQty) ≥ 0.95 AND qualityScore ≥ 4 → OR
IF (deliveredQty / contractedQty) ≥ 0.80 AND qualityScore ≥ 3 → ARGENT
IF deliveredQty > 0 → BRONZE
```

### Performance Zone Algorithm

```
Settings: objective = 300T, bonusThreshold = 330T, terminationThreshold = 240T

IF tonnageRealized ≥ bonusThreshold → BONUS (vert)
IF tonnageRealized ≥ objective → CONFORME (bleu)
IF tonnageRealized ≥ terminationThreshold → ALERTE (orange)
IF tonnageRealized < terminationThreshold → RÉSILIATION (rouge)

Bonus = IF zone = BONUS THEN tonnageRealized × 1000 × bonusPerKg ELSE 0
```

---

## Appendix B: Capacity Planning

| Resource | Current | Target (1 year) | Convex Limits |
|----------|---------|-----------------|---------------|
| Technicians | 15 | 50 | No limit |
| Producers | ~100 | 5 000 | No limit |
| Inspections/year | ~300 | 10 000 | No limit |
| Transports/year | ~200 | 8 000 | No limit |
| Photos/year | ~1 000 | 50 000 | File storage limits TBD |
| DB size | < 10 MB | < 500 MB | Convex Pro: 1 GB included |
| File storage | < 500 MB | < 25 GB | Convex Pro: included |
| Concurrent users | 5 | 50 | Convex handles automatically |

---

## Appendix C: Cost Estimation

| Service | Plan | Monthly Cost (est.) |
|---------|------|---------------------|
| **Convex** | Pro | ~$25/month |
| **Clerk** | Pro | ~$25/month (first 10K MAU free) |
| **Vercel** | Pro | ~$20/month |
| **Domain** | Custom | ~$10/year |
| **Total** | | **~$70-80/month** |

*Note : Les plans gratuits (Convex Free, Clerk Free, Vercel Free) suffisent pour le développement et le MVP initial avec 15 techniciens.*
