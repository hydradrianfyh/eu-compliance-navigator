# Bilingual Introduction Integration — Design

**Date:** 2026-04-23
**Author:** Yanhao FU
**Status:** Approved (conversational) — implementation pending

---

## 1. Goal

Ship the existing Chinese management briefing (`introduction/eu-compliance-navigator-briefing.html`, 1053 lines, editorial aesthetic, 9 sections) as a **bilingual** (zh/en) landing page for the EU Compliance Navigator, so that:

- First-time visitors see the briefing as their first screen.
- Returning visitors go directly to their last-used workspace tab (unchanged).
- The briefing is always reachable from the global nav.
- The project is ready for one-click Vercel import from GitHub.

## 2. Decisions

| # | Decision | Chosen option | Why |
|---|---|---|---|
| ① | English content source | **Translate from Chinese** | No English source exists; content must ship bilingual. |
| ② | Integration approach | **Static HTML assets in `public/intro/`** | Preserves the hand-crafted editorial styling (Noto Serif SC + Fraunces + paper texture + reveal animations + floating TOC) with zero React-rewrite cost; Vercel serves as-is. |
| ③ | Entry point | **Cold-start landing + permanent nav link** | New visitors get product context first; returning users keep the direct-to-workspace path via `lastActiveTab`. |

## 3. File layout

### Delete
- `introduction/eu-compliance-navigator-briefing.html`

### Create
- `public/intro/zh.html` — Chinese version (content from the deleted file + two in-file modifications)
- `public/intro/en.html` — English translation (same CSS + same structure)

### Modify
- `src/app/page.tsx` — cold-start routing logic
- `src/components/shell/GlobalNav.tsx` — add "Briefing · 简报" link
- `src/app/globals.css` — minimal styles for the nav link

## 4. HTML modifications (applied to both zh and en)

**A. Language toggle button** — top-right fixed position:

- In `zh.html`: label = `EN`, clicks go to `/intro/en.html`
- In `en.html`: label = `中`, clicks go to `/intro/zh.html`
- Styling: matches the existing TOC (`JetBrains Mono`, 10–12px, `--ink-mute` border, `--accent` on hover)
- Position: `position: fixed; top: 1.4rem; right: 1.4rem; z-index: 60;`

**B. "Enter tool" CTA** — placed at the end of section `s09` (conclusion):

- `zh.html`: "进入工具 →" → `href="/setup"`
- `en.html`: "Enter the tool →" → `href="/setup"`
- Styling: `--accent` background, `--paper` text, generous padding

## 5. Translation policy (en.html)

**Keep in original English (do not translate):**
- Regulatory acronyms: WVTA, GSR2, R155, R156, R157, R171, CSMS, SUMS, ALKS, DCAS, EDR, DMS, DDW, ISA, AEB, TPMS, OBD, OBFCM, OBM, EVP, AdBlue, ADAS, RDE, WLTP, NOx, CO₂, GDPR, PLD, GPSR, CRA, REACH, ELV, AI Act, Data Act, Battery Regulation, Euro 6, Euro 7, UNECE, EUR-Lex, OJ L
- Regulation citations: "Regulation (EU) 2018/858", "Directive (EU) 2024/2853", etc.
- Role names: homologation, type-approval, technical service, etc.

**Translate:**
- All marketing / narrative copy, section titles, TOC labels, navigation, CTA copy
- Dates: keep ISO format (e.g. `2027-11-29` remains as-is)

**Preserve:**
- All section IDs (`s01`–`s09`)
- CSS class names
- Animation trigger classes (`.reveal`, `.reveal-delay-N`)
- TOC anchor references

## 6. Cold-start routing

`src/app/page.tsx`:

```tsx
const lastTab = readLastActiveTab();
if (lastTab) {
  router.replace(`/${lastTab}`);
} else {
  const prefersZh = navigator.language.toLowerCase().startsWith("zh");
  window.location.href = `/intro/${prefersZh ? "zh" : "en"}.html`;
}
```

- Returning visitor: unchanged behavior (lastActiveTab → workspace tab).
- First-time visitor: redirected to briefing, language auto-detected by browser.
- `window.location.href` (not `router.replace`) because the target is a static asset outside Next's route tree.

## 7. Nav link

`src/components/shell/GlobalNav.tsx` — add between `.global-nav-brand` and `.global-nav-project`:

```tsx
<a
  className="global-nav-intro-link"
  href="/intro/zh.html"
  title="View management briefing / 查看管理层简报"
>
  Briefing · 简报
</a>
```

- Uses native `<a>` (not `next/link`) because the target is a static asset, not a Next route.
- Default points at `/intro/zh.html` (user is in Germany but primary audience is bilingual; users can one-click toggle to English once on the page).

## 8. Verification gates

| Gate | Command | Pass criterion |
|---|---|---|
| Type-check | `npx tsc --noEmit` | 0 errors |
| Unit tests | `npm test` | 236 tests green (same count as baseline) |
| Build | `npm run build` | `out/intro/zh.html` + `out/intro/en.html` present |
| Manual — cold start | Clear localStorage, visit `/` | Redirects to `/intro/en.html` (for `de-DE` browser) or `/intro/zh.html` (for `zh-*` browser) |
| Manual — returning | Set `lastActiveTab=status`, visit `/` | Redirects to `/status` |
| Manual — language toggle | Click `EN` on zh.html | Navigates to en.html with same scroll position (best-effort) |
| Manual — CTA | Click "Enter tool" button | Lands on `/setup` |
| Manual — nav link | Click "Briefing · 简报" from any workspace tab | Opens briefing |

## 9. Git flow

Single commit on `main`:

```
feat(intro): bilingual briefing as cold-start landing + permanent nav link

- Move introduction/eu-compliance-navigator-briefing.html → public/intro/zh.html
- Translate to public/intro/en.html (regulatory acronyms preserved)
- Add in-page language toggle (top-right) + "Enter tool" CTA
- src/app/page.tsx: first-visit → briefing (browser-language detection)
- src/components/shell/GlobalNav.tsx: permanent "Briefing · 简报" link
```

Push to `origin main` so Vercel's GitHub-import flow picks it up directly.

## 10. Explicit out-of-scope

- `next.config.ts` rewrites for pretty URLs (`/intro/zh` without `.html`) — not needed for launch
- Persisting language preference to localStorage — browser auto-detect is sufficient for v1
- Adding language toggle to the main app UI (tabs, buttons) — main app stays English-only
- Updating Playwright / vitest suites to cover intro routing — launch priority
- SEO metadata tuning (og:image, per-language hreflang) — follow-up

## 11. Risk notes

- **Translation quality**: regulatory tone requires precision. Mitigation: keep all regulatory acronyms + citations in original English; translator (me) runs a self-check on any term that would change meaning if mistranslated.
- **Cold-start test coverage**: if any existing unit test mocks `readLastActiveTab()` and asserts redirect, it may need updating. Mitigation: grep test files for `readLastActiveTab` before editing; only update what breaks.
- **Animation integrity**: the briefing uses `IntersectionObserver` for reveal animations + TOC highlighting. Copying into `public/` and adding two small elements must not break the existing script. Mitigation: diff against original visually after moving.
