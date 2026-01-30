---
name: check-a11y
description: Run comprehensive accessibility audit on components and pages. Use when checking WCAG 2.2 compliance.
allowed-tools: Read, Bash, Grep, Write
argument-hint: [component-path]
---

# Accessibility Audit

Run a comprehensive accessibility audit for the Economic Indicators Dashboard.

## Target

$ARGUMENTS (if not specified, audit entire application)

## WCAG 2.2 Requirements

**Target**: Level AA (minimum), Level AAA (preferred)

### Level A (Must Have)
- Text alternatives for non-text content
- Captions for audio/video
- Content can be presented in different ways
- Color is not the only visual means
- Keyboard accessible
- Enough time to read/use content
- No seizure-inducing flashing
- Navigable with keyboard
- Readable and understandable
- Predictable navigation
- Input assistance

### Level AA (Should Have)
- Captions for live audio
- Audio description for video
- Color contrast: 4.5:1 (text), 3:1 (UI components)
- Text can be resized 200%
- Multiple navigation mechanisms
- Headings and labels descriptive
- Focus visible
- Language of page/parts identified
- Consistent navigation
- Error identification and suggestions

### Level AAA (Nice to Have)
- Sign language for audio
- Extended audio description
- No timing limits
- No interruptions
- Re-authentication preserves data
- Color contrast: 7:1 (text), 4.5:1 (UI)
- Images of text avoided (use real text)
- Section headings

## Audit Steps

### 1. Automated Testing with axe-core

```bash
cd frontend
npm install -D @axe-core/react vitest-axe
```

Create/run accessibility tests:

```typescript
// ComponentName.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'vitest-axe'
import { ComponentName } from './ComponentName'

expect.extend(toHaveNoViolations)

describe('ComponentName - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<ComponentName />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

Run tests:
```bash
npm test -- --grep "Accessibility"
```

### 2. Manual Keyboard Testing

Test keyboard navigation:
- **Tab**: Navigate forward through interactive elements
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons, links
- **Escape**: Close dialogs, dropdowns
- **Arrow keys**: Navigate menus, lists, charts
- **Home/End**: Jump to start/end

Checklist:
- [ ] All interactive elements reachable by keyboard
- [ ] Logical tab order (left-to-right, top-to-bottom)
- [ ] Focus indicators visible (outline, border, etc.)
- [ ] No keyboard traps (can escape from all components)
- [ ] Shortcuts don't conflict with browser/assistive tech
- [ ] Focus moves to opened dialogs/modals
- [ ] Focus returns to trigger after closing

### 3. Screen Reader Testing

Test with screen readers:
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

Checklist:
- [ ] All content is announced
- [ ] Interactive elements have clear labels
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA labels present where needed
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Status updates are announced (aria-live)
- [ ] Charts have text alternatives

### 4. Visual Inspection

Checklist:
- [ ] Color contrast meets 4.5:1 (text) and 3:1 (UI)
- [ ] Information not conveyed by color alone
- [ ] Touch targets minimum 44x44px
- [ ] Text can resize to 200% without breaking
- [ ] Content reflows at 400% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Focus indicators visible on all interactive elements
- [ ] Consistent navigation across pages

### 5. Color Contrast Analysis

```bash
# Use browser dev tools or online tools
# https://webaim.org/resources/contrastchecker/
```

Check contrast ratios:
- **Normal text**: 4.5:1 (AA), 7:1 (AAA)
- **Large text** (18pt+): 3:1 (AA), 4.5:1 (AAA)
- **UI components**: 3:1 (AA)
- **Graphical objects**: 3:1 (AA)

### 6. Responsive & Mobile Testing

Checklist:
- [ ] Works on small screens (320px width)
- [ ] Touch targets adequate (44x44px minimum)
- [ ] Content readable without zooming
- [ ] No horizontal scrolling
- [ ] Portrait and landscape orientations
- [ ] Touch gestures intuitive

## Common Issues and Fixes

### Missing Alt Text
```tsx
// ❌ Bad
<img src="chart.png" />

// ✅ Good
<img src="chart.png" alt="Unemployment rate trend from 2020-2024" />

// ✅ Decorative images
<img src="decoration.png" alt="" role="presentation" />
```

### Poor Color Contrast
```tsx
// ❌ Bad - #999 on white background (2.85:1)
<span className="text-gray-400">Low contrast text</span>

// ✅ Good - #666 on white background (5.74:1)
<span className="text-gray-600">Better contrast text</span>
```

### Missing Form Labels
```tsx
// ❌ Bad
<input type="text" placeholder="Enter name" />

// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" type="text" placeholder="Enter name" />

// ✅ Good (visually hidden label)
<label htmlFor="search" className="sr-only">Search indicators</label>
<input id="search" type="text" placeholder="Search..." />
```

### Non-Keyboard Accessible
```tsx
// ❌ Bad - onClick on div
<div onClick={handleClick}>Click me</div>

// ✅ Good - Use button
<button onClick={handleClick}>Click me</button>

// ✅ Good - Make div keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  Click me
</div>
```

### Missing Focus Indicators
```css
/* ❌ Bad - removing outline */
button {
  outline: none;
}

/* ✅ Good - custom focus indicator */
button {
  outline: 2px solid transparent;
  transition: outline 0.2s;
}

button:focus-visible {
  outline: 2px solid #003d7a;
  outline-offset: 2px;
}
```

### Inaccessible Charts
```tsx
// ✅ Good - Provide table alternative
<div>
  <div role="img" aria-label="Unemployment rate chart">
    <LineChart data={data} />
  </div>

  <details className="mt-4">
    <summary>View data as table</summary>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Rate (%)</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.date}>
            <td>{row.date}</td>
            <td>{row.rate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </details>
</div>
```

## Generate Accessibility Report

```bash
# Install lighthouse CI
npm install -D @lhci/cli

# Run audit
npx lhci autorun --collect.url=http://localhost:3000
```

Generate report:
```bash
# Accessibility score
# Performance score
# Best practices score
# SEO score
```

## Success Criteria

- ✅ No critical axe-core violations
- ✅ All interactive elements keyboard accessible
- ✅ Screen reader announces content correctly
- ✅ Color contrast meets AA standards (AAA preferred)
- ✅ Touch targets meet 44x44px minimum
- ✅ Lighthouse accessibility score >95
- ✅ Manual testing with keyboard passes
- ✅ Manual testing with screen reader passes

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
