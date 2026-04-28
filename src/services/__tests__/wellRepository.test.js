import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WELL_STORAGE_KEY, MAX_WELLS, REQUIRED_WELL_FIELDS } from '../../utils/constants.js';
import seedData from '../../data/seedData.js';

describe('WellRepository', () => {
  let wellRepository;
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

  async function loadRepository() {
    const mod = await import('../wellRepository.js');
    wellRepository = mod.default;
    return wellRepository;
  }

  async function loadRepositoryClass() {
    const mod = await import('../wellRepository.js');
    return mod.WellRepository;
  }

  describe('getWells', () => {
    it('returns seed data when localStorage is empty', async () => {
      const repo = await loadRepository();
      const wells = repo.getWells();

      expect(wells).toHaveLength(seedData.length);
      expect(wells[0].id).toBe(seedData[0].id);
      expect(wells[0].wellName).toBe(seedData[0].wellName);
    });

    it('returns data from localStorage when available', async () => {
      const storedWells = [
        {
          id: 'test-well-1',
          rig: 'Test Rig',
          wellName: 'Test Well',
          wellId: 'TW-001',
          spudDate: '2024-01-01T00:00:00Z',
          operator: 'Test Operator',
          contractor: 'Test Contractor',
          country: 'Test Country',
          lastLive: null,
          isActive: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      mockStorage[WELL_STORAGE_KEY] = JSON.stringify(storedWells);

      const repo = await loadRepository();
      const wells = repo.getWells();

      expect(wells).toHaveLength(1);
      expect(wells[0].id).toBe('test-well-1');
      expect(wells[0].wellName).toBe('Test Well');
    });

    it('returns a shallow copy of the wells array', async () => {
      const repo = await loadRepository();
      const wells1 = repo.getWells();
      const wells2 = repo.getWells();

      expect(wells1).not.toBe(wells2);
      expect(wells1).toEqual(wells2);
    });

    it('falls back to seed data when localStorage contains invalid JSON', async () => {
      mockStorage[WELL_STORAGE_KEY] = 'not valid json {{{';

      const repo = await loadRepository();
      const wells = repo.getWells();

      expect(wells).toHaveLength(seedData.length);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('falls back to seed data when localStorage contains empty array', async () => {
      mockStorage[WELL_STORAGE_KEY] = JSON.stringify([]);

      const repo = await loadRepository();
      const wells = repo.getWells();

      expect(wells).toHaveLength(seedData.length);
    });

    it('falls back to seed data when localStorage contains non-array', async () => {
      mockStorage[WELL_STORAGE_KEY] = JSON.stringify({ not: 'an array' });

      const repo = await loadRepository();
      const wells = repo.getWells();

      expect(wells).toHaveLength(seedData.length);
    });
  });

  describe('getWellById', () => {
    it('returns the well when found by id', async () => {
      const repo = await loadRepository();
      const well = repo.getWellById('well-001');

      expect(well).not.toBeNull();
      expect(well.id).toBe('well-001');
      expect(well.wellName).toBe('Gulf Explorer 1');
    });

    it('returns null when well is not found', async () => {
      const repo = await loadRepository();
      const well = repo.getWellById('nonexistent-id');

      expect(well).toBeNull();
    });

    it('returns a copy of the well, not a reference', async () => {
      const repo = await loadRepository();
      const well1 = repo.getWellById('well-001');
      const well2 = repo.getWellById('well-001');

      expect(well1).not.toBe(well2);
      expect(well1).toEqual(well2);
    });
  });

  describe('createWell', () => {
    it('creates a new well with generated id and persists it', async () => {
      const repo = await loadRepository();
      const initialCount = repo.getWells().length;

      const wellData = {
        rig: 'New Rig',
        wellName: 'New Well',
        wellId: 'NW-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'New Operator',
        contractor: 'New Contractor',
        country: 'New Country',
        lastLive: null,
      };

      const newWell = repo.createWell(wellData);

      expect(newWell.id).toBeDefined();
      expect(newWell.id).toMatch(/^well-/);
      expect(newWell.rig).toBe('New Rig');
      expect(newWell.wellName).toBe('New Well');
      expect(newWell.wellId).toBe('NW-001');
      expect(newWell.isActive).toBe(false);
      expect(newWell.createdAt).toBeDefined();
      expect(newWell.updatedAt).toBeDefined();

      const wells = repo.getWells();
      expect(wells).toHaveLength(initialCount + 1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        WELL_STORAGE_KEY,
        expect.any(String)
      );
    });

    it('trims string fields on create', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: '  Trimmed Rig  ',
        wellName: '  Trimmed Well  ',
        wellId: 'TRIM-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: '  Trimmed Operator  ',
        contractor: '  Trimmed Contractor  ',
        country: '  Trimmed Country  ',
        lastLive: null,
      };

      const newWell = repo.createWell(wellData);

      expect(newWell.rig).toBe('Trimmed Rig');
      expect(newWell.wellName).toBe('Trimmed Well');
      expect(newWell.operator).toBe('Trimmed Operator');
      expect(newWell.contractor).toBe('Trimmed Contractor');
      expect(newWell.country).toBe('Trimmed Country');
    });

    it('throws ValidationError for duplicate wellId', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'GE-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('ValidationError');
      expect(() => repo.createWell(wellData)).toThrow('GE-001');
    });

    it('throws ValidationError when required fields are missing', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: 'Rig',
        wellName: '',
        wellId: 'MISSING-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('ValidationError');
    });

    it('throws ValidationError when required field is null', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: 'Rig',
        wellName: null,
        wellId: 'NULL-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('ValidationError');
    });

    it('throws ValidationError when required field is undefined', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: 'Rig',
        wellId: 'UNDEF-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('ValidationError');
    });

    it('throws ValidationError when max wells limit is reached', async () => {
      const maxWells = [];
      for (let i = 0; i < MAX_WELLS; i++) {
        maxWells.push({
          id: `well-max-${i}`,
          rig: `Rig ${i}`,
          wellName: `Well ${i}`,
          wellId: `MAX-${i}`,
          spudDate: '2024-01-01T00:00:00Z',
          operator: 'Op',
          contractor: 'Con',
          country: 'Country',
          lastLive: null,
          isActive: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        });
      }
      mockStorage[WELL_STORAGE_KEY] = JSON.stringify(maxWells);

      const repo = await loadRepository();

      const wellData = {
        rig: 'Overflow Rig',
        wellName: 'Overflow Well',
        wellId: 'OVERFLOW-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('ValidationError');
      expect(() => repo.createWell(wellData)).toThrow(String(MAX_WELLS));
    });

    it('sets lastLive to null when not provided', async () => {
      const repo = await loadRepository();

      const wellData = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'NOLIVE-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      const newWell = repo.createWell(wellData);
      expect(newWell.lastLive).toBeNull();
    });

    it('notifies listeners after creating a well', async () => {
      const repo = await loadRepository();
      const listener = vi.fn();
      repo.subscribe(listener);

      const wellData = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'NOTIFY-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      repo.createWell(wellData);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateWell', () => {
    it('updates specified fields and sets updatedAt timestamp', async () => {
      const repo = await loadRepository();
      const originalWell = repo.getWellById('well-001');

      const updatedWell = repo.updateWell('well-001', {
        wellName: 'Updated Well Name',
        operator: 'Updated Operator',
      });

      expect(updatedWell.wellName).toBe('Updated Well Name');
      expect(updatedWell.operator).toBe('Updated Operator');
      expect(updatedWell.rig).toBe(originalWell.rig);
      expect(updatedWell.updatedAt).not.toBe(originalWell.updatedAt);
      expect(new Date(updatedWell.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalWell.updatedAt).getTime() - 1000
      );
    });

    it('persists updates to localStorage', async () => {
      const repo = await loadRepository();
      const callCountBefore = localStorage.setItem.mock.calls.length;

      repo.updateWell('well-001', { wellName: 'Persisted Name' });

      expect(localStorage.setItem.mock.calls.length).toBeGreaterThan(callCountBefore);

      const stored = JSON.parse(mockStorage[WELL_STORAGE_KEY]);
      const updatedInStorage = stored.find((w) => w.id === 'well-001');
      expect(updatedInStorage.wellName).toBe('Persisted Name');
    });

    it('throws NotFoundError when well does not exist', async () => {
      const repo = await loadRepository();

      expect(() => repo.updateWell('nonexistent-id', { wellName: 'Test' })).toThrow('NotFoundError');
    });

    it('throws ValidationError for duplicate wellId on update', async () => {
      const repo = await loadRepository();

      expect(() =>
        repo.updateWell('well-001', { wellId: 'GE-002' })
      ).toThrow('ValidationError');
    });

    it('does not allow updating immutable fields (id, createdAt)', async () => {
      const repo = await loadRepository();
      const originalWell = repo.getWellById('well-001');

      const updatedWell = repo.updateWell('well-001', {
        id: 'hacked-id',
        createdAt: '1999-01-01T00:00:00Z',
      });

      expect(updatedWell.id).toBe('well-001');
      expect(updatedWell.createdAt).toBe(originalWell.createdAt);
    });

    it('trims string fields on update', async () => {
      const repo = await loadRepository();

      const updatedWell = repo.updateWell('well-001', {
        wellName: '  Trimmed Update  ',
        operator: '  Trimmed Op  ',
      });

      expect(updatedWell.wellName).toBe('Trimmed Update');
      expect(updatedWell.operator).toBe('Trimmed Op');
    });

    it('notifies listeners after updating a well', async () => {
      const repo = await loadRepository();
      const listener = vi.fn();
      repo.subscribe(listener);

      repo.updateWell('well-001', { wellName: 'Listener Test' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('allows updating wellId to the same value', async () => {
      const repo = await loadRepository();
      const originalWell = repo.getWellById('well-001');

      const updatedWell = repo.updateWell('well-001', { wellId: originalWell.wellId });
      expect(updatedWell.wellId).toBe(originalWell.wellId);
    });
  });

  describe('persist', () => {
    it('replaces the entire wells array and persists', async () => {
      const repo = await loadRepository();

      const newWells = [
        {
          id: 'persist-1',
          rig: 'Persist Rig',
          wellName: 'Persist Well',
          wellId: 'PW-001',
          spudDate: '2024-01-01T00:00:00Z',
          operator: 'Op',
          contractor: 'Con',
          country: 'Country',
          lastLive: null,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      repo.persist(newWells);

      const wells = repo.getWells();
      expect(wells).toHaveLength(1);
      expect(wells[0].id).toBe('persist-1');
    });

    it('throws ValidationError when argument is not an array', async () => {
      const repo = await loadRepository();

      expect(() => repo.persist('not an array')).toThrow('ValidationError');
      expect(() => repo.persist(null)).toThrow('ValidationError');
      expect(() => repo.persist({})).toThrow('ValidationError');
    });

    it('notifies listeners after persist', async () => {
      const repo = await loadRepository();
      const listener = vi.fn();
      repo.subscribe(listener);

      repo.persist([]);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    it('subscribes a listener and returns an unsubscribe function', async () => {
      const repo = await loadRepository();
      const listener = vi.fn();

      const unsubscribe = repo.subscribe(listener);
      expect(typeof unsubscribe).toBe('function');

      repo.updateWell('well-001', { wellName: 'Sub Test' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      repo.updateWell('well-001', { wellName: 'Sub Test 2' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('throws ValidationError when callback is not a function', async () => {
      const repo = await loadRepository();

      expect(() => repo.subscribe('not a function')).toThrow('ValidationError');
      expect(() => repo.subscribe(null)).toThrow('ValidationError');
    });

    it('supports multiple listeners', async () => {
      const repo = await loadRepository();
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      repo.subscribe(listener1);
      repo.subscribe(listener2);

      repo.updateWell('well-001', { wellName: 'Multi Listener' });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('handles errors in listeners gracefully', async () => {
      const repo = await loadRepository();
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();

      repo.subscribe(errorListener);
      repo.subscribe(goodListener);

      expect(() => {
        repo.updateWell('well-001', { wellName: 'Error Listener Test' });
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(goodListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('localStorage error handling', () => {
    it('throws StorageError when localStorage.setItem fails on create', async () => {
      const repo = await loadRepository();

      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const wellData = {
        rig: 'Rig',
        wellName: 'Well',
        wellId: 'STORAGE-FAIL-001',
        spudDate: '2024-06-01T00:00:00Z',
        operator: 'Operator',
        contractor: 'Contractor',
        country: 'Country',
      };

      expect(() => repo.createWell(wellData)).toThrow('StorageError');
    });

    it('throws StorageError when localStorage.setItem fails on update', async () => {
      const repo = await loadRepository();

      localStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() =>
        repo.updateWell('well-001', { wellName: 'Fail Update' })
      ).toThrow('StorageError');
    });
  });
});