import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { REQUIRED_WELL_FIELDS } from '../../utils/constants.js';

describe('WellLifecycleManager', () => {
  let wellLifecycleManager;
  let wellRepository;
  let WellLifecycleManager;
  let mockStorage;

  beforeEach(() => {
    mockStorage = {};
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

    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function loadModules() {
    const repoMod = await import('../wellRepository.js');
    wellRepository = repoMod.default;

    const managerMod = await import('../wellLifecycleManager.js');
    wellLifecycleManager = managerMod.default;
    WellLifecycleManager = managerMod.WellLifecycleManager;

    return { wellRepository, wellLifecycleManager, WellLifecycleManager };
  }

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

  async function loadWithTestWells() {
    const testWells = createTestWells();
    mockStorage['wellManagement.wells'] = JSON.stringify(testWells);
    return loadModules();
  }

  describe('activateWell', () => {
    it('activates an inactive well and returns success result', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-003');

      expect(result.success).toBe(true);
      expect(result.activatedWell).toBeDefined();
      expect(result.activatedWell.id).toBe('well-003');
      expect(result.activatedWell.isActive).toBe(true);
      expect(result.deactivatedWell).toBeNull();
    });

    it('deactivates the currently active well on the same rig when activating another', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-002');

      expect(result.success).toBe(true);
      expect(result.activatedWell.id).toBe('well-002');
      expect(result.activatedWell.isActive).toBe(true);
      expect(result.deactivatedWell).not.toBeNull();
      expect(result.deactivatedWell.id).toBe('well-001');
      expect(result.deactivatedWell.isActive).toBe(false);
    });

    it('returns success without deactivation when well is already active', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-001');

      expect(result.success).toBe(true);
      expect(result.activatedWell.id).toBe('well-001');
      expect(result.activatedWell.isActive).toBe(true);
      expect(result.deactivatedWell).toBeNull();
    });

    it('does not affect wells on other rigs when activating', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-003');

      expect(result.success).toBe(true);
      expect(result.activatedWell.id).toBe('well-003');
      expect(result.deactivatedWell).toBeNull();

      // Verify well-001 on Rig Alpha is still active
      const rigAlphaActive = wellLifecycleManager.getActiveWell('Rig Alpha');
      expect(rigAlphaActive).not.toBeNull();
      expect(rigAlphaActive.id).toBe('well-001');
      expect(rigAlphaActive.isActive).toBe(true);
    });

    it('persists activation changes to the repository', async () => {
      await loadWithTestWells();

      wellLifecycleManager.activateWell('well-002');

      const wells = wellRepository.getWells();
      const activatedWell = wells.find((w) => w.id === 'well-002');
      const deactivatedWell = wells.find((w) => w.id === 'well-001');

      expect(activatedWell.isActive).toBe(true);
      expect(deactivatedWell.isActive).toBe(false);
    });

    it('updates the updatedAt timestamp on activated well', async () => {
      await loadWithTestWells();
      const originalWell = wellRepository.getWellById('well-003');

      const result = wellLifecycleManager.activateWell('well-003');

      expect(result.activatedWell.updatedAt).not.toBe(originalWell.updatedAt);
      expect(new Date(result.activatedWell.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalWell.updatedAt).getTime()
      );
    });

    it('updates the updatedAt timestamp on deactivated well', async () => {
      await loadWithTestWells();
      const originalActiveWell = wellRepository.getWellById('well-001');

      const result = wellLifecycleManager.activateWell('well-002');

      expect(result.deactivatedWell.updatedAt).not.toBe(originalActiveWell.updatedAt);
    });

    it('throws NotFoundError when well id does not exist', async () => {
      await loadWithTestWells();

      expect(() => wellLifecycleManager.activateWell('nonexistent-id')).toThrow('NotFoundError');
    });

    it('throws ValidationError when well id is null', async () => {
      await loadWithTestWells();

      expect(() => wellLifecycleManager.activateWell(null)).toThrow('ValidationError');
    });

    it('throws ValidationError when well id is undefined', async () => {
      await loadWithTestWells();

      expect(() => wellLifecycleManager.activateWell(undefined)).toThrow('ValidationError');
    });

    it('throws ValidationError when well id is empty string', async () => {
      await loadWithTestWells();

      expect(() => wellLifecycleManager.activateWell('')).toThrow('ValidationError');
    });

    it('throws ValidationError when well id is not a string', async () => {
      await loadWithTestWells();

      expect(() => wellLifecycleManager.activateWell(123)).toThrow('ValidationError');
    });

    it('enforces single-active-well-per-rig after multiple activations', async () => {
      await loadWithTestWells();

      // Activate well-002 on Rig Alpha (deactivates well-001)
      wellLifecycleManager.activateWell('well-002');

      // Activate well-003 on Rig Beta
      wellLifecycleManager.activateWell('well-003');

      const wells = wellRepository.getWells();
      const rigAlphaActive = wells.filter((w) => w.rig === 'Rig Alpha' && w.isActive);
      const rigBetaActive = wells.filter((w) => w.rig === 'Rig Beta' && w.isActive);

      expect(rigAlphaActive).toHaveLength(1);
      expect(rigAlphaActive[0].id).toBe('well-002');
      expect(rigBetaActive).toHaveLength(1);
      expect(rigBetaActive[0].id).toBe('well-003');
    });

    it('handles activating a well on a rig with no currently active well', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-004');

      expect(result.success).toBe(true);
      expect(result.activatedWell.id).toBe('well-004');
      expect(result.activatedWell.isActive).toBe(true);
      expect(result.deactivatedWell).toBeNull();
    });

    it('returns copies of well objects, not references', async () => {
      await loadWithTestWells();

      const result = wellLifecycleManager.activateWell('well-002');

      result.activatedWell.wellName = 'Mutated Name';
      const freshWell = wellRepository.getWellById('well-002');
      expect(freshWell.wellName).toBe('Alpha Well 2');
    });
  });

  describe('getActiveWell', () => {
    it('returns the active well for a rig that has one', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell('Rig Alpha');

      expect(activeWell).not.toBeNull();
      expect(activeWell.id).toBe('well-001');
      expect(activeWell.rig).toBe('Rig Alpha');
      expect(activeWell.isActive).toBe(true);
    });

    it('returns null for a rig with no active well', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell('Rig Beta');

      expect(activeWell).toBeNull();
    });

    it('returns null for a rig that does not exist', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell('Nonexistent Rig');

      expect(activeWell).toBeNull();
    });

    it('returns null when rig is null', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell(null);

      expect(activeWell).toBeNull();
    });

    it('returns null when rig is undefined', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell(undefined);

      expect(activeWell).toBeNull();
    });

    it('returns null when rig is empty string', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell('');

      expect(activeWell).toBeNull();
    });

    it('returns null when rig is not a string', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell(42);

      expect(activeWell).toBeNull();
    });

    it('returns a copy of the well, not a reference', async () => {
      await loadWithTestWells();

      const activeWell = wellLifecycleManager.getActiveWell('Rig Alpha');
      activeWell.wellName = 'Mutated';

      const freshActiveWell = wellLifecycleManager.getActiveWell('Rig Alpha');
      expect(freshActiveWell.wellName).toBe('Alpha Well 1');
    });

    it('reflects activation changes immediately', async () => {
      await loadWithTestWells();

      expect(wellLifecycleManager.getActiveWell('Rig Beta')).toBeNull();

      wellLifecycleManager.activateWell('well-003');

      const activeWell = wellLifecycleManager.getActiveWell('Rig Beta');
      expect(activeWell).not.toBeNull();
      expect(activeWell.id).toBe('well-003');
    });

    it('reflects deactivation after activation swap', async () => {
      await loadWithTestWells();

      wellLifecycleManager.activateWell('well-002');

      const activeWell = wellLifecycleManager.getActiveWell('Rig Alpha');
      expect(activeWell).not.toBeNull();
      expect(activeWell.id).toBe('well-002');
    });
  });

  describe('validateWellInput', () => {
    it('returns empty array for valid input with all required fields', async () => {
      await loadWithTestWells();

      const validInput = {
        id: 'new-well-id',
        rig: 'Test Rig',
        wellName: 'Test Well',
        wellId: 'UNIQUE-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Test Operator',
        contractor: 'Test Contractor',
        country: 'Test Country',
      };

      const errors = wellLifecycleManager.validateWellInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it('returns errors for each missing required field', async () => {
      await loadWithTestWells();

      const emptyInput = {};
      const errors = wellLifecycleManager.validateWellInput(emptyInput);

      expect(errors.length).toBeGreaterThanOrEqual(REQUIRED_WELL_FIELDS.length);

      for (const field of REQUIRED_WELL_FIELDS) {
        const fieldError = errors.find((e) => e.field === field);
        expect(fieldError).toBeDefined();
        expect(fieldError.message).toContain('required');
      }
    });

    it('returns error when a required field is empty string', async () => {
      await loadWithTestWells();

      const input = {
        rig: '',
        wellName: 'Test Well',
        wellId: 'UNIQUE-002',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const rigError = errors.find((e) => e.field === 'rig');
      expect(rigError).toBeDefined();
      expect(rigError.message).toContain('required');
    });

    it('returns error when a required field is whitespace only', async () => {
      await loadWithTestWells();

      const input = {
        rig: '   ',
        wellName: 'Test Well',
        wellId: 'UNIQUE-003',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const rigError = errors.find((e) => e.field === 'rig');
      expect(rigError).toBeDefined();
    });

    it('returns error when a required field is null', async () => {
      await loadWithTestWells();

      const input = {
        rig: 'Rig',
        wellName: null,
        wellId: 'UNIQUE-004',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const wellNameError = errors.find((e) => e.field === 'wellName');
      expect(wellNameError).toBeDefined();
    });

    it('returns error for invalid spudDate', async () => {
      await loadWithTestWells();

      const input = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-005',
        spudDate: 'not-a-date',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const spudDateError = errors.find((e) => e.field === 'spudDate');
      expect(spudDateError).toBeDefined();
      expect(spudDateError.message).toContain('valid date');
    });

    it('returns error for invalid lastLive date', async () => {
      await loadWithTestWells();

      const input = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-006',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
        lastLive: 'invalid-date',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const lastLiveError = errors.find((e) => e.field === 'lastLive');
      expect(lastLiveError).toBeDefined();
      expect(lastLiveError.message).toContain('valid date');
    });

    it('does not return error when lastLive is null', async () => {
      await loadWithTestWells();

      const input = {
        id: 'new-id',
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-007',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
        lastLive: null,
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const lastLiveError = errors.find((e) => e.field === 'lastLive');
      expect(lastLiveError).toBeUndefined();
    });

    it('does not return error when lastLive is undefined', async () => {
      await loadWithTestWells();

      const input = {
        id: 'new-id',
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-008',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const lastLiveError = errors.find((e) => e.field === 'lastLive');
      expect(lastLiveError).toBeUndefined();
    });

    it('returns error for duplicate wellId', async () => {
      await loadWithTestWells();

      const input = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'AW-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const wellIdError = errors.find((e) => e.field === 'wellId');
      expect(wellIdError).toBeDefined();
      expect(wellIdError.message).toContain('already exists');
    });

    it('does not return duplicate error when wellId belongs to the same well (edit case)', async () => {
      await loadWithTestWells();

      const input = {
        id: 'well-001',
        rig: 'Rig Alpha',
        wellName: 'Alpha Well 1',
        wellId: 'AW-001',
        spudDate: '2024-01-15T00:00:00Z',
        operator: 'Operator A',
        contractor: 'Contractor A',
        country: 'United States',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const wellIdError = errors.find((e) => e.field === 'wellId');
      expect(wellIdError).toBeUndefined();
    });

    it('returns form-level error when input is null', async () => {
      await loadWithTestWells();

      const errors = wellLifecycleManager.validateWellInput(null);
      expect(errors.length).toBeGreaterThan(0);
      const formError = errors.find((e) => e.field === 'form');
      expect(formError).toBeDefined();
      expect(formError.message).toContain('required');
    });

    it('returns form-level error when input is undefined', async () => {
      await loadWithTestWells();

      const errors = wellLifecycleManager.validateWellInput(undefined);
      expect(errors.length).toBeGreaterThan(0);
      const formError = errors.find((e) => e.field === 'form');
      expect(formError).toBeDefined();
    });

    it('returns form-level error when input is not an object', async () => {
      await loadWithTestWells();

      const errors = wellLifecycleManager.validateWellInput('not an object');
      expect(errors.length).toBeGreaterThan(0);
      const formError = errors.find((e) => e.field === 'form');
      expect(formError).toBeDefined();
    });

    it('accepts valid lastLive date without error', async () => {
      await loadWithTestWells();

      const input = {
        id: 'new-id',
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-009',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
        lastLive: '2024-06-15T12:00:00Z',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      expect(errors).toHaveLength(0);
    });

    it('does not return error when lastLive is empty string', async () => {
      await loadWithTestWells();

      const input = {
        id: 'new-id',
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'UNIQUE-010',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
        lastLive: '',
      };

      const errors = wellLifecycleManager.validateWellInput(input);
      const lastLiveError = errors.find((e) => e.field === 'lastLive');
      expect(lastLiveError).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('can be instantiated with a custom repository', async () => {
      const { WellLifecycleManager: ManagerClass } = await loadModules();

      const mockRepo = {
        getWells: vi.fn(() => []),
        getWellById: vi.fn(() => null),
        persist: vi.fn(),
      };

      const manager = new ManagerClass(mockRepo);
      expect(manager).toBeDefined();

      const activeWell = manager.getActiveWell('Any Rig');
      expect(activeWell).toBeNull();
      expect(mockRepo.getWells).toHaveBeenCalled();
    });
  });

  describe('integration with repository', () => {
    it('notifies repository listeners when activating a well', async () => {
      await loadWithTestWells();
      const listener = vi.fn();
      wellRepository.subscribe(listener);

      wellLifecycleManager.activateWell('well-003');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('persists activation to localStorage', async () => {
      await loadWithTestWells();

      wellLifecycleManager.activateWell('well-003');

      const stored = JSON.parse(mockStorage['wellManagement.wells']);
      const activatedInStorage = stored.find((w) => w.id === 'well-003');
      expect(activatedInStorage.isActive).toBe(true);
    });

    it('persists deactivation to localStorage during swap', async () => {
      await loadWithTestWells();

      wellLifecycleManager.activateWell('well-002');

      const stored = JSON.parse(mockStorage['wellManagement.wells']);
      const deactivatedInStorage = stored.find((w) => w.id === 'well-001');
      const activatedInStorage = stored.find((w) => w.id === 'well-002');

      expect(deactivatedInStorage.isActive).toBe(false);
      expect(activatedInStorage.isActive).toBe(true);
    });
  });
});