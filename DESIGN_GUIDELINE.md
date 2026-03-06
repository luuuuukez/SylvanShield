# Design Guideline

Design tokens extracted from Figma (01-Home). Use these Tailwind class names instead of hardcoded values.

---

## Colors

| Token (Tailwind) | Hex / Original | Usage |
|------------------|----------------|-------|
| `bg-background-primary` | `#FFFFFF` | Page background |
| `bg-background-card` | `#F5F5F5` (Figma: Background-card) | Card surfaces |
| `text-labels-primary` | `#000000` / black | Primary text, labels |
| `text-primary` | `#27272A` (zinc-800) | Body text |
| `text-caption` | `#9CA3AF` (gray-400) | Captions, secondary |
| `text-tab-unselected` | `#999999` | Tab label inactive |
| `text-tab-selected` | `#000000` (Grays-Black) | Tab label active |
| `border-bar` | `rgba(0,0,0,0.1)` | Tab bar top border (Miscellaneous-Bar-border) |
| `stroke-icon-primary` | `#333333` | Icons (location, etc.) |
| `icon-weather-sun` | `#EDA36E` | Sun / weather icon |
| `icon-weather-cloud` | `#8AA2D7` | Cloud / wind icon |
| `bg-status-button` | `#27272A` (zinc-800) | Primary CTA (e.g. Aloita) |
| `bg-tab-selected` | `#333333` | Tab icon selected fill |

**State-based card & button (session UI):**

| Token | Value | Usage |
|-------|--------|--------|
| `bg-tint-active` | emerald-50 | Card background when session active (working) |
| `bg-tint-grace` | red-50 | Card background in grace period |
| `bg-tint-critical` | rose-50 | Card background when alert sent (warning) |
| `text-state-active` | emerald-500 | Title when working |
| `text-state-grace` | orange-400 | Title when grace (Työaika ylitetty) |
| `text-state-critical` | red-500 | Title when alert (Vastausta ei havaittu) |
| `bg-state-active` | emerald-500 | "Kuittaa Ulos" button (working) |
| `bg-state-grace` | orange-400 | "Kuittaa Ulos" button (grace) |
| `bg-state-critical` | red-500 | "Kuittaa Ulos" button (alert) |
| `border-state-active` | green-100 | Button border (working) |
| `border-state-grace` | orange-100 | Button border (grace) |
| `border-state-critical` | red-100 | Button border (alert) |
| `shadow-state-active` | 0px 2px 4px rgba(42,165,42,0.30) | Button shadow (working) |
| `shadow-state-grace` | 0px 2px 4px rgba(165,114,42,0.30) | Button shadow (grace) |
| `shadow-state-critical` | 0px 2px 4px rgba(165,42,42,0.30) | Button shadow (alert) |

**Overlay**

| Token (Tailwind) | Value | Usage |
|------------------|--------|--------|
| `bg-overlay` | black @ 40% opacity | Modal/dialog backdrop (e.g. shift-end modal) |

**Dashboard (Hallintapaneeli):**

| Token | Value | Usage |
|-------|--------|--------|
| `bg-tint-alert-banner` | #FFF7ED (orange-50) | Alert banner background |
| `text-chart-axis` | #71717A (zinc-500) / Grey | Chart Y/X axis labels |
| `stroke-chart-line` | #767676 | Chart line and data points |
| `stroke-chart-grid` | #E5E5E5 (gray-200) | Chart dashed grid lines |
| `bg-chart-tooltip` | #000000 | Chart tooltip bubble background |
| `text-chart-tooltip-text` | #FFFFFF | Chart tooltip text |
| `rounded-xl` | 16px | Alert banner, stat cards (2xl in Figma = 16px) |

**Chart grid:** Use `stroke-chart-grid` for horizontal grid lines. For dashed grid in victory-native, pass `yAxis: [{ linePathEffect: <Skia DashPathEffect /> }]` when using `@shopify/react-native-skia`.

**History (Historia):**

| Token | Value | Usage |
|-------|--------|--------|
| `bg-history-card` | #FAFAF9 (stone-50) | History list item card background |
| `text-status-safe` | #10B981 (state-active) | Status “Kuitannut ulos turvallisesti” |
| `text-status-warning` | #EF4444 (state-critical) | Status “Hälytys lähetetty” |
| `stroke-chevron-muted` | #B0B3BA (Grey) | Card chevron, secondary actions |

**Profile (Profiili):**

| Token | Value | Usage |
|-------|--------|--------|
| `text-profile-subtitle` | #71717A (Grays-Gray / zinc-500) | Role/ID line under name |
| `border-separator` | #E5E5E5 (Separators-Vibrant) | List item dividers in menu card |

**Modal (Työjakso päättyi):**

| Token | Value | Usage |
|-------|--------|--------|
| `rounded-modal` | 34px | Modal card corners |
| `text-alert` | #FA8B46 (Alert) | Modal title, alert icon |
| `bg-overlay` | black @ 40% | Full-screen overlay behind modal |

**Near-miss:** `#333333` used for strokes and tab fill → standardized as `stroke-icon-primary` / `bg-tab-selected`.

---

## Spacing & Dimensions

| Token | Value | Usage |
|-------|--------|--------|
| `p-screen` / `px-6` | 24px | Horizontal screen padding |
| `py-5` | 20px | Top bar vertical padding |
| `gap-2` | 8px | Small gap between elements |
| `gap-4` | 16px | History list gap between cards |
| `gap-1` | 4px | Icon + label gap |
| `rounded-card` | 20px | Card corner radius (Figma 20px → token) |
| `rounded-button` | 100px (full) | Pill button |
| `rounded-modal` | 34px | Shift-end modal card |
| `border-t-bar` | 0.33px | Tab bar top border width |

**Near-miss:** 15px vs 16px in spacing → use `4` (16px) where close.

---

## Typography

| Token | Size | Line | Usage |
|-------|------|------|--------|
| `text-caption` | 12px (xs) | 16px | Captions (Kello, Sää, Turvakontakti) |
| `text-base` | 16px | 20px | Body, labels |
| `text-xl` | 20px | 28px | Card title, time |
| `text-4xl` | 36px | 40px | Large time display |
| `text-tab` | 10px | - | Tab bar labels |
| `font-bold` | - | - | Titles |
| `font-normal` | - | - | Body |

---

## Shadows

| Token | Value | Usage |
|-------|--------|--------|
| `shadow-button` | `0px 4px 8px 1px rgba(56,91,61,0.25)` | Primary button (Aloita) |
| `shadow-state-active` | `0px 2px 4px 0px rgba(42,165,42,0.30)` | Working state button |
| `shadow-state-grace` | `0px 2px 4px 0px rgba(165,114,42,0.30)` | Grace period button |
| `shadow-state-critical` | `0px 2px 4px 0px rgba(165,42,42,0.30)` | Alert-sent button |

**Button glow (optional):** Layered semi-transparent rings (e.g. state color at 5% / 5% / 20% opacity) behind the pill; blur can be simulated with shadow or omitted on native.

---

## SVG / Icons

Icons are implemented as React Native SVG components under `src/components/icons/`:

- **Status bar:** `IconCellular`, `IconWifi`, `IconBattery`
- **Content:** `IconLocationPin`, `IconSun`, `IconCloud`, `IconBell`
- **Tab bar:** `IconWork`, `IconLayers`, `IconHistory`, `IconProfile`
- **Modal:** `IconAlert` (40×40, shift-end warning)
- **History:** `IconClock` (16×16, time), `IconSliders` (24×24, filter)

Fill/stroke use design tokens (`stroke-icon-primary`, `icon-weather-sun`, etc.).

### Tab bar icons (dual state)

Tab bar icons accept a `focused: boolean` prop and switch between two SVG variants:

| State   | Stroke / outline | Fill (where applicable) |
|--------|-------------------|---------------------------|
| Default | `#999999` (tab-unselected) | none (outline only) |
| Focused | `#000000` (tab-selected) | `#000000` (black fill) |

- **IconWork:** Briefcase + check; focused: briefcase filled black, checkmark stroke white.
- **IconLayers:** Stack/layers; focused: front layer filled black.
- **IconHistory:** Document + lines; focused: document filled black, content lines white.
- **IconProfile:** Head + shoulder arc; focused: head and arc filled black.

Use with `tabBarActiveTintColor: #000000` and `tabBarInactiveTintColor: #999999` for labels.
