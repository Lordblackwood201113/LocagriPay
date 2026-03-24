# Product Requirements Document: AgroPilot

**Date:** 2026-03-24
**Author:** LOCAGRI — Direction des Opérations
**Version:** 1.0
**Project Type:** web-app (PWA)
**Project Level:** 3
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for AgroPilot. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: `docs/product-brief-agropilot-2026-03-24.md`
- Cahier des Charges: `LOCAGRI_Cahier_des_Charges_Plateforme_Digitale_Suivi des techniciens (1).docx`
- Modèle Excel: `LOCAGRI_Suivi_Techniciens_2026_v2.xlsx`

---

## Executive Summary

AgroPilot digitalise le suivi des techniciens agricoles de LOCAGRI (Côte d'Ivoire), remplaçant un classeur Excel de 9 onglets par une PWA temps réel. La plateforme couvre 10 modules — du paramétrage à la production semencière — pour 5 profils utilisateurs (technicien, coordinateur, directeur, admin, réceptionniste). Stack : React/Vite + Convex + Clerk + shadcn/ui. Livraison cible : 31 mars 2026.

---

## Product Goals

### Business Objectives

- **OBJ-1:** Digitaliser 100% des processus terrain (inspections, transport, suivi activités, production semencière)
- **OBJ-2:** Réduire de 90% le temps de consolidation des données (de 2-3 jours/mois à temps réel)
- **OBJ-3:** Éliminer les erreurs de calcul sur les bonus, scoring et KPI
- **OBJ-4:** Permettre le scaling de 15 à 50 techniciens
- **OBJ-5:** Améliorer la traçabilité de chaque lot de paddy avec preuves photographiques et GPS

### Success Metrics

| Métrique | Cible | Méthode de mesure |
|----------|-------|-------------------|
| Taux d'adoption techniciens | 100% en 2 semaines | Connexions uniques / nb techniciens actifs |
| Erreurs de calcul bonus | 0 | Audit croisé avec règles Excel |
| Temps de reporting | Temps réel | Latence du tableau de bord |
| Complétude inspections | 100% avec photos+GPS | Fiches sans photos / total fiches |
| Satisfaction utilisateur | NPS ≥ 7/10 | Enquête à M+1 |

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Priorités MoSCoW :
- **Must Have** = CRITIQUE dans le CDC — le projet échoue sans
- **Should Have** = HAUTE dans le CDC — important, contournement possible
- **Could Have** = MOYENNE dans le CDC — souhaitable si le temps le permet

---

### FR-001: Authentification et gestion des rôles

**Priority:** Must Have

**Description:**
Le système doit permettre l'authentification sécurisée via Clerk avec 5 rôles distincts : Technicien terrain, Coordinateur régional, Directeur des opérations, Administrateur système, Réceptionniste usine. Chaque rôle a des permissions granulaires par module.

**Acceptance Criteria:**
- [ ] Un utilisateur peut se connecter avec email/mot de passe via Clerk
- [ ] Les 5 rôles sont configurés avec des permissions distinctes
- [ ] Un technicien ne peut accéder qu'aux modules mobile autorisés
- [ ] Un coordinateur voit uniquement les données de sa région
- [ ] Un directeur a accès complet à tous les modules web
- [ ] Un admin peut gérer les utilisateurs, rôles et permissions
- [ ] Un réceptionniste n'accède qu'au module réception
- [ ] La déconnexion expire la session correctement
- [ ] L'accès non autorisé à un module redirige vers une page d'erreur 403

**Dependencies:** Aucune

---

### FR-002: Configuration des paramètres métier

**Priority:** Must Have

**Description:**
La direction peut configurer les règles métier globales : objectif annuel par technicien (défaut 300T), seuil bonus (+10% = 330T), bonus unitaire (1 FCFA/kg), seuil résiliation (-20% = 240T), prix d'achat référence, répartition petite/grande campagne (40%/60%), seuils qualité paddy.

**Acceptance Criteria:**
- [ ] L'objectif annuel est modifiable (défaut : 300 T)
- [ ] Le seuil bonus est configurable (défaut : +10% = 330 T)
- [ ] Le bonus unitaire est configurable (défaut : 1 FCFA/kg)
- [ ] Le seuil résiliation est configurable (défaut : -20% = 240 T)
- [ ] Le prix d'achat référence est modifiable par zone et période
- [ ] La répartition PC/GC est configurable (défaut : 40%/60%)
- [ ] Les seuils qualité sont paramétrables : humidité max (14%), impuretés (<3%), brisure (<15%)
- [ ] Seul le rôle Directeur peut modifier les paramètres
- [ ] Validation : tous les champs numériques > 0, pourcentages 0-100

**Dependencies:** FR-001

---

### FR-003: Journal d'audit des paramètres

**Priority:** Should Have

**Description:**
Chaque modification de paramètre est journalisée avec l'identité de l'utilisateur, l'horodatage, l'ancienne et la nouvelle valeur.

**Acceptance Criteria:**
- [ ] Chaque modification crée une entrée d'audit (qui, quand, ancien→nouveau)
- [ ] Le journal est consultable avec filtres (date, utilisateur, paramètre)
- [ ] Le journal est en lecture seule (non modifiable)
- [ ] L'audit couvre tous les paramètres du module Configuration

**Dependencies:** FR-002

---

### FR-004: CRUD Fiches techniciens

**Priority:** Must Have

**Description:**
Gestion complète des fiches techniciens : nom, prénoms, zone affectée, contact, date d'entrée, photo, pièces d'identité numérisées. Affectation à une zone géographique et un portefeuille de producteurs.

**Acceptance Criteria:**
- [ ] Création d'un technicien avec tous les champs obligatoires (nom, prénom, zone, contact)
- [ ] Upload de photo de profil et pièces d'identité
- [ ] Affectation à une zone géographique (liste configurable)
- [ ] Modification et consultation de la fiche
- [ ] Désactivation (pas de suppression physique) d'un technicien
- [ ] Validation : nom/prénom non vides, contact format valide, zone obligatoire

**Dependencies:** FR-001

---

### FR-005: Objectifs individuels et calcul de performance

**Priority:** Must Have

**Description:**
Chaque technicien a un objectif annuel (défaut 300T) ventilé automatiquement en petite campagne (40%) et grande campagne (60%). Le tonnage réalisé est agrégé en temps réel depuis les livraisons validées. Le taux de réalisation et le statut sont calculés automatiquement.

**Acceptance Criteria:**
- [ ] L'objectif annuel est attribué à chaque technicien (modifiable individuellement)
- [ ] La ventilation PC/GC est calculée automatiquement selon le ratio configuré
- [ ] Le tonnage réalisé s'agrège en temps réel depuis les lots validés (module Achat)
- [ ] Le taux de réalisation (%) = tonnage réalisé / objectif
- [ ] Le statut est attribué automatiquement : BONUS (≥330T), CONFORME (≥300T), ALERTE (<300T), RÉSILIATION (<240T)
- [ ] Les seuils de statut utilisent les paramètres configurés (FR-002)
- [ ] Le code couleur est appliqué : vert (BONUS), bleu (CONFORME), orange (ALERTE), rouge (RÉSILIATION)

**Dependencies:** FR-002, FR-004

---

### FR-006: Alertes automatiques de performance

**Priority:** Should Have

**Description:**
Notification automatique au coordinateur et à la direction quand un technicien passe en zone ALERTE ou RÉSILIATION.

**Acceptance Criteria:**
- [ ] Une notification in-app est envoyée au coordinateur quand un technicien passe en ALERTE
- [ ] Une notification in-app est envoyée à la direction quand un technicien passe en RÉSILIATION
- [ ] Les notifications apparaissent dans un centre de notifications
- [ ] Les notifications non lues ont un badge compteur

**Dependencies:** FR-005

---

### FR-007: Suivi mensuel de collecte

**Priority:** Must Have

**Description:**
Tableau croisé technicien × mois affichant les tonnages collectés, avec distinction petite/grande campagne. Totaux annuels et % objectif calculés automatiquement.

**Acceptance Criteria:**
- [ ] Tableau avec colonnes : Technicien, Jan-Déc, Total Annuel, % Objectif
- [ ] Les données sont alimentées automatiquement par les livraisons validées
- [ ] Distinction visuelle petite campagne / grande campagne
- [ ] Totaux par colonne (équipe) et par ligne (technicien)
- [ ] Code couleur sur le % objectif selon les zones de performance
- [ ] Les données se mettent à jour en temps réel (Convex reactivity)

**Dependencies:** FR-005

---

### FR-008: Graphiques de suivi mensuel

**Priority:** Should Have

**Description:**
Visualisations graphiques du suivi mensuel : barres empilées par mois, courbe cumulée vs objectif. Comparaison inter-campagnes.

**Acceptance Criteria:**
- [ ] Graphique en barres empilées (mensuel) avec code couleur par campagne
- [ ] Courbe cumulée du tonnage vs ligne d'objectif
- [ ] Filtre par technicien ou vue globale équipe
- [ ] Comparaison superposée entre campagnes (si données historiques disponibles)

**Dependencies:** FR-007

---

### FR-009: Export des rapports

**Priority:** Should Have

**Description:**
Génération de rapports exportables au format PDF et Excel depuis le back-office web.

**Acceptance Criteria:**
- [ ] Export du suivi mensuel en PDF (mise en page propre avec en-tête LOCAGRI)
- [ ] Export du suivi mensuel en Excel (.xlsx)
- [ ] Export du tableau de bord en PDF
- [ ] Export de la liste des producteurs avec scoring en Excel
- [ ] Bouton d'export accessible uniquement aux rôles Coordinateur+

**Dependencies:** FR-007

---

### FR-010: Calendrier opérationnel interactif

**Priority:** Must Have

**Description:**
Affichage du calendrier opérationnel avec 17 activités réparties en phases colorées (inter-campagne, préparation, semis, végétation, récolte). Chaque activité est assignée à des techniciens avec suivi de statut.

**Acceptance Criteria:**
- [ ] Les 17 activités du calendrier opérationnel sont affichées
- [ ] Les phases sont identifiées par des couleurs distinctes
- [ ] Chaque activité affiche : mois, semaine, phase, nom, livrable attendu, technicien(s), statut
- [ ] Les statuts possibles : Non démarré, En cours, Terminé, En retard, N/A
- [ ] Un technicien peut mettre à jour le statut depuis son interface mobile
- [ ] Les activités d'achat/transport et semences sont intégrées au calendrier

**Dependencies:** FR-004

---

### FR-011: Gestion des livrables d'activité

**Priority:** Should Have

**Description:**
Chaque activité est liée à des livrables attendus. Le technicien peut téléverser les livrables (photos, PV, rapports).

**Acceptance Criteria:**
- [ ] Chaque activité affiche la liste des livrables attendus
- [ ] Upload de fichiers (photos, PDF) depuis mobile et web
- [ ] Indicateur visuel : livrable fourni / manquant
- [ ] Les livrables sont consultables par le coordinateur et la direction

**Dependencies:** FR-010

---

### FR-012: Alertes de retard d'activité

**Priority:** Should Have

**Description:**
Notification automatique quand une activité dépasse sa date limite sans être marquée Terminé.

**Acceptance Criteria:**
- [ ] Le système détecte les activités dont la date limite est dépassée
- [ ] Le statut passe automatiquement à "En retard"
- [ ] Une notification est envoyée au technicien et au coordinateur
- [ ] Vue filtrée des activités en retard accessible au coordinateur

**Dependencies:** FR-010

---

### FR-013: Workflow d'inspection et achat paddy (7 étapes)

**Priority:** Must Have

**Description:**
Workflow mobile guidé en 7 étapes pour l'inspection et l'achat de paddy : (1) Déplacement avec GPS auto, (2) Photos stock (min. 3), (3) Échantillonnage (règle 10%), (4) Analyse qualité 5 critères, (5) Décision validé/rejeté, (6) Négociation prix, (7) Confirmation récapitulative.

**Acceptance Criteria:**
- [ ] **Étape 1 — Déplacement** : capture GPS automatique, sélection fournisseur (existant ou nouveau)
- [ ] **Étape 2 — Photos stock** : prise de photos in-app (minimum 3), horodatage et géolocalisation auto, saisie nb sacs et estimation kg
- [ ] **Étape 3 — Échantillonnage** : saisie nb sacs échantillonnés, alerte si <10% du stock
- [ ] **Étape 4 — Analyse qualité** : notation 5 critères (/5) : aspect visuel, humidité (%), homogénéité, propreté, décorticage. Alerte si humidité >14%
- [ ] **Étape 5 — Décision** : boutons VALIDÉ / REJETÉ, commentaire obligatoire dans les deux cas
- [ ] **Étape 6 — Négociation** : saisie prix négocié/kg avec affichage prix référence, pesage final, calcul montant auto (poids × prix)
- [ ] **Étape 7 — Confirmation** : récapitulatif complet de l'opération, possibilité de revenir en arrière
- [ ] Navigation step-by-step avec progression visuelle (stepper)
- [ ] Impossible de passer à l'étape suivante sans compléter l'étape courante
- [ ] Validation : humidité 0-30%, notes 1-5, prix >0, poids >0, min 3 photos

**Dependencies:** FR-001, FR-004

---

### FR-014: KPI Inspections et achats

**Priority:** Must Have

**Description:**
Calcul automatique des indicateurs d'inspection : nombre d'inspections réalisées, lots validés/rejetés, taux de validation, humidité moyenne, note qualité moyenne, tonnage validé.

**Acceptance Criteria:**
- [ ] Nb inspections réalisées (total, par technicien, par période)
- [ ] Nb lots validés et nb lots rejetés
- [ ] Taux de validation (%) = validés / total
- [ ] Humidité moyenne des lots inspectés
- [ ] Note qualité moyenne (sur les 5 critères)
- [ ] Poids total validé en kg et tonnes
- [ ] Filtrable par technicien, période, zone

**Dependencies:** FR-013

---

### FR-015: Workflow transport paddy (6 étapes)

**Priority:** Must Have

**Description:**
Workflow de suivi transport : (1) Sélection transporteur, (2) Chauffeur avec photo permis obligatoire, (3) Chargement avec liaison fiche achat, (4) Destination, (5) Réception avec contrôle écart poids, (6) Clôture.

**Acceptance Criteria:**
- [ ] **Sélection transporteur** : choix dans BDD ou création nouvelle fiche (nom, contact, type véhicule, immatriculation, prix)
- [ ] **Type véhicule** : liste déroulante (Camion bâché, non bâché, Camionnette, Pick-up, Tricycle, Autre)
- [ ] **Chauffeur** : nom, n° permis, photo permis obligatoire prise in-app (blocage si non fournie)
- [ ] **Chargement** : poids chargé, liaison automatique avec la fiche d'achat
- [ ] **Destination** : sélection (Usine LOCAGRI / Entrepôt intermédiaire), GPS
- [ ] **Réception** : poids arrivée, calcul écart auto (chargé − arrivée), alerte si écart > seuil
- [ ] **Clôture** : vérification complétude du dossier
- [ ] Validation : poids >0, poids arrivée ≤ poids chargé + tolérance, photo permis requise

**Dependencies:** FR-013

---

### FR-016: KPI Transport

**Priority:** Should Have

**Description:**
Statistiques transport calculées automatiquement : nombre de transports, poids chargé/reçu, écart, taux de perte, coût total/moyen, répartition usine vs entrepôt.

**Acceptance Criteria:**
- [ ] Nb transports, poids total chargé, poids total reçu, écart total
- [ ] Taux de perte (%) = |écarts| / poids chargé total
- [ ] Coût total transport et coût moyen par tonne
- [ ] Répartition livraisons usine vs entrepôt intermédiaire
- [ ] Alerte : photos permis manquantes

**Dependencies:** FR-015

---

### FR-017: Registre d'approvisionnement centralisé

**Priority:** Must Have

**Description:**
Chaque livraison validée (module Achat) alimente automatiquement le registre d'approvisionnement. Classification par type (Contrat, Hors contrat, Spot). Calcul des montants FCFA.

**Acceptance Criteria:**
- [ ] Les lots validés (FR-013) alimentent automatiquement le registre
- [ ] Chaque entrée affiche : date, technicien, fournisseur, type, quantité (kg), qualité, humidité, prix/kg, montant FCFA
- [ ] Classification par type d'achat : Contrat / Hors contrat / Spot
- [ ] Calcul automatique : quantité × prix/kg = montant
- [ ] Conversion automatique kg ↔ tonnes
- [ ] Filtres : technicien, fournisseur, type, date, zone, statut qualité
- [ ] Pagination pour les volumes importants (>500 lignes)

**Dependencies:** FR-013

---

### FR-018: Tableau de bord KPI Performance globale

**Priority:** Must Have

**Description:**
Dashboard principal affichant les KPI de performance globale : objectif global équipe, total collecté, taux de réalisation, répartition des techniciens par zone de performance, budget bonus estimé.

**Acceptance Criteria:**
- [ ] Objectif global équipe (T) = objectif unitaire × nb techniciens actifs
- [ ] Total collecté (T) = somme des tonnages mensuels
- [ ] Taux de réalisation global (%) = total collecté / objectif global
- [ ] Nb techniciens par zone : BONUS / CONFORME / ALERTE / RÉSILIATION (avec badges colorés)
- [ ] Budget bonus estimé (FCFA) = Σ(tonnage × 1000 × bonus/kg) pour chaque technicien ≥ seuil
- [ ] Données temps réel (réactivité Convex)
- [ ] Accès : Directeur et Coordinateur

**Dependencies:** FR-005, FR-014, FR-016

---

### FR-019: Tableau de bord KPI Achat & Transport

**Priority:** Must Have

**Description:**
Section du dashboard affichant les KPI opérationnels : inspections, taux de validation, tonnage inspecté, transports, coût transport, taux de perte.

**Acceptance Criteria:**
- [ ] Nb inspections / lots validés / lots rejetés
- [ ] Taux de validation (%)
- [ ] Tonnage inspecté validé (T)
- [ ] Nb transports / tonnage transporté
- [ ] Coût total transport / coût moyen par tonne
- [ ] Taux de perte transport (%)
- [ ] Photos permis manquantes (comptage)
- [ ] Filtrable par période et par technicien

**Dependencies:** FR-014, FR-016

---

### FR-020: Détail bonus par technicien

**Priority:** Must Have

**Description:**
Vue détaillée affichant pour chaque technicien : objectif, réalisé, écart, % objectif, zone de performance, montant du bonus calculé automatiquement.

**Acceptance Criteria:**
- [ ] Tableau avec colonnes : Technicien, Objectif (T), Réalisé (T), Écart (T), % Objectif, Zone, Bonus (FCFA)
- [ ] Bonus calculé : si tonnage ≥ seuil bonus → tonnage × 1000 × bonus unitaire FCFA/kg
- [ ] Tri par colonne
- [ ] Total bonus équipe en pied de tableau
- [ ] Export en Excel et PDF

**Dependencies:** FR-005, FR-002

---

### FR-021: CRUD Fiches producteurs et scoring automatique

**Priority:** Must Have

**Description:**
Gestion des fiches producteurs avec scoring automatique. Fiche : nom, OP/GVC, zone, technicien référent, coordonnées. Suivi quantités livrées vs contractées. Scoring : OR / ARGENT / BRONZE / EXCLU.

**Acceptance Criteria:**
- [ ] Création/modification/consultation d'une fiche producteur
- [ ] Champs : nom, OP/GVC, zone, technicien référent, contact, coordonnées GPS parcelle
- [ ] Quantité livrée agrégée automatiquement depuis le module Approvisionnement
- [ ] Quantité contractée saisie manuellement
- [ ] Taux de livraison calculé automatiquement (livrée / contractée)
- [ ] Note qualité moyenne (/5) agrégée depuis les inspections
- [ ] Scoring automatique :
  - OR : taux livraison ≥ 95% ET qualité ≥ 4/5
  - ARGENT : taux ≥ 80% ET qualité ≥ 3/5
  - BRONZE : taux > 0%
  - EXCLU : non-livraison ou fraude documentée
- [ ] Badge visuel pour le scoring (couleur + icône)
- [ ] Flag "producteur semencier" avec lien vers module semencier
- [ ] Validation : nom obligatoire, note qualité 1-5, quantités ≥ 0

**Dependencies:** FR-017

---

### FR-022: Historique scoring multi-campagnes

**Priority:** Should Have

**Description:**
Conservation et affichage du scoring sur plusieurs campagnes pour suivi de la fidélité producteur.

**Acceptance Criteria:**
- [ ] Le scoring est archivé à la clôture de chaque campagne
- [ ] L'historique est consultable sur la fiche producteur
- [ ] Visualisation de l'évolution du scoring (tableau ou graphique simple)

**Dependencies:** FR-021

---

### FR-023: Registre producteurs semenciers

**Priority:** Must Have

**Description:**
Fiche dédiée aux producteurs semenciers : nom, OP, parcelle GPS, variété multipliée, source semences de base, objectif assigné (kg). Suivi parcelle avec carte GPS, surface, distance d'isolement.

**Acceptance Criteria:**
- [ ] Fiche producteur semencier avec : nom, OP, parcelle GPS, variété, source semences, objectif (kg)
- [ ] Carte de la parcelle avec coordonnées GPS
- [ ] Surface de la parcelle et distance d'isolement documentée
- [ ] Liaison avec la fiche producteur standard (FR-021)
- [ ] Liste filtrable des producteurs semenciers

**Dependencies:** FR-021

---

### FR-024: Suivi épurations variétales

**Priority:** Must Have

**Description:**
Check-list des 3 passages obligatoires d'épuration (tallage, montaison, épiaison). Documentation avec photos avant/après et comptage des hors-types retirés.

**Acceptance Criteria:**
- [ ] Check-list de 3 passages dans l'ordre : tallage → montaison → épiaison
- [ ] Chaque passage : date, photos avant/après, nombre de hors-types retirés, commentaire
- [ ] Impossible de valider un passage si le précédent n'est pas complété
- [ ] Alerte si date d'épuration dépassée sans validation
- [ ] Vue récapitulative des épurations par parcelle

**Dependencies:** FR-023

---

### FR-025: Tests qualité semences et certification

**Priority:** Must Have

**Description:**
Saisie des résultats de tests qualité semences (germination, pureté, humidité). Constitution du dossier de certification ANADER avec suivi de statut.

**Acceptance Criteria:**
- [ ] Saisie test germination (%) — requis ≥ 85%, alerte si en dessous
- [ ] Saisie pureté variétale (%) — requis ≥ 98%
- [ ] Saisie humidité (%) — requis ≤ 12%
- [ ] Blocage de la certification si un critère n'est pas atteint
- [ ] Suivi statut dossier ANADER : Soumis / En cours / Certifié / Rejeté
- [ ] Vue récapitulative du dossier complet

**Dependencies:** FR-024

---

### FR-026: Stock et distribution semences

**Priority:** Should Have

**Description:**
Gestion du stock de semences certifiées disponibles et suivi de la distribution aux producteurs éligibles.

**Acceptance Criteria:**
- [ ] Vue du stock disponible par variété et par lot
- [ ] Enregistrement des distributions (date, producteur, quantité, variété)
- [ ] Solde mis à jour automatiquement
- [ ] Suivi objectif tonnage semences vs réalisé par technicien

**Dependencies:** FR-025

---

### FR-027: Objectifs de production semencière

**Priority:** Should Have

**Description:**
Suivi du tonnage de semences produites vs objectif assigné par technicien et par campagne.

**Acceptance Criteria:**
- [ ] Objectif semencier paramétrable par technicien et campagne
- [ ] Tonnage produit agrégé depuis les lots certifiés
- [ ] Taux de réalisation semencier avec indicateur visuel
- [ ] Intégré au tableau de bord du technicien

**Dependencies:** FR-023, FR-002

---

### FR-028: Capture GPS et photos horodatées

**Priority:** Must Have

**Description:**
Chaque opération terrain capture automatiquement les coordonnées GPS. Les photos sont prises in-app avec horodatage et géolocalisation automatiques. Compression avant synchronisation.

**Acceptance Criteria:**
- [ ] La position GPS est capturée automatiquement à chaque opération (Web Geolocation API)
- [ ] Les photos sont prises uniquement via l'appareil intégré à l'app (pas de sélection galerie)
- [ ] Chaque photo est horodatée (date + heure) et géolocalisée automatiquement
- [ ] Compression des photos côté client avant upload (cible : < 500 KB)
- [ ] Validation GPS : coordonnées dans la plage Côte d'Ivoire (lat 4°-11°, lon -9°/-2°)
- [ ] Fallback gracieux si GPS indisponible (saisie manuelle de la localisation)

**Dependencies:** Aucune

---

### FR-029: Centre de notifications

**Priority:** Should Have

**Description:**
Centre de notifications in-app centralisant toutes les alertes : performance techniciens, humidité hors norme, perte transport, activités en retard, épurations manquées, tests échoués.

**Acceptance Criteria:**
- [ ] Liste des notifications avec horodatage et type
- [ ] Badge compteur de notifications non lues
- [ ] Filtrage par type de notification
- [ ] Marquage lu/non lu
- [ ] Notifications push (Web Push API) pour les alertes critiques (si permission accordée)

**Dependencies:** FR-006, FR-012

---

### FR-030: Confirmation réception paddy (Réceptionniste)

**Priority:** Must Have

**Description:**
Le réceptionniste usine confirme les réceptions de paddy : saisie poids arrivée, validation du bon de réception, liaison avec la fiche transport.

**Acceptance Criteria:**
- [ ] Interface dédiée réceptionniste pour les réceptions en attente
- [ ] Saisie du poids arrivée avec balance
- [ ] Calcul automatique de l'écart (poids chargé − poids arrivée)
- [ ] Alerte visuelle si écart > seuil paramétré
- [ ] Validation du bon de réception (génération numérique)
- [ ] Liaison automatique avec la fiche transport correspondante

**Dependencies:** FR-015

---

### FR-031: Navigation et layout responsive

**Priority:** Must Have

**Description:**
Layout principal avec navigation adaptative : sidebar sur desktop, bottom navigation sur mobile. Branding LOCAGRI. Design épuré et moderne (shadcn/ui).

**Acceptance Criteria:**
- [ ] Sidebar de navigation sur desktop (≥1024px) avec les modules accessibles selon le rôle
- [ ] Bottom navigation sur mobile (<1024px) avec les actions principales
- [ ] Header avec logo LOCAGRI, nom utilisateur, notifications, déconnexion
- [ ] Breadcrumbs pour la navigation hiérarchique
- [ ] Transitions et animations fluides
- [ ] Dark mode optionnel
- [ ] Le layout s'adapte correctement entre 320px et 1920px

**Dependencies:** FR-001

---

### FR-032: Mode dégradé hors-ligne

**Priority:** Should Have

**Description:**
Service Worker pour le cache des assets et des données récentes. File d'attente locale pour les saisies hors connexion avec synchronisation au retour réseau.

**Acceptance Criteria:**
- [ ] Les assets statiques (HTML, CSS, JS) sont en cache via Service Worker
- [ ] Les données récentes sont consultables hors connexion (cache Convex)
- [ ] Indicateur visuel du statut de connexion (en ligne / hors ligne / sync en cours)
- [ ] Les formulaires saisis hors connexion sont mis en file d'attente locale
- [ ] Synchronisation automatique au retour de la connexion
- [ ] Notification à l'utilisateur après synchronisation réussie

**Dependencies:** Aucune

---

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: Performance — Temps de réponse

**Priority:** Must Have

**Description:**
L'application doit être rapide et réactive pour une utilisation terrain confortable.

**Acceptance Criteria:**
- [ ] Chargement initial de la PWA < 3 secondes (3G)
- [ ] Navigation entre pages < 500ms
- [ ] Soumission de formulaires < 1 seconde (en ligne)
- [ ] Recherche et filtrage < 500ms
- [ ] Rendu du tableau de bord < 2 secondes

**Rationale:** Les techniciens travaillent en conditions terrain avec connectivité variable. La performance est critique pour l'adoption.

---

### NFR-002: Performance — Capacité

**Priority:** Must Have

**Description:**
Le système doit supporter le volume de données prévu par LOCAGRI.

**Acceptance Criteria:**
- [ ] Support de 50 techniciens simultanés
- [ ] Support de 5 000 fiches producteurs
- [ ] Support de 10 000 transactions par campagne
- [ ] Support de 50 000 photos par an (compressées)
- [ ] Pagination efficace des listes >100 éléments

**Rationale:** Dimensionné pour la croissance de LOCAGRI de 15 à 50 techniciens.

---

### NFR-003: Sécurité — Authentification et autorisation

**Priority:** Must Have

**Description:**
Sécurité enterprise via Clerk avec protection des données.

**Acceptance Criteria:**
- [ ] Authentification via Clerk (email/password, possibilité SSO futur)
- [ ] Sessions avec expiration configurable et refresh automatique
- [ ] Protection RBAC sur toutes les routes et mutations Convex
- [ ] Impossible d'accéder aux données d'une région non assignée (coordinateur)
- [ ] Les mutations Convex valident les permissions côté serveur

**Rationale:** Les données de production et les calculs financiers (bonus FCFA) doivent être protégés.

---

### NFR-004: Sécurité — Intégrité des données

**Priority:** Must Have

**Description:**
Protection contre la corruption et la perte de données.

**Acceptance Criteria:**
- [ ] Validation côté client ET côté serveur (Convex argument validators)
- [ ] Protection contre la double soumission (debounce + idempotence)
- [ ] Pas de suppression physique (soft delete avec flag)
- [ ] Transactions atomiques pour les opérations multi-tables

**Rationale:** Les calculs de bonus et de scoring ont un impact financier direct.

---

### NFR-005: Scalabilité

**Priority:** Should Have

**Description:**
L'architecture doit permettre la croissance sans refonte.

**Acceptance Criteria:**
- [ ] Convex gère automatiquement le scaling (serverless)
- [ ] Les requêtes sont paginées (pas de chargement de toutes les données)
- [ ] Les index Convex sont définis pour les requêtes fréquentes
- [ ] Le bundle JS est code-splitted par route

**Rationale:** Passage de 15 à 50 techniciens sans modification de l'infrastructure.

---

### NFR-006: Disponibilité

**Priority:** Should Have

**Description:**
L'application doit être disponible en permanence pour le terrain.

**Acceptance Criteria:**
- [ ] Disponibilité web 99,5% (hébergement Convex + Vercel/Netlify)
- [ ] PWA fonctionnelle en mode dégradé hors-ligne
- [ ] Pas de fenêtre de maintenance requise (déploiements zero-downtime)

**Rationale:** Les techniciens travaillent sur des cycles de campagne sans interruption.

---

### NFR-007: Utilisabilité — Mobile-first

**Priority:** Must Have

**Description:**
L'interface doit être optimisée pour une utilisation terrain sur smartphone.

**Acceptance Criteria:**
- [ ] Interface responsive mobile-first (conception pour 375px puis adaptation desktop)
- [ ] Boutons et zones tactiles ≥ 44px minimum
- [ ] Texte lisible sans zoom (body ≥ 16px)
- [ ] Navigation guidée par workflow (step-by-step) pour les processus complexes
- [ ] Feedback visuel et haptique à chaque action
- [ ] Lisibilité en extérieur (contraste élevé)

**Rationale:** Les techniciens utilisent l'app sur smartphone en plein champ.

---

### NFR-008: Utilisabilité — Accessibilité

**Priority:** Should Have

**Description:**
L'application respecte les standards d'accessibilité de base.

**Acceptance Criteria:**
- [ ] Composants shadcn/ui conformes WCAG 2.1 AA par défaut
- [ ] Navigation clavier fonctionnelle
- [ ] Labels sur tous les champs de formulaire
- [ ] Contraste minimum 4.5:1 pour le texte

**Rationale:** Certains utilisateurs peuvent avoir des difficultés visuelles. shadcn/ui offre l'accessibilité nativement.

---

### NFR-009: Localisation

**Priority:** Must Have

**Description:**
L'application est localisée pour la Côte d'Ivoire.

**Acceptance Criteria:**
- [ ] Langue : français
- [ ] Monnaie : FCFA (formatage avec séparateur de milliers espace, pas de décimale)
- [ ] Dates : DD/MM/YYYY
- [ ] Fuseau horaire : GMT (Abidjan)
- [ ] Nombres : séparateur de milliers espace, décimale virgule

**Rationale:** Convention LOCAGRI et norme UEMOA.

---

### NFR-010: Qualité du code et maintenabilité

**Priority:** Should Have

**Description:**
Le code doit être maintenable et de qualité professionnelle.

**Acceptance Criteria:**
- [ ] TypeScript strict (no any)
- [ ] Schéma Convex typé avec validators
- [ ] Structure de fichiers cohérente et prévisible
- [ ] Composants réutilisables via shadcn/ui
- [ ] Nommage cohérent (camelCase TS, kebab-case fichiers)

**Rationale:** L'application sera maintenue et étendue par l'équipe LOCAGRI.

---

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

---

### EPIC-001: Authentification et Système de Rôles

**Description:**
Mise en place de l'authentification Clerk avec 5 rôles (technicien, coordinateur, directeur, admin, réceptionniste), protection des routes et des mutations Convex par rôle.

**Functional Requirements:**
- FR-001: Authentification et gestion des rôles

**Story Count Estimate:** 3-5

**Priority:** Must Have

**Business Value:**
Fondation sécuritaire de toute l'application. Sans auth, aucun module ne peut être déployé en production.

---

### EPIC-002: Paramétrage et Configuration Métier

**Description:**
Module de configuration des règles métier (objectifs, seuils, prix, qualité) avec journal d'audit.

**Functional Requirements:**
- FR-002: Configuration des paramètres métier
- FR-003: Journal d'audit des paramètres

**Story Count Estimate:** 3-4

**Priority:** Must Have

**Business Value:**
Les paramètres gouvernent tous les calculs automatiques (bonus, scoring, alertes). C'est la source de vérité métier.

---

### EPIC-003: Gestion des Techniciens

**Description:**
Registre complet des techniciens avec fiches, objectifs, calcul de performance automatique, statuts et alertes.

**Functional Requirements:**
- FR-004: CRUD Fiches techniciens
- FR-005: Objectifs individuels et calcul de performance
- FR-006: Alertes automatiques de performance

**Story Count Estimate:** 5-7

**Priority:** Must Have

**Business Value:**
Module central qui connecte les techniciens à leurs objectifs et déclenche les alertes de performance. Requis par tous les modules opérationnels.

---

### EPIC-004: Suivi Mensuel de Collecte

**Description:**
Tableau croisé technicien × mois avec graphiques, comparaisons et exports.

**Functional Requirements:**
- FR-007: Suivi mensuel de collecte
- FR-008: Graphiques de suivi mensuel
- FR-009: Export des rapports

**Story Count Estimate:** 4-5

**Priority:** Must Have (tableau) / Should Have (graphiques, export)

**Business Value:**
Vue consolidée mensuelle remplaçant directement l'onglet SUIVI MENSUEL du fichier Excel. Pilotage de la campagne en cours.

---

### EPIC-005: Calendrier Opérationnel

**Description:**
Calendrier interactif avec 17 activités, gestion des statuts, livrables et alertes de retard.

**Functional Requirements:**
- FR-010: Calendrier opérationnel interactif
- FR-011: Gestion des livrables d'activité
- FR-012: Alertes de retard d'activité

**Story Count Estimate:** 4-6

**Priority:** Must Have (calendrier) / Should Have (livrables, alertes)

**Business Value:**
Remplace l'onglet SUIVI ACTIVITÉS. Permet au coordinateur de piloter les 17 activités opérationnelles et détecter les retards.

---

### EPIC-006: Inspection & Achat Paddy

**Description:**
Cœur opérationnel — workflow d'inspection en 7 étapes avec photos, GPS, qualité, négociation. KPI associés.

**Functional Requirements:**
- FR-013: Workflow d'inspection et achat paddy (7 étapes)
- FR-014: KPI Inspections et achats
- FR-028: Capture GPS et photos horodatées

**Story Count Estimate:** 6-8

**Priority:** Must Have

**Business Value:**
Module le plus critique. Digitalise le processus d'achat paddy avec traçabilité complète (photos, GPS, qualité). Remplace l'onglet FICHE ACHAT PADDY (322 lignes, 18 colonnes).

---

### EPIC-007: Transport Paddy

**Description:**
Workflow de transport avec suivi du chargement à la réception, contrôle des écarts de poids, photo permis obligatoire.

**Functional Requirements:**
- FR-015: Workflow transport paddy (6 étapes)
- FR-016: KPI Transport
- FR-030: Confirmation réception paddy

**Story Count Estimate:** 5-6

**Priority:** Must Have

**Business Value:**
Traçabilité du paddy du site fournisseur à l'usine. Détection des pertes. Remplace l'onglet FICHE TRANSPORT (316 lignes, 17 colonnes).

---

### EPIC-008: Approvisionnement & Tableau de Bord

**Description:**
Registre d'approvisionnement centralisé alimenté automatiquement + tableau de bord décisionnel avec tous les KPI (performance, achat, transport, bonus).

**Functional Requirements:**
- FR-017: Registre d'approvisionnement centralisé
- FR-018: Tableau de bord KPI Performance globale
- FR-019: Tableau de bord KPI Achat & Transport
- FR-020: Détail bonus par technicien

**Story Count Estimate:** 6-8

**Priority:** Must Have

**Business Value:**
Remplace les onglets APPROVISIONNEMENT et TABLEAU DE BORD. Vision temps réel pour la direction. Calcul automatique des bonus.

---

### EPIC-009: Scoring Producteurs

**Description:**
Gestion des producteurs avec scoring automatique (OR/ARGENT/BRONZE/EXCLU) basé sur les livraisons et la qualité.

**Functional Requirements:**
- FR-021: CRUD Fiches producteurs et scoring automatique
- FR-022: Historique scoring multi-campagnes

**Story Count Estimate:** 4-5

**Priority:** Must Have

**Business Value:**
Remplace l'onglet SCORING PRODUCTEURS (109 lignes, 11 colonnes). Permet d'évaluer la fiabilité des producteurs et de piloter les contrats.

---

### EPIC-010: Production Semencière

**Description:**
Nouveau module couvrant le cycle complet de production de semences certifiées : producteurs semenciers, épurations, tests qualité, certification ANADER, stock et distribution.

**Functional Requirements:**
- FR-023: Registre producteurs semenciers
- FR-024: Suivi épurations variétales
- FR-025: Tests qualité semences et certification
- FR-026: Stock et distribution semences
- FR-027: Objectifs de production semencière

**Story Count Estimate:** 6-8

**Priority:** Must Have (registre, épurations, tests) / Should Have (stock, objectifs)

**Business Value:**
Module entièrement nouveau (pas dans l'Excel actuel). Intègre la chaîne semencière au suivi des techniciens — objectif stratégique LOCAGRI.

---

### EPIC-011: Infrastructure Transverse (UI, Offline, Notifications)

**Description:**
Composants transverses : layout responsive, navigation, mode dégradé hors-ligne, centre de notifications.

**Functional Requirements:**
- FR-029: Centre de notifications
- FR-031: Navigation et layout responsive
- FR-032: Mode dégradé hors-ligne

**Story Count Estimate:** 4-5

**Priority:** Must Have (layout) / Should Have (offline, notifications)

**Business Value:**
Socle technique et UX qui supporte tous les modules. La qualité du layout et de la navigation conditionne l'adoption par les techniciens.

---

---

## User Stories (High-Level)

### EPIC-001: Authentification
- As a **technicien**, I want to log in with my credentials so that I can access my personal dashboard and field tools.
- As an **admin**, I want to assign roles to users so that each person only accesses the modules they need.
- As a **coordinateur**, I want to only see technicians from my region so that I can focus on my team.

### EPIC-002: Paramétrage
- As a **directeur**, I want to configure annual objectives and bonus thresholds so that the system automatically applies our business rules.
- As a **directeur**, I want to see an audit trail of parameter changes so that I know who changed what and when.

### EPIC-003: Techniciens
- As a **coordinateur**, I want to register a new technician with their profile and zone so that they appear in all tracking modules.
- As a **technicien**, I want to see my performance status (BONUS/CONFORME/ALERTE) so that I know where I stand against my objective.
- As a **coordinateur**, I want to be alerted when a technician drops to ALERTE status so that I can intervene quickly.

### EPIC-004: Suivi Mensuel
- As a **directeur**, I want to see a monthly grid of tonnage per technician so that I can track the campaign progress.
- As a **coordinateur**, I want to export the monthly report as PDF so that I can share it in management meetings.

### EPIC-005: Calendrier
- As a **technicien**, I want to see my assigned activities for the current week so that I know what to do.
- As a **technicien**, I want to update activity status from my phone so that my coordinator sees my progress in real-time.
- As a **coordinateur**, I want to see which activities are overdue so that I can follow up with technicians.

### EPIC-006: Inspection & Achat
- As a **technicien**, I want a step-by-step inspection workflow on my phone so that I follow the 7-step LOCAGRI procedure correctly.
- As a **technicien**, I want the system to alert me when humidity exceeds 14% so that I make informed purchase decisions.
- As a **directeur**, I want to see KPIs on inspection volumes and validation rates so that I monitor procurement quality.

### EPIC-007: Transport
- As a **technicien**, I want to record transport details including driver license photo so that we have complete traceability.
- As a **réceptionniste**, I want to confirm paddy reception with arrival weight so that weight discrepancies are detected.

### EPIC-008: Approvisionnement & Dashboard
- As a **directeur**, I want a real-time dashboard with all KPIs so that I can make data-driven decisions.
- As a **directeur**, I want to see the bonus breakdown per technician so that I can validate bonus payments.

### EPIC-009: Scoring
- As a **technicien**, I want to see the scoring of my producers so that I can prioritize reliable ones.
- As a **coordinateur**, I want to identify EXCLU producers so that contracts are managed appropriately.

### EPIC-010: Production Semencière
- As a **technicien**, I want to track seed field purification with photos so that seed quality is documented.
- As a **directeur**, I want to monitor certification status for each seed lot so that I can plan distribution.

### EPIC-011: Infrastructure
- As a **technicien**, I want the app to work on my phone in the field so that I can use it even with poor connectivity.
- As any **user**, I want to see my notifications in one place so that I don't miss critical alerts.

---

## User Personas

### Persona 1: Koné Mamadou — Technicien de terrain

- **Âge:** 28 ans
- **Localisation:** Zone rurale, Côte d'Ivoire
- **Appareil:** Samsung Galaxy A14 (Android 13), 3 Go RAM
- **Connectivité:** 3G intermittent, Wi-Fi au bureau régional
- **Littératie numérique:** Moyenne — utilise WhatsApp et Facebook quotidiennement
- **Journée type:** 6h-18h sur le terrain, visites de producteurs, inspections paddy, transport
- **Frustrations actuelles:** Double saisie (papier puis Excel par un collègue), pas de visibilité sur sa performance, processus d'inspection non standardisé
- **Besoins:** Interface simple et guidée, gros boutons, feedback immédiat, fonctionnement hors-ligne

### Persona 2: Bamba Fatou — Coordinatrice régionale

- **Âge:** 35 ans
- **Localisation:** Bureau régional + déplacements
- **Appareil:** Laptop + smartphone
- **Connectivité:** Wi-Fi au bureau, 4G en déplacement
- **Littératie numérique:** Élevée — utilise Excel avancé, outils de gestion
- **Frustrations actuelles:** Consolidation manuelle des données de 5 techniciens, pas d'alertes automatiques, retards non détectés
- **Besoins:** Vue consolidée régionale, alertes temps réel, validation rapide des achats

### Persona 3: Traoré Ibrahim — Directeur des Opérations

- **Âge:** 45 ans
- **Localisation:** Siège LOCAGRI, Abidjan
- **Appareil:** Laptop + tablette
- **Connectivité:** Fibre au bureau
- **Littératie numérique:** Élevée — décideur, lit des tableaux de bord
- **Frustrations actuelles:** Données consolidées avec 1-2 semaines de retard, erreurs dans les calculs de bonus, pas de vue nationale en temps réel
- **Besoins:** Dashboard décisionnel en temps réel, KPI clairs, export rapide, paramétrage flexible

---

## User Flows

### Flow 1: Inspection & Achat Paddy (Technicien — Mobile)

```
Connexion → Dashboard technicien → "Nouvelle inspection"
  → Étape 1: GPS auto + Sélection fournisseur
  → Étape 2: Photos stock (min 3)
  → Étape 3: Échantillonnage (nb sacs, contrôle 10%)
  → Étape 4: Analyse qualité (5 critères)
  → Étape 5: Décision (VALIDÉ/REJETÉ + commentaire)
  → Étape 6: Négociation (prix/kg, poids final)
  → Étape 7: Confirmation + récapitulatif
→ Retour dashboard (KPI mis à jour en temps réel)
```

### Flow 2: Consultation Dashboard (Directeur — Web)

```
Connexion → Dashboard national
  → KPI Performance : objectif vs réalisé, techniciens par zone
  → KPI Achat : inspections, taux validation, tonnage
  → KPI Transport : transports, taux de perte, coût
  → Détail bonus : tableau par technicien avec calcul
  → Export PDF/Excel
```

### Flow 3: Réception Paddy (Réceptionniste — Web/Tablette)

```
Connexion → Liste transports en attente de réception
  → Sélection transport
  → Saisie poids arrivée
  → Vérification écart (alerte si > seuil)
  → Validation bon de réception
→ Retour liste (transport marqué "réceptionné")
```

---

## Dependencies

### Internal Dependencies

- **Convex** : schéma de données, mutations, queries, file storage — fondation backend
- **Clerk** : configuration des rôles et permissions — requis avant tout module
- **shadcn/ui** : composants UI — requis pour toutes les interfaces
- **Service Worker** : requis pour le mode dégradé hors-ligne et l'installabilité PWA
- **Module Paramètres** (FR-002) : requis avant les modules qui utilisent les seuils (Achat, Bonus, Scoring)
- **Module Techniciens** (FR-004) : requis avant les modules opérationnels (Achat, Transport, Calendrier)

### External Dependencies

- **Convex Cloud** : hébergement BaaS, disponibilité du service
- **Clerk** : service d'authentification, disponibilité
- **Navigateur** : Chrome/Safari récent pour Web APIs (Camera, Geolocation, Push)
- **Réseau mobile** : connectivité 2G/3G minimum pour la synchronisation (au moins 1x/jour)

---

## Assumptions

- Les techniciens possèdent un smartphone Android avec Chrome récent (≥ v90)
- La couverture réseau mobile est disponible au moins une fois par jour pour synchroniser
- Convex offre une fiabilité suffisante pour les données métier critiques
- Clerk supporte la granularité de permissions requise (5 rôles, permissions par module)
- Les utilisateurs acceptent l'installation d'une PWA (vs app native)
- Les règles métier du CDC (seuils, formules de bonus, scoring) sont validées et stables
- Le volume initial (15 techniciens, ~500 lignes approvisionnement) est dans les limites de Convex
- Les photos compressées à <500 KB sont de qualité suffisante pour l'inspection
- Le format FCFA sans décimale est suffisant pour tous les calculs financiers

---

## Out of Scope

- Application native (Play Store / App Store)
- Mode hors-ligne complet (offline-first avec sync bidirectionnelle complexe)
- Intégration ERP / système comptable LOCAGRI
- Passerelle SMS pour notifications producteurs
- Connexion Bluetooth humidimètre
- Cartes hors-ligne téléchargeables
- Signature électronique légale (accepté : simple confirmation dans l'app)
- QR codes physiques pour les lots
- Multi-langue (français uniquement)
- Paiement mobile / Mobile Money
- IA prédictive
- Application desktop native

---

## Open Questions

| # | Question | Impact | Statut |
|---|----------|--------|--------|
| 1 | Convex file storage a-t-il une limite de volume pour 50 000 photos/an ? | Dimensionnement stockage | À vérifier |
| 2 | Clerk custom claims supporte-t-il le filtrage par région pour les coordinateurs ? | Architecture permissions | À vérifier lors de l'implémentation |
| 3 | Le mode dégradé hors-ligne avec Convex nécessite-t-il une couche supplémentaire (IndexedDB) ? | Complexité offline | À prototyper |
| 4 | Les Web APIs Camera et Geolocation fonctionnent-elles sur tous les smartphones cibles (Android bas de gamme) ? | Compatibilité terrain | À tester sur appareils cibles |
| 5 | Le calcul de bonus doit-il être proratisé en cours de campagne ou uniquement en fin de campagne ? | Logique métier bonus | À valider avec la direction |

---

## Approval & Sign-off

### Stakeholders

- **Direction des Opérations LOCAGRI** — Commanditaire, validateur final
- **Coordinateurs régionaux** — Validation des workflows terrain
- **Équipe de développement** — Faisabilité technique

### Approval Status

- [ ] Product Owner (Direction LOCAGRI)
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] QA Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-24 | LOCAGRI / BMAD | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/bmad:architecture` to create system architecture based on these requirements.

The architecture will address:
- Convex schema design (tables, indexes, relationships)
- Clerk role configuration and permission model
- Component architecture and routing
- File storage strategy for photos
- Offline mode implementation approach
- Validation layer design (client + server)

### Phase 4: Sprint Planning

After architecture is complete, run `/bmad:sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) |
|---------|-----------|-------------------------|-------------------|
| EPIC-001 | Authentification et Système de Rôles | FR-001 | 3-5 |
| EPIC-002 | Paramétrage et Configuration Métier | FR-002, FR-003 | 3-4 |
| EPIC-003 | Gestion des Techniciens | FR-004, FR-005, FR-006 | 5-7 |
| EPIC-004 | Suivi Mensuel de Collecte | FR-007, FR-008, FR-009 | 4-5 |
| EPIC-005 | Calendrier Opérationnel | FR-010, FR-011, FR-012 | 4-6 |
| EPIC-006 | Inspection & Achat Paddy | FR-013, FR-014, FR-028 | 6-8 |
| EPIC-007 | Transport Paddy | FR-015, FR-016, FR-030 | 5-6 |
| EPIC-008 | Approvisionnement & Tableau de Bord | FR-017, FR-018, FR-019, FR-020 | 6-8 |
| EPIC-009 | Scoring Producteurs | FR-021, FR-022 | 4-5 |
| EPIC-010 | Production Semencière | FR-023, FR-024, FR-025, FR-026, FR-027 | 6-8 |
| EPIC-011 | Infrastructure Transverse | FR-029, FR-031, FR-032 | 4-5 |
| **TOTAL** | **11 Epics** | **32 FRs** | **50-67 stories** |

---

## Appendix B: Prioritization Details

### Functional Requirements

| Priority | Count | Percentage |
|----------|-------|------------|
| **Must Have** | 22 | 69% |
| **Should Have** | 10 | 31% |
| **Could Have** | 0 | 0% |
| **Total** | **32** | **100%** |

### Non-Functional Requirements

| Priority | Count | Percentage |
|----------|-------|------------|
| **Must Have** | 6 | 60% |
| **Should Have** | 4 | 40% |
| **Total** | **10** | **100%** |

### Must-Have FRs by Epic

| Epic | Must-Have FRs |
|------|---------------|
| EPIC-001 | FR-001 |
| EPIC-002 | FR-002 |
| EPIC-003 | FR-004, FR-005 |
| EPIC-004 | FR-007 |
| EPIC-005 | FR-010 |
| EPIC-006 | FR-013, FR-014, FR-028 |
| EPIC-007 | FR-015, FR-030 |
| EPIC-008 | FR-017, FR-018, FR-019, FR-020 |
| EPIC-009 | FR-021 |
| EPIC-010 | FR-023, FR-024, FR-025 |
| EPIC-011 | FR-031 |

### Development Priority Order (Suggested)

1. **EPIC-011** (Infrastructure) — Layout, navigation, PWA setup → fondation UI
2. **EPIC-001** (Auth) — Clerk setup → accès sécurisé
3. **EPIC-002** (Paramètres) — Configuration métier → règles pour tous les modules
4. **EPIC-003** (Techniciens) — Registre + performance → données pour achat/transport
5. **EPIC-006** (Achat) — Cœur opérationnel, workflow 7 étapes
6. **EPIC-007** (Transport) — Flux logistique lié à l'achat
7. **EPIC-008** (Approvisionnement + Dashboard) — Consolidation + KPI
8. **EPIC-004** (Suivi Mensuel) — Vue agrégée mensuelle
9. **EPIC-005** (Calendrier) — Suivi des activités
10. **EPIC-009** (Scoring) — Évaluation producteurs
11. **EPIC-010** (Semences) — Nouveau module
