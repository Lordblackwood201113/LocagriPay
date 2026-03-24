# Product Brief: AgroPilot

**Date:** 2026-03-24
**Author:** LOCAGRI — Direction des Opérations
**Version:** 1.0
**Project Type:** web-app (PWA)
**Project Level:** 3

---

## Executive Summary

AgroPilot est la plateforme digitale de LOCAGRI qui remplace le classeur Excel multi-onglets actuellement utilisé pour le suivi des activités des techniciens agricoles de terrain. L'application centralise 10 modules fonctionnels — du registre des techniciens au scoring des producteurs en passant par l'inspection qualité paddy, le transport et la production semencière — dans une PWA responsive accessible sur web et mobile, avec un design moderne et épuré capable de rivaliser avec les meilleures applications du marché. Elle est destinée aux techniciens de terrain, coordinateurs régionaux, directeurs des opérations et réceptionnistes usine de LOCAGRI en Côte d'Ivoire.

---

## Problem Statement

### The Problem

LOCAGRI encadre un réseau de techniciens agricoles chargés de piloter l'agriculture contractuelle, l'approvisionnement en riz paddy et la production de semences certifiées. Actuellement, **tout le suivi repose sur un classeur Excel de 9 onglets** (PARAMETRES, REGISTRE TECHNICIENS, SUIVI MENSUEL, SUIVI ACTIVITÉS, FICHE ACHAT PADDY, FICHE TRANSPORT, APPROVISIONNEMENT, TABLEAU DE BORD, SCORING PRODUCTEURS) qui atteint ses limites :

- **Pas de traçabilité terrain** : aucune géolocalisation, photos horodatées ou preuves d'inspection
- **Pas de collaboration temps réel** : les techniciens saisissent sur papier puis un opérateur consolide manuellement dans Excel
- **Fiabilité des données compromise** : erreurs de saisie, formules cassées, versions concurrentes du fichier
- **Pas de scalabilité** : le fichier gère 15 techniciens et ~500 lignes d'approvisionnement, mais ne peut pas croître
- **Pas d'automatisation** : les calculs de bonus, scoring producteurs et alertes sont manuels ou semi-automatiques
- **Pas de mode terrain** : impossible de saisir depuis le champ sans connexion internet

### Why Now?

- La campagne 2026 démarre et le volume de données dépasse les capacités d'Excel
- La direction exige un pilotage en temps réel des KPI de performance et de collecte
- L'intégration de la chaîne semencière (nouveau module non présent dans l'Excel actuel) nécessite un outil adapté
- Les outils modernes (Convex, React, PWA) permettent de développer rapidement une solution robuste à moindre coût
- L'approche vibecoding permet de livrer en quelques jours ce qui prenait des mois

### Impact if Unsolved

- **Perte financière** : erreurs dans le calcul des bonus et des paiements producteurs (actuellement en FCFA sur formules Excel fragiles)
- **Perte de traçabilité** : impossible de tracer un lot de paddy du champ à l'usine, risque pour la qualité et la certification
- **Démotivation des techniciens** : processus papier-Excel lent et frustrant, pas de visibilité sur leurs performances
- **Risque de fraude** : sans photos horodatées et géolocalisées, les inspections ne peuvent être vérifiées
- **Incapacité à scaler** : impossible de passer de 15 à 50 techniciens avec le système actuel

---

## Target Audience

### Primary Users

| Rôle | Interface | Profil | Usage quotidien |
|------|-----------|--------|-----------------|
| **Technicien de terrain** (15-50) | Mobile (PWA) | Littératie numérique variable, travaille en zone rurale, smartphone Android | Inspections qualité, achats paddy, suivi transport, épurations semencières, mise à jour des activités |
| **Coordinateur régional** (3-5) | Web + Mobile | Cadre intermédiaire, à l'aise avec le digital | Supervision des techniciens, validation des achats, suivi KPI régionaux, gestion du calendrier |
| **Directeur des opérations** (1-2) | Web | Décideur, vision stratégique | Tableau de bord national, paramétrage des objectifs/bonus/seuils, rapports |

### Secondary Users

| Rôle | Interface | Usage |
|------|-----------|-------|
| **Administrateur système** | Web | Gestion utilisateurs, rôles, permissions, logs d'audit |
| **Réceptionniste usine** | Web/Tablette | Confirmation réceptions paddy, pesée arrivée, validation bons de réception |

### User Needs

1. **Techniciens** : un outil simple, guidé étape par étape (workflow d'inspection en 7 étapes), utilisable en conditions terrain (soleil, poussière, gants), fonctionnant avec une connexion dégradée
2. **Coordinateurs** : une vue consolidée des performances de leur région avec alertes automatiques quand un technicien passe en zone ALERTE ou RÉSILIATION
3. **Direction** : un tableau de bord décisionnel en temps réel avec KPI de performance globale, achat/transport, et calcul automatique des bonus

---

## Solution Overview

### Proposed Solution

**AgroPilot** — une Progressive Web App (PWA) responsive développée avec :

- **Frontend** : React 19 + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Backend-as-a-Service** : Convex (base de données temps réel, fonctions serverless, synchronisation automatique)
- **Authentification** : Clerk (gestion des rôles, SSO, sécurité enterprise)
- **Design** : Interface award-worthy, épurée et moderne, optimisée mobile-first

La PWA est installable sur smartphone (Android/iOS) via le navigateur, sans passer par les stores. Elle offre un mode dégradé hors-ligne (consultation des données en cache, saisie locale avec synchronisation au retour de la connexion).

### Key Features

**Module 1 — PARAMÈTRES & CONFIGURATION**
- Configuration des objectifs annuels (défaut : 300 T/technicien), seuils bonus (+10% = 330 T), seuil résiliation (-20% = 240 T)
- Prix d'achat référence (FCFA/kg), répartition petite/grande campagne (40%/60%)
- Seuils qualité paddy (humidité ≤14%, impuretés <3%, brisure <15%)
- Objectifs de production semencière
- Journal d'audit des modifications

**Module 2 — REGISTRE DES TECHNICIENS**
- Fiches complètes (nom, zone, contact, photo, pièces d'identité)
- Objectifs individuels avec ventilation automatique petite/grande campagne
- Calcul temps réel du tonnage réalisé et taux de réalisation
- Statuts automatiques : BONUS (≥330T) / CONFORME (≥300T) / ALERTE (<300T) / RÉSILIATION (<240T)
- Alertes automatiques aux coordinateurs

**Module 3 — SUIVI MENSUEL DE COLLECTE**
- Tableau croisé technicien × mois avec distinction petite/grande campagne
- Graphiques barres empilées et courbe cumulée vs objectif
- Export PDF et Excel
- Comparaison inter-campagnes

**Module 4 — CALENDRIER OPÉRATIONNEL & SUIVI DES ACTIVITÉS**
- Calendrier interactif avec phases colorées (inter-campagne, préparation, semis, végétation, récolte)
- 17 activités assignées aux techniciens avec statuts (Non démarré / En cours / Terminé / En retard)
- Gestion des livrables (upload photos, PV, rapports)
- Alertes de retard automatiques

**Module 5 — INSPECTION & ACHAT PADDY** *(cœur opérationnel)*
- Workflow guidé en 7 étapes : Déplacement → Photos stock → Échantillonnage → Analyse qualité → Décision → Négociation → Confirmation
- Géolocalisation automatique, photos horodatées (min. 3)
- Notation qualité 5 critères (/5) : aspect visuel, humidité (%), homogénéité, propreté, décorticage
- Calcul automatique du montant (poids × prix/kg)
- KPI : nb inspections, taux validation, humidité moyenne, tonnage validé

**Module 6 — TRANSPORT PADDY**
- Workflow : sélection transporteur → chauffeur (photo permis obligatoire) → chargement → destination → réception → clôture
- Calcul écart poids (départ − arrivée) avec alerte si écart > seuil
- Statistiques : taux de perte, coût moyen/tonne, répartition usine vs entrepôt

**Module 7 — APPROVISIONNEMENT GLOBAL**
- Registre centralisé alimenté automatiquement par le module Achat
- Classification : Contrat / Hors contrat / Spot
- Calcul automatique des montants FCFA
- Filtres avancés (technicien, fournisseur, type, date, zone, statut qualité)

**Module 8 — TABLEAU DE BORD & BONUS**
- KPI Performance : objectif global, total collecté, taux réalisation, techniciens par zone
- KPI Achat/Transport : inspections, taux validation, tonnage, coût transport, taux de perte
- Calcul automatique des bonus : si tonnage ≥ 330T → bonus = tonnage × 1000 × 1 FCFA/kg
- Détail par technicien avec visualisation graphique

**Module 9 — SCORING PRODUCTEURS**
- Fiches producteurs (nom, OP/GVC, zone, technicien référent, GPS parcelle)
- Scoring automatique : OR (≥95% livraison ET ≥4/5 qualité) / ARGENT (≥80% ET ≥3/5) / BRONZE (>0%) / EXCLU
- Historique multi-campagnes
- Flag producteur semencier

**Module 10 — PRODUCTION SEMENCIÈRE** *(nouveau module)*
- Registre producteurs semenciers avec parcelles GPS et variétés
- Suivi épurations variétales (3 passages : tallage, montaison, épiaison)
- Tests qualité semences (germination ≥85%, pureté ≥98%, humidité ≤12%)
- Dossier certification ANADER
- Gestion stock et distribution semences

### Value Proposition

AgroPilot transforme un processus papier-Excel fragmenté en une plateforme digitale unifiée qui offre :
- **Traçabilité complète** : chaque lot de paddy est tracé du champ à l'usine avec photos, GPS et horodatage
- **Automatisation** : calculs de bonus, scoring, alertes — zéro intervention manuelle
- **Temps réel** : la direction voit les performances en direct, pas en fin de mois
- **Mobilité** : les techniciens saisissent directement depuis le terrain
- **Fiabilité** : une source unique de vérité, pas de fichiers concurrents

---

## Business Objectives

### Goals

- **Digitaliser 100% des processus terrain** d'ici la mise en production (inspections, transport, suivi activités, production semencière)
- **Réduire de 90% le temps de consolidation des données** (de 2-3 jours/mois en Excel à temps réel)
- **Éliminer les erreurs de calcul** sur les bonus, scoring et KPI grâce à l'automatisation
- **Permettre le scaling** de 15 à 50 techniciens sans effort supplémentaire d'administration
- **Améliorer la traçabilité** de chaque lot de paddy avec preuve photographique et géolocalisation

### Success Metrics

- **Taux d'adoption** : 100% des techniciens utilisent l'app dans les 2 semaines post-déploiement
- **Réduction des erreurs** : 0 erreur de calcul de bonus sur la première campagne digitalisée
- **Temps de reporting** : tableau de bord à jour en temps réel (vs. consolidation manuelle hebdomadaire)
- **Complétude des inspections** : 100% des fiches d'achat avec photos et GPS
- **Satisfaction utilisateur** : score NPS ≥ 7/10 après 1 mois d'utilisation

### Business Value

- Économies sur le temps de consolidation manuelle (estimé : 3-5 jours-homme/mois)
- Réduction des fraudes grâce à la traçabilité photographique et GPS
- Meilleure gestion des bonus (calcul automatique = paiements justes = rétention des techniciens performants)
- Données fiables pour la prise de décision stratégique (objectifs, zones, campagnes)
- Intégration de la chaîne semencière dans un outil unique

---

## Scope

### In Scope

- **10 modules fonctionnels** détaillés ci-dessus (Paramètres, Registre, Suivi mensuel, Calendrier, Achat, Transport, Approvisionnement, Tableau de bord, Scoring, Production semencière)
- **PWA responsive** mobile-first avec installation sur smartphone
- **5 rôles utilisateurs** avec permissions granulaires via Clerk
- **Mode dégradé hors-ligne** (consultation en cache, saisie locale avec sync au retour connexion)
- **Géolocalisation** via Web Geolocation API
- **Prise de photos** via Web Camera API avec horodatage
- **Notifications** in-app et push (Web Push API)
- **Export** des rapports en PDF et Excel
- **Design award-worthy** avec shadcn/ui, animations fluides, dark mode optionnel
- **Localisation** : français, FCFA, dates DD/MM/YYYY, fuseau GMT (Abidjan)
- **Critères de validation robustes** sur tous les formulaires

### Out of Scope

- Application native (Play Store / App Store) — PWA uniquement
- Mode hors-ligne complet (offline-first avec sync complexe) — mode dégradé accepté
- Intégration ERP LOCAGRI (phase ultérieure)
- Passerelle SMS pour notifications producteurs
- Connexion humidimètre Bluetooth
- Cartes hors-ligne téléchargeables
- Signature électronique légale
- QR codes physiques pour les lots
- Multi-langue (français uniquement pour cette version)

### Future Considerations

- Application native si le besoin se confirme (React Native depuis la codebase existante)
- Mode offline-first complet avec Convex offline support (quand disponible)
- Intégration ERP et système comptable LOCAGRI
- API SMS pour communication producteurs
- Connexion Bluetooth humidimètre
- Module de cartographie avancée avec tuiles offline
- Module de paiement mobile (Mobile Money)
- Tableau de bord IA avec prédictions de rendement

---

## Key Stakeholders

- **Direction des Opérations LOCAGRI** — Influence haute. Commanditaire du projet, définit les objectifs stratégiques et les règles métier (seuils, bonus, scoring). Utilisateur principal du tableau de bord décisionnel.
- **Coordinateurs régionaux** — Influence moyenne. Supervisent les techniciens au quotidien, valident les achats, premières personnes impactées par la digitalisation.
- **Techniciens de terrain** — Influence moyenne. Utilisateurs principaux de l'app mobile, leur adoption est critique pour le succès du projet. Feedback terrain essentiel.
- **Équipe de développement LOCAGRI** — Influence haute. Développe et maintient l'application en interne. Approche vibecoding avec IA.

---

## Constraints and Assumptions

### Constraints

- **Délai** : livraison complète visée le 31 mars 2026 (approche vibecoding intensive sur 7 jours)
- **Stack imposée** : React + Vite + TypeScript, Convex (BaaS), Clerk (auth), shadcn/ui
- **Pas de stores** : PWA uniquement, pas de déploiement natif
- **Connectivité terrain** : zones rurales en Côte d'Ivoire avec couverture réseau intermittente
- **Appareils** : smartphones Android (principalement) de gamme variable, certains avec peu de RAM
- **Monnaie** : FCFA uniquement, formats numériques locaux (espace séparateur de milliers, virgule décimale)

### Assumptions

- Les techniciens disposent d'un smartphone Android avec navigateur Chrome récent
- La couverture réseau mobile (2G/3G minimum) est disponible au moins une fois par jour pour la synchronisation
- Convex gère la synchronisation temps réel et le stockage des données de manière fiable
- Clerk fournit une gestion des rôles suffisamment granulaire pour les 5 profils
- Les utilisateurs acceptent l'installation d'une PWA (vs application native)
- Le volume de données initial est faible (15 techniciens, ~500 lignes d'approvisionnement) et croîtra progressivement
- La direction LOCAGRI valide les règles métier telles que définies dans le cahier des charges

---

## Success Criteria

- **Fonctionnel** : les 10 modules sont opérationnels et couvrent 100% des fonctionnalités CRITIQUE et HAUTE du cahier des charges
- **Performance** : temps de chargement initial < 3s, interactions < 200ms, synchronisation en arrière-plan
- **Fiabilité** : aucune perte de données, calculs de bonus et scoring identiques aux règles Excel
- **Utilisabilité** : un technicien peut compléter un workflow d'inspection en moins de 10 minutes
- **Adoption** : 100% des techniciens actifs utilisent l'app dans les 2 semaines post-lancement
- **Design** : interface jugée "professionnelle et moderne" par la direction (benchmark : qualité Awwwards)
- **Validation** : chaque formulaire applique des règles de validation strictes (types, plages, obligatoires, cohérence métier)

### Critères de Validation Robustes

Les critères de validation suivants s'appliquent à travers toute l'application :

**Validation des données :**
- Champs obligatoires enforced sur tous les formulaires
- Types numériques validés (tonnage > 0, prix > 0, pourcentages 0-100, notes 1-5)
- Humidité : alerte si > 14%, blocage si > 20%
- Nombre de sacs échantillonnés ≥ 10% du stock (règle métier LOCAGRI)
- Photos minimum : 3 par inspection, 1 permis par transport
- Coordonnées GPS valides (plage Côte d'Ivoire : lat 4°-11°, lon -9°/-2°)
- Dates cohérentes (pas de dates futures, pas de dates avant début campagne)

**Validation métier :**
- Un technicien ne peut pas valider son propre achat au-delà d'un seuil (validation coordinateur requise)
- Le poids arrivée ne peut pas excéder le poids chargé (alerte si écart > seuil paramétrable)
- Le scoring producteur est recalculé automatiquement à chaque livraison
- Les seuils de performance (BONUS/CONFORME/ALERTE/RÉSILIATION) sont appliqués en temps réel
- Les épurations variétales suivent l'ordre obligatoire (tallage → montaison → épiaison)
- Test germination : blocage certification si taux < 85%

**Validation technique :**
- Protection contre la double soumission (debounce + idempotence)
- Validation côté client (UX immédiate) ET côté serveur (sécurité via Convex validators)
- Gestion des conflits de synchronisation (dernière écriture gagne avec notification)
- Taille max photos : 5 MB après compression
- Session Clerk avec timeout configurable et rafraîchissement automatique

---

## Timeline and Milestones

### Target Launch

**31 mars 2026** — Livraison complète de l'application (approche vibecoding intensive)

### Key Milestones

| Jour | Milestone | Livrables |
|------|-----------|-----------|
| J1 (24 mars) | **Foundation & Design System** | Projet initialisé (React+Vite+Convex+Clerk+shadcn), design system défini, layout principal, navigation, authentification |
| J2 (25 mars) | **Modules Config & Registre** | Module Paramètres fonctionnel, Registre Techniciens avec CRUD complet, calculs de statut automatiques |
| J3 (26 mars) | **Modules Suivi & Calendrier** | Suivi mensuel avec graphiques, Calendrier opérationnel interactif avec 17 activités |
| J4 (27 mars) | **Module Inspection & Achat** | Workflow 7 étapes complet avec photos, GPS, qualité, négociation, KPI |
| J5 (28 mars) | **Modules Transport & Approvisionnement** | Workflow transport, registre approvisionnement centralisé, calculs automatiques |
| J6 (29 mars) | **Tableau de Bord, Scoring & Semences** | Dashboard KPI complet, scoring producteurs automatique, module production semencière |
| J7 (30-31 mars) | **Polish, Validation & Déploiement** | Tests end-to-end, validation croisée avec les règles Excel, optimisation perf, déploiement production, mode dégradé offline |

### Stratégie de Développement

**Approche UI-first :**
1. Construire l'interface utilisateur complète d'abord (toutes les vues, navigation, composants)
2. Connecter progressivement le backend Convex (schéma, mutations, queries)
3. Tester au fur et à mesure du déploiement (validation continue)

---

## Risks and Mitigation

- **Risk:** Délai extrêmement serré (7 jours pour 10 modules)
  - **Likelihood:** Haute
  - **Mitigation:** Approche vibecoding avec IA, priorisation stricte des fonctionnalités CRITIQUE, possibilité d'étendre d'1-2 semaines si nécessaire

- **Risk:** Mode hors-ligne dégradé insuffisant pour le terrain
  - **Likelihood:** Moyenne
  - **Mitigation:** Cache agressif des données critiques, Service Worker pour les assets, file d'attente de sync locale. Évaluation terrain rapide avec techniciens pilotes.

- **Risk:** Adoption par les techniciens à faible littératie numérique
  - **Likelihood:** Moyenne
  - **Mitigation:** Interface guidée pas-à-pas (workflow), boutons larges, feedback visuel clair, codes couleurs familiers (identiques à l'Excel), formation courte avec vidéos tutoriels

- **Risk:** Performance sur smartphones Android entrée de gamme
  - **Likelihood:** Moyenne
  - **Mitigation:** Optimisation bundle (code splitting, lazy loading), compression images, pagination des longues listes, test sur appareils cibles

- **Risk:** Convex ne supporte pas un cas d'usage spécifique (hors-ligne, volume photos)
  - **Likelihood:** Faible
  - **Mitigation:** Stockage photos via Convex file storage avec compression côté client. Fallback possible vers un stockage externe (S3) si nécessaire.

- **Risk:** Règles métier mal implémentées (calculs bonus, scoring)
  - **Likelihood:** Moyenne
  - **Mitigation:** Validation croisée systématique avec les formules du fichier Excel. Tests unitaires sur chaque règle de calcul. Jeu de données de test reprenant les cas limites.

---

## Technical Architecture Summary

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (PWA)                   │
│  React 19 + Vite + TypeScript + shadcn/ui        │
│  Tailwind CSS · Service Worker · Web APIs         │
│  (Camera, Geolocation, Push Notifications)        │
├─────────────────────────────────────────────────┤
│              AUTHENTICATION                       │
│  Clerk (roles: admin, director, coordinator,      │
│         technician, receptionist)                  │
├─────────────────────────────────────────────────┤
│            BACKEND-AS-A-SERVICE                   │
│  Convex (real-time DB, serverless functions,       │
│          file storage, scheduled jobs)             │
└─────────────────────────────────────────────────┘
```

**Justification des choix :**
- **React + Vite** : écosystème mature, DX excellent, build rapide, large communauté
- **Convex** : temps réel natif (parfait pour le dashboard), TypeScript end-to-end, pas de serveur à gérer, sync automatique
- **Clerk** : auth robuste en 5 min, gestion des rôles, webhooks, intégration Convex native
- **shadcn/ui** : composants accessibles et customisables, pas de dépendance runtime, design system cohérent
- **PWA** : installable sans stores, fonctionne sur tous les OS, Service Worker pour le cache

---

## Next Steps

1. Créer le Product Requirements Document (PRD) — `/bmad:prd`
2. Définir l'architecture technique détaillée — `/bmad:architecture`
3. Lancer le sprint de développement — `/bmad:sprint-planning`

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
