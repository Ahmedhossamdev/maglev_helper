# OneBusAway API Comparison Tool

A clean, minimalist SvelteKit application for comparing OneBusAway API responses between two servers in real-time.

## Features

- **Real-time Comparison**: Fetch and compare API responses from two different OneBusAway servers simultaneously
- **Auto-refresh**: Configurable auto-refresh with custom intervals (1-60 seconds)
- **All Endpoints Supported**: Includes all major OneBusAway API endpoints
- **Visual Diff Highlighting**: Color-coded differences between responses
  - Yellow: Different values
  - Red: Missing in Server 2
  - Green: Added in Server 1

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
pnpm install
```

### Linting & Formatting

Run the linter:

```bash
pnpm run lint
```

Format code (fixes formatting issues and organizes imports):

```bash
pnpm run format
```

### Development

Start the development server:

```bash
pnpm run dev

# or open in browser
pnpm run dev -- --open
```

The app will be available at `http://localhost:5173`

## Usage

1. **Configure Servers**: Enter your server URLs
   - Server 1 (Local): `http://localhost:4000/api/where/`
   - Server 2 (Remote): `https://unitrans-api.server.onebusawaycloud.com/api/where/`

2. **Select Endpoint**: Choose from available OneBusAway API endpoints
   - Trip Details
   - Stops for Route
   - Arrivals and Departures
   - And more...

3. **Enter Parameters**: Fill in required parameters (e.g., Trip ID, Stop ID, API Key)

4. **Fetch & Compare**:
   - Click "Fetch Now" for immediate comparison
   - Enable "Auto-refresh" for continuous monitoring

5. **View Differences**: Side-by-side comparison with color-coded differences

## Tech Stack

- **SvelteKit** - Modern web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Svelte 5 Runes** - Reactive state management

## Building for Production

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```
