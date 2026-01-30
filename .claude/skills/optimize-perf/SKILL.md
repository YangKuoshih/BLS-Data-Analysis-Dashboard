---
name: optimize-perf
description: Analyze and optimize bundle size, Core Web Vitals, and overall performance. Use when improving application speed.
allowed-tools: Read, Bash, Grep, Write, Edit
---

# Performance Optimization

Analyze and optimize the Economic Indicators Dashboard for optimal performance.

## Performance Targets

### Core Web Vitals (Google)
- **LCP (Largest Contentful Paint)**: <2.5s (Good), <4s (Needs Improvement)
- **FID (First Input Delay)**: <100ms (Good), <300ms (Needs Improvement)
- **CLS (Cumulative Layout Shift)**: <0.1 (Good), <0.25 (Needs Improvement)
- **INP (Interaction to Next Paint)**: <200ms (Good), <500ms (Needs Improvement)

### Additional Metrics
- **FCP (First Contentful Paint)**: <1.8s
- **TTI (Time to Interactive)**: <3.0s
- **TBT (Total Blocking Time)**: <300ms
- **Speed Index**: <3.0s

### Bundle Size
- **Initial Bundle**: <500KB (gzipped)
- **Total Bundle**: <2MB (gzipped)
- **Per Route**: <200KB (gzipped)

### Lighthouse Score
- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >95
- **SEO**: >90

## Analysis Steps

### 1. Bundle Analysis

```bash
cd frontend
npm install -D rollup-plugin-visualizer
```

Add to `vite.config.ts`:
```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    })
  ]
})
```

Run build and analyze:
```bash
npm run build
# Opens stats.html with bundle visualization
```

### 2. Performance Profiling

```bash
# Install Lighthouse CI
npm install -D @lhci/cli

# Run Lighthouse
npx lhci autorun --collect.url=http://localhost:3000

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

### 3. React DevTools Profiler

1. Install React DevTools extension
2. Open DevTools > Profiler tab
3. Click "Record"
4. Interact with the app
5. Stop recording
6. Analyze flamegraph for slow components

## Optimization Techniques

### Code Splitting (Lazy Loading)

```typescript
// ❌ Bad - loads everything upfront
import DashboardPage from './pages/DashboardPage'
import IndicatorPage from './pages/IndicatorPage'
import ExportPage from './pages/ExportPage'

// ✅ Good - lazy load routes
import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const IndicatorPage = lazy(() => import('./pages/IndicatorPage'))
const ExportPage = lazy(() => import('./pages/ExportPage'))

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/indicator/:id" element={<IndicatorPage />} />
    <Route path="/export" element={<ExportPage />} />
  </Routes>
</Suspense>
```

### Component Optimization

```typescript
// ❌ Bad - re-renders unnecessarily
export const ChartComponent = ({ data }: Props) => {
  const processedData = data.map(item => ({
    ...item,
    formatted: formatValue(item.value)
  }))

  return <Chart data={processedData} />
}

// ✅ Good - memoize expensive operations
import { useMemo } from 'react'

export const ChartComponent = ({ data }: Props) => {
  const processedData = useMemo(() =>
    data.map(item => ({
      ...item,
      formatted: formatValue(item.value)
    })),
    [data]
  )

  return <Chart data={processedData} />
}

// ✅ Good - prevent unnecessary re-renders
import { memo } from 'react'

export const ChartComponent = memo(({ data }: Props) => {
  // component code
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if data changed
  return prevProps.data === nextProps.data
})
```

### Image Optimization

```typescript
// ❌ Bad - large unoptimized images
<img src="/logo.png" alt="Logo" />

// ✅ Good - optimized formats with fallbacks
<picture>
  <source srcSet="/logo.avif" type="image/avif" />
  <source srcSet="/logo.webp" type="image/webp" />
  <img src="/logo.png" alt="Logo" loading="lazy" />
</picture>

// ✅ Good - responsive images
<img
  srcSet="
    /chart-small.webp 400w,
    /chart-medium.webp 800w,
    /chart-large.webp 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  src="/chart-medium.webp"
  alt="Economic indicator chart"
  loading="lazy"
/>
```

### Tree Shaking & Dead Code Elimination

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash'
const result = _.uniq(array)

// ✅ Good - import only what you need
import uniq from 'lodash/uniq'
const result = uniq(array)

// ❌ Bad - imports all of date-fns
import { format } from 'date-fns'

// ✅ Good - imports specific function
import format from 'date-fns/format'
```

### Data Fetching Optimization

```typescript
// ✅ Good - use TanStack Query for caching
import { useQuery } from '@tanstack/react-query'

export const useIndicatorData = (id: string) => {
  return useQuery({
    queryKey: ['indicator', id],
    queryFn: () => fetchIndicator(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

// ✅ Good - prefetch next pages
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const prefetchNextIndicator = (nextId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['indicator', nextId],
    queryFn: () => fetchIndicator(nextId),
  })
}
```

### Virtual Scrolling for Large Lists

```typescript
// ❌ Bad - renders 10,000 items
{data.map(item => <ListItem key={item.id} {...item} />)}

// ✅ Good - virtualize list
import { useVirtualizer } from '@tanstack/react-virtual'

const parentRef = useRef<HTMLDivElement>(null)

const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // estimated row height
})

return (
  <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {virtualizer.getVirtualItems().map(virtualRow => (
        <div
          key={virtualRow.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <ListItem {...data[virtualRow.index]} />
        </div>
      ))}
    </div>
  </div>
)
```

### Debouncing & Throttling

```typescript
// ❌ Bad - fires on every keystroke
<input onChange={(e) => fetchResults(e.target.value)} />

// ✅ Good - debounce search
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const [query, setQuery] = useState('')
const debouncedQuery = useDebouncedValue(query, 300)

useEffect(() => {
  if (debouncedQuery) {
    fetchResults(debouncedQuery)
  }
}, [debouncedQuery])

<input onChange={(e) => setQuery(e.target.value)} />
```

### Font Optimization

```html
<!-- ❌ Bad - blocking fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

<!-- ✅ Good - preconnect and font-display -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

<!-- ✅ Better - self-host fonts -->
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
}
```

### Critical CSS Inlining

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inline-critical-css',
      transformIndexHtml(html) {
        // Inline critical CSS for above-the-fold content
        return html
      }
    }
  ]
})
```

## Performance Checklist

### Build Optimization
- [ ] Enable production mode (`NODE_ENV=production`)
- [ ] Minification enabled
- [ ] Tree shaking configured
- [ ] Source maps disabled (or external)
- [ ] Compression enabled (gzip/brotli)

### Code Optimization
- [ ] Lazy load routes with React.lazy()
- [ ] Memoize expensive computations with useMemo
- [ ] Prevent unnecessary re-renders with React.memo
- [ ] Use React.lazy() for heavy components
- [ ] Debounce/throttle frequent updates
- [ ] Virtualize long lists

### Asset Optimization
- [ ] Images optimized (WebP/AVIF)
- [ ] Lazy load images below fold
- [ ] Use responsive images (srcset)
- [ ] Self-host fonts or use font-display: swap
- [ ] Minimize third-party scripts

### Data Optimization
- [ ] API responses cached (TanStack Query)
- [ ] Paginate large datasets
- [ ] Implement infinite scroll/virtual scrolling
- [ ] Prefetch next page data
- [ ] Use stale-while-revalidate strategy

### Runtime Optimization
- [ ] Avoid blocking main thread
- [ ] Use Web Workers for heavy computations
- [ ] Implement request cancellation
- [ ] Use requestIdleCallback for non-critical work

## Generate Performance Report

```bash
# Run Lighthouse
npm run lighthouse

# Analyze bundle
npm run build
npm run analyze

# Profile React components
# Open React DevTools > Profiler
# Record interactions
# Analyze flamegraph
```

## Success Criteria

- ✅ Lighthouse Performance score >90
- ✅ LCP <2.5s
- ✅ FID <100ms
- ✅ CLS <0.1
- ✅ Initial bundle <500KB gzipped
- ✅ Time to Interactive <3s
- ✅ No long tasks >50ms
- ✅ No unnecessary re-renders

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [Bundle Analyzer](https://github.com/btd/rollup-plugin-visualizer)
