import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateId,
  formatDate,
  formatLastLive,
  debounce,
  sortByField,
  filterWells,
} from '../helpers.js';

describe('generateId', () => {
  it('returns a string starting with "well-"', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.startsWith('well-')).toBe(true);
  });

  it('generates unique ids on successive calls', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('returns a non-empty string', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(5);
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('returns "-" for null input', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns "-" for undefined input', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns "-" for empty string input', () => {
    expect(formatDate('')).toBe('-');
  });

  it('returns "-" for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('-');
  });

  it('formats another valid date correctly', () => {
    const result = formatDate('2023-06-01T00:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('2023');
  });
});

describe('formatLastLive', () => {
  it('returns "-" for null input', () => {
    expect(formatLastLive(null)).toBe('-');
  });

  it('returns "-" for undefined input', () => {
    expect(formatLastLive(undefined)).toBe('-');
  });

  it('returns "-" for empty string input', () => {
    expect(formatLastLive('')).toBe('-');
  });

  it('returns "-" for invalid date string', () => {
    expect(formatLastLive('invalid-date')).toBe('-');
  });

  it('formats a valid ISO datetime string with date and time', () => {
    const result = formatLastLive('2024-06-10T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('10');
    expect(result).toContain('2024');
  });

  it('returns a non-dash value for a valid timestamp', () => {
    const result = formatLastLive('2024-03-15T09:45:00Z');
    expect(result).not.toBe('-');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution by the specified delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on subsequent calls within the delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to the debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('cancel method prevents execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(500);

    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel is safe to call when no timer is pending', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    expect(() => debounced.cancel()).not.toThrow();
  });

  it('can be invoked again after cancel', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    debounced.cancel();
    debounced();
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('sortByField', () => {
  const testData = [
    { name: 'Charlie', spudDate: '2024-03-01T00:00:00Z', lastLive: null },
    { name: 'Alpha', spudDate: '2024-01-15T00:00:00Z', lastLive: '2024-06-10T14:30:00Z' },
    { name: 'Bravo', spudDate: '2024-02-20T00:00:00Z', lastLive: '2024-03-15T09:45:00Z' },
  ];

  it('sorts strings in ascending order', () => {
    const sorted = sortByField(testData, 'name', 'asc');
    expect(sorted[0].name).toBe('Alpha');
    expect(sorted[1].name).toBe('Bravo');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('sorts strings in descending order', () => {
    const sorted = sortByField(testData, 'name', 'desc');
    expect(sorted[0].name).toBe('Charlie');
    expect(sorted[1].name).toBe('Bravo');
    expect(sorted[2].name).toBe('Alpha');
  });

  it('sorts dates in ascending order', () => {
    const sorted = sortByField(testData, 'spudDate', 'asc');
    expect(sorted[0].name).toBe('Alpha');
    expect(sorted[1].name).toBe('Bravo');
    expect(sorted[2].name).toBe('Charlie');
  });

  it('sorts dates in descending order', () => {
    const sorted = sortByField(testData, 'spudDate', 'desc');
    expect(sorted[0].name).toBe('Charlie');
    expect(sorted[1].name).toBe('Bravo');
    expect(sorted[2].name).toBe('Alpha');
  });

  it('sorts null values to the end regardless of direction', () => {
    const sorted = sortByField(testData, 'lastLive', 'asc');
    expect(sorted[sorted.length - 1].lastLive).toBeNull();

    const sortedDesc = sortByField(testData, 'lastLive', 'desc');
    expect(sortedDesc[sortedDesc.length - 1].lastLive).toBeNull();
  });

  it('does not mutate the original array', () => {
    const original = [...testData];
    const sorted = sortByField(testData, 'name', 'asc');
    expect(testData).toEqual(original);
    expect(sorted).not.toBe(testData);
  });

  it('returns empty array for null input', () => {
    expect(sortByField(null, 'name', 'asc')).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    expect(sortByField(undefined, 'name', 'asc')).toEqual([]);
  });

  it('returns the array as-is when field is null', () => {
    const result = sortByField(testData, null, 'asc');
    expect(result).toEqual(testData);
  });

  it('returns the array as-is when field is empty string', () => {
    const result = sortByField(testData, '', 'asc');
    expect(result).toEqual(testData);
  });

  it('sorts booleans correctly', () => {
    const boolData = [
      { name: 'A', isActive: false },
      { name: 'B', isActive: true },
      { name: 'C', isActive: false },
    ];
    const sorted = sortByField(boolData, 'isActive', 'asc');
    expect(sorted[0].isActive).toBe(true);
  });

  it('handles case-insensitive string sorting', () => {
    const mixedCase = [
      { name: 'banana' },
      { name: 'Apple' },
      { name: 'cherry' },
    ];
    const sorted = sortByField(mixedCase, 'name', 'asc');
    expect(sorted[0].name).toBe('Apple');
    expect(sorted[1].name).toBe('banana');
    expect(sorted[2].name).toBe('cherry');
  });
});

describe('filterWells', () => {
  const testWells = [
    {
      id: 'w1',
      rig: 'Deepwater Horizon II',
      wellName: 'Gulf Explorer 1',
      wellId: 'GE-001',
      operator: 'Oceanic Energy Corp',
      contractor: 'DeepDrill Services',
      country: 'United States',
      isActive: true,
    },
    {
      id: 'w2',
      rig: 'Nordic Pioneer',
      wellName: 'Fjord Alpha',
      wellId: 'FA-001',
      operator: 'NorthSea Petroleum',
      contractor: 'Viking Drilling AS',
      country: 'Norway',
      isActive: false,
    },
    {
      id: 'w3',
      rig: 'Desert Storm IV',
      wellName: 'Sahara Deep 1',
      wellId: 'SD-001',
      operator: 'Arabian Exploration Ltd',
      contractor: 'SandStone Drilling',
      country: 'Saudi Arabia',
      isActive: false,
    },
    {
      id: 'w4',
      rig: 'Deepwater Horizon II',
      wellName: 'Gulf Explorer 2',
      wellId: 'GE-002',
      operator: 'Oceanic Energy Corp',
      contractor: 'DeepDrill Services',
      country: 'United States',
      isActive: false,
    },
  ];

  it('returns all wells when filters is empty object', () => {
    const result = filterWells(testWells, {});
    expect(result).toHaveLength(4);
  });

  it('returns all wells when filters is null', () => {
    const result = filterWells(testWells, null);
    expect(result).toHaveLength(4);
  });

  it('returns all wells when filters is undefined', () => {
    const result = filterWells(testWells, undefined);
    expect(result).toHaveLength(4);
  });

  it('filters by rig name case-insensitively', () => {
    const result = filterWells(testWells, { rig: 'deepwater' });
    expect(result).toHaveLength(2);
    expect(result.every((w) => w.rig.toLowerCase().includes('deepwater'))).toBe(true);
  });

  it('filters by well name with partial match', () => {
    const result = filterWells(testWells, { wellName: 'gulf' });
    expect(result).toHaveLength(2);
    expect(result[0].wellName).toBe('Gulf Explorer 1');
    expect(result[1].wellName).toBe('Gulf Explorer 2');
  });

  it('filters by wellId with exact partial match', () => {
    const result = filterWells(testWells, { wellId: 'GE' });
    expect(result).toHaveLength(2);
  });

  it('filters by operator case-insensitively', () => {
    const result = filterWells(testWells, { operator: 'oceanic' });
    expect(result).toHaveLength(2);
  });

  it('filters by contractor with partial match', () => {
    const result = filterWells(testWells, { contractor: 'Viking' });
    expect(result).toHaveLength(1);
    expect(result[0].contractor).toBe('Viking Drilling AS');
  });

  it('filters by country case-insensitively', () => {
    const result = filterWells(testWells, { country: 'united states' });
    expect(result).toHaveLength(2);
  });

  it('applies multiple filters with AND logic', () => {
    const result = filterWells(testWells, { rig: 'deepwater', wellName: 'Explorer 1' });
    expect(result).toHaveLength(1);
    expect(result[0].wellId).toBe('GE-001');
  });

  it('returns empty array when no wells match', () => {
    const result = filterWells(testWells, { rig: 'nonexistent' });
    expect(result).toHaveLength(0);
  });

  it('ignores filter keys with empty string values', () => {
    const result = filterWells(testWells, { rig: '', wellName: 'Fjord' });
    expect(result).toHaveLength(1);
    expect(result[0].wellName).toBe('Fjord Alpha');
  });

  it('ignores filter keys with null values', () => {
    const result = filterWells(testWells, { rig: null, country: 'Norway' });
    expect(result).toHaveLength(1);
  });

  it('ignores filter keys with undefined values', () => {
    const result = filterWells(testWells, { rig: undefined, country: 'Saudi Arabia' });
    expect(result).toHaveLength(1);
  });

  it('filters by status "active" matching isActive true', () => {
    const result = filterWells(testWells, { status: 'active' });
    expect(result).toHaveLength(1);
    expect(result[0].isActive).toBe(true);
  });

  it('filters by status "idle" matching isActive false', () => {
    const result = filterWells(testWells, { status: 'idle' });
    expect(result).toHaveLength(3);
    expect(result.every((w) => w.isActive === false)).toBe(true);
  });

  it('handles status filter case-insensitively', () => {
    const result = filterWells(testWells, { status: 'ACTIVE' });
    expect(result).toHaveLength(1);
    expect(result[0].isActive).toBe(true);
  });

  it('returns empty array for null wells input', () => {
    expect(filterWells(null, {})).toEqual([]);
  });

  it('returns empty array for undefined wells input', () => {
    expect(filterWells(undefined, {})).toEqual([]);
  });

  it('returns empty array for non-array wells input', () => {
    expect(filterWells('not an array', {})).toEqual([]);
  });

  it('does not mutate the original wells array', () => {
    const original = [...testWells];
    const result = filterWells(testWells, { rig: 'deepwater' });
    expect(testWells).toEqual(original);
    expect(result).not.toBe(testWells);
  });

  it('handles filtering when well field value is null', () => {
    const wellsWithNull = [
      ...testWells,
      {
        id: 'w5',
        rig: 'Test Rig',
        wellName: 'Test Well',
        wellId: 'TW-001',
        operator: null,
        contractor: 'Test Contractor',
        country: 'Test Country',
        isActive: false,
      },
    ];
    const result = filterWells(wellsWithNull, { operator: 'oceanic' });
    expect(result).toHaveLength(2);
    expect(result.every((w) => w.operator !== null)).toBe(true);
  });

  it('performs partial matching with whitespace in filter value', () => {
    const result = filterWells(testWells, { rig: ' Nordic ' });
    expect(result).toHaveLength(1);
    expect(result[0].rig).toBe('Nordic Pioneer');
  });
});