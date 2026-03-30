# YDDoc — Design Style Guide

## Design Philosophy
Neo-brutalist, inspired by Kami editor. Bold, playful, and highly legible. Thick borders, hard offset shadows, strong color blocks, generous spacing.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#E8EEFB` | Page background — light ice blue |
| `surface` | `#FFFFFF` | Cards, document area, inputs |
| `primary` | `#3B5BDB` | Buttons, active states, accent badges |
| `primary-hover` | `#2B4BC8` | Button hover state |
| `primary-foreground` | `#FFFFFF` | Text on primary-colored elements |
| `foreground` | `#1A1A2E` | Body text, headings |
| `muted` | `#C9D5F0` | Disabled states, secondary backgrounds |
| `muted-foreground` | `#5A6178` | Secondary text, timestamps |
| `border` | `#1A1A2E` | Thick borders on cards, buttons, inputs |
| `destructive` | `#E03131` | Delete actions |

## Typography
- **Font**: `Inter` (sans-serif), loaded via `next/font/google`
- **Document title**: 24px, font-bold, centered in top bar
- **Headings (editor)**: H1 = 32px bold, H2 = 24px bold, H3 = 20px semibold
- **Body text**: 16px, normal weight, `leading-relaxed`
- **Button text**: 14px, font-semibold
- **Labels/meta**: 12-13px, font-medium, `muted-foreground` color

## Core UI Patterns

### Borders & Shadows (Neo-Brutalist)
Every card, button, and input gets:
- **Border**: `2px solid border` (thick, always visible)
- **Shadow**: `shadow-[4px_4px_0px_0px_#1A1A2E]` (hard offset, no blur)
- **Hover shadow**: `shadow-[2px_2px_0px_0px_#1A1A2E]` (shrink on hover for "press" effect)
- **Active/pressed**: `shadow-none translate-x-[2px] translate-y-[2px]` (fully collapsed)
- **Border radius**: `rounded-xl` (12px) for cards, `rounded-full` for buttons/badges

### Buttons
```
Primary:   bg-primary text-white border-2 border-border rounded-full px-6 py-2
           font-semibold shadow-[4px_4px_0px_0px_#1A1A2E]
           hover: shadow-[2px_2px_0px_0px_#1A1A2E] translate-x-[1px] translate-y-[1px]
           active: shadow-none translate-x-[2px] translate-y-[2px]

Secondary: bg-surface text-foreground border-2 border-border rounded-full px-6 py-2
           (same shadow behavior)

Danger:    bg-destructive text-white border-2 border-border rounded-full
           (same shadow behavior)

Ghost:     bg-transparent border-none shadow-none
           hover: bg-muted/50
```

### Cards (Document cards, dialogs)
```
bg-surface border-2 border-border rounded-xl p-6
shadow-[4px_4px_0px_0px_#1A1A2E]
hover: shadow-[6px_6px_0px_0px_#1A1A2E] -translate-x-[1px] -translate-y-[1px]
```

### Inputs
```
bg-surface border-2 border-border rounded-xl px-4 py-2
shadow-[2px_2px_0px_0px_#1A1A2E]
focus: ring-2 ring-primary ring-offset-2
```

### Toolbar (Editor)
```
Container: bg-surface border-2 border-border rounded-xl p-2
           shadow-[4px_4px_0px_0px_#1A1A2E]
           Sits above editor area, sticky.

Buttons:   rounded-lg p-2 border-2 border-transparent
           hover: bg-muted/50 border-muted
           active (formatting on): bg-primary text-white border-primary
```

### Badges (roles, status)
```
Pill-shaped: rounded-full px-3 py-1 text-xs font-semibold border-2 border-border
  viewer: bg-muted text-foreground
  editor: bg-primary text-white
```

### Top Bar / Header
```
Full-width, bg-surface border-b-2 border-border
Left: logo/back button
Center: document title (bold, large)
Right: save indicator + share button + user menu
shadow-[0px_4px_0px_0px_#1A1A2E] (bottom edge only)
```

## Layout

### Page Background
Always `bg-[#E8EEFB]`. Content floats on cards above it.

### Dashboard
- Top bar with logo (left), user dropdown (right)
- Section headers: bold, 20px, with action buttons right-aligned
- Document cards in a responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Cards are clickable with hover lift effect

### Editor Page
- Top bar: back arrow (left), editable title (center), save indicator + share button (right)
- Toolbar: below top bar, sticky, horizontal button group
- Document area: white card, max-width `prose` container, centered, min-height viewport

### Auth Pages
- Centered card on the blue background
- Logo above the card
- Form inside card with generous padding

## Spacing
- Page padding: `px-6 py-8` or `p-8`
- Card padding: `p-6`
- Between sections: `space-y-8`
- Between cards in grid: `gap-6`
- Inside toolbar: `gap-1` between buttons, `gap-3` between button groups (separated by a divider)

## Transitions
- All interactive elements: `transition-all duration-150`
- Shadow + translate transitions for the press effect
- Save indicator: fade in/out with `transition-opacity duration-300`

## Accessibility
- All buttons: `aria-label` describing the action
- Toolbar buttons: `aria-pressed` reflecting active formatting state
- Color contrast: foreground on surface >= 7:1 (AAA), primary-foreground on primary >= 4.5:1 (AA)
- Focus rings: `ring-2 ring-primary ring-offset-2` on all focusable elements
- Skip-to-content link on every page
