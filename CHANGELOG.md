# Changelog

All notable changes to the Well Management project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-15

### Added

- **Well List Display** — Main table view showing all well records with columns for Status, Rig, Well Name, Well ID, Spud Date, Operator, Contractor, Country, Last Live, and Actions.
- **Single-Active Well Enforcement** — Business rule ensuring only one well per rig can be active at any time. Activating a new well on a rig automatically deactivates the previously active well.
- **Real-Time Filtering** — Inline text filters on Rig, Well Name, Well ID, Operator, Contractor, and Country columns with debounced input and AND logic across multiple filters.
- **Column Sorting** — Sortable Spud Date and Last Live columns with ascending/descending toggle and sort direction indicators. Active wells are always pinned to the top of the table.
- **Pagination Controls** — Configurable page size (10, 25, 50 rows), page navigation (First, Previous, numbered pages, Next, Last), and entry count display.
- **Create Well Flow** — Form page at `/wells/new` and `/wells/create` with validated inputs for all required well fields (Rig, Well Name, Well ID, Spud Date, Operator, Contractor, Country). Success toast notification on creation.
- **Edit Well Flow** — Form page at `/wells/:id/edit` pre-populated with existing well data. Collapsible Rig Setup and Well Setup sections. Only changed fields are persisted on save.
- **Activate Well Flow** — Confirmation modal triggered from the well list Activate button. Displays target well info and, when applicable, the currently active well that will be deactivated. Success toast notification on activation.
- **Well Detail Page** — Placeholder page at `/wells/:id` and `/wells/:id/details` for future well detail view implementation.
- **Status Badges** — Green animated badge for active wells with pulse indicator. Inactive wells display no badge.
- **Action Buttons** — Edit button visible for all wells, Activate button for inactive wells, View Details button for active wells.
- **Empty State** — Illustrated empty state with call-to-action when no wells exist in the system.
- **Toast Notifications** — Success (green) and error (red) toast notifications with auto-dismiss and manual close support.
- **localStorage Persistence** — All well data persisted to localStorage via the WellRepository service with automatic hydration from seed data on first load.
- **Seed Data** — 30 pre-populated well records across 15 rigs spanning multiple countries and operators for demonstration purposes.
- **Dark Mode UI** — Full dark theme implementation matching the Well.png design specification with custom color palette (surface, dark, well-green), custom shadows, and animations.
- **Responsive Layout** — Mobile-friendly layout with responsive header, horizontally scrollable table, and adaptive pagination controls.
- **404 Page** — Not Found page for unmatched routes with navigation back to the well list.
- **Context-Based State Management** — WellContext provider with useReducer for centralized well state, filtering, sorting, and pagination management.
- **Repository Pattern** — WellRepository service with subscriber notification pattern for reactive data updates across the application.
- **Well Lifecycle Manager** — Business logic layer handling well activation rules, input validation, and duplicate wellId detection.
- **Deployment Configuration** — Vercel deployment configuration with SPA rewrites for client-side routing support.
- **Comprehensive Test Suite** — Unit and integration tests for WellRepository, WellLifecycleManager, ActivationModal, WellListPage, and utility helpers using Vitest and React Testing Library.
- **ESLint Configuration** — Code quality rules for React, React Hooks, and React Refresh with project-specific globals and import sorting.
- **Tailwind CSS Configuration** — Custom theme extending colors, animations, spacing, typography, and shadows for the dark theme design system.