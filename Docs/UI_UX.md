# UI_UX.md — Phygital-Trace Design System & Screen Specs

---

## Design Philosophy

**"Forensic Amber"** — The visual language of investigative truth.

This app is used in high-stakes moments — protests, accidents, breaking news. The design must feel:
- **Trustworthy** — not playful, not startup-y
- **Fast** — zero friction on capture
- **Serious** — like a legal instrument, not a social app

**One rule:** Every screen should feel like it belongs in a courtroom evidence system.

---

## Color System

```
--ink:           #080808   ← Background (near-black, not pure)
--surface:       #111111   ← Cards, panels
--surface-raised:#181818   ← Modals, elevated elements
--border:        #1e1e1e   ← Default borders
--border-light:  #2a2a2a   ← Subtle dividers

--amber:         #FF6B00   ← PRIMARY accent (CTAs, active states)
--amber-dim:     #CC5500   ← Hover states
--amber-glow:    #FF8C33   ← Text highlights, icons

--verified:      #00E676   ← VERIFIED badge
--suspicious:    #FFAA00   ← SUSPICIOUS badge
--revoked:       #FF3D3D   ← REVOKED / ERROR badge
--pending:       #4FC3F7   ← PENDING / loading

--text-primary:  #E8E8E8   ← Main text
--text-secondary:#888888   ← Labels, metadata
--text-muted:    #444444   ← Disabled, placeholders
```

---

## Typography

```
Display Font:  "Bebas Neue"      — Headings, hero text, numbers
               Weight: 400 (only weight available)
               Use for: Hero titles, certificate IDs, big numbers

Mono Font:     "JetBrains Mono"  — Hashes, addresses, sensor data
               Weights: 400, 500
               Use for: TX hashes, IPFS CIDs, coordinates, timestamps

Body Font:     "DM Sans"         — UI text, descriptions
               Weights: 400, 500, 600
               Use for: Paragraphs, labels, buttons

Load via Google Fonts:
  Bebas Neue: 400
  JetBrains Mono: 400, 500
  DM Sans: 400, 500, 600
```

### Type Scale
```
Display XL:  Bebas Neue  72px / line-height 1.0   ← Hero only
Display LG:  Bebas Neue  48px / line-height 1.0   ← Section headers
Display MD:  Bebas Neue  32px / line-height 1.1   ← Card titles
Body LG:     DM Sans     18px / line-height 1.6   ← Descriptions
Body MD:     DM Sans     15px / line-height 1.6   ← Default UI text
Body SM:     DM Sans     13px / line-height 1.5   ← Labels, captions
Mono LG:     JetBrains   14px / line-height 1.5   ← Hashes
Mono SM:     JetBrains   12px / line-height 1.4   ← Compact data
```

---

## Spacing System (8px base)
```
4px   — xs   (icon gaps, tight padding)
8px   — sm   (input padding, icon spacing)
12px  — md
16px  — lg   (default padding)
24px  — xl   (section spacing)
32px  — 2xl
48px  — 3xl  (major section gaps)
64px  — 4xl  (hero padding)
```

---

## Component Library

### 1. Status Badge
```
VERIFIED    → bg:#00E676/10  text:#00E676  border:#00E676/30
PENDING     → bg:#4FC3F7/10  text:#4FC3F7  border:#4FC3F7/30
SUSPICIOUS  → bg:#FFAA00/10  text:#FFAA00  border:#FFAA00/30
REVOKED     → bg:#FF3D3D/10  text:#FF3D3D  border:#FF3D3D/30

Style:
  font: DM Sans 600, 11px, uppercase, letter-spacing: 1.5px
  padding: 4px 10px
  border-radius: 2px (sharp, not rounded)
  border: 1px solid (color/30)
  leading dot: 6px circle, same color, pulsing animation for PENDING
```

### 2. Primary Button
```
Background:  #FF6B00
Text:        #080808 (black on orange)
Font:        DM Sans 600, 14px, uppercase, letter-spacing: 1px
Padding:     14px 28px
Border:      none
Border-radius: 0px (fully sharp — intentional)
Hover:       bg #CC5500, slight translate-y(-1px)
Active:      bg #FF6B00, translate-y(0)
Loading:     spinning amber border ring

NO border-radius on primary buttons — sharp corners = trustworthy tool
```

### 3. Ghost Button
```
Background:  transparent
Text:        #E8E8E8
Border:      1px solid #2a2a2a
Hover:       border-color #FF6B00, text #FF6B00
Font:        DM Sans 500, 14px
```

### 4. Hash Display
```
Purpose: Show TX hashes, IPFS CIDs, payload hashes
Font:    JetBrains Mono 400, 12px
Color:   #FF8C33
Background: #111111
Padding: 10px 14px
Border:  1px solid #1e1e1e (left border: 2px solid #FF6B00)
Overflow: ellipsis with copy-to-clipboard icon on hover
Example:
  ┌─────────────────────────────────────────────┐
  │ 0x3f9a...d42c                          📋  │
  └─────────────────────────────────────────────┘
```

### 5. Sensor Row
```
Purpose: Display fingerprint data (GPS, accel, light, etc.)
Layout:  label left | value right
Font label:  DM Sans 400, 12px, #888888, uppercase
Font value:  JetBrains Mono 500, 13px, #E8E8E8
Separator:  dotted line between label and value
Border-bottom: 1px solid #1e1e1e

Example:
  GPS ACCURACY    ·····················  3.5m
  ACCELEROMETER   ·····················  9.79 m/s²
  LIGHT LEVEL     ·····················  1,250 lux
  PRESSURE        ·····················  1013.2 hPa
  TIMESTAMP       ·····················  14:23:45.123 UTC
```

### 6. Certificate Card
```
Background:  #111111
Border:      1px solid #1e1e1e
Border-top:  3px solid #FF6B00
Padding:     24px
Shadow:      0 0 40px rgba(255,107,0,0.05)

Header:      [STATUS BADGE]              [CERT ID]
             Photo thumbnail (left)      Sensor data (right)
Footer:      [Chain info]                [Share button]
```

### 7. Input Field
```
Background:  #111111
Border:      1px solid #2a2a2a
Border-radius: 0px
Font:        DM Sans 400, 14px, #E8E8E8
Padding:     12px 14px
Placeholder: #444444
Focus:       border-color #FF6B00, box-shadow: 0 0 0 2px rgba(255,107,0,0.1)
```

### 8. Loading State (Attestation Progress)
```
4-step progress indicator:
  [●]──[●]──[○]──[○]
   ↑    ↑    ↑    ↑
  Snap Hash IPFS Chain

Active step: amber filled circle + pulse ring
Done step:   amber filled circle, no pulse
Pending:     empty circle, #2a2a2a

Below each step: DM Sans 11px label
```

---

## Screen Designs

---

### SCREEN 1: Landing Page `/`

**Layout:** Full-screen, centered vertically

```
┌─────────────────────────────────────────────────────┐
│  PHYGITAL·TRACE                          [VERIFY ↗]  │  ← Nav: Bebas Neue 20px
├─────────────────────────────────────────────────────┤
│                                                     │
│   ░░░░░░ GRID BACKGROUND (amber, 3% opacity) ░░░░░  │
│                                                     │
│              ┌─────────────────┐                   │
│              │  PROOF OF       │  ← Bebas Neue 72px │
│              │  REALITY        │     #E8E8E8        │
│              │  ───────────    │                   │
│              │  Camera-to-     │  ← DM Sans 18px   │
│              │  Blockchain     │     #888888        │
│              │  verification   │                   │
│              │  for citizen    │                   │
│              │  journalism     │                   │
│              │                 │                   │
│              │  [CAPTURE NOW]  │  ← Primary button │
│              │  [VERIFY A CERT]│  ← Ghost button   │
│              └─────────────────┘                   │
│                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│   │ GPS+     │  │ Secure   │  │  Base L2 │        │  ← Stats strip
│   │ Sensors  │  │ Enclave  │  │  On-chain│        │
│   └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
│   ── HOW IT WORKS ─────────────────────────────    │
│   [01 CAPTURE] → [02 FINGERPRINT] → [03 ATTEST]   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Animations:**
- Hero text fades up staggered (0ms, 100ms, 200ms)
- Grid background slowly scrolls diagonally at 20s
- "PROOF OF REALITY" has a one-time glitch effect on load (300ms)
- Scan line sweeps down the page once on first load

---

### SCREEN 2: Capture Page `/capture`

**Layout:** 2-column on desktop, stacked on mobile

```
┌─────────────────────────────────────────────────────┐
│  ← BACK          CAPTURE                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────┐    │
│  │                      │  │ SENSOR FEED      │    │
│  │                      │  │ ─────────────    │    │
│  │   CAMERA PREVIEW     │  │ GPS    22.57°N   │    │
│  │   (live webcam)      │  │        88.36°E   │    │
│  │                      │  │ ACC    9.79 m/s² │    │
│  │  ┌─────────────────┐ │  │ LIGHT  1250 lux  │    │
│  │  │ ⬤ CAPTURING...  │ │  │ PRES   1013.2hPa │    │
│  │  └─────────────────┘ │  │ NET    WiFi -65  │    │
│  │                      │  │ BATT   82%       │    │
│  │  [● CAPTURE & SIGN]  │  │                  │    │
│  │                      │  │ STATUS           │    │
│  └──────────────────────┘  │ ● SENSORS LIVE   │    │
│                             │ ● GPS LOCKED     │    │
│                             │ ○ SIGNING READY  │    │
│                             └──────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Post-capture state (same screen, content changes):**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ✓ CAPTURED                                       │
│                                                     │
│   ──── ANCHORING TO BLOCKCHAIN ────                │
│                                                     │
│   [●]──[●]──[●]──[○]                              │
│   Snap  Hash  IPFS  Chain                          │
│                                                     │
│   IMAGE HASH                                       │
│   ┌───────────────────────────────────────────┐   │
│   │ a3f9c2...7d41                         📋  │   │
│   └───────────────────────────────────────────┘   │
│                                                     │
│   FINGERPRINT HASH                                 │
│   ┌───────────────────────────────────────────┐   │
│   │ 9b2e44...f103                         📋  │   │
│   └───────────────────────────────────────────┘   │
│                                                     │
│   Waiting for Base L2 confirmation...              │
│   ████████████░░░░  67%                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Confirmed state:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │  ✓ VERIFIED                      CERT #0042 │  │
│   │  ─────────────────────────────────────────  │  │
│   │  [photo thumbnail]                          │  │
│   │                                             │  │
│   │  Captured:  28 Mar 2026  14:23:45 UTC       │  │
│   │  Location:  22.5726°N, 88.3639°E            │  │
│   │  Chain:     Base L2  Block #12345678        │  │
│   │  TX:        0x3f9a...d42c              📋  │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
│   [📤 SHARE LINK]    [QR CODE]    [VIEW ON CHAIN]  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### SCREEN 3: Verification Page `/verify/[id]`

**Public page — no login needed**

```
┌─────────────────────────────────────────────────────┐
│  PHYGITAL·TRACE  /  VERIFY                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │   ✓ VERIFIED                               │   │  ← BIG status
│  │   ─────────────────────────────────────    │   │     Bebas 48px
│  │   This media was captured on a real         │   │
│  │   device at the recorded time and location. │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────────┐ │
│  │                 │  │  CAPTURE DETAILS          │ │
│  │  [PHOTO / VIDEO]│  │  ────────────────────     │ │
│  │   thumbnail     │  │  Date   28 Mar 2026       │ │
│  │                 │  │  Time   14:23:45.123 UTC  │ │
│  │                 │  │  Device iPhone 15 Pro     │ │
│  └─────────────────┘  └──────────────────────────┘ │
│                                                     │
│  PHYSICAL FINGERPRINT                              │
│  ─────────────────────────────────────────────     │
│  GPS COORDINATES   ·········  22.5726°N 88.3639°E │
│  GPS ACCURACY      ·········  ± 3.5 meters        │
│  ACCELEROMETER     ·········  9.79 m/s²            │
│  AMBIENT LIGHT     ·········  1,250 lux            │
│  ATMO PRESSURE     ·········  1013.2 hPa           │
│  WIFI SIGNAL       ·········  -65 dBm              │
│                                                     │
│  CRYPTOGRAPHIC PROOF                              │
│  ─────────────────────────────────────────────     │
│  IMAGE HASH        ┌────────────────────────────┐ │
│                    │ a3f9c2bd...7d41         📋  │ │
│                    └────────────────────────────┘ │
│  FINGERPRINT HASH  ┌────────────────────────────┐ │
│                    │ 9b2e44fa...f103         📋  │ │
│                    └────────────────────────────┘ │
│  PAYLOAD HASH      ┌────────────────────────────┐ │
│                    │ 7c4a91e2...2b88         📋  │ │
│                    └────────────────────────────┘ │
│                                                     │
│  BLOCKCHAIN ATTESTATION                           │
│  ─────────────────────────────────────────────     │
│  Network    Base L2  (Chain ID: 8453)             │
│  Block      #12,345,678                           │
│  TX Hash    ┌────────────────────────────────┐   │
│             │ 0x3f9abc...d42c            ↗  │   │
│             └────────────────────────────────┘   │
│  Confirmed  28 Mar 2026  14:23:47 UTC             │
│                                                     │
│  ANOMALY ANALYSIS                                 │
│  ─────────────────────────────────────────────     │
│  ● No suspicious sensor patterns detected          │
│  ● GPS coordinates are physically plausible        │
│  ● Accelerometer data shows natural motion         │
│  Risk Score: 0.04 / 1.00                          │
│                                                     │
│  IPFS METADATA                                    │
│  ─────────────────────────────────────────────     │
│  CID  ┌────────────────────────────────────────┐  │
│       │ QmXxxx...abc                       📋  │  │
│       └────────────────────────────────────────┘  │
│  [VIEW RAW METADATA ON IPFS ↗]                    │
│                                                     │
│  ─────────────────────────────────────────────     │
│  Verified independently on Base L2 blockchain.     │
│  This certificate cannot be altered or deleted.    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### SCREEN 4: History Page `/history` (authenticated)

```
┌─────────────────────────────────────────────────────┐
│  MY CERTIFICATES              [+ NEW CAPTURE]      │
├─────────────────────────────────────────────────────┤
│  FILTER: [ALL ▼]  [VERIFIED ▼]  [DATE ▼]          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✓ VERIFIED    #0042          28 Mar 14:23   │   │
│  │ [thumb]  22.5726°N  ·  0x3f9a...d42c   ↗  │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ⟳ PENDING     #0041          28 Mar 13:55   │   │
│  │ [thumb]  22.5801°N  ·  Awaiting chain...    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✓ VERIFIED    #0040          27 Mar 09:12   │   │
│  │ [thumb]  22.5756°N  ·  0x8a2b...c903   ↗  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Rules

```
Breakpoints:
  Mobile:   < 640px   — Single column, full-width camera
  Tablet:   640-1024px — Slightly smaller paddings
  Desktop:  > 1024px  — 2-column layouts

Mobile-specific:
  - Capture button: full width, 64px tall, thumb-friendly
  - Sensor data: collapsible accordion
  - Hash displays: truncated more aggressively (8 chars...4 chars)
  - Navigation: bottom tab bar (Capture | History | Verify)
  - Camera: takes 100vw × 75vw height
```

---

## Micro-Interactions

| Event | Animation |
|-------|-----------|
| Capture button press | Haptic pulse ring expands outward |
| Image hash computed | Number counter ticks up to final hash |
| IPFS upload done | Step dot fills amber with bounce |
| Chain confirmed | Full screen flash (amber, 50ms) then VERIFIED badge drops in |
| Copy hash | "COPIED" text replaces icon for 1.5s |
| Badge hover | Slight glow intensifies |
| Card hover | border-color transitions to amber (200ms) |

---

## Empty & Error States

### No GPS
```
┌─────────────────────────────────────────────┐
│  ⚠ GPS UNAVAILABLE                         │
│  Location data strengthens your proof.      │
│  [ENABLE LOCATION]        [CONTINUE ANYWAY] │
└─────────────────────────────────────────────┘
```

### Certificate Not Found
```
┌─────────────────────────────────────────────┐
│  ✗ NOT FOUND                               │
│  No certificate exists for this ID.         │
│  It may have been entered incorrectly.      │
│  [VERIFY ANOTHER]                           │
└─────────────────────────────────────────────┘
```

### Anomaly Detected
```
┌─────────────────────────────────────────────┐
│  ⚠ SUSPICIOUS                              │
│  Sensor data contains irregular patterns.   │
│  FLAGS: FLAT_ACCELEROMETER                  │
│  This certificate should be treated         │
│  with caution.                              │
└─────────────────────────────────────────────┘
```

---

## Navigation Structure

```
/                    ← Landing (public)
/capture             ← Camera + capture flow (auth)
/verify/[id]         ← Public verification (no auth)
/history             ← My certificates (auth)
/onboarding          ← First launch device registration
```

---

## Assets Required

```
public/
├── favicon.ico          — "PT" monogram in amber on black
├── og-image.png         — 1200×630 Open Graph image
│                          Dark bg, "PROOF OF REALITY" + amber
├── icons/
│   ├── camera.svg       — Custom camera icon (no lens circle)
│   ├── chain.svg        — Chain link icon
│   ├── fingerprint.svg  — Fingerprint scan lines
│   └── verified.svg     — Checkmark with amber glow
└── fonts/               — Self-hosted fallbacks
    ├── BebasNeue-Regular.woff2
    ├── JetBrainsMono-Regular.woff2
    └── DMSans-Variable.woff2
```

---

## Figma Component Hierarchy (for handoff)

```
🎨 Phygital-Trace / Design System
├── 🎨 Colors (all CSS vars)
├── 🎨 Typography (all styles)
├── 📦 Components
│   ├── StatusBadge (4 variants)
│   ├── HashDisplay (with copy)
│   ├── SensorRow
│   ├── CertificateCard (3 states)
│   ├── Button/Primary
│   ├── Button/Ghost
│   ├── InputField
│   ├── ProgressStepper (4 steps)
│   └── AnomalyFlag
├── 📱 Mobile Screens
│   ├── Landing
│   ├── Capture (3 states)
│   ├── Verification
│   └── History
└── 🖥 Desktop Screens
    ├── Landing
    ├── Capture (2-col)
    └── Verification
```
