import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModuleHubContainer } from './ModuleHubContainer';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../services/modules.service', () => ({
  modulesService: {
    list: vi.fn().mockResolvedValue([
      {
        key: 'BASIC',
        name: 'English Basic to Hero',
        description: 'Bangun fondasi bahasa Inggris dari Beginner sampai Advanced.',
        enrolled: false,
        status: null,
        started_at: null,
      },
      {
        key: 'IELTS_GT',
        name: 'English for IELTS General Training',
        description: 'Persiapan IELTS General Training sampai target band tercapai.',
        enrolled: true,
        status: 'ACTIVE',
        started_at: '2026-02-01T00:00:00.000Z',
      },
    ]),
    enroll: vi.fn(),
  },
}));

const renderWithQuery = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('ModuleHubContainer', () => {
  it('menampilkan kedua module beserta deskripsinya', async () => {
    renderWithQuery(<ModuleHubContainer />);

    expect(await screen.findByText('English Basic to Hero')).toBeInTheDocument();
    expect(await screen.findByText('English for IELTS General Training')).toBeInTheDocument();
  });

  it('membedakan module yang sudah diikuti dari yang belum', async () => {
    renderWithQuery(<ModuleHubContainer />);

    expect(await screen.findByRole('link', { name: /Continue learning/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Start this module/i })).toBeInTheDocument();
  });
});
