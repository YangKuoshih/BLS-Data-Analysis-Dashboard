---
name: add-component
description: Create a new React component with proper structure, TypeScript types, accessibility, and tests. Use when creating UI components.
allowed-tools: Read, Grep, Write, Bash
argument-hint: <component-name>
---

# Create New React Component

Create a new React component following best practices for the Economic Indicators Dashboard.

## Component Name

$ARGUMENTS

## Steps

1. **Determine component type and location**
   - **UI Component** (atoms/molecules): `frontend/src/components/ui/`
   - **Feature Component** (organisms): `frontend/src/components/features/`
   - **Layout Component**: `frontend/src/components/layout/`
   - **Page Component**: `frontend/src/pages/`

2. **Create component file** with proper structure:
   ```typescript
   // PascalCase naming, e.g., EconomicIndicatorCard.tsx
   import { FC } from 'react'

   interface ComponentNameProps {
     // Props with JSDoc comments
   }

   export const ComponentName: FC<ComponentNameProps> = ({ ...props }) => {
     return (
       <div>
         {/* Component JSX */}
       </div>
     )
   }
   ```

3. **Implement accessibility**
   - Use semantic HTML elements
   - Add ARIA labels where needed
   - Ensure keyboard navigation
   - Test with screen readers
   - Minimum touch target: 44x44px

4. **Add TypeScript types**
   - Export prop interfaces
   - No `any` types
   - Use `React.FC` or explicit return types
   - Document complex types with JSDoc

5. **Create test file** (`ComponentName.test.tsx`)
   - Test rendering with different props
   - Test user interactions (click, keyboard)
   - Test accessibility (axe-core)
   - Test responsive behavior

6. **Add to index.ts** for clean exports
   ```typescript
   export { ComponentName } from './ComponentName'
   export type { ComponentNameProps } from './ComponentName'
   ```

7. **Document usage**
   - Add JSDoc comments with examples
   - Include prop descriptions
   - Note accessibility considerations

## Best Practices

### Styling
- Use Tailwind CSS utility classes
- Use shadcn/ui components as building blocks
- Responsive: mobile-first approach
- Dark mode: use Tailwind's `dark:` prefix

### Performance
- Lazy load heavy components
- Memoize expensive computations
- Use React.memo for pure components
- Optimize re-renders

### Accessibility
- WCAG 2.2 Level AA minimum (AAA target)
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader friendly (ARIA labels, roles)
- Color contrast: 4.5:1 minimum (7:1 for AAA)
- Focus indicators visible

### Component Composition
- Single Responsibility Principle
- Reusable and composable
- Props over context when possible
- Controlled vs uncontrolled patterns

## Component Template (shadcn/ui style)

```typescript
import { FC, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'variant-classes',
        secondary: 'variant-classes',
      },
      size: {
        default: 'size-classes',
        sm: 'size-classes',
        lg: 'size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ComponentNameProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Additional props here
}

export const ComponentName: FC<ComponentNameProps> = ({
  className,
  variant,
  size,
  ...props
}) => {
  return (
    <div
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}

ComponentName.displayName = 'ComponentName'
```

## Success Criteria

- ✅ Component renders without errors
- ✅ TypeScript types are correct
- ✅ Tests pass (unit + accessibility)
- ✅ Accessibility audit passes (axe-core)
- ✅ Works in light and dark mode
- ✅ Responsive on mobile, tablet, desktop
- ✅ Properly exported from index
