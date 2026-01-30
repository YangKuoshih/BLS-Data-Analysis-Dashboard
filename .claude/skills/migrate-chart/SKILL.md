---
name: migrate-chart
description: Migrate a Chart.js visualization to Recharts for better React integration. Use when modernizing data visualizations.
allowed-tools: Read, Grep, Write, Edit, Bash
argument-hint: <chart-component-path>
---

# Migrate Chart.js to Recharts

Migrate a Chart.js visualization to Recharts for better React integration and performance.

## Target Component

$ARGUMENTS

## Why Recharts?

- **Declarative**: React-native API (no imperative canvas manipulation)
- **Composable**: Components for every chart element
- **Responsive**: Built-in responsive containers
- **TypeScript**: First-class TypeScript support
- **Accessible**: Better accessibility than canvas-based charts
- **Performance**: Optimized for React rendering

## Migration Steps

1. **Read existing Chart.js component**
   - Identify chart type (Line, Bar, Pie, etc.)
   - Extract data structure
   - Note customizations (colors, tooltips, legends, axes)

2. **Install Recharts** (if not installed)
   ```bash
   cd frontend
   npm install recharts
   ```

3. **Map Chart.js chart types to Recharts**
   - Line Chart → `<LineChart>` + `<Line>`
   - Bar Chart → `<BarChart>` + `<Bar>`
   - Pie Chart → `<PieChart>` + `<Pie>`
   - Doughnut → `<PieChart>` with `innerRadius`
   - Scatter → `<ScatterChart>` + `<Scatter>`
   - Radar → `<RadarChart>` + `<Radar>`

4. **Transform data structure**
   - Chart.js: `{ labels: [...], datasets: [{data: [...], ...}] }`
   - Recharts: `[{name: '...', value1: ..., value2: ...}, ...]`

   Example transformation:
   ```typescript
   // Chart.js format
   const chartJsData = {
     labels: ['Jan', 'Feb', 'Mar'],
     datasets: [{ data: [10, 20, 15], label: 'Sales' }]
   }

   // Recharts format
   const rechartsData = [
     { name: 'Jan', sales: 10 },
     { name: 'Feb', sales: 20 },
     { name: 'Mar', sales: 15 }
   ]
   ```

5. **Create Recharts component**
   ```typescript
   import {
     LineChart, Line, XAxis, YAxis, CartesianGrid,
     Tooltip, Legend, ResponsiveContainer
   } from 'recharts'

   export const MyChart: FC<MyChartProps> = ({ data }) => {
     return (
       <ResponsiveContainer width="100%" height={400}>
         <LineChart data={data}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="name" />
           <YAxis />
           <Tooltip />
           <Legend />
           <Line type="monotone" dataKey="value" stroke="#8884d8" />
         </LineChart>
       </ResponsiveContainer>
     )
   }
   ```

6. **Customize for Federal Reserve styling**
   - Professional color palette (blues, grays)
   - Clean, minimal design
   - Clear labels and legends
   - Proper number formatting (currency, percentages)
   - Accessible tooltips

7. **Add responsive behavior**
   - Use `<ResponsiveContainer>` wrapper
   - Adjust margins for mobile
   - Hide/show elements based on screen size
   - Touch-friendly tooltips

8. **Implement dark mode support**
   - Use CSS variables for colors
   - Adjust grid and axis colors for dark theme
   - Test contrast ratios

9. **Add accessibility features**
   - Provide text alternative (table view)
   - Use semantic colors (not color-only differentiation)
   - Add ARIA labels
   - Keyboard navigation for tooltips

10. **Update tests**
    - Test with sample data
    - Test edge cases (empty data, single point)
    - Test responsive behavior
    - Test accessibility

11. **Performance optimization**
    - Memoize data transformations
    - Use `React.memo` for chart component
    - Debounce real-time updates
    - Virtualize large datasets if needed

## Chart Type Mapping

### Line Chart
```typescript
// Chart.js
<Line data={data} options={options} />

// Recharts
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={transformedData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

### Bar Chart
```typescript
// Recharts
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={transformedData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="value" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>
```

### Multi-line Chart
```typescript
// Recharts
<LineChart data={transformedData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="cpi" stroke="#8884d8" />
  <Line type="monotone" dataKey="ppi" stroke="#82ca9d" />
  <Line type="monotone" dataKey="unemployment" stroke="#ffc658" />
</LineChart>
```

## Federal Reserve Styling

```typescript
// Define color palette
const FED_COLORS = {
  primary: '#003d7a',      // Federal Reserve blue
  secondary: '#6c757d',    // Gray
  success: '#28a745',      // Green (positive indicators)
  warning: '#ffc107',      // Yellow (caution)
  danger: '#dc3545',       // Red (negative indicators)
  grid: '#e0e0e0',         // Light grid
}

// Custom tooltip
const CustomTooltip: FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Usage
<Tooltip content={<CustomTooltip />} />
```

## Success Criteria

- ✅ Chart renders with same data as before
- ✅ All customizations preserved (colors, labels, tooltips)
- ✅ Responsive on all screen sizes
- ✅ Dark mode support
- ✅ Accessibility features working
- ✅ Tests passing
- ✅ Performance is good (no lag on updates)
- ✅ Federal Reserve styling applied

## Notes

- Keep Chart.js component temporarily for comparison
- Test thoroughly before removing old code
- Update any documentation or comments
- Consider adding export to PNG/SVG functionality
