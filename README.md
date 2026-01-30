# Economic Indicators Dashboard

A modern web application designed for Federal Reserve economists to monitor key economic indicators using Bureau of Labor Statistics (BLS) API data. The system provides real-time access to critical economic data, interactive visualizations, and data export capabilities to support monetary policy decision-making.

## Features

- **Real-time Economic Data**: Integration with BLS API v1.0 and v2.0 for current economic indicators
- **Interactive Visualizations**: Professional charts and graphs for data analysis
- **Historical Data Comparison**: Compare current indicators with historical trends
- **Data Export**: Export data in CSV and Excel formats
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Optimized**: Fast loading and responsive user interface

## Economic Indicators

The dashboard provides access to key economic indicators including:

- Consumer Price Index (CPI) - All Items and Core
- Producer Price Index (PPI) - Final Demand
- Unemployment Rate
- Total Nonfarm Employment
- Labor Force Participation Rate
- Average Hourly Earnings

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Chart.js** for data visualization
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API communication

### Backend
- **Node.js** with Express and TypeScript
- **Winston** for logging
- **Node-cron** for scheduled updates
- **Helmet** for security
- **Rate limiting** for API protection

### Testing
- **Jest** for unit testing
- **Fast-check** for property-based testing
- **React Testing Library** for component testing
- **Supertest** for API testing

## Project Structure

```
fed-economic-dashboard/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API service layer
│   ├── public/             # Static assets
│   └── dist/               # Production build
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── logs/               # Application logs
│   └── dist/               # Production build
└── docs/                    # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- BLS API key (optional, for enhanced features)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fed-economic-dashboard
   ```

2. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   - Add your BLS API key (optional)
   - Adjust other settings as needed

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or start them individually:
```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend (http://localhost:3001)
npm run dev:backend
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Building for Production

Build both frontend and backend:
```bash
npm run build
```

### Code Quality

Format code:
```bash
npm run format
```

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## API Documentation

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system information

### Economic Indicators
- `GET /api/indicators` - Get all available indicators
- `GET /api/indicators/:id` - Get specific indicator details
- `GET /api/indicators/:id/data` - Get series data for indicator
- `GET /api/indicators/:id/latest` - Get latest data point

### Data Export
- `POST /api/export` - Create export job
- `GET /api/export/:jobId` - Get export job status
- `GET /api/export/:jobId/download` - Download export file

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BLS_API_KEY` | BLS API key for enhanced features | - |
| `BLS_API_BASE_URL` | BLS API base URL | `https://api.bls.gov/publicAPI` |
| `BLS_API_VERSION` | BLS API version (v1 or v2) | `v2` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CACHE_TTL_MINUTES` | Cache time-to-live in minutes | `60` |
| `LOG_LEVEL` | Logging level | `info` |

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please contact the Federal Reserve Economic Analysis Team.