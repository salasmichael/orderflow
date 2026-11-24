import { describe, expect, it } from 'vitest';
import { dollarsToCents, formatCents } from './money';

describe('dollarsToCents', () => {
  it('converts whole dollars', () => {
    expect(dollarsToCents('12')).toBe(1200);
  });

  it('converts dollars and cents', () => {
    expect(dollarsToCents('12.5')).toBe(1250);
    expect(dollarsToCents('12.50')).toBe(1250);
  });

  it('avoids floating point errors', () => {
    expect(dollarsToCents('19.99')).toBe(1999);
    expect(dollarsToCents('0.29')).toBe(29);
  });

  it('rejects invalid input', () => {
    expect(dollarsToCents('')).toBeNull();
    expect(dollarsToCents('abc')).toBeNull();
    expect(dollarsToCents('-5')).toBeNull();
    expect(dollarsToCents('1.234')).toBeNull();
  });
});

describe('formatCents', () => {
  it('formats cents as dollars', () => {
    expect(formatCents(140)).toBe('$1.40');
    expect(formatCents(123456)).toBe('$1,234.56');
  });
});