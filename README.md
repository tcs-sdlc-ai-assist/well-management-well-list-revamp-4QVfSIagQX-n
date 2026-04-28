# Well Management

A modern well management application built with React, Vite, and Tailwind CSS. Manage drilling well records, track active/inactive well status per rig, and enforce single-active-well-per-rig business rules — all within a sleek dark-themed UI.

## Tech Stack

- **React 18** — Component-based UI with hooks and context-based state management
- **Vite 5** — Fast development server and optimized production builds
- **Tailwind CSS 3** — Utility-first CSS framework with custom dark theme
- **React Router 6** — Client-side routing with SPA support
- **Vitest** — Unit and integration testing framework
- **React Testing Library** — Component testing with user-centric queries
- **localStorage** — Client-side data persistence via the Repository pattern

## Features

- **Well List Display** — Sortable, filterable table showing all well records with columns for Status, Rig, Well Name, Well ID, Spud Date, Operator, Contractor, Country, Last Live, and Actions.
- **Single-Active Well Enforcement** — Only one well per rig can be active at any time. Activating a new well on a rig automatically deactivates the previously active well.
- **Real-Time Filtering** — Inline text filters on Rig, Well Name, Well ID, Operator, Contractor, and Country columns with debounced input and AND logic across multiple filters.
- **Column Sorting** — Sortable Spud Date and Last Live columns with ascending/descending toggle and sort direction indicators. Active wells are always pinned to the top of the table.
- **Pagination Controls** — Configurable page size (10, 25, 50 rows), page navigation (First, Previous, numbered pages, Next, Last), and entry count display.
- **Create Well Flow** — Form page with validated inputs for all required well fields. Success toast notification on creation.
- **Edit Well Flow** — Form page pre-populated with existing well data. Collapsible Rig Setup and Well Setup sections. Only changed fields are persisted on save.
- **Activate Well Flow** — Confirmation modal displaying target well info and, when applicable, the currently active well that will be deactivated. Success toast notification on activation.
- **Well Detail Page** — Placeholder page for future well detail view implementation.
- **Status Badges** — Green animated badge with pulse indicator for active wells.
- **Action Buttons** — Edit button for all wells, Activate button for inactive wells, View Details button for active wells.
- **Empty State** — Illustrated empty state with call-to-action when no wells exist.
- **Toast Notifications** — Success (green) and error (red) toast notifications with auto-dismiss and manual close.
- **Dark Mode UI** — Full dark theme with custom color palette, shadows, and animations.
- **Responsive Layout** — Mobile-friendly layout with responsive header, horizontally scrollable table, and adaptive pagination controls.
- **404 Page** — Not Found page for unmatched routes with navigation back to the well list.
- **Seed Data** — 30 pre-populated well records across 15 rigs spanning multiple countries and operators.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd well-management

# Install dependencies
npm install
```

### Development

```bash
# Start the development server on http://localhost:3000
npm run dev
```

### Build

```bash
# Create an optimized production build in the dist/ directory
npm run build

# Preview the production build locally
npm run preview
```

### Testing

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Run ESLint across the project
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and update values as needed.

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_TITLE` | Application title displayed in the browser tab and header | `Well Management` |

Environment variables are accessed via `import.meta.env.VITE_*` in the application code.

## Folder Structure

```
well-management/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── vitest.config.js              # Vitest test configuration
├── tailwind.config.js            # Tailwind CSS theme and plugins
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint flat configuration
├── vercel.json                   # Vercel deployment configuration
├── .env.example                  # Environment variable template
├── public/
│   └── vite.svg                  # Favicon
└── src/
    ├── main.jsx                  # Application entry point
    ├── App.jsx                   # Root component with routing
    ├── index.css                 # Global styles and Tailwind directives
    ├── setupTests.js             # Test setup (jest-dom matchers)
    ├── vitest.setup.js           # Vitest setup file
    ├── components/
    │   ├── ActionCell.jsx        # Row action buttons (Edit, Activate, View Details)
    │   ├── ActivationModal.jsx   # Well activation confirmation dialog
    │   ├── EmptyState.jsx        # Empty state illustration and CTA
    │   ├── PaginationControls.jsx# Table pagination UI
    │   ├── StatusBadge.jsx       # Active/Idle status indicator badge
    │   ├── TableHeaderFilters.jsx# Inline column filter inputs
    │   ├── Toast.jsx             # Toast notification container and items
    │   ├── WellEditForm.jsx      # Edit well form with collapsible sections
    │   ├── WellListHeader.jsx    # Page header with action buttons
    │   ├── WellSetupForm.jsx     # Create new well form
    │   ├── WellTable.jsx         # Main well list table with sorting and filtering
    │   └── __tests__/
    │       └── ActivationModal.test.jsx
    ├── context/
    │   └── WellContext.jsx       # Global well state provider (useReducer + Context)
    ├── data/
    │   └── seedData.js           # 30 pre-populated well records
    ├── hooks/
    │   ├── usePagination.js      # Pagination logic hook
    │   └── useWellContext.js     # Re-export of useWellContext hook
    ├── pages/
    │   ├── CreateWellPage.jsx    # Create well page wrapper
    │   ├── EditWellPage.jsx      # Edit well page wrapper
    │   ├── NotFoundPage.jsx      # 404 page
    │   ├── WellDetailPage.jsx    # Well detail placeholder page
    │   ├── WellListPage.jsx      # Main well list page
    │   └── __tests__/
    │       └── WellListPage.test.jsx
    ├── services/
    │   ├── wellLifecycleManager.js  # Business logic for well activation rules
    │   ├── wellRepository.js        # localStorage persistence adapter
    │   └── __tests__/
    │       ├── wellLifecycleManager.test.js
    │       └── wellRepository.test.js
    └── utils/
        ├── constants.js          # Application-wide constants
        ├── helpers.js            # Shared utility functions
        └── __tests__/
            └── helpers.test.js
```

## Usage Guide

### Viewing Wells

Navigate to the root URL (`/`) to see the well list table. All wells are displayed with their status, rig assignment, and key metadata. Active wells are pinned to the top of the table and highlighted with a green left border and an animated status badge.

### Filtering Wells

Use the inline filter inputs below the column headers to search by Rig, Well Name, Well ID, Operator, Contractor, or Country. Filters are applied in real-time with debounced input. Multiple filters use AND logic — only wells matching all active filters are displayed.

### Sorting Wells

Click the **Spud Date** or **Last Live** column headers to toggle between ascending and descending sort order. A sort direction indicator appears next to the active sort column. Active wells always remain pinned to the top regardless of sort order.

### Creating a Well

1. Click the **Create New Well** button in the page header.
2. Fill in all required fields: Rig, Well Name, Well ID, Spud Date, Operator, Contractor, and Country.
3. Click **Create Well** to save. A success toast notification confirms creation.
4. You are redirected back to the well list.

### Editing a Well

1. Click the **Edit** (pencil icon) button on any well row.
2. Modify the desired fields. The form has collapsible **Rig Setup** and **Well Setup** sections.
3. Click **Save Changes** to persist only the changed fields. A success toast confirms the update.
4. You are redirected back to the well list.

### Activating a Well

1. Click the **Activate** button on any inactive well row.
2. A confirmation modal appears showing the target well information.
   - If another well on the same rig is currently active, the modal also displays which well will be deactivated.
   - If no well is active on the rig, the modal confirms a simple activation.
3. Click **Confirm Activation** to proceed. A success toast confirms the activation (and deactivation, if applicable).

### Pagination

Use the pagination controls at the bottom of the table to navigate between pages. Select a page size (10, 25, or 50 rows) from the dropdown. Use the First, Previous, Next, and Last buttons or click a specific page number to navigate.

## Architecture

### State Management

The application uses React Context with `useReducer` for centralized state management. The `WellProvider` component wraps the entire app and provides well data, filtering, sorting, and pagination state to all child components via the `useWellContext` hook.

### Repository Pattern

`WellRepository` implements the Repository pattern with localStorage as the persistence layer. It provides CRUD operations, subscriber notification for reactive updates, and automatic hydration from seed data on first load.

### Business Logic Layer

`WellLifecycleManager` encapsulates business rules for well activation, including the single-active-well-per-rig constraint, input validation, and duplicate well ID detection. It operates on top of the repository layer.

### Data Flow

```
UI Components → WellContext (useReducer) → WellLifecycleManager → WellRepository → localStorage
```

## Deployment

### Vercel

The project includes a `vercel.json` configuration file with SPA rewrites for client-side routing support. To deploy:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in [Vercel](https://vercel.com/).
3. Vercel auto-detects the Vite framework and applies the correct build settings.
4. Set any required environment variables in the Vercel dashboard.
5. Deploy.

Alternatively, deploy via the Vercel CLI:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy
vercel
```

### Manual Deployment

Build the project and serve the `dist/` directory with any static file server:

```bash
npm run build
npx serve dist
```

Ensure your server is configured to redirect all routes to `index.html` for client-side routing support.

## License

This project is **Private** and proprietary. All rights reserved. Unauthorized copying, distribution, or modification of this software is strictly prohibited.