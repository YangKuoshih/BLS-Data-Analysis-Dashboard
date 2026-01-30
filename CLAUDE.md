# CLAUDE.md - Project Context for Claude Code

## Project Overview

This is the **Economic Indicators Dashboard** - a web application for Federal Reserve economists to monitor key economic indicators using Bureau of Labor Statistics (BLS) API data. The system provides real-time access to critical economic data, interactive visualizations, and data export capabilities.

## Workflow Agent Target Framework

This project uses the **Workflow Agent Target Framework** for AI-assisted development:

### Collaborative Development Model
- **Primary Agent**: Claude Code (you) - orchestrates development, planning, and execution
- **Specialized Agents**: Task-specific agents for exploration, planning, and implementation
- **Human-in-the-Loop**: User approval for architectural decisions and major changes

### Workflow Principles
1. **Plan Before Execute**: Use plan mode for non-trivial features to align on approach
2. **Incremental Progress**: Break complex tasks into manageable, testable increments
3. **Context Preservation**: Maintain conversation context for efficient collaboration
4. **Automated Quality**: Hooks for linting, formatting, and testing on file changes
5. **Spec-Driven**: Follow specifications in `.kiro/specs/` for requirements and design

### Agent Collaboration Patterns
- **Explore Agent**: Use for codebase discovery and understanding architecture
- **Plan Agent**: Use for designing implementation strategies before coding
- **Bash Agent**: Use for git operations, npm commands, and terminal tasks
- **Parallel Execution**: Run independent tasks concurrently for efficiency

## Architecture

```
fed-economic-dashboard/
├── frontend/          # React 19 + TypeScript + Vite 6
├── backend/           # Express + TypeScript + Node.js
├── .kiro/specs/       # Feature specifications and task tracking
└── docs/              # Documentation
```

## Tech Stack (Latest Stable - January 2026)

### Frontend (port 3000)
**Core Framework**
- React 19.x with TypeScript 5.7+
- Vite 6.x for blazing-fast bundling and HMR
- React Router v7 for routing

**UI/UX Libraries**
- **Component Library**: shadcn/ui (Radix UI primitives) - accessible, customizable, modern
- **Styling**: Tailwind CSS 4.x - utility-first, zero-runtime
- **Icons**: Lucide React - consistent, tree-shakeable icons
- **Animations**: Framer Motion 12.x - production-ready animations
- **Forms**: React Hook Form 7.x + Zod for validation

**Data Visualization**
- **Primary**: Recharts 2.x - declarative, React-native charts
- **Alternative**: D3.js 7.x for custom visualizations
- **Real-time**: Lightweight-charts for financial data

**State Management**
- **Server State**: TanStack Query v5 (React Query) - server state, caching, sync
- **Client State**: Zustand 4.x - minimal, fast global state
- **Form State**: React Hook Form - performant form management

**Data Fetching & API**
- TanStack Query v5 for data fetching, caching, background updates
- Axios 1.x for HTTP client
- WebSocket for real-time updates

**Testing**
- **Unit/Integration**: Vitest 2.x - Vite-native, Jest-compatible, faster
- **Component Testing**: Testing Library (React)
- **E2E**: Playwright 1.x - cross-browser testing
- **Visual Regression**: Chromatic or Percy

**Development Tools**
- ESLint 9.x with flat config
- Prettier 3.x
- TypeScript 5.7+ strict mode
- Biome (optional) - faster alternative to ESLint+Prettier

### Backend (port 3001)
- **Runtime**: Node.js 22 LTS with TypeScript
- **Framework**: Express 5.x with TypeScript
- **Logging**: Winston or Pino (structured logging)
- **Caching**: node-cache or Redis
- **Security**: Helmet 8.x, rate-limiting, CORS
- **Testing**: Vitest + Supertest
- **Validation**: Zod for runtime type checking

### DevOps & Tools
- **Package Manager**: pnpm 9.x (faster than npm)
- **Monorepo**: Built-in workspaces (already configured)
- **Git Hooks**: Husky 9.x + lint-staged
- **CI/CD**: GitHub Actions (recommended)
- **Container**: Docker with multi-stage builds

## Modern UI/UX Best Practices (2026)

### Design System
Use **shadcn/ui** as the foundation:
- Pre-built accessible components (Radix UI primitives)
- Customizable with Tailwind CSS
- Copy-paste components (not npm dependency)
- Dark mode support out of the box

### Accessibility (WCAG 2.2 AAA)
- Semantic HTML and ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios (minimum 4.5:1)
- Focus visible indicators
- Skip navigation links

### Performance Optimization
- **Code Splitting**: Lazy load routes and heavy components
- **Image Optimization**: WebP/AVIF with fallbacks
- **Bundle Analysis**: vite-bundle-visualizer
- **Lighthouse Score**: Target 95+ for Performance, Accessibility
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Virtual Scrolling**: @tanstack/react-virtual for large lists

### Responsive Design
- **Mobile-first**: Design for mobile, enhance for desktop
- **Breakpoints**: Tailwind's responsive utilities (sm, md, lg, xl, 2xl)
- **Fluid Typography**: clamp() for responsive font sizes
- **Container Queries**: For component-level responsiveness

### Data Visualization UX
- **Progressive Disclosure**: Show summary first, details on demand
- **Loading States**: Skeleton screens, not spinners
- **Empty States**: Helpful messages with actions
- **Error Boundaries**: Graceful error handling with recovery
- **Tooltips**: Context-sensitive help on hover/focus
- **Responsive Charts**: Adapt to screen size automatically

### Animation & Motion
- **Purposeful**: Animate to guide attention, not distract
- **Performance**: Use CSS transforms and opacity (GPU-accelerated)
- **Respect Preferences**: Honor `prefers-reduced-motion`
- **Timing**: 200-300ms for UI transitions, 400-600ms for page transitions

### Theming & Dark Mode
- **CSS Variables**: Define design tokens
- **System Preference**: Respect `prefers-color-scheme`
- **Manual Override**: Allow user to choose theme
- **Consistent Colors**: Use Tailwind's color palette

## Development Patterns for Modern UI/UX

### Design System Commands
```bash
# Install shadcn/ui components (after setup)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add chart

# Analyze bundle size
npm run analyze

# Run accessibility tests
npm run test:a11y

# Run Lighthouse audit
npm run lighthouse
```

### Component Development Pattern
1. **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
2. **Accessibility First**: Use Radix UI primitives (keyboard navigation, ARIA)
3. **Type Safety**: Strict TypeScript with explicit types, no `any`
4. **Prop Documentation**: JSDoc comments for IntelliSense
5. **Testing**: Unit tests (Vitest) + E2E (Playwright) + A11y (axe-core)

### Data Fetching Pattern (TanStack Query)
```typescript
// Modern data fetching with automatic caching and refetching
const { data, isLoading, error } = useQuery({
  queryKey: ['indicator', id],
  queryFn: () => fetchIndicator(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
})
```

## Claude Code Skills

This project uses **Claude Code skills** (slash commands) for specialized workflows. Skills are stored in `.claude/skills/` and can be invoked with `/skill-name` or automatically when Claude recognizes the context.

### Available Project Skills

After setup, the following skills will be available:

- `/setup-shadcn` - Initialize shadcn/ui + Tailwind CSS in the project
- `/add-component` - Create a new React component with proper structure
- `/migrate-chart` - Migrate Chart.js component to Recharts
- `/check-a11y` - Run accessibility audit on components
- `/optimize-perf` - Analyze and optimize bundle size and performance

### Creating Custom Skills

To create a project-specific skill:
```bash
mkdir -p .claude/skills/my-skill
```

Create `.claude/skills/my-skill/SKILL.md`:
```yaml
---
name: my-skill
description: Brief description of when to use this skill
allowed-tools: Read, Grep, Bash, Write, Edit
---

Instructions for Claude when executing this skill...
```

See `.claude/skills/` directory for examples.

## Key Commands

```bash
# Install all dependencies (use pnpm for faster installs)
npm run install:all

# Development (both frontend and backend)
npm run dev

# Individual services
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend on http://localhost:3001

# Testing
npm test                # Run all tests
npm run test:backend    # Backend tests only
npm run test:frontend   # Frontend tests only
npm run test:e2e        # End-to-end tests

# Build
npm run build

# Linting & Formatting
npm run lint
npm run format

# Type checking
npm run type-check

# Performance & Analytics
npm run analyze         # Bundle analysis
npm run lighthouse      # Performance audit
```

## API Endpoints

### Health
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system info

### Indicators
- `GET /api/indicators` - List all indicators
- `GET /api/indicators/:id` - Get indicator details
- `GET /api/indicators/:id/data` - Get series data (supports `?refresh=true` to bypass cache)
- `GET /api/indicators/:id/latest` - Get latest data point
- `POST /api/indicators/:id/invalidate` - Invalidate cache for indicator
- `GET /api/indicators/cache/stats` - Cache statistics

### Export
- `POST /api/export` - Create export job
- `GET /api/export/:jobId` - Get export status
- `GET /api/export/:jobId/download` - Download file

## Economic Indicators (BLS Series IDs)

| Indicator | Series ID |
|-----------|-----------|
| CPI All Items | CUUR0000SA0 |
| CPI Core | CUUR0000SA0L1E |
| PPI Final Demand | WPUFD49207 |
| Unemployment Rate | LNS14000000 |
| Total Nonfarm Employment | CES0000000001 |
| Labor Force Participation | LNS11300000 |
| Average Hourly Earnings | CES0500000003 |

## Environment Variables

Create `.env` from `.env.example`:
- `BLS_API_KEY` - Optional, enables v2 API features
- `BLS_API_VERSION` - v1 or v2 (default: v2)
- `PORT` - Backend port (default: 3001)
- `CACHE_TTL_MINUTES` - Cache TTL (default: 60)
- `NODE_ENV` - development/production
- `VITE_API_BASE_URL` - Frontend API base URL

## Current Implementation Status

### Completed
- ✅ Project setup with TypeScript, Vite, ESLint, Prettier
- ✅ BLS API client with v1/v2 support, fallback, retry logic
- ✅ Property-based tests for API client
- ✅ Backend routes connected to BLS API
- ✅ CacheManager service with TTL, stats, invalidation
- ✅ Cache integration with API routes

### Planned Upgrades (Modern Stack)
- 🎨 Migrate to shadcn/ui + Tailwind CSS for modern component library
- 📊 Replace Chart.js with Recharts for better React integration
- 🔄 Upgrade to TanStack Query v5 from React Query v3
- ⚡ Migrate from Jest to Vitest for faster testing
- 🎭 Add Playwright for E2E testing
- 🌙 Implement dark mode with system preference detection
- ♿ Enhance accessibility to WCAG 2.2 AAA standards
- 🎬 Add Framer Motion for smooth, purposeful animations
- 📱 Improve responsive design with mobile-first approach

### In Progress
- 🔄 Frontend data integration (Task 4)

### Pending
- ⏳ React Query hooks for data fetching
- ⏳ Modern visualizations with Recharts
- ⏳ Export functionality
- ⏳ Real-time updates with WebSocket
- ⏳ Responsive design optimizations

## Spec-Driven Development

This project uses spec-driven development. Specs are in `.kiro/specs/fed-economic-dashboard/`:
- `requirements.md` - User stories and acceptance criteria
- `design.md` - Architecture, components, data models, correctness properties
- `tasks.md` - Implementation task list with status tracking

**Workflow**: Read specs → Plan approach → Implement → Test → Iterate

## Testing Strategy

### Unit & Integration Tests (Vitest)
- Fast, Vite-native testing
- Component tests with Testing Library
- Hook tests with `@testing-library/react-hooks`

### Property-Based Tests (fast-check)
- Validate universal correctness properties
- Test edge cases automatically
- Current coverage: API client, cache manager

### E2E Tests (Playwright)
- Critical user journeys
- Cross-browser testing (Chrome, Firefox, Safari)
- Visual regression testing

### Accessibility Tests
- axe-core integration
- Keyboard navigation tests
- Screen reader compatibility

Property tests validate:
1. Complete Economic Data Loading
2. API Fallback Mechanism
3. Error Handling and Logging

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use `type` for object types, `interface` for extensibility

### React
- Functional components with hooks (no class components)
- Custom hooks for reusable logic
- Prop destructuring in component signatures
- Use `React.FC` for component types

### File Naming
- Components: PascalCase (e.g., `DashboardPage.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Types: PascalCase (e.g., `IndicatorData`)

### Import Order
1. External libraries (react, axios, etc.)
2. Internal modules (components, utils)
3. Types
4. Styles

### Error Handling
- Use error boundaries for React components
- Comprehensive logging with Winston/Pino
- User-friendly error messages
- Graceful degradation

## Key Files

### Backend
- `backend/src/services/blsApiClient.ts` - BLS API integration
- `backend/src/services/cacheManager.ts` - Caching service
- `backend/src/routes/indicators.ts` - Indicator API routes
- `backend/src/types/index.ts` - TypeScript interfaces

### Frontend
- `frontend/src/pages/DashboardPage.tsx` - Main dashboard
- `frontend/src/pages/IndicatorPage.tsx` - Individual indicator view
- `frontend/src/pages/ExportPage.tsx` - Data export
- `frontend/src/types/index.ts` - TypeScript interfaces
- `frontend/src/components/ui/` - shadcn/ui components (after migration)

## Development Guidelines

### Before Starting Work
1. Read relevant specs in `.kiro/specs/`
2. Use Explore agent to understand related code
3. For non-trivial features, use Plan mode to align on approach
4. Check existing components before creating new ones

### During Development
1. Write tests first (TDD) or alongside code
2. Ensure TypeScript strict mode compliance
3. Run linting and formatting before committing
4. Test accessibility with keyboard navigation
5. Test responsive design on multiple screen sizes

### Before Committing
1. Run `npm run lint` and fix issues
2. Run `npm test` and ensure all tests pass
3. Run `npm run type-check` for TypeScript errors
4. Review changes for accessibility and performance
5. Update documentation if needed

## Performance Targets

- **Initial Load**: <2s (Lighthouse Performance >90)
- **Time to Interactive**: <3s
- **Indicator Switch**: <500ms
- **Chart Render**: <1s
- **Bundle Size**: <500KB initial, <2MB total
- **Lighthouse Scores**: 95+ for Performance, Accessibility, Best Practices, SEO

## Accessibility Requirements

- **WCAG 2.2 Level AA** (minimum)
- Target: **Level AAA** where feasible
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels, semantic HTML)
- Color contrast minimum 4.5:1 (7:1 for AAA)
- Focus indicators visible
- No keyboard traps
- Responsive text sizing

## Notes for Development

1. **BLS API**: Rate limits apply - backend implements caching and retry logic
2. **Caching Strategy**: Cache-first with stale fallback on API errors
3. **Design Guidelines**: Professional, clean, Federal Reserve appropriate
4. **Accessibility**: WCAG 2.2 AA compliance is mandatory
5. **Performance**: Monitor Core Web Vitals and Lighthouse scores
6. **Browser Support**: Modern browsers (last 2 versions + Safari 14+)
7. **Mobile**: Touch-friendly targets (min 44x44px), mobile-first design

## Useful Resources

### Documentation
- [React 19 Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [Radix UI](https://www.radix-ui.com)

### Tools
- [Vite](https://vitejs.dev)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
