# TaskFlow Enterprise Design System (DESIGN.md)
*Architecture: Precision Swiss Foundry & Industrial Utilitarian*
*Governing Skill: using-frontend-noslop*

---

## 1. Aesthetic Stance & Anti-Slop Charter

TaskFlow is a high-throughput, mission-critical project and task management system backed by a standalone SQL engine. 

### What We Ban (AI Slop Floor):
- ❌ **No generic SaaS gradients:** No blue-to-purple or purple-to-cyan ambient glow gradients.
- ❌ **No floating orbs or background meshes:** Backgrounds must be functional, crisp, and tactile.
- ❌ **No excessive pill-radius:** Radii are strictly quantized (cards: 10px, buttons: 7px, badges: 4px).
- ❌ **No unconsidered blur/glassmorphism:** Surfaces are solid, legible, and high-contrast.
- ❌ **No generic marketing fluff:** Copy is direct, technical, human, and concrete.

### What We Enforce (Craft Floor):
- ✅ **Information Density & Hierarchy:** Compact, scannable layouts with clear typographic scales.
- ✅ **Tactile Responsiveness:** Physical active states (`scale(0.98)` / `cubic-bezier(0.23, 1, 0.32, 1)`).
- ✅ **Engineered Monospaced Micro-elements:** Task IDs (`TF-101`), SQL statuses (`WAL`), and counts use monospace tabular numbers.
- ✅ **Bilingual Parity:** Equal typographic care given to Arabic (RTL) with appropriate diacritic line-heights and English (LTR).

---

## 2. Design Tokens & Palette

### Light Mode (Porcelain & Cadmium)
```css
--background: #F8FAFC;         /* Crisp architectural neutral */
--surface: #FFFFFF;            /* Pure white solid cards */
--surface-muted: #F1F5F9;      /* Column tracks & subtle panels */
--surface-elevated: #FFFFFF;   /* Modals & drawers */
--border: #E2E8F0;             /* Hairline separation (1px) */
--border-subtle: #EDF2F7;      /* Secondary dividers */

--text-primary: #0F172A;       /* Deep slate black (WCAG AAA) */
--text-secondary: #475569;     /* 4.8:1 contrast */
--text-tertiary: #64748B;      /* Metadata & labels */

--accent: #D97706;             /* Cadmium Industrial Amber */
--accent-hover: #B45309;
--accent-subtle: #FEF3C7;
--accent-text: #92400E;
```

### Dark Mode (Carbon & Electric Amber)
```css
--background: #090D16;         /* Deep graphite carbon */
--surface: #0F1523;            /* Solid matte container */
--surface-muted: #151D30;      /* Column tracks */
--surface-elevated: #1B243B;   /* Modals & drawers */
--border: #1E293B;             /* Hairline dark border */
--border-subtle: rgba(255, 255, 255, 0.06);

--text-primary: #F8FAFC;       /* Crisp white */
--text-secondary: #94A3B8;     /* 5.5:1 contrast */
--text-tertiary: #64748B;

--accent: #F59E0B;             /* Electric Safety Amber */
--accent-hover: #FBBF24;
--accent-subtle: rgba(245, 158, 11, 0.12);
--accent-text: #FDE68A;
```

### Status & Priority Palette
- **Urgent / Overdue:** `#EF4444` (Ruby Crimson)
- **High Priority:** `#F59E0B` (Safety Amber)
- **Normal / In Progress:** `#3B82F6` (Cobalt Precision)
- **Done / Healthy:** `#10B981` (Emerald Relay)

---

## 3. Typography & Spacing Scale
- **Base Grid:** 4px / 8px incremental scale.
- **English Font:** Inter / System UI (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Arabic Font:** `IBM Plex Sans Arabic`, `Cairo`, system-ui. Line-height clamped at `1.65` for zero diacritic clipping.
- **Monospace Font:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
