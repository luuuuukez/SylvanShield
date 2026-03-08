# MotoSafe – Claude Code Project Context

A safety check-in app for lone forest workers. Workers start/end shifts and the app monitors overdue check-outs, sending alerts to safety contacts if no response.

---

## Instructions for Claude

- When you add new NativeWind classes or color tokens not already listed in this file, **update the relevant section in this CLAUDE.md automatically**.
- Always check the **Design Tokens** section before adding new styles — never hardcode hex values.
- Always use `npx expo install` not `npm install` for new packages.

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | React Native + Expo | expo ~55.0.4 |
| Language | TypeScript strict | ~5.9.2 |
| Routing | expo-router (file-based) | ~5.0.0 |
| Styling | NativeWind + Tailwind | nativewind ^4.2.2 |
| Server state | TanStack Query | ^5.90.21 |
| Local state | Zustand | ^5.0.11 |
| Maps | react-native-maps | 1.26.20 |
| Charts | victory-native | ^41.20.2 |
| Animation | react-native-reanimated | 4.2.1 |
| Icons | react-native-svg (custom components) | 15.15.3 |

---

## Project Structure

```
app/
├── _layout.tsx              # Root layout
├── (tabs)/
│   ├── _layout.tsx          # Tab bar config
│   ├── index.tsx            # Home / shift check-in screen
│   ├── dashboard.tsx        # Admin dashboard (Hallintapaneeli)
│   ├── history.tsx          # Shift history (Historia)
│   └── profile.tsx          # Profile + settings (Profiili)
└── live-map.tsx             # Full-screen live map (stack, not tab)

src/components/icons/        # SVG icon components
  IconWork, IconLayers, IconHistory, IconProfile  ← tab bar
  IconLocationPin, IconSun, IconCloud, IconBell   ← content
  IconAlert, IconClock, IconSliders               ← modal/history
```

---

## Routing Rules

- **Tabs:** `app/(tabs)/` — bottom tab navigation
- **Live map:** `app/live-map.tsx` — opened as stack from dashboard, full-screen
- Navigate to live map: `router.push('/live-map')`
- Always use `expo-router` (`useRouter`, `Link`) — never `react-navigation` directly

---

## Design Tokens

All tokens are defined in `tailwind.config.js`. Never hardcode hex values — always use the token class name.

### Colors — Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-background-primary` | #FFFFFF | Page background |
| `bg-background-card` | #F5F5F5 | Card surfaces |
| `bg-status-button` | #27272A | Primary CTA (e.g. Aloita) |
| `bg-overlay` | rgba(0,0,0,0.4) | Modal/dialog backdrop |
| `bg-tint-alert-banner` | #FFF7ED | Dashboard alert banner |
| `bg-history-card` | #FAFAF9 | History list item background |

### Colors — Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text-labels-primary` | #000000 | Primary text, labels |
| `text-primary` | #27272A | Body text |
| `text-caption` | #9CA3AF | Captions, secondary text |
| `text-tab-unselected` | #999999 | Tab label inactive |
| `text-tab-selected` | #000000 | Tab label active |
| `text-alert` | #FA8B46 | Modal title, alert icon, late/grace status |
| `text-status-safe` | #10B981 | "Kuitannut ulos turvallisesti" |
| `text-status-warning` | #EF4444 | "Hälytys lähetetty" |
| `text-profile-subtitle` | #71717A | Role/ID line under name in profile |
| `text-chart-axis` | #71717A | Chart Y/X axis labels |

### Colors — Session States (Home screen card + button)

| State | Card bg | Title text | Button bg | Button border |
|-------|---------|------------|-----------|---------------|
| Working | `bg-tint-active` | `text-state-active` | `bg-state-active` | `border-state-active` |
| Grace period | `bg-tint-grace` | `text-state-grace` | `bg-state-grace` | `border-state-grace` |
| Alert sent | `bg-tint-critical` | `text-state-critical` | `bg-state-critical` | `border-state-critical` |

| Token | Hex |
|-------|-----|
| `bg-tint-active` | #ECFDF5 (emerald-50) |
| `bg-tint-grace` | #FEF2F2 (red-50) |
| `bg-tint-critical` | #FFF1F2 (rose-50) |
| `text-state-active` | #10B981 (emerald-500) |
| `text-state-grace` | #FB923C (orange-400) |
| `text-state-critical` | #EF4444 (red-500) |
| `bg-state-active` | #10B981 |
| `bg-state-grace` | #FB923C |
| `bg-state-critical` | #EF4444 |
| `border-state-active` | #DCFCE7 (green-100) |
| `border-state-grace` | #FFEDD5 (orange-100) |
| `border-state-critical` | #FFE4E6 (red-100) |

### Colors — Icons, Strokes & Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `icon-primary` | #333333 | Location, general icons |
| `weather-sun` | #EDA36E | Sun/weather icon |
| `weather-cloud` | #8AA2D7 | Cloud/wind icon |
| `chart-line` | #767676 | Chart line and data points |
| `chart-grid` | #E5E5E5 | Chart dashed grid lines |
| `chevron-muted` | #B0B3BA | Card chevrons |
| `separator` | #E5E5E5 | List item dividers in profile menu |
| `brand-primary` | #FFAE23 | Primary brand accent color (e.g. toggle active state) |

### Colors — Map Pin Status

| Status | Hex | Token equivalent |
|--------|-----|-----------------|
| normal | #10B981 | `state-active` |
| warning | #FB923C | `state-grace` |
| alert | #EF4444 | `state-critical` |

### Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `px-6` | 24px | Horizontal screen padding |
| `py-5` | 20px | Top bar vertical padding |
| `gap-4` | 16px | History list gap between cards |
| `gap-2` | 8px | Small gap between elements |
| `gap-1` | 4px | Icon + label gap |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-card` | 20px | Cards |
| `rounded-button` | 100px | Pill buttons |
| `rounded-modal` | 34px | Shift-end modal |
| `rounded-xl` | 16px | Stat cards, alert banner |

### Typography

| Class | Size | Usage |
|-------|------|-------|
| `text-caption` (xs) | 12px | Captions (Kello, Sää, Turvakontakti) |
| `text-base` | 16px | Body, labels |
| `text-xl` | 20px | Card titles |
| `text-4xl` | 36px | Large time display |
| `text-tab` | 10px | Tab bar labels |
| `font-bold` | — | Titles |
| `font-normal` | — | Body |

### Shadows

NativeWind shadow utilities don't cover Android — always use inline `style`:

```tsx
// Standard card shadow
style={{
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
  elevation: 3,
}}

// Button shadow by session state:
// active:   shadowColor rgba(42,165,42,0.30),  offset 0/2, radius 4
// grace:    shadowColor rgba(165,114,42,0.30), offset 0/2, radius 4
// critical: shadowColor rgba(165,42,42,0.30),  offset 0/2, radius 4
```

---

## Component Patterns

### SafeAreaView — always use context version
```tsx
// ✅ Correct
import { SafeAreaView } from 'react-native-safe-area-context'
// ❌ Never
import { SafeAreaView } from 'react-native'
```

### Tab bar icons — dual state
```tsx
// Icons accept focused: boolean
<IconWork focused={focused} />
// focused=true  → black fill #000000
// focused=false → outline only #999999
// tabBarActiveTintColor: "#000000", tabBarInactiveTintColor: "#999999"
```

### Live map — WorkerOnMap type
```tsx
type WorkerMapStatus = "normal" | "warning" | "alert"
type WorkerOnMap = {
  id: string
  name: string
  workerId: string
  status: WorkerMapStatus
  latitude: number
  longitude: number
}
```

---

## Screen States (Home / index.tsx)

| State | Card bg | Description |
|-------|---------|-------------|
| No session | default | "Ei työjaksoa käynnissä" + Aloita button |
| Active | `bg-tint-active` | Countdown timer, green Kuittaa Ulos button |
| Grace period | `bg-tint-grace` | "Työaika ylitetty", orange button, 15min warning |
| Alert sent | `bg-tint-critical` | "Vastausta ei havaittu", red button, long-press to cancel |

---

## Known Issues / Gotchas

- `backdrop-blur` not supported in RN → use `bg-white/80` for frosted effect
- `font-['SF_Pro']` not valid in RN → remove, system font used automatically
- `gap-*` in NativeWind v4 works on flex containers; verify on Android if layout breaks
- Android shadows require `elevation` in addition to iOS `shadow-*` properties
- `npx expo start --clear` needed after installing new packages to clear Metro cache
- `SafeAreaView` from `react-native` is deprecated — always import from `react-native-safe-area-context`