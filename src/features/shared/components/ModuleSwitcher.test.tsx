import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModuleSwitcher } from './ModuleSwitcher';
import { useModuleStore } from '@/src/store/moduleStore';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('ModuleSwitcher', () => {
  beforeEach(() => {
    push.mockClear();
    useModuleStore.setState({ activeModule: 'IELTS_GT' });
  });

  it('menampilkan kedua module', () => {
    render(<ModuleSwitcher />);

    expect(screen.getByRole('button', { name: /IELTS General Training/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /English Basic to Hero/i })).toBeInTheDocument();
  });

  it('menandai module aktif lewat aria-pressed', () => {
    render(<ModuleSwitcher />);

    expect(screen.getByRole('button', { name: /IELTS General Training/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /English Basic to Hero/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('mengganti module aktif dan pindah rute saat diklik', async () => {
    render(<ModuleSwitcher />);

    await userEvent.click(screen.getByRole('button', { name: /English Basic to Hero/i }));

    expect(useModuleStore.getState().activeModule).toBe('BASIC');
    expect(push).toHaveBeenCalledWith('/basic');
  });
});
