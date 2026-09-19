import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PackageAdminContainer } from './PackageAdminContainer';
import { ieltsAdminService } from '../services/ielts-admin.service';

vi.mock('../services/ielts-admin.service', () => ({
  ieltsAdminService: {
    packages: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      setSections: vi.fn(),
      publish: vi.fn(),
      remove: vi.fn(),
    },
    questions: { list: vi.fn() },
  },
}));

const pkg = {
  id: 2,
  title: 'GT Tryout 1',
  description: null,
  package_type: 'SECTION' as const,
  is_published: false,
  sections: [
    { id: 1, skill: 'READING' as const, order: 0, duration_minutes: 60, question_ids: [11] },
  ],
  total_items: 1,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const question = {
  id: 11,
  passage_id: null,
  skill: 'READING' as const,
  question_type: 'MULTIPLE_CHOICE' as const,
  question_text: 'When does the library open?',
  column_answer: null,
  options: [],
  attachments: [],
  accepted_answers: [['B']],
  explanation: null,
  difficulty: 'MEDIUM' as const,
  tags: [],
  order: 0,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const renderWithQuery = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('PackageAdminContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ieltsAdminService.packages.list).mockResolvedValue([pkg]);
    vi.mocked(ieltsAdminService.packages.get).mockResolvedValue(pkg);
    vi.mocked(ieltsAdminService.packages.create).mockResolvedValue(pkg);
    vi.mocked(ieltsAdminService.packages.setSections).mockResolvedValue(pkg);
    vi.mocked(ieltsAdminService.packages.publish).mockResolvedValue({
      ...pkg,
      is_published: true,
    });
    vi.mocked(ieltsAdminService.questions.list).mockResolvedValue([question]);
  });

  it('menampilkan daftar paket beserta status terbitnya', async () => {
    renderWithQuery(<PackageAdminContainer />);

    expect(await screen.findByText('GT Tryout 1')).toBeInTheDocument();
    expect(screen.getByText(/Draft/i)).toBeInTheDocument();
  });

  it('membuka penyusun isi saat satu paket dipilih', async () => {
    renderWithQuery(<PackageAdminContainer />);
    await screen.findByText('GT Tryout 1');

    await userEvent.click(screen.getByRole('button', { name: /Susun isi GT Tryout 1/i }));

    expect(await screen.findByText(/Soal tersedia/i)).toBeInTheDocument();
  });

  it('menambahkan soal dari bank ke section', async () => {
    renderWithQuery(<PackageAdminContainer />);
    await screen.findByText('GT Tryout 1');
    await userEvent.click(screen.getByRole('button', { name: /Susun isi GT Tryout 1/i }));
    await screen.findByText(/Soal tersedia/i);

    await userEvent.click(await screen.findByRole('button', { name: /Tambahkan soal 11/i }));
    await userEvent.click(screen.getByRole('button', { name: /Simpan susunan/i }));

    expect(ieltsAdminService.packages.setSections).toHaveBeenCalledWith(
      2,
      expect.arrayContaining([expect.objectContaining({ skill: 'READING' })])
    );
  });

  it('menampilkan alasan penolakan dari backend saat publish gagal', async () => {
    vi.mocked(ieltsAdminService.packages.publish).mockRejectedValue({
      response: { data: { message: 'Section READING harus berisi 40 soal, saat ini 1' } },
    });

    renderWithQuery(<PackageAdminContainer />);
    await screen.findByText('GT Tryout 1');
    await userEvent.click(screen.getByRole('button', { name: /Susun isi GT Tryout 1/i }));
    await screen.findByText(/Soal tersedia/i);

    await userEvent.click(screen.getByRole('button', { name: /Terbitkan/i }));

    expect(
      await screen.findByText(/Section READING harus berisi 40 soal, saat ini 1/i)
    ).toBeInTheDocument();
  });

  it('membuat paket baru lewat form', async () => {
    renderWithQuery(<PackageAdminContainer />);
    await screen.findByText('GT Tryout 1');

    await userEvent.click(screen.getByRole('button', { name: /Paket Baru/i }));
    await userEvent.type(screen.getByLabelText(/^Judul paket/i), 'GT Tryout 2');
    await userEvent.click(screen.getByRole('button', { name: /^Simpan$/i }));

    expect(ieltsAdminService.packages.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'GT Tryout 2' })
    );
  });
});
