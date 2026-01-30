---
name: setup-shadcn
description: Initialize shadcn/ui and Tailwind CSS in the project. Use when setting up the modern component library and styling system.
allowed-tools: Read, Bash, Write, Edit
disable-model-invocation: false
---

# Setup shadcn/ui + Tailwind CSS

Initialize the modern component library and styling system for the Economic Indicators Dashboard.

## Steps

1. **Install Tailwind CSS and dependencies**
   ```bash
   cd frontend
   npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
   npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge
   npm install @radix-ui/react-icons
   ```

2. **Initialize Tailwind CSS**
   ```bash
   npx tailwindcss init -p
   ```

3. **Configure Tailwind** (`frontend/tailwind.config.js`)
   - Add content paths: `'./src/**/*.{ts,tsx}'`
   - Add theme extensions for shadcn/ui
   - Add plugins: `require('tailwindcss-animate')`

4. **Create utility functions** (`frontend/src/lib/utils.ts`)
   - Add `cn()` helper for className merging with tailwind-merge and clsx

5. **Initialize shadcn/ui**
   ```bash
   npx shadcn@latest init
   ```
   - Select TypeScript, React 19
   - Choose base color (slate for professional look)
   - Enable CSS variables
   - Configure paths:
     - components: `@/components`
     - utils: `@/lib/utils`

6. **Update global CSS** (`frontend/src/index.css`)
   - Add Tailwind directives
   - Add shadcn/ui CSS variables for light/dark themes

7. **Install initial components**
   ```bash
   npx shadcn@latest add button card dialog dropdown-menu sheet tabs
   ```

8. **Update Vite config** for path aliases
   - Add `@` alias pointing to `./src`

9. **Test setup**
   - Create a simple component using shadcn/ui Button
   - Verify Tailwind CSS is working
   - Check dark mode toggle

## Success Criteria

- ✅ Tailwind CSS compiles without errors
- ✅ shadcn/ui components render correctly
- ✅ Dark mode works (system preference + manual toggle)
- ✅ TypeScript path aliases resolve (`@/components`)
- ✅ Dev server runs without warnings

## Notes

- Keep existing styling during migration - remove old CSS incrementally
- Test accessibility features (keyboard navigation, screen readers)
- Document component usage in project README
