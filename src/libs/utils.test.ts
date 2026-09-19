import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('menggabungkan beberapa class', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('kelas tailwind yang bentrok dimenangkan oleh yang terakhir', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('mengabaikan nilai falsy', () => {
    expect(cn('px-2', false && 'py-1', undefined)).toBe('px-2');
  });
});
