# Plan: responsiveness fixes

Status of each item is kept here until it ships; then move the result to `STATUS.md` and delete the item.
Written 2026-10-26 from reading the code (not from running every screen).

## Done
- Staff web (2026-10-26, awaiting the developer's browser test at 360-1600 px): top bar in three layouts (wide; medium below 1100 px with the brand name hidden and smaller gaps; narrow below 700 px with two rows), menu panels no wider than the window, record rows wrap their action under the details, Activity Log filters stack below 440 px, the Offenses search fills the row below 520 px. Chosen: 360 px minimum and two rows (not a menu button).
- Scan tab draws under the nav bar and lays out from its measured size (2f785f0).
- Mobile Scan screen: layout derived from height, insets and font scale (capped at 1.3x); cream sheet behind the nav bar removed; the bar gets a light edge on Scan (commit 2752e9c). Awaiting device test.

## Mobile (open)
1. **Login** (`apps/mobile/src/app/(auth)/login.jsx`): no ScrollView and a fixed 250 dp hero image. Wrap in a ScrollView, size the hero from the screen height.
2. **Onboarding**: no ScrollView; slide content may clip on small screens (to confirm).
3. **Font scale**: no screen caps text growth except Scan. Cap it in the shared `Text`/`Button` components (about 1.3x) and check fixed-height controls (56 dp buttons, 64 dp fields).

## Staff web (open)
Findings, most to least serious:
1. **Top bar** (`components/shell/TopBar.jsx`): one fixed 72 px row (brand + office + pill, tabs, bell + account), two `flex: 1` groups and a 28 px tab gap. Squeezes below about 900 px; menu panels are a fixed 320 px, anchored right.
2. **Offense and Activity rows** (`components/records/RecordRow.jsx`): fixed 130 px Revoke column, rows that may not wrap; may overflow at 500-700 px.
3. **Activity Log filters**: fixed-width pills (190 + 150 px); the header wraps, so only an issue below about 380 px (low).
4. Queue (1100 px two columns, panels at 600/960), Sign-in (960 px split), StaffModal (600 px) and the public display (scales to fit) look fine; verify, no change planned.

Steps:
1. Top bar: unchanged at 1100 px and wider. 700-1100 px: smaller gaps, office name hidden if needed, tabs centred. Below 700 px: two rows (brand, office, pill, account on row one; tabs full width on row two). `TOP_BAR_HEIGHT` becomes a value the bar and the `MenuPanel` offset both derive from. Menu width becomes `min(320, window width - 2 x gutter)`.
2. Record rows: let the action drop below the details when narrow (`flexWrap`, `minWidth: 0` on text columns); Revoke gets a minimum width, not a fixed one.
3. Filters stretch to full width under about 420 px; check the pager row wraps.
4. Verify in the browser at 360, 600, 768, 1024, 1280 and 1600 px: Queue (with and without a current ticket), Offenses (with data), Activity Log, every modal, Sign-in and Display.
5. Lint, a staff web export, update STATUS/DECISIONS, commit locally; push after the developer tests.

Open decisions for the developer:
- Minimum supported width: desktop and tablet only (about 768 px), or a phone-width browser (360 px)? Recommended: 360 px for the top bar, accept cramped Queue panels there.
- Narrow top bar: two rows (recommended, every control stays visible) or a collapsing menu button.
