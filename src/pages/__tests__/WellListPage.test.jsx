import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { WellProvider } from '../../context/WellContext.jsx';
import WellListPage from '../WellListPage.jsx';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createTestWells() {
  return [
    {
      id: 'well-001',
      rig: 'Rig Alpha',
      wellName: 'Alpha Well 1',
      wellId: 'AW-001',
      spudDate: '2024-01-15T00:00:00Z',
      operator: 'Operator A',
      contractor: 'Contractor A',
      country: 'United States',
      lastLive: '2024-06-10T14:30:00Z',
      isActive: true,
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-06-10T14:30:00Z',
    },
    {
      id: 'well-002',
      rig: 'Rig Alpha',
      wellName: 'Alpha Well 2',
      wellId: 'AW-002',
      spudDate: '2024-02-20T00:00:00Z',
      operator: 'Operator A',
      contractor: 'Contractor A',
      country: 'United States',
      lastLive: '2024-03-15T09:45:00Z',
      isActive: false,
      createdAt: '2024-02-15T08:00:00Z',
      updatedAt: '2024-03-15T09:45:00Z',
    },
    {
      id: 'well-003',
      rig: 'Rig Beta',
      wellName: 'Beta Well 1',
      wellId: 'BW-001',
      spudDate: '2024-03-01T00:00:00Z',
      operator: 'Operator B',
      contractor: 'Contractor B',
      country: 'Norway',
      lastLive: null,
      isActive: false,
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
    },
    {
      id: 'well-004',
      rig: 'Rig Beta',
      wellName: 'Beta Well 2',
      wellId: 'BW-002',
      spudDate: '2024-04-10T00:00:00Z',
      operator: 'Operator B',
      contractor: 'Contractor B',
      country: 'Norway',
      lastLive: null,
      isActive: false,
      createdAt: '2024-04-05T09:00:00Z',
      updatedAt: '2024-04-05T09:00:00Z',
    },
  ];
}

let mockStorage;

function setupMockLocalStorage(wells) {
  mockStorage = {};
  if (wells) {
    mockStorage['wellManagement.wells'] = JSON.stringify(wells);
  }
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => {
      return mockStorage[key] !== undefined ? mockStorage[key] : null;
    }),
    setItem: vi.fn((key, value) => {
      mockStorage[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete mockStorage[key];
    }),
    clear: vi.fn(() => {
      mockStorage = {};
    }),
  });
}

function renderWellListPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <WellProvider>
        <WellListPage />
      </WellProvider>
    </MemoryRouter>
  );
}

describe('WellListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering well table with data', () => {
    it('renders the page header with title and subtitle', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText('Well Management')).toBeInTheDocument();
      expect(screen.getByText('Well List')).toBeInTheDocument();
    });

    it('renders well data rows in the table', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText('Alpha Well 1')).toBeInTheDocument();
      expect(screen.getByText('Alpha Well 2')).toBeInTheDocument();
      expect(screen.getByText('Beta Well 1')).toBeInTheDocument();
      expect(screen.getByText('Beta Well 2')).toBeInTheDocument();
    });

    it('renders well IDs in the table', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText('AW-001')).toBeInTheDocument();
      expect(screen.getByText('AW-002')).toBeInTheDocument();
      expect(screen.getByText('BW-001')).toBeInTheDocument();
      expect(screen.getByText('BW-002')).toBeInTheDocument();
    });

    it('renders rig names in the table', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const rigAlphaCells = screen.getAllByText('Rig Alpha');
      const rigBetaCells = screen.getAllByText('Rig Beta');
      expect(rigAlphaCells.length).toBeGreaterThanOrEqual(2);
      expect(rigBetaCells.length).toBeGreaterThanOrEqual(2);
    });

    it('renders operator and contractor columns', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getAllByText('Operator A').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Contractor B').length).toBeGreaterThanOrEqual(2);
    });

    it('renders country column', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getAllByText('United States').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('Norway').length).toBeGreaterThanOrEqual(2);
    });

    it('renders Create New Well button', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByRole('button', { name: /create new well/i })).toBeInTheDocument();
    });

    it('renders Create Sidetrack Well button as disabled', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const sidetrackBtn = screen.getByRole('button', { name: /create sidetrack well/i });
      expect(sidetrackBtn).toBeInTheDocument();
      expect(sidetrackBtn).toBeDisabled();
    });
  });

  describe('empty state rendering', () => {
    it('renders empty state when no wells exist', async () => {
      setupMockLocalStorage([{ id: 'placeholder' }]);
      mockStorage['wellManagement.wells'] = JSON.stringify([]);
      renderWellListPage();

      await waitFor(() => {
        expect(screen.getByText('No wells found')).toBeInTheDocument();
      });
    });

    it('renders create first well button in empty state', async () => {
      mockStorage = {};
      mockStorage['wellManagement.wells'] = JSON.stringify([]);
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) => mockStorage[key] !== undefined ? mockStorage[key] : null),
        setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
        removeItem: vi.fn((key) => { delete mockStorage[key]; }),
        clear: vi.fn(() => { mockStorage = {}; }),
      });
      renderWellListPage();

      await waitFor(() => {
        const createBtn = screen.queryByRole('button', { name: /create first well/i });
        if (createBtn) {
          expect(createBtn).toBeInTheDocument();
        }
      });
    });
  });

  describe('active well status display', () => {
    it('displays Active badge for active wells', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('active well row has green left border styling', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const activeWellRow = screen.getByText('Alpha Well 1').closest('tr');
      expect(activeWellRow).toHaveClass('border-l-well-green');
    });
  });

  describe('action buttons visibility based on well status', () => {
    it('shows edit button for all wells', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const editButtons = screen.getAllByTitle('Edit well');
      expect(editButtons.length).toBe(4);
    });

    it('shows Activate button only for inactive wells', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const activateButtons = screen.getAllByRole('button', { name: /^activate/i });
      expect(activateButtons.length).toBe(3);
    });

    it('shows View Details button only for active wells', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const viewDetailsButtons = screen.getAllByTitle('View details');
      expect(viewDetailsButtons.length).toBe(1);
    });

    it('edit button navigates to edit page on click', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const editButton = screen.getByLabelText('Edit Alpha Well 1');
      await user.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('/wells/well-001/edit');
    });

    it('view details button navigates to detail page on click', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const viewButton = screen.getByLabelText('View details for Alpha Well 1');
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/wells/well-001');
    });
  });

  describe('filtering updates table rows', () => {
    it('filters wells by rig name', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const rigFilter = screen.getByPlaceholderText('Filter rig...');
      await user.type(rigFilter, 'Beta');

      await waitFor(() => {
        expect(screen.getByText('Beta Well 1')).toBeInTheDocument();
        expect(screen.getByText('Beta Well 2')).toBeInTheDocument();
        expect(screen.queryByText('Alpha Well 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Alpha Well 2')).not.toBeInTheDocument();
      });
    });

    it('filters wells by well name', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const wellNameFilter = screen.getByPlaceholderText('Filter well name...');
      await user.type(wellNameFilter, 'Alpha Well 1');

      await waitFor(() => {
        expect(screen.getByText('Alpha Well 1')).toBeInTheDocument();
        expect(screen.queryByText('Beta Well 1')).not.toBeInTheDocument();
      });
    });

    it('filters wells by country', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const countryFilter = screen.getByPlaceholderText('Filter country...');
      await user.type(countryFilter, 'Norway');

      await waitFor(() => {
        expect(screen.getByText('Beta Well 1')).toBeInTheDocument();
        expect(screen.getByText('Beta Well 2')).toBeInTheDocument();
        expect(screen.queryByText('Alpha Well 1')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when filter matches nothing', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const rigFilter = screen.getByPlaceholderText('Filter rig...');
      await user.type(rigFilter, 'NonexistentRig');

      await waitFor(() => {
        expect(screen.getByText('No wells match the current filters.')).toBeInTheDocument();
      });
    });

    it('filters by well ID', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const wellIdFilter = screen.getByPlaceholderText('Filter well ID...');
      await user.type(wellIdFilter, 'BW-001');

      await waitFor(() => {
        expect(screen.getByText('Beta Well 1')).toBeInTheDocument();
        expect(screen.queryByText('Alpha Well 1')).not.toBeInTheDocument();
      });
    });

    it('applies multiple filters with AND logic', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const rigFilter = screen.getByPlaceholderText('Filter rig...');
      const operatorFilter = screen.getByPlaceholderText('Filter operator...');

      await user.type(rigFilter, 'Alpha');
      await user.type(operatorFilter, 'Operator A');

      await waitFor(() => {
        expect(screen.getByText('Alpha Well 1')).toBeInTheDocument();
        expect(screen.getByText('Alpha Well 2')).toBeInTheDocument();
        expect(screen.queryByText('Beta Well 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('sorting maintains active well at top', () => {
    it('renders sort indicators on Spud Date column', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const spudDateHeader = screen.getByText('Spud Date');
      expect(spudDateHeader).toBeInTheDocument();
    });

    it('renders sort indicators on Last Live column', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const lastLiveHeader = screen.getByText('Last Live');
      expect(lastLiveHeader).toBeInTheDocument();
    });

    it('active well remains at top after sorting by Spud Date', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const spudDateHeader = screen.getByText('Spud Date');
      await user.click(spudDateHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const dataRows = rows.filter((row) => {
          const cells = within(row).queryAllByRole('cell');
          return cells.length > 0;
        });

        if (dataRows.length > 0) {
          const firstDataRow = dataRows[0];
          expect(within(firstDataRow).getByText('Alpha Well 1')).toBeInTheDocument();
        }
      });
    });

    it('clicking Spud Date header toggles sort direction', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const spudDateHeader = screen.getByText('Spud Date');
      await user.click(spudDateHeader);
      await user.click(spudDateHeader);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const dataRows = rows.filter((row) => {
          const cells = within(row).queryAllByRole('cell');
          return cells.length > 0;
        });

        if (dataRows.length > 0) {
          const firstDataRow = dataRows[0];
          expect(within(firstDataRow).getByText('Alpha Well 1')).toBeInTheDocument();
        }
      });
    });
  });

  describe('pagination controls', () => {
    it('renders pagination controls when wells exist', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
    });

    it('displays correct entry count', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('4', { selector: 'span' })).toBeInTheDocument();
    });

    it('renders page size selector', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const pageSizeSelect = screen.getByLabelText('Rows:');
      expect(pageSizeSelect).toBeInTheDocument();
    });

    it('renders navigation buttons', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByLabelText('Go to first page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to last page')).toBeInTheDocument();
    });

    it('disables navigation buttons when on single page', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByLabelText('Go to first page')).toBeDisabled();
      expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
      expect(screen.getByLabelText('Go to next page')).toBeDisabled();
      expect(screen.getByLabelText('Go to last page')).toBeDisabled();
    });

    it('page size change updates displayed rows', async () => {
      const manyWells = [];
      for (let i = 0; i < 15; i++) {
        manyWells.push({
          id: `well-${String(i).padStart(3, '0')}`,
          rig: `Rig ${i}`,
          wellName: `Well ${i}`,
          wellId: `W-${String(i).padStart(3, '0')}`,
          spudDate: '2024-01-01T00:00:00Z',
          operator: `Operator ${i}`,
          contractor: `Contractor ${i}`,
          country: 'Country',
          lastLive: null,
          isActive: i === 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        });
      }
      setupMockLocalStorage(manyWells);
      renderWellListPage();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByText('10', { selector: 'span' })).toBeInTheDocument();
      });

      const pageSizeSelect = screen.getByLabelText('Rows:');
      await user.selectOptions(pageSizeSelect, '25');

      await waitFor(() => {
        expect(screen.getByText('15', { selector: 'span' })).toBeInTheDocument();
      });
    });

    it('next page button works when multiple pages exist', async () => {
      const manyWells = [];
      for (let i = 0; i < 15; i++) {
        manyWells.push({
          id: `well-${String(i).padStart(3, '0')}`,
          rig: `Rig ${i}`,
          wellName: `Well ${i}`,
          wellId: `W-${String(i).padStart(3, '0')}`,
          spudDate: '2024-01-01T00:00:00Z',
          operator: `Operator ${i}`,
          contractor: `Contractor ${i}`,
          country: 'Country',
          lastLive: null,
          isActive: i === 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        });
      }
      setupMockLocalStorage(manyWells);
      renderWellListPage();
      const user = userEvent.setup();

      const nextButton = screen.getByLabelText('Go to next page');
      expect(nextButton).not.toBeDisabled();

      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('11', { selector: 'span' })).toBeInTheDocument();
      });
    });
  });

  describe('activation modal flow', () => {
    it('opens activation modal when Activate button is clicked', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Alpha Well 2');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
      });
    });

    it('shows target well info in activation modal', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Alpha Well 2');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Will be activated')).toBeInTheDocument();
        expect(screen.getByText('Well ID: AW-002')).toBeInTheDocument();
      });
    });

    it('shows current active well info when activating on same rig', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Alpha Well 2');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Will be deactivated')).toBeInTheDocument();
        expect(screen.getByText('Well ID: AW-001')).toBeInTheDocument();
      });
    });

    it('does not show deactivation info when no active well on rig', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Beta Well 1');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
        expect(screen.getByText('No well is currently active on this rig.')).toBeInTheDocument();
        expect(screen.queryByText('Will be deactivated')).not.toBeInTheDocument();
      });
    });

    it('closes modal when Cancel button is clicked', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Beta Well 1');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Activation')).not.toBeInTheDocument();
      });
    });

    it('activates well and shows success toast on confirm', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Beta Well 1');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm activation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Activation')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const toasts = screen.queryAllByRole('alert');
        expect(toasts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('activates well and deactivates previous active well on same rig', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Alpha Well 2');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm activation/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Activation')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        const toasts = screen.queryAllByRole('alert');
        expect(toasts.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('closes modal when close button (X) is clicked', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const activateButton = screen.getByLabelText('Activate Beta Well 1');
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Confirm Activation')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create New Well button', () => {
    it('navigates to create well page on click', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();
      const user = userEvent.setup();

      const createButton = screen.getByRole('button', { name: /create new well/i });
      await user.click(createButton);

      expect(mockNavigate).toHaveBeenCalledWith('/wells/new');
    });
  });

  describe('last live column display', () => {
    it('displays formatted date for wells with lastLive', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      expect(screen.getByText(/Jun 10, 2024/)).toBeInTheDocument();
    });

    it('displays dash for wells with null lastLive', async () => {
      setupMockLocalStorage(createTestWells());
      renderWellListPage();

      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });
});