# SylvanShield – Claude Code Project Context

A safety check-in app for lone forest workers. Workers start/end shifts and the app monitors overdue check-outs, sending alerts to safety contacts if no response.

---

## Instructions for Claude

- When you add new NativeWind classes or color tokens not already listed in this file, **update the relevant section in CLAUDE.md automatically**.
- Always check **Design Tokens** before adding new styles — never hardcode hex values.
- Always use `npx expo install` not `npm install` for new packages.
- Run `npx expo start --clear` after installing new packages.

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | React Native + Expo | ~55.0.4 |
| Language | TypeScript strict | ~5.9.2 |
| Routing | expo-router (file-based) | ~5.0.0 |
| Styling | NativeWind + Tailwind | ^4.2.2 |
| Server state | TanStack Query | ^5.90.21 |
| Local state | Zustand | ^5.0.11 |
| Maps | react-native-maps | 1.26.20 |
| Charts | victory-native | ^41.20.2 |
| Animation | react-native-reanimated | 4.2.1 |
| Icons | react-native-svg (custom) | 15.15.3 |
| Backend | Supabase (auth + db + edge functions) | ^2 |

---

## Project Structure
```
app/
├── _layout.tsx              # Auth state listener, role-based routing
├── auth.tsx                 # Login / register
├── settings.tsx             # Notifications, language, logout
├── (tabs)/
│   ├── _layout.tsx          # Tab layout (dashboard hidden for workers)
│   ├── index.tsx            # Home / shift check-in (core screen)
│   ├── dashboard.tsx        # Supervisor dashboard (role-gated)
│   ├── history.tsx          # Shift history
│   └── profile.tsx          # Profile + settings entry
├── live-map.tsx             # Full-screen live map (stack)
├── history-details.tsx      # Session detail page
├── profile-edit.tsx         # Profile edit
├── safe-contacts.tsx        # Safety contacts list
└── safe-contact-edit.tsx    # Add / edit safety contact

src/
├── components/
│   ├── ScreenHeader.tsx     # Shared secondary screen header
│   └── icons/               # All SVG icon components (barrel: index.ts)
├── lib/
│   └── supabase.ts          # Supabase client
└── store/
    └── useSessionStore.ts   # Zustand session state + Edge Function calls

supabase/
├── functions/
│   └── send-alert/          # Edge Function: Resend email on alert_sent
└── schema.sql               # Full DB schema

design-spec.html             # Visual design reference (open in browser)
```

---

## Routing Rules

- Tabs: `app/(tabs)/` — bottom tab navigation
- Stack screens: `live-map`, `history-details`, `profile-edit`, `safe-contacts`, `safe-contact-edit`
- Navigate: `router.push('/live-map')`, `router.push('/history-details?id=xxx')`
- Always use `expo-router` (`useRouter`, `Link`) — never `react-navigation` directly

---

## Supabase Schema (key tables)

| Table | Key columns |
|-------|-------------|
| `profiles` | id, name, phone, avatar_url, role ('worker'\|'supervisor'), employee_id, team, planned_start, planned_end |
| `safety_contacts` | id, user_id, name, phone, email, avatar_url, is_active |
| `work_sessions` | id, user_id, safety_contact_id, start_time, expected_end_time, actual_end_time, status ('active'\|'grace_period'\|'alert_sent'\|'completed'), last_known_latitude, last_known_longitude |
| `alerts` | id, session_id, triggered_at, reason, status |

Session status flow: `active` → `grace_period` → `alert_sent` → `completed`

---

## Edge Functions

| Function | Trigger | Action |
|----------|---------|--------|
| `send-alert` | Called from app via `supabase.functions.invoke` | Sends emergency email via Resend API to safety contact |

Deployed with `--no-verify-jwt`. Secrets stored in Supabase Dashboard (never in code):
`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Design Tokens

All tokens defined in `tailwind.config.js`. **Never hardcode hex values.**
Full visual reference: `design-spec.html`

### Colors — Brand

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | #FFAE23 | Brand accent, toggle active |

### Colors — Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-background-primary` | #FFFFFF | Page background |
| `bg-background-card` | #F5F5F5 | Card surfaces, history items |
| `bg-status-button` | #27272A | Primary CTA (Aloita) |
| `bg-overlay` | rgba(0,0,0,0.4) | Modal backdrop |
| `bg-tint-active` | #ECFDF5 | Active session card bg |
| `bg-tint-grace` | #FEF2F2 | Grace period card bg |
| `bg-tint-critical` | #FFF1F2 | Alert sent card bg |
| `bg-tint-alert-banner` | #FFF7ED | Dashboard alert banner |

### Colors — Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text-labels-primary` | #000000 | Primary labels |
| `text-primary` | #27272A | Body text |
| `text-secondary` | #9CA3AF | Captions, inactive labels |
| `text-tertiary` | #71717A | Chart axis, profile subtitle |
| `text-state-active` | #10B981 | Active session text |
| `text-state-grace` | #FB923C | Grace period text |
| `text-state-critical` | #EF4444 | Alert state text |
| `text-alert` | #FB923C | Modal title, alert icon (unified with state-grace) |
| `text-status-safe` | #10B981 | "Kuitannut ulos turvallisesti" |
| `text-status-warning` | #EF4444 | "Hälytys lähetetty" |

### Colors — Session States

| State | Card bg | Title | Button bg | Button border |
|-------|---------|-------|-----------|---------------|
| ACTIVE | `bg-tint-active` | `text-state-active` | `bg-state-active` | `border-state-active` |
| GRACE_PERIOD | `bg-tint-grace` | `text-state-grace` | `bg-state-grace` | `border-state-grace` |
| ALERT_SENT | `bg-tint-critical` | `text-state-critical` | `bg-state-critical` | `border-state-critical` |

| Token | Hex |
|-------|-----|
| `bg-state-active` / `border-state-active` | #10B981 / #DCFCE7 |
| `bg-state-grace` / `border-state-grace` | #FB923C / #FFEDD5 |
| `bg-state-critical` / `border-state-critical` | #EF4444 / #FFE4E6 |

### Colors — Icons & UI

| Token | Hex | Usage |
|-------|-----|-------|
| `icon-primary` | #333333 | All icons default |
| `chevron-muted` | #B0B3BA | Muted chevrons, external link |
| `chart-grid` | #E5E5E5 | Chart grid lines, dividers |
| `weather-sun` | #EDA36E | Sun icon |
| `weather-cloud` | #8AA2D7 | Cloud/wind icon |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-card` | 20px | Outer cards |
| `rounded-inner-card` | 16px | Stat cards, contact rows, banners |
| `rounded-button` | 100px | All pill buttons |
| `rounded-modal` | 34px | Modals, bottom sheets |

### Typography

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Captions (Kello, Sää, labels) |
| `text-base` | 16px | Body, buttons |
| `text-lg` | 18px | Section headers |
| `text-xl` | 20px | Card titles |
| `text-4xl font-bold` | 36px | Clock display |
| `font-bold` | — | Titles, emphasis |
| `font-semibold` | — | Card headers |
| `font-medium` | — | Buttons |

### Shadows

NativeWind shadows don't cover Android — always use inline `style`:
```tsx
// Standard card
style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}

// State button shadows
// active:   shadowColor "rgba(42,165,42,0.30)"
// grace:    shadowColor "rgba(165,114,42,0.30)"
// critical: shadowColor "rgba(165,42,42,0.30)"
// all:      shadowOffset {width:0, height:2}, shadowRadius:4, elevation:2
```

---

## Component Patterns

### SafeAreaView — always context version
```tsx
// ✅
import { SafeAreaView } from 'react-native-safe-area-context'
// ❌
import { SafeAreaView } from 'react-native'
```

### Supabase join arrays — always handle both
```tsx
const raw = session.profiles as unknown
const profile = (Array.isArray(raw) ? raw[0] : raw) as ProfileShape
```

### TypeScript cast for Supabase joins
```tsx
// Use double cast, not direct
const data = result.data as unknown as MyType[]
```

### Icons
```tsx
// All icons in src/components/icons/, exported via index.ts
import { IconBell, IconAlert, IconClose } from '../components/icons'
// Accept color prop with #333333 default
<IconBell color="#333333" />
// Tab icons accept focused: boolean
<IconWork focused={focused} />
```

---

## Session Store (useSessionStore.ts)
```tsx
type StoreStatus = "IDLE" | "ACTIVE" | "GRACE_PERIOD" | "ALERT_SENT"

// DB → Store mapping
DB_TO_STORE = { active: "ACTIVE", grace_period: "GRACE_PERIOD", alert_sent: "ALERT_SENT" }

// Actions
startSession(id: string)
stopSession()
transitionToGracePeriod()
transitionToAlertSent()
restoreSession(id: string, status: StoreStatus)

// Notification helpers
sendEmergencyAlert(sessionId: string)  // calls send-alert Edge Function
sendSafeSignOutNotification()           // console.log for now
sendAlertClearedNotification()          // console.log for now
```

---

## Known Gotchas

- `backdrop-blur` not supported in RN → use `bg-white/80`
- Android shadows need `elevation` + iOS `shadow-*` in inline style
- `gap-*` works on flex containers in NativeWind v4; verify on Android
- Simulator default location = San Francisco → set Helsinki (60.1699, 24.9384) manually
- Supabase anon key is safe for frontend; service_role key never commit
- `supabase/functions/` excluded from `tsconfig.json` (Deno, not Node)
- Edge Function deployed with `--no-verify-jwt` — app calls via `supabase.functions.invoke`
- RLS blocks supervisor cross-user joins → use separate query + supervisor policy
- `domainPadding` on CartesianChart causes fake vertical lines → avoid
- victory-native `chartBounds` ≠ layout constants → sync via `runOnJS`