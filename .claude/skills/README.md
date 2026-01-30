# Claude Code Skills for BLS Dashboard

This directory contains project-specific Claude Code skills for the Economic Indicators Dashboard.

## Available Skills

### `/setup-shadcn`
Initialize shadcn/ui and Tailwind CSS in the project.

**When to use**: Setting up the modern component library and styling system.

**What it does**:
- Installs Tailwind CSS 4.x and dependencies
- Configures Tailwind for the project
- Initializes shadcn/ui with proper configuration
- Installs initial component set (button, card, dialog, etc.)
- Sets up path aliases and Vite config

**Usage**:
```bash
/setup-shadcn
```

---

### `/add-component`
Create a new React component with proper structure, TypeScript types, accessibility, and tests.

**When to use**: Creating any UI component.

**What it does**:
- Creates component file with proper TypeScript structure
- Implements accessibility best practices (WCAG 2.2)
- Adds test file with unit and accessibility tests
- Exports component properly
- Documents usage with JSDoc

**Usage**:
```bash
/add-component EconomicIndicatorCard
/add-component DataExportButton
```

---

### `/migrate-chart`
Migrate a Chart.js visualization to Recharts for better React integration.

**When to use**: Modernizing data visualizations from Chart.js to Recharts.

**What it does**:
- Analyzes existing Chart.js component
- Transforms data structure for Recharts
- Creates equivalent Recharts component
- Applies Federal Reserve styling
- Adds responsive behavior and dark mode support
- Implements accessibility features
- Updates tests

**Usage**:
```bash
/migrate-chart frontend/src/components/UnemploymentChart.tsx
/migrate-chart frontend/src/components/CPITrendChart.tsx
```

---

### `/check-a11y`
Run comprehensive accessibility audit on components and pages.

**When to use**: Checking WCAG 2.2 compliance.

**What it does**:
- Runs automated axe-core tests
- Performs keyboard navigation testing
- Checks screen reader compatibility
- Analyzes color contrast ratios
- Tests responsive and mobile accessibility
- Generates accessibility report
- Provides fixes for common issues

**Usage**:
```bash
/check-a11y                                    # Audit entire application
/check-a11y frontend/src/components/Chart.tsx # Audit specific component
```

---

### `/optimize-perf`
Analyze and optimize bundle size, Core Web Vitals, and overall performance.

**When to use**: Improving application speed and performance.

**What it does**:
- Analyzes bundle size with visualizations
- Profiles React component performance
- Runs Lighthouse audits
- Implements code splitting and lazy loading
- Optimizes images and assets
- Adds memoization and virtualization
- Generates performance report

**Usage**:
```bash
/optimize-perf
```

---

## Creating Custom Skills

To create a new project-specific skill:

1. **Create skill directory**:
   ```bash
   mkdir -p .claude/skills/my-skill
   ```

2. **Create `SKILL.md` with frontmatter**:
   ```yaml
   ---
   name: my-skill
   description: Brief description of when to use this skill
   allowed-tools: Read, Grep, Bash, Write, Edit
   argument-hint: [optional-argument]
   ---

   # Skill Instructions

   Detailed instructions for Claude when executing this skill...
   ```

3. **Use the skill**:
   - Direct invocation: `/my-skill`
   - Claude can invoke automatically based on context

## Skill Configuration Options

### YAML Frontmatter Fields

| Field | Type | Purpose |
|-------|------|---------|
| `name` | string | Display name for the skill |
| `description` | string | When to use (for auto-invocation) |
| `allowed-tools` | list | Tools allowed without permission |
| `disable-model-invocation` | boolean | Only user can invoke (not Claude) |
| `user-invocable` | boolean | User can invoke from menu |
| `argument-hint` | string | Hint for autocomplete |
| `model` | string | Model to use (sonnet/opus/haiku) |

### String Substitutions

- `$ARGUMENTS` - Arguments passed when invoking
- `${CLAUDE_SESSION_ID}` - Current session ID

## Best Practices

1. **Version Control**: Commit `.claude/skills/` to share with team
2. **Documentation**: Keep SKILL.md instructions clear and detailed
3. **Testing**: Test skills before committing
4. **Naming**: Use kebab-case for skill directories
5. **Scope**: Keep skills focused on a single task
6. **Examples**: Include examples in SKILL.md

## Resources

- [Claude Code Skills Documentation](https://docs.anthropic.com/claude-code/skills)
- [Workflow Agent Target Framework](../CLAUDE.md#workflow-agent-target-framework)
- [Modern UI/UX Best Practices](../CLAUDE.md#modern-uiux-best-practices-2026)
