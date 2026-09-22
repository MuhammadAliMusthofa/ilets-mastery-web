import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PassageAdminContainer } from './PassageAdminContainer';
import { ieltsAdminService } from '../services/ielts-admin.service';

vi.mock('../services/ielts-admin.service', () => ({
  ieltsAdminService: {
    passages: {
      list: vi.fn(),
      create: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

const passage = {
  id: 4,
  skill: 'READING' as const,
  section_no: 1,
  title: 'Community Notice Board',
  content: '<p>Library opens at 9.</p>',
  image_url: null,
  audio_url: null,
  transcript: null,
  instructions: null,
  is_published: false,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const renderWithQuery = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('PassageAdminContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ieltsAdminService.passages.list).mockResolvedValue([passage]);
    vi.mocked(ieltsAdminService.passages.create).mockResolvedValue(passage);
  });

  it('menampilkan passage yang sudah ada', async () => {
    renderWithQuery(<PassageAdminContainer />);

    expect(await screen.findByText('Community Notice Board')).toBeInTheDocument();
  });

  it('menandai passage yang masih draft', async () => {
    renderWithQuery(<PassageAdminContainer />);

    expect(await screen.findByText(/Draft/i)).toBeInTheDocument();
  });

  it('menyaring berdasarkan skill', async () => {
    renderWithQuery(<PassageAdminContainer />);
    await screen.findByText('Community Notice Board');

    await userEvent.selectOptions(screen.getByLabelText(/Filter by skill/i), 'LISTENING');

    expect(ieltsAdminService.passages.list).toHaveBeenCalledWith({ skill: 'LISTENING' });
  });

  it('mengirim passage baru lewat form', async () => {
    renderWithQuery(<PassageAdminContainer />);
    await screen.findByText('Community Notice Board');

    await userEvent.click(screen.getByRole('button', { name: /New passage/i }));
    await userEvent.type(screen.getByLabelText(/^Title/i), 'Job Description');
    await userEvent.type(screen.getByLabelText(/^Content/i), '<p>Duties</p>');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }));

    expect(ieltsAdminService.passages.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Job Description', content: '<p>Duties</p>' })
    );
  });

  it('membatasi pilihan section mengikuti skill: Reading GT hanya 3', async () => {
    renderWithQuery(<PassageAdminContainer />);
    await screen.findByText('Community Notice Board');

    await userEvent.click(screen.getByRole('button', { name: /New passage/i }));
    await userEvent.selectOptions(screen.getByLabelText(/^Skill/i), 'READING');

    const sectionSelect = screen.getByLabelText(/^Section/i) as HTMLSelectElement;
    expect(sectionSelect.options).toHaveLength(3);

    await userEvent.selectOptions(screen.getByLabelText(/^Skill/i), 'LISTENING');
    expect((screen.getByLabelText(/^Section/i) as HTMLSelectElement).options).toHaveLength(4);
  });
});
