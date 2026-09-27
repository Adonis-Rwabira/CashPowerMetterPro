# PARTIE 1 : ARCHITECTURE ERGONOMIQUE & SYSTÈME DE DESIGN

### 1. Principes d'Allègement Cognitif
1. **Zéro Texte Explicatif :** Remplacement des paragraphes par des couples standardisés `LABEL (atténué) : VALEUR (contrastée)`.
2. **Hiérarchie Télémétrique :** L'œil doit capter l'état en moins de 200 ms :
   * Niveau 1 : Le voyant d'état (Vert / Ambre / Rouge).
   * Niveau 2 : Le solde net et l'autonomie restante (`+42.5 kWh` | `6j`).
   * Niveau 3 : L'index du cadran physique (`014520.750`).
3. **Relief Tactile Fonctionnel :** Le skeuomorphisme ne sert qu'à indiquer l'interactivité (un afficheur encastré donne une impression de profondeur, une touche de clavier s'enfonce de 1px au clic, sans fioritures superflues).
4. **Zéro Emoji — 100% Lucide Icons :** Standardisation vectorielle (épaisseur de trait fixe `1.75px`).

---

### 2. Tokens CSS & Matériaux (Dark Industrial vs Clean Lab)

```css
:root {
  /* --- THÈME PAR DÉFAUT : DARK INDUSTRIAL --- */
  --bg-cabinet: #0D1015;           /* Châssis noir anthracite texturé */
  --surface-panel: #161A22;        /* Boîtier modulaire ABS */
  --surface-border: #262D3D;       /* Rainures et découpes usinées */
  --surface-inset: #080A0E;        /* Renfoncement d'afficheur LCD */
  --din-rail: #32394A;             /* Rail de fixation métallique */

  /* Télémétrie LCD & Signaux (WCAG AAA) */
  --lcd-text: #00F5FF;             /* Cyan haute lisibilité */
  --lcd-dim: rgba(0, 245, 255, 0.08); /* Segments LCD inactifs */
  --status-green: #10B981;         /* Solde sain (> 3j) */
  --status-green-glow: rgba(16, 185, 129, 0.2);
  --status-amber: #F59E0B;         /* Seuil bas (≤ 3j) */
  --status-amber-glow: rgba(245, 158, 11, 0.2);
  --status-red: #EF4444;           /* Déficit / Rupture */
  --status-red-glow: rgba(239, 68, 68, 0.25);

  /* Typographie */
  --font-ui: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-digits: 'JetBrains Mono', monospace; /* Tabular figures strictes */
}

/* --- THÈME ALTERNATIF : CLEAN LAB (LIGHT) --- */
[data-theme="clean-lab"] {
  --bg-cabinet: #F1F4F9;
  --surface-panel: #FFFFFF;
  --surface-border: #CBD5E1;
  --surface-inset: #E2E8F0;
  --din-rail: #94A3B8;

  --lcd-text: #0F172A;
  --lcd-dim: rgba(15, 23, 42, 0.05);
  --status-green: #059669;
  --status-amber: #D97706;
  --status-red: #DC2626;
}
```

---

# PARTIE 2 : SPÉCIFICATION ÉPURÉE ÉCRAN PAR ÉCRAN

---

### ÉCRAN 0 : SPLASH & AUTO-TEST LOCAL (0.8s)

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  [Icon: Zap]                           │
│               METER MASTER PRO                         │
│                                                        │
│      [Icon: Database] Base locale active               │
│      [Icon: WifiOff] 100% Hors-ligne                   │
│                                                        │
│               [ ━━━━━━━░░░ ] 75%                       │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** Valider l'intégrité de la base IndexedDB sans latence perçue.
* **Agencement :** Minimaliste, centré. Pas de slogan commercial ni de bloc de bienvenue verbeux.
* **Composants :** 
  * Logo : Icône Lucide `Zap` encastrée dans un cartouche biseauté sombre.
  * Titre : `METER MASTER PRO` (Inter SemiBold, 15px, espacement 2px).
  * 2 badges compacts : `[Icon: Database] IndexedDB OK` et `[Icon: WifiOff] Déconnecté`.
  * Barre de progression linéaire fine (2px).

---

### ÉCRAN 1 : CONFIGURATION INITIALE DU COMPTEUR GÉNÉRAL

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ShieldCheck] COMPTEUR GÉNÉRAL MAÎTRE            │
├────────────────────────────────────────────────────────┤
│ LIBELLÉ                                                │
│ [ Compteur Principal - Bâtiment A                    ] │
│                                                        │
│ FLUIDE :  [ [Icon: Zap] Électricité ]  [ [Icon: Droplet] Eau ]   │
│                                                        │
│ INDEX DE DÉPART (CADRAN PHYSIQUE)                      │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 0 1 4 5 2 0 . 5 0 0                            kWh │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [ INITIALISER LE COFFRET          (Icon: ArrowRight) ] │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-MTR-001`. Fixer la racine de comptage sans formulaire à rallonge.
* **Agencement :** Carte modulaire unique (largeur max `420px`).
* **Saisie :** Sélecteur de fluide compact (boutons radio segmentés avec icône `Zap` ou `Droplet`), champ d'index numérique géant façon LCD à 3 décimales.
* **Microcopy :** Libellés réduits à 1 ou 2 mots. Zéro phrase d'aide non sollicitée.

---

### ÉCRAN 2 : LE TABLEAU MODULAIRE PRINCIPAL (RAIL DIN)

```
┌────────────────────────────────────────────────────────┐
│ [Icon: Cpu] METER MASTER     [Icon: ShieldCheck] LOCAL  [Icon: Sliders] [Icon: Info]│
├────────────────────────────────────────────────────────┤
│ COMPTEUR GÉNÉRAL                      FLUX : 42.5 kWh/j│
│ 014,520.500 kWh                       ÉCART: +1.2% OK  │
├────────────────────────────────────────────────────────┤
│ SOUS-COMPTEURS (3)                       [Icon: Plus] NOUVEAU │
│                                                        │
│ ┌─ #01 Appt 101 - Dubois ──────────── [●] SAIN (6j) ─┐ │
│ │ 004,210.000 kWh       │ Solde: +42.500 kWh         │ │
│ │ [ [Icon: Hash] Index ]│ [ [Icon: PlusCircle] Crédit ]│ │
│ └────────────────────────────────────────────────────┘ │
│ ┌─ #02 Studio B - Marc ──────────── [●] BAS (18h) ───┐ │
│ │ 001,890.350 kWh       │ Solde: +5.100 kWh          │ │
│ │ [ [Icon: Hash] Index ]│ [ [Icon: PlusCircle] Crédit ]│ │
│ └────────────────────────────────────────────────────┘ │
│ ┌─ #03 Atelier Nord ─────────────── [●] COUPÉ (0h) ──┐ │
│ │ 008,120.900 kWh       │ Solde: -12.400 kWh (DETTE) │ │
│ │ [ [Icon: Hash] Index ]│ [ [Icon: PlusCircle] Crédit ]│ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ [Icon: ClipboardList] TOURNÉE      [Icon: Scale] BILAN PERTES │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** Hub opérationnel tactile. Vue simultanée du réseau divisionnaire.
* **Agencement :**
  * **Barre Maître :** Bandeau supérieur encastré montrant l'index général et l'équilibre du réseau en un coup d'œil.
  * **Rail DIN Central :** Cartes modulaires compactes empilées. Chaque carte comporte :
    * En-tête : Référence logement + voyant LED (Vert fixe, Ambre clignotant, Rouge pulsant).
    * Corps : Index à gauche (police `JetBrains Mono`), solde net restant à droite.
    * 2 boutons d'action instantanés : `[Icon: Hash]` pour relever, `[Icon: PlusCircle]` pour créditer.
  * **Pied d'écran fixe :** Deux raccourcis essentiels : *Tournée de Relève* et *Diagnostic Pertes*.

---

### ÉCRAN 3 : FICHE FOCUS D'UN SOUS-COMPTEUR

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] RETOUR              MODULE #02       │
├────────────────────────────────────────────────────────┤
│ Studio B - Marc                        [●] SEUIL BAS   │
│                                                        │
│ ┌─ AFFICHEUR D'INDEX ────────────────────────────────┐ │
│ │ 0 0 1 8 9 0 . 3 5 0                            kWh │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ SOLDE DISPONIBLE                 COUPURE ESTIMÉE       │
│ +5.100 kWh                       Demain 08:30 (~18h)   │
│                                                        │
│ JAUGE : [████████░░░░░░░░░░░░] 26% (Rythme: 6.8 kWh/j) │
│                                                        │
│ [Icon: PlusCircle] CRÉDITER COMPTEUR   [Icon: Hash] NOUVEL INDEX │
│                                                        │
│ DERNIERS ÉVÉNEMENTS                                    │
│ • 04/09 18:00  Relevé      Index 1890.350 (-3.200 kWh) │
│ • 02/09 09:15  Recharge    Token Cashpower (+20.0 kWh) │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** Consultation détaillée d'un locataire, estimation de coupure (`F-NOTIF-001`).
* **Agencement :** Carte unique aérée avec un grand cadran LCD, deux métriques clés côte à côte, une jauge de décharge et les deux actions principales en gros pavés tactiles.

---

### ÉCRAN 4 : CLAVIER TACTILE DE RELEVÉ & UNDO 8s

```
┌────────────────────────────────────────────────────────┐
│ NOUVEAU RELEVÉ — MODULE #02                            │
├────────────────────────────────────────────────────────┤
│ Précédent : 001887.150 kWh                             │
│                                                        │
│ NOUVEL INDEX :                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 0 0 1 8 9 0 . 3 5 0                            kWh │ │
│ └────────────────────────────────────────────────────┘ │
│ Conso calculée : +3.200 kWh  |  Nouveau solde : +1.900 │
│                                                        │
│   [ 1 ]    [ 2 ]    [ 3 ]                              │
│   [ 4 ]    [ 5 ]    [ 6 ]                              │
│   [ 7 ]    [ 8 ]    [ 9 ]                              │
│   [ . ]    [ 0 ]    [Icon: Delete]                     │
│                                                        │
│ [ VALIDER L'INDEX                    (Icon: Check) ]   │
├────────────────────────────────────────────────────────┤
│ [Icon: RotateCcw] Index enregistré (+3.2 kWh) [ANNULER 8s]│
└────────────────────────────────────────────────────────┘
```
* **Objectif :** Saisie instantanée au pouce sans clavier virtuel natif envahissant (`F-READ-001`).
* **Agencement :** Pavé numérique $3 \times 4$ intégré en bas d'écran. Calcul en direct du delta dès la frappe.
* **Undo Snackbar (`F-READ-003`) :** Bandeau sombre discret avec compte à rebours 8s et bouton ambré `ANNULER`.

---

### ÉCRAN 5 : TOURNÉE DE RELÈVE SYNCHRONISÉE (MODE BATCH)

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] TOURNÉE DE RELEVÉ            3/4 FAIT│
├────────────────────────────────────────────────────────┤
│ GÉNÉRAL : 14500.000 ──> [ 14520.500 ] kWh [Icon: Check]│
├────────────────────────────────────────────────────────┤
│ #01 Dubois:  4200.000 ──> [  4210.000 ] kWh [Icon: Check]│
│ #02 Marc  :  1885.000 ──> [  1890.350 ] kWh [ACTIF]    │
│ #03 Nord  :  8110.000 ──> [           ] kWh [ATTENTE]  │
├────────────────────────────────────────────────────────┤
│ Master: +20.50 kWh  |  Sous-compteurs: +15.35 kWh      │
│ Écart instantané : +5.15 kWh (Pertes normales)         │
│                                                        │
│ [ ENREGISTRER LE LOT                 (Icon: Check) ]   │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-READ-002`. Relève de tout le bâtiment en une seule passe sans changer d'écran.
* **Agencement :** Liste condensée de type tableur industriel. Tabulation automatique vers le champ suivant.

---

### ÉCRAN 6 : TERMINAL DE RECHARGE (CRÉDITATION D'UNITÉS)

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] RECHARGER — MODULE #03 (Nord)        │
├────────────────────────────────────────────────────────┤
│ Solde actuel : -12.400 kWh (En déficit)                │
│                                                        │
│ QUANTITÉ DE RECHARGE                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ + 5 0 . 0 0 0                                  kWh │ │
│ └────────────────────────────────────────────────────┘ │
│ Déduction de la dette (-12.4) ──> Nouveau solde : +37.6│
│                                                        │
│ CODE TOKEN (OPTIONNEL)                                 │
│ [ 4820 - 9912 - 0021 - 8374          ]                 │
│                                                        │
│ [X] Créditer également le Compteur Général             │
│                                                        │
│ [ CRÉDITER LE COMPTEUR               (Icon: Check) ]   │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-TOP-001` & `F-TOP-002`. Apurement immédiat du solde négatif et saisie de token.
* **Agencement :** Formulaire épuré sur une seule vue. Simulation arithmétique nette du nouveau solde.

---

### ÉCRAN 7 : DIAGNOSTIC D'ÉCART & DÉTECTION DES PERTES

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] BILAN DE RÉCONCILIATION              │
├────────────────────────────────────────────────────────┤
│ Période : [ 30 Derniers Jours (Icon: ChevronDown) ]    │
│                                                        │
│ Injection Maître : 1,245.500 kWh                       │
│ Somme Ventilée   : 1,180.200 kWh                       │
│                                                        │
│ ┌─ ÉCART DE CONSOMMATION ────────────────────────────┐ │
│ │ +65.300 kWh (5.2%)        [Icon: CheckCircle2] SAIN│ │
│ └────────────────────────────────────────────────────┘ │
│ Diagnostic : Pertes en ligne et communs admissibles.   │
│                                                        │
│ [Icon: FileSpreadsheet] EXPORTER L'AUDIT COMPLET (CSV) │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-RECON-001`. Détection instantanée des anomalies (fraude, fuite, compteur défaillant).
* **Agencement :** Chiffres clés sans verbiage. Badge sémantique instantané (`SAIN`, `ANOMALIE`, `CRITIQUE`).

---

### ÉCRAN 8 : GRAND LIVRE HISTORIQUE & RECALCUL EN CASCADE

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] HISTORIQUE & AUDIT                   │
├────────────────────────────────────────────────────────┤
│ 04/09 18:20 — Relevé #02                               │
│ Index: 1890.350 kWh (Δ: +3.200)                        │
│ [ [Icon: Edit2] Modifier ]   [ [Icon: Trash2] Effacer ]│
├────────────────────────────────────────────────────────┤
│ 02/09 09:14 — Recharge #02                             │
│ Crédit: +50.000 kWh (Token: #4820...)                  │
│ [ [Icon: Edit2] Modifier ]   [ [Icon: Trash2] Effacer ]│
├────────────────────────────────────────────────────────┤
│ [Icon: AlertTriangle] Toute modification passée        │
│ recalcule l'arbre des soldes automatiquement.          │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-READ-004`. Édition et suppression rétroactives sécurisées avec recalcul en $<100\text{ ms}$.

---

### ÉCRAN 9 : COFFRE-FORT DE DONNÉES & SÉCURITÉ

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] DONNÉES & SAUVEGARDE                 │
├────────────────────────────────────────────────────────┤
│ Stockage : IndexedDB Locale (48 Ko utilisés)           │
│                                                        │
│ [Icon: Download] EXPORTER SAUVEGARDE JSON (SHA-256)    │
│ [Icon: FileSpreadsheet] TÉLÉCHARGER LE TABLEAU CSV     │
│                                                        │
│ RESTAURATION :                                         │
│ [ Glisser-déposer le fichier JSON ici                ] │
│                                                        │
│ ZONE DE DANGER :                                       │
│ [ [Icon: AlertOctagon] Réinitialisation d'Usine (RESET)] │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-DATA-001` à `F-DATA-003`. Souveraineté totale des données, zéro cloud.

---

### ÉCRAN 10 : RÉGLAGES DU CHÂSSIS AVEC APERÇU EN DIRECT

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] CALIBRAGE DU COFFRET                 │
├────────────────────────────────────────────────────────┤
│ MATÉRIAU DU BOÎTIER                                    │
│ (•) Dark Industrial    ( ) Clean Lab   ( ) Cyber Neon  │
│                                                        │
│ POLICE DU CADRAN                                       │
│ [ Monospace JetBrains ]  [ 7-Segments ]  [ Sans-Serif ]│
│                                                        │
│ RETOURS SENSORIELS                                     │
│ [X] Clic audio réaliste (800Hz)   [X] Vibreur haptique │
│                                                        │
│ APERÇU EN DIRECT DU MODULE :                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ #01 Exemple      14 520.750 kWh     [●] SAIN (+42) │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [ VALIDER ET ENREGISTRER             (Icon: Check) ]   │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-SET-001` & `F-SET-002`. Personnalisation avec retour visuel immédiat (*Live Preview*).

---

### ÉCRAN 11 : PLAQUE CONSTRUCTEUR & MENTIONS LÉGALES

```
┌────────────────────────────────────────────────────────┐
│ [Icon: ArrowLeft] RETOUR              SPÉCIFICATIONS   │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⚙️ METER MASTER PRO — CONSTRUCTEUR                 │ │
│ │ Système de Télémétrie Déconnectée v1.0.0           │ │
│ │                                                    │ │
│ │ Ingénieur Concepteur : Ir Adonis Rwabira           │ │
│ │ Architecture         : Moteur Arithmétique Fixe    │ │
│ │ Runtime              : Zero-Cloud / IndexedDB Pure │ │
│ │                                                    │ │
│ │ [Icon: PhoneCall] +243 999794391                   │ │
│ │ [Icon: Mail] adonisbitigaywa@gmail.com             │ │
│ │                                                    │ │
│ │ © 2026 Ir Adonis Rwabira. Tous droits réservés.    │ │
│ └────────────────────────────────────────────────────┘ │
│ [Icon: ShieldCheck] SYSTÈME 100% SOUVERAIN & AUTONOME  │
└────────────────────────────────────────────────────────┘
```
* **Objectif :** `F-ABOUT-001`. Plaque constructeur rivetée, mentions d'ingénierie et déclencheurs d'appels natifs directs sans passer par le web.

---

# PARTIE 3 : PROMPT COMPLET & STRUCTURÉ POUR GOOGLE STITCH

Copiez et collez l'invite ci-dessous directement dans l'interface de **Google Stitch** :

```text
Design a complete, sleek, high-precision Progressive Web App (PWA) interface named "Meter Master Pro", conceived by "Ir Adonis Rwabira".

DESIGN PHILOSOPHY:
"Modern Industrial Telemetry 2.0" — Merging the tactical realism of high-end DIN-rail electrical cabinets with ultra-clean modern software ergonomics (Linear, Braun/Dieter Rams, Teenage Engineering). 
ABSOLUTE CONSTRAINTS:
1. NO EMOJIS UNDER ANY CIRCUMSTANCES. Use ONLY Lucide vector icon tokens (<Zap />, <ShieldCheck />, <AlertTriangle />, <CheckCircle2 />, <SlidersHorizontal />, <Info />, <Clock />, <RotateCcw />, etc.).
2. ZERO COGNITIVE OVERLOAD: Minimal text, no long explanations, ultra-concise labels (e.g., "INDEX", "CONSO (Δ)", "SOLDE", "AUTONOMIE").
3. TACTILE SKEUOMORPHIC PRECISION: Recessed LCD screens, micro-beveled borders (1px), subtle physical LED indicators, and physical push feedback.

DESIGN SYSTEM & TOKENS:
- Typography:
  * Interface UI: 'Plus Jakarta Sans', sans-serif (weights: 400, 500, 600).
  * Numeric Readouts & Counters: 'JetBrains Mono', monospace with tabular figures ('font-variant-numeric: tabular-nums'). Fixed to 3 decimal places (e.g. 014520.750).
- Dark Industrial Theme (Default):
  * Background Chassis: #0D1015
  * Modular Device Surface: #161A22
  * 1px Machined Borders / DIN Rail: #262D3D
  * Inset LCD Screen: #080A0E with digits in #00F5FF
  * Status Healthy LED: #10B981
  * Status Warning LED: #F59E0B
  * Status Danger/Cutoff LED: #EF4444
- Clean Lab Theme (Light Mode):
  * Background Chassis: #F1F4F9
  * Modular Device Surface: #FFFFFF
  * 1px Machined Borders: #CBD5E1
  * Inset LCD Screen: #E2E8F0 with digits in #0F172A
  * Status Healthy: #059669 | Warning: #D97706 | Danger: #DC2626

SCREENS TO GENERATE (FULL WORKFLOW):

1. SCREEN 0: SPLASH SCREEN & LOCAL SELF-CHECK
   - Centered minimal box on #0D1015.
   - Enclosed icon <Zap className="w-8 h-8 text-cyan-400" />.
   - Title: "METER MASTER PRO", Subtitle: "SYSTÈME AUTONOME".
   - 2 compact badge pills: <Database className="w-3 h-3 text-emerald-400" /> "IndexedDB Locale" and <WifiOff className="w-3 h-3 text-cyan-400" /> "100% Déconnecté".
   - 2px micro progress bar.

2. SCREEN 1: MASTER METER SETUP (F-MTR-001)
   - Centered modular control box (max-w-md).
   - Label: "Compteur Général d'Alimentation".
   - Fluid toggle: Segmented control for <Zap /> "Électricité (kWh)" vs <Droplet /> "Eau (m³)".
   - Hero LCD input counter for initial reading: 8 integer slots + 3 decimal slots in glowing JetBrains Mono.
   - Button: "Initialiser l'Armoire" with <ArrowRight />.

3. SCREEN 2: MAIN DIN-RAIL DASHBOARD (CABINET VIEW)
   - Top Bar: Brand "METER MASTER PRO", status badge <ShieldCheck className="text-emerald-400" /> "100% LOCAL", buttons <SlidersHorizontal /> and <Info />.
   - Master Meter Header Card:
     * Dark brushed texture, index "014,520.500 kWh", Daily Rate "42.5 kWh/j", Reconciliation pill "Pertes: +1.2% (Normal)" with <CheckCircle2 className="text-emerald-400" />.
   - DIN Rail Section Header: "SOUS-COMPTEURS (3)" with quick action <Plus /> "Nouveau".
   - 3 DIN-Rail Sub-meter Modular Cards:
     * Card #01: Label "Appt 101 - Dubois", LED steady Green, LCD "004,210.000 kWh", Net Balance "+42.500 kWh (6j)", quick buttons <Hash /> "Relever" and <PlusCircle /> "Créditer".
     * Card #02: Label "Studio B - Marc", LED pulsing Amber, LCD "001,890.350 kWh", Net Balance "+5.100 kWh (18h)", quick buttons <Hash /> and <PlusCircle />.
     * Card #03: Label "Atelier Nord", LED blinking Red, LCD "008,120.900 kWh", Net Balance "-12.400 kWh (DÉFICIT)", quick buttons <Hash /> and <PlusCircle />.
   - Sticky Bottom Floating Bar:
     * Button "Tournée de Relève" with <ClipboardList />.
     * Button "Bilan d'Écart" with <Scale />.

4. SCREEN 3: TENANT FOCUS & TELEMETRY DETAIL (F-MTR-002, F-NOTIF-001)
   - Header with back button <ArrowLeft />, Module ID "#02 Studio B".
   - Large heroic inset LCD reading: "001,890.350 kWh".
   - Split Telemetry Metrics:
     * Left: "Solde Net" -> "+5.100 kWh" with a 26% horizontal micro-gauge.
     * Right: "Coupure Estimée" -> "Demain à 08:30 (~18h)" with <Clock className="text-amber-400" />.
   - Primary actions: Full-width button "Recharger / Créditer" (<PlusCircle />) and button "Nouveau Relevé" (<Hash />).
   - Minimal recent log: 2 lines with timestamp, delta, and resulting balance.

5. SCREEN 4: MANUAL READING NUMPAD & UNDO SNACKBAR (F-READ-001, F-READ-003)
   - Bottom sheet layout.
   - Ghosted previous index: "001,887.150 kWh".
   - Active input display with cyan glow for entered digits.
   - Real-time computation tag: "Δ Consommation: +3.200 kWh | Solde Résultant: +1.900 kWh".
   - Integrated custom 3x4 tactile keypad with bevels (keys 0-9, dot, <Delete />).
   - Primary action: "Enregistrer l'Index" (<Check />).
   - Fixed floating Undo Snackbar: "Relevé validé (+3.200 kWh) [ANNULER 8s]" with circular SVG countdown and <RotateCcw />.

6. SCREEN 5: GROUPED BATCH AUDIT (F-READ-002)
   - Dense telemetry spreadsheet layout.
   - Master Meter Row + Sub-meter rows (Inputs pre-filled or ready for sequential typing).
   - Dynamic real-time calculation footer: "Total Général: +20.50 kWh | Somme Modules: +15.35 kWh | Écart: +5.15 kWh".
   - Button: "Enregistrer le Lot Atomique" (<CheckCheck />).

7. SCREEN 6: RECHARGE BAY & TOKEN TERMINAL (F-TOP-001, F-TOP-002)
   - Top-up window showing current balance deficit "-12.400 kWh".
   - Direct unit entry: "+50.000 kWh".
   - Debt compensation preview: "-12.400 kWh apurés -> Nouveau solde: +37.600 kWh" (dynamically shifts to healthy green badge).
   - Optional formatted 20-digit token field: "XXXX-XXXX-XXXX-XXXX-XXXX".
   - Checkbox: "Incrémenter aussi le Compteur Général".
   - Action: "Valider la Recharge" (<Check />).

8. SCREEN 7: RECONCILIATION & LOSS DIAGNOSTIC (F-RECON-001)
   - Clean balance comparison: Injected energy (1,245.500 kWh) vs Distributed energy (1,180.200 kWh).
   - Big Diagnostic Card: "+65.300 kWh (+5.2%)" with status pill <CheckCircle2 className="text-emerald-400" /> "Pertes Techniques Normales (< 15%)".
   - Button: "Exporter Rapport CSV" (<FileSpreadsheet />).

9. SCREEN 8: HISTORICAL AUDIT & RECALCULATION (F-READ-004)
   - Chronological ledger list of readings and top-ups with timestamps.
   - Quick action buttons per row: <Edit2 /> "Modifier" and <Trash2 /> "Supprimer".
   - Warning banner: <AlertTriangle className="text-amber-400" /> "Modifier un relevé passé recalcule automatiquement toute la chaîne des soldes".

10. SCREEN 9: LOCAL DATA VAULT (F-DATA-001, F-DATA-002, F-DATA-003)
    - Status: "Base 100% Locale (IndexedDB)".
    - Actions: Button <Download /> "Exporter Archive JSON (SHA-256)" and Button <FileSpreadsheet /> "Télécharger CSV".
    - Dropzone area for JSON import restoration.
    - Danger zone with red border: Button <AlertOctagon /> "Réinitialisation Complète" with challenge text modal requiring "RESET".

11. SCREEN 10: SETTINGS & LIVE PREVIEW (F-SET-001, F-SET-002)
    - Theme selector: "Dark Industrial" (active), "Clean Lab", "Cyber Neon".
    - Font selector: "JetBrains Mono" vs "7-Segments" vs "Modern Sans".
    - Sensory toggles: Audio click switch (800Hz) & Haptic vibration switch.
    - Interactive Live Preview Card: A miniature DIN-rail module that updates in real time according to selected fonts and themes.

12. SCREEN 11: ENGINEERING NAMEPLATE / ABOUT (F-ABOUT-001)
    - Visual design: Riveted brushed aluminum industrial nameplate with 4 corner metal screws.
    - Engraved monospaced technical specifications:
      * "METER MASTER PRO — PWA v1.0.0"
      * "Ingénieur Concepteur : Ir Adonis Rwabira"
      * "Système : Télémétrie Déconnectée (Zero-Cloud Runtime)"
      * "Moteur : Arithmétique Décimale à Virgule Fixe Déterministe"
    - Direct actionable native buttons:
      * Button <PhoneCall /> "Appeler : +243 999794391"
      * Button <Mail /> "Email : adonisbitigaywa@gmail.com"
    - Legal copyright: "© 2026 Ir Adonis Rwabira. Tous droits réservés."

Ensure every screen maintains rigorous alignment on an 8pt grid, WCAG AA compliance, ultra-crisp tactile borders, zero decorative clutter, and instant glanceability.
```