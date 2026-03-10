# SylvanShield – Test Case Document

**Project:** SylvanShield – Forest Worker Safety Check-in App  
**Platform:** iOS / Android (React Native + Expo)  
**Backend:** Supabase (PostgreSQL + Edge Functions)  
**Version:** 1.0  
**Author:** HW  
**Last Updated:** 2026-03-16

---

## Test Environment

| Item | Details |
|------|---------|
| Device | iOS Simulator (Xcode) / iPhone |
| OS | iOS 17+ |
| Expo SDK | ~55.0.4 |
| Supabase Project | rphrygozptktcbklmvxa |
| Test Accounts | Worker: `minna.saarinen@motosafe.test` / Supervisor: `test@gmail.com` |

---

## Test Coverage Overview

| Module | Total Cases | P1 | P2 | P3 |
|--------|-------------|----|----|-----|
| Authentication | 6 | 3 | 2 | 1 |
| Worker – Shift Flow | 10 | 6 | 3 | 1 |
| Notifications & Alerts | 6 | 4 | 2 | 0 |
| GPS & Location | 5 | 3 | 1 | 1 |
| Supervisor Dashboard | 6 | 3 | 2 | 1 |
| Live Map | 5 | 2 | 2 | 1 |
| Profile & Avatar | 4 | 2 | 1 | 1 |
| Safety Contacts | 4 | 2 | 1 | 1 |
| **Total** | **46** | **25** | **14** | **7** |

---

## Priority Definitions

| Priority | Definition |
|----------|-----------|
| **P1 – Critical** | Core safety functionality. Must pass before any release. |
| **P2 – High** | Important UX or data integrity. Should pass before release. |
| **P3 – Medium** | Nice-to-have or edge cases. Can be deferred. |

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Pass |
| ❌ | Fail |
| ⚠️ | Partial / Workaround |
| 🔲 | Not yet tested |

---

## 1. Authentication

### TC-AUTH-001 – Successful login with valid credentials
**Priority:** P1  
**Preconditions:** App is on the login screen. User account exists in Supabase.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter valid email and password | Fields accept input |
| 2 | Check the privacy policy checkbox | Checkbox becomes checked |
| 3 | Tap "Kirjaudu" | Loading spinner appears |
| 4 | Wait for response | User is redirected to Home screen |

**Actual Result:** 🔲  
**Notes:**

---

### TC-AUTH-002 – Login with incorrect password
**Priority:** P1  
**Preconditions:** App is on the login screen.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter valid email, wrong password | Fields accept input |
| 2 | Check checkbox and tap "Kirjaudu" | Loading spinner appears |
| 3 | Wait for response | Error alert is shown: "Kirjautuminen epäonnistui" |
| 4 | Check current screen | User remains on login screen |

**Actual Result:** 🔲  
**Notes:**

---

### TC-AUTH-003 – Login without accepting privacy policy
**Priority:** P1  
**Preconditions:** App is on the login screen.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter valid email and password | Fields accept input |
| 2 | Leave checkbox unchecked | Checkbox remains empty |
| 3 | Tap "Kirjaudu" | Alert shown: "Hyväksy tietosuojaseloste jatkaaksesi" |
| 4 | Check current screen | User remains on login screen |

**Actual Result:** 🔲  
**Notes:**

---

### TC-AUTH-004 – Login with empty fields
**Priority:** P2  
**Preconditions:** App is on the login screen.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Leave email and password empty | Fields are blank |
| 2 | Tap "Kirjaudu" | Alert shown: "Täytä kaikki kentät" |

**Actual Result:** 🔲  
**Notes:**

---

### TC-AUTH-005 – Role-based routing after login (Worker)
**Priority:** P1  
**Preconditions:** Worker account exists with role = 'worker'.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login with worker account | Home screen is shown |
| 2 | Check bottom tab bar | Dashboard tab is NOT visible |
| 3 | Check visible tabs | Only: Työvuoro, Historia, Profiili |

**Actual Result:** 🔲  
**Notes:**

---

### TC-AUTH-006 – Role-based routing after login (Supervisor)
**Priority:** P1  
**Preconditions:** Supervisor account exists with role = 'supervisor'.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login with supervisor account | Home screen is shown |
| 2 | Check bottom tab bar | Dashboard tab IS visible |
| 3 | Check visible tabs | Työvuoro, Hallinta, Historia, Profiili |

**Actual Result:** 🔲  
**Notes:**

---

## 2. Worker – Shift Flow

### TC-SHIFT-001 – Start a new shift
**Priority:** P1  
**Preconditions:** Logged in as worker. Status is IDLE. Safety contact is set.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Observe home screen | Card shows "Ei työjaksoa käynnissä", button is dark |
| 2 | Tap "Aloita" | Confirmation or immediate start |
| 3 | Observe card | Card turns green, status = ACTIVE |
| 4 | Check Supabase | New `work_session` row created with status = 'active' |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-002 – Sign out from ACTIVE state
**Priority:** P1  
**Preconditions:** Session is ACTIVE.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Kuittaa Ulos" button | Confirmation modal appears |
| 2 | Read modal title | "Haluatko kirjautua ulos?" in dark text (not red) |
| 3 | Tap "Kirjaudu ulos" | Session ends, status returns to IDLE |
| 4 | Check Supabase | Session status = 'completed' |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-003 – Cancel sign-out from ACTIVE state
**Priority:** P2  
**Preconditions:** Session is ACTIVE, sign-out modal is open.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Peruuta" | Modal closes |
| 2 | Observe session | Status remains ACTIVE |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-004 – Shift-end timer triggers grace period modal
**Priority:** P1  
**Preconditions:** Session is ACTIVE. `SHIFT_END_DELAY_MS` = 5000ms (test value).

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Start a session | Status = ACTIVE |
| 2 | Wait 5 seconds | Modal appears: "Työjakso päättyi" |
| 3 | Read modal options | "Kuittaa Ulos" and "Työ Jatkuu" buttons visible |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-005 – Continue working from shift-end modal
**Priority:** P1  
**Preconditions:** Shift-end modal is visible.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Työ Jatkuu" | Modal closes |
| 2 | Observe status | Status changes to GRACE_PERIOD |
| 3 | Observe card color | Card turns orange |
| 4 | Check warning text | "Hälytys lähetetään 15 minuutin kuluttua." visible |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-006 – Sign out safely from shift-end modal
**Priority:** P1  
**Preconditions:** Shift-end modal is visible.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Kuittaa Ulos" | Modal closes |
| 2 | Observe status | Returns to IDLE |
| 3 | Check Supabase | Session status = 'completed' |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-007 – Grace period auto-escalates to ALERT_SENT
**Priority:** P1  
**Preconditions:** Status is GRACE_PERIOD. `GRACE_PERIOD_MS` = 5000ms (test value).

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter grace period and wait 5 seconds | Status changes to ALERT_SENT |
| 2 | Observe card | Card turns red |
| 3 | Check Supabase | Session status = 'alert_sent' |
| 4 | Check email inbox | Emergency email received at safety contact email |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-008 – Sign out safely from GRACE_PERIOD
**Priority:** P1  
**Preconditions:** Status is GRACE_PERIOD.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Kuittaa Ulos" | Session ends immediately |
| 2 | Observe status | Returns to IDLE |
| 3 | Check Supabase | Session status = 'completed' |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-009 – Cancel alert with long press (ALERT_SENT)
**Priority:** P1  
**Preconditions:** Status is ALERT_SENT.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Press and hold "Kuittaa Ulos" button | Red fill animation starts from bottom |
| 2 | Hold for 3 seconds | Animation completes |
| 3 | Release | Status returns to IDLE |
| 4 | Check Supabase | Session status = 'completed' |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SHIFT-010 – Session restored after app reload
**Priority:** P2  
**Preconditions:** Active session exists in Supabase for current user.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Start a session | Status = ACTIVE |
| 2 | Close and reopen app | App reloads |
| 3 | Observe home screen | Session is restored to correct status |

**Actual Result:** 🔲  
**Notes:**

---

## 3. Notifications & Alerts

### TC-NOTIF-001 – Manual emergency alert via bell icon
**Priority:** P1  
**Preconditions:** Logged in as worker. Safety contact has email set.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap the bell icon next to safety contact name | Confirmation modal appears |
| 2 | Read modal | "Lähetä hätäilmoitus?" with red alert icon |
| 3 | Tap "Lähetä" | Modal closes |
| 4 | Check email inbox | Emergency email received |

**Actual Result:** 🔲  
**Notes:**

---

### TC-NOTIF-002 – Cancel manual emergency alert
**Priority:** P2  
**Preconditions:** Bell icon confirmation modal is open.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Peruuta" | Modal closes, no email sent |

**Actual Result:** 🔲  
**Notes:**

---

### TC-NOTIF-003 – Automatic alert email on ALERT_SENT transition
**Priority:** P1  
**Preconditions:** Safety contact email = lukezzzhw@gmail.com. `GRACE_PERIOD_MS` = 5000ms.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Reach GRACE_PERIOD state | Status = GRACE_PERIOD |
| 2 | Wait 5 seconds without action | Status changes to ALERT_SENT |
| 3 | Check email inbox within 30 seconds | Email received with worker name in subject |
| 4 | Read email content | Contains worker name and Finnish emergency text |

**Actual Result:** 🔲  
**Notes:**

---

### TC-NOTIF-004 – Alert email not sent if safely signed out
**Priority:** P1  
**Preconditions:** Status is GRACE_PERIOD.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Kuittaa Ulos" before grace period expires | Session ends |
| 2 | Wait 10 seconds | No email received |
| 3 | Check email inbox | No emergency email sent |

**Actual Result:** 🔲  
**Notes:**

---

### TC-NOTIF-005 – Edge Function returns 200 on valid session
**Priority:** P2  
**Preconditions:** Valid session ID with safety contact email set.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Call Edge Function via curl with valid session_id | HTTP 200 response |
| 2 | Check response body | `{"success": true, "email": {"id": "..."}}`  |

**Actual Result:** 🔲  
**Notes:**

---

### TC-NOTIF-006 – Edge Function returns error on missing session
**Priority:** P2  
**Preconditions:** None.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Call Edge Function with invalid session_id | HTTP 404 response |
| 2 | Check response body | `{"error": "Session not found"}` |

**Actual Result:** 🔲  
**Notes:**

---

## 4. GPS & Location

### TC-GPS-001 – Location label updates when session starts
**Priority:** P1  
**Preconditions:** Location permission granted. Session is IDLE.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Set simulator location to Helsinki (60.1699, 24.9384) | Custom location set |
| 2 | Start a session | Status = ACTIVE |
| 3 | Wait up to 30 seconds | Location label in card updates from "Sijainti tuntematon" to a place name |

**Actual Result:** 🔲  
**Notes:**

---

### TC-GPS-002 – Coordinates written to Supabase
**Priority:** P1  
**Preconditions:** Active session exists. Custom location set in simulator.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Start session | Status = ACTIVE |
| 2 | Wait 30 seconds | GPS watcher triggers |
| 3 | Query Supabase: `select last_known_latitude, last_known_longitude from work_sessions where status = 'active'` | Coordinates match simulator location |

**Actual Result:** 🔲  
**Notes:**

---

### TC-GPS-003 – Location updates on simulator position change
**Priority:** P1  
**Preconditions:** Active session. GPS watcher running.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Set simulator to location A | Initial coordinates stored |
| 2 | Change simulator to location B (>50m away) | Watcher triggers update |
| 3 | Check Supabase | Coordinates updated to location B |

**Actual Result:** 🔲  
**Notes:**

---

### TC-GPS-004 – Location watcher stops on session end
**Priority:** P2  
**Preconditions:** Active session with GPS watcher running.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | End session (sign out) | Status = IDLE |
| 2 | Change simulator location | No new DB updates |
| 3 | Wait 60 seconds and check Supabase | Coordinates remain unchanged |

**Actual Result:** 🔲  
**Notes:**

---

### TC-GPS-005 – Location permission denied gracefully
**Priority:** P3  
**Preconditions:** Location permission denied in device settings.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Deny location permission | Permission rejected |
| 2 | Start session | Session starts normally |
| 3 | Observe location label | Shows "Sijainti tuntematon" (no crash) |

**Actual Result:** 🔲  
**Notes:**

---

## 5. Supervisor Dashboard

### TC-DASH-001 – Dashboard shows correct worker counts
**Priority:** P1  
**Preconditions:** Logged in as supervisor. Test data seeded (2 active, 2 grace_period, 1 alert_sent).

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Dashboard tab | Dashboard loads |
| 2 | Observe stat cards | "Aktiivisena nyt" = 2, "Myöhästyneitä" = 2, "Hälytystilassa" = 1 |

**Actual Result:** 🔲  
**Notes:**

---

### TC-DASH-002 – Worker list shows all active workers
**Priority:** P1  
**Preconditions:** Logged in as supervisor. Test data seeded.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Scroll down on Dashboard | Worker list is visible |
| 2 | Count workers | All workers with active/grace/alert sessions shown |
| 3 | Check worker cards | Name, employee ID, team, avatar displayed |

**Actual Result:** 🔲  
**Notes:**

---

### TC-DASH-003 – Tap worker opens history details
**Priority:** P1  
**Preconditions:** Worker list is visible.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap any worker card | Navigates to history-details screen |
| 2 | Check screen title | "Tiedot" |
| 3 | Check content | Worker's session details displayed |

**Actual Result:** 🔲  
**Notes:**

---

### TC-DASH-004 – Dashboard not accessible to workers
**Priority:** P2  
**Preconditions:** Logged in as worker.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Check bottom tab bar | Dashboard tab is not visible |
| 2 | Try navigating to `/dashboard` directly | Redirected or access denied |

**Actual Result:** 🔲  
**Notes:**

---

### TC-DASH-005 – Chart displays hourly worker activity
**Priority:** P2  
**Preconditions:** Logged in as supervisor. Sessions exist today.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Dashboard | Chart is visible |
| 2 | Observe chart | Line chart shows worker count per hour |
| 3 | Tap a data point | Tooltip shows value |

**Actual Result:** 🔲  
**Notes:**

---

### TC-DASH-006 – Dashboard shows zero counts with no sessions
**Priority:** P3  
**Preconditions:** No active sessions today.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Clear all today's sessions in Supabase | No active sessions |
| 2 | Navigate to Dashboard | All stat cards show 0 |

**Actual Result:** 🔲  
**Notes:**

---

## 6. Live Map

### TC-MAP-001 – Workers displayed as pins on map
**Priority:** P1  
**Preconditions:** Logged in as supervisor. Workers have GPS coordinates.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open Live Map from Dashboard | Map loads centered on worker area |
| 2 | Observe map | Worker pins visible |
| 3 | Check pin colors | Active = green, Grace = orange, Alert = red |

**Actual Result:** 🔲  
**Notes:**

---

### TC-MAP-002 – Tap worker pin shows detail card
**Priority:** P1  
**Preconditions:** Worker pins visible on map.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap a worker pin | FocusWorkerCard appears at bottom |
| 2 | Check card content | Worker name, ID, team, safety contact shown |
| 3 | Map pans | Map animates to center on tapped worker |

**Actual Result:** 🔲  
**Notes:**

---

### TC-MAP-003 – Stat card filters workers by category
**Priority:** P2  
**Preconditions:** Multiple workers in different states.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Hälytystilassa" stat card | Card highlights |
| 2 | Observe focus card | Shows only alert workers with prev/next navigation |
| 3 | Tap next arrow | Navigates to next alert worker, map pans |

**Actual Result:** 🔲  
**Notes:**

---

### TC-MAP-004 – Map is freely scrollable and zoomable
**Priority:** P2  
**Preconditions:** Live Map is open, no worker card selected.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Pinch to zoom in/out | Map zooms smoothly |
| 2 | Drag map | Map pans freely |
| 3 | Select a stat card, then try to pan | Map still responds to gestures |

**Actual Result:** 🔲  
**Notes:**

---

### TC-MAP-005 – Info button navigates to session details
**Priority:** P3  
**Preconditions:** Worker detail card is visible.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap the ⓘ info button on worker card | Navigates to history-details screen |
| 2 | Check content | Correct session details shown |

**Actual Result:** 🔲  
**Notes:**

---

## 7. Profile & Avatar Upload

### TC-PROF-001 – View profile information
**Priority:** P1  
**Preconditions:** Logged in as any user.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Profile tab | Profile screen loads |
| 2 | Check displayed info | Name, email, role, employee ID visible |

**Actual Result:** 🔲  
**Notes:**

---

### TC-PROF-002 – Upload avatar from photo library
**Priority:** P1  
**Preconditions:** Logged in. Profile edit screen open.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap camera icon on avatar | Photo library opens |
| 2 | Select a photo | Photo is cropped to square |
| 3 | Confirm selection | Upload spinner appears |
| 4 | Wait for upload | Avatar updates in UI immediately |
| 5 | Navigate away and return | New avatar persists |
| 6 | Check Supabase Storage | File exists at `avatars/{user_id}/avatar.jpg` |

**Actual Result:** 🔲  
**Notes:**

---

### TC-PROF-003 – Profile changes saved correctly
**Priority:** P2  
**Preconditions:** Profile edit screen open.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Change name field | Field updates |
| 2 | Tap save | Success feedback shown |
| 3 | Navigate away and return | New name persists |
| 4 | Check Supabase | `profiles.name` updated |

**Actual Result:** 🔲  
**Notes:**

---

### TC-PROF-004 – Avatar displayed across app after upload
**Priority:** P3  
**Preconditions:** Avatar has been uploaded.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Upload new avatar | Avatar updates on profile screen |
| 2 | Navigate to Home screen | Avatar shown next to safety contact (if applicable) |
| 3 | Supervisor opens Live Map | Worker avatar shown on map pin and detail card |

**Actual Result:** 🔲  
**Notes:**

---

## 8. Safety Contacts

### TC-SAFE-001 – Add new safety contact
**Priority:** P1  
**Preconditions:** Logged in as worker. Safety Contacts screen open.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap add button | Edit form opens |
| 2 | Fill in name, phone, email | Fields accept input |
| 3 | Tap save | Contact saved |
| 4 | Check list | New contact appears |
| 5 | Check Supabase | New row in `safety_contacts` |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SAFE-002 – Set contact as active
**Priority:** P1  
**Preconditions:** Multiple safety contacts exist.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap a non-active contact | Edit screen opens |
| 2 | Toggle active status | Contact marked as active |
| 3 | Return to Home screen | New active contact shown in Turvahenkilö row |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SAFE-003 – Edit existing contact
**Priority:** P2  
**Preconditions:** Safety contact exists.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap existing contact | Edit form opens with pre-filled data |
| 2 | Change phone number | Field updates |
| 3 | Save | Changes persisted in Supabase |

**Actual Result:** 🔲  
**Notes:**

---

### TC-SAFE-004 – Delete safety contact
**Priority:** P3  
**Preconditions:** Safety contact exists.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open contact for editing | Edit screen opens |
| 2 | Tap delete | Confirmation prompt shown |
| 3 | Confirm deletion | Contact removed from list |
| 4 | Check Supabase | Row deleted from `safety_contacts` |

**Actual Result:** 🔲  
**Notes:**

---

## Regression Checklist

Run after every significant code change:

- [ ] Login works for both worker and supervisor
- [ ] Worker can start and end a session
- [ ] Grace period timer triggers correctly
- [ ] Alert email is sent on ALERT_SENT transition
- [ ] Supervisor dashboard shows correct counts
- [ ] Live map loads and pins are visible
- [ ] GPS coordinates update in Supabase during active session
- [ ] Avatar upload succeeds and displays correctly
- [ ] App does not crash on any tested flow

---

## Known Limitations

| ID | Description | Impact |
|----|-------------|--------|
| L-001 | Push notifications not implemented | Workers do not receive background alerts |
| L-002 | SMS notifications require Twilio paid account | No SMS in current build |
| L-003 | GPS tracking requires foreground app usage | No background location tracking |
| L-004 | Shift timers use test values (5s) in dev build | Production values: 15–30 min |
| L-005 | Avatar upload not available on web platform | Mobile only |

---

*Document maintained alongside source code in `/docs/TEST_CASES.md`*