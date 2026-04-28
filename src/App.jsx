import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WellProvider } from './context/WellContext.jsx';
import WellListPage from './pages/WellListPage.jsx';
import CreateWellPage from './pages/CreateWellPage.jsx';
import EditWellPage from './pages/EditWellPage.jsx';
import WellDetailPage from './pages/WellDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * App — root application component.
 *
 * Wraps the entire app in WellProvider (context) and BrowserRouter (routing).
 * Defines all application routes:
 * - / → WellListPage (main well list view)
 * - /wells/new → CreateWellPage (create new well form)
 * - /wells/create → CreateWellPage (alternate create route)
 * - /wells/:id → WellDetailPage (well detail view)
 * - /wells/:id/details → WellDetailPage (alternate detail route)
 * - /wells/:id/edit → EditWellPage (edit well form)
 * - * → NotFoundPage (404 catch-all)
 *
 * Applies global dark theme wrapper via className.
 *
 * @returns {React.ReactElement}
 */
function App() {
  return (
    <WellProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-surface-primary text-dark-100 antialiased">
          <Routes>
            <Route element={<WellListPage />} path="/" />
            <Route element={<CreateWellPage />} path="/wells/new" />
            <Route element={<CreateWellPage />} path="/wells/create" />
            <Route element={<WellDetailPage />} path="/wells/:id" />
            <Route element={<WellDetailPage />} path="/wells/:id/details" />
            <Route element={<EditWellPage />} path="/wells/:id/edit" />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
        </div>
      </BrowserRouter>
    </WellProvider>
  );
}

export default App;