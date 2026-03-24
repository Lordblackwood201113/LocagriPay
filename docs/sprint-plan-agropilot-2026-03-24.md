# Sprint Plan: AgroPilot

**Date:** 2026-03-24
**Scrum Master:** LOCAGRI / BMAD
**Project Level:** 3
**Total Stories:** 42
**Total Points:** 148
**Planned Sprints:** 1 (7 jours intensifs — vibecoding)
**Design System:** shadcn/ui via MCP

---

## Executive Summary

Sprint unique intensif de 7 jours (24-31 mars 2026) en mode vibecoding (développement assisté par IA). Approche **UI-first** : construire toutes les interfaces avec shadcn/ui d'abord, puis connecter le backend Convex progressivement. 42 stories réparties en 7 milestones quotidiens, couvrant les 11 epics et 32 FRs du PRD.

**Key Metrics:**
- Total Stories: 42
- Total Points: 148
- Sprint Duration: 7 jours (1 sprint unique)
- Team: 1 développeur + IA (vibecoding)
- Velocity estimée: ~21 points/jour
- Target Completion: 31 mars 2026

**Stratégie UI-first:**
1. **Phase A (J1-J3):** Construire toutes les interfaces UI (layouts, pages, formulaires, composants)
2. **Phase B (J3-J6):** Connecter le backend Convex module par module
3. **Phase C (J7):** Validation, polish, tests, déploiement production

**shadcn/ui Blocks à utiliser:**
- `sidebar-07` — Sidebar collapsible avec icônes (navigation principale)
- `dashboard-01` — Base pour le tableau de bord KPI
- `login-02` — Page de connexion avec image de couverture
- `chart-bar-stacked` — Graphiques barres empilées (suivi mensuel)
- `chart-area-interactive` — Courbe cumulée vs objectif

---

## Story Inventory

### EPIC-011: Infrastructure Transverse (UI, Offline, Notifications)

---

#### STORY-001: Initialisation du projet

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a developer, I want the project scaffolded with all dependencies so that I can start building features.

**Acceptance Criteria:**
- [ ] Projet React + Vite + TypeScript initialisé
- [ ] Convex configuré et connecté (`npx convex dev`)
- [ ] Clerk configuré avec les 5 rôles (admin, director, coordinator, technician, receptionist)
- [ ] shadcn/ui initialisé avec le theme custom AgroPilot
- [ ] Tailwind CSS 4 configuré
- [ ] PWA manifest + Service Worker basique
- [ ] Structure de dossiers conforme à l'architecture (`src/features/`, `convex/`)
- [ ] `.env.local` avec les clés Clerk + Convex

**Technical Notes:**
- Utiliser `npm create vite@latest` avec template react-ts
- `npx convex init` pour le backend
- `npx shadcn@latest init` pour les composants UI
- Installer : react-router, recharts, date-fns, zod, lucide-react, vite-plugin-pwa
- Créer les fichiers `src/lib/formatters.ts` (FCFA, dates) et `src/lib/validators.ts` (Zod schemas)

---

#### STORY-002: Layout principal et navigation

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 5

**User Story:**
As any user, I want a responsive layout with sidebar navigation so that I can access all modules of the application.

**Acceptance Criteria:**
- [ ] Sidebar desktop (≥1024px) avec shadcn `sidebar-07` (collapsible avec icônes)
- [ ] Bottom navigation mobile (<1024px) avec les 5 actions principales
- [ ] Header avec logo AgroPilot, nom utilisateur, badge notifications, bouton déconnexion
- [ ] Breadcrumbs pour la navigation hiérarchique
- [ ] Les items de navigation sont filtrés par rôle utilisateur
- [ ] Transitions et animations fluides
- [ ] Le layout s'adapte correctement entre 320px et 1920px
- [ ] Design épuré et moderne (palette : vert LOCAGRI + neutrals)

**Technical Notes:**
- shadcn blocks : `sidebar-07` comme base
- Composants shadcn : sidebar, breadcrumb, avatar, badge, button, separator
- `DashboardLayout.tsx` (desktop), `MobileLayout.tsx` (mobile), `AuthLayout.tsx` (auth)
- React Router pour le routing avec lazy loading par feature

**Dependencies:** STORY-001

---

#### STORY-003: Centre de notifications

**Epic:** EPIC-011 | **Priority:** Should Have | **Points:** 3

**User Story:**
As any user, I want a notification center so that I don't miss critical alerts.

**Acceptance Criteria:**
- [ ] Icône cloche dans le header avec badge compteur non lues
- [ ] Popover ou sheet avec la liste des notifications
- [ ] Filtrage par type (performance, transport, activité, semences)
- [ ] Marquage lu/non lu
- [ ] Design cohérent avec le thème AgroPilot

**Technical Notes:**
- shadcn : popover, badge, scroll-area, separator, tabs
- `convex/notifications.ts` pour les queries

**Dependencies:** STORY-002

---

#### STORY-004: Mode dégradé hors-ligne

**Epic:** EPIC-011 | **Priority:** Should Have | **Points:** 5

**User Story:**
As a technician in the field, I want the app to work with poor connectivity so that I can continue working.

**Acceptance Criteria:**
- [ ] Service Worker cache les assets statiques (HTML, CSS, JS)
- [ ] Indicateur visuel de connexion (en ligne / hors ligne / sync en cours)
- [ ] Les données récentes restent consultables hors connexion
- [ ] Formulaires soumis hors connexion mis en queue locale (IndexedDB)
- [ ] Synchronisation automatique au retour réseau
- [ ] Toast de confirmation après sync réussie

**Technical Notes:**
- `vite-plugin-pwa` avec Workbox pour le Service Worker
- `useOfflineQueue.ts` hook custom avec IndexedDB
- sonner (toast) pour les notifications sync

**Dependencies:** STORY-001

---

### EPIC-001: Authentification et Système de Rôles

---

#### STORY-005: Pages d'authentification Clerk

**Epic:** EPIC-001 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a user, I want to sign in with my credentials so that I can access the application securely.

**Acceptance Criteria:**
- [ ] Page Sign In avec shadcn `login-02` adaptée au branding AgroPilot
- [ ] Page Sign Up (pour création de compte admin)
- [ ] Redirection post-login vers le dashboard approprié selon le rôle
- [ ] Logo AgroPilot + image de couverture (agriculture)
- [ ] Responsive mobile

**Technical Notes:**
- `@clerk/clerk-react` SignIn/SignUp components customisés
- shadcn block `login-02` comme base visuelle
- `AuthLayout.tsx` pour ces pages

**Dependencies:** STORY-001

---

#### STORY-006: Protection des routes par rôle

**Epic:** EPIC-001 | **Priority:** Must Have | **Points:** 3

**User Story:**
As an admin, I want routes protected by role so that users only access authorized modules.

**Acceptance Criteria:**
- [ ] Composant `RoleGuard` qui vérifie le rôle avant le rendu
- [ ] Redirection vers page 403 si rôle insuffisant
- [ ] Les items de navigation ne montrent que les modules autorisés
- [ ] Vérification côté serveur (Convex) en plus du client

**Technical Notes:**
- `convex/lib/authorization.ts` avec matrice de permissions
- `RoleGuard.tsx` HOC wrapping les routes
- Convex webhook Clerk pour sync user → `convex/users.ts`

**Dependencies:** STORY-005

---

#### STORY-007: Sync utilisateurs Clerk → Convex

**Epic:** EPIC-001 | **Priority:** Must Have | **Points:** 2

**User Story:**
As a system, I want to sync Clerk user data to Convex so that user profiles are available in the database.

**Acceptance Criteria:**
- [ ] Webhook Clerk → Convex `http.ts` pour user.created/updated/deleted
- [ ] Table `users` créée dans Convex avec clerkId, name, email, role, region
- [ ] Query `getCurrentUser` fonctionnelle

**Technical Notes:**
- `convex/http.ts` pour le webhook handler
- `convex/users.ts` pour les mutations de sync

**Dependencies:** STORY-001

---

### EPIC-002: Paramétrage et Configuration Métier

---

#### STORY-008: Page de configuration des paramètres

**Epic:** EPIC-002 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want to configure business parameters so that the system applies our rules automatically.

**Acceptance Criteria:**
- [ ] Page Settings avec formulaire structuré en sections
- [ ] Section Objectifs : objectif annuel (300T), seuil bonus (+10%), bonus unitaire (1 FCFA/kg), seuil résiliation (-20%)
- [ ] Section Campagnes : répartition PC/GC (40%/60%)
- [ ] Section Qualité : seuils humidité (14%), impuretés (3%), brisure (15%)
- [ ] Section Semences : objectif production semencière
- [ ] Validation des champs (nombres > 0, pourcentages 0-100)
- [ ] Bouton Sauvegarder avec confirmation
- [ ] Accessible uniquement au rôle Directeur/Admin

**Technical Notes:**
- shadcn : form, input, card, separator, button, sonner
- `convex/settings.ts` mutations avec validators
- Zod schema partagé pour validation client + serveur

**Dependencies:** STORY-006

---

#### STORY-009: Journal d'audit des paramètres

**Epic:** EPIC-002 | **Priority:** Should Have | **Points:** 2

**User Story:**
As a director, I want to see who changed parameters and when so that I have full traceability.

**Acceptance Criteria:**
- [ ] Tableau d'audit avec colonnes : Date, Utilisateur, Paramètre, Ancienne valeur, Nouvelle valeur
- [ ] Filtres par date et par paramètre
- [ ] Lecture seule
- [ ] Alimenté automatiquement à chaque modification

**Technical Notes:**
- shadcn : table, badge, select (filtres)
- `convex/auditLog.ts` auto-alimenté par les mutations settings

**Dependencies:** STORY-008

---

### EPIC-003: Gestion des Techniciens

---

#### STORY-010: Liste des techniciens

**Epic:** EPIC-003 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a coordinator, I want to see the list of all technicians in my region so that I can monitor their status.

**Acceptance Criteria:**
- [ ] DataTable avec colonnes : Photo, Nom, Zone, Contact, Objectif, Réalisé, %, Statut
- [ ] Badge de statut coloré (BONUS vert, CONFORME bleu, ALERTE orange, RÉSILIATION rouge)
- [ ] Recherche par nom
- [ ] Filtre par zone et par statut
- [ ] Bouton "Ajouter un technicien"
- [ ] Coordinateur : filtre auto par sa région

**Technical Notes:**
- shadcn : table, badge, input (search), select (filters), avatar, button
- Composant `StatusBadge.tsx` réutilisable
- `convex/technicians.ts` query avec filtres

**Dependencies:** STORY-006

---

#### STORY-011: Fiche et formulaire technicien

**Epic:** EPIC-003 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a coordinator, I want to create and edit technician profiles so that I can manage my team.

**Acceptance Criteria:**
- [ ] Page détail technicien avec toutes les infos
- [ ] Formulaire création/édition : nom, prénom, zone (select), contact, date d'entrée
- [ ] Upload photo de profil et pièces d'identité
- [ ] Objectif annuel modifiable (défaut depuis paramètres)
- [ ] Affichage ventilation automatique PC/GC
- [ ] Calcul temps réel tonnage réalisé et taux de réalisation
- [ ] Historique par campagne
- [ ] Validation : nom/prénom requis, contact format valide, zone obligatoire

**Technical Notes:**
- shadcn : form, input, select, card, dialog (formulaire), avatar
- Composant `PhotoCapture.tsx` pour upload
- `convex/technicians.ts` CRUD mutations

**Dependencies:** STORY-010

---

#### STORY-012: Alertes de performance techniciens

**Epic:** EPIC-003 | **Priority:** Should Have | **Points:** 2

**User Story:**
As a coordinator, I want to be alerted when a technician enters ALERTE zone so that I can intervene.

**Acceptance Criteria:**
- [ ] Notification in-app quand un technicien passe en ALERTE
- [ ] Notification + alerte direction quand un technicien passe en RÉSILIATION
- [ ] Les alertes apparaissent dans le centre de notifications

**Technical Notes:**
- `convex/lib/notify.ts` helper
- Cron Convex ou trigger dans la mutation d'update tonnage
- Utilise le centre de notifications (STORY-003)

**Dependencies:** STORY-011, STORY-003

---

### EPIC-004: Suivi Mensuel de Collecte

---

#### STORY-013: Tableau croisé suivi mensuel

**Epic:** EPIC-004 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a director, I want a monthly grid showing tonnage per technician per month so that I can track campaign progress.

**Acceptance Criteria:**
- [ ] Tableau : lignes = techniciens, colonnes = Jan-Déc + Total + %Objectif
- [ ] Distinction visuelle petite campagne (couleur 1) / grande campagne (couleur 2)
- [ ] Totaux par colonne (équipe) et par ligne (technicien)
- [ ] Code couleur sur le % objectif (vert/bleu/orange/rouge)
- [ ] Données alimentées en temps réel depuis les livraisons validées
- [ ] Filtre par campagne (année)

**Technical Notes:**
- shadcn : table, badge, tabs (campagnes)
- `convex/monthlyTracking.ts` aggregation query
- `CurrencyDisplay.tsx` et `StatusBadge.tsx` composants

**Dependencies:** STORY-011

---

#### STORY-014: Graphiques suivi mensuel

**Epic:** EPIC-004 | **Priority:** Should Have | **Points:** 3

**User Story:**
As a director, I want charts showing monthly collection trends so that I can visualize performance.

**Acceptance Criteria:**
- [ ] Graphique barres empilées par mois (PC/GC)
- [ ] Courbe cumulée du tonnage vs ligne d'objectif
- [ ] Filtre par technicien ou vue globale équipe
- [ ] Responsive et lisible sur mobile

**Technical Notes:**
- Recharts (BarChart stacked, AreaChart)
- shadcn chart component wrapper
- Référence shadcn blocks : `chart-bar-stacked`, `chart-area-interactive`

**Dependencies:** STORY-013

---

#### STORY-015: Export rapports PDF/Excel

**Epic:** EPIC-004 | **Priority:** Should Have | **Points:** 3

**User Story:**
As a coordinator, I want to export reports as PDF and Excel so that I can share them in meetings.

**Acceptance Criteria:**
- [ ] Bouton export PDF (mise en page propre avec en-tête LOCAGRI)
- [ ] Bouton export Excel (.xlsx)
- [ ] Disponible sur : suivi mensuel, tableau de bord, scoring producteurs
- [ ] Accessible aux rôles Coordinateur+

**Technical Notes:**
- jspdf + jspdf-autotable pour PDF
- xlsx (SheetJS) pour Excel
- Génération côté client

**Dependencies:** STORY-013

---

### EPIC-005: Calendrier Opérationnel

---

#### STORY-016: Calendrier interactif des activités

**Epic:** EPIC-005 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a coordinator, I want an interactive calendar showing all 17 operational activities so that I can track progress.

**Acceptance Criteria:**
- [ ] Vue tableau/timeline avec les 17 activités pré-remplies
- [ ] Colonnes : Mois, Semaine, Phase, Activité, Livrable attendu, Technicien, Statut, Observations
- [ ] Phases colorées : Inter-campagne, Préparation, Semis, Végétation, Récolte
- [ ] Statuts : Non démarré (gris), En cours (bleu), Terminé (vert), En retard (rouge), N/A
- [ ] Intégration des activités Achat/Transport et Semences

**Technical Notes:**
- shadcn : table, badge, select (statuts), tabs (phases)
- `convex/activities.ts` avec les 17 activités seed data

**Dependencies:** STORY-006

---

#### STORY-017: Mise à jour statut et livrables

**Epic:** EPIC-005 | **Priority:** Should Have | **Points:** 3

**User Story:**
As a technician, I want to update activity status and upload deliverables from my phone.

**Acceptance Criteria:**
- [ ] Select de statut modifiable par le technicien (mobile)
- [ ] Upload de livrables (photos, PDF) par activité
- [ ] Indicateur visuel : livrable fourni vs manquant
- [ ] Alertes automatiques quand une activité dépasse sa date limite

**Technical Notes:**
- shadcn : select, dialog (upload), badge
- `convex/deliverables.ts` pour file storage
- Cron Convex pour détecter les activités en retard

**Dependencies:** STORY-016

---

### EPIC-006: Inspection & Achat Paddy

---

#### STORY-018: Wizard d'inspection — Structure et étape 1 (Déplacement)

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a technician, I want a step-by-step inspection wizard so that I follow the LOCAGRI procedure correctly.

**Acceptance Criteria:**
- [ ] Composant StepWizard réutilisable (progress bar, navigation avant/arrière)
- [ ] Étape 1 — Déplacement : capture GPS automatique, sélection fournisseur (existant ou nouveau)
- [ ] Fournisseur : combobox recherchable dans la BDD + option "Nouveau fournisseur"
- [ ] GPS : affichage des coordonnées capturées, fallback saisie manuelle si GPS indisponible
- [ ] Validation : GPS dans la plage CI (lat 4°-11°, lon -9°/-2°), fournisseur obligatoire
- [ ] Design mobile-first, boutons larges

**Technical Notes:**
- Composant `StepWizard.tsx` avec steps array et current step state
- `useGeolocation.ts` hook (Web Geolocation API)
- shadcn : progress, button, combobox, card, form
- `convex/suppliers.ts` pour la liste fournisseurs

**Dependencies:** STORY-006

---

#### STORY-019: Wizard d'inspection — Étapes 2-3 (Photos & Échantillonnage)

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a technician, I want to take photos and record sampling data so that stock is properly documented.

**Acceptance Criteria:**
- [ ] Étape 2 — Photos stock : prise de photos in-app (min 3), horodatage + GPS auto, saisie nb sacs et estimation kg
- [ ] Blocage si moins de 3 photos
- [ ] Compression automatique des photos côté client (< 500KB)
- [ ] Étape 3 — Échantillonnage : saisie nb sacs échantillonnés, alerte si < 10% du stock
- [ ] Vignettes des photos prises avec possibilité de supprimer

**Technical Notes:**
- `useCamera.ts` hook (Web Camera API via input capture)
- Canvas API pour compression
- shadcn : input, alert, badge (compteur photos)
- Convex file storage pour upload

**Dependencies:** STORY-018

---

#### STORY-020: Wizard d'inspection — Étape 4 (Analyse qualité)

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a technician, I want to rate paddy quality on 5 criteria so that purchase decisions are data-driven.

**Acceptance Criteria:**
- [ ] 5 critères de notation : Aspect visuel (/5), Humidité (%), Homogénéité (/5), Propreté (/5), Décorticage (/5)
- [ ] Notes via slider ou boutons 1-5 (touch-friendly)
- [ ] Humidité via input numérique
- [ ] Alerte visuelle si humidité > 14%
- [ ] Photo optionnelle de l'échantillon
- [ ] Score qualité moyen calculé automatiquement

**Technical Notes:**
- shadcn : slider, input, alert, form, badge
- Validation : notes 1-5, humidité 0-30%

**Dependencies:** STORY-018

---

#### STORY-021: Wizard d'inspection — Étapes 5-7 (Décision, Négociation, Confirmation)

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a technician, I want to make a purchase decision and negotiate price so that the transaction is recorded.

**Acceptance Criteria:**
- [ ] Étape 5 — Décision : boutons VALIDÉ (vert) / REJETÉ (rouge), commentaire obligatoire
- [ ] Étape 6 — Négociation : affichage prix référence, saisie prix négocié/kg, saisie poids final, calcul montant auto (poids × prix) formaté FCFA
- [ ] Étape 7 — Confirmation : récapitulatif complet de toutes les étapes, bouton "Confirmer l'inspection"
- [ ] Impossible de passer à l'étape suivante sans compléter l'étape courante
- [ ] Validation : prix > 0, poids > 0, commentaire non vide

**Technical Notes:**
- shadcn : button, textarea, input, card (récapitulatif), alert-dialog (confirmation)
- `CurrencyDisplay.tsx` pour formatage FCFA
- `convex/inspections.ts` mutation create avec tous les validators

**Dependencies:** STORY-020

---

#### STORY-022: Liste des inspections et KPI

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a coordinator, I want to see all inspections with KPIs so that I can monitor procurement activity.

**Acceptance Criteria:**
- [ ] DataTable des inspections : Date, Technicien, Fournisseur, Décision, Poids, Montant, Qualité
- [ ] Filtres : technicien, période, décision (validé/rejeté)
- [ ] KPI cards en haut : nb inspections, lots validés, taux de validation (%), humidité moyenne, tonnage validé
- [ ] Clic sur une ligne → détail complet de l'inspection avec photos

**Technical Notes:**
- shadcn : table, card, badge, tabs, dialog (détail)
- `convex/inspections.ts` queries avec filtres + KPI aggregation

**Dependencies:** STORY-021

---

### EPIC-007: Transport Paddy

---

#### STORY-023: Wizard de transport

**Epic:** EPIC-007 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a technician, I want to record transport details so that paddy movement is tracked.

**Acceptance Criteria:**
- [ ] Étape 1 — Transporteur : sélection ou création (nom, contact, type véhicule, immatriculation, prix)
- [ ] Type véhicule : select (Camion bâché, non bâché, Camionnette, Pick-up, Tricycle, Autre)
- [ ] Étape 2 — Chauffeur : nom, n° permis, photo permis obligatoire (blocage si manquante)
- [ ] Étape 3 — Chargement : poids chargé, liaison auto avec fiche d'achat
- [ ] Étape 4 — Destination : select (Usine LOCAGRI / Entrepôt intermédiaire)
- [ ] Confirmation et soumission
- [ ] Validation : poids > 0, photo permis requise, tous champs obligatoires

**Technical Notes:**
- Réutilise le composant `StepWizard.tsx` de STORY-018
- `useCamera.ts` pour photo permis
- shadcn : form, select, input, combobox
- `convex/transport.ts`, `convex/carriers.ts`

**Dependencies:** STORY-021

---

#### STORY-024: Réception et contrôle transport

**Epic:** EPIC-007 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a receptionist, I want to confirm paddy reception and record arrival weight so that discrepancies are detected.

**Acceptance Criteria:**
- [ ] Page réceptionniste : liste des transports en attente de réception
- [ ] Formulaire : saisie poids arrivée
- [ ] Calcul écart automatique (chargé − arrivée)
- [ ] Alerte visuelle si écart > seuil paramétré
- [ ] Bouton validation du bon de réception
- [ ] Le transport passe au statut "received"

**Technical Notes:**
- shadcn : table, input, alert, badge, button
- `convex/reception.ts` mutation

**Dependencies:** STORY-023

---

#### STORY-025: Liste transport et KPI

**Epic:** EPIC-007 | **Priority:** Should Have | **Points:** 2

**User Story:**
As a coordinator, I want transport KPIs so that I can monitor logistics efficiency.

**Acceptance Criteria:**
- [ ] DataTable des transports : Date, Technicien, Transporteur, Poids chargé/arrivée, Écart, Statut
- [ ] KPI cards : nb transports, tonnage total, taux de perte, coût moyen/tonne, photos permis manquantes
- [ ] Filtres par technicien et période

**Technical Notes:**
- shadcn : table, card, badge
- `convex/transport.ts` KPI queries

**Dependencies:** STORY-024

---

### EPIC-008: Approvisionnement & Tableau de Bord

---

#### STORY-026: Registre d'approvisionnement

**Epic:** EPIC-008 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want a centralized supply register so that I have a unified view of all procured paddy.

**Acceptance Criteria:**
- [ ] DataTable : Date, Technicien, Fournisseur, Type (Contrat/Hors contrat/Spot), Quantité (kg), Qualité, Humidité, Prix/kg, Montant FCFA
- [ ] Alimenté automatiquement depuis les inspections validées
- [ ] Classification par type d'achat
- [ ] Filtres avancés : technicien, fournisseur, type, date, zone
- [ ] Pagination (volume > 500 lignes)
- [ ] Totaux en pied de tableau

**Technical Notes:**
- shadcn : table, select, input, badge, pagination
- `convex/supply.ts` queries paginées

**Dependencies:** STORY-022

---

#### STORY-027: Dashboard KPI Performance

**Epic:** EPIC-008 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a director, I want a real-time performance dashboard so that I can make data-driven decisions.

**Acceptance Criteria:**
- [ ] KPI cards : Objectif global, Total collecté, Taux de réalisation (jauge), Nb techniciens actifs
- [ ] Répartition techniciens par zone (BONUS/CONFORME/ALERTE/RÉSILIATION) avec badges colorés
- [ ] Budget bonus estimé total (FCFA)
- [ ] Graphique de la progression globale
- [ ] Données temps réel (réactivité Convex)

**Technical Notes:**
- shadcn block `dashboard-01` comme base
- shadcn : card, badge, progress
- Recharts pour les graphiques
- `convex/dashboard.ts` aggregation queries

**Dependencies:** STORY-013

---

#### STORY-028: Dashboard KPI Achat & Transport

**Epic:** EPIC-008 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want purchase and transport KPIs on the dashboard so that I monitor operational efficiency.

**Acceptance Criteria:**
- [ ] Section Achat : nb inspections, lots validés/rejetés, taux de validation, tonnage validé
- [ ] Section Transport : nb transports, tonnage transporté, taux de perte, coût moyen/tonne
- [ ] Photos permis manquantes (alerte)
- [ ] Filtrable par période

**Technical Notes:**
- Réutilise les KPI queries de STORY-022 et STORY-025
- shadcn : card, tabs, badge

**Dependencies:** STORY-027

---

#### STORY-029: Tableau détail bonus par technicien

**Epic:** EPIC-008 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want a detailed bonus table per technician so that I can validate bonus payments.

**Acceptance Criteria:**
- [ ] Tableau : Technicien, Objectif (T), Réalisé (T), Écart, % Objectif, Zone, Bonus (FCFA)
- [ ] Bonus calculé : si tonnage ≥ seuil → tonnage × 1000 × bonus/kg
- [ ] Total bonus équipe en pied de tableau (FCFA)
- [ ] Tri par colonne
- [ ] Export PDF/Excel

**Technical Notes:**
- shadcn : table, badge
- `convex/dashboard.ts` bonus query
- Réutilise `ExportButton.tsx` de STORY-015

**Dependencies:** STORY-027

---

### EPIC-009: Scoring Producteurs

---

#### STORY-030: Liste des producteurs avec scoring

**Epic:** EPIC-009 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a technician, I want to see my producers with their scoring so that I can prioritize reliable ones.

**Acceptance Criteria:**
- [ ] DataTable : Nom, OP/GVC, Zone, Qté livrée, Qté contractée, Taux livraison, Qualité (/5), Scoring
- [ ] Badge scoring coloré : OR (doré), ARGENT (gris), BRONZE (brun), EXCLU (rouge)
- [ ] Flag "Producteur semencier" (icône)
- [ ] Filtres : zone, scoring, technicien
- [ ] Bouton "Ajouter producteur"
- [ ] Technicien ne voit que ses propres producteurs

**Technical Notes:**
- shadcn : table, badge, avatar, button, select
- `ScoringBadge.tsx` composant réutilisable
- `convex/producers.ts` queries filtrées par role

**Dependencies:** STORY-006

---

#### STORY-031: Fiche et formulaire producteur

**Epic:** EPIC-009 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a technician, I want to create and manage producer profiles so that my portfolio is up to date.

**Acceptance Criteria:**
- [ ] Formulaire : nom, OP/GVC, zone, contact, GPS parcelle, quantité contractée
- [ ] Scoring calculé automatiquement (OR/ARGENT/BRONZE/EXCLU) selon les règles
- [ ] Historique scoring multi-campagnes (tableau simple)
- [ ] Flag producteur semencier (checkbox)
- [ ] Validation : nom requis, quantités ≥ 0, note qualité 1-5

**Technical Notes:**
- shadcn : form, input, select, checkbox, card, table (historique)
- `convex/producers.ts` CRUD + scoring recalculation
- `convex/lib/scoring.ts` algorithme

**Dependencies:** STORY-030

---

### EPIC-010: Production Semencière

---

#### STORY-032: Registre producteurs semenciers

**Epic:** EPIC-010 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a technician, I want to manage seed producers so that seed production is tracked.

**Acceptance Criteria:**
- [ ] Liste des producteurs semenciers avec : nom, variété, parcelle, objectif (kg)
- [ ] Formulaire : parcelle GPS, surface, distance d'isolement, variété, source semences, objectif
- [ ] Lien vers la fiche producteur standard
- [ ] Carte/affichage GPS de la parcelle

**Technical Notes:**
- shadcn : table, form, input, card
- `convex/seedProducers.ts`
- `GPSCapture.tsx` composant

**Dependencies:** STORY-031

---

#### STORY-033: Suivi épurations variétales

**Epic:** EPIC-010 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a technician, I want to track seed field purification with photos so that seed quality is documented.

**Acceptance Criteria:**
- [ ] Check-list des 3 passages : Tallage → Montaison → Épiaison
- [ ] Chaque passage : date, photos avant/après, nb hors-types retirés, commentaire
- [ ] Ordre imposé : impossible de valider un passage si le précédent n'est pas complété
- [ ] Alerte si date d'épuration dépassée
- [ ] Vue récapitulative par parcelle avec statut de chaque passage

**Technical Notes:**
- shadcn : accordion, form, badge, alert, checkbox
- `useCamera.ts` pour photos
- `convex/purifications.ts` avec validation de l'ordre

**Dependencies:** STORY-032

---

#### STORY-034: Tests qualité semences et certification

**Epic:** EPIC-010 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want to track seed quality tests and certification status so that I can manage the certification pipeline.

**Acceptance Criteria:**
- [ ] Formulaire tests : taux germination (%), pureté (%), humidité (%)
- [ ] Indicateurs pass/fail : germination ≥ 85%, pureté ≥ 98%, humidité ≤ 12%
- [ ] Blocage certification si un critère fail
- [ ] Suivi statut ANADER : Soumis / En cours / Certifié / Rejeté
- [ ] Timeline du parcours de certification

**Technical Notes:**
- shadcn : form, input, badge, progress, select (statut)
- `convex/seedTests.ts`, `convex/certifications.ts`

**Dependencies:** STORY-033

---

#### STORY-035: Stock et distribution semences

**Epic:** EPIC-010 | **Priority:** Should Have | **Points:** 3

**User Story:**
As a coordinator, I want to manage seed stock and distribution so that certified seeds reach eligible producers.

**Acceptance Criteria:**
- [ ] Vue stock par variété et lot (quantité totale, distribuée, disponible)
- [ ] Formulaire distribution : producteur, quantité, date
- [ ] Solde mis à jour automatiquement
- [ ] Suivi objectif tonnage semences vs réalisé par technicien

**Technical Notes:**
- shadcn : table, form, card, progress
- `convex/seedStock.ts`, `convex/seedDistributions.ts`

**Dependencies:** STORY-034

---

### Stories transverses finales

---

#### STORY-036: Composants partagés réutilisables

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a developer, I want shared reusable components so that the UI is consistent across all modules.

**Acceptance Criteria:**
- [ ] `DataTable.tsx` — Table réutilisable avec tri, filtre, pagination
- [ ] `StatusBadge.tsx` — Badge BONUS/CONFORME/ALERTE/RÉSILIATION
- [ ] `ScoringBadge.tsx` — Badge OR/ARGENT/BRONZE/EXCLU
- [ ] `CurrencyDisplay.tsx` — Formatage FCFA (espace séparateur, pas de décimale)
- [ ] `DateDisplay.tsx` — Formatage DD/MM/YYYY fuseau GMT
- [ ] `EmptyState.tsx` — État vide avec illustration
- [ ] `LoadingState.tsx` — Skeleton loading
- [ ] `ConfirmDialog.tsx` — Dialog de confirmation avant actions destructives

**Technical Notes:**
- shadcn : table, badge, skeleton, dialog, alert-dialog
- `src/lib/formatters.ts` pour FCFA et dates

**Dependencies:** STORY-001

---

#### STORY-037: GPS et capture photo (hooks)

**Epic:** EPIC-006 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a technician, I want GPS and photo capture to work reliably on my phone.

**Acceptance Criteria:**
- [ ] `useGeolocation.ts` : capture GPS auto, fallback saisie manuelle, validation plage CI
- [ ] `useCamera.ts` : prise photo in-app (pas galerie), horodatage auto, géolocalisation auto
- [ ] Compression automatique des photos (canvas resize, target < 500KB)
- [ ] `PhotoCapture.tsx` : composant UI avec aperçu, compteur, suppression
- [ ] `GPSCapture.tsx` : composant UI affichant lat/lng ou "GPS indisponible"

**Technical Notes:**
- Web Geolocation API, Web Camera API (via input capture="camera")
- Canvas API pour compression
- Convex file storage pour upload

**Dependencies:** STORY-001

---

#### STORY-038: Schéma Convex complet

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a developer, I want the complete Convex schema deployed so that all modules can store data.

**Acceptance Criteria:**
- [ ] `convex/schema.ts` avec les 18 tables définies dans l'architecture
- [ ] Tous les indexes définis
- [ ] Validators typés pour chaque champ
- [ ] Schéma déployé avec `npx convex dev`
- [ ] Seed data : 17 activités calendrier, paramètres par défaut

**Technical Notes:**
- Copier le schéma de l'architecture document
- `convex/seed.ts` pour les données initiales

**Dependencies:** STORY-001

---

#### STORY-039: Mutations et queries Convex (modules core)

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 8

**User Story:**
As a developer, I want all Convex server functions implemented so that the UI can read and write data.

**Acceptance Criteria:**
- [ ] `convex/settings.ts` — CRUD paramètres + audit
- [ ] `convex/technicians.ts` — CRUD + calcul performance
- [ ] `convex/inspections.ts` — Create + list + KPI queries
- [ ] `convex/transport.ts` — Create + reception + KPI queries
- [ ] `convex/supply.ts` — List paginée + filtres
- [ ] `convex/dashboard.ts` — Toutes les aggregation queries KPI
- [ ] `convex/producers.ts` — CRUD + scoring auto
- [ ] `convex/lib/authorization.ts` — Vérification permissions
- [ ] `convex/lib/performance.ts` — Calcul zone de performance
- [ ] `convex/lib/scoring.ts` — Algorithme scoring producteur
- [ ] Chaque mutation vérifie les permissions ET valide les arguments

**Technical Notes:**
- Utiliser les Convex argument validators (`v.string()`, etc.)
- Vérifier `ctx.auth.getUserIdentity()` dans chaque function
- Calculs bonus et scoring conformes aux règles Excel

**Dependencies:** STORY-038, STORY-007

---

#### STORY-040: Mutations et queries Convex (modules semences + activités)

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a developer, I want Convex functions for seeds and activities modules.

**Acceptance Criteria:**
- [ ] `convex/activities.ts` — CRUD + statut update + overdue detection
- [ ] `convex/deliverables.ts` — File upload/management
- [ ] `convex/seedProducers.ts` — CRUD
- [ ] `convex/purifications.ts` — CRUD avec validation d'ordre
- [ ] `convex/seedTests.ts` — Create + pass/fail logic
- [ ] `convex/seedStock.ts` — Stock management
- [ ] `convex/seedDistributions.ts` — Distribution tracking
- [ ] `convex/notifications.ts` — CRUD + unread count
- [ ] `convex/crons.ts` — Jobs planifiés (alertes retard, recalcul scoring)

**Dependencies:** STORY-038, STORY-007

---

#### STORY-041: Tests de validation croisée avec Excel

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 3

**User Story:**
As a director, I want calculation results to match Excel formulas so that data integrity is guaranteed.

**Acceptance Criteria:**
- [ ] Tests unitaires Convex : calcul bonus avec cas limites (exactement 330T, 329.9T, 240T)
- [ ] Tests scoring producteur : OR/ARGENT/BRONZE/EXCLU avec cas limites
- [ ] Tests zone performance : BONUS/CONFORME/ALERTE/RÉSILIATION
- [ ] Tests ventilation PC/GC (40%/60%)
- [ ] Tests calcul montant inspection (poids × prix)
- [ ] Tests calcul écart transport (chargé − arrivée)
- [ ] Tous les tests passent

**Technical Notes:**
- Convex test framework
- Jeu de données de test avec cas limites
- Comparaison avec les formules du fichier Excel source

**Dependencies:** STORY-039

---

#### STORY-042: Polish, déploiement et validation finale

**Epic:** EPIC-011 | **Priority:** Must Have | **Points:** 5

**User Story:**
As a director, I want the application deployed and production-ready so that technicians can start using it.

**Acceptance Criteria:**
- [ ] Déploiement Vercel (frontend) + Convex production (backend)
- [ ] PWA installable sur smartphone (manifest, icons, Service Worker)
- [ ] Performance : Lighthouse score > 80 sur mobile
- [ ] Responsive : vérifié sur 375px (mobile), 768px (tablette), 1440px (desktop)
- [ ] Toutes les pages testées manuellement
- [ ] Dark mode fonctionnel (optionnel)
- [ ] Compression photos fonctionnelle
- [ ] GPS fonctionnel
- [ ] Transitions et animations fluides
- [ ] Aucune erreur console

**Technical Notes:**
- `vercel deploy --prod`
- `npx convex deploy`
- Lighthouse audit
- Test sur appareil Android réel si possible

**Dependencies:** Toutes les stories précédentes

---

---

## Sprint Allocation

### Single Sprint: 7 Jours Intensifs (24-31 mars 2026)

**Goal:** Livrer AgroPilot complet — 10 modules fonctionnels, 5 rôles, design award-worthy.

**Approche UI-first en 3 phases :**

---

### Jour 1 (24 mars) — FOUNDATION & DESIGN SYSTEM — 19 pts

**Milestone:** Projet fonctionnel avec auth, layout et composants de base

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-001 | Initialisation du projet | 3 | Setup |
| STORY-036 | Composants partagés réutilisables | 3 | UI |
| STORY-037 | GPS et capture photo (hooks) | 3 | UI |
| STORY-005 | Pages d'authentification Clerk | 3 | UI |
| STORY-002 | Layout principal et navigation | 5 | UI |
| STORY-038 | Schéma Convex complet | 2* | Backend |

*\*Schéma déployé en parallèle, estimé 2 pts le J1 (reste J2)*

**Livrables J1 :**
- App qui se lance, login Clerk fonctionnel
- Layout responsive avec sidebar/bottom nav
- Composants partagés prêts (DataTable, StatusBadge, etc.)
- Schéma Convex déployé

---

### Jour 2 (25 mars) — PARAMÈTRES & TECHNICIENS — 21 pts

**Milestone:** Modules Config et Registre Techniciens complets

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-038 | Schéma Convex (suite) | 3* | Backend |
| STORY-006 | Protection des routes par rôle | 3 | Auth |
| STORY-007 | Sync Clerk → Convex | 2 | Auth |
| STORY-008 | Page configuration paramètres | 3 | UI+Backend |
| STORY-009 | Journal d'audit | 2 | UI+Backend |
| STORY-010 | Liste des techniciens | 3 | UI+Backend |
| STORY-011 | Fiche et formulaire technicien | 5 | UI+Backend |

**Livrables J2 :**
- Auth complète avec 5 rôles protégés
- Module Paramètres fonctionnel (CRUD + audit)
- Module Techniciens fonctionnel (CRUD + calcul performance + statuts)

---

### Jour 3 (26 mars) — SUIVI MENSUEL & CALENDRIER — 19 pts

**Milestone:** Modules Suivi mensuel et Calendrier complets

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-013 | Tableau croisé suivi mensuel | 5 | UI+Backend |
| STORY-014 | Graphiques suivi mensuel | 3 | UI |
| STORY-015 | Export rapports PDF/Excel | 3 | UI |
| STORY-016 | Calendrier interactif des activités | 5 | UI+Backend |
| STORY-017 | Mise à jour statut et livrables | 3 | UI+Backend |

**Livrables J3 :**
- Tableau mensuel avec graphiques et export
- Calendrier opérationnel avec 17 activités et suivi de statut

---

### Jour 4 (27 mars) — INSPECTION & ACHAT PADDY — 21 pts

**Milestone:** Cœur opérationnel — workflow d'inspection complet

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-018 | Wizard inspection — Structure + Étape 1 | 5 | UI+Backend |
| STORY-019 | Wizard inspection — Étapes 2-3 | 5 | UI+Backend |
| STORY-020 | Wizard inspection — Étape 4 | 3 | UI+Backend |
| STORY-021 | Wizard inspection — Étapes 5-7 | 5 | UI+Backend |
| STORY-022 | Liste inspections et KPI | 3 | UI+Backend |

**Livrables J4 :**
- Workflow d'inspection en 7 étapes fonctionnel (mobile-first)
- Liste des inspections avec KPI
- Photos, GPS, qualité, négociation — tout connecté

---

### Jour 5 (28 mars) — TRANSPORT & APPROVISIONNEMENT — 19 pts

**Milestone:** Flux logistique complet + registre centralisé

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-023 | Wizard transport | 5 | UI+Backend |
| STORY-024 | Réception et contrôle | 3 | UI+Backend |
| STORY-025 | Liste transport et KPI | 2 | UI+Backend |
| STORY-026 | Registre approvisionnement | 3 | UI+Backend |
| STORY-003 | Centre de notifications | 3 | UI+Backend |
| STORY-012 | Alertes performance techniciens | 2* | Backend |
| STORY-004 | Mode dégradé hors-ligne | 1* | Start |

*\*Alertes : logique backend + STORY-004 : début Service Worker*

**Livrables J5 :**
- Workflow transport complet avec réception usine
- Registre approvisionnement alimenté automatiquement
- Notifications fonctionnelles

---

### Jour 6 (29 mars) — DASHBOARD, SCORING & SEMENCES — 27 pts

**Milestone:** Tableau de bord décisionnel + scoring + module semences

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-027 | Dashboard KPI Performance | 5 | UI+Backend |
| STORY-028 | Dashboard KPI Achat & Transport | 3 | UI+Backend |
| STORY-029 | Détail bonus par technicien | 3 | UI+Backend |
| STORY-030 | Liste producteurs scoring | 3 | UI+Backend |
| STORY-031 | Fiche producteur | 3 | UI+Backend |
| STORY-032 | Registre semenciers | 3 | UI+Backend |
| STORY-033 | Suivi épurations | 5 | UI+Backend |
| STORY-034 | Tests qualité et certification | 3* | UI |

*\*Backend connecté J7*

**Livrables J6 :**
- Dashboard national avec tous les KPI en temps réel
- Scoring producteurs automatique
- Module Production Semencière (épurations, tests)

---

### Jour 7 (30-31 mars) — POLISH, VALIDATION & DEPLOY — 22 pts

**Milestone:** Application production-ready

| Story | Titre | Pts | Phase |
|-------|-------|-----|-------|
| STORY-034 | Tests qualité et certification (fin) | 1* | Backend |
| STORY-035 | Stock et distribution semences | 3 | UI+Backend |
| STORY-039 | Mutations Convex (modules core) | 8 | Backend polish |
| STORY-040 | Mutations Convex (semences + activités) | 5 | Backend polish |
| STORY-041 | Tests de validation croisée Excel | 3 | Test |
| STORY-042 | Polish, déploiement, validation finale | 5 | Deploy |
| STORY-004 | Mode dégradé hors-ligne (fin) | 4* | Polish |

*\*Finalisation des stories commencées les jours précédents*

**Livrables J7 :**
- Tous les modules connectés au backend
- Tests de calcul validés (bonus, scoring, performance)
- Déploiement production (Vercel + Convex)
- PWA installable et fonctionnelle
- Validation responsive (mobile, tablette, desktop)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Pts | Jour |
|---------|-----------|---------|-----------|------|
| EPIC-011 | Infrastructure Transverse | S-001, S-002, S-003, S-004, S-036, S-037, S-038, S-039, S-040, S-041, S-042 | 48 | J1-J7 |
| EPIC-001 | Auth & Rôles | S-005, S-006, S-007 | 8 | J1-J2 |
| EPIC-002 | Paramétrage | S-008, S-009 | 5 | J2 |
| EPIC-003 | Techniciens | S-010, S-011, S-012 | 10 | J2 |
| EPIC-004 | Suivi Mensuel | S-013, S-014, S-015 | 11 | J3 |
| EPIC-005 | Calendrier | S-016, S-017 | 8 | J3 |
| EPIC-006 | Inspection & Achat | S-018, S-019, S-020, S-021, S-022 | 21 | J4 |
| EPIC-007 | Transport | S-023, S-024, S-025 | 10 | J5 |
| EPIC-008 | Approvisionnement & Dashboard | S-026, S-027, S-028, S-029 | 14 | J5-J6 |
| EPIC-009 | Scoring Producteurs | S-030, S-031 | 6 | J6 |
| EPIC-010 | Production Semencière | S-032, S-033, S-034, S-035 | 14 | J6-J7 |
| **TOTAL** | **11 Epics** | **42 Stories** | **148 pts** | **7 jours** |

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Jour |
|-------|---------|-------|------|
| FR-001 | Auth & rôles | S-005, S-006, S-007 | J1-J2 |
| FR-002 | Paramètres métier | S-008 | J2 |
| FR-003 | Journal d'audit | S-009 | J2 |
| FR-004 | CRUD Techniciens | S-010, S-011 | J2 |
| FR-005 | Objectifs & performance | S-011 | J2 |
| FR-006 | Alertes performance | S-012 | J5 |
| FR-007 | Suivi mensuel | S-013 | J3 |
| FR-008 | Graphiques mensuels | S-014 | J3 |
| FR-009 | Export rapports | S-015 | J3 |
| FR-010 | Calendrier opérationnel | S-016 | J3 |
| FR-011 | Livrables activité | S-017 | J3 |
| FR-012 | Alertes retard | S-017 | J3 |
| FR-013 | Workflow inspection 7 étapes | S-018, S-019, S-020, S-021 | J4 |
| FR-014 | KPI Inspections | S-022 | J4 |
| FR-015 | Workflow transport | S-023 | J5 |
| FR-016 | KPI Transport | S-025 | J5 |
| FR-017 | Registre approvisionnement | S-026 | J5 |
| FR-018 | Dashboard KPI Performance | S-027 | J6 |
| FR-019 | Dashboard KPI Achat/Transport | S-028 | J6 |
| FR-020 | Détail bonus | S-029 | J6 |
| FR-021 | Producteurs & scoring | S-030, S-031 | J6 |
| FR-022 | Historique scoring | S-031 | J6 |
| FR-023 | Registre semenciers | S-032 | J6 |
| FR-024 | Épurations variétales | S-033 | J6 |
| FR-025 | Tests qualité semences | S-034 | J6-J7 |
| FR-026 | Stock & distribution | S-035 | J7 |
| FR-027 | Objectifs semenciers | S-032 | J6 |
| FR-028 | GPS & photos | S-037 | J1 |
| FR-029 | Notifications | S-003 | J5 |
| FR-030 | Réception paddy | S-024 | J5 |
| FR-031 | Navigation & layout | S-002 | J1 |
| FR-032 | Mode dégradé offline | S-004 | J5-J7 |

**Coverage: 32/32 FRs (100%)**

---

## Risks and Mitigation

**High:**
- **Délai 7 jours pour 42 stories** — Mitigation : vibecoding avec IA, UI-first (interfaces rapidement visibles), priorisation Must-Have
- **Qualité du code sous pression** — Mitigation : TypeScript strict, Convex validators, tests sur les calculs critiques (STORY-041)

**Medium:**
- **Web APIs (Camera/GPS) sur Android bas de gamme** — Mitigation : fallbacks (input file, saisie manuelle GPS), test sur appareil cible
- **Performance dashboard avec aggregations complexes** — Mitigation : indexes Convex bien définis, pagination partout
- **Mode offline dégradé insuffisant** — Mitigation : Service Worker minimal, scope limité (cache lecture + queue écriture simple)

**Low:**
- **Bundle size sur 3G** — Mitigation : code splitting par route, lazy loading des modules non critiques
- **Convex file storage limits** — Mitigation : compression photos agressive (< 500KB)

---

## Definition of Done

For a story to be considered complete:
- [ ] Code implémenté et fonctionnel
- [ ] Interface responsive (mobile + desktop)
- [ ] Validation côté client (Zod) + serveur (Convex validators)
- [ ] Permissions vérifiées (rôle approprié)
- [ ] Pas d'erreurs console
- [ ] Testé manuellement sur le flow principal
- [ ] Pour les calculs métier : validé contre les formules Excel

---

## shadcn/ui Components Plan

### Composants UI à installer (J1)

```bash
npx shadcn@latest add sidebar breadcrumb avatar badge button card
npx shadcn@latest add dialog form input label select separator
npx shadcn@latest add table tabs textarea toggle tooltip
npx shadcn@latest add alert alert-dialog checkbox combobox
npx shadcn@latest add dropdown-menu pagination popover progress
npx shadcn@latest add scroll-area sheet skeleton slider sonner
npx shadcn@latest add accordion spinner switch
npx shadcn@latest add chart
```

### Blocks à référencer

| Block | Usage | Story |
|-------|-------|-------|
| `sidebar-07` | Navigation principale (collapsible icons) | S-002 |
| `dashboard-01` | Base tableau de bord KPI | S-027 |
| `login-02` | Page connexion avec cover image | S-005 |
| `chart-bar-stacked` | Graphique suivi mensuel | S-014 |
| `chart-area-interactive` | Courbe cumulée vs objectif | S-014 |

---

## Next Steps

**Immédiat : Lancer le développement !**

```
Jour 1 → /bmad:dev-story STORY-001  (Initialisation projet)
       → /bmad:dev-story STORY-036  (Composants partagés)
       → /bmad:dev-story STORY-005  (Auth Clerk)
       → /bmad:dev-story STORY-002  (Layout + navigation)
```

Ou lancez directement le code — tous les détails d'implémentation sont dans les stories ci-dessus.

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*To continue: Run `/workflow-status` to see your progress, or start implementing with `/bmad:dev-story STORY-001`.*
