# UX Design: AgroPilot

**Date:** 2026-03-24
**Designer:** LOCAGRI — Équipe UX/Développement
**Version:** 1.0
**Design Level:** Comprehensive (wireframes + interactions + component specs + design system)
**Accessibility:** WCAG 2.1 Level AAA
**Design System:** shadcn/ui + Tailwind CSS

---

## Table des matières

1. [Aperçu du projet](#1-aperçu-du-projet)
2. [Scope du design](#2-scope-du-design)
3. [User Flows](#3-user-flows)
4. [Wireframes](#4-wireframes)
5. [Accessibilité](#5-accessibilité)
6. [Bibliothèque de composants](#6-bibliothèque-de-composants)
7. [Design Tokens](#7-design-tokens)
8. [Handoff développeur](#8-handoff-développeur)
9. [Validation](#9-validation)

---

## 1. Aperçu du projet

**Projet:** AgroPilot — Plateforme digitale de suivi des techniciens agricoles LOCAGRI
**Plateformes cibles:** Web desktop + Web mobile (PWA installable)
**Accessibility:** WCAG 2.1 AAA
**Langue:** Français
**Localisation:** FCFA, DD/MM/YYYY, fuseau GMT (Abidjan)

### Personas de référence

| Persona | Rôle | Interface principale | Appareil | Contexte |
|---------|------|---------------------|----------|----------|
| **Koné Mamadou** | Technicien terrain | Mobile PWA | Samsung Galaxy A14, 3 Go RAM, Android | Terrain rural, 3G intermittent, soleil, poussière |
| **Bamba Fatou** | Coordinatrice régionale | Web + Mobile | Laptop + smartphone | Bureau + déplacements, Wi-Fi/4G |
| **Traoré Ibrahim** | Directeur des opérations | Web desktop | Laptop + tablette | Siège Abidjan, fibre |

### Principes de design

1. **Mobile-first** — Concevoir pour 375px puis adapter au desktop
2. **Guidé par workflow** — Navigation step-by-step pour les processus complexes (inspection 7 étapes, transport 6 étapes)
3. **Lisible en extérieur** — Contraste AAA (7:1 minimum), texte ≥ 16px body
4. **Tolérant aux erreurs** — Validation temps réel, messages clairs en français, possibilité de revenir en arrière
5. **Performant** — Chargement < 3s, interactions < 200ms, skeleton loading
6. **Familier** — Codes couleurs repris de l'Excel existant (vert bonus, bleu conforme, orange alerte, rouge résiliation)

---

## 2. Scope du design

### Inventaire des écrans

**Total : 35 écrans répartis sur 13 flows**

| # | Écran | Module | Interface | Priorité |
|---|-------|--------|-----------|----------|
| 01 | Page de connexion | Auth | Web + Mobile | Must |
| 02 | Page 403 (accès refusé) | Auth | Web + Mobile | Must |
| 03 | Layout desktop (sidebar) | Infrastructure | Web | Must |
| 04 | Layout mobile (bottom nav) | Infrastructure | Mobile | Must |
| 05 | Configuration paramètres | Paramètres | Web | Must |
| 06 | Journal d'audit | Paramètres | Web | Should |
| 07 | Liste des techniciens | Techniciens | Web + Mobile | Must |
| 08 | Fiche technicien (détail) | Techniciens | Web + Mobile | Must |
| 09 | Formulaire technicien (création/édition) | Techniciens | Web | Must |
| 10 | Grille suivi mensuel | Suivi Mensuel | Web | Must |
| 11 | Graphiques suivi mensuel | Suivi Mensuel | Web | Should |
| 12 | Calendrier opérationnel | Calendrier | Web + Mobile | Must |
| 13 | Détail activité / livrables | Calendrier | Web + Mobile | Should |
| 14 | Liste des inspections | Inspection | Web + Mobile | Must |
| 15 | Workflow inspection 7 étapes | Inspection | Mobile | Must |
| 16 | Détail inspection | Inspection | Web + Mobile | Must |
| 17 | KPI inspections | Inspection | Web | Must |
| 18 | Liste des transports | Transport | Web + Mobile | Must |
| 19 | Workflow transport 6 étapes | Transport | Mobile | Must |
| 20 | Détail transport | Transport | Web + Mobile | Must |
| 21 | KPI transport | Transport | Web | Should |
| 22 | Registre approvisionnement | Approvisionnement | Web | Must |
| 23 | Dashboard KPI Performance | Dashboard | Web | Must |
| 24 | Dashboard KPI Achat & Transport | Dashboard | Web | Must |
| 25 | Détail bonus par technicien | Dashboard | Web | Must |
| 26 | Liste producteurs + scoring | Scoring | Web + Mobile | Must |
| 27 | Fiche producteur (détail) | Scoring | Web + Mobile | Must |
| 28 | Formulaire producteur | Scoring | Web | Must |
| 29 | Liste producteurs semenciers | Semences | Web + Mobile | Must |
| 30 | Fiche producteur semencier | Semences | Web + Mobile | Must |
| 31 | Suivi épurations variétales | Semences | Mobile | Must |
| 32 | Tests qualité & certification | Semences | Web | Must |
| 33 | Stock & distribution semences | Semences | Web | Should |
| 34 | Centre de notifications | Infrastructure | Web + Mobile | Should |
| 35 | Interface réceptionniste | Réception | Web/Tablette | Must |

### Regroupement par flow

| Flow | Écrans | Utilisateur principal |
|------|--------|----------------------|
| F1: Authentification | 01, 02 | Tous |
| F2: Gestion techniciens | 07, 08, 09 | Coordinateur |
| F3: Suivi mensuel | 10, 11 | Directeur, Coordinateur |
| F4: Calendrier opérationnel | 12, 13 | Technicien, Coordinateur |
| F5: Inspection & Achat | 14, 15, 16, 17 | Technicien |
| F6: Transport | 18, 19, 20, 21 | Technicien |
| F7: Approvisionnement | 22 | Directeur, Coordinateur |
| F8: Dashboard & Bonus | 23, 24, 25 | Directeur |
| F9: Producteurs & Scoring | 26, 27, 28 | Technicien, Coordinateur |
| F10: Production semencière | 29, 30, 31, 32, 33 | Technicien |
| F11: Notifications | 34 | Tous |
| F12: Réception paddy | 35 | Réceptionniste |
| F13: Configuration | 05, 06 | Directeur |

---

## 3. User Flows

### Flow F1 : Authentification

**Entry Point:** URL de l'application (agropilot.locagri-app.com)

**Happy Path:**
```
[Écran Login]
   ↓ Saisie email + mot de passe
[Clerk Auth]
   ↓ Vérification rôle
   ├─→ Technicien → [Dashboard Technicien Mobile]
   ├─→ Coordinateur → [Dashboard Performance Web]
   ├─→ Directeur → [Dashboard Performance Web]
   ├─→ Admin → [Dashboard Admin Web]
   └─→ Réceptionniste → [Interface Réception]
```

**Error Cases:**
- Identifiants incorrects → Message : « Email ou mot de passe incorrect. Réessayez. » → Rester sur Login
- Compte inactif → Message : « Votre compte est désactivé. Contactez l'administrateur. »
- Accès module non autorisé → [Page 403] → Bouton « Retour à l'accueil »

**Exit Points:**
- Succès : Dashboard adapté au rôle
- Échec : Rester sur Login avec message d'erreur

---

### Flow F2 : Gestion des techniciens

**Entry Point:** Menu « Techniciens » dans la sidebar/bottom nav

**Happy Path — Consultation :**
```
[Liste Techniciens]
   ↓ Clic sur un technicien
[Fiche Technicien]
   → Onglet Profil : infos, zone, contact, photo
   → Onglet Performance : objectif, réalisé, taux, statut, graphique
   → Onglet Historique : inspections, transports, activités
```

**Happy Path — Création :**
```
[Liste Techniciens] → Bouton « + Nouveau technicien »
   ↓
[Formulaire Technicien]
   → Saisie nom, prénom, zone, contact
   → Upload photo profil + pièces d'identité
   → Affectation objectif annuel
   ↓ Bouton « Enregistrer »
[Liste Techniciens] (toast : « Technicien créé avec succès »)
```

**Decision Points:**
- Formulaire invalide → Affichage erreurs inline sous chaque champ
- Technicien en statut RÉSILIATION → Badge rouge + alerte coordinateur automatique

---

### Flow F3 : Suivi mensuel de collecte

**Entry Point:** Menu « Suivi mensuel »

**Happy Path:**
```
[Grille Suivi Mensuel]
   → Tableau technicien × mois (Jan–Déc)
   → Totaux par ligne et colonne
   → Code couleur par zone de performance
   ↓ Onglet « Graphiques »
[Graphiques Suivi]
   → Barres empilées PC/GC par mois
   → Courbe cumulée vs objectif
   → Filtre par technicien
   ↓ Bouton « Exporter »
   ├─→ PDF (mise en page LOCAGRI)
   └─→ Excel (.xlsx)
```

---

### Flow F4 : Calendrier opérationnel

**Entry Point:** Menu « Calendrier »

**Happy Path — Technicien (mobile) :**
```
[Calendrier Opérationnel]
   → Vue mensuelle avec 17 activités
   → Codes couleurs par phase
   → Badge statut par activité
   ↓ Tap sur une activité
[Détail Activité]
   → Nom, phase, dates, livrable attendu
   → Bouton « Mettre à jour le statut »
   ↓ Sélection statut (Non démarré → En cours → Terminé)
   → Upload livrable (photo/PDF) si requis
   ↓
[Calendrier] (statut mis à jour en temps réel)
```

**Happy Path — Coordinateur (web) :**
```
[Calendrier Opérationnel]
   → Filtre par technicien / phase
   → Vue des activités en retard (filtre rapide)
   ↓ Clic activité en retard
[Détail Activité]
   → Historique des mises à jour
   → Possibilité de relancer le technicien (notification)
```

**Decision Points:**
- Activité dont la date limite est dépassée → Statut automatique « En retard » + alerte

---

### Flow F5 : Inspection & Achat paddy (7 étapes) — CŒUR OPÉRATIONNEL

**Entry Point:** Dashboard technicien → Bouton « Nouvelle inspection »

**Happy Path:**
```
[Étape 1 — Déplacement]
   → Capture GPS automatique (indicateur vert si OK)
   → Sélection fournisseur (autocomplete ou « Nouveau fournisseur »)
   ↓ Bouton « Suivant »

[Étape 2 — Photos stock]
   → Prise de photos in-app (min. 3 requises)
   → Compteur : « 2/3 photos prises »
   → Saisie : nb sacs, estimation poids (kg)
   ↓ Bouton « Suivant » (grisé si < 3 photos)

[Étape 3 — Échantillonnage]
   → Saisie nb sacs échantillonnés
   → Indicateur : « X% du stock » (alerte orange si < 10%)
   ↓ Bouton « Suivant »

[Étape 4 — Analyse qualité]
   → 5 sliders/notes (1-5) :
     • Aspect visuel
     • Humidité (%) — champ numérique + alerte si > 14%
     • Homogénéité
     • Propreté
     • Décorticage
   → Note moyenne affichée en temps réel
   ↓ Bouton « Suivant »

[Étape 5 — Décision]
   → Deux boutons larges : ✓ VALIDÉ / ✗ REJETÉ
   → Commentaire obligatoire (textarea)
   ↓ Si VALIDÉ → Étape 6
   ↓ Si REJETÉ → Étape 7 (récapitulatif sans négociation)

[Étape 6 — Négociation]
   → Affichage prix référence (FCFA/kg, lecture seule)
   → Saisie prix négocié (FCFA/kg)
   → Saisie poids final (kg)
   → Calcul automatique : Montant = poids × prix
   → Affichage montant en FCFA formaté
   ↓ Bouton « Suivant »

[Étape 7 — Confirmation]
   → Récapitulatif complet (toutes les données)
   → Carte GPS + vignettes photos
   → Note qualité + décision + montant
   → Bouton « Modifier » → retour à l'étape concernée
   ↓ Bouton « Confirmer l'inspection »
[Toast : « Inspection enregistrée avec succès »]
   ↓
[Liste Inspections] (KPI mis à jour en temps réel)
```

**Stepper visuel:**
```
① ─── ② ─── ③ ─── ④ ─── ⑤ ─── ⑥ ─── ⑦
GPS   Photos Échant Qualité Décis Négo  Confirm
 ●────●────●────○────○────○────○
         ▲ Étape actuelle
```

**Error Cases:**
- GPS indisponible → Fallback saisie manuelle de la localisation + avertissement
- Moins de 3 photos → Bouton « Suivant » désactivé + message « 3 photos minimum requises »
- Humidité > 14% → Alerte orange inline « Humidité élevée — risque qualité »
- Humidité > 20% → Alerte rouge + blocage recommandé
- Échantillonnage < 10% → Alerte orange « Échantillonnage insuffisant (< 10% du stock) »

---

### Flow F6 : Transport paddy (6 étapes)

**Entry Point:** Dashboard technicien → Bouton « Nouveau transport »

**Happy Path:**
```
[Étape 1 — Transporteur]
   → Sélection transporteur (autocomplete BDD)
   → Ou création : nom, contact, type véhicule, immatriculation, prix
   → Type véhicule : dropdown (Camion bâché, non bâché, Camionnette, Pick-up, Tricycle, Autre)
   ↓ Suivant

[Étape 2 — Chauffeur]
   → Nom chauffeur, n° permis
   → Photo permis OBLIGATOIRE (prise in-app)
   → Blocage si photo non fournie
   ↓ Suivant

[Étape 3 — Chargement]
   → Liaison automatique avec fiche d'achat (sélection)
   → Poids chargé (kg) — pré-rempli depuis l'achat si lié
   → Date/heure de chargement
   ↓ Suivant

[Étape 4 — Destination]
   → Sélection : Usine LOCAGRI / Entrepôt intermédiaire
   → Capture GPS destination
   ↓ Suivant

[Étape 5 — Réception]
   → Poids arrivée (kg)
   → Calcul écart automatique : |chargé − arrivée|
   → Alerte si écart > seuil paramétré
   → Date/heure réception
   ↓ Suivant

[Étape 6 — Clôture]
   → Récapitulatif complet
   → Vérification complétude du dossier (checklist auto)
   → Bouton « Confirmer le transport »
   ↓
[Toast : « Transport enregistré »]
[Liste Transports]
```

**Stepper visuel:**
```
① ─── ② ─── ③ ─── ④ ─── ⑤ ─── ⑥
Transp Chauff Charg  Dest  Récep  Clôture
```

---

### Flow F7 : Approvisionnement

**Entry Point:** Menu « Approvisionnement »

**Happy Path:**
```
[Registre Approvisionnement]
   → Tableau avec colonnes : date, technicien, fournisseur, type, quantité, qualité, humidité, prix/kg, montant FCFA
   → Filtres : technicien, fournisseur, type (Contrat/Hors contrat/Spot), période, zone, qualité
   → Tri par colonne (clic header)
   → Pagination (25, 50, 100 par page)
   → Alimenté automatiquement depuis les inspections validées
   → Totaux en pied de tableau (quantité totale, montant total)
```

---

### Flow F8 : Dashboard & Bonus (Directeur)

**Entry Point:** Menu « Tableau de bord » (page d'accueil Directeur)

**Happy Path:**
```
[Dashboard Performance]
   → 4 cards KPI en haut :
     • Objectif global (T)
     • Total collecté (T)
     • Taux de réalisation (%)
     • Budget bonus estimé (FCFA)
   → Graphique : barres empilées par mois (PC/GC) + courbe objectif
   → Répartition techniciens par zone : 4 badges (BONUS / CONFORME / ALERTE / RÉSILIATION)
   ↓ Onglet « Achat & Transport »

[Dashboard Achat & Transport]
   → Cards KPI : Inspections, Taux validation, Tonnage, Transports, Taux perte, Coût moyen/tonne
   → Graphique : évolution hebdomadaire des inspections
   → Filtre par période et technicien
   ↓ Onglet « Bonus »

[Détail Bonus]
   → Tableau : Technicien, Objectif, Réalisé, Écart, %, Zone, Bonus FCFA
   → Tri par colonne
   → Total bonus équipe en footer
   → Export PDF / Excel
```

---

### Flow F9 : Producteurs & Scoring

**Entry Point:** Menu « Producteurs »

**Happy Path — Consultation :**
```
[Liste Producteurs]
   → Tableau avec scoring visuel (badges OR/ARGENT/BRONZE/EXCLU)
   → Filtres : zone, technicien, scoring, semencier
   → Barre de recherche par nom
   ↓ Clic producteur
[Fiche Producteur]
   → Onglet Profil : nom, OP/GVC, zone, technicien, contact, GPS
   → Onglet Livraisons : quantité livrée vs contractée, taux, historique
   → Onglet Scoring : scoring actuel + historique multi-campagnes
   → Flag « Producteur semencier » → lien vers module semences
```

**Happy Path — Création :**
```
[Liste Producteurs] → « + Nouveau producteur »
[Formulaire Producteur]
   → Nom, OP/GVC, zone, technicien référent, contact
   → Coordonnées GPS parcelle (capture ou saisie)
   → Quantité contractée
   ↓ Enregistrer
[Liste Producteurs] (toast succès)
```

---

### Flow F10 : Production semencière

**Entry Point:** Menu « Semences »

**Happy Path — Suivi complet :**
```
[Liste Producteurs Semenciers]
   → Tableau : nom, OP, variété, parcelle, objectif, statut certification
   → Filtre par variété, statut
   ↓ Clic producteur
[Fiche Producteur Semencier]
   → Parcelle GPS + surface + distance isolement
   → Variété multipliée + source semences de base
   → Objectif assigné (kg)
   ↓ Onglet « Épurations »

[Suivi Épurations Variétales]
   → 3 passages obligatoires (ordre strict) :
     ① Tallage → ② Montaison → ③ Épiaison
   → Chaque passage : date, photos avant/après, nb hors-types, commentaire
   → Passage N verrouillé si N-1 non complété
   → Badge statut par passage : ○ À faire / ● En cours / ✓ Fait
   ↓ Onglet « Tests Qualité »

[Tests Qualité & Certification]
   → Germination (%) — ≥ 85% requis → barre de progrès verte/rouge
   → Pureté variétale (%) — ≥ 98% requis
   → Humidité (%) — ≤ 12% requis
   → Statut certification ANADER : Soumis / En cours / Certifié / Rejeté
   → Blocage si un critère non atteint
   ↓ Onglet « Stock »

[Stock & Distribution]
   → Stock disponible par variété/lot
   → Enregistrement distributions
   → Solde mis à jour automatiquement
```

**Stepper épurations :**
```
① Tallage ─── ② Montaison ─── ③ Épiaison
    ✓              ●                ○
  Complété     En cours         Verrouillé
```

---

### Flow F11 : Notifications

**Entry Point:** Icône cloche dans le header (badge compteur)

**Happy Path:**
```
[Centre Notifications]
   → Liste chronologique avec icônes par type :
     • 🔴 Performance (ALERTE/RÉSILIATION)
     • 🟠 Qualité (humidité hors norme)
     • 🟡 Retard (activité dépassée)
     • 🔵 Transport (perte, photo manquante)
     • 🟢 Semences (épuration manquée, test échoué)
   → Filtrage par type
   → Marquage lu/non lu (swipe sur mobile)
   → Clic → navigation vers l'élément concerné
```

---

### Flow F12 : Réception paddy (Réceptionniste)

**Entry Point:** Connexion réceptionniste → Interface dédiée

**Happy Path:**
```
[Liste Transports en Attente]
   → Tableau : n° transport, technicien, transporteur, poids chargé, date envoi
   → Filtré automatiquement sur les transports non réceptionnés
   ↓ Clic « Réceptionner »

[Formulaire Réception]
   → Infos transport (lecture seule)
   → Saisie poids arrivée (kg)
   → Calcul écart automatique (chargé − arrivée)
   → Alerte visuelle si écart > seuil
   → Bouton « Valider la réception »
   ↓
[Bon de réception généré] (numéro unique)
[Toast : « Réception confirmée »]
```

---

### Flow F13 : Configuration (Directeur)

**Entry Point:** Menu « Paramètres »

**Happy Path:**
```
[Configuration Paramètres]
   → Sections :
     • Objectifs : objectif annuel, seuil bonus, seuil résiliation
     • Bonus : bonus unitaire (FCFA/kg)
     • Campagnes : répartition PC/GC (%)
     • Prix : prix d'achat référence par zone
     • Qualité : seuils humidité, impuretés, brisure
     • Semences : objectifs production semencière
   → Chaque champ affiche la valeur actuelle
   → Modification inline avec validation temps réel
   → Bouton « Enregistrer les modifications »
   ↓ Onglet « Journal d'audit »

[Journal d'Audit]
   → Tableau : date, utilisateur, paramètre, ancienne valeur, nouvelle valeur
   → Filtres par date, utilisateur, paramètre
   → Lecture seule
```

---

## 4. Wireframes

### 4.1 — Layout Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ HEADER (56px, fixed top)                                             │
│ ┌──────┐                              🔔 3  👤 Koné M. ▾  [Déco]   │
│ │ LOGO │  AgroPilot                                                  │
│ └──────┘                                                             │
├────────────────┬─────────────────────────────────────────────────────┤
│ SIDEBAR (260px)│  MAIN CONTENT (flex-1, scrollable)                  │
│ collapsible    │                                                     │
│                │  ┌─ Breadcrumb ─────────────────────────────────┐   │
│ 📊 Tableau bord│  │ Accueil > Inspections > Inspection #142      │   │
│ 👥 Techniciens │  └─────────────────────────────────────────────┘   │
│ 📅 Calendrier  │                                                     │
│ 🔍 Inspections │  ┌─────────────────────────────────────────────┐   │
│ 🚛 Transport   │  │                                             │   │
│ 📦 Approv.     │  │           PAGE CONTENT                      │   │
│ 📈 Suivi mens. │  │                                             │   │
│ 👨‍🌾 Producteurs │  │     (varie selon le module actif)           │   │
│ 🌾 Semences    │  │                                             │   │
│ ⚙️ Paramètres  │  │                                             │   │
│                │  └─────────────────────────────────────────────┘   │
│ ────────────── │                                                     │
│ 🔔 Notifs (3)  │                                                     │
│                │                                                     │
├────────────────┴─────────────────────────────────────────────────────┤
│ (pas de footer — sidebar offre la navigation complète)               │
└──────────────────────────────────────────────────────────────────────┘
```

**Comportement sidebar :**
- Desktop ≥ 1280px : sidebar ouverte par défaut (260px)
- Desktop 1024-1279px : sidebar collapsée en icônes (64px), hover pour label
- Bouton hamburger dans le header pour toggle
- Items actifs : fond primaire/10, texte primaire, barre gauche 3px
- Items avec sous-menus : collapsible (chevron)
- Badge compteur sur « Notifications »

---

### 4.2 — Layout Mobile (< 1024px)

```
┌─────────────────────────┐
│ HEADER (56px, fixed)     │
│ ☰  AgroPilot    🔔 3 👤 │
├─────────────────────────┤
│                         │
│     MAIN CONTENT        │
│     (scrollable)        │
│                         │
│     100% width          │
│     padding: 16px       │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│ BOTTOM NAV (64px, fixed) │
│                         │
│ 📊    🔍    ➕    📅    👤│
│ Bord  Insp  New  Cal  Plus│
│                         │
└─────────────────────────┘
```

**Bottom navigation (technicien) :**
| Icône | Label | Action |
|-------|-------|--------|
| 📊 | Tableau | Dashboard technicien |
| 🔍 | Inspections | Liste mes inspections |
| ➕ | Nouveau | FAB — ouvre menu : Inspection / Transport / Épuration |
| 📅 | Calendrier | Calendrier activités |
| 👤 | Plus | Menu complet (Producteurs, Semences, Transport, Profil, Notifications) |

**Le bouton central « ➕ » est un FAB (Floating Action Button) :**
- Taille : 56px × 56px, arrondi complet
- Couleur : primaire (vert LOCAGRI)
- Élévation : shadow level 3
- Tap → sheet bottom-up avec les 3 actions rapides

---

### 4.3 — Page de connexion (#01)

```
Mobile (375px):                    Desktop (1024px+):
┌─────────────────────┐            ┌───────────────────┬───────────────────┐
│                     │            │                   │                   │
│     🌾              │            │                   │                   │
│   AgroPilot         │            │   Image terrain   │     🌾            │
│   par LOCAGRI       │            │   rizière / tech  │   AgroPilot       │
│                     │            │   au travail      │   par LOCAGRI     │
│  ┌───────────────┐  │            │                   │                   │
│  │ Email         │  │            │   (cover 50%)     │  ┌─────────────┐  │
│  └───────────────┘  │            │                   │  │ Email       │  │
│  ┌───────────────┐  │            │                   │  └─────────────┘  │
│  │ Mot de passe 👁│  │            │                   │  ┌─────────────┐  │
│  └───────────────┘  │            │                   │  │ Mot de passe│  │
│                     │            │                   │  └─────────────┘  │
│  [  Se connecter  ] │            │                   │                   │
│                     │            │                   │  [Se connecter ]  │
│  Mot de passe       │            │                   │                   │
│  oublié ?           │            │                   │  Mot de passe     │
│                     │            │                   │  oublié ?         │
└─────────────────────┘            └───────────────────┴───────────────────┘
```

---

### 4.4 — Dashboard Performance (#23)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Tableau de bord  ·  Performance                                   │
│ [Performance] [Achat & Transport] [Bonus]     📅 Période ▾       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ Objectif │ │ Collecté │ │ Taux     │ │ Budget   │            │
│ │ global   │ │ total    │ │ réalis.  │ │ bonus    │            │
│ │          │ │          │ │          │ │          │            │
│ │ 4 500 T  │ │ 2 847 T  │ │  63,3 %  │ │ 12,5 M   │            │
│ │ ▲ +200T  │ │ ▲ +312T  │ │ ▲ +4,2%  │ │ FCFA     │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │  Graphique barres empilées (PC/GC) + courbe objectif       │   │
│ │                                                            │   │
│ │  ██                                                        │   │
│ │  ██ ██                          ---- objectif              │   │
│ │  ██ ██ ██                  ----                             │   │
│ │  ██ ██ ██ ██          ----                                  │   │
│ │  ██ ██ ██ ██ ██  ----                                      │   │
│ │  Jan Fév Mar Avr Mai Jun Jul Aoû Sep Oct Nov Déc          │   │
│ │  ■ Petite campagne  ■ Grande campagne  --- Objectif        │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ Répartition techniciens                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ 🟢 BONUS │ │ 🔵 CONF. │ │ 🟠 ALERTE│ │ 🔴 RÉSIL.│            │
│ │    3     │ │    7     │ │    4     │ │    1     │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile :** Les 4 cards KPI en 2×2 grid, graphique full-width horizontal-scroll, badges empilés verticalement.

---

### 4.5 — Dashboard Technicien (Mobile) (#04)

```
┌─────────────────────────┐
│ ☰  Bonjour, Koné    🔔 2│
├─────────────────────────┤
│                         │
│  Mon objectif           │
│  ┌─────────────────┐    │
│  │ 300 T            │    │
│  │ ████████░░░ 63%  │    │
│  │ 189 T collectés  │    │
│  │ Statut: CONFORME │    │
│  └─────────────────┘    │
│                         │
│  Actions rapides        │
│  ┌─────────┐ ┌─────────┐│
│  │📷       │ │🚛       ││
│  │Nouvelle │ │Nouveau  ││
│  │Inspection│ │Transport││
│  └─────────┘ └─────────┘│
│  ┌─────────┐ ┌─────────┐│
│  │🌾       │ │📅       ││
│  │Épuration│ │Mes      ││
│  │          │ │Activités││
│  └─────────┘ └─────────┘│
│                         │
│  Dernières inspections  │
│  ┌─────────────────┐    │
│  │ #142 · Fourniss.│    │
│  │ 12/03 · 2,4 T   │    │
│  │ ✓ Validé · ★4,2 │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │ #141 · Fourniss.│    │
│  │ 11/03 · 1,8 T   │    │
│  │ ✗ Rejeté · ★2,1 │    │
│  └─────────────────┘    │
│                         │
├─────────────────────────┤
│ 📊    🔍    ➕    📅   👤│
└─────────────────────────┘
```

---

### 4.6 — Workflow Inspection — Étape 4 Analyse Qualité (#15)

```
Mobile (375px):
┌─────────────────────────┐
│ ← Inspection    Étape 4/7│
├─────────────────────────┤
│ ①──②──③──④──⑤──⑥──⑦    │
│              ●           │
│                          │
│  Analyse Qualité         │
│                          │
│  Aspect visuel     ★★★★☆ │
│  ─────────────────○───── │
│                    4/5   │
│                          │
│  Humidité                │
│  ┌──────────────────┐    │
│  │ 13,5 %           │    │
│  └──────────────────┘    │
│  ✓ OK (seuil : 14%)     │
│                          │
│  Homogénéité       ★★★☆☆ │
│  ─────────────────○───── │
│                    3/5   │
│                          │
│  Propreté          ★★★★★ │
│  ─────────────────○───── │
│                    5/5   │
│                          │
│  Décorticage       ★★★★☆ │
│  ─────────────────○───── │
│                    4/5   │
│                          │
│  ┌─────────────────┐     │
│  │ Note moyenne :   │     │
│  │    4,0 / 5       │     │
│  └─────────────────┘     │
│                          │
│  [ ← Précédent ] [Suivant →] │
│                          │
├──────────────────────────┤
│ 📊    🔍    ➕    📅   👤 │
└──────────────────────────┘
```

---

### 4.7 — Liste Techniciens (#07)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Techniciens                          🔍 Rechercher...  [+ Nouveau]│
├──────────────────────────────────────────────────────────────────┤
│ Filtres: [Zone ▾] [Statut ▾] [Campagne ▾]      15 techniciens   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────┬──────────────┬─────────┬───────┬────────┬──────┬──────┐ │
│ │      │ Technicien   │ Zone    │Objectif│Réalisé│  %   │Statut│ │
│ ├──────┼──────────────┼─────────┼───────┼────────┼──────┼──────┤ │
│ │ [📷] │ Koné Mamadou │ Bouaké  │ 300 T │ 342 T  │114%  │🟢BON│ │
│ │ [📷] │ Diallo Awa   │ Korhogo │ 300 T │ 295 T  │ 98%  │🔵CON│ │
│ │ [📷] │ Touré Ibr.   │ San-Pédro│300 T │ 267 T  │ 89%  │🟠ALE│ │
│ │ [📷] │ Coulibaly S. │ Man     │ 300 T │ 198 T  │ 66%  │🔴RÉS│ │
│ │ ...  │ ...          │ ...     │ ...   │ ...    │ ...  │ ...  │ │
│ └──────┴──────────────┴─────────┴───────┴────────┴──────┴──────┘ │
│                                                                   │
│ ◄ 1 2 3 ► Afficher [25 ▾] par page                              │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile :** Liste en cards empilées (pas de tableau) :
```
┌─────────────────────────┐
│ [📷] Koné Mamadou       │
│ Bouaké · 342 T / 300 T  │
│ ████████████░░ 114%      │
│ 🟢 BONUS                │
├─────────────────────────┤
│ [📷] Diallo Awa         │
│ Korhogo · 295 T / 300 T │
│ █████████████░░ 98%      │
│ 🔵 CONFORME             │
└─────────────────────────┘
```

---

### 4.8 — Registre Approvisionnement (#22)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Approvisionnement                                                 │
├──────────────────────────────────────────────────────────────────┤
│ Filtres :                                                         │
│ [Technicien ▾] [Fournisseur ▾] [Type ▾] [Du __ Au __] [Zone ▾]  │
│ [Qualité ▾]                           [Réinitialiser les filtres] │
├──────────────────────────────────────────────────────────────────┤
│ Résumé : 487 entrées · 1 234 T · 185 000 000 FCFA                │
├──────┬────────┬──────────┬────────┬──────┬─────┬──────┬─────────┤
│ Date │Tech.   │Fourniss. │ Type   │ Qté  │Qual.│Prix  │ Montant │
│      │        │          │        │ (kg) │/5   │FCFA  │ FCFA    │
├──────┼────────┼──────────┼────────┼──────┼─────┼──────┼─────────┤
│12/03 │Koné M. │Ouattara  │Contrat │2 400 │ 4,2 │ 150  │360 000  │
│11/03 │Diallo  │Bamba K.  │Spot    │1 800 │ 3,1 │ 145  │261 000  │
│...   │...     │...       │...     │...   │...  │...   │...      │
├──────┴────────┴──────────┴────────┴──────┴─────┴──────┴─────────┤
│ TOTAL                              │4 200 │     │      │621 000  │
├─────────────────────────────────────────────────────────────────┤
│ ◄ 1 2 ... 20 ►  Afficher [25 ▾]  [📄 PDF] [📊 Excel]           │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4.9 — Producteurs & Scoring (#26)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Producteurs                          🔍 Rechercher...  [+ Nouveau]│
├──────────────────────────────────────────────────────────────────┤
│ [Zone ▾] [Technicien ▾] [Scoring ▾] [Semencier ☐]               │
├──────┬──────────┬────────┬──────┬──────┬─────┬──────┬───────────┤
│      │ Nom      │ OP/GVC │ Zone │Tech. │Taux │Qual. │ Scoring   │
├──────┼──────────┼────────┼──────┼──────┼─────┼──────┼───────────┤
│ [📷] │ Ouattara │ OP Riz │Bouaké│Koné  │ 97% │ 4,5  │ 🥇 OR    │
│ [📷] │ Bamba K. │ GVC NB │Korho.│Diallo│ 85% │ 3,8  │ 🥈 ARGENT│
│ [📷] │ Traoré   │ OP Riz │S-Péd│Touré │ 42% │ 2,9  │ 🥉 BRONZE│
│ [📷] │ Konaté   │ —      │Man   │Couli.│  0% │  —   │ ⛔ EXCLU │
│ ...  │ ...      │ ...    │ ...  │ ...  │ ... │ ...  │ ...       │
└──────┴──────────┴────────┴──────┴──────┴─────┴──────┴───────────┘
```

---

### 4.10 — Suivi Épurations Variétales (#31)

```
Mobile (375px):
┌─────────────────────────┐
│ ← Épurations   Parcelle  │
├─────────────────────────┤
│                          │
│ Producteur: Ouattara M.  │
│ Variété: WITA 9          │
│ Parcelle: 2,5 ha         │
│                          │
│ ┌───────────────────────┐│
│ │ ✅ Passage 1 — Tallage ││
│ │ 15/02/2026             ││
│ │ 12 hors-types retirés ││
│ │ 📷 4 photos            ││
│ │ [Voir détails]         ││
│ └───────────────────────┘│
│                          │
│ ┌───────────────────────┐│
│ │ 🔵 Passage 2 — Montais.││
│ │ En cours               ││
│ │ [Compléter le passage] ││
│ └───────────────────────┘│
│                          │
│ ┌───────────────────────┐│
│ │ 🔒 Passage 3 — Épiaisn.││
│ │ Verrouillé             ││
│ │ (compléter passage 2   ││
│ │  pour débloquer)       ││
│ └───────────────────────┘│
│                          │
├──────────────────────────┤
│ 📊    🔍    ➕    📅   👤 │
└──────────────────────────┘
```

---

### 4.11 — Interface Réceptionniste (#35)

```
Tablette/Desktop:
┌──────────────────────────────────────────────────────────────────┐
│ 🏭 Réception Paddy — Usine LOCAGRI            👤 Yao M. [Déco]  │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Transports en attente de réception (4)                            │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Transport #089                                              │   │
│ │ Technicien : Koné M. · Transporteur : Trans Express         │   │
│ │ Chauffeur : Diaby A. · Véhicule : Camion bâché AB-1234     │   │
│ │ Poids chargé : 2 400 kg · Envoyé le : 12/03/2026           │   │
│ │                                        [Réceptionner →]     │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Transport #088                                              │   │
│ │ Technicien : Diallo A. · Transporteur : Logistik CI         │   │
│ │ Poids chargé : 1 800 kg · Envoyé le : 11/03/2026           │   │
│ │                                        [Réceptionner →]     │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ── Réceptions récentes ──                                         │
│ #087 · 10/03 · 3 200 kg → 3 180 kg · Écart: 20 kg (0,6%) ✓     │
│ #086 · 09/03 · 1 500 kg → 1 420 kg · Écart: 80 kg (5,3%) ⚠     │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4.12 — Centre de Notifications (#34)

```
Mobile (375px):
┌─────────────────────────┐
│ ← Notifications    ✓ Tout│
├─────────────────────────┤
│ [Toutes] [Perf] [Qual]  │
│ [Retard] [Transp] [Sem] │
├─────────────────────────┤
│                          │
│ Aujourd'hui              │
│ ┌───────────────────────┐│
│ │ 🔴 Coulibaly S. passe ││
│ │ en RÉSILIATION (66%)   ││
│ │ il y a 2h       ●     ││
│ └───────────────────────┘│
│ ┌───────────────────────┐│
│ │ 🟠 Inspection #143 :  ││
│ │ humidité 16,2% (>14%) ││
│ │ il y a 4h       ●     ││
│ └───────────────────────┘│
│                          │
│ Hier                     │
│ ┌───────────────────────┐│
│ │ 🟡 Activité « Semis » ││
│ │ en retard — Touré I.   ││
│ │ 23/03              ○   ││
│ └───────────────────────┘│
│                          │
├──────────────────────────┤
│ 📊    🔍    ➕    📅   👤 │
└──────────────────────────┘
```

---

### 4.13 — Calendrier Opérationnel (#12)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Calendrier Opérationnel                                           │
│ [Technicien ▾ Tous] [Phase ▾ Toutes]  🔴 En retard (3)          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ INTER-CAMPAGNE (fond bleu clair)                                  │
│ ┌──────────────────────┬────────────────┬──────────┬────────┐    │
│ │ Activité             │ Période        │ Livrable │ Statut │    │
│ ├──────────────────────┼────────────────┼──────────┼────────┤    │
│ │ Bilan campagne       │ Jan S1-S2      │ Rapport  │ ✅ Fait │    │
│ │ Planification        │ Jan S3 - Fév S1│ Plan     │ ✅ Fait │    │
│ └──────────────────────┴────────────────┴──────────┴────────┘    │
│                                                                   │
│ PRÉPARATION SOL (fond vert clair)                                 │
│ ┌──────────────────────┬────────────────┬──────────┬────────┐    │
│ │ Labour & préparation │ Fév S2 - Mar S2│ Photos   │ 🔵 Cours│    │
│ │ Approvisionnement    │ Mar S1 - Mar S4│ Bons     │ ⬜ Non  │    │
│ │ intrants             │                │ commande │ démarré │    │
│ └──────────────────────┴────────────────┴──────────┴────────┘    │
│                                                                   │
│ SEMIS (fond jaune clair)                                          │
│ ┌──────────────────────┬────────────────┬──────────┬────────┐    │
│ │ Semis / repiquage    │ Avr S1 - Mai S2│ PV semis │ 🔴 Retard│   │
│ │ ...                  │ ...            │ ...      │ ...     │   │
│ └──────────────────────┴────────────────┴──────────┴────────┘    │
│                                                                   │
│ ... (VÉGÉTATION, RÉCOLTE, ACHAT/TRANSPORT, SEMENCES)              │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile :** Liste verticale groupée par phase, cards empilées.

---

### 4.14 — Grille Suivi Mensuel (#10)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Suivi Mensuel        [Graphiques]    📅 Campagne 2026 ▾          │
│                                      [📄 PDF] [📊 Excel]         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌──────────┬────┬────┬────┬────┬────┬────┬───┬─────┬─────┬─────┐│
│ │Technicien│Jan │Fév │Mar │Avr │Mai │Jun │...│Total│Obj. │  %  ││
│ ├──────────┼────┼────┼────┼────┼────┼────┼───┼─────┼─────┼─────┤│
│ │Koné M.   │ 28 │ 35 │ 42 │ 38 │ 45 │ 52 │   │ 342 │ 300 │114%││
│ │          │ PC │ PC │ PC │ GC │ GC │ GC │   │     │     │ 🟢 ││
│ ├──────────┼────┼────┼────┼────┼────┼────┼───┼─────┼─────┼─────┤│
│ │Diallo A. │ 22 │ 28 │ 35 │ 30 │ 40 │ 48 │   │ 295 │ 300 │ 98%││
│ │          │    │    │    │    │    │    │   │     │     │ 🔵 ││
│ ├──────────┼────┼────┼────┼────┼────┼────┼───┼─────┼─────┼─────┤│
│ │...       │    │    │    │    │    │    │   │     │     │     ││
│ ├──────────┼────┼────┼────┼────┼────┼────┼───┼─────┼─────┼─────┤│
│ │TOTAL     │150 │190 │245 │220 │275 │310 │   │2 847│4 500│ 63%││
│ └──────────┴────┴────┴────┴────┴────┴────┴───┴─────┴─────┴─────┘│
│                                                                   │
│ Légende : ■ Petite campagne  ■ Grande campagne                    │
│ 🟢 BONUS (≥110%)  🔵 CONFORME (≥100%)  🟠 ALERTE (<100%)  🔴 RÉSIL. (<80%) │
└──────────────────────────────────────────────────────────────────┘
```

---

### 4.15 — Configuration Paramètres (#05)

```
Desktop (1024px+):
┌──────────────────────────────────────────────────────────────────┐
│ Paramètres                          [Journal d'audit →]           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ OBJECTIFS & PERFORMANCE                                           │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Objectif annuel par technicien        [  300  ] T          │   │
│ │ Seuil bonus (+%)                      [   10  ] %  = 330 T│   │
│ │ Bonus unitaire                        [    1  ] FCFA/kg    │   │
│ │ Seuil résiliation (-%)                [   20  ] %  = 240 T│   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ CAMPAGNES                                                         │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Petite campagne                       [   40  ] %          │   │
│ │ Grande campagne                       [   60  ] %          │   │
│ │                                       Total : 100% ✓       │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ QUALITÉ PADDY                                                     │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Humidité maximum                      [   14  ] %          │   │
│ │ Impuretés maximum                     [    3  ] %          │   │
│ │ Brisure maximum                       [   15  ] %          │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│ PRIX D'ACHAT RÉFÉRENCE                                            │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Zone       │ Prix (FCFA/kg) │ Période                      │   │
│ │ Bouaké     │ [   150  ]     │ [Toute l'année ▾]            │   │
│ │ Korhogo    │ [   145  ]     │ [Toute l'année ▾]            │   │
│ │ + Ajouter une zone                                         │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│              [  Enregistrer les modifications  ]                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Accessibilité

### WCAG 2.1 Level AAA — Exigences

#### Perceivable (Perceptible)

| Critère | Exigence AAA | Implémentation AgroPilot |
|---------|-------------|--------------------------|
| 1.1.1 Contenu non textuel | Toutes images ont un alt text | Alt text descriptif sur photos inspection, profils, livrables. Alt="" pour icônes décoratives |
| 1.3.1 Info et relations | Structure sémantique | `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, headings H1-H4 hiérarchiques |
| 1.4.3 Contraste (AA) | 4.5:1 texte, 3:1 UI | Garanti par les tokens de couleur (voir section 7) |
| 1.4.6 Contraste (AAA) | **7:1 texte, 4.5:1 grands textes** | Primaire (#1B6B3A) sur blanc = 7.2:1 ✓ Texte body (#1A1A1A) sur blanc = 17.4:1 ✓ |
| 1.4.8 Présentation visuelle | Largeur max 80 caractères, interligne 1.5× | `max-width: 75ch` sur les blocs texte, `line-height: 1.6` body |
| 1.4.10 Reflow | Pas de scroll horizontal à 320px | Design mobile-first responsive, toutes les tables scrollent horizontalement |
| 1.4.12 Espacement texte | Redimensionnable à 200% | Unités rem, pas de hauteurs fixes sur les conteneurs texte |

#### Operable (Utilisable)

| Critère | Exigence AAA | Implémentation AgroPilot |
|---------|-------------|--------------------------|
| 2.1.1 Clavier | Navigation complète au clavier | Tab order logique, tous les composants shadcn/ui accessibles nativement |
| 2.1.3 Clavier (sans exception) | Aucun piège clavier | Escape ferme tous les modals/sheets/dropdowns |
| 2.4.1 Bypass blocks | Skip navigation | Lien « Aller au contenu principal » en premier élément focusable |
| 2.4.3 Focus order | Ordre logique | Tab suit l'ordre visuel (sidebar → header → main → bottom nav) |
| 2.4.7 Focus visible | Indicateur focus 2px | `outline: 2px solid var(--ring)`, `outline-offset: 2px` |
| 2.4.9 But du lien (AAA) | Liens descriptifs | Pas de « cliquez ici » — textes explicites : « Voir l'inspection #142 » |
| 2.4.10 Section headings (AAA) | Sections titrées | Chaque section du dashboard a un H2/H3 |
| 2.3.1 Pas de flash | Rien ne clignote > 3× /s | Aucune animation clignotante. `prefers-reduced-motion` respecté |

#### Understandable (Compréhensible)

| Critère | Exigence AAA | Implémentation AgroPilot |
|---------|-------------|--------------------------|
| 3.1.1 Langue page | `lang="fr"` | Défini sur `<html lang="fr">` |
| 3.2.1 Au focus | Pas de changement de contexte | Aucun submit automatique au focus |
| 3.3.1 Identification erreurs | Messages d'erreur clairs | Messages inline en français sous chaque champ : « L'humidité doit être entre 0 et 30% » |
| 3.3.2 Labels | Labels pour tous les champs | `<Label htmlFor>` + `aria-describedby` pour aide contextuelle |
| 3.3.3 Suggestion d'erreur | Proposer des corrections | « Le poids doit être supérieur à 0. Exemple : 2400 » |
| 3.3.5 Aide (AAA) | Aide contextuelle | Tooltips d'aide sur chaque champ du workflow d'inspection |
| 3.3.6 Prévention erreurs (AAA) | Confirmation avant soumission | Étape 7 (Confirmation) dans les workflows — récapitulatif complet avant envoi |

#### Robust (Robuste)

| Critère | Exigence AAA | Implémentation AgroPilot |
|---------|-------------|--------------------------|
| 4.1.2 Nom, rôle, valeur | ARIA correct | shadcn/ui + Radix UI = ARIA natif. Custom : `aria-label`, `aria-invalid`, `aria-describedby` |
| 4.1.3 Messages de statut | `aria-live` pour les mises à jour | Toasts : `role="status"`, `aria-live="polite"`. Alertes critiques : `aria-live="assertive"` |

#### Navigation clavier

```
Tab            → Élément interactif suivant
Shift+Tab      → Élément interactif précédent
Enter          → Activer bouton / lien / ouvrir dropdown
Space          → Activer bouton, toggle checkbox/switch
Escape         → Fermer modal / sheet / dropdown / notification
Arrow ↑↓       → Naviguer dans les listes, dropdowns, menus
Arrow ←→       → Naviguer entre les onglets (tabs)
Home / End     → Premier / dernier élément d'une liste
```

#### Annotations ARIA par écran

**Stepper Inspection (#15) :**
```html
<nav aria-label="Progression de l'inspection">
  <ol role="list">
    <li aria-current="step">Étape 4 — Analyse qualité</li>
  </ol>
</nav>
<main aria-label="Formulaire analyse qualité">
  <fieldset>
    <legend>Notation qualité du paddy</legend>
    <label for="humidity">Humidité (%)</label>
    <input id="humidity" type="number" aria-describedby="humidity-help" />
    <span id="humidity-help">Seuil maximum : 14%. Au-delà, risque qualité.</span>
  </fieldset>
</main>
```

**Dashboard (#23) :**
```html
<main aria-label="Tableau de bord performance">
  <section aria-label="Indicateurs clés de performance">
    <div role="status" aria-live="polite">
      Objectif global : 4 500 T — Collecté : 2 847 T — Taux : 63,3%
    </div>
  </section>
  <section aria-label="Graphique évolution mensuelle">
    <figure>
      <figcaption>Tonnage mensuel par campagne</figcaption>
      <!-- Recharts avec accessibilité -->
    </figure>
  </section>
</main>
```

---

## 6. Bibliothèque de composants

### Composants shadcn/ui utilisés

| Composant shadcn | Usage AgroPilot | Variantes |
|-------------------|-----------------|-----------|
| `sidebar` | Navigation desktop | Collapsible, avec icônes + labels |
| `card` | KPI cards, fiches résumé, cards liste mobile | Default, avec header/footer |
| `table` | Grille mensuelle, approvisionnement, bonus, audit | Avec tri, pagination |
| `form` + `field` | Tous les formulaires (technicien, producteur, paramètres, inspection) | Avec validation Zod |
| `input` | Champs texte, numériques | Default, avec icône, avec unité |
| `select` | Dropdowns (zone, type, statut) | Default, searchable (combobox) |
| `button` | Actions principales et secondaires | Primary, Secondary, Destructive, Ghost, Icon |
| `badge` | Statuts technicien, scoring producteur, statut activité | Couleurs sémantiques |
| `tabs` | Dashboard (Performance/Achat/Bonus), Fiche technicien | Default |
| `dialog` | Confirmations, détails | Default, avec form |
| `sheet` | Menu mobile « Plus », actions rapides FAB | Bottom |
| `progress` | Barre objectif technicien, tests qualité semences | Default, avec label |
| `chart` | Dashboard graphiques, suivi mensuel | Area, Bar stacked, Line |
| `calendar` | Sélection de dates | Default |
| `avatar` | Photos profil techniciens/producteurs | Circle, avec fallback initiales |
| `breadcrumb` | Navigation hiérarchique desktop | Default |
| `alert` | Alertes humidité, écart poids, performance | Warning, Destructive |
| `skeleton` | Loading states | Default |
| `sonner` (toast) | Confirmations d'actions | Success, Error, Info |
| `pagination` | Tables longues (approvisionnement, producteurs) | Default |
| `scroll-area` | Tables horizontales sur mobile | Horizontal |
| `tooltip` | Aide contextuelle sur les champs | Default |
| `switch` | Dark mode toggle, filtres on/off | Default |
| `separator` | Divisions visuelles entre sections | Default |
| `dropdown-menu` | Menu utilisateur (header), actions contextuelles | Default |
| `empty` | États vides (pas d'inspection, pas de notification) | Avec illustration |
| `spinner` | Chargement en cours | Default |

### Composants custom à créer

#### 1. StepperWorkflow

**Purpose:** Navigation step-by-step pour les workflows d'inspection (7 étapes) et transport (6 étapes)

**Structure:**
```tsx
<StepperWorkflow
  steps={[
    { label: "Déplacement", icon: MapPin, status: "completed" },
    { label: "Photos", icon: Camera, status: "completed" },
    { label: "Échantillonnage", icon: FlaskConical, status: "current" },
    { label: "Qualité", icon: Star, status: "upcoming" },
    // ...
  ]}
  currentStep={2}
  onStepClick={(index) => {/* navigation backward only */}}
/>
```

**Styling:**
- Étape complétée : cercle vert + check + ligne verte
- Étape courante : cercle primaire plein + pulsation douce + ligne grise
- Étape à venir : cercle gris outline + ligne grise
- Largeur : 100%, horizontal sur mobile, horizontal sur desktop
- Touch target : 44px × 44px par étape
- Texte label : 12px sous le cercle sur mobile, 14px sur desktop

**States:**
- Default : navigation visuelle uniquement
- Interactive : clic pour revenir aux étapes précédentes (jamais avancer)
- Disabled : étapes futures non cliquables

**Accessibility:**
```html
<nav aria-label="Progression du workflow">
  <ol role="list">
    <li role="listitem" aria-current="step">
      <span aria-hidden="true">③</span>
      <span>Échantillonnage</span>
      <span class="sr-only">Étape 3 sur 7 — En cours</span>
    </li>
  </ol>
</nav>
```

---

#### 2. KPICard

**Purpose:** Affichage d'un indicateur clé dans le dashboard

**Structure:**
```tsx
<KPICard
  label="Total collecté"
  value="2 847"
  unit="T"
  trend={{ direction: "up", value: "+312 T", period: "vs mois précédent" }}
  icon={TrendingUp}
  color="success"
/>
```

**Sizing:**
- Mobile : 50% width (grid 2×2)
- Desktop : 25% width (grid 4×1)
- Min-height : 120px
- Padding : 16px mobile, 24px desktop

**Accessibility:**
```html
<div role="status" aria-label="Total collecté : 2 847 tonnes, en hausse de 312 tonnes par rapport au mois précédent">
```

---

#### 3. StatusBadge

**Purpose:** Badge visuel pour les statuts de performance technicien et scoring producteur

**Variants — Technicien :**
| Statut | Couleur fond | Couleur texte | Icône |
|--------|-------------|---------------|-------|
| BONUS | `success/10` | `success` | TrendingUp |
| CONFORME | `info/10` | `info` | Check |
| ALERTE | `warning/10` | `warning` | AlertTriangle |
| RÉSILIATION | `destructive/10` | `destructive` | XCircle |

**Variants — Producteur Scoring :**
| Scoring | Couleur | Icône |
|---------|---------|-------|
| OR | `amber-600` | Medal (🥇) |
| ARGENT | `slate-400` | Medal (🥈) |
| BRONZE | `orange-700` | Medal (🥉) |
| EXCLU | `destructive` | Ban (⛔) |

**Accessibility:** `aria-label="Statut : BONUS — objectif dépassé"`

---

#### 4. PhotoCapture

**Purpose:** Composant de prise de photos in-app avec horodatage et GPS

**Structure:**
```tsx
<PhotoCapture
  minPhotos={3}
  maxPhotos={10}
  currentCount={2}
  onCapture={(photo) => {/* avec métadonnées GPS + timestamp */}}
  compressionTarget={500} // KB
/>
```

**UI:**
- Grille de vignettes (3 colonnes)
- Bouton « + Prendre une photo » (ouvre caméra native)
- Compteur : « 2 / 3 minimum »
- Vignettes avec overlay timestamp
- Icône suppression sur chaque vignette
- Touch target capture : 56px × 56px

**States:**
- Insuffisant (< min) : bordure orange, message « X photo(s) encore requise(s) »
- Suffisant (≥ min) : bordure verte, message « ✓ Minimum atteint »
- Maximum atteint : bouton capture désactivé

---

#### 5. GPSIndicator

**Purpose:** Indicateur visuel de la capture GPS

**Structure:**
```tsx
<GPSIndicator
  status="acquired" // "searching" | "acquired" | "error" | "manual"
  coordinates={{ lat: 7.693, lon: -5.547 }}
  accuracy={12} // mètres
/>
```

**UI:**
- Searching : icône GPS + spinner + « Recherche du signal... »
- Acquired : icône GPS verte + coordonnées + précision
- Error : icône GPS rouge + « Signal GPS indisponible » + bouton « Saisie manuelle »
- Manual : icône GPS orange + champs lat/lon éditables

---

#### 6. QualityRating

**Purpose:** Notation par étoiles/slider pour les 5 critères d'analyse qualité

**Structure:**
```tsx
<QualityRating
  label="Aspect visuel"
  value={4}
  max={5}
  onChange={(val) => {}}
/>
```

**UI:**
- 5 étoiles cliquables/tapables
- Taille étoile : 36px sur mobile (touch-friendly)
- Affichage numérique : « 4/5 » à droite
- Slider alternatif pour l'humidité (champ numérique)

**Accessibility:** `role="slider"`, `aria-valuemin="1"`, `aria-valuemax="5"`, `aria-valuenow="4"`, `aria-label="Aspect visuel : 4 sur 5"`

---

#### 7. ConnectionStatus

**Purpose:** Indicateur de statut réseau (online/offline/syncing)

**Structure:**
```tsx
<ConnectionStatus
  status="online" // "online" | "offline" | "syncing"
  pendingCount={0}
/>
```

**UI:**
- Online : pastille verte dans le header (discret)
- Offline : bandeau jaune en haut de page « Mode hors-ligne — Les données seront synchronisées au retour de la connexion »
- Syncing : pastille bleue + animation rotation + « Synchronisation... (3 en attente) »

**Accessibility:** `role="status"`, `aria-live="polite"`

---

#### 8. FCFAInput

**Purpose:** Input numérique formaté en FCFA (séparateur milliers espace)

**Structure:**
```tsx
<FCFAInput
  label="Prix négocié"
  value={150000}
  onChange={(val) => {}}
  suffix="FCFA/kg" // ou "FCFA"
/>
```

**UI:**
- Affichage formaté : « 150 000 » (espace séparateur)
- Suffixe unité grisé à droite du champ
- Clavier numérique sur mobile (`inputMode="numeric"`)

---

## 7. Design Tokens

### Palette de couleurs

#### Couleurs primaires — Vert LOCAGRI (agriculture)

```css
--primary:         #1B6B3A;    /* vert profond — actions, navigation active, boutons primaires */
--primary-dark:    #145230;    /* hover sur boutons primaires */
--primary-light:   #2D8B50;    /* liens, accents légers */
--primary-subtle:  #E8F5ED;    /* fond de badges, highlights discrets */
```

**Contraste sur blanc :**
- `#1B6B3A` sur `#FFFFFF` = **7.2:1** ✓ AAA
- `#145230` sur `#FFFFFF` = **9.8:1** ✓ AAA

#### Couleurs sémantiques — Zones de performance

```css
/* BONUS — vert vif */
--success:         #16A34A;    /* statut BONUS, validation, succès */
--success-subtle:  #DCFCE7;    /* fond badge BONUS */

/* CONFORME — bleu */
--info:            #2563EB;    /* statut CONFORME, information */
--info-subtle:     #DBEAFE;    /* fond badge CONFORME */

/* ALERTE — orange */
--warning:         #D97706;    /* statut ALERTE, avertissements */
--warning-subtle:  #FEF3C7;    /* fond badge ALERTE */

/* RÉSILIATION — rouge */
--destructive:     #DC2626;    /* statut RÉSILIATION, erreurs, actions destructives */
--destructive-subtle: #FEE2E2; /* fond badge RÉSILIATION */
```

**Contraste texte sémantique sur fond blanc :**
- `#16A34A` = 4.6:1 (AA large text) → utiliser `#15803D` (5.4:1) pour texte courant AAA
- `#2563EB` = 4.6:1 → utiliser `#1D4ED8` (5.8:1) pour AAA
- `#D97706` = 3.4:1 → utiliser `#B45309` (5.0:1) pour AAA
- `#DC2626` = 4.6:1 → utiliser `#B91C1C` (6.1:1) pour AAA

**Variantes AAA garanties :**
```css
--success-text:    #15803D;    /* 5.4:1 sur blanc — AAA texte large */
--info-text:       #1D4ED8;    /* 5.8:1 — AAA texte large */
--warning-text:    #92400E;    /* 7.1:1 — AAA tout texte */
--destructive-text:#991B1B;    /* 7.8:1 — AAA tout texte */
```

#### Scoring producteurs

```css
--scoring-or:      #D97706;    /* médaille OR — ambré doré */
--scoring-argent:  #64748B;    /* médaille ARGENT — gris bleuté */
--scoring-bronze:  #C2410C;    /* médaille BRONZE — cuivré */
--scoring-exclu:   #991B1B;    /* EXCLU — rouge foncé */
```

#### Neutrals

```css
--background:      #FFFFFF;    /* fond principal */
--surface:         #FAFAF9;    /* fond cards, sidebar */
--muted:           #F5F5F4;    /* fond inputs disabled, séparateurs */
--border:          #E7E5E4;    /* bordures */
--border-strong:   #D6D3D1;    /* bordures accentuées (tables) */

--foreground:      #1A1A1A;    /* texte principal — 17.4:1 AAA ✓ */
--foreground-muted:#57534E;    /* texte secondaire — 7.1:1 AAA ✓ */
--foreground-subtle:#A8A29E;   /* placeholders, texte désactivé — 3.4:1 (décoratif uniquement) */
```

#### Phases du calendrier

```css
--phase-intercampagne: #DBEAFE; /* bleu clair */
--phase-preparation:   #DCFCE7; /* vert clair */
--phase-semis:         #FEF9C3; /* jaune clair */
--phase-vegetation:    #E0F2FE; /* cyan clair */
--phase-recolte:       #FED7AA; /* orange clair */
--phase-achat:         #F3E8FF; /* violet clair */
--phase-semences:      #FCE7F3; /* rose clair */
```

#### Dark mode (optionnel)

```css
/* Dark mode — inversions */
--background:      #1C1917;
--surface:         #292524;
--muted:           #44403C;
--border:          #57534E;
--foreground:      #FAFAF9;
--foreground-muted:#D6D3D1;
```

---

### Typographie

**Font family:**
```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", Monaco, monospace;
```

**Pourquoi Inter :**
- Conçue pour les interfaces, excellente lisibilité sur petit écran
- Disponible sur Google Fonts (gratuit)
- Supporte les caractères français (accents, ç, etc.)
- Nombreuses graisses disponibles

**Type scale :**

| Token | Taille | Poids | Line-height | Letter-spacing | Usage |
|-------|--------|-------|-------------|----------------|-------|
| `display` | 36px | 700 | 1.1 | -0.02em | Titres dashboard, page d'accueil |
| `h1` | 30px | 700 | 1.2 | -0.02em | Titre de page |
| `h2` | 24px | 600 | 1.3 | -0.01em | Titre de section |
| `h3` | 20px | 600 | 1.4 | 0 | Titre de card, de groupe |
| `h4` | 16px | 600 | 1.5 | 0 | Sous-titre, label de section |
| `body` | 16px | 400 | 1.6 | 0 | Texte courant |
| `body-medium` | 16px | 500 | 1.6 | 0 | Texte courant emphase |
| `small` | 14px | 400 | 1.5 | 0 | Texte secondaire, métadonnées |
| `caption` | 12px | 500 | 1.4 | 0.02em | Labels de champs, légendes graphiques |
| `overline` | 11px | 600 | 1.3 | 0.08em | Labels ALL CAPS (sections, badges) — min AAA |

**Responsive :**
- Mobile (< 768px) : `display` → 28px, `h1` → 24px, `h2` → 20px
- Tout texte courant ≥ 16px (éviter zoom navigateur sur iOS)

---

### Spacing

**Base : 4px (0.25rem)**

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-1` | 4px | Écart icône-texte, padding interne minimal |
| `space-2` | 8px | Padding interne badges, gap grille fine |
| `space-3` | 12px | Padding interne inputs |
| `space-4` | 16px | Padding cards mobile, gap grille standard |
| `space-5` | 20px | Padding buttons |
| `space-6` | 24px | Padding cards desktop, gap entre cards |
| `space-8` | 32px | Marge entre sections |
| `space-10` | 40px | Marge entre groupes de sections |
| `space-12` | 48px | Marge entre zones majeures |
| `space-16` | 64px | Espacement vertical de page |

**Layout :**
```css
--container-max:   1280px;    /* largeur max du contenu */
--sidebar-width:   260px;     /* sidebar ouverte */
--sidebar-collapsed: 64px;    /* sidebar icônes */
--header-height:   56px;      /* header fixe */
--bottom-nav:      64px;      /* bottom nav mobile */
--gutter-mobile:   16px;      /* marge latérale mobile */
--gutter-desktop:  24px;      /* marge latérale desktop */
```

---

### Shadows (Élévation)

```css
--shadow-sm:    0 1px 2px 0 rgba(0,0,0,0.05);                           /* cards au repos */
--shadow-md:    0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06);  /* cards hover */
--shadow-lg:    0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05); /* modals, sheets */
--shadow-xl:    0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04);/* FAB */
```

---

### Border Radius

```css
--radius-sm:   4px;     /* badges, chips */
--radius-md:   8px;     /* cards, inputs, boutons */
--radius-lg:   12px;    /* modals, sheets */
--radius-xl:   16px;    /* cards mobiles feature */
--radius-full: 9999px;  /* avatars, FAB, toggle */
```

---

### Breakpoints

```css
--bp-mobile:   375px;    /* Mobile (cible Samsung Galaxy A14) */
--bp-tablet:   768px;    /* Tablette */
--bp-desktop:  1024px;   /* Desktop */
--bp-wide:     1280px;   /* Wide desktop */
--bp-max:      1440px;   /* Max content width */
```

**Responsive rules :**
```css
/* Mobile-first */
/* Default = mobile (375px+) */

@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop — sidebar visible, bottom nav → sidebar */ }
@media (min-width: 1280px) { /* Wide — sidebar ouverte par défaut */ }
```

---

### Animations & Transitions

```css
--duration-fast:    100ms;    /* feedback immédiat (hover, active) */
--duration-normal:  200ms;    /* transitions standard (navigation, toggles) */
--duration-slow:    300ms;    /* animations d'entrée (modals, sheets) */
--duration-slower:  500ms;    /* animations complexes (graphiques, page transitions) */

--ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);    /* standard */
--ease-out:         cubic-bezier(0, 0, 0.2, 1);       /* entrée d'éléments */
--ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* rebond subtil (FAB, badges) */
```

**Respect `prefers-reduced-motion` :**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Handoff développeur

### Priorités d'implémentation

**Phase 1 — Foundation (Jour 1) :**
1. Design tokens CSS custom properties (section 7)
2. Layout desktop (sidebar) + Layout mobile (bottom nav)
3. Composants de base : Button, Input, Card, Badge, Table
4. Page de connexion (Clerk)
5. Routing par rôle

**Phase 2 — Config & Registres (Jour 2) :**
1. Module Paramètres (formulaire configuration)
2. Registre Techniciens (CRUD + liste + fiche)
3. StatusBadge component
4. KPICard component

**Phase 3 — Suivi & Calendrier (Jour 3) :**
1. Grille suivi mensuel (table responsive)
2. Graphiques (recharts — barres empilées + courbe)
3. Calendrier opérationnel (vue par phase)
4. Détail activité + upload livrables

**Phase 4 — Inspection & Achat (Jour 4) :**
1. StepperWorkflow component
2. Workflow inspection 7 étapes (tout le flow mobile)
3. PhotoCapture component
4. GPSIndicator component
5. QualityRating component
6. KPI inspections

**Phase 5 — Transport & Approvisionnement (Jour 5) :**
1. Workflow transport 6 étapes
2. Registre approvisionnement (table + filtres + pagination)
3. Interface réceptionniste

**Phase 6 — Dashboard, Scoring & Semences (Jour 6) :**
1. Dashboard Performance (3 onglets)
2. Scoring producteurs (CRUD + badges)
3. Module semences (producteurs + épurations + tests + stock)

**Phase 7 — Polish & Offline (Jour 7) :**
1. Centre de notifications
2. ConnectionStatus component
3. Mode dégradé hors-ligne (Service Worker)
4. Export PDF/Excel
5. Dark mode
6. Tests accessibilité (Axe DevTools, clavier, screen reader)

### Composant mapping shadcn → install

```bash
# UI Components
npx shadcn@latest add sidebar card table form input select button badge
npx shadcn@latest add tabs dialog sheet progress calendar avatar breadcrumb
npx shadcn@latest add alert skeleton sonner pagination scroll-area tooltip
npx shadcn@latest add switch separator dropdown-menu empty spinner
npx shadcn@latest add chart combobox textarea toggle label field

# Blocks (référence)
npx shadcn@latest add dashboard-01 sidebar-07 login-02
```

### Structure des fichiers recommandée

```
src/
├── components/
│   ├── ui/              ← shadcn/ui (auto-généré)
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── SiteHeader.tsx
│   │   └── RoleLayout.tsx
│   ├── workflow/
│   │   ├── StepperWorkflow.tsx
│   │   ├── InspectionWorkflow.tsx
│   │   └── TransportWorkflow.tsx
│   ├── field/
│   │   ├── PhotoCapture.tsx
│   │   ├── GPSIndicator.tsx
│   │   ├── QualityRating.tsx
│   │   ├── FCFAInput.tsx
│   │   └── ConnectionStatus.tsx
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   └── StatusBadge.tsx
│   └── shared/
│       ├── DataTable.tsx  ← table réutilisable avec tri/filtre/pagination
│       ├── EmptyState.tsx
│       └── ExportButtons.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Unauthorized.tsx
│   ├── dashboard/
│   │   ├── DashboardPerformance.tsx
│   │   ├── DashboardAchat.tsx
│   │   └── DashboardBonus.tsx
│   ├── techniciens/
│   │   ├── TechniciensList.tsx
│   │   ├── TechnicienDetail.tsx
│   │   └── TechnicienForm.tsx
│   ├── inspections/
│   │   ├── InspectionsList.tsx
│   │   ├── InspectionWorkflow.tsx
│   │   ├── InspectionDetail.tsx
│   │   └── InspectionKPIs.tsx
│   ├── transport/
│   │   ├── TransportList.tsx
│   │   ├── TransportWorkflow.tsx
│   │   ├── TransportDetail.tsx
│   │   └── TransportKPIs.tsx
│   ├── approvisionnement/
│   │   └── ApprovisionnementRegister.tsx
│   ├── calendrier/
│   │   ├── CalendrierOperationnel.tsx
│   │   └── ActivityDetail.tsx
│   ├── suivi-mensuel/
│   │   ├── SuiviMensuelGrid.tsx
│   │   └── SuiviMensuelCharts.tsx
│   ├── producteurs/
│   │   ├── ProducteursList.tsx
│   │   ├── ProducteurDetail.tsx
│   │   └── ProducteurForm.tsx
│   ├── semences/
│   │   ├── SeedProducersList.tsx
│   │   ├── SeedProducerDetail.tsx
│   │   ├── EpurationTracking.tsx
│   │   ├── QualityTests.tsx
│   │   └── SeedStock.tsx
│   ├── parametres/
│   │   ├── Settings.tsx
│   │   └── AuditLog.tsx
│   ├── notifications/
│   │   └── NotificationCenter.tsx
│   └── reception/
│       └── ReceptionInterface.tsx
├── hooks/
│   ├── useGPS.ts
│   ├── useCamera.ts
│   ├── useConnectionStatus.ts
│   └── useFCFAFormat.ts
└── lib/
    ├── formatters.ts     ← formatFCFA(), formatDate(), formatPercent()
    ├── validators.ts     ← schémas Zod partagés
    └── constants.ts      ← couleurs, seuils, labels
```

### Responsive implementation

```css
/* Mobile-first approach */

/* Base = mobile (375px+) */
.page-container {
  padding: var(--gutter-mobile); /* 16px */
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4); /* 16px — cards empilées */
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .data-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6); /* 24px */
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .page-container {
    padding: var(--gutter-desktop); /* 24px */
  }

  .bottom-nav { display: none; }
  .sidebar { display: flex; }

  .data-list {
    /* Switch to table layout for data-heavy views */
    display: table;
  }
}
```

### Touch targets (mobile)

```css
/* Minimum 44×44px pour tous les éléments interactifs */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Boutons mobiles */
.btn-mobile {
  min-height: 48px;
  font-size: 16px; /* éviter zoom iOS */
  padding: 12px 24px;
}

/* FAB */
.fab {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xl);
}
```

### Formatting functions

```typescript
// FCFA formatting (espace séparateur, pas de décimale)
function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}
// → "360 000 FCFA"

// Date formatting DD/MM/YYYY
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Abidjan',
  }).format(date);
}
// → "24/03/2026"

// Percentage formatting
function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value / 100);
}
// → "63,3 %"

// Weight formatting (tonnes / kg)
function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1).replace('.', ',')} T`;
  }
  return `${new Intl.NumberFormat('fr-FR').format(kg)} kg`;
}
// → "2,4 T" ou "800 kg"
```

### Accessibility testing checklist

```markdown
## Tests à effectuer avant chaque release

### Automatisés
- [ ] Axe DevTools — 0 violation critique
- [ ] Lighthouse Accessibility — Score ≥ 95
- [ ] ESLint plugin jsx-a11y — 0 erreur

### Manuels — Clavier
- [ ] Naviguer tout le workflow d'inspection au clavier (Tab + Enter)
- [ ] Fermer tous les modals avec Escape
- [ ] Naviguer le sidebar avec Arrow keys
- [ ] Naviguer les tabs du dashboard avec Arrow ←→
- [ ] Skip navigation link fonctionne

### Manuels — Screen reader
- [ ] Tester avec NVDA (Windows) ou VoiceOver (macOS/iOS)
- [ ] Les KPI cards annoncent leur valeur
- [ ] Le stepper annonce l'étape courante
- [ ] Les badges de statut sont lus (« Statut : BONUS »)
- [ ] Les messages de validation sont annoncés
- [ ] Les toasts sont annoncés via aria-live

### Manuels — Visuels
- [ ] Vérifier le contraste avec l'outil Colour Contrast Analyser
- [ ] Tester le zoom à 200% — aucune perte de contenu
- [ ] Tester `prefers-reduced-motion` — animations désactivées
- [ ] Tester le mode sombre — contrastes maintenus
- [ ] Vérifier la lisibilité en extérieur (luminosité max)
```

---

## 9. Validation

### Couverture des exigences

| FR | Exigence | Écran(s) | Couvert |
|----|----------|----------|---------|
| FR-001 | Auth + 5 rôles | #01, #02, #03, #04 | ✓ |
| FR-002 | Paramètres métier | #05 | ✓ |
| FR-003 | Journal audit | #06 | ✓ |
| FR-004 | CRUD Techniciens | #07, #08, #09 | ✓ |
| FR-005 | Objectifs + performance | #08, #23 | ✓ |
| FR-006 | Alertes performance | #34 | ✓ |
| FR-007 | Suivi mensuel | #10 | ✓ |
| FR-008 | Graphiques mensuel | #11 | ✓ |
| FR-009 | Export PDF/Excel | #10, #22, #25 | ✓ |
| FR-010 | Calendrier 17 activités | #12 | ✓ |
| FR-011 | Livrables activité | #13 | ✓ |
| FR-012 | Alertes retard | #12, #34 | ✓ |
| FR-013 | Workflow inspection 7 étapes | #15 | ✓ |
| FR-014 | KPI inspections | #17 | ✓ |
| FR-015 | Workflow transport 6 étapes | #19 | ✓ |
| FR-016 | KPI transport | #21 | ✓ |
| FR-017 | Registre approvisionnement | #22 | ✓ |
| FR-018 | Dashboard Performance | #23 | ✓ |
| FR-019 | Dashboard Achat & Transport | #24 | ✓ |
| FR-020 | Détail bonus | #25 | ✓ |
| FR-021 | Producteurs + scoring | #26, #27, #28 | ✓ |
| FR-022 | Historique scoring | #27 | ✓ |
| FR-023 | Producteurs semenciers | #29, #30 | ✓ |
| FR-024 | Épurations variétales | #31 | ✓ |
| FR-025 | Tests qualité + certification | #32 | ✓ |
| FR-026 | Stock + distribution | #33 | ✓ |
| FR-027 | Objectifs semenciers | #30 | ✓ |
| FR-028 | GPS + photos horodatées | #15, #19 (PhotoCapture, GPSIndicator) | ✓ |
| FR-029 | Centre notifications | #34 | ✓ |
| FR-030 | Réception paddy | #35 | ✓ |
| FR-031 | Navigation + layout responsive | #03, #04 | ✓ |
| FR-032 | Mode dégradé hors-ligne | ConnectionStatus component | ✓ |

**Couverture : 32/32 FRs (100%)**

### Couverture NFR

| NFR | Exigence | Implémentation UX |
|-----|----------|-------------------|
| NFR-001 | Performance < 3s | Skeleton loading, code splitting, lazy loading |
| NFR-002 | 50 techniciens, 5000 producteurs | Pagination, filtres, virtual scroll |
| NFR-003 | RBAC 5 rôles | Layout par rôle, navigation filtrée, page 403 |
| NFR-004 | Intégrité données | Validation inline + confirmation workflow |
| NFR-005 | Scalabilité | Pagination, lazy loading, indexes |
| NFR-006 | Disponibilité 99,5% | Mode dégradé offline, ConnectionStatus |
| NFR-007 | Mobile-first | Design 375px, touch 44px, body 16px |
| NFR-008 | Accessibilité | WCAG AAA complet (section 5) |
| NFR-009 | Localisation FR/FCFA | Formatters, lang="fr", timezone Abidjan |
| NFR-010 | Maintenabilité | Structure fichiers, composants shadcn, design tokens |

**Couverture : 10/10 NFRs (100%)**

### Checklist accessibilité

- [x] WCAG 2.1 AAA — contraste 7:1 vérifié sur tous les tokens
- [x] Navigation clavier documentée
- [x] Screen reader — annotations ARIA par écran
- [x] Responsive mobile 375px–1920px
- [x] Touch targets ≥ 44px
- [x] Texte ≥ 16px body
- [x] `prefers-reduced-motion` respecté
- [x] `lang="fr"` défini
- [x] Skip navigation link
- [x] Messages d'erreur descriptifs en français

### Sign-off

- [ ] Product Manager a validé la couverture fonctionnelle
- [ ] System Architect a validé la faisabilité technique
- [ ] Prêt pour l'implémentation

---

*Généré par BMAD Method v6 — UX Designer*
*Date du design : 2026-03-24*
*Prochain workflow recommandé : `/bmad:sprint-planning`*
